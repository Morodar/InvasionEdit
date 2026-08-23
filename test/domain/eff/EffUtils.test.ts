import { describe, expect, it } from "vitest";
import { EffUtils, normalizeEffectSpritePath } from "../../../src/domain/eff/EffUtils";
import { EffRecord } from "../../../src/domain/eff/EffFile";

const HEADER_SIZE = 0x200;
const RECORD_SIZE = 0xc0;
const CONVERTER_VERSION = 0x00040007;

function writeRecord(
  view: DataView,
  offset: number,
  overrides: Partial<EffRecord> & { spriteText?: string },
): void {
  const record: EffRecord = {
    transitionKind: 1,
    definitionId: 131,
    runtimeValue0C: 9,
    linkedEffectPresent: 0,
    linkedEffectId: 0,
    linkedShotPresent: 0,
    linkedShotId: 0,
    movementSpeedQ12: 48,
    terrainGridMaskIndex: -1,
    creationFlags: 0,
    shadingColorArgb: 0,
    shadingTransitionTicks: 0,
    shadingReleaseTransitionTicks: 0,
    frameAdvanceThresholdQ4: 160,
    shadingStartFrame: 0,
    shadingStopFrame: 0,
    periodicEffectId: 0,
    periodicEffectIntervalTicks: 0,
    alphaFadeInTicks: 8,
    alphaFadeOutTicks: 80,
    stateTintArgb: 0xff000000,
    modelScaleXQ12: 4000,
    modelScaleYQ12: 9000,
    positionedSoundArgument0: 0,
    positionedSoundArgument1: 0,
    spritePath: "",
    ...overrides,
  };
  const text = overrides.spriteText ?? record.spritePath;
  view.setUint32(offset + 0x00, record.transitionKind, true);
  view.setUint32(offset + 0x08, record.definitionId, true);
  view.setUint32(offset + 0x0c, record.runtimeValue0C, true);
  view.setInt32(offset + 0x20, record.movementSpeedQ12, true);
  view.setUint32(offset + 0x28, record.frameAdvanceThresholdQ4, true);
  view.setUint32(offset + 0x30, record.creationFlags, true);
  view.setUint32(offset + 0x34, record.shadingColorArgb, true);
  view.setUint32(offset + 0x40, record.shadingStartFrame, true);
  view.setUint32(offset + 0x44, record.shadingStopFrame, true);
  view.setUint32(offset + 0x50, record.alphaFadeInTicks, true);
  view.setUint32(offset + 0x54, record.alphaFadeOutTicks, true);
  view.setInt32(offset + 0x64, record.modelScaleXQ12, true);
  view.setInt32(offset + 0x68, record.modelScaleYQ12, true);
  for (let index = 0; index < text.length && index < 33; index++) {
    view.setUint16(offset + 0x7c + index * 2, text.charCodeAt(index), true);
  }
}

function buildEff(records: Array<Partial<EffRecord> & { spriteText?: string }>): ArrayBuffer {
  const buffer = new ArrayBuffer(HEADER_SIZE + records.length * RECORD_SIZE);
  const view = new DataView(buffer);
  // "eff\0" little endian
  view.setUint32(0x00, 0x00666665, true);
  view.setUint32(0x04, buffer.byteLength, true);
  view.setUint32(0x0c, CONVERTER_VERSION, true);
  view.setUint32(0xb0, records.length, true);
  records.forEach((record, index) => {
    writeRecord(view, HEADER_SIZE + index * RECORD_SIZE, record);
  });
  return buffer;
}

describe("EffUtils", () => {
  it("parses a smoke-style definition record", () => {
    const file = EffUtils.parse(
      new DataView(buildEff([{ spriteText: "spr\\effekte\\erarc0", definitionId: 131 }])),
    );
    expect(file.records).toHaveLength(1);
    const record = file.records[0];
    expect(record.definitionId).toBe(131);
    expect(record.transitionKind).toBe(1);
    expect(record.movementSpeedQ12).toBe(48);
    expect(record.frameAdvanceThresholdQ4).toBe(160);
    expect(record.alphaFadeInTicks).toBe(8);
    expect(record.alphaFadeOutTicks).toBe(80);
    expect(record.modelScaleXQ12).toBe(4000);
    expect(record.modelScaleYQ12).toBe(9000);
    expect(record.spritePath).toBe("spr/effekte/erarc0.spr");
  });

  it("keeps explicit .spr paths untouched and lowercases mixed case", () => {
    expect(normalizeEffectSpritePath("spr/effekte/ElPro0.SPR")).toBe(
      "spr/effekte/elpro0.spr",
    );
    expect(normalizeEffectSpritePath("")).toBe("");
  });

  it("rejects damaged archives", () => {
    const good = () => new DataView(buildEff([{ spriteText: "a.spr" }]));
    expect(() => EffUtils.parse(good())).not.toThrow();

    const badMagic = good();
    badMagic.setUint32(0x00, 0xdeadbeef, true);
    expect(() => EffUtils.parse(badMagic)).toThrow(/magic/i);

    const badVersion = good();
    badVersion.setUint32(0x0c, 7, true);
    expect(() => EffUtils.parse(badVersion)).toThrow(/converter version/i);

    const badCount = good();
    badCount.setUint32(0xb0, 5, true);
    expect(() => EffUtils.parse(badCount)).toThrow(/count does not match/i);

    const badKind = new DataView(
      buildEff([{ spriteText: "a.spr", transitionKind: 5 }]),
    );
    expect(() => EffUtils.parse(badKind)).toThrow(/transition kind/i);

    const noSprite = new DataView(buildEff([{ spriteText: "" }]));
    expect(() => EffUtils.parse(noSprite)).toThrow(/sprite path/i);
  });

  it("first parsed definition wins per id when merging archives", () => {
    // exercised through parseModelPckEntries; here just document record ids
    const file = EffUtils.parse(
      new DataView(
        buildEff([
          { definitionId: 5, spriteText: "a.spr" },
          { definitionId: 5, spriteText: "b.spr" },
        ]),
      ),
    );
    expect(file.records.map((record) => record.spritePath)).toEqual([
      "a.spr",
      "b.spr",
    ]);
  });
});
