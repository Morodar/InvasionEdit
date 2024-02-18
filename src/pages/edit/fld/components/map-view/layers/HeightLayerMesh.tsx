import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useCursorCapture } from "../../../hooks/useCursorCapture";
import { MapLayer } from "../../../../../../domain/fld/FldFile";
import { useFldMapContext } from "../../../context/FldMapContext";
import { Layer } from "../../../../../../domain/fld/Layer";
import { useLayerViewContext } from "../../../context/LayerViewContext";

export const FldHeightLayerMesh = () => {
    const { fldFile } = useFldMapContext();
    const { layerSettings } = useLayerViewContext();
    const { showWireframe, hide } = layerSettings[Layer.Landscape];

    if (!fldFile || hide) {
        return <></>;
    }

    return <HeightLayerMesh layer={fldFile} showWireframe={showWireframe} />;
};

interface HeightLayerMeshProps {
    layer: MapLayer;
    showWireframe: boolean;
}

export const HeightLayerMesh = (props: HeightLayerMeshProps): React.JSX.Element => {
    const { layer, showWireframe } = props;
    const width = layer.width;
    const height = layer.height;

    const planeMesh = useRef<THREE.Mesh>(null);
    const planeGeo = useRef<THREE.PlaneGeometry>(null);

    useCursorCapture(planeMesh);

    const texture = useMemo(() => {
        return createHeightTexture(layer);
    }, [layer]);

    useEffect(() => {
        if (planeGeo.current) {
            const geo = planeGeo.current.attributes.position;
            for (let i = 0; i < layer.points.length; i++) {
                const p = layer.points[i];
                const height = p.value;
                geo.setY(i, height / 8);
                geo.setX(i, p.x);
                geo.setZ(i, p.z);
            }
            planeGeo.current.attributes.position.needsUpdate = true;
            planeGeo.current.computeVertexNormals();
            planeGeo.current.computeBoundingBox();
            planeGeo.current.computeBoundingSphere();
            planeGeo.current.computeTangents();
        }
    }, [layer.points]);

    return (
        <mesh ref={planeMesh} castShadow={true} receiveShadow={true} visible>
            <planeGeometry args={[width, height, width - 1, height - 1]} ref={planeGeo} />
            <meshStandardMaterial
                color="#e0e0e0"
                map={texture}
                roughness={0.5}
                side={THREE.DoubleSide}
                wireframe={showWireframe}
            />
        </mesh>
    );
};

/** Create a texture based on the height values */
const createHeightTexture = (layer: MapLayer): THREE.DataTexture => {
    const heightData = new Uint8Array(layer.width * layer.height * 4);
    const { width, height, points } = layer;

    let x = height;
    let z = 0;

    for (let i = 0; i < points.length; i++) {
        const rotated = x * width + z - width;
        const p = points[rotated];

        z++;
        if (z >= width) {
            z = 0;
            x--;
        }

        const heightValue = p.value;
        const normalizedHeight = (heightValue + 100) / 355;
        const color = normalizedHeight * 255; // Scale to the range [0, 255]
        const index = i * 4;
        heightData[index] = color; // Red channel
        heightData[index + 1] = color; // Green channel
        heightData[index + 2] = color; // Blue channel
        heightData[index + 3] = 255; // Alpha channel
    }

    const heightTexture = new THREE.DataTexture(heightData, layer.width, layer.height, THREE.RGBAFormat);
    heightTexture.needsUpdate = true;
    return heightTexture;
};
