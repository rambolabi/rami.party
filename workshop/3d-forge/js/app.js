// app.js — bootstrap and UI wiring for 3D Forge.
// Connects the toolbar, properties panel, object list, build plate, export dialog
// and keyboard shortcuts to the Store + WebGL Viewport.

import { Store, BED_PRESETS } from './store.js';
import { Viewport } from './scene/viewport.js';
import {
    createText, createEmoji, createPrimitive, createQR, createImageObject,
} from './objects.js';
import { loadImageFile, toGrayscale } from './image/pipeline.js';
import { runExport, SLICER_PRESETS, FORMATS } from './export/exporters.js';
import { t, setLang, applyI18n } from './i18n.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const BASE_FONTS = [
    'Arial, sans-serif', 'Quicksand, sans-serif', 'Georgia, serif', 'Times New Roman, serif',
    'Courier New, monospace', 'Impact, sans-serif', 'Comic Sans MS, cursive', 'Trebuchet MS, sans-serif',
    'Verdana, sans-serif',
];
const userFonts = [];
const EMOJI = ['★', '☆', '♥', '♣', '♠', '☀', '☂', '☃', '⚡', '❄', '✿', '☘', '☺', '☠', '☮', '☯', '⚙',
    '⚓', '✈', '♻', '♫', '⚔', '☕', '✂', '✚', '❤', '☑', '⬆', '⚠', '☢', '⚑', '✉', '☎', '⏰', '⚖', '❦', '🦷', '🎲', '🔥', '💀'];

const store = new Store();
store.load();
const vp = new Viewport($('#view'));
vp.setPlate(store.state.plate.w, store.state.plate.d);
vp.onPick = (id) => store.select(id);

let pendingImageMode = 'lithophane';
let replaceTarget = null;
let statsTimer = null;

// ---------------------------------------------------------------- reactive render
store.subscribe((state, reason) => {
    if (reason === 'plate' || reason === 'new' || reason === 'history') {
        vp.setPlate(state.plate.w, state.plate.d);
        syncPlateInputs();
    }
    syncViewport();
    renderObjectList();
    toggleHint();
    if (['select', 'add', 'remove', 'history', 'new', 'rename'].includes(reason)) renderProps();
    if (reason === 'new' || reason === 'history') { rebuildAssets(); }
    updateStatus();
    scheduleStats();
    if (reason === 'add' || reason === 'new') vp.frameAll(store.sceneBounds());
});

function syncViewport() { vp.setObjects(store.worldObjects()); }

function toggleHint() { $('#empty-hint').hidden = store.state.objects.length > 0; }

// ---------------------------------------------------------------- toolbar
$$('.tool').forEach((b) => b.addEventListener('click', () => doAction(b.dataset.action)));

function doAction(action) {
    if (action === 'add-text') store.addObject(createText());
    else if (action === 'add-emoji') pickEmoji();
    else if (action === 'add-qr') store.addObject(createQR());
    else if (action === 'add-litho') { pendingImageMode = 'lithophane'; $('#file-image').click(); }
    else if (action === 'add-relief') { pendingImageMode = 'relief'; $('#file-image').click(); }
    else if (action.startsWith('prim-')) store.addObject(createPrimitive(action.slice(5)));
}

function pickEmoji() {
    const char = window.prompt('Emoji or symbol to make 3D:', '★');
    if (char) store.addObject(createEmoji(char.trim().slice(0, 8) || '★'));
}

// ---------------------------------------------------------------- image import
$('#file-image').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    const target = replaceTarget; replaceTarget = null;
    if (!file) return;
    try {
        const img = await loadImageFile(file);
        if (target) {
            // Replace the image on an existing lithophane / relief object.
            const obj = store.state.objects.find((o) => o.id === target);
            if (!obj) return;
            const field = toGrayscale(img, obj.type === 'lithophane' ? 320 : 260);
            store.assets[target] = { field };
            store.updateParams(target, { src: downscaleDataURL(img, 512) }, null);
            return;
        }
        const field = toGrayscale(img, pendingImageMode === 'lithophane' ? 320 : 260);
        const src = downscaleDataURL(img, 512);
        const obj = createImageObject(pendingImageMode, src);
        store.setAsset(obj.id, field);
        store.addObject(obj);
    } catch (err) { console.warn(err); alert('Could not read that image.'); }
});

