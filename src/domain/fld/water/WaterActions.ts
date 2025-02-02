import { cloneDataView } from "../../cloneDataView";
import { FldFile, IndexValue } from "../FldFile";
import { Layer } from "../layers/Layer";
import { NO_WATER_VALUE, WATER_VALUE } from "./Water";
import { ActiveWater } from "./WaterActionContext";

export interface WaterPayload {
    type: "WATER";
    water: ActiveWater;
    points: IndexValue[];
    selectedIndex: number;
}

export function performWaterAction(state: FldFile, payload: WaterPayload): FldFile {
    const newState: FldFile = { ...state };
    newState.layers = { ...state.layers };

    newState.layers[Layer.Water] = cloneDataView(newState.layers[Layer.Water]);
    newState.layers[Layer.Water2] = cloneDataView(newState.layers[Layer.Water2]);
    newState.layers[Layer.WaterHeight] = cloneDataView(newState.layers[Layer.WaterHeight]);
    const selectedHeight = newState.layers[Layer.Landscape].getUint8(payload.selectedIndex);

    switch (payload.water) {
        case "DELETE":
            payload.points.forEach((p) => removeWater(newState, p));
            break;
        case "WATER":
            payload.points.forEach((p) => addWater(newState, p, selectedHeight));
            break;
    }

    return newState;
}

function addWater(fld: FldFile, point: IndexValue, height: number) {
    const landscape = fld.layers[Layer.Landscape].getUint8(point.index);
    const waterHeight = height - landscape;
    fld.layers[Layer.Water].setUint8(point.index, WATER_VALUE);
    fld.layers[Layer.Water2].setUint8(point.index, WATER_VALUE);
    fld.layers[Layer.WaterHeight].setUint8(point.index, waterHeight);
}

function removeWater(fld: FldFile, point: IndexValue) {
    fld.layers[Layer.Water].setUint8(point.index, NO_WATER_VALUE);
    fld.layers[Layer.Water2].setUint8(point.index, NO_WATER_VALUE);
    fld.layers[Layer.WaterHeight].setUint8(point.index, 0);
}
