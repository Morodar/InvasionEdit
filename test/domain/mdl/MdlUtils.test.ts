import { describe, expect, it } from "vitest";
import { MdlUtils } from "../../../src/domain/mdl/MdlUtils";

const HEADER_SIZE = 0x200;

function writeUtf16(view: DataView, offset: number, text: string, maxChars: number) {
  for (let i = 0; i < maxChars; i++) {
    view.setUint16(offset + i * 2, i < text.length ? text.charCodeAt(i) : 0, true);
  }
}

/** Builds an MDL image with one record and a two-node hierarchy carrying inline SPR paths. */
function buildMdlImage(): { view: DataView; rootOffset: number; childOffset: number } {
  const recordOffset = HEADER_SIZE;
  const recordSize = 0xd0;
  const rootOffset = recordOffset + recordSize; // 0x2d0
  const childOffset = rootOffset + 0x70; // 0x340
  const totalSize = childOffset + 0x70;

  const view = new DataView(new ArrayBuffer(totalSize));
  view.setUint32(0x00, 0x006c646d, true); // "mdl\0"
  view.setUint32(0x04, totalSize, true);
  view.setUint32(0xb0, 1, true); // record count

  // record
  view.setUint32(recordOffset + 0x00, recordSize, true);
  view.setUint32(recordOffset + 0x04, 0x1234, true); // name text offset
  view.setUint32(recordOffset + 0x08, 42, true); // definition id
  view.setInt32(recordOffset + 0x0c, 2048, true); // class step q12 -> 0.5
  view.setInt32(recordOffset + 0x10, 100, true); // yaw max velocity
  view.setInt32(recordOffset + 0x14, 50, true); // pitch max velocity
  view.setUint32(recordOffset + 0x2c, 99, true); // shot definition id
  view.setUint32(recordOffset + 0x30, 30, true); // reload ticks
  view.setUint32(recordOffset + 0x4c, 7, true); // runtime class id
  view.setUint32(recordOffset + 0x5c, 3, true); // shot impact class index
  view.setInt32(recordOffset + 0x60, 500, true); // maximum integrity
  view.setUint32(recordOffset + 0x64, rootOffset, true);
  view.setUint32(recordOffset + 0x68, 1, true); // runtime render flags
  view.setUint32(recordOffset + 0xc0, 2, true); // placement occupancy class

  // root node
  view.setUint32(rootOffset + 0x00, 0x60, true);
  view.setUint32(rootOffset + 0x04, 0, true); // flags
  view.setUint32(rootOffset + 0x08, 0x4000, true); // turn16 angle 0
  view.setUint32(rootOffset + 0x0c, 0x8000, true); // turn16 angle 1
  view.setUint32(rootOffset + 0x10, 0xc000, true); // turn16 angle 2
  view.setUint32(rootOffset + 0x14, 1, true); // child count
  view.setUint32(rootOffset + 0x18, childOffset, true);
  writeUtf16(view, rootOffset + 0x38, "spr\\test\\a", 20);

  // child node
  view.setUint32(childOffset + 0x00, 0x60, true);
  view.setUint32(childOffset + 0x14, 0, true);
  writeUtf16(view, childOffset + 0x38, "spr/test/b.spr", 20);

  return { view, rootOffset, childOffset };
}

describe("MdlUtils", () => {
  describe("given a synthetic MDL image", () => {
    const { view, rootOffset, childOffset } = buildMdlImage();
    const file = MdlUtils.parse(view);

    it("parses the record fields", () => {
      expect(file.records).toHaveLength(1);
      const record = file.records[0];
      expect(record.definitionId).toBe(42);
      expect(record.nameTextOffset).toBe(0x1234);
      expect(record.classStepQ12).toBe(2048); // raw q12
      expect(record.yawMaxVelocity).toBe(100);
      expect(record.pitchMaxVelocity).toBe(50);
      expect(record.shotDefinitionId).toBe(99);
      expect(record.reloadTicks).toBe(30);
      expect(record.runtimeClassId).toBe(7);
      expect(record.shotImpactClassIndex).toBe(3);
      expect(record.maximumIntegrity).toBe(500);
      expect(record.rootNodeOffset).toBe(rootOffset);
      expect(record.runtimeRenderFlags).toBe(1);
      expect(record.placementOccupancyClass).toBe(2);
    });

    it("parses the node hierarchy in depth-first order", () => {
      const nodes = file.records[0].hierarchyNodes;
      expect(nodes).toHaveLength(2);
      expect(nodes[0].serializedOffset).toBe(rootOffset);
      expect(nodes[0].childCount).toBe(1);
      expect(nodes[0].childOffsets).toEqual([childOffset]);
      expect(nodes[0].localRotationAngles).toEqual([0x4000, 0x8000, 0xc000]);
      expect(nodes[1].serializedOffset).toBe(childOffset);
      expect(nodes[1].childCount).toBe(0);
    });

    it("reads inline UTF-16 sprite paths and appends missing extensions", () => {
      const nodes = file.records[0].hierarchyNodes;
      expect(nodes[0].spritePath).toBe("spr/test/a.spr");
      expect(nodes[1].spritePath).toBe("spr/test/b.spr");
      expect(file.records[0].spritePath).toBe("spr/test/a.spr");
    });
  });

  it("falls back to scanning the record slice when no node carries a path", () => {
    const view = new DataView(new ArrayBuffer(HEADER_SIZE + 0x40));
    view.setUint32(0x00, 0x006c646d, true);
    view.setUint32(0x04, HEADER_SIZE + 0x40, true);
    view.setUint32(0xb0, 1, true);
    view.setUint32(HEADER_SIZE, 0x40, true); // record size
    view.setUint32(HEADER_SIZE + 0x08, 7, true); // definition id
    writeUtf16(view, HEADER_SIZE + 0x20, "spr\\scan\\path", 16);

    const file = MdlUtils.parse(view);
    expect(file.records[0].definitionId).toBe(7);
    expect(file.records[0].rootNodeOffset).toBe(0);
    expect(file.records[0].spritePath).toBe("spr/scan/path.spr");
  });

  it("rejects records without any serialized sprite path", () => {
    const view = new DataView(new ArrayBuffer(HEADER_SIZE + 0x40));
    view.setUint32(0x00, 0x006c646d, true);
    view.setUint32(0x04, HEADER_SIZE + 0x40, true);
    view.setUint32(0xb0, 1, true);
    view.setUint32(HEADER_SIZE, 0x40, true);
    expect(() => MdlUtils.parse(view)).toThrow("MDL definition has no serialized SPR path");
  });
});
