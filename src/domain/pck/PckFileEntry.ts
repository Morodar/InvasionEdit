import { HeaderUtils } from "../HeaderUtils";

export interface PckFileEntryHeader {
    /**  Path of file (up to 128 characters). */
    name: string;

    /** Unpacked size in bytes  */
    unpackedSize: number;

    /** Defines type of file. (File extension is not always sufficient.) */
    fileType: number; // also known as "magic integer"

    /** Packed size in bytes */
    packedSize: number;

    /**
     * Indicates wheter the data block is compressed or not.
     * - 0 content is compressed
     * - 1 content is not compressed
     * - 2 content is compressed and needs additional modification
     */
    dataFormat: number;

    /** (real) Unpacked size, set when DataFormat is 2. */
    newSize: number;
}

export interface PckFileEntry extends PckFileEntryHeader {
    /** decompressed bytes of pck file entry */
    dataBytes: DataView;
}

export const hasExtraHeader = (raw: PckFileEntryHeader) => raw.dataFormat === 2;
export const isCompressed = (raw: PckFileEntryHeader) => raw.dataFormat !== 1;
export const getDecompressedSize = (raw: PckFileEntryHeader) => (raw.newSize !== 0 ? raw.newSize : raw.unpackedSize);

const octetStreamType = { type: "application/octet-stream" };
export function pckFileEntryToFile(entry: PckFileEntry): File {
    const clonedData = new Uint8Array(entry.dataBytes.buffer);
    const blob = new Blob([clonedData], octetStreamType);
    return new File([blob], entry.name, octetStreamType);
}

export function pckFileEntryToPckEntryBytes(entry: PckFileEntry): ArrayBuffer {
    // 256 + 240 empty + 16 = 512 bytes header
    const size = 512 + entry.dataBytes.byteLength;
    const buffer = new ArrayBuffer(size);
    const view = new DataView(buffer);

    const headerUtils = new HeaderUtils(view);

    // set header values
    headerUtils.writeString(0, entry.name); // write filename
    headerUtils.writeUint32(496, entry.unpackedSize);
    headerUtils.writeUint32(500, entry.fileType);
    headerUtils.writeUint32(504, entry.unpackedSize);
    headerUtils.writeUint32(508, 1); // 1 = file is not compressed

    // clone file content
    for (let index = 0; index < entry.dataBytes.byteLength; index++) {
        view.setUint8(512 + index, entry.dataBytes.getInt8(index));
    }

    return buffer;
}
