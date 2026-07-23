// importers.js — bring external vector art in: SVG + DXF (R12) → absolute mm loops.
// Pure JS, no dependencies. Curves are flattened to polylines.

const PX2MM = 25.4 / 96;

// ---- shared: flatten cubic/quadratic/arc to points --------------------------
function cubic(p0, p1, p2, p3, out, steps = 24) {
    for (let i = 1; i <= steps; i++) {
        const t = i / steps, u = 1 - t;
        out.push({
            x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
            y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
        });
    }
}
function quad(p0, p1, p2, out, steps = 20) {
    for (let i = 1; i <= steps; i++) {
        const t = i / steps, u = 1 - t;
        out.push({ x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y });
    }
}
// SVG elliptical arc → points (endpoint parameterisation)
function svgArc(p0, rx, ry, phiDeg, large, sweep, p1, out, steps = 32) {
    if (rx === 0 || ry === 0) { out.push({ ...p1 }); return; }
    const phi = (phiDeg * Math.PI) / 180, cosP = Math.cos(phi), sinP = Math.sin(phi);
    const dx = (p0.x - p1.x) / 2, dy = (p0.y - p1.y) / 2;
    const x1 = cosP * dx + sinP * dy, y1 = -sinP * dx + cosP * dy;
    rx = Math.abs(rx); ry = Math.abs(ry);
    let l = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
    if (l > 1) { const s = Math.sqrt(l); rx *= s; ry *= s; }
    const sign = large === sweep ? -1 : 1;
    let num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
    num = Math.max(0, num);
    const co = sign * Math.sqrt(num / (rx * rx * y1 * y1 + ry * ry * x1 * x1)) || 0;
    const cxp = (co * rx * y1) / ry, cyp = (-co * ry * x1) / rx;
    const cx = cosP * cxp - sinP * cyp + (p0.x + p1.x) / 2;
    const cy = sinP * cxp + cosP * cyp + (p0.y + p1.y) / 2;
    const ang = (ux, uy, vx, vy) => {
        const dot = ux * vx + uy * vy, len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
        let a = Math.acos(Math.min(1, Math.max(-1, dot / len)));
        if (ux * vy - uy * vx < 0) a = -a; return a;
    };
    const theta1 = ang(1, 0, (x1 - cxp) / rx, (y1 - cyp) / ry);
    let dTheta = ang((x1 - cxp) / rx, (y1 - cyp) / ry, (-x1 - cxp) / rx, (-y1 - cyp) / ry);
    if (!sweep && dTheta > 0) dTheta -= 2 * Math.PI;
    if (sweep && dTheta < 0) dTheta += 2 * Math.PI;
    for (let i = 1; i <= steps; i++) {
        const t = theta1 + dTheta * (i / steps);
        const x = cosP * rx * Math.cos(t) - sinP * ry * Math.sin(t) + cx;
        const y = sinP * rx * Math.cos(t) + cosP * ry * Math.sin(t) + cy;
        out.push({ x, y });
    }
}

