import { EntityMeta } from "./Entity";

export type UNIT_KEYS = 1 | 2 | 50;

export const UNIT_MAP = new Map<UNIT_KEYS, EntityMeta>([
    [1, { type: 1, model: undefined, image: undefined, name: "Jeep Weesel (MG)" }],
    [2, { type: 2, model: undefined, image: undefined, name: "Jeep Weesel (Laser)" }],
    [50, { type: 50, model: undefined, image: "50.jpg", name: "Pioneer Vehicle" }],
]);
