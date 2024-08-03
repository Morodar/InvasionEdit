import { readFile } from "../../common/utils/readFile";
import { HeaderUtils } from "../HeaderUtils";
import { LevEntity } from "./LevEntity";
import { LevFile } from "./LevFile";

export class LevUtils extends HeaderUtils {
    constructor(dataView: DataView) {
        super(dataView);
    }

    readMdls(): string[] {
        const result: string[] = [];
        const mdlLenght = 64;
        for (let i = 0; i < 53; i++) {
            const fromIndex = 0x800 + i * mdlLenght;
            result.push(this.readString(fromIndex, mdlLenght));
        }
        return result;
    }

    readEntities(count: number): LevEntity[] {
        const result: LevEntity[] = [];
        for (let i = 0; i < count; i++) {
            const fromIndex = 0x1540 + i * 32;
            result.push(this.readEntity(fromIndex));
        }
        return result;
    }

    readEntity(index: number): LevEntity {
        return {
            type: this.getUint32(index),
            owner: this.getUint32(index + 4),
            x: this.getInt32(index + 8),
            z: this.getInt32(index + 12),
            rotation: this.getInt32(index + 16),
        };
    }

    static parseLevFile = async (file: File): Promise<LevFile> => parseLevFile(file);
}

async function parseLevFile(file: File): Promise<LevFile> {
    const content: ArrayBuffer = await readFile(file);
    const view = new DataView(content);
    const util = new LevUtils(view);
    const entityCount = util.getUint32(0x0d8);
    return {
        name: file.name,
        fileSize: util.getUint32(0x04),
        pcName1: util.readPcName(0x30),
        pcName2: util.readPcName(0x70),
        levelName: util.readString(0x100, 0x40),
        fromPlayers: util.readString(0x140, 4),
        toPlayers: util.readString(0x148, 4),
        planetName: util.getUint32(0x150),
        mapSize: util.getUint32(0x180),
        entityCount: entityCount,
        mdls: util.readMdls(),
        entities: util.readEntities(entityCount),
    };
}
