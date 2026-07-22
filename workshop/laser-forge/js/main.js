// main.js — UI wiring: toolbar, properties, layers, artboard settings, export

import { Store, BED_PRESETS } from './store.js';
import { Artboard } from './artboard.js';
import { createText, createShape, createQR, createPuzzle, createBarcode, createImageFromFile, measureText } from './objects.js';
import { createBox, createGear, createRuler, createHinge, createRegistration, boxNetSize } from './generators.js';
import { DITHER_METHODS } from './dither.js';
import { QR_ECL } from './qr.js';
import { runExport, DEFAULT_GCODE, estimate } from './exporters.js';
import { OPERATIONS, OP_COLORS, clamp } from './geometry.js';
import { t, setLang, applyI18n, getLang } from './i18n.js';
import { openTileEditor } from './tileeditor.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const FONTS = [
    'Quicksand, sans-serif', 'Arial, sans-serif', 'Georgia, serif', 'Times New Roman, serif',
    'Courier New, monospace', 'Impact, sans-serif', 'Comic Sans MS, cursive', 'Trebuchet MS, sans-serif',
];
const EMOJI = ['★', '☆', '♥', '♦', '♣', '♠', '☀', '☁', '☂', '☃', '⚡', '❄', '✿', '❀', '☘', '☺', '☹', '☠', '☮',
    '☯', '✝', '✡', '☪', '⚙', '⚓', '✈', '⌘', '♻', '♫', '♪', '⚔', '⚗', '☕', '✂', '✚', '✦', '✧', '❤', '➤',
    '☑', '☒', '⬆', '⬇', '⬅', '➡', '⏻', '⚠', '☢', '☣', '⚑', '⚐', '✉', '✎', '✐', '☎', '⏰', '⚖', '⚛', '❦'];

const store = new Store();
store.load();
// A shared link overrides the autosaved project.
(() => {
    const m = location.hash.match(/#p=(.+)$/);
    if (!m) return;
    try {
        const d = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
        if (Array.isArray(d.objects)) {
            store.state.artboard = d.artboard || store.state.artboard;
            store.state.objects = d.objects;
            store.state.selectedId = null;
            store._lastSnapshot = store.snapshot();
        }
    } catch (_) { /* ignore malformed link */ }
})();
const art = new Artboard(store, $('#board'));
art.onStatus = updateStatus;

// ---------------------------------------------------------------- structural render
const STRUCTURAL = new Set(['select', 'add', 'remove', 'history', 'new', 'reorder', 'artboard']);
store.subscribe((state, reason) => {
    renderLayers();
    toggleHint();
    if (STRUCTURAL.has(reason) || reason === 'select') renderProps();
    else syncFields();
    if (reason === 'artboard' || reason === 'new' || reason === 'history') syncArtboardInputs();
    if (reason === 'new') art.fit();
});

// ---------------------------------------------------------------- toolbar
$$('.tool').forEach((b) => b.addEventListener('click', () => doAction(b.dataset.action, b)));

async function doAction(action, btn) {
    if (action === 'add-text') store.addObject(createText());
    else if (action === 'add-qr') store.addObject(createQR());
    else if (action === 'add-barcode') store.addObject(createBarcode());
    else if (action === 'add-puzzle') store.addObject(createPuzzle());
    else if (action === 'gen-box') store.addObject(createBox());
    else if (action === 'gen-gear') store.addObject(createGear());
    else if (action === 'gen-ruler') store.addObject(createRuler());
    else if (action === 'gen-hinge') store.addObject(createHinge());
    else if (action === 'gen-reg') store.addObject(createRegistration());
    else if (action === 'add-image') $('#file-input').click();
    else if (action === 'emoji') toggleEmoji(btn);
    else if (action.startsWith('shape-')) {
        const kind = action.slice(6);
        store.addObject(createShape(kind, kind === 'line'
            ? { w: 60, h: 0.2 } : {}));
    }
}

$('#file-input').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    for (const f of files) {
        try { store.addObject(await createImageFromFile(f)); }
        catch (err) { alert('Could not load image: ' + f.name); }
    }
    e.target.value = '';
});

// ---------------------------------------------------------------- header buttons
$('#btn-new').addEventListener('click', () => { if (confirm('Start a new blank project? Unsaved work is lost.')) store.newProject(); });
$('#btn-undo').addEventListener('click', () => store.undo());
$('#btn-redo').addEventListener('click', () => store.redo());
$('#btn-fit').addEventListener('click', () => art.fit());
$('#btn-export').addEventListener('click', openExport);

// help modal
$('#btn-help').addEventListener('click', () => $('#help-modal').hidden = false);
$('#help-close').addEventListener('click', () => $('#help-modal').hidden = true);
$('#help-modal').addEventListener('click', (e) => { if (e.target.id === 'help-modal') $('#help-modal').hidden = true; });

// Pro mode
const proMode = $('#pro-mode');
proMode.checked = localStorage.getItem('laserforge.pro') === '1';
const applyPro = () => { document.body.classList.toggle('pro', proMode.checked); localStorage.setItem('laserforge.pro', proMode.checked ? '1' : '0'); };
proMode.addEventListener('change', applyPro); applyPro();

