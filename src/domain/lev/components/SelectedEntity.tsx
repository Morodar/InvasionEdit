import { IconButton } from "@mui/material";
import { H2 } from "../../../common/header/Headers";
import { LevEntity } from "../LevEntity";
import { entityTypeToImage } from "../constants/entityTypeToImage";
import { entityTypeToName } from "../constants/entityTypeToName";
import { OwnerColor } from "./OwnerColor";
import "./SelectedEntity.css";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLevContext } from "../LevContext";
import { useSelectedEntityContext } from "../entities/SelectedEntityContext";

interface EntityInfoProps {
    entity?: LevEntity;
}

export const EntityInfo = ({ entity }: EntityInfoProps) => {
    const { dispatch } = useLevContext();
    const { setSelectedEntity } = useSelectedEntityContext();
    if (!entity) {
        return <></>;
    }

    return (
        <div className="selected-entity">
            <div className="title">
                <OwnerColor owner={entity.owner} />
                <H2 variant="subtitle1">{entityTypeToName(entity.type)}</H2>
                <IconButton
                    onClick={() => {
                        dispatch({ type: "REMOVE_ENTITY", entity });
                        setSelectedEntity(undefined);
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </div>
            <div className="image">
                <img src={entityTypeToImage(entity.type)} width={128} height={128} />
            </div>
        </div>
    );
};
