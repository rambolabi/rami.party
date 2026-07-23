// pipeline.js — raster helpers shared by the image → 3D features.
// Loads images, converts to a normalised grayscale field (0 = black, 1 = white)
// and applies brightness / contrast / gamma / invert / level adjustments.

export function loadImageFile(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
        img.src = url;
    });
}

// Draw an image down to a target width and return a grayscale field in [0,1].
export function toGrayscale(img, targetW = 300) {
    const ratio = img.naturalHeight / img.naturalWidth;
    const w = Math.max(2, Math.round(targetW));
    const h = Math.max(2, Math.round(targetW * ratio));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const px = ctx.getImageData(0, 0, w, h).data;
    const g = new Float32Array(w * h);
    for (let i = 0, j = 0; i < px.length; i += 4, j++) {
        const a = px[i + 3] / 255;
        // Composite over white so transparent → white (thin on a lithophane).
        const r = px[i] * a + 255 * (1 - a);
        const gg = px[i + 1] * a + 255 * (1 - a);
        const b = px[i + 2] * a + 255 * (1 - a);
        g[j] = (0.299 * r + 0.587 * gg + 0.114 * b) / 255;
    }
    return { data: g, w, h };
}

export function adjust(field, opts = {}) {
    const { brightness = 0, contrast = 0, gamma = 1, invert = false, blackPoint = 0, whitePoint = 1 } = opts;
    const src = field.data;
    const out = new Float32Array(src.length);
    const cf = (contrast + 1); // contrast factor around 0.5
    const range = Math.max(1e-3, whitePoint - blackPoint);
    for (let i = 0; i < src.length; i++) {
        let v = src[i];
        v = (v - blackPoint) / range;            // levels
        v = (v - 0.5) * cf + 0.5 + brightness;   // contrast + brightness
        v = Math.min(1, Math.max(0, v));
        v = Math.pow(v, 1 / gamma);              // gamma
        if (invert) v = 1 - v;
        out[i] = Math.min(1, Math.max(0, v));
    }
    return { data: out, w: field.w, h: field.h };
}

// Threshold a grayscale field to a binary mask (1 = dark = inside the shape).
export function toMask(field, threshold = 0.5) {
    const out = new Uint8Array(field.data.length);
    for (let i = 0; i < field.data.length; i++) out[i] = field.data[i] < threshold ? 1 : 0;
    return out;
}
