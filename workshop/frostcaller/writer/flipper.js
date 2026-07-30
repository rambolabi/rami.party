/* ==========================================================================
   The Scribe — Flipper Zero support
   --------------------------------------------------------------------------
   A Flipper Zero appears as a USB CDC serial port with a text CLI on it.
   That gives us, over one cable and with nothing installed:

     • `device_info`  → confirm what we are talking to
     • `ir rx`        → decoded signals as they arrive
     • `ir rx raw`    → raw timings as they arrive
     • `ir tx …`      → transmit, either decoded or raw

   So a Flipper becomes both the *receiver* for capturing your air-conditioner
   remote and the *transmitter* for testing protocols — with no wiring at all.
   Whatever it catches is converted here into ESPHome, Tasmota, Broadlink or
   SmartIR form, which is the whole bridge this page exists to build.

   It also reads and writes `.ir` files, so anything from the community
   databases can be pulled straight in.

   Caveat, stated plainly in the UI: CLI output differs a little between
   official and custom firmware. Every parser here is written to be forgiving
   and to fall back to "keep the raw line" rather than guess.
   ========================================================================== */

'use strict';

/* ── Flipper CLI ─────────────────────────────────────────────────────────── */
const FLIPPER = {
    active: false,
    receiving: false,
    banner: false,
    info: null,
};

/* The prompt the CLI shows. Used to tell "ready" from "still talking". */

function looksLikeFlipper(text) {
    return /Flipper Zero|_______|Welcome to Flipper Zero|firmware_version|>: /i.test(text);
}

/**
 * Feed every incoming line through here while in Flipper mode.
 * Returns true if the line was consumed as a capture.
 */
function flipperParseLine(line) {
    const t = line.trim();
    if (!t) return false;

    /* device_info key : value pairs */
    const kv = /^([a-z0-9_.]+)\s*:\s*(.+)$/i.exec(t);
    if (kv && /firmware_version|hardware_name|hardware_model|firmware_commit|hardware_ver/i.test(kv[1])) {
        FLIPPER.info = FLIPPER.info || {};
        FLIPPER.info[kv[1]] = kv[2];
        renderFlipperInfo();
        return false;
    }

    /* Raw timings.  "RAW, 71 samples:" then a line of numbers, or all on one. */
    if (/^RAW[,:]/i.test(t) || /^\s*\d{2,6}(\s+\d{2,6}){6,}\s*$/.test(t)) {
        const nums = (t.match(/\d{2,6}/g) || []).map(Number);
        /* "71 samples" would otherwise be read as a timing. */
        const codes = /samples/i.test(t) ? nums.slice(1) : nums;
        if (codes.length >= 8) {
            addCapture({
                kind: 'raw',
                source: 'flipper',
                line: t,
                codes: alternateSigns(codes),
            });
            return true;
        }
    }

    /* Decoded: "NEC, A:0x00, C:0x15" — also NECext, Samsung32, RC5, RC6,
       SIRC, Kaseikyo, Pioneer, RCA. */
    const dec = /^([A-Za-z0-9]+),\s*A:\s*(0x[0-9A-Fa-f]+),\s*C:\s*(0x[0-9A-Fa-f]+)/.exec(t);
    if (dec) {
        addCapture({
            kind: 'flipper-decoded',
            source: 'flipper',
            line: t,
            protocol: dec[1],
            address: dec[2],
            command: dec[3],
        });
        return true;
    }

    return false;
}

/** Flipper prints magnitudes; ESPHome wants mark/space signs. */
function alternateSigns(nums) {
    return nums.map((n, i) => (i % 2 === 0 ? Math.abs(n) : -Math.abs(n)));
}

function renderFlipperInfo() {
    const host = document.getElementById('flipperInfo');
    if (!host) return;
    host.textContent = '';
    if (!FLIPPER.info) {
        host.appendChild(el('p', 'q-hint', t('w.flip.askwho')));
        return;
    }
    const dl = el('dl', 'keys');
    Object.entries(FLIPPER.info).forEach(([k, v]) => {
        dl.appendChild(el('dt', null, k.replace(/_/g, ' ')));
        dl.appendChild(el('dd', null, v));
    });
    host.appendChild(dl);
}

