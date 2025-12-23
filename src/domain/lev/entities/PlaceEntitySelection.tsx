import { IconButton, Stack, Tooltip } from "@mui/material";
import { usePlaceEntityContext } from "./PlaceEntityContext";
import "./PlaceEntitySelection.css";
import { OwnerColor } from "../components/OwnerColor";
import { Owner, PlaceablePlayers } from "../../constants/Owner";
import { entityTypeToImage, entityTypeToName } from "../constants/Entities";
import { PlayerCount } from "../LevFile";
import { useLevContext } from "../LevContext";
import { Dispatch } from "react";
import { LevAction } from "../LevReducer";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
const buildings: number[] = [300, 301, 310, 330, 331, 332, 333, 382, 381, 380];

export const PlaceEntitySelection = () => {
    const { levFile, dispatch } = useLevContext();
    if (levFile == null) {
        return <></>;
    }

    return <Content playerCount={levFile.playerCount1 as PlayerCount} dispatch={dispatch} />;
};

const Content = ({ playerCount, dispatch }: { playerCount: PlayerCount; dispatch: Dispatch<LevAction> }) => {
    const { t } = useTranslation();
    const { placingEntity, setPlacingEntity, owner, setOwner } = usePlaceEntityContext();
    const placeablePlayers = usePlaceablePlayers(playerCount);

    return (
        <div>
            <Stack direction="row" gap="16px" justifyContent="space-between">
                <Stack className="owner-selection" direction="row">
                    {placeablePlayers.map((o) => (
                        <div
                            key={o}
                            onClick={() => setOwner(o)}
                            className={o == owner ? "owner-item selected" : "owner-item"}
                        >
                            <OwnerColor owner={o} />
                        </div>
                    ))}
                </Stack>
                <Stack direction="row" gap="4px">
                    <Tooltip title={t("action.remove-player")}>
                        <IconButton onClick={() => dispatch({ type: "SET_PLAYER_COUNT", count: playerCount - 1 })}>
                            <RemoveIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t("action.add-player")}>
                        <IconButton onClick={() => dispatch({ type: "SET_PLAYER_COUNT", count: playerCount + 1 })}>
                            <AddIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
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

function usePlaceablePlayers(count: PlayerCount): Owner[] {
    return PlaceablePlayers.slice(0, count);
}
