/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useCallback, useContext, useState } from "react";

export interface EditLevelContextProps {
    hasFile: boolean;
    parsePckFile: (file?: File) => Promise<void>;
}

export const EditLevelContext = createContext<EditLevelContextProps | undefined>(undefined);

export const useEditLevelContext = (): EditLevelContextProps => {
    const context = useContext(EditLevelContext);
    if (!context) {
        throw new Error("EditLevelContext not initialized");
    }
    return context;
};

export const EditLevelContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [parseError, setParseError] = useState<string>();

    const handleFileChanged = useCallback(async (file?: File) => {
        if (!file) {
            return;
        }
        try {
        } catch {
            setParseError("failed to parse file");
        }
    }, []);

    const value: EditLevelContextProps = { hasFile: false, parsePckFile: handleFileChanged };

    return <EditLevelContext.Provider value={value}>{children}</EditLevelContext.Provider>;
};
