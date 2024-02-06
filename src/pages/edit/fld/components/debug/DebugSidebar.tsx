import { Card } from "@mui/material";
import "./DebugSidebar.css";
import { useCursorContext } from "../../context/CursorContext";
import { Point3D } from "../../../../../domain/fld/MapLayer";
import { useDebugSettingsContext } from "../../context/DebugSettingsContext";
import { useTranslation } from "react-i18next";

export const DebugSidebar = () => {
    const { hoveredPoint, selectedPoint, meshPoint } = useCursorContext();
    const { debugSettings } = useDebugSettingsContext();
    const { t } = useTranslation();
    if (!debugSettings.showDebugCursorPosition) {
        return <></>;
    }

    return (
        <Card className="debug-sidebar">
            <p>{t("fld-editor.debug.mesh-point")}</p>
            <FormatCoordinate point={meshPoint} />
            <p>{t("fld-editor.debug.hovered-point")}</p>
            <FormatCoordinate point={hoveredPoint} />
            <p>{t("fld-editor.debug.selected-point")}</p>
            <FormatCoordinate point={selectedPoint} />
        </Card>
    );
};

interface FormatCoordinateProps {
    point?: Point3D;
}
const FormatCoordinate = (props: FormatCoordinateProps) => {
    const { point } = props;
    const x = point?.x ?? "-";
    const z = point?.z ?? "-";
    const value = point?.value ?? "-";
    return (
        <small>
            x:{x ?? "-"} z:{z ?? "-"} value:{value ?? "-"}
        </small>
    );
};
