import { EffectCallback, useEffect, useRef } from "react";

export const useLeftClickAction = (effect: EffectCallback) => {
    const clickRef = useRef(false);

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0) {
                clickRef.current = true;
            }
        };

        window.addEventListener("mousedown", handleMouseDown);

        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
        };
    }, []);

    useEffect(() => {
        if (clickRef.current) {
            effect();
            clickRef.current = false;
        }
    }, [effect]);
};
