// exporters.js — SVG / DXF / PDF / PNG / BMP / JPG / G-code writers (pure JS)

import { OP_COLORS, hexToRgb, offsetClosed, pathLength } from './geometry.js';
import { objectLoops, drawObject, produceProcessed } from './objects.js';

const MM2PT = 72 / 25.4;
const num = (n, d = 3) => {
    const v = Math.round(n * 10 ** d) / 10 ** d;
    return Object.is(v, -0) ? '0' : String(v);
};

function download(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
}
const textBlob = (s, type = 'text/plain') => new Blob([s], { type });

function visibleObjects(store) {
    return store.objects.filter((o) => o.visible !== false);
}

// Object loops with optional kerf compensation (expands closed cut paths).
function objLoops(obj, kerf) {
    const loops = objectLoops(obj);
    if (!loops || !kerf) return loops;
    return loops.map((l) => (l.closed && l.op === 'cut')
        ? { ...l, pts: offsetClosed(l.pts, kerf / 2) } : l);
}

// =====================================================================
// SVG (mm units, colour = operation, text/qr as paths, images embedded)
// =====================================================================
export async function toSVG(store, opts = {}) {
    const { widthMM: W, heightMM: H } = store.state.artboard;
    const layers = { engrave: [], score: [], cut: [] };
    const images = [];
    for (const obj of visibleObjects(store)) {
        if (obj.type === 'image') {
            const entry = await produceProcessed(obj, Math.max(obj.natW, obj.natH));
            const href = entry.canvas.toDataURL('image/png');
            const cx = obj.x + obj.w / 2, cy = obj.y + obj.h / 2;
            const tf = [];
            if (obj.rotation) tf.push(`rotate(${num(obj.rotation)} ${num(cx)} ${num(cy)})`);
            if (obj.mirror) tf.push(`translate(${num(2 * obj.x + obj.w)} 0) scale(-1 1)`);
            images.push(`<image x="${num(obj.x)}" y="${num(obj.y)}" width="${num(obj.w)}" height="${num(obj.h)}" ` +
                `${tf.length ? `transform="${tf.join(' ')}" ` : ''}xlink:href="${href}" preserveAspectRatio="none"/>`);
            continue;
        }
        const loops = objLoops(obj, opts.kerf);
        if (!loops || !loops.length) continue;
        const groups = new Map();
        for (const l of loops) { if (!groups.has(l.op)) groups.set(l.op, []); groups.get(l.op).push(l); }
        for (const [op, gl] of groups) {
            const color = OP_COLORS[op];
            if (!layers[op]) layers[op] = [];
            if (op === 'engrave') {
                const closed = gl.filter((l) => l.closed), open = gl.filter((l) => !l.closed);
                if (closed.length) {
                    let d = '';
                    for (const l of closed) { l.pts.forEach((p, i) => { d += `${i === 0 ? 'M' : 'L'}${num(p.x)} ${num(p.y)} `; }); d += 'Z '; }
                    layers[op].push(`<path d="${d.trim()}" fill="${color}" fill-rule="evenodd" stroke="none"/>`);
                }
                if (open.length) {
                    let d = '';
                    for (const l of open) l.pts.forEach((p, i) => { d += `${i === 0 ? 'M' : 'L'}${num(p.x)} ${num(p.y)} `; });
                    layers[op].push(`<path d="${d.trim()}" fill="none" stroke="${color}" stroke-width="0.1"/>`);
                }
            } else {
                let d = '';
                for (const l of gl) {
                    l.pts.forEach((p, i) => { d += `${i === 0 ? 'M' : 'L'}${num(p.x)} ${num(p.y)} `; });
                    if (l.closed) d += 'Z ';
                }
                layers[op].push(`<path d="${d.trim()}" fill="none" stroke="${color}" stroke-width="0.1"/>`);
            }
        }
    }
    const parts = [`<?xml version="1.0" encoding="UTF-8"?>`,
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
        `xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" ` +
        `width="${num(W)}mm" height="${num(H)}mm" viewBox="0 0 ${num(W)} ${num(H)}">`];
    if (images.length)
        parts.push(`<g inkscape:groupmode="layer" inkscape:label="Images" id="lf-images">${images.join('')}</g>`);
    for (const op of Object.keys(layers)) {
        const arr = layers[op];
        if (!arr || !arr.length) continue;
        parts.push(`<g inkscape:groupmode="layer" inkscape:label="${op}" id="lf-${op}" fill="none" stroke-width="0.1">${arr.join('')}</g>`);
    }
    parts.push(`</svg>`);
    return parts.join('\n');
}

