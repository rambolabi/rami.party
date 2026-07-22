// objects.js — object factories, preview drawing, and vector geometry (pure JS)

import { uid, applyTransform, OP_COLORS, simplify, clamp, hatchFill, applyBridges } from './geometry.js';
import { decodeImage, imageToImageData, processImageData, DEFAULT_IMAGE_PARAMS } from './image.js';
import { traceBinary, binaryFromImageData, centerlineTrace } from './trace.js';
import { qrGenerate } from './qr.js';
import { boxLocalLoops, gearLocalLoops, rulerLoops, hingeLoops, registrationLoops } from './generators.js';
import { encodeCode128B } from './barcode.js';

// ---- shared measuring canvas ----------------------------------------------
const measureCanvas = document.createElement('canvas');
const measureCtx = measureCanvas.getContext('2d');

function fontString(obj, sizePx) {
    const style = `${obj.italic ? 'italic ' : ''}${obj.bold ? '700 ' : '400 '}`;
    return `${style}${sizePx}px ${obj.font}`;
}

export function measureText(obj) {
    const lines = String(obj.text).split('\n');
    const K = 8; // px per mm for measuring
    measureCtx.font = fontString(obj, obj.sizeMM * K);
    let maxW = 1;
    for (const ln of lines) maxW = Math.max(maxW, measureCtx.measureText(ln || ' ').width);
    const wMM = maxW / K;
    const hMM = lines.length * obj.sizeMM * obj.lineHeight;
    return { wMM: Math.max(1, wMM), hMM: Math.max(1, hMM), lines };
}

// ---- factories ------------------------------------------------------------
export function createText(props = {}) {
    const o = {
        id: uid('t'), type: 'text', name: 'Text', op: 'engrave',
        x: 10, y: 10, rotation: 0, visible: true,
        text: 'Laser', font: 'Quicksand, sans-serif', sizeMM: 20,
        bold: false, italic: false, align: 'left', lineHeight: 1.15,
        fill: true, mirror: false, arc: 0, ...props,
    };
    const m = measureText(o);
    o.w = m.wMM; o.h = m.hMM;
    return o;
}

export function createShape(kind, props = {}) {
    const base = {
        id: uid('s'), type: 'shape', shape: kind, name: kind[0].toUpperCase() + kind.slice(1),
        op: kind === 'line' ? 'cut' : 'engrave', x: 20, y: 20, w: 40, h: 40,
        rotation: 0, visible: true, radiusMM: 4, sides: 6, points: 5, innerRatio: 0.5,
        ...props,
    };
    if (kind === 'line') { base.h = base.h || 0.1; }
    return base;
}

export function createQR(props = {}) {
    const o = {
        id: uid('q'), type: 'qr', name: 'QR code', op: 'engrave',
        x: 20, y: 20, w: 40, h: 40, rotation: 0, visible: true,
        data: 'https://rami.party', ecl: 'M', quiet: 4, ...props,
    };
    return o;
}

export function createPuzzle(props = {}) {
    return {
        id: uid('pz'), type: 'puzzle', name: 'Puzzle', op: 'cut',
        x: 20, y: 20, w: 120, h: 120, rotation: 0, visible: true,
        style: 'jigsaw',        // 'jigsaw' | 'tessellation' | 'geometric' | 'voronoi' | 'custom'
        rows: 4, cols: 4, tab: 0.2, tabStyle: 'semicircle', numbered: false,
        geoShape: 'square',     // 'square' | 'triangle' | 'hexagon'
        edgeH: [], edgeV: [],   // custom tessellation edge profiles ({t,o} interior points)
        seed: (Math.random() * 1e9) | 0,
        icon: '', iconSizeMM: 0,
        ...props,
    };
}

export async function createImageFromFile(file) {
    const dataURL = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(file);
    });
    const img = await decodeImage(dataURL);
    const natW = img.naturalWidth, natH = img.naturalHeight;
    // default physical size: fit long edge to 80mm
    const long = Math.max(natW, natH);
    const scale = 80 / long;
    return {
        id: uid('i'), type: 'image', name: file.name || 'Image', op: 'engrave',
        x: 15, y: 15, w: natW * scale, h: natH * scale, rotation: 0, visible: true,
        src: dataURL, natW, natH,
        params: { ...DEFAULT_IMAGE_PARAMS },
    };
}