function downscaleDataURL(img, maxW) {
    const ratio = img.naturalHeight / img.naturalWidth;
    const w = Math.min(maxW, img.naturalWidth), h = Math.round(w * ratio);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    return c.toDataURL('image/jpeg', 0.82);
}

// Rebuild grayscale assets from stored src (after load / undo across image objects).
async function rebuildAssets() {
    for (const o of store.state.objects) {
        if ((o.type === 'lithophane' || o.type === 'relief') && !store.assets[o.id] && o.params.src) {
            try {
                const img = await loadImageFileFromSrc(o.params.src);
                const field = toGrayscale(img, o.type === 'lithophane' ? 320 : 260);
                store.setAsset(o.id, field);
                syncViewport();
            } catch (_) { /* ignore */ }
        }
    }
}
function loadImageFileFromSrc(src) {
    return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

// ---------------------------------------------------------------- font import
$('#file-font').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const name = 'UserFont' + userFonts.length;
    try {
        const buf = await file.arrayBuffer();
        const ff = new FontFace(name, buf);
        await ff.load();
        document.fonts.add(ff);
        const fam = `${name}, sans-serif`;
        userFonts.push({ label: file.name.replace(/\.[^.]+$/, ''), value: fam });
        const sel = store.selected;
        if (sel && (sel.type === 'text' || sel.type === 'emoji')) store.updateParams(sel.id, { fontFamily: fam });
        else renderProps();
    } catch (err) { alert('Could not load that font.'); }
});

// ================================================================ properties
function renderProps() {
    const host = $('#props');
    const obj = store.selected;
    host.innerHTML = '';
    if (!obj) { host.innerHTML = `<p class="muted">${t('nothing')}</p>`; return; }

    // name + colour + actions
    host.appendChild(rowText('Name', obj.name, (v) => store.rename(obj.id, v)));
    host.appendChild(rowColor('Colour', obj.color, (rgb) => store.setColor(obj.id, rgb)));

    const typeBox = document.createElement('div');
    typeBox.className = 'subpanel';
    typeBox.appendChild(heading(prettyType(obj)));
    buildTypeFields(typeBox, obj);
    host.appendChild(typeBox);

    // transform
    const tbox = document.createElement('div');
    tbox.className = 'subpanel';
    tbox.appendChild(heading('Transform (mm / °)'));
    tbox.appendChild(vec3Row('Position', obj.transform.pos, (i, v) => setTransform(obj, 'pos', i, v)));
    tbox.appendChild(vec3Row('Rotation', obj.transform.rot, (i, v) => setTransform(obj, 'rot', i, v)));
    tbox.appendChild(rowNumber('Scale ×', obj.transform.scale[0], { min: 0.05, max: 20, step: 0.05 },
        (v) => store.updateTransform(obj.id, { scale: [v, v, v] }, `${obj.id}:scale`)));
    host.appendChild(tbox);

    const actions = document.createElement('div');
    actions.className = 'btn-row';
    actions.appendChild(miniBtn('⤓ Drop to plate', () => store.dropToPlate(obj.id)));
    actions.appendChild(miniBtn('⊕ Centre', () => store.centerOnPlate(obj.id)));
    actions.appendChild(miniBtn('⧉ Duplicate', () => store.duplicate(obj.id)));
    actions.appendChild(miniBtn('🗑 Delete', () => store.removeObject(obj.id)));
    host.appendChild(actions);
}

function setTransform(obj, key, i, v) {
    const arr = obj.transform[key].slice(); arr[i] = v;
    store.updateTransform(obj.id, { [key]: arr }, `${obj.id}:${key}${i}`);
}

