import { describe, expect, it } from "vitest";
import { PckFile } from "../../../../src/domain/pck/PckFile";

const EFF_HEADER_SIZE = 0x200;
const EFF_RECORD_SIZE = 0xc0;

/** Minimal valid .eff archive with one smoke-style definition. */
function buildEffImage(definitionId: number, spriteText: string): DataView {
  const view = new DataView(new ArrayBuffer(EFF_HEADER_SIZE + EFF_RECORD_SIZE));
  view.setUint32(0x00, 0x00666665, true); // "eff\0"
  view.setUint32(0x04, view.byteLength, true);
  view.setUint32(0x0c, 0x00040007, true); // converter version
  view.setUint32(0xb0, 1, true); // definition count
  const offset = EFF_HEADER_SIZE;
  view.setUint32(offset + 0x00, 2, true); // transition kind: drifting
  view.setUint32(offset + 0x08, definitionId, true);
  view.setUint32(offset + 0x28, 160, true); // frame advance threshold q4
  for (let index = 0; index < spriteText.length; index++) {
    view.setUint16(offset + 0x7c + index * 2, spriteText.charCodeAt(index), true);
  }
  return view;
}
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

  it("collects effect definitions first-wins per id and normalizes sprite paths", () => {
    const parsed = parseModelPckEntries(
      fakePck([
        { name: "eff\\arbeit.eff", data: buildEffImage(130, "spr\\effekte\\ekkwk0") },
        { name: "eff\\rauch.eff", data: buildEffImage(131, "spr\\effekte\\erarc0") },
      ]),
    );
    expect([...parsed.effectRecords.keys()].sort((a, b) => a - b)).toEqual([
      130,
      131,
    ]);
    expect(parsed.effectRecords.get(131)?.spritePath).toBe(
      "spr/effekte/erarc0.spr",
    );
    expect(parsed.effectRecords.get(131)?.transitionKind).toBe(2);

    // duplicate definition ids keep the first occurrence, damaged files are skipped
    const merged = parseModelPckEntries(
      fakePck([
        { name: "eff\\a.eff", data: buildEffImage(5, "first") },
        { name: "eff\\a.eff", data: buildEffImage(5, "second") },
        { name: "eff\\broken.eff", data: new DataView(new ArrayBuffer(16)) },
      ]),
    );
    expect(merged.effectRecords.size).toBe(1);
    expect(merged.effectRecords.get(5)?.spritePath).toBe("first.spr");
  });
});
