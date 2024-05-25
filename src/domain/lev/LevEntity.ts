import { Owner } from "../constants/Owner";

export interface LevEntity {
    type: number;
    owner: Owner;
    x: number;
    z: number;
    rotation: number;
}
