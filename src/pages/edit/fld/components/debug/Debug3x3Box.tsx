import { useEffect, useRef, useState } from "react";
import { FldFile, IndexValue, getRelativePoints } from "../../../../../domain/fld/FldFile";
import { useCursorContext } from "../../context/CursorContext";
import { useDebugSettingsContext } from "../../context/DebugSettingsContext";
import { useFldMapContext } from "../../context/FldMapContext";
import { Layer } from "../../../../../domain/fld/Layer";
import { Object3D } from "three";

export const Debug3x3Box = () => {
    const { hoveredPoint } = useCursorContext();
    const { debugSettings } = useDebugSettingsContext();
    const { fldFile } = useFldMapContext();

    if (!debugSettings.showDebugCube3x3 || !hoveredPoint || !fldFile) {
        return;
    }

    return <Render fldFile={fldFile} hoveredPoint={hoveredPoint} />;
};

interface RenderProps {
    fldFile: FldFile;
    hoveredPoint: number;
}

const Render = (props: RenderProps) => {
    const [points, setPoints] = useState<IndexValue[]>([]);

    const { fldFile, hoveredPoint } = props;
    const { height, width } = fldFile;
    const landscape = fldFile.layers[Layer.Landscape];
    const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);

    useEffect(() => {
        setPoints(getRelativePoints(fldFile, hoveredPoint, 3, 3));
    }, [landscape, hoveredPoint, fldFile]);

    useEffect(() => {
        const mesh = instancedMeshRef.current;
        const temp = new Object3D();
        points.forEach((point, i) => {
            const p = landscape.getUint8(point.index);
            const y = p / 8 + 0.01;
            const z = point.index % width;
            const x = height - 1 - (point.index - z) / width;
            temp.position.set(x, y, z);
            temp.updateMatrix();
            mesh.setMatrixAt(i, temp.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
        mesh.updateMatrix();
        mesh.computeBoundingBox();
        mesh.computeBoundingSphere();
    }, [height, landscape, points, width]);

    return (
        <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, 9]}>
            <meshStandardMaterial color={"hotpink"} />
            <sphereGeometry args={[0.5, 8, 8]} />
        </instancedMesh>
    );
};
