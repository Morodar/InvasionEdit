import { useFrame, useThree } from "@react-three/fiber";
import { useCursorContext } from "./CursorContext";
import { RefObject, useEffect, useState } from "react";
import { useFldMapContext } from "../../domain/fld/FldMapContext";
import { Layer } from "../../domain/fld/layers/Layer";
import { Mesh, Raycaster } from "three";

const raycaster = new Raycaster();

export const useCursorCapture = (meshRef: RefObject<Mesh>) => {
    const { camera, pointer, gl } = useThree();
    const { hoveredPoint, setHoveredPoint, setMeshPoint, setRawPoint } = useCursorContext();
    const { fldFile } = useFldMapContext();

    const [lastIndex, setLastIndex] = useState<number>();
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);
    const [lastCamX, setLastCamX] = useState(0);
    const [lastCamZ, setLastCamZ] = useState(0);
    const [isMouseOver, setIsMouseOver] = useState(false);

    useFrame(() => {
        if (!isMouseOver) {
            if (hoveredPoint !== undefined) {
                setHoveredPoint(undefined);
                setMeshPoint(undefined);
                setRawPoint(undefined);
            }
            return;
        }

        if (
            lastX === pointer.x &&
            lastY === pointer.y &&
            camera.position.x === lastCamX &&
            camera.position.z === lastCamZ
        ) {
            return;
        }

        setLastX(pointer.x);
        setLastY(pointer.y);
        setLastCamX(camera.position.x);
        setLastCamZ(camera.position.z);

        if (meshRef.current && fldFile) {
            const { height, width, layers } = fldFile;
            const points = layers[Layer.Landscape];
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObject(meshRef.current);
            if (intersects.length > 0) {
                const point = intersects[0].point;
                const x = Math.round(point.x);
                const z = Math.round(point.z);
                const index = (height - x) * width + z - width;
                if (index !== lastIndex && index < points.byteLength) {
                    setMeshPoint({ x, z, value: Math.round(point.y) });
                    setHoveredPoint(index);
                    setLastIndex(index);
                }
                setRawPoint({ x: point.x, z: point.z, value: point.y });
            } else {
                if (hoveredPoint !== undefined) {
                    setHoveredPoint(undefined);
                    setMeshPoint(undefined);
                    setRawPoint(undefined);
                }
            }
        }
    });

    useEffect(() => {
        const handleMouseEnter = () => setIsMouseOver(true);
        const handleMouseLeave = () => setIsMouseOver(false);

        gl.domElement.addEventListener("mouseenter", handleMouseEnter);
        gl.domElement.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            gl.domElement.removeEventListener("mouseenter", handleMouseEnter);
            gl.domElement.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [gl]);
};
