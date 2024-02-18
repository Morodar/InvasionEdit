import { Card, List, ListItem, ListItemText } from "@mui/material";
import "./DebugSidebar.css";
import { useCursorContext } from "../../context/CursorContext";
import { useDebugSettingsContext } from "../../context/DebugSettingsContext";
import { useTranslation } from "react-i18next";
import { useFldMapContext } from "../../context/FldMapContext";
import { Layers, LayerIndexes, LayerIndex } from "../../../../../domain/fld/Layer";

export const DebugSidebar = () => {
    const { hoveredPoint } = useCursorContext();
    const { fldFile } = useFldMapContext();
    const { debugSettings } = useDebugSettingsContext();
    const { t } = useTranslation();

    if (!debugSettings.showDebugCursorPosition) {
        return <></>;
    }

    if (!fldFile || !hoveredPoint) {
        return <></>;
    }

    const { width, height } = fldFile;
    const z = hoveredPoint % width;
    const x = height - 1 - Math.floor(hoveredPoint / width);
    const items = LayerIndexes.map((layer: LayerIndex) => (
        <ListItem key={layer}>
            <ListItemText>
                {t(Layers[layer].label)}: {fldFile.layers[layer].getUint8(hoveredPoint)}
            </ListItemText>
        </ListItem>
    ));
    return (
        <Card className="debug-sidebar">
            <p>{t("fld-editor.debug.hovered-point")}</p>
            <List disablePadding dense>
                <ListItem>
                    <ListItemText>Index: {hoveredPoint}</ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemText>
                        X: {x} Z: {z}
                    </ListItemText>
                </ListItem>
                {items}
            </List>
        </Card>
    );
};
