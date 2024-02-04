import { useCursorContext } from "../../context/CursorContext";
import { Box } from "../map-view/entities/Box";

export const DebugBox = () => {
    const { hoveredPoint } = useCursorContext();
    if (!hoveredPoint) {
        return;
    }
    return <Box position={[hoveredPoint.x, hoveredPoint.value / 8, hoveredPoint.z]} />;
};
