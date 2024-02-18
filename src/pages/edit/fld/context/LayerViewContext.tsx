/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useContext, useMemo, useState } from "react";
import { Layer, LayerIndex, LayerIndexes } from "../../../../domain/fld/Layer";

export interface LayerSetting {
    layer: LayerIndex;
    hide: boolean;
    showWireframe: boolean;
}

export type LayerSettings = Record<LayerIndex, LayerSetting>;

export interface LayerViewContextProps {
    layerSettings: LayerSettings;
    toggleHide: (layer: LayerIndex) => void;
    toggleWireframe: (layer: LayerIndex) => void;
}

export const LayerViewContext = createContext<LayerViewContextProps | undefined>(undefined);

export const useLayerViewContext = (): LayerViewContextProps => {
    const context = useContext(LayerViewContext);
    if (!context) {
        throw new Error("LayerViewContext not initialized");
    }
    return context;
};

export const LayerViewContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const [layerSettings, setLayerSettings] = useState<LayerSettings>(initLayerSettings());
    const toggleHide = (layer: LayerIndex) => {
        setLayerSettings((old) => {
            const updated = { ...old };
            const updatedSetting = { ...old[layer] };
            updatedSetting.hide = !updatedSetting.hide;
            updated[layer] = updatedSetting;
            return updated;
        });
    };

    const toggleWireframe = (layer: LayerIndex) => {
        setLayerSettings((old) => {
            const updated = { ...old };
            const updatedSetting = { ...old[layer] };
            updatedSetting.showWireframe = !updatedSetting.showWireframe;
            updated[layer] = updatedSetting;
            return updated;
        });
    };

    const contextValue: LayerViewContextProps = useMemo(
        () => ({ layerSettings, setLayerSettings, toggleHide, toggleWireframe }),
        [layerSettings],
    );

    return <LayerViewContext.Provider value={contextValue}>{children}</LayerViewContext.Provider>;
};

const initLayerSettings = (): LayerSettings => {
    const settings: LayerSettings = LayerIndexes.reduce((acc, layer) => {
        acc[layer] = { layer, hide: true, showWireframe: false };
        return acc;
    }, {} as LayerSettings);

    settings[Layer.Landscape].hide = false;
    settings[Layer.Resources].hide = false;
    return settings;
};
