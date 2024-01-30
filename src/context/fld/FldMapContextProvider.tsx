import { useState, useCallback, useMemo, PropsWithChildren } from "react";
import { FldFile } from "../../domain/FldFile";
import { parseFldFile } from "../../domain/parseFldFile";
import { FldMapContext } from "./FldMapContext";

export const FldMapContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [fldFile, setFldFile] = useState<FldFile | null>(null);

    const tryUseFldFile = useCallback(
        async (file: File) => {
            const result = await parseFldFile(file);
            setFldFile(result);
        },
        [setFldFile],
    );

    const contextValue = useMemo(() => {
        return { fldFile, setFldFile, tryUseFldFile };
    }, [fldFile, setFldFile, tryUseFldFile]);

    return <FldMapContext.Provider value={contextValue}>{children}</FldMapContext.Provider>;
};