/* ── The `.ir` file format ───────────────────────────────────────────────── */
/**
 * Parse a Flipper `.ir` file. Returns an array of signals.
 * The format is a flat list of `key: value` blocks separated by `#`.
 */
function parseIrFile(text) {
    const out = [];
    let cur = null;
    String(text).split(/\r?\n/).forEach(raw => {
        const line = raw.trim();
        if (!line) return;
        if (line === '#') { if (cur && cur.name) out.push(cur); cur = null; return; }
        const m = /^([A-Za-z_]+)\s*:\s*(.*)$/.exec(line);
        if (!m) return;
        const key = m[1].toLowerCase(), val = m[2].trim();
        if (key === 'filetype' || key === 'version') return;
        if (key === 'name') { if (cur && cur.name) out.push(cur); cur = { name: val }; return; }
        if (!cur) cur = {};
        cur[key] = val;
    });
    if (cur && cur.name) out.push(cur);

    return out.map(s => {
        if (s.type === 'raw') {
            return {
                kind: 'raw',
                source: 'irfile',
                label: s.name,
                frequency: parseInt(s.frequency, 10) || 38000,
                duty: parseFloat(s.duty_cycle) || 0.33,
                codes: alternateSigns((s.data || '').split(/\s+/).map(Number).filter(n => n > 0)),
                line: s.name + ' (raw, ' + (s.data || '').split(/\s+/).length + ' samples)',
            };
        }
        return {
            kind: 'flipper-decoded',
            source: 'irfile',
            label: s.name,
            protocol: s.protocol || 'unknown',
            address: '0x' + hexBytesToWord(s.address),
            command: '0x' + hexBytesToWord(s.command),
            line: s.name + ' — ' + (s.protocol || '?') + ' A:' + s.address + ' C:' + s.command,
        };
    });
}

/** Flipper writes little-endian byte lists: "15 00 00 00" → 0x15. */
function hexBytesToWord(str) {
    if (!str) return '00';
    const bytes = str.trim().split(/\s+/);
    while (bytes.length > 1 && bytes[bytes.length - 1] === '00') bytes.pop();
    return bytes.reverse().join('').toUpperCase();
}

/** Turn our captures back into a `.ir` file the Flipper can read. */
function toIrFile(list) {
    const out = ['Filetype: IR signals file', 'Version: 1', '#'];
    list.forEach((c, i) => {
        const name = (c.label || ('signal_' + (i + 1))).replace(/[^\w-]+/g, '_');
        if (c.kind === 'raw' && c.codes) {
            out.push('name: ' + name);
            out.push('type: raw');
            out.push('frequency: ' + (c.frequency || 38000));
            out.push('duty_cycle: ' + (c.duty || 0.33).toFixed(6));
            out.push('data: ' + c.codes.map(n => Math.abs(n)).join(' '));
            out.push('#');
        } else if (c.kind === 'flipper-decoded') {
            out.push('name: ' + name);
            out.push('type: parsed');
            out.push('protocol: ' + c.protocol);
            out.push('address: ' + wordToHexBytes(c.address));
            out.push('command: ' + wordToHexBytes(c.command));
            out.push('#');
        }
    });
    return out.join('\n') + '\n';
}

function wordToHexBytes(hex) {
    let v = parseInt(String(hex).replace(/^0x/i, ''), 16) || 0;
    const bytes = [];
    for (let i = 0; i < 4; i++) { bytes.push((v & 0xFF).toString(16).toUpperCase().padStart(2, '0')); v >>= 8; }
    return bytes.join(' ');
}

/* ── Conversions: one capture, five destinations ─────────────────────────── */
const FLIPPER_TO_ESPHOME = {
    NEC: 'transmit_nec', NECext: 'transmit_nec', NEC42: 'transmit_nec', NEC42ext: 'transmit_nec',
    Samsung32: 'transmit_samsung', RC5: 'transmit_rc5', RC5X: 'transmit_rc5', RC6: 'transmit_rc6',
    SIRC: 'transmit_sony', SIRC15: 'transmit_sony', SIRC20: 'transmit_sony',
    Kaseikyo: 'transmit_panasonic', Pioneer: 'transmit_pioneer', RCA: 'transmit_raw',
};

