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
});

afterEach(() => {
    cleanup();
});

expect.extend({
    toEqualDataView,
    toEqualBuffer,
});
