import { IconButton, Stack, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ActiveWater, useWaterActionContext } from "./WaterActionContext";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import InvertColorsOffIcon from "@mui/icons-material/InvertColorsOff";

export const WaterActionButtons = () => {
    const { t } = useTranslation();
    const { activeAction, setActiveAction } = useWaterActionContext();

    return (
        <Stack direction="row" gap="16px" alignItems="center" height="100%" width="auto">
            <Tooltip title={t("actions.water.remove")}>
                <IconButton color={getActionColor("DELETE", activeAction)} onClick={() => setActiveAction("DELETE")}>
                    <InvertColorsOffIcon sx={{ fontSize: 32 }} />
                </IconButton>
            </Tooltip>
            <Tooltip title={t("actions.water.water")}>
                <IconButton color={getActionColor("WATER", activeAction)} onClick={() => setActiveAction("WATER")}>
                    <WaterDropIcon sx={{ fontSize: 32 }} />
                </IconButton>
            </Tooltip>
        </Stack>
    );
};
const getActionColor = (resourceAction: ActiveWater, currentAction: ActiveWater) =>
    resourceAction === currentAction ? "primary" : "default";