// Language
const langSel = $('#lang-select');
langSel.value = getLang();
langSel.addEventListener('change', () => { setLang(langSel.value); renderProps(); });

// Save / Open / Share project
$('#btn-save').addEventListener('click', saveProject);
$('#btn-open').addEventListener('click', () => $('#project-input').click());
$('#project-input').addEventListener('change', openProjectFile);

// Drag & drop an image straight onto the canvas
const stageEl = $('#stage');
['dragover', 'drop'].forEach((ev) => stageEl.addEventListener(ev, (e) => e.preventDefault()));
stageEl.addEventListener('drop', async (e) => {
    const files = [...((e.dataTransfer && e.dataTransfer.files) || [])].filter((f) => f.type.startsWith('image/'));
    for (const f of files) { try { store.addObject(await createImageFromFile(f)); } catch (_) { /* skip */ } }
});

function saveProject() {
    const data = JSON.stringify({ artboard: store.state.artboard, objects: store.state.objects });
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `laserforge-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}
async function openProjectFile(e) {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    try {
        const data = JSON.parse(await f.text());
        if (!Array.isArray(data.objects)) throw new Error('not a Laser Forge project');
        store.state.artboard = data.artboard || store.state.artboard;
        store.state.objects = data.objects;
        store.state.selectedId = null;
        store.commit('new');
        art.fit();
    } catch (err) { alert('Could not open project: ' + err.message); }
}
function shareLink() {
    try {
        const data = JSON.stringify({ artboard: store.state.artboard, objects: store.state.objects });
        const url = location.origin + location.pathname + '#p=' + btoa(unescape(encodeURIComponent(data)));
        if (navigator.clipboard) navigator.clipboard.writeText(url);
        alert(url.length > 8000
            ? 'Link copied — but it is very long (images bloat links; prefer Save for big projects).'
            : 'Shareable link copied to clipboard!');
    } catch (_) { alert('Could not create a link.'); }
}

// ---------------------------------------------------------------- keyboard
window.addEventListener('keydown', (e) => {
    const t = e.target;
    const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT');
    if (typing) return;
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? store.redo() : store.undo(); }
    else if (ctrl && e.key.toLowerCase() === 'y') { e.preventDefault(); store.redo(); }
    else if (ctrl && e.key.toLowerCase() === 'd') { e.preventDefault(); store.duplicateSelected(); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { store.removeSelected(); }
    else if (e.key === 'f' || e.key === 'F') { art.fit(); }
});

// ---------------------------------------------------------------- properties
function opPills(sel) {
    return `<div class="op-pills">${OPERATIONS.map((op) =>
        `<div class="op-pill ${sel.op === op ? 'active' : ''}" data-op="${op}">
            <span class="op-dot" style="background:${OP_COLORS[op]}"></span>${op}</div>`).join('')}</div>`;
}

function commonHTML(sel) {
    return `
    <div class="row"><label>Name</label><input type="text" id="p-name" value="${escapeAttr(sel.name || '')}"></div>
    <div class="row"><label>Operation (colour = layer)</label>${opPills(sel)}</div>
    <p class="hint-tip">Red = cut through · blue = score/mark · black = engrave/fill.</p>
    <div class="row two">
        <div><label>X mm</label><input type="number" id="p-x" step="0.5" value="${r1(sel.x)}"></div>
        <div><label>Y mm</label><input type="number" id="p-y" step="0.5" value="${r1(sel.y)}"></div>
    </div>
    <div class="row two">
        <div><label>Width mm</label><input type="number" id="p-w" step="0.5" min="0.2" value="${r1(sel.w)}"></div>
        <div><label>Height mm</label><input type="number" id="p-h" step="0.5" min="0.2" value="${r1(sel.h)}"></div>
    </div>
    <div class="row two">
        <div><label>Rotation °</label><input type="number" id="p-rot" step="1" value="${r1(sel.rotation || 0)}"></div>
        <div><label class="check" style="margin-top:18px"><input type="checkbox" id="p-mirror" ${sel.mirror ? 'checked' : ''}> Mirror</label></div>
    </div>
    <div class="btn-row">
        <button class="btn" id="p-dup" title="Duplicate (Ctrl+D)">Duplicate</button>
        <button class="btn" id="p-array" title="Duplicate in a grid">Array…</button>
        <button class="btn" id="p-front" title="Bring forward">Forward</button>
        <button class="btn" id="p-back" title="Send backward">Back</button>
        <button class="btn danger" id="p-del" title="Delete (Del)">Delete</button>
    </div>`;
}

function typeHTML(sel) {
    if (sel.type === 'text') return `
        <hr class="sep">
        <div class="row"><label>Text</label><textarea id="p-text">${escapeHtml(sel.text)}</textarea></div>
        <div class="row two">
            <div><label>Font</label><select id="p-font">${FONTS.map((f) =>
                `<option value="${f}" ${sel.font === f ? 'selected' : ''}>${f.split(',')[0]}</option>`).join('')}</select></div>
            <div><label>Size mm</label><input type="number" id="p-size" min="1" step="0.5" value="${r1(sel.sizeMM)}"></div>
        </div>
        <div class="row two">
            <div><label>Align</label><select id="p-align">${['left','center','right'].map((a) =>
                `<option ${sel.align === a ? 'selected' : ''}>${a}</option>`).join('')}</select></div>
            <div><label>Line height</label><input type="number" id="p-lh" min="0.8" max="3" step="0.05" value="${sel.lineHeight}"></div>
        </div>
        <div class="row"><label>Arc / curve °</label><input type="range" id="p-arc" min="-180" max="180" step="5" value="${sel.arc || 0}"></div>
        <div class="btn-row">
            <label class="check"><input type="checkbox" id="p-bold" ${sel.bold ? 'checked' : ''}> Bold</label>
            <label class="check"><input type="checkbox" id="p-italic" ${sel.italic ? 'checked' : ''}> Italic</label>
            <label class="check"><input type="checkbox" id="p-fill" ${sel.fill ? 'checked' : ''}> Filled</label>
        </div>`;

    if (sel.type === 'qr') return `
        <hr class="sep">
        <div class="row"><label>Data (URL / text / Wi-Fi…)</label><textarea id="p-data">${escapeHtml(sel.data)}</textarea></div>
        <div class="row two">
            <div><label>Error correction</label><select id="p-ecl">${QR_ECL.map((e) =>
                `<option ${sel.ecl === e ? 'selected' : ''}>${e}</option>`).join('')}</select></div>
            <div><label>Quiet zone</label><input type="number" id="p-quiet" min="0" max="10" step="1" value="${sel.quiet}"></div>
        </div>`;

    if (sel.type === 'shape') {
        let extra = '';
        if (sel.shape === 'rect') extra = row('Corner radius mm', `<input type="number" id="p-radius" min="0" step="0.5" value="${r1(sel.radiusMM)}">`);
        else if (sel.shape === 'polygon') extra = row('Sides', `<input type="number" id="p-sides" min="3" max="60" step="1" value="${sel.sides}">`);
        else if (sel.shape === 'star') extra = `${row('Points', `<input type="number" id="p-points" min="3" max="30" step="1" value="${sel.points}">`)}
            ${row('Inner ratio', `<input type="range" id="p-inner" min="0.15" max="0.9" step="0.01" value="${sel.innerRatio}">`)}`;
        return extra ? `<hr class="sep">${extra}` : '';
    }

    if (sel.type === 'puzzle') {
        const styleOpt = (v, label) => `<option value="${v}" ${sel.style === v ? 'selected' : ''}>${label}</option>`;
        const geoOpt = (v) => `<option ${sel.geoShape === v ? 'selected' : ''}>${v}</option>`;
        return `
        <hr class="sep">
        <p class="muted tiny">🧩 Cut lines are red; an optional repeating icon engraves in every piece.</p>
        <div class="row"><label>Puzzle style</label><select id="p-pstyle">
            ${styleOpt('jigsaw', 'Jigsaw — random interlocking tabs')}
            ${styleOpt('tessellation', 'Tessellation — one repeating self-fitting tile (SHMUZZLE-style)')}
            ${styleOpt('geometric', 'Geometric tiling — straight cuts')}
            ${styleOpt('voronoi', 'Voronoi — organic random cells')}
            ${styleOpt('custom', 'Custom — draw your own repeating tile')}
        </select></div>
        <p class="hint-tip" id="p-stylehint"></p>
        <div class="row" id="p-customrow">
            <button class="btn btn-primary" id="p-editile">✏️ Draw / edit tile…</button>
            <p class="hint-tip">Shape one tile; every piece becomes that shape and interlocks (“Connecting Cats” style).</p>
        </div>
        <div class="row two">
            <div><label>Columns</label><input type="number" id="p-cols" min="1" max="40" step="1" value="${sel.cols}"></div>
            <div><label>Rows</label><input type="number" id="p-rows" min="1" max="40" step="1" value="${sel.rows}"></div>
        </div>
        <div class="row" id="p-tabrow"><label>Tab size (interlock)</label><input type="range" id="p-tab" min="0.08" max="0.35" step="0.01" value="${sel.tab}"></div>
        <div class="row" id="p-tabstylerow"><label>Tab style</label><select id="p-tabstyle">
            <option value="semicircle" ${sel.tabStyle === 'semicircle' ? 'selected' : ''}>Semicircle (smooth)</option>
            <option value="neck" ${sel.tabStyle === 'neck' ? 'selected' : ''}>Dovetail (locking)</option>
        </select></div>
        <div class="row" id="p-georow"><label>Tile shape</label><select id="p-geoshape">${geoOpt('square')}${geoOpt('triangle')}${geoOpt('hexagon')}</select></div>
        <div class="row" id="p-seedrow"><label>Random seed</label>
            <div class="row two" style="margin:0"><input type="number" id="p-seed" value="${sel.seed}"><button class="btn" id="p-shuffle">🎲 Shuffle</button></div></div>
        <label class="check"><input type="checkbox" id="p-numbered" ${sel.numbered ? 'checked' : ''}> Number the pieces</label>
        <div class="row two">
            <div><label>Repeat icon (emoji/char)</label><input type="text" id="p-icon" maxlength="2" value="${escapeAttr(sel.icon || '')}"></div>
            <div><label>Icon size mm (0=auto)</label><input type="number" id="p-iconsize" min="0" step="0.5" value="${r1(sel.iconSizeMM)}"></div>
        </div>`;
    }

    if (sel.type === 'barcode') return `
        <hr class="sep">
        <div class="row"><label>Data (Code 128)</label><input type="text" id="p-data" value="${escapeAttr(sel.data || '')}"></div>
        <div class="row two">
            <div><label>Quiet zone</label><input type="number" id="p-quiet" min="0" max="20" step="1" value="${sel.quiet}"></div>
            <div><label class="check" style="margin-top:18px"><input type="checkbox" id="p-showtext" ${sel.showText ? 'checked' : ''}> Human-readable text</label></div>
        </div>`;

    if (sel.type === 'box') return `
        <hr class="sep">
        <div class="row three">
            <div><label>W mm</label><input type="number" id="p-boxw" min="10" step="1" value="${r1(sel.boxW)}"></div>
            <div><label>D mm</label><input type="number" id="p-boxd" min="10" step="1" value="${r1(sel.boxD)}"></div>
            <div><label>H mm</label><input type="number" id="p-boxh" min="10" step="1" value="${r1(sel.boxH)}"></div>
        </div>
        <div class="row two">
            <div><label>Thickness mm</label><input type="number" id="p-thick" min="1" max="12" step="0.5" value="${r1(sel.thickness)}"></div>
            <div><label>Finger mm</label><input type="number" id="p-tabw" min="4" max="40" step="1" value="${r1(sel.tab)}"></div>
        </div>
        <p class="muted tiny">6 fingered panels — cut, then assemble. Match thickness to your material.</p>`;

    if (sel.type === 'gear') return `
        <hr class="sep">
        <div class="row two">
            <div><label>Teeth</label><input type="number" id="p-teeth" min="6" max="120" step="1" value="${sel.teeth}"></div>
            <div><label>Bore mm</label><input type="number" id="p-bore" min="0" step="0.5" value="${r1(sel.bore)}"></div>
        </div>`;

    if (sel.type === 'hinge') return `
        <hr class="sep">
        <div class="row two">
            <div><label>Column gap mm</label><input type="number" id="p-colgap" min="1.5" max="10" step="0.5" value="${r1(sel.colGap)}"></div>
            <div><label>Slit length mm</label><input type="number" id="p-slit" min="4" max="40" step="1" value="${r1(sel.slit)}"></div>
        </div>
        <p class="muted tiny">Staggered kerf cuts make plywood/MDF bend. Test on scrap first.</p>`;

    if (sel.type === 'ruler') return `<hr class="sep"><p class="muted tiny">Ticks every 1 mm, numbers every 10 mm — set the length via Width.</p>`;
    if (sel.type === 'registration') return `<hr class="sep"><p class="muted tiny">Corner crosshairs for print-and-cut / camera alignment.</p>`;

    if (sel.type === 'image') {
        const p = sel.params;
        const sl = (id, label, min, max, step, val) => `
            <div class="slider-row"><label>${label}</label>
            <input type="range" id="pi-${id}" min="${min}" max="${max}" step="${step}" value="${val}">
            <input type="number" id="pin-${id}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`;
        return `
        <hr class="sep">
        <p class="muted tiny">🖼 Grayscale engraving pipeline — tune, then Export as PNG/BMP/JPG or G-code.</p>
        ${sl('brightness', 'Brightness', -100, 100, 1, p.brightness)}
        ${sl('contrast', 'Contrast', -100, 100, 1, p.contrast)}
        ${sl('gamma', 'Gamma', 0.1, 3, 0.05, p.gamma)}
        ${sl('levelsBlack', 'Levels — black point', 0, 254, 1, p.levelsBlack)}
        ${sl('levelsWhite', 'Levels — white point', 1, 255, 1, p.levelsWhite)}
        <div class="row"><label>Dithering</label><select id="pi-dither">${DITHER_METHODS.map(([v, n]) =>
            `<option value="${v}" ${p.dither === v ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
        <p class="hint-tip">Dithering fakes grey shades with dots — best for photos on wood/acrylic.</p>
        ${sl('ditherCutoff', 'Threshold cutoff', 0, 255, 1, p.ditherCutoff)}
        <label class="check"><input type="checkbox" id="pi-invert" ${p.invert ? 'checked' : ''}> Invert (dark materials / slate)</label>
        <label class="check"><input type="checkbox" id="pi-removeBg" ${p.removeBg ? 'checked' : ''}> Remove white background</label>
        ${sl('bgThreshold', 'Background threshold', 150, 255, 1, p.bgThreshold)}
        <div class="btn-row"><button class="btn" id="pi-reset">Reset image adjustments</button></div>`;
    }
    return '';
}

const row = (label, control) => `<div class="row"><label>${label}</label>${control}</div>`;

function renderProps() {
    const sel = store.selected;
    const box = $('#props');
    if (!sel) { box.innerHTML = '<p class="muted">Nothing selected. Pick an object on the canvas, or add one from the left.</p>'; return; }
    box.innerHTML = commonHTML(sel) + typeHTML(sel);
    wireCommon(sel);
    wireType(sel);
}

function wireCommon(sel) {
    bindText('p-name', (v) => ({ name: v }));
    bindNum('p-x', (v) => ({ x: v }));
    bindNum('p-y', (v) => ({ y: v }));
    bindNum('p-rot', (v) => ({ rotation: ((v % 360) + 360) % 360 }));
    bindNum('p-w', (v, tr) => sizePatch(sel, 'w', v));
    bindNum('p-h', (v, tr) => sizePatch(sel, 'h', v));
    const mir = $('#p-mirror'); if (mir) mir.addEventListener('change', () => store.patch(sel.id, { mirror: mir.checked }));
    $$('.op-pill').forEach((pill) => pill.addEventListener('click', () => {
        store.patch(sel.id, { op: pill.dataset.op });
        $$('.op-pill').forEach((p) => p.classList.toggle('active', p.dataset.op === pill.dataset.op));
    }));
    $('#p-dup').addEventListener('click', () => store.duplicateSelected());
    $('#p-del').addEventListener('click', () => store.removeSelected());
    $('#p-front').addEventListener('click', () => store.reorder(sel.id, 'up'));
    $('#p-back').addEventListener('click', () => store.reorder(sel.id, 'down'));
    const arr = $('#p-array'); if (arr) arr.addEventListener('click', () => arrayGrid(sel));
}

function arrayGrid(sel) {
    const spec = prompt('Array: cols x rows x gap(mm) — e.g. 3x2x5', '3x2x5');
    if (!spec) return;
    const m = spec.match(/(\d+)\s*[x\u00d7]\s*(\d+)\s*[x\u00d7]\s*([\d.]+)/i);
    if (!m) { alert('Format: colsxrowsxgap, e.g. 3x2x5'); return; }
    const cols = clamp(+m[1], 1, 50), rows = clamp(+m[2], 1, 50), gap = +m[3] || 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if (r === 0 && c === 0) continue;
        const copy = JSON.parse(JSON.stringify(sel));
        copy.id = `o${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        copy.x = sel.x + c * (sel.w + gap);
        copy.y = sel.y + r * (sel.h + gap);
        store.state.objects.push(copy);
    }
    store.commit('array');
}

function sizePatch(sel, dim, v) {
    v = Math.max(0.2, v || 0.2);
    if (sel.type === 'image') {
        const ratio = sel.natW / sel.natH;
        if (dim === 'w') return { w: v, h: v / ratio };
        return { h: v, w: v * ratio };
    }
    if (sel.type === 'text') {
        const cur = dim === 'w' ? sel.w : sel.h;
        const sizeMM = clamp(sel.sizeMM * (v / (cur || 1)), 1, 2000);
        const m = measureText({ ...sel, sizeMM });
        return { sizeMM, w: m.wMM, h: m.hMM };
    }
    return { [dim]: v };
}

function wireType(sel) {
    if (sel.type === 'text') {
        const reflow = (extra, transient) => {
            const patched = { ...sel, ...extra };
            const m = measureText(patched);
            store.patch(sel.id, { ...extra, w: m.wMM, h: m.hMM }, { transient });
        };
        bindRaw('p-text', 'input', (el) => reflow({ text: el.value }, true), true);
        bindRaw('p-font', 'change', (el) => reflow({ font: el.value }, false));
        bindRaw('p-align', 'change', (el) => reflow({ align: el.value }, false));
        bindNum('p-size', (v) => { const m = measureText({ ...sel, sizeMM: v }); return { sizeMM: v, w: m.wMM, h: m.hMM }; });
        bindNum('p-lh', (v) => { const m = measureText({ ...sel, lineHeight: v }); return { lineHeight: v, w: m.wMM, h: m.hMM }; });
        bindNum('p-arc', (v) => ({ arc: v }));
        ['bold', 'italic', 'fill'].forEach((k) => {
            const c = $('#p-' + k); if (c) c.addEventListener('change', () => reflow({ [k]: c.checked }, false));
        });
    } else if (sel.type === 'qr') {
        bindRaw('p-data', 'input', (el) => store.patch(sel.id, { data: el.value }, { transient: true }), true);
        bindRaw('p-ecl', 'change', (el) => store.patch(sel.id, { ecl: el.value }));
        bindNum('p-quiet', (v) => ({ quiet: clamp(v | 0, 0, 10) }));
    } else if (sel.type === 'shape') {
        bindNum('p-radius', (v) => ({ radiusMM: Math.max(0, v) }));
        bindNum('p-sides', (v) => ({ sides: clamp(v | 0, 3, 60) }));
        bindNum('p-points', (v) => ({ points: clamp(v | 0, 3, 30) }));
        bindNum('p-inner', (v) => ({ innerRatio: clamp(v, 0.1, 0.95) }));
    } else if (sel.type === 'puzzle') {
        wirePuzzle(sel);
    } else if (sel.type === 'barcode') {
        bindRaw('p-data', 'input', (el) => store.patch(sel.id, { data: el.value }, { transient: true }), true);
        bindNum('p-quiet', (v) => ({ quiet: clamp(v | 0, 0, 20) }));
        const st = $('#p-showtext'); if (st) st.addEventListener('change', () => store.patch(sel.id, { showText: st.checked }));
    } else if (sel.type === 'box') {
        const bx = (extra) => { const s = boxNetSize({ ...sel, ...extra }); return { ...extra, w: s.w, h: s.h }; };
        bindNum('p-boxw', (v) => bx({ boxW: Math.max(10, v) }));
        bindNum('p-boxd', (v) => bx({ boxD: Math.max(10, v) }));
        bindNum('p-boxh', (v) => bx({ boxH: Math.max(10, v) }));
        bindNum('p-thick', (v) => bx({ thickness: clamp(v, 1, 12) }));
        bindNum('p-tabw', (v) => ({ tab: clamp(v, 4, 40) }));
    } else if (sel.type === 'gear') {
        bindNum('p-teeth', (v) => ({ teeth: clamp(v | 0, 6, 120) }));
        bindNum('p-bore', (v) => ({ bore: Math.max(0, v) }));
    } else if (sel.type === 'hinge') {
        bindNum('p-colgap', (v) => ({ colGap: clamp(v, 1.5, 10) }));
        bindNum('p-slit', (v) => ({ slit: clamp(v, 4, 40) }));
    } else if (sel.type === 'image') {
        wireImage(sel);
    }
}

function wirePuzzle(sel) {
    bindRaw('p-pstyle', 'change', (el) => { store.patch(sel.id, { style: el.value }); renderProps(); });
    bindNum('p-cols', (v) => ({ cols: clamp(v | 0, 1, 40) }));
    bindNum('p-rows', (v) => ({ rows: clamp(v | 0, 1, 40) }));
    bindNum('p-tab', (v) => ({ tab: clamp(v, 0.08, 0.35) }));
    bindRaw('p-geoshape', 'change', (el) => store.patch(sel.id, { geoShape: el.value }));
    bindRaw('p-tabstyle', 'change', (el) => store.patch(sel.id, { tabStyle: el.value }));
    bindNum('p-seed', (v) => ({ seed: v | 0 }));
    bindNum('p-iconsize', (v) => ({ iconSizeMM: Math.max(0, v) }));
    bindRaw('p-icon', 'input', (el) => store.patch(sel.id, { icon: el.value.slice(0, 2) }, { transient: true }), true);
    const nb = $('#p-numbered'); if (nb) nb.addEventListener('change', () => store.patch(sel.id, { numbered: nb.checked }));
    const et = $('#p-editile');
    if (et) et.addEventListener('click', () => openTileEditor(
        { edgeH: sel.edgeH || [], edgeV: sel.edgeV || [] },
        (res) => store.patch(sel.id, { edgeH: res.edgeH, edgeV: res.edgeV })));
    const sh = $('#p-shuffle');
    if (sh) sh.addEventListener('click', () => store.patch(sel.id, { seed: (Math.random() * 1e9) | 0 }));
    // show only the relevant controls for the chosen style
    const isGeo = sel.style === 'geometric', isJig = sel.style === 'jigsaw', isVor = sel.style === 'voronoi', isCustom = sel.style === 'custom';
    const show = (id, on) => { const e = $('#' + id); if (e) e.style.display = on ? '' : 'none'; };
    show('p-tabrow', !isGeo && !isVor && !isCustom);
    show('p-tabstylerow', !isGeo && !isVor && !isCustom);
    show('p-georow', isGeo);
    show('p-seedrow', isJig || isVor);
    show('p-customrow', isCustom);
    const hints = {
        jigsaw: 'Classic puzzle with random interlocking tabs. “Tab size” changes the knobs.',
        tessellation: 'One repeating tile that fits into itself — every piece is identical.',
        geometric: 'Straight-cut tiles: square, triangle or hexagon. Simple and fast.',
        voronoi: 'Organic random cells — change the seed for a new pattern.',
        custom: 'Draw your own repeating tile — every piece becomes that shape and interlocks.',
    };
    const hintEl = $('#p-stylehint'); if (hintEl) hintEl.textContent = hints[sel.style] || '';
}

function wireImage(sel) {
    const keys = ['brightness', 'contrast', 'gamma', 'levelsBlack', 'levelsWhite', 'ditherCutoff', 'bgThreshold'];
    keys.forEach((k) => {
        const rng = $('#pi-' + k), nb = $('#pin-' + k);
        if (!rng) return;
        const apply = (val, transient) => {
            const v = parseFloat(val);
            rng.value = v; nb.value = v;
            store.patch(sel.id, { params: { ...sel.params, [k]: v } }, { transient });
        };
        rng.addEventListener('input', () => apply(rng.value, true));
        rng.addEventListener('change', () => apply(rng.value, false));
        nb.addEventListener('input', () => apply(nb.value, true));
        nb.addEventListener('change', () => apply(nb.value, false));
    });
    bindRaw('pi-dither', 'change', (el) => store.patch(sel.id, { params: { ...sel.params, dither: el.value } }));
    ['invert', 'removeBg'].forEach((k) => {
        const c = $('#pi-' + k); if (c) c.addEventListener('change', () => store.patch(sel.id, { params: { ...sel.params, [k]: c.checked } }));
    });
    $('#pi-reset').addEventListener('click', () => {
        store.patch(sel.id, { params: {
            brightness: 0, contrast: 0, gamma: 1, levelsBlack: 0, levelsWhite: 255,
            invert: false, dither: 'none', ditherCutoff: 128, removeBg: false, bgThreshold: 245,
        } });
        renderProps();
    });
}

// bind helpers -----------------------------------------------------
function bindNum(id, toPatch) {
    const inp = $('#' + id); if (!inp) return;
    const run = (transient) => {
        const v = parseFloat(inp.value);
        if (Number.isNaN(v)) return;
        const sel = store.selected; if (!sel) return;
        const patch = toPatch(v, transient);
        if (patch) store.patch(sel.id, patch, { transient });
    };
    inp.addEventListener('input', () => run(true));
    inp.addEventListener('change', () => run(false));
}
function bindText(id, toPatch) {
    const inp = $('#' + id); if (!inp) return;
    inp.addEventListener('input', () => { const s = store.selected; if (s) store.patch(s.id, toPatch(inp.value), { transient: true }); });
    inp.addEventListener('change', () => { const s = store.selected; if (s) store.patch(s.id, toPatch(inp.value)); });
}
function bindRaw(id, evt, fn, commitOnBlur) {
    const el = $('#' + id); if (!el) return;
    el.addEventListener(evt, () => fn(el));
    if (commitOnBlur) el.addEventListener('blur', () => store.commit('edit'));
}

function syncFields() {
    const sel = store.selected; if (!sel) return;
    const set = (id, val) => { const e = $('#' + id); if (e && document.activeElement !== e) e.value = val; };
    set('p-x', r1(sel.x)); set('p-y', r1(sel.y));
    set('p-w', r1(sel.w)); set('p-h', r1(sel.h)); set('p-rot', r1(sel.rotation || 0));
    if (sel.type === 'text') set('p-size', r1(sel.sizeMM));
}

// ---------------------------------------------------------------- layers
function renderLayers() {
    const ul = $('#layers');
    const objs = store.objects;
    $('#layer-count').textContent = objs.length ? `(${objs.length})` : '';
    ul.innerHTML = '';
    for (let i = objs.length - 1; i >= 0; i--) {
        const o = objs[i];
        const li = document.createElement('li');
        li.className = 'layer' + (o.id === store.selectedId ? ' active' : '');
        li.innerHTML = `<span class="op-dot" style="background:${OP_COLORS[o.op]}"></span>
            <span class="lname">${escapeHtml(o.name || o.type)}</span>
            <button class="lvis" title="Show / hide">${o.visible === false ? '🚫' : '👁'}</button>`;
        li.addEventListener('click', (e) => { if (!e.target.classList.contains('lvis')) store.select(o.id); });
        li.querySelector('.lvis').addEventListener('click', (e) => {
            e.stopPropagation();
            store.patch(o.id, { visible: o.visible === false });
        });
        ul.appendChild(li);
    }
}

// ---------------------------------------------------------------- artboard settings
function initArtboardControls() {
    const bed = $('#bed');
    bed.innerHTML = Object.keys(BED_PRESETS).map((k) => `<option>${k}</option>`).join('');
    bed.addEventListener('change', () => {
        const p = BED_PRESETS[bed.value];
        store.setArtboard({ bed: bed.value, widthMM: p.w, heightMM: p.h });
        art.fit();
    });
    $('#ab-w').addEventListener('change', () => { store.setArtboard({ widthMM: clamp(+$('#ab-w').value, 10, 2000) }); art.fit(); });
    $('#ab-h').addEventListener('change', () => { store.setArtboard({ heightMM: clamp(+$('#ab-h').value, 10, 2000) }); art.fit(); });
    syncArtboardInputs();
}
function syncArtboardInputs() {
    const a = store.state.artboard;
    $('#bed').value = a.bed || '';
    $('#ab-w').value = a.widthMM; $('#ab-h').value = a.heightMM;
}

// ---------------------------------------------------------------- status
function updateStatus() {
    const a = store.state.artboard;
    $('#status-doc').textContent = `Artboard ${a.widthMM}×${a.heightMM} mm`;
    const sel = store.selected;
    $('#status-sel').textContent = sel ? `${sel.name} · ${r1(sel.w)}×${r1(sel.h)} mm @ (${r1(sel.x)}, ${r1(sel.y)})` : '';
    $('#status-zoom').textContent = `${Math.round(store.state.view.zoom * 100 / (96 / 25.4)) / 100}× · ${store.state.view.zoom.toFixed(1)} px/mm`;
}
function toggleHint() { $('#empty-hint').style.display = store.objects.length ? 'none' : ''; }

// ---------------------------------------------------------------- emoji popover
function toggleEmoji(btn) {
    const pop = $('#emoji-pop');
    if (!pop.hidden) { pop.hidden = true; return; }
    if (!pop.dataset.built) {
        const grid = $('#emoji-grid');
        grid.innerHTML = EMOJI.filter((e) => e.length <= 2).map((e) => `<button title="${e}">${e}</button>`).join('');
        grid.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                store.addObject(createText({ text: e.target.textContent, font: 'sans-serif', sizeMM: 30, name: 'Emoji' }));
                pop.hidden = true;
            }
        });
        pop.dataset.built = '1';
    }
    const r = btn.getBoundingClientRect();
    pop.style.left = (r.right + 8) + 'px';
    pop.style.top = r.top + 'px';
    pop.hidden = false;
}
document.addEventListener('click', (e) => {
    const pop = $('#emoji-pop');
    if (!pop.hidden && !pop.contains(e.target) && !e.target.closest('[data-action="emoji"]')) pop.hidden = true;
});

