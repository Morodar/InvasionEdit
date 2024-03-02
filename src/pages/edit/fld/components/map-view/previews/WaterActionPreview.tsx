import { Dispatch, useEffect, useRef, useState } from "react";
import { FldFile, IndexValue } from "../../../../../../domain/fld/FldFile";
import { FldAction } from "../../../../../../domain/fld/useFldReducer";
import { useFldMapContext } from "../../../context/FldMapContext";
import { useFldPrimaryActionContext } from "../../../context/FldPrimaryActionContext";
import { InstancedMesh, DoubleSide, Object3D } from "three";
import { useCursorContext } from "../../../context/CursorContext";
import { useLeftClickHoldDelayAction } from "../../../hooks/useLeftClickHoldDelayAction";
import { ActiveWater, useWaterActionContext } from "../../../context/WaterActionContext";
import { Color } from "@react-three/fiber";
import { Layer } from "../../../../../../domain/fld/Layer";
import { WATER_COLOR } from "../../../../../../domain/fld/WaterLayerUtil";

export const WaterActionPreview = () => {
    const { fldFile, dispatch } = useFldMapContext();
    const { primaryAction } = useFldPrimaryActionContext();
    const { hoveredPoint } = useCursorContext();

    if (primaryAction !== "WATER" || !hoveredPoint || !fldFile) {
        return <></>;
    }

    return <Preview hoveredPoint={hoveredPoint} fldFile={fldFile} dispatch={dispatch} />;
};

const ACTION_COLOR: { [key in ActiveWater]: Color } = {
    DELETE: "#ff0000",
    WATER: WATER_COLOR,
};

interface PreviewProps {
    hoveredPoint: number;
    fldFile: FldFile;
    dispatch: Dispatch<FldAction>;
}

const Preview = (props: PreviewProps) => {
    const { hoveredPoint, fldFile, dispatch } = props;
    const { width, height } = fldFile;
    const { activeAction } = useWaterActionContext();
    const [points, setPoints] = useState<IndexValue[]>([]);
    const instancedMeshRef = useRef<InstancedMesh>(null!);
    const speed = 8;
    const color = ACTION_COLOR[activeAction];

    useLeftClickHoldDelayAction(
        () =>
            dispatch({
                type: "WATER",
                points,
                water: activeAction,
                selectedIndex: hoveredPoint,
            }),
        speed,
        [points],
    );

    useEffect(() => {
        const relativePoints = getWaterPuddlePoints(fldFile, hoveredPoint);
        setPoints(relativePoints);
    }, [fldFile, hoveredPoint]);

    useEffect(() => {
        points.forEach((p, i) => {
            const z = p.index % width;
            const x = height - 1 - (p.index - z) / width;
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
                color={color}
                roughness={0.5}
                side={DoubleSide}
                transparent={true}
                wireframe={false}
                opacity={0.5}
            />
        </instancedMesh>
    );
};

const temp = new Object3D();

const getWaterPuddlePoints = (fldFile: FldFile, startPoint: number) => {
    const { width } = fldFile;
    const landscape = fldFile.layers[Layer.Landscape];

    const visited: boolean[] = Array<boolean>(landscape.byteLength).fill(false);
    const cursorHeight = landscape.getUint8(startPoint);
    const puddlePoints: IndexValue[] = [];
    const stack: number[] = [startPoint];
    while (stack.length > 0) {
        const point = stack.pop();
        if (point == undefined || point < 0 || point >= visited.length || visited[point]) {
            continue;
        }
        visited[point] = true;
        const pointHeight = landscape.getUint8(point);
        // Add points to the puddle if their height is lower than the cursor's height
        if (pointHeight <= cursorHeight) {
            puddlePoints.push({ index: point, value: cursorHeight });
            stack.push(point - 1);
            stack.push(point + 1);
            stack.push(point - width);
            stack.push(point + width);
        }
    }
    return puddlePoints;
};