function convertCapture(c, target) {
    const name = c.label || 'name this one';

    if (target === 'esphome') {
        if (c.kind === 'raw') {
            const wrapped = [];
            for (let i = 0; i < c.codes.length; i += 10) {
                wrapped.push('            ' + c.codes.slice(i, i + 10).join(', ') +
                    (i + 10 < c.codes.length ? ',' : ''));
            }
            return 'button:\n  - platform: template\n    name: "' + name + '"\n    on_press:\n' +
                '      - remote_transmitter.transmit_raw:\n' +
                '          carrier_frequency: ' + Math.round((c.frequency || 38000) / 1000) + 'kHz\n' +
                '          code: [\n' + wrapped.join('\n') + '\n          ]\n';
        }
        const act = FLIPPER_TO_ESPHOME[c.protocol] || 'transmit_nec';
        if (act === 'transmit_sony') {
            return 'button:\n  - platform: template\n    name: "' + name + '"\n    on_press:\n' +
                '      - remote_transmitter.transmit_sony:\n          data: ' + c.command +
                '\n          nbits: 12        # 12, 15 or 20 — try each\n';
        }
        if (act === 'transmit_samsung') {
            return 'button:\n  - platform: template\n    name: "' + name + '"\n    on_press:\n' +
                '      - remote_transmitter.transmit_samsung:\n          data: ' + c.command + '\n';
        }
        return 'button:\n  - platform: template\n    name: "' + name + '"\n    on_press:\n' +
            '      - remote_transmitter.' + act + ':\n' +
            '          address: ' + c.address + '\n          command: ' + c.command + '\n';
    }

    if (target === 'tasmota') {
        if (c.kind === 'raw') {
            return 'IRsend {"Protocol":"RAW","Bits":' + Math.round((c.frequency || 38000) / 1000) +
                ',"Data":"' + c.codes.map(n => Math.abs(n)).join(',') + '"}';
        }
        return 'IRsend {"Protocol":"' + (c.protocol || 'NEC') + '","Bits":32,"Data":"' + c.command + '"}';
    }

    if (target === 'pronto') {
        if (c.kind !== 'raw') return '# Pronto needs raw timings. Capture this one with "ir rx raw".';
        return scribeProntoOf(c.codes, c.frequency || 38000);
    }

    if (target === 'flipper') {
        return toIrFile([c]);
    }

    if (target === 'smartir') {
        return JSON.stringify({
            manufacturer: 'Captured',
            supportedModels: ['fill this in'],
            commandsEncoding: 'Raw',
            supportedController: 'MQTT',
            commands: { [name]: c.kind === 'raw' ? c.codes.map(n => Math.abs(n)) : c.command },
        }, null, 2);
    }

    return '';
}

/* A local copy of the Pronto conversion so this file stands alone. */
function scribeProntoOf(codes, freq) {
    const f = freq || 38000;
    const code = Math.round(1000000 / (f * 0.241246));
    const unit = code * 0.241246;
    const h4 = n => Math.min(0xFFFF, Math.max(0, n | 0)).toString(16).toUpperCase().padStart(4, '0');
    const words = ['0000', h4(code), '0000', h4(Math.ceil(codes.length / 2))];
    codes.forEach(c => words.push(h4(Math.max(1, Math.round(Math.abs(c) / unit)))));
    if (codes.length % 2) words.push(h4(Math.round(20000 / unit)));
    return words.join(' ');
}

/* ── Sending from the Flipper ────────────────────────────────────────────── */
function flipperTxCommand(c) {
    if (c.kind === 'raw') {
        return 'ir tx RAW F:' + (c.frequency || 38000) + ' DC:33 ' +
            c.codes.map(n => Math.abs(n)).join(' ');
    }
    return 'ir tx ' + (c.protocol || 'NEC') + ' ' +
        wordToHexBytes(c.address) + ' ' + wordToHexBytes(c.command);
}

/* ── Protocol quiz ───────────────────────────────────────────────────────── */
/* Send one candidate protocol at a time and let the user say which landed.
   Turns the brand table from a guess into a test. Needs a Flipper or a
   Tasmota board connected — anything that can transmit on command. */
