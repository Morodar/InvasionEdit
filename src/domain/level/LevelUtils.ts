import { HeaderUtils } from "../HeaderUtils";
import { LevelFile, LevelEntry as LevelEntry, LEVEL_ENTRY_SIZE } from "./LevelFile";

export class LevelUtils extends HeaderUtils {
    constructor(dataView: DataView) {
        super(dataView);
    }

    static parseLevelFile = async (file: File): Promise<LevelFile> => parseLevelFile(file);
}

async function parseLevelFile(file: File): Promise<LevelFile> {
    const levelFile: ArrayBuffer = await file.arrayBuffer();
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
