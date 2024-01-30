import { createContext } from "react";
import { FldFile } from "../../domain/FldFile";

export interface FldMapContextProps {
    fldFile: FldFile | null;
    setFldFile: React.Dispatch<React.SetStateAction<FldFile | null>>;
    tryUseFldFile: (file: File) => void;
}

export const FldMapContext = createContext<FldMapContextProps | undefined>(undefined);
