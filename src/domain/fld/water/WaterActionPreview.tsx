import { Dispatch, useEffect, useRef, useState } from "react";
import { FldFile, IndexValue } from "../FldFile";
import { FldAction } from "../FldReducer";
import { useFldMapContext } from "../FldMapContext";
import { useFldPrimaryActionContext } from "../action-bar/FldPrimaryActionContext";
import { InstancedMesh, DoubleSide, Object3D } from "three";
import { useCursorContext } from "../../../common/controls/CursorContext";
import { useLeftClickHoldDelayAction } from "../../../common/controls/useLeftClickHoldDelayAction";
import { ActiveWater, useWaterActionContext } from "./WaterActionContext";
import { Color } from "@react-three/fiber";
import { Layer } from "../layers/Layer";
import { WATER_COLOR } from "./Water";

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
            const x = (p.index - z) / width;

            // rotate map 45° and stretch using values from decompression algorithm
            const x2 = x * -1.999;
            const z2 = x * 1.152 + z * 2.305;

            temp.position.set(x2, p.value / 4, z2);
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
