import { useCursorContext } from "../../context/CursorContext";
import { useDebugSettingsContext } from "../../context/DebugSettingsContext";
import { Box } from "../map-view/entities/Box";

export const DebugBox = () => {
    const { hoveredPoint } = useCursorContext();
    const { debugSettings } = useDebugSettingsContext();

    if (!debugSettings.showDebugCube || !hoveredPoint) {
        return;
    }
    return <Box position={[hoveredPoint.x, hoveredPoint.value / 8, hoveredPoint.z]} />;
};
