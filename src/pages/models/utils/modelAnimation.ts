import { ModelNodeSimulation } from "./resolveModelChain";

/** The stock editor advances model subnode animation at 20 presentation ticks per second. */
export const SUBNODE_ANIMATION_TICKS_PER_SECOND = 20;

/**
 * Ports of the recovered runtime classification in
 * thandor-map-editor/include/thandor/model_animation.hpp: runtime classes 4,
 * 11, 13 and 14 dispatch through ArmyRuntime_UpdateAnimatedModelSubnodes,
 * while class 10 owns the separate continuous radar callback that never gates
 * on animation controls.
 */
export function usesGenericSubnodeAnimation(runtimeClassId: number): boolean {
  return (
    runtimeClassId === 4 ||
    runtimeClassId === 11 ||
    runtimeClassId === 13 ||
    runtimeClassId === 14
  );
}

export function usesContinuousRadarSubnodeAnimation(runtimeClassId: number): boolean {
  return runtimeClassId === 10;
}

/**
 * turn16 yaw increment per tick the parent applies to a live child slot:
 * slot 0 follows the parent's yaw velocity, slot 1 its yaw acceleration.
 */
export function modelRuntimeChildYawStep(
  parent: ModelNodeSimulation,
  childSlot: number,
): number {
  if (
    !usesGenericSubnodeAnimation(parent.runtimeClassId) &&
    !usesContinuousRadarSubnodeAnimation(parent.runtimeClassId)
  ) {
    return 0;
  }
  if (childSlot === 0) {
    return parent.yawMaxVelocityTurn16;
  }
  if (childSlot === 1) {
    return parent.yawAccelerationTurn16;
  }
  return 0;
}

/** Child slot 2 oscillates vertically when the parent's pitch channel is authored. */
export function childUsesBoundedVerticalChannel(
  parent: ModelNodeSimulation,
  childSlot: number,
): boolean {
  return (
    childSlot === 2 &&
    usesGenericSubnodeAnimation(parent.runtimeClassId) &&
    parent.pitchMaxVelocityTurn16 !== 0 &&
    parent.pitchMaxTurn16 > parent.pitchMinTurn16
  );
}

/**
 * Port of animated_child2_translation_q12: a triangle wave between the
 * serialized q12 bounds at the serialized step rate. Returns the raw q12
 * value, or null when the channel is inactive (translation stays authored).
 */
export function animatedChild2TranslationQ12(
  parent: ModelNodeSimulation,
  tick: number,
): number | null {
  if (!childUsesBoundedVerticalChannel(parent, 2)) {
    return null;
  }
  const minimum = parent.pitchMinTurn16;
  const maximum = parent.pitchMaxTurn16;
  const span = maximum - minimum;
  const step = Math.max(1, Math.abs(parent.pitchMaxVelocityTurn16));
  const periodSteps = Math.max(2, Math.ceil(span / step));
  const phase = tick % (periodSteps * 2);
  const distance = phase <= periodSteps ? phase : periodSteps * 2 - phase;
  return Math.min(maximum, minimum + distance * step);
}

export function wrapTurn16(value: number): number {
  return ((value % 65536) + 65536) % 65536;
}
