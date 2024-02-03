import { PckUtils } from "./PckUtils";
import { PckDecompressor } from "./PckDecompressor";
import { PckFile } from "./PckFile";
import { PckFileEntry, PckFileEntryHeader } from "./PckFileEntry";
import { PckHeader } from "./PckHeader";

export async function parsePckFile(file: File): Promise<PckFile> {
    const content: ArrayBuffer = await file.arrayBuffer();
    const utils = PckUtils.fromArrayBuffer(content);

    // TODO: Check minimum file size

    const header: PckHeader = {
        date1: utils.readDateVariant1(0x010),
        fileCount: utils.getUint32(0x0b0),
        fileSize: utils.getUint32(0x04),
        pcName1: utils.readPcName(0x030),
    };

    // TODO: Check filesize

    const pck: PckFile = {
        filename: file.name,
        header: header,
        pckFileEntries: readPckFileEntries(content, header),
    };

    await Promise.resolve();
    return pck;
}

function readPckFileEntries(content: ArrayBuffer, header: PckHeader): PckFileEntry[] {
    let offset = 512;
    const entries: PckFileEntry[] = [];
    const utils = PckUtils.fromArrayBuffer(content);
    for (let i = 0; i < header.fileCount; i++) {
        utils.canReadNextHeaderOrThrow(offset);
        const entry = readPckFileEntry(content, offset);
        const extraHeader = entry.dataFormat === 2 ? 16 : 0;
        offset += entry.packedSize + 0x200 + extraHeader;
        entries.push(entry);
    }
    return entries;
}

function readPckFileEntry(content: ArrayBuffer, offset: number): PckFileEntry {
    const utils = PckUtils.fromArrayBuffer(content);
    const tmpPackedSize = utils.getUint32(offset + 0x1f8);
    const dataFormat = utils.getUint32(offset + 0x1fc);
    const newSize = dataFormat === 2 ? utils.getUint32(offset + 0x200) : 0;
    const packedSize = dataFormat === 2 ? tmpPackedSize - 16 : tmpPackedSize;
    const header: PckFileEntryHeader = {
        name: utils.readPckFileName(offset),
        unpackedSize: utils.getUint32(offset + 0x1f0),
        fileType: utils.getUint32(offset + 0x1f4),
        packedSize: packedSize,
        dataFormat: dataFormat,
        newSize: newSize,
    };
    const dataOffset = dataFormat === 2 ? offset + 0x210 : offset + 0x200;
    const decompressedSize = newSize !== 0 ? newSize : header.unpackedSize;

    const data = PckDecompressor.decompressFile(
        new DataView(content, dataOffset, header.packedSize),
        decompressedSize,
        dataFormat,
    );
    return {
        ...header,
        dataBytes: new DataView(data),
    };
}
