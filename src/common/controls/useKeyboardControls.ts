import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Camera, Vector3 } from "three";
import { useFldMapContext } from "../../domain/fld/FldMapContext";
import { centerCamera } from "../camera/useCenterCamera";
import { OrbitControls } from "../camera/OrbitControls";

export const useKeyboardControls = (orbitControlsRef?: React.RefObject<OrbitControls>) => {
    const { fldFile } = useFldMapContext();
    const [keys, setKeys] = useState(new Set<string>());
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const { camera } = useThree();

    useEffect(() => {
        const trackPressedKeys = (event: KeyboardEvent) => setKeys((old) => new Set(old).add(event.key));
        const trackReleasedKeys = (event: KeyboardEvent) =>
            setKeys((old) => {
                const updated = new Set(old);
                updated.delete(event.key);
                return updated;
            });

        window.addEventListener("keydown", trackPressedKeys);
        window.addEventListener("keyup", trackReleasedKeys);

        return () => {
            window.removeEventListener("keydown", trackPressedKeys);
            window.addEventListener("keyup", trackReleasedKeys);
        };
    }, []);

    useFrame(() => {
        const now = new Date();
        const diff = now.getTime() - lastUpdate.getTime();
        setLastUpdate(now);
        if (keys.size === 0) {
            return;
        }
        if (orbitControlsRef?.current) {
            updateCameraPosition(diff, keys, camera, orbitControlsRef.current, fldFile?.width, fldFile?.height);
        }
    });
};

const speed = 0.1;
const rotateSpeed = 0.002;

function updateCameraPosition(
    timeMs: number,
    pressedKeys: Set<string>,
    camera: Camera,
    orbit: OrbitControls,
    width = 60,
    height = 60,
) {
    const target = orbit.target;
    const moveBy = speed * timeMs;
    const rotateBy = rotateSpeed * timeMs;

    const direction = new Vector3().subVectors(camera.position, target).normalize();
    const left = new Vector3().crossVectors(direction, up);
    const forward = new Vector3().crossVectors(left, up);

    const moveVector = new Vector3();

    for (const key of pressedKeys) {
        switch (key) {
            case "w":
                moveVector.addScaledVector(forward, moveBy);
                break;

            case "a":
                moveVector.addScaledVector(left, moveBy);
                break;

            case "s":
                moveVector.addScaledVector(forward, -moveBy);
                break;

            case "d":
                moveVector.addScaledVector(left, -moveBy);
                break;

            case "e":
                // Rotate counter clock wise
                camera.position.sub(target).applyAxisAngle(up, rotateBy).add(target);
                break;

            case "q":
                // Rotate clock wise
                camera.position.sub(target).applyAxisAngle(up, -rotateBy).add(target);
                break;

            default:
                break;
        }
    }
    const newTarget = target.clone().add(moveVector);
    newTarget.y = 0;
    if (!isWithinBoundary(target, width, height)) {
        centerCamera(camera.position, target, width, height);
    } else if (isWithinBoundary(newTarget, width, height)) {
        // ensure target looks at map
        camera.position.add(moveVector);
        target.set(newTarget.x, newTarget.y, newTarget.z);
    }

    orbit.update();
}

const up = new Vector3(0, 1, 0);
const isWithinBoundary = (target: Vector3, width: number, height: number) =>
    target.x >= 0 && target.x <= width && target.z >= 0 && target.z <= height;
