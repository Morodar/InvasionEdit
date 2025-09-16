/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useContext, useState } from "react";

export type FldPrimaryAction = "CLEAR" | "LANDSCAPE" | "RESOURCES" | "GENERIC" | "WATER" | "BUILDING";

export interface FldPrimaryActionContextProps {
    // state
    primaryAction: FldPrimaryAction;
    // functions
    setPrimaryAction: (action: FldPrimaryAction) => void;
}

export const FldPrimaryActionContext = createContext<FldPrimaryActionContextProps | undefined>(undefined);

export const useFldPrimaryActionContext = (): FldPrimaryActionContextProps => {
    const context = useContext(FldPrimaryActionContext);
    if (!context) {
        throw new Error("FldPrimaryActionContext not initialized");
    }
    return context;
};

export const FldPrimaryActionContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [primaryAction, setPrimaryAction] = useState<FldPrimaryAction>("CLEAR");

    const handleSetAction = (action: FldPrimaryAction) => {
        if (primaryAction === action) {
            setPrimaryAction("CLEAR");
        } else {
            setPrimaryAction(action);
        }
    };

    const contextValue = { primaryAction, setPrimaryAction: handleSetAction };

    return <FldPrimaryActionContext.Provider value={contextValue}>{children}</FldPrimaryActionContext.Provider>;
};
