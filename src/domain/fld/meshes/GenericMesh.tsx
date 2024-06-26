import { useEffect, useRef } from "react";
import { useCursorCapture } from "../../../common/controls/useCursorCapture";
import { FldMap } from "../FldFile";
import { LayerSetting } from "../layers/LayerViewContext";
import { DoubleSide, Mesh, PlaneGeometry } from "three";

interface GenericMeshProps {
    map: FldMap;
    layer: DataView;
    settings: LayerSetting;
}

export const GenericMesh = (props: GenericMeshProps) => {
    const { settings, map, layer } = props;

    if (settings.hide) {
        return <></>;
    }

    return <GenericLayerMesh layer={layer} map={map} showWireframe={settings.showWireframe} />;
};

interface GenericLayerMeshProps {
    map: FldMap;
    layer: DataView;
    showWireframe: boolean;
}

export const GenericLayerMesh = (props: GenericLayerMeshProps): React.JSX.Element => {
    const { map, layer, showWireframe } = props;
    const width = map.width;
    const height = map.height;

    const planeMesh = useRef<Mesh>(null);
    const planeGeo = useRef<PlaneGeometry>(null);

    useCursorCapture(planeMesh);
    useEffect(() => {
        if (planeGeo.current) {
            const geo = planeGeo.current.attributes.position;
            for (let i = 0; i < layer.byteLength; i++) {
                const z = i % width;
                const x = height - 1 - (i - z) / width;
                const value = layer.getUint8(i);
                geo.setY(i, value / 8);
                geo.setX(i, x);
                geo.setZ(i, z);
            }
            planeGeo.current.attributes.position.needsUpdate = true;
            planeGeo.current.computeVertexNormals();
            planeGeo.current.computeBoundingBox();
            planeGeo.current.computeBoundingSphere();
            planeGeo.current.computeTangents();
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
