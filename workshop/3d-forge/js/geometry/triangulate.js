// triangulate.js — ear-clipping polygon triangulation with hole support.
// Works on a combined vertex list using global indices (holes are bridged into
// the outer ring by index, never by duplicating points), so the resulting cap
// welds cleanly against the extruded walls and stays manifold. Pure JS.

function area(ring) {
    let a = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    }
    return a / 2; // > 0 for counter-clockwise rings
}

function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
    const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
    const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
    const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
}

// Find the outer-ring position a hole should bridge to (ray-cast visibility,
// the standard earcut approach). `ring` holds global indices into `points`;
// `hp` is the hole's rightmost vertex. Robust for non-convex outlines.
function findBridge(ring, points, hp) {
    const n = ring.length;
    let bestX = Infinity, edgeI = -1;
    for (let i = 0; i < n; i++) {
        const a = points[ring[i]], b = points[ring[(i + 1) % n]];
        if (a[1] === b[1]) continue;
        if ((a[1] <= hp[1] && b[1] >= hp[1]) || (b[1] <= hp[1] && a[1] >= hp[1])) {
            const x = a[0] + ((hp[1] - a[1]) / (b[1] - a[1])) * (b[0] - a[0]);
            if (x >= hp[0] - 1e-9 && x < bestX) { bestX = x; edgeI = i; }
        }
    }
    if (edgeI < 0) { // no edge to the right — fall back to nearest vertex
        let bp = 0, bd = Infinity;
        for (let i = 0; i < n; i++) { const p = points[ring[i]]; const d = (p[0] - hp[0]) ** 2 + (p[1] - hp[1]) ** 2; if (d < bd) { bd = d; bp = i; } }
        return bp;
    }
    const ia = edgeI, ib = (edgeI + 1) % n;
    let candPos = points[ring[ia]][0] > points[ring[ib]][0] ? ia : ib;
    const I = [bestX, hp[1]];
    const C = points[ring[candPos]];
    const cosX = (p) => { const dx = p[0] - hp[0]; return dx / (Math.hypot(dx, p[1] - hp[1]) || 1); };
    let bestCos = cosX(C);
    let result = candPos;
    for (let i = 0; i < n; i++) {
        if (i === candPos) continue;
        const p = points[ring[i]];
        if (p[0] < hp[0]) continue;
        const prev = points[ring[(i - 1 + n) % n]], next = points[ring[(i + 1) % n]];
        const reflex = ((p[0] - prev[0]) * (next[1] - p[1]) - (p[1] - prev[1]) * (next[0] - p[0])) < 0;
        if (!reflex) continue;
        if (pointInTriangle(p[0], p[1], hp[0], hp[1], I[0], I[1], C[0], C[1])) {
            const c = cosX(p);
            if (c > bestCos) { bestCos = c; result = i; }
        }
    }
    return result;
}

// Triangulate an outline with optional holes.
// Returns { points, tris } where `points` is the combined vertex list
// (outer ++ holes) and `tris` indexes into it.
export function triangulate(outer, holes = []) {
    const points = [];
    const pushRing = (ring) => { const start = points.length; for (const p of ring) points.push(p); return start; };

    const outerRing = area(outer) < 0 ? outer.slice().reverse() : outer.slice();
    const outerStart = pushRing(outerRing);
    let ring = []; // ring of GLOBAL indices into `points`
    for (let i = 0; i < outerRing.length; i++) ring.push(outerStart + i);

    // Bridge holes (rightmost-first so bridges don't cross).
    const hs = holes
        .map((h) => (area(h) > 0 ? h.slice().reverse() : h.slice()))
        .sort((a, b) => Math.max(...b.map((p) => p[0])) - Math.max(...a.map((p) => p[0])));

    for (const hole of hs) {
        const holeStart = pushRing(hole);
        let hi = 0;
        for (let i = 1; i < hole.length; i++) if (hole[i][0] > hole[hi][0]) hi = i;
        const bp = findBridge(ring, points, hole[hi]);
        const seq = [];
        for (let k = 0; k < hole.length; k++) seq.push(holeStart + ((hi + k) % hole.length));
        seq.push(holeStart + hi);   // close the hole loop
        seq.push(ring[bp]);         // bridge back to the outer ring
        ring.splice(bp + 1, 0, ...seq);
    }

    const tris = [];
    if (ring.length < 3) return { points, tris };

    const V = ring.slice(); // working list of GLOBAL indices
    let nv = V.length;
    let idx = nv - 1;
    let sinceClip = 0; // ring positions visited since the last successful ear
    const P = (gi) => points[gi];
    while (nv > 2) {
        const u = idx % nv;
        const v = (u + 1) % nv;
        const w = (v + 1) % nv;
        const A = P(V[u]), B = P(V[v]), C = P(V[w]);
        const cross = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
        let ear = cross > 1e-9;
        if (ear) {
            for (let p = 0; p < nv; p++) {
                if (p === u || p === v || p === w) continue;
                const Pp = P(V[p]);
                if (pointInTriangle(Pp[0], Pp[1], A[0], A[1], B[0], B[1], C[0], C[1])) { ear = false; break; }
            }
        }
        // Force progress on degenerate / self-touching outlines (hole bridges)
        // so the cap is always fully closed.
        if (!ear && sinceClip > nv + 2) ear = true;
        if (ear) {
            const a = V[u], b = V[v], c = V[w];
            if (a !== b && b !== c && a !== c) tris.push(a, b, c); // drop degenerate bridge tris
            V.splice(v, 1);
            nv--;
            idx = nv - 1;
            sinceClip = 0;
        } else {
            idx++;
            sinceClip++;
        }
    }
    return { points, tris };
}
