import { FldFile } from "./FldFile";
import { FldUtils } from "./FldUtils";
import { Point3D } from "./MapLayer";

export async function parseFldFile(file: File): Promise<FldFile> {
    const content: ArrayBuffer = await file.arrayBuffer();
    const view = new DataView(content);
    const util = new FldUtils(view);
    const size = view.getUint32(0x04, true);
    const width = util.readWidth();
    const height = util.readHeight();
    const mapSize = width * height;

    const resourceArray = new Uint8Array(mapSize);
    const resourceView = new DataView(resourceArray.buffer);

    const points = extractLayer(view, height, width, OFFSET_HEIGHT_LAYER);

    extractLayerUintArray(view, resourceView, height, width, OFFSET_RESSOURCES_LAYER);
    return {
        originalFile: content,
        name: file.name,
        fileSize: size,
        width,
        height,
        points,
        resourceLayer: resourceView,
        devSaveLocation: util.readDevSaveLocation(),
        unknown0xB0: util.readUnknown0xB0(),
        unknown0xB4: util.readUnknown0xB4(),
    };
}

export const OFFSET_HEIGHT_LAYER = 585;
export const OFFSET_RESSOURCES_LAYER = 593;

// (Layer  1) 512 + 69 = 580 = Layer XXX
// (Layer  2) 512 + 70 = 581 = Layer XXX
// (Layer  3) 512 + 71 = 582 = Layer XXX
// (Layer  4) 512 + 72 = 583 = Layer XXX
// (Layer  5) 512 + 73 = 584 = Layer XXX
// (Layer  6) 512 + 74 = 585 = Layer Height
// (Layer  7) 512 + 75 = 586 = Layer XXX
// (Layer  8) 512 + 76 = 587 = Layer XXX
// (Layer  9) 512 + 77 = 588 = Layer XXX
// (Layer 10) 512 + 78 = 589 = Layer XXX
// (Layer 11) 512 + 79 = 590 = Layer XXX
// (Layer 12) 512 + 80 = 591 = Layer XXX
// (Layer 13) 512 + 81 = 592 = Layer XXX
// (Layer 14) 512 + 82 = 593 = Layer Resources
// (Layer 15) 512 + 83 = 594 = Layer XXX
// (Layer 16) 512 + 84 = 595 = Layer XXX
function extractLayer(data: DataView, height: number, width: number, offset: number) {
    const mapSize = height * width;
    const points: Point3D[] = new Array<Point3D>(mapSize);

    let x = height - 1;
    let z = 0;
    let counter = 0;
    for (let i = offset; i < data.byteLength; i += 128) {
        const value = data.getUint8(i);
        points[counter] = { x, z, value };
        z++;
        if (z >= width) {
            z = 0;
            x--;
        }
        counter++;
    }
    return points;
}

function extractLayerUintArray(data: DataView, dest: DataView, height: number, width: number, offset: number) {
    const mapSize = height * width;
    const points: Point3D[] = new Array<Point3D>(mapSize);

    let destIndex = 0;
    for (let i = offset; i < data.byteLength; i += 128) {
        const value = data.getUint8(i);
        dest.setUint8(destIndex, value);
        destIndex++;
    }
    return points;
}
