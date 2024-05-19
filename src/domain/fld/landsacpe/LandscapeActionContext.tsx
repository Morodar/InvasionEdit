/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useContext, useMemo, useState } from "react";

export type LandscapeAction = "FIX" | "SMOOTH" | "STEP-UP" | "STEP-DOWN";

export interface LandscapeActionContextProps {
    // state
    activeAction: LandscapeAction;
    height: number;
    size: number;
    speed: number;
    // functions
    setActiveAction: (value: LandscapeAction) => void;
    setSize: (value: number) => void;
    setHeight: (value: number) => void;
    setSpeed: (value: number) => void;
}

export const LandscapeActionContext = createContext<LandscapeActionContextProps | undefined>(undefined);

export const useLandscapeActionContext = (): LandscapeActionContextProps => {
    const context = useContext(LandscapeActionContext);
    if (!context) {
        throw new Error("LandscapeActionContext not initialized");
    }
    return context;
};

export const LandscapeActionContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [activeAction, setActiveAction] = useState<LandscapeAction>("SMOOTH");
    const [size, setSize] = useState<number>(3);
    const [height, setHeight] = useState<number>(16);
    const [speed, setSpeed] = useState<number>(8);

    const contextValue = useMemo(() => {
        return {
            activeAction,
            height,
            size,
            speed,
            setActiveAction,
            setHeight,
            setSize,
            setSpeed,
        };
    }, [activeAction, height, size, speed]);

    return <LandscapeActionContext.Provider value={contextValue}>{children}</LandscapeActionContext.Provider>;
};
