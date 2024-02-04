import { useFrame, useThree } from "@react-three/fiber";
import { useCursorContext } from "../context/CursorContext";
import { RefObject } from "react";
import * as THREE from "three";
import { useFldMapContext } from "../context/FldMapContext";

export const useCursorCapture = (meshRef: RefObject<THREE.Mesh>) => {
    const { camera, pointer } = useThree();
    const raycaster = new THREE.Raycaster();
    const { setHoveredPoint, setMeshPoint } = useCursorContext();
    const { fldFile } = useFldMapContext();

    useFrame(() => {
        if (meshRef.current && fldFile) {
            const { height, width, points } = fldFile;
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObject(meshRef.current);
            if (intersects.length > 0) {
                const point = intersects[0].point;
                const x = Math.round(point.x);
                const z = Math.round(point.z);
                setMeshPoint({ x, z, value: Math.round(point.y) });
                const index = (height - x) * width + z - width;
                if (index < points.length) {
                    setHoveredPoint(points[index]);
                }
            }
        }
    });
};
