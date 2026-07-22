// generators.js — parametric laser generators (pure JS). Each returns local loops
// [{pts, closed, op}] in the object's own 0..w / 0..h space.

import { uid } from './geometry.js';

// ---- finger-joint box -----------------------------------------------------
function combEdge(A, B, t, tabW) {
    const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L, nx = uy, ny = -ux; // right-hand = outward (CW-in-screen)
    let nseg = Math.max(3, Math.round(L / tabW));
    if (nseg % 2 === 0) nseg++;
    const seg = L / nseg;
    const pts = [{ x: A.x, y: A.y }];
    for (let i = 0; i < nseg; i++) {
        const o = (i % 2 === 1) ? t : 0;
        pts.push({ x: A.x + ux * i * seg + nx * o, y: A.y + uy * i * seg + ny * o });
        pts.push({ x: A.x + ux * (i + 1) * seg + nx * o, y: A.y + uy * (i + 1) * seg + ny * o });
    }
    pts.push({ x: B.x, y: B.y });
    return pts;
}
function fingeredRect(ox, oy, w, h, t, tabW) {
    const c = [{ x: ox, y: oy }, { x: ox + w, y: oy }, { x: ox + w, y: oy + h }, { x: ox, y: oy + h }];
    let pts = [];
    for (let i = 0; i < 4; i++) {
        const e = combEdge(c[i], c[(i + 1) % 4], t, tabW);
        pts = pts.concat(i === 0 ? e : e.slice(1));
    }
    return { pts, closed: true, op: 'cut' };
}
export function boxNetSize(o) {
    const gap = 8, t = o.thickness;
    const W = o.boxW, D = o.boxD, H = o.boxH;
    const row1 = [[W, D], [W, H], [D, H]]; // bottom, front, left
    const row2 = [[W, D], [W, H], [D, H]]; // top, back, right
    const rowW = (r) => r.reduce((s, p) => s + p[0], 0) + gap * (r.length - 1) + t * 2 * r.length;
    const netW = Math.max(rowW(row1), rowW(row2)) + t * 2;
    const rowH = (r) => Math.max(...r.map((p) => p[1])) + t * 2;
    const netH = rowH(row1) + rowH(row2) + gap;
    return { w: netW, h: netH };
}
export function boxLocalLoops(o) {
    const gap = 8, t = o.thickness, tabW = o.tab;
    const W = o.boxW, D = o.boxD, H = o.boxH;
    const panels = [
        [W, D], [W, H], [D, H],  // row 1: bottom, front, left
        [W, D], [W, H], [D, H],  // row 2: top, back, right
    ];
    const out = [];
    let x = t, y = t;
    const rowMaxH1 = Math.max(D, H, H);
    panels.forEach((p, i) => {
        if (i === 3) { x = t; y = t + rowMaxH1 + gap + t * 2; }
        out.push(fingeredRect(x, y, p[0], p[1], t, tabW));
        x += p[0] + gap + t * 2;
    });
    return out;
}

// ---- gear (approximate involute, trapezoidal teeth) -----------------------
export function gearLocalLoops(o) {
    const N = Math.max(6, o.teeth | 0);
    const r = (o.w / 2) * 0.86;          // pitch radius fits the bbox
    const m = (2 * r) / N;
    const ra = r + m, rd = Math.max(2, r - 1.25 * m);
    const cx = o.w / 2, cy = o.h / 2;
    const pts = [];
    const toothAng = (Math.PI * 2) / N;
    const half = toothAng / 2;
    const flank = half * 0.28;
    for (let i = 0; i < N; i++) {
        const a = i * toothAng - Math.PI / 2;
        const add = [a - flank, a + flank];
        const ded = [a + flank + flank, a + toothAng - flank - flank];
        pts.push({ x: cx + rd * Math.cos(a - half), y: cy + rd * Math.sin(a - half) });
        pts.push({ x: cx + ra * Math.cos(add[0]), y: cy + ra * Math.sin(add[0]) });
        pts.push({ x: cx + ra * Math.cos(add[1]), y: cy + ra * Math.sin(add[1]) });
        pts.push({ x: cx + rd * Math.cos(a + half), y: cy + rd * Math.sin(a + half) });
    }
    const loops = [{ pts, closed: true, op: 'cut' }];
    if (o.bore > 0) {
        const bp = [];
        for (let i = 0; i < 48; i++) {
            const a = (i / 48) * Math.PI * 2;
            bp.push({ x: cx + o.bore * Math.cos(a), y: cy + o.bore * Math.sin(a) });
        }
        loops.push({ pts: bp, closed: true, op: 'cut' });
    }
    return loops;
}

