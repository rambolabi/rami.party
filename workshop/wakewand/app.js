'use strict';

/* =========================================================================
   Wakewand — wakes HDMI-CEC televisions the moment this page opens.

   Channel 1: Web Serial → Pulse-Eight USB-CEC adapter. The adapter protocol
   below follows libCEC's reference implementation (USBCECAdapterMessage.cpp):
   frames are FF <code> <payload…> FE, any byte >= 0xFD is escaped as
   FD (byte-3), and a CEC transmit is one ACK_POLARITY packet followed by one
   TRANSMIT / TRANSMIT_EOM packet per CEC byte.

   Channel 2: WebSocket to a local bridge (cec-bridge.py) on 127.0.0.1:3308
   (0xCEC), for TVs wired to a Raspberry Pi or media box instead of this
   computer. fetch() to loopback is blocked by Chrome's Private Network
   Access policy, WebSockets are not: same trick as ghosttooth's bt-bridge.
   ========================================================================= */

/* ---- Pulse-Eight adapter constants (values from libCEC) ------------------ */
const MSG_START = 0xFF, MSG_END = 0xFE, MSG_ESC = 0xFD, ESC_OFFSET = 3;
const CODE = {
    PING: 0x01,
    FRAME_START: 0x05,
    FRAME_DATA: 0x06,
    ACCEPTED: 0x08,
    REJECTED: 0x09,
    TRANSMIT: 0x0B,
    TRANSMIT_EOM: 0x0C,
    ACK_POLARITY: 0x0E,
    TX_SUCCEEDED: 0x10,
    TX_FAILED_LINE: 0x11,
    TX_FAILED_ACK: 0x12,
    TX_FAILED_TIMEOUT_DATA: 0x13,
    TX_FAILED_TIMEOUT_LINE: 0x14,
    FIRMWARE_VERSION: 0x15,
    SET_CONTROLLED: 0x18,
};
const TX_RESULTS = [CODE.TX_SUCCEEDED, CODE.TX_FAILED_LINE, CODE.TX_FAILED_ACK,
    CODE.TX_FAILED_TIMEOUT_DATA, CODE.TX_FAILED_TIMEOUT_LINE];
const PULSE_EIGHT_USB_VID = 0x2548;

/* CEC frames. Initiator 15 (unregistered) so no address allocation is
   needed; TVs accept one-touch-play from anyone. */
const CEC_IMAGE_VIEW_ON = [0xF0, 0x04];
const CEC_TEXT_VIEW_ON = [0xF0, 0x0D];
const CEC_STANDBY_ALL = [0xFF, 0x36]; // broadcast

const BRIDGE_URL = 'ws://127.0.0.1:3308';

/* ---- DOM + log ----------------------------------------------------------- */
const $ = (id) => document.getElementById(id);
const logEl = $('log');

function log(kind, text) {
    const line = document.createElement('div');
    line.className = 'logline ' + kind;
    const t = new Date().toLocaleTimeString('en-GB');
    line.textContent = `${t} ${kind === 'tx' ? '>>' : kind === 'rx' ? '<<' : '··'} ${text}`;
    logEl.appendChild(line);
    while (logEl.childElementCount > 400) logEl.firstElementChild.remove();
    logEl.scrollTop = logEl.scrollHeight;
}

function setPill(el, state, text) {
    el.className = 'pill ' + state;
    el.textContent = text;
}

const hex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(':');

/* ==========================================================================
   Channel 1 — Web Serial → Pulse-Eight USB-CEC adapter
   ========================================================================== */
const adapters = []; // { port, writer, name, fw, busy, waiters, alive }

function packet(code, payload = []) {
    const out = [MSG_START];
    const esc = (b) => { if (b >= MSG_ESC) { out.push(MSG_ESC, b - ESC_OFFSET); } else { out.push(b); } };
    esc(code);
    payload.forEach(esc);
    out.push(MSG_END);
    return out;
}

