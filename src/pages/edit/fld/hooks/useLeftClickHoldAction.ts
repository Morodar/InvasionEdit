import { DependencyList, EffectCallback, useEffect, useState } from "react";

export const useLeftClickHoldAction = (effect: EffectCallback, deps: DependencyList) => {
    const [isMouseHeld, setIsMouseHeld] = useState(false);

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

    useEffect(() => {
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    useEffect(() => {
        if (isMouseHeld) {
            effect();
        }
    }, [effect, deps, isMouseHeld]);
};
