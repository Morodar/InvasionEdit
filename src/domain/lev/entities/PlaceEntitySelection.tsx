import { Stack } from "@mui/material";
import { usePlaceEntityContext } from "./PlaceEntityContext";
import "./PlaceEntitySelection.css";
import { OwnerColor } from "../components/OwnerColor";
import { PlaceablePlayers } from "../../constants/Owner";
import { entityTypeToImage, entityTypeToName } from "../constants/Entities";
const buildings: number[] = [300, 301, 310, 330, 331, 332, 333, 382, 381, 380];

export const PlaceEntitySelection = () => {
    const { placingEntity, setPlacingEntity, owner, setOwner } = usePlaceEntityContext();
    return (
        <div>
            <Stack className="owner-selection" direction="row">
                {PlaceablePlayers.map((o) => (
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
