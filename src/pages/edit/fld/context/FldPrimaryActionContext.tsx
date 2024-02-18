/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from "react";

export type FldPrimaryAction = "CLEAR" | "LANDSCAPE" | "RESOURCES" | "GENERIC";

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

    const handleSetAction = useCallback(
        (action: FldPrimaryAction) => {
            if (primaryAction === action) {
                setPrimaryAction("CLEAR");
            } else {
                setPrimaryAction(action);
            }
        },
        [primaryAction],
    );

    const contextValue = useMemo(() => {
        return { primaryAction, setPrimaryAction: handleSetAction };
    }, [handleSetAction, primaryAction]);

    return <FldPrimaryActionContext.Provider value={contextValue}>{children}</FldPrimaryActionContext.Provider>;
};
