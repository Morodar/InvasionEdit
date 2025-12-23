import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import "vitest-canvas-mock";
import { toEqualDataView } from "./matchers/toEqualDataView";
import { toEqualBuffer } from "./matchers/toEqualBuffer";

class ResizeObserverMock implements ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}

beforeAll(() => {
    globalThis.ResizeObserver = ResizeObserverMock;

    vi.mock("react-i18next", () => ({
        // this mock makes sure any components using the translate hook can use it without a warning being shown
        // See https://react.i18next.com/misc/testing
        useTranslation: () => {
            return {
                t: (str: string) => str,
                i18n: { changeLanguage: () => Promise.resolve() },
            };
        },
        initReactI18next: { type: "3rdParty", init: vi.fn().mockImplementation(() => null) },
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
