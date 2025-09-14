/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { Level } from "../../level/Level";
import { useEditLevelContext } from "../../../pages/edit/level/EditLevelContext";
import { useFldMapContext } from "../../fld/FldMapContext";
import { useLevContext } from "../../lev/LevContext";
import { LevelPck } from "./LevelPck";
import { useCallback } from "react";

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
    const [selectedLevelIndex, setSelectedLevelIndex] = useState<number>();
    const selectedLevel = levelPck?.levels.at(selectedLevelIndex ?? 0);

    const selectLevel = useCallback(
        (level: Level) => {
            const levelIndex = levelPck?.levels.indexOf(level);
            setSelectedLevelIndex(levelIndex);
            fldDispatch({ type: "SET_FLD", fldFile: level.fld });
            levDispatch({ type: "SET_LEV", levFile: level.lev });
        },
        [fldDispatch, levDispatch, levelPck?.levels],
    );

    useEffect(() => {
        // select first level when levelPck changes
        if (levelPck && selectedLevelIndex == undefined && levelPck.levels.length > 0) {
            const firstLevel = levelPck.levels[0];
            selectLevel(firstLevel);
            setSelectedLevelIndex(0);
        } else if (!levelPck) {
            setSelectedLevelIndex(undefined);
        }
    }, [levelPck, selectLevel, selectedLevelIndex]);

    useEffect(() => {
        if (selectedLevelIndex == undefined || levFile == undefined) {
            return;
        }
        // sync lev changes
        setLevelPck((pck) => {
            if (pck && pck.levels[selectedLevelIndex].lev !== levFile) {
                const updated: LevelPck = { ...pck };
                updated.levels[selectedLevelIndex].lev = levFile;
                return updated;
            } else {
                return pck;
            }
        });
    }, [levFile, selectedLevelIndex, setLevelPck]);

    useEffect(() => {
        if (selectedLevelIndex == undefined || fldFile == undefined) {
            return;
        }
        // sync fld changes
        setLevelPck((pck) => {
            if (pck && pck.levels[selectedLevelIndex].fld !== fldFile) {
                const updated: LevelPck = { ...pck };
                updated.levels[selectedLevelIndex].fld = fldFile;
                return updated;
            } else {
                return pck;
            }
        });
    }, [fldFile, selectedLevelIndex, setLevelPck]);

    const value: LevelPckSelectionContextProps = {
        selectedLevel,
        selectLevel,
    };

    return <LevelPckSelectionContext.Provider value={value}>{children}</LevelPckSelectionContext.Provider>;
};
