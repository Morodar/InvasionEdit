import { ArmUtils } from "../../../domain/arm/ArmUtils";
import { MdlUtils } from "../../../domain/mdl/MdlUtils";
import { SprUtils } from "../../../domain/spr/SprUtils";
import { GfxUtils } from "../../../domain/gfx/GfxUtils";
import { PalUtils } from "../../../domain/pal/PalUtils";
import { StrUtils } from "../../../domain/str/StrUtils";
import { EffUtils } from "../../../domain/eff/EffUtils";
import { MdlRecord } from "../../../domain/mdl/MdlFile";
import { SprFile } from "../../../domain/spr/SprFile";
import { ArmFile } from "../../../domain/arm/ArmFile";
import { PalFile } from "../../../domain/pal/PalFile";
import { StrFile } from "../../../domain/str/StrFile";
import { EffRecord } from "../../../domain/eff/EffFile";
import { PckFile } from "../../../domain/pck/PckFile";

export interface NamedArmFile {
  path: string;
  file: ArmFile;
}

export interface NamedGfxUtils {
  path: string;
  utils: GfxUtils;
}

export interface NamedPalFile {
  path: string;
  file: PalFile;
}

/** Path of the text page holding model/building display names. */
export const HELP_TEXT_PATH = "texte/help.str";

export interface ParsedModelFiles {
  armFiles: NamedArmFile[];
  /** model definition id → record (first definition wins) */
  mdlRecords: Map<number, MdlRecord>;
  /** per-level model definitions from level/<map-set>/ archives; they shadow
   *  nothing - the game mounts them alongside (not instead of) the base set */
  levelMdlRecords: Map<string, Map<number, MdlRecord>>;
  /** normalized SPR path → parsed file */
  sprFiles: Map<string, SprFile>;
  /** effect definition id → record (first definition wins) */
  effectRecords: Map<number, EffRecord>;
  gfxFiles: NamedGfxUtils[];
  palFiles: NamedPalFile[];
  /** texte/help.str when present - source of model/building names */
  helpText: StrFile | null;
}

/**
 * LEVEL.PCK ships map-set specific ARM/MDL archives below level/<name>/
 * (e.g. level/tutorial/) that redefine the same registry and definition ids
 * as the base archives with different hierarchies. Assets of one map set are
 * kept separate so both variants stay resolvable.
 */
export function levelNamespace(path: string): string {
  const match = /^level\/([^/]+)\//.exec(path);
  return match ? `level/${match[1]}` : "";
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
    levelMdlRecords: new Map(),
    sprFiles: new Map(),
    effectRecords: new Map(),
    gfxFiles: [],
    palFiles: [],
    helpText: null,
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
          // archives may list the same asset path twice (e.g. GRAPHIK.PCK
          // ships engine/font.gfx multiple times) - first occurrence wins
          if (target.armFiles.some((arm) => arm.path === path)) {
            break;
          }
          const file: ArmFile = ArmUtils.parse(entry.dataBytes);
          target.armFiles.push({ path, file });
          break;
        }
        case "mdl": {
          const file = MdlUtils.parse(entry.dataBytes);
          const namespace = levelNamespace(path);
          const records =
            namespace === ""
              ? target.mdlRecords
              : (() => {
                  let map = target.levelMdlRecords.get(namespace);
                  if (!map) {
                    map = new Map();
                    target.levelMdlRecords.set(namespace, map);
                  }
                  return map;
                })();
          for (const record of file.records) {
            if (!records.has(record.definitionId)) {
              records.set(record.definitionId, record);
            }
          }
          break;
        }
        case "spr": {
          const file: SprFile = SprUtils.parse(entry.dataBytes);
          target.sprFiles.set(path, file);
          break;
        }
        case "eff": {
          // first definition wins, mirroring the catalog try_emplace
          for (const record of EffUtils.parse(entry.dataBytes).records) {
            if (!target.effectRecords.has(record.definitionId)) {
              target.effectRecords.set(record.definitionId, record);
            }
          }
          break;
        }
        case "gfx": {
          if (target.gfxFiles.some((gfx) => gfx.path === path)) {
            break;
          }
          const utils = new GfxUtils(entry.dataBytes);
          // GfxUtils parses lazily - force it here so damaged archives are skipped
          utils.parseGfxFile();
          target.gfxFiles.push({ path, utils });
          break;
        }
        case "pal": {
          if (target.palFiles.some((pal) => pal.path === path)) {
            break;
          }
          target.palFiles.push({
            path,
            file: PalUtils.parse(entry.dataBytes),
          });
          break;
        }
        case "str": {
          if (path === HELP_TEXT_PATH) {
            // later archives override earlier ones so patch archives
            // (PATCH00.PCK) replace their base version (ENGINE.PCK)
            target.helpText = StrUtils.parse(entry.dataBytes);
          }
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
