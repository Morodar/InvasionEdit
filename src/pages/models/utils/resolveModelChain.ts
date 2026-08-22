import { MdlNode } from "../../../domain/mdl/MdlFile";
import { SprFile, SprVec3 } from "../../../domain/spr/SprFile";
import { normalizeAssetDisplayName, strString } from "../../../domain/str/StrUtils";
import { ArmNode } from "../../../domain/arm/ArmFile";
import { ParsedModelFiles } from "./parseModelPckEntries";
import { findChildAttachment } from "./modelHierarchy";

export interface ModelChainNode {
  /** index into the owning ResolvedModel.nodes, -1 for the model root */
  parentIndex: number;
  childSlot: number;
  depth: number;
  mdlNode: MdlNode;
  sprPath: string;
  sprFile: SprFile | null;
  /** attachment point of this node inside its parent's SPR (zero for the root) */
  attachmentTranslation: SprVec3;
}

export interface ResolvedModel {
  armFilePath: string;
  armRegistryId: number;
  mdlDefinitionId: number | null;
  /** localized display name from texte/help.str, when resolvable */
  name: string | null;
  nodes: ModelChainNode[];
  /** diagnostics for chain parts that could not be resolved from loaded archives */
  warnings: string[];
}

/** texte/help.str text page 0x18: model names start at resource index 0x4F. */
const NAME_TEXT_BASE_INDEX = 0x4f;

/**
 * Only unit and building presets consume help.str names in the stock editor
 * (the reference gates naming on Unit/Building browser kinds); scenery
 * archives - trees, rocks, ruins - keep their registry fallback labels.
 */
const NAMED_ARM_FILE = /(^|\/)arm\/(building\d*|unit\d*)\.arm$/;

/**
 * Unit and building presets are faction assets (armyN texture family);
 * everything else is neutral scenery rendered with the factionless army0
 * family (editor_app.cpp routes Element/resource presets to faction 0).
 */
export function isUnitOrBuildingAsset(armFilePath: string): boolean {
  return NAMED_ARM_FILE.test(armFilePath);
}

const ZERO_TRANSLATION: SprVec3 = { x: 0, y: 0, z: 0 };

/**
 * One ARM tree node: a technology-variant group whose children are attached
 * sub-models (turrets, weapons). Each slot of modelDefinitionIds holds the MDL
 * definition of one technology variant; slot 0 is the serialized baseline.
 */
interface ArmVariantGroup {
  parentGroupIndex: number;
  childSlot: number;
  depth: number;
  modelDefinitionIds: number[];
}

/**
 * MDL nodes whose low flag nibble is nonzero create no runtime node - they are
 * attachment sockets. ARM child groups plug into the socket at their slot; the
 * socket's rotation becomes the attached sub-model root rotation.
 */
interface DeferredAttachment {
  parentIndex: number;
  childSlot: number;
  rotationAngles: [number, number, number];
}

/**
 * Resolves the ARM→MDL→SPR chain for every ARM record.
 *
 * The ARM tree is walked as variant groups; each group contributes its baseline
 * (slot 0) MDL hierarchy and its child groups attach at the flattened MDL
 * socket positions - that is how turrets and weapons become part of a vehicle.
 * Technology variants above slot 0 are out of scope.
 */
export function resolveModelChain(parsed: ParsedModelFiles): ResolvedModel[] {
  const models: ResolvedModel[] = [];
  // Mission/installation copies of an .arm file (building.arm, building01.arm, ...)
  // repeat identical registries; the stock catalog keeps one preset per registry id.
  const seenRegistries = new Set<number>();

  for (const armFile of parsed.armFiles) {
    for (const record of armFile.file.records) {
      if (seenRegistries.has(record.registryId)) {
        continue;
      }
      seenRegistries.add(record.registryId);
      const groups: ArmVariantGroup[] = [];
      if (record.rootNode) {
        collectVariantGroups(record.rootNode, -1, 0, 0, groups);
      }

      const nodes: ModelChainNode[] = [];
      const warnings: string[] = [];
      const rootDefinitionId =
        groups.length > 0
          ? appendVariantGroup(parsed, groups, 0, null, nodes, warnings)
          : 0;

      const mdlRecord = rootDefinitionId !== 0 ? parsed.mdlRecords.get(rootDefinitionId) : undefined;
      models.push({
        armFilePath: armFile.path,
        armRegistryId: record.registryId,
        mdlDefinitionId: rootDefinitionId !== 0 ? rootDefinitionId : null,
        name:
          mdlRecord && isUnitOrBuildingAsset(armFile.path)
            ? resolveModelName(parsed, mdlRecord.nameTextOffset)
            : null,
        nodes,
        warnings,
      });
    }
  }
  return models;
}

