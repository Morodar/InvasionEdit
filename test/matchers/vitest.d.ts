/* eslint-disable @typescript-eslint/no-explicit-any */
import "vitest";

interface CustomMatchers<R = unknown> {
    toEqualDataView(expected: DataView): R;
    toEqualBuffer(expected: Buffer): R;
}

declare module "vitest" {
    interface Assertion<T = any> extends CustomMatchers<T> {
        toEqualBuffer(expected: Buffer): R;
    }

    interface AsymmetricMatchersContaining extends CustomMatchers {
        toEqualBuffer(expected: Buffer): R;
    }
}
