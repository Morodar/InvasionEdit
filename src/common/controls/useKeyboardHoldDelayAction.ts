import { DependencyList, EffectCallback, useEffect, useRef } from "react";

export const useKeyboardHoldDelayAction = (
    effect: EffectCallback,
    key: string,
    cooldownMs: number,
    deps: DependencyList,
) => {
    const isKeyHeldRef = useRef(false);
    const isCooldownRef = useRef(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === key) { isKeyHeldRef.current = true; }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === key) { isKeyHeldRef.current = false; }
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [key]);

    useEffect(() => {
        if (isKeyHeldRef.current && !isCooldownRef.current) {
            effect();
            isCooldownRef.current = true;
            setTimeout(() => { isCooldownRef.current = false; }, cooldownMs);
        }
    }, [effect, deps, cooldownMs]);
};
