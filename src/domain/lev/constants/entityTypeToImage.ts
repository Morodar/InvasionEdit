const mapping: Map<number, string> = new Map<number, string>([
    [50, "50.jpg"],
    [300, "300.jpg"],
    [331, "331.jpg"],
    [333, "333.jpg"],
    [380, "380.jpg"],
    [381, "381.jpg"],
    [382, "382.jpg"],
    [811, "811.jpg"],
]);

export function entityTypeToImage(type: number): string {
    const image = mapping.get(type) ?? "unknown.jpg";
    return "img/buildings/" + image;
}