function waitFor(adapter, codes, timeoutMs) {
    return new Promise((resolve) => {
        const waiter = { codes, resolve: null, timer: 0 };
        waiter.resolve = (frame) => {
            clearTimeout(waiter.timer);
            const i = adapter.waiters.indexOf(waiter);
            if (i >= 0) adapter.waiters.splice(i, 1);
            resolve(frame);
        };
        waiter.timer = setTimeout(() => waiter.resolve(null), timeoutMs);
        adapter.waiters.push(waiter);
    });
}

function dispatchFrame(adapter, frame) {
    if (!frame.length) return;
    const code = frame[0] & 0x3F; // strip EOM/ACK flag bits
    if (code === CODE.FRAME_START || code === CODE.FRAME_DATA) {
        log('rx', `${adapter.name}: bus traffic ${hex(frame.slice(1))}`);
        return;
    }
    const waiter = adapter.waiters.find((w) => w.codes.includes(code));
    if (waiter) waiter.resolve({ code, payload: frame.slice(1) });
}

async function readLoop(adapter, reader) {
    let buf = [], escaped = false, inFrame = false;
    try {
        for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            for (const b of value) {
                if (b === MSG_START) { buf = []; escaped = false; inFrame = true; continue; }
                if (!inFrame) continue;
                if (b === MSG_END) { inFrame = false; dispatchFrame(adapter, buf); continue; }
                if (escaped) { buf.push((b + ESC_OFFSET) & 0xFF); escaped = false; }
                else if (b === MSG_ESC) { escaped = true; }
                else { buf.push(b); }
            }
        }
    } catch (err) {
        if (adapter.alive) log('info', `${adapter.name}: read error (${err.message})`);
    }
    dropAdapter(adapter);
}

async function send(adapter, bytes) {
    await adapter.writer.write(new Uint8Array(bytes));
}

/* Serialize transmits per adapter: the firmware handles one at a time. */
function queued(adapter, fn) {
    const run = adapter.busy.then(fn, fn);
    adapter.busy = run.then(() => undefined, () => undefined);
    return run;
}

async function cecTransmit(adapter, frame, label) {
    return queued(adapter, async () => {
        const dst = frame[0] & 0x0F;
        const bytes = [...packet(CODE.ACK_POLARITY, [dst === 15 ? 1 : 0])];
        frame.forEach((b, i) => {
            bytes.push(...packet(i === frame.length - 1 ? CODE.TRANSMIT_EOM : CODE.TRANSMIT, [b]));
        });
        log('tx', `${adapter.name}: ${label} (${hex(frame)})`);
        try {
            await send(adapter, bytes);
        } catch {
            log('info', `${adapter.name}: write failed (adapter gone?)`);
            return false;
        }
        const res = await waitFor(adapter, TX_RESULTS, 2500);
        if (!res) { log('info', `${adapter.name}: no transmit report (is the HDMI side plugged in?)`); return false; }
        if (res.code === CODE.TX_SUCCEEDED) {
            log('rx', `${adapter.name}: ${label} ${dst === 15 ? 'broadcast sent' : 'acknowledged by the TV'} ✔`);
            return true;
        }
        log('rx', `${adapter.name}: ${label} failed (0x${res.code.toString(16)}${res.code === CODE.TX_FAILED_ACK ? ', nobody acked' : ''})`);
        return false;
    });
}

async function connectAdapter(port) {
    if (adapters.some((a) => a.port === port)) return null;
    try {
        await port.open({ baudRate: 38400 });
    } catch (err) {
        log('info', `Adapter: could not open port (${err.message})`);
        return null;
    }
    const info = port.getInfo();
    const adapter = {
        port,
        writer: port.writable.getWriter(),
        name: `Adapter ${adapters.length + 1}`,
        fw: null,
        busy: Promise.resolve(),
        waiters: [],
        alive: true,
        vid: info.usbVendorId,
    };
    adapters.push(adapter);
    readLoop(adapter, port.readable.getReader());

    await queued(adapter, async () => {
        await send(adapter, packet(CODE.PING));
        await waitFor(adapter, [CODE.ACCEPTED], 400);
        // firmware >= 2 rejects transmits while in auto mode
        await send(adapter, packet(CODE.SET_CONTROLLED, [1]));
        await waitFor(adapter, [CODE.ACCEPTED, CODE.REJECTED], 400);
        await send(adapter, packet(CODE.FIRMWARE_VERSION));
        const fw = await waitFor(adapter, [CODE.FIRMWARE_VERSION], 400);
        if (fw && fw.payload.length >= 2) adapter.fw = (fw.payload[0] << 8) | fw.payload[1];
    });

    log('info', `${adapter.name}: connected${adapter.fw ? ` (firmware v${adapter.fw})` : ''}`);
    renderSerial();
    return adapter;
}

