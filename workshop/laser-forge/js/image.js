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
};

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

    const toned = dither(gray, width, height, p.dither, p.ditherCutoff);

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
