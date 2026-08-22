import { describe, expect, it } from "vitest";
import {
  animatedChild2TranslationQ12,
  childUsesBoundedVerticalChannel,
  modelRuntimeChildYawStep,
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
