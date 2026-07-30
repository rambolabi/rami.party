/* ==========================================================================
   The Scribe — Web Serial console for Frostcaller
   --------------------------------------------------------------------------
   Standalone: no shared globals with the main guide, so it keeps working if
   app.js ever changes shape. Same house rules — no innerHTML, no
   dependencies, and nothing is sent anywhere.

   What it does
     • Opens a serial port with the Web Serial API (Chrome / Edge, HTTPS).
     • Identifies the chip using the ESP ROM loader protocol. Read-only:
       it syncs, reads one register, and puts the board back the way it was.
     • Streams the log, filters it, and pulls infrared captures out of it.
     • Sends text back — which is useful on Tasmota and Arduino sketches,
       and honestly useless on ESPHome. The page says so.

   What it deliberately does NOT do: write firmware. See todo-writer.md.
   ========================================================================== */

'use strict';

/* ── Small helpers ───────────────────────────────────────────────────────── */
/* `el`, `rich` and `safeUrl` come from ../text.js — one audited place where a
   string is allowed to become an element. `showToast`, `copyText`,
   `downloadText` and `startStarfield` come from ../ui.js. */

const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ── Serial state ────────────────────────────────────────────────────────── */
let port = null;
let reader = null;
let keepReading = false;
let paused = false;
let partial = '';
const lines = [];           /* everything received, as text lines */
const captures = [];        /* infrared codes pulled out of the stream */
let rx = [];                /* raw bytes, for the ROM protocol */
let rawMode = false;        /* while true, bytes go to rx instead of the log */

const MAX_LINES = 2000;

/* ── Connect ─────────────────────────────────────────────────────────────── */
function supported() {
    return 'serial' in navigator;
}

function setStatus(text, cls) {
    const s = $('status');
    s.textContent = text;
    s.className = 'status ' + cls;
}

function setConnected(on) {
    ['identifyBtn', 'resetBtn', 'pauseBtn', 'disconnectBtn', 'sendBtn'].forEach(id => {
        const b = $(id);
        if (b) b.disabled = !on;
    });
    $('connectBtn').textContent = on ? 'Connected' : 'Connect a board';
    $('connectBtn').disabled = on;
}

async function connect() {
    if (!supported()) return;
    try {
        port = await navigator.serial.requestPort();
        const baudRate = parseInt($('baudSelect').value, 10) || 115200;
        await port.open({ baudRate, bufferSize: 16384 });
        keepReading = true;
        setConnected(true);
        setStatus(tv('w.connected', { baud: baudRate }), 'is-on');
        addLine(tv('w.l.connected', { baud: baudRate }), 'meta');
        renderFlipperPanel();
        renderCaptures();
        readLoop();
    } catch (err) {
        if (err && err.name === 'NotFoundError') {
            addLine(t('w.l.noport'), 'meta');
            return;
        }
        addLine(tv('w.l.openfail', { err: (err && err.message ? err.message : String(err)) }), 'bad');
        setStatus(t('w.cantopen'), 'is-bad');
    }
}

async function disconnect() {
    keepReading = false;
    try {
        if (reader) { await reader.cancel(); reader = null; }
        if (port) { await port.close(); }
    } catch (e) { /* the port may already be gone */ }
    port = null;
    FLIPPER.active = false;
    document.body.classList.remove('is-flipper');
    setConnected(false);
    setStatus(t('w.notconnected'), 'is-off');
    addLine(t('w.l.disconnected'), 'meta');
    renderFlipperPanel();
    renderCaptures();
}

async function readLoop() {
    while (port && port.readable && keepReading) {
        reader = port.readable.getReader();
        try {
            for (;;) {
                const { value, done } = await reader.read();
                if (done) break;
                if (!value) continue;
                if (rawMode) {
                    rx.push(...value);
                } else {
                    handleText(new TextDecoder().decode(value));
                }
            }
        } catch (e) {
            addLine(tv('w.l.dropped', { err: (e.message || String(e)) }), 'bad');
        } finally {
            try { reader.releaseLock(); } catch (e) { /* already released */ }
            reader = null;
        }
    }
}

/* ── The log ─────────────────────────────────────────────────────────────── */
function handleText(chunk) {
    partial += chunk;
    if (!FLIPPER.active && looksLikeFlipper(partial)) enterFlipperMode();
    const parts = partial.split(/\r?\n/);
    partial = parts.pop();
    parts.forEach(l => {
        addLine(l, kindOf(l));
        sniffCapture(l);
    });
}

function enterFlipperMode() {
    FLIPPER.active = true;
    document.body.classList.add('is-flipper');
    setStatus(t('w.flipperon'), 'is-on');
    addLine(t('w.l.flipper'), 'good');
    renderFlipperPanel();
    renderCaptures();
}

