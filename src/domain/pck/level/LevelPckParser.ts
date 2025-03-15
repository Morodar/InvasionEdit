import { FldFile } from "../../fld/FldFile";
import { FldUtils } from "../../fld/FldUtils";
import { LevFile } from "../../lev/LevFile";
import { LevUtils } from "../../lev/LevUtils";
import { Level } from "../../level/Level";
import { LevelEntry } from "../../level/LevelFile";
import { LevelUtils } from "../../level/LevelUtils";
import { PckFileEntry, pckFileEntryToFile } from "../PckFileEntry";
import { parsePckFile } from "../PckParser";
import { LevelPck } from "./LevelPck";

interface UsedPckEntries {
    usedEntries: PckFileEntry[];
}

export class LevelPckParser {
    static async parseLevelPck(file: File): Promise<LevelPck> {
        const pck = await parsePckFile(file);
        const pckFiles: PckFileEntry[] = [...pck.pckFileEntries];
        const usedFiles: PckFileEntry[] = [];

        const { levelEntries, usedEntries: usedLevelEntries } = await extractLevelEntries(pckFiles);
        const levelNameToLevelEntry: Map<string, LevelEntry> = buildNameToEntryMap(levelEntries);
        usedFiles.push(...usedLevelEntries);

        const { levelToFld, usedEntries: usedFldEntries } = await extractFldFiles(pckFiles, levelNameToLevelEntry);
        usedFiles.push(...usedFldEntries);

        const { levelToLev, usedEntries: usedLevEntries } = await extractLevFiles(pckFiles, levelNameToLevelEntry);
        usedFiles.push(...usedLevEntries);

        const levels = buildLevelArray(levelEntries, levelToFld, levelToLev);
        const remainingFiles = determineRemainingFiles(pckFiles, usedFiles);
        return { filename: pck.filename, levels, remainingFiles };
    }
}

function buildNameToEntryMap(levelEntries: LevelEntry[]): Map<string, LevelEntry> {
    return levelEntries.reduce((map, v) => {
        map.set(v.name, v);
        return map;
    }, new Map<string, LevelEntry>());
}

function determineRemainingFiles(allFiles: PckFileEntry[], usedFiles: PckFileEntry[]): PckFileEntry[] {
    const remainingFiles: PckFileEntry[] = [];
    allFiles.forEach((file) => {
        if (!usedFiles.includes(file)) {
            remainingFiles.push(file);
        }
    });
    return remainingFiles;
}

type LevelEntryResult = UsedPckEntries & { levelEntries: LevelEntry[] };

async function extractLevelEntries(pckEntries: PckFileEntry[]): Promise<LevelEntryResult> {
    const levels: LevelEntry[] = [];
    const usedFiles: PckFileEntry[] = [];

    for (const entry of pckEntries) {
        if (
            entry.name.endsWith(".dat") &&
            !entry.name.startsWith("campagne") &&
            !entry.name.startsWith("level\\campagne")
        ) {
            const file = pckFileEntryToFile(entry);
            const levelFile = await LevelUtils.parseLevelFile(file);
            levels.push(...levelFile.levels);
            usedFiles.push(entry);
        }
    }

    return { levelEntries: levels, usedEntries: usedFiles };
}

type FldLevels = UsedPckEntries & { levelToFld: Map<LevelEntry, FldFile> };

async function extractFldFiles(
    pckEntries: PckFileEntry[],
    levelNameToLevelEntry: Map<string, LevelEntry>,
): Promise<FldLevels> {
    const levelToFld = new Map<LevelEntry, FldFile>();
    const usedEntries: PckFileEntry[] = [];

    for (const entry of pckEntries) {
        if (entry.fileType == 6581350) {
            const file = pckFileEntryToFile(entry);
            const fld = await FldUtils.parseFldFile(file);
            const fileName = fld.name.replace("level\\", "").replace(".fld", ".");
            const levelEntry = levelNameToLevelEntry.get(fileName);
            if (levelEntry) {
                levelToFld.set(levelEntry, fld);
                usedEntries.push(entry);
            }
        }
    }

    return { levelToFld, usedEntries };
}

type LevLevels = UsedPckEntries & { levelToLev: Map<LevelEntry, LevFile> };

async function extractLevFiles(
    pckEntries: PckFileEntry[],
    levelNameToLevelEntry: Map<string, LevelEntry>,
): Promise<LevLevels> {
    const levelToLev = new Map<LevelEntry, LevFile>();
    const usedEntries: PckFileEntry[] = [];

    for (const entry of pckEntries) {
        if (entry.fileType == 7759212) {
            const fileName = entry.name.replace("level\\", "").replace(".lev", ".");
            const levelEntry = levelNameToLevelEntry.get(fileName);
            if (levelEntry) {
                const file = pckFileEntryToFile(entry);
                const lev = await LevUtils.parseLevFile(file);
                levelToLev.set(levelEntry, lev);
                usedEntries.push(entry);
            }
        }
    }

    return { levelToLev, usedEntries };
}

function buildLevelArray(
    levelEntries: LevelEntry[],
    levelToFld: Map<LevelEntry, FldFile>,
    levelToLev: Map<LevelEntry, LevFile>,
): Level[] {
    const levels: Level[] = [];
    for (const level of levelEntries) {
        const fld = levelToFld.get(level);
        const lev = levelToLev.get(level);
        if (fld && lev) {
            levels.push({ dat: level, fld, lev });
        }
    }
    return levels;
}
