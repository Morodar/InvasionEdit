import { HeaderUtils } from "../HeaderUtils";
import { GfxFile, GfxSubresource } from "./GfxFile";

const HEADER_SIZE = 0x200;
const SOURCE_ENTRY_SIZE = 0x20;
const GFX_MAGIC = 0x00786667; // "gfx\0" little endian

export class GfxUtils extends HeaderUtils {
  private cachedFile: GfxFile | null = null;

  constructor(dataView: DataView) {
    super(dataView);
  }

  static fromArrayBuffer(buffer: ArrayBuffer): GfxUtils {
    return new GfxUtils(new DataView(buffer));
  }

  static parse(dataView: DataView): GfxFile {
    return new GfxUtils(dataView).parseGfxFile();
  }

  /** Number of subresources in this archive (lazy-parsed, then cached). */
  get subresourceCount(): number {
    return this.parseGfxFile().subresources.length;
  }

  hasSubresource(subresourceIndex: number): boolean {
    return (
      subresourceIndex >= 0 && subresourceIndex < this.subresourceCount
    );
  }

  /** Subresource metadata, or undefined when the index is out of range. */
  getSubresource(subresourceIndex: number): GfxSubresource | undefined {
    if (!this.hasSubresource(subresourceIndex)) {
      return undefined;
    }
    return this.parseGfxFile().subresources[subresourceIndex];
  }

  parseGfxFile(): GfxFile {
    if (this.cachedFile !== null) {
      return this.cachedFile;
    }
    this.cachedFile = this.readGfxFile();
    return this.cachedFile;
  }

  private readGfxFile(): GfxFile {
    if (this.view.byteLength < HEADER_SIZE || this.getUint32(0x00) !== GFX_MAGIC) {
      throw new Error("invalid GFX magic");
    }
    const allocationSize = this.getUint32(0x04);
    if (allocationSize !== 0 && allocationSize > this.view.byteLength) {
      throw new Error("GFX allocation size exceeds payload");
    }
    const subresourceCount = this.getUint32(0xb0);
    const paletteBankCount = this.getUint32(0xb4);
    const tableOffset = this.getUint32(0xb8);
    if (subresourceCount === 0 || subresourceCount > 4096) {
      throw new Error("invalid GFX subresource count");
    }
    const paletteEntries = paletteBankCount * 256;
    const paletteEnd = HEADER_SIZE + paletteEntries * 8;
    const tableEnd = tableOffset + subresourceCount * SOURCE_ENTRY_SIZE;
    if (
      paletteEnd > this.view.byteLength ||
      tableOffset < HEADER_SIZE ||
      tableEnd > this.view.byteLength
    ) {
      throw new Error("GFX table exceeds payload");
    }

    const paletteArgb: number[] = [];
    for (let i = 0; i < paletteEntries; i++) {
      paletteArgb.push(this.getUint32(HEADER_SIZE + i * 8));
    }

    const subresources: GfxSubresource[] = [];
    for (let i = 0; i < subresourceCount; i++) {
      const offset = tableOffset + i * SOURCE_ENTRY_SIZE;
      const pixelWidth = this.getUint32(offset + 0x18);
      const pixelHeight = this.getUint32(offset + 0x1c);
      if (
        pixelWidth === 0 ||
        pixelHeight === 0 ||
        pixelWidth > 16384 ||
        pixelHeight > 16384
      ) {
        throw new Error("invalid GFX dimensions");
      }
      const paletteBank = this.getInt32(offset + 0x08);
      const pixels = pixelWidth * pixelHeight;
      const bytes = paletteBank >= 0 ? pixels : pixels * 4;
      const dataOffset = this.getUint32(offset + 0x0c);
      if (dataOffset > this.view.byteLength || bytes > this.view.byteLength - dataOffset) {
        throw new Error("GFX pixel payload exceeds bounds");
      }
      if (paletteBank >= paletteBankCount) {
        throw new Error("GFX subresource uses missing palette bank");
      }
      subresources.push({
        logicalWidth: this.getUint32(offset),
        logicalHeight: this.getUint32(offset + 0x04),
        paletteBank,
        dataOffset,
        originX: this.getInt32(offset + 0x10),
        originY: this.getInt32(offset + 0x14),
        pixelWidth,
        pixelHeight,
      });
    }
    return { paletteArgb, subresources };
  }

  /**
   * Decodes a subresource into RGBA bytes (4 per pixel).
   * By default zero alpha stays transparent, matching the model/effect texture
   * path of the stock renderer; pass true for the opaque terrain variant.
   */
  decodeSubresourceRgba(
    subresourceIndex: number,
    zeroAlphaIsOpaque = false,
  ): { width: number; height: number; rgba: Uint8Array } {
    if (subresourceIndex < 0 || subresourceIndex >= this.subresourceCount) {
      throw new Error("GFX subresource index out of range");
    }
    const source = this.parseGfxFile().subresources[subresourceIndex];
    const count = source.pixelWidth * source.pixelHeight;
    const rgba = new Uint8Array(count * 4);
    for (let i = 0; i < count; i++) {
      const argb =
        source.paletteBank >= 0
          ? this.parseGfxFile().paletteArgb[
              source.paletteBank * 256 + this.view.getUint8(source.dataOffset + i)
            ]
          : this.getUint32(source.dataOffset + i * 4);
      let alpha = (argb >>> 24) & 0xff;
      if (alpha === 0 && zeroAlphaIsOpaque) alpha = 0xff;
      rgba[i * 4] = (argb >>> 16) & 0xff;
      rgba[i * 4 + 1] = (argb >>> 8) & 0xff;
      rgba[i * 4 + 2] = argb & 0xff;
      rgba[i * 4 + 3] = alpha;
    }
    return { width: source.pixelWidth, height: source.pixelHeight, rgba };
  }
}