// ---- local geometry (0..w, 0..h) ------------------------------------------
function ellipseLoop(w, h, n = 96) {
    const loop = [];
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        loop.push({ x: w / 2 + (w / 2) * Math.cos(a), y: h / 2 + (h / 2) * Math.sin(a) });
    }
    return loop;
}
function roundedRectLoop(w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    if (r <= 0.001) return [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
    const loop = [];
    const seg = 10;
    const corners = [
        { cx: w - r, cy: r, a0: -Math.PI / 2, a1: 0 },
        { cx: w - r, cy: h - r, a0: 0, a1: Math.PI / 2 },
        { cx: r, cy: h - r, a0: Math.PI / 2, a1: Math.PI },
        { cx: r, cy: r, a0: Math.PI, a1: (3 * Math.PI) / 2 },
    ];
    for (const c of corners)
        for (let i = 0; i <= seg; i++) {
            const a = c.a0 + (c.a1 - c.a0) * (i / seg);
            loop.push({ x: c.cx + r * Math.cos(a), y: c.cy + r * Math.sin(a) });
        }
    return loop;
}
function polygonLoop(w, h, sides) {
    const loop = [];
    for (let i = 0; i < sides; i++) {
        const a = -Math.PI / 2 + (i / sides) * Math.PI * 2;
        loop.push({ x: w / 2 + (w / 2) * Math.cos(a), y: h / 2 + (h / 2) * Math.sin(a) });
    }
    return loop;
}
function starLoop(w, h, points, innerRatio) {
    const loop = [];
    for (let i = 0; i < points * 2; i++) {
        const rad = i % 2 === 0 ? 1 : innerRatio;
        const a = -Math.PI / 2 + (i / (points * 2)) * Math.PI * 2;
        loop.push({ x: w / 2 + (w / 2) * rad * Math.cos(a), y: h / 2 + (h / 2) * rad * Math.sin(a) });
    }
    return loop;
}
function heartLoop(w, h) {
    const loop = [];
    const n = 90;
    for (let i = 0; i <= n; i++) {
        const t = (i / n) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        loop.push({ x, y: -y });
    }
    // normalise to 0..w / 0..h
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of loop) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
    return loop.map((p) => ({ x: ((p.x - minX) / (maxX - minX)) * w, y: ((p.y - minY) / (maxY - minY)) * h }));
}

function shapeLocalLoops(obj) {
    switch (obj.shape) {
        case 'rect': return [{ pts: roundedRectLoop(obj.w, obj.h, obj.radiusMM || 0), closed: true }];
        case 'circle': return [{ pts: ellipseLoop(obj.w, obj.h), closed: true }];
        case 'polygon': return [{ pts: polygonLoop(obj.w, obj.h, Math.max(3, obj.sides | 0)), closed: true }];
        case 'star': return [{ pts: starLoop(obj.w, obj.h, Math.max(3, obj.points | 0), obj.innerRatio), closed: true }];
        case 'heart': return [{ pts: heartLoop(obj.w, obj.h), closed: true }];
        case 'line': return [{ pts: [{ x: 0, y: obj.h / 2 }, { x: obj.w, y: obj.h / 2 }], closed: false }];
        default: return [];
    }
}

const _qrCache = new Map(); // "data|ecl" -> {size, modules}
function qrMatrix(data, ecl) {
    const key = `${ecl}|${data}`;
    let m = _qrCache.get(key);
    if (!m) { m = qrGenerate(data || ' ', ecl || 'M'); _qrCache.set(key, m); if (_qrCache.size > 40) _qrCache.delete(_qrCache.keys().next().value); }
    return m;
}
function qrLocalLoops(obj) {
    const { size, modules } = qrMatrix(obj.data || ' ', obj.ecl || 'M');
    const quiet = obj.quiet ?? 4;
    const total = size + quiet * 2;
    const cell = Math.min(obj.w, obj.h) / total;
    const ox = (obj.w - cell * total) / 2 + quiet * cell;
    const oy = (obj.h - cell * total) / 2 + quiet * cell;
    const loops = [];
    for (let r = 0; r < size; r++)
        for (let c = 0; c < size; c++)
            if (modules[r][c]) {
                const x = ox + c * cell, y = oy + r * cell;
                loops.push({
                    pts: [{ x, y }, { x: x + cell, y }, { x: x + cell, y: y + cell }, { x, y: y + cell }],
                    closed: true,
                });
            }
    obj._qrCell = cell; obj._qrOx = ox; obj._qrOy = oy; obj._qrSize = size;
    return loops;
}

// Trace text glyphs to outline loops (local mm coords).
function textLocalLoops(obj) {
    const m = measureText(obj);
    const K = 12; // px per mm raster resolution for tracing
    const W = Math.max(2, Math.ceil(m.wMM * K));
    const H = Math.max(2, Math.ceil(m.hMM * K));
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'top';
    ctx.font = fontString(obj, obj.sizeMM * K);
    ctx.textAlign = obj.align;
    const lineH = obj.sizeMM * obj.lineHeight * K;
    let ax = 0;
    if (obj.align === 'center') ax = W / 2;
    else if (obj.align === 'right') ax = W;
    m.lines.forEach((ln, i) => ctx.fillText(ln, ax, i * lineH));
    const img = ctx.getImageData(0, 0, W, H);
    const { bin, width, height } = binaryFromImageData(img, { threshold: 128 });
    let loops;
    if (obj.singleLine) {
        loops = centerlineTrace(bin, width, height).map((lp) => ({
            pts: simplify(lp.map((p) => ({ x: p.x / K, y: p.y / K })), 0.08, false),
            closed: false, op: 'engrave',
        })).filter((l) => l.pts.length >= 2);
    } else {
        loops = traceBinary(bin, width, height).map((lp) => ({
            pts: simplify(lp.map((p) => ({ x: p.x / K, y: p.y / K })), 0.06, true),
            closed: true,
        }));
    }
    if (obj.arc) {
        const arc = (obj.arc * Math.PI) / 180;
        const Wm = m.wMM, Hm = m.hMM;
        const R = Math.abs(arc) > 1e-3 ? Wm / arc : 1e6;
        loops = loops.map((l) => ({
            closed: l.closed,
            op: l.op,
            pts: l.pts.map((p) => {
                const ang = -arc / 2 + (p.x / Wm) * arc;
                const rr = R - (Hm - p.y);
                return { x: Wm / 2 + rr * Math.sin(ang), y: R - rr * Math.cos(ang) };
            }),
        }));
    }
    return loops;
}

