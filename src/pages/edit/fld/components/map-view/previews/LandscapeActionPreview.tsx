import { Dispatch, useEffect, useRef, useState } from "react";
import { useCursorContext } from "../../../context/CursorContext";
import { useFldMapContext } from "../../../context/FldMapContext";
import { useFldPrimaryActionContext } from "../../../context/FldPrimaryActionContext";
import { FldFile, IndexValue, getRelativePoints } from "../../../../../../domain/fld/FldFile";
import { FldAction } from "../../../../../../domain/fld/useFldReducer";
import * as THREE from "three";
import { useLandscapeActionContext } from "../../../context/LandscapeActionContext";
import { useLeftClickHoldDelayAction } from "../../../hooks/useLeftClickHoldDelayAction";

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

    const planeMesh = useRef<THREE.Mesh>(null);
    const planeGeo = useRef<THREE.PlaneGeometry>(null);
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
                const x = fldFile.height - 1 - (p.index - z) / fldFile.width;
                geo.setY(i, height / 8 + 0.26);
                geo.setX(i, x);
                geo.setZ(i, z);
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
        const x = fldFile.height - 1 - Math.floor(point.index / fldFile.width);
        return (
            <mesh castShadow={true} receiveShadow={true} position={[x, point.value / 8, z]}>
                <sphereGeometry args={[0.25, 8, 8]} />
                <meshStandardMaterial
                    color="#ffffff"
                    roughness={0.5}
                    side={THREE.DoubleSide}
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
                side={THREE.DoubleSide}
                transparent={true}
                wireframe={false}
                opacity={0.5}
            />
        </mesh>
    );
};
