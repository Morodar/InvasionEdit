import { ReactNode, createContext, useContext, useMemo, useState } from "react";
import { FldFile } from "../../domain/FldFile";
import { parseFldFile } from "../../domain/parseFldFile";

interface FldMapContextProps {
    fldFile: FldFile | null;
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

export const FldMapContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [fldFile, setFldFile] = useState<FldFile | null>(null);

    async function tryUseFldFile(file: File) {
        const result = await parseFldFile(file);
        setFldFile(result);
    }

    const contextValue = useMemo(() => {
        return { fldFile, setFldFile, tryUseFldFile };
    }, [fldFile, setFldFile, tryUseFldFile]);

    return <FldMapContext.Provider value={contextValue}>{children}</FldMapContext.Provider>;
};
