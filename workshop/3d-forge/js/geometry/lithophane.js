// lithophane.js — the headline feature. Brightness → inverse thickness so a
// backlit print reveals the photo (dark = thick = blocks light, light = thin).
// Shapes: flat, curved (gentle arc), and cylinder (full wrap).

import { heightfieldSolid } from './heightmap.js';

function sampler(field) {
    const { data, w, h } = field;
    return (u, v) => {
        const x = Math.min(w - 1, Math.max(0, Math.round(u * (w - 1))));
        const y = Math.min(h - 1, Math.max(0, Math.round(v * (h - 1))));
        return data[y * w + x];
    };
}

// thickness at (u,v): light (g→1) = minMm, dark (g→0) = maxMm.
function thicknessFn(field, minMm, maxMm) {
    const s = sampler(field);
    return (u, v) => minMm + (1 - s(u, v)) * (maxMm - minMm);
}

export function buildLithophane(field, opts = {}) {
    const {
        shape = 'flat', widthMm = 100, minMm = 0.8, maxMm = 3,
        maxCols = 260, diameterMm = 60, arcDeg = 60,
    } = opts;
    const ratio = field.h / field.w;
    const cols = Math.min(maxCols, field.w);
    const rows = Math.max(2, Math.round(cols * ratio));
    const thick = thicknessFn(field, minMm, maxMm);

    if (shape === 'cylinder') {
        // Wrap the width around a cylinder; thickness grows radially outward.
        const rInner = diameterMm / 2;
        const heightMm = (Math.PI * diameterMm) * ratio; // keep pixels ~square
        const top = (i, j) => {
            const u = i / (cols - 1), v = j / (rows - 1);
            const a = u * Math.PI * 2;
            const r = rInner + thick(u, v);
            return [Math.cos(a) * r, Math.sin(a) * r, (1 - v) * heightMm];
        };
        const bot = (i, j) => {
            const u = i / (cols - 1), v = j / (rows - 1);
            const a = u * Math.PI * 2;
            return [Math.cos(a) * rInner, Math.sin(a) * rInner, (1 - v) * heightMm];
        };
        return heightfieldSolid(cols, rows, top, bot);
    }

    if (shape === 'curved') {
        // Bend the flat panel along a gentle horizontal arc.
        const depthMm = widthMm * ratio;
        const arc = (arcDeg * Math.PI) / 180;
        const R = widthMm / arc;
        const surf = (u, v, off) => {
            const a = (u - 0.5) * arc;
            const x = Math.sin(a) * (R + off);
            const y = (0.5 - v) * depthMm;
            const z = R - Math.cos(a) * (R + off);
            return [x, y, z];
        };
        const top = (i, j) => { const u = i / (cols - 1), v = j / (rows - 1); return surf(u, v, thick(u, v)); };
        const bot = (i, j) => { const u = i / (cols - 1), v = j / (rows - 1); return surf(u, v, 0); };
        return heightfieldSolid(cols, rows, top, bot);
    }

    // flat
    const depthMm = widthMm * ratio;
    const top = (i, j) => {
        const u = i / (cols - 1), v = j / (rows - 1);
        return [(u - 0.5) * widthMm, (0.5 - v) * depthMm, thick(u, v)];
    };
    const bot = (i, j) => {
        const u = i / (cols - 1), v = j / (rows - 1);
        return [(u - 0.5) * widthMm, (0.5 - v) * depthMm, 0];
    };
    return heightfieldSolid(cols, rows, top, bot);
}