function imageTraceLocalLoops(obj) {
    // For vector export of an image: trace the (dithered) silhouette outline.
    const cache = getValidProcessed(obj, 900) || getStaleProcessed(obj, 900);
    if (!cache || !cache.imageData) return [];
    const { bin, width, height } = binaryFromImageData(cache.imageData, { threshold: 128 });
    const loops = traceBinary(bin, width, height);
    const sx = obj.w / width, sy = obj.h / height;
    return loops.map((lp) => ({
        pts: simplify(lp.map((p) => ({ x: p.x * sx, y: p.y * sy })), 0.08, true),
        closed: true,
    }));
}

// ---- puzzle generation ----------------------------------------------------
function mulberry32(a) {
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// One edge with an interlocking tab. style 'neck' = locking dovetail, else semicircle.
function tabbedEdge(A, B, tabFrac, dir, style) {
    if (!dir) return [{ x: A.x, y: A.y }, { x: B.x, y: B.y }];
    const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L, nx = -uy * dir, ny = ux * dir;
    const r = tabFrac * L;
    if (style === 'neck') {
        const c = L / 2, base = r * 0.55, top = r * 0.95, depth = r;
        const P = [{ s: c - base, o: 0 }, { s: c - top, o: depth }, { s: c + top, o: depth }, { s: c + base, o: 0 }];
        const pts = [{ x: A.x, y: A.y }];
        for (const p of P) pts.push({ x: A.x + ux * p.s + nx * p.o, y: A.y + uy * p.s + ny * p.o });
        pts.push({ x: B.x, y: B.y });
        return pts;
    }
    const s0 = L / 2 - r, s1 = L / 2 + r, N = 18;
    const pts = [{ x: A.x, y: A.y }];
    for (let i = 0; i <= N; i++) {
        const s = s0 + ((s1 - s0) * i) / N;
        const perp = Math.sqrt(Math.max(0, r * r - (s - L / 2) ** 2));
        pts.push({ x: A.x + ux * s + nx * perp, y: A.y + uy * s + ny * perp });
    }
    pts.push({ x: B.x, y: B.y });
    return pts;
}

// Liang–Barsky segment clip to the rect [0,w]x[0,h].
function clipSeg(x0, y0, x1, y1, w, h) {
    let t0 = 0, t1 = 1;
    const dx = x1 - x0, dy = y1 - y0;
    const p = [-dx, dx, -dy, dy], q = [x0, w - x0, y0, h - y0];
    for (let i = 0; i < 4; i++) {
        if (p[i] === 0) { if (q[i] < 0) return null; }
        else {
            const t = q[i] / p[i];
            if (p[i] < 0) { if (t > t1) return null; if (t > t0) t0 = t; }
            else { if (t < t0) return null; if (t < t1) t1 = t; }
        }
    }
    return [{ x: x0 + t0 * dx, y: y0 + t0 * dy }, { x: x0 + t1 * dx, y: y0 + t1 * dy }];
}

function iconLoops(char, font, sizeMM) {
    const t = { text: char, font, sizeMM, bold: false, italic: false, align: 'left', lineHeight: 1 };
    const m = measureText(t);
    return { loops: textLocalLoops(t), wMM: m.wMM, hMM: m.hMM };
}

function hexTiling(obj, out) {
    const { w, h } = obj;
    const cols = Math.max(1, obj.cols | 0);
    const s = w / (cols * Math.sqrt(3));
    const hstep = Math.sqrt(3) * s, vstep = 1.5 * s;
    const seen = new Set();
    const key = (a, b) => {
        const k1 = `${a.x.toFixed(2)},${a.y.toFixed(2)}`, k2 = `${b.x.toFixed(2)},${b.y.toFixed(2)}`;
        return k1 < k2 ? k1 + '|' + k2 : k2 + '|' + k1;
    };
    const nrows = Math.ceil(h / vstep) + 2, ncols = cols + 2;
    for (let row = -1; row < nrows; row++) {
        for (let col = -1; col < ncols; col++) {
            const cx = col * hstep + ((row & 1) ? hstep / 2 : 0);
            const cy = row * vstep;
            const v = [];
            for (let k = 0; k < 6; k++) {
                const a = (Math.PI / 180) * (60 * k - 90);
                v.push({ x: cx + s * Math.cos(a), y: cy + s * Math.sin(a) });
            }
            for (let k = 0; k < 6; k++) {
                const A = v[k], B = v[(k + 1) % 6];
                const c = clipSeg(A.x, A.y, B.x, B.y, w, h);
                if (!c || Math.hypot(c[0].x - c[1].x, c[0].y - c[1].y) < 0.05) continue;
                const kk = key(c[0], c[1]);
                if (seen.has(kk)) continue;
                seen.add(kk);
                out.push({ pts: c, closed: false, op: 'cut' });
            }
        }
    }
}

function geometricTiling(obj, out, cw, ch, rows, cols) {
    const { w, h } = obj;
    const shape = obj.geoShape || 'square';
    const cut = (pts) => out.push({ pts, closed: false, op: 'cut' });
    if (shape === 'hexagon') { hexTiling(obj, out); return; }
    for (let c = 1; c < cols; c++) cut([{ x: c * cw, y: 0 }, { x: c * cw, y: h }]);
    for (let r = 1; r < rows; r++) cut([{ x: 0, y: r * ch }, { x: w, y: r * ch }]);
    if (shape === 'triangle')
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
            cut([{ x: c * cw, y: r * ch }, { x: (c + 1) * cw, y: (r + 1) * ch }]);
}

function clipHalf(poly, M, nx, ny) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length];
        const da = (a.x - M.x) * nx + (a.y - M.y) * ny;
        const db = (b.x - M.x) * nx + (b.y - M.y) * ny;
        if (da <= 0) out.push(a);
        if ((da < 0) !== (db < 0)) {
            const t = da / (da - db);
            out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
        }
    }
    return out;
}

