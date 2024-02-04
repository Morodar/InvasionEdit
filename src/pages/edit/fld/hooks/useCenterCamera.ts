import { useThree } from "@react-three/fiber";
import { useFldMapContext } from "../context/FldMapContext";
import { useEffect, useState } from "react";
import { OrbitControls } from "three-stdlib";
import { Vector3 } from "three";

export const useCenterCamera = (orbitControlsRef?: React.RefObject<OrbitControls>) => {
    const [prevName, setPrevName] = useState("");
    const { fldFile } = useFldMapContext();
    const { camera } = useThree();
    const name = fldFile?.name;

    useEffect(() => {
        if (fldFile) {
            const name = fldFile.name;
            if (prevName !== name) {
                const { width, height } = fldFile;
                const centerH = height / 2;
                const centerW = width / 2;

                if (orbitControlsRef?.current) {
                    // update camera position
                    camera.position.set(width + 20, 80, centerH);
                    // update where camera looks
                    orbitControlsRef.current.target = new Vector3(centerW + 20, 0, centerH);
                    orbitControlsRef.current.update();
                }
            }
        }
        const updateName = fldFile ? fldFile.name : "";
        setPrevName(updateName);
    }, [camera, camera.position, fldFile, name, orbitControlsRef, prevName]);
};
