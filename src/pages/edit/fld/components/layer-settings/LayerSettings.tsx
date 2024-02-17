import { Card, CardContent, List, ListItem } from "@mui/material";
import "./LayerSettings.css";
import { H3 } from "../../../../../common/header/Headers";
import { LayerSetting, useLayerViewContext } from "../../context/LayerViewContext";
import { LayerIndexes } from "../../../../../domain/fld/Layer";

export const LayerSettings = () => {
    const { layerSettings } = useLayerViewContext();
    return (
        <Card className="layer-settings">
            <CardContent className="layer-content">
                <H3 variant="subtitle1">Layer Settings</H3>
                <List className="list-container" disablePadding>
                    {LayerIndexes.map((layer) => (
                        <LayerSettingItem key={layer} layerSettings={layerSettings[layer]} />
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};

interface LayerSettingItemProps {
    layerSettings: LayerSetting;
}

const LayerSettingItem = (props: LayerSettingItemProps) => {
    return <ListItem>{props.layerSettings.layer}</ListItem>;
};
