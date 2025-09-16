import { useEffect, useRef } from "react";
import { FldMap } from "../FldFile";
import { Layer } from "../layers/Layer";
import { useFldMapContext } from "../FldMapContext";
import { useLayerViewContext } from "../layers/LayerViewContext";
import { DoubleSide, Mesh, PlaneGeometry } from "three";
import { WATER_COLOR } from "../water/Water";

export const WaterMesh = () => {
    const { fldFile } = useFldMapContext();
    const { layerSettings } = useLayerViewContext();
    const { showWireframe, hide } = layerSettings[Layer.Water];

    if (!fldFile || hide) {
        return <></>;
    }
    return <WaterLayerMesh map={fldFile} showWireframe={showWireframe} />;
};

interface WaterLayerMeshProps {
    map: FldMap;
    showWireframe: boolean;
}

export const WaterLayerMesh = (props: WaterLayerMeshProps): React.JSX.Element => {
    const { map, showWireframe } = props;

    const water = map.layers[Layer.Water];
    const landscape = map.layers[Layer.Landscape];
    const mountains1 = map.layers[Layer.Unknown3];
    const unknown6 = map.layers[Layer.WaterHeight];

    const width = map.width;
    const height = map.height;

    const planeMesh = useRef<Mesh>(null);
    const planeGeo = useRef<PlaneGeometry>(null);

    useEffect(() => {
        const geo = planeGeo.current;
        if (geo) {
            const positions = geo.attributes.position;
            for (let i = 0; i < landscape.byteLength; i++) {
                const w = water.getUint8(i);
                const value = landscape.getUint8(i);
                const m = mountains1.getUint8(i);
                const u6 = unknown6.getUint8(i);
                const hasWater = w === 0;
                const y = hasWater ? (value - m + u6) / 4 : (value - m - 4) / 4;
                const z = i % width;
                const x = (i - z) / width;

                // rotate map 45° and stretch using values from decompression algorithm
                const x2 = x * -1.999;
                const z2 = x * 1.152 + z * 2.305;

                positions.setY(i, y);
                positions.setX(i, x2);
                positions.setZ(i, z2);
            }
            positions.needsUpdate = true;
            geo.computeVertexNormals();
            geo.computeBoundingBox();
            geo.computeBoundingSphere();
            geo.computeTangents();
        }
    }, [height, landscape, mountains1, unknown6, water, width]);

    return (
        <mesh ref={planeMesh} castShadow={true} receiveShadow={true} visible>
            <planeGeometry args={[width, height, width - 1, height - 1]} ref={planeGeo} />
            <meshStandardMaterial
                transparent
                color={WATER_COLOR}
                roughness={0.1}
                opacity={0.3}
                side={DoubleSide}
                wireframe={showWireframe}
            />
        </mesh>
    );
};
