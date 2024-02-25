import { Card, CardContent, IconButton, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import "./LayerSettings.css";
import { H3 } from "../../../../../common/header/Headers";
import { LayerSetting, useLayerViewContext } from "../../context/LayerViewContext";
import { KnownLayers, LayerIndexes, Layers } from "../../../../../domain/fld/Layer";
import { useTranslation } from "react-i18next";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LayersIcon from "@mui/icons-material/Layers";
import LayersClearIcon from "@mui/icons-material/LayersClear";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useDebugSettingsContext } from "../../context/DebugSettingsContext";

export const LayerSettings = () => {
    const { layerSettings } = useLayerViewContext();
    const { debugSettings } = useDebugSettingsContext();
    const layers = debugSettings.showAllLayers ? LayerIndexes : KnownLayers;
    const layerItems = layers.map((layer) => <LayerSettingItem key={layer} layerSettings={layerSettings[layer]} />);
    return (
        <Typography component="div">
            <Card className="layer-settings">
                <CardContent className="layer-content">
                    <H3 variant="subtitle1">Layers</H3>
                    <List className="list-container" disablePadding dense>
                        {layerItems}
                    </List>
                </CardContent>
            </Card>
        </Typography>
    );
};

interface LayerSettingItemProps {
    layerSettings: LayerSetting;
}

const LayerSettingItem = (props: LayerSettingItemProps) => {
    const { t } = useTranslation();
    const { hide, layer } = props.layerSettings;
    const { toggleHide } = useLayerViewContext();

    const layerMeta = Layers[layer];
    const color = hide ? "textSecondary" : "textPrimary";

    return (
        <Typography color={color} component="div">
            <ListItem disableGutters secondaryAction={<LayerAction layerSettings={props.layerSettings} />}>
                <ListItemIcon>
                    <IconButton onClick={() => toggleHide(layer)}>
                        {hide ? (
                            <VisibilityOffIcon color="disabled" fontSize="small" />
                        ) : (
                            <VisibilityIcon fontSize="small" />
                        )}
                    </IconButton>
                </ListItemIcon>
                <ListItemText>{t(layerMeta.label)}</ListItemText>
            </ListItem>
        </Typography>
    );
};

const LayerAction = (props: LayerSettingItemProps) => {
    const { toggleWireframe } = useLayerViewContext();
    const { hide, showWireframe, layer } = props.layerSettings;
    if (hide) {
        return <></>;
    }
    const icon = showWireframe ? <LayersClearIcon fontSize="small" /> : <LayersIcon fontSize="small" />;
    return <IconButton onClick={() => toggleWireframe(layer)}>{icon}</IconButton>;
};
