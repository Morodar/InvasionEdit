import { Dispatch, useEffect, useRef, useState } from "react";
import { useCursorContext } from "../../../common/controls/CursorContext";
import { useFldMapContext } from "../FldMapContext";
import { useFldPrimaryActionContext } from "../action-bar/FldPrimaryActionContext";
import { FldFile, IndexValue, getRelativePoints } from "../FldFile";
import { FldAction } from "../FldReducer";
import { useLandscapeActionContext } from "./LandscapeActionContext";
import { useLeftClickHoldDelayAction } from "../../../common/controls/useLeftClickHoldDelayAction";
import { DoubleSide, Mesh, PlaneGeometry } from "three";

export const LandscapeActionPreview = () => {
    const { fldFile, dispatch } = useFldMapContext();
    const { primaryAction } = useFldPrimaryActionContext();
    const { hoveredPoint } = useCursorContext();

    if (primaryAction !== "LANDSCAPE" || !hoveredPoint || !fldFile) {
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
    const { activeAction, size, height: absoluteHeight, speed: stepsize } = useLandscapeActionContext();
    const [points, setPoints] = useState<IndexValue[]>([]);
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);

    const planeMesh = useRef<Mesh>(null);
    const planeGeo = useRef<PlaneGeometry>(null);
    const speed = activeAction === "FIX" ? 8 : 1000 / stepsize;

    useLeftClickHoldDelayAction(
        () => dispatch({ type: "LANDSCAPE", action: activeAction, points, height: absoluteHeight }),
        speed,
        [points],
    );

    useEffect(() => {
        const relativePoints = getRelativePoints(fldFile, hoveredPoint, size, size);
        setPoints(relativePoints);
        setWidth(new Set(relativePoints.map((p) => p.index % fldFile.width)).size);
        setHeight(new Set(relativePoints.map((p) => fldFile.height - 1 - Math.floor(p.index / fldFile.width))).size);
    }, [fldFile, hoveredPoint, size]);

    useEffect(() => {
        if (planeGeo.current) {
            const geo = planeGeo.current.attributes.position;
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                const height = p.value;
                const z = p.index % fldFile.width;
                const x = Math.floor(p.index / fldFile.width);

                // rotate map 45° and stretch using values from decompression algorithm
                const x2 = x * -1.999;
                const z2 = x * 1.152 + z * 2.305;
                geo.setY(i, height / 4 + 0.5);
                geo.setX(i, x2);
                geo.setZ(i, z2);
            }
            planeGeo.current.attributes.position.needsUpdate = true;
            planeGeo.current.computeVertexNormals();
            planeGeo.current.computeBoundingBox();
            planeGeo.current.computeBoundingSphere();
            planeGeo.current.computeTangents();
        }
    }, [fldFile.height, fldFile.width, points]);

    if (points.length === 1) {
        const point = points[0];
        const z = point.index % fldFile.width;
        const x = Math.floor(point.index / fldFile.width);
        // rotate map 45° and stretch using values from decompression algorithm
        const x2 = x * -1.999;
        const z2 = x * 1.152 + z * 2.305;
        return (
            <mesh castShadow={true} receiveShadow={true} position={[x2, point.value / 4 + 0.5, z2]}>
                <sphereGeometry args={[0.25, 8, 8]} />
                <meshStandardMaterial
                    color="#ffffff"
                    roughness={0.5}
                    side={DoubleSide}
                    transparent={true}
                    wireframe={false}
                    opacity={0.7}
                />
            </mesh>
        );
    }

    return (
        <mesh ref={planeMesh} castShadow={true} receiveShadow={true}>
            <planeGeometry args={[width, height, width - 1, height - 1]} ref={planeGeo} />
            <meshStandardMaterial
                color="#ffffff"
                roughness={0.5}
                side={DoubleSide}
                transparent={true}
                wireframe={false}
                opacity={0.5}
            />
        </mesh>
    );
};
