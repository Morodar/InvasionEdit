
/** Port of FUN_0041a430
 * - samData: Uint8Array that begins at ESI
 * - tempOut: Uint8Array (512 bytes) where the function writes 256 signed shorts (little-endian)
 * Returns: number of bytes consumed from samData (like EAX return so caller can advance ESI)
 */
function unpackBlock_FUN_0041a430(samData: Uint8Array, tempOut: Uint8Array): number {
  if (tempOut.byteLength < 512) throw new Error("tempOut must be at least 512 bytes");

  const dv = new DataView(samData.buffer, samData.byteOffset, samData.byteLength);
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
function packAndStore(
  acc0: number,
  acc1: number,
  acc2: number,
  acc3: number,
  out16: Int16Array,
  outBase: number
) {
  // Step 1–3: scale left << 5
  let v0 = acc0 << 5;
  let v1 = acc1 << 5;
  let v2 = acc2 << 5;
  let v3 = acc3 << 5;

  // Step 4–5: shift/mask to carve out 16-bit pieces
  // Equivalent to the MMX masks you posted
  const m0 = (v0 >>> 16) & 0xffff;
  const m1 = (v1 & 0xffff0000);
  const m2 = (v2 >>> 16) & 0xffff;
  const m3 = (v3 & 0xffff0000);

  // Combine: 32-bit low = m0 | m1, 32-bit high = m2 | m3
  let packed0 = (m0 | m1) & 0xffffffff;
  let packed1 = (m2 | m3) & 0xffffffff;

  // Extract the four 16-bit signed words
  const s0 = (packed0 & 0xffff) << 16 >> 16;
  const s1 = (packed0 >>> 16) << 16 >> 16;
  const s2 = (packed1 & 0xffff) << 16 >> 16;
  const s3 = (packed1 >>> 16) << 16 >> 16;

  // Step 7: PADDSW doubling with saturation
  function sat16(x: number): number {
    if (x > 32767) return 32767;
    if (x < -32768) return -32768;
    return x;
  }
  const d0 = sat16(s0 * 2);
  const d1 = sat16(s1 * 2);
  const d2 = sat16(s2 * 2);
  const d3 = sat16(s3 * 2);

  // Step 8: PUNPCKL + MOVQ → each sample duplicated for stereo.
  out16[outBase + 0] = d0;
  out16[outBase + 1] = d0;
  out16[outBase + 2] = d1;
  out16[outBase + 3] = d1;
  out16[outBase + 4] = d2;
  out16[outBase + 5] = d2;
  out16[outBase + 6] = d3;
  out16[outBase + 7] = d3;
}


/**
 * Port of FUN_00418560
 *
 * - coeffs: Uint8Array of coefficient table (expected layout like DAT_00417334)
 * - tempIn: Uint8Array of 512 bytes produced by unpackBlock_FUN_0041a430 (256 int16 values)
 *
 * returns Uint8Array of length 0x400 containing little-endian signed 16-bit PCM
 */
function synthAndWrite_FUN_00418560(
  coeffs: Uint8Array,
  tempIn: Uint8Array
): Uint8Array {
  const COEFFS_MIN_BYTES = 0x20000; //For now not clear what the coeffs "are"
  if (coeffs.byteLength < COEFFS_MIN_BYTES) {
    throw new Error(`coeffs buffer too small; expect >= 0x20000 bytes`);
  }
  if (tempIn.byteLength < 512) {
    throw new Error("tempIn must be at least 512 bytes");
  }

  const temp16 = new Int16Array(tempIn.buffer, tempIn.byteOffset, 256);
  const coeff16 = new Int16Array(coeffs.buffer, coeffs.byteOffset, Math.floor(coeffs.byteLength / 2));

  const outBytes = new Uint8Array(0x400);
  const out16 = new Int16Array(outBytes.buffer);

  // Compute four accumulators and write 8 samples
  for (let tile = 0; tile < 64; tile++) {
    // base index in 16-bit units (same mapping as DAT_00417334 + puVar1 + 0x100 increment)
    const base16 = tile * 0x400; // 0x400 16-bit words per tile
    let acc0 = 0 | 0;
    let acc1 = 0 | 0;
    let acc2 = 0 | 0;
    let acc3 = 0 | 0;

    // iterate the 64 param vectors (k = 0..63), each vector is 4 int16s in temp16
    for (let k = 0; k < 64; k++) {
      const vOff = k * 4;
      const v0 = temp16[vOff + 0] | 0;
      const v1 = temp16[vOff + 1] | 0;
      const v2 = temp16[vOff + 2] | 0;
      const v3 = temp16[vOff + 3] | 0;

      // coefficient entry offsets (16-bit units)
      const c0 = base16 + k * 4;
      const c1 = c0 + 256; // (k+64)*4
      const c2 = c0 + 512; // (k+128)*4
      const c3 = c0 + 768; // (k+192)*4

      // read 4 coeffs for each column (we assume coeff table is big enough)
      const c0_0 = coeff16[c0 + 0] | 0;
      const c0_1 = coeff16[c0 + 1] | 0;
      const c0_2 = coeff16[c0 + 2] | 0;
      const c0_3 = coeff16[c0 + 3] | 0;

      const c1_0 = coeff16[c1 + 0] | 0;
      const c1_1 = coeff16[c1 + 1] | 0;
      const c1_2 = coeff16[c1 + 2] | 0;
      const c1_3 = coeff16[c1 + 3] | 0;

      const c2_0 = coeff16[c2 + 0] | 0;
      const c2_1 = coeff16[c2 + 1] | 0;
      const c2_2 = coeff16[c2 + 2] | 0;
      const c2_3 = coeff16[c2 + 3] | 0;

      const c3_0 = coeff16[c3 + 0] | 0;
      const c3_1 = coeff16[c3 + 1] | 0;
      const c3_2 = coeff16[c3 + 2] | 0;
      const c3_3 = coeff16[c3 + 3] | 0;

      // pmaddwd-like accumulation (4 products per column)
      acc0 += v0 * c0_0 + v1 * c0_1 + v2 * c0_2 + v3 * c0_3;
      acc1 += v0 * c1_0 + v1 * c1_1 + v2 * c1_2 + v3 * c1_3;
      acc2 += v0 * c2_0 + v1 * c2_1 + v2 * c2_2 + v3 * c2_3;
      acc3 += v0 * c3_0 + v1 * c3_1 + v2 * c3_2 + v3 * c3_3;
    }
    packAndStore(acc0, acc1, acc2, acc3, out16, tile * 8);

  }

  return outBytes;
}

/**
 * Top-level decoding function.
 * - fileBuf: ArrayBuffer from file.arrayBuffer()
 * - coeffsBuf: ArrayBuffer with DAT_00417334 table (Uint8Array)
 * - maxBlocks: optional limit (how many blocks to decode). If omitted, decode until input exhausted.
 *
 * Returns a Uint8Array containing concatenated PCM blocks (each block is 0x400 bytes).
 */
export function decodeFileAllBlocks(
  fileBuf: ArrayBuffer,
  coeffsBuf: ArrayBuffer,
  maxBlocks?: number
): Uint8Array {
  const input = new Uint8Array(fileBuf);
  const coeffs = new Uint8Array(coeffsBuf);

  // Collect output blocks into an array and then concat
  const outBlocks: Uint8Array[] = [];

  let pos = 0;
  let blocksDecoded = 0;
  const tempOut = new Uint8Array(512);

  while (pos < input.byteLength) {
    if (maxBlocks !== undefined && blocksDecoded >= maxBlocks) break;

    // call unpacker: it writes 512 bytes to tempOut and returns consumed bytes
    const sliceForUnpack = input.subarray(pos);
    const consumed = unpackBlock_FUN_0041a430(sliceForUnpack, tempOut);
    if (consumed <= 0) break; // something is wrong???

    // call synth+write -> produces 0x400 bytes PCM
    const pcmBlock = synthAndWrite_FUN_00418560(coeffs, tempOut);
    outBlocks.push(pcmBlock);

    // advance ESI by consumed bytes, advance EDI by 0x400
    pos += consumed;
    blocksDecoded += 1;
  }

  // concat all output blocks
  const totalBytes = outBlocks.reduce((s, b) => s + b.byteLength, 0);
  const result = new Uint8Array(totalBytes);
  let off = 0;
  for (const b of outBlocks) {
    result.set(b, off);
    off += b.byteLength;
  }
  return result;
}
