import { MatcherResult } from "./MatcherResult";

export function toEqualDataView(received: DataView, expected: DataView): MatcherResult {
    if (received.byteLength !== expected.byteLength) {
        return {
            pass: false,
            message: () => `Expected length ${expected.byteLength} but received ${received.byteLength}`,
        };
    }

    for (let i = 0; i < received.byteLength; i++) {
        const r = received.getUint8(i);
        const e = expected.getUint8(i);
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
