import { LevEntity } from "./LevEntity";
import { MapSize } from "../constants/MapSize";
import { PlanetName } from "../constants/PlanetName";
import { LevPlayerMeta } from "./LevPlayerMeta";
import { LevRGBA } from "./LevRGBA";

export type PlayerCount = 1 | 2 | 3 | 4 | 5 | 6;
export const MIN_PLAYER_COUNT = 2;
export const MAX_PLAYER_COUNT = 6;

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
    playerCount1: number;
    playerCount2: number;
    playerMeta: LevPlayerMeta[];
    buildingFilter1: LevRGBA;
    buildingFilter2: LevRGBA;
    environmentFilter1: LevRGBA;
    environmentFilter2: LevRGBA;
}
