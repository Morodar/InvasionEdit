import { Card, CardContent, List, ListItemButton, ListItemText } from "@mui/material";
import { LevelPck } from "../../../domain/pck/level/LevelPck";
import { H2 } from "../../../common/header/Headers";
import { useLevelPckSelectionContext } from "../../../domain/pck/level/LevelPckSelectionContext";

interface LevelListProps {
    pck?: LevelPck;
}
export const LevelList = ({ pck }: LevelListProps) => {
    const { selectedLevel, selectLevel } = useLevelPckSelectionContext();

    if (!pck) {
        return <></>;
    }

    return (
        <Card elevation={2} square>
            <CardContent>
                <H2 variant="h6">Levels ({pck.levels.length})</H2>
                <List disablePadding dense>
                    {pck.levels.map((l) => (
                        <ListItemButton key={l.dat.name} selected={selectedLevel === l} onClick={() => selectLevel(l)}>
                            <ListItemText>
                                {l.lev.fromPlayers} - {l.lev.toPlayers}: {l.lev.name.replace(".lev", "")}
                            </ListItemText>
                        </ListItemButton>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};
