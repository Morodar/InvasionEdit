/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useContext, useState } from "react";
import { LayerIndex } from "../layers/Layer";

export type GenericAction = "FIX" | "SMOOTH" | "STEP-UP" | "STEP-DOWN";

export interface GenericActionContextProps {
    // state
    activeAction: GenericAction;
    height: number;
    size: number;
    speed: number;
    layer: LayerIndex;
    // functions
    setActiveAction: (value: GenericAction) => void;
    setSize: (value: number) => void;
    setHeight: (value: number) => void;
    setSpeed: (value: number) => void;
    setLayer: (value: LayerIndex) => void;
}

export const GenericActionContext = createContext<GenericActionContextProps | undefined>(undefined);

export const useGenericActionContext = (): GenericActionContextProps => {
    const context = useContext(GenericActionContext);
    if (!context) {
        throw new Error("GenericActionContext not initialized");
    }
    return context;
};

export const GenericActionContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [activeAction, setActiveAction] = useState<GenericAction>("SMOOTH");
    const [size, setSize] = useState<number>(3);
    const [height, setHeight] = useState<number>(16);
    const [speed, setSpeed] = useState<number>(8);
    const [layer, setLayer] = useState<LayerIndex>(0);

    const contextValue = {
        activeAction,
        height,
        size,
        speed,
        layer,
        setActiveAction,
        setHeight,
        setSize,
        setSpeed,
        setLayer,
    };

    return <GenericActionContext.Provider value={contextValue}>{children}</GenericActionContext.Provider>;
};