function buildTypeFields(box, obj) {
    const p = obj.params;
    const set = (patch, key) => store.updateParams(obj.id, patch, `${obj.id}:${key}`);
    if (obj.type === 'text' || obj.type === 'emoji') {
        box.appendChild(rowTextarea(obj.type === 'emoji' ? 'Symbol' : 'Text', p.text, (v) => set({ text: v }, 'text')));
        if (obj.type === 'text') {
            box.appendChild(rowSelect('Font', fontOptions(), p.fontFamily, (v) => set({ fontFamily: v }, 'font')));
            box.appendChild(miniBtn('⤒ Upload font…', () => $('#file-font').click()));
        }
        box.appendChild(rowNumber('Height mm', p.heightMm, { min: 2, max: 300, step: 1 }, (v) => set({ heightMm: v }, 'h')));
        box.appendChild(rowNumber('Depth mm', p.depthMm, { min: 0.4, max: 100, step: 0.2 }, (v) => set({ depthMm: v }, 'd')));
        box.appendChild(rowNumber('Spacing mm', p.letterSpacing, { min: -5, max: 20, step: 0.2 }, (v) => set({ letterSpacing: v }, 'sp')));
        box.appendChild(rowCheck('Bold', p.bold, (v) => set({ bold: v }, 'b')));
        box.appendChild(rowCheck('Italic', p.italic, (v) => set({ italic: v }, 'i')));
    } else if (obj.type === 'qr') {
        box.appendChild(rowTextarea('Content / URL', p.text, (v) => set({ text: v }, 'text')));
        box.appendChild(rowSelect('Error correction', [['L', 'L — 7%'], ['M', 'M — 15%'], ['Q', 'Q — 25%'], ['H', 'H — 30%']], p.ecl, (v) => set({ ecl: v }, 'ecl')));
        box.appendChild(rowNumber('Size mm', p.widthMm, { min: 20, max: 200, step: 1 }, (v) => set({ widthMm: v }, 'w')));
        box.appendChild(rowNumber('Base mm', p.baseMm, { min: 0.6, max: 10, step: 0.2 }, (v) => set({ baseMm: v }, 'base')));
        box.appendChild(rowNumber('Module height mm', p.moduleMm, { min: 0.4, max: 6, step: 0.2 }, (v) => set({ moduleMm: v }, 'mod')));
    } else if (obj.type === 'lithophane') {
        box.appendChild(miniBtn('🖼 Replace image…', () => { pendingImageMode = 'lithophane'; replaceTarget = obj.id; $('#file-image').click(); }));
        box.appendChild(rowSelect('Shape', [['flat', 'Flat panel'], ['curved', 'Curved arc'], ['cylinder', 'Cylinder / lamp']], p.shape, (v) => set({ shape: v }, 'shape')));
        if (p.shape === 'cylinder') box.appendChild(rowNumber('Diameter mm', p.diameterMm, { min: 20, max: 200, step: 1 }, (v) => set({ diameterMm: v }, 'dia')));
        else if (p.shape === 'curved') box.appendChild(rowNumber('Arc °', p.arcDeg, { min: 10, max: 180, step: 5 }, (v) => set({ arcDeg: v }, 'arc')));
        else box.appendChild(rowNumber('Width mm', p.widthMm, { min: 20, max: 300, step: 1 }, (v) => set({ widthMm: v }, 'w')));
        box.appendChild(rowNumber('Min thickness mm', p.minMm, { min: 0.4, max: 3, step: 0.1 }, (v) => set({ minMm: v }, 'min')));
        box.appendChild(rowNumber('Max thickness mm', p.maxMm, { min: 1, max: 8, step: 0.1 }, (v) => set({ maxMm: v }, 'max')));
        box.appendChild(rowRange('Detail (columns)', p.maxCols, { min: 80, max: 400, step: 10 }, (v) => set({ maxCols: v }, 'cols')));
        imageAdjustFields(box, p, set);
    } else if (obj.type === 'relief') {
        box.appendChild(miniBtn('🖼 Replace image…', () => { pendingImageMode = 'relief'; replaceTarget = obj.id; $('#file-image').click(); }));
        box.appendChild(rowNumber('Width mm', p.widthMm, { min: 20, max: 300, step: 1 }, (v) => set({ widthMm: v }, 'w')));
        box.appendChild(rowNumber('Base mm', p.baseMm, { min: 0.4, max: 10, step: 0.2 }, (v) => set({ baseMm: v }, 'base')));
        box.appendChild(rowNumber('Relief mm', p.reliefMm, { min: 0.5, max: 20, step: 0.5 }, (v) => set({ reliefMm: v }, 'relief')));
        box.appendChild(rowRange('Detail (columns)', p.maxCols, { min: 60, max: 360, step: 10 }, (v) => set({ maxCols: v }, 'cols')));
        imageAdjustFields(box, p, set);
    } else if (obj.type === 'primitive') {
        primitiveFields(box, obj, set);
    }
}

