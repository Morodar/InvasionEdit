import { HeaderUtils } from "../HeaderUtils";
import { PalFile } from "./PalFile";

const HEADER_SIZE = 0x200;
const PAL_MAGIC = 0x006c6170; // "pal\0" little endian

/**
 * Palette archives pair with GFX families (armyN.pal with armyN.gfx). SPR
 * triangles without a texture select their flat color through the low 9 bits
 * of the render flags as a palette index.
 */
export class PalUtils extends HeaderUtils {
  private cachedFile: PalFile | null = null;

  constructor(dataView: DataView) {
    super(dataView);
  }

  static fromArrayBuffer(buffer: ArrayBuffer): PalUtils {
    return new PalUtils(new DataView(buffer));
  }

  static parse(dataView: DataView): PalFile {
    return new PalUtils(dataView).parsePalFile();
  }

  parsePalFile(): PalFile {
    if (this.cachedFile !== null) {
      return this.cachedFile;
    }
    if (this.view.byteLength < HEADER_SIZE || this.getUint32(0x00) !== PAL_MAGIC) {
      throw new Error("invalid PAL magic");
    }
    const allocationSize = this.getUint32(0x04);
    if (allocationSize !== 0 && allocationSize > this.view.byteLength) {
      throw new Error("PAL allocation size exceeds payload");
    }
    const entryCount = this.getUint32(0xb0);
    const end = HEADER_SIZE + entryCount * 8;
    if (entryCount === 0 || entryCount > 65536 || end > this.view.byteLength) {
      throw new Error("PAL entry count exceeds payload");
    }
    const colorsArgb: number[] = [];
    for (let i = 0; i < entryCount; i++) {
      colorsArgb.push(this.getUint32(HEADER_SIZE + i * 8));
    }
    this.cachedFile = { colorsArgb };
    return this.cachedFile;
  }
}
