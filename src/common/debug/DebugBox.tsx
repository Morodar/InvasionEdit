import { Layer } from "../../domain/fld/layers/Layer";
import { useCursorContext } from "../controls/CursorContext";
import { useDebugSettingsContext } from "./DebugSettingsContext";
import { useFldMapContext } from "../../domain/fld/FldMapContext";

export const DebugBox = () => {
    const { hoveredPoint } = useCursorContext();
    const { debugSettings } = useDebugSettingsContext();
    const { fldFile } = useFldMapContext();

    if (!debugSettings.showDebugCube || !hoveredPoint || !fldFile) {
        return;
    }
    const { width, layers } = fldFile;

    const z = hoveredPoint % width;
    const x = (hoveredPoint - z) / width;

    // rotate map 45° and stretch using values from decompression algorithm
    const x2 = x * -1.999;
    const z2 = x * 1.152 + z * 2.305;

    const point = layers[Layer.Landscape].getUint8(hoveredPoint);
    return (
        <mesh position={[x2, point / 4, z2]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color="hotpink" />
        </mesh>
    );
};
