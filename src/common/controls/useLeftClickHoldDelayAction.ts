import { DependencyList, EffectCallback, useEffect, useState } from "react";

export const useLeftClickHoldDelayAction = (effect: EffectCallback, cooldownMs: number, deps: DependencyList) => {
    const [isMouseHeld, setIsMouseHeld] = useState(false);

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
        if (!isMouseHeld) return;

        effect();

        const interval = setInterval(effect, cooldownMs);

        return () => clearInterval(interval);
    }, [isMouseHeld, effect, cooldownMs, deps]);
};
