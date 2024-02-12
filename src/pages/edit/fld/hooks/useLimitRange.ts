import { useState } from "react";

export const useLimitRange = (min: number, max: number, initialValue?: number) => {
    const [size, setSize] = useState(initialValue ?? min);

    const updateSize = (value: number) => {
        setSize(() => {
            const newValue = value >>> 0;
            if (newValue > max) {
                return max;
            }
            if (newValue < min) {
                return min;
            }
            return newValue;
        });
    };

    const incrementBy = (delta: number) => {
        setSize((oldValue) => {
            const newValue = (delta + oldValue) >>> 0;
            if (newValue > max) {
                return max;
            }
            if (newValue < min) {
                return min;
            }
            return newValue;
        });
    };

    const upperLimitReached = size === max;
    const lowerLimitReached = size === min;

    return { size, upperLimitReached, lowerLimitReached, updateSize, incrementBy };
};
