import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FldFile } from "../../../../../../domain/fld/FldFile";

interface ResourceLayerRenderProps {
    layer?: FldFile | null;
}
export const ResourceLayerRender = (props: ResourceLayerRenderProps): React.JSX.Element => {
    const { layer } = props;

    if (layer == null) {
        return <></>;
    }

    return <LayerRender layer={layer} />;
};

interface LayerRenderProps {
    layer: FldFile;
}

const LayerRender = (props: LayerRenderProps) => {
    const { layer } = props;
    const ressourceCount = getResourceCount(props.layer.resourceLayer);
    const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);

    useEffect(() => {
        const temp = new THREE.Object3D();
        let matrixIndex = 0;
        layer.points.forEach((p, i) => {
            const resource = layer.resourceLayer.getUint8(i);
            if (resource !== 0) {
                const y = resource;
                temp.position.set(p.x, y, p.z);
                temp.updateMatrix();
                instancedMeshRef.current.setMatrixAt(matrixIndex, temp.matrix);
                matrixIndex++;
            }
        });

        // Update the instance
        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [layer, ressourceCount, layer.resourceLayer]);

    return (
        <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, ressourceCount]}>
            <meshStandardMaterial color={"#ff0000"} />
            <boxGeometry args={[1, 8, 1]} />
        </instancedMesh>
    );
};

function getResourceCount(view: DataView) {
    let count = 0;
    const values: Set<number> = new Set<number>();
    for (let i = 0; i < view.byteLength; i++) {
        const value = view.getUint8(i);
        if (view.getUint8(i) > 0) {
            count++;
            values.add(value);
        }
    }
    console.log(values);
    return count;
}