function imageAdjustFields(box, p, set) {
    box.appendChild(rowRange('Brightness', p.brightness, { min: -0.5, max: 0.5, step: 0.02 }, (v) => set({ brightness: v }, 'br')));
    box.appendChild(rowRange('Contrast', p.contrast, { min: -0.8, max: 1.5, step: 0.05 }, (v) => set({ contrast: v }, 'co')));
    box.appendChild(rowRange('Gamma', p.gamma, { min: 0.3, max: 3, step: 0.05 }, (v) => set({ gamma: v }, 'ga')));
    box.appendChild(rowCheck('Invert', p.invert, (v) => set({ invert: v }, 'inv')));
}

function primitiveFields(box, obj, set) {
    const p = obj.params, k = p.kind;
    const num = (label, key, o) => box.appendChild(rowNumber(label, p[key], o, (v) => set({ [key]: v }, key)));
    if (k === 'box') { num('Width mm', 'w', { min: 1, max: 400, step: 1 }); num('Depth mm', 'd', { min: 1, max: 400, step: 1 }); num('Height mm', 'h', { min: 1, max: 400, step: 1 }); }
    else if (k === 'roundedBox') { num('Width mm', 'w', { min: 1, max: 400, step: 1 }); num('Depth mm', 'd', { min: 1, max: 400, step: 1 }); num('Height mm', 'h', { min: 1, max: 400, step: 1 }); num('Corner mm', 'radius', { min: 0.5, max: 60, step: 0.5 }); }
    else if (k === 'cylinder' || k === 'cone') { num('Diameter mm', 'diameter', { min: 1, max: 400, step: 1 }); num('Height mm', 'h', { min: 1, max: 400, step: 1 }); }
    else if (k === 'sphere') { num('Diameter mm', 'diameter', { min: 1, max: 400, step: 1 }); }
    else if (k === 'torus') { num('Outer Ø mm', 'outerD', { min: 4, max: 400, step: 1 }); num('Tube Ø mm', 'tubeD', { min: 1, max: 100, step: 1 }); }
    else if (k === 'prism') { num('Sides', 'sides', { min: 3, max: 20, step: 1 }); num('Diameter mm', 'diameter', { min: 1, max: 400, step: 1 }); num('Height mm', 'h', { min: 1, max: 400, step: 1 }); }
    else if (k === 'star') { num('Points', 'points', { min: 3, max: 20, step: 1 }); num('Outer Ø mm', 'outerD', { min: 4, max: 400, step: 1 }); num('Inner Ø mm', 'innerD', { min: 2, max: 400, step: 1 }); num('Height mm', 'h', { min: 1, max: 100, step: 1 }); }
    else if (k === 'gear') { num('Teeth', 'teeth', { min: 6, max: 80, step: 1 }); num('Module mm', 'module', { min: 0.5, max: 6, step: 0.1 }); num('Height mm', 'h', { min: 1, max: 60, step: 1 }); num('Bore Ø mm', 'boreD', { min: 0, max: 60, step: 0.5 }); }
    else if (k === 'tube') { num('Outer Ø mm', 'outerD', { min: 4, max: 400, step: 1 }); num('Inner Ø mm', 'innerD', { min: 1, max: 398, step: 1 }); num('Height mm', 'h', { min: 1, max: 400, step: 1 }); }
}

function fontOptions() { return [...BASE_FONTS.map((f) => [f, f.split(',')[0]]), ...userFonts.map((f) => [f.value, f.label + ' (uploaded)'])]; }
function prettyType(obj) {
    if (obj.type === 'primitive') return obj.params.kind[0].toUpperCase() + obj.params.kind.slice(1);
    return obj.type[0].toUpperCase() + obj.type.slice(1);
}

