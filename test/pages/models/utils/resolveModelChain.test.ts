import { describe, expect, it } from "vitest";
import { ArmUtils } from "../../../../src/domain/arm/ArmUtils";
import { MdlUtils } from "../../../../src/domain/mdl/MdlUtils";
import { SprUtils } from "../../../../src/domain/spr/SprUtils";
import { ParsedModelFiles } from "../../../../src/pages/models/utils/parseModelPckEntries";
import { resolveModelChain } from "../../../../src/pages/models/utils/resolveModelChain";

const HEADER_SIZE = 0x200;

function writeUtf16(view: DataView, offset: number, text: string, maxChars: number) {
  for (let i = 0; i < maxChars; i++) {
    view.setUint16(offset + i * 2, i < text.length ? text.charCodeAt(i) : 0, true);
  }
}

/** Minimal SPR image with a single empty LOD group. */
function buildSprImage(): DataView {
  const view = new DataView(new ArrayBuffer(HEADER_SIZE + 0x20));
  view.setUint32(0x00, 0x00727073, true);
  view.setUint32(0x04, HEADER_SIZE + 0x20, true);
  view.setUint32(0x0c, 0x00020007, true);
  view.setUint32(0xb0, 1, true);
  view.setUint32(HEADER_SIZE, 0x20, true); // group size
  return view;
}

/** MDL image with one record whose root node has two children. */
function buildMdlImage(): DataView {
  const recordOffset = HEADER_SIZE;
  const recordSize = 0xd0;
  const rootOffset = recordOffset + recordSize;
  const childA = rootOffset + 0x70;
  const childB = childA + 0x70;
  const totalSize = childB + 0x70;

  const view = new DataView(new ArrayBuffer(totalSize));
  view.setUint32(0x00, 0x006c646d, true);
  view.setUint32(0x04, totalSize, true);
  view.setUint32(0xb0, 1, true);
  view.setUint32(recordOffset, recordSize, true);
  view.setUint32(recordOffset + 0x08, 42, true); // definition id
  view.setUint32(recordOffset + 0x64, rootOffset, true);

  view.setUint32(rootOffset + 0x14, 2, true); // two children
  view.setUint32(rootOffset + 0x18, childA, true);
  view.setUint32(rootOffset + 0x1c, childB, true);
  writeUtf16(view, rootOffset + 0x38, "spr/test/a", 20);

  view.setUint32(childA + 0x14, 0, true);
  writeUtf16(view, childA + 0x38, "spr/test/b.spr", 20);

  view.setUint32(childB + 0x14, 0, true);
  writeUtf16(view, childB + 0x38, "spr/test/missing", 20);

  return view;
}

function buildArmImage(): DataView {
  const recordOffset = HEADER_SIZE;
  const rootOffset = recordOffset + 0x50;
  const view = new DataView(new ArrayBuffer(rootOffset + 0x60));
  view.setUint32(0x00, 0x006d7261, true);
  view.setUint32(0x04, rootOffset + 0x60, true);
  view.setUint32(0xb0, 1, true);
  view.setUint32(recordOffset, 0x50, true);
  view.setUint32(recordOffset + 0x08, 300, true); // registry id
  view.setUint32(recordOffset + 0x0c, rootOffset, true);
  view.setUint32(rootOffset + 0x20, 42, true); // base variant -> MDL definition 42
  return view;
}

describe("resolveModelChain", () => {
  it("resolves the ARM to MDL to SPR chain with hierarchy metadata", () => {
    const parsed: ParsedModelFiles = {
      armFiles: [{ path: "arm/building.arm", file: ArmUtils.parse(buildArmImage()) }],
      mdlRecords: new Map(
        MdlUtils.parse(buildMdlImage()).records.map((record) => [record.definitionId, record]),
      ),
      sprFiles: new Map([
        ["spr/test/a.spr", SprUtils.parse(buildSprImage())],
        ["spr/test/b.spr", SprUtils.parse(buildSprImage())],
      ]),
      gfxFiles: [],
    };

    const models = resolveModelChain(parsed);
    expect(models).toHaveLength(1);

    const model = models[0];
    expect(model.armFilePath).toBe("arm/building.arm");
    expect(model.armRegistryId).toBe(300);
    expect(model.mdlDefinitionId).toBe(42);

    expect(model.nodes).toHaveLength(3);
    const [root, childA, childB] = model.nodes;

    expect(root.parentIndex).toBe(-1);
    expect(root.childSlot).toBe(0);
    expect(root.depth).toBe(0);
    expect(root.sprPath).toBe("spr/test/a.spr");
    expect(root.sprFile).not.toBeNull();
    expect(root.attachmentTranslation).toEqual({ x: 0, y: 0, z: 0 });

    expect(childA.parentIndex).toBe(0);
    expect(childA.childSlot).toBe(0);
    expect(childA.depth).toBe(1);
    expect(childA.sprPath).toBe("spr/test/b.spr");
    expect(childA.sprFile).not.toBeNull();

    // missing sprite resolves to a null file without breaking the chain
    expect(childB.parentIndex).toBe(0);
    expect(childB.childSlot).toBe(1);
    expect(childB.depth).toBe(1);
    expect(childB.sprPath).toBe("spr/test/missing.spr");
    expect(childB.sprFile).toBeNull();
  });

  it("emits an empty model when the ARM variant slot is unresolved", () => {
    const parsed: ParsedModelFiles = {
      armFiles: [{ path: "arm/building.arm", file: ArmUtils.parse(buildArmImage()) }],
      mdlRecords: new Map(),
      sprFiles: new Map(),
      gfxFiles: [],
    };

    const models = resolveModelChain(parsed);
    expect(models).toHaveLength(1);
    expect(models[0].mdlDefinitionId).toBeNull();
    expect(models[0].nodes).toHaveLength(0);
  });
});
