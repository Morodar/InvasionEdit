import { MapLayer } from "./MapLayer";

export interface FldFile extends MapLayer {
    name: string;
    fileSize: number;
    resourceLayer: DataView;
    devSaveLocation: string;
    unknown0xB0: number;
    unknown0xB4: number;
}