// ================================================================ field widgets
function labeled(label, control) {
    const row = document.createElement('div'); row.className = 'field';
    const l = document.createElement('label'); l.textContent = label;
    row.append(l, control); return row;
}
function heading(text) { const h = document.createElement('div'); h.className = 'sub-title'; h.textContent = text; return h; }
function rowText(label, value, onChange) {
    const inp = document.createElement('input'); inp.type = 'text'; inp.value = value;
    inp.addEventListener('input', () => onChange(inp.value)); return labeled(label, inp);
}
function rowTextarea(label, value, onChange) {
    const inp = document.createElement('textarea'); inp.value = value; inp.rows = 2;
    inp.addEventListener('input', () => onChange(inp.value)); return labeled(label, inp);
}
function rowNumber(label, value, { min, max, step }, onChange) {
    const inp = document.createElement('input'); inp.type = 'number';
    inp.min = min; inp.max = max; inp.step = step; inp.value = value;
    inp.addEventListener('input', () => { const v = parseFloat(inp.value); if (!Number.isNaN(v)) onChange(v); });
    return labeled(label, inp);
}
function rowRange(label, value, { min, max, step }, onChange) {
    const wrap = document.createElement('div'); wrap.className = 'range-wrap';
    const inp = document.createElement('input'); inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = value;
    const out = document.createElement('span'); out.className = 'range-val'; out.textContent = (+value).toFixed(2).replace(/\.?0+$/, '');
    inp.addEventListener('input', () => { const v = parseFloat(inp.value); out.textContent = v.toFixed(2).replace(/\.?0+$/, ''); onChange(v); });
    wrap.append(inp, out); return labeled(label, wrap);
}
function rowSelect(label, options, value, onChange) {
    const sel = document.createElement('select');
    for (const opt of options) { const [v, l] = Array.isArray(opt) ? opt : [opt, opt]; const o = document.createElement('option'); o.value = v; o.textContent = l; if (v === value) o.selected = true; sel.appendChild(o); }
    sel.addEventListener('change', () => onChange(sel.value)); return labeled(label, sel);
}
function rowCheck(label, value, onChange) {
    const wrap = document.createElement('label'); wrap.className = 'check';
    const inp = document.createElement('input'); inp.type = 'checkbox'; inp.checked = !!value;
    inp.addEventListener('change', () => onChange(inp.checked));
    const span = document.createElement('span'); span.textContent = label;
    wrap.append(inp, span); const row = document.createElement('div'); row.className = 'field'; row.appendChild(wrap); return row;
}
function rowColor(label, rgb, onChange) {
    const inp = document.createElement('input'); inp.type = 'color'; inp.value = rgbToHex(rgb);
    inp.addEventListener('input', () => onChange(hexToRgb(inp.value)));
    return labeled(label, inp);
}
function vec3Row(label, arr, onChange) {
    const row = document.createElement('div'); row.className = 'field';
    const l = document.createElement('label'); l.textContent = label; row.appendChild(l);
    const grid = document.createElement('div'); grid.className = 'vec3';
    ['X', 'Y', 'Z'].forEach((ax, i) => {
        const inp = document.createElement('input'); inp.type = 'number'; inp.step = i < 3 ? 1 : 1; inp.value = round(arr[i]);
        inp.title = ax;
        inp.addEventListener('input', () => { const v = parseFloat(inp.value); if (!Number.isNaN(v)) onChange(i, v); });
        grid.appendChild(inp);
    });
    row.appendChild(grid); return row;
}
function miniBtn(label, onClick) { const b = document.createElement('button'); b.className = 'btn mini'; b.textContent = label; b.addEventListener('click', onClick); return b; }
const round = (n) => Math.round(n * 100) / 100;

function rgbToHex(rgb) { return '#' + rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join(''); }
function hexToRgb(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }

