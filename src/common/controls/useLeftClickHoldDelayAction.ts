import { DependencyList, EffectCallback, useEffect, useRef, useState } from "react";

export const useLeftClickHoldDelayAction = (effect: EffectCallback, cooldownMs: number, deps: DependencyList) => {
    const [isMouseHeld, setIsMouseHeld] = useState(false);
    const [tick, setTick] = useState(0);
    const cooldownRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0) setIsMouseHeld(true);
        };
        const handleMouseUp = (e: MouseEvent) => {
            if (e.button === 0) setIsMouseHeld(false);
        };

        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    useEffect(() => {
        if (isMouseHeld && !cooldownRef.current) {
            effect();
            cooldownRef.current = true;
            timerRef.current = setTimeout(() => {
                cooldownRef.current = false;
                setTick((t) => t + 1);
            }, cooldownMs);
        }
    }, [effect, deps, isMouseHeld, cooldownMs, tick]);
};