function voronoiTiling(obj, out) {
    const { w, h } = obj;
    const rng = mulberry32((obj.seed | 0) || 1);
    const n = Math.max(2, Math.min(200, (obj.rows | 0) * (obj.cols | 0)));
    const sites = [];
    for (let i = 0; i < n; i++) sites.push({ x: rng() * w, y: rng() * h });
    const rect = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
    const seen = new Set();
    const key = (a, b) => {
        const k1 = a.x.toFixed(2) + ',' + a.y.toFixed(2), k2 = b.x.toFixed(2) + ',' + b.y.toFixed(2);
        return k1 < k2 ? k1 + '|' + k2 : k2 + '|' + k1;
    };
    sites.forEach((s, idx) => {
        let poly = rect;
        for (const t of sites) {
            if (t === s) continue;
            poly = clipHalf(poly, { x: (s.x + t.x) / 2, y: (s.y + t.y) / 2 }, t.x - s.x, t.y - s.y);
            if (poly.length < 3) break;
        }
        if (poly.length < 3) return;
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i], b = poly[(i + 1) % poly.length];
            if (Math.hypot(a.x - b.x, a.y - b.y) < 0.05) continue;
            const kk = key(a, b);
            if (seen.has(kk)) continue;
            seen.add(kk);
            out.push({ pts: [a, b], closed: false, op: 'cut' });
        }
        if (obj.numbered) {
            let cx = 0, cy = 0;
            for (const p of poly) { cx += p.x; cy += p.y; }
            cx /= poly.length; cy /= poly.length;
            const g = iconLoops(String(idx + 1), 'sans-serif', (Math.min(w, h) / Math.sqrt(n)) * 0.28);
            for (const l of g.loops)
                out.push({ pts: l.pts.map((p) => ({ x: cx - g.wMM / 2 + p.x, y: cy - g.hMM / 2 + p.y })), closed: l.closed, op: 'engrave' });
        }
    });
}

// Custom tessellation: a user-drawn tile whose opposite edges match by translation,
// so every interior piece is congruent (the "Connecting Cats" principle).
function customPuzzle(obj, out, rows, cols, cw, ch) {
    const eh = [...(obj.edgeH || [])].sort((a, b) => a.t - b.t);
    const ev = [...(obj.edgeV || [])].sort((a, b) => a.t - b.t);
    // internal vertical edges use the left/vertical profile (offset is horizontal → ×cw)
    for (let c = 1; c < cols; c++) for (let r = 0; r < rows; r++) {
        const x = c * cw, y0 = r * ch;
        const pts = [{ x, y: y0 }];
        for (const p of ev) pts.push({ x: x + p.o * cw, y: y0 + p.t * ch });
        pts.push({ x, y: (r + 1) * ch });
        out.push({ pts, closed: false, op: 'cut' });
    }
    // internal horizontal edges use the top/horizontal profile (offset is vertical → ×ch)
    for (let r = 1; r < rows; r++) for (let c = 0; c < cols; c++) {
        const y = r * ch, x0 = c * cw;
        const pts = [{ x: x0, y }];
        for (const p of eh) pts.push({ x: x0 + p.t * cw, y: y + p.o * ch });
        pts.push({ x: (c + 1) * cw, y });
        out.push({ pts, closed: false, op: 'cut' });
    }
}

