/* eslint-disable @typescript-eslint/no-explicit-any */
import "vitest";

interface CustomMatchers<R = unknown> {
    toEqualDataView(expected: DataView): R;
    toEqualBuffer(expected: Buffer): R;
}

declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Assertion<T = any> extends CustomMatchers<T> {}
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}
