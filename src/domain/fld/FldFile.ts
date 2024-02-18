import { Layer, LayerIndex } from "./Layer";

export interface FldFile extends FldMap {
    name: string;
    fileSize: number;
    devSaveLocation: string;
    unknown0xB0: number;
    unknown0xB4: number;
    originalFile?: ArrayBuffer;
}

export interface IndexValue {
    index: number;
    value: number;
}

export interface Point3D {
    x: number;
    z: number;
    value: number;
}

export interface IndexPoint3D extends Point3D {
    index: number;
}

export type MapLayers = Record<LayerIndex, DataView>;

export interface FldMap {
    height: number;
    width: number;
    layers: MapLayers;
}

export function getRelativePoints(
    fldFile: FldFile,
    fromIndex: number,
    brushWidth: number,
    brushHeight: number,
): IndexValue[] {
    const { width, height } = fldFile;

    const offsetH = fromIndex % width;
    const offsetW = (fromIndex - offsetH) / width;

    if (brushWidth === 1 && brushHeight === 1) {
        const index = offsetW * width + offsetH;
        return [{ index, value: fldFile.layers[Layer.Landscape].getUint8(index) }];
    }

    const brushWidthStart = Math.floor(brushWidth / 2);
    const brushWidthEnd = Math.ceil(brushWidth / 2);
    const brushHeightStart = Math.floor(brushHeight / 2);
    const brushHeightEnd = Math.ceil(brushHeight / 2);

    const points: IndexValue[] = [];
    for (let w = -brushWidthStart; w < brushWidthEnd; w++) {
        for (let h = -brushHeightStart; h < brushHeightEnd; h++) {
            const brushOffsetW = offsetW + w;
            const brushOffsetH = offsetH + h;
            if (brushOffsetH < 0 || brushOffsetH < 0 || brushOffsetH >= height || brushOffsetH >= width) {
                continue;
            }

            const index = brushOffsetW * width + brushOffsetH;
            if (index >= 0 && index < fldFile.layers[Layer.Landscape].byteLength) {
                points.push({ index, value: fldFile.layers[Layer.Landscape].getUint8(index) });
            }
        }
    }

    return points;
}
