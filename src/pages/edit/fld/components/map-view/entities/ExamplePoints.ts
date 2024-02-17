import { MapLayer } from "../../../../../../domain/fld/FldFile";

export function create128x128(): MapLayer {
    const points = [];

    for (let x = 0; x < 128; x++) {
        for (let y = 0; y < 128; y++) {
            points.push({ x: x, z: y, value: 20 });
        }
    }

    return { height: 128, width: 128, points };
}
