import { memo, useEffect, useRef } from "react";
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

    const landscape = fldFile.layers[Layer.Landscape];
    const water = fldFile.layers[Layer.Water];
    const mountains1 = fldFile.layers[Layer.Mountains1];
    const waterHeight = fldFile.layers[Layer.WaterHeight];

    return (
        <WaterLayerMesh
            landscape={landscape}
            water={water}
            mountains1={mountains1}
            waterHeight={waterHeight}
            width={fldFile.width}
            height={fldFile.height}
            showWireframe={showWireframe}
        />
    );
};

interface WaterLayerMeshProps {
    landscape: DataView;
    water: DataView;
    mountains1: DataView;
    waterHeight: DataView;
    width: number;
    height: number;
    showWireframe: boolean;
}

export const WaterLayerMesh = memo((props: WaterLayerMeshProps): React.JSX.Element => {
    const { landscape, water, mountains1, waterHeight, width, height, showWireframe } = props;

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
                const u6 = waterHeight.getUint8(i);
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
        }
    }, [height, landscape, mountains1, waterHeight, water, width]);

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
});
