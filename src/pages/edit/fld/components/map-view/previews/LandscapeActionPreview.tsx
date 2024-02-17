import { Dispatch, useEffect, useRef, useState } from "react";
import { useCursorContext } from "../../../context/CursorContext";
import { useFldMapContext } from "../../../context/FldMapContext";
import { useFldPrimaryActionContext } from "../../../context/FldPrimaryActionContext";
import { FldFile, IndexPoint3D, getRelativePoints } from "../../../../../../domain/fld/FldFile";
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
    const { activeAction, radius, height: absoluteHeight, speed: stepsize } = useLandscapeActionContext();
    const [points, setPoints] = useState<IndexPoint3D[]>([]);
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
        const relativePoints = getRelativePoints(fldFile, hoveredPoint, radius, radius);
        setPoints(relativePoints);
        setWidth(new Set(relativePoints.map((p) => p.z)).size);
        setHeight(new Set(relativePoints.map((p) => p.x)).size);
    }, [fldFile, hoveredPoint, radius]);

    useEffect(() => {
        if (planeGeo.current) {
            const geo = planeGeo.current.attributes.position;
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                const height = p.value;
                geo.setY(i, height / 8 + 0.26);
                geo.setX(i, p.x);
                geo.setZ(i, p.z);
            }
            planeGeo.current.attributes.position.needsUpdate = true;
            planeGeo.current.computeVertexNormals();
            planeGeo.current.computeBoundingBox();
            planeGeo.current.computeBoundingSphere();
            planeGeo.current.computeTangents();
        }
    }, [points]);

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
