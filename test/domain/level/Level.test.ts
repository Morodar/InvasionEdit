import { Difficulty } from "../../../src/domain/constants/Difficulty";
import { MapSize } from "../../../src/domain/constants/MapSize";
import { PlanetName } from "../../../src/domain/constants/PlanetName";
import { LevelEntry } from "../../../src/domain/level/LevelFile";
import { LevelUtils } from "../../../src/domain/level/LevelUtils";
import { TestResouces } from "../../resources/TestResources";

describe("LevelUtils.parseLevelFile", () => {
    describe("given valid level.dat file", async () => {
        const file = TestResouces.Level00_DAT();
        const result = await LevelUtils.parseLevelFile(file);

        it("contains expected file name", () => expect(result.fileName).toBe("level00.dat"));
        it("parsed 1 entry", () => expect(result.levels).toHaveLength(1));
        it("entry has expected data", () => {
            const expected: LevelEntry = {
                a: 29349380,
                b: 684616584,
                c: 29349374,
                creationTime: "14.6.2000, 15:28",
                d: 684615218,
                difficulty: Difficulty.Medium,
                displayNameIndex: 2,
                fromPlayers: "4",
                mapSize: MapSize.Medium,
                name: "hetra.",
                planetName: PlanetName.Thorgon,
                toPlayers: "4",
            };
            expect(result.levels[0]).toStrictEqual(expected);
        });
    });
});
