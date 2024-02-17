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

    const contextValue: LayerViewContextProps = useMemo(() => ({ layerSettings, setLayerSettings }), [layerSettings]);

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