// ---- ruler ----------------------------------------------------------------
export function rulerLoops(o, glyph) {
    const out = [];
    const L = o.w, H = o.h;
    out.push({ pts: [{ x: 0, y: 0 }, { x: L, y: 0 }, { x: L, y: H }, { x: 0, y: H }], closed: true, op: 'cut' });
    for (let mm = 0; mm <= Math.floor(L); mm++) {
        let len = H * 0.18;
        if (mm % 10 === 0) len = H * 0.5; else if (mm % 5 === 0) len = H * 0.32;
        out.push({ pts: [{ x: mm, y: 0 }, { x: mm, y: len }], closed: false, op: 'engrave' });
        if (mm % 10 === 0 && mm > 0 && glyph) {
            const g = glyph(String(mm / 10), 'sans-serif', Math.min(4, H * 0.22));
            for (const l of g.loops)
                out.push({ pts: l.pts.map((p) => ({ x: mm - g.wMM / 2 + p.x, y: len + 0.5 + p.y })), closed: l.closed, op: 'engrave' });
        }
    }
    return out;
}

// ---- living hinge (staggered slits) --------------------------------------
export function hingeLoops(o) {
    const out = [];
    out.push({ pts: [{ x: 0, y: 0 }, { x: o.w, y: 0 }, { x: o.w, y: o.h }, { x: 0, y: o.h }], closed: true, op: 'cut' });
    const colGap = Math.max(1.5, o.colGap || 3);
    const slit = Math.max(3, o.slit || 8);
    const margin = 2;
    const cols = Math.max(1, Math.floor((o.w - margin * 2) / colGap));
    for (let c = 0; c <= cols; c++) {
        const x = margin + c * colGap;
        if (x > o.w - margin) break;
        const offset = (c % 2) ? slit / 2 : 0;
        for (let y = margin - offset; y < o.h - margin; y += slit) {
            const y0 = Math.max(margin, y), y1 = Math.min(o.h - margin, y + slit - 1.5);
            if (y1 - y0 > 1) out.push({ pts: [{ x, y: y0 }, { x, y: y1 }], closed: false, op: 'cut' });
        }
    }
    return out;
}

// ---- registration marks ---------------------------------------------------
export function registrationLoops(o) {
    const out = [];
    const s = Math.min(o.w, o.h) * 0.12;
    const corners = [[0, 0], [o.w, 0], [o.w, o.h], [0, o.h]];
    for (const [cx, cy] of corners) {
        out.push({ pts: [{ x: cx - s, y: cy }, { x: cx + s, y: cy }], closed: false, op: 'score' });
        out.push({ pts: [{ x: cx, y: cy - s }, { x: cx, y: cy + s }], closed: false, op: 'score' });
        const ring = [];
        for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2; ring.push({ x: cx + s * 0.55 * Math.cos(a), y: cy + s * 0.55 * Math.sin(a) }); }
        out.push({ pts: ring, closed: true, op: 'score' });
    }
    return out;
}

// ---- factories ------------------------------------------------------------
export function createBox(p = {}) {
    const o = { id: uid('bx'), type: 'box', name: 'Box', op: 'cut', x: 15, y: 15, rotation: 0, visible: true,
        boxW: 80, boxD: 60, boxH: 40, thickness: 3, tab: 12, ...p };
    const s = boxNetSize(o); o.w = s.w; o.h = s.h; return o;
}
export function createGear(p = {}) {
    return { id: uid('gr'), type: 'gear', name: 'Gear', op: 'cut', x: 20, y: 20, w: 70, h: 70,
        rotation: 0, visible: true, teeth: 16, bore: 5, ...p };
}
export function createRuler(p = {}) {
    return { id: uid('ru'), type: 'ruler', name: 'Ruler', op: 'engrave', x: 10, y: 10, w: 150, h: 22,
        rotation: 0, visible: true, ...p };
}
export function createHinge(p = {}) {
    return { id: uid('hg'), type: 'hinge', name: 'Living hinge', op: 'cut', x: 15, y: 15, w: 100, h: 60,
        rotation: 0, visible: true, colGap: 3, slit: 10, ...p };
}
export function createRegistration(p = {}) {
    return { id: uid('rg'), type: 'registration', name: 'Registration', op: 'score', x: 10, y: 10, w: 120, h: 120,
        rotation: 0, visible: true, ...p };
}
