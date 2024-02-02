import { FldFile } from "./FldFile";
import { Point3D } from "./MapLayer";

export async function parseFldFile(file: File): Promise<FldFile> {
    const content: ArrayBuffer = await file.arrayBuffer();
    const view = new DataView(content);

    const size = view.getUint32(0x04, true);
    const width = view.getUint32(0x0b8, true);
    const height = view.getUint32(0x0bc, true);

    const points: Point3D[] = [];

    let x = height;
    let z = 0;
    for (let i = 585; i < content.byteLength; i += 128) {
        const value = view.getUint8(i);
        points.push({ x, z, value });
        z++;
        if (z >= width) {
            z = 0;
            x--;
        }
    }

    return {
        name: file.name,
        fileSize: size,
        width,
        height,
        points,
    };
}
