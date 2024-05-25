import { Card } from "@mui/material";
import "./PrimaryActionBar.css";

import { useFldPrimaryActionContext } from "./FldPrimaryActionContext";
import { ResourceActionButtons } from "../resource/ResourceActionButtons";
import { LandscapeActions } from "../landsacpe/LandscapeActions";
import { GenericActions } from "../generic/GenericActions";
import { WaterActionButtons } from "../water/WaterActionButtons";

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
            return <ResourceActionButtons />;
        case "GENERIC":
            return <GenericActions />;
        case "WATER":
            return <WaterActionButtons />;
        default:
            return <></>;
    }
};
