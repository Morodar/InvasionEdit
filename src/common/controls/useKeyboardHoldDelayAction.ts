import { DependencyList, EffectCallback, useEffect, useState } from "react";

export const useKeyboardHoldDelayAction = (
    effect: EffectCallback,
    key: string,
    cooldownMs: number,
    deps: DependencyList,
) => {
    const [isKeyHeld, setIsKeyHeld] = useState(false);
    const [isCooldown, setIsCooldown] = useState(false);

    useEffect(() => {
        const handleMouseDown = (e: KeyboardEvent) => {
            if (e.key === key) {
                setIsKeyHeld(true);
            }
        };

        const handleMouseUp = (e: KeyboardEvent) => {
            if (e.key === key) {
                setIsKeyHeld(false);
            }
        };

        window.addEventListener("keydown", handleMouseDown);
        window.addEventListener("keyup", handleMouseUp);

        return () => {
            window.removeEventListener("keydown", handleMouseDown);
            window.removeEventListener("keyup", handleMouseUp);
        };
    }, [key]);

    useEffect(() => {
        if (!isCooldown) {
            return;
        }
        const task = setTimeout(() => setIsCooldown(false), cooldownMs);
        return () => {
            clearTimeout(task);
        };
    }, [cooldownMs, isCooldown]);

    useEffect(() => {
        if (isKeyHeld && !isCooldown) {
            effect();
            setIsCooldown(true);
        }
    }, [effect, deps, isKeyHeld, isCooldown]);
};
