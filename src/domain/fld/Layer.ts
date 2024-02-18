/** FLD file has 16 Layers */
export const LayerIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const;
export type LayerIndex = (typeof LayerIndexes)[number];

export interface LayerMeta {
    label: string;
    fileOffset: number;
}

export type Layers = Record<LayerIndex, LayerMeta>;

export class Layer {
    static Unknown1: LayerIndex = 0;
    static Landscape: LayerIndex = 1;
    static Unknown3: LayerIndex = 2;
    static Unknown4: LayerIndex = 3;
    static Unknown5: LayerIndex = 4;
    static Unknown6: LayerIndex = 5;
    static Unknown7: LayerIndex = 6;
    static Unknown8: LayerIndex = 7;
    static Unknown9: LayerIndex = 8;
    static Resources: LayerIndex = 9;
    static Unknown11: LayerIndex = 10;
    static Unknown12: LayerIndex = 11;
    static Unknown13: LayerIndex = 12;
    static Unknown14: LayerIndex = 13;
    static Unknown15: LayerIndex = 14;
    static Unknown16: LayerIndex = 15;
}

export const Layers: Layers = {
    0: { label: "LAYER.TEXTURES", fileOffset: 584 },
    1: { label: "LAYER.LANDSCAPE", fileOffset: 585 },
    2: { label: "LAYER.EMPTY_3", fileOffset: 586 },
    3: { label: "LAYER.EMPTY_4", fileOffset: 587 },
    4: { label: "LAYER.TEXTURES_2", fileOffset: 588 },
    5: { label: "LAYER.UNKNOWN_6", fileOffset: 589 },
    6: { label: "LAYER.UNKNOWN_7", fileOffset: 590 },
    7: { label: "LAYER.UNKNOWN_8", fileOffset: 591 },
    8: { label: "LAYER.UNKNOWN_9", fileOffset: 592 },
    9: { label: "LAYER.RESOURCES", fileOffset: 593 },
    10: { label: "LAYER.EMPTY_11", fileOffset: 594 },
    11: { label: "LAYER.UNKNOWN_12", fileOffset: 595 },
    12: { label: "LAYER.EMPTY_13", fileOffset: 596 },
    13: { label: "LAYER.EMPTY_14", fileOffset: 597 },
    14: { label: "LAYER.EMPTY_15", fileOffset: 598 },
    15: { label: "LAYER.EMPTY_16", fileOffset: 599 },
};
