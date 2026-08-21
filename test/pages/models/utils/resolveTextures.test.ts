import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { GfxUtils } from "../../../../src/domain/gfx/GfxUtils";
import { ModelTextureProvider } from "../../../../src/pages/models/utils/resolveTextures";

const HEADER_SIZE = 0x200;
const PALETTE_OFFSET = HEADER_SIZE;
const TABLE_OFFSET = PALETTE_OFFSET + 256 * 8;
const PIXEL_DATA_OFFSET = TABLE_OFFSET + 2 * 0x20;

/** GFX image with one palette bank and one palettized 4x2 subresource. */
function buildGfxImage(): DataView {
  const view = new DataView(new ArrayBuffer(PIXEL_DATA_OFFSET + 8));
  view.setUint32(0x00, 0x00786667, true);
  view.setUint32(0xb0, 1, true); // subresource count
  view.setUint32(0xb4, 1, true); // palette bank count
  view.setUint32(0xb8, TABLE_OFFSET, true);
  view.setUint32(PALETTE_OFFSET, 0xff0000ff, true);

  view.setUint32(TABLE_OFFSET + 0x08, 0, true); // palette bank
  view.setUint32(TABLE_OFFSET + 0x0c, PIXEL_DATA_OFFSET, true);
  view.setUint32(TABLE_OFFSET + 0x18, 4, true); // pixel width
  view.setUint32(TABLE_OFFSET + 0x1c, 2, true); // pixel height
  for (let i = 0; i < 8; i++) {
    view.setUint8(PIXEL_DATA_OFFSET + i, i < 4 ? 0 : 1);
  }
  return view;
}

describe("ModelTextureProvider", () => {
  it("returns dimensions of the archive containing the subresource", () => {
    const provider = new ModelTextureProvider([
      { path: "gfx/mdl/army1.gfx", utils: new GfxUtils(buildGfxImage()) },
    ]);
    expect(provider.hasTextures).toBe(true);
    expect(provider.getDimensions(0)).toEqual({ width: 4, height: 2 });
  });

  it("returns undefined dimensions without loaded archives", () => {
    const provider = new ModelTextureProvider([]);
    expect(provider.hasTextures).toBe(false);
    expect(provider.getDimensions(108)).toBeUndefined();
    expect(provider.getTexture(0)).toBeNull();
  });

  it("prefers earlier archives when several contain the subresource", () => {
    const provider = new ModelTextureProvider([
      { path: "gfx/mdl/army1.gfx", utils: new GfxUtils(buildGfxImage()) },
      { path: "gfx/texturen/effect.gfx", utils: new GfxUtils(buildGfxImage()) },
    ]);
    expect(provider.getDimensions(0)).toEqual({ width: 4, height: 2 });
  });

  it("never returns a texture for the untextured sentinel", () => {
    const provider = new ModelTextureProvider([
      { path: "gfx/mdl/army1.gfx", utils: new GfxUtils(buildGfxImage()) },
    ]);
    expect(provider.getTexture(0xffffffff)).toBeNull();
  });

  it("pads non-square textures onto the square sampling canvas", () => {
    const provider = new ModelTextureProvider([
      { path: "gfx/mdl/army1.gfx", utils: new GfxUtils(buildGfxImage()) },
    ]);
    const texture = provider.getTexture(0) as THREE.DataTexture;
    expect(texture.image.width).toBe(4);
    expect(texture.image.height).toBe(4); // padded from 4x2
    const data = texture.image.data as Uint8Array;
    // row 0 holds the source's first row (palette entry 0 -> opaque blue)
    expect([...data.subarray(0, 8)]).toEqual([0, 0, 255, 255, 0, 0, 255, 255]);
    // rows 2-3 are transparent padding
    expect([...data.subarray(2 * 4 * 4, 2 * 4 * 4 + 4)]).toEqual([0, 0, 0, 0]);
  });

  it("resolves palette colors through the low 9 render flag bits", () => {
    const provider = new ModelTextureProvider(
      [{ path: "gfx/mdl/army1.gfx", utils: new GfxUtils(buildGfxImage()) }],
      [0xff0000ff, 0x80ff0000],
    );
    expect(provider.getPaletteColor(0)).toBe(0xff0000ff);
    expect(provider.getPaletteColor(1)).toBe(0x80ff0000);
    expect(provider.getPaletteColor(0x201)).toBe(0x80ff0000); // masked to 9 bits -> index 1
    expect(provider.getPaletteColor(500)).toBeNull(); // out of range
  });
});