// ================================================================ object list
function renderObjectList() {
    const ul = $('#objects'); ul.innerHTML = '';
    $('#obj-count').textContent = store.state.objects.length ? `(${store.state.objects.length})` : '';
    store.state.objects.forEach((o) => {
        const li = document.createElement('li');
        li.className = 'layer' + (o.id === store.state.selectedId ? ' sel' : '');
        const sw = document.createElement('span'); sw.className = 'swatch'; sw.style.background = rgbToHex(o.color);
        const name = document.createElement('span'); name.className = 'layer-name'; name.textContent = o.name;
        const del = document.createElement('button'); del.className = 'icon-btn'; del.textContent = '✕'; del.title = 'Delete';
        del.addEventListener('click', (e) => { e.stopPropagation(); store.removeObject(o.id); });
        li.append(sw, name, del);
        li.addEventListener('click', () => store.select(o.id));
        ul.appendChild(li);
    });
}

// ================================================================ plate
function buildBedSelect() {
    const sel = $('#bed');
    BED_PRESETS.forEach((b, i) => { const o = document.createElement('option'); o.value = i; o.textContent = b.name; sel.appendChild(o); });
    sel.addEventListener('change', () => { const b = BED_PRESETS[+sel.value]; store.setPlate({ ...b }); });
}
function syncPlateInputs() {
    $('#plate-w').value = store.state.plate.w;
    $('#plate-d').value = store.state.plate.d;
}
$('#plate-w').addEventListener('input', () => store.setPlate({ ...store.state.plate, w: +$('#plate-w').value || 100, name: 'Custom' }));
$('#plate-d').addEventListener('input', () => store.setPlate({ ...store.state.plate, d: +$('#plate-d').value || 100, name: 'Custom' }));

// ================================================================ status + stats
function updateStatus() {
    $('#status-doc').textContent = `Plate ${store.state.plate.w}×${store.state.plate.d} mm · ${store.state.objects.length} object(s)`;
    const s = store.selected;
    $('#status-sel').textContent = s ? `Selected: ${s.name}` : '';
}
function scheduleStats() { clearTimeout(statsTimer); statsTimer = setTimeout(computeStats, 220); }
function computeStats() {
    const host = $('#scene-stats');
    if (!store.state.objects.length) { host.textContent = '—'; return; }
    const mesh = store.exportMesh();
    if (!mesh) { host.textContent = '—'; return; }
    const v = mesh.validate();
    const b = mesh.bounds();
    const vol = Math.abs(v.volume) / 1000; // mm³ → cm³
    const badge = v.watertight
        ? `<span class="badge ok">✓ ${t('watertight')}</span>`
        : `<span class="badge warn" title="${v.boundaryEdges} open + ${v.nonManifoldEdges} bad edges">⚠ ${t('not_watertight')}</span>`;
    host.innerHTML = `${badge}
        <div>Size: ${b.size.map((n) => n.toFixed(1)).join(' × ')} mm</div>
        <div>Triangles: ${v.triangles.toLocaleString()}</div>
        <div>Volume: ${vol.toFixed(2)} cm³ · ~${(vol * 1.24).toFixed(1)} g PLA</div>`;
    const over = b.size[0] > store.state.plate.w || b.size[1] > store.state.plate.d;
    if (over) host.innerHTML += `<div class="badge warn">⚠ Larger than the plate</div>`;
}

