import { Color } from "@react-three/fiber";
import { useFldPrimaryActionContext } from "../../../context/FldPrimaryActionContext";
import { ActiveResource, useResourceActionContext } from "../../../context/ResourceActionContext";
import { Dispatch, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useCursorContext } from "../../../context/CursorContext";
import { getRelativePoints } from "../../../hooks/getRelativePoints";
import { FldFile } from "../../../../../../domain/fld/FldFile";
import { useFldMapContext } from "../../../context/FldMapContext";
import { Tritium, Xenit } from "../../../../../../domain/fld/ResourceLayerUtil";
import { IndexPoint3D } from "../../../../../../domain/fld/MapLayer";
import { useLeftClickHoldAction } from "../../../hooks/useLeftClickHoldAction";
import { FldAction } from "../../../../../../domain/fld/useFldReducer";

export const ResourceActionPreview = () => {
    const { fldFile, dispatch } = useFldMapContext();
    const { primaryAction } = useFldPrimaryActionContext();
    const { hoveredPoint } = useCursorContext();

    if (primaryAction !== "RESOURCES" || !hoveredPoint || !fldFile) {
        return <></>;
    }

    return <Preview hoveredPoint={hoveredPoint} fldFile={fldFile} dispatch={dispatch} />;
};

const ACTION_COLOR: { [key in ActiveResource]: Color } = {
    DELETE: "#ff0000",
    XENIT: Xenit.COLOR,
    TRITIUM: Tritium.COLOR,
};

interface PreviewProps {
    hoveredPoint: number;
    fldFile: FldFile;
    dispatch: Dispatch<FldAction>;
}

const Preview = (props: PreviewProps) => {
    const { hoveredPoint, fldFile, dispatch } = props;
    const { activeResource, size } = useResourceActionContext();
    const [points, setPoints] = useState<IndexPoint3D[]>([]);
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);

    const planeMesh = useRef<THREE.Mesh>(null);
    const planeGeo = useRef<THREE.PlaneGeometry>(null);

    const color = ACTION_COLOR[activeResource];

    useLeftClickHoldAction(() => dispatch({ type: "RESOURCE", points, resource: activeResource }), [points]);

    useEffect(() => {
        const relativePoints = getRelativePoints(fldFile, hoveredPoint, size, size);
        setPoints(relativePoints);
        setWidth(new Set(relativePoints.map((p) => p.z)).size);
        setHeight(new Set(relativePoints.map((p) => p.x)).size);
    }, [fldFile, hoveredPoint, size]);

    useEffect(() => {
        if (planeGeo.current) {
            const geo = planeGeo.current.attributes.position;
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                const height = p.value;
                geo.setY(i, height / 8 + 0.1);
                geo.setX(i, p.x);
                geo.setZ(i, p.z);
            }
            planeGeo.current.attributes.position.needsUpdate = true;
            planeGeo.current.computeVertexNormals();
        }
    }, [points]);

    return (
        <mesh ref={planeMesh} castShadow={true} receiveShadow={true}>
            <planeGeometry args={[width, height, width - 1, height - 1]} ref={planeGeo} />
            <meshStandardMaterial
                color={color}
                roughness={0.5}
                side={THREE.DoubleSide}
                transparent={true}
                wireframe={false}
                opacity={0.5}
            />
        </mesh>
    );
};
