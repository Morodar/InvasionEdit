export interface SprVec3 {
  x: number;
  y: number;
  z: number;
}

export interface SprVertex {
  position: SprVec3;
  normal: SprVec3;
  /** Serialized Q12 texel-space coordinate after q12 conversion */
  textureU: number;
  /** Serialized Q12 texel-space coordinate after q12 conversion */
  textureV: number;
  textureSubresource: number;
  renderFlags: number;
  meshRecordFlags: number;
  meshGroupSelectorMask: number;
}

/**
 * SPR triangles are not shared-vertex; each corner carries its own UV and material.
 * The mesh therefore expands every triangle to three vertices.
 */
export interface SprMesh {
  vertices: SprVertex[];
  indices: number[];
}

export interface SprLodGroup {
  flags: number;
  windingCorrectionCount: number;
  mesh: SprMesh;
}

export interface SprLookupRecord {
  packedKey: number;
  localTranslation: SprVec3;
}

export interface SprFile {
  registryId: number;
  lodGroups: SprLodGroup[];
  lookupRecords: SprLookupRecord[];
  boundsMin: SprVec3;
  boundsMax: SprVec3;
  boundingRadius: number;
  placementHeightOffset: number;
}
