import { useFldPrimaryActionContext } from "../action-bar/FldPrimaryActionContext";
import { Dispatch, useEffect, useRef, useState } from "react";
import { useCursorContext } from "../../../common/controls/CursorContext";
import { FldFile, IndexValue, getRelativePoints } from "../FldFile";
import { useFldMapContext } from "../FldMapContext";
import { FldAction } from "../FldReducer";
import { useGenericActionContext } from "./GenericActionContext";
import { useLeftClickHoldDelayAction } from "../../../common/controls/useLeftClickHoldDelayAction";
import { DoubleSide, InstancedMesh, Object3D } from "three";

export const GenericActionPreview = () => {
    const { fldFile, dispatch } = useFldMapContext();
    const { primaryAction } = useFldPrimaryActionContext();
    const { hoveredPoint } = useCursorContext();

    if (primaryAction !== "GENERIC" || !hoveredPoint || !fldFile) {
        return <></>;
    }

    return <Preview hoveredPoint={hoveredPoint} fldFile={fldFile} dispatch={dispatch} />;
};

interface PreviewProps {
    hoveredPoint: number;
    fldFile: FldFile;
    dispatch: Dispatch<FldAction>;
}

const Preview = (props: PreviewProps) => {
    const { hoveredPoint, fldFile, dispatch } = props;
    const { width, height } = fldFile;
    const { size, layer, height: absoluteHeight, speed: stepsize, activeAction } = useGenericActionContext();
    const [points, setPoints] = useState<IndexValue[]>([]);
    const instancedMeshRef = useRef<InstancedMesh>(null!);
    const speed = activeAction === "FIX" ? 8 : 1000 / stepsize;

    useLeftClickHoldDelayAction(
        () => dispatch({ type: "GENERIC", points, action: activeAction, height: absoluteHeight, layer }),
        speed,
        [points],
    );

    useEffect(() => {
        const relativePoints = getRelativePoints(fldFile, hoveredPoint, size, size, layer);
        setPoints(relativePoints);
    }, [fldFile, hoveredPoint, layer, size]);

    useEffect(() => {
        points.forEach((p, i) => {
            const z = p.index % width;
            const x = height - 1 - Math.floor(p.index / width);
            temp.position.set(x, p.value / 8, z);
            temp.updateMatrix();
            instancedMeshRef.current.setMatrixAt(i, temp.matrix);
        });

        // Update the instance
        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
        instancedMeshRef.current.computeBoundingBox();
        instancedMeshRef.current.computeBoundingSphere();
    }, [height, points, width]);

    return (
        <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, points.length]}>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshStandardMaterial
                color="#0000ff"
                roughness={0.5}
                side={DoubleSide}
                transparent={true}
                wireframe={false}
                opacity={0.7}
            />
        </instancedMesh>
    );
};

const temp = new Object3D();