// ---- SVG path data parser ---------------------------------------------------
function parsePathData(d) {
    const toks = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [];
    const loops = [];
    let pts = [], cur = { x: 0, y: 0 }, start = { x: 0, y: 0 }, prevCtrl = null, cmd = '';
    let i = 0;
    const num = () => parseFloat(toks[i++]);
    const flush = (closed) => { if (pts.length > 1) loops.push({ pts, closed }); pts = []; };
    while (i < toks.length) {
        if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
        const rel = cmd === cmd.toLowerCase();
        const C = cmd.toUpperCase();
        const rx = (v) => (rel ? cur.x + v : v), ry = (v) => (rel ? cur.y + v : v);
        if (C === 'M') {
            if (pts.length) flush(false);
            cur = { x: rx(num()), y: ry(num()) }; start = { ...cur }; pts = [{ ...cur }]; prevCtrl = null;
            cmd = rel ? 'l' : 'L';
        } else if (C === 'L') { cur = { x: rx(num()), y: ry(num()) }; pts.push({ ...cur }); prevCtrl = null; }
        else if (C === 'H') { cur = { x: rel ? cur.x + num() : num(), y: cur.y }; pts.push({ ...cur }); prevCtrl = null; }
        else if (C === 'V') { cur = { x: cur.x, y: rel ? cur.y + num() : num() }; pts.push({ ...cur }); prevCtrl = null; }
        else if (C === 'C') {
            const c1 = { x: rx(num()), y: ry(num()) }, c2 = { x: rx(num()), y: ry(num()) }, e = { x: rx(num()), y: ry(num()) };
            cubic(cur, c1, c2, e, pts); prevCtrl = c2; cur = e;
        } else if (C === 'S') {
            const c1 = prevCtrl ? { x: 2 * cur.x - prevCtrl.x, y: 2 * cur.y - prevCtrl.y } : { ...cur };
            const c2 = { x: rx(num()), y: ry(num()) }, e = { x: rx(num()), y: ry(num()) };
            cubic(cur, c1, c2, e, pts); prevCtrl = c2; cur = e;
        } else if (C === 'Q') {
            const c1 = { x: rx(num()), y: ry(num()) }, e = { x: rx(num()), y: ry(num()) };
            quad(cur, c1, e, pts); prevCtrl = c1; cur = e;
        } else if (C === 'T') {
            const c1 = prevCtrl ? { x: 2 * cur.x - prevCtrl.x, y: 2 * cur.y - prevCtrl.y } : { ...cur };
            const e = { x: rx(num()), y: ry(num()) };
            quad(cur, c1, e, pts); prevCtrl = c1; cur = e;
        } else if (C === 'A') {
            const arx = num(), ary = num(), rot = num(), large = num(), sweep = num(), e = { x: rx(num()), y: ry(num()) };
            svgArc(cur, arx, ary, rot, large, sweep, e, pts); cur = e; prevCtrl = null;
        } else if (C === 'Z') { pts.push({ ...start }); flush(true); cur = { ...start }; prevCtrl = null; }
        else { i++; } // skip unknown token defensively
    }
    if (pts.length) flush(false);
    return loops;
}

function circlePts(cx, cy, r, steps = 48) {
    const pts = [];
    for (let i = 0; i < steps; i++) { const a = (i / steps) * 2 * Math.PI; pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }); }
    return pts;
}

// Parse an SVG string → array of {pts, closed} loops in mm.
export function importSVG(text) {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) throw new Error('No <svg> root found');
    // scale: user units → mm
    const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    const wAttr = svg.getAttribute('width') || '', hAttr = svg.getAttribute('height') || '';
    const parseLen = (s) => { const m = /([\d.]+)\s*(mm|cm|in|px)?/.exec(s); if (!m) return null; const v = parseFloat(m[1]); const u = m[2] || 'px'; return u === 'mm' ? v : u === 'cm' ? v * 10 : u === 'in' ? v * 25.4 : v * PX2MM; };
    let sx = PX2MM, sy = PX2MM;
    if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
        const wmm = parseLen(wAttr), hmm = parseLen(hAttr);
        if (wmm) sx = wmm / vb[2];
        if (hmm) sy = hmm / vb[3]; else sy = sx;
        if (!wmm) { sx = PX2MM; sy = PX2MM; }
    }
    const loops = [];
    const add = (arr, closed) => { if (arr.length > 1) loops.push({ pts: arr.map((p) => ({ x: p.x * sx, y: p.y * sy })), closed }); };
    svg.querySelectorAll('path').forEach((el) => { for (const l of parsePathData(el.getAttribute('d') || '')) add(l.pts, l.closed); });
    svg.querySelectorAll('rect').forEach((el) => {
        const x = +el.getAttribute('x') || 0, y = +el.getAttribute('y') || 0, w = +el.getAttribute('width') || 0, h = +el.getAttribute('height') || 0;
        if (w && h) add([{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }, { x, y }], true);
    });
    svg.querySelectorAll('circle').forEach((el) => { const r = +el.getAttribute('r') || 0; if (r) add(circlePts(+el.getAttribute('cx') || 0, +el.getAttribute('cy') || 0, r), true); });
    svg.querySelectorAll('ellipse').forEach((el) => {
        const rx = +el.getAttribute('rx') || 0, ry = +el.getAttribute('ry') || 0, cx = +el.getAttribute('cx') || 0, cy = +el.getAttribute('cy') || 0;
        if (rx && ry) { const p = []; for (let i = 0; i < 48; i++) { const a = (i / 48) * 2 * Math.PI; p.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) }); } add(p, true); }
    });
    svg.querySelectorAll('line').forEach((el) => add([{ x: +el.getAttribute('x1') || 0, y: +el.getAttribute('y1') || 0 }, { x: +el.getAttribute('x2') || 0, y: +el.getAttribute('y2') || 0 }], false));
    const poly = (el, closed) => {
        const nums = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
        const p = []; for (let i = 0; i + 1 < nums.length; i += 2) p.push({ x: nums[i], y: nums[i + 1] });
        add(p, closed);
    };
    svg.querySelectorAll('polygon').forEach((el) => poly(el, true));
    svg.querySelectorAll('polyline').forEach((el) => poly(el, false));
    if (!loops.length) throw new Error('No supported shapes found in SVG');
    return loops;
}

