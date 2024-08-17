import { Difficulty } from "../constants/Difficulty";
import { MapSize } from "../constants/MapSize";
import { PlanetName } from "../constants/PlanetName";
import { HeaderUtils } from "../HeaderUtils";

export const LEVEL_ENTRY_SIZE = 0x100;

export interface LevelEntry {
    name: string;
    fromPlayers: string;
    toPlayers: string;
    planetName: PlanetName;
    difficulty: Difficulty;
    displayNameIndex: number;
    mapSize: MapSize;
    creationTime: string;

    /** Unknown 0xF0 */
    a: number;
    /** Unknown 0xF4 */
    b: number;
    /** Unknown 0xF8 */
    c: number;
    /** Unknown 0xFC */
    d: number;
}

export interface LevelFile {
    fileName: string;
    levels: LevelEntry[];
}

function buildLevelDatBytes(levelFile: LevelFile): ArrayBuffer {
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

function writeLevelDatBytes(offset: number, fileUtils: HeaderUtils, entry: LevelEntry): number {
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
