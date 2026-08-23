import { HeaderUtils } from "../HeaderUtils";
import { EffFile, EffRecord } from "./EffFile";

const HEADER_SIZE = 0x200;
const RECORD_SIZE = 0xc0;
const PATH_BYTES = 68;
const PATH_OFFSET = 0x7c;
const EFF_MAGIC = 0x00666665; // "eff\0" little endian
/** Converter version stamped at +0x0C by the retail asset pipeline. */
const CONVERTER_VERSION = 0x00040007;

/**
 * Parser for the fixed-stride effect definition archives (*.eff).
 *
 * Ports EffectAsset::parse (thandor-map-editor/src/core/effect.cpp): a
 * 0x200-byte header followed by count × 0xC0 records, sprite paths stored as
 * narrow ASCII inside UTF-16 slots and normalized to their .spr target.
 */
export class EffUtils extends HeaderUtils {
  constructor(dataView: DataView) {
    super(dataView);
  }

  static fromArrayBuffer(buffer: ArrayBuffer): EffUtils {
    return new EffUtils(new DataView(buffer));
  }

  static parse(dataView: DataView): EffFile {
    return new EffUtils(dataView).parseEffFile();
  }

  parseEffFile(): EffFile {
    if (
      this.view.byteLength < HEADER_SIZE ||
      this.getUint32(0x00) !== EFF_MAGIC
    ) {
      throw new Error("EFF magic mismatch");
    }
    const declaredSize = this.getUint32(0x04);
    if (declaredSize !== this.view.byteLength) {
      throw new Error("EFF declared size does not match payload");
    }
    if (this.getUint32(0x0c) !== CONVERTER_VERSION) {
      throw new Error("unsupported EFF converter version");
    }
    const count = this.getUint32(0xb0);
    if (HEADER_SIZE + count * RECORD_SIZE !== this.view.byteLength) {
      throw new Error("EFF definition count does not match payload size");
    }

    const records: EffRecord[] = [];
    for (let index = 0; index < count; index++) {
      const offset = HEADER_SIZE + index * RECORD_SIZE;
      const transitionKind = this.getUint32(offset + 0x00);
      if (transitionKind > 4) {
        throw new Error(
          "EFF transition kind exceeds recovered dispatch table",
        );
      }
      const spritePath = normalizeEffectSpritePath(
        this.readString(offset + PATH_OFFSET, PATH_BYTES),
      );
      if (spritePath === "") {
        throw new Error("EFF definition has no sprite path");
      }
      records.push({
        transitionKind,
        definitionId: this.getUint32(offset + 0x08),
        runtimeValue0C: this.getUint32(offset + 0x0c),
        linkedEffectPresent: this.getUint32(offset + 0x10),
        linkedEffectId: this.getUint32(offset + 0x14),
        linkedShotPresent: this.getUint32(offset + 0x18),
        linkedShotId: this.getUint32(offset + 0x1c),
        movementSpeedQ12: this.getInt32(offset + 0x20),
        terrainGridMaskIndex: this.getInt32(offset + 0x2c),
        creationFlags: this.getUint32(offset + 0x30),
        shadingColorArgb: this.getUint32(offset + 0x34),
        shadingTransitionTicks: this.getInt32(offset + 0x38),
        shadingReleaseTransitionTicks: this.getInt32(offset + 0x3c),
        frameAdvanceThresholdQ4: this.getUint32(offset + 0x28),
        shadingStartFrame: this.getUint32(offset + 0x40),
        shadingStopFrame: this.getUint32(offset + 0x44),
        periodicEffectId: this.getUint32(offset + 0x48),
        periodicEffectIntervalTicks: this.getUint32(offset + 0x4c),
        alphaFadeInTicks: this.getUint32(offset + 0x50),
        alphaFadeOutTicks: this.getUint32(offset + 0x54),
        stateTintArgb: this.getUint32(offset + 0x60),
        modelScaleXQ12: this.getInt32(offset + 0x64),
        modelScaleYQ12: this.getInt32(offset + 0x68),
        positionedSoundArgument0: this.getUint32(offset + 0x6c),
        positionedSoundArgument1: this.getUint32(offset + 0x70),
        spritePath,
      });
    }
    return { records };
  }
}

/** Matches the reference read_resource_path: backslashes lowercased, .spr appended. */
export function normalizeEffectSpritePath(raw: string): string {
  const path = raw.replace(/\\/g, "/").toLowerCase();
  if (path === "") {
    return "";
  }
  return path.endsWith(".spr") ? path : `${path}.spr`;
}
