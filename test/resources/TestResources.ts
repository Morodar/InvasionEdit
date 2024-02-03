import fs from "fs";
import path from "path";

export class TestResouces {
    static Level00_PCK = (): File => {
        return {
            name: "Level00.pck",
            type: "application/octet-stream",
            size: 234272,
            arrayBuffer: () => Promise.resolve(TestResouces.loadFile("Level00.pck").buffer),
        } as unknown as File;
    };

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
