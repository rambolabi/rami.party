// text3d.js — text / emoji → watertight 3D solids.
// Renders glyphs to an offscreen canvas (so ANY installed or user-uploaded font,
// plus colour emoji, "just works"), reads the alpha channel as a binary mask,
// traces clean contours and extrudes them to a real millimetre depth.

import { traceMask } from '../image/trace.js';
import { extrude } from './extrude.js';
import { Mesh } from '../scene/mesh.js';

const QUALITY = 7; // pixels per millimetre when rasterising glyphs

// Rasterise text to an alpha mask. Returns { mask, w, h } in pixels.
function rasterize(text, { fontFamily, heightMm, letterSpacing = 0, bold = false, italic = false }) {
    const lines = String(text).split('\n');
    const px = Math.max(8, Math.round(heightMm * QUALITY));
    const style = `${italic ? 'italic ' : ''}${bold ? '700 ' : ''}`;
    const font = `${style}${px}px ${fontFamily}`;
    const meas = document.createElement('canvas').getContext('2d');
    meas.font = font;

    const lineH = px * 1.28;
    let maxW = 0;
    const widths = lines.map((ln) => {
        let w = 0;
        for (const ch of ln) w += meas.measureText(ch).width + letterSpacing * QUALITY;
        maxW = Math.max(maxW, w);
        return w;
    });
    const pad = Math.ceil(px * 0.35);
    const w = Math.ceil(maxW) + pad * 2;
    const h = Math.ceil(lineH * lines.length) + pad * 2;

    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.font = font;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#fff';
    lines.forEach((ln, li) => {
        let x = pad;
        const y = pad + lineH * li + px;
        for (const ch of ln) {
            ctx.fillText(ch, x, y);
            x += ctx.measureText(ch).width + letterSpacing * QUALITY;
        }
    });
    const data = ctx.getImageData(0, 0, w, h).data;
    const mask = new Uint8Array(w * h);
    for (let i = 3, j = 0; i < data.length; i += 4, j++) mask[j] = data[i] > 96 ? 1 : 0;
    return { mask, w, h };
}

// Return shapes in mm (origin centred, Y up), or null if nothing rendered.
export function textToShapes(text, opts) {
    const { mask, w, h } = rasterize(text, opts);
    const shapes = traceMask(mask, w, h, { simplifyPx: 0.6 });
    if (!shapes.length) return null;
    const s = 1 / QUALITY; // px → mm
    const toMm = (ring) => ring.map(([x, y]) => [x * s, (h - y) * s]); // flip Y
    const mapped = shapes.map((sh) => ({ outer: toMm(sh.outer), holes: sh.holes.map(toMm) }));
    // Centre on origin.
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for (const sh of mapped) for (const ring of [sh.outer, ...sh.holes]) for (const p of ring) {
        if (p[0] < minx) minx = p[0]; if (p[1] < miny) miny = p[1];
        if (p[0] > maxx) maxx = p[0]; if (p[1] > maxy) maxy = p[1];
    }
    const cx = (minx + maxx) / 2, cy = (miny + maxy) / 2;
    for (const sh of mapped) for (const ring of [sh.outer, ...sh.holes]) for (const p of ring) { p[0] -= cx; p[1] -= cy; }
    return { shapes: mapped, width: maxx - minx, height: maxy - miny };
}

export function buildText3D(text, opts) {
    const res = textToShapes(text, opts);
    if (!res) return new Mesh();
    return extrude(res.shapes, opts.depthMm ?? 4);
}
