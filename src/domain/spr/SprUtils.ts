import { HeaderUtils } from "../HeaderUtils";
import {
  SprFile,
  SprLodGroup,
  SprLookupRecord,
  SprMesh,
  SprVec3,
  SprVertex,
} from "./SprFile";

const HEADER_SIZE = 0x200;
const GROUP_HEADER_SIZE = 0x20;
const MESH_RECORD_HEADER_SIZE = 0x20;
const VERTEX_STRIDE = 0x40;
const TRIANGLE_STRIDE = 0x40;
const SPR_MAGIC = 0x00727073; // "spr\0" little endian
const Q12_FACTOR = 4096.0;

export class SprUtils extends HeaderUtils {
  constructor(dataView: DataView) {
    super(dataView);
  }

  static fromArrayBuffer(buffer: ArrayBuffer): SprUtils {
    return new SprUtils(new DataView(buffer));
  }

  static parse(dataView: DataView): SprFile {
    return new SprUtils(dataView).parseSprFile();
  }

  parseSprFile(): SprFile {
    if (this.view.byteLength < HEADER_SIZE) {
      throw new Error("SPR image is smaller than its 0x200-byte header");
    }
    if (this.getUint32(0x00) !== SPR_MAGIC) {
      throw new Error("SPR magic mismatch");
    }
    const declaredSize = this.getUint32(0x04);
    if (declaredSize < HEADER_SIZE || declaredSize > this.view.byteLength) {
      throw new Error("SPR declared size exceeds payload");
    }
    if (this.getUint32(0x0c) !== 0x00020007) {
      throw new Error("unsupported SPR converter version");
    }

    const groupCount = this.getUint32(0xb0);
    if (groupCount === 0 || groupCount > 0xfff) {
      throw new Error("SPR LOD group count is outside the game-validated range");
    }

    const lookupRecords = this.readLookupRecords();

    const lodGroups: SprLodGroup[] = [];
    let groupOffset = HEADER_SIZE;
    for (let groupIndex = 0; groupIndex < groupCount; groupIndex++) {
      this.requireRange(groupOffset, GROUP_HEADER_SIZE, "SPR LOD group header");
      const groupSize = this.getUint32(groupOffset);
      if (groupSize < GROUP_HEADER_SIZE) {
        throw new Error("SPR LOD group size is too small");
      }
      this.requireRange(groupOffset, groupSize, "SPR LOD group");
      const groupEnd = groupOffset + groupSize;
      const recordCount = this.getUint32(groupOffset + 0x04);
      const flags = this.getUint32(groupOffset + 0x0c);

      const mesh: SprMesh = { vertices: [], indices: [] };
      let windingCorrectionCount = 0;
      let recordOffset = groupOffset + GROUP_HEADER_SIZE;
      for (let record = 0; record < recordCount; record++) {
        this.requireRange(recordOffset, MESH_RECORD_HEADER_SIZE, "SPR mesh record header");
        const recordSize = this.getUint32(recordOffset);
        windingCorrectionCount += this.appendMeshRecord(recordOffset, groupEnd, mesh);
        recordOffset += recordSize;
      }
      if (recordOffset > groupEnd) {
        throw new Error("SPR LOD records exceed group size");
      }
      lodGroups.push({ flags, mesh, windingCorrectionCount });
      groupOffset = groupEnd;
    }
    if (groupOffset > declaredSize) {
      throw new Error("SPR LOD groups exceed declared image size");
    }

    return {
      registryId: this.getUint32(0xb8),
      boundsMin: this.readQ12Vec3(0xc0),
      boundsMax: this.readQ12Vec3(0xcc),
      boundingRadius: this.getInt32(0xd8) / Q12_FACTOR,
      placementHeightOffset: this.getInt32(0xdc) / Q12_FACTOR,
      lookupRecords,
      type6AttachmentPoints: lookupRecords
        .filter((record) => (record.packedKey & 0xf) === 6)
        .map((record) => record.localTranslation),
      lodGroups,
    };
  }

  private readLookupRecords(): SprLookupRecord[] {
    const lookupOffset = this.getUint32(0xe4);
    const lookupCount = this.getUint32(0xe8);
    if (lookupCount > 0x10000) {
      throw new Error("SPR lookup count is unreasonable");
    }
    const records: SprLookupRecord[] = [];
    if (lookupOffset === 0 && lookupCount === 0) {
      return records;
    }
    this.requireRange(lookupOffset, lookupCount * 0x10, "SPR lookup table");
    for (let index = 0; index < lookupCount; index++) {
      const offset = lookupOffset + index * 0x10;
      records.push({
        packedKey: this.getUint32(offset),
        localTranslation: this.readQ12Vec3(offset + 0x04),
      });
    }
    return records;
  }

