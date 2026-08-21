import { List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import { ResolvedModel } from "../utils/resolveModelChain";

export interface ModelTreeViewProps {
  models: ResolvedModel[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

/**
 * Hierarchical tree of all resolved models: ARM record → MDL chain → SPR paths.
 * Clicking an ARM record selects the whole model for rendering.
 */
export const ModelTreeView = ({ models, selectedIndex, onSelect }: ModelTreeViewProps) => {
  if (models.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No ARM models found in this PCK file.
      </Typography>
    );
  }

  return (
    <List dense disablePadding>
      {models.map((model, index) => (
        <ModelTreeItem
          key={`${model.armFilePath}-${model.armRegistryId}-${index}`}
          model={model}
          index={index}
          selected={selectedIndex === index}
          onSelect={onSelect}
        />
      ))}
    </List>
  );
};

interface ModelTreeItemProps {
  model: ResolvedModel;
  index: number;
  selected: boolean;
  onSelect: (index: number) => void;
}

const ModelTreeItem = ({ model, index, selected, onSelect }: ModelTreeItemProps) => {
  const rootSprPath = model.nodes[0]?.sprPath ?? "-";
  const primary = model.name ?? `Registry ${model.armRegistryId}`;
  return (
    <>
      <ListItem disablePadding>
        <ListItemButton selected={selected} onClick={() => onSelect(index)}>
          <ListItemText
            primary={primary}
            secondary={
              model.mdlDefinitionId !== null
                ? `MDL ${model.mdlDefinitionId} · ${rootSprPath}`
                : "no base model"
            }
          />
        </ListItemButton>
      </ListItem>
      {selected &&
        model.nodes.map((node, nodeIndex) => {
          const vertexCount =
            node.sprFile?.lodGroups.reduce((sum, group) => sum + group.mesh.vertices.length, 0) ??
            0;
          return (
            <ListItem key={nodeIndex} sx={{ pl: 4 }} disableGutters>
              <ListItemText
                primary={node.sprPath !== "" ? node.sprPath : `node ${nodeIndex} (attachment)`}
                secondary={
                  node.sprPath === ""
                    ? "transform-only node"
                    : node.sprFile
                      ? vertexCount > 0
                        ? `${vertexCount} vertices`
                        : "empty mesh (no geometry)"
                      : "SPR not found"
                }
                slotProps={{
                  primary: { variant: "body2" },
                  secondary: { variant: "caption" },
                }}
              />
            </ListItem>
          );
        })}
    </>
  );
};
