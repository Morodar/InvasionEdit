import { readFile } from "../../common/utils/readFile";
import { HeaderUtils } from "../HeaderUtils";
import { PckFileEntry } from "../pck/PckFileEntry";
import { LevEntity } from "./LevEntity";
import { LevFile } from "./LevFile";
import {
    isLevPlayerMetaEmpty,
    LEV_PLAYER_META_OFFSET,
    LEV_PLAYER_META_SIZE,
    LevPlayerMeta,
    ZOOM_LEVEL,
} from "./LevPlayerMeta";
import { LevRGBA } from "./LevRGBA";

const mdlLenght = 64;

export class LevUtils extends HeaderUtils {
    constructor(dataView: DataView) {
        super(dataView);
    }

    readMdls(): string[] {
        const result: string[] = [];
        for (let i = 0; i < 53; i++) {
            const fromIndex = 0x800 + i * mdlLenght;
            result.push(this.readString(fromIndex, mdlLenght));
        }
        return result;
    }

    writeMdls(mdls: string[]) {
        for (let i = 0; i < mdls.length; i++) {
            const fromIndex = 0x800 + i * mdlLenght;
            this.writeString(fromIndex, mdls[i]);
        }
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

    writeEntities(entities: LevEntity[]) {
        for (let i = 0; i < entities.length; i++) {
            const index = 0x1540 + i * 0x20;
            this.writeEntity(index, entities[i]);
        }
    }

    writeEntity(index: number, entity: LevEntity) {
        this.writeUint32(index, entity.type);
        this.writeUint32(index + 4, entity.owner);
        this.writeUint32(index + 8, entity.x);
        this.writeUint32(index + 12, entity.z);
        this.writeUint32(index + 16, entity.rotation);
    }

    readLevPlayerMetas(): LevPlayerMeta[] {
        const result: LevPlayerMeta[] = [];
        for (let i = 0; i < 7; i++) {
            const offset = LEV_PLAYER_META_OFFSET + i * LEV_PLAYER_META_SIZE;
            const meta = this.readLevPlayerMeta(offset);
            if (!isLevPlayerMetaEmpty(meta)) {
                result.push(meta);
            }
        }
        return result;
    }

    readLevPlayerMeta(index: number): LevPlayerMeta {
        return {
            camX: this.getUint32(index),
            camZ: this.getUint32(index + 4),
            camY: this.getUint32(index + 8),
            zoomLevel: this.getUint32(index + 12),
            camRotation: this.getUint32(index + 16),
            startXenit: this.getUint32(index + 20),
            startTritium: this.getUint32(index + 24),
            armyOffset: this.getUint32(index + 28),
        };
    }

    writeLevPlayerMetas(metas: LevPlayerMeta[]) {
        for (let i = 0; i < metas.length; i++) {
            const index = 0x200 + i * 0x20;
            this.writeLevPlayerMeta(index, metas[i]);
        }
    }

    writeLevPlayerMeta(index: number, meta: LevPlayerMeta) {
        this.writeUint32(index, meta.camX);
        this.writeUint32(index + 4, meta.camZ);
        this.writeUint32(index + 8, meta.camY);

        // this.writeUint32(index + 12, meta.zoomLevel);
        this.writeUint32(index + 12, ZOOM_LEVEL);
        this.writeUint32(index + 16, meta.camRotation);
        this.writeUint32(index + 20, meta.startXenit);
        this.writeUint32(index + 24, meta.startTritium);
        this.writeUint32(index + 28, meta.armyOffset);
    }

    readRGBA(index: number): LevRGBA {
        return {
            r: this.getUint8(index++),
            g: this.getUint8(index++),
            b: this.getUint8(index++),
            a: this.getUint8(index),
        };
    }

    writeRGBA(index: number, rgba: LevRGBA) {
        return {
            r: this.writeUint8(index++, rgba.r),
            g: this.writeUint8(index++, rgba.g),
            b: this.writeUint8(index++, rgba.b),
            a: this.writeUint8(index, rgba.a),
        };
    }
    static parseLevFile = async (file: File): Promise<LevFile> => parseLevFile(file);
}

async function parseLevFile(file: File): Promise<LevFile> {
    const content: ArrayBuffer = await readFile(file);
    const view = new DataView(content);
    const util = new LevUtils(view);
    const entityCount = util.getUint32(0x0d8);

    const playerCount1 = util.getUint32(0x310);
    const playerCount2 = util.getUint32(0x314);
    const playerCount = Math.max(playerCount1, playerCount2);
    return {
        name: file.name,
        fileSize: util.getUint32(0x04),
        pcName1: util.readPcName(0x30),
        pcName2: util.readPcName(0x70),
        levelName: util.readString(0x100, 0x40),
        fromPlayers: util.readString(0x140, 4),
        toPlayers: util.readString(0x148, 4),
        planetName: util.getUint32(0x150),
        difficulty: util.getUint32(0x160),
        mapTextIndex: util.getUint32(0x170),
        mapSize: util.getUint32(0x180),
        entityCount: entityCount,
        mdls: util.readMdls(),
        entities: util.readEntities(entityCount),
        playerCount1: playerCount,
        playerCount2: playerCount,
        playerMeta: util.readLevPlayerMetas(),
        buildingFilter1: util.readRGBA(0x300),
        buildingFilter2: util.readRGBA(0x304),
        environmentFilter1: util.readRGBA(0x308),
        environmentFilter2: util.readRGBA(0x30c),
    };
}

export function buildLevPckFileEntry(levFile: LevFile): PckFileEntry {
    const fileSize = 0x800 + 0x40 * levFile.mdls.length + 0x20 * levFile.entities.length;
    const dest = new ArrayBuffer(fileSize);
    const destView = new DataView(dest);
    const utils = new LevUtils(destView);

    utils.writeUint32(0, 7759212); // "lev"

    // write fileSize
    utils.writeUint32(0x04, fileSize);

    // write magic bytes
    utils.writeUint32(0x08, 1);
    utils.writeUint32(0x0c, 1);
    utils.writeUint32(0x0e, 7);

    // write time stamps
    const now = new Date();
    utils.writeDateVariant1(0x10, now);
    utils.writeDateVariant1(0x18, now);
    utils.writeDateVariant1(0x20, now);

    // write pcName1 + pcName2 (use "InvasionEdit + version" as pcName)
    const pcName = `InvEdit`;
    utils.writeString(0x30, pcName);
    utils.writeString(0x70, pcName);

    // unknown settings (probably offsets to fetch certain information)
    utils.writeUint32(0x0b0, 4800);
    utils.writeUint32(0x0b4, 4864);
    utils.writeUint32(0x0b8, 4928);
    utils.writeUint32(0x0bc, 4992);

    utils.writeUint32(0x0c0, 5056);
    utils.writeUint32(0x0c4, 5120);
    utils.writeUint32(0x0c8, 5184);
    utils.writeUint32(0x0cc, 5376);

    utils.writeUint32(0x0d0, 5248);
    utils.writeUint32(0x0d4, 5312);

    // write entity count
    utils.writeUint32(0xd8, levFile.entities.length);

    // unknown settings (probably offsets to fetch certain information)
    utils.writeUint32(0x0dc, 5440);

    utils.writeUint32(0x0e0, 11);
    utils.writeUint32(0x0e4, 3200);
    utils.writeUint32(0x0e8, 18);
    utils.writeUint32(0x0ec, 2048);

    utils.writeUint32(0x0f0, 10);
    utils.writeUint32(0x0f4, 4160);
    utils.writeUint32(0x0f8, 4);
    utils.writeUint32(0x0fc, 3904);

    // write level file name
    utils.writeString(0x100, levFile.levelName);

    // write general meta information
    utils.writeString(0x140, levFile.fromPlayers);
    utils.writeString(0x148, levFile.toPlayers);
    utils.writeUint32(0x150, levFile.planetName);
    utils.writeUint32(0x160, levFile.difficulty);
    utils.writeUint32(0x170, levFile.mapTextIndex);
    utils.writeUint32(0x180, levFile.mapSize);

    // write player meta info
    utils.writeLevPlayerMetas(levFile.playerMeta);

    // write color filter settings
    utils.writeRGBA(0x300, levFile.buildingFilter1);
    utils.writeRGBA(0x304, levFile.buildingFilter2);
    utils.writeRGBA(0x308, levFile.environmentFilter1);
    utils.writeRGBA(0x30c, levFile.environmentFilter2);

    // unknown settings
    utils.writeUint32(0x2e0, 3691018240);
    utils.writeUint32(0x2e4, 12829635);
    utils.writeUint32(0x2e8, 4281808695);
    utils.writeUint32(0x2ec, 0);

    utils.writeUint32(0x2f0, 3489699840);
    utils.writeUint32(0x2f4, 0);
    utils.writeUint32(0x2f8, 1771410823);
    utils.writeUint32(0x2fc, 0);

    // player count
    utils.writeUint32(0x310, levFile.playerCount1);
    utils.writeUint32(0x314, levFile.playerCount2);

    utils.writeUint32(0x328, 3889176576);
    utils.writeUint32(0x32c, 3627032576);

    utils.writeUint32(0x330, 12829635);
    utils.writeUint32(0x334, 4281808695);
    utils.writeUint32(0x338, 0);
    utils.writeUint32(0x33c, 1771410823);

    utils.writeUint32(0x340, 9539985);
    utils.writeUint32(0x344, 4281413937);
    utils.writeUint32(0x348, 10197915);
    utils.writeUint32(0x34c, 4281413937);

    utils.writeUint32(0x350, 1);
    utils.writeUint32(0x354, 43);
    utils.writeUint32(0x358, 67);
    utils.writeUint32(0x35c, 73);

    utils.writeUint32(0x390, 8);
    utils.writeUint32(0x394, 2);
    utils.writeUint32(0x398, 1);
    utils.writeUint32(0x39c, 0);

    utils.writeUint32(0x3a0, 8);
    utils.writeUint32(0x3a4, 3);
    utils.writeUint32(0x3a8, 1);
    utils.writeUint32(0x3ac, 0);

    utils.writeUint32(0x3b0, 8);
    utils.writeUint32(0x3b4, 4);
    utils.writeUint32(0x3b8, 1);
    utils.writeUint32(0x3bc, 0);

    utils.writeUint32(0x3c0, 8);
    utils.writeUint32(0x3c4, 3);
    utils.writeUint32(0x3c8, 2);
    utils.writeUint32(0x3cc, 0);

    utils.writeUint32(0x3d0, 8);
    utils.writeUint32(0x3d4, 4);
    utils.writeUint32(0x3d8, 2);
    utils.writeUint32(0x3dc, 0);

    utils.writeUint32(0x3e0, 8);
    utils.writeUint32(0x3e4, 4);
    utils.writeUint32(0x3e8, 3);
    utils.writeUint32(0x3ec, 0);

    // 0x4d0
    utils.writeUint32(0x4d0, 50463002);
    utils.writeUint32(0x4d4, 16580350);

    utils.writeUint32(0x4e0, 84148506);
    utils.writeUint32(0x4e4, 16580350);

    utils.writeUint32(0x4f0, 100925978);
    utils.writeUint32(0x4f4, 16580350);

    utils.writeUint32(0x500, 100991770);
    utils.writeUint32(0x504, 16580350);

    // 0x570
    utils.writeUint32(0x570, 2);
    utils.writeUint32(0x574, 1);

    utils.writeUint32(0x580, 2);
    utils.writeUint32(0x584, 2);

    utils.writeUint32(0x590, 2);
    utils.writeUint32(0x594, 3);

    utils.writeUint32(0x5a0, 2);
    utils.writeUint32(0x5a4, 4);

    // 0x780
    utils.writeUint32(0x780, 1);
    utils.writeUint32(0x784, 2031617);
    utils.writeUint32(0x788, 257);
    utils.writeUint32(0x78c, 1376513);

    utils.writeUint32(0x790, 1);
    utils.writeUint32(0x794, 2097154);
    utils.writeUint32(0x798, 257);
    utils.writeUint32(0x79c, 1442050);

    utils.writeUint32(0x7a0, 1);
    utils.writeUint32(0x7a4, 2162691);
    utils.writeUint32(0x7a8, 257);
    utils.writeUint32(0x7ac, 1507587);

    utils.writeUint32(0x7b0, 1);
    utils.writeUint32(0x7b4, 2228228);
    utils.writeUint32(0x7b8, 257);
    utils.writeUint32(0x7bc, 1573124);

    // write model file definition
    utils.writeMdls(levFile.mdls);

    // write entities (buildings/vehicles/decoration)
    utils.writeEntities(levFile.entities);

    return {
        name: levFile.name,
        dataBytes: destView,
        dataFormat: 1,
        fileType: 7759212, // "lev"
        packedSize: fileSize,
        unpackedSize: fileSize,
        newSize: 0,
    };
}
