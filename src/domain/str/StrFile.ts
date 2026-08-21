export interface StrLocaleBlock {
  countryCode: number;
  /** UTF-16 decoded strings, null terminator stripped */
  strings: string[];
}

export interface StrFile {
  blocks: StrLocaleBlock[];
}
