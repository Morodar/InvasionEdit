import { describe, expect, it } from "vitest";
import {
  animatedChild2TranslationQ12,
  buildingTextureWaveOffset,
  childUsesBoundedVerticalChannel,
  emitterIntervalTicks,
  effectAlphaAtAge,
  effectFrameAtAge,
  effectLifetimeTicks,
  effectScaleAtAge,
  effectTickForCompletedFrames,
  effectTransition2DisplacementAtAge,
  modelRuntimeChildYawStep,
  resourceRandomNextPrimary,
  usesContinuousRadarSubnodeAnimation,
  usesGenericSubnodeAnimation,
  wrapTurn16,
} from "../../../../src/pages/models/utils/modelAnimation";
import { ModelNodeSimulation } from "../../../../src/pages/models/utils/resolveModelChain";

function simulation(overrides: Partial<ModelNodeSimulation> = {}): ModelNodeSimulation {
  return {
    runtimeClassId: 0,
    yawMaxVelocityTurn16: 0,
    pitchMaxVelocityTurn16: 0,
    yawAccelerationTurn16: 0,
    pitchMinTurn16: 0,
    pitchMaxTurn16: 0,
    ...overrides,
  };
}

describe("runtime class classification", () => {
  it("matches the recovered generic subnode animation classes", () => {
    for (const runtimeClassId of [4, 11, 13, 14]) {
      expect(usesGenericSubnodeAnimation(runtimeClassId)).toBe(true);
    }
    for (const runtimeClassId of [0, 3, 5, 10, 17]) {
      expect(usesGenericSubnodeAnimation(runtimeClassId)).toBe(false);
    }
  });

  it("treats only class 10 as continuous radar", () => {
    expect(usesContinuousRadarSubnodeAnimation(10)).toBe(true);
    for (const runtimeClassId of [0, 4, 11, 13, 14, 17]) {
      expect(usesContinuousRadarSubnodeAnimation(runtimeClassId)).toBe(false);
    }
  });
});

describe("modelRuntimeChildYawStep", () => {
  it("maps slot 0 to the yaw velocity and slot 1 to the yaw acceleration", () => {
    const parent = simulation({
      runtimeClassId: 13,
      yawMaxVelocityTurn16: 2731,
      yawAccelerationTurn16: 91,
    });
    expect(modelRuntimeChildYawStep(parent, 0)).toBe(2731);
    expect(modelRuntimeChildYawStep(parent, 1)).toBe(91);
    expect(modelRuntimeChildYawStep(parent, 2)).toBe(0);
    expect(modelRuntimeChildYawStep(parent, 3)).toBe(0);
  });

  it("applies to the continuous radar class as well", () => {
    const parent = simulation({ runtimeClassId: 10, yawMaxVelocityTurn16: 4096 });
    expect(modelRuntimeChildYawStep(parent, 0)).toBe(4096);
  });

  it("returns zero for classes outside the animation dispatch", () => {
    const parent = simulation({
      runtimeClassId: 0,
      yawMaxVelocityTurn16: 4096,
      yawAccelerationTurn16: 128,
    });
    expect(modelRuntimeChildYawStep(parent, 0)).toBe(0);
    expect(modelRuntimeChildYawStep(parent, 1)).toBe(0);
  });

  it("returns zero when the parent carries no authored velocities", () => {
    const parent = simulation({ runtimeClassId: 4 });
    expect(modelRuntimeChildYawStep(parent, 0)).toBe(0);
  });
});

describe("childUsesBoundedVerticalChannel", () => {
  it("requires slot 2, a generic class and an ordered nonzero channel", () => {
    const parent = simulation({
      runtimeClassId: 4,
      pitchMaxVelocityTurn16: 64,
      pitchMinTurn16: -2048,
      pitchMaxTurn16: 2048,
    });
    expect(childUsesBoundedVerticalChannel(parent, 2)).toBe(true);
    expect(childUsesBoundedVerticalChannel(parent, 0)).toBe(false);

    expect(
      childUsesBoundedVerticalChannel({ ...parent, runtimeClassId: 10 }, 2),
    ).toBe(false);
    expect(
      childUsesBoundedVerticalChannel({ ...parent, pitchMaxVelocityTurn16: 0 }, 2),
    ).toBe(false);
    expect(
      childUsesBoundedVerticalChannel({ ...parent, pitchMaxTurn16: -4096 }, 2),
    ).toBe(false);
    expect(
      childUsesBoundedVerticalChannel({ ...parent, pitchMaxTurn16: -4096, pitchMinTurn16: -8192 }, 2),
    ).toBe(true);
  });
});

