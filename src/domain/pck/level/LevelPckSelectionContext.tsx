/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Level } from "../../level/Level";
import { useEditLevelContext } from "../../../pages/edit/level/EditLevelContext";
import { useFldMapContext } from "../../fld/FldMapContext";

export interface LevelPckSelectionContextProps {
    selectedLevel?: Level;
    selectLevel: (level: Level) => void;
}

export const LevelPckSelectionContext = createContext<LevelPckSelectionContextProps | undefined>(undefined);

export const useLevelPckSelectionContext = (): LevelPckSelectionContextProps => {
    const context = useContext(LevelPckSelectionContext);
    if (!context) {
        throw new Error("LevelPckSelectionContext not initialized");
    }
    return context;
};

export const LevelPckSelectionContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const { levelPck } = useEditLevelContext();
    const { dispatch } = useFldMapContext();
    const [selectedLevel, setSelectedLevel] = useState<Level>();

    const selectLevel = useCallback(
        (level: Level) => {
            setSelectedLevel(level);
            dispatch({ type: "SET_FLD", fldFile: level.fld });
        },
        [dispatch],
    );

    useEffect(() => {
        if (levelPck && !selectedLevel && levelPck.levels.length > 0) {
            const level = levelPck.levels[0];
            selectLevel(level);
        } else if (!levelPck) {
            setSelectedLevel(undefined);
        }
    }, [dispatch, levelPck, selectLevel, selectedLevel]);

    const value: LevelPckSelectionContextProps = useMemo(
        () => ({ selectedLevel, selectLevel }),
        [selectLevel, selectedLevel],
    );

    return <LevelPckSelectionContext.Provider value={value}>{children}</LevelPckSelectionContext.Provider>;
};
