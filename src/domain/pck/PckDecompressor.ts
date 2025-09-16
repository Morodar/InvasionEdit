const MAX_UINT = 4294967295;
const MAX_INT = 2147483647;
export class PckDecompressor {
    static decompressFile(compressed: DataView, decompressedSize: number, dataFormat: number): ArrayBuffer {
        switch (dataFormat) {
            case 0:
                // Content is compressed
                return this.decompressFile0(compressed, decompressedSize);
            case 1:
                // Content is not compressed, copy bytes
                return this.decompressFile1(compressed, decompressedSize);
            case 2: {
                // Content is compressed and needs additional modification
                const unpacked = this.decompressFile0(compressed, decompressedSize);
                return this.decompressFile2(new DataView(unpacked));
            }
        }
        throw new Error("Unknown data format");
    }

    static decompressFile0(compressed: DataView, decompressedSize: number): ArrayBuffer {
        const buffer = new ArrayBuffer(decompressedSize);
        const byteOut = new DataView(buffer);

        const bufferTab = new ArrayBuffer(16 + 0x100 * 4 + 0x400 * 4 + 0x400 * 4);
        const tab = new DataView(bufferTab);
        const pTab1 = 16;
        const pTab2 = 16 + 0x100 * 4;
        const pTab3 = 16 + 0x100 * 4 + 0x400 * 4;
        let a = 0;
        let pB = pTab2;
        let d = 0;
        let pT = pTab3;
        let pP = 0;
        let c = 0;
        const pByteOut = 0;
        let pByteO = 0;
        const pByteInl = compressed.byteLength;
        const pByteOutL = pByteOut + decompressedSize;
        let pByteCompressedContent = 0;

        if (compressed.byteLength < 0x100) {
            return buffer;
        }

        // copy first 256 bytes
        for (let i = 0; i < 0x100; i++) {
            const tmp = compressed.getUint8(i);
            tab.setUint8(pTab1 + i * 4, tmp);
            tab.setUint8(pTab2 + i * 16, tmp);
        }

        for (pP = pTab3; pP < pTab3 + 0x400 * 4; pP += 16) {
            a = MAX_UINT;
            d = MAX_UINT;

            let pS = pTab2;
            for (let i = 0; i < 0x200; i++) {
                const psValue = tab.getUint32(pS, true);
                if (psValue !== 0) {
                    if (a <= psValue) {
                        if (d > psValue) {
                            d = psValue;
                            pT = pS;
                        }
                    } else {
                        if (d > a) {
                            d = a;
                            pT = pB;
                        }
                        a = psValue;
                        pB = pS;
                    }
                }
                pS += 16;
            }

            // ((int)d < 0)
            // check if d is negative...
            // but we don't have int here, so we use MAX_INT to check if "d is negative")
            if (d > MAX_INT) {
                c = 0;
                pByteCompressedContent += 0x100;

                // eslint-disable-next-line no-constant-condition
                while (1 === 1) {
                    pB = pP - 16;
                    try {
                        a = compressed.getUint32(pByteCompressedContent, true) >>> c;
                    } catch {
                        console.log(pByteCompressedContent);
                    }
                    c++;
                    if ((a & 1) !== 0) {
                        a >>>= 1;
                        d = a;
                        a >>>= 4;
                        c += 4;
                        do {
                            if ((a & 1) !== 0) {
                                pB = tab.getUint32(pB + 8, true);
                            } else {
                                pB = tab.getUint32(pB + 4, true);
                            }
                            a >>>= 1;
                            c++;
                        } while (tab.getUint32(pB + 4, true) !== 0);

                        while (c >= 8) {
                            pByteCompressedContent++;
                            if (pByteCompressedContent >= pByteInl) {
                                return buffer;
                            }
                            c -= 8;
                        }
                        for (a = (d & 0xf) + 3; a !== 0; a--) {
                            if (pByteO >= pByteOutL) {
                                return buffer;
                            }
                            const tmp = (pB - pTab2) >>> 4;
                            byteOut.setUint8(pByteO, tmp);
                            pByteO++;
                        }
                    } else {
                        a >>>= 1;
                        do {
                            if ((a & 1) !== 0) {
                                pB = tab.getUint32(pB + 8, true);
                            } else {
                                pB = tab.getUint32(pB + 4, true);
                            }
                            a >>>= 1;
                            c++;
                        } while (tab.getUint32(pB + 4, true) !== 0);

                        if (pByteO >= pByteOutL) {
                            return buffer;
                        }

                        const tmp = (pB - pTab2) >>> 4;
                        byteOut.setUint8(pByteO, tmp);
                        pByteO++;

                        while (c >= 8) {
                            pByteCompressedContent++;
                            if (pByteCompressedContent >= pByteInl) {
                                return buffer;
                            }
                            c -= 8;
                        }
                    }
                }
            }
            tab.setUint32(pP, a + d, true);

            tab.setUint32(pP + 4, pB, true);
            tab.setUint32(pP + 8, pT, true);

            tab.setUint32(pB + 12, pP, true);
            tab.setUint32(pT + 12, pP, true);

            tab.setUint32(pB, 0, true);
            tab.setUint32(pT, 0, true);
        }

        return buffer;
    }

