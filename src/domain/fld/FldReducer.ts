import { useReducer } from "react";
import { FldFile, IndexValue } from "./FldFile";
import { Layer, LayerIndex } from "./layers/Layer";
import { WaterPayload, performWaterAction } from "./water/WaterActions";
import { ResourcePayload, performResourceAction } from "./resource/ResourceActions";
import { cloneDataView } from "../cloneDataView";

export type FldAction = SetFldPayload | ResourcePayload | LandscapePayload | GenericPayload | WaterPayload;

export interface SetFldPayload {
    type: "SET_FLD";
    fldFile: FldFile | null;
}

export interface LandscapePayload {
    type: "LANDSCAPE";
    action: "FIX" | "SMOOTH" | "STEP-UP" | "STEP-DOWN";
    points: IndexValue[];
    height: number;
}

export interface GenericPayload {
    type: "GENERIC";
    action: "FIX" | "SMOOTH" | "STEP-UP" | "STEP-DOWN";
    layer: LayerIndex;
    points: IndexValue[];
    height: number;
}

export const useFldReducer = (): [FldFile | null, React.Dispatch<FldAction>] => {
    const [fldFile, dispatch] = useReducer(FldReducer, null);
    return [fldFile, dispatch];
};

export const FldReducer = (state: FldFile | null, action: FldAction): FldFile | null => {
    if (action.type === "SET_FLD") {
        return action.fldFile;
    }

    if (!state) {
        return state;
    }

    switch (action.type) {
        case "LANDSCAPE":
            return performLandscapeAction(state, action);
        case "RESOURCE":
            return performResourceAction(state, action);
        case "WATER":
            return performWaterAction(state, action);
        case "GENERIC":
            return performGenericAction(state, action);
    }
};

function performLandscapeAction(state: FldFile, action: LandscapePayload): FldFile {
    const genericAction: GenericPayload = { ...action, layer: Layer.Landscape, type: "GENERIC" };
    return performGenericAction(state, genericAction);
}

function performGenericAction(state: FldFile, payload: GenericPayload): FldFile {
    const newState: FldFile = { ...state };
    const oldLayerView = newState.layers[payload.layer];
    const layerView = cloneDataView(oldLayerView);
    newState.layers[payload.layer] = layerView;
    let isDirty = false;
    if (payload.action === "FIX") {
        payload.points.forEach((p) => {
            if (p.value !== payload.height) {
                layerView.setUint8(p.index, payload.height);
                isDirty = true;
            }
        });
    } else if (payload.action === "STEP-UP") {
        payload.points.forEach((p) => {
            const value = layerView.getUint8(p.index);
            if (value < 255) {
                layerView.setUint8(p.index, value + 1);
                isDirty = true;
            }
        });
    } else if (payload.action === "STEP-DOWN") {
        payload.points.forEach((p) => {
            const value = layerView.getUint8(p.index);
            if (value > 0) {
                layerView.setUint8(p.index, value - 1);
                isDirty = true;
            }
        });
    } else if (payload.action === "SMOOTH") {
        const values = payload.points.map((p) => p.value).sort((a, b) => a - b);
        const middleIndex = Math.floor(values.length / 2);
        const mid = values[middleIndex];
        payload.points.forEach((p) => {
            const value = layerView.getUint8(p.index);
            if (value > mid) {
                layerView.setUint8(p.index, value - 1);
                isDirty = true;
            } else if (value < mid) {
                layerView.setUint8(p.index, value + 1);
                isDirty = true;
            }
        });
    }

    return isDirty ? newState : state;
}
