import { describe, expect, it } from "vitest";
import { StrUtils, normalizeAssetDisplayName } from "../../../src/domain/str/StrUtils";

const HEADER_SIZE = 0x200;

function writeUtf16(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) {
    view.setUint16(offset + i * 2, text.charCodeAt(i), true);
  }
  view.setUint16(offset + text.length * 2, 0, true);
}

interface BlockSpec {
  countryCode: number;
  strings: string[];
}

/** Builds a STR image with one locale block per spec. */
function buildStrImage(blocks: BlockSpec[]): DataView {
  const layouts = blocks.map((block) => {
    const dataStart = 0x10 + block.strings.length * 4;
    const offsets: number[] = [];
    let dataCursor = dataStart;
    for (const text of block.strings) {
      offsets.push(dataCursor);
      // pad every string to even alignment
      dataCursor += text.length * 2 + 2;
      if (dataCursor % 2 !== 0) {
        dataCursor += 1;
      }
    }
    return { block, offsets, blockSize: (dataCursor + 3) & ~3 };
  });

  let cursor = HEADER_SIZE;
  const blockStarts = layouts.map((layout) => {
    const start = cursor;
    cursor += layout.blockSize;
    return start;
  });

  const view = new DataView(new ArrayBuffer(cursor));
  view.setUint32(0x00, 0x00727473, true);
  view.setUint32(0x04, cursor, true);
  view.setUint32(0xb0, blocks.length, true);

  layouts.forEach((layout, index) => {
    const start = blockStarts[index];
    view.setUint32(start + 0x00, layout.blockSize, true);
    view.setUint32(start + 0x04, layout.block.strings.length, true);
    view.setUint32(start + 0x08, layout.block.countryCode, true);
    layout.block.strings.forEach((text, stringIndex) => {
      view.setUint32(start + 0x10 + stringIndex * 4, layout.offsets[stringIndex], true);
      writeUtf16(view, start + layout.offsets[stringIndex], text);
    });
  });
  return view;
}

describe("StrUtils", () => {
  it("parses locale blocks and decodes UTF-16 strings", () => {
    const file = StrUtils.parse(
      buildStrImage([
        { countryCode: 44, strings: ["Barracks", "Forge"] },
        { countryCode: 49, strings: ["Kaserne", "Schmiede"] },
      ]),
    );

    expect(file.blocks).toHaveLength(2);
    expect(file.blocks[0]).toEqual({ countryCode: 44, strings: ["Barracks", "Forge"] });
    expect(file.blocks[1].strings).toEqual(["Kaserne", "Schmiede"]);
  });

  it("selects the preferred country with fallback to 44 then first", () => {
    const utils = StrUtils.fromArrayBuffer(
      buildStrImage([
        { countryCode: 44, strings: ["english"] },
        { countryCode: 49, strings: ["deutsch"] },
      ]).buffer,
    );
    expect(utils.string(0, 49)).toBe("deutsch");
    expect(utils.string(0)).toBe("english");
    expect(utils.stringCount(49)).toBe(1);

    const onlyGerman = StrUtils.fromArrayBuffer(
      buildStrImage([{ countryCode: 49, strings: ["deutsch"] }]).buffer,
    );
    expect(onlyGerman.string(0)).toBe("deutsch");
  });

  it("rejects out-of-range string indexes", () => {
    const utils = StrUtils.fromArrayBuffer(buildStrImage([{ countryCode: 44, strings: ["a"] }]).buffer);
    expect(() => utils.string(1)).toThrow("STR string index exceeds selected locale block");
    expect(() => utils.string(-1)).toThrow("STR string index exceeds selected locale block");
  });

  it("rejects corrupt headers", () => {
    const badMagic = buildStrImage([{ countryCode: 44, strings: ["a"] }]);
    badMagic.setUint32(0x00, 0x12345678, true);
    expect(() => StrUtils.parse(badMagic)).toThrow("invalid STR text-resource magic");

    const badSize = buildStrImage([{ countryCode: 44, strings: ["a"] }]);
    badSize.setUint32(0x04, 9999, true);
    expect(() => StrUtils.parse(badSize)).toThrow("STR allocation size mismatch");
  });

  describe("normalizeAssetDisplayName", () => {
    it("strips rich-text command words and collapses whitespace", () => {
      expect(normalizeAssetDisplayName("\u8001\u8002Kaserne")).toBe("Kaserne");
      expect(normalizeAssetDisplayName("Foo\u8010Bar")).toBe("Foo Bar");
      expect(normalizeAssetDisplayName("  a \t b\u0000c ")).toBe("a b c");
      expect(normalizeAssetDisplayName("\u8001")).toBe("");
    });
  });
});
