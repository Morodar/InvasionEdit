import { useReducer } from "react";
import { FldFile, IndexPoint3D } from "./FldFile";
import { Tritium, Xenit } from "./ResourceLayerUtil";
import { ActiveResource } from "../../pages/edit/fld/context/ResourceActionContext";

export type FldActionTypes = "LANDSACPE" | "RESOURCE" | "SET_FLD";

export type FldAction = ResourcePayload | LandScapePayload | SetFldPayload;

export interface SetFldPayload {
    type: "SET_FLD";
    fldFile: FldFile | null;
}

export interface ResourcePayload {
    type: "RESOURCE";
    resource: ActiveResource;
    points: IndexPoint3D[];
}

export interface LandScapePayload {
    type: "LANDSCAPE";
    tool: "INCREASE" | "DECREASE";
    amount: number;
    points: IndexPoint3D[];
}

export const useFldReducer = (): [FldFile | null, React.Dispatch<FldAction>] => {
    const [fldFile, dispatch] = useReducer(reducer, null);
    return [fldFile, dispatch];
};

const reducer = (state: FldFile | null, action: FldAction): FldFile | null => {
    if (iSetFldAction(action)) {
        return action.fldFile;
    }

    if (!state) {
        return state;
    }

    if (isResourceAction(action)) {
        return performResourceAction(state, action);
    }

    return state;
};

const isResourceAction = (action: FldAction): action is ResourcePayload => action.type === "RESOURCE" && !!action;
const iSetFldAction = (action: FldAction): action is SetFldPayload => action.type === "SET_FLD" && !!action;

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
