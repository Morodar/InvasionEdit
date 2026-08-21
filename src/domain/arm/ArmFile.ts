export interface ArmNode {
  serializedOffset: number;
  childCount: number;
  childOffsets: number[];
  /** 8 MDL definition slots; slot 0 is the base variant */
  modelDefinitionIds: number[];
  /** Parsed technology-variant children in slot order */
  children: ArmNode[];
}

export interface ArmRecord {
  registryId: number;
  rootNodeOffset: number;
  rootNode: ArmNode | null;
}

export interface ArmFile {
  records: ArmRecord[];
}
