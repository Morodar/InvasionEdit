export interface EffRecord {
  /** 0..4 - recovered dispatch table of the effect update callback */
  transitionKind: number;
  definitionId: number;
  /** completed-frame count that drives the effect lifetime */
  runtimeValue0C: number;
  linkedEffectPresent: number;
  linkedEffectId: number;
  linkedShotPresent: number;
  linkedShotId: number;
  movementSpeedQ12: number;
  terrainGridMaskIndex: number;
  creationFlags: number;
  shadingColorArgb: number;
  shadingTransitionTicks: number;
  shadingReleaseTransitionTicks: number;
  frameAdvanceThresholdQ4: number;
  shadingStartFrame: number;
  shadingStopFrame: number;
  periodicEffectId: number;
  periodicEffectIntervalTicks: number;
  alphaFadeInTicks: number;
  alphaFadeOutTicks: number;
  stateTintArgb: number;
  modelScaleXQ12: number;
  modelScaleYQ12: number;
  positionedSoundArgument0: number;
  positionedSoundArgument1: number;
  /** normalized SPR path of the effect sprite (backslashes lowercased, .spr appended) */
  spritePath: string;
}

export interface EffFile {
  records: EffRecord[];
}
