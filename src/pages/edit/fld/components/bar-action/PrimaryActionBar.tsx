import { Card, IconButton, Stack, Tooltip } from "@mui/material";
import "./PrimaryActionBar.css";
import LandscapeIcon from "@mui/icons-material/Landscape";
import ClearIcon from "@mui/icons-material/Clear";
import DiamondIcon from "@mui/icons-material/Diamond";
import WaterIcon from "@mui/icons-material/Water";
import { FldPrimaryAction, useFldPrimaryActionContext } from "../../context/FldPrimaryActionContext";
import { useTranslation } from "react-i18next";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import { useDebugSettingsContext } from "../../context/DebugSettingsContext";

export const PirmaryActionBar = () => {
    const { t } = useTranslation();
    const { primaryAction, setPrimaryAction } = useFldPrimaryActionContext();
    const { debugSettings } = useDebugSettingsContext();

    return (
        <Card className="primary-action-bar">
            <Stack direction="row" gap="16px" alignItems="center" height="100%" width="auto">
                <Tooltip title={t("action.primary.clear-selection")}>
                    <IconButton onClick={() => setPrimaryAction("CLEAR")}>
                        <ClearIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title={t("action.primary.landscape")}>
                    <IconButton
                        color={getColor("LANDSCAPE", primaryAction)}
                        onClick={() => setPrimaryAction("LANDSCAPE")}
                    >
                        <LandscapeIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title={t("action.primary.xenit-and-tritium")}>
                    <IconButton
                        color={getColor("RESOURCES", primaryAction)}
                        onClick={() => setPrimaryAction("RESOURCES")}
                    >
                        <DiamondIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title={t("action.primary.water")}>
                    <IconButton color={getColor("WATER", primaryAction)} onClick={() => setPrimaryAction("WATER")}>
                        <WaterIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                </Tooltip>

                {debugSettings.showAllLayers && (
                    <Tooltip title={t("action.primary.generic")}>
                        <IconButton
                            color={getColor("GENERIC", primaryAction)}
                            onClick={() => setPrimaryAction("GENERIC")}
                        >
                            <MiscellaneousServicesIcon sx={{ fontSize: 32 }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>
        </Card>
    );
};

const getColor = (primaryAction: FldPrimaryAction, currentAction: FldPrimaryAction) =>
    primaryAction === currentAction ? "primary" : "default";
