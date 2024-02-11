import { FldFile, Point3D } from "./FldFile";

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

export interface ResourcePoint {
    x: number;
    y: number;
    z: number;
}

export interface ResourceDefinition {
    xenit: ResourcePoint[];
    tritium: ResourcePoint[];
    xenitTritium: ResourcePoint[];
    unknown: Point3D[];
}

export class ResourceLayerUtil {
    static fromFldFile(fldFile: FldFile): ResourceDefinition {
        let i = 0;
        const resourceLayer = fldFile.resourceLayer;
        const xenit: ResourcePoint[] = [];
        const tritium: ResourcePoint[] = [];
        const xenitTritium: ResourcePoint[] = [];
        const unknown: Point3D[] = [];

        for (const p of fldFile.points) {
            const resource = resourceLayer.getUint8(i);
            if (resource !== 0) {
                if (resource === Xenit.LAYER_VALUE) {
                    xenit.push({ x: p.x, y: p.value, z: p.z });
                } else if (resource === Tritium.LAYER_VALUE) {
                    tritium.push({ x: p.x, y: p.value, z: p.z });
                } else if (resource === XenitTritium.LAYER_VALUE) {
                    xenitTritium.push({ x: p.x, y: p.value, z: p.z });
                } else {
                    unknown.push({ x: p.x, z: p.z, value: resource });
                }
            }
            i++;
        }
        return { xenit, tritium, xenitTritium, unknown };
    }
}
