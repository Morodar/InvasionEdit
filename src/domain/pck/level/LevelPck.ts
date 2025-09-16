import { HeaderUtils } from "../../HeaderUtils";
import { Level } from "../../level/Level";
import { PckFileEntry } from "../PckFileEntry";

export interface LevelPck {
    filename: string;
    levels: Level[];
    remainingFiles: PckFileEntry[];
}

export function buildLevelDatPckFileEntry(levelFile: LevelPck): PckFileEntry {
    const levelDatFile = buildLevelDatBytes(levelFile);
    return {
        name: "level\\level.dat",
        unpackedSize: levelDatFile.byteLength,
        fileType: 6619240,
        packedSize: levelDatFile.byteLength,
        dataFormat: 1,
        newSize: 0,
        dataBytes: new DataView(levelDatFile),
    };
}

function buildLevelDatBytes(levelFile: LevelPck): ArrayBuffer {
    const levels = levelFile.levels;
    const fileSize = levels.length * 0x100;
    const file = new ArrayBuffer(fileSize);
    const fileView = new DataView(file);
    const fileUtils = new HeaderUtils(fileView);
    let offset = 0;
    for (const level of levelFile.levels) {
        offset = writeLevelDatBytes(offset, fileUtils, level);
    }

    return file;
}

function writeLevelDatBytes(offset: number, fileUtils: HeaderUtils, level: Level): number {
    const entry = level.dat;
    fileUtils.writeString(offset, entry.name);
    offset += 0x40;
    fileUtils.writeString(offset, entry.fromPlayers);
    offset += 0x08;
    fileUtils.writeString(offset, entry.fromPlayers);
    offset += 0x08;
    fileUtils.writeUint32(offset, entry.planetName);
    offset += 0x10;
    fileUtils.writeUint32(offset, entry.difficulty);
    offset += 0x10;
    fileUtils.writeUint32(offset, entry.displayNameIndex);
    offset += 0x10;
    fileUtils.writeUint32(offset, entry.mapSize);
    offset += 0x40;
    const timestamp: string = new Date().toISOString();
    fileUtils.writeString(offset, timestamp);
    offset += 0x30;
    fileUtils.writeUint32(offset, entry.a);
    offset += 0x04;
    fileUtils.writeUint32(offset, entry.b);
    offset += 0x04;
    fileUtils.writeUint32(offset, entry.c);
    offset += 0x04;
    fileUtils.writeUint32(offset, entry.d);
    offset += 0x04;
    return offset;
}
