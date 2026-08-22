import { describe, expect, it } from "vitest";
import { ArmUtils } from "../../../../src/domain/arm/ArmUtils";
import { MdlUtils } from "../../../../src/domain/mdl/MdlUtils";
import { SprUtils } from "../../../../src/domain/spr/SprUtils";
import { StrUtils } from "../../../../src/domain/str/StrUtils";
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
function buildMdlImage(nameTextOffset = 0x1234): DataView {
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
  view.setUint32(recordOffset + 0x04, nameTextOffset, true);
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

/**
 * ARM image whose root carries one attached child group (slot 0 -> MDL 43)
 * next to the base variant (slot 0 -> MDL 42).
 */
function buildArmImageWithAttachment(): DataView {
  const recordOffset = HEADER_SIZE;
  const rootOffset = recordOffset + 0x50;
  const childOffset = rootOffset + 0x60;
  const view = new DataView(new ArrayBuffer(childOffset + 0x60));
  view.setUint32(0x00, 0x006d7261, true);
  view.setUint32(0x04, childOffset + 0x60, true);
  view.setUint32(0xb0, 1, true);
  view.setUint32(recordOffset, 0x50, true);
  view.setUint32(recordOffset + 0x08, 300, true);
  view.setUint32(recordOffset + 0x0c, rootOffset, true);

  view.setUint32(rootOffset + 0x08, 1, true); // one child slot
  view.setUint32(rootOffset + 0x0c, childOffset, true); // slot 0
  view.setUint32(rootOffset + 0x20, 42, true);

  view.setUint32(childOffset + 0x20, 43, true); // attached weapon definition
  return view;
}

/**
 * MDL file with two definitions: 42 = chassis whose root has an attachment
 * socket (flags low nibble set, no SPR path) plus a mesh child, 43 = the
 * attached weapon (single SPR node).
 */
function buildChassisAndWeaponMdlImage(): DataView {
  const recordSize = 0xd0;
  const rec0 = HEADER_SIZE;
  const rec1 = rec0 + recordSize;
  const chassisRoot = rec1 + recordSize;
  const socket = chassisRoot + 0x70;
  const chassisChild = socket + 0x70;
  const weaponRoot = chassisChild + 0x70;
  const totalSize = weaponRoot + 0x70;

  const view = new DataView(new ArrayBuffer(totalSize));
  view.setUint32(0x00, 0x006c646d, true);
  view.setUint32(0x04, totalSize, true);
  view.setUint32(0xb0, 2, true);

  // record 0: chassis definition 42
  view.setUint32(rec0, recordSize, true);
  view.setUint32(rec0 + 0x08, 42, true);
  view.setUint32(rec0 + 0x64, chassisRoot, true);
  view.setUint32(chassisRoot + 0x14, 2, true); // socket + mesh child
  view.setUint32(chassisRoot + 0x18, socket, true);
  view.setUint32(chassisRoot + 0x1c, chassisChild, true);
  writeUtf16(view, chassisRoot + 0x38, "spr/test/a", 20);

  view.setUint32(socket + 0x04, 1, true); // flags: attachment socket, no runtime node
  // the socket's authored rotation must become the attached weapon's root rotation
  view.setUint32(socket + 0x08, 16384, true);
  view.setUint32(socket + 0x0c, 45056, true);
  view.setUint32(socket + 0x10, 8192, true);
  writeUtf16(view, socket + 0x38, "", 20);

  writeUtf16(view, chassisChild + 0x38, "spr/test/c.spr", 20);

  // record 1: weapon definition 43
  view.setUint32(rec1, recordSize, true);
  view.setUint32(rec1 + 0x08, 43, true);
  view.setUint32(rec1 + 0x64, weaponRoot, true);
  view.setUint32(weaponRoot + 0x08, 1234, true); // own angles get overridden
  view.setUint32(weaponRoot + 0x0c, 2345, true);
  view.setUint32(weaponRoot + 0x10, 3456, true);
  writeUtf16(view, weaponRoot + 0x38, "spr/test/w.spr", 20);

  return view;
}

/** Minimal help.str with one German locale; string 0x4F holds the model name. */
function buildHelpStrImage(): DataView {
  const stringCount = 0x50; // names start at index 0x4F
  const nameText = "\u8001\u8002Kaserne";

  // lay strings out sequentially: filler strings are bare null terminators
  const offsets: number[] = [];
  let dataCursor = 0x10 + stringCount * 4;
  for (let index = 0; index < stringCount; index++) {
    offsets.push(dataCursor);
    dataCursor += index === 0x4f ? nameText.length * 2 + 2 : 2;
  }
  const blockSize = (dataCursor + 3) & ~3;

  const blockStart = HEADER_SIZE;
  const view = new DataView(new ArrayBuffer(blockStart + blockSize));
  view.setUint32(0x00, 0x00727473, true); // "str\0"
  view.setUint32(0x04, blockStart + blockSize, true);
  view.setUint32(0xb0, 1, true); // locale count
  view.setUint32(blockStart + 0x00, blockSize, true);
  view.setUint32(blockStart + 0x04, stringCount, true);
  view.setUint32(blockStart + 0x08, 44, true); // country code
  offsets.forEach((offset, index) => {
    view.setUint32(blockStart + 0x10 + index * 4, offset, true);
  });
  writeUtf16(view, blockStart + offsets[0x4f], nameText, nameText.length + 1);
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
      helpText: null,
      palFiles: [],
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

  it("emits an empty model when the baseline MDL is not loaded", () => {
    const parsed: ParsedModelFiles = {
      armFiles: [{ path: "arm/building.arm", file: ArmUtils.parse(buildArmImage()) }],
      mdlRecords: new Map(),
      sprFiles: new Map(),
      gfxFiles: [],
      helpText: null,
      palFiles: [],
    };

    const models = resolveModelChain(parsed);
    expect(models).toHaveLength(1);
    // the serialized baseline slot still reports its definition id
    expect(models[0].mdlDefinitionId).toBe(42);
    expect(models[0].nodes).toHaveLength(0);
  });

  it("attaches ARM child groups at MDL socket nodes", () => {
    const mdlFile = MdlUtils.parse(buildChassisAndWeaponMdlImage());
    const parsed: ParsedModelFiles = {
      armFiles: [
        { path: "arm/vehicle.arm", file: ArmUtils.parse(buildArmImageWithAttachment()) },
      ],
      mdlRecords: new Map(mdlFile.records.map((record) => [record.definitionId, record])),
      sprFiles: new Map([
        ["spr/test/a.spr", SprUtils.parse(buildSprImage())],
        ["spr/test/c.spr", SprUtils.parse(buildSprImage())],
        ["spr/test/w.spr", SprUtils.parse(buildSprImage())],
      ]),
      gfxFiles: [],
      helpText: null,
      palFiles: [],
    };

    const models = resolveModelChain(parsed);
    expect(models[0].mdlDefinitionId).toBe(42);

    const paths = models[0].nodes.map((node) => node.sprPath);
    // chassis mesh, chassis child, then the weapon attached at the socket
    expect(paths).toEqual(["spr/test/a.spr", "spr/test/c.spr", "spr/test/w.spr"]);

    const [chassis, chassisChild, weapon] = models[0].nodes;
    expect(chassis.parentIndex).toBe(-1);
    expect(chassisChild.parentIndex).toBe(0);
    expect(chassisChild.childSlot).toBe(1);
    // the weapon root plugs into the socket: parent is the chassis root
    expect(weapon.parentIndex).toBe(0);
    expect(weapon.childSlot).toBe(0);
    // the socket's authored rotation overrides the weapon root rotation
    expect(weapon.mdlNode.localRotationAngles).toEqual([16384, 45056, 8192]);
    // non-root nodes keep their own angles
    expect(chassisChild.mdlNode.localRotationAngles).not.toEqual([16384, 45056, 8192]);
  });

  it("skips ARM child groups without a matching socket", () => {
    const mdlFile = MdlUtils.parse(buildMdlImage());
    const parsed: ParsedModelFiles = {
      armFiles: [
        { path: "arm/vehicle.arm", file: ArmUtils.parse(buildArmImageWithAttachment()) },
      ],
      mdlRecords: new Map(mdlFile.records.map((record) => [record.definitionId, record])),
      sprFiles: new Map([
        ["spr/test/a.spr", SprUtils.parse(buildSprImage())],
        ["spr/test/b.spr", SprUtils.parse(buildSprImage())],
      ]),
      gfxFiles: [],
      helpText: null,
      palFiles: [],
    };

    const models = resolveModelChain(parsed);
    // no socket in the hierarchy -> the weapon group never renders
    expect(models[0].nodes.map((node) => node.sprPath)).toEqual([
      "spr/test/a.spr",
      "spr/test/b.spr",
      "spr/test/missing.spr",
    ]);
  });

  it("resolves localized names from texte/help.str", () => {
    const mdlRecord = MdlUtils.parse(buildMdlImage(0)).records[0];
    const parsed: ParsedModelFiles = {
      armFiles: [{ path: "arm/building.arm", file: ArmUtils.parse(buildArmImage()) }],
      mdlRecords: new Map([[mdlRecord.definitionId, mdlRecord]]),
      sprFiles: new Map(),
      gfxFiles: [],
      palFiles: [],
      helpText: StrUtils.parse(buildHelpStrImage()),
    };

    const models = resolveModelChain(parsed);
    // rich-text command words are stripped and whitespace collapsed
    expect(models[0].name).toBe("Kaserne");
  });

  it("keeps the name null when help.str is missing or the index is out of range", () => {
    const mdlRecord = MdlUtils.parse(buildMdlImage(0x1234)).records[0];
    const parsed: ParsedModelFiles = {
      armFiles: [{ path: "arm/building.arm", file: ArmUtils.parse(buildArmImage()) }],
      mdlRecords: new Map([[mdlRecord.definitionId, mdlRecord]]),
      sprFiles: new Map(),
      gfxFiles: [],
      palFiles: [],
      helpText: StrUtils.parse(buildHelpStrImage()),
    };

    expect(resolveModelChain(parsed)[0].name).toBeNull();

    const withoutHelp: ParsedModelFiles = { ...parsed, helpText: null };
    expect(resolveModelChain(withoutHelp)[0].name).toBeNull();
  });
});
