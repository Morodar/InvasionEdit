import { Card, List, ListItem, ListItemText } from "@mui/material";
import "./DebugSidebar.css";
import { useCursorContext } from "../controls/CursorContext";
import { useDebugSettingsContext } from "./DebugSettingsContext";
import { useTranslation } from "react-i18next";
import { useFldMapContext } from "../../domain/fld/FldMapContext";
import { Layers, LayerIndexes, LayerIndex, KnownLayers } from "../../domain/fld/layers/Layer";
import { FldFile, Point3D } from "../../domain/fld/FldFile";

export const DebugSidebar = () => {
    const { hoveredPoint, rawPoint } = useCursorContext();
    const { fldFile } = useFldMapContext();
    const { debugSettings } = useDebugSettingsContext();

    if (!debugSettings.showDebugCursorPosition) {
        return <></>;
    }

    if (!fldFile) {
        return <></>;
    }

    return (
        <Sidebar fldFile={fldFile} hoveredPoint={hoveredPoint ?? 0} rawPoint={rawPoint ?? { z: 0, x: 0, value: 0 }} />
    );
};
interface SidebarProps {
    fldFile: FldFile;
    hoveredPoint: number;
    rawPoint: Point3D;
}
const Sidebar = (props: SidebarProps) => {
    const { fldFile, hoveredPoint, rawPoint } = props;
    const { width, height } = fldFile;
    const { t } = useTranslation();
    const { debugSettings } = useDebugSettingsContext();

    const z = hoveredPoint % width;
    const x = height - 1 - Math.floor(hoveredPoint / width);
    const layers = debugSettings.showAllLayers ? LayerIndexes : KnownLayers;

    const items = layers.map((layer: LayerIndex) => (
        <ListItem key={layer}>
            <ListItemText>
                {t(Layers[layer].label)}: {fldFile.layers[layer].getUint8(hoveredPoint)}
            </ListItemText>
        </ListItem>
    ));

    const newX = height - 1 - x;
    const x2 = newX * -1999;
    const z2 = newX * 1152 + z * 2305;

    const newX3 = height - 1 - rawPoint.x;
    const x3 = Math.floor(newX3 * -1999);
    const z3 = Math.floor(newX3 * 1152 + rawPoint.z * 2305);

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
                <ListItem>
                    <ListItemText>
                        X2: {x2} (0x {formatAsLittleEndianHex(x2)} LE)
                    </ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemText>
                        Z2: {z2} (0x {formatAsLittleEndianHex(z2)} LE)
                    </ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemText>
                        X3: {x3} (0x {formatAsLittleEndianHex(x3)} LE)
                    </ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemText>
                        Z3: {z3} (0x {formatAsLittleEndianHex(z3)} LE)
                    </ListItemText>
                </ListItem>
                {items}
            </List>
        </Card>
    );
};

function formatAsLittleEndianHex(num: number): string {
    // Ensure num is a 32-bit signed integer
    num |= 0;

    // Extract individual bytes in little-endian order
    const byte1 = (num & 0xff).toString(16).toUpperCase().padStart(2, "0");
    const byte2 = ((num >> 8) & 0xff).toString(16).toUpperCase().padStart(2, "0");
    const byte3 = ((num >> 16) & 0xff).toString(16).toUpperCase().padStart(2, "0");
    const byte4 = ((num >> 24) & 0xff).toString(16).toUpperCase().padStart(2, "0");

    // Concatenate the bytes in little-endian order with spaces
    const hexString = `${byte1} ${byte2} ${byte3} ${byte4}`;

    return hexString;
}