// ---------------------------------------------------------------- export
const PRESETS = {
    lightburn: { format: 'svg' },
    glowforge: { format: 'svg' },
    xtool: { format: 'svg' },
    inkscape: { format: 'svg' },
    rayforge: { format: 'svg' },
    ruida: { format: 'dxf' },
    lasergrbl: { format: 'bmp', dpi: 200, bits: 8 },
    grbl: { format: 'gcode' },
};

function openExport() { syncExportUI(); $('#export-modal').hidden = false; }
$('#export-close').addEventListener('click', () => $('#export-modal').hidden = true);
$('#export-modal').addEventListener('click', (e) => { if (e.target.id === 'export-modal') $('#export-modal').hidden = true; });

$('#preset').addEventListener('change', () => {
    const p = PRESETS[$('#preset').value];
    if (!p) return;
    $('#format').value = p.format;
    if (p.dpi) $('#opt-dpi').value = p.dpi;
    if (p.bits) $('#opt-bits').value = p.bits;
    if (p.format === 'gcode') $('#g-mode').value = 'vector';
    syncExportUI();
});
$('#format').addEventListener('change', syncExportUI);
$('#g-mode').addEventListener('change', syncExportUI);
['#opt-dpi', '#g-dpi'].forEach((s) => $(s).addEventListener('input', syncExportUI));

