import * as THREE from "three";
import { NamedGfxUtils } from "./parseModelPckEntries";
import { SprFile } from "../../../domain/spr/SprFile";
import { SPR_UNTEXTURED_SUBRESOURCE } from "../../../domain/spr/SprUtils";

/**
 * Provides GFX textures and dimension lookup for SPR texture subresources.
 *
 * Model textures are spread over several archives: unit/building textures live in
 * the faction archives gfx/mdl/armyN.gfx (subresources 0..113), effect textures in
 * gfx/texturen/effect.gfx and friends. Archives are searched in priority order -
 * the user-selected faction archive should come first.
 */
export class ModelTextureProvider {
  private readonly textureCache = new Map<number, THREE.Texture | null>();

  constructor(private readonly gfxFiles: NamedGfxUtils[]) {}

  get hasTextures(): boolean {
    return this.gfxFiles.length > 0;
  }

  getDimensions(subresource: number): { width: number; height: number } | undefined {
    const source = this.findUtils(subresource)?.utils.getSubresource(subresource);
    return source ? { width: source.pixelWidth, height: source.pixelHeight } : undefined;
  }

  getTexture(subresource: number): THREE.Texture | null {
    if (subresource === SPR_UNTEXTURED_SUBRESOURCE) {
      return null;
    }
    if (!this.textureCache.has(subresource)) {
      this.textureCache.set(subresource, this.createTexture(subresource));
    }
    return this.textureCache.get(subresource) ?? null;
  }

  private findUtils(subresource: number): NamedGfxUtils | undefined {
    return this.gfxFiles.find((gfx) => gfx.utils.hasSubresource(subresource));
  }

  private createTexture(subresource: number): THREE.Texture | null {
    const utils = this.findUtils(subresource);
    if (!utils) {
      return null;
    }
    try {
      const decoded = utils.utils.decodeSubresourceRgba(subresource);
      const texture = new THREE.DataTexture(
        decoded.rgba,
        decoded.width,
        decoded.height,
        THREE.RGBAFormat,
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
      return texture;
    } catch {
      return null;
    }
  }
}

/** Highest texture subreference used by any mesh of the given SPR files (sentinel excluded). */
export function maxTextureSubresource(sprFiles: SprFile[]): number {
  let maximum = 0;
  for (const spr of sprFiles) {
    for (const group of spr.lodGroups) {
      for (const vertex of group.mesh.vertices) {
        if (
          vertex.textureSubresource !== SPR_UNTEXTURED_SUBRESOURCE &&
          vertex.textureSubresource > maximum
        ) {
          maximum = vertex.textureSubresource;
        }
      }
    }
  }
  return maximum;
}
