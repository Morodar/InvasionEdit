import { useReducer } from "react";
import { LevFile, MAX_PLAYER_COUNT, MIN_PLAYER_COUNT } from "./LevFile";
import { Owner } from "../constants/Owner";
import { LevEntity } from "./LevEntity";

export type LevAction = SetLevFile | PlaceEntity | RemoveEntity | SetPlayerCount;

export interface SetLevFile {
    type: "SET_LEV";
    levFile: LevFile | null;
}

export interface PlaceEntity {
    type: "PLACE_ENTITY";
    entityType: number;
    owner: Owner;
    x: number;
    z: number;
    rotation: number;
}

export interface RemoveEntity {
    type: "REMOVE_ENTITY";
    entity: LevEntity;
}

export interface SetPlayerCount {
    type: "SET_PLAYER_COUNT";
    count: number;
}

export const useLevReducer = (): [LevFile | null, React.Dispatch<LevAction>] => {
    const [levFile, dispatch] = useReducer(LevReducer, null);
    return [levFile, dispatch];
};

export const LevReducer = (state: LevFile | null, action: LevAction): LevFile | null => {
    if (action.type === "SET_LEV") {
        return action.levFile;
    }

    if (state == null) {
        return state;
    }

    switch (action.type) {
        case "PLACE_ENTITY":
            return performPlaceEntityAction(state, action);
        case "REMOVE_ENTITY":
            return performRemoveEntityAction(state, action);
        case "SET_PLAYER_COUNT":
            return setPlayerCount(state, action);
    }
};

function performPlaceEntityAction(state: LevFile, action: PlaceEntity): LevFile {
    const newState: LevFile = { ...state, entities: [...state.entities] };
    const entity: LevEntity = {
        type: action.entityType,
        owner: action.owner,
        rotation: action.rotation,
        x: action.x,
        z: action.z,
    };
    newState.entities.push(entity);
    newState.entityCount = newState.entities.length;
    return newState;
}

function performRemoveEntityAction(state: LevFile, action: RemoveEntity): LevFile {
    const levIndex = state.entities.indexOf(action.entity);
    if (levIndex === -1) {
        return state;
    }
    // copy array before modifiying because splice does not create a copy
    const newState: LevFile = { ...state, entities: [...state.entities] };
    newState.entities.splice(levIndex, 1);
    return newState;
}

function setPlayerCount(state: LevFile, action: SetPlayerCount): LevFile {
    if (state.playerCount1 == action.count) {
        return state;
    }
    let count = action.count;
    if (count > MAX_PLAYER_COUNT) {
        count = MAX_PLAYER_COUNT;
    }
    if (count < MIN_PLAYER_COUNT) {
        count = MIN_PLAYER_COUNT;
    }
    const newState: LevFile = { ...state, playerCount1: count, playerCount2: count };
    return newState;
}
