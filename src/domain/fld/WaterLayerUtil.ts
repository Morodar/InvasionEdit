import { FldFile, IndexValue } from "./FldFile";
import { Layer } from "./Layer";

export const WATER_VALUE = 0;
export const NO_WATER_VALUE = 255;
export const WATER_COLOR = "#1D5C93";

export class WaterLayerUtil {
    static addWater(fld: FldFile, point: IndexValue, height: number) {
        const landscape = fld.layers[Layer.Landscape].getUint8(point.index);
        const waterHeight = height - landscape;
        fld.layers[Layer.Water].setUint8(point.index, WATER_VALUE);
        fld.layers[Layer.Water2].setUint8(point.index, WATER_VALUE);
        fld.layers[Layer.WaterHeight].setUint8(point.index, waterHeight);
    }

    static removeWater(fld: FldFile, point: IndexValue) {
        fld.layers[Layer.Water].setUint8(point.index, NO_WATER_VALUE);
        fld.layers[Layer.Water2].setUint8(point.index, NO_WATER_VALUE);
        fld.layers[Layer.WaterHeight].setUint8(point.index, 0);
    }
}
