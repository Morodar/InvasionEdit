import { useEffect, useRef } from "react";
import { ResourcePoint, Tritium, Xenit, XenitTritium } from "../../../../../../domain/fld/ResourceLayerUtil";
import * as THREE from "three";
import { useFldMapContext } from "../../../context/FldMapContext";
import { useLayerViewContext } from "../../../context/LayerViewContext";
import { Layer } from "../../../../../../domain/fld/Layer";

export const ResourceView = () => {
    const { resourceLayer } = useFldMapContext();
    const { layerSettings } = useLayerViewContext();
    const { showWireframe, hide } = layerSettings[Layer.Resources];

    if (resourceLayer == null || hide) {
        return <></>;
    }

    const { xenit, tritium, xenitTritium } = resourceLayer;
    return (
        <>
            <ResourceRender points={xenit} color={Xenit.COLOR} showWireframe={showWireframe} />
            <ResourceRender points={tritium} color={Tritium.COLOR} showWireframe={showWireframe} />
            <ResourceRender points={xenitTritium} color={XenitTritium.COLOR} showWireframe={showWireframe} />
        </>
    );
};

interface ResourceRenderProps {
    points: ResourcePoint[];
    color: string;
    showWireframe: boolean;
}
const ResourceRender = (props: ResourceRenderProps) => {
    const { points, color, showWireframe } = props;
    const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);

    useEffect(() => {
        const temp = new THREE.Object3D();
        points.forEach((p, i) => {
            const y = p.y / 8;
            temp.position.set(p.x, y, p.z);
            temp.updateMatrix();
            instancedMeshRef.current.setMatrixAt(i, temp.matrix);
        });
        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [points]);

    return (
        <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, points.length]}>
            <meshStandardMaterial color={color} wireframe={showWireframe} />
            <boxGeometry args={[1, 0.1, 1]} />
        </instancedMesh>
    );
};
