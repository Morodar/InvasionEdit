import { describe, expect, it } from "vitest";
import { GfxUtils } from "../../../src/domain/gfx/GfxUtils";

const HEADER_SIZE = 0x200;
const PALETTE_OFFSET = HEADER_SIZE;
const PALETTE_BANKS = 1;
const TABLE_OFFSET = PALETTE_OFFSET + PALETTE_BANKS * 256 * 8;
const PIXEL_DATA_OFFSET = TABLE_OFFSET + 2 * 0x20;

/** Builds a GFX image with one palette bank, one palettized and one direct-ARGB subresource. */
function buildGfxImage(): DataView {
  const totalSize = PIXEL_DATA_OFFSET + 12;
  const view = new DataView(new ArrayBuffer(totalSize));
  view.setUint32(0x00, 0x00786667, true); // "gfx\0"
  view.setUint32(0xb0, 2, true); // subresource count
  view.setUint32(0xb4, PALETTE_BANKS, true);
  view.setUint32(0xb8, TABLE_OFFSET, true);

  // palette: entry 0 opaque blue, entry 1 semi-transparent red, entry 2 zero alpha
  view.setUint32(PALETTE_OFFSET + 0 * 8, 0xff0000ff, true);
  view.setUint32(PALETTE_OFFSET + 1 * 8, 0x80ff0000, true);
  view.setUint32(PALETTE_OFFSET + 2 * 8, 0x00123456, true);

  // subresource 0: palettized 2x2 with indices [0, 1, 2, 1]
  view.setUint32(TABLE_OFFSET, 16, true); // logical width
  view.setUint32(TABLE_OFFSET + 0x04, 16, true); // logical height
  view.setInt32(TABLE_OFFSET + 0x08, 0, true); // palette bank
  view.setUint32(TABLE_OFFSET + 0x0c, PIXEL_DATA_OFFSET, true);
  view.setInt32(TABLE_OFFSET + 0x10, -4, true); // origin x
  view.setInt32(TABLE_OFFSET + 0x14, -8, true); // origin y
  view.setUint32(TABLE_OFFSET + 0x18, 2, true); // pixel width
  view.setUint32(TABLE_OFFSET + 0x1c, 2, true); // pixel height
  view.setUint8(PIXEL_DATA_OFFSET, 0);
  view.setUint8(PIXEL_DATA_OFFSET + 1, 1);
  view.setUint8(PIXEL_DATA_OFFSET + 2, 2);
  view.setUint8(PIXEL_DATA_OFFSET + 3, 1);

  // subresource 1: direct ARGB 1x1 green
  const entry1 = TABLE_OFFSET + 0x20;
  view.setUint32(entry1 + 0x08, -1, true); // no palette bank
  view.setUint32(entry1 + 0x0c, PIXEL_DATA_OFFSET + 8, true);
  view.setUint32(entry1 + 0x18, 1, true);
  view.setUint32(entry1 + 0x1c, 1, true);
  view.setUint32(PIXEL_DATA_OFFSET + 8, 0xff00ff00, true);

  return view;
}

describe("GfxUtils", () => {
  it("parses subresources lazily and caches the result", () => {
    const utils = new GfxUtils(buildGfxImage());
    expect(utils.subresourceCount).toBe(2);
    expect(utils.subresourceCount).toBe(2); // cached path
    expect(utils.hasSubresource(0)).toBe(true);
    expect(utils.hasSubresource(1)).toBe(true);
    expect(utils.hasSubresource(2)).toBe(false);
    expect(utils.hasSubresource(-1)).toBe(false);
  });

  it("exposes subresource metadata", () => {
    const file = new GfxUtils(buildGfxImage()).parseGfxFile();
    expect(file.paletteArgb.slice(0, 3)).toEqual([0xff0000ff, 0x80ff0000, 0x00123456]);
    expect(file.subresources[0]).toEqual({
      logicalWidth: 16,
      logicalHeight: 16,
      paletteBank: 0,
      dataOffset: PIXEL_DATA_OFFSET,
      originX: -4,
      originY: -8,
      pixelWidth: 2,
      pixelHeight: 2,
    });
    expect(file.subresources[1].paletteBank).toBe(-1);
  });

  it("decodes palettized pixels through the selected bank", () => {
    const utils = new GfxUtils(buildGfxImage());
    const decoded = utils.decodeSubresourceRgba(0);
    expect(decoded.width).toBe(2);
    expect(decoded.height).toBe(2);
    expect([...decoded.rgba]).toEqual([
      0, 0, 255, 255, // blue, opaque
      255, 0, 0, 128, // red, semi-transparent
      0x12, 0x34, 0x56, 255, // zero alpha promoted to opaque
      255, 0, 0, 128,
    ]);
  });

  it("decodes direct ARGB pixels without a palette", () => {
    const utils = new GfxUtils(buildGfxImage());
    const decoded = utils.decodeSubresourceRgba(1);
    expect([...decoded.rgba]).toEqual([0, 255, 0, 255]);
  });

  it("rejects out-of-range subresource indices", () => {
    const utils = new GfxUtils(buildGfxImage());
    expect(() => utils.decodeSubresourceRgba(2)).toThrow("GFX subresource index out of range");
  });

  it("rejects images with a broken magic", () => {
    const view = buildGfxImage();
    view.setUint32(0x00, 0xdeadbeef, true);
    expect(() => new GfxUtils(view).subresourceCount).toThrow("invalid GFX magic");
  });
});
