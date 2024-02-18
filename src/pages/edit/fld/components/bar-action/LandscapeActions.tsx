import { Divider, IconButton, Stack, Tooltip } from "@mui/material";
import { LandscapeAction, useLandscapeActionContext } from "../../context/LandscapeActionContext";
import BalanceIcon from "@mui/icons-material/Balance";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import GetAppIcon from "@mui/icons-material/GetApp";
import { MinMaxNumberInput } from "../../../../../common/input/MinMaxNumberInput";
import { useTranslation } from "react-i18next";

export const LandscapeActions = () => {
    const { t } = useTranslation();
    const { activeAction, height, size, speed, setActiveAction, setHeight, setSize, setSpeed } =
        useLandscapeActionContext();

    return (
        <Stack
            direction="row"
            gap="16px"
            alignItems="center"
            justifyContent="space-between"
            height="100%"
            width="450px"
        >
            <Stack direction="row" gap="16px" alignItems="center">
                <Tooltip title={t("landscape.fix")}>
                    <IconButton color={getActionColor("FIX", activeAction)} onClick={() => setActiveAction("FIX")}>
                        <GetAppIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title={t("landscape.smooth")}>
                    <IconButton
                        color={getActionColor("SMOOTH", activeAction)}
                        onClick={() => setActiveAction("SMOOTH")}
                    >
                        <BalanceIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title={t("landscape.up")}>
                    <IconButton
                        color={getActionColor("STEP-UP", activeAction)}
                        onClick={() => setActiveAction("STEP-UP")}
                    >
                        <ArrowUpwardIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title={t("landscape.down")}>
                    <IconButton
                        color={getActionColor("STEP-DOWN", activeAction)}
                        onClick={() => setActiveAction("STEP-DOWN")}
                    >
                        <ArrowDownwardIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem />
            </Stack>

            <Stack direction="row" gap="16px" alignItems="center">
                {activeAction === "FIX" && (
                    <MinMaxNumberInput
                        label={t("landscape.height")}
                        min={0}
                        max={255}
                        onValueChanged={setHeight}
                        value={height}
                    />
                )}

                {activeAction !== "FIX" && (
                    <MinMaxNumberInput
                        label={t("landscape.speed")}
                        min={1}
                        max={32}
                        onValueChanged={setSpeed}
                        value={speed}
                        maxWidth={80}
                    />
                )}

                <MinMaxNumberInput label={t("landscape.size")} min={1} max={32} onValueChanged={setSize} value={size} />
            </Stack>
        </Stack>
    );
};

const getActionColor = (action: LandscapeAction, currentAction: LandscapeAction) =>
    action === currentAction ? "primary" : "default";
