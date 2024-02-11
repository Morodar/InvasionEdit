import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MapLayer } from "../../../../../../domain/fld/FldFile";

interface HeightLayerRenderProps {
    layer: MapLayer;
}
export const HeightLayerRender = (props: HeightLayerRenderProps): React.JSX.Element => {
    const size = props.layer.height * props.layer.width;
    const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);

    useEffect(() => {
        const temp = new THREE.Object3D();
        props.layer.points.forEach((p, i) => {
            const height = p.value > 127 ? p.value - 255 : p.value;
            temp.position.set(p.x, height / 8, p.z);
            temp.updateMatrix();
            instancedMeshRef.current.setMatrixAt(i, temp.matrix);
        });

        // Update the instance
        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [props.layer]);

    return (
        <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, size]}>
            <meshStandardMaterial color={"#3F5B2A"} />
            <boxGeometry args={[1, 8, 1]} />
        </instancedMesh>
    );
};
