import { Card, IconButton, Stack, SvgIconTypeMap, Tooltip } from "@mui/material";
import "./PrimaryActionBar.css";
import LandscapeIcon from "@mui/icons-material/Landscape";
import ClearIcon from "@mui/icons-material/Clear";
import WaterIcon from "@mui/icons-material/Water";
import { FldPrimaryAction, useFldPrimaryActionContext } from "./FldPrimaryActionContext";
import { useTranslation } from "react-i18next";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import { useDebugSettingsContext } from "../../../common/debug/DebugSettingsContext";
import HouseIcon from "@mui/icons-material/House";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import DiamondIcon from "@mui/icons-material/Diamond";

type PrimaryAction = {
    title: string;
    action: FldPrimaryAction;
    icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & { muiName: string };
};

const PRIMARY_ACTIONS: PrimaryAction[] = [
    { title: "action.primary.clear-selection", action: "CLEAR", icon: ClearIcon },
    { title: "action.primary.landscape", action: "LANDSCAPE", icon: LandscapeIcon },
    { title: "action.primary.xenit-and-tritium", action: "RESOURCES", icon: DiamondIcon },
    { title: "action.primary.water", action: "WATER", icon: WaterIcon },
    { title: "action.primary.buildings", action: "BUILDING", icon: HouseIcon },
    { title: "action.primary.buildings", action: "TEXTURES", icon: FormatPaintIcon },
];

export const PirmaryActionBar = () => {
    const { t } = useTranslation();
    const { primaryAction, setPrimaryAction } = useFldPrimaryActionContext();
    const { debugSettings } = useDebugSettingsContext();

    return (
        <Card className="primary-action-bar">
            <Stack direction="row" gap="16px" alignItems="center" height="100%" width="auto">
                {PRIMARY_ACTIONS.map((action) => (
                    <PrimaryActionButton
                        key={action.title}
                        title={action.title}
                        action={action.action}
                        icon={action.icon}
                        primaryAction={primaryAction}
                        setPrimaryAction={setPrimaryAction}
                    />
                ))}

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

type PrimaryActionButtonProps = PrimaryAction & {
    primaryAction: FldPrimaryAction;
    setPrimaryAction: (action: FldPrimaryAction) => void;
};

const PrimaryActionButton = ({ title, primaryAction, icon, action, setPrimaryAction }: PrimaryActionButtonProps) => {
    const { t } = useTranslation();
    const Icon = icon;
    return (
        <Tooltip title={t(title)}>
            <IconButton color={getColor(action, primaryAction)} onClick={() => setPrimaryAction(action)}>
                <Icon sx={{ fontSize: 32 }} />
            </IconButton>
        </Tooltip>
    );
};

function getColor(primaryAction: FldPrimaryAction, currentAction: FldPrimaryAction) {
    return primaryAction === currentAction ? "primary" : "default";
}
