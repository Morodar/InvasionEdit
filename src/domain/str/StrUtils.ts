import { HeaderUtils } from "../HeaderUtils";
import { StrFile, StrLocaleBlock } from "./StrFile";

const HEADER_SIZE = 0x200;
const LOCALE_COUNT_OFFSET = 0xb0;
const BLOCK_PREFIX_SIZE = 0x10;

const FOURCC_STR = 0x00727473; // fourcc("str") little-endian

export class StrUtils extends HeaderUtils {
    constructor(dataView: DataView) {
        super(dataView);
    }

    static fromArrayBuffer(buffer: ArrayBuffer): StrUtils {
        return new StrUtils(new DataView(buffer));
    }

    canReadHeader = (): boolean => this.view.byteLength >= HEADER_SIZE;

    getMagic = (): number => this.getUint32(0);

    getAllocationSize = (): number => this.getUint32(4);

    getLocaleCount = (): number => this.getUint32(LOCALE_COUNT_OFFSET);

    getBlockSize = (offset: number): number => this.getUint32(offset);

    getStringCount = (offset: number): number => this.getUint32(offset + 4);

    getCountryCode = (offset: number): number => this.getUint32(offset + 8);

    getStringOffset = (blockOffset: number, index: number): number =>
        this.getUint32(blockOffset + BLOCK_PREFIX_SIZE + index * 4);

    readStrString(blockOffset: number, fromByteOffset: number, byteLength: number): string {
        let result = "";
        const endOffset = blockOffset + fromByteOffset + byteLength;

        for (let i = blockOffset + fromByteOffset; i < endOffset; i += 2) {
            const char = this.view.getUint16(i, true);
            if (char === 0) break;
            result += String.fromCharCode(char);
        }
        return result;
    }

    parseStrFile = (): StrFile => {
        if (!this.canReadHeader()) {
            throw new Error("File too small to be a valid STR file");
        }

        const magic = this.getMagic();
        if (magic !== FOURCC_STR) {
            throw new Error("Invalid STR magic number");
        }

        const allocationSize = this.getAllocationSize();
        if (allocationSize !== this.view.byteLength) {
            throw new Error(
                `STR allocation size mismatch: expected ${allocationSize}, got ${this.view.byteLength}`
            );
        }

        const localeCount = this.getLocaleCount();
        const blocks: StrLocaleBlock[] = [];
        let cursor = HEADER_SIZE;

        for (let locale = 0; locale < localeCount; locale++) {
            if (cursor + BLOCK_PREFIX_SIZE > this.view.byteLength) {
                throw new Error("STR locale block prefix exceeds file bounds");
            }

            const blockSize = this.getBlockSize(cursor);
            const stringCount = this.getStringCount(cursor);
            const countryCode = this.getCountryCode(cursor);

            if (
                blockSize < BLOCK_PREFIX_SIZE + stringCount * 4 ||
                cursor + blockSize > this.view.byteLength ||
                (blockSize & 3) !== 0
            ) {
                throw new Error("STR locale block has invalid size");
            }

            const offsets: number[] = [];
            for (let i = 0; i < stringCount; i++) {
                const offset = this.getStringOffset(cursor, i);
                const minimum = BLOCK_PREFIX_SIZE + stringCount * 4;
                if (offset < minimum || offset >= blockSize || (offset & 1) !== 0) {
                    throw new Error("STR string offset is outside its locale block");
                }
                if (offsets.length > 0 && offset < offsets[offsets.length - 1]) {
                    throw new Error("STR string offsets are not ordered");
                }
                offsets.push(offset);
            }
            offsets.push(blockSize);

            const strings: string[] = [];
            for (let i = 0; i < stringCount; i++) {
                const begin = offsets[i];
                const end = offsets[i + 1];
                strings.push(this.readStrString(cursor, begin, end - begin));
            }

            blocks.push({ countryCode, reserved: 0, strings });
            cursor += blockSize;
        }

        if (cursor !== this.view.byteLength) {
            throw new Error("STR locale-block walk did not end at file boundary");
        }

        return { localeCount, blocks };
    };
}

const selectBlock = (strFile: StrFile, preferredCountry: number): StrLocaleBlock => {
    if (strFile.blocks.length === 0) {
        throw new Error("STR file has no locale blocks");
    }
    const exact = strFile.blocks.find((b) => b.countryCode === preferredCountry);
    if (exact) return exact;
    const english = strFile.blocks.find((b) => b.countryCode === 44);
    if (english) return english;
    return strFile.blocks[0];
};

export const getString = (
    strFile: StrFile,
    index: number,
    preferredCountry: number = 44
): string => {
    const block = selectBlock(strFile, preferredCountry);
    if (index >= block.strings.length) {
        throw new Error("STR string index exceeds selected locale block");
    }
    return block.strings[index];
};

export const getCountryCodes = (strFile: StrFile): number[] => {
    return strFile.blocks.map((b) => b.countryCode);
};

export const getStringCount = (strFile: StrFile, countryCode: number = 44): number => {
    return selectBlock(strFile, countryCode).strings.length;
};
