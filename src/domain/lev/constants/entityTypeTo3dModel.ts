import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import { Group, Object3DEventMap } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader, FBXLoader, GLTF } from "three/examples/jsm/Addons.js";
import { BUILDINGS } from "./Buildings";
import { BUILDING_KEYS } from "./EntityKeys";

export function entityTypeTo3dModel(type: number): string {
    const model = BUILDINGS.get(type as BUILDING_KEYS)?.model ?? "unknown.obj";
    return "3d/" + model;
}

type LoaderResult = Group<Object3DEventMap> | GLTF;

function isGltf(result: LoaderResult): result is GLTF {
    return (result as GLTF).scene !== undefined;
}

export function useEntityModel(type: number) {
    const modelUrl = entityTypeTo3dModel(type);
    const loader = useMemo(() => getLoader(modelUrl), [modelUrl]);
    const model: LoaderResult = useLoader(loader, modelUrl);
    const clone = useMemo(() => {
        if (isGltf(model)) {
            return model.scene.clone();
        } else {
            return model.clone();
        }
    }, [model]);
    return clone;
}

function getLoader(modelUrl: string) {
    if (modelUrl.endsWith(".obj")) {
        return OBJLoader;
    }
    if (modelUrl.endsWith(".glb")) {
        return GLTFLoader;
    }
    if (modelUrl.endsWith(".gltf")) {
        return GLTFLoader;
    }
    if (modelUrl.endsWith(".fbx")) {
        return FBXLoader;
    }
    return OBJLoader;
}
