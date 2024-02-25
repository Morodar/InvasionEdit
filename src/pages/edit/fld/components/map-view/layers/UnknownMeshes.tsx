import { Layer, LayerIndex } from "../../../../../../domain/fld/Layer";
import { useFldMapContext } from "../../../context/FldMapContext";
import { useLayerViewContext } from "../../../context/LayerViewContext";
import { GenericMesh } from "./GenericMesh";

const MESHES: LayerIndex[] = [
    Layer.Unknown1,
    Layer.Unknown3,
    Layer.Unknown4,
    Layer.Unknown5,
    Layer.Unknown6,
    Layer.Water,
    Layer.Water2,
    Layer.Unknown9,
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
