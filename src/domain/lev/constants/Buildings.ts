import { BUILDING_KEYS } from "./EntityKeys";

type EntityMeta = {
    type: number;
    model?: string;
    image?: string;
    name?: string;
};

export const BUILDINGS = new Map<BUILDING_KEYS, EntityMeta>([
    [300, { type: 300, model: "Hauptgebäude.glb", image: "300.jpg", name: "Headquarter" }],
    [301, { type: 301, model: "LeichteWaffenfabrik.glb", image: undefined, name: "Headquarter" }],
    [310, { type: 310, model: "Kraftwerk.glb", image: undefined, name: "Headquarter" }],
    [330, { type: 330, model: "Xenitmine.glb", image: undefined, name: "Headquarter" }],
    [331, { type: 331, model: "Xenitsilo.glb", image: "331.jpg", name: "Headquarter" }],
    [332, { type: 332, model: "Tritiumpumpe.glb", image: undefined, name: "Headquarter" }],
    [333, { type: 333, model: "Tritiumtank.glb", image: "333.jpg", name: "Headquarter" }],
    [360, { type: 360, model: "unknown.obj", image: "360.jpg", name: "Mittlerer Geschütztum (Minikanone)" }],
    [374, { type: 374, model: "unknown.obj", image: "374.jpg", name: "Leichter Geschützturm (MG)" }],
    [380, { type: 380, model: "HoheMauer.glb", image: "380.jpg", name: "Headquarter" }],
    [381, { type: 381, model: "Mauer.glb", image: "381.jpg", name: "Headquarter" }],
    [382, { type: 382, model: "Panzersperre.glb", image: "382.jpg", name: "Headquarter" }],
]);
