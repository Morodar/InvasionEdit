import { Layer, LayerIndex } from "../layers/Layer";
import { useFldMapContext } from "../FldMapContext";
import { useLayerViewContext } from "../layers/LayerViewContext";
import { GenericMesh } from "./GenericMesh";

const MESHES: LayerIndex[] = [
    Layer.Unknown1,
    Layer.Mountains1,
    Layer.Mountains2,
    Layer.Noise2,
    Layer.WaterHeight,
    Layer.Water2,
    Layer.Textures1,
    Layer.Unknown11,
    Layer.Unknown12,
    Layer.Unknown13,
    Layer.Unknown14,
    Layer.Unknown15,
    Layer.Unknown16,
];

export const UnknownMeshes = () => {
    const { fldFile } = useFldMapContext();
    const { layerSettings } = useLayerViewContext();

    if (!fldFile) {
        return <></>;
    }

    return (
        <>
            {MESHES.map((layer) => (
                <GenericMesh key={layer} layer={fldFile.layers[layer]} map={fldFile} settings={layerSettings[layer]} />
            ))}
        </>
    );
};
