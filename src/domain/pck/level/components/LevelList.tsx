import { Card, CardContent, List, ListItemButton, ListItemText } from "@mui/material";
import { LevelPck } from "../LevelPck";
import { H2 } from "../../../../common/header/Headers";
import { useLevelPckSelectionContext } from "../LevelPckSelectionContext";
import "./LevelList.css";

interface LevelListProps {
    pck?: LevelPck;
}
export const LevelList = ({ pck }: LevelListProps) => {
    const { selectedLevel, selectLevel } = useLevelPckSelectionContext();

    if (!pck) {
        return <></>;
    }

    return (
        <Card elevation={2} square className="level-list-container">
            <CardContent className="content">
                <H2 variant="subtitle1">Levels ({pck.levels.length})</H2>
                <div className="level-list">
                    <List disablePadding dense>
                        {pck.levels.map((l) => (
                            <ListItemButton
                                key={l.dat.name}
                                selected={selectedLevel === l}
                                onClick={() => selectLevel(l)}
                            >
                                <ListItemText>
                                    {l.lev.fromPlayers} - {l.lev.toPlayers}: {l.lev.name.replace(".lev", "")}
                                </ListItemText>
                            </ListItemButton>
                        ))}
                    </List>
                </div>
            </CardContent>
        </Card>
    );
};
