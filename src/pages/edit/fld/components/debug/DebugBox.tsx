import { Layer } from "../../../../../domain/fld/Layer";
import { useCursorContext } from "../../context/CursorContext";
import { useDebugSettingsContext } from "../../context/DebugSettingsContext";
import { useFldMapContext } from "../../context/FldMapContext";

export const DebugBox = () => {
    const { hoveredPoint } = useCursorContext();
    const { debugSettings } = useDebugSettingsContext();
    const { fldFile } = useFldMapContext();

    if (!debugSettings.showDebugCube || !hoveredPoint || !fldFile) {
        return;
    }
    const { width, height, layers } = fldFile;

    const z = hoveredPoint % width;
    const x = height - 1 - Math.floor(hoveredPoint / width);
    const point = layers[Layer.Landscape].getUint8(hoveredPoint);
    return (
        <mesh position={[x, point / 8, z]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color="hotpink" />
        </mesh>
    );
};
