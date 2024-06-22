import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import { Group, Object3DEventMap } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

const mapping: Map<number, string> = new Map<number, string>([
    [300, "headquarter.obj"],
    [380, "high-wall.obj"],
    [382, "panzersperre.obj"],
]);

export function entityTypeTo3dModel(type: number): string {
    const model = mapping.get(type) ?? "unknown.obj";
    return "3d/" + model;
}

export function useEntityModel(type: number) {
    const modelUrl = entityTypeTo3dModel(type);
    const model: Group<Object3DEventMap> = useLoader(OBJLoader, modelUrl);
    const clone = useMemo(() => model.clone(), [model]);
    return clone;
}
