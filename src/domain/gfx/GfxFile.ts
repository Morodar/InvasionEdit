export interface GfxSubresource {
  logicalWidth: number;
  logicalHeight: number;
  /** -1 when the subresource stores direct ARGB pixels */
  paletteBank: number;
  dataOffset: number;
  originX: number;
  originY: number;
  pixelWidth: number;
  pixelHeight: number;
}

export interface GfxFile {
  paletteArgb: number[];
  subresources: GfxSubresource[];
}