// =====================================================================
// DXF R12 (ASCII) — POLYLINE/VERTEX entities, layers by operation
// =====================================================================
export function toDXF(store, opts = {}) {
    const { heightMM: H } = store.state.artboard;
    const fy = (y) => H - y; // flip to Y-up
    const layers = { engrave: 7, cut: 1, score: 5 };
    const L = [];
    const push = (code, val) => { L.push(code); L.push(val); };

    push(0, 'SECTION'); push(2, 'HEADER');
    push(9, '$ACADVER'); push(1, 'AC1009');
    push(9, '$INSUNITS'); push(70, 4); // millimetres
    push(0, 'ENDSEC');

    push(0, 'SECTION'); push(2, 'TABLES');
    push(0, 'TABLE'); push(2, 'LAYER'); push(70, 3);
    for (const [name, color] of Object.entries(layers)) {
        push(0, 'LAYER'); push(2, name); push(70, 0); push(62, color); push(6, 'CONTINUOUS');
    }
    push(0, 'ENDTAB'); push(0, 'ENDSEC');

    push(0, 'SECTION'); push(2, 'ENTITIES');
    for (const obj of visibleObjects(store)) {
        if (obj.type === 'image') continue; // raster not representable in DXF
        const loops = objLoops(obj, opts.kerf);
        if (!loops) continue;
        for (const l of loops) {
            const layer = l.op;
            push(0, 'POLYLINE'); push(8, layer); push(66, 1); push(70, l.closed ? 1 : 0);
            push(10, 0); push(20, 0); push(30, 0);
            for (const p of l.pts) {
                push(0, 'VERTEX'); push(8, layer);
                push(10, num(p.x)); push(20, num(fy(p.y))); push(30, 0);
            }
            push(0, 'SEQEND');
        }
    }
    push(0, 'ENDSEC'); push(0, 'EOF');

    let out = '';
    for (let i = 0; i < L.length; i += 2) out += `${L[i]}\n${L[i + 1]}\n`;
    return out;
}

