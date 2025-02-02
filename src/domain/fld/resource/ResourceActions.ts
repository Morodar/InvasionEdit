import { cloneDataView } from "../../cloneDataView";
import { IndexValue, FldFile } from "../FldFile";
import { Layer } from "../layers/Layer";
import { ActiveResource } from "./ResourceActionContext";
import { Tritium } from "./Tritium";
import { Xenit } from "./Xenit";

export interface ResourcePayload {
    type: "RESOURCE";
    resource: ActiveResource;
    points: IndexValue[];
}

const addXenit = (oldValue: number): number => (oldValue |= Xenit.LAYER_VALUE);
const addTritium = (oldValue: number): number => (oldValue |= Tritium.LAYER_VALUE);
const removeResource = (): number => 0;
const RESOURCE_OPERATION: { [key in ActiveResource]: (oldValue: number) => number } = {
    DELETE: removeResource,
    TRITIUM: addTritium,
    XENIT: addXenit,
};

export const performResourceAction = (state: FldFile, action: ResourcePayload): FldFile => {
    const newState: FldFile = { ...state };
    newState.layers = { ...state.layers };
    const resourceLayer = cloneDataView(state.layers[Layer.Resources]);
    newState.layers[Layer.Resources] = resourceLayer;
    let isDirty = false;

    const resourceOperation = RESOURCE_OPERATION[action.resource];
    action.points.forEach((p) => {
        const oldValue = resourceLayer.getUint8(p.index);
        const newValue = resourceOperation(oldValue);
        if (oldValue !== newValue) {
            isDirty = true;
            resourceLayer.setUint8(p.index, newValue);
        }
    });

    return isDirty ? newState : state;
};
