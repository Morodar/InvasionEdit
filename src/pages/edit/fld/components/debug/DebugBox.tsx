import { useCursorContext } from "../../context/CursorContext";
import { Box } from "../map-view/entities/Box";

export const DebugBox = () => {
    const { hoveredPoint } = useCursorContext();
    if (!hoveredPoint) {
        return;
    }
    return <Box position={[hoveredPoint.x + 0.5, hoveredPoint.value / 8, hoveredPoint.z + 0.5]} />;
};
