import { ArmUtils } from "../../../domain/arm/ArmUtils";
import { MdlUtils } from "../../../domain/mdl/MdlUtils";
import { SprUtils } from "../../../domain/spr/SprUtils";
import { GfxUtils } from "../../../domain/gfx/GfxUtils";
import { MdlRecord } from "../../../domain/mdl/MdlFile";
import { SprFile } from "../../../domain/spr/SprFile";
import { ArmFile } from "../../../domain/arm/ArmFile";
import { PckFile } from "../../../domain/pck/PckFile";

export interface NamedArmFile {
  path: string;
  file: ArmFile;
}

export interface NamedGfxUtils {
  path: string;
  utils: GfxUtils;
}

export interface ParsedModelFiles {
  armFiles: NamedArmFile[];
  /** model definition id → record (first definition wins) */
  mdlRecords: Map<number, MdlRecord>;
  /** normalized SPR path → parsed file */
  sprFiles: Map<string, SprFile>;
  gfxFiles: NamedGfxUtils[];
}

export function normalizeAssetPath(path: string): string {
  return path.replace(/\\/g, "/").toLowerCase();
}

export function fileExtension(path: string): string {
  const normalized = normalizeAssetPath(path);
  const dot = normalized.lastIndexOf(".");
  return dot === -1 ? "" : normalized.substring(dot + 1);
}

/**
 * Filters and parses the ARM/MDL/SPR/GFX entries of a PCK archive.
 * Entries that fail to parse are skipped - the viewer should still work
 * when single assets of a mixed archive are damaged.
 */
export function parseModelPckEntries(pck: PckFile): ParsedModelFiles {
  const result: ParsedModelFiles = {
    armFiles: [],
    mdlRecords: new Map(),
    sprFiles: new Map(),
    gfxFiles: [],
  };
  mergeModelPckEntries(result, pck);
  return result;
}

/**
 * Parses a PCK archive and merges its entries into an existing result.
 * Models are spread over several game archives (DATEN.PCK: ARM/MDL,
 * MODELLE.PCK: SPR, GRAPHIK.PCK: GFX/PAL), so archives are loaded incrementally.
 */
export function mergeModelPckEntries(target: ParsedModelFiles, pck: PckFile): void {
  for (const entry of pck.pckFileEntries) {
    const path = normalizeAssetPath(entry.name);
    try {
      switch (fileExtension(path)) {
        case "arm": {
          const file: ArmFile = ArmUtils.parse(entry.dataBytes);
          target.armFiles.push({ path, file });
          break;
        }
        case "mdl": {
          const file = MdlUtils.parse(entry.dataBytes);
          for (const record of file.records) {
            if (!target.mdlRecords.has(record.definitionId)) {
              target.mdlRecords.set(record.definitionId, record);
            }
          }
          break;
        }
        case "spr": {
          const file: SprFile = SprUtils.parse(entry.dataBytes);
          target.sprFiles.set(path, file);
          break;
        }
        case "gfx": {
          target.gfxFiles.push({ path, utils: new GfxUtils(entry.dataBytes) });
          break;
        }
        default:
          break;
      }
    } catch {
      // skip damaged or unsupported entries
    }
  }
}
