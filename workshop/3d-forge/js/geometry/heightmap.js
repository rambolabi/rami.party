// heightmap.js — grayscale field → watertight relief solid.
// Provides the shared `heightfieldSolid` builder (a grid of top vertices + a grid
// of bottom vertices + side walls) reused by both relief and lithophane modes.

import { Mesh } from '../scene/mesh.js';

// cols/rows = grid resolution. top(i,j) / bot(i,j) return [x,y,z] in mm.
export function heightfieldSolid(cols, rows, top, bot) {
    const mesh = new Mesh();
    const topIdx = [], botIdx = [];
    for (let j = 0; j < rows; j++) {
        const tr = [], br = [];
        for (let i = 0; i < cols; i++) {
            const [tx, ty, tz] = top(i, j); tr.push(mesh.addVertex(tx, ty, tz));
            const [bx, by, bz] = bot(i, j); br.push(mesh.addVertex(bx, by, bz));
        }
        topIdx.push(tr); botIdx.push(br);
    }
    // top surface (normals up) + bottom surface (normals down)
    for (let j = 0; j < rows - 1; j++) {
        for (let i = 0; i < cols - 1; i++) {
            mesh.addQuad(topIdx[j][i], topIdx[j][i + 1], topIdx[j + 1][i + 1], topIdx[j + 1][i]);
            mesh.addQuad(botIdx[j][i], botIdx[j + 1][i], botIdx[j + 1][i + 1], botIdx[j][i + 1]);
        }
    }
    // walls: stitch top border to bottom border all the way round
    for (let i = 0; i < cols - 1; i++) { // front (j=0) and back (j=rows-1)
        mesh.addQuad(topIdx[0][i], topIdx[0][i + 1], botIdx[0][i + 1], botIdx[0][i]);
        const j = rows - 1;
        mesh.addQuad(topIdx[j][i + 1], topIdx[j][i], botIdx[j][i], botIdx[j][i + 1]);
    }
    for (let j = 0; j < rows - 1; j++) { // left (i=0) and right (i=cols-1)
        mesh.addQuad(topIdx[j + 1][0], topIdx[j][0], botIdx[j][0], botIdx[j + 1][0]);
        const i = cols - 1;
        mesh.addQuad(topIdx[j][i], topIdx[j + 1][i], botIdx[j + 1][i], botIdx[j][i]);
    }
    return mesh;
}

// Sample a grayscale field (0..1) with clamping.
function sampler(field) {
    const { data, w, h } = field;
    return (u, v) => {
        const x = Math.min(w - 1, Math.max(0, Math.round(u * (w - 1))));
        const y = Math.min(h - 1, Math.max(0, Math.round(v * (h - 1))));
        return data[y * w + x];
    };
}

// Relief / embossed sign: bright pixels rise, dark stay near the base.
export function buildRelief(field, opts = {}) {
    const { widthMm = 80, baseMm = 1.2, reliefMm = 3, maxCols = 220, invert = false } = opts;
    const ratio = field.h / field.w;
    const cols = Math.min(maxCols, field.w);
    const rows = Math.max(2, Math.round(cols * ratio));
    const depthMm = widthMm * ratio;
    const s = sampler(field);
    const top = (i, j) => {
        const u = i / (cols - 1), v = j / (rows - 1);
        let g = s(u, v); if (invert) g = 1 - g;
        return [(u - 0.5) * widthMm, (0.5 - v) * depthMm, baseMm + g * reliefMm];
    };
    const bot = (i, j) => {
        const u = i / (cols - 1), v = j / (rows - 1);
        return [(u - 0.5) * widthMm, (0.5 - v) * depthMm, 0];
    };
    return heightfieldSolid(cols, rows, top, bot);
}
