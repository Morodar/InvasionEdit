import { Divider, IconButton, Stack, Tooltip } from "@mui/material";
import { HeightmapAction, useHeightmapActionContext } from "../../context/HeigtmapActionContext";
import BalanceIcon from "@mui/icons-material/Balance";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import GetAppIcon from "@mui/icons-material/GetApp";
import { MinMaxNumberInput } from "../../../../../common/input/MinMaxNumberInput";

export const LandscapeActions = () => {
    const { activeAction, height, radius, stepsize, setActiveAction, setHeight, setRadius, setStepsize } =
        useHeightmapActionContext();

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
                <Tooltip title={"Fix"}>
                    <IconButton color={getActionColor("FIX", activeAction)} onClick={() => setActiveAction("FIX")}>
                        <GetAppIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title={"Smooth"}>
                    <IconButton
                        color={getActionColor("SMOOTH", activeAction)}
                        onClick={() => setActiveAction("SMOOTH")}
                    >
                        <BalanceIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title={"Up"}>
                    <IconButton
                        color={getActionColor("STEP-UP", activeAction)}
                        onClick={() => setActiveAction("STEP-UP")}
                    >
                        <ArrowUpwardIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title={"Down"}>
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
                    <MinMaxNumberInput label="Height" min={0} max={255} onValueChanged={setHeight} value={height} />
                )}

                {(activeAction === "STEP-UP" || activeAction === "STEP-DOWN") && (
                    <MinMaxNumberInput
                        label="Stepsize"
                        min={1}
                        max={16}
                        onValueChanged={setStepsize}
                        value={stepsize}
                        maxWidth={80}
                    />
                )}

                <MinMaxNumberInput label="Radius" min={1} max={16} onValueChanged={setRadius} value={radius} />
            </Stack>
        </Stack>
    );
};

const getActionColor = (action: HeightmapAction, currentAction: HeightmapAction) =>
    action === currentAction ? "primary" : "default";
