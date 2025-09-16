import { Dispatch, PropsWithChildren, SetStateAction, createContext, useContext, useState } from "react";
import { LevEntity } from "../LevEntity";

/* eslint-disable react-refresh/only-export-components */
export interface SelectedEntityContextProps {
    selectedEntity: LevEntity | undefined;
    setSelectedEntity: Dispatch<SetStateAction<LevEntity | undefined>>;
}

export const SelectedEntityContext = createContext<SelectedEntityContextProps | undefined>(undefined);

export const useSelectedEntityContext = (): SelectedEntityContextProps => {
    const context = useContext(SelectedEntityContext);
    if (!context) {
        throw new Error("SelectedEntityContext not initialized");
    }
    return context;
};

export const SelectedEntityContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [selectedEntity, setSelectedEntity] = useState<LevEntity>();

    const contextValue: SelectedEntityContextProps = {
        selectedEntity,
        setSelectedEntity,
    };
    return <SelectedEntityContext.Provider value={contextValue}>{children}</SelectedEntityContext.Provider>;
};
