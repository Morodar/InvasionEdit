import { useReducer } from "react";
import { LevFile } from "./LevFile";

export type LevAction = SetLevFile;

export interface SetLevFile {
    type: "SET_LEV";
    levFile: LevFile | null;
}

export const useLevReducer = (): [LevFile | null, React.Dispatch<LevAction>] => {
    const [levFile, dispatch] = useReducer(LevReducer, null);
    return [levFile, dispatch];
};

export const LevReducer = (state: LevFile | null, action: LevAction): LevFile | null => {
    if (action.type === "SET_LEV") {
        return action.levFile;
    }

    if (!state) {
        return state;
    }

    return state;
};