function syncExportUI() {
    const fmt = $('#format').value;
    const raster = ['png', 'bmp', 'jpg'].includes(fmt);
    $('#opt-raster').hidden = !raster;
    $('#opt-bits-wrap').style.display = fmt === 'bmp' ? '' : 'none';
    $('#opt-quality-wrap').style.display = fmt === 'jpg' ? '' : 'none';
    $('#opt-gcode').hidden = fmt !== 'gcode';
    $('#g-dpi-wrap').style.display = $('#g-mode').value === 'raster' ? '' : 'none';
    // summary
    const a = store.state.artboard;
    let summary = '';
    if (raster || (fmt === 'gcode' && $('#g-mode').value === 'raster')) {
        const dpi = fmt === 'gcode' ? +$('#g-dpi').value : +$('#opt-dpi').value;
        const px = Math.round(a.widthMM / 25.4 * dpi), py = Math.round(a.heightMM / 25.4 * dpi);
        summary = `${a.widthMM}×${a.heightMM} mm → ${px}×${py} px @ ${dpi} DPI`;
    } else {
        summary = `Vector output · ${a.widthMM}×${a.heightMM} mm · true 1:1 scale`;
    }
    $('#export-summary').textContent = summary;
    const est = estimate(store, { engraveSpeed: +$('#g-espeed').value || 1500, cutSpeed: +$('#g-cspeed').value || 600 });
    $('#export-estimate').textContent = (est.cutLen || est.engLen)
        ? `~ ${(est.timeSec / 60).toFixed(1)} min vector · cut ${Math.round(est.cutLen)} mm · engrave ${Math.round(est.engLen)} mm (approx.)`
        : '';
}