    static decompressFile1(compressed: DataView, decompressedSize: number): ArrayBuffer {
        // Content is not compressed, copy bytes
        const buffer = new ArrayBuffer(decompressedSize);
        const result = new DataView(buffer);
        for (let i = 0; i < compressed.byteLength; i++) {
            const c = compressed.getUint8(i);
            result.setUint8(i, c);
        }
        return buffer;
    }

    static decompressFile2(unpacked: DataView): ArrayBuffer {
        const fldFileSize = unpacked.getUint32(0x04, true);

        // Calculate map size
        const width = unpacked.getUint32(0xb8, true);
        const height = unpacked.getUint32(0xbc, true);
        const mapsize = width * height;

        const buffer = new ArrayBuffer(fldFileSize);
        const dest = new DataView(buffer);

        // Copy header
        for (let i = 0; i < 512; i++) {
            const c = unpacked.getUint8(i);
            dest.setUint8(i, c);
        }

        PckDecompressor.addCoordinateSystem(height, width, dest);
        PckDecompressor.copyMapData(mapsize, dest, unpacked);

        return buffer;
    }

    static copyMapData(mapsize: number, dest: DataView, unpacked: DataView) {
        let pUnpacked = 512; // start after header
        let pDest = 512;
        for (let i = mapsize; i > 0; i--) {
            dest.setUint32(pDest + 18 * 4, unpacked.getUint32(pUnpacked + 1 * 4, true), true);
            dest.setUint32(pDest + 19 * 4, unpacked.getUint32(pUnpacked + 2 * 4, true), true);
            dest.setUint32(pDest + 20 * 4, unpacked.getUint32(pUnpacked + 3 * 4, true), true);
            dest.setUint32(pDest + 21 * 4, unpacked.getUint32(pUnpacked + 0 * 4, true), true);
            pUnpacked += 4 * 4;
            pDest += 32 * 4;
        }
    }

    static addCoordinateSystem(height: number, width: number, dest: DataView) {
        let pDest = 512;
        let z1 = 0;
        let z2 = 0;
        let x = 0;

        for (let iHeight = height; iHeight > 0; iHeight--) {
            for (let iWidth = width; iWidth > 0; iWidth--) {
                dest.setUint32(pDest + 16 * 4, z2, true);
                dest.setUint32(pDest + 17 * 4, x, true);
                z2 += 2305;
                pDest += 0x20 * 4;
            }
            z2 = z1 + 1152; //2305 divided by 2 is almost 1152 --> rotate map by 45°?
            z1 = z2;
            x = PckDecompressor.subtractUnsignedInt32(x, 1999);
        }
    }

    static subtractUnsignedInt32(a: number, b: number): number {
        // Ensure a and b are non-negative
        a = a >>> 0;
        b = b >>> 0;

        // Perform the subtraction
        let result = a - b;

        // If result is negative, add 2^32 (maximum unsigned 32-bit integer) to get the overflow behavior
        if (result < 0) {
            result = (result + 0x100000000) >>> 0;
        }
        return result;
    }
}
