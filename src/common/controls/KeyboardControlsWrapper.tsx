import { KeyboardControls, KeyboardControlsEntry } from "@react-three/drei";
import React, { ReactNode } from "react";
import { Controls } from "./Controls";

type KeyboardControlsWrapperProps = {
    children: ReactNode;
};

const controlsMap: KeyboardControlsEntry<Controls>[] = [
    { name: Controls.forward, keys: ["w", "W"] },
    { name: Controls.back, keys: ["s", "S"] },
    { name: Controls.left, keys: ["a", "A"] },
    { name: Controls.right, keys: ["d", "D"] },
    { name: Controls.rotateLeft, keys: ["q", "Q"] },
    { name: Controls.rotateRight, keys: ["e", "E"] },
];

export const KeyboardControlsWrapper: React.FC<KeyboardControlsWrapperProps> = ({ children }) => {
    return <KeyboardControls map={controlsMap}>{children}</KeyboardControls>;
};
