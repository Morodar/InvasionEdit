import { FldFile, IndexValue } from "../FldFile";
import { Layer } from "../layers/Layer";
import { ActiveWater } from "./WaterActionContext";
import { WaterLayerUtil } from "./WaterLayerUtil";

export interface WaterPayload {
    type: "WATER";
    water: ActiveWater;
    points: IndexValue[];
    selectedIndex: number;
}

export function performWaterAction(state: FldFile, payload: WaterPayload): FldFile {
    const newState: FldFile = { ...state };

    if (payload.water === "DELETE") {
        payload.points.forEach((p) => WaterLayerUtil.removeWater(newState, p));
    }

    if (payload.water === "WATER") {
        const selectedPoint = newState.layers[Layer.Landscape].getUint8(payload.selectedIndex);
        const height = selectedPoint;
        payload.points.forEach((p) => WaterLayerUtil.addWater(newState, p, height));
    }

    newState.layers[Layer.Water] = new DataView(newState.layers[Layer.Water].buffer);
    newState.layers[Layer.Water2] = new DataView(newState.layers[Layer.Water2].buffer);
    newState.layers[Layer.WaterHeight] = new DataView(newState.layers[Layer.WaterHeight].buffer);
    return newState;
}
