import { Card, IconButton, Stack, Tooltip } from "@mui/material";
import "./PrimaryActionBar.css";
import LandscapeIcon from "@mui/icons-material/Landscape";
import ClearIcon from "@mui/icons-material/Clear";
import DiamondIcon from "@mui/icons-material/Diamond";
import { FldPrimaryAction, useFldPrimaryActionContext } from "../../context/FldPrimaryActionContext";

export const PirmaryActionBar = () => {
    const { primaryAction, setPrimaryAction } = useFldPrimaryActionContext();
    return (
        <Card className="primary-action-bar">
            <Stack direction="row" gap="16px" alignItems="center" height="100%" width="auto">
                <Tooltip title={"Clear selection"}>
                    <IconButton onClick={() => setPrimaryAction("CLEAR")}>
                        <ClearIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title={"Landscape"}>
                    <IconButton
                        color={getColor("LANDSCAPE", primaryAction)}
                        onClick={() => setPrimaryAction("LANDSCAPE")}
                    >
                        <LandscapeIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title={"Xenit & Tritium"}>
                    <IconButton
                        color={getColor("RESOURCES", primaryAction)}
                        onClick={() => setPrimaryAction("RESOURCES")}
                    >
                        <DiamondIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Card>
    );
};

const getColor = (primaryAction: FldPrimaryAction, currentAction: FldPrimaryAction) =>
    primaryAction === currentAction ? "primary" : "default";
