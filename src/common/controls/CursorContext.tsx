/* eslint-disable react-refresh/only-export-components */
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useContext, useMemo, useState } from "react";
import { Point3D } from "../../domain/fld/FldFile";

export interface CursorContextProps {
    // state
    hoveredPoint?: number;
    meshPoint?: Point3D;
    rawPoint?: Point3D;
    // functions
    setHoveredPoint: Dispatch<SetStateAction<number | undefined>>;
    setMeshPoint: Dispatch<SetStateAction<Point3D | undefined>>;
    setRawPoint: Dispatch<SetStateAction<Point3D | undefined>>;
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
    const [hoveredPoint, setHoveredPoint] = useState<number>();
    const [meshPoint, setMeshPoint] = useState<Point3D>();
    const [rawPoint, setRawPoint] = useState<Point3D>();

    const contextValue: CursorContextProps = useMemo(() => {
        return { hoveredPoint, meshPoint, rawPoint, setHoveredPoint, setMeshPoint, setRawPoint };
    }, [hoveredPoint, meshPoint, rawPoint]);

    return <CursorContext.Provider value={contextValue}>{children}</CursorContext.Provider>;
};
