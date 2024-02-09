import { Card, Divider, IconButton, Stack, TextField, Tooltip } from "@mui/material";
import "./PrimaryActionBar.css";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import FactoryIcon from "@mui/icons-material/Factory";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import { ActiveResource, useResourceActionContext } from "../../context/ResourceActionContext";
import { useFldPrimaryActionContext } from "../../context/FldPrimaryActionContext";

export const SecondaryActionBar = () => {
    const { primaryAction } = useFldPrimaryActionContext();

    if (primaryAction == "CLEAR") {
        return <></>;
    }

    return (
        <Card className="secondary-action-bar">
            <Stack direction="row" gap="16px" alignItems="center" height="100%" width="auto">
                <Action />
            </Stack>
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
        default:
            return <></>;
    }
};

const ResourceActions = () => {
    const { activeResource, size, upperLimitReached, lowerLimitReached, updateSize, incrementBy, setActiveResource } =
        useResourceActionContext();

    return (
        <>
            <Tooltip title={"Remove"}>
                <IconButton
                    color={getResourceColor("DELETE", activeResource)}
                    onClick={() => setActiveResource("DELETE")}
                >
                    <DeleteIcon sx={{ fontSize: 32 }} />
                </IconButton>
            </Tooltip>
            <Tooltip title={"Xenit"}>
                <IconButton
                    color={getResourceColor("XENIT", activeResource)}
                    onClick={() => setActiveResource("XENIT")}
                >
                    <FactoryIcon sx={{ fontSize: 32 }} />
                </IconButton>
            </Tooltip>
            <Tooltip title={"Tritium"}>
                <IconButton
                    color={getResourceColor("TRITIUM", activeResource)}
                    onClick={() => setActiveResource("TRITIUM")}
                >
                    <FlashOnIcon sx={{ fontSize: 32 }} />
                </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem />

            <Stack direction="row" alignItems="center">
                <IconButton onClick={() => incrementBy(-1)} disabled={lowerLimitReached}>
                    <Tooltip title={"Decrease Readius"}>
                        <RemoveIcon sx={{ fontSize: 32 }} />
                    </Tooltip>
                </IconButton>

                <Tooltip title={"Readius"}>
                    <TextField
                        className="hide-number-arrows"
                        label="Size"
                        type="number"
                        value={size}
                        onChange={(e) => updateSize(+e.target.value)}
                        style={{ maxWidth: "64px" }}
                    />
                </Tooltip>

                <IconButton onClick={() => incrementBy(1)} disabled={upperLimitReached}>
                    <Tooltip title={"Increase Readius"}>
                        <AddIcon sx={{ fontSize: 32 }} />
                    </Tooltip>
                </IconButton>
            </Stack>
        </>
    );
};

const LandscapeActions = () => {
    return <span>Landscape actions</span>;
};

const getResourceColor = (resourceAction: ActiveResource, currentAction: ActiveResource) =>
    resourceAction === currentAction ? "primary" : "default";
