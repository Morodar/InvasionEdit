import { useState, useCallback, useMemo, PropsWithChildren, useEffect } from "react";
import { FldFile } from "../../../../domain/fld/FldFile";
import { parseFldFile } from "../../../../domain/fld/parseFldFile";
import { FldMapContext } from "./FldMapContext";
import { ResourceDefinition, ResourceLayerUtil } from "../../../../domain/fld/ResourceLayerUtil";

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