// =====================================================================
// PDF (vector paths + embedded JPEG images), 1 page in points
// =====================================================================
export async function toPDF(store, opts = {}) {
    const { widthMM: W, heightMM: H } = store.state.artboard;
    const Wp = W * MM2PT, Hp = H * MM2PT;
    const fy = (y) => Hp - y * MM2PT;   // flip to PDF y-up
    const fx = (x) => x * MM2PT;

    const objects = [];   // array of Uint8Array/string bodies
    const enc = new TextEncoder();
    const addObj = (body) => { objects.push(body); return objects.length; };

    // Build content stream + image XObjects
    const images = [];
    let content = '1 J 1 j\n';
    for (const obj of visibleObjects(store)) {
        if (obj.type === 'image') {
            const entry = await produceProcessed(obj, Math.max(obj.natW, obj.natH));
            const dataURL = entry.canvas.toDataURL('image/jpeg', 0.92);
            const bytes = base64ToBytes(dataURL.split(',')[1]);
            const name = `Im${images.length}`;
            images.push({ name, bytes, w: entry.canvas.width, h: entry.canvas.height });
            const cx = fx(obj.x + obj.w / 2), cy = fy(obj.y + obj.h / 2);
            const wpt = obj.w * MM2PT, hpt = obj.h * MM2PT;
            const th = (-(obj.rotation || 0) * Math.PI) / 180;
            const cos = Math.cos(th), sin = Math.sin(th);
            const mx = obj.mirror ? -1 : 1;
            content += 'q\n';
            // translate to centre, rotate, scale, centre the unit image
            content += `${num(cos)} ${num(sin)} ${num(-sin)} ${num(cos)} ${num(cx)} ${num(cy)} cm\n`;
            content += `${num(mx * wpt)} 0 0 ${num(hpt)} ${num(-mx * wpt / 2)} ${num(-hpt / 2)} cm\n`;
            content += `/${name} Do\nQ\n`;
            continue;
        }
        const loops = objLoops(obj, opts.kerf);
        if (!loops) continue;
        const groups = new Map();
        for (const l of loops) { if (!groups.has(l.op)) groups.set(l.op, []); groups.get(l.op).push(l); }
        for (const [op, gl] of groups) {
            const { r, g, b } = hexToRgb(OP_COLORS[op]);
            const emit = (list, fillable) => {
                if (!list.length) return;
                content += `${num(r / 255)} ${num(g / 255)} ${num(b / 255)} ${fillable ? 'rg' : 'RG'}\n`;
                for (const l of list) {
                    l.pts.forEach((p, i) => { content += `${num(fx(p.x))} ${num(fy(p.y))} ${i === 0 ? 'm' : 'l'}\n`; });
                    if (l.closed) content += 'h\n';
                }
                content += fillable ? 'f*\n' : 'S\n';
            };
            if (op === 'engrave') {
                emit(gl.filter((l) => l.closed), true);
                emit(gl.filter((l) => !l.closed), false);
            } else {
                emit(gl, false);
            }
        }
    }

    // Assemble PDF objects
    // 1: Catalog, 2: Pages, 3: Page, 4: Content, 5: Resources, then images
    const nCatalog = 1, nPages = 2, nPage = 3, nContent = 4, nResources = 5;
    const imgObjNums = images.map((_, i) => 6 + i);

    const xobjDict = images.map((im, i) => `/${im.name} ${imgObjNums[i]} 0 R`).join(' ');
    const bodies = [];
    bodies[nCatalog] = `<< /Type /Catalog /Pages ${nPages} 0 R >>`;
    bodies[nPages] = `<< /Type /Pages /Kids [${nPage} 0 R] /Count 1 >>`;
    bodies[nPage] = `<< /Type /Page /Parent ${nPages} 0 R /MediaBox [0 0 ${num(Wp)} ${num(Hp)}] ` +
        `/Contents ${nContent} 0 R /Resources ${nResources} 0 R >>`;
    bodies[nContent] = { stream: enc.encode(content) };
    bodies[nResources] = `<< /XObject << ${xobjDict} >> >>`;
    images.forEach((im, i) => {
        bodies[imgObjNums[i]] = {
            dict: `<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} ` +
                `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>`,
            raw: im.bytes,
        };
    });

    // Serialise with xref
    const chunks = [];
    let offset = 0;
    const offsets = [];
    const write = (u8) => { chunks.push(u8); offset += u8.length; };
    write(enc.encode('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n'));
    const totalObjs = 5 + images.length;
    for (let n = 1; n <= totalObjs; n++) {
        offsets[n] = offset;
        const body = bodies[n];
        if (typeof body === 'string') {
            write(enc.encode(`${n} 0 obj\n${body}\nendobj\n`));
        } else if (body.stream) {
            write(enc.encode(`${n} 0 obj\n<< /Length ${body.stream.length} >>\nstream\n`));
            write(body.stream); write(enc.encode('\nendstream\nendobj\n'));
        } else if (body.raw) {
            write(enc.encode(`${n} 0 obj\n${body.dict}\nstream\n`));
            write(body.raw); write(enc.encode('\nendstream\nendobj\n'));
        }
    }
    const xrefOffset = offset;
    let xref = `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`;
    for (let n = 1; n <= totalObjs; n++) xref += `${String(offsets[n]).padStart(10, '0')} 00000 n \n`;
    xref += `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    write(enc.encode(xref));
    return new Blob(chunks, { type: 'application/pdf' });
}

function base64ToBytes(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

// =====================================================================
// Raster compositor (shared by PNG / BMP / JPG / G-code raster)
// =====================================================================
export async function renderRaster(store, { dpi = 150, mono = true } = {}) {
    const { widthMM: W, heightMM: H } = store.state.artboard;
    const scale = dpi / 25.4;
    const px = Math.max(1, Math.round(W * scale));
    const py = Math.max(1, Math.round(H * scale));
    const canvas = document.createElement('canvas');
    canvas.width = px; canvas.height = py;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, px, py);

    for (const o of visibleObjects(store)) {
        if (o.type === 'image') await produceProcessed(o, Math.max(o.natW, o.natH));
    }
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    for (const o of visibleObjects(store)) {
        drawObject(ctx, o, scale, {
            colorOverride: mono && o.type !== 'image' ? '#000000' : undefined,
            imageLongSide: o.type === 'image' ? Math.max(o.natW, o.natH) : undefined,
        });
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return { canvas, width: px, height: py, dpi };
}

function canvasGray(canvas) {
    const { width, height } = canvas;
    const img = canvas.getContext('2d').getImageData(0, 0, width, height);
    const g = new Uint8ClampedArray(width * height);
    const d = img.data;
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const a = d[i + 3];
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        g[p] = a < 128 ? 255 : lum; // transparent = white (no burn)
    }
    return { g, width, height };
}

export async function toPNG(store, { dpi = 150 } = {}) {
    const { canvas } = await renderRaster(store, { dpi, mono: true });
    return await new Promise((res) => canvas.toBlob((b) => res(b), 'image/png'));
}
export async function toJPG(store, { dpi = 150, quality = 0.92 } = {}) {
    const { canvas } = await renderRaster(store, { dpi, mono: true });
    return await new Promise((res) => canvas.toBlob((b) => res(b), 'image/jpeg', quality));
}

// ---- BMP encoders ---------------------------------------------------------
export async function toBMP(store, { dpi = 150, bits = 8 } = {}) {
    const { canvas } = await renderRaster(store, { dpi, mono: true });
    const { g, width, height } = canvasGray(canvas);
    return bits === 1 ? encodeBMP1(g, width, height, dpi) : encodeBMP8(g, width, height, dpi);
}

function bmpHeader(dataOffset, fileSize, W, H, bitCount, imgSize, dpi) {
    const buf = new ArrayBuffer(54 + (bitCount === 8 ? 1024 : bitCount === 1 ? 8 : 0));
    const dv = new DataView(buf);
    const ppm = Math.round(dpi * 39.3701);
    dv.setUint8(0, 0x42); dv.setUint8(1, 0x4d);      // 'BM'
    dv.setUint32(2, fileSize, true);
    dv.setUint32(10, dataOffset, true);
    dv.setUint32(14, 40, true);                       // header size
    dv.setInt32(18, W, true);
    dv.setInt32(22, H, true);                         // positive => bottom-up
    dv.setUint16(26, 1, true);
    dv.setUint16(28, bitCount, true);
    dv.setUint32(30, 0, true);                        // BI_RGB
    dv.setUint32(34, imgSize, true);
    dv.setInt32(38, ppm, true);
    dv.setInt32(42, ppm, true);
    dv.setUint32(46, bitCount === 8 ? 256 : bitCount === 1 ? 2 : 0, true);
    dv.setUint32(50, 0, true);
    return { buf, dv };
}

function encodeBMP8(gray, W, H, dpi) {
    const rowSize = Math.floor((8 * W + 31) / 32) * 4;
    const imgSize = rowSize * H;
    const dataOffset = 54 + 1024;
    const fileSize = dataOffset + imgSize;
    const { buf } = bmpHeader(dataOffset, fileSize, W, H, 8, imgSize, dpi);
    const bytes = new Uint8Array(fileSize);
    bytes.set(new Uint8Array(buf), 0);
    // grayscale palette
    for (let i = 0; i < 256; i++) {
        const o = 54 + i * 4;
        bytes[o] = i; bytes[o + 1] = i; bytes[o + 2] = i; bytes[o + 3] = 0;
    }
    for (let y = 0; y < H; y++) {
        const srcRow = (H - 1 - y) * W;
        const dst = dataOffset + y * rowSize;
        for (let x = 0; x < W; x++) bytes[dst + x] = gray[srcRow + x];
    }
    return new Blob([bytes], { type: 'image/bmp' });
}

function encodeBMP1(gray, W, H, dpi) {
    const rowSize = Math.floor((1 * W + 31) / 32) * 4;
    const imgSize = rowSize * H;
    const dataOffset = 54 + 8;
    const fileSize = dataOffset + imgSize;
    const { buf } = bmpHeader(dataOffset, fileSize, W, H, 1, imgSize, dpi);
    const bytes = new Uint8Array(fileSize);
    bytes.set(new Uint8Array(buf), 0);
    // palette: 0 = black, 1 = white
    bytes[54] = 0; bytes[55] = 0; bytes[56] = 0; bytes[57] = 0;
    bytes[58] = 255; bytes[59] = 255; bytes[60] = 255; bytes[61] = 0;
    for (let y = 0; y < H; y++) {
        const srcRow = (H - 1 - y) * W;
        const dst = dataOffset + y * rowSize;
        for (let x = 0; x < W; x++) {
            if (gray[srcRow + x] >= 128) bytes[dst + (x >> 3)] |= 0x80 >> (x & 7); // white bit
        }
    }
    return new Blob([bytes], { type: 'image/bmp' });
}

// =====================================================================
// G-code — vector engrave/cut, and raster image engraving (GRBL laser mode)
// =====================================================================
const DEFAULT_GCODE = {
    mode: 'vector',       // 'vector' | 'raster'
    laserMode: 'M4',      // M4 dynamic | M3 constant
    travel: 3000,         // mm/min
    engraveSpeed: 1500,
    cutSpeed: 600,
    powerEngrave: 700,    // S value
    powerCut: 1000,
    maxPower: 1000,       // S range
    passes: 1,
    dpi: 120,             // raster only
    kerf: 0,              // mm, expands closed cut paths
    overscan: 0,          // mm, raster run-in/out
    origin: 'bottomleft',
};

export async function toGcode(store, opts = {}) {
    const p = { ...DEFAULT_GCODE, ...opts };
    return p.mode === 'raster' ? await gcodeRaster(store, p) : gcodeVector(store, p);
}

function gcodeHeader(p) {
    return [
        '; Generated by Laser Forge (rami.party) — verify on your machine.',
        '; SAFETY: never run a laser unattended. Wear rated eyewear. Ensure fume extraction.',
        'G21 ; mm', 'G90 ; absolute', 'G0 F' + p.travel, 'M5 ; laser off',
    ];
}

function gcodeVector(store, p) {
    const { heightMM: H } = store.state.artboard;
    const fy = (y) => H - y;
    const lines = gcodeHeader(p);
    const on = p.laserMode;
    for (let pass = 0; pass < Math.max(1, p.passes); pass++) {
        if (p.passes > 1) lines.push(`; --- pass ${pass + 1}/${p.passes} ---`);
        for (const obj of visibleObjects(store)) {
            if (obj.type === 'image') continue;
            const loops = objLoops(obj, p.kerf);
            if (!loops) continue;
            for (const l of loops) {
                if (!l.pts.length) continue;
                const isCut = l.op === 'cut';
                const feed = isCut ? p.cutSpeed : p.engraveSpeed;
                const power = isCut ? p.powerCut : p.powerEngrave;
                const first = l.pts[0];
                lines.push('M5');
                lines.push(`G0 X${num(first.x)} Y${num(fy(first.y))}`);
                lines.push(`${on} S${power}`);
                for (let i = 1; i < l.pts.length; i++)
                    lines.push(`G1 X${num(l.pts[i].x)} Y${num(fy(l.pts[i].y))} F${feed}`);
                if (l.closed) lines.push(`G1 X${num(first.x)} Y${num(fy(first.y))} F${feed}`);
                lines.push('M5');
            }
        }
    }
    lines.push('M5', 'G0 X0 Y0', '; done');
    return lines.join('\n');
}

async function gcodeRaster(store, p) {
    const { canvas, width, height } = await renderRaster(store, { dpi: p.dpi, mono: true });
    const { g } = canvasGray(canvas);
    const mmPerPx = 25.4 / p.dpi;
    const lines = gcodeHeader(p);
    lines.push(`${p.laserMode} S0`);
    lines.push(`; raster ${width}x${height} @ ${p.dpi} DPI`);
    const power = (v) => Math.round(((255 - v) / 255) * p.maxPower);
    for (let row = 0; row < height; row++) {
        const y = num((height - 1 - row) * mmPerPx);
        // find burn extent in row
        let first = -1, last = -1;
        for (let x = 0; x < width; x++) { if (g[row * width + x] < 250) { if (first < 0) first = x; last = x; } }
        if (first < 0) continue; // blank row
        const ltr = (row & 1) === 0;
        const dir = ltr ? 1 : -1;
        const os = (p.overscan || 0) / mmPerPx;
        const startX = ltr ? first : last;
        const endX = ltr ? last : first;
        lines.push('M5');
        lines.push(`G0 X${num((startX - dir * os) * mmPerPx)} Y${y}`);
        lines.push(`${p.laserMode} S0`);
        if (os) lines.push(`G1 X${num(startX * mmPerPx)} S0 F${p.engraveSpeed}`);
        let prevS = -1;
        const emit = (x) => {
            const s = power(g[row * width + x]);
            if (s !== prevS) { lines.push(`G1 X${num(x * mmPerPx)} S${s} F${p.engraveSpeed}`); prevS = s; }
        };
        if (ltr) for (let x = first; x <= last; x++) emit(x);
        else for (let x = last; x >= first; x--) emit(x);
        lines.push(`G1 X${num(endX * mmPerPx)} S0`);
        if (os) lines.push(`G1 X${num((endX + dir * os) * mmPerPx)} S0 F${p.engraveSpeed}`);
    }
    lines.push('M5', 'G0 X0 Y0', '; done');
    return lines.join('\n');
}

// =====================================================================
// PLT / HPGL (vector, plotter units = 0.025 mm)
// =====================================================================
export function toPLT(store, opts = {}) {
    const { heightMM: H } = store.state.artboard;
    const U = 40; // units per mm
    const fx = (x) => Math.round(x * U);
    const fy = (y) => Math.round((H - y) * U);
    const cmds = ['IN;', 'SP1;'];
    for (const obj of visibleObjects(store)) {
        if (obj.type === 'image') continue;
        const loops = objLoops(obj, opts.kerf);
        if (!loops) continue;
        for (const l of loops) {
            if (!l.pts.length) continue;
            const f = l.pts[0];
            cmds.push(`PU${fx(f.x)},${fy(f.y)};`);
            for (let i = 1; i < l.pts.length; i++) cmds.push(`PD${fx(l.pts[i].x)},${fy(l.pts[i].y)};`);
            if (l.closed) cmds.push(`PD${fx(f.x)},${fy(f.y)};`);
        }
    }
    cmds.push('PU;');
    return cmds.join('');
}

// =====================================================================
// EPS (PostScript vector)
// =====================================================================
export function toEPS(store, opts = {}) {
    const { widthMM: W, heightMM: H } = store.state.artboard;
    const Wp = W * MM2PT, Hp = H * MM2PT;
    const fx = (x) => x * MM2PT, fy = (y) => Hp - y * MM2PT;
    const b = ['%!PS-Adobe-3.0 EPSF-3.0', `%%BoundingBox: 0 0 ${Math.ceil(Wp)} ${Math.ceil(Hp)}`,
        '%%EndComments', '1 setlinecap 1 setlinejoin 0.3 setlinewidth'];
    for (const obj of visibleObjects(store)) {
        if (obj.type === 'image') continue;
        const loops = objLoops(obj, opts.kerf);
        if (!loops) continue;
        const groups = new Map();
        for (const l of loops) { if (!groups.has(l.op)) groups.set(l.op, []); groups.get(l.op).push(l); }
        for (const [op, gl] of groups) {
            const { r, g, b: bb } = hexToRgb(OP_COLORS[op]);
            const emit = (list, paint) => {
                if (!list.length) return;
                b.push(`${num(r / 255)} ${num(g / 255)} ${num(bb / 255)} setrgbcolor`, 'newpath');
                for (const l of list) {
                    l.pts.forEach((p, i) => b.push(`${num(fx(p.x))} ${num(fy(p.y))} ${i === 0 ? 'moveto' : 'lineto'}`));
                    if (l.closed) b.push('closepath');
                }
                b.push(paint);
            };
            if (op === 'engrave') {
                emit(gl.filter((l) => l.closed), 'fill');
                emit(gl.filter((l) => !l.closed), 'stroke');
            } else {
                emit(gl, 'stroke');
            }
        }
    }
    b.push('showpage', '%%EOF');
    return b.join('\n');
}

// Rough cut/engrave path length + time estimate (ignores travel & raster).
export function estimate(store, opts = {}) {
    const g = { ...DEFAULT_GCODE, ...opts };
    let cutLen = 0, engLen = 0;
    for (const obj of visibleObjects(store)) {
        if (obj.type === 'image') continue;
        const loops = objectLoops(obj);
        if (!loops) continue;
        for (const l of loops) {
            const len = pathLength(l.pts, l.closed);
            if (l.op === 'cut') cutLen += len; else engLen += len;
        }
    }
    const timeSec = (cutLen / (g.cutSpeed || 600)) * 60 + (engLen / (g.engraveSpeed || 1500)) * 60;
    return { cutLen, engLen, timeSec };
}

// =====================================================================
// Dispatch
// =====================================================================
export async function runExport(store, format, opts = {}) {
    const stamp = new Date().toISOString().slice(0, 10);
    const base = `laserforge-${stamp}`;
    switch (format) {
        case 'svg': download(`${base}.svg`, textBlob(await toSVG(store, opts), 'image/svg+xml')); break;
        case 'dxf': download(`${base}.dxf`, textBlob(toDXF(store, opts), 'application/dxf')); break;
        case 'pdf': download(`${base}.pdf`, await toPDF(store, opts)); break;
        case 'ai': download(`${base}.ai`, await toPDF(store, opts)); break;
        case 'plt': download(`${base}.plt`, textBlob(toPLT(store, opts), 'application/vnd.hp-hpgl')); break;
        case 'eps': download(`${base}.eps`, textBlob(toEPS(store, opts), 'application/postscript')); break;
        case 'png': download(`${base}.png`, await toPNG(store, opts)); break;
        case 'jpg': download(`${base}.jpg`, await toJPG(store, opts)); break;
        case 'bmp': download(`${base}-${opts.bits || 8}bit.bmp`, await toBMP(store, opts)); break;
        case 'gcode': download(`${base}.gcode`, textBlob(await toGcode(store, opts), 'text/plain')); break;
        default: throw new Error('Unknown format: ' + format);
    }
}

export { DEFAULT_GCODE };
