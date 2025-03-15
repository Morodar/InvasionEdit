import { BUILDING_KEYS, BUILDINGS_MAP } from "./Buildings";
import { DECORATION_KEYS, DECORATION_MAP } from "./Decorations";
import { EntityMeta } from "./Entity";
import { UNIT_KEYS, UNIT_MAP } from "./Units";

export type ENTITY_KEYS = UNIT_KEYS & BUILDING_KEYS & DECORATION_KEYS;

export const ENTITIES = new Map<number, EntityMeta>([...UNIT_MAP, ...BUILDINGS_MAP, ...DECORATION_MAP]);

export function entityTypeToName(type: number): string {
    return ENTITIES.get(type)?.name ?? String(type);
}

export function entityTypeToImage(type: number): string {
    const image = ENTITIES.get(type)?.image ?? "unknown.jpg";
    return "img/buildings/" + image;
}

export function entityTypeTo3dModel(type: number): string {
    const model = ENTITIES.get(type as ENTITY_KEYS)?.model ?? "unknown.obj";
    return "3d/" + model;
}
