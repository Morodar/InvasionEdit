import { HeaderUtils } from "../assets/HeaderUtils";

export class FldUtils extends HeaderUtils {
    constructor(dataView: DataView) {
        super(dataView);
    }

    readDevSaveLocation = () => this.readString(0x100, 0x50);
    readWidth = () => this.getUint32(0x0b8);
    readHeight = () => this.getUint32(0x0bc);
    readUnknown0xB0 = () => this.getUint32(0xb0);
    readUnknown0xB4 = () => this.getUint32(0x0b4);
}
