import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useCursorCapture } from "../../../hooks/useCursorCapture";
import { FldMap } from "../../../../../../domain/fld/FldFile";
import { useFldMapContext } from "../../../context/FldMapContext";
import { Layer } from "../../../../../../domain/fld/Layer";
import { useLayerViewContext } from "../../../context/LayerViewContext";

export const LandscapeMesh = () => {
    const { fldFile } = useFldMapContext();
    const { layerSettings } = useLayerViewContext();
    const { showWireframe, hide } = layerSettings[Layer.Landscape];

    if (!fldFile || hide) {
        return <></>;
    }

    return <LandscapeLayerMesh map={fldFile} showWireframe={showWireframe} />;
};

interface LandscapeLayerMeshProps {
    map: FldMap;
    showWireframe: boolean;
}

export const LandscapeLayerMesh = (props: LandscapeLayerMeshProps): React.JSX.Element => {
    const { map, showWireframe } = props;
    const landscape = map.layers[Layer.Landscape];
    const mountains1 = map.layers[Layer.Unknown3];
    const width = map.width;
    const height = map.height;

    const planeMesh = useRef<THREE.Mesh>(null);
    const planeGeo = useRef<THREE.PlaneGeometry>(null);

    useCursorCapture(planeMesh);

    const texture = useMemo(() => createHeightTexture(map), [map]);

    useEffect(() => {
        if (planeGeo.current) {
            const geo = planeGeo.current.attributes.position;
            for (let i = 0; i < landscape.byteLength; i++) {
                const value = landscape.getUint8(i);
                const m = mountains1.getUint8(i);
                const z = i % width;
                const x = height - 1 - (i - z) / width;
                geo.setY(i, (value - m) / 8);
                geo.setX(i, x);
                geo.setZ(i, z);
            }
            planeGeo.current.attributes.position.needsUpdate = true;
            planeGeo.current.computeVertexNormals();
            planeGeo.current.computeBoundingBox();
            planeGeo.current.computeBoundingSphere();
            planeGeo.current.computeTangents();
        }
    }, [height, landscape, mountains1, width]);

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
const createHeightTexture = (layer: FldMap): THREE.DataTexture => {
    const heightData = new Uint8Array(layer.width * layer.height * 4);
    const { width, height, layers } = layer;
    const landscape = layers[Layer.Landscape];
    let x = height;
    let z = 0;

    for (let i = 0; i < landscape.byteLength; i++) {
        const rotated = x * width + z - width;
        const p = landscape.getUint8(rotated);

        z++;
        if (z >= width) {
            z = 0;
            x--;
        }

        const heightValue = p;
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
