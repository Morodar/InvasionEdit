import { HeaderUtils } from "../HeaderUtils";
import { MdlFile, MdlNode, MdlRecord } from "./MdlFile";

const HEADER_SIZE = 0x200;
const NODE_HEADER_SIZE = 0x3c;
const MDL_MAGIC = 0x006c646d; // "mdl\0" little endian

export class MdlUtils extends HeaderUtils {
  constructor(dataView: DataView) {
    super(dataView);
  }

  static fromArrayBuffer(buffer: ArrayBuffer): MdlUtils {
    return new MdlUtils(new DataView(buffer));
  }

  static parse(dataView: DataView): MdlFile {
    return new MdlUtils(dataView).parseMdlFile();
  }

  parseMdlFile(): MdlFile {
    if (this.view.byteLength < HEADER_SIZE) {
      throw new Error("MDL image is smaller than its 0x200-byte header");
    }
    if (this.getUint32(0x00) !== MDL_MAGIC) {
      throw new Error("MDL magic mismatch");
    }
    const declaredSize = this.getUint32(0x04);
    if (declaredSize < HEADER_SIZE || declaredSize > this.view.byteLength) {
      throw new Error("MDL declared size exceeds payload");
    }
    const recordCount = this.getUint32(0xb0);

    const records: MdlRecord[] = [];
    let offset = HEADER_SIZE;
    for (let record = 0; record < recordCount; record++) {
      this.requireRange(offset, 0x0c, "MDL record header");
      const size = this.getUint32(offset);
      if (size < 0x0c) {
        throw new Error("MDL record size is too small");
      }
      this.requireRange(offset, size, "MDL record");
      records.push(this.readMdlRecord(offset, size));
      offset += size;
    }
    return { records };
  }

  private readMdlRecord(offset: number, size: number): MdlRecord {
    const definitionId = this.getUint32(offset + 0x08);
    const nameTextOffset = this.getUint32(offset + 0x04);
    const runtimeClassId = size >= 0x50 ? this.getUint32(offset + 0x4c) : 0;
    const shotImpactClassIndex = size >= 0x60 ? this.getUint32(offset + 0x5c) : 0;
    const placementOccupancyClass = size >= 0xc4 ? this.getUint32(offset + 0xc0) : 0;

    // The class-initialization callback for runtime class 13 copies +0xC0 into
    // the primary animated texture selector; class 2 reads both track channels
    // from +0x1B8/+0x1BC (ModelRuntimeSlotClassInit_ApplyDefinitionTextureAnimationIndices).
    let primaryAnimatedSubresource = 0;
    if (runtimeClassId === 13 && placementOccupancyClass !== 0) {
      primaryAnimatedSubresource = placementOccupancyClass;
    }
    let secondaryAnimatedSubresource = 0;
    if (size >= 0x1c0 && runtimeClassId === 2) {
      primaryAnimatedSubresource = this.getUint32(offset + 0x1b8);
      secondaryAnimatedSubresource = this.getUint32(offset + 0x1bc);
    }

    const hierarchyNodes: MdlNode[] = [];
    let rootNodeOffset = 0;
    if (size >= 0x68) {
      rootNodeOffset = this.getUint32(offset + 0x64);
      if (rootNodeOffset !== 0) {
        this.readNodeHierarchy(rootNodeOffset, hierarchyNodes);
      }
    }

    // Serialized MDL nodes store the UTF-16 SPR path inline at +0x38. Fall back to
    // scanning the record slice when no node carries a usable path.
    let spritePath = hierarchyNodes.find((node) => node.spritePath !== "")?.spritePath ?? "";
    if (spritePath === "") {
      spritePath = findFirstSpritePath(this, offset, size);
    }
    if (spritePath === "") {
      throw new Error("MDL definition has no serialized SPR path");
    }

    return {
      definitionId,
      nameTextOffset,
      runtimeClassId,
      shotImpactClassIndex,
      rootNodeOffset,
      runtimeRenderFlags: size >= 0x6c ? this.getUint32(offset + 0x68) : 0,
      placementOccupancyClass,
      hierarchyNodes,
      spritePath,
      classStepQ12: size >= 0x10 ? this.getInt32(offset + 0x0c) : 0,
      yawMaxVelocity: size >= 0x14 ? this.getInt32(offset + 0x10) : 0,
      pitchMaxVelocity: size >= 0x18 ? this.getInt32(offset + 0x14) : 0,
      yawAcceleration: size >= 0x20 ? this.getInt32(offset + 0x1c) : 0,
      pitchMin: size >= 0x28 ? this.getInt32(offset + 0x24) : 0,
      pitchMax: size >= 0x2c ? this.getInt32(offset + 0x28) : 0,
      shotDefinitionId: size >= 0x30 ? this.getUint32(offset + 0x2c) : 0,
      reloadTicks: size >= 0x34 ? this.getUint32(offset + 0x30) : 0,
      maximumIntegrity: size >= 0x64 ? this.getInt32(offset + 0x60) : 0,
      primaryAnimatedSubresource,
      secondaryAnimatedSubresource,
      timedEffectId: size >= 0x180 ? this.getUint32(offset + 0x174) : 0,
      timedEffectIntervalTicks: size >= 0x180 ? this.getUint32(offset + 0x178) : 0,
      timedEffectRandomTicks: size >= 0x180 ? this.getUint32(offset + 0x17c) : 0,
    };
  }

