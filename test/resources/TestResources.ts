import fs from "fs";
import path from "path";

export class TestResouces {
    static Level00_PCK = (): File => this.asFile("Level00.pck", "Level00.pck");
    static Hetra_LEV = (): File => this.asFile("hetra.lev", "Level00_pck/level/hetra.lev");
    static Level00_DAT = (): File => this.asFile("level00.dat", "Level00_pck/level/level00.dat");

    private static asFile(name: string, path: string): File {
        const fileBuffer = TestResouces.loadFile(path);
        const size = fileBuffer.byteLength;
        return {
            name,
            size,
            type: "application/octet-stream",
            arrayBuffer: () => Promise.resolve(fileBuffer.buffer),
        } as unknown as File;
    }

    static loadFile(fileName: string): Buffer {
        const file: string = path.join(__dirname, fileName);
        return fs.readFileSync(file);
    }

    static level00_Dat_Bytes = (): Buffer => this.loadFile("Level00_pck/level/level00.dat");
    static lev0002_flm_Bytes = (): Buffer => this.loadFile("Level00_pck/flm/lev0002.flm");
    static hetra_texte_str_Bytes = (): Buffer => this.loadFile("Level00_pck/level/hetra_texte.str");
    static hetra_fld_Bytes = (): Buffer => this.loadFile("Level00_pck/level/hetra.fld");
    static hetra_lev_Bytes = (): Buffer => this.loadFile("Level00_pck/level/hetra.lev");
}
