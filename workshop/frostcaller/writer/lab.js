/* ==========================================================================
   The Scribe — the laboratory
   --------------------------------------------------------------------------
   The four things that turn a capture tool into something you can actually
   reverse-engineer a protocol with:

     CHECKSUM GUESSER   given several captures, work out how the last byte
                        is computed. This is the hard part of taking an air
                        conditioner apart, and it is pure arithmetic.
     COMPONENT SKELETON generate an ESPHome climate_ir component from what
                        you have learned, so it can go upstream.
     RECORD & REPLAY    save a session to a file; play it back here. Lets
                        somebody send you their problem.
     IRDB FETCH         pull a .ir file from the community database. Opt-in,
                        because it is the only network call on this site.

   Loaded after flipper.js and app.js; uses their helpers.
   ========================================================================== */

'use strict';

/* ── Bit and byte helpers ────────────────────────────────────────────────── */
/**
 * Turn raw mark/space timings into bytes.
 *
 * Air-conditioner protocols are almost all pulse-distance encoded: every bit
 * is a fixed mark followed by a short space (zero) or a long one (one). So the
 * job is to find where the short/long boundary sits, and to throw away the
 * spaces that are not bits at all — the header, and the gap between repeated
 * frames. Getting that wrong shifts every bit along by one and produces
 * confident nonsense, so the boundary is measured rather than assumed.
 */
function timingsToBytes(codes) {
    if (!codes || codes.length < 34) return null;

    const spaces = [];
    for (let i = 1; i < codes.length; i += 2) spaces.push(Math.abs(codes[i]));
    if (spaces.length < 17) return null;

    /* Measure the two bit lengths from the body of the message. The first
       space is the header and is excluded, or it drags the estimate up. */
    const rest = spaces.slice(1).sort((a, b) => a - b);
    const p25 = rest[Math.floor(rest.length * 0.25)] || 1;
    const bitLike = rest.filter(v => v <= p25 * 4);
    if (bitLike.length < 16) return null;

    /* The widest jump in the sorted lengths is the short/long boundary. */
    let bestGap = 0, split = 0;
    for (let k = 1; k < bitLike.length; k++) {
        const gap = bitLike[k] - bitLike[k - 1];
        if (gap > bestGap) { bestGap = gap; split = (bitLike[k] + bitLike[k - 1]) / 2; }
    }
    if (!split || bestGap < bitLike[0] * 0.4) return null;   /* one level only */

    const ceiling = split * 2.5;
    const bits = [];
    /* Start at 1: the first space is the header, and it is the header because
       of where it sits, not because of how long it is. Judging it by length
       alone fails whenever the header gap is less than 2.5× a long bit — which
       is most air conditioners — and one stray leading bit shifts every byte
       after it, turning the whole decode into confident nonsense. */
    for (let i = 1; i < spaces.length; i++) {
        const v = spaces[i];
        if (v > ceiling) continue;                /* the gap between repeated frames */
        bits.push(v > split ? 1 : 0);
    }

    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        /* Least-significant-bit first, which is the common case here. */
        let b = 0;
        for (let k = 0; k < 8; k++) b |= bits[i + k] << k;
        bytes.push(b);
    }
    return bytes.length >= 4 ? bytes : null;
}

const CHECKSUM_SCHEMES = [
    {
        id: 'sum8', name: 'Sum of all previous bytes, truncated to 8 bits', rank: 1,
        fn: b => b.reduce((a, v) => (a + v) & 0xFF, 0),
    },
    {
        id: 'xor8', name: 'XOR of all previous bytes', rank: 1,
        fn: b => b.reduce((a, v) => a ^ v, 0),
    },
    {
        id: 'sum-nibbles', name: 'Sum of every nibble', rank: 2,
        fn: b => b.reduce((a, v) => (a + (v & 0x0F) + (v >> 4)) & 0xFF, 0),
    },
    {
        id: 'sum-inv', name: 'Inverse of the sum (0xFF minus)', rank: 2,
        fn: b => (0xFF - b.reduce((a, v) => (a + v) & 0xFF, 0)) & 0xFF,
    },
    {
        id: 'sum-last-nibble', name: 'Low nibble of the sum (Daikin style)', rank: 3,
        fn: b => b.reduce((a, v) => (a + v) & 0xFF, 0) & 0x0F,
    },
    {
        id: 'sum8-offset', name: 'Sum of all previous bytes, plus a constant', rank: 4,
        fn: (b, k) => (b.reduce((a, v) => a + v, 0) + k) & 0xFF, needsK: true,
    },
];

