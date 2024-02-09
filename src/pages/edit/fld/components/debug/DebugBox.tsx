import { useCursorContext } from "../../context/CursorContext";
import { useDebugSettingsContext } from "../../context/DebugSettingsContext";
import { useFldMapContext } from "../../context/FldMapContext";
import { Box } from "../map-view/entities/Box";

export const DebugBox = () => {
    const { hoveredPoint } = useCursorContext();
    const { debugSettings } = useDebugSettingsContext();
    const { fldFile } = useFldMapContext();

    if (!debugSettings.showDebugCube || !hoveredPoint || !fldFile) {
        return;
    }
    const point = fldFile.points[hoveredPoint];
    return <Box position={[point.x, point.value / 8, point.z]} />;
};
