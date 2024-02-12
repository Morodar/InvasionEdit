/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useContext, useMemo, useState } from "react";

export type HeightmapAction = "FIX" | "SMOOTH" | "STEP-UP" | "STEP-DOWN";

export interface HeightmapActionContextProps {
    // state
    activeAction: HeightmapAction;
    height: number;
    radius: number;
    stepsize: number;
    // functions
    setActiveAction: (value: HeightmapAction) => void;
    setRadius: (value: number) => void;
    setHeight: (value: number) => void;
    setStepsize: (value: number) => void;
}

export const HeightmapActionContext = createContext<HeightmapActionContextProps | undefined>(undefined);

export const useHeightmapActionContext = (): HeightmapActionContextProps => {
    const context = useContext(HeightmapActionContext);
    if (!context) {
        throw new Error("HeightmapActionContext not initialized");
    }
    return context;
};

export const HeightmapActionContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [activeAction, setActiveAction] = useState<HeightmapAction>("SMOOTH");
    const [radius, setRadius] = useState<number>(1);
    const [height, setHeight] = useState<number>(0);
    const [stepsize, setStepsize] = useState<number>(1);

    const contextValue = useMemo(() => {
        return {
            activeAction,
            height,
            radius,
            stepsize,
            setActiveAction,
            setHeight,
            setRadius,
            setStepsize,
        };
    }, [activeAction, height, radius, stepsize]);

    return <HeightmapActionContext.Provider value={contextValue}>{children}</HeightmapActionContext.Provider>;
};
