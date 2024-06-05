import { H2 } from "../../../common/header/Headers";
import { LevEntity } from "../LevEntity";
import { entityTypeToName } from "../constants/entityTypeToName";

interface EntityInfoProps {
    entity?: LevEntity;
}

export const EntityInfo = ({ entity }: EntityInfoProps) => {
    if (!entity) {
        return <></>;
    }

    return (
        <div>
            <H2 variant="subtitle1">{entityTypeToName(entity.type)}</H2>
            <span>
                <b>Player:</b> {entity.owner}
            </span>
        </div>
    );
};
