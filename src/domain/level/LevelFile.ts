import { Difficulty } from "../constants/Difficulty";
import { MapSize } from "../constants/MapSize";
import { PlanetName } from "../constants/PlanetName";

export const LEVEL_ENTRY_SIZE = 0x100;

export interface LevelEntry {
    name: string;
    fromPlayers: string;
    toPlayers: string;
    planetName: PlanetName;
    difficulty: Difficulty;
    displayNameIndex: number;
    mapSize: MapSize;
    creationTime: string;

    /** Unknown 0xF0 */
    a: number;
    /** Unknown 0xF4 */
    b: number;
    /** Unknown 0xF8 */
    c: number;
    /** Unknown 0xFC */
    d: number;
}

export interface LevelFile {
    fileName: string;
    levels: LevelEntry[];
}