  private appendMeshRecord(recordOffset: number, groupEnd: number, destination: SprMesh): number {
    this.requireRange(recordOffset, MESH_RECORD_HEADER_SIZE, "SPR mesh record header");
    const recordSize = this.getUint32(recordOffset);
    const meshGroupSelectorMask = this.getUint32(recordOffset + 0x04);
    const vertexCount = this.getUint32(recordOffset + 0x08);
    const triangleCount = this.getUint32(recordOffset + 0x0c);
    const meshRecordFlags = this.getUint32(recordOffset + 0x10);
    if (recordSize < MESH_RECORD_HEADER_SIZE) {
      throw new Error("SPR mesh record size is too small");
    }
    if (recordOffset > groupEnd || recordSize > groupEnd - recordOffset) {
      throw new Error("SPR mesh record exceeds its LOD group");
    }
    if (vertexCount > 1_000_000 || triangleCount > 1_000_000) {
      throw new Error("SPR mesh count is unreasonable");
    }

    const vertexStart = recordOffset + MESH_RECORD_HEADER_SIZE;
    const triangleStart = vertexStart + vertexCount * VERTEX_STRIDE;
    if (triangleStart + triangleCount * TRIANGLE_STRIDE > recordOffset + recordSize) {
      throw new Error("SPR mesh payload exceeds its record");
    }

    const pointerFields = [0x00, 0x0c, 0x18];
    const uFields = [0x04, 0x10, 0x1c];
    const vFields = [0x08, 0x14, 0x20];
    let windingCorrectionCount = 0;

    for (let triangle = 0; triangle < triangleCount; triangle++) {
      const offset = triangleStart + triangle * TRIANGLE_STRIDE;
      const textureSubresource = this.getUint32(offset + 0x30);
      const renderFlags = this.getUint32(offset + 0x34);
      const corners: SprVertex[] = [];
      for (let corner = 0; corner < 3; corner++) {
        const serializedVertexOffset = this.getUint32(offset + pointerFields[corner]);
        if (
          serializedVertexOffset < vertexStart ||
          serializedVertexOffset >= triangleStart ||
          (serializedVertexOffset - vertexStart) % VERTEX_STRIDE !== 0
        ) {
          throw new Error("SPR triangle vertex offset does not select a vertex in its mesh record");
        }
        const localIndex = (serializedVertexOffset - vertexStart) / VERTEX_STRIDE;
        if (localIndex >= vertexCount) {
          throw new Error("SPR triangle vertex index exceeds mesh record");
        }
        const sourceOffset = vertexStart + localIndex * VERTEX_STRIDE;
        corners.push({
          position: this.readQ12Vec3(sourceOffset),
          normal: normalizedOrUp(this.readQ12Vec3(sourceOffset + 0x10)),
          textureU: this.getInt32(offset + uFields[corner]) / Q12_FACTOR,
          textureV: this.getInt32(offset + vFields[corner]) / Q12_FACTOR,
          textureSubresource,
          renderFlags,
          meshRecordFlags,
          meshGroupSelectorMask,
        });
      }

      // game.exe evaluates triangle visibility from the serialized plane normal at +0x24
      // with culling disabled. Canonicalize the corner order (including UV corners) when it
      // opposes the authoritative plane normal.
      const planeNormal = this.readQ12Vec3(offset + 0x24);
      const geometricNormal = cross(
        subtract(corners[1].position, corners[0].position),
        subtract(corners[2].position, corners[0].position),
      );
      if (dot(geometricNormal, planeNormal) < 0) {
        const swapped = corners[1];
        corners[1] = corners[2];
        corners[2] = swapped;
        windingCorrectionCount++;
      }

      for (const corner of corners) {
        destination.vertices.push(corner);
        destination.indices.push(destination.vertices.length - 1);
      }
    }
    return windingCorrectionCount;
  }

  private readQ12Vec3(offset: number): SprVec3 {
    return {
      x: this.getInt32(offset) / Q12_FACTOR,
      y: this.getInt32(offset + 4) / Q12_FACTOR,
      z: this.getInt32(offset + 8) / Q12_FACTOR,
    };
  }

  private requireRange(offset: number, size: number, label: string) {
    if (offset > this.view.byteLength || size > this.view.byteLength - offset) {
      throw new Error(`${label} exceeds payload`);
    }
  }
}

export const TEXTURE_BASIS = 256.0;
/** SPR triangles use this subresource value as "no texture" marker. */
export const SPR_UNTEXTURED_SUBRESOURCE = 0xffffffff;

/**
 * The stock renderer converts SPR Q12 texel coordinates through a universal 256-texel basis
 * and then applies a power-of-two aspect correction from the physical GFX dimensions.
 */
export function normalizeSpriteTextureUV(
  serializedU: number,
  serializedV: number,
  pixelWidth: number,
  pixelHeight: number,
): [number, number] {
  if (pixelWidth === 0 || pixelHeight === 0) {
    throw new Error("SPR texture has zero physical dimensions");
  }
  const maximum = Math.max(pixelWidth, pixelHeight);
  const uAspect = maximum / pixelWidth;
  const vAspect = maximum / pixelHeight;
  return [serializedU / (TEXTURE_BASIS * uAspect), serializedV / (TEXTURE_BASIS * vAspect)];
}

function subtract(lhs: SprVec3, rhs: SprVec3): SprVec3 {
  return { x: lhs.x - rhs.x, y: lhs.y - rhs.y, z: lhs.z - rhs.z };
}

function cross(lhs: SprVec3, rhs: SprVec3): SprVec3 {
  return {
    x: lhs.y * rhs.z - lhs.z * rhs.y,
    y: lhs.z * rhs.x - lhs.x * rhs.z,
    z: lhs.x * rhs.y - lhs.y * rhs.x,
  };
}

function dot(lhs: SprVec3, rhs: SprVec3): number {
  return lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z;
}

function normalizedOrUp(value: SprVec3): SprVec3 {
  const length = Math.sqrt(value.x ** 2 + value.y ** 2 + value.z ** 2);
  if (length < 0.00001) {
    return { x: 0, y: 0, z: 1 };
  }
  return { x: value.x / length, y: value.y / length, z: value.z / length };
}
