// decodeFLMvideo TypeScript port
// - height, width in pixels (must be multiples of 4 for this routine; function uses >>2)
// - outBuffer: Uint32Array large enough to hold height*width pixels (row-major)
// - flmData: Uint8Array containing the encoded FLM stream starting at offset 0
// - lookupTable: Uint8Array view of DAT_00486d90
//
// Returns: number of bytes consumed from flmData (aligned down to multiple of 8)
export function decodeFLMvideo(
    height: number,
    width: number,
    outBuffer: Uint32Array,
    flmData: Uint8Array,
    lookupTable: Uint8Array,
    offset: number = 0,
): number {
    // Validate sizes
    if ((height & 3) !== 0 || (width & 3) !== 0) {
        throw new Error("height and width must be multiples of 4.");
    }

    // DataViews for reading little-endian words
    const dataView = new DataView(flmData.buffer, flmData.byteOffset + offset, flmData.byteLength - offset);
    const tblView = new DataView(lookupTable.buffer, lookupTable.byteOffset, lookupTable.byteLength);

    // helpers to read u32/ i32 little-endian at a byte offset `bOff`
    function readU32(bOff: number): number {
        // If out-of-bounds, return 0
        if (bOff < 0 || bOff + 4 > dataView.byteLength) return 0;
        return dataView.getUint32(bOff, true);
    }
    function readI32(bOff: number): number {
        if (bOff < 0 || bOff + 4 > dataView.byteLength) return 0;
        return dataView.getInt32(bOff, true);
    }
    // read 4-byte table entry from lookupTable at byte offset off
    function readTblU32(off: number): number {
        if (off < 0 || off + 4 > tblView.byteLength) return 0;
        return tblView.getUint32(off, true);
    }

    // local variables
    let local_24 = height >>> 2; // number of 4-pixel-high tile rows
    let local_1c = 0; // runlength counter / repeat counter
    let puVar8_byte = 0; // pointer into flmData (byte offset). corresponds to puVar8 pointer in C
    let local_28 = width >>> 2; // number of 4-pixel-wide tiles per row

    // outBuffer is a Uint32Array of pixels row-major
    // We'll access out buffer via an index variable (pixel count)
    // We'll write 4x4 blocks: writing rows of width stride
    let outIndex = 0; // index into outBuffer (pixel index). The original expects OutBuffer initial pointer set by caller.

    // Outer loop: for each 4-pixel-high band
    while (local_24 !== 0) {
        // inner across width tiles
        local_28 = width >>> 2;
        while (local_28 !== 0) {
            // Read next control word uVar1 (32-bit)
            const uVar1 = readU32(puVar8_byte);

            if (local_1c === 0) {
                const uVar6 = uVar1 & 0x1f; // low 5 bits used to decide action
                const uVar2 = readI32(puVar8_byte + 4); // puVar8[1] read as signed (int) in some tests

                if (uVar6 < 0x19) {
                    // Common case: expand a 4x4 pixel block using lookup table
                    // Compute iVar7 = ((uVar2 & 0x7fe00000) >> 0x10 | (uVar1 & 0x1f)) * 4  (byte offset)
                    // Note: (uVar2 & 0x7fe00000) >>> 0x10 equals ((uVar2 & 0x7fe00000) >>> 16)
                    const partFromU2 = ((uVar2 >>> 0) & 0x7fe00000) >>> 16; // zero-extend then shift
                    const iVar7 = ((partFromU2 | (uVar1 & 0x1f)) >>> 0) * 4; // byte offset into table base

                    // The decomp uses different per-entry strides depending on sign(uVar2):
                    // if sign(uVar2) < 0 (high bit set) it uses multiplier 8 for the per-subindex,
                    // otherwise multiplier 4. We'll follow that exactly:
                    const negativeU2 = uVar2 < 0;

                    // helper reading from lookup table with either stride 8 or 4 for the small index part
                    function tblLookup(u1_shifted_masked: number): number {
                        // masked index is always &7 per repeated patterns; multiply by (stride) and add iVar7
                        const idx7 = u1_shifted_masked & 7;
                        const stride = negativeU2 ? 8 : 4; // byte stride used in C depending on sign(uVar2)
                        const tblOff = iVar7 + idx7 * stride;
                        return readTblU32(tblOff);
                    }

                    // Take the Lookup for every 3 bits in uVar1 (eax in assembly)
                    // Combine uVar1 and uVar2 into a single BigInt for easier shifting
                    let bigUvar1 = BigInt(uVar1);
                    const test = BigInt(uVar2) << 32n;
                    bigUvar1 = (test + bigUvar1) >> 5n; // shift down to skip low 5 bits already used

                    for (let i = 0; i < 4; i++) {
                        //set each of the 4 rows of the 4x4 block
                        const rowBase = outIndex + width * i;
                        for (let i = 0; i < 4; i++) {
                            // set each pixel in the row
                            outBuffer[rowBase + i] = tblLookup(Number(bigUvar1 & 7n)); //do a lookup per 3 bits
                            bigUvar1 = bigUvar1 >> 3n;
                        }
                    }
                    // advance puVar8 by 8 bytes (puVar8 = puVar8 + 2 in terms of uint*)
                    puVar8_byte += 8;
                } else if ((uVar1 & 0x1f) === 0x19) {
                    // special short-run: increment pointer by 1 byte and set local_1c
                    puVar8_byte += 1;
                    local_1c = (uVar1 & 0xff) >>> 5;
                } else if ((uVar1 & 0x1f) < 0x1b) {
                    // another short-run type: advance pointer by 2 bytes and set local_1c
                    puVar8_byte += 2;
                    local_1c = ((uVar1 & 0xffff) >>> 5) + 8;
                } else {
                    // large-run type: advance by 4 bytes (puVar8 +1 as uint*), set local_1c = (uVar1 >>5) + 0x808
                    puVar8_byte += 4;
                    local_1c = (uVar1 >>> 5) + 0x808;
                }
            } else {
                // local_1c > 0 => just copy previous block (decrement run-length)
                local_1c = local_1c - 1;
            }

            // Advance output pointer horizontally by 4 pixels (we already wrote the 4x4 block)
            outIndex += 4;
            local_28 = local_28 - 1;
        } // end inner width loop

        // After finishing a row of tiles, move output down by 3 rows (since inner loop wrote 4 rows already),
        // so effectively move to the start of next 4-pixel-high band:
        outIndex = outIndex + width * 3;
        local_24 = local_24 - 1;
        // reset local_28 for the next row block (done at loop top)
    } // end outer height loop

    // Compute return like original:
    // return ( (int)puVar8 + (7 - (int)FLMDataStart) ) & ~7
    // our FLMDataStart start pointer is 0 so this becomes (puVar8_byte + 7) & ~7
    const consumedAligned = (puVar8_byte + 7) & ~7;
    //doesn't seem correct, seems to get 8 too many first time. Doesn't work for second frame at all.

    return consumedAligned;
}
