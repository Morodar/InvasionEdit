import { Level } from "../../level/Level";
import { PckFileEntry } from "../PckFileEntry";

export interface LevelPck {
    filename: string;
    levels: Level[];
    remainingFiles: PckFileEntry[];
}
