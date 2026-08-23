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

/* ------------------------------------------------------------------ *
 * Timed effect (chimney smoke & friends)
 *
 * Ports of the effect preview math recovered in
 * thandor-map-editor/src/core/effect.cpp.
 * ------------------------------------------------------------------ */

/** Minimal shape of an EFF definition record used by the helpers. */
export interface EffectDefinitionLike {
  transitionKind: number;
  runtimeValue0C: number;
  frameAdvanceThresholdQ4: number;
  alphaFadeInTicks: number;
  alphaFadeOutTicks: number;
  modelScaleXQ12: number;
  modelScaleYQ12: number;
  movementSpeedQ12: number;
  shadingStartFrame: number;
  shadingStopFrame: number;
}

/**
 * Ticks until `completedFrames` animation frames have played at the record's
 * Q4 threshold rate (effect_tick_for_completed_frames): ceiling division of
 * frames × threshold / 16, never below the frame count itself.
 */
export function effectTickForCompletedFrames(
  frameAdvanceThresholdQ4: number,
  completedFrames: number,
): number {
  if (completedFrames === 0) {
    return 0;
  }
  const threshold = Math.max(1, frameAdvanceThresholdQ4);
  const accumulatorTicks = Math.ceil((completedFrames * threshold) / 16);
  return Math.max(completedFrames, accumulatorTicks);
}

/** Total presentation ticks one puff lives (effect_lifetime_ticks). */
export function effectLifetimeTicks(definition: EffectDefinitionLike): number {
  return effectTickForCompletedFrames(
    definition.frameAdvanceThresholdQ4,
    definition.runtimeValue0C,
  );
}

/**
 * Alpha envelope 0..255 of a puff at its age in ticks
 * (effect_alpha_at_age): linear fade-in, hold, linear fade-out.
 */
export function effectAlphaAtAge(
  definition: EffectDefinitionLike,
  ageTicks: number,
): number {
  const lifetime = effectLifetimeTicks(definition);
  if (lifetime === 0 || ageTicks >= lifetime) {
    return 0;
  }
  if (
    definition.alphaFadeInTicks !== 0 &&
    ageTicks < definition.alphaFadeInTicks
  ) {
    return Math.min(255, Math.floor((ageTicks * 255) / definition.alphaFadeInTicks));
  }
  if (definition.alphaFadeOutTicks !== 0) {
    const fadeStart =
      lifetime > definition.alphaFadeOutTicks
        ? lifetime - definition.alphaFadeOutTicks
        : 0;
    if (ageTicks > fadeStart) {
      const remaining = lifetime - ageTicks;
      return Math.min(255, Math.floor((remaining * 255) / definition.alphaFadeOutTicks));
    }
  }
  return 255;
}

/** Uniform world scale of a puff at its age: lerp between the Q12 scales. */
export function effectScaleAtAge(
  definition: EffectDefinitionLike,
  ageTicks: number,
): number {
  const lifetime = effectLifetimeTicks(definition);
  const progress =
    lifetime === 0 ? 1 : Math.min(1, Math.max(0, ageTicks / lifetime));
  const start = definition.modelScaleXQ12 / 4096;
  const end = definition.modelScaleYQ12 / 4096;
  return start + (end - start) * progress;
}

/** Current animation frame index clamped to the authored range. */
export function effectFrameAtAge(
  definition: EffectDefinitionLike,
  ageTicks: number,
): number {
  const first = definition.shadingStartFrame;
  const last = definition.shadingStopFrame;
  if (last <= first) {
    return first;
  }
  const threshold = Math.max(16, definition.frameAdvanceThresholdQ4);
  const frameCount = last - first + 1;
  const completed = Math.floor((ageTicks * 16) / threshold);
  return first + (((completed % frameCount) + frameCount) % frameCount);
}

/**
 * Kind-2 drift displacement after `ageTicks` (effect_transition2_
 * displacement_at_age_angles): horizontal speed along an easing azimuth plus
 * vertical rise; both angles are turn16 and decay toward level flight.
 */
export function effectTransition2DisplacementAtAge(
  definition: EffectDefinitionLike,
  ageTicks: number,
  initialAngle0Turn16: number,
  initialAngle1Turn16: number,
): { x: number; y: number; z: number } {
  const result = { x: 0, y: 0, z: 0 };
  if (definition.transitionKind !== 2) {
    return result;
  }
  const speed = definition.movementSpeedQ12 / 4096;
  const turnToRadians = (2 * Math.PI) / 65536;
  let angle0 = initialAngle0Turn16 & 0xffff;
  let angle1 = initialAngle1Turn16 & 0xffff;
  const lifetime = effectLifetimeTicks(definition);
  const steps = Math.min(ageTicks, lifetime);
  for (let tick = 0; tick < steps; tick++) {
    const a0 = angle0 * turnToRadians;
    const a1 = angle1 * turnToRadians;
    const horizontal = Math.cos(a0) * speed;
    result.x += horizontal * Math.cos(a1);
    result.y += horizontal * Math.sin(a1);
    result.z += Math.sin(a0) * speed;
    angle1 =
      (Math.trunc((angle1 * 63 + 0x4000) / 64)) & 0xffff;
  }
  return result;
}

/**
 * The stock resource emitter RNG (resource_random_next_primary): a two-step
 * LCG whose halves are combined. Returns [value, nextState].
 */
export function resourceRandomNextPrimary(state: number): [number, number] {
  const first = (Math.imul(state, 33) + 101) >>> 0;
  const next = (Math.imul(first, 33) + 101) >>> 0;
  return [(((first << 14) >>> 0) ^ (next >>> 2)) >>> 0, next];
}

/** Emission interval for one pulse: base + rng % random, at least 1 tick. */
export function emitterIntervalTicks(
  baseIntervalTicks: number,
  randomIntervalTicks: number,
  intervalRandom: number,
): number {
  return Math.max(
    1,
    baseIntervalTicks +
      (randomIntervalTicks === 0 ? 0 : intervalRandom % randomIntervalTicks),
  );
}

/**
 * Building runtime class 13 animates its selected root texture subresource by
 * varying the model-node V offset over the stock 0..0x80000 Q12 range. The
 * preview reproduces it as a deterministic triangle wave (model.vert:97-101):
 * amplitude 0.5 of the normalized UV period, one full cycle every 80 ticks.
 */
export const BUILDING_TEXTURE_WAVE_AMPLITUDE = 0.5;
export const BUILDING_TEXTURE_WAVE_CYCLE_TICKS = 80;

/** Normalized V offset (UV units) of the animated subresource at the given tick. */
export function buildingTextureWaveOffset(tick: number): number {
  const cycle = BUILDING_TEXTURE_WAVE_CYCLE_TICKS;
  const phase = (((Math.floor(tick) % cycle) + cycle) % cycle) / cycle;
  return BUILDING_TEXTURE_WAVE_AMPLITUDE * (1 - Math.abs(phase * 2 - 1));
}