function puzzleLocalLoops(obj) {
    const { w, h } = obj;
    const rows = Math.max(1, obj.rows | 0), cols = Math.max(1, obj.cols | 0);
    const out = [];
    const cut = (pts, closed = false) => out.push({ pts, closed, op: 'cut' });
    cut([{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }], true); // border
    const cw = w / cols, ch = h / rows;

    if (obj.style === 'geometric') {
        geometricTiling(obj, out, cw, ch, rows, cols);
    } else if (obj.style === 'voronoi') {
        voronoiTiling(obj, out);
    } else if (obj.style === 'custom') {
        customPuzzle(obj, out, rows, cols, cw, ch);
    } else if (obj.style === 'spiral') {
        spiralPuzzle(obj, out);
    } else {
        const tab = clamp(obj.tab ?? 0.2, 0.05, 0.4);
        const tess = obj.style === 'tessellation';
        const st = obj.tabStyle;
        const rng = mulberry32((obj.seed | 0) || 1);
        for (let c = 1; c < cols; c++) for (let r = 0; r < rows; r++) {
            const x = c * cw, dir = tess ? 1 : (rng() < 0.5 ? 1 : -1);
            cut(tabbedEdge({ x, y: r * ch }, { x, y: (r + 1) * ch }, tab, dir, st));
        }
        for (let r = 1; r < rows; r++) for (let c = 0; c < cols; c++) {
            const y = r * ch, dir = tess ? 1 : (rng() < 0.5 ? 1 : -1);
            cut(tabbedEdge({ x: c * cw, y }, { x: (c + 1) * cw, y }, tab, dir, st));
        }
    }

    // optional repeating icon engraved in each cell (grid styles)
    if (obj.icon && obj.icon.trim() && obj.style !== 'voronoi' && obj.geoShape !== 'hexagon') {
        const size = obj.iconSizeMM > 0 ? obj.iconSizeMM : Math.min(cw, ch) * 0.5;
        const ic = iconLoops(obj.icon.trim().slice(0, 2), 'sans-serif', size);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
            const ox = (c + 0.5) * cw - ic.wMM / 2, oy = (r + 0.5) * ch - ic.hMM / 2;
            for (const l of ic.loops)
                out.push({ pts: l.pts.map((p) => ({ x: ox + p.x, y: oy + p.y })), closed: l.closed, op: 'engrave' });
        }
    }
    // optional numbered pieces (grid styles)
    if (obj.numbered && obj.style !== 'voronoi' && !(obj.style === 'geometric' && obj.geoShape === 'hexagon')) {
        let nSeq = 1;
        const size = Math.min(cw, ch) * 0.3;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
            const g = iconLoops(String(nSeq++), 'sans-serif', size);
            const ox = (c + 0.5) * cw - g.wMM / 2, oy = (r + 0.72) * ch - g.hMM / 2;
            for (const l of g.loops)
                out.push({ pts: l.pts.map((p) => ({ x: ox + p.x, y: oy + p.y })), closed: l.closed, op: 'engrave' });
        }
    }
    return out;
}

function barcodeLocalLoops(obj) {
    const { bits, modules } = encodeCode128B(obj.data || '');
    const quiet = obj.quiet ?? 10;
    const total = modules + quiet * 2;
    const unit = obj.w / total;
    const barH = obj.showText ? obj.h * 0.78 : obj.h;
    const out = [];
    let i = 0;
    while (i < bits.length) {
        if (bits[i]) {
            let j = i; while (j < bits.length && bits[j]) j++;
            const x = (quiet + i) * unit, bw = (j - i) * unit;
            out.push({ pts: [{ x, y: 0 }, { x: x + bw, y: 0 }, { x: x + bw, y: barH }, { x, y: barH }], closed: true, op: 'engrave' });
            i = j;
        } else i++;
    }
    if (obj.showText && (obj.data || '').length) {
        const size = Math.min(obj.h * 0.18, (obj.w / (obj.data.length || 1)) * 1.3);
        const g = iconLoops(obj.data, 'monospace', size);
        for (const l of g.loops)
            out.push({ pts: l.pts.map((p) => ({ x: (obj.w - g.wMM) / 2 + p.x, y: barH + 0.5 + p.y })), closed: l.closed, op: 'engrave' });
    }
    return out;
}

export function createBarcode(props = {}) {
    return {
        id: uid('bc'), type: 'barcode', name: 'Barcode', op: 'engrave',
        x: 20, y: 20, w: 90, h: 30, rotation: 0, visible: true,
        data: 'RAMI-1234', quiet: 10, showText: true, ...props,
    };
}

