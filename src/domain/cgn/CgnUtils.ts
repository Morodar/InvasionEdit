import { readFile } from "../../common/utils/readFile";
import { HeaderUtils } from "../HeaderUtils";
import { CGN_ENTRY_LENGTH, CgnDefinition, CgnEntry, CgnFile, CgnHeader } from "./Camgaign";

export class CgnUtils extends HeaderUtils {
    constructor(dataView: DataView) {
        super(dataView);
    }

    static parseCgnFile = async (file: File): Promise<CgnFile> => parseCgnFile(file);
}

async function parseCgnFile(file: File): Promise<CgnFile> {
    const content: ArrayBuffer = await readFile(file);
    const view = new DataView(content);
    const util = new CgnUtils(view);

    const header: CgnHeader = {
        name: file.name,

        extension: 7235427,
        fileSize: util.getUint32(0x04),
        pcName1: util.readPcName(0x30),
        pcName2: util.readPcName(0x70),

        x0B0: util.getUint32(0x0b0),
        x0B4: util.getUint32(0x0b4),
        cgnCount: util.getUint32(0x0b8),
        x0BC: util.getUint32(0x0bc),
    };

    const campaign: CgnDefinition = {
        name: util.readString(0x100, 0x40),
        fromPlayers: util.readString(0x140, 4),
        toPlayers: util.readString(0x148, 4),
        mapTextIndex: util.getUint32(0x150),
    };

    const levelEntries: CgnEntry[] = [];

    for (let i = 0; i < header.cgnCount; i++) {
        const offset = 0x200 + i * CGN_ENTRY_LENGTH;
        const entry: CgnEntry = {
            missionIndex: util.getUint32(offset),
            name: util.readString(offset + 0x10c, 0x40),
        };
        levelEntries.push(entry);
    }

    return {
        header,
        campaign,
        levelEntries,
    };
}
