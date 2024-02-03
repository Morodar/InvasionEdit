export class PckUtils {
    view: DataView;

    constructor(dataView: DataView) {
        this.view = dataView;
    }

    static fromArrayBuffer(buffer: ArrayBuffer): PckUtils {
        const view = new DataView(buffer);
        return new PckUtils(view);
    }

    readPcName(fromIndex: number): string {
        return this.readString(fromIndex, 0x40);
    }

    readPckFileName(fromIndex: number): string {
        return this.readString(fromIndex, 0x100);
    }

    readString(fromIndex: number, byteLength: number): string {
        let result = "";
        const toIndex = fromIndex + byteLength;

        for (let index = fromIndex; index < toIndex; index += 2) {
            const char = this.view.getUint16(index, true);
            result += String.fromCharCode(char);
        }
        const firstZero = result.indexOf("\0");
        return result.substring(0, firstZero);
    }

    readDateVariant1(fromIndex: number): Date {
        let index = fromIndex;
        const second = this.view.getUint8(index++);
        const minute = this.view.getUint8(index++);
        const hour = this.view.getUint8(index++);
        index++; // this byte is always empty
        const dayOfMonth = this.view.getUint8(index++);
        const month = this.view.getUint8(index++);
        const year = this.view.getUint16(index, true);
        return new Date(year, month, dayOfMonth, hour, minute, second);
    }

    getUint32 = (index: number) => this.view.getUint32(index, true);
    canReadNextHeader = (offset: number) => this.view.byteLength > offset + 512;
    canReadNextHeaderOrThrow = (offset: number) => {
        if (!this.canReadNextHeader(offset)) {
            throw new Error("");
        }
    };
}
