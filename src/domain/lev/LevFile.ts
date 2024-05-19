import { LevEntity } from "./LevEntity";
import { MapSize } from "./constants/MapSize";
import { PlanetName } from "./constants/PlanetName";

export interface LevFile {
    name: string;
    fileSize: number;
    pcName1: string;
    pcName2: string;
    levelName: string;
    fromPlayers: string;
    toPlayers: string;
    planetName: PlanetName;
    mapSize: MapSize;
    entityCount: number;
    mdls: string[];
    entities: LevEntity[];
}
