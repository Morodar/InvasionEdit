import { describe, expect, it } from "vitest";
import {
  normalizeSpriteTextureUV,
  SPR_UNTEXTURED_SUBRESOURCE,
  SprUtils,
} from "../../../src/domain/spr/SprUtils";

const GROUP_OFFSET = 0x200;
const GROUP_HEADER_SIZE = 0x20;
const RECORD_HEADER_SIZE = 0x20;
const VERTEX_STRIDE = 0x40;
const TRIANGLE_STRIDE = 0x40;

/** Builds a minimal SPR image with one LOD group, one mesh record, three vertices and two triangles. */
function buildSprImage(): DataView {
  const vertexStart = GROUP_OFFSET + GROUP_HEADER_SIZE + RECORD_HEADER_SIZE;
  const triangleStart = vertexStart + 3 * VERTEX_STRIDE;
  const recordSize = RECORD_HEADER_SIZE + 3 * VERTEX_STRIDE + 2 * TRIANGLE_STRIDE;
  const groupSize = GROUP_HEADER_SIZE + recordSize;
  const lookupOffset = GROUP_OFFSET + groupSize;
  const totalSize = lookupOffset + 0x10;

  const view = new DataView(new ArrayBuffer(totalSize));
  // header
  view.setUint32(0x00, 0x00727073, true); // "spr\0"
  view.setUint32(0x04, totalSize, true);
  view.setUint32(0x0c, 0x00020007, true);
  view.setUint32(0xb0, 1, true); // group count
  view.setUint32(0xb8, 777, true); // registry id
  writeQ12Vec3(view, 0xc0, [-1, -2, -3]);
  writeQ12Vec3(view, 0xcc, [1, 2, 3]);
  view.setInt32(0xd8, 8192, true); // bounding radius -> 2.0
  view.setInt32(0xdc, 4096, true); // height offset -> 1.0
  view.setUint32(0xe4, lookupOffset, true);
  view.setUint32(0xe8, 1, true);

  // LOD group
  view.setUint32(GROUP_OFFSET, groupSize, true);
  view.setUint32(GROUP_OFFSET + 0x04, 1, true); // record count
  view.setUint32(GROUP_OFFSET + 0x0c, 5, true); // flags

  // mesh record
  const recordOffset = GROUP_OFFSET + GROUP_HEADER_SIZE;
  view.setUint32(recordOffset, recordSize, true);
  view.setUint32(recordOffset + 0x04, 3, true); // mesh group selector mask
  view.setUint32(recordOffset + 0x08, 3, true); // vertex count
  view.setUint32(recordOffset + 0x0c, 2, true); // triangle count
  view.setUint32(recordOffset + 0x10, 9, true); // record flags

  // vertices: v0=(0,0,0) v1=(1,0,0) v2=(0,1,0), all normals +z
  writeQ12Vec3(view, vertexStart + 0x00, [0, 0, 0]);
  writeQ12Vec3(view, vertexStart + 0x10, [0, 0, 1]);
  writeQ12Vec3(view, vertexStart + VERTEX_STRIDE + 0x00, [1, 0, 0]);
  writeQ12Vec3(view, vertexStart + VERTEX_STRIDE + 0x10, [0, 0, 1]);
  writeQ12Vec3(view, vertexStart + 2 * VERTEX_STRIDE + 0x00, [0, 1, 0]);
  writeQ12Vec3(view, vertexStart + 2 * VERTEX_STRIDE + 0x10, [0, 0, 1]);

  // triangle 0: correctly wound (geometric normal matches plane normal +z)
  writeTriangle(view, triangleStart, {
    vertexOffsets: [vertexStart, vertexStart + VERTEX_STRIDE, vertexStart + 2 * VERTEX_STRIDE],
    us: [0, 4096, 0],
    vs: [0, 0, 4096],
    planeNormal: [0, 0, 1],
    subresource: 7,
    renderFlags: 0xa,
  });
  // triangle 1: same corners, opposing plane normal -> winding correction expected
  writeTriangle(view, triangleStart + TRIANGLE_STRIDE, {
    vertexOffsets: [vertexStart, vertexStart + VERTEX_STRIDE, vertexStart + 2 * VERTEX_STRIDE],
    us: [0, 4096, 0],
    vs: [0, 0, 4096],
    planeNormal: [0, 0, -1],
    subresource: SPR_UNTEXTURED_SUBRESOURCE,
    renderFlags: 0,
  });

  // lookup record
  view.setUint32(lookupOffset, 0x1234, true);
  writeQ12Vec3(view, lookupOffset + 0x04, [1, 2, -1]);

  return view;
}

function writeTriangle(
  view: DataView,
  offset: number,
  options: {
    vertexOffsets: number[];
    us: number[];
    vs: number[];
    planeNormal: number[];
    subresource: number;
    renderFlags: number;
  },
) {
  const pointerFields = [0x00, 0x0c, 0x18];
  const uFields = [0x04, 0x10, 0x1c];
  const vFields = [0x08, 0x14, 0x20];
  for (let corner = 0; corner < 3; corner++) {
    view.setUint32(offset + pointerFields[corner], options.vertexOffsets[corner], true);
    view.setInt32(offset + uFields[corner], options.us[corner], true);
    view.setInt32(offset + vFields[corner], options.vs[corner], true);
  }
  writeQ12Vec3(view, offset + 0x24, options.planeNormal);
  view.setUint32(offset + 0x30, options.subresource, true);
  view.setUint32(offset + 0x34, options.renderFlags, true);
}

