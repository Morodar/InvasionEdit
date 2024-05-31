import { Card, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import "./LevelRail.css";
import { RightSideContainer } from "../../../../layout/RightSideContainer";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import React from "react";
import { LayerSettings } from "../../../../domain/fld/layers/LayerSettings";
import LayersIcon from "@mui/icons-material/Layers";
import { LevelList } from "../LevelList";
import { useEditLevelContext } from "../EditLevelContext";

type ViewOptions = "layers" | "level-select";

export const LevelRail = (): ReactElement => {
    const { t } = useTranslation();
    const { levelPck } = useEditLevelContext();

    const [view, setView] = React.useState<ViewOptions>("layers");
    const handleChange = (_: React.MouseEvent<HTMLElement>, nextView: ViewOptions) => setView(nextView);

    return (
        <RightSideContainer>
            {view === "layers" && <LayerSettings />}
            {view === "level-select" && <LevelList pck={levelPck} />}
            <Card className="level-rail" square>
                <ToggleButtonGroup orientation="vertical" size="large" value={view} exclusive onChange={handleChange}>
                    <Tooltip title={"Levels"}>
                        <ToggleButton value="level-select">
                            <ViewModuleIcon />
                        </ToggleButton>
                    </Tooltip>

                    <Tooltip title={t("LAYER_SETTINGS.HEADER")}>
                        <ToggleButton value="layers">
                            <LayersIcon />
                        </ToggleButton>
                    </Tooltip>
                </ToggleButtonGroup>
            </Card>
        </RightSideContainer>
    );
};
