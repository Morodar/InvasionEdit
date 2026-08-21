import { HeaderUtils } from "../HeaderUtils";
import { ArmFile, ArmNode, ArmRecord } from "./ArmFile";

const HEADER_SIZE = 0x200;
const NODE_HEADER_SIZE = 0x40;
const ARM_MAGIC = 0x006d7261; // "arm\0" little endian

export class ArmUtils extends HeaderUtils {
  constructor(dataView: DataView) {
    super(dataView);
  }

  static fromArrayBuffer(buffer: ArrayBuffer): ArmUtils {
    return new ArmUtils(new DataView(buffer));
  }

  static parse(dataView: DataView): ArmFile {
    return new ArmUtils(dataView).parseArmFile();
  }

  parseArmFile(): ArmFile {
    if (this.view.byteLength < HEADER_SIZE) {
      throw new Error("ARM image is smaller than its 0x200-byte header");
    }
    if (this.getUint32(0x00) !== ARM_MAGIC) {
      throw new Error("ARM magic mismatch");
    }
    const declaredSize = this.getUint32(0x04);
    if (declaredSize < HEADER_SIZE || declaredSize > this.view.byteLength) {
      throw new Error("ARM declared size exceeds payload");
    }
    const recordCount = this.getUint32(0xb0);

    const records: ArmRecord[] = [];
    let offset = HEADER_SIZE;
    for (let record = 0; record < recordCount; record++) {
      if (offset + 0x10 > this.view.byteLength) {
        throw new Error("ARM record header exceeds payload");
      }
      const size = this.getUint32(offset);
      if (size < 0x10 || offset + size > this.view.byteLength) {
        throw new Error("ARM record exceeds payload");
      }
      const rootNodeOffset = this.getUint32(offset + 0x0c);
      records.push({
        registryId: this.getUint32(offset + 0x08),
        rootNodeOffset,
        rootNode:
          rootNodeOffset !== 0 ? this.readNode(rootNodeOffset, []) : null,
      });
      offset += size;
    }
    return { records };
  }

  private readNode(nodeOffset: number, activeOffsets: number[]): ArmNode {
    if (nodeOffset + NODE_HEADER_SIZE > this.view.byteLength) {
      throw new Error("ARM node exceeds payload");
    }
    if (activeOffsets.includes(nodeOffset)) {
      throw new Error("ARM technology-variant hierarchy contains a cycle");
    }
    const childCount = this.getUint32(nodeOffset + 0x08);
    if (childCount > 8) {
      throw new Error("ARM technology-variant child count exceeds eight slots");
    }
    if (nodeOffset + 0x0c + childCount * 4 > this.view.byteLength) {
      throw new Error("ARM technology-variant child offsets exceed payload");
    }

    const childOffsets: number[] = [];
    for (let slot = 0; slot < childCount; slot++) {
      childOffsets.push(this.getUint32(nodeOffset + 0x0c + slot * 4));
    }

    const modelDefinitionIds: number[] = [];
    for (let variant = 0; variant < 8; variant++) {
      modelDefinitionIds.push(this.getUint32(nodeOffset + 0x20 + variant * 4));
    }

    const node: ArmNode = {
      serializedOffset: nodeOffset,
      childCount,
      childOffsets,
      modelDefinitionIds,
      children: [],
    };

    for (const childOffset of childOffsets) {
      if (childOffset !== 0) {
        node.children.push(this.readNode(childOffset, [...activeOffsets, nodeOffset]));
      }
    }
    return node;
  }
}
