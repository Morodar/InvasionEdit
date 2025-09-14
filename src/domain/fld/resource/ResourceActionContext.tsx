/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useContext, useState } from "react";

export type ActiveResource = "DELETE" | "XENIT" | "TRITIUM";

export interface ResourceActionContextProps {
    // state
    activeResource: ActiveResource;
    size: number;

    // functions
    setActiveResource: (value: ActiveResource) => void;
    setSize: (value: number) => void;
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
    const [size, setSize] = useState<number>(1);

    const contextValue = {
        activeResource,
        size,
        setSize,
        setActiveResource,
    };

    return <ResourceActionContext.Provider value={contextValue}>{children}</ResourceActionContext.Provider>;
};
