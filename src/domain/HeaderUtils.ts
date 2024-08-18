export class HeaderUtils {
    view: DataView;

    constructor(dataView: DataView) {
        this.view = dataView;
    }

    /** Thandor uses little endian only */
    getUint32 = (index: number) => this.view.getUint32(index, true);
    writeUint32 = (index: number, value: number) => this.view.setUint32(index, value, true);

    /** Thandor uses little endian only */
    getInt32 = (index: number) => this.view.getInt32(index, true);
    writeInt32 = (index: number, value: number) => this.view.setInt32(index, value, true);

    getUint8 = (index: number) => this.view.getUint8(index);
    writeUint8 = (index: number, value: number) => this.view.setUint8(index, value);

    readPcName(fromIndex: number): string {
        return this.readString(fromIndex, 0x40);
    }

    /** Thandor strings are 16-Bit LE encoded chars  */
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

    writeString(startPosition: number, text: string) {
        for (let index = 0; index < text.length; index++) {
            const writePosition = startPosition + index * 2;
            const char = text.charCodeAt(index);
            this.view.setUint16(writePosition, char, true);
        }
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
        return new Date(Date.UTC(year, month, dayOfMonth, hour, minute, second));
    }

    writeDateVariant1(toIndex: number, date: Date) {
        this.view.setUint8(toIndex++, date.getSeconds());
        this.view.setUint8(toIndex++, date.getMinutes());
        this.view.setUint8(toIndex++, date.getHours());
        toIndex++;
        this.view.setUint8(toIndex++, date.getDate());
        this.view.setUint8(toIndex++, date.getMonth() + 1); // JavaScript Months start at 0
        this.view.setUint16(toIndex++, date.getFullYear(), true);
    }
}
