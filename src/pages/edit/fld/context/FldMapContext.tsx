import { createContext } from "react";
import { FldFile } from "../../../../domain/fld/FldFile";
import { ResourceDefinition } from "../../../../domain/fld/ResourceLayerUtil";

export interface FldMapContextProps {
    // state
    fldFile: FldFile | null;
    resourceLayer: ResourceDefinition | null;
    // functions
    setFldFile: React.Dispatch<React.SetStateAction<FldFile | null>>;
    tryUseFldFile: (file: File) => void;
}

export const FldMapContext = createContext<FldMapContextProps | undefined>(undefined);
