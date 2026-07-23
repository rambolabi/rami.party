// qr3d.js — QR matrix → scannable 3D solid.
// A base plate (with quiet zone) plus raised module pillars. Modules are embedded
// a hair into the plate so slicers fuse them into one printable body. Keep good
// light/dark contrast: pair a white plate with black modules for reliable scans.

import { qrGenerate } from '../qr.js';
import { box } from './primitives.js';
import { Mesh } from '../scene/mesh.js';

export function buildQR3D(text, opts = {}) {
    const {
        ecl = 'M', widthMm = 50, baseMm = 2, moduleMm = 1.6,
        quiet = 2, recessed = false,
    } = opts;
    const { size, modules } = qrGenerate(text || 'https://rami.party', ecl);
    const total = size + quiet * 2;
    const cell = widthMm / total;
    const embed = 0.02;

    const base = box(widthMm, widthMm, baseMm);
    const parts = [base];
    const originX = -widthMm / 2 + quiet * cell;
    const originY = widthMm / 2 - quiet * cell; // row 0 at top

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (!modules[r][c]) continue;
            const cx = originX + (c + 0.5) * cell;
            const cy = originY - (r + 0.5) * cell;
            if (recessed) {
                // Carve a shallow pocket by dropping a thin negative pillar just
                // below the surface (visual/relief only — raised is recommended).
                const m = box(cell * 0.96, cell * 0.96, moduleMm + embed);
                m.translate(cx, cy, baseMm - moduleMm);
                parts.push(m);
            } else {
                const m = box(cell * 0.96, cell * 0.96, moduleMm + embed);
                m.translate(cx, cy, baseMm - embed);
                parts.push(m);
            }
        }
    }
    const mesh = Mesh.merge(parts);
    return mesh;
}
