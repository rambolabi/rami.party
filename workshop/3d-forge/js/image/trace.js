// trace.js — turn a binary mask into clean, nested 2D contours.
// Uses marching squares to emit directed boundary segments, chains them into
// closed loops, simplifies them (Douglas–Peucker) and nests holes inside their
// parent outlines. Output feeds straight into the extruder.

// Directed marching-squares table. Edge ids: 0=top,1=right,2=bottom,3=left.
// Each case lists [from, to] directed segments (saddles emit two).
const TABLE = {
    1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]],
    5: [[3, 0], [1, 2]], 6: [[0, 2]], 7: [[3, 2]], 8: [[2, 3]],
    9: [[2, 0]], 10: [[0, 1], [2, 3]], 11: [[2, 1]], 12: [[1, 3]],
    13: [[1, 0]], 14: [[0, 3]],
};

function edgePoint(edge, x, y) {
    switch (edge) {
        case 0: return [x + 0.5, y];
        case 1: return [x + 1, y + 0.5];
        case 2: return [x + 0.5, y + 1];
        default: return [x, y + 0.5];
    }
}

function polyArea(ring) {
    let a = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    }
    return a / 2;
}

function pointInPoly(pt, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
        if (((yi > pt[1]) !== (yj > pt[1])) &&
            (pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
}

// Douglas–Peucker simplification (epsilon in the same units as the ring).
function simplify(ring, eps) {
    if (ring.length < 4) return ring;
    const keep = new Uint8Array(ring.length);
    keep[0] = keep[ring.length - 1] = 1;
    const stack = [[0, ring.length - 1]];
    while (stack.length) {
        const [s, e] = stack.pop();
        let maxD = 0, idx = -1;
        const [x1, y1] = ring[s], [x2, y2] = ring[e];
        const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
        for (let i = s + 1; i < e; i++) {
            const d = Math.abs((ring[i][0] - x1) * dy - (ring[i][1] - y1) * dx) / len;
            if (d > maxD) { maxD = d; idx = i; }
        }
        if (maxD > eps && idx > 0) { keep[idx] = 1; stack.push([s, idx], [idx, e]); }
    }
    const out = [];
    for (let i = 0; i < ring.length; i++) if (keep[i]) out.push(ring[i]);
    if (out.length > 1 && out[0][0] === out[out.length - 1][0] && out[0][1] === out[out.length - 1][1]) out.pop();
    return out;
}

// mask: Uint8Array length w*h (1 = inside). Returns array of { outer, holes }.
export function traceMask(mask, w, h, { simplifyPx = 0.75 } = {}) {
    const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : mask[y * w + x]);
    const key = (p) => Math.round(p[0] * 2) + ',' + Math.round(p[1] * 2);
    const starts = new Map(); // key → list of segments {to, used}

    for (let y = -1; y < h; y++) {
        for (let x = -1; x < w; x++) {
            const c = at(x, y) | (at(x + 1, y) << 1) | (at(x + 1, y + 1) << 2) | (at(x, y + 1) << 3);
            const segs = TABLE[c];
            if (!segs) continue;
            for (const [fromE, toE] of segs) {
                const from = edgePoint(fromE, x, y);
                const to = edgePoint(toE, x, y);
                const k = key(from);
                if (!starts.has(k)) starts.set(k, []);
                starts.get(k).push({ from, to, used: false });
            }
        }
    }

    const loops = [];
    for (const list of starts.values()) {
        for (const seg of list) {
            if (seg.used) continue;
            const loop = [];
            let cur = seg;
            let guard = 0;
            while (cur && !cur.used && guard++ < 1e6) {
                cur.used = true;
                loop.push(cur.from);
                const nextList = starts.get(key(cur.to));
                cur = nextList ? nextList.find((s) => !s.used) : null;
            }
            if (loop.length >= 3) loops.push(loop);
        }
    }

    const simplified = loops
        .map((l) => simplify(l, simplifyPx))
        .filter((l) => l.length >= 3 && Math.abs(polyArea(l)) > 0.5);

    // Nest: depth of each loop = how many others contain its first point.
    const items = simplified.map((ring) => ({ ring, area: Math.abs(polyArea(ring)) }));
    const shapes = [];
    for (const item of items) {
        let depth = 0, parent = null, parentArea = Infinity;
        for (const other of items) {
            if (other === item) continue;
            if (other.area > item.area && pointInPoly(item.ring[0], other.ring)) {
                depth++;
                if (other.area < parentArea) { parentArea = other.area; parent = other; }
            }
        }
        item.depth = depth; item.parent = parent;
    }
    for (const item of items) {
        if (item.depth % 2 === 0) shapes.push({ item, outer: item.ring, holes: [] });
    }
    for (const item of items) {
        if (item.depth % 2 === 1) {
            const host = shapes.find((s) => s.item === item.parent);
            if (host) host.holes.push(item.ring);
        }
    }
    return shapes.map((s) => ({ outer: s.outer, holes: s.holes }));
}