function dropAdapter(adapter) {
    if (!adapter.alive) return;
    adapter.alive = false;
    adapter.waiters.forEach((w) => w.resolve(null));
    try { adapter.writer.releaseLock(); } catch { /* already closed */ }
    Promise.resolve().then(() => adapter.port.close()).catch(() => { /* already closed */ });
    const i = adapters.indexOf(adapter);
    if (i >= 0) adapters.splice(i, 1);
    log('info', `${adapter.name}: disconnected`);
    renderSerial();
}

function renderSerial() {
    const list = $('serialList');
    list.innerHTML = '';
    adapters.forEach((a) => {
        const li = document.createElement('li');
        li.textContent = `${a.name} · Pulse-Eight USB-CEC${a.fw ? ` · fw v${a.fw}` : ''}`;
        list.appendChild(li);
    });
    list.hidden = adapters.length === 0;
    if (!('serial' in navigator)) {
        setPill($('serialPill'), 'off', 'Web Serial not supported here');
    } else if (adapters.length) {
        setPill($('serialPill'), 'on', `${adapters.length} adapter${adapters.length > 1 ? 's' : ''} connected`);
    } else {
        setPill($('serialPill'), 'idle', 'no adapter paired yet');
    }
    updateControls();
}

async function wakeAdapters() {
    let woke = 0;
    for (const a of [...adapters]) {
        const ok = await cecTransmit(a, CEC_IMAGE_VIEW_ON, 'Image View On');
        await cecTransmit(a, CEC_TEXT_VIEW_ON, 'Text View On');
        if (ok) woke++;
    }
    return woke;
}

/* ==========================================================================
   Channel 2 — local WebSocket bridge (cec-bridge.py)
   ========================================================================== */
const bridge = { ws: null, open: false, wokeThisLoad: false, retryTimer: 0, attempts: 0 };

function connectBridge(manual) {
    if (bridge.ws && (bridge.ws.readyState === 0 || bridge.ws.readyState === 1)) return;
    clearTimeout(bridge.retryTimer);
    setPill($('bridgePill'), 'idle', 'connecting…');
    let ws;
    try {
        ws = new WebSocket(BRIDGE_URL);
    } catch {
        bridgeDown(manual);
        return;
    }
    bridge.ws = ws;
    ws.onopen = () => {
        bridge.open = true;
        bridge.attempts = 0;
        setPill($('bridgePill'), 'on', 'bridge connected');
        log('info', `Bridge: connected on ${BRIDGE_URL}`);
        updateControls();
    };
    ws.onmessage = (ev) => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch { return; }
        if (msg.type === 'hello') {
            const list = $('bridgeList');
            list.innerHTML = '';
            (msg.devices || []).forEach((d) => {
                const li = document.createElement('li');
                li.textContent = `${d} · via ${msg.backend}`;
                list.appendChild(li);
            });
            list.hidden = !(msg.devices || []).length;
            setPill($('bridgePill'), msg.devices && msg.devices.length ? 'on' : 'idle',
                msg.devices && msg.devices.length
                    ? `${msg.backend} · ${msg.devices.length} CEC output${msg.devices.length > 1 ? 's' : ''}`
                    : `connected, but ${msg.backend === 'none' ? 'no CEC tool found' : 'no CEC outputs found'}`);
            if (!bridge.wokeThisLoad && msg.devices && msg.devices.length) {
                bridge.wokeThisLoad = true;
                bridgeCommand('wake');
            }
        } else if (msg.type === 'log') {
            log('rx', `Bridge: ${msg.msg}`);
        } else if (msg.type === 'result') {
            log('rx', `Bridge: ${msg.action} ${msg.ok ? 'done' : 'failed'} on ${msg.outputs} output${msg.outputs === 1 ? '' : 's'}`);
            if (msg.action === 'wake' && msg.ok) announceWake(msg.outputs, 'the local bridge');
        }
    };
    ws.onclose = () => bridgeDown(manual);
    ws.onerror = () => { /* onclose follows */ };
}