$('#export-go').addEventListener('click', async () => {
    const fmt = $('#format').value;
    if (!store.objects.length) { alert('Nothing to export yet — add some content first.'); return; }
    let opts = { kerf: +$('#opt-kerf').value || 0, overscan: +$('#opt-overscan').value || 0 };
    if (['png', 'jpg', 'bmp'].includes(fmt)) {
        opts.dpi = clamp(+$('#opt-dpi').value, 50, 1200);
        if (fmt === 'bmp') opts.bits = +$('#opt-bits').value;
        if (fmt === 'jpg') opts.quality = +$('#opt-quality').value;
    } else if (fmt === 'gcode') {
        if (!$('#g-ack').checked) { alert('Please confirm the safety acknowledgement before exporting G-code.'); return; }
        opts = {
            ...DEFAULT_GCODE, kerf: +$('#opt-kerf').value || 0, overscan: +$('#opt-overscan').value || 0,
            mode: $('#g-mode').value, laserMode: $('#g-laser').value,
            engraveSpeed: +$('#g-espeed').value, cutSpeed: +$('#g-cspeed').value,
            powerEngrave: +$('#g-epow').value, powerCut: +$('#g-cpow').value,
            maxPower: +$('#g-max').value, dpi: +$('#g-dpi').value,
        };
    }
    const go = $('#export-go');
    go.disabled = true; go.textContent = 'Working…';
    try {
        await runExport(store, fmt, opts);
        $('#export-modal').hidden = true;
    } catch (err) {
        console.error(err); alert('Export failed: ' + err.message);
    } finally {
        go.disabled = false; go.textContent = '⤓ Download';
    }
});

// ---------------------------------------------------------------- utils
function r1(n) { return Math.round((n || 0) * 10) / 10; }
function escapeHtml(s) { return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }

// ---------------------------------------------------------------- boot
initArtboardControls();
applyI18n();
{
    const hb = $('#help-modal .modal-body');
    if (hb) {
        const sb = document.createElement('button');
        sb.className = 'btn'; sb.style.marginTop = '10px';
        sb.textContent = '🔗 Copy shareable link';
        sb.addEventListener('click', shareLink);
        hb.appendChild(sb);
    }
}
renderProps();
renderLayers();
toggleHint();
updateStatus();
