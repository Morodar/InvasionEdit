import JSZip from "jszip";
import { PckFileEntry } from "./PckFileEntry";
import { PckHeader } from "./PckHeader";
import { saveAs } from "file-saver";

export interface PckFile {
    filename: string;
    header: PckHeader;
    pckFileEntries: PckFileEntry[];
}

export async function downloadPckFileAsZip(file: PckFile) {
    const zip = new JSZip();
    file.pckFileEntries.forEach((entry) => {
        const path = entry.name.replace("\\", "/");
        const array = new Uint8Array(entry.dataBytes.buffer);
        zip.file(path, array);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, file.filename + ".zip");
}
