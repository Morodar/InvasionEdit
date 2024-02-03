import { MatcherResult } from "./MatcherResult";

export function toEqualBuffer(received: DataView, expected: Buffer): MatcherResult {
    if (received.byteLength !== expected.byteLength) {
        return {
            pass: false,
            message: () => `Expected length ${expected.byteLength} but received ${received.byteLength}`,
        };
    }

    for (let i = 0; i < received.byteLength; i++) {
        const r = received.getUint8(i);
        const e = expected[i];
        if (r !== e) {
            return {
                pass: false,
                message: () => `Expected byte[${i}] to be ${e} but received ${r}`,
            };
        }
    }

    return {
        pass: true,
        message: () => "File matches",
    };
}
