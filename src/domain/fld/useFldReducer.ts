import { useReducer } from "react";
import { FldFile, IndexValue } from "./FldFile";
import { Tritium, Xenit } from "./ResourceLayerUtil";
import { ActiveResource } from "../../pages/edit/fld/context/ResourceActionContext";
import { Layer } from "./Layer";

export type FldAction =
    | SetFldPayload
    | ResourcePayload
    | LandscapeFixPayload
    | LandscapeSmoothPayload
    | LandscapeUpPayload
    | LandscapeDownPayload;

export interface SetFldPayload {
    type: "SET_FLD";
    fldFile: FldFile | null;
}

export interface ResourcePayload {
    type: "RESOURCE";
    resource: ActiveResource;
    points: IndexValue[];
}

export interface LandscapeFixPayload {
    type: "LANDSCAPE";
    action: "FIX";
    points: IndexValue[];
    height: number;
}

export interface LandscapeSmoothPayload {
    type: "LANDSCAPE";
    action: "SMOOTH";
    points: IndexValue[];
}

export interface LandscapeUpPayload {
    type: "LANDSCAPE";
    action: "STEP-UP";
    points: IndexValue[];
}

export interface LandscapeDownPayload {
    type: "LANDSCAPE";
    action: "STEP-DOWN";
    points: IndexValue[];
}

export const useFldReducer = (): [FldFile | null, React.Dispatch<FldAction>] => {
    const [fldFile, dispatch] = useReducer(reducer, null);
    return [fldFile, dispatch];
};

const reducer = (state: FldFile | null, action: FldAction): FldFile | null => {
    if (isSetFldAction(action)) {
        return action.fldFile;
    }

    if (!state) {
        return state;
    }

    if (isResourceAction(action)) {
        return performResourceAction(state, action);
    }

    if (isLandscapeAction(action)) {
        return performLandscapeAction(state, action);
    }

    return state;
};

const isSetFldAction = (action: FldAction): action is SetFldPayload => action.type === "SET_FLD" && !!action;
const isResourceAction = (action: FldAction): action is ResourcePayload => action.type === "RESOURCE" && !!action;

const isLandscapeAction = (action: FldAction) => action.type === "LANDSCAPE";

const isLandscapeFixAction = (action: FldAction): action is LandscapeFixPayload =>
    action.type === "LANDSCAPE" && action.action === "FIX" && !!action;

const isLandscapeSmoothAction = (action: FldAction): action is LandscapeSmoothPayload =>
    action.type === "LANDSCAPE" && action.action === "SMOOTH" && !!action;

const isLandscapeUpAction = (action: FldAction): action is LandscapeUpPayload =>
    action.type === "LANDSCAPE" && action.action === "STEP-UP" && !!action;

const isLandscapeDownAction = (action: FldAction): action is LandscapeDownPayload =>
    action.type === "LANDSCAPE" && action.action === "STEP-DOWN" && !!action;

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
function performLandscapeAction(
    state: FldFile,
    action: LandscapeFixPayload | LandscapeSmoothPayload | LandscapeUpPayload | LandscapeDownPayload,
): FldFile | null {
    const newState: FldFile = { ...state };
    const oldLandscape = newState.layers[Layer.Landscape];
    const landscape = new DataView(oldLandscape.buffer);
    newState.layers[Layer.Landscape] = landscape;
    let isDirty = false;
    if (isLandscapeFixAction(action)) {
        action.points.forEach((p) => {
            if (p.value !== action.height) {
                landscape.setUint8(p.index, action.height);
                isDirty = true;
            }
        });
    } else if (isLandscapeUpAction(action)) {
        action.points.forEach((p) => {
            const value = landscape.getUint8(p.index);
            if (value < 255) {
                landscape.setUint8(p.index, value + 1);
                isDirty = true;
            }
        });
    } else if (isLandscapeDownAction(action)) {
        action.points.forEach((p) => {
            const value = landscape.getUint8(p.index);
            if (value > 0) {
                landscape.setUint8(p.index, value - 1);
                isDirty = true;
            }
        });
    } else if (isLandscapeSmoothAction(action)) {
        const values = action.points.map((p) => p.value).sort((a, b) => a - b);
        const middleIndex = Math.floor(values.length / 2);
        const mid = values[middleIndex];
        action.points.forEach((p) => {
            const value = landscape.getUint8(p.index);
            if (value > mid) {
                landscape.setUint8(p.index, value - 1);
                isDirty = true;
            } else if (value < mid) {
                landscape.setUint8(p.index, value + 1);
                isDirty = true;
            }
        });
    }

    return isDirty ? newState : state;
}
