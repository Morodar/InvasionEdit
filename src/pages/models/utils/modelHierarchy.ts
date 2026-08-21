import * as THREE from "three";
import { SprFile, SprVec3 } from "../../../domain/spr/SprFile";

const TWO_PI_OVER_65536 = (2.0 * Math.PI) / 65536.0;

function turnToRadians(serializedTurn: number): number {
  return (serializedTurn & 0xffff) * TWO_PI_OVER_65536;
}

/**
 * Port of FixedTransform_BuildRotationBasis as used by
 * ModelNodeRuntime_ComposeChildTransformsRecursive.
 *
 * game.exe passes modelPayload.{rotationAngle2, rotationAngle1, rotationAngle0} to the
 * formal parameters {angle0, angle1, angle2}. The field-to-formal permutation is essential;
 * treating the field suffixes as the formal parameter names collapses cardinal child rotations.
 *
 * The resulting basis operates in Thandor model space (Z-up, right handed).
 */
export function fixedModelRotationMatrix(
  serializedRotationAngle0: number,
  serializedRotationAngle1: number,
  serializedRotationAngle2: number,
  translation: SprVec3 = { x: 0, y: 0, z: 0 },
): THREE.Matrix4 {
  const angle0 = turnToRadians(serializedRotationAngle2);
  const angle1 = turnToRadians(serializedRotationAngle1);
  const angle2 = turnToRadians(serializedRotationAngle0);
  const angle0Minus2Angle2 = angle0 - 2.0 * angle2;
  const sinAngle1 = Math.sin(angle1);
  const d = (Math.cos(angle0) - Math.cos(angle0Minus2Angle2)) * 0.5;
  const c = (Math.cos(angle0) + Math.cos(angle0Minus2Angle2)) * 0.5;
  const s = (Math.sin(angle0) + Math.sin(angle0Minus2Angle2)) * 0.5;
  const t = (Math.sin(angle0Minus2Angle2) - Math.sin(angle0)) * 0.5;

  return new THREE.Matrix4().set(
    d + c * sinAngle1,
    t - s * sinAngle1,
    Math.cos(angle1) * Math.cos(angle2),
    translation.x,
    s - t * sinAngle1,
    d * sinAngle1 + c,
    Math.cos(angle1) * Math.sin(angle2),
    translation.y,
    -Math.cos(angle1) * Math.cos(angle0 - angle2),
    Math.cos(angle1) * Math.sin(angle0 - angle2),
    Math.sin(angle1),
    translation.z,
    0,
    0,
    0,
    1,
  );
}

/**
 * Finds the attachment point of a child model slot in the parent SPR lookup table.
 * Keys whose low nibble is 0 or 1 are child attachment points (see SpriteAsset::child_attachment).
 */
export function findChildAttachment(
  sprFile: SprFile | null,
  childSlot: number,
): SprVec3 | null {
  if (!sprFile) {
    return null;
  }
  for (const keyClass of [0, 1]) {
    const packedKey = (childSlot << 4) | keyClass;
    const record = sprFile.lookupRecords.find((entry) => entry.packedKey === packedKey);
    if (record) {
      return record.localTranslation;
    }
  }
  return null;
}
