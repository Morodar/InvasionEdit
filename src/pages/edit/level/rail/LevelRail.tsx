import { Card, CardContent, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import "./LevelRail.css";
import { RightSideContainer } from "../../../../layout/RightSideContainer";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import React from "react";
import { LayerSettings } from "../../../../domain/fld/layers/LayerSettings";
import LayersIcon from "@mui/icons-material/Layers";
import { LevelList } from "../../../../domain/pck/level/components/LevelList";
import { useEditLevelContext } from "../EditLevelContext";
import ApartmentIcon from "@mui/icons-material/Apartment";
import { EntityList } from "../../../../domain/lev/components/EntityList";
import { useSelectedEntityContext } from "../../../../domain/lev/entities/SelectedEntityContext";
import { EntityInfo } from "../../../../domain/lev/components/SelectedEntity";

type ViewOptions = "layers" | "level-select" | "entity-view";

export const LevelRail = (): ReactElement => {
    const { t } = useTranslation();
    const { levelPck } = useEditLevelContext();

    const [view, setView] = React.useState<ViewOptions>("layers");
    const handleChange = (_: React.MouseEvent<HTMLElement>, nextView: ViewOptions) => setView(nextView);
    const { selectedEntity } = useSelectedEntityContext();

    return (
        <RightSideContainer>
            <div>
                <Card square elevation={3}>
                    <CardContent>
                        <EntityInfo entity={selectedEntity} />
                    </CardContent>
                </Card>
            </div>
            {view === "layers" && <LayerSettings />}
            {view === "level-select" && <LevelList pck={levelPck} />}
            {view === "entity-view" && <EntityList />}

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

                    <Tooltip title={"Buildings, Vechicles, Decoration"}>
                        <ToggleButton value="entity-view">
                            <ApartmentIcon />
                        </ToggleButton>
                    </Tooltip>
                </ToggleButtonGroup>
            </Card>
        </RightSideContainer>
    );
};
