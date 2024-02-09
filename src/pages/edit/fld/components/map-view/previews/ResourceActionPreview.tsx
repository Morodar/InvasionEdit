import { Color } from "@react-three/fiber";
import { useFldPrimaryActionContext } from "../../../context/FldPrimaryActionContext";
import { ActiveResource, useResourceActionContext } from "../../../context/ResourceActionContext";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useCursorContext } from "../../../context/CursorContext";
import { useRelativePoints } from "../../../hooks/useRelativePoints";
import { FldFile } from "../../../../../../domain/fld/FldFile";
import { useFldMapContext } from "../../../context/FldMapContext";

export const ResourceActionPreview = () => {
    const { fldFile } = useFldMapContext();
    const { primaryAction } = useFldPrimaryActionContext();
    const { hoveredPoint } = useCursorContext();

    if (primaryAction !== "RESOURCES" || !hoveredPoint || !fldFile) {
        return <></>;
    }

    return <Preview hoveredPoint={hoveredPoint} fldFile={fldFile} />;
};

const ACTION_COLOR: { [key in ActiveResource]: Color } = {
    DELETE: "#ff0000",
    XENIT: "#00ff00",
    TRITIUM: "#0000ff",
};

interface PreviewProps {
    hoveredPoint: number;
    fldFile: FldFile;
}

const Preview = (props: PreviewProps) => {
    const { hoveredPoint, fldFile } = props;
    const { activeResource, size } = useResourceActionContext();
    const points = useRelativePoints(fldFile, hoveredPoint, size, size);

    const width = new Set(points.map((p) => p.z)).size;
    const height = new Set(points.map((p) => p.x)).size;

    const color = ACTION_COLOR[activeResource];

    const planeMesh = useRef<THREE.Mesh>(null);
    const planeGeo = useRef<THREE.PlaneGeometry>(null);
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
            <meshStandardMaterial color={color} roughness={0.5} side={THREE.DoubleSide} wireframe={false} />
        </mesh>
    );
};
