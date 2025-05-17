import { useThree } from "@react-three/fiber";
import { useFldMapContext } from "../../domain/fld/FldMapContext";
import { useEffect, useState } from "react";
import { Vector3 } from "three";
import { OrbitControls } from "./OrbitControls";

/** Centers the camera whenever the current fld file changes */
export const useCenterCamera = (orbitControlsRef: React.RefObject<OrbitControls>) => {
    const { fldFile } = useFldMapContext();
    const { camera } = useThree();

    const [prevName, setPrevName] = useState("");
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

    // rotate map 45° and stretch using values from decompression algorithm
    const x2 = centerW * -1.999;
    const z2 = centerW * 1.152 + centerH * 2.305;

    // update camera position
    camera.set(x2 + 200, 500, z2 + 200);
    // update where camera looks
    target.set(x2 + 20, 0, z2);
}
