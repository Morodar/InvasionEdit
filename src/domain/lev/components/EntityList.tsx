import { Card, CardContent, List, ListItem, ListItemText } from "@mui/material";
import { H2 } from "../../../common/header/Headers";
import { useLevContext } from "../LevContext";
import { entityTypeToName } from "../constants/entityTypeToName";
import "./EntityList.css";

export const EntityList = () => {
    const { levFile } = useLevContext();

    if (!levFile) {
        return <></>;
    }

    return (
        <Card elevation={2} square className="entity-list-container">
            <CardContent className="content">
                <H2 variant="subtitle1">Entities ({levFile.entities.length})</H2>
                <div className="entity-list">
                    <List disablePadding dense>
                        {levFile.entities.map((e) => (
                            <ListItem key={`${e.type}-${e.owner}-${e.x}-${e.z}-${e.rotation}`}>
                                <ListItemText>
                                    {e.owner} - {entityTypeToName(e.type)}
                                </ListItemText>
                            </ListItem>
                        ))}
                    </List>
                </div>
            </CardContent>
        </Card>
    );
};
