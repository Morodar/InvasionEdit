import { DependencyList, EffectCallback, useEffect, useRef } from "react";

export const useLeftClickHoldDelayAction = (effect: EffectCallback, cooldownMs: number, deps: DependencyList) => {
    const isMouseHeldRef = useRef(false);
    const isCooldownRef = useRef(false);

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0) {
                isMouseHeldRef.current = true;
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (e.button === 0) {
                isMouseHeldRef.current = false;
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
        if (isMouseHeldRef.current && !isCooldownRef.current) {
            effect();
            isCooldownRef.current = true;
            setTimeout(() => { isCooldownRef.current = false; }, cooldownMs);
        }
    }, [effect, deps, cooldownMs]);
};
