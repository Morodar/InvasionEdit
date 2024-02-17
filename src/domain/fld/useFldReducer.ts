import { useReducer } from "react";
import { FldFile, IndexPoint3D } from "./FldFile";
import { Tritium, Xenit } from "./ResourceLayerUtil";
import { ActiveResource } from "../../pages/edit/fld/context/ResourceActionContext";

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
    points: IndexPoint3D[];
}

export interface LandscapeFixPayload {
    type: "LANDSCAPE";
    action: "FIX";
    points: IndexPoint3D[];
    height: number;
}

export interface LandscapeSmoothPayload {
    type: "LANDSCAPE";
    action: "SMOOTH";
    points: IndexPoint3D[];
}

export interface LandscapeUpPayload {
    type: "LANDSCAPE";
    action: "STEP-UP";
    points: IndexPoint3D[];
}

export interface LandscapeDownPayload {
    type: "LANDSCAPE";
    action: "STEP-DOWN";
    points: IndexPoint3D[];
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
    const newState = { ...state };
    const resourceOperation = RESOURCE_OPERATION[action.resource];
    action.points.forEach((p) => {
        const oldValue = newState.resourceLayer.getUint8(p.index);
        const newValue = resourceOperation(oldValue);
        newState.resourceLayer.setUint8(p.index, newValue);
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
    const newState = { ...state, points: [...state.points] };
    let isDirty = false;
    if (isLandscapeFixAction(action)) {
        action.points.forEach((p) => {
            if (p.value !== action.height) {
                newState.points[p.index].value = action.height;
                isDirty = true;
            }
        });
    } else if (isLandscapeUpAction(action)) {
        action.points.forEach((p) => {
            if (newState.points[p.index].value < 255) {
                newState.points[p.index].value++;
                isDirty = true;
            }
        });
    } else if (isLandscapeDownAction(action)) {
        action.points.forEach((p) => {
            if (newState.points[p.index].value > 0) {
                newState.points[p.index].value--;
                isDirty = true;
            }
        });
    } else if (isLandscapeSmoothAction(action)) {
        const values = action.points.map((p) => p.value).sort((a, b) => a - b);
        const middleIndex = Math.floor(values.length / 2);
        const mid = values[middleIndex];
        action.points.forEach((p) => {
            if (newState.points[p.index].value > mid) {
                newState.points[p.index].value--;
                isDirty = true;
            } else if (newState.points[p.index].value < mid) {
                newState.points[p.index].value++;
                isDirty = true;
            }
        });
    }

    return isDirty ? newState : state;
}
