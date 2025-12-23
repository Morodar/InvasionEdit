export type CgnHeader = {
    name: string;

    /** cgn */
    extension: 7235427;

    fileSize: number;
    pcName1: string;
    pcName2: string;

    x0B0: number;
    x0B4: number;
    /** x0B8 */
    cgnCount: number;
    x0BC: number;
};

export type CgnDefinition = {
    name: string;
    fromPlayers: string;
    toPlayers: string;
    mapTextIndex: number;
};

export const CGN_ENTRY_LENGTH = 0x180;

export type CgnEntry = {
    missionIndex: number;
    name: string;
};

export type CgnFile = {
    header: CgnHeader;
    campaign: CgnDefinition;
    levelEntries: CgnEntry[];
};
