import { LevEntity } from "./LevEntity";
import { MapSize } from "../constants/MapSize";
import { PlanetName } from "../constants/PlanetName";
import { LevPlayerMeta } from "./LevPlayerMeta";
import { LevRGBA } from "./LevRGBA";

export interface LevFile {
    name: string;
    fileSize: number;
    pcName1: string;
    pcName2: string;
    levelName: string;
    fromPlayers: string;
    toPlayers: string;
    difficulty: number;
    mapTextIndex: number;
    planetName: PlanetName;
    mapSize: MapSize;
    entityCount: number;
    mdls: string[];
    entities: LevEntity[];
    playerMeta: LevPlayerMeta[];
    buildingFilter1: LevRGBA;
    buildingFilter2: LevRGBA;
    environmentFilter1: LevRGBA;
    environmentFilter2: LevRGBA;
}
