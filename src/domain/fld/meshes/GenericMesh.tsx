import { memo, useEffect, useRef } from "react";
import { useCursorCapture } from "../../../common/controls/useCursorCapture";
import { LayerSetting } from "../layers/LayerViewContext";
import { DoubleSide, Mesh, PlaneGeometry } from "three";

interface GenericMeshProps {
    width: number;
    height: number;
    layer: DataView;
    settings: LayerSetting;
}

export const GenericMesh = memo((props: GenericMeshProps) => {
    const { settings, width, height, layer } = props;

    if (settings.hide) {
        return <></>;
    }

    return <GenericLayerMesh layer={layer} width={width} height={height} showWireframe={settings.showWireframe} />;
});

interface GenericLayerMeshProps {
    width: number;
    height: number;
    layer: DataView;
    showWireframe: boolean;
}

export const GenericLayerMesh = (props: GenericLayerMeshProps): React.JSX.Element => {
    const { width, height, layer, showWireframe } = props;

    const planeMesh = useRef<Mesh>(null);
    const planeGeo = useRef<PlaneGeometry>(null);

    useCursorCapture(planeMesh);
    useEffect(() => {
        if (planeGeo.current) {
            const geo = planeGeo.current.attributes.position;
            for (let i = 0; i < layer.byteLength; i++) {
                const z = i % width;
                const x = (i - z) / width;
                const value = layer.getUint8(i);

                // rotate map 45° and stretch using values from decompression algorithm
                const x2 = x * -1.999;
                const z2 = x * 1.152 + z * 2.305;

                geo.setY(i, value / 4);
                geo.setX(i, x2);
                geo.setZ(i, z2);
            }
            planeGeo.current.attributes.position.needsUpdate = true;
            planeGeo.current.computeVertexNormals();
            planeGeo.current.computeBoundingBox();
            planeGeo.current.computeBoundingSphere();
        }
    }, [height, layer.byteLength, layer, width]);

    return (
        <mesh ref={planeMesh} castShadow={true} receiveShadow={true} visible>
            <planeGeometry args={[width, height, width - 1, height - 1]} ref={planeGeo} />
            <meshStandardMaterial
                transparent
                color="#0000ff"
                roughness={0.5}
                opacity={0.5}
                side={DoubleSide}
                wireframe={showWireframe}
            />
        </mesh>
    );
};
