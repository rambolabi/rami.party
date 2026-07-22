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

// Signed area of a polygon (CCW positive).
export function signedArea(pts) {
    let a = 0;
    for (let i = 0, n = pts.length; i < n; i++) {
        const p = pts[i], q = pts[(i + 1) % n];
        a += p.x * q.y - q.x * p.y;
    }
    return a / 2;
}

// Total length of a polyline (closed adds the wrap segment).
export function pathLength(pts, closed) {
    let L = 0;
    for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (closed && pts.length > 1) {
        const a = pts[pts.length - 1], b = pts[0];
        L += Math.hypot(b.x - a.x, b.y - a.y);
    }
    return L;
}

// Offset a closed polygon by d (positive = expand outward). Edge-normal method
// with segment-intersection joins — good for small kerf offsets.
export function offsetClosed(pts, d) {
    const n = pts.length;
    if (n < 3 || Math.abs(d) < 1e-9) return pts.slice();
    // ensure CCW so a positive d always expands
    const dir = signedArea(pts) < 0 ? -1 : 1;
    const off = d * dir;
    const edges = [];
    for (let i = 0; i < n; i++) {
        const a = pts[i], b = pts[(i + 1) % n];
        let nx = b.y - a.y, ny = -(b.x - a.x);
        const len = Math.hypot(nx, ny) || 1;
        nx = (nx / len) * off; ny = (ny / len) * off;
        edges.push({ a: { x: a.x + nx, y: a.y + ny }, b: { x: b.x + nx, y: b.y + ny } });
    }
    const out = [];
    for (let i = 0; i < n; i++) {
        const e0 = edges[(i - 1 + n) % n], e1 = edges[i];
        const p = intersectLines(e0.a, e0.b, e1.a, e1.b);
        out.push(p || e1.a);
    }
    return out;
}

function intersectLines(p1, p2, p3, p4) {
    const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(d) < 1e-9) return null;
    const a = p1.x * p2.y - p1.y * p2.x, b = p3.x * p4.y - p3.y * p4.x;
    return {
        x: (a * (p3.x - p4.x) - (p1.x - p2.x) * b) / d,
        y: (a * (p3.y - p4.y) - (p1.y - p2.y) * b) / d,
    };
}

// Parallel-line hatch fill of a region (array of closed point-loops, even-odd).
// Returns an array of [pA, pB] segments in the original coordinate space.
export function hatchFill(loops, spacing, angleDeg = 0) {
    if (spacing <= 0) return [];
    const a = deg2rad(angleDeg), ca = Math.cos(a), sa = Math.sin(a);
    const rot = (p) => ({ x: p.x * ca + p.y * sa, y: -p.x * sa + p.y * ca });
    const inv = (p) => ({ x: p.x * ca - p.y * sa, y: p.x * sa + p.y * ca });
    const R = loops.map((l) => l.map(rot));
    let minY = Infinity, maxY = -Infinity;
    for (const l of R) for (const p of l) { if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y; }
    const out = [];
    for (let y = Math.ceil(minY / spacing) * spacing; y <= maxY; y += spacing) {
        const xs = [];
        for (const l of R) {
            const n = l.length;
            for (let i = 0; i < n; i++) {
                const p = l[i], q = l[(i + 1) % n];
                if ((p.y <= y && q.y > y) || (q.y <= y && p.y > y)) {
                    xs.push(p.x + ((y - p.y) / (q.y - p.y)) * (q.x - p.x));
                }
            }
        }
        xs.sort((m, n) => m - n);
        for (let i = 0; i + 1 < xs.length; i += 2) out.push([inv({ x: xs[i], y }), inv({ x: xs[i + 1], y })]);
    }
    return out;
}

// Break a closed loop into open polylines, leaving `count` small bridge gaps.
export function applyBridges(pts, count, gap) {
    if (!count || count < 1 || pts.length < 3) return [{ pts: pts.slice(), closed: true }];
    const P = pts.concat([pts[0]]);
    const segLen = []; let total = 0;
    for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y); segLen.push(d); total += d; }
    const half = gap / 2;
    const inGap = (s) => {
        for (let k = 0; k < count; k++) {
            const c = (k / count) * total + total / (2 * count);
            let d = Math.abs(s - c); d = Math.min(d, total - d);
            if (d < half) return true;
        }
        return false;
    };
    const lines = []; let cur = [];
    const push = (pt, s) => { if (inGap(s)) { if (cur.length >= 2) lines.push({ pts: cur, closed: false }); cur = []; } else cur.push(pt); };
    push(P[0], 0);
    let acc = 0;
    for (let i = 1; i < P.length; i++) {
        const d = segLen[i - 1];
        const steps = Math.max(1, Math.ceil(d / Math.max(0.5, half)));
        for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            push({ x: P[i - 1].x + (P[i].x - P[i - 1].x) * t, y: P[i - 1].y + (P[i].y - P[i - 1].y) * t }, acc + d * t);
        }
        acc += d;
    }
    if (cur.length >= 2) lines.push({ pts: cur, closed: false });
    return lines;
}


