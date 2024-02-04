/* eslint-disable react-refresh/only-export-components */
import { Point3D } from "../../../../domain/fld/MapLayer";
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useContext, useMemo, useState } from "react";

export interface CursorContextProps {
    // state
    selectedPoint?: Point3D;
    hoveredPoint?: Point3D;
    meshPoint?: Point3D;
    // functions
    setSelectedPoint: Dispatch<SetStateAction<Point3D | undefined>>;
    setHoveredPoint: Dispatch<SetStateAction<Point3D | undefined>>;
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

export const CursorContexProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [selectedPoint, setSelectedPoint] = useState<Point3D>();
    const [hoveredPoint, setHoveredPoint] = useState<Point3D>();
    const [meshPoint, setMeshPoint] = useState<Point3D>();

    const contextValue: CursorContextProps = useMemo(() => {
        return { selectedPoint, hoveredPoint, meshPoint, setSelectedPoint, setHoveredPoint, setMeshPoint };
    }, [hoveredPoint, meshPoint, selectedPoint]);

    return <CursorContext.Provider value={contextValue}>{children}</CursorContext.Provider>;
};
