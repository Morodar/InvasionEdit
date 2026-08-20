import { describe, it, expect } from "vitest";
import { StrUtils, getString, getCountryCodes, getStringCount } from "../../../src/domain/str/StrUtils";

const STR_MAGIC = 0x00727473; // fourcc("str")

const buildMinimalStr = (): ArrayBuffer => {
    const buffer = new ArrayBuffer(0x220);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    view.setUint32(0, STR_MAGIC, true);
    view.setUint32(4, 0x220, true);
    view.setUint32(0xb0, 1, true);

    const b = 0x200;
    view.setUint32(b + 0x00, 0x20, true);
    view.setUint32(b + 0x04, 1, true);
    view.setUint32(b + 0x08, 44, true);
    view.setUint32(b + 0x0c, 0, true);
    view.setUint32(b + 0x10, 0x14, true);

    const hello = [0x48, 0x00, 0x65, 0x00, 0x6c, 0x00, 0x6c, 0x00, 0x6f, 0x00, 0x00, 0x00];
    for (let i = 0; i < hello.length; i++) bytes[b + 0x14 + i] = hello[i];

    return buffer;
};

const buildMultiLocaleStr = (): ArrayBuffer => {
    const buffer = new ArrayBuffer(0x240);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    view.setUint32(0, STR_MAGIC, true);
    view.setUint32(4, 0x240, true);
    view.setUint32(0xb0, 2, true);

    let b = 0x200;
    view.setUint32(b + 0x00, 0x20, true);
    view.setUint32(b + 0x04, 1, true);
    view.setUint32(b + 0x08, 44, true);
    view.setUint32(b + 0x0c, 0, true);
    view.setUint32(b + 0x10, 0x14, true);
    const strA = [0x41, 0x00, 0x00, 0x00, 0x00, 0x00];
    for (let i = 0; i < strA.length; i++) bytes[b + 0x14 + i] = strA[i];

    b = 0x220;
    view.setUint32(b + 0x00, 0x20, true);
    view.setUint32(b + 0x04, 1, true);
    view.setUint32(b + 0x08, 49, true);
    view.setUint32(b + 0x0c, 0, true);
    view.setUint32(b + 0x10, 0x14, true);
    const strB = [0x42, 0x00, 0x00, 0x00, 0x00, 0x00];
    for (let i = 0; i < strB.length; i++) bytes[b + 0x14 + i] = strB[i];

    return buffer;
};

describe("StrUtils", () => {
    describe("parseStrFile", () => {
        it("parses a minimal single-locale STR file", () => {
            const result = StrUtils.fromArrayBuffer(buildMinimalStr()).parseStrFile();

            expect(result.localeCount).toBe(1);
            expect(result.blocks).toHaveLength(1);
            expect(result.blocks[0].countryCode).toBe(44);
            expect(result.blocks[0].strings).toHaveLength(1);
            expect(result.blocks[0].strings[0]).toBe("Hello");
        });

        it("parses a multi-locale STR file", () => {
            const result = StrUtils.fromArrayBuffer(buildMultiLocaleStr()).parseStrFile();

            expect(result.localeCount).toBe(2);
            expect(result.blocks).toHaveLength(2);
            expect(result.blocks[0].countryCode).toBe(44);
            expect(result.blocks[0].strings[0]).toBe("A");
            expect(result.blocks[1].countryCode).toBe(49);
            expect(result.blocks[1].strings[0]).toBe("B");
        });

        it("rejects files smaller than header", () => {
            const bytes = new ArrayBuffer(10);
            expect(() => StrUtils.fromArrayBuffer(bytes).parseStrFile()).toThrow("too small");
        });

        it("rejects invalid magic", () => {
            const bytes = new ArrayBuffer(0x200);
            const view = new DataView(bytes);
            view.setUint32(0, 0xdeadbeef, true);
            view.setUint32(4, 0x200, true);
            expect(() => StrUtils.fromArrayBuffer(bytes).parseStrFile()).toThrow("Invalid STR magic");
        });

        it("rejects allocation size mismatch", () => {
            const bytes = new ArrayBuffer(0x200);
            const view = new DataView(bytes);
            view.setUint32(0, STR_MAGIC, true);
            view.setUint32(4, 0x100, true);
            expect(() => StrUtils.fromArrayBuffer(bytes).parseStrFile()).toThrow("allocation size mismatch");
        });
    });

    describe("getString", () => {
        it("returns the correct string by index", () => {
            const str = StrUtils.fromArrayBuffer(buildMinimalStr()).parseStrFile();
            expect(getString(str, 0)).toBe("Hello");
        });

        it("throws for out-of-bounds index", () => {
            const str = StrUtils.fromArrayBuffer(buildMinimalStr()).parseStrFile();
            expect(() => getString(str, 99)).toThrow("exceeds");
        });

        it("falls back to English when preferred locale not found", () => {
            const str = StrUtils.fromArrayBuffer(buildMultiLocaleStr()).parseStrFile();
            expect(getString(str, 0, 999)).toBe("A");
        });
    });

    describe("getCountryCodes", () => {
        it("returns all country codes", () => {
            const str = StrUtils.fromArrayBuffer(buildMultiLocaleStr()).parseStrFile();
            expect(getCountryCodes(str)).toEqual([44, 49]);
        });
    });

    describe("getStringCount", () => {
        it("returns count for a specific locale", () => {
            const str = StrUtils.fromArrayBuffer(buildMultiLocaleStr()).parseStrFile();
            expect(getStringCount(str, 44)).toBe(1);
            expect(getStringCount(str, 49)).toBe(1);
        });

        it("defaults to English (44)", () => {
            const str = StrUtils.fromArrayBuffer(buildMultiLocaleStr()).parseStrFile();
            expect(getStringCount(str)).toBe(1);
        });
    });
});
