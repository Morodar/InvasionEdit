/* eslint-disable react-refresh/only-export-components */
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useContext, useMemo, useState } from "react";
import { Point3D } from "../../../../domain/fld/FldFile";

export interface CursorContextProps {
    // state
    selectedPoint?: number;
    hoveredPoint?: number;
    meshPoint?: Point3D;
    // functions
    setSelectedPoint: Dispatch<SetStateAction<number | undefined>>;
    setHoveredPoint: Dispatch<SetStateAction<number | undefined>>;
    setMeshPoint: Dispatch<SetStateAction<Point3D | undefined>>;
}

export const CursorContext = createContext<CursorContextProps | undefined>(undefined);

export const useCursorContext = (): CursorContextProps => {
    const context = useContext(CursorContext);
    if (!context) {
        throw new Error("CursorContext not initialized");
    }
    return context;
};

export const CursorContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [selectedPoint, setSelectedPoint] = useState<number>();
    const [hoveredPoint, setHoveredPoint] = useState<number>();
    const [meshPoint, setMeshPoint] = useState<Point3D>();

    const contextValue: CursorContextProps = useMemo(() => {
        return { selectedPoint, hoveredPoint, meshPoint, setSelectedPoint, setHoveredPoint, setMeshPoint };
    }, [hoveredPoint, meshPoint, selectedPoint]);

    return <CursorContext.Provider value={contextValue}>{children}</CursorContext.Provider>;
};
