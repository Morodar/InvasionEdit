/* eslint-disable react-refresh/only-export-components */
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useState } from "react";
import { Owner } from "../../constants/Owner";

export interface PlaceEntityContextProps {
    placingEntity: number | undefined;
    setPlacingEntity: Dispatch<SetStateAction<number | undefined>>;

    owner: Owner;
    setOwner: Dispatch<SetStateAction<Owner>>;

    rotation: number;
    setRotation: Dispatch<SetStateAction<Owner>>;
}

export const PlaceEntityContext = createContext<PlaceEntityContextProps | undefined>(undefined);

export const usePlaceEntityContext = (): PlaceEntityContextProps => {
    const context = useContext(PlaceEntityContext);
    if (!context) {
        throw new Error("PlaceEntityContext not initialized");
    }
    return context;
};

export const PlaceEntityContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [rotation, setRotation] = useState<number>(0);
    const [placingEntity, setPlacingEntity] = useState<number>();
    const [owner, setOwner] = useState<Owner>(Owner.Ares);

    const contextValue: PlaceEntityContextProps = useMemo(
        () => ({ placingEntity, setPlacingEntity, owner, setOwner, rotation, setRotation }),
        [owner, placingEntity, rotation],
    );
    return <PlaceEntityContext.Provider value={contextValue}>{children}</PlaceEntityContext.Provider>;
};
