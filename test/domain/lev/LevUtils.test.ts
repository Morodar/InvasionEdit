import { LevOwner } from "../../../src/domain/lev/LevEntity";
import { LevUtils } from "../../../src/domain/lev/LevUtils";
import { MapSize } from "../../../src/domain/lev/constants/MapSize";
import { PlanetName } from "../../../src/domain/lev/constants/PlanetName";
import { TestResouces } from "../../resources/TestResources";

describe("LevUtils.parseLevFile", () => {
    describe("given valid lev file", async () => {
        const file = TestResouces.Hetra_LEV();
        const result = await LevUtils.parseLevFile(file);

        it("parses header", () => {
            expect(result.name).toBe("hetra.lev");
            expect(result.fileSize).toBe(11616);
            expect(result.pcName1).toBe("PLUTO");
            expect(result.pcName2).toBe("PLUTO");
            expect(result.levelName).toBe("hetra.");
            expect(result.fromPlayers).toBe("4");
            expect(result.toPlayers).toBe("4");
            expect(result.planetName).toBe(PlanetName.Thorgon);
            expect(result.mapSize).toBe(MapSize.Medium);
            expect(result.entityCount).toBe(193);
        });

        it("reads mdl files", () => {
            expect(result.mdls).toStrictEqual([
                "mdl\\aufbau1",
                "mdl\\aufbau2",
                "mdl\\aufbau3",
                "mdl\\building1",
                "mdl\\building2",
                "mdl\\building3",
                "mdl\\ruinen",
                "mdl\\unterbau1",
                "mdl\\unterbau2",
                "mdl\\unterbau3",
                "mdl\\lbaum",
                "mdl\\nbaum",
                "mdl\\busch",
                "mdl\\farne",
                "mdl\\kaktus",
                "mdl\\palmen",
                "mdl\\stein",
                "mdl\\rohstoff",
                "arm\\unit",
                "arm\\building",
                "arm\\ruinen",
                "arm\\lbaum",
                "arm\\nbaum",
                "arm\\busch",
                "arm\\farne",
                "arm\\kaktus",
                "arm\\palmen",
                "arm\\stein",
                "arm\\rohstoff",
                "sht\\shot1",
                "sht\\shot2",
                "sht\\shot3",
                "sht\\shot4",
                "eff\\destroy",
                "eff\\flash",
                "eff\\ground",
                "eff\\hitunit",
                "eff\\nograv",
                "eff\\particle",
                "eff\\rauch",
                "eff\\bauen",
                "eff\\arbeit",
                "eff\\baum",
                "level\\Hetra",
                "gfx\\boden\\soil",
                "gfx\\texturen\\water",
                "gfx\\texturen\\sky",
                "gfx\\mdl\\army",
                "gfx\\texturen\\shot",
                "gfx\\texturen\\effect",
                "sound\\sound??",
                "engine\\tech",
                "flm\\erde",
            ]);
        });

        it("reads entities", () => {
            expect(result.entities.length).toBe(193);
            expect(result.entities[0]).toStrictEqual({
                type: 1,
                owner: LevOwner.Devoken,
                x: 148264,
                z: 4294891337,
                rotation: 38912,
            });
            expect(result.entities[192]).toStrictEqual({
                type: 807,
                owner: LevOwner.Neutral,
                x: 251235,
                z: 4294938591,
                rotation: 0,
            });
        });
    });
});
