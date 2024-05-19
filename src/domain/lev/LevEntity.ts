import { LevOwner } from "./constants/LevOwner";

export interface LevEntity {
    type: number;
    owner: LevOwner;
    x: number;
    z: number;
    rotation: number;
}
