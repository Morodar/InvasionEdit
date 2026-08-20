import { EffectCallback, useEffect, useRef } from "react";

export const useLeftClickAction = (effect: EffectCallback) => {
    const effectRef = useRef(effect);

    useEffect(() => {
        effectRef.current = effect;
    });

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0) {
                effectRef.current();
            }
        };

        window.addEventListener("mousedown", handleMouseDown);

        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
        };
    }, []);
};
