import { DependencyList, EffectCallback, useEffect, useRef } from "react";

export const useKeyboardHoldDelayAction = (
    effect: EffectCallback,
    key: string,
    cooldownMs: number,
    deps: DependencyList,
) => {
    const isCooldownRef = useRef(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const effectRef = useRef(effect);

    useEffect(() => {
        effectRef.current = effect;
    });

    useEffect(() => {
        const clearCooldown = () => {
            if (timeoutRef.current != null) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            isCooldownRef.current = false;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === key && !isCooldownRef.current) {
                effectRef.current();
                isCooldownRef.current = true;
                timeoutRef.current = setTimeout(() => {
                    isCooldownRef.current = false;
                    timeoutRef.current = null;
                }, cooldownMs);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            clearCooldown();
        };
    }, [key, cooldownMs, ...deps]);
};
