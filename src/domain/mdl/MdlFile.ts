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
  shotDefinitionId: number;
  reloadTicks: number;
  maximumIntegrity: number;
}

export interface MdlFile {
  records: MdlRecord[];
}
