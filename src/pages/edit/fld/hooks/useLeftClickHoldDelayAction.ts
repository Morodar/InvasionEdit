import { DependencyList, EffectCallback, useEffect, useState } from "react";

export const useLeftClickHoldDelayAction = (effect: EffectCallback, cooldownMs: number, deps: DependencyList) => {
    const [isMouseHeld, setIsMouseHeld] = useState(false);
    const [isCooldown, setIsCooldown] = useState(false);

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
        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0) {
                setIsMouseHeld(true);
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (e.button === 0) {
                setIsMouseHeld(false);
            }
        };

        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    useEffect(() => {
        if (isMouseHeld && !isCooldown) {
            effect();
            setIsCooldown(true);
        }
    }, [effect, deps, isMouseHeld, isCooldown]);
};
