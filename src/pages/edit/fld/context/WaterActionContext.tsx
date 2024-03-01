/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useContext, useMemo, useState } from "react";

export type ActiveWater = "DELETE" | "WATER";

export interface WaterActionContextProps {
    // state
    activeAction: ActiveWater;
    size: number;

    // functions
    setActiveAction: (value: ActiveWater) => void;
    setSize: (value: number) => void;
}

export const WaterActionContext = createContext<WaterActionContextProps | undefined>(undefined);

export const useWaterActionContext = (): WaterActionContextProps => {
    const context = useContext(WaterActionContext);
    if (!context) {
        throw new Error("WaterActionContext not initialized");
    }
    return context;
};

export const WaterActionContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [activeAction, setActiveAction] = useState<ActiveWater>("WATER");
    const [size, setSize] = useState<number>(3);

    const contextValue = useMemo(() => {
        return {
            activeAction,
            size,
            setSize,
            setActiveAction,
        };
    }, [activeAction, size]);

    return <WaterActionContext.Provider value={contextValue}>{children}</WaterActionContext.Provider>;
};
