// geometry.js — shared math + small helpers (pure JS, no deps)

export const MM_PER_IN = 25.4;
export const PX_PER_MM_96 = 96 / MM_PER_IN; // screen reference at zoom 1

let _id = 0;
export function uid(prefix = 'o') {
    _id += 1;
    return `${prefix}${Date.now().toString(36)}${_id.toString(36)}`;
}

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const deg2rad = (d) => (d * Math.PI) / 180;
export const round = (v, n = 3) => {
    const p = 10 ** n;
    return Math.round(v * p) / p;
};

export function rotatePoint(px, py, cx, cy, deg) {
    if (!deg) return { x: px, y: py };
    const a = deg2rad(deg);
    const s = Math.sin(a);
    const c = Math.cos(a);
    const dx = px - cx;
    const dy = py - cy;
    return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c };
}

// Apply an object's rotation (about its bbox centre) to a local mm point.
export function applyTransform(obj, px, py) {
    const cx = obj.x + obj.w / 2;
    const cy = obj.y + obj.h / 2;
    return rotatePoint(px, py, cx, cy, obj.rotation || 0);
}

// Bounding box of a set of loops [[{x,y}...]]
export function bboxOfLoops(loops) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const loop of loops) {
        for (const p of loop) {
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
        }
    }
    return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

// Ramer–Douglas–Peucker polyline simplification.
export function simplify(points, tol = 0.05, closed = false) {
    if (points.length < 3) return points.slice();
    const pts = closed ? points.concat([points[0]]) : points;
    const keep = new Uint8Array(pts.length);
    keep[0] = 1;
    keep[pts.length - 1] = 1;
    const stack = [[0, pts.length - 1]];
    while (stack.length) {
        const [a, b] = stack.pop();
        let maxD = 0, idx = -1;
        const ax = pts[a].x, ay = pts[a].y;
        const bx = pts[b].x, by = pts[b].y;
        const dx = bx - ax, dy = by - ay;
        const len2 = dx * dx + dy * dy || 1e-9;
        for (let i = a + 1; i < b; i++) {
            const t = ((pts[i].x - ax) * dx + (pts[i].y - ay) * dy) / len2;
            const projX = ax + clamp(t, 0, 1) * dx;
            const projY = ay + clamp(t, 0, 1) * dy;
            const d = (pts[i].x - projX) ** 2 + (pts[i].y - projY) ** 2;
            if (d > maxD) { maxD = d; idx = i; }
        }
        if (maxD > tol * tol && idx > -1) {
            keep[idx] = 1;
            stack.push([a, idx], [idx, b]);
        }
    }
    const out = [];
    for (let i = 0; i < pts.length; i++) if (keep[i]) out.push(pts[i]);
    if (closed) out.pop();
    return out;
}

// Convert a hex colour to {r,g,b}
export function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// Operation → colour convention (cut/score/engrave map to LightBurn-style layers)
export const OP_COLORS = {
    cut: '#ff2d2d',       // red = cut
    score: '#2d6bff',     // blue = score
    engrave: '#111111',   // black = engrave / fill
};
export const OPERATIONS = ['engrave', 'cut', 'score'];
