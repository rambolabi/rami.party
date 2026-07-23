// serial.js — direct browser → laser control over Web Serial (GRBL).
// Pure JS, no dependencies. Safety gating + watchdog are mandatory before motion.
//
// Architecture:
//   Streamer      — transport-agnostic character-counted GRBL streamer (unit-testable).
//   GrblController — wraps navigator.serial, wires the Streamer, status polling, realtime bytes.
//   mountMachinePanel — builds the UI and connects it to a controller + the project.

const RX_BUFFER = 128;           // GRBL serial RX buffer size (bytes)
const STATUS_HZ = 5;

// Realtime command bytes (sent outside the line protocol, never queued)
export const RT = {
    STATUS: '?',
    HOLD: '!',
    RESUME: '~',
    RESET: '\x18',
    // feed overrides
    FEED_RESET: '\x90', FEED_UP10: '\x91', FEED_DN10: '\x92', FEED_UP1: '\x93', FEED_DN1: '\x94',
    // spindle/laser power overrides
    POW_RESET: '\x99', POW_UP10: '\x9A', POW_DN10: '\x9B', POW_UP1: '\x9C', POW_DN1: '\x9D',
};

// ---- character-counted streamer (transport-agnostic) ------------------------
export class Streamer {
    // writeLine(str) must actually transmit; call onReply('ok'|'error:..') for each reply.
    constructor(writeLine, { onProgress, onDone, onError } = {}) {
        this.writeLine = writeLine;
        this.onProgress = onProgress || (() => {});
        this.onDone = onDone || (() => {});
        this.onError = onError || (() => {});
        this.reset();
    }
    reset() {
        this.lines = [];
        this.sent = 0;         // index of next line to send
        this.acked = 0;        // replies received
        this.charCounts = [];  // bytes in flight per unacked line
        this.running = false;
        this.paused = false;
        this.aborted = false;
    }
    load(gcode) {
        this.reset();
        this.lines = gcode.split(/\r?\n/).map((l) => l.replace(/;.*$/, '').trim()).filter((l) => l.length);
    }
    get total() { return this.lines.length; }
    get inFlight() { return this.charCounts.reduce((a, b) => a + b, 0); }
    start() { if (this.running) return; this.running = true; this.paused = false; this.aborted = false; this._pump(); }
    pause() { this.paused = true; }
    resume() { if (!this.running) return; this.paused = false; this._pump(); }
    abort() { this.aborted = true; this.running = false; this.lines = []; this.sent = this.acked = 0; this.charCounts = []; }
    // fill GRBL's RX buffer as far as the char-count budget allows
    _pump() {
        if (!this.running || this.paused || this.aborted) return;
        while (this.sent < this.lines.length) {
            const line = this.lines[this.sent];
            const bytes = line.length + 1; // + newline
            if (this.inFlight + bytes > RX_BUFFER) break;
            this.charCounts.push(bytes);
            this.sent++;
            try { this.writeLine(line); } catch (e) { this.onError(e); this.abort(); return; }
        }
    }
    // call for every 'ok' / 'error' reply from the machine
    onReply(reply) {
        if (!this.running) return;
        if (/^error/i.test(reply)) { this.onError(new Error(reply)); }
        this.charCounts.shift();
        this.acked++;
        this.onProgress(this.acked, this.lines.length);
        if (this.acked >= this.lines.length) {
            this.running = false;
            this.onDone();
            return;
        }
        this._pump();
    }
}

// ---- GRBL status parsing ----------------------------------------------------
export function parseStatus(str) {
    // <Idle|MPos:0.000,0.000,0.000|FS:0,0|WPos:...>
    const m = /<([^|>]+)\|?(.*)>/.exec(str);
    if (!m) return null;
    const out = { state: m[1] };
    const body = m[2] || '';
    const mp = /MPos:([-\d.]+),([-\d.]+)(?:,([-\d.]+))?/.exec(body);
    if (mp) out.mpos = { x: +mp[1], y: +mp[2], z: mp[3] != null ? +mp[3] : 0 };
    const wp = /WPos:([-\d.]+),([-\d.]+)(?:,([-\d.]+))?/.exec(body);
    if (wp) out.wpos = { x: +wp[1], y: +wp[2], z: wp[3] != null ? +wp[3] : 0 };
    const fs = /FS:([-\d.]+),([-\d.]+)/.exec(body);
    if (fs) out.feed = +fs[1], out.spindle = +fs[2];
    const ov = /Ov:(\d+),(\d+),(\d+)/.exec(body);
    if (ov) out.ov = { feed: +ov[1], rapid: +ov[2], power: +ov[3] };
    return out;
}

