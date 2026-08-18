const idctMat = buildIdctMatrix();

/**
 * Builds flat 256x256 IDCT matrix, row-major (same formula as Python).
 */
function buildIdctMatrix(): Float32Array {
    const mat = new Float32Array(256 * 256);
    for (let row = 0; row < 256; row++) {
        for (let col = 0; col < 256; col++) {
            mat[row * 256 + col] = col === 0 ? 0x2d41 : 16384 * Math.cos((Math.PI / 256) * col * (0.5 + row));
        }
    }
    return mat;
}

/** Port of FUN_0041a430
 * - samData: Uint8Array that begins at ESI
 * - tempOut: Uint8Array (512 bytes) where the function writes 256 signed shorts (little-endian)
 * Returns: number of bytes consumed from samData (like EAX return so caller can advance ESI)
 */
function unpackBlock_FUN_0041a430(samData: DataView, tempOut: Uint8Array): number {
    if (tempOut.byteLength < 512) throw new Error("tempOut must be at least 512 bytes");

    const dv = samData;
    const outView = new DataView(tempOut.buffer, tempOut.byteOffset, tempOut.byteLength);

    let uVar4 = dv.getUint32(0, true);
    let uVar6 = 0x20;
    let puVar7 = 4; // byte offset into samData
    let local_1c = 0x100; // 256 shorts to output
    let outIndex = 0; // short index

    while (local_1c !== 0) {
        let value: number;
        if ((uVar4 & 1) === 0) {
            value = 0;
            uVar6 -= 1;
            uVar4 >>>= 1;
        } else if ((uVar4 & 2) === 0) {
            const uVar3 = uVar4 >>> 2;
            uVar4 >>>= 5;
            uVar6 -= 5;
            value = (uVar3 << 29) >> 29;
        } else if ((uVar4 & 4) === 0) {
            const uVar3 = uVar4 >>> 3;
            uVar4 >>>= 9;
            uVar6 -= 9;
            value = (uVar3 << 26) >> 26;
        } else {
            const uVar3 = uVar4 >>> 3;
            uVar4 >>>= 0xf;
            uVar6 -= 0xf;
            value = (uVar3 << 20) >> 20;
        }

        // refill logic (reads 4/2/1 bytes depending on uVar6)
        const bVar5 = uVar6 & 0x1f;
        if (uVar6 < 9) {
            // read 4 bytes
            if (puVar7 + 4 <= samData.byteLength) {
                const uVar3 = dv.getUint32(puVar7, true);
                puVar7 += 3;
                uVar6 += 0x18;
                uVar4 = (uVar4 | ((uVar3 << (bVar5 & 0x1f)) >>> 0)) >>> 0;
            } else {
                break;
            }
        } else if (uVar6 < 0x11) {
            // read 2 bytes
            if (puVar7 + 2 <= samData.byteLength) {
                const uVar2 = dv.getUint16(puVar7, true);
                puVar7 += 2;
                uVar6 += 0x10;
                uVar4 = (uVar4 | ((uVar2 << (bVar5 & 0x1f)) >>> 0)) >>> 0;
            } else {
                break;
            }
        } else if (uVar6 < 0x19) {
            // read 1 byte
            if (puVar7 + 1 <= samData.byteLength) {
                const bVar1 = dv.getUint8(puVar7);
                puVar7 += 1;
                uVar6 += 8;
                uVar4 = (uVar4 | ((bVar1 << (bVar5 & 0x1f)) >>> 0)) >>> 0;
            } else {
                break;
            }
        }

        // store value into tempOut as little-endian int16
        outView.setInt16(outIndex * 2, value, true);
        outIndex += 1;
        local_1c -= 1;
    }

    if (uVar6 === 0x20) {
        puVar7 -= 1;
    } else if (uVar6 < 0x18) {
        puVar7 += 1;
    }

    // consumed bytes relative to the start of samData is puVar7, unsure why but thandor cuts off last two bits
    const consumed = puVar7 & 0xfffffffc;
    return consumed;
}