function kindOf(line) {
    if (/\[E\]|ERROR|Guru Meditation|abort\(\)|Brownout/i.test(line)) return 'bad';
    if (/\[W\]|WARN/i.test(line)) return 'warn';
    if (/Received /i.test(line)) return 'ir';
    if (/WiFi Connected|IP Address|Boot seems successful/i.test(line)) return 'good';
    return 'plain';
}

function addLine(text, kind) {
    lines.push({ text, kind });
    if (lines.length > MAX_LINES) lines.splice(0, lines.length - MAX_LINES);
    if (!paused) drawLine(text, kind);
}

function passesFilter(text) {
    const f = $('filterInput').value.trim().toLowerCase();
    return !f || text.toLowerCase().includes(f);
}

function drawLine(text, kind) {
    if (!passesFilter(text)) return;
    const log = $('log');
    const row = el('div', 'log-line is-' + kind, text);
    log.appendChild(row);
    /* If the guide's explainer recognises the line, say what it means. */
    if (typeof annotate === 'function') {
        const say = annotate(text);
        if (say) log.appendChild(el('div', 'log-note', '↳ ' + say));
    }
    while (log.childElementCount > MAX_LINES * 2) log.removeChild(log.firstChild);
    if ($('autoscroll').checked) log.scrollTop = log.scrollHeight;
}

function redrawLog() {
    const log = $('log');
    log.textContent = '';
    lines.forEach(l => drawLine(l.text, l.kind));
}

/* ── Infrared captures ───────────────────────────────────────────────────── */
const CAP_KEY = 'frostcaller.captures.v1';

