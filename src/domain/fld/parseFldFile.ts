import { FldFile, MapLayers } from "./FldFile";
import { FldUtils } from "./FldUtils";
import { LayerIndexes, Layers } from "./Layer";

export async function parseFldFile(file: File): Promise<FldFile> {
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