describe("animatedChild2TranslationQ12", () => {
  const parent = simulation({
    runtimeClassId: 4,
    pitchMaxVelocityTurn16: 1024,
    pitchMinTurn16: 0,
    pitchMaxTurn16: 4096,
  });

  it("is null when the channel is inactive", () => {
    expect(animatedChild2TranslationQ12(simulation(), 10)).toBeNull();
  });

  it("oscillates between the bounds on a triangle wave", () => {
    // span 4096 / step 1024 -> period 4, full cycle 8 ticks
    expect(animatedChild2TranslationQ12(parent, 0)).toBe(0);
    expect(animatedChild2TranslationQ12(parent, 2)).toBe(2048);
    expect(animatedChild2TranslationQ12(parent, 4)).toBe(4096);
    expect(animatedChild2TranslationQ12(parent, 6)).toBe(2048);
    expect(animatedChild2TranslationQ12(parent, 8)).toBe(0);
    expect(animatedChild2TranslationQ12(parent, 12)).toBe(4096);
  });

  it("clamps to the maximum when the span is not step aligned", () => {
    const parentOdd = simulation({
      runtimeClassId: 4,
      pitchMaxVelocityTurn16: 1000,
      pitchMinTurn16: 0,
      pitchMaxTurn16: 2500,
    });
    // period ceil(2500/1000)=3; peak distance*step=3000 clamps to 2500
    expect(animatedChild2TranslationQ12(parentOdd, 3)).toBe(2500);
  });
});

describe("wrapTurn16", () => {
  it("wraps into the unsigned 16-bit turn range", () => {
    expect(wrapTurn16(0)).toBe(0);
    expect(wrapTurn16(65536)).toBe(0);
    expect(wrapTurn16(66000)).toBe(464);
    expect(wrapTurn16(-1)).toBe(65535);
    expect(wrapTurn16(-65536)).toBe(0);
    expect(wrapTurn16(-98304)).toBe(32768);
  });
});

describe("buildingTextureWaveOffset", () => {

  it("oscillates between 0 and the amplitude with a deterministic triangle cycle", () => {
    expect(buildingTextureWaveOffset(0)).toBe(0);
    // quarter cycle: 20/80 -> phase 0.25 -> triangle 0.5
    expect(buildingTextureWaveOffset(20)).toBeCloseTo(0.25, 10);
    // half cycle peak
    expect(buildingTextureWaveOffset(40)).toBeCloseTo(0.5, 10);
    // symmetric descent
    expect(buildingTextureWaveOffset(60)).toBeCloseTo(0.25, 10);
    // full cycle wraps back to rest
    expect(buildingTextureWaveOffset(80)).toBe(0);
    expect(buildingTextureWaveOffset(160)).toBe(0);
  });

  it("holds each whole tick (floor sampling like the shader)", () => {
    expect(buildingTextureWaveOffset(39.9)).toBeCloseTo(0.4875, 10);
    expect(buildingTextureWaveOffset(40.6)).toBeCloseTo(0.5, 10);
    expect(buildingTextureWaveOffset(40.9)).toBeCloseTo(0.5, 10);
  });
});

