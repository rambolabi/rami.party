// dither.js — grayscale → tone-preserving output (pure JS)
// Input: Float32/number[] grayscale 0..255, width, height.
// Output: Uint8ClampedArray 0..255 (mono methods emit 0 or 255).

const KERNELS = {
    'floyd-steinberg': {
        div: 16,
        cells: [[1, 0, 7], [-1, 1, 3], [0, 1, 5], [1, 1, 1]],
    },
    jarvis: {
        div: 48,
        cells: [[1, 0, 7], [2, 0, 5],
        [-2, 1, 3], [-1, 1, 5], [0, 1, 7], [1, 1, 5], [2, 1, 3],
        [-2, 2, 1], [-1, 2, 3], [0, 2, 5], [1, 2, 3], [2, 2, 1]],
    },
    stucki: {
        div: 42,
        cells: [[1, 0, 8], [2, 0, 4],
        [-2, 1, 2], [-1, 1, 4], [0, 1, 8], [1, 1, 4], [2, 1, 2],
        [-2, 2, 1], [-1, 2, 2], [0, 2, 4], [1, 2, 2], [2, 2, 1]],
    },
    atkinson: {
        div: 8,
        cells: [[1, 0, 1], [2, 0, 1], [-1, 1, 1], [0, 1, 1], [1, 1, 1], [0, 2, 1]],
    },
    sierra: {
        div: 32,
        cells: [[1, 0, 5], [2, 0, 3],
        [-2, 1, 2], [-1, 1, 4], [0, 1, 5], [1, 1, 4], [2, 1, 2],
        [-1, 2, 2], [0, 2, 3], [1, 2, 2]],
    },
    burkes: {
        div: 32,
        cells: [[1, 0, 8], [2, 0, 4],
        [-2, 1, 2], [-1, 1, 4], [0, 1, 8], [1, 1, 4], [2, 1, 2]],
    },
};

const BAYER = {
    'bayer-2': [[0, 2], [3, 1]],
    'bayer-4': [
        [0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5],
    ],
    'bayer-8': [
        [0, 32, 8, 40, 2, 34, 10, 42], [48, 16, 56, 24, 50, 18, 58, 26],
        [12, 44, 4, 36, 14, 46, 6, 38], [60, 28, 52, 20, 62, 30, 54, 22],
        [3, 35, 11, 43, 1, 33, 9, 41], [51, 19, 59, 27, 49, 17, 57, 25],
        [15, 47, 7, 39, 13, 45, 5, 37], [63, 31, 55, 23, 61, 29, 53, 21],
    ],
};

export const DITHER_METHODS = [
    ['none', 'None (grayscale)'],
    ['threshold', 'Threshold (1-bit)'],
    ['floyd-steinberg', 'Floyd–Steinberg'],
    ['jarvis', 'Jarvis-Judice-Ninke'],
    ['stucki', 'Stucki'],
    ['atkinson', 'Atkinson'],
    ['sierra', 'Sierra'],
    ['burkes', 'Burkes'],
    ['bayer-2', 'Ordered 2×2'],
    ['bayer-4', 'Ordered 4×4'],
    ['bayer-8', 'Ordered 8×8'],
    ['halftone', 'Halftone (dots)'],
];

function errorDiffuse(gray, w, h, kernel, cutoff) {
    const buf = Float32Array.from(gray);
    const out = new Uint8ClampedArray(w * h);
    for (let y = 0; y < h; y++) {
        const ltr = (y & 1) === 0; // serpentine for smoother result
        for (let i = 0; i < w; i++) {
            const x = ltr ? i : w - 1 - i;
            const idx = y * w + x;
            const old = buf[idx];
            const nv = old < cutoff ? 0 : 255;
            out[idx] = nv;
            const err = old - nv;
            for (const [dx, dy, wt] of kernel.cells) {
                const sx = x + (ltr ? dx : -dx);
                const sy = y + dy;
                if (sx < 0 || sx >= w || sy < 0 || sy >= h) continue;
                buf[sy * w + sx] += (err * wt) / kernel.div;
            }
        }
    }
    return out;
}

function ordered(gray, w, h, matrix) {
    const n = matrix.length;
    const denom = n * n;
    const out = new Uint8ClampedArray(w * h);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const t = ((matrix[y % n][x % n] + 0.5) / denom) * 255;
            out[y * w + x] = gray[y * w + x] < t ? 0 : 255;
        }
    }
    return out;
}

// Clustered-dot "halftone" via a spiral-ordered 6×6 matrix.
const HALFTONE = (() => {
    const m = [
        [34, 29, 17, 21, 30, 35],
        [28, 14, 9, 16, 20, 31],
        [13, 8, 4, 5, 15, 19],
        [12, 3, 0, 1, 10, 18],
        [27, 7, 2, 6, 23, 24],
        [33, 26, 11, 22, 25, 32],
    ];
    return m;
})();

export function dither(gray, w, h, method, cutoff = 128) {
    if (method === 'none') return Uint8ClampedArray.from(gray);
    if (method === 'threshold') {
        const out = new Uint8ClampedArray(w * h);
        for (let i = 0; i < out.length; i++) out[i] = gray[i] < cutoff ? 0 : 255;
        return out;
    }
    if (KERNELS[method]) return errorDiffuse(gray, w, h, KERNELS[method], cutoff);
    if (BAYER[method]) return ordered(gray, w, h, BAYER[method]);
    if (method === 'halftone') return ordered(gray, w, h, HALFTONE);
    return Uint8ClampedArray.from(gray);
}
