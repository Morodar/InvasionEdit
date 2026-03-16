type TextureDefinition = {
    value: number;
    r: number;
    g: number;
    b: number;
};

export const FLD_TEXTURE_FALLBACK: TextureDefinition = { value: 255, r: 255, g: 255, b: 255 };

export const FLD_TEXTURE_MAP: Map<number, TextureDefinition> = new Map<number, TextureDefinition>([
    [0, { value: 0, r: 84, g: 80, b: 49 }],
    [1, { value: 1, r: 105, g: 86, b: 60 }],
    [2, { value: 2, r: 129, g: 102, b: 85 }],
    [3, { value: 3, r: 115, g: 90, b: 74 }],
    [4, { value: 4, r: 119, g: 96, b: 74 }],
    [5, { value: 5, r: 177, g: 177, b: 177 }],
    [6, { value: 6, r: 182, g: 182, b: 182 }],
    [7, { value: 7, r: 91, g: 100, b: 104 }],
    [8, { value: 8, r: 149, g: 153, b: 155 }],
    [9, { value: 9, r: 101, g: 113, b: 119 }],

    [10, { value: 10, r: 174, g: 133, b: 103 }],
    [11, { value: 11, r: 159, g: 118, b: 92 }],
    [12, { value: 12, r: 133, g: 97, b: 79 }],
    [13, { value: 13, r: 147, g: 106, b: 84 }],
    [14, { value: 14, r: 169, g: 122, b: 92 }],
    [15, { value: 15, r: 62, g: 51, b: 48 }],
    [16, { value: 16, r: 57, g: 47, b: 46 }],
    [17, { value: 17, r: 48, g: 41, b: 38 }],
    [18, { value: 18, r: 60, g: 52, b: 49 }],
    [19, { value: 19, r: 38, g: 42, b: 33 }],

    [20, { value: 20, r: 84, g: 78, b: 70 }],
    [21, { value: 21, r: 80, g: 74, b: 67 }],
    [22, { value: 22, r: 138, g: 145, b: 149 }],
    [23, { value: 23, r: 64, g: 38, b: 27 }],
    [24, { value: 24, r: 38, g: 43, b: 33 }],
    [25, { value: 25, r: 134, g: 106, b: 78 }],
]);