function collectVariantGroups(
  node: ArmNode,
  parentGroupIndex: number,
  childSlot: number,
  depth: number,
  output: ArmVariantGroup[],
): void {
  const index = output.length;
  output.push({
    parentGroupIndex,
    childSlot,
    depth,
    modelDefinitionIds: node.modelDefinitionIds,
  });
  node.children.forEach((child, slot) => {
    collectVariantGroups(child, index, slot, depth + 1, output);
  });
}

/**
 * Appends one variant group's flattened MDL hierarchy to the output and
 * recurses into its attached child groups. Returns the selected MDL
 * definition id, or 0 when the group has no baseline variant.
 */
function appendVariantGroup(
  parsed: ParsedModelFiles,
  groups: ArmVariantGroup[],
  groupIndex: number,
  attachment: DeferredAttachment | null,
  output: ModelChainNode[],
  warnings: string[],
): number {
  const group = groups[groupIndex];
  // The executable initializes the selected definition from serialized ARM
  // slot zero; later slots replace it only when their technology is unlocked.
  const definitionId = group.modelDefinitionIds[0] ?? 0;
  if (definitionId === 0) {
    return 0;
  }
  const record = parsed.mdlRecords.get(definitionId);
  if (!record) {
    warnings.push(`MDL ${definitionId} not found in loaded archives`);
    return definitionId;
  }
  const hierarchy = record.hierarchyNodes;

  const externalParent = attachment ? attachment.parentIndex : -1;
  const externalSlot = attachment ? attachment.childSlot : 0;
  const deferred: DeferredAttachment[] = [];
  const remap = hierarchy.map(() => -1);
  const lineage = hierarchyLineage(hierarchy);

  hierarchy.forEach((node, localIndex) => {
    const isRoot = localIndex === 0;
    let mappedParent = externalParent;
    if (!isRoot) {
      if (lineage[localIndex].parent === -1) {
        return;
      }
      mappedParent = remap[lineage[localIndex].parent];
      if (mappedParent === -1) {
        return;
      }
    }
    const childSlot = lineage[localIndex].childSlot;
    if ((node.flags & 0xf) !== 0) {
      deferred.push({
        parentIndex: mappedParent,
        childSlot,
        rotationAngles: [...node.localRotationAngles],
      });
      return;
    }
    if (node.spritePath === "") {
      return;
    }
    // An attached sub-model root inherits the socket's orientation (the stock
    // editor's root_override); otherwise shoulder weapons would ignore the
    // yaw/pitch their socket was authored with.
    const mdlNode =
      isRoot && attachment
        ? { ...node, localRotationAngles: [...attachment.rotationAngles] }
        : node;
    const outParent = isRoot ? externalParent : mappedParent;
    const outSlot = isRoot ? externalSlot : childSlot;
    const sprPath = node.spritePath;
    const sprFile: SprFile | null = parsed.sprFiles.get(sprPath) ?? null;
    const parentSprFile = outParent === -1 ? null : output[outParent].sprFile;
    remap[localIndex] = output.length;
    output.push({
      parentIndex: outParent,
      childSlot: outSlot,
      depth: outParent === -1 ? 0 : output[outParent].depth + 1,
      mdlNode,
      sprPath,
      sprFile,
      attachmentTranslation:
        outParent === -1
          ? ZERO_TRANSLATION
          : (findChildAttachment(parentSprFile, outSlot) ?? ZERO_TRANSLATION),
    });
  });

  // Child groups attach at the deferred socket whose push position equals the
  // group's ARM child slot (mirrors the stock editor's deferred vector).
  groups.forEach((childGroup, childIndex) => {
    if (childGroup.parentGroupIndex !== groupIndex) {
      return;
    }
    const socket = deferred[childGroup.childSlot];
    if (!socket) {
      warnings.push(
        `attachment slot ${childGroup.childSlot} of MDL ${definitionId} has no matching socket`,
      );
      return;
    }
    appendVariantGroup(parsed, groups, childIndex, socket, output, warnings);
  });
  return definitionId;
}

/**
 * Parent local index and child slot per hierarchy node; the pre-order root has
 * parent -1 and slot 0.
 */
function hierarchyLineage(
  hierarchy: MdlNode[],
): { parent: number; childSlot: number }[] {
  const result = hierarchy.map(() => ({ parent: -1, childSlot: 0 }));
  for (let index = 1; index < hierarchy.length; index++) {
    for (let candidate = index - 1; candidate >= 0; candidate--) {
      const slot = hierarchy[candidate].childOffsets.indexOf(hierarchy[index].serializedOffset);
      if (slot !== -1) {
        result[index] = { parent: candidate, childSlot: slot };
        break;
      }
    }
  }
  return result;
}

function resolveModelName(parsed: ParsedModelFiles, nameTextOffset: number): string | null {
  if (!parsed.helpText) {
    return null;
  }
  try {
    const raw = strString(parsed.helpText, NAME_TEXT_BASE_INDEX + nameTextOffset);
    const normalized = normalizeAssetDisplayName(raw);
    return normalized === "" ? null : normalized;
  } catch {
    return null;
  }
}
