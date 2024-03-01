import { TextField } from "@mui/material";
import { useLimitRange } from "../../pages/edit/fld/hooks/useLimitRange";
import { useEffect, useRef } from "react";

export interface MinMaxNumberInputProps {
    label: string;
    value: number;
    min: number;
    max: number;
    maxWidth?: number;
    onValueChanged: (value: number) => void;
}

export const MinMaxNumberInput = (props: MinMaxNumberInputProps) => {
    const { label, min, max, maxWidth, value, onValueChanged } = props;
    const { size, updateSize, incrementBy } = useLimitRange(min, max, value);
    const inputRef = useRef<HTMLInputElement>(null!);

    useEffect(() => {
        if (value !== size) {
            onValueChanged(size);
        }
    }, [onValueChanged, size, value]);

    useEffect(() => {
        const handleScroll = (event: WheelEvent) => {
            if (event.deltaY < 0) {
                incrementBy(1);
            } else {
                incrementBy(-1);
            }
        };

        const inputElement = inputRef.current;
        inputElement.addEventListener("wheel", handleScroll, { passive: true });

        return () => {
            inputElement.removeEventListener("wheel", handleScroll);
        };
    }, [incrementBy]);

    const maxW = `${maxWidth ?? 64}px`;
    return (
        <TextField
            ref={inputRef}
            label={label}
            type="number"
            value={size}
            onChange={(e) => updateSize(+e.target.value)}
            style={{ maxWidth: maxW }}
        />
    );
};
