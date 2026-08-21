import { HeaderUtils } from "../HeaderUtils";
import { StrFile, StrLocaleBlock } from "./StrFile";

const HEADER_SIZE = 0x200;
const BLOCK_PREFIX_SIZE = 0x10;
const STR_MAGIC = 0x00727473; // "str\0" little endian

/**
 * Thandor text resources (texte/help.str, texte/techno.str, ...). Each file
 * holds one or more locale blocks of UTF-16LE null-terminated strings.
 * Model names resolve through texte/help.str: string index
 * 0x4F + the MDL record's name text offset (text page 0x18).
 */
export class StrUtils extends HeaderUtils {
  private cachedFile: StrFile | null = null;

  constructor(dataView: DataView) {
    super(dataView);
  }

  static fromArrayBuffer(buffer: ArrayBuffer): StrUtils {
    return new StrUtils(new DataView(buffer));
  }

  static parse(dataView: DataView): StrFile {
    return new StrUtils(dataView).parseStrFile();
  }

  parseStrFile(): StrFile {
    if (this.cachedFile !== null) {
      return this.cachedFile;
    }
    if (this.view.byteLength < HEADER_SIZE || this.getUint32(0x00, true) !== STR_MAGIC) {
      throw new Error("invalid STR text-resource magic");
    }
    if (this.getUint32(0x04, true) !== this.view.byteLength) {
      throw new Error("STR allocation size mismatch");
    }
    const localeCount = this.getUint32(0xb0, true);
    let cursor = HEADER_SIZE;
    const blocks: StrLocaleBlock[] = [];
    for (let locale = 0; locale < localeCount; locale++) {
      const block = this.readLocaleBlock(cursor);
      blocks.push({ countryCode: block.countryCode, strings: block.strings });
      cursor += block.byteSize;
    }
    if (cursor !== this.view.byteLength) {
      throw new Error("STR locale-block walk did not end at allocation boundary");
    }
    this.cachedFile = { blocks };
    return this.cachedFile;
  }

  /** Locale selection mirrors the game: exact country code, then 44, then the first block. */
  selectBlock(preferredCountry = 44): StrLocaleBlock {
    const { blocks } = this.parseStrFile();
    return (
      blocks.find((block) => block.countryCode === preferredCountry) ??
      blocks.find((block) => block.countryCode === 44) ??
      blocks[0]
    );
  }

  string(index: number, preferredCountry = 44): string {
    const block = this.selectBlock(preferredCountry);
    if (index < 0 || index >= block.strings.length) {
      throw new Error("STR string index exceeds selected locale block");
    }
    return block.strings[index];
  }

  stringCount(preferredCountry = 44): number {
    return this.selectBlock(preferredCountry).strings.length;
  }

  private readLocaleBlock(cursor: number): StrLocaleBlock & { byteSize: number } {
    if (cursor > this.view.byteLength || BLOCK_PREFIX_SIZE > this.view.byteLength - cursor) {
      throw new Error("STR locale block prefix exceeds asset bounds");
    }
    const blockSize = this.getUint32(cursor + 0x00, true);
    const stringCount = this.getUint32(cursor + 0x04, true);
    const countryCode = this.getUint32(cursor + 0x08, true);
    if (
      blockSize < BLOCK_PREFIX_SIZE + stringCount * 4 ||
      cursor + blockSize > this.view.byteLength ||
      (blockSize & 3) !== 0
    ) {
      throw new Error("STR locale block has invalid size");
    }

    const offsets: number[] = [];
    for (let index = 0; index < stringCount; index++) {
      const offset = this.getUint32(cursor + BLOCK_PREFIX_SIZE + index * 4, true);
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
    for (let index = 0; index < stringCount; index++) {
      strings.push(this.readUtf16String(cursor + offsets[index], cursor + offsets[index + 1]));
    }
    return { countryCode, strings, byteSize: blockSize };
  }

  private readUtf16String(begin: number, end: number): string {
    let text = "";
    for (let cursor = begin; cursor + 2 <= end; cursor += 2) {
      const value = this.view.getUint16(cursor, true);
      if (value === 0) {
        break;
      }
      text += String.fromCharCode(value);
    }
    return text;
  }
}

/** Locale selection mirrors the game: exact country code, then 44, then the first block. */
function selectBlock(file: StrFile, preferredCountry: number): StrLocaleBlock {
  return (
    file.blocks.find((block) => block.countryCode === preferredCountry) ??
    file.blocks.find((block) => block.countryCode === 44) ??
    file.blocks[0]
  );
}

/** Reads one string from a parsed STR file (see {@link StrUtils.string}). */
export function strString(file: StrFile, index: number, preferredCountry = 44): string {
  const block = selectBlock(file, preferredCountry);
  if (index < 0 || index >= block.strings.length) {
    throw new Error("STR string index exceeds selected locale block");
  }
  return block.strings[index];
}

/**
 * Strips the game's rich-text command stream (code points U+8000..U+80FF are
 * formatting/newline controls) and collapses whitespace runs, mirroring the
 * stock editor's localized asset name normalization.
 */
export function normalizeAssetDisplayName(value: string): string {
  let normalized = "";
  let pendingSpace = false;
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint >= 0x8000 && codePoint <= 0x80ff) {
      pendingSpace = normalized.length > 0;
      continue;
    }
    if (codePoint <= 0x20 || codePoint === 0x7f) {
      pendingSpace = normalized.length > 0;
      continue;
    }
    if (pendingSpace) {
      normalized += " ";
      pendingSpace = false;
    }
    normalized += character;
  }
  return normalized.trimEnd();
}
