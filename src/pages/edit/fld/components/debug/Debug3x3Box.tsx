import { FldFile, getRelativePoints } from "../../../../../domain/fld/FldFile";
import { useCursorContext } from "../../context/CursorContext";
import { useDebugSettingsContext } from "../../context/DebugSettingsContext";
import { useFldMapContext } from "../../context/FldMapContext";
import { Box } from "../map-view/entities/Box";

export const Debug3x3Box = () => {
    const { hoveredPoint } = useCursorContext();
    const { debugSettings } = useDebugSettingsContext();
    const { fldFile } = useFldMapContext();

    if (!debugSettings.showDebugCube3x3 || !hoveredPoint || !fldFile) {
        return;
    }

    return <Render fldFile={fldFile} hoveredPoint={hoveredPoint} />;
};

interface RenderProps {
    fldFile: FldFile;
    hoveredPoint: number;
}

const Render = (props: RenderProps) => {
    const { fldFile, hoveredPoint } = props;
    const points = getRelativePoints(fldFile, hoveredPoint, 3, 3);
    return (
        <>
            {points.map((p) => (
                <Box key={`${p.x}-${p.value}-${p.z}`} position={[p.x, p.value / 8 + 1, p.z]} />
            ))}
        </>
    );
};
