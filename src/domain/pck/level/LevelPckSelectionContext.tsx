/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Level } from "../../level/Level";
import { useEditLevelContext } from "../../../pages/edit/level/EditLevelContext";
import { useFldMapContext } from "../../fld/FldMapContext";
import { useLevContext } from "../../lev/LevContext";
import { LevelPck } from "./LevelPck";

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
    const { levelPck, setLevelPck } = useEditLevelContext();
    const { fldFile, dispatch: fldDispatch } = useFldMapContext();
    const { levFile, dispatch: levDispatch } = useLevContext();
    const [selectedLevel, setSelectedLevel] = useState<Level>();

    const selectLevel = useCallback(
        (level: Level) => {
            setSelectedLevel(level);

            // take context state and update levelPck
            setLevelPck((prevPck: LevelPck | undefined) => {
                if (!prevPck || !selectedLevel) {
                    return prevPck;
                }
                const updated: LevelPck = { ...prevPck };

                const levelIndex = levelPck?.levels.indexOf(selectedLevel) ?? -1;
                if (levelIndex === -1 || !levFile || !fldFile) {
                    return updated;
                }
                updated.levels[levelIndex] = {
                    dat: prevPck.levels[levelIndex].dat,
                    fld: fldFile,
                    lev: levFile,
                };

                return updated;
            });

            // update context state
            fldDispatch({ type: "SET_FLD", fldFile: level.fld });
            levDispatch({ type: "SET_LEV", levFile: level.lev });
        },
        [fldDispatch, fldFile, levDispatch, levFile, levelPck?.levels, selectedLevel, setLevelPck],
    );

    useEffect(() => {
        if (levelPck && !selectedLevel && levelPck.levels.length > 0) {
            const level = levelPck.levels[0];
            selectLevel(level);
        } else if (!levelPck) {
            setSelectedLevel(undefined);
        }
    }, [fldDispatch, levelPck, selectLevel, selectedLevel]);

    const value: LevelPckSelectionContextProps = useMemo(
        () => ({ selectedLevel, selectLevel }),
        [selectLevel, selectedLevel],
    );

    return <LevelPckSelectionContext.Provider value={value}>{children}</LevelPckSelectionContext.Provider>;
};