function spiralPuzzle(obj, out) {
    const { w, h } = obj;
    const cx = w / 2, cy = h / 2;
    const turns = Math.max(2, (obj.rows | 0) + (obj.cols | 0));
    const rMax = (Math.min(w, h) / 2) * 0.96;
    const b = rMax / (turns * 2 * Math.PI);
    const pts = [];
    const steps = turns * 120;
    for (let i = 0; i <= steps; i++) {
        const th = (i / steps) * turns * 2 * Math.PI, r = b * th;
        pts.push({ x: cx + r * Math.cos(th), y: cy + r * Math.sin(th) });
    }
    out.push({ pts, closed: false, op: 'cut' });
}

// ---- path object (imported / traced / boolean output) ---------------------
export function createPath(absLoops, props = {}) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const l of absLoops) for (const p of l.pts) {
        if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y;
    }
    if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 1; maxY = 1; }
    const w = Math.max(0.1, maxX - minX), h = Math.max(0.1, maxY - minY);
    const loops = absLoops.map((l) => ({
        pts: l.pts.map((p) => ({ x: p.x - minX, y: p.y - minY })),
        closed: l.closed !== false, op: l.op,
    }));
    return {
        id: uid('pa'), type: 'path', name: 'Path', op: 'cut',
        x: minX, y: minY, w, h, _basew: w, _baseh: h, rotation: 0, visible: true,
        loops, hatch: 0, hatchAngle: 0, bridges: 0, bridgeGap: 1.5, ...props,
    };
}
function pathLocalLoops(obj) {
    const sx = obj._basew ? obj.w / obj._basew : 1, sy = obj._baseh ? obj.h / obj._baseh : 1;
    return obj.loops.map((l) => ({ pts: l.pts.map((p) => ({ x: p.x * sx, y: p.y * sy })), closed: l.closed, op: l.op }));
}

// Trace an image object to vector loops (absolute mm). mode: 'outline' | 'centerline'.
export function traceImageToVector(obj, mode = 'outline') {
    const cache = getValidProcessed(obj, 900) || getStaleProcessed(obj, 900);
    if (!cache || !cache.imageData) return null;
    const { bin, width, height } = binaryFromImageData(cache.imageData, { threshold: 128 });
    const sx = obj.w / width, sy = obj.h / height;
    let loops;
    if (mode === 'centerline') {
        loops = centerlineTrace(bin, width, height).map((l) => ({
            pts: simplify(l.map((p) => ({ x: obj.x + p.x * sx, y: obj.y + p.y * sy })), 0.12, false),
            closed: false, op: 'engrave',
        }));
    } else {
        loops = traceBinary(bin, width, height).map((l) => ({
            pts: simplify(l.map((p) => ({ x: obj.x + p.x * sx, y: obj.y + p.y * sy })), 0.1, true),
            closed: true, op: 'cut',
        }));
    }
    return loops.filter((l) => l.pts.length >= 2);
}

// Combine selected objects' filled areas via a raster mask, trace back to vectors.
export function booleanObjects(objs, mode) {
    const all = objs.map((o) => objectLoops(o)).filter(Boolean);
    if (all.length < 2) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const loops of all) for (const l of loops) for (const p of l.pts) {
        if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y;
    }
    const scale = 6;
    const W = Math.max(2, Math.ceil((maxX - minX) * scale) + 2), H = Math.max(2, Math.ceil((maxY - minY) * scale) + 2);
    const maskOf = (loops) => {
        const c = document.createElement('canvas'); c.width = W; c.height = H;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff'; ctx.beginPath();
        for (const l of loops) {
            if (!l.closed) continue;
            l.pts.forEach((p, i) => { const X = (p.x - minX) * scale + 1, Y = (p.y - minY) * scale + 1; i === 0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); });
            ctx.closePath();
        }
        ctx.fill('evenodd');
        const d = ctx.getImageData(0, 0, W, H).data, m = new Uint8Array(W * H);
        for (let i = 0, q = 0; i < d.length; i += 4, q++) m[q] = d[i] > 128 ? 1 : 0;
        return m;
    };
    const acc = maskOf(all[0]);
    for (let k = 1; k < all.length; k++) {
        const b = maskOf(all[k]);
        for (let i = 0; i < acc.length; i++) {
            if (mode === 'union') acc[i] = acc[i] | b[i];
            else if (mode === 'intersect') acc[i] = acc[i] & b[i];
            else if (mode === 'subtract') acc[i] = acc[i] & (b[i] ? 0 : 1);
            else if (mode === 'xor') acc[i] = acc[i] ^ b[i];
        }
    }
    const loops = traceBinary(acc, W, H).map((l) => ({
        pts: simplify(l.map((p) => ({ x: minX + (p.x - 1) / scale, y: minY + (p.y - 1) / scale })), 0.18, true),
        closed: true, op: 'cut',
    })).filter((l) => l.pts.length >= 3);
    return loops.length ? loops : null;
}

