export interface LevPlayerMeta {
    camX: number;
    camZ: number;
    camY: number; // game default 65536
    zoomLevel: number; // game default 4096
    camRotation: number;
    startXenit: number;
    startTritium: number;
    armyOffset: number;
}

export const ZOOM_LEVEL = 2048;

/** Offset to first LevPlayerMeta */
export const LEV_PLAYER_META_OFFSET = 0x200;

/** Size of LevPlayermeta */
export const LEV_PLAYER_META_SIZE = 0x20;

export function isLevPlayerMetaEmpty(meta: LevPlayerMeta): boolean {
    return (
        meta.camX == 0 &&
        meta.camY == 0 &&
        meta.camZ == 0 &&
        meta.zoomLevel == 0 &&
        meta.camRotation == 0 &&
        meta.startXenit == 0 &&
        meta.startTritium == 0 &&
        meta.armyOffset == 0
    );
}

export function createDefaultLevPlayerMeta(): LevPlayerMeta {
    return {
        camX: 0,
        camZ: 0,
        camY: 65536,
        zoomLevel: ZOOM_LEVEL,
        camRotation: 0,
        startXenit: 100_000,
        startTritium: 100_000,
        armyOffset: 0,
    };
}
