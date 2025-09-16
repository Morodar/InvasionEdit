/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useContext, useState } from "react";
import { Layer, LayerIndex, LayerIndexes } from "./Layer";

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
    setLayerSettings: React.Dispatch<React.SetStateAction<LayerSettings>>;
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

    const contextValue: LayerViewContextProps = {
        layerSettings,
        setLayerSettings,
        toggleHide,
        toggleWireframe,
    };

    return <LayerViewContext.Provider value={contextValue}>{children}</LayerViewContext.Provider>;
};

const initLayerSettings = (): LayerSettings => {
    const settings: LayerSettings = LayerIndexes.reduce((acc, layer) => {
        acc[layer] = { layer, hide: true, showWireframe: true };
        return acc;
    }, {} as LayerSettings);

    // enable known layers by default
    settings[Layer.Landscape].hide = false;
    settings[Layer.Landscape].showWireframe = false;
    settings[Layer.Resources].hide = false;
    settings[Layer.Resources].showWireframe = false;
    settings[Layer.Water].hide = false;
    settings[Layer.Water].showWireframe = false;

    return settings;
};