describe("timed effect helpers", () => {
  const smoke = {
    transitionKind: 2,
    runtimeValue0C: 9,
    frameAdvanceThresholdQ4: 160,
    alphaFadeInTicks: 8,
    alphaFadeOutTicks: 80,
    modelScaleXQ12: 4000,
    modelScaleYQ12: 9000,
    movementSpeedQ12: 48,
    shadingStartFrame: 0,
    shadingStopFrame: 0,
  };

  it("computes lifetimes with the Q4 threshold ceiling rule", () => {
    // 9 frames at 160/16=10 ticks per frame
    expect(effectLifetimeTicks(smoke)).toBe(90);
    // thresholds below one frame still need one tick per frame
    expect(
      effectLifetimeTicks({ ...smoke, frameAdvanceThresholdQ4: 8, runtimeValue0C: 5 }),
    ).toBe(5);
    expect(effectTickForCompletedFrames(32, 4)).toBe(8);
    expect(effectTickForCompletedFrames(32, 0)).toBe(0);
  });

  it("fades in, holds, and fades out like effect_alpha_at_age", () => {
    expect(effectAlphaAtAge(smoke, 0)).toBe(0);
    expect(effectAlphaAtAge(smoke, 4)).toBe(127); // half fade-in (4*255/8)
    expect(effectAlphaAtAge(smoke, 9)).toBe(255);
    // fade-out starts at lifetime-80=10 ticks
    expect(effectAlphaAtAge(smoke, 11)).toBe(251);
    expect(effectAlphaAtAge(smoke, 50)).toBe(127); // 40 remaining of 80
    expect(effectAlphaAtAge(smoke, 89)).toBe(3);
    expect(effectAlphaAtAge(smoke, 90)).toBe(0);
    // lifetime zero renders nothing
    expect(effectAlphaAtAge({ ...smoke, runtimeValue0C: 0 }, 0)).toBe(0);
  });

  it("lerps the puff scale between the authored q12 bounds", () => {
    expect(effectScaleAtAge(smoke, 0)).toBeCloseTo(4000 / 4096, 6);
    expect(effectScaleAtAge(smoke, 45)).toBeCloseTo((4000 + 2500) / 4096, 6);
    expect(effectScaleAtAge(smoke, 90)).toBeCloseTo(9000 / 4096, 6);
    expect(effectScaleAtAge(smoke, 1000)).toBeCloseTo(9000 / 4096, 6);
  });

  it("cycles frames inside the authored shading range", () => {
    const glow = { ...smoke, shadingStartFrame: 0, shadingStopFrame: 24, frameAdvanceThresholdQ4: 15 };
    // sub-threshold rates still advance at most one frame per tick, so the
    // helpers clamp the effective rate at 16 q4-units (one frame per tick)
    expect(effectFrameAtAge(glow, 0)).toBe(0);
    expect(effectFrameAtAge(glow, 16)).toBe(16);
    expect(effectFrameAtAge(glow, 31)).toBe(31 % 25);
    expect(effectFrameAtAge(glow, 400)).toBe(400 % 25);
    // two ticks per frame above the one-frame-per-tick floor
    const slow = { ...smoke, shadingStopFrame: 24, frameAdvanceThresholdQ4: 32 };
    expect(effectFrameAtAge(slow, 47)).toBe(23);
    expect(effectFrameAtAge(slow, 50)).toBe(25 % 25);
    const single = { ...smoke };
    expect(effectFrameAtAge(single, 123)).toBe(0);
  });

  it("drifts kind-2 puffs upward along an easing azimuth", () => {
    const stationary = { ...smoke, movementSpeedQ12: 0, transitionKind: 2 };
    expect(effectTransition2DisplacementAtAge(stationary, 50, 0x2000, 0x4000)).toEqual({
      x: 0,
      y: 0,
      z: 0,
    });
    // other kinds never move
    expect(
      effectTransition2DisplacementAtAge({ ...smoke, transitionKind: 1 }, 50, 0x2000, 0),
    ).toEqual({ x: 0, y: 0, z: 0 });

    const drift = effectTransition2DisplacementAtAge(smoke, 90, 0x0000, 0x0000);
    // elevation 0 means pure horizontal motion; the azimuth eases toward
    // 0x4000 (+y) but stays tilted toward +x inside a 90-tick lifetime
    expect(drift.z).toBeCloseTo(0, 6);
    expect(drift.x).toBeGreaterThan(0);
    expect(drift.y).toBeGreaterThan(0);
    // displacement is bounded by the lifetime
    const clipped = effectTransition2DisplacementAtAge(smoke, 5000, 0, 0);
    expect(clipped.y).toBeCloseTo(drift.y, 6);
    // chimneys rise: elevation from the orientation's top bits below 0x4000
    const rising = effectTransition2DisplacementAtAge(smoke, 90, 0x4000 - 0x1000, 0);
    expect(rising.z).toBeGreaterThan(0);
  });

  it("reproduces the resource emitter rng deterministically", () => {
    const [first, state] = resourceRandomNextPrimary(1);
    const [second, next] = resourceRandomNextPrimary(state);
    expect(first).not.toBe(second);
    const [again] = resourceRandomNextPrimary(1);
    expect(again).toBe(first);
    expect(next).toBeGreaterThan(0);
  });

  it("adds jittered emission intervals", () => {
    expect(emitterIntervalTicks(8, 0, 123456)).toBe(8);
    expect(emitterIntervalTicks(8, 5, 3)).toBe(11);
    expect(emitterIntervalTicks(8, 5, 7)).toBe(10); // 7 % 5
    expect(emitterIntervalTicks(0, 1, 0)).toBe(1);
  });
});
