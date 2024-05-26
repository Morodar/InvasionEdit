import { LevelPckParser } from "../../../../src/domain/pck/level/LevelPckParser";
import { TestResouces } from "../../../resources/TestResources";

describe("LevelPckParser.parseLevelPck", () => {
    describe("given valid level00.pck containing hetra map", async () => {
        const file = TestResouces.Level00_PCK();
        const { filename, levels, remainingFiles } = await LevelPckParser.parseLevelPck(file);

        it("returns expected filename", () => expect(filename).toBe("Level00.pck"));
        it("parses one level", () => {
            expect(levels).toHaveLength(1);
            const { dat, fld, lev } = levels[0];
            expect(dat.name).toBe("hetra.");
            expect(fld.name).toBe("level\\hetra.fld");
            expect(lev.name).toBe("level\\hetra.lev");
        });

        it("has expected two remaining file", async () => {
            expect(remainingFiles).toHaveLength(2);
            const [str, flm] = remainingFiles;
            expect(str.name).toBe("level\\hetra_texte.str");
            expect(flm.name).toBe("flm\\lev0002.flm");

            const strView = new DataView(await TestResouces.HetraTexte_STR().arrayBuffer());
            assertDataViews(str.dataBytes, strView);

            const flmView = new DataView(await TestResouces.Lev0002_FLM().arrayBuffer());
            assertDataViews(flm.dataBytes, flmView);
        });
    });
});

function assertDataViews(a: DataView, b: DataView) {
    expect(a.byteLength).toBe(b.byteLength);
    expect(a).toStrictEqual(b);
}
