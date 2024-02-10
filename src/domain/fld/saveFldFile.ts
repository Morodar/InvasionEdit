import { FldFile } from "./FldFile";
import { Point3D } from "./MapLayer";
import { OFFSET_HEIGHT_LAYER, OFFSET_RESSOURCES_LAYER } from "./parseFldFile";

export function saveFldFile(fldFile: FldFile): File {
    if (!fldFile.originalFile) {
        throw new Error("Operation not supported. Original file required");
    }
    const dest = clone(fldFile.originalFile);
    const destView = new DataView(dest);

    saveLayer(fldFile.resourceLayer, destView, OFFSET_RESSOURCES_LAYER);
    saveHeightMapLayer(fldFile.points, destView, OFFSET_HEIGHT_LAYER);

    const blob = new Blob([dest]);
    return new File([blob], fldFile.name);
}

function clone(buffer: ArrayBuffer): ArrayBuffer {
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

function saveHeightMapLayer(src: Point3D[], dest: DataView, offset: number) {
    let destIndex = offset;
    for (const p of src) {
        dest.setUint8(destIndex, p.value);
        destIndex += 128;
    }
}
