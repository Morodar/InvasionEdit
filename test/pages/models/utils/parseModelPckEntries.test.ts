import { describe, expect, it } from "vitest";
import { PckFile } from "../../../../src/domain/pck/PckFile";
import {
  HELP_TEXT_PATH,
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

  it("keeps texte/help.str with later archives overriding earlier ones", () => {
    const helpStr = (text: string): DataView => {
      const dataStart = 0x10 + 4;
      const blockSize = (dataStart + text.length * 2 + 2 + 3) & ~3;
      const view = new DataView(new ArrayBuffer(HEADER_SIZE + blockSize));
      view.setUint32(0x00, 0x00727473, true);
      view.setUint32(0x04, HEADER_SIZE + blockSize, true);
      view.setUint32(0xb0, 1, true);
      view.setUint32(HEADER_SIZE + 0x00, blockSize, true);
      view.setUint32(HEADER_SIZE + 0x04, 1, true);
      view.setUint32(HEADER_SIZE + 0x08, 44, true);
      view.setUint32(HEADER_SIZE + 0x10, dataStart, true);
      for (let i = 0; i < text.length; i++) {
        view.setUint16(HEADER_SIZE + dataStart + i * 2, text.charCodeAt(i), true);
      }
      return view;
    };

    const merged = parseModelPckEntries(
      fakePck([{ name: "texte\\help.str", data: helpStr("base") }]),
    );
    expect(merged.helpText?.blocks[0].strings[0]).toBe("base");

    const patched = parseModelPckEntries(
      fakePck([
        { name: HELP_TEXT_PATH, data: helpStr("base") },
        { name: HELP_TEXT_PATH, data: helpStr("patched") },
      ]),
    );
    expect(patched.helpText?.blocks[0].strings[0]).toBe("patched");

    const unrelated = parseModelPckEntries(
      fakePck([{ name: "texte/menue.str", data: helpStr("menu") }]),
    );
    expect(unrelated.helpText).toBeNull();
  });
});
