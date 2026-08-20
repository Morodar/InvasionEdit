import { DependencyList, EffectCallback, useEffect, useRef } from "react";

export const useLeftClickHoldDelayAction = (effect: EffectCallback, cooldownMs: number, deps: DependencyList) => {
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

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0 && !isCooldownRef.current) {
                effectRef.current();
                isCooldownRef.current = true;
                timeoutRef.current = setTimeout(() => {
                    isCooldownRef.current = false;
                    timeoutRef.current = null;
                }, cooldownMs);
            }
        };

        window.addEventListener("mousedown", handleMouseDown);

        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            clearCooldown();
        };
        // user needs control of deps. Ignoring the rule is okay here.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cooldownMs, ...deps]);
};
