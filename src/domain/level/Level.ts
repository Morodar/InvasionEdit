import { FldFile } from "../fld/FldFile";
import { LevFile } from "../lev/LevFile";
import { LevelEntry } from "./LevelFile";

export interface Level {
    dat: LevelEntry;
    lev: LevFile;
    fld: FldFile;
}
