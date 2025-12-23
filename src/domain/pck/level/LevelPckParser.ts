import { CgnFile } from "../../cgn/Camgaign";
import { CgnUtils } from "../../cgn/CgnUtils";
import { Difficulty } from "../../constants/Difficulty";
import { MapSize } from "../../constants/MapSize";
import { PlanetName } from "../../constants/PlanetName";
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
        // Invasion Edit can't handle all file types (yet).
        // - Therefore, we keep track of used pck files which we modify.
        // - We write modified files when exporting pck.
        // - We keep track of unused files to write them back "as is" when exporting the pck.
        const usedFiles: PckFileEntry[] = [];

        // first, extract levels from level.dat
        const { levelEntries, usedEntries: usedLevelEntries } = await extractLevelEntries(pckFiles);
        usedFiles.push(...usedLevelEntries);

        // second, we extract cgn files and treat them as level files
        const { levelEntries: cgnLevelEntries } = await extractCampaignLevelEntriesAsLevelEntries(pckFiles);
        levelEntries.push(...cgnLevelEntries);

        const levelNameToLevelEntry: Map<string, LevelEntry> = buildNameToEntryMap(levelEntries);

        // based on level entries, we extract fld files
        const { levelToFld, usedEntries: usedFldEntries } = await extractFldFiles(pckFiles, levelNameToLevelEntry);
        usedFiles.push(...usedFldEntries);

        // based on level entries, we also extract lev files
        const { levelToLev, usedEntries: usedLevEntries } = await extractLevFiles(pckFiles, levelNameToLevelEntry);
        usedFiles.push(...usedLevEntries);

        // levelEntry + fld + lev = Level objet
        const levels = buildLevelArray(levelEntries, levelToFld, levelToLev);

        // determine remainingFiles which will be pushed back to pck "as is"
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

const CGNS_TO_EXTRACT = ["level\\hansolo.cgn", "level\\luke.cgn", "level\\nimm2.cgn"];

async function extractCampaignLevelEntriesAsLevelEntries(pckEntries: PckFileEntry[]): Promise<LevelEntryResult> {
    const levels: LevelEntry[] = [];
    // we keep the used files empty because we don't touch the cgn files.
    const usedFiles: PckFileEntry[] = [];

    for (const entry of pckEntries) {
        if (CGNS_TO_EXTRACT.includes(entry.name)) {
            const file = pckFileEntryToFile(entry);
            const cgn = await CgnUtils.parseCgnFile(file);
            const entries = createLevelEntryOfCgn(cgn);
            levels.push(...entries);
        }
    }
    return { levelEntries: levels, usedEntries: usedFiles };
}

function createLevelEntryOfCgn(cgn: CgnFile): LevelEntry[] {
    const levels: LevelEntry[] = [];
    const creationTime = new Date().toLocaleDateString();
    for (const cgnLevel of cgn.levelEntries) {
        levels.push({
            name: cgnLevel.name + ".",
            fromPlayers: cgn.campaign.fromPlayers + "-" + cgn.campaign.toPlayers,
            toPlayers: String(cgnLevel.missionIndex),
            planetName: PlanetName.Golkarath,
            difficulty: Difficulty.Easy,
            a: 0,
            b: 0,
            c: 0,
            d: 0,
            displayNameIndex: cgn.campaign.mapTextIndex,
            mapSize: MapSize.Large,
            creationTime,
        });
    }
    return levels;
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
