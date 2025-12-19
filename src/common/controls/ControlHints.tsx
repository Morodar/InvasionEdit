import { Card } from "@mui/material";
import "./ControlHints.css";
import { H2 } from "../header/Headers";
import { useFldPrimaryActionContext } from "../../domain/fld/action-bar/FldPrimaryActionContext";

const ROTATE_KEYS = ["Q", "E"];
const MOVE_KEYS = ["W", "A", "S", "D"];
const ROTATE_BUILDING_KEYS = ["R", "T"];

export const ControlHints = () => {
    const { primaryAction } = useFldPrimaryActionContext();
    const isPlacingBuilding = primaryAction == "BUILDING";

    return (
        <Card className="control-hints">
            <H2 variant="subtitle1">Hotkeys</H2>
            {isPlacingBuilding && <Hotkeys description="Rotate building" keys={ROTATE_BUILDING_KEYS} />}
            <Hotkeys description="Rotate camera" keys={ROTATE_KEYS} />
            <Hotkeys description="Move camera" keys={MOVE_KEYS} />
        </Card>
    );
};

const Hotkeys = ({ description, keys }: { description: string; keys: string[] }) => {
    return (
        <div className="hotkeys">
            <Keys keys={keys} /> <span>{description}</span>
        </div>
    );
};

const Keys = ({ keys }: { keys: string[] }) => {
    return (
        <span className="key-container">
            {keys.map((k) => (
                <Key key={k} _key={k} />
            ))}
        </span>
    );
};

const Key = ({ _key }: { _key: string }) => {
    return <span className="key">{_key}</span>;
};