// ================================================================ export dialog
function buildExportDialog() {
    const preset = $('#preset');
    preset.innerHTML = '<option value="">— choose to auto-configure —</option>';
    for (const [k, v] of Object.entries(SLICER_PRESETS)) { const o = document.createElement('option'); o.value = k; o.textContent = v.label; preset.appendChild(o); }
    const fmt = $('#format');
    for (const f of FORMATS) { const o = document.createElement('option'); o.value = f.id; o.textContent = f.label; fmt.appendChild(o); }
    preset.addEventListener('change', () => {
        const p = SLICER_PRESETS[preset.value];
        if (!p) return;
        fmt.value = p.format;
        if (p.stlBinary !== undefined) $('#stl-mode').value = p.stlBinary ? 'binary' : 'ascii';
        refreshExportReport();
    });
    fmt.addEventListener('change', refreshExportReport);
}
function openExport() {
    const mesh = store.exportMesh();
    if (!mesh) { alert('Add something to the plate first.'); return; }
    refreshExportReport();
    $('#export-modal').hidden = false;
}
function refreshExportReport() {
    const mesh = store.exportMesh();
    const rep = $('#export-report');
    if (!mesh) { rep.innerHTML = ''; return; }
    const v = mesh.validate();
    const b = mesh.bounds();
    rep.innerHTML = v.watertight
        ? `<div class="badge ok">✓ Watertight — slices with no repair</div>`
        : `<div class="badge warn">⚠ Auto-repair applied (${v.boundaryEdges} open edges remained)</div>`;
    rep.innerHTML += `<div class="tiny muted">Real size ${b.size.map((n) => n.toFixed(1)).join(' × ')} mm · ${v.triangles.toLocaleString()} triangles</div>`;
}
function doExport() {
    const mesh = store.exportMesh();
    if (!mesh) return;
    const format = $('#format').value;
    const name = store.state.objects.length === 1 ? store.state.objects[0].name : '3dforge-scene';
    const files = runExport(mesh, format, {
        name, color: store.state.objects[0] ? store.state.objects[0].color : undefined,
        stlBinary: $('#stl-mode').value === 'binary',
        plyBinary: $('#ply-mode').value === 'binary',
    });
    for (const f of files) download(f.blob, f.name);
    $('#export-modal').hidden = true;
}
function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// ================================================================ project I/O
function saveProject() {
    const data = JSON.stringify({ plate: store.state.plate, objects: store.state.objects }, null, 0);
    download(new Blob([data], { type: 'application/json' }), '3dforge-project.json');
}
$('#file-open').addEventListener('change', async (e) => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    try {
        const data = JSON.parse(await file.text());
        if (!Array.isArray(data.objects)) throw new Error('bad');
        store.newProject();
        store.state.plate = data.plate || store.state.plate;
        store.state.objects = data.objects;
        store._cache.clear();
        store.save(); store._emit('new');
    } catch (_) { alert('Could not open that project file.'); }
});

// ================================================================ header buttons
$('#btn-new').addEventListener('click', () => { if (confirm('Start a new empty plate?')) store.newProject(); });
$('#btn-undo').addEventListener('click', () => store.undo());
$('#btn-redo').addEventListener('click', () => store.redo());
$('#btn-fit').addEventListener('click', () => vp.frameAll(store.sceneBounds()));
$('#btn-backlight').addEventListener('click', () => {
    const on = !vp.backlight; vp.setBacklight(on);
    $('#btn-backlight').classList.toggle('active', on);
});
$('#btn-save').addEventListener('click', saveProject);
$('#btn-open').addEventListener('click', () => $('#file-open').click());
$('#btn-help').addEventListener('click', () => { $('#help-modal').hidden = false; });
$('#help-close').addEventListener('click', () => { $('#help-modal').hidden = true; });
$('#btn-export').addEventListener('click', openExport);
$('#export-close').addEventListener('click', () => { $('#export-modal').hidden = true; });
$('#export-cancel').addEventListener('click', () => { $('#export-modal').hidden = true; });
$('#export-do').addEventListener('click', doExport);
$('#lang-select').addEventListener('change', (e) => { setLang(e.target.value); applyI18n(); renderProps(); });

// modal backdrop click closes
$$('.modal-backdrop').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m) m.hidden = true; }));

// ================================================================ keyboard
window.addEventListener('keydown', (e) => {
    if (/input|textarea|select/i.test(e.target.tagName)) return;
    const sel = store.state.selectedId;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? store.redo() : store.undo(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); store.redo(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); if (sel) store.duplicate(sel); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { if (sel) store.removeObject(sel); }
    else if (e.key.toLowerCase() === 'f') vp.frameAll(store.sceneBounds());
});

// ================================================================ boot
buildBedSelect();
buildExportDialog();
syncPlateInputs();
applyI18n();
renderObjectList();
renderProps();
toggleHint();
updateStatus();
syncViewport();
rebuildAssets();
if (store.state.objects.length) vp.frameAll(store.sceneBounds());
scheduleStats();