// ---- DXF R12 ASCII parser ---------------------------------------------------
export function importDXF(text) {
    const lines = text.split(/\r\n|\r|\n/);
    const pairs = [];
    for (let i = 0; i + 1 < lines.length; i += 2) pairs.push([parseInt(lines[i].trim(), 10), lines[i + 1].trim()]);
    const loops = [];
    let i = 0;
    // jump to ENTITIES
    while (i < pairs.length && !(pairs[i][0] === 2 && pairs[i][1] === 'ENTITIES')) i++;
    const arcPts = (cx, cy, r, a0, a1) => {
        const p = []; let d = a1 - a0; if (d <= 0) d += 360; const steps = Math.max(6, Math.ceil(d / 6));
        for (let k = 0; k <= steps; k++) { const a = ((a0 + (d * k) / steps) * Math.PI) / 180; p.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }); }
        return p;
    };
    for (; i < pairs.length; i++) {
        const [code, val] = pairs[i];
        if (code !== 0) continue;
        if (val === 'ENDSEC') break;
        if (val === 'LINE') {
            const e = {}; let j = i + 1;
            for (; j < pairs.length && pairs[j][0] !== 0; j++) { const [c, v] = pairs[j]; if (c === 10) e.x1 = +v; else if (c === 20) e.y1 = +v; else if (c === 11) e.x2 = +v; else if (c === 21) e.y2 = +v; }
            loops.push({ pts: [{ x: e.x1, y: e.y1 }, { x: e.x2, y: e.y2 }], closed: false }); i = j - 1;
        } else if (val === 'CIRCLE') {
            const e = {}; let j = i + 1;
            for (; j < pairs.length && pairs[j][0] !== 0; j++) { const [c, v] = pairs[j]; if (c === 10) e.cx = +v; else if (c === 20) e.cy = +v; else if (c === 40) e.r = +v; }
            loops.push({ pts: circlePts(e.cx, e.cy, e.r), closed: true }); i = j - 1;
        } else if (val === 'ARC') {
            const e = {}; let j = i + 1;
            for (; j < pairs.length && pairs[j][0] !== 0; j++) { const [c, v] = pairs[j]; if (c === 10) e.cx = +v; else if (c === 20) e.cy = +v; else if (c === 40) e.r = +v; else if (c === 50) e.a0 = +v; else if (c === 51) e.a1 = +v; }
            loops.push({ pts: arcPts(e.cx, e.cy, e.r, e.a0, e.a1), closed: false }); i = j - 1;
        } else if (val === 'LWPOLYLINE' || val === 'POLYLINE') {
            const pts = []; let closed = false; let j = i + 1; let vx = null;
            for (; j < pairs.length && pairs[j][0] !== 0; j++) {
                const [c, v] = pairs[j];
                if (c === 70) closed = (parseInt(v, 10) & 1) === 1;
                else if (c === 10) { vx = +v; }
                else if (c === 20 && vx != null) { pts.push({ x: vx, y: +v }); vx = null; }
            }
            // legacy POLYLINE uses VERTEX entities
            if (val === 'POLYLINE') {
                let k = j;
                while (k < pairs.length && !(pairs[k][0] === 0 && pairs[k][1] === 'SEQEND')) {
                    if (pairs[k][0] === 0 && pairs[k][1] === 'VERTEX') {
                        const vp = {}; let m = k + 1;
                        for (; m < pairs.length && pairs[m][0] !== 0; m++) { const [c, v] = pairs[m]; if (c === 10) vp.x = +v; else if (c === 20) vp.y = +v; }
                        if (vp.x != null) pts.push({ x: vp.x, y: vp.y }); k = m; continue;
                    }
                    k++;
                }
                j = k;
            }
            if (pts.length > 1) loops.push({ pts, closed }); i = j - 1;
        }
    }
    if (!loops.length) throw new Error('No supported DXF entities found');
    // DXF Y is up; flip so it matches our top-left screen space
    let maxY = -Infinity; for (const l of loops) for (const p of l.pts) maxY = Math.max(maxY, p.y);
    for (const l of loops) for (const p of l.pts) p.y = maxY - p.y;
    return loops;
}

export function importVector(filename, text) {
    const ext = (filename.split('.').pop() || '').toLowerCase();
    if (ext === 'dxf') return importDXF(text);
    return importSVG(text);
}
