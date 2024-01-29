import { MapLayer } from "../../../domain/MapLayer";

export function create128x128(): MapLayer {
    const points = [];

    for (let x = 0; x < 128; x++) {
        for (let y = 0; y < 128; y++) {
            const value = 256 - (x + (y % 256));
            points.push({ x: x, z: y, value: value });
        }
    }

    return { height: 128, width: 128, points };
}
