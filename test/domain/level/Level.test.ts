import { LevelUtils } from "../../../src/domain/level/LevelUtils";
import { TestResouces } from "../../resources/TestResources";

describe("LevelUtils.parseLevelFile", () => {
    describe("given valid level.dat file", async () => {
        const file = TestResouces.Level00_DAT();
        const result = await LevelUtils.parseLevelFile(file);

        it("contains expected file name", () => expect(result.fileName).toBe("level00.dat"));
        it("parsed 1 entry", () => expect(result.levels).toHaveLength(1));
    });
});
