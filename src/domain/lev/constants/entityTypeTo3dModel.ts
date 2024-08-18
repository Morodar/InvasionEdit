import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import { Group, Object3DEventMap } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader, FBXLoader, GLTF } from "three/examples/jsm/Addons.js";

const mapping: Map<number, string> = new Map<number, string>([
    [1, "JeepWiesel.glb"],
    [2, "JeepWiesel.glb"],

    [300, "Hauptgebäude.glb"],
    [301, "LeichteWaffenfabrik.glb"],
    [310, "Kraftwerk.glb"],
    [330, "Xenitmine.glb"],
    [331, "Xenitsilo.glb"],
    [332, "Tritiumpumpe.glb"],
    [333, "Tritiumtank.glb"],
    [380, "HoheMauer.glb"],
    [381, "Mauer.glb"],
    [382, "Panzersperre.glb"],
]);

export function entityTypeTo3dModel(type: number): string {
    const model = mapping.get(type) ?? "unknown.obj";
    return "3d/" + model;
}

type LoaderResult = Group<Object3DEventMap> | GLTF;

function isGltf(result: LoaderResult): result is GLTF {
    return (result as GLTF).scene !== undefined;
}

export function useEntityModel(type: number) {
    const modelUrl = entityTypeTo3dModel(type);
    const model: LoaderResult = useLoader(getLoader(modelUrl), modelUrl);
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
