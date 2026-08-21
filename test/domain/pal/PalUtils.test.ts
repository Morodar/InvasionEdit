import { describe, expect, it } from "vitest";
import { PalUtils } from "../../../src/domain/pal/PalUtils";

const HEADER_SIZE = 0x200;

function buildPalImage(entryCount: number): DataView {
  const view = new DataView(new ArrayBuffer(HEADER_SIZE + entryCount * 8));
  view.setUint32(0x00, 0x006c6170, true); // "pal\0"
  view.setUint32(0xb0, entryCount, true);
  view.setUint32(HEADER_SIZE + 0 * 8, 0xff0000ff, true);
  if (entryCount > 1) {
    view.setUint32(HEADER_SIZE + 1 * 8, 0x8000ff00, true);
  }
  return view;
}

describe("PalUtils", () => {
  it("parses ARGB entries", () => {
    const file = PalUtils.parse(buildPalImage(2));
    expect(file.colorsArgb).toEqual([0xff0000ff, 0x8000ff00]);
  });

  it("rejects images with a broken magic", () => {
    const view = buildPalImage(1);
    view.setUint32(0x00, 0xdeadbeef, true);
    expect(() => PalUtils.parse(view)).toThrow("invalid PAL magic");
  });

  it("rejects truncated palettes", () => {
    const view = new DataView(new ArrayBuffer(HEADER_SIZE));
    view.setUint32(0x00, 0x006c6170, true);
    view.setUint32(0xb0, 4, true); // claims 4 entries but has no payload
    expect(() => PalUtils.parse(view)).toThrow("PAL entry count exceeds payload");
  });
});
