/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useContext, useMemo, useState } from "react";

export type ActiveWater = "DELETE" | "WATER";

export interface WaterActionContextProps {
    // state
    activeAction: ActiveWater;

    // functions
    setActiveAction: (value: ActiveWater) => void;
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

    const contextValue = useMemo(() => {
        return {
            activeAction,
            setActiveAction,
        };
    }, [activeAction]);

    return <WaterActionContext.Provider value={contextValue}>{children}</WaterActionContext.Provider>;
};
