/**
 * Builds the IDCT coefficient table equivalent to the Python build_idct_mat(),
 * packed into the layout expected by synthAndWrite_FUN_00418560.
 *
 * Layout (all indices in int16 units):
 *   coeff16[t * 0x400 + k * 4 + r * 256 + j]
 *     = IDCT_mat[row = t*4 + r][col = k*4 + j]
 *
 * Total size: 256*256 int16s = 0x20000 bytes
 */
export function buildCoeffs(): Uint8Array {
    console.log("building Coeffs", Date.now());
    const TOTAL_INT16 = 256 * 256; // 65536 entries
    const buf = new ArrayBuffer(TOTAL_INT16 * 2);
    const coeff16 = new Int16Array(buf);

    const DC_VALUE = 0x2d41; // ≈ 16384/√2, standard DCT DC normalization

    for (let t = 0; t < 64; t++) {
        const base16 = t * 0x400;

        for (let r = 0; r < 4; r++) {
            const row = t * 4 + r; // output sample index (0..255)

            for (let k = 0; k < 64; k++) {
                for (let j = 0; j < 4; j++) {
                    const col = k * 4 + j; // input coefficient index (0..255)

                    let val: number;
                    if (col === 0) {
                        // DC component: matches mat[:, 0] = 0x2d41
                        val = DC_VALUE;
                    } else {
                        // AC component: 16384 * cos(π/256 * col * (0.5 + row))
                        val = Math.round(16384 * Math.cos((Math.PI / 256) * col * (0.5 + row)));
                    }

                    // Clamp to signed int16 range (values are ≤ 16384 so no clamp needed,
                    // but kept for safety)
                    coeff16[base16 + k * 4 + r * 256 + j] = Math.max(-32768, Math.min(32767, val));
                }
            }
        }
    }
    console.log("built Coeffs", Date.now());

    return new Uint8Array(buf);
}
