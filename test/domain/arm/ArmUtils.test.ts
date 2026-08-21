import { describe, expect, it } from "vitest";
import { ArmUtils } from "../../../src/domain/arm/ArmUtils";

const HEADER_SIZE = 0x200;

/** Builds an ARM image with one record and a two-node technology-variant hierarchy. */
function buildArmImage(): { view: DataView; rootOffset: number; childOffset: number } {
  const recordOffset = HEADER_SIZE;
  const recordSize = 0x50;
  const rootOffset = recordOffset + recordSize; // 0x250
  const childOffset = rootOffset + 0x60; // 0x2b0
  const totalSize = childOffset + 0x60;

  const view = new DataView(new ArrayBuffer(totalSize));
  view.setUint32(0x00, 0x006d7261, true); // "arm\0"
  view.setUint32(0x04, totalSize, true);
  view.setUint32(0xb0, 1, true); // record count

  view.setUint32(recordOffset + 0x00, recordSize, true);
  view.setUint32(recordOffset + 0x08, 300, true); // registry id
  view.setUint32(recordOffset + 0x0c, rootOffset, true);

  // root node: first variant slot selects definition 42
  view.setUint32(rootOffset + 0x08, 1, true); // child count
  view.setUint32(rootOffset + 0x0c, childOffset, true);
  view.setUint32(rootOffset + 0x20, 42, true);
  view.setUint32(rootOffset + 0x24, 43, true);

  // child node: first slot empty -> base variant is the second slot
  view.setUint32(childOffset + 0x08, 0, true);
  view.setUint32(childOffset + 0x20, 0, true);
  view.setUint32(childOffset + 0x24, 55, true);

  return { view, rootOffset, childOffset };
}

describe("ArmUtils", () => {
  describe("given a synthetic ARM image", () => {
    const { view, rootOffset, childOffset } = buildArmImage();
    const file = ArmUtils.parse(view);
    const root = file.records[0].rootNode;
    if (!root) {
      throw new Error("expected the synthetic ARM record to have a root node");
    }

    it("parses records with registry id and root node offset", () => {
      expect(file.records).toHaveLength(1);
      expect(file.records[0].registryId).toBe(300);
      expect(file.records[0].rootNodeOffset).toBe(rootOffset);
    });

    it("parses the node hierarchy and its eight variant slots", () => {
      expect(root.serializedOffset).toBe(rootOffset);
      expect(root.childCount).toBe(1);
      expect(root.childOffsets).toEqual([childOffset]);
      expect(root.modelDefinitionIds).toEqual([42, 43, 0, 0, 0, 0, 0, 0]);
    });

    it("exposes child nodes for technology variants", () => {
      expect(root.children).toHaveLength(1);
      expect(root.children[0].serializedOffset).toBe(childOffset);
      expect(root.children[0].modelDefinitionIds[1]).toBe(55);
    });
  });

  it("rejects cyclic hierarchies", () => {
    const view = new DataView(new ArrayBuffer(HEADER_SIZE + 0xc0));
    view.setUint32(0x00, 0x006d7261, true);
    view.setUint32(0x04, HEADER_SIZE + 0xc0, true);
    view.setUint32(0xb0, 1, true);
    const rootOffset = HEADER_SIZE + 0x50;
    view.setUint32(HEADER_SIZE, 0x50, true);
    view.setUint32(HEADER_SIZE + 0x0c, rootOffset, true);
    view.setUint32(rootOffset + 0x08, 1, true);
    view.setUint32(rootOffset + 0x0c, rootOffset, true); // self reference
    expect(() => ArmUtils.parse(view)).toThrow("ARM technology-variant hierarchy contains a cycle");
  });

  it("supports records without a root node", () => {
    const view = new DataView(new ArrayBuffer(HEADER_SIZE + 0x10));
    view.setUint32(0x00, 0x006d7261, true);
    view.setUint32(0x04, HEADER_SIZE + 0x10, true);
    view.setUint32(0xb0, 1, true);
    view.setUint32(HEADER_SIZE, 0x10, true);
    view.setUint32(HEADER_SIZE + 0x08, 301, true);
    view.setUint32(HEADER_SIZE + 0x0c, 0, true);

    const file = ArmUtils.parse(view);
    expect(file.records[0].registryId).toBe(301);
    expect(file.records[0].rootNode).toBeNull();
  });
});
