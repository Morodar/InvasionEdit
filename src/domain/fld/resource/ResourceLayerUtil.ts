import { FldFile, IndexValue } from "../FldFile";
import { Layer } from "../layers/Layer";
import { Tritium } from "./Tritium";
import { Xenit } from "./Xenit";
import { XenitTritium } from "./XenitTritium";
export interface ResourceDefinition {
    xenit: IndexValue[];
    tritium: IndexValue[];
    xenitTritium: IndexValue[];
    unknown: IndexValue[];
}

export class ResourceLayerUtil {
    static fromFldFile(fldFile: FldFile): ResourceDefinition {
        const resourceLayer = fldFile.layers[Layer.Resources];
        const xenit: IndexValue[] = [];
        const tritium: IndexValue[] = [];
        const xenitTritium: IndexValue[] = [];
        const unknown: IndexValue[] = [];

        for (let index = 0; index < resourceLayer.byteLength; index++) {
            const value = resourceLayer.getUint8(index);
            if (value !== 0) {
                if (value === Xenit.LAYER_VALUE) {
                    xenit.push({ index, value });
                } else if (value === Tritium.LAYER_VALUE) {
                    tritium.push({ index, value });
                } else if (value === XenitTritium.LAYER_VALUE) {
                    xenitTritium.push({ index, value });
                } else {
                    unknown.push({ index, value });
                }
            }
        }
        return { xenit, tritium, xenitTritium, unknown };
    }
}
