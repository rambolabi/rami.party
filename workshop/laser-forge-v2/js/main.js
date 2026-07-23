// main.js — UI wiring: toolbar, properties, layers, artboard settings, export

import { Store, BED_PRESETS } from './store.js';
import { Artboard } from './artboard.js';
import { createText, createShape, createQR, createPuzzle, createBarcode, createImageFromFile, measureText, createTestGrid, createPath, traceImageToVector, produceProcessed, booleanObjects } from './objects.js';
import { createBox, createGear, createRuler, createHinge, createRegistration, boxNetSize } from './generators.js';
import { DITHER_METHODS } from './dither.js';
import { QR_ECL } from './qr.js';
import { runExport, DEFAULT_GCODE, estimate, toSVG } from './exporters.js';
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
            store.state.selectedIds = [];
            store._lastSnapshot = store.snapshot();
        }
    } catch (_) { /* ignore malformed link */ }
})();
const art = new Artboard(store, $('#board'));
art.onStatus = updateStatus;

// ---------------------------------------------------------------- structural render
const STRUCTURAL = new Set(['select', 'add', 'remove', 'history', 'new', 'reorder', 'artboard', 'edit']);
store.subscribe((state, reason) => {
    renderLayers();
    toggleHint();
    if (STRUCTURAL.has(reason) || reason === 'select') renderProps();
    else syncFields();
    if (reason === 'artboard' || reason === 'new' || reason === 'history') syncArtboardInputs();
    if (reason === 'new') { art.fit(); document.title = document.title.replace(/^● /, ''); }
    else if (!['select', 'live'].includes(reason) && !/^● /.test(document.title)) document.title = '● ' + document.title;
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
    else if (action === 'gen-test') store.addObject(createTestGrid());
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

// SVG / DXF import → editable path objects
$('#btn-import').addEventListener('click', () => $('#import-input').click());
$('#import-input').addEventListener('change', async (e) => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    try {
        const { importVector } = await import('./importers.js');
        const loops = importVector(f.name, await f.text());
        const path = createPath(loops, { name: f.name.replace(/\.[^.]+$/, ''), op: 'cut' });
        // place near the origin corner
        path.x = 10; path.y = 10;
        store.addObject(path);
        art.fit();
    } catch (err) { alert('Import failed: ' + err.message); }
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
let currentHandle = null;
async function fsMod() { return import('./fs.js'); }
$('#btn-save').addEventListener('click', async () => {
    const { fsSupported, pickSave, writeHandle } = await fsMod();
    const data = { artboard: store.state.artboard, objects: store.state.objects };
    if (fsSupported) {
        try {
            if (!currentHandle) currentHandle = await pickSave(`laserforge-${new Date().toISOString().slice(0, 10)}.json`);
            await writeHandle(currentHandle, data);
            document.title = document.title.replace(/^● /, '');
            toast('Saved to ' + currentHandle.name);
            return;
        } catch (err) { if (err.name === 'AbortError') return; /* else fall back */ }
    }
    saveProject();
});
$('#btn-save').addEventListener('contextmenu', async (e) => {
    e.preventDefault();
    const { fsSupported, pickSave, writeHandle } = await fsMod();
    if (!fsSupported) return saveProject();
    try { currentHandle = await pickSave(`laserforge-${new Date().toISOString().slice(0, 10)}.json`); await writeHandle(currentHandle, { artboard: store.state.artboard, objects: store.state.objects }); toast('Saved as ' + currentHandle.name); } catch (_) {}
});
$('#btn-open').addEventListener('click', async () => {
    const { fsSupported, pickOpen } = await fsMod();
    if (fsSupported) {
        try {
            const { handle, data, name } = await pickOpen();
            if (!Array.isArray(data.objects)) throw new Error('not a Laser Forge project');
            currentHandle = handle;
            store.state.artboard = data.artboard || store.state.artboard;
            store.state.objects = data.objects;
            store.state.selectedId = null; store.state.selectedIds = [];
            store.commit('new'); art.fit();
            toast('Opened ' + name);
            return;
        } catch (err) { if (err.name === 'AbortError') return; alert('Open failed: ' + err.message); return; }
    }
    $('#project-input').click();
});
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
        store.state.selectedIds = [];
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
    else if (ctrl && e.key.toLowerCase() === 'a') { e.preventDefault(); store.selectAll(); }
    else if (ctrl && e.key.toLowerCase() === 'g') { e.preventDefault(); e.shiftKey ? store.ungroup() : store.group(); }
    else if (e.key === 'Escape') { store.clearSelection(); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { store.removeSelected(); }
    else if (e.key === 'f' || e.key === 'F') { art.fit(); }
    else if (e.key.startsWith('Arrow')) {
        const sels = store.selectedObjects; if (!sels.length) return;
        e.preventDefault();
        const d = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -d : e.key === 'ArrowRight' ? d : 0;
        const dy = e.key === 'ArrowUp' ? -d : e.key === 'ArrowDown' ? d : 0;
        store.patchMany(sels.map((o) => ({ id: o.id, props: { x: o.x + dx, y: o.y + dy } })));
    }
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
        </div>
        <label class="check"><input type="checkbox" id="p-single" ${sel.singleLine ? 'checked' : ''}> Single-line (centreline / Hershey-style)</label>
        <p class="hint-tip">Single-line engraves a skeleton stroke instead of a filled outline — far faster on the laser.</p>`;

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
        return `<hr class="sep">${extra}${cutcraftHTML(sel)}`;
    }

    if (sel.type === 'path') return `<hr class="sep">
        <p class="muted tiny">✒️ Vector path (traced / imported / boolean result). Resize via Width/Height.</p>
        ${cutcraftHTML(sel)}`;

    if (sel.type === 'testgrid') return `
        <hr class="sep">
        <p class="muted tiny">🧪 Material test — each cell engraves; set the matching power (columns) and speed (rows) per cell in your laser software.</p>
        <div class="row two">
            <div><label>Columns (power)</label><input type="number" id="p-cols" min="1" max="20" step="1" value="${sel.cols}"></div>
            <div><label>Rows (speed)</label><input type="number" id="p-rows" min="1" max="20" step="1" value="${sel.rows}"></div>
        </div>
        <div class="row two">
            <div><label>Power min %</label><input type="number" id="p-pmin" min="0" max="100" step="1" value="${sel.powerMin}"></div>
            <div><label>Power max %</label><input type="number" id="p-pmax" min="0" max="100" step="1" value="${sel.powerMax}"></div>
        </div>
        <div class="row two">
            <div><label>Speed min</label><input type="number" id="p-smin" min="1" step="10" value="${sel.speedMin}"></div>
            <div><label>Speed max</label><input type="number" id="p-smax" min="1" step="10" value="${sel.speedMax}"></div>
        </div>`;

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
            ${styleOpt('spiral', 'Spiral — one continuous spiral cut')}
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
        <hr class="sep">
        <p class="muted tiny">🎛 Pre-filters (applied before dithering)</p>
        ${sl('blur', 'Blur (denoise)', 0, 8, 1, p.blur ?? 0)}
        ${sl('sharpen', 'Sharpen', 0, 100, 1, p.sharpen ?? 0)}
        ${sl('posterize', 'Posterize (colour count, 0=off)', 0, 16, 1, p.posterize ?? 0)}
        <label class="check"><input type="checkbox" id="pi-edge" ${p.edge ? 'checked' : ''}> Edge detect (line-art outline)</label>
        <hr class="sep">
        <p class="muted tiny">✒️ Convert this image to editable vector paths:</p>
        <div class="btn-row">
            <button class="btn" id="pi-trace-outline">Trace outline → cut</button>
            <button class="btn" id="pi-trace-center">Centerline → engrave</button>
        </div>
        <div class="btn-row"><button class="btn" id="pi-reset">Reset image adjustments</button></div>`;
    }
    return '';
}

const row = (label, control) => `<div class="row"><label>${label}</label>${control}</div>`;

// Hatch-fill + bridge/tab controls shared by shapes and paths.
function cutcraftHTML(sel) {
    return `
    <hr class="sep">
    <p class="muted tiny">🪚 Cut craft — hatch fill (engrave) &amp; bridges/tabs (hold parts in place).</p>
    <div class="row two">
        <div><label>Hatch spacing mm (0=off)</label><input type="number" id="p-hatch" min="0" max="20" step="0.2" value="${r1(sel.hatch || 0)}"></div>
        <div><label>Hatch angle °</label><input type="number" id="p-hatchang" min="0" max="180" step="5" value="${sel.hatchAngle || 0}"></div>
    </div>
    <div class="row two">
        <div><label>Bridges / edge (0=off)</label><input type="number" id="p-bridges" min="0" max="8" step="1" value="${sel.bridges || 0}"></div>
        <div><label>Bridge gap mm</label><input type="number" id="p-bridgegap" min="0.3" max="5" step="0.1" value="${r1(sel.bridgeGap || 1.5)}"></div>
    </div>`;
}

function renderProps() {
    const selObjs = store.selectedObjects;
    const box = $('#props');
    if (selObjs.length > 1) { box.innerHTML = groupHTML(selObjs); wireGroup(selObjs); return; }
    const sel = store.selected;
    if (!sel) { box.innerHTML = '<p class="muted">Nothing selected. Pick an object on the canvas, or add one from the left. Drag a box on empty canvas to marquee-select; Shift-click to add.</p>'; return; }
    box.innerHTML = commonHTML(sel) + typeHTML(sel);
    wireCommon(sel);
    wireType(sel);
}

function groupHTML(objs) {
    const grouped = objs.some((o) => o.groupId);
    return `
    <p class="muted"><strong>${objs.length} objects selected.</strong> Move together by dragging; use the tools below.</p>
    <hr class="sep">
    <p class="muted tiny">Align</p>
    <div class="btn-row">
        <button class="btn" id="al-left" title="Align left">⇤</button>
        <button class="btn" id="al-hcenter" title="Centre horizontally">⇔</button>
        <button class="btn" id="al-right" title="Align right">⇥</button>
        <button class="btn" id="al-top" title="Align top">⤒</button>
        <button class="btn" id="al-vcenter" title="Centre vertically">⇕</button>
        <button class="btn" id="al-bottom" title="Align bottom">⤓</button>
    </div>
    <p class="muted tiny">Distribute</p>
    <div class="btn-row">
        <button class="btn" id="dist-h" title="Distribute horizontally">↔ spread</button>
        <button class="btn" id="dist-v" title="Distribute vertically">↕ spread</button>
    </div>
    <hr class="sep">
    <p class="muted tiny">Boolean (raster-combined into one path)</p>
    <div class="btn-row">
        <button class="btn" id="bool-union" title="Union">Union</button>
        <button class="btn" id="bool-intersect" title="Intersect">Intersect</button>
        <button class="btn" id="bool-subtract" title="Subtract (first − rest)">Subtract</button>
        <button class="btn" id="bool-xor" title="Exclusive OR">XOR</button>
    </div>
    <hr class="sep">
    <div class="btn-row">
        <button class="btn" id="grp-group" ${grouped ? 'disabled' : ''}>Group</button>
        <button class="btn" id="grp-ungroup" ${grouped ? '' : 'disabled'}>Ungroup</button>
        <button class="btn" id="grp-dup">Duplicate</button>
        <button class="btn danger" id="grp-del">Delete</button>
    </div>`;
}

function wireGroup(objs) {
    const ids = objs.map((o) => o.id);
    const on = (id, fn) => { const e = $('#' + id); if (e) e.addEventListener('click', fn); };
    on('al-left', () => alignObjects(ids, 'left'));
    on('al-hcenter', () => alignObjects(ids, 'hcenter'));
    on('al-right', () => alignObjects(ids, 'right'));
    on('al-top', () => alignObjects(ids, 'top'));
    on('al-vcenter', () => alignObjects(ids, 'vcenter'));
    on('al-bottom', () => alignObjects(ids, 'bottom'));
    on('dist-h', () => distributeObjects(ids, 'h'));
    on('dist-v', () => distributeObjects(ids, 'v'));
    on('bool-union', () => doBoolean(objs, 'union'));
    on('bool-intersect', () => doBoolean(objs, 'intersect'));
    on('bool-subtract', () => doBoolean(objs, 'subtract'));
    on('bool-xor', () => doBoolean(objs, 'xor'));
    on('grp-group', () => store.group());
    on('grp-ungroup', () => store.ungroup());
    on('grp-dup', () => store.duplicateSelected());
    on('grp-del', () => store.removeSelected());
}

function alignObjects(ids, mode) {
    const objs = store.objects.filter((o) => ids.includes(o.id));
    if (objs.length < 2) return;
    const xs = objs.map((o) => o.x), ys = objs.map((o) => o.y);
    const rs = objs.map((o) => o.x + o.w), bs = objs.map((o) => o.y + o.h);
    const minX = Math.min(...xs), maxR = Math.max(...rs), minY = Math.min(...ys), maxB = Math.max(...bs);
    const cx = (minX + maxR) / 2, cy = (minY + maxB) / 2;
    const upd = objs.map((o) => {
        const p = {};
        if (mode === 'left') p.x = minX;
        else if (mode === 'right') p.x = maxR - o.w;
        else if (mode === 'hcenter') p.x = cx - o.w / 2;
        else if (mode === 'top') p.y = minY;
        else if (mode === 'bottom') p.y = maxB - o.h;
        else if (mode === 'vcenter') p.y = cy - o.h / 2;
        return { id: o.id, props: p };
    });
    store.patchMany(upd);
}

function distributeObjects(ids, axis) {
    const objs = store.objects.filter((o) => ids.includes(o.id));
    if (objs.length < 3) { alert('Select 3+ objects to distribute.'); return; }
    const key = axis === 'h' ? 'x' : 'y', dim = axis === 'h' ? 'w' : 'h';
    const sorted = [...objs].sort((a, b) => (a[key] + a[dim] / 2) - (b[key] + b[dim] / 2));
    const first = sorted[0], last = sorted[sorted.length - 1];
    const span = (last[key] + last[dim] / 2) - (first[key] + first[dim] / 2);
    const stepC = span / (sorted.length - 1);
    const c0 = first[key] + first[dim] / 2;
    const upd = sorted.map((o, i) => ({ id: o.id, props: { [key]: c0 + stepC * i - o[dim] / 2 } }));
    store.patchMany(upd);
}

function doBoolean(objs, mode) {
    const result = booleanObjects(objs, mode);
    if (!result || !result.length) { alert('Boolean produced nothing — check the shapes overlap.'); return; }
    const ids = new Set(objs.map((o) => o.id));
    const rest = store.objects.filter((o) => !ids.has(o.id));
    const path = createPath(result, { name: `Boolean (${mode})`, op: objs[0].op || 'cut' });
    store.setObjects([...rest, path], [path.id]);
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
        const sng = $('#p-single'); if (sng) sng.addEventListener('change', () => store.patch(sel.id, { singleLine: sng.checked }));
    } else if (sel.type === 'qr') {
        bindRaw('p-data', 'input', (el) => store.patch(sel.id, { data: el.value }, { transient: true }), true);
        bindRaw('p-ecl', 'change', (el) => store.patch(sel.id, { ecl: el.value }));
        bindNum('p-quiet', (v) => ({ quiet: clamp(v | 0, 0, 10) }));
    } else if (sel.type === 'shape') {
        bindNum('p-radius', (v) => ({ radiusMM: Math.max(0, v) }));
        bindNum('p-sides', (v) => ({ sides: clamp(v | 0, 3, 60) }));
        bindNum('p-points', (v) => ({ points: clamp(v | 0, 3, 30) }));
        bindNum('p-inner', (v) => ({ innerRatio: clamp(v, 0.1, 0.95) }));
        wireCutcraft(sel);
    } else if (sel.type === 'path') {
        wireCutcraft(sel);
    } else if (sel.type === 'testgrid') {
        bindNum('p-cols', (v) => ({ cols: clamp(v | 0, 1, 20) }));
        bindNum('p-rows', (v) => ({ rows: clamp(v | 0, 1, 20) }));
        bindNum('p-pmin', (v) => ({ powerMin: clamp(v, 0, 100) }));
        bindNum('p-pmax', (v) => ({ powerMax: clamp(v, 0, 100) }));
        bindNum('p-smin', (v) => ({ speedMin: Math.max(1, v) }));
        bindNum('p-smax', (v) => ({ speedMax: Math.max(1, v) }));
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

function wireCutcraft(sel) {
    bindNum('p-hatch', (v) => ({ hatch: clamp(v, 0, 20) }));
    bindNum('p-hatchang', (v) => ({ hatchAngle: clamp(v, 0, 180) }));
    bindNum('p-bridges', (v) => ({ bridges: clamp(v | 0, 0, 8) }));
    bindNum('p-bridgegap', (v) => ({ bridgeGap: clamp(v, 0.3, 5) }));
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
    if (sh) sh.addEventListener('click', () => {
        const s = (Math.random() * 1e9) | 0;
        store.patch(sel.id, { seed: s });
        const seedInput = $('#p-seed');
        if (seedInput) seedInput.value = s;   // keep the visible field in sync
    });
    // show only the relevant controls for the chosen style
    const isGeo = sel.style === 'geometric', isJig = sel.style === 'jigsaw', isVor = sel.style === 'voronoi', isCustom = sel.style === 'custom', isSpiral = sel.style === 'spiral';
    const show = (id, on) => { const e = $('#' + id); if (e) e.style.display = on ? '' : 'none'; };
    show('p-tabrow', !isGeo && !isVor && !isCustom && !isSpiral);
    show('p-tabstylerow', !isGeo && !isVor && !isCustom && !isSpiral);
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
    hints.spiral = 'One continuous spiral cut — rows + columns control the number of turns.';
    const hintEl = $('#p-stylehint'); if (hintEl) hintEl.textContent = hints[sel.style] || '';
}

function wireImage(sel) {
    const keys = ['brightness', 'contrast', 'gamma', 'levelsBlack', 'levelsWhite', 'ditherCutoff', 'bgThreshold', 'blur', 'sharpen', 'posterize'];
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
    ['invert', 'removeBg', 'edge'].forEach((k) => {
        const c = $('#pi-' + k); if (c) c.addEventListener('change', () => store.patch(sel.id, { params: { ...sel.params, [k]: c.checked } }));
    });
    const trace = async (mode) => {
        await produceProcessed(sel, 900);
        const loops = traceImageToVector(sel, mode);
        if (!loops || !loops.length) { alert('Nothing traceable — adjust threshold / contrast first.'); return; }
        store.addObject(createPath(loops, { name: `${sel.name} (${mode})` }));
    };
    const to = $('#pi-trace-outline'); if (to) to.addEventListener('click', () => trace('outline'));
    const tc = $('#pi-trace-center'); if (tc) tc.addEventListener('click', () => trace('centerline'));
    $('#pi-reset').addEventListener('click', () => {
        store.patch(sel.id, { params: {
            brightness: 0, contrast: 0, gamma: 1, levelsBlack: 0, levelsWhite: 255,
            invert: false, dither: 'none', ditherCutoff: 128, removeBg: false, bgThreshold: 245,
            blur: 0, sharpen: 0, edge: false, posterize: 0,
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
        li.className = 'layer' + (store.isSelected(o.id) ? ' active' : '');
        li.innerHTML = `<span class="op-dot" style="background:${OP_COLORS[o.op]}"></span>
            <span class="lname">${escapeHtml(o.name || o.type)}</span>
            <button class="lvis" title="Show / hide">${o.visible === false ? '🚫' : '👁'}</button>`;
        li.addEventListener('click', (e) => {
            if (e.target.classList.contains('lvis')) return;
            store.select(o.id, { additive: e.shiftKey || e.ctrlKey || e.metaKey });
        });
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
    const origin = $('#ab-origin');
    if (origin) origin.addEventListener('change', () => { store.setArtboard({ origin: origin.value }); art.render(); });
    const snap = $('#ab-snap');
    if (snap) snap.addEventListener('change', () => { art.snap = snap.checked ? ((store.state.artboard.widthMM > 400) ? 5 : 1) : 0; });
    const lpi = $('#ab-lpi'), lpiVal = $('#ab-lpi-val');
    if (lpi) lpi.addEventListener('input', () => {
        const v = +lpi.value; art.lpi = v; lpiVal.textContent = v ? `${v} LPI` : 'off'; art.render();
    });
    const mat = $('#ab-material');
    if (mat) mat.addEventListener('change', () => applyMaterial(mat.value));
    syncArtboardInputs();
}

const MATERIALS = {
    wood: { params: { contrast: 15, gamma: 1.1, dither: 'floyd-steinberg', invert: false }, gEngrave: 3000, gCut: 400, pEngrave: 550, pCut: 1000 },
    acrylic: { params: { contrast: 25, gamma: 1, dither: 'none', invert: true }, gEngrave: 4000, gCut: 350, pEngrave: 500, pCut: 1000 },
    slate: { params: { contrast: 20, gamma: 1, dither: 'atkinson', invert: true }, gEngrave: 3500, gCut: 0, pEngrave: 900, pCut: 0 },
    leather: { params: { contrast: 10, gamma: 1.2, dither: 'floyd-steinberg', invert: false }, gEngrave: 3000, gCut: 250, pEngrave: 600, pCut: 900 },
    anodized: { params: { contrast: 30, gamma: 1, dither: 'none', invert: true }, gEngrave: 5000, gCut: 0, pEngrave: 800, pCut: 0 },
    coated: { params: { contrast: 30, gamma: 1, dither: 'none', invert: false }, gEngrave: 5000, gCut: 0, pEngrave: 700, pCut: 0 },
    glass: { params: { contrast: 10, gamma: 1, dither: 'bayer-4', invert: false }, gEngrave: 3000, gCut: 0, pEngrave: 350, pCut: 0 },
    paper: { params: { contrast: 20, gamma: 1, dither: 'none', invert: false }, gEngrave: 6000, gCut: 800, pEngrave: 200, pCut: 500 },
};
function applyMaterial(key) {
    store.setArtboard({ material: key || '' });
    const m = MATERIALS[key];
    if (!m) return;
    // apply to a selected image
    const sel = store.selected;
    if (sel && sel.type === 'image') {
        store.patch(sel.id, { params: { ...sel.params, ...m.params } });
        renderProps();
    }
    // pre-load g-code defaults for the export dialog
    const set = (id, v) => { const e = $('#' + id); if (e && v) e.value = v; };
    set('g-espeed', m.gEngrave); set('g-cspeed', m.gCut);
    set('g-epow', m.pEngrave); set('g-cpow', m.pCut);
}
function syncArtboardInputs() {
    const a = store.state.artboard;
    $('#bed').value = a.bed || '';
    $('#ab-w').value = a.widthMM; $('#ab-h').value = a.heightMM;
    const o = $('#ab-origin'); if (o) o.value = a.origin || 'top-left';
    const m = $('#ab-material'); if (m) m.value = a.material || '';
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
    renderExportPreview();
}

let _previewSeq = 0;
async function renderExportPreview() {
    const img = $('#export-preview');
    if (!img) return;
    const seq = ++_previewSeq;
    if (!store.objects.length) { img.hidden = true; return; }
    try {
        const kerf = +$('#opt-kerf').value || 0;
        const svg = await toSVG(store, { kerf });
        if (seq !== _previewSeq) return; // superseded
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        img.hidden = false;
    } catch (_) { img.hidden = true; }
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
// a11y: give icon-only controls accessible names from their titles
$$('button[title]:not([aria-label])').forEach((b) => b.setAttribute('aria-label', b.title));
const boardEl = $('#board');
if (boardEl) { boardEl.setAttribute('role', 'application'); boardEl.setAttribute('aria-label', 'Design canvas — drag to select or move objects'); boardEl.setAttribute('tabindex', '0'); }
// Machine control panel (Web Serial) — mounts into the sidebar.
import('./machine.js').then(({ mountMachinePanel }) => {
    const mount = $('#machine-mount');
    if (mount) mountMachinePanel(mount, { store });
}).catch((err) => console.warn('machine panel unavailable', err));

// ---------------------------------------------------------------- toast helper
function toast(msg, actionLabel, onAction, ms = 6000) {
    const t = $('#toast');
    t.innerHTML = `<span>${escapeHtml(msg)}</span>`;
    if (actionLabel) {
        const b = document.createElement('button');
        b.className = 'btn btn-primary'; b.textContent = actionLabel;
        b.addEventListener('click', () => { t.hidden = true; onAction && onAction(); });
        t.appendChild(b);
    }
    t.hidden = false;
    clearTimeout(toast._t);
    if (!actionLabel) toast._t = setTimeout(() => { t.hidden = true; }, ms);
}

// ---------------------------------------------------------------- PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then((reg) => {
            reg.addEventListener('updatefound', () => {
                const nw = reg.installing;
                nw && nw.addEventListener('statechange', () => {
                    if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                        toast('Update available.', 'Reload', () => { nw.postMessage('skipWaiting'); location.reload(); });
                    }
                });
            });
        }).catch(() => {});
    });
}
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredInstall = e;
    const b = $('#btn-install'); if (b) b.hidden = false;
});
$('#btn-install')?.addEventListener('click', async () => {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null; $('#btn-install').hidden = true;
});

// ---------------------------------------------------------------- plugins
import('./plugins.js').then(async (P) => {
    P.installGlobal();
    // auto-run previously-approved plugins (no re-prompt)
    for (const pl of await P.listPlugins()) {
        if (pl.enabled) { try { new Function('LaserForge', pl.code)(window.LaserForge); } catch (_) {} }
    }
    P.onPluginsChanged(() => { renderPluginList(P); renderLayers(); art.render(); });
    wirePluginsModal(P);
}).catch((err) => console.warn('plugins unavailable', err));

async function wirePluginsModal(P) {
    const { createPluginObject } = await import('./objects.js');
    const modal = $('#plugins-modal');
    $('#btn-plugins').addEventListener('click', () => { modal.hidden = false; renderPluginList(P); });
    $('#plugins-close').addEventListener('click', () => { modal.hidden = true; });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });
    $('#plugin-run').addEventListener('click', async () => {
        const code = $('#plugin-code').value.trim();
        if (!code) return;
        const res = P.runPluginCode(code);
        if (!res.ok) { if (res.reason !== 'declined') alert('Plugin error: ' + res.reason); return; }
        const id = 'pl' + Date.now();
        await P.savePlugin(id, code.slice(0, 40), code, true);
        $('#plugin-code').value = '';
        renderPluginList(P);
        toast('Plugin installed.');
    });
    window._addPluginObject = (type) => {
        const desc = P.getGenerator(type); if (!desc) return;
        store.addObject(createPluginObject(desc));
        $('#plugins-modal').hidden = true;
    };
    renderPluginList(P);
}
function renderPluginList(P) {
    const gens = $('#plugin-gens'); if (!gens) return;
    const list = P.listGenerators();
    gens.innerHTML = list.length
        ? list.map((g) => `<div class="plugin-item"><span>${escapeHtml(g.label || g.type)} <span class="muted tiny">(${escapeHtml(g.type)})</span></span><button class="btn" onclick="window._addPluginObject('${escapeAttr(g.type)}')">Add</button></div>`).join('')
        : '<p class="muted tiny">None yet.</p>';
    const dl = P.listDialects();
    P.listPlugins().then((saved) => {
        const box = $('#plugin-saved'); if (!box) return;
        box.innerHTML = saved.length
            ? saved.map((s) => `<div class="plugin-item"><span>${escapeHtml(s.name)}</span><button class="btn danger" data-del="${escapeAttr(s.id)}">Remove</button></div>`).join('')
            : '<p class="muted tiny">None saved.</p>';
        box.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => { await P.deletePlugin(b.dataset.del); renderPluginList(P); }));
    });
    if (dl.length) gens.innerHTML += `<p class="muted tiny">Dialects: ${dl.map((d) => escapeHtml(d.name || d.id)).join(', ')}</p>`;
}
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