// ---- material test grid ---------------------------------------------------
function testGridLoops(obj, glyph) {
    const { w, h } = obj;
    const rows = Math.max(1, obj.rows | 0), cols = Math.max(1, obj.cols | 0);
    const cw = w / (cols + 1), ch = h / (rows + 1);
    const out = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = (c + 1) * cw + cw * 0.15, y = (r + 1) * ch + ch * 0.15, sw = cw * 0.7, sh = ch * 0.7;
        out.push({ pts: [{ x, y }, { x: x + sw, y }, { x: x + sw, y: y + sh }, { x, y: y + sh }], closed: true, op: 'engrave' });
    }
    const label = (str, ox, oy) => {
        const g = glyph(str, 'sans-serif', Math.min(cw, ch) * 0.26);
        for (const l of g.loops) out.push({ pts: l.pts.map((p) => ({ x: ox - g.wMM / 2 + p.x, y: oy - g.hMM / 2 + p.y })), closed: l.closed, op: 'engrave' });
    };
    for (let c = 0; c < cols; c++) {
        const val = Math.round(obj.powerMin + (obj.powerMax - obj.powerMin) * (cols > 1 ? c / (cols - 1) : 0));
        label(String(val), (c + 1) * cw + cw * 0.5, ch * 0.5);
    }
    for (let r = 0; r < rows; r++) {
        const val = Math.round(obj.speedMin + (obj.speedMax - obj.speedMin) * (rows > 1 ? r / (rows - 1) : 0));
        label(String(val), cw * 0.5, (r + 1) * ch + ch * 0.5);
    }
    out.push({ pts: [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }], closed: true, op: 'score' });
    return out;
}
export function createTestGrid(props = {}) {
    return {
        id: uid('tg'), type: 'testgrid', name: 'Material test', op: 'engrave',
        x: 15, y: 15, w: 120, h: 120, rotation: 0, visible: true,
        rows: 5, cols: 5, powerMin: 10, powerMax: 100, speedMin: 100, speedMax: 1000, ...props,
    };
}

// hatch fill + bridge gaps (options on shapes / paths)
function applyLoopOptions(obj, loops) {
    if (!loops) return loops;
    let out = loops;
    if (obj.hatch > 0) {
        const region = out.filter((l) => l.closed).map((l) => l.pts);
        if (region.length) {
            const lines = hatchFill(region, obj.hatch, obj.hatchAngle || 0);
            out = out.map((l) => (l.closed ? { pts: l.pts, closed: false, op: 'engrave' } : l));
            for (const [a, b] of lines) out.push({ pts: [a, b], closed: false, op: 'engrave' });
        }
    }
    if (obj.bridges > 0) {
        const res = [];
        for (const l of out) {
            if (l.closed && (l.op || obj.op) === 'cut') {
                for (const seg of applyBridges(l.pts, obj.bridges | 0, obj.bridgeGap || 1.5)) res.push({ ...seg, op: l.op });
            } else res.push(l);
        }
        out = res;
    }
    return out;
}

// Returns local loops [{pts, closed, op?}]; null for pure-raster (image, unless traced).
export function localLoops(obj, { traceImage = false } = {}) {
    if (obj.type === 'shape') return applyLoopOptions(obj, shapeLocalLoops(obj));
    if (obj.type === 'path') return applyLoopOptions(obj, pathLocalLoops(obj));
    if (obj.type === 'qr') return qrLocalLoops(obj);
    if (obj.type === 'puzzle') return puzzleLocalLoops(obj);
    if (obj.type === 'barcode') return barcodeLocalLoops(obj);
    if (obj.type === 'box') return boxLocalLoops(obj);
    if (obj.type === 'gear') return applyLoopOptions(obj, gearLocalLoops(obj));
    if (obj.type === 'ruler') return rulerLoops(obj, iconLoops);
    if (obj.type === 'hinge') return hingeLoops(obj);
    if (obj.type === 'registration') return registrationLoops(obj);
    if (obj.type === 'testgrid') return testGridLoops(obj, iconLoops);
    if (obj.type === 'text') return textLocalLoops(obj);
    if (obj.type === 'image') return traceImage ? imageTraceLocalLoops(obj) : null;
    return [];
}

// Absolute mm loops with rotation applied (for vector exporters).
export function objectLoops(obj, opts = {}) {
    const local = localLoops(obj, opts);
    if (!local) return null;
    if (obj.mirror) for (const l of local) for (const p of l.pts) p.x = obj.w - p.x;
    return local.map((l) => ({
        closed: l.closed,
        op: l.op || obj.op,
        pts: l.pts.map((p) => applyTransform(obj, obj.x + p.x, obj.y + p.y)),
    }));
}

// ---- processed-image cache (for preview + trace) --------------------------
const _proc = new Map();        // `${id}@${longSide}` -> { key, imageData, canvas }
const _inflight = new Set();
function procKey(obj) {
    const p = obj.params || {};
    return [obj.src.length, obj.src.slice(-24),
        p.brightness, p.contrast, p.gamma, p.levelsBlack, p.levelsWhite, p.invert,
        p.dither, p.ditherCutoff, p.removeBg, p.bgThreshold,
        p.blur, p.sharpen, p.edge, p.posterize].join('|');
}
const cacheId = (obj, longSide) => `${obj.id}@${longSide}`;

