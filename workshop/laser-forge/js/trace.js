// trace.js — bitmap → vector contours via marching squares (pure JS)
// Produces closed loops in pixel coordinates; holes come out as separate loops.

// binary: Uint8Array length w*h, 1 = inside/filled.
export function traceBinary(binary, w, h) {
    // Pad by 1px of "outside" so shapes touching the edge still close.
    const W = w + 2;
    const H = h + 2;
    const grid = new Uint8Array(W * H);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (binary[y * w + x]) grid[(y + 1) * W + (x + 1)] = 1;
        }
    }

    const at = (x, y) => grid[y * W + x];
    // Endpoint keys use doubled integer coordinates to align between cells.
    const KMUL = 1_000_000;
    const keyOf = (gx, gy) => gx * KMUL + gy;
    const pt = {
        T: (cx, cy) => keyOf(2 * cx + 1, 2 * cy),
        R: (cx, cy) => keyOf(2 * cx + 2, 2 * cy + 1),
        B: (cx, cy) => keyOf(2 * cx + 1, 2 * cy + 2),
        L: (cx, cy) => keyOf(2 * cx, 2 * cy + 1),
    };
    const TABLE = {
        1: [['L', 'B']], 2: [['B', 'R']], 3: [['L', 'R']], 4: [['T', 'R']],
        5: [['T', 'R'], ['L', 'B']], 6: [['T', 'B']], 7: [['L', 'T']], 8: [['T', 'L']],
        9: [['T', 'B']], 10: [['T', 'L'], ['B', 'R']], 11: [['T', 'R']], 12: [['L', 'R']],
        13: [['B', 'R']], 14: [['L', 'B']],
    };

    const adj = new Map(); // key -> [neighborKey, ...]
    const addEdge = (a, b) => {
        if (a === b) return;
        (adj.get(a) || adj.set(a, []).get(a)).push(b);
        (adj.get(b) || adj.set(b, []).get(b)).push(a);
    };

    for (let cy = 0; cy < H - 1; cy++) {
        for (let cx = 0; cx < W - 1; cx++) {
            const code = (at(cx, cy) << 3) | (at(cx + 1, cy) << 2) |
                (at(cx + 1, cy + 1) << 1) | at(cx, cy + 1);
            const segs = TABLE[code];
            if (!segs) continue;
            for (const [a, b] of segs) addEdge(pt[a](cx, cy), pt[b](cx, cy));
        }
    }

    const used = new Set();
    const edgeKey = (a, b) => (a < b ? a * 2_000_003 + b : b * 2_000_003 + a);
    const decode = (k) => ({ x: Math.floor(k / KMUL) / 2 - 1, y: (k % KMUL) / 2 - 1 });

    const loops = [];
    for (const start of adj.keys()) {
        // find an unused edge from start
        for (const first of adj.get(start)) {
            if (used.has(edgeKey(start, first))) continue;
            // walk the loop
            const loop = [];
            let prev = start;
            let cur = first;
            used.add(edgeKey(start, first));
            loop.push(decode(start));
            let guard = 0;
            const LIMIT = adj.size * 4 + 16;
            while (cur !== start && guard++ < LIMIT) {
                loop.push(decode(cur));
                const nbrs = adj.get(cur) || [];
                let next = -1;
                for (const n of nbrs) {
                    if (n === prev) continue;
                    if (used.has(edgeKey(cur, n))) continue;
                    next = n; break;
                }
                if (next === -1) {
                    // fall back to any unused edge (handles rare saddles)
                    for (const n of nbrs) {
                        if (used.has(edgeKey(cur, n))) continue;
                        next = n; break;
                    }
                }
                if (next === -1) break;
                used.add(edgeKey(cur, next));
                prev = cur;
                cur = next;
            }
            if (loop.length >= 3) loops.push(loop);
        }
    }
    return loops;
}

// Build a binary mask from ImageData: filled where luminance < threshold (0..255)
// (or, when useAlpha, where alpha is opaque). Good for text & silhouettes.
export function binaryFromImageData(img, { threshold = 128, useAlpha = false } = {}) {
    const { data, width, height } = img;
    const bin = new Uint8Array(width * height);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        const a = data[i + 3];
        if (useAlpha) {
            bin[p] = a > 20 ? 1 : 0;
        } else {
            const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            bin[p] = (a > 20 && lum < threshold) ? 1 : 0;
        }
    }
    return { bin, width, height };
}
