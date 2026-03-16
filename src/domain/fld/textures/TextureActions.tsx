import { useEffect } from "react";
import { FldMap } from "../FldFile";
import { useFldMapContext } from "../FldMapContext";
import { Layer } from "../layers/Layer";

export const TextureActions = () => {
    const { fldFile } = useFldMapContext();
    useEffect(() => {
        if (fldFile) {
            getAllTextureValues(fldFile);
        }
    }, [fldFile]);
    return <>Hello</>;
};

function getAllTextureValues(layer: FldMap) {
    const values = new Set<number>();
    const { layers } = layer;
    const landscape = layers[Layer.Textures1];
    for (let i = 0; i < landscape.byteLength; i++) {
        values.add(landscape.getUint8(i));
    }
    console.log(Array.of(...values).sort((a, b) => a - b));
}