function triggerShape(length: number, gate: number, trans: number, n: number): Float32Array {
    const result = new Float32Array(length * n);
    if (n < 2) return result;

    // Smoothstep curve for transitions
    const smv = new Float32Array(trans);
    for (let i = 0; i < trans; i++) {
        const x = (i + 1) / (trans + 1);
        smv[i] = 3 * x * x - 2 * x * x * x;
    }

    // Build one "first" shape: [zeros | smoothstep rise | ones]
    const first = new Float32Array(length);
    for (let i = 0; i < trans; i++) first[length - gate - trans + i] = smv[i];
    for (let i = length - gate; i < length; i++) first[i] = 1.0;

    // first block
    result.set(first, 0);

    // middle blocks: first + reverse(first)
    const middle = new Float32Array(length);
    for (let i = 0; i < length; i++) middle[i] = first[i] + first[length - 1 - i];
    for (let b = 1; b < n - 1; b++) result.set(middle, b * length);

    // last block: reverse(first)
    const last = new Float32Array(length);
    for (let i = 0; i < length; i++) last[i] = first[length - 1 - i];
    result.set(last, (n - 1) * length);

    return result;
}

/**
 * Top-level decoding function.
 * - fileBuf: ArrayBuffer from file.arrayBuffer()
 * - coeffsBuf: ArrayBuffer with DAT_00417334 table (Uint8Array)
 * - maxBlocks: optional limit (how many blocks to decode). If omitted, decode until input exhausted.
 *
 * Returns a Uint8Array containing concatenated PCM blocks (each block is 0x400 bytes).
 */
export function decodeFileAllBlocks(fileView: DataView, maxBlocks?: number): Uint8Array<ArrayBuffer> {
    const rawBlocks: Int16Array[] = [];
    let pos = 0;
    const tempOut = new Uint8Array(512);

    while (pos < fileView.byteLength) {
        if (maxBlocks !== undefined && rawBlocks.length >= maxBlocks) break;
        const sliceForUnpack = new DataView(fileView.buffer, fileView.byteOffset + pos);
        const consumed = unpackBlock_FUN_0041a430(sliceForUnpack, tempOut);
        if (consumed <= 0) break;
        rawBlocks.push(new Int16Array(tempOut.buffer.slice(tempOut.byteOffset, tempOut.byteOffset + 512)));
        pos += consumed;
    }

    const n = rawBlocks.length;
    if (n === 0) return new Uint8Array(0);

    // Direct IDCT blocks
    const directSamples: Float32Array[] = [];
    for (let i = 0; i < n; i++) {
        directSamples.push(idctBlock(idctMat, rawBlocks[i], +1));
    }

    // Inbetween blocks: 128 zeros + (n-1) blocks + 128 zeros = n*256 total
    const inbetweenSamples: Float32Array[] = [];
    inbetweenSamples.push(new Float32Array(128)); // Fix #2: 128 not 256

    for (let i = 0; i < n - 1; i++) {
        // Fix #3: n-1 not n
        const avgCoeffs = new Int16Array(256);
        for (let c = 0; c < 256; c++) {
            avgCoeffs[c] = (rawBlocks[i][c] + rawBlocks[i + 1][c]) / 2;
        }
        inbetweenSamples.push(idctBlock(idctMat, avgCoeffs, -1));
    }

    inbetweenSamples.push(new Float32Array(128)); // Fix #2: 128 not 256

    const trigger = triggerShape(256, 16, 16, n);

    const totalSamples = n * 256;
    const audio = new Float32Array(totalSamples);
    for (let i = 0; i < n; i++) {
        audio.set(directSamples[i], i * 256);
    }

    // inbetween total: 128 + (n-1)*256 + 128 = n*256 ✓
    const inbetween = new Float32Array(totalSamples);
    let ibOffset = 0;
    for (const seg of inbetweenSamples) {
        inbetween.set(seg, ibOffset);
        ibOffset += seg.length;
    }

    const result = new Uint8Array(totalSamples * 2 * 2);
    const resultView = new DataView(result.buffer);

    for (let i = 0; i < totalSamples; i++) {
        const t = trigger[i];
        const sample = audio[i] * (1 - t) + inbetween[i] * t;
        const clamped = Math.max(-32768, Math.min(32767, Math.round(sample)));
        resultView.setInt16(i * 4 + 0, clamped, true); // left
        resultView.setInt16(i * 4 + 2, clamped, true); // right
    }

    return result;
}

/**
 * Applies IDCT matrix to one block of 256 int16 coefficients.
 * sign: +1 for normal, -1 for phase-inverted (interpolated blocks)
 */
function idctBlock(mat: Float32Array, coeffs: Int16Array, sign: 1 | -1): Float32Array {
    const out = new Float32Array(256);
    for (let row = 0; row < 256; row++) {
        let acc = 0;
        for (let col = 0; col < 256; col++) {
            acc += mat[row * 256 + col] * coeffs[col];
        }
        out[row] = (sign * acc) / 1024;
    }
    return out;
}
