import { useEffect, useRef } from "react";
import { Tritium, Xenit, XenitTritium } from "../resource/ResourceLayerUtil";
import { useFldMapContext } from "../FldMapContext";
import { useLayerViewContext } from "../layers/LayerViewContext";
import { Layer } from "../layers/Layer";
import { IndexValue } from "../FldFile";
import { InstancedMesh, Object3D } from "three";

export const ResourceMeshes = () => {
    const { resourceLayer, fldFile } = useFldMapContext();
    const { layerSettings } = useLayerViewContext();
    const { showWireframe: show, hide } = layerSettings[Layer.Resources];

    if (resourceLayer == null || !fldFile || hide) {
        return <></>;
    }

    const landscape = fldFile.layers[Layer.Landscape];
    const { xenit, tritium, xenitTritium } = resourceLayer;
    return (
        <>
            <ResourceRender
                resources={xenit}
                color={Xenit.COLOR}
                showWireframe={show}
                landscape={landscape}
                width={fldFile.width}
                height={fldFile.height}
            />
            <ResourceRender
                resources={tritium}
                color={Tritium.COLOR}
                showWireframe={show}
                landscape={landscape}
                width={fldFile.width}
                height={fldFile.height}
            />
            <ResourceRender
                resources={xenitTritium}
                color={XenitTritium.COLOR}
                showWireframe={show}
                landscape={landscape}
                width={fldFile.width}
                height={fldFile.height}
            />
        </>
    );
};

interface ResourceRenderProps {
    landscape: DataView;
    width: number;
    height: number;
    resources: IndexValue[];
    color: string;
    showWireframe: boolean;
}
const ResourceRender = (props: ResourceRenderProps) => {
    const { landscape, width, height, resources, color, showWireframe } = props;
    const instancedMeshRef = useRef<InstancedMesh>(null!);

    useEffect(() => {
        const mesh = instancedMeshRef.current;
        const temp = new Object3D();
        resources.forEach((resource, i) => {
            if (resource.index < landscape.byteLength) {
                const p = landscape.getUint8(resource.index);
                const y = p / 8 + 0.01;
                const z = resource.index % width;
                const x = height - 1 - (resource.index - z) / width;
                temp.position.set(x, y, z);
                temp.updateMatrix();
                mesh.setMatrixAt(i, temp.matrix);
            }
        });
        mesh.instanceMatrix.needsUpdate = true;
        mesh.updateMatrix();
        mesh.computeBoundingBox();
        mesh.computeBoundingSphere();
    }, [height, landscape, resources, width]);

    return (
        <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, resources.length]}>
            <meshStandardMaterial color={color} wireframe={showWireframe} />
            <boxGeometry args={[1, 0.1, 1]} />
        </instancedMesh>
    );
};
