import { useReducer } from "react";
import { FldFile, IndexValue } from "./FldFile";
import { Tritium, Xenit } from "./ResourceLayerUtil";
import { ActiveResource } from "../../pages/edit/fld/context/ResourceActionContext";
import { Layer, LayerIndex } from "./Layer";
import { ActiveWater } from "../../pages/edit/fld/context/WaterActionContext";
import { WaterLayerUtil } from "./WaterLayerUtil";

export type FldAction = SetFldPayload | ResourcePayload | LandscapePayload | GenericPayload | WaterPayload;

export interface SetFldPayload {
    type: "SET_FLD";
    fldFile: FldFile | null;
}

export interface ResourcePayload {
    type: "RESOURCE";
    resource: ActiveResource;
    points: IndexValue[];
}

export interface WaterPayload {
    type: "WATER";
    water: ActiveWater;
    points: IndexValue[];
    selectedIndex: number;
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
    const [fldFile, dispatch] = useReducer(fldReducer, null);
    return [fldFile, dispatch];
};

const fldReducer = (state: FldFile | null, action: FldAction): FldFile | null => {
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

const performResourceAction = (state: FldFile, action: ResourcePayload): FldFile => {
    const newState: FldFile = { ...state };
    const resourceOperation = RESOURCE_OPERATION[action.resource];
    action.points.forEach((p) => {
        const oldValue = newState.layers[Layer.Resources].getUint8(p.index);
        const newValue = resourceOperation(oldValue);
        newState.layers[Layer.Resources].setUint8(p.index, newValue);
    });
    return newState;
};

const addXenit = (oldValue: number): number => (oldValue |= Xenit.LAYER_VALUE);
const addTritium = (oldValue: number): number => (oldValue |= Tritium.LAYER_VALUE);
const removeResource = (): number => 0;
const RESOURCE_OPERATION: { [key in ActiveResource]: (oldValue: number) => number } = {
    DELETE: removeResource,
    TRITIUM: addTritium,
    XENIT: addXenit,
};

function performLandscapeAction(state: FldFile, action: LandscapePayload): FldFile {
    const genericAction: GenericPayload = { ...action, layer: Layer.Landscape, type: "GENERIC" };
    return performGenericAction(state, genericAction);
}

function performWaterAction(state: FldFile, payload: WaterPayload): FldFile {
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

function performGenericAction(state: FldFile, payload: GenericPayload): FldFile {
    const newState: FldFile = { ...state };
    const oldLayerView = newState.layers[payload.layer];
    const layerView = new DataView(oldLayerView.buffer);
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
