/* eslint-disable react-refresh/only-export-components */
import { Dispatch, PropsWithChildren, createContext, useContext } from "react";
import { LevFile } from "./LevFile";
import { LevAction, useLevReducer } from "./LevReducer";

export interface LevContextProps {
    // state
    levFile: LevFile | null;
    // functions
    dispatch: Dispatch<LevAction>;
}

export const LevContext = createContext<LevContextProps | undefined>(undefined);

export const useLevContext = (): LevContextProps => {
    const context = useContext(LevContext);
    if (!context) {
        throw new Error("LevContext not initialized");
    }
    return context;
};

export const LevContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [levFile, dispatch] = useLevReducer();

    const contextValue: LevContextProps = { levFile, dispatch };

    return <LevContext.Provider value={contextValue}>{children}</LevContext.Provider>;
};
