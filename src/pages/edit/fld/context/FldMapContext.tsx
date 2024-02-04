/* eslint-disable react-refresh/only-export-components */
import { useContext } from "react";
import { useState, useCallback, useMemo, PropsWithChildren, useEffect } from "react";
import { FldFile } from "../../../../domain/fld/FldFile";
import { parseFldFile } from "../../../../domain/fld/parseFldFile";
import { ResourceDefinition, ResourceLayerUtil } from "../../../../domain/fld/ResourceLayerUtil";

import { createContext } from "react";

export interface FldMapContextProps {
    // state
    fldFile: FldFile | null;
    resourceLayer: ResourceDefinition | null;
    // functions
    setFldFile: React.Dispatch<React.SetStateAction<FldFile | null>>;
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
    const [fldFile, setFldFile] = useState<FldFile | null>(null);
    const [resourceLayer, setResourceLayer] = useState<ResourceDefinition | null>(null);

    const tryUseFldFile = useCallback(
        async (file: File) => {
            const result = await parseFldFile(file);
            setFldFile(result);
        },
        [setFldFile],
    );

    useEffect(() => {
        if (fldFile) {
            const res = ResourceLayerUtil.fromFldFile(fldFile);
            setResourceLayer(res);
        }
    }, [fldFile]);

    const contextValue = useMemo(() => {
        return { fldFile, setFldFile, tryUseFldFile, resourceLayer };
    }, [fldFile, setFldFile, tryUseFldFile, resourceLayer]);

    return <FldMapContext.Provider value={contextValue}>{children}</FldMapContext.Provider>;
};
