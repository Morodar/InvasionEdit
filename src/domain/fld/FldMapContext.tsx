/* eslint-disable react-refresh/only-export-components */
import { Dispatch, useContext } from "react";
import { useCallback, useMemo, PropsWithChildren } from "react";
import { FldFile } from "./FldFile";
import { ResourceDefinition, ResourceLayerUtil } from "./resource/ResourceLayerUtil";

import { createContext } from "react";
import { FldAction, useFldReducer } from "./FldReducer";
import { FldUtils } from "./FldUtils";

export interface FldMapContextProps {
    // state
    fldFile: FldFile | null;
    resourceLayer: ResourceDefinition | null;
    // functions
    dispatch: Dispatch<FldAction>;
    tryUseFldFile: (file: File) => void;
}

export const FldMapContext = createContext<FldMapContextProps | undefined>(undefined);

export const useFldMapContext = (): FldMapContextProps => {
    const context = useContext(FldMapContext);
    if (!context) {
        throw new Error("FldMapContext not initialized");
    }
    return context;
};

export const FldMapContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [fldFile, dispatch] = useFldReducer();

    const resourceLayer: ResourceDefinition | null = useMemo(
        () => (fldFile ? ResourceLayerUtil.fromFldFile(fldFile) : null),
        [fldFile],
    );

    const tryUseFldFile = useCallback(
        async (file: File) => {
            const result = await FldUtils.parseFldFile(file);
            dispatch({ type: "SET_FLD", fldFile: result });
        },
        [dispatch],
    );

    const contextValue = useMemo(
        () => ({ fldFile, dispatch, tryUseFldFile, resourceLayer }),
        [fldFile, dispatch, tryUseFldFile, resourceLayer],
    );

    return <FldMapContext.Provider value={contextValue}>{children}</FldMapContext.Provider>;
};
