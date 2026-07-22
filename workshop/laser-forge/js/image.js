// image.js — image decode + grayscale/adjust/dither pipeline (pure JS)

import { dither } from './dither.js';
import { clamp } from './geometry.js';

const _imgCache = new Map(); // dataURL -> HTMLImageElement (survives undo clones)

export function decodeImage(dataURL) {
    if (_imgCache.has(dataURL)) {
        const cached = _imgCache.get(dataURL);
        if (cached.complete) return Promise.resolve(cached);
    }
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => { _imgCache.set(dataURL, img); resolve(img); };
        img.onerror = reject;
        img.src = dataURL;
    });
}

export function imageToImageData(img, w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return ctx.getImageData(0, 0, c.width, c.height);
}

export const DEFAULT_IMAGE_PARAMS = {
    brightness: 0,      // -100..100
    contrast: 0,        // -100..100
    gamma: 1,           // 0.1..3
    levelsBlack: 0,     // 0..255
    levelsWhite: 255,   // 0..255
    invert: false,
    dither: 'none',     // see dither.js
    ditherCutoff: 128,  // 0..255
    removeBg: false,
    bgThreshold: 245,   // luminance considered "background/white"
    blur: 0,            // 0..5 box-blur radius
    sharpen: 0,         // 0..100 unsharp amount
    edge: false,        // Sobel edge / line-art
    posterize: 0,       // 0 = off, else 2..16 tone bands
};

const clampi = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

function boxBlur(src, w, h, r) {
    if (r <= 0) return src;
    const out = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let s = 0, c = 0;
        for (let dy = -r; dy <= r; dy++) {
            const yy = y + dy; if (yy < 0 || yy >= h) continue;
            for (let dx = -r; dx <= r; dx++) {
                const xx = x + dx; if (xx < 0 || xx >= w) continue;
                s += src[yy * w + xx]; c++;
            }
        }
        out[y * w + x] = s / c;
    }
    return out;
}
function sobel(src, w, h) {
    const out = new Float32Array(w * h);
    const gxK = [-1, 0, 1, -2, 0, 2, -1, 0, 1], gyK = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let gx = 0, gy = 0, k = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const v = src[clampi(y + dy, 0, h - 1) * w + clampi(x + dx, 0, w - 1)];
            gx += v * gxK[k]; gy += v * gyK[k]; k++;
        }
        out[y * w + x] = Math.min(255, Math.hypot(gx, gy));
    }
    return out;
}
function posterize(src, levels) {
    if (levels < 2 || levels >= 256) return src;
    const step = 255 / (levels - 1);
    const out = new Float32Array(src.length);
    for (let i = 0; i < src.length; i++) out[i] = Math.round(Math.round(src[i] / step) * step);
    return out;
}

// Returns a NEW ImageData (same dimensions) after the full engrave pipeline.
export function processImageData(src, params) {
    const p = { ...DEFAULT_IMAGE_PARAMS, ...params };
    const { data, width, height } = src;
    const n = width * height;
    const gray = new Float32Array(n);
    const alpha = new Uint8ClampedArray(n);

    const cRaw = clamp(p.contrast, -100, 100) * 2.55;
    const cf = (259 * (cRaw + 255)) / (255 * (259 - cRaw));
    const bAdd = clamp(p.brightness, -100, 100) * 2.55;
    const invGamma = 1 / clamp(p.gamma, 0.05, 5);
    const lb = clamp(p.levelsBlack, 0, 254);
    const lw = clamp(p.levelsWhite, lb + 1, 255);
    const lspan = lw - lb;

    for (let i = 0, q = 0; i < data.length; i += 4, q++) {
        const a = data[i + 3];
        let v = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const srcLum = v;
        v += bAdd;                       // brightness
        v = cf * (v - 128) + 128;        // contrast
        v = ((v - lb) / lspan) * 255;    // levels
        v = clamp(v, 0, 255);
        v = 255 * Math.pow(v / 255, invGamma); // gamma
        if (p.invert) v = 255 - v;
        gray[q] = clamp(v, 0, 255);
        // background handling: transparent source, or near-white if removeBg
        let outA = a;
        if (a <= 20) outA = 0;
        else if (p.removeBg && srcLum >= p.bgThreshold) outA = 0;
        alpha[q] = outA;
    }

    // spatial filters (blur → sharpen → edge/line-art → posterize)
    let g = gray;
    if (p.blur > 0) g = boxBlur(g, width, height, Math.round(p.blur));
    if (p.sharpen > 0) {
        const bl = boxBlur(g, width, height, 1), amt = p.sharpen / 100, s = new Float32Array(n);
        for (let i = 0; i < n; i++) s[i] = clamp(g[i] + amt * (g[i] - bl[i]), 0, 255);
        g = s;
    }
    if (p.edge) {
        const e = sobel(g, width, height), s = new Float32Array(n);
        for (let i = 0; i < n; i++) s[i] = clamp(255 - e[i], 0, 255);
        g = s;
    }
    if (p.posterize >= 2) g = posterize(g, p.posterize | 0);

    const toned = dither(g, width, height, p.dither, p.ditherCutoff);

    const out = new ImageData(width, height);
    for (let q = 0, i = 0; q < n; q++, i += 4) {
        const v = toned[q];
        out.data[i] = v; out.data[i + 1] = v; out.data[i + 2] = v;
        out.data[i + 3] = alpha[q];
    }
    return out;
}

// Convenience: decode + resample + process at a target pixel size.
export async function renderImageObject(obj, targetW, targetH) {
    const img = await decodeImage(obj.src);
    const srcData = imageToImageData(img, targetW, targetH);
    return processImageData(srcData, obj.params || {});
}
