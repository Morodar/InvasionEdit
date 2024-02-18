import { FldFile } from "./FldFile";
import { LayerIndexes, Layers } from "./Layer";

export function saveFldFile(fldFile: FldFile): File {
    if (!fldFile.originalFile) {
        throw new Error("Operation not supported. Original file required");
    }
    const dest = clone(fldFile.originalFile);
    const destView = new DataView(dest);

    LayerIndexes.forEach((layer) => {
        saveLayer(fldFile.layers[layer], destView, Layers[layer].fileOffset);
    });

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