const CAPTURE_PATTERNS = [
    { re: /Received Raw:\s*(.+)$/i, kind: 'raw' },
    { re: /Received Pronto:\s*data=?['"]?([0-9A-Fa-f ]+)/i, kind: 'pronto' },
    { re: /"IrReceived":\s*\{(.+)\}/i, kind: 'tasmota' },
    { re: /Received ([A-Za-z0-9_]+):\s*(.+)$/i, kind: 'decoded' },
];

function addCapture(entry) {
    entry.at = entry.at || new Date();
    entry.label = entry.label || '';
    /* The same button held down repeats; do not fill the list with copies. */
    const last = captures[captures.length - 1];
    if (last && last.line === entry.line) return;
    captures.push(entry);
    saveCaptures();
    renderCaptures();
}

function sniffCapture(line) {
    if (FLIPPER.active && flipperParseLine(line)) return;

    for (const p of CAPTURE_PATTERNS) {
        const m = p.re.exec(line);
        if (!m) continue;
        const entry = { kind: p.kind, source: 'serial', line: line.trim() };
        if (p.kind === 'raw') entry.codes = (m[1].match(/-?\d+/g) || []).map(Number);
        if (p.kind === 'decoded') entry.protocol = m[1];
        if (p.kind === 'pronto') entry.pronto = m[1].trim();
        addCapture(entry);
        return;
    }
}

function saveCaptures() {
    try {
        localStorage.setItem(CAP_KEY, JSON.stringify(captures.slice(-120).map(c => ({
            ...c, at: c.at instanceof Date ? c.at.toISOString() : c.at,
        }))));
    } catch (e) { /* private mode, or a very long evening */ }
}

function loadCaptures() {
    try {
        const raw = localStorage.getItem(CAP_KEY);
        if (!raw) return;
        JSON.parse(raw).forEach(c => {
            c.at = new Date(c.at);
            captures.push(c);
        });
    } catch (e) { /* ignore */ }
}

/** A short human name suggested from what the signal looks like. */
function suggestName(c) {
    if (c.label) return c.label;
    if (c.kind === 'raw' && c.codes) {
        if (c.codes.length > 90) return 'air conditioner state';
        if (c.codes.length < 30) return 'short button';
        return 'signal';
    }
    if (c.protocol) return c.protocol + ' ' + (c.command || '');
    return 'signal';
}

const CAP_TARGETS = [
    { id: 'esphome', label: 'ESPHome' },
    { id: 'tasmota', label: 'Tasmota' },
    { id: 'pronto', label: 'Pronto' },
    { id: 'flipper', label: '.ir file' },
    { id: 'smartir', label: 'SmartIR' },
];

function renderCaptures() {
    const host = $('capList');
    host.textContent = '';

    const count = $('capCount');
    if (count) count.textContent = captures.length ? tv('w.cap.kept', { n: captures.length }) : t('w.cap.nonekept');

    if (!captures.length) {
        host.appendChild(rich(el('p', 'q-hint'), t('w.cap.nothingyet')));
        return;
    }

    captures.slice().reverse().forEach((c, i) => {
        const idx = captures.length - 1 - i;
        const card = el('article', 'cap');
        if (c.selected) card.classList.add('is-picked');

        const top = el('div', 'cap-top');
        const pick = el('label', 'cap-pick');
        const cb = el('input');
        cb.type = 'checkbox';
        cb.checked = !!c.selected;
        cb.title = t('w.cap.pick');
        cb.addEventListener('change', () => {
            c.selected = cb.checked;
            renderCaptures();
            renderDiff();
            /* The lab watches the same ticks. */
            if (typeof renderChecksum === 'function') renderChecksum();
            if (typeof renderSkeleton === 'function') renderSkeleton();
        });
        pick.appendChild(cb);
        top.appendChild(pick);

        const title = el('span', 'cap-title');
        title.textContent = c.kind === 'raw'
            ? tv('w.cap.raw', { n: (c.codes ? c.codes.length : 0) })
            : c.kind === 'flipper-decoded' ? 'Flipper · ' + c.protocol
                : c.kind === 'decoded' ? tv('w.cap.decoded', { p: c.protocol })
                    : c.kind === 'pronto' ? 'Pronto' : 'Tasmota';
        top.appendChild(title);

        const src = el('span', 'cap-src', c.source === 'flipper' ? '🐬' : c.source === 'irfile' ? '📄' : '🔌');
        src.title = c.source === 'flipper' ? t('w.cap.src.flipper')
            : c.source === 'irfile' ? t('w.cap.src.file') : t('w.cap.src.serial');
        top.appendChild(src);

        top.appendChild(el('span', 'cap-time',
            (c.at instanceof Date ? c.at : new Date(c.at)).toLocaleTimeString()));
        card.appendChild(top);

        const name = el('input', 'cap-name');
        name.type = 'text';
        name.placeholder = tv('w.cap.nameph', { suggested: suggestName(c) });
        name.value = c.label;
        name.addEventListener('input', () => { c.label = name.value; saveCaptures(); });
        card.appendChild(name);

        card.appendChild(el('code', 'cap-raw',
            c.line.length > 240 ? c.line.slice(0, 240) + ' …' : c.line));

        if (c.kind === 'decoded' || c.kind === 'flipper-decoded') {
            card.appendChild(el('p', 'step-note', tv('w.cap.known', { p: c.protocol })));
        }

        const row = el('div', 'mini-row');
        CAP_TARGETS.forEach(t => {
            const b = el('button', 'mini-btn', t.label);
            b.type = 'button';
            b.addEventListener('click', () => copyText(convertCapture(c, t.id), b));
            row.appendChild(b);
        });

        if (FLIPPER.active && port) {
            const tx = el('button', 'mini-btn', t('w.cap.replay'));
            tx.type = 'button';
            tx.addEventListener('click', () => sendText(flipperTxCommand(c)));
            row.appendChild(tx);
        }

        const del = el('button', 'mini-btn', t('w.cap.forget'));
        del.type = 'button';
        del.addEventListener('click', () => {
            captures.splice(idx, 1);
            saveCaptures();
            renderCaptures();
            renderDiff();
        });
        row.appendChild(del);

        card.appendChild(row);
        host.appendChild(card);
    });
}

/* ── Capture diffing ─────────────────────────────────────────────────────── */
/* Press "cool 22", then "cool 23", tick both, and see which pulses moved.
   This is how an unknown protocol actually gets taken apart. */
function renderDiff() {
    const host = $('diffBody');
    if (!host) return;
    host.textContent = '';

    const picked = captures.filter(c => c.selected);
    if (picked.length !== 2) {
        host.appendChild(el('p', 'q-hint', t('w.diff.pick') +
            (picked.length ? ' ' + tv('w.diff.ticked', { n: picked.length }) : '')));
        return;
    }

    const [a, b] = picked;
    if (a.kind !== 'raw' || b.kind !== 'raw') {
        host.appendChild(el('p', 'step-note',
            tv('w.diff.notraw', { a: (a.command || '?'), b: (b.command || '?') })));
        return;
    }

    const A = a.codes, B = b.codes;
    const n = Math.max(A.length, B.length);
    let changed = 0;
    const tol = 120;

    const strip = el('div', 'diff-strip');
    for (let i = 0; i < n; i++) {
        const va = A[i], vb = B[i];
        const same = va !== undefined && vb !== undefined && Math.abs(Math.abs(va) - Math.abs(vb)) <= tol;
        if (!same) changed++;
        const cell = el('span', 'diff-cell ' + (same ? 'is-same' : 'is-diff'));
        cell.title = '#' + i + ': ' + (va === undefined ? '—' : va) + ' vs ' + (vb === undefined ? '—' : vb);
        strip.appendChild(cell);
    }

    host.appendChild(el('p', 'q-hint', tv('w.diff.count', {
        a: (a.label || t('w.diff.first')),
        b: (b.label || t('w.diff.second')),
        n: changed, total: n, tol: tol,
    })));
    host.appendChild(strip);

    const runs = [];
    let start = -1;
    for (let i = 0; i <= n; i++) {
        const va = A[i], vb = B[i];
        const same = i < n && va !== undefined && vb !== undefined &&
            Math.abs(Math.abs(va) - Math.abs(vb)) <= tol;
        if (!same && start < 0) start = i;
        if (same && start >= 0) { runs.push([start, i - 1]); start = -1; }
    }
    if (runs.length) {
        host.appendChild(para2(tv('w.diff.blocks', {
            list: runs.slice(0, 8).map(r => r[0] === r[1] ? '#' + r[0] : '#' + r[0] + '–' + r[1]).join(', ') +
                (runs.length > 8 ? t('w.diff.more') : ''),
        })));
    }

    if (changed === 0) {
        host.appendChild(el('p', 'step-note', t('w.diff.same')));
    } else if (changed < n * 0.15) {
        host.appendChild(el('p', 'step-note', t('w.diff.small')));
    } else {
        host.appendChild(el('p', 'step-note', t('w.diff.big')));
    }
}

/** A tool lead paragraph. Goes through `rich()` — anything rendering author
 *  text must, or backticks and asterisks show up literally on screen. */
function para2(text) {
    return rich(el('p', 'tool-lead'), text);
}

/* ── Import and export ───────────────────────────────────────────────────── */
function importIrText(text, sourceName) {
    const signals = parseIrFile(text);
    if (!signals.length) {
        showToast(t('w.imp.nosignals'));
        return;
    }
    signals.forEach(s => {
        s.source = 'irfile';
        s.at = new Date();
        captures.push(s);
    });
    saveCaptures();
    renderCaptures();
    showToast(tv(sourceName ? 'w.imp.okfrom' : 'w.imp.ok',
        { n: signals.length, name: sourceName || '' }));
}

function exportAll(kind) {
    if (!captures.length) { showToast(t('w.exp.nothing')); return; }
    if (kind === 'ir') {
        downloadText('frostcaller.ir', toIrFile(captures));
    } else if (kind === 'esphome') {
        downloadText('frostcaller-buttons.yaml',
            '# Captured with The Scribe · rami.party/workshop/frostcaller/writer/\n\n' +
            captures.map(c => convertCapture(c, 'esphome')).join('\n'));
    } else if (kind === 'smartir') {
        const commands = {};
        captures.forEach((c, i) => {
            const key = (c.label || 'command_' + (i + 1)).replace(/\s+/g, '_');
            commands[key] = c.kind === 'raw' ? c.codes.map(n => Math.abs(n)) : c.command;
        });
        downloadText('smartir-1000.json', JSON.stringify({
            manufacturer: 'Captured',
            supportedModels: ['fill this in'],
            commandsEncoding: 'Raw',
            supportedController: 'MQTT',
            minTemperature: 16, maxTemperature: 30, precision: 1,
            operationModes: ['cool', 'heat', 'dry', 'fan'],
            fanModes: ['auto', 'low', 'mid', 'high'],
            commands,
        }, null, 2));
    } else if (kind === 'json') {
        downloadText('frostcaller-captures.json', JSON.stringify(captures, null, 2));
    }
}

/* ── The ESP ROM loader: identify the chip ───────────────────────────────── */
const SLIP_END = 0xC0, SLIP_ESC = 0xDB, SLIP_ESC_END = 0xDC, SLIP_ESC_ESC = 0xDD;

const CHIP_MAGIC = {
    0xfff0c101: 'ESP8266',
    0x00f01d83: 'ESP32',
    0x000007c6: 'ESP32-S2',
    0x09: 'ESP32-S3',
    0x6921506f: 'ESP32-C3 (rev 3)',
    0x1b31506f: 'ESP32-C3 (rev 2)',
    0x4881606f: 'ESP32-C3 (rev 4)',
    0x4361606f: 'ESP32-C3 (rev 4)',
    0x2ce0806f: 'ESP32-C6',
    0xd7b73e80: 'ESP32-H2',
    0x6f51306f: 'ESP32-C2',
    0x7c41a06f: 'ESP32-C2',
};

async function writeBytes(bytes) {
    const w = port.writable.getWriter();
    try { await w.write(new Uint8Array(bytes)); } finally { w.releaseLock(); }
}

function slipEncode(payload) {
    const out = [SLIP_END];
    payload.forEach(b => {
        if (b === SLIP_END) out.push(SLIP_ESC, SLIP_ESC_END);
        else if (b === SLIP_ESC) out.push(SLIP_ESC, SLIP_ESC_ESC);
        else out.push(b);
    });
    out.push(SLIP_END);
    return out;
}

function romCommand(op, data, checksum) {
    const head = [0x00, op, data.length & 0xFF, (data.length >> 8) & 0xFF,
    checksum & 0xFF, (checksum >> 8) & 0xFF, (checksum >> 16) & 0xFF, (checksum >> 24) & 0xFF];
    return slipEncode(head.concat(data));
}

/** Pull one complete SLIP frame out of the rx buffer, or null. */
function takeFrame() {
    let start = rx.indexOf(SLIP_END);
    if (start < 0) return null;
    let end = rx.indexOf(SLIP_END, start + 1);
    /* Back-to-back END bytes are just padding between frames. */
    while (end === start + 1) { start = end; end = rx.indexOf(SLIP_END, start + 1); }
    if (end < 0) return null;
    const body = rx.slice(start + 1, end);
    rx = rx.slice(end + 1);

    const out = [];
    for (let i = 0; i < body.length; i++) {
        if (body[i] === SLIP_ESC) {
            i++;
            out.push(body[i] === SLIP_ESC_END ? SLIP_END : body[i] === SLIP_ESC_ESC ? SLIP_ESC : body[i]);
        } else {
            out.push(body[i]);
        }
    }
    return out;
}

async function romRequest(op, data, checksum, timeoutMs) {
    rx = [];
    await writeBytes(romCommand(op, data, checksum || 0));
    const deadline = Date.now() + (timeoutMs || 500);
    while (Date.now() < deadline) {
        const frame = takeFrame();
        if (frame && frame.length >= 8 && frame[0] === 0x01 && frame[1] === op) {
            return {
                value: (frame[4] | (frame[5] << 8) | (frame[6] << 16) | (frame[7] << 24)) >>> 0,
                payload: frame.slice(8),
            };
        }
        await sleep(12);
    }
    return null;
}

/** The classic auto-reset dance: hold EN low, release it with IO0 held low. */
async function enterBootloader() {
    await port.setSignals({ dataTerminalReady: false, requestToSend: true });
    await sleep(120);
    await port.setSignals({ dataTerminalReady: true, requestToSend: false });
    await sleep(60);
    await port.setSignals({ dataTerminalReady: false });
    await sleep(60);
}

async function hardReset() {
    await port.setSignals({ dataTerminalReady: false, requestToSend: true });
    await sleep(120);
    await port.setSignals({ dataTerminalReady: false, requestToSend: false });
}

async function identify() {
    if (!port) return;
    const btn = $('identifyBtn');
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = 'Listening…';
    rawMode = true;
    rx = [];

    try {
        addLine(t('w.l.knock'), 'meta');
        await enterBootloader();

        const syncData = [0x07, 0x07, 0x12, 0x20].concat(new Array(32).fill(0x55));
        let synced = false;
        for (let attempt = 0; attempt < 7 && !synced; attempt++) {
            const res = await romRequest(0x08, syncData, 0, 400);
            if (res) synced = true;
        }

        if (!synced) {
            showChip(null, t('w.chip.nosync'));
            addLine(t('w.l.noanswer'), 'warn');
            return;
        }

        /* Drain the extra sync replies the ROM sends, then read the magic word. */
        await sleep(60);
        rx = [];
        const addr = 0x40001000;
        const reg = await romRequest(0x0A, [addr & 0xFF, (addr >> 8) & 0xFF, (addr >> 16) & 0xFF, (addr >> 24) & 0xFF], 0, 800);

        if (!reg) {
            showChip(null, t('w.chip.noreg'));
            return;
        }
        const magic = reg.value >>> 0;
        showChip(CHIP_MAGIC[magic] || null, null, magic);
        addLine(tv('w.l.magic', { hex: '0x' + magic.toString(16).padStart(8, '0') }), 'good');
    } catch (err) {
        showChip(null, err && err.message ? err.message : String(err));
    } finally {
        rawMode = false;
        rx = [];
        btn.textContent = original;
        btn.disabled = false;
        addLine(t('w.l.restart'), 'meta');
        try { await hardReset(); } catch (e) { /* ignore */ }
    }
}

function showChip(name, problem, magic) {
    const card = $('chipCard');
    card.textContent = '';
    card.hidden = false;

    if (name) {
        card.className = 'chip-card is-good';
        card.appendChild(el('h3', 'chip-name', name));
        card.appendChild(el('p', 'chip-say', t('w.chip.found')));
        if (magic != null) card.appendChild(el('code', 'chip-magic', '0x' + magic.toString(16).padStart(8, '0')));
        return;
    }

    if (magic != null) {
        card.className = 'chip-card is-good';
        card.appendChild(el('h3', 'chip-name', t('w.chip.someesp')));
        card.appendChild(el('p', 'chip-say', t('w.chip.unknownmagic')));
        card.appendChild(el('code', 'chip-magic', '0x' + magic.toString(16).padStart(8, '0')));
        return;
    }

    card.className = 'chip-card is-bad';
    card.appendChild(el('h3', 'chip-name', t('w.chip.noanswer')));
    const p = el('p', 'chip-say');
    p.textContent = problem || t('w.chip.noreply');
    card.appendChild(p);
    const ul = el('ul', 'chip-list');
    ['w.chip.t1', 'w.chip.t2', 'w.chip.t3', 'w.chip.t4']
        .forEach(k => ul.appendChild(el('li', null, t(k))));
    card.appendChild(ul);
}

/* ── Sending ─────────────────────────────────────────────────────────────── */
async function sendText(text) {
    if (!port || !port.writable) return;
    const payload = text + ($('sendNewline').checked ? '\r\n' : '');
    await writeBytes(Array.from(new TextEncoder().encode(payload)));
    addLine('» ' + text, 'sent');
}

/* Tasmota's IRHVAC command, built from four dropdowns. */
const HVAC = {
    vendor: 'Coolix',
    power: 'On',
    mode: 'Cold',
    fan: 'Auto',
    temp: 22,
};

const HVAC_VENDORS = ['Coolix', 'Daikin', 'Fujitsu', 'Gree', 'Haier', 'Hitachi', 'Kelvinator',
    'LG', 'Midea', 'Mitsubishi', 'Panasonic', 'Samsung', 'Sharp', 'TCL', 'Teco', 'Toshiba', 'Whirlpool'];

function renderHvac() {
    const host = $('hvacForm');
    const out = $('hvacOut');
    if (!host || !out) return;
    host.textContent = '';

    const field = (label, key, options) => {
        const w = el('label', 'bf');
        w.appendChild(el('span', 'bf-label', label));
        const s = el('select');
        options.forEach(o => {
            const opt = el('option', null, String(o));
            opt.value = String(o);
            s.appendChild(opt);
        });
        s.value = String(HVAC[key]);
        s.addEventListener('change', () => { HVAC[key] = s.value; update(); });
        w.appendChild(s);
        return w;
    };

    host.appendChild(field('Brand', 'vendor', HVAC_VENDORS));
    host.appendChild(field('Power', 'power', ['On', 'Off']));
    host.appendChild(field('Mode', 'mode', ['Cold', 'Heat', 'Dry', 'Fan', 'Auto']));
    host.appendChild(field('Fan', 'fan', ['Auto', 'Min', 'Medium', 'Max']));
    host.appendChild(field('Temperature', 'temp',
        Array.from({ length: 16 }, (_, i) => 16 + i)));

    function update() {
        out.textContent = '';
        const cmd = 'IRHVAC {"Vendor":"' + HVAC.vendor + '","Power":"' + HVAC.power +
            '","Mode":"' + HVAC.mode + '","FanSpeed":"' + HVAC.fan + '","Temp":' + HVAC.temp + '}';

        const wrap = el('div', 'code');
        const head = el('div', 'code-head');
        head.appendChild(el('span', 'code-label', 'Tasmota console'));
        const btns = el('span', 'code-btns');

        const copy = el('button', 'copy-btn', t('w.copy'));
        copy.type = 'button';
        copy.addEventListener('click', () => copyText(cmd, copy));
        btns.appendChild(copy);

        const send = el('button', 'copy-btn', t('w.sendnow'));
        send.type = 'button';
        send.disabled = !port;
        send.addEventListener('click', () => sendText(cmd));
        btns.appendChild(send);

        head.appendChild(btns);
        const pre = el('pre');
        pre.appendChild(el('code', null, cmd));
        wrap.append(head, pre);
        out.appendChild(wrap);
    }

    update();
}

function truthAboutSending() {
    const p = $('sendTruth');
    if (!p) return;
    p.textContent = '';
    rich(p, t('w.sendtruth'));
}

/* ── Flipper Zero panel ──────────────────────────────────────────────────── */
function renderFlipperPanel() {
    const host = $('flipperPanel');
    if (!host) return;
    host.textContent = '';

    if (!port) {
        host.appendChild(el('p', 'q-hint', t('w.flip.noport')));
        return;
    }
    if (!FLIPPER.active) {
        host.appendChild(el('p', 'q-hint', t('w.flip.notyet')));
        const force = el('button', 'mini-btn', t('w.flip.force'));
        force.type = 'button';
        force.addEventListener('click', enterFlipperMode);
        host.appendChild(force);
        return;
    }

    const row = el('div', 'mini-row');
    const cmd = (label, text, cls) => {
        const b = el('button', cls || 'mini-btn', label);
        b.type = 'button';
        b.addEventListener('click', () => sendText(text));
        row.appendChild(b);
    };

    cmd(t('w.flip.who'), 'device_info');
    cmd(t('w.flip.rx'), 'ir rx', 'btn btn-primary');
    cmd(t('w.flip.rxraw'), 'ir rx raw', 'btn btn-primary');

    const stop = el('button', 'mini-btn', t('w.flip.stop'));
    stop.type = 'button';
    stop.addEventListener('click', async () => {
        if (!port) return;
        await writeBytes([0x03]);          /* Ctrl-C is how you leave `ir rx` */
        addLine('» ^C', 'sent');
    });
    row.appendChild(stop);

    cmd(t('w.flip.universal'), 'ir universal ac');
    host.appendChild(row);

    host.appendChild(el('p', 'step-note', t('w.flip.aim')));

    const info = el('div');
    info.id = 'flipperInfo';
    host.appendChild(info);
    renderFlipperInfo();
}

/* ── Chrome ──────────────────────────────────────────────────────────────── */
/**
 * Language and theme, shared with the guide through one localStorage blob.
 * Read-modify-write, so switching a theme here never disturbs the drawer, the
 * picker answers or a half-finished config next door.
 */
function setupLangAndTheme() {
    const shared = readShared();
    if (typeof setLang === 'function') setLang(shared.l || 'en');
    applyThemeId(shared.t || 'frost');

    const lang = $('langSelect');
    if (lang && typeof LANGS !== 'undefined') {
        LANGS.forEach(l => {
            const o = el('option', null, l.flag + ' ' + l.name);
            o.value = l.id;
            lang.appendChild(o);
        });
        lang.value = shared.l && LANGS.some(l => l.id === shared.l) ? shared.l : 'en';
        lang.addEventListener('change', () => {
            setLang(lang.value);
            writeShared({ l: lang.value });
            redrawTranslated();
        });
    }

    const th = $('themeSelect');
    if (th && typeof THEMES !== 'undefined') {
        [['pro', 'Professional'], ['fun', 'Playful']].forEach(([g, label]) => {
            const grp = document.createElement('optgroup');
            grp.label = label;
            THEMES.filter(x => x.group === g).forEach(x => {
                const o = el('option', null, x.name);
                o.value = x.id;
                o.title = x.note;
                grp.appendChild(o);
            });
            th.appendChild(grp);
        });
        th.value = document.documentElement.dataset.theme;
        th.addEventListener('change', () => {
            applyThemeId(th.value);
            writeShared({ t: th.value });
        });
    }
}

/** Everything on this page that draws its own words rather than reading them
 *  out of the HTML. The lab lives in lab.js, so those are guarded. */
function redrawTranslated() {
    if (!port) setStatus(t('w.notconnected'), 'is-off');
    $('pauseBtn').textContent = paused ? t('w.resume') : t('w.pause');
    supportNote();
    renderCaptures();
    renderDiff();
    renderFlipperPanel();
    renderHvac();
    renderQuiz();
    truthAboutSending();
    renderFlipperRepos();
    if (typeof renderChecksum === 'function') renderChecksum();
    if (typeof renderSkeleton === 'function') renderSkeleton();
    if (typeof renderIrdb === 'function') renderIrdb();

    /* The log is a transcript and must not be rewritten — except when the only
       thing in it is the placeholder nobody has replaced yet. */
    if (lines.length === 1 && lines[0].kind === 'meta') {
        lines.length = 0;
        $('log').textContent = '';
        addLine(t('w.l.empty'), 'meta');
    }
}

/** The browser-support verdict above the console. */
function supportNote() {
    const note = $('support');
    if (!note) return;
    if (!supported()) {
        note.className = 'support-note is-bad';
        note.textContent = t('w.sup.no');
        $('connectBtn').disabled = true;
    } else if (!window.isSecureContext) {
        note.className = 'support-note is-bad';
        note.textContent = t('w.sup.insecure');
        $('connectBtn').disabled = true;
    } else {
        note.className = 'support-note';
        note.textContent = t('w.sup.ok');
    }
}

function setupConsole() {
    setupPageFurniture();

    /* The status pill is written by JavaScript from here on, so it is not part
       of the static translation pass — it has to be set once at startup. */
    setStatus(t('w.notconnected'), 'is-off');

    supportNote();

    $('connectBtn').addEventListener('click', connect);
    $('disconnectBtn').addEventListener('click', disconnect);
    $('identifyBtn').addEventListener('click', identify);
    $('resetBtn').addEventListener('click', async () => {
        if (!port) return;
        addLine('— restarting —', 'meta');
        try { await hardReset(); } catch (e) { addLine(t('w.l.noreset'), 'warn'); }
    });

    $('pauseBtn').addEventListener('click', () => {
        paused = !paused;
        $('pauseBtn').textContent = paused ? t('w.resume') : t('w.pause');
        if (!paused) redrawLog();
    });

    $('clearBtn').addEventListener('click', () => {
        lines.length = 0;
        $('log').textContent = '';
    });

    $('copyLogBtn').addEventListener('click', () =>
        copyText(lines.map(l => l.text).join('\n'), $('copyLogBtn')));

    $('saveLogBtn').addEventListener('click', () =>
        downloadText('frostcaller-log.txt', lines.map(l => l.text).join('\n')));

    $('filterInput').addEventListener('input', redrawLog);

    $('sendBtn').addEventListener('click', () => {
        const v = $('sendInput').value;
        if (v) { sendText(v); $('sendInput').value = ''; }
    });
    $('sendInput').addEventListener('keydown', ev => {
        if (ev.key === 'Enter') { ev.preventDefault(); $('sendBtn').click(); }
    });

    $('capClear').addEventListener('click', () => {
        if (captures.length > 3 && !confirm(tv('w.cap.forgetall', { n: captures.length }))) return;
        captures.length = 0;
        saveCaptures();
        renderCaptures();
        renderDiff();
    });
    $('capCopy').addEventListener('click', () =>
        copyText(captures.map(c => (c.label ? '# ' + c.label + '\n' : '') + c.line).join('\n\n'), $('capCopy')));

    [['expIr', 'ir'], ['expYaml', 'esphome'], ['expSmartir', 'smartir'], ['expJson', 'json']]
        .forEach(([id, kind]) => {
            const b = $(id);
            if (b) b.addEventListener('click', () => exportAll(kind));
        });

    /* Importing .ir files: a picker, a drop zone and a paste box. */
    const file = $('irFile');
    if (file) {
        file.addEventListener('change', () => {
            [...file.files].forEach(f => {
                const fr = new FileReader();
                fr.onload = () => importIrText(String(fr.result), f.name);
                fr.readAsText(f);
            });
            file.value = '';
        });
    }

    const drop = $('irDrop');
    if (drop) {
        ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => {
            e.preventDefault();
            drop.classList.add('is-over');
        }));
        ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => {
            e.preventDefault();
            drop.classList.remove('is-over');
        }));
        drop.addEventListener('drop', e => {
            [...(e.dataTransfer.files || [])].forEach(f => {
                const fr = new FileReader();
                fr.onload = () => importIrText(String(fr.result), f.name);
                fr.readAsText(f);
            });
        });
    }

    const pasteBtn = $('irPasteBtn');
    if (pasteBtn) {
        pasteBtn.addEventListener('click', () => {
            const ta = $('irPaste');
            if (ta && ta.value.trim()) { importIrText(ta.value, 'the paste box'); ta.value = ''; }
        });
    }

    if (supported()) {
        navigator.serial.addEventListener('disconnect', () => {
            if (port) { addLine(t('w.l.unplugged'), 'warn'); disconnect(); }
        });
    }

    window.addEventListener('beforeunload', () => { keepReading = false; });
}

/* ── Init ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    loadCaptures();
    setupLangAndTheme();
    setupConsole();
    renderCaptures();
    renderDiff();
    renderFlipperPanel();
    renderHvac();
    renderQuiz();
    truthAboutSending();
    renderFlipperRepos();
    startStarfield(11000, 140);
    addLine(t('w.l.empty'), 'meta');
    if (captures.length) addLine(tv('w.l.restored', { n: captures.length }), 'good');
});

/* ── The Flipper reading list ───────────────────────────────────────────── */
function renderFlipperRepos() {
    const host = $('repoList');
    if (!host || typeof FLIPPER_REPOS === 'undefined') return;
    host.textContent = '';
    FLIPPER_REPOS.forEach(r => {
        const card = el('article', 'sw-card' + (r.key ? ' is-key' : ''));
        card.appendChild(el('h3', 'sw-name', r.name));
        card.appendChild(rich(el('p', 'sw-what'), r.what));
        const a = el('a', 'mini-btn', t('w.github'));
        a.href = r.url;
        a.target = '_blank';
        a.rel = 'noopener';
        card.appendChild(a);
        host.appendChild(card);
    });
}
