import { TestResouces } from "../../resources/TestResources";
import { parsePckFile } from "../../../src/domain/pck/PckParser";

describe("PckParser", () => {
    describe("given valid pck file", async () => {
        const file = TestResouces.Level00_PCK();
        const result = await parsePckFile(file as unknown as File);
        const entries = result.pckFileEntries;

        it("parses pck header correctly", () => {
            expect(result.filename).toBe("Level00.pck");
            expect(result.header.fileSize).toBe(234272);
            expect(result.header.fileCount).toBe(5);
            expect(result.header.pcName1).toBe("MARS");
            expect(result.header.date1.toISOString()).toBe("2000-07-25T15:50:08.000Z");
            expect(result.pckFileEntries).toHaveLength(5);
        });

        it("parses level00.dat header correctly", () => {
            const file = entries[0];
            expect(file.name).toBe("level\\level00.dat");
            expect(file.unpackedSize).toBe(256);
            expect(file.fileType).toBe(6619240);
            expect(file.packedSize).toBe(336);
            expect(file.dataFormat).toBe(0);
            expect(file.newSize).toBe(0);
        });

        it.each([
            ["level\\hetra.lev", 1, TestResouces.hetra_lev_Bytes],
            ["level\\hetra_texte.str", 2, TestResouces.hetra_texte_str_Bytes],
            ["level\\hetra.fld", 3, TestResouces.hetra_fld_Bytes],
            ["flm\\lev0002.flm", 4, TestResouces.lev0002_flm_Bytes],
        ])("decompresses %s correctly", (fileName: string, entryIndex: number, expectedFile: () => Buffer) => {
            const file = entries[entryIndex];
            expect(file.name).toBe(fileName);

            const expected = expectedFile();
            const view = new DataView(expected.buffer);

            expect(file.dataBytes).toEqualDataView(view);
        });

        it("decompresses level00.dat correctly", () => {
            const file = entries[0];
            const expected = TestResouces.level00_Dat_Bytes();
            expect(file.dataBytes).toEqualBuffer(expected);
        });

        it("parses hetra.lev header correctly", () => {
            const file = entries[1];
            expect(file.name).toBe("level\\hetra.lev");
            expect(file.unpackedSize).toBe(11616);
            expect(file.fileType).toBe(7759212);
            expect(file.packedSize).toBe(4272);
            expect(file.dataFormat).toBe(0);
            expect(file.newSize).toBe(0);
        });

        it("parses hetra_texte.str header correctly", () => {
            const file = entries[2];
            expect(file.name).toBe("level\\hetra_texte.str");
            expect(file.unpackedSize).toBe(5560);
            expect(file.fileType).toBe(7500915);
            expect(file.packedSize).toBe(3200);
            expect(file.dataFormat).toBe(0);
            expect(file.newSize).toBe(0);
        });

        it("parses hetra.fld header correctly", () => {
            const file = entries[3];
            expect(file.name).toBe("level\\hetra.fld");
            expect(file.unpackedSize).toBe(1693312);
            expect(file.fileType).toBe(6581350);
            expect(file.packedSize).toBe(88464);
            expect(file.dataFormat).toBe(2);
            expect(file.newSize).toBe(212112);
        });

        it("parses lev0002.flm header correctly", () => {
            const file = entries[4];
            expect(file.name).toBe("flm\\lev0002.flm");
            expect(file.unpackedSize).toBe(134912);
            expect(file.fileType).toBe(7171174);
            expect(file.packedSize).toBe(134912);
            expect(file.dataFormat).toBe(1);
            expect(file.newSize).toBe(0);
        });
    });
});
