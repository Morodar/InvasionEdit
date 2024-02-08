import { HeaderUtils } from "../assets/HeaderUtils";

export class PckUtils extends HeaderUtils {
    constructor(dataView: DataView) {
        super(dataView);
    }

    static fromArrayBuffer(buffer: ArrayBuffer): PckUtils {
        const view = new DataView(buffer);
        return new PckUtils(view);
    }

    readPckFileName(fromIndex: number): string {
        return this.readString(fromIndex, 0x100);
    }

    canReadNextHeader = (offset: number) => this.view.byteLength > offset + 512;
    canReadNextHeaderOrThrow = (offset: number) => {
        if (!this.canReadNextHeader(offset)) {
            throw new Error("");
        }
    };
}
