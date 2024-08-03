import { Stack } from "@mui/material";
import { usePlaceEntityContext } from "./PlaceEntityContext";
import { entityTypeToName } from "../constants/entityTypeToName";
import { entityTypeToImage } from "../constants/entityTypeToImage";
import "./PlaceEntitySelection.css";
import { Players } from "../../constants/Owner";
import { OwnerColor } from "../components/OwnerColor";
const buildings: number[] = [300, 301, 310, 330, 331, 332, 333, 380, 381, 382];

export const PlaceEntitySelection = () => {
    const { placingEntity, setPlacingEntity, owner, setOwner } = usePlaceEntityContext();
    return (
        <div>
            <Stack className="owner-selection" direction="row">
                {Players.map((o) => (
                    <div
                        key={o}
                        onClick={() => setOwner(o)}
                        className={o == owner ? "owner-item selected" : "owner-item"}
                    >
                        <OwnerColor owner={o} />
                    </div>
                ))}
            </Stack>
            <Stack className="place-entity-container" direction="row" gap="8px">
                {buildings.map((b) => (
                    <Stack
                        key={b}
                        className={b == placingEntity ? "entity selected" : "entity"}
                        onClick={() => setPlacingEntity(b)}
                    >
                        <img alt="" title={entityTypeToName(b)} src={entityTypeToImage(b)} width={64} height={64} />
                    </Stack>
                ))}
            </Stack>
        </div>
    );
};