function writeQ12Vec3(view: DataView, offset: number, values: number[]) {
  view.setInt32(offset, Math.round(values[0] * 4096), true);
  view.setInt32(offset + 4, Math.round(values[1] * 4096), true);
  view.setInt32(offset + 8, Math.round(values[2] * 4096), true);
}

describe("SprUtils", () => {
  describe("given a synthetic SPR image", () => {
    const file = SprUtils.parse(buildSprImage());

    it("parses the header fields", () => {
      expect(file.registryId).toBe(777);
      expect(file.boundsMin).toEqual({ x: -1, y: -2, z: -3 });
      expect(file.boundsMax).toEqual({ x: 1, y: 2, z: 3 });
      expect(file.boundingRadius).toBeCloseTo(2.0);
      expect(file.placementHeightOffset).toBeCloseTo(1.0);
    });

    it("parses lookup records", () => {
      expect(file.lookupRecords).toHaveLength(1);
      expect(file.lookupRecords[0].packedKey).toBe(0x1234);
      expect(file.lookupRecords[0].localTranslation).toEqual({ x: 1, y: 2, z: -1 });
    });

    it("parses LOD groups and mesh records", () => {
      expect(file.lodGroups).toHaveLength(1);
      expect(file.lodGroups[0].flags).toBe(5);
      expect(file.lodGroups[0].mesh.vertices).toHaveLength(6);
      expect(file.lodGroups[0].mesh.indices).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it("expands triangles into per-corner vertices with record metadata", () => {
      const vertices = file.lodGroups[0].mesh.vertices;
      expect(vertices[0]).toEqual({
        position: { x: 0, y: 0, z: 0 },
        normal: { x: 0, y: 0, z: 1 },
        textureU: 0,
        textureV: 0,
        textureSubresource: 7,
        renderFlags: 0xa,
        meshRecordFlags: 9,
        meshGroupSelectorMask: 3,
      });
      expect(vertices[1].position).toEqual({ x: 1, y: 0, z: 0 });
      expect(vertices[1].textureU).toBeCloseTo(1.0);
      expect(vertices[2].position).toEqual({ x: 0, y: 1, z: 0 });
      expect(vertices[2].textureV).toBeCloseTo(1.0);
    });

    it("canonicalizes winding against the serialized plane normal", () => {
      const vertices = file.lodGroups[0].mesh.vertices;
      // triangle 0 matched the plane normal and kept its order
      expect(vertices[0].position).toEqual({ x: 0, y: 0, z: 0 });
      expect(vertices[1].position).toEqual({ x: 1, y: 0, z: 0 });
      expect(vertices[2].position).toEqual({ x: 0, y: 1, z: 0 });
      // triangle 1 opposed the plane normal: corners 1 and 2 swapped including UVs
      expect(vertices[3].position).toEqual({ x: 0, y: 0, z: 0 });
      expect(vertices[4].position).toEqual({ x: 0, y: 1, z: 0 });
      expect(vertices[4].textureU).toBeCloseTo(0.0);
      expect(vertices[4].textureV).toBeCloseTo(1.0);
      expect(vertices[5].position).toEqual({ x: 1, y: 0, z: 0 });
      expect(vertices[5].textureU).toBeCloseTo(1.0);
      expect(vertices[5].textureV).toBeCloseTo(0.0);
      expect(file.lodGroups[0].windingCorrectionCount).toBe(1);
    });

    it("keeps the untextured sentinel subresource", () => {
      const vertices = file.lodGroups[0].mesh.vertices;
      expect(vertices[3].textureSubresource).toBe(SPR_UNTEXTURED_SUBRESOURCE);
    });
  });

  describe("normalizeSpriteTextureUV", () => {
    it("applies the power-of-two aspect correction", () => {
      const [u, v] = normalizeSpriteTextureUV(128, 128, 64, 32);
      expect(u).toBeCloseTo(0.5);
      expect(v).toBeCloseTo(0.25);
    });

    it("uses the plain 256-texel basis for square textures", () => {
      const [u, v] = normalizeSpriteTextureUV(256, 128, 256, 256);
      expect(u).toBeCloseTo(1.0);
      expect(v).toBeCloseTo(0.5);
    });

    it("rejects zero-sized textures", () => {
      expect(() => normalizeSpriteTextureUV(1, 1, 0, 32)).toThrow(
        "SPR texture has zero physical dimensions",
      );
    });
  });

  it("rejects images with a broken magic", () => {
    const view = buildSprImage();
    view.setUint32(0x00, 0xdeadbeef, true);
    expect(() => SprUtils.parse(view)).toThrow("SPR magic mismatch");
  });
});
