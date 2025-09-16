import { EntityMeta } from "./Entity";
export type DECORATION_KEYS = 552 | 553 | 555 | 811 | 815;

export const DECORATION_MAP = new Map<DECORATION_KEYS, EntityMeta>([
    [552, { type: 552, model: undefined, image: undefined, name: "Tree 52" }],
    [553, { type: 553, model: undefined, image: undefined, name: "Tree 53" }],
    [555, { type: 555, model: undefined, image: undefined, name: "Tree 55" }],
    [815, { type: 811, model: undefined, image: "811.jpg", name: "Tritium Decoration 11" }],
    [815, { type: 815, model: undefined, image: undefined, name: "Xenit Decoration 15" }],
]);
