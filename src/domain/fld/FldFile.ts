export interface FldFile extends MapLayer {
    name: string;
    fileSize: number;
    resourceLayer: DataView;
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

export interface MapLayer {
    height: number;
    width: number;
    points: Point3D[];
}

export function getRelativePoints(
    fldFile: FldFile,
    fromIndex: number,
    brushWidth: number,
    brushHeight: number,
): IndexPoint3D[] {
    const { width, height } = fldFile;

    const offsetH = fromIndex % width;
    const offsetW = (fromIndex - offsetH) / width;

    if (brushWidth === 1 && brushHeight === 1) {
        const index = offsetW * width + offsetH;
        return [{ index, ...fldFile.points[index] }];
    }

    const brushWidthStart = Math.floor(brushWidth / 2);
    const brushWidthEnd = Math.ceil(brushWidth / 2);
    const brushHeightStart = Math.floor(brushHeight / 2);
    const brushHeightEnd = Math.ceil(brushHeight / 2);
    const points: IndexPoint3D[] = [];
    for (let w = -brushWidthStart; w < brushWidthEnd; w++) {
        for (let h = -brushHeightStart; h < brushHeightEnd; h++) {
            const brushOffsetW = offsetW + w;
            const brushOffsetH = offsetH + h;
            if (brushOffsetH < 0 || brushOffsetH < 0 || brushOffsetH >= height || brushOffsetH >= width) {
                continue;
            }

            const index = brushOffsetW * width + brushOffsetH;
            if (index >= 0 && index < fldFile.points.length) {
                const point = fldFile.points[index];
                points.push({ index, ...point });
            }
        }
    }

    return points;
}