/**
 * Try each scheme against every capture. A scheme only wins if it explains
 * *all* of them — one counterexample is enough to rule it out, which is the
 * whole point of asking for several captures.
 */
function guessChecksum(messages) {
    const results = [];
    CHECKSUM_SCHEMES.forEach(scheme => {
        /* k = 0 on the offset variant is just the plain sum, which is already
           its own row — start at 1 so the same answer is not reported twice. */
        const ks = scheme.needsK ? Array.from({ length: 255 }, (_, i) => i + 1) : [0];
        for (const k of ks) {
            const ok = messages.every(bytes => {
                if (bytes.length < 3) return false;
                const body = bytes.slice(0, -1);
                const claimed = bytes[bytes.length - 1];
                const got = scheme.fn(body, k);
                return (got & 0xFF) === (claimed & 0xFF) ||
                    (scheme.id === 'sum-last-nibble' && (got & 0x0F) === (claimed & 0x0F));
            });
            if (ok) {
                results.push({ scheme, k, where: 'last byte' });
                break;
            }
        }
    });
    /* Simplest explanation first. The offset variant has 255 chances to fit,
       so it goes last and is flagged — it is the one most likely to be luck. */
    return results.sort((a, b) => a.scheme.rank - b.scheme.rank);
}

function renderChecksum() {
    const host = document.getElementById('checksumBody');
    if (!host) return;
    host.textContent = '';

    const picked = captures.filter(c => c.selected && c.kind === 'raw' && c.codes);
    if (picked.length < 2) {
        host.appendChild(para2(t('w.sum.needtwo')));
        host.appendChild(el('p', 'q-hint',
            picked.length ? t('w.sum.oneticked') : t('w.sum.noneticked')));
        return;
    }

    const decoded = picked.map(c => ({ label: c.label || t('w.sum.unnamed'), bytes: timingsToBytes(c.codes) }));
    const usable = decoded.filter(d => d.bytes);

    if (usable.length < 2) {
        host.appendChild(el('p', 'step-note', t('w.sum.unreadable')));
        return;
    }

    host.appendChild(el('p', 'q-hint', tv('w.sum.decoded', {
        n: usable.length,
        lengths: usable.map(d => tv('w.sum.bytes', { n: d.bytes.length })).join(', '),
    })));

    /* Show the bytes, with the ones that differ highlighted. */
    const grid = el('div', 'byte-grid');
    const maxLen = Math.max(...usable.map(d => d.bytes.length));
    usable.forEach(d => {
        const row = el('div', 'byte-row');
        row.appendChild(el('span', 'byte-label', d.label));
        for (let i = 0; i < maxLen; i++) {
            const v = d.bytes[i];
            const varies = usable.some(o => o.bytes[i] !== v);
            const cell = el('span', 'byte' + (varies ? ' is-diff' : '') +
                (i === d.bytes.length - 1 ? ' is-last' : ''),
                v === undefined ? '··' : v.toString(16).toUpperCase().padStart(2, '0'));
            cell.title = tv('w.sum.bytetip', { i: i }) +
                (i === d.bytes.length - 1 ? ' ' + t('w.sum.lasttip') : '');
            row.appendChild(cell);
        }
        grid.appendChild(row);
    });
    host.appendChild(grid);

    const hits = guessChecksum(usable.map(d => d.bytes));
    if (hits.length) {
        host.appendChild(el('h4', 'fix-cause',
            hits.length === 1 ? t('w.sum.found') : tv('w.sum.several', { n: hits.length })));

        const ul = el('ul');
        hits.forEach((h, i) => {
            const li = el('li');
            li.appendChild(el('strong', null, h.scheme.name +
                (h.scheme.needsK ? ' ' + tv('w.sum.const', { hex: '0x' + h.k.toString(16).toUpperCase().padStart(2, '0') }) : '')));
            if (i === 0) li.appendChild(document.createTextNode(' ' + t('w.sum.simplest')));
            else if (h.scheme.rank >= 4) li.appendChild(document.createTextNode(' ' + t('w.sum.suspect')));
            else li.appendChild(document.createTextNode(' ' + t('w.sum.alsofits')));
            ul.appendChild(li);
        });
        host.appendChild(ul);

        if (hits.length > 1) {
            host.appendChild(el('p', 'step-note', tv('w.sum.narrow', { n: usable.length })));
        } else {
            host.appendChild(el('p', 'step-note', t('w.sum.prize')));
        }
    } else {
        host.appendChild(el('h4', 'fix-cause', t('w.sum.nofit')));
        host.appendChild(el('p', 'step-note', t('w.sum.nofit.d')));
    }

    const row = el('div', 'mini-row');
    const copy = el('button', 'mini-btn', t('w.sum.copybytes'));
    copy.type = 'button';
    copy.addEventListener('click', () => copyText(
        usable.map(d => d.label + ': ' + d.bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')).join('\n'),
        copy));
    row.appendChild(copy);
    host.appendChild(row);
}

/* ── ESPHome component skeleton ──────────────────────────────────────────── */
function componentSkeleton(name) {
    const cls = (name || 'MyBrand').replace(/[^A-Za-z0-9]/g, '') || 'MyBrand';
    const snake = cls.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
    const picked = captures.filter(c => c.selected && c.kind === 'raw' && c.codes);
    const sample = picked.length ? timingsToBytes(picked[0].codes) : null;
    const header = picked.length ? [Math.abs(picked[0].codes[0]), Math.abs(picked[0].codes[1])] : [4400, 4400];
    const bitOne = picked.length ? guessBitTimings(picked[0].codes) : { mark: 550, one: 1650, zero: 550 };

    return `// ${snake}.h — a starting point for an ESPHome climate_ir component.
// Drop this in esphome/components/${snake}/ alongside ${snake}.cpp and
// climate.py, then open a pull request. The timings below came from your
// own captures; the state encoding is the part only you can finish.

#pragma once
#include "esphome/components/climate_ir/climate_ir.h"

namespace esphome {
namespace ${snake} {

// Measured from ${picked.length || 0} capture${picked.length === 1 ? '' : 's'}
const uint16_t ${cls.toUpperCase()}_HEADER_MARK = ${header[0]};
const uint16_t ${cls.toUpperCase()}_HEADER_SPACE = ${header[1]};
const uint16_t ${cls.toUpperCase()}_BIT_MARK = ${bitOne.mark};
const uint16_t ${cls.toUpperCase()}_ONE_SPACE = ${bitOne.one};
const uint16_t ${cls.toUpperCase()}_ZERO_SPACE = ${bitOne.zero};
const uint8_t  ${cls.toUpperCase()}_STATE_LENGTH = ${sample ? sample.length : 13};

class ${cls}Climate : public climate_ir::ClimateIR {
 public:
  ${cls}Climate()
      : climate_ir::ClimateIR(16, 30, 1.0f, true, true,
                              {climate::CLIMATE_FAN_AUTO, climate::CLIMATE_FAN_LOW,
                               climate::CLIMATE_FAN_MEDIUM, climate::CLIMATE_FAN_HIGH},
                              {climate::CLIMATE_SWING_OFF, climate::CLIMATE_SWING_VERTICAL}) {}

 protected:
  void transmit_state() override;
  bool on_receive(remote_base::RemoteReceiveData data) override;

  // TODO: fill these in from your capture diffs.
  //   Which byte carries the temperature? Which bits are the mode?
  //   The capture-diffing tool on this page shows you exactly which
  //   bytes moved when you changed one setting.
  uint8_t operation_mode_();
  uint8_t fan_speed_();
  uint8_t temperature_();
  uint8_t checksum_(const uint8_t *frame, uint8_t length);
};

}  // namespace ${snake}
}  // namespace esphome
`;
}

function guessBitTimings(codes) {
    const spaces = codes.filter((v, i) => i % 2 === 1).map(Math.abs).filter(s => s < 5000);
    const marks = codes.filter((v, i) => i % 2 === 0).map(Math.abs).filter(s => s < 2000);
    if (!spaces.length) return { mark: 550, one: 1650, zero: 550 };
    const sorted = spaces.slice().sort((a, b) => a - b);
    return {
        mark: Math.round(median(marks) || 550),
        zero: Math.round(sorted[Math.floor(sorted.length * 0.2)]),
        one: Math.round(sorted[Math.floor(sorted.length * 0.8)]),
    };
}

function median(list) {
    if (!list.length) return 0;
    const s = list.slice().sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
}

function renderSkeleton() {
    const out = document.getElementById('skeletonOut');
    const input = document.getElementById('skeletonName');
    if (!out) return;

    const draw = () => {
        out.textContent = '';
        const code = componentSkeleton(input ? input.value : 'MyBrand');
        const wrap = el('div', 'code');
        const head = el('div', 'code-head');
        head.appendChild(el('span', 'code-label', t('w.skel.label')));
        const btns = el('span', 'code-btns');
        const copy = el('button', 'copy-btn', t('w.copy'));
        copy.type = 'button';
        copy.addEventListener('click', () => copyText(code, copy));
        btns.appendChild(copy);
        const dl = el('button', 'copy-btn', t('w.download'));
        dl.type = 'button';
        dl.addEventListener('click', () => downloadText(
            (input && input.value ? slugish(input.value) : 'mybrand') + '.h', code));
        btns.appendChild(dl);
        head.appendChild(btns);
        const pre = el('pre');
        pre.appendChild(el('code', null, code));
        wrap.append(head, pre);
        out.appendChild(wrap);
    };

    if (input && !input.dataset.wired) {
        input.dataset.wired = '1';
        input.addEventListener('input', draw);
    }
    draw();
}

function slugish(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

/* ── Record and replay ───────────────────────────────────────────────────── */
function saveSession() {
    const session = {
        format: 'frostcaller-session',
        version: 1,
        at: new Date().toISOString(),
        flipper: FLIPPER.active,
        info: FLIPPER.info || null,
        lines: lines.map(l => ({ t: l.text, k: l.kind })),
        captures,
    };
    downloadText('frostcaller-session.json', JSON.stringify(session, null, 2));
}

function loadSession(text, name) {
    let s;
    try { s = JSON.parse(text); } catch (e) { showToast(t('w.rec.notsession')); return; }
    if (!s || s.format !== 'frostcaller-session') { showToast(t('w.rec.notsession')); return; }

    lines.length = 0;
    $('log').textContent = '';
    addLine(tv('w.rec.replaying', {
        name: (name || t('w.rec.asession')),
        when: (s.at ? ' ' + tv('w.rec.from', { date: new Date(s.at).toLocaleString() }) : ''),
    }), 'meta');
    (s.lines || []).forEach(l => addLine(l.t, l.k || 'plain'));

    if (Array.isArray(s.captures)) {
        s.captures.forEach(c => {
            c.at = new Date(c.at);
            c.selected = false;
            captures.push(c);
        });
        saveCaptures();
        renderCaptures();
        renderDiff();
    }
    addLine(t('w.rec.endreplay'), 'meta');
    showToast(tv('w.rec.replayed', { n: (s.lines ? s.lines.length : 0) }));
}

/* ── Flipper-IRDB fetch ──────────────────────────────────────────────────── */
/* The one place this project touches the network. Off unless you switch it
   on, and it says so before it does anything. */
const IRDB_BASE = 'https://raw.githubusercontent.com/Lucaslhm/Flipper-IRDB/main/';

function renderIrdb() {
    const host = document.getElementById('irdbBody');
    if (!host) return;
    host.textContent = '';

    host.appendChild(para2(t('w.irdb.lead')));

    const warn = el('p', 'step-note warn');
    warn.textContent = t('w.irdb.warn');
    host.appendChild(warn);

    const optIn = el('label', 'deck-check');
    const cb = el('input');
    cb.type = 'checkbox';
    cb.id = 'irdbOptIn';
    optIn.appendChild(cb);
    optIn.appendChild(el('span', null, t('w.irdb.allow')));
    host.appendChild(optIn);

    const row = el('div', 'send-row');
    const input = el('input', 'send-input');
    input.type = 'text';
    input.placeholder = 'ACs/Daikin/Daikin_FTXS35.ir';
    input.setAttribute('aria-label', t('w.irdb.aria'));
    row.appendChild(input);

    const go = el('button', 'btn btn-primary', t('w.irdb.fetch'));
    go.type = 'button';
    go.disabled = true;
    row.appendChild(go);
    host.appendChild(row);

    cb.addEventListener('change', () => { go.disabled = !cb.checked; });

    const status = el('p', 'q-hint');
    host.appendChild(status);

    go.addEventListener('click', async () => {
        const path = input.value.trim().replace(/^\/+/, '');
        if (!path) return;
        if (!/^[\w\-./ ()+]+\.ir$/i.test(path) || path.includes('..')) {
            status.textContent = t('w.irdb.badpath');
            return;
        }
        go.disabled = true;
        status.textContent = t('w.irdb.fetching');
        try {
            const res = await fetch(IRDB_BASE + path.split('/').map(encodeURIComponent).join('/'));
            if (!res.ok) throw new Error(tv('w.irdb.status', { code: res.status }));
            const text = await res.text();
            importIrText(text, path.split('/').pop());
            status.textContent = t('w.irdb.ok');
        } catch (err) {
            status.textContent = tv('w.irdb.fail', { err: (err.message || String(err)) });
        }
        go.disabled = false;
    });

    const links = el('div', 'mini-row');
    const browse = el('a', 'mini-btn', t('w.irdb.browse'));
    browse.href = 'https://github.com/Lucaslhm/Flipper-IRDB/tree/main/ACs';
    browse.target = '_blank';
    browse.rel = 'noopener';
    links.appendChild(browse);
    host.appendChild(links);
}

/* ── Console annotations ─────────────────────────────────────────────────── */
/* Runs incoming log lines through the guide's own explainer, so the console
   tells you what a line means rather than only what colour it is. */
const CONSOLE_HINTS = [
    { re: /Authentication Failure|AUTH_(FAIL|EXPIRE)/i, say: 'Wrong Wi-Fi password. Retype it rather than pasting.' },
    { re: /No networks found|NO_AP_FOUND|BEACON_TIMEOUT/i, say: 'It cannot see the network at all — 2.4 GHz only, and signal at the unit is often worse than you think.' },
    { re: /Brownout/i, say: 'The power supply sagged. A better USB charger or a shorter cable fixes this, not a code change.' },
    { re: /rst:0x[0-9a-f]+/i, say: 'A reset reason. `rst:0x1` is a normal power-on; anything else is worth reading up.' },
    { re: /Guru Meditation|Backtrace:/i, say: 'A crash. Almost always a bad pin number or two things fighting over one pin.' },
    { re: /Invalid encryption key/i, say: 'The key in Home Assistant does not match the one in the config.' },
    { re: /Received Raw:/i, say: 'A signal nothing recognised — captured below, ready to convert.' },
    { re: /WiFi Connected|IP Address/i, say: 'On the network. Note the address if you enabled the web server.' },
];

function annotate(line) {
    const hit = CONSOLE_HINTS.find(h => h.re.test(line));
    return hit ? hit.say : null;
}

/* ── Init ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    renderChecksum();
    renderSkeleton();
    renderIrdb();

    const save = document.getElementById('sessionSave');
    if (save) save.addEventListener('click', saveSession);

    const file = document.getElementById('sessionFile');
    if (file) {
        file.addEventListener('change', () => {
            [...file.files].forEach(f => {
                const fr = new FileReader();
                fr.onload = () => loadSession(String(fr.result), f.name);
                fr.readAsText(f);
            });
            file.value = '';
        });
    }
});