const QUIZ_CANDIDATES = [
    { plat: 'coolix', tasmota: 'Coolix', why: 'The single most widely copied air-conditioner protocol.' },
    { plat: 'midea_ir', tasmota: 'Midea', why: 'Midea builds units for a great many other labels.' },
    { plat: 'gree', tasmota: 'Gree', why: 'Also inside Vivax, Sinclair, Rotenso and Cooper & Hunter.' },
    { plat: 'daikin', tasmota: 'Daikin', why: 'The most-installed split in Belgium.' },
    { plat: 'mitsubishi', tasmota: 'Mitsubishi', why: 'And some Stiebel Eltron units.' },
    { plat: 'climate_ir_lg', tasmota: 'LG', why: '' },
    { plat: 'tcl112', tasmota: 'TCL', why: 'Also Electrolux and Fuego.' },
    { plat: 'toshiba', tasmota: 'Toshiba', why: 'And re-badged Midea MAP14HS1TBL.' },
    { plat: 'fujitsu_general', tasmota: 'Fujitsu', why: '' },
    { plat: 'haier', tasmota: 'Haier', why: '' },
    { plat: 'whirlpool', tasmota: 'Whirlpool', why: '' },
    { plat: 'zhlt01', tasmota: 'Electra', why: 'The ZH/LT-01 handset — Eurom, Qlima, Tristar, Chigo.' },
];

let quizAt = -1;

function renderQuiz() {
    const host = document.getElementById('quizBody');
    if (!host) return;
    host.textContent = '';

    if (quizAt < 0) {
        host.appendChild(para2(t('w.quiz.lead')));
        const start = el('button', 'btn btn-primary', t('w.quiz.start'));
        start.type = 'button';
        start.addEventListener('click', () => { quizAt = 0; renderQuiz(); });
        host.appendChild(start);
        return;
    }

    if (quizAt >= QUIZ_CANDIDATES.length) {
        host.appendChild(el('p', 'step-note', t('w.quiz.end')));
        const again = el('button', 'mini-btn', t('w.quiz.again'));
        again.type = 'button';
        again.addEventListener('click', () => { quizAt = -1; renderQuiz(); });
        host.appendChild(again);
        return;
    }

    const c = QUIZ_CANDIDATES[quizAt];
    host.appendChild(el('p', 'q-hint',
        tv('w.quiz.n', { n: quizAt + 1, total: QUIZ_CANDIDATES.length })));
    const h = el('h4', 'fix-cause', c.plat);
    host.appendChild(h);
    if (c.why) host.appendChild(para2(tc('why.' + c.plat, c.why)));

    const cmd = 'IRHVAC {"Vendor":"' + c.tasmota + '","Power":"On","Mode":"Cold","FanSpeed":"Auto","Temp":22}';
    const box = el('div', 'code');
    const head = el('div', 'code-head');
    head.appendChild(el('span', 'code-label', 'Tasmota console'));
    const btns = el('span', 'code-btns');
    const copy = el('button', 'copy-btn', t('w.copy'));
    copy.type = 'button';
    copy.addEventListener('click', () => copyText(cmd, copy));
    btns.appendChild(copy);
    const send = el('button', 'copy-btn', t('w.sendit'));
    send.type = 'button';
    send.disabled = !port;
    send.addEventListener('click', () => sendText(cmd));
    btns.appendChild(send);
    head.appendChild(btns);
    const pre = el('pre');
    pre.appendChild(el('code', null, cmd));
    box.append(head, pre);
    host.appendChild(box);

    const row = el('div', 'mini-row');
    const yes = el('button', 'btn btn-primary', t('w.quiz.yes'));
    yes.type = 'button';
    yes.addEventListener('click', () => {
        host.textContent = '';
        host.appendChild(el('h4', 'fix-cause', tv('w.quiz.found', { plat: c.plat })));
        host.appendChild(rich(el('p', 'step-note'), tv('w.quiz.found.d', { plat: c.plat })));
        const back = el('a', 'mini-btn', t('w.quiz.builder'));
        back.href = '../#builder';
        host.appendChild(back);
    });
    row.appendChild(yes);

    const no = el('button', 'mini-btn', t('w.quiz.no'));
    no.type = 'button';
    no.addEventListener('click', () => { quizAt++; renderQuiz(); });
    row.appendChild(no);

    const stop = el('button', 'mini-btn', t('w.quiz.stop'));
    stop.type = 'button';
    stop.addEventListener('click', () => { quizAt = -1; renderQuiz(); });
    row.appendChild(stop);

    host.appendChild(row);
}
