import { useThree } from "@react-three/fiber";
import { useFldMapContext } from "../context/FldMapContext";
import { useEffect, useState } from "react";
import { Vector3 } from "three";
import { OrbitControls } from "../../../../common/utils/OrbitControls";

export const useCenterCamera = (orbitControlsRef: React.RefObject<OrbitControls>) => {
    const [prevName, setPrevName] = useState("");
    const { fldFile } = useFldMapContext();
    const { camera } = useThree();
    const name = fldFile?.name;

    useEffect(() => {
        if (fldFile) {
            const name = fldFile.name;
            if (prevName !== name && orbitControlsRef.current) {
                const { width, height } = fldFile;
                centerCamera(camera.position, orbitControlsRef.current.target, width, height);
                orbitControlsRef.current.update();
            }
        }
        const updateName = fldFile ? fldFile.name : "";
        setPrevName(updateName);
    }, [camera, camera.position, fldFile, name, orbitControlsRef, prevName]);
};

export function centerCamera(camera: Vector3, target: Vector3, width: number, height: number) {
    const centerH = height / 2;
    const centerW = width / 2;

    // update camera position
    camera.set(width + 20, 80, centerH);
    // update where camera looks
    target.set(centerW + 20, 0, centerH);
}
