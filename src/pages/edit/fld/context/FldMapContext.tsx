/* eslint-disable react-refresh/only-export-components */
import { Dispatch, useContext } from "react";
import { useState, useCallback, useMemo, PropsWithChildren, useEffect } from "react";
import { FldFile } from "../../../../domain/fld/FldFile";
import { ResourceDefinition, ResourceLayerUtil } from "../../../../domain/fld/ResourceLayerUtil";

import { createContext } from "react";
import { FldAction, useFldReducer } from "../../../../domain/fld/useFldReducer";
import { FldUtils } from "../../../../domain/fld/FldUtils";

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
    const [resourceLayer, setResourceLayer] = useState<ResourceDefinition | null>(null);

    const tryUseFldFile = useCallback(
        async (file: File) => {
            const result = await FldUtils.parseFldFile(file);
            dispatch({ type: "SET_FLD", fldFile: result });
        },
        [dispatch],
    );

    useEffect(() => {
        if (fldFile) {
            const res = ResourceLayerUtil.fromFldFile(fldFile);
            setResourceLayer(res);
        }
    }, [fldFile]);

    const contextValue = useMemo(() => {
        return { fldFile, dispatch, tryUseFldFile, resourceLayer };
    }, [fldFile, dispatch, tryUseFldFile, resourceLayer]);

    return <FldMapContext.Provider value={contextValue}>{children}</FldMapContext.Provider>;
};