function bridgeDown(manual) {
    const first = bridge.open || bridge.attempts === 0 || manual;
    bridge.open = false;
    bridge.ws = null;
    setPill($('bridgePill'), 'off', 'bridge not running');
    if (first) log('info', 'Bridge: nothing listening on 127.0.0.1:3308 (start cec-bridge.py next to the TVs)');
    bridge.attempts++;
    // keep trying quietly: on a kiosk the bridge may start after the page
    bridge.retryTimer = setTimeout(() => connectBridge(false), 15000);
    updateControls();
}

function bridgeCommand(cmd) {
    if (!bridge.open) return false;
    log('tx', `Bridge: ${cmd} all CEC outputs`);
    bridge.ws.send(JSON.stringify({ cmd }));
    return true;
}

/* ==========================================================================
   Orchestration
   ========================================================================== */
let wokenTotal = 0;

function announceWake(count, via) {
    wokenTotal += count;
    $('autoline').textContent = count > 0
        ? `🔆 Woke ${count} screen${count > 1 ? 's' : ''} through ${via}.`
        : $('autoline').textContent;
}

function updateControls() {
    const any = adapters.length > 0 || bridge.open;
    $('btnWake').disabled = !any;
    $('btnSleep').disabled = !any;
    $('btnPair').disabled = !('serial' in navigator);
    if (wokenTotal === 0) {
        $('autoline').textContent = any
            ? '⚡ Channel connected, ready to wake.'
            : 'No wake channel yet: pair a USB-CEC adapter or start the bridge.';
    }
}

async function wakeEverything() {
    let sent = false;
    if (adapters.length) {
        sent = true;
        const n = await wakeAdapters();
        announceWake(n, 'the USB-CEC adapter');
    }
    if (bridgeCommand('wake')) sent = true;
    if (!sent) log('info', 'Nothing to wake through yet.');
}

async function sleepEverything() {
    for (const a of [...adapters]) await cecTransmit(a, CEC_STANDBY_ALL, 'Standby (broadcast)');
    bridgeCommand('standby');
}

async function init() {
    renderSerial();
    connectBridge(false);

    $('btnWake').addEventListener('click', wakeEverything);
    $('btnSleep').addEventListener('click', sleepEverything);
    $('btnBridgeRetry').addEventListener('click', () => { bridge.wokeThisLoad = false; connectBridge(true); });

    if ('serial' in navigator) {
        $('btnPair').addEventListener('click', async () => {
            try {
                const port = await navigator.serial.requestPort({ filters: [{ usbVendorId: PULSE_EIGHT_USB_VID }] });
                const adapter = await connectAdapter(port);
                if (adapter) {
                    const n = await wakeAdapters();
                    announceWake(n, 'the USB-CEC adapter');
                }
            } catch { /* user cancelled the picker */ }
        });
        navigator.serial.addEventListener('disconnect', (ev) => {
            const a = adapters.find((x) => x.port === ev.target);
            if (a) dropAdapter(a);
        });

        // the hands-free path: previously granted adapters need no gesture
        const ports = await navigator.serial.getPorts();
        if (ports.length) {
            log('info', `Found ${ports.length} previously paired adapter${ports.length > 1 ? 's' : ''}, waking on page open…`);
            for (const port of ports) await connectAdapter(port);
            const n = await wakeAdapters();
            announceWake(n, 'the USB-CEC adapter');
        }
    }
    updateControls();
}

document.addEventListener('DOMContentLoaded', init);
