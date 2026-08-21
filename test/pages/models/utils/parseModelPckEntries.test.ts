import { describe, expect, it } from "vitest";
import { PckFile } from "../../../../src/domain/pck/PckFile";
import {
  parseModelPckEntries,
} from "../../../../src/pages/models/utils/parseModelPckEntries";

const HEADER_SIZE = 0x200;
const PALETTE_OFFSET = HEADER_SIZE;
const TABLE_OFFSET = PALETTE_OFFSET + 256 * 8;

function buildGfxImage(): DataView {
  const view = new DataView(new ArrayBuffer(TABLE_OFFSET + 0x40 + 8));
  view.setUint32(0x00, 0x00786667, true);
  view.setUint32(0xb0, 1, true); // subresource count
  view.setUint32(0xb4, 1, true); // palette bank count
  view.setUint32(0xb8, TABLE_OFFSET, true);

  const entry = TABLE_OFFSET;
  view.setUint32(entry + 0x08, 0, true); // palette bank
  view.setUint32(entry + 0x0c, TABLE_OFFSET + 0x40, true); // pixel data offset
  view.setUint32(entry + 0x18, 4, true); // pixel width
  view.setUint32(entry + 0x1c, 2, true); // pixel height
  return view;
}

function fakePck(entries: { name: string; data: DataView }[]): PckFile {
  return {
    filename: "test.pck",
    header: {} as PckFile["header"],
    pckFileEntries: entries.map((entry) => ({
      name: entry.name,
      dataBytes: entry.data,
    })) as PckFile["pckFileEntries"],
  };
}

describe("parseModelPckEntries", () => {
  it("deduplicates archive entries with the same asset path", () => {
    // GRAPHIK.PCK ships some engine assets (e.g. engine\font.gfx) twice
    const pck = fakePck([
      { name: "engine\\font.gfx", data: buildGfxImage() },
      { name: "engine\\font.gfx", data: buildGfxImage() },
      { name: "engine\\fontk.gfx", data: buildGfxImage() },
      { name: "engine\\fontk.gfx", data: buildGfxImage() },
      { name: "gfx\\mdl\\army1.gfx", data: buildGfxImage() },
    ]);

    const parsed = parseModelPckEntries(pck);
    expect(parsed.gfxFiles.map((gfx) => gfx.path)).toEqual([
      "engine/font.gfx",
      "engine/fontk.gfx",
      "gfx/mdl/army1.gfx",
    ]);
  });

  it("skips entries that fail to parse", () => {
    const broken = new DataView(new ArrayBuffer(HEADER_SIZE));
    const pck = fakePck([
      { name: "broken.gfx", data: broken },
      { name: "ok.gfx", data: buildGfxImage() },
    ]);

    const parsed = parseModelPckEntries(pck);
    expect(parsed.gfxFiles.map((gfx) => gfx.path)).toEqual(["ok.gfx"]);
  });
});
