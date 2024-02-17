/** FLD file has 16 Layers */
export const LayerIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const;
export type LayerIndex = (typeof LayerIndexes)[number];

export interface LayerMeta {
    label: string;
}

export type Layers = Record<LayerIndex, LayerMeta>;

export class Layer {
    static Landscape: LayerIndex = 5;
    static Resources: LayerIndex = 13;
}

export const Layers: Layers = {
    0: { label: "LAYER.UNKNOWN" },
    1: { label: "LAYER.UNKNOWN" },
    2: { label: "LAYER.UNKNOWN" },
    3: { label: "LAYER.UNKNOWN" },
    4: { label: "LAYER.UNKNOWN" },
    5: { label: "LAYER.LANDSCAPE" },
    6: { label: "LAYER.UNKNOWN" },
    7: { label: "LAYER.UNKNOWN" },
    8: { label: "LAYER.UNKNOWN" },
    9: { label: "LAYER.UNKNOWN" },
    10: { label: "LAYER.UNKNOWN" },
    11: { label: "LAYER.UNKNOWN" },
    12: { label: "LAYER.UNKNOWN" },
    13: { label: "LAYER.RESOURCES" },
    14: { label: "LAYER.UNKNOWN" },
    15: { label: "LAYER.UNKNOWN" },
};
