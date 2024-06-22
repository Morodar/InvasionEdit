const mapping: Map<number, string> = new Map<number, string>([
    [1, "Jeep Weesel (MG)"],
    [2, "Jeep Weesel (Laser)"],
    [50, "Pioneer Vehicle"],
    [300, "Headquarter"],
    [301, "Light Weapon Factory"],
    [310, "Power Plant"],
    [330, "Xenit Mine"],
    [331, "Xenit Silo"],
    [332, "Tritium Pump"],
    [333, "Tritium Tank"],
    [360, "Mittlerer Geschütztum (Minikanone)"],
    [374, "Leichter Geschützturm (MG)"],
    [380, "Hohe Mauer"],
    [381, "Mauer"],
    [382, "Panzersperre"],
    [552, "Tree 52"],
    [553, "Tree 53"],
    [555, "Tree 55"],
    [563, "Tree 63"],
    [815, "Xenit Decoration 15"],
]);

export function entityTypeToName(type: number): string {
    return mapping.get(type) ?? String(type);
}
