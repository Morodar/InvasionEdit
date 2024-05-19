import { Card } from "@mui/material";
import "./PrimaryActionBar.css";

import { useFldPrimaryActionContext } from "./FldPrimaryActionContext";
import { ResourceActions } from "../resource/ResourceActions";
import { LandscapeActions } from "../landsacpe/LandscapeActions";
import { GenericActions } from "../generic/GenericActions";
import { WaterActions } from "../water/WaterActions";

export const SecondaryActionBar = () => {
    const { primaryAction } = useFldPrimaryActionContext();

    if (primaryAction == "CLEAR") {
        return <></>;
    }

    return (
        <Card className="secondary-action-bar">
            <Action />
        </Card>
    );
};

const Action = () => {
    const { primaryAction } = useFldPrimaryActionContext();
    switch (primaryAction) {
        case "LANDSCAPE":
            return <LandscapeActions />;
        case "RESOURCES":
            return <ResourceActions />;
        case "GENERIC":
            return <GenericActions />;
        case "WATER":
            return <WaterActions />;
        default:
            return <></>;
    }
};
