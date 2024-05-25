import { HeaderUtils } from "../HeaderUtils";
import { FldFile, MapLayers } from "./FldFile";
import { LayerIndexes, Layers } from "./layers/Layer";

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
    const content: ArrayBuffer = await file.arrayBuffer();
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
