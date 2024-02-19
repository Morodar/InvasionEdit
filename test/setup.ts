import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import "vitest-canvas-mock";
import { toEqualDataView } from "./matchers/toEqualDataView";
import { toEqualBuffer } from "./matchers/toEqualBuffer";

beforeAll(() => {
    window.ResizeObserver = vi.fn(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    }));
    vi.mock("react-i18next", () => ({
        // this mock makes sure any components using the translate hook can use it without a warning being shown
        useTranslation: () => {
            return {
                t: (str: string) => str,
                i18n: { changeLanguage: () => Promise.resolve() },
            };
        },
        initReactI18next: { type: "3rdParty", init: vi.fn() },
    }));
    vi.spyOn(console, "debug").mockReturnValue();
});

afterEach(() => {
    cleanup();
});

expect.extend({
    toEqualDataView,
    toEqualBuffer,
});
