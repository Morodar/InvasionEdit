import { useContext } from "react";
import { FldMapContext, FldMapContextProps } from "./FldMapContext";

export const useFldMapContext = (): FldMapContextProps => {
    const context = useContext(FldMapContext);
    if (!context) {
        throw new Error("FldMapContext not initialized");
    }
    return context;
};
