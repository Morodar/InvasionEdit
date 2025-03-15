import { readFile } from "../../common/utils/readFile";
import { HeaderUtils } from "../HeaderUtils";
import { PckFileEntry } from "../pck/PckFileEntry";
import { FldFile, MapLayers } from "./FldFile";
import { LayerIndexes, Layers } from "./layers/Layer";
import packageJson from "../../../package.json";
import { PckDecompressor } from "../pck/PckDecompressor";

export class FldUtils extends HeaderUtils {
    constructor(dataView: DataView) {
        super(dataView);
    }

    readDevSaveLocation = () => this.readString(0x100, 0x50);
    readWidth = () => this.getUint32(0x0b8);
    readHeight = () => this.getUint32(0x0bc);
    readUnknown0xB0 = () => this.getUint32(0xb0);
    readUnknown0xB4 = () => this.getUint32(0x0b4);

    static parseFldFile = async (file: File): Promise<FldFile> => parseFldFile(file);
    static buildFldFile = (fldFile: FldFile): File => buildFldFile(fldFile);
}

async function parseFldFile(file: File): Promise<FldFile> {
    const content: ArrayBuffer = await readFile(file);
    const view = new DataView(content);
    const util = new FldUtils(view);
    const size = view.getUint32(0x04, true);
    const width = util.readWidth();
    const height = util.readHeight();

    const layers = LayerIndexes.reduce((acc, layer) => {
        acc[layer] = extractLayerUintArray(view, height, width, Layers[layer].fileOffset);
        return acc;
    }, {} as MapLayers);

    return {
        originalFile: content,
        name: file.name,
        fileSize: size,
        width,
        height,
        devSaveLocation: util.readDevSaveLocation(),
        unknown0xB0: util.readUnknown0xB0(),
        unknown0xB4: util.readUnknown0xB4(),

        layers: layers,
    };
}

function extractLayerUintArray(data: DataView, height: number, width: number, offset: number) {
    const mapSize = width * height;
    const array = new Uint8Array(mapSize);
    const dest = new DataView(array.buffer);

    let destIndex = 0;
    for (let i = offset; i < data.byteLength; i += 128) {
        const value = data.getUint8(i);
        dest.setUint8(destIndex, value);
        destIndex++;
    }

    return dest;
}

function buildFldFile(fldFile: FldFile): File {
    if (!fldFile.originalFile) {
        throw new Error("Operation not supported. Original file required");
    }
    const dest = cloneBuffer(fldFile.originalFile);
    const destView = new DataView(dest);

    LayerIndexes.forEach((layer) => {
        saveLayer(fldFile.layers[layer], destView, Layers[layer].fileOffset);
    });

    const blob = new Blob([dest]);
    return new File([blob], fldFile.name);
}

export function buildFldPckFileEntry(fldFile: FldFile): PckFileEntry {
    // 512 = header size; 128 = bytes per point on map
    const fileSize = 512 + 128 * fldFile.width * fldFile.height;
    const dest = new ArrayBuffer(fileSize);
    const destView = new DataView(dest);
    const utils = new HeaderUtils(destView);

    utils.writeUint32(0, 6581350); // "fld"

    // write fileSize
    utils.writeUint32(0x04, fileSize);

    // write magic bytes
    utils.writeUint32(0x08, 1);
    utils.writeUint32(0x0c, 6);
    utils.writeUint32(0x0e, 6);

    // write time stamps
    const now = new Date();
    utils.writeDateVariant1(0x10, now);
    utils.writeDateVariant1(0x18, now);
    utils.writeDateVariant1(0x20, now);

    // write pcName1 + pcName2 (use "InvasionEdit + version" as pcName)
    const pcName = `Invasion Edit - ${packageJson.version}`;
    utils.writeString(0x30, pcName);
    utils.writeString(0x70, pcName);

    utils.writeUint32(0xb0, fldFile.unknown0xB0);
    utils.writeUint32(0xb4, fldFile.unknown0xB4);
    utils.writeUint32(0xb8, fldFile.width);
    utils.writeUint32(0xbc, fldFile.height);

    // add x / z coordinates
    PckDecompressor.addCoordinateSystem(fldFile.height, fldFile.width, destView);

    // apply layers
    LayerIndexes.forEach((layer) => {
        saveLayer(fldFile.layers[layer], destView, Layers[layer].fileOffset);
    });

    return {
        name: fldFile.name,
        dataBytes: destView,
        dataFormat: 1,
        fileType: 6581350, // "fld"
        packedSize: fileSize,
        unpackedSize: fileSize,
        newSize: 0,
    };
}

function cloneBuffer(buffer: ArrayBuffer): ArrayBuffer {
    const dest = new ArrayBuffer(buffer.byteLength);
    const originalView = new Uint8Array(buffer);
    const cloneView = new Uint8Array(dest);
    cloneView.set(originalView);
    return dest;
}

function saveLayer(src: DataView, dest: DataView, offset: number) {
    let destIndex = offset;
    for (let i = 0; i < src.byteLength; i++) {
        const value = src.getUint8(i);
        dest.setUint8(destIndex, value);
        destIndex += 128;
    }
}
