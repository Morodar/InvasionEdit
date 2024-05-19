import { EffectCallback, useEffect, useState } from "react";

export const useLeftClickAction = (effect: EffectCallback) => {
    const [click, setClick] = useState(false);

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0) {
                setClick(true);
            }
        };

        window.addEventListener("mousedown", handleMouseDown);

        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
        };
    }, []);

    useEffect(() => {
        if (click) {
            effect();
            setClick(false);
        }
    }, [effect, click]);
};
