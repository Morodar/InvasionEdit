import { FldFile, IndexValue } from "../FldFile";
import { Layer } from "../layers/Layer";

export class Xenit {
    static LAYER_VALUE = 8;
    static COLOR = "#D2691E";
}

export class Tritium {
    static LAYER_VALUE = 16;
    static COLOR = "#0099FF";
}

export class XenitTritium {
    static LAYER_VALUE = 24;
    static COLOR = "#800080";
}

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
