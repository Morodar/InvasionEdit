import { readFile } from "../../common/utils/readFile";
import { HeaderUtils } from "../HeaderUtils";
import { buildLevelDatPckFileEntry, LevelPck } from "../pck/level/LevelPck";
import { LevelFile, LevelEntry as LevelEntry, LEVEL_ENTRY_SIZE } from "./LevelFile";
import packageJson from "../../../package.json";
import { PckFileEntry, pckFileEntryToPckEntryBytes } from "../pck/PckFileEntry";
import { buildFldPckFileEntry } from "../fld/FldUtils";
import { buildLevPckFileEntry } from "../lev/LevUtils";

export class LevelUtils extends HeaderUtils {
    constructor(dataView: DataView) {
        super(dataView);
    }

    static parseLevelFile = async (file: File): Promise<LevelFile> => parseLevelFile(file);
    static buildLevelFile = (levelPck: LevelPck): File => buildLevelPckFile(levelPck);
}

async function parseLevelFile(file: File): Promise<LevelFile> {
    const levelFile: ArrayBuffer = await readFile(file);
    const view = new DataView(levelFile);
    const util = new LevelUtils(view);

    const levels: LevelEntry[] = [];
    for (let offset = 0; offset + LEVEL_ENTRY_SIZE <= file.size; offset += LEVEL_ENTRY_SIZE) {
        const entry = parseLevelEntry(offset, util);
        levels.push(entry);
    }

    return { fileName: file.name, levels };
}

function parseLevelEntry(offset: number, util: LevelUtils): LevelEntry {
    return {
        name: util.readString(offset + 0x00, 0x40),
        fromPlayers: util.readString(offset + 0x040, 4),
        toPlayers: util.readString(offset + 0x048, 4),
        planetName: util.getUint32(offset + 0x50),
        difficulty: util.getUint32(offset + 0x60),
        displayNameIndex: util.getUint32(offset + 0x70),
        mapSize: util.getUint32(offset + 0x80),
        creationTime: util.readString(offset + 0xc0, 0x30),
        a: util.getUint32(offset + 0x0f0),
        b: util.getUint32(offset + 0x0f4),
        c: util.getUint32(offset + 0x0f8),
        d: util.getUint32(offset + 0x0fc),
    };
}

function buildLevelPckFile(levelPck: LevelPck): File {
    const files: PckFileEntry[] = [];
    // build level.dat
    files.push(buildLevelDatPckFileEntry(levelPck));

    // build level files (lev and fld)
    for (const level of levelPck.levels) {
        files.push(buildLevPckFileEntry(level.lev));
        files.push(buildFldPckFileEntry(level.fld));
    }

    // bundle remaining files
    files.push(...levelPck.remainingFiles);

    // add pck entry headers (in binary form)
    const fileCount = files.length;
    const filePckEntries = files.map((file) => pckFileEntryToPckEntryBytes(file));

    // determine full pck file size (relevant for pck header)
    const fileSize = 512 + filePckEntries.reduce((sizes, file) => sizes + file.byteLength, 0);

    // build pck header
    const pckHeader = new ArrayBuffer(512);
    const pckHeaderView = new DataView(pckHeader);
    const utils = new HeaderUtils(pckHeaderView);

    // write "pck"
    utils.writeUint32(0x00, 7037808);
    // write fileSize
    utils.writeUint32(0x04, fileSize);
    // write magic bytes
    utils.writeUint32(0x08, 1);
    utils.writeUint32(0x0e, 1);

    // write time stamps
    const now = new Date();
    utils.writeDateVariant1(0x10, now);
    utils.writeDateVariant1(0x18, now);
    utils.writeDateVariant1(0x20, now);

    // write pcName1 + pcName2 (use "InvasionEdit + version" as pcName)
    const pcName = `Invasion Edit - ${packageJson.version}`;
    utils.writeString(0x30, pcName);
    utils.writeString(0x70, pcName);

    // write fileCount
    utils.writeUint32(0xb0, fileCount);

    // glue pck header and all pck entries together
    return new File([pckHeader, ...filePckEntries], levelPck.filename);
}
