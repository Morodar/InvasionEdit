import { useEffect, useRef } from "react";
import { ResourcePoint, Tritium, Xenit, XenitTritium } from "../../../../../../domain/fld/ResourceLayerUtil";
import * as THREE from "three";
import { useFldMapContext } from "../../../context/FldMapContext";

export const ResourceView = () => {
    const { resourceLayer } = useFldMapContext();
    if (resourceLayer == null) {
        return <></>;
    }
    const { xenit, tritium, xenitTritium } = resourceLayer;
    return (
        <>
            <ResourceRender points={xenit} color={Xenit.COLOR} />
            <ResourceRender points={tritium} color={Tritium.COLOR} />
            <ResourceRender points={xenitTritium} color={XenitTritium.COLOR} />
        </>
    );
};

interface ResourceRenderProps {
    points: ResourcePoint[];
    color: string;
}
const ResourceRender = (props: ResourceRenderProps) => {
    const { points, color } = props;
    const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);

    useEffect(() => {
        const temp = new THREE.Object3D();
        points.forEach((p, i) => {
            const y = p.y / 8 + 4.05;
            temp.position.set(p.x, y, p.z);
            temp.updateMatrix();
            instancedMeshRef.current.setMatrixAt(i, temp.matrix);
        });
        // Update the instance
        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [points]);

    return (
        <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, points.length]}>
            <meshStandardMaterial color={color} />
            <boxGeometry args={[1, 0.1, 1]} />
        </instancedMesh>
    );
};