// ---- real serial controller -------------------------------------------------
export class GrblController {
    constructor({ onLine, onState, onProgress, onDisconnect } = {}) {
        this.port = null;
        this.reader = null;
        this.writer = null;
        this.textEncoder = new TextEncoder();
        this.connected = false;
        this.onLine = onLine || (() => {});
        this.onState = onState || (() => {});
        this.onProgress = onProgress || (() => {});
        this.onDisconnect = onDisconnect || (() => {});
        this._buf = '';
        this._statusTimer = null;
        this.status = { state: 'Unknown' };
        this.streamer = new Streamer((line) => this._writeRaw(line + '\n'), {
            onProgress: (a, b) => this.onProgress(a, b),
            onDone: () => this.onLine('— job complete —'),
            onError: (e) => this.onLine('⚠ ' + e.message),
        });
    }

    static get supported() { return 'serial' in navigator; }

    async connect(baud = 115200) {
        if (!GrblController.supported) throw new Error('Web Serial is not supported in this browser (use Chrome/Edge).');
        this.port = await navigator.serial.requestPort();
        await this.port.open({ baudRate: baud });
        this.writer = this.port.writable.getWriter();
        this.connected = true;
        this.port.addEventListener?.('disconnect', () => this._handleLost());
        this._readLoop();
        // wake GRBL
        await this._writeRaw('\r\n\r\n');
        this._startStatus();
        return true;
    }

    async disconnect() {
        this._stopStatus();
        try { await this.laserOff(); } catch (_) {}
        try { this.reader && await this.reader.cancel(); } catch (_) {}
        try { this.writer && this.writer.releaseLock(); } catch (_) {}
        try { this.port && await this.port.close(); } catch (_) {}
        this.connected = false;
        this.port = this.reader = this.writer = null;
    }

    _handleLost() {
        this.connected = false;
        this._stopStatus();
        this.streamer.abort();
        this.onDisconnect();
        this.onLine('⚠ Serial disconnected — motion aborted, laser off assumed.');
    }

    async _writeRaw(str) {
        if (!this.writer) throw new Error('Not connected');
        await this.writer.write(this.textEncoder.encode(str));
    }

    async _readLoop() {
        const decoder = new TextDecoder();
        try {
            this.reader = this.port.readable.getReader();
            for (;;) {
                const { value, done } = await this.reader.read();
                if (done) break;
                this._buf += decoder.decode(value, { stream: true });
                let idx;
                while ((idx = this._buf.indexOf('\n')) >= 0) {
                    const line = this._buf.slice(0, idx).trim();
                    this._buf = this._buf.slice(idx + 1);
                    if (line) this._handleLine(line);
                }
            }
        } catch (_) { /* reader cancelled */ }
        finally { try { this.reader.releaseLock(); } catch (_) {} }
    }

    _handleLine(line) {
        if (line.startsWith('<')) {
            const s = parseStatus(line);
            if (s) { this.status = s; this.onState(s); }
            return;
        }
        if (/^ok$/i.test(line) || /^error/i.test(line)) {
            this.streamer.onReply(line);
        }
        this.onLine(line);
    }

    _startStatus() {
        this._stopStatus();
        this._statusTimer = setInterval(() => { this.realtime(RT.STATUS); }, 1000 / STATUS_HZ);
    }
    _stopStatus() { if (this._statusTimer) { clearInterval(this._statusTimer); this._statusTimer = null; } }

    // realtime single byte (bypasses the queue)
    async realtime(byte) { if (this.writer) { try { await this._writeRaw(byte); } catch (_) {} } }

    // queued single command line (waits for its own ok via a tiny stream)
    async command(line) { await this._writeRaw(line.trim() + '\n'); this.onLine('» ' + line); }

    // high-level helpers
    async home() { await this.command('$H'); }
    async unlock() { await this.command('$X'); }
    async setOrigin() { await this.command('G10 L20 P1 X0 Y0 Z0'); }
    async gotoOrigin() { await this.command('G90 G0 X0 Y0'); }
    async laserOff() { await this.realtime(RT.HOLD); await this.command('M5'); }
    async jog(dx, dy, feed = 1500) {
        await this.command(`$J=G91 G21 X${dx.toFixed(2)} Y${dy.toFixed(2)} F${feed}`);
    }
    async readSettings() { await this.command('$$'); }

    runJob(gcode) {
        this.streamer.load(gcode);
        this.streamer.start();
    }
    pauseJob() { this.streamer.pause(); this.realtime(RT.HOLD); }
    resumeJob() { this.realtime(RT.RESUME); this.streamer.resume(); }
    stopJob() { this.streamer.abort(); this.realtime(RT.RESET); }
}
