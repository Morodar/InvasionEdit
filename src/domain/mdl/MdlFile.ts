export interface MdlNode {
  serializedOffset: number;
  flags: number;
  /** turn16 rotation angles (65536 == full turn) */
  localRotationAngles: [number, number, number];
  childCount: number;
  childOffsets: number[];
  spritePath: string;
}

export interface MdlRecord {
  definitionId: number;
  /** → texte/help.str page 0x18, index 0x4F + value */
  nameTextOffset: number;
  runtimeClassId: number;
  shotImpactClassIndex: number;
  rootNodeOffset: number;
  runtimeRenderFlags: number;
  placementOccupancyClass: number;
  hierarchyNodes: MdlNode[];
  spritePath: string;
  classStepQ12: number;
  yawMaxVelocity: number;
  pitchMaxVelocity: number;
  yawAcceleration: number;
  pitchMin: number;
  pitchMax: number;
  shotDefinitionId: number;
  reloadTicks: number;
  maximumIntegrity: number;
  /** class 2: +0x1B8 track U channel; class 13: +0xC0 root texture overlay */
  primaryAnimatedSubresource: number;
  /** class 2 only: +0x1BC second track U channel */
  secondaryAnimatedSubresource: number;
  /** periodic effect (smoke, fire, ...) from the game's effect table */
  timedEffectId: number;
  timedEffectIntervalTicks: number;
  timedEffectRandomTicks: number;
}

export interface MdlFile {
  records: MdlRecord[];
}
