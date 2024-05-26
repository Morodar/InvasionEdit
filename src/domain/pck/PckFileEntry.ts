export interface PckFileEntryHeader {
    /**  Path of file (up to 128 characters). */
    name: string;

    /** Unpacked size in bytes  */
    unpackedSize: number;

    /** Defines type of file. (File extension is not always sufficient.) */
    fileType: number; // also known as "magic integer"

    /** Packed size in bytes */
    packedSize: number;

    /** Indicates where the data block is compressed or not. */
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