export function getValidProcessed(obj, longSide) {
    const c = _proc.get(cacheId(obj, longSide));
    return c && c.key === procKey(obj) ? c : null;
}
export function getStaleProcessed(obj, longSide) {
    return _proc.get(cacheId(obj, longSide)) || null;
}
export async function produceProcessed(obj, longSide, onReady) {
    const key = procKey(obj);
    const id = cacheId(obj, longSide);
    const cur = _proc.get(id);
    if (cur && cur.key === key) return cur;
    const flight = `${id}#${key}`;
    if (_inflight.has(flight)) return cur;
    _inflight.add(flight);
    try {
        const img = await decodeImage(obj.src);
        const ratio = obj.natW / obj.natH;
        let W, H;
        if (ratio >= 1) { W = Math.max(1, Math.min(longSide, obj.natW)); H = Math.max(1, Math.round(W / ratio)); }
        else { H = Math.max(1, Math.min(longSide, obj.natH)); W = Math.max(1, Math.round(H * ratio)); }
        const srcData = imageToImageData(img, W, H);
        const imageData = processImageData(srcData, obj.params || {});
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        canvas.getContext('2d').putImageData(imageData, 0, 0);
        const entry = { key, imageData, canvas };
        _proc.set(id, entry);
        if (onReady) onReady(entry);
        return entry;
    } finally {
        _inflight.delete(flight);
    }
}

// ---- preview drawing (ctx already in mm-space; scale = px per mm) ----------
export function drawObject(ctx, obj, scale, { requestRedraw, colorOverride, imageLongSide } = {}) {
    if (obj.visible === false) return;
    const color = colorOverride || OP_COLORS[obj.op] || '#111';
    ctx.save();
    // rotation about centre
    if (obj.rotation) {
        const cx = obj.x + obj.w / 2, cy = obj.y + obj.h / 2;
        ctx.translate(cx, cy); ctx.rotate((obj.rotation * Math.PI) / 180); ctx.translate(-cx, -cy);
    }
    if (obj.mirror) {
        ctx.translate(obj.x + obj.w, 0); ctx.scale(-1, 1); ctx.translate(-obj.x, 0);
    }

    if (obj.type === 'image') {
        const longSide = imageLongSide || 1200;
        const valid = getValidProcessed(obj, longSide);
        const cv = valid ? valid.canvas : (getStaleProcessed(obj, longSide)?.canvas || null);
        if (cv) {
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(cv, obj.x, obj.y, obj.w, obj.h);
        } else {
            ctx.fillStyle = 'rgba(120,120,140,0.25)';
            ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        }
        if (!valid) produceProcessed(obj, longSide, () => requestRedraw && requestRedraw());
        ctx.restore();
        return;
    }

    if (obj.type === 'text' && obj.fill && obj.op === 'engrave' && !obj.arc && !obj.singleLine) {
        const m = measureText(obj);
        ctx.fillStyle = color;
        ctx.textBaseline = 'top';
        ctx.textAlign = obj.align;
        ctx.font = fontString(obj, obj.sizeMM);
        let ax = obj.x;
        if (obj.align === 'center') ax = obj.x + obj.w / 2;
        else if (obj.align === 'right') ax = obj.x + obj.w;
        m.lines.forEach((ln, i) => ctx.fillText(ln, ax, obj.y + i * obj.sizeMM * obj.lineHeight));
        ctx.restore();
        return;
    }

    // vector-drawn types (shape / qr / puzzle / outline text)
    const loops = localLoops(obj);
    if (loops) {
        ctx.lineJoin = 'round';
        ctx.lineWidth = Math.max(0.15, 1 / scale);
        const groups = new Map();
        for (const l of loops) {
            const op = l.op || obj.op;
            if (!groups.has(op)) groups.set(op, []);
            groups.get(op).push(l);
        }
        for (const [op, gl] of groups) {
            const c = colorOverride || OP_COLORS[op] || '#111';
            if (op === 'engrave') {
                // filled (closed) areas
                const closed = gl.filter((l) => l.closed);
                if (closed.length) {
                    ctx.beginPath();
                    for (const l of closed) {
                        l.pts.forEach((p, i) => { const X = obj.x + p.x, Y = obj.y + p.y; if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
                        ctx.closePath();
                    }
                    ctx.fillStyle = c; ctx.fill('evenodd');
                }
                // single-line / hatch (open) strokes
                const open = gl.filter((l) => !l.closed);
                if (open.length) {
                    ctx.beginPath();
                    for (const l of open) l.pts.forEach((p, i) => { const X = obj.x + p.x, Y = obj.y + p.y; if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
                    ctx.strokeStyle = c; ctx.stroke();
                }
            } else {
                ctx.beginPath();
                for (const l of gl) {
                    l.pts.forEach((p, i) => { const X = obj.x + p.x, Y = obj.y + p.y; if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
                    if (l.closed) ctx.closePath();
                }
                ctx.strokeStyle = c; ctx.stroke();
            }
        }
    }
    ctx.restore();
}
