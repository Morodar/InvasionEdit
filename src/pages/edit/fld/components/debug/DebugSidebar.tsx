import { Card } from "@mui/material";
import "./DebugSidebar.css";
import { useCursorContext } from "../../context/CursorContext";
import { Point3D } from "../../../../../domain/fld/MapLayer";

export const DebugSidebar = () => {
    const { hoveredPoint, selectedPoint, meshPoint } = useCursorContext();

    return (
        <Card className="debug-sidebar">
            <p>Mesh Point</p>
            <FormatCoordinate point={meshPoint} />
            <p>Hovered Point</p>
            <FormatCoordinate point={hoveredPoint} />
            <p>Selected Point</p>
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
