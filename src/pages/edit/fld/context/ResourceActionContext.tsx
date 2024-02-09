/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useContext, useMemo, useState } from "react";
import { useSizeSelection } from "../hooks/useSizeSelection";

export type ActiveResource = "DELETE" | "XENIT" | "TRITIUM";

export interface ResourceActionContextProps {
    // state
    activeResource: ActiveResource;
    size: number;
    upperLimitReached: boolean;
    lowerLimitReached: boolean;

    // functions
    setActiveResource: (value: ActiveResource) => void;
    updateSize: (value: number) => void;
    incrementBy: (delta: number) => void;
}

export const ResourceActionContext = createContext<ResourceActionContextProps | undefined>(undefined);

export const useResourceActionContext = (): ResourceActionContextProps => {
    const context = useContext(ResourceActionContext);
    if (!context) {
        throw new Error("ResourceActionContext not initialized");
    }
    return context;
};

export const ResourceActionContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [activeResource, setActiveResource] = useState<ActiveResource>("XENIT");
    const { size, upperLimitReached, lowerLimitReached, updateSize, incrementBy } = useSizeSelection(1, 64);
    const contextValue = useMemo(() => {
        return {
            activeResource,
            size,
            upperLimitReached,
            lowerLimitReached,
            updateSize,
            incrementBy,
            setActiveResource,
        };
    }, [activeResource, incrementBy, lowerLimitReached, size, updateSize, upperLimitReached]);

    return <ResourceActionContext.Provider value={contextValue}>{children}</ResourceActionContext.Provider>;
};
