import { Color } from "@react-three/fiber";
import { useFldPrimaryActionContext } from "../../../context/FldPrimaryActionContext";
import { ActiveResource, useResourceActionContext } from "../../../context/ResourceActionContext";
import { Dispatch, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useCursorContext } from "../../../context/CursorContext";
import { FldFile, IndexPoint3D, getRelativePoints } from "../../../../../../domain/fld/FldFile";
import { useFldMapContext } from "../../../context/FldMapContext";
import { Tritium, Xenit } from "../../../../../../domain/fld/ResourceLayerUtil";
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
    const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);

    const color = ACTION_COLOR[activeResource];

    useLeftClickHoldAction(() => dispatch({ type: "RESOURCE", points, resource: activeResource }), [points]);

    useEffect(() => {
        const relativePoints = getRelativePoints(fldFile, hoveredPoint, size, size);
        setPoints(relativePoints);
    }, [fldFile, hoveredPoint, size]);

    useEffect(() => {
        points.forEach((p, i) => {
            temp.position.set(p.x, p.value / 8, p.z);
            temp.updateMatrix();
            instancedMeshRef.current.setMatrixAt(i, temp.matrix);
        });

        // Update the instance
        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
        instancedMeshRef.current.computeBoundingBox();
        instancedMeshRef.current.computeBoundingSphere();
    }, [points]);

    return (
        <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, size * size]}>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshStandardMaterial
                color={color}
                roughness={0.5}
                side={THREE.DoubleSide}
                transparent={true}
                wireframe={false}
                opacity={0.7}
            />
        </instancedMesh>
    );
};

const temp = new THREE.Object3D();
