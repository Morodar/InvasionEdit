export interface StrLocaleBlock {
    countryCode: number;
    reserved: number;
    strings: string[];
}

export interface StrFile {
    localeCount: number;
    blocks: StrLocaleBlock[];
}
