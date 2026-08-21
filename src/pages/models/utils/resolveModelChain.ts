import { MdlNode } from "../../../domain/mdl/MdlFile";
import { SprFile, SprVec3 } from "../../../domain/spr/SprFile";
import { normalizeAssetDisplayName, strString } from "../../../domain/str/StrUtils";
import { ParsedModelFiles } from "./parseModelPckEntries";
import { findChildAttachment } from "./modelHierarchy";

export interface ModelChainNode {
  /** index into the owning ResolvedModel.nodes, -1 for the root */
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
}

/** texte/help.str text page 0x18: model names start at resource index 0x4F. */
const NAME_TEXT_BASE_INDEX = 0x4f;

/**
 * Resolves the ARM→MDL→SPR chain for every ARM record.
 *
 * Only the base technology variant (the first nonzero model definition slot of
 * the ARM root node) is resolved - technology variant selection is out of scope.
 */
export function resolveModelChain(parsed: ParsedModelFiles): ResolvedModel[] {
  const models: ResolvedModel[] = [];

  for (const armFile of parsed.armFiles) {
    for (const record of armFile.file.records) {
      const rootNode = record.rootNode;
      const definitionId = rootNode ? firstNonZero(rootNode.modelDefinitionIds) : 0;
      const mdlRecord = definitionId !== 0 ? parsed.mdlRecords.get(definitionId) : undefined;

      const nodes: ModelChainNode[] = [];
      if (mdlRecord && mdlRecord.hierarchyNodes.length > 0) {
        appendHierarchyNodes(mdlRecord.hierarchyNodes, parsed, nodes);
      }

      models.push({
        armFilePath: armFile.path,
        armRegistryId: record.registryId,
        mdlDefinitionId: mdlRecord?.definitionId ?? null,
        name: mdlRecord ? resolveModelName(parsed, mdlRecord.nameTextOffset) : null,
        nodes,
      });
    }
  }
  return models;
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

function appendHierarchyNodes(
  hierarchyNodes: MdlNode[],
  parsed: ParsedModelFiles,
  output: ModelChainNode[],
): void {
  hierarchyNodes.forEach((node, index) => {
    // The parser emits a depth-first pre-order list; the parent is the closest
    // preceding node whose child offsets contain this node's offset.
    let parentIndex = -1;
    let childSlot = 0;
    for (let candidate = index - 1; candidate >= 0; candidate--) {
      const slot = hierarchyNodes[candidate].childOffsets.indexOf(node.serializedOffset);
      if (slot !== -1) {
        parentIndex = candidate;
        childSlot = slot;
        break;
      }
    }
    const depth = parentIndex === -1 ? 0 : output[parentIndex].depth + 1;
    const sprPath = node.spritePath;
    const sprFile: SprFile | null =
      sprPath !== "" ? (parsed.sprFiles.get(sprPath) ?? null) : null;
    const parentSprFile = parentIndex === -1 ? null : output[parentIndex].sprFile;
    output.push({
      parentIndex,
      childSlot,
      depth,
      mdlNode: node,
      sprPath,
      sprFile,
      attachmentTranslation:
        parentIndex === -1
          ? { x: 0, y: 0, z: 0 }
          : (findChildAttachment(parentSprFile, childSlot) ?? { x: 0, y: 0, z: 0 }),
    });
  });
}

function firstNonZero(values: number[]): number {
  return values.find((value) => value !== 0) ?? 0;
}