  private readNodeHierarchy(nodeOffset: number, output: MdlNode[]): void {
    this.requireRange(nodeOffset, NODE_HEADER_SIZE, "MDL model-node definition");
    if (output.some((node) => node.serializedOffset === nodeOffset)) {
      throw new Error("MDL model-node hierarchy contains a cycle");
    }
    const childCount = this.getUint32(nodeOffset + 0x14);
    if (childCount > 8) {
      throw new Error("MDL model-node child count exceeds the serialized eight-slot array");
    }
    this.requireRange(
      nodeOffset + 0x18,
      childCount * 4,
      "MDL model-node child offsets",
    );

    const childOffsets: number[] = [];
    for (let slot = 0; slot < childCount; slot++) {
      childOffsets.push(this.getUint32(nodeOffset + 0x18 + slot * 4));
    }

    output.push({
      serializedOffset: nodeOffset,
      flags: this.getUint32(nodeOffset + 0x04),
      localRotationAngles: [
        this.getUint32(nodeOffset + 0x08),
        this.getUint32(nodeOffset + 0x0c),
        this.getUint32(nodeOffset + 0x10),
      ],
      childCount,
      childOffsets,
      spritePath: readSerializedSpritePath(this, nodeOffset + 0x38),
    });

    for (const childOffset of childOffsets) {
      if (childOffset !== 0) {
        this.readNodeHierarchy(childOffset, output);
      }
    }
  }

  private requireRange(offset: number, size: number, label: string) {
    if (offset > this.view.byteLength || size > this.view.byteLength - offset) {
      throw new Error(`${label} exceeds payload`);
    }
  }

  readUint16LE(offset: number): number {
    return this.view.getUint16(offset, true);
  }
}

/** Reads the inline UTF-16 SPR path at the given offset. */
function readSerializedSpritePath(utils: MdlUtils, pathOffset: number): string {
  const limit = utils.view.byteLength;
  if (pathOffset >= limit || (pathOffset & 1) !== 0) return "";
  let text = "";
  for (let cursor = pathOffset; cursor + 2 <= limit; cursor += 2) {
    const value = utils.readUint16LE(cursor);
    if (value === 0) break;
    if (value < 0x20 || value >= 0x7f) return "";
    text += String.fromCharCode(value);
    if (text.length > 260) return "";
  }
  const normalized = normalizeAssetPath(text);
  if (!normalized.startsWith("spr/") || normalized.length <= 4) return "";
  if (!normalized.endsWith(".spr")) return `${normalized}.spr`;
  return normalized;
}

/** Scans a record slice for the first embedded "spr/" asset path. */
function findFirstSpritePath(utils: MdlUtils, recordOffset: number, recordSize: number): string {
  const end = recordOffset + recordSize;
  for (let offset = recordOffset; offset + 8 <= end; offset += 2) {
    let text = "";
    for (let cursor = offset; cursor + 2 <= end; cursor += 2) {
      const value = utils.readUint16LE(cursor);
      if (value < 0x20 || value >= 0x7f) break;
      text += String.fromCharCode(value);
    }
    const normalized = normalizeAssetPath(text);
    if (normalized.startsWith("spr/") && normalized.length > 4) {
      if (!normalized.endsWith(".spr")) return `${normalized}.spr`;
      return normalized;
    }
  }
  return "";
}

function normalizeAssetPath(path: string): string {
  return path.replace(/\\/g, "/").toLowerCase();
}
