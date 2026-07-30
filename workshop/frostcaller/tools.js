/* ==========================================================================
   Frostcaller — bench tools
   --------------------------------------------------------------------------
   Loaded after app.js and shares its helpers (el, rich, para, copyText,
   codeBlock, money, settings, builder…). Everything here is an interactive
   tool rather than prose:

     COMPARE      → the six paths side by side
     SYMPTOMS     → "what went wrong?" wizard
     LOG_LINES    → paste a log line, get a plain explanation
     PINMAP       → which pins are safe on which chip, click to use
     raw toolbox  → paste captured timings, get YAML / Pronto / a guess
     cost         → what leaving it on actually costs
     qr           → a scannable version of your share link
     markdown     → the plan as text you can paste into anything

   Same rules as app.js: no innerHTML, no dependencies, no network calls.
   ========================================================================== */

'use strict';

/* ── The six paths, side by side ─────────────────────────────────────────── */
const COMPARE_ROWS = [
    { k: 'cost', label: 'Rough cost', get: p => priceRange(p.low, p.high) },
    { k: 'level', label: 'Difficulty', get: p => p.level },
    { k: 'time', label: 'Time to first success', get: p => p.time },
    {
        k: 'solder', label: 'Soldering', good: v => v === 'None',
        get: p => (p.id === 'hijack' ? 'None if the wireless route works' : 'None'),
    },
    {
        k: 'build', label: 'Anything to assemble', good: v => v === 'No',
        get: p => ({ wand: 'No', bench: 'Three jumper wires', ready: 'No', djinn: 'No', whisper: 'No', hijack: 'Opening a case, maybe' }[p.id]),
    },
    {
        k: 'flash', label: 'Firmware to install', good: v => v === 'No',
        get: p => ({ wand: 'Yes, once over USB', bench: 'Yes, once over USB', ready: 'No — it arrives with it', djinn: 'No', whisper: 'No', hijack: 'Yes, and that is the hard part' }[p.id]),
    },
    {
        k: 'local', label: 'Works with no internet', good: v => v.startsWith('Yes'),
        get: p => ({ wand: 'Yes, always', bench: 'Yes, always', ready: 'Yes, always', djinn: 'Yes, after setup', whisper: 'Yes, always', hijack: 'Yes, always' }[p.id]),
    },
    {
        k: 'card', label: 'Real thermostat card', good: v => v.startsWith('Yes'),
        get: p => ({ wand: 'Yes, built in', bench: 'Yes, built in', ready: 'Yes, built in', djinn: 'Yes, via SmartIR', whisper: 'Yes, via SmartIR', hijack: 'Yes, built in' }[p.id]),
    },
    {
        k: 'range', label: 'Range', good: v => v.startsWith('Whole'),
        get: p => ({ wand: 'A few metres, aimed', bench: '1–3 m, or whole room with the driver module', ready: 'Whole room', djinn: 'Whole room', whisper: 'Whole room', hijack: 'Whole room' }[p.id]),
    },
    {
        k: 'case', label: 'Looks finished', good: v => v === 'Yes',
        get: p => ({ wand: 'Yes', bench: 'No — bare board', ready: 'Yes', djinn: 'Yes', whisper: 'Yes', hijack: 'Yes' }[p.id]),
    },
    {
        k: 'needs', label: 'Also needs', get: p =>
            ({ wand: 'Home Assistant', bench: 'Home Assistant', ready: 'Home Assistant', djinn: 'A phone, once', whisper: 'A Zigbee network', hijack: 'Home Assistant, patience' }[p.id]),
    },
    {
        k: 'who', label: 'Best if you are…', get: p =>
            ({
                wand: 'new to this and want it tidy',
                bench: 'spending as little as possible',
                ready: 'buying your way past the fiddly part',
                djinn: 'out of patience entirely',
                whisper: 'already deep in Zigbee',
                hijack: 'doing it for the sport',
            }[p.id]),
    },
];

function renderCompare() {
    const host = document.getElementById('compareTable');
    if (!host) return;
    host.textContent = '';

    const wrap = el('div', 'table-wrap');
    const table = el('table', 'cmp-table');

    const thead = el('thead');
    const hr = el('tr');
    hr.appendChild(el('th', 'cmp-corner', ''));
    PATHS.forEach(p => {
        const th = el('th');
        const r = readiness(p);
        const far = ownedCount() > 0 && r.missing.length > 2;
        if (far) th.classList.add('is-far');
        const btn = el('button', 'cmp-head');
        btn.type = 'button';
        btn.appendChild(el('span', 'cmp-glyph', p.glyph));
        const tr = tc('path.' + p.id, null);
        btn.appendChild(el('span', 'cmp-name', tr ? tr[0] : p.name));
        if (ownedCount()) {
            btn.appendChild(el('span', 'cmp-ready' + (r.ready ? ' is-ready' : ''),
                r.ready ? t('cmp.ready') : tv('cmp.needed', { n: r.missing.length })));
        }
        btn.addEventListener('click', () => openPath(p.id, true));
        th.appendChild(btn);
        hr.appendChild(th);
    });
    thead.appendChild(hr);

    const tbody = el('tbody');
    /* `good()` judges the English value; only the display is translated. */
    const shown = v => tc('cmpv.' + v, tc('lvl.' + v, tc('time.' + v, v)));
    COMPARE_ROWS.forEach(row => {
        const tr = el('tr');
        tr.appendChild(el('th', 'cmp-row-label', tc('cmp.' + row.k, row.label)));
        PATHS.forEach(p => {
            const v = row.get(p) || '—';
            const r = readiness(p);
            const far = ownedCount() > 0 && r.missing.length > 2;
            const td = el('td', (row.good && row.good(v) ? 'is-good' : '') + (far ? ' is-far' : ''), shown(v));
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    wrap.appendChild(table);
    host.appendChild(wrap);
}

/* ── "What went wrong?" ──────────────────────────────────────────────────── */
const SYMPTOMS = [
    {
        id: 'noport',
        q: 'The computer never sees the board',
        causes: [
            { t: 'The cable', d: 'Half of all “dead boards” are charge-only USB cables. Try a different one — ideally one that came with a phone, not a power bank.' },
            { t: 'The browser', d: 'Only Chrome and Edge can talk to serial ports. Firefox and Safari cannot, and they will not tell you why.' },
            { t: 'The driver', d: 'On Windows, a cheap board needs a CH340 or CP210x driver. Look at the little chip beside the USB socket and install the matching one. See [the software bench](#software).' },
            { t: 'The boot button', d: 'Some clones only enter flashing mode if you hold **BOOT** while the install starts, then let go.' },
            { t: 'The port is busy', d: 'A serial monitor left open in another tab or program holds the port. Close it and try again.' },
        ],
    },
    {
        id: 'nowifi',
        q: 'It flashed, but it never joins Wi-Fi',
        causes: [
            { t: '5 GHz', d: 'These chips are **2.4 GHz only**, always. If your network is 5 GHz-only, or the 2.4 GHz band is disabled, nothing will help.' },
            { t: 'The password', d: 'Retype it in ESPHome’s `secrets.yaml` rather than trusting a copy-paste. A trailing space is invisible and fatal.' },
            { t: 'Signal', d: 'The board sits where the AC is, which may be the worst corner of the house. Check with a phone standing in the same spot.' },
            { t: 'The router', d: 'Guest isolation, MAC filtering and “new device approval” all block a board silently.' },
            { t: 'Special characters', d: 'A network name with emoji or unusual characters trips some firmware. Rename or move it.' },
        ],
    },
    {
        id: 'nothing',
        q: 'The card works but the air conditioner ignores it',
        causes: [
            { t: 'Wrong protocol', d: 'Try `coolix` first, then your actual brand, then `heatpumpir`. See [the brand table](#ch-brands).' },
            { t: 'Is the LED firing at all?', d: 'Point a **phone camera** at it while sending a command — most see infrared as a faint purple flicker. This one test splits the problem in half.' },
            { t: 'Range', d: 'Hold it 20 cm from the unit and retry. If it works there, it is a range problem, not a code problem — see [placement](#ch-place).' },
            { t: 'Wrong pin', d: 'The wire on `S` must be on the same GPIO as the `pin:` line in your config. Use [the config writer](#builder) to be sure.' },
            { t: 'The unit is asleep', d: 'Some units ignore infrared for a few minutes after mains power is restored.' },
        ],
    },
    {
        id: 'weak',
        q: 'It works up close but not from across the room',
        causes: [
            { t: 'This is normal', d: 'A bare KY-005 driven straight from a chip pin manages one to three metres. Nothing is broken.' },
            { t: 'Bounce it', d: 'Aim at the white ceiling above the unit instead of at the unit. Infrared reflects surprisingly well.' },
            { t: 'Buy the driver module', d: 'An IR blaster module with a transistor and several LEDs costs about €2 and is the real fix.' },
            { t: 'Sunlight', d: 'Direct sun on either end swamps the signal. Move it off the windowsill.' },
        ],
    },
    {
        id: 'wrongstate',
        q: 'It turns on, but the mode or temperature is wrong',
        causes: [
            { t: 'Model variant', d: 'Several platforms take a `model:` or `use_fahrenheit:` option. Read the [ESPHome page](https://esphome.io/components/climate/climate_ir.html) for yours.' },
            { t: 'Unsupported modes', d: 'Set `supports_heat: false` or `supports_dry: false` so Home Assistant stops offering modes your unit does not have.' },
            { t: 'Mitsubishi and “off”', d: 'Cooling-only Mitsubishi units often ignore the off command unless `supports_heat` is false.' },
            { t: 'Close but not exact', d: 'If everything works except one setting, you have the wrong protocol variant. [Capture your own remote](#ch-learn) and compare.' },
        ],
    },
    {
        id: 'lying',
        q: 'Home Assistant says it is on, but it is off',
        causes: [
            { t: 'This is not a bug', d: 'Infrared is one-way. The box never hears back, so the card shows what it believes it set. Every path in this guide has this limit.' },
            { t: 'A metering plug', d: 'About €10, and it turns the guess into a fact you can automate on. See [the extras](#x-state).' },
            { t: 'A vent sensor', d: 'A cheap temperature sensor taped near the air outlet drops several degrees within a minute of real cooling.' },
            { t: 'Someone used the handset', d: 'On brands that “hear back”, add a receiver and Home Assistant notices.' },
        ],
    },
    {
        id: 'build',
        q: 'The build fails, or the device keeps rebooting',
        causes: [
            { t: 'Indentation', d: 'YAML cares about spaces and hates tabs. One stray tab is the most common cause of a config that “looks fine”.' },
            { t: 'Duplicate keys', d: 'Each top-level key (`climate:`, `sensor:`, `button:`) may appear **once**. Merge, do not repeat. [The config writer](#builder) does this for you.' },
            { t: 'Not enough machine', d: 'A Raspberry Pi 3 compiling for an ESP32 is genuinely slow. Give it time before assuming a hang.' },
            { t: 'Power', d: 'Random reboots under Wi-Fi load are almost always a weak USB supply or a thin cable, not the code.' },
            { t: 'Too much config', d: 'Strip back to just the transmitter and the climate block, prove that works, then add things one at a time.' },
        ],
    },
];

function renderTrouble() {
    const host = document.getElementById('fixitBody');
    const pickHost = document.getElementById('fixitPicker');
    if (!host || !pickHost) return;
    pickHost.textContent = '';
    host.textContent = '';

    let current = null;
    const show = s => {
        host.textContent = '';
        if (!s) {
            host.appendChild(para(t('fix.pick')));
            return;
        }
        host.appendChild(el('h3', 'fix-title', tc('sym.' + s.id, s.q)));
        const ol = el('ol', 'fix-list');
        s.causes.forEach((c, ci) => {
            const li = el('li');
            li.appendChild(el('h4', 'fix-cause', tc('fix.' + s.id + '.' + ci + '.t', c.t)));
            li.appendChild(para(tc('fix.' + s.id + '.' + ci + '.d', c.d)));
            ol.appendChild(li);
        });
        host.appendChild(ol);
        host.appendChild(para(t('fix.more'), 'step-note'));
    };

    SYMPTOMS.forEach(s => {
        const b = el('button', 'chip', tc('sym.' + s.id, s.q));
        b.type = 'button';
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => {
            current = current === s ? null : s;
            pickHost.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
            if (current) b.setAttribute('aria-pressed', 'true');
            show(current);
        });
        pickHost.appendChild(b);
    });
    show(null);
}

/* ── Log reader ──────────────────────────────────────────────────────────── */
const LOG_LINES = [
    {
        re: /Received Raw:/i, kind: 'good',
        say: 'A signal arrived but no decoder recognised it. Copy the numbers into [the raw-code toolbox](#rawtool) and you can replay it anyway — this always works.',
    },
    {
        re: /Received (Coolix|Daikin|Midea|LG|Samsung|NEC|Sony|Panasonic|Toshiba|Gree|Mitsubishi|Whirlpool|Pronto|JVC|RC5|RC6|Haier|Hitachi|Fujitsu|TCL|Aeha)/i, kind: 'good',
        say: 'A protocol was recognised. Whatever is named there is very likely your `platform:` — go straight to [the brand table](#ch-brands) and use it.',
    },
    { re: /WiFi Connecting|Starting scan/i, kind: 'info', say: 'It is trying to join your network. If this repeats forever, the name or password is wrong, or the network is 5 GHz only.' },
    { re: /Authentication Failure|AUTH_(FAIL|EXPIRE)|WL_CONNECT_FAILED/i, kind: 'bad', say: 'The password was rejected. Retype it in `secrets.yaml` rather than pasting it — trailing spaces are invisible.' },
    { re: /No networks found|NO_AP_FOUND|BEACON_TIMEOUT/i, kind: 'bad', say: 'The board cannot see your network at all. 2.4 GHz only, and signal at the air conditioner is often worse than you think.' },
    { re: /WiFi Connected|IP Address:/i, kind: 'good', say: 'It is on the network. Note the IP address — you can open it in a browser if you enabled `web_server`.' },
    { re: /Rebooting|Boot seems successful|rst:0x|Brownout/i, kind: 'bad', say: 'It restarted. `rst:0x1` is a normal power-on; a **brownout** means the USB supply or cable is too weak, which is far more common than a code problem.' },
    { re: /Guru Meditation|Backtrace:|abort\(\) was called|StoreProhibited/i, kind: 'bad', say: 'A crash. Almost always a bad pin number or two components fighting over the same pin — check with [the pin map](#pinmap).' },
    { re: /Component .* took a long time|took too long/i, kind: 'warn', say: 'Something blocked the loop. Harmless on its own; a flood of them means a sensor is misbehaving.' },
    { re: /Setting up|Setting climate|climate.*Mode|Sending .* command/i, kind: 'info', say: 'Normal chatter. If you see the send happening but the unit does nothing, the code is leaving the board and the problem is the protocol, the aim or the range.' },
    { re: /couldn't connect to|Connection.*(refused|reset)|api.*disconnect/i, kind: 'warn', say: 'Home Assistant and the device lost each other. Usually Wi-Fi; set `api: reboot_timeout: 0s` so the board does not reboot in circles while your server restarts.' },
    { re: /Invalid encryption key|Encryption key/i, kind: 'bad', say: 'The key in Home Assistant does not match the one in the config. Copy it out of the ESPHome file again.' },
    { re: /ERROR|Failed|error:/i, kind: 'bad', say: 'Something failed — the words right after this are usually the real message. Search that phrase, not the whole line.' },
    { re: /WARN/i, kind: 'warn', say: 'A warning. Note it, but only chase it if something is actually broken.' },
];

function readLog(text) {
    return String(text).split(/\r?\n/).filter(l => l.trim()).slice(0, 60).map(line => {
        const hit = LOG_LINES.find(p => p.re.test(line));
        return { line: line.trim().slice(0, 400), kind: hit ? hit.kind : 'plain', say: hit ? hit.say : null };
    });
}

function renderLogReader() {
    const ta = document.getElementById('logInput');
    const out = document.getElementById('logOutput');
    if (!ta || !out) return;

    const run = () => {
        out.textContent = '';
        const val = ta.value.trim();
        if (!val) {
            out.appendChild(para(t('log.empty')));
            return;
        }
        const rows = readLog(val);
        const explained = rows.filter(r => r.say).length;
        out.appendChild(el('p', 'q-hint', explained
            ? tv('log.count', { n: explained, total: rows.length })
            : t('log.none')));

        rows.forEach(r => {
            const item = el('div', 'log-row is-' + r.kind);
            item.appendChild(el('code', 'log-line', r.line));
            if (r.say) item.appendChild(rich(el('p', 'log-say'), r.say));
            out.appendChild(item);
        });
    };

    /* Called again on every language change, so the listeners are wired once
       and only the drawing is repeated. */
    if (!ta.dataset.wired) {
        ta.dataset.wired = '1';
        ta.addEventListener('input', run);
        const clear = document.getElementById('logClear');
        if (clear) clear.addEventListener('click', () => { ta.value = ''; run(); });
    }
    run();
}

/* ── Raw code toolbox ────────────────────────────────────────────────────── */
/* Header timings of the protocols people actually meet, in microseconds. */
const HEADER_GUESS = [
    { mark: 9000, space: 4500, name: 'NEC — most TVs, fans and cheap gadgets', plat: null },
    { mark: 4500, space: 4500, name: 'Samsung', plat: null },
    { mark: 4400, space: 4400, name: 'Coolix or Midea — very common on budget air conditioners', plat: 'coolix' },
    { mark: 8000, space: 4000, name: 'LG', plat: 'climate_ir_lg' },
    { mark: 3300, space: 1600, name: 'Daikin', plat: 'daikin' },
    { mark: 3400, space: 1750, name: 'Panasonic or AEHA family', plat: 'heatpumpir' },
    { mark: 3400, space: 1600, name: 'Mitsubishi', plat: 'mitsubishi' },
    { mark: 6100, space: 7400, name: 'Gree', plat: 'gree' },
    { mark: 3100, space: 1650, name: 'TCL or Electrolux', plat: 'tcl112' },
    { mark: 2400, space: 600, name: 'Sony (SIRC)', plat: null },
];

function parseTimings(text) {
    const nums = String(text).match(/-?\d+/g);
    if (!nums) return [];
    return nums.map(Number).filter(n => Math.abs(n) > 3 && Math.abs(n) < 200000);
}

function guessProtocol(codes) {
    if (codes.length < 4) return null;
    const mark = Math.abs(codes[0]), space = Math.abs(codes[1]);
    const near = (a, b) => Math.abs(a - b) <= Math.max(220, b * 0.18);
    const hit = HEADER_GUESS.find(h => near(mark, h.mark) && near(space, h.space));
    return { mark, space, hit };
}

/** Convert raw microsecond timings to a Pronto hex string. */
function toPronto(codes, freq) {
    const f = freq || 38000;
    const code = Math.round(1000000 / (f * 0.241246));
    const unit = code * 0.241246;
    const words = ['0000', hex4(code), '0000', hex4(Math.ceil(codes.length / 2))];
    codes.forEach(c => words.push(hex4(Math.max(1, Math.round(Math.abs(c) / unit)))));
    if (codes.length % 2) words.push(hex4(Math.round(20000 / unit)));   /* pad with a trailing gap */
    return words.join(' ');
}

function hex4(n) {
    return Math.min(0xFFFF, Math.max(0, n | 0)).toString(16).toUpperCase().padStart(4, '0');
}

function wrapNumbers(codes, perLine) {
    const out = [];
    for (let i = 0; i < codes.length; i += perLine) {
        out.push('    ' + codes.slice(i, i + perLine).join(', ') + (i + perLine < codes.length ? ',' : ''));
    }
    return out.join('\n');
}

function renderRawTool() {
    const ta = document.getElementById('rawInput');
    const out = document.getElementById('rawOutput');
    if (!ta || !out) return;

    const run = () => {
        out.textContent = '';
        const codes = parseTimings(ta.value);
        if (codes.length < 4) {
            out.appendChild(para(t('raw.empty')));
            return;
        }

        const total = codes.reduce((a, c) => a + Math.abs(c), 0);
        const g = guessProtocol(codes);

        const stats = el('div', 'raw-stats');
        [[t('raw.pulses'), codes.length], [t('raw.length'), (total / 1000).toFixed(1) + ' ms'],
        [t('raw.header'), g ? g.mark + ' / ' + g.space + ' µs' : '—']]
            .forEach(([k, v]) => {
                const s = el('div', 'raw-stat');
                s.appendChild(el('span', 'raw-stat-k', k));
                s.appendChild(el('span', 'raw-stat-v', String(v)));
                stats.appendChild(s);
            });
        out.appendChild(stats);

        if (g && g.hit) {
            const note = el('p', 'step-note');
            rich(note, g.hit.plat
                ? tv('raw.hitplat', { name: g.hit.name, plat: g.hit.plat })
                : tv('raw.hitdev', { name: g.hit.name }));
            out.appendChild(note);
        } else {
            out.appendChild(para(t('raw.nohit'), 'step-note'));
        }

        if (codes.length > 100) {
            out.appendChild(para(t('raw.long'), 'q-hint'));
        }

        out.appendChild(codeBlock({
            label: 'ESPHome · a button that replays this',
            text: 'button:\n  - platform: template\n    name: "AC — describe this one"\n    on_press:\n      - remote_transmitter.transmit_raw:\n          carrier_frequency: 38kHz\n          code: [\n' +
                wrapNumbers(codes, 10) + '\n          ]',
        }));

        out.appendChild(codeBlock({
            label: 'Pronto — for Broadlink, SmartIR and most other tools',
            text: toPronto(codes, 38000),
        }));

        out.appendChild(codeBlock({
            label: 'Home Assistant · the same thing as a script action',
            text: 'action: esphome.ac_blaster_send_raw\ndata:\n  code: [' + codes.slice(0, 8).join(', ') + ', …]',
        }));
    };

    /* Same as the log reader: wire once, redraw as often as you like. */
    if (!ta.dataset.wired) {
        ta.dataset.wired = '1';
        ta.addEventListener('input', run);
        const clear = document.getElementById('rawClear');
        if (clear) clear.addEventListener('click', () => { ta.value = ''; run(); });
    }
    run();
}

/* ── Running-cost estimator ──────────────────────────────────────────────── */
const cost = { watts: 900, hours: 6, days: 30, price: 0.28, duty: 60 };

function renderCost() {
    const form = document.getElementById('costForm');
    const out = document.getElementById('costOut');
    if (!form || !out) return;
    form.textContent = '';

    const num = (key, label, hint, min, max, step) => {
        const w = el('label', 'bf');
        w.appendChild(el('span', 'bf-label', label));
        const i = el('input');
        i.type = 'number';
        i.value = cost[key];
        i.min = min; i.max = max; i.step = step;
        i.addEventListener('input', () => {
            const v = parseFloat(i.value);
            if (!isNaN(v)) { cost[key] = Math.min(max, Math.max(min, v)); update(); }
        });
        w.appendChild(i);
        if (hint) w.appendChild(el('span', 'bf-hint', hint));
        return w;
    };

    form.appendChild(num('watts', t('cost.watts'), t('cost.watts.h'), 100, 6000, 50));
    form.appendChild(num('duty', t('cost.duty'), t('cost.duty.h'), 10, 100, 5));
    form.appendChild(num('hours', t('cost.hours'), null, 1, 24, 1));
    form.appendChild(num('days', t('cost.days'), null, 1, 31, 1));
    form.appendChild(num('price', tv('cost.price', { cur: settings.cur }), t('cost.price.h'), 0.01, 5, 0.01));

    const update = () => {
        out.textContent = '';
        const kwhDay = (cost.watts / 1000) * cost.hours * (cost.duty / 100);
        const perDay = kwhDay * cost.price;
        const perMonth = perDay * cost.days;
        const season = perMonth * 3;
        const c = CURRENCIES[settings.cur] || CURRENCIES.EUR;
        const fmt = v => (c.suffix ? v.toFixed(c.dp) + c.sym : c.sym + v.toFixed(2));

        const grid = el('div', 'cost-grid');
        [[t('cost.perday'), fmt(perDay), kwhDay.toFixed(1) + ' kWh'],
        [t('cost.permonth'), fmt(perMonth), (kwhDay * cost.days).toFixed(0) + ' kWh'],
        [t('cost.season'), fmt(season), '']]
            .forEach(([k, v, sub]) => {
                const b = el('div', 'cost-box');
                b.appendChild(el('span', 'cost-k', k));
                b.appendChild(el('span', 'cost-v', v));
                if (sub) b.appendChild(el('span', 'cost-sub', sub));
                grid.appendChild(b);
            });
        out.appendChild(grid);

        const saved = perMonth * 0.07;
        const empty = perMonth * 0.25;
        out.appendChild(rich(el('p', 'step-note'),
            tv('cost.saving', { warm: fmt(saved), empty: fmt(empty) })));
        out.appendChild(para(t('cost.note'), 'q-hint'));
    };

    update();
}

/* ── Pin map ─────────────────────────────────────────────────────────────── */
const PINMAP = {
    esp32: {
        name: 'ESP32 (the classic blue board)',
        pins: [
            { p: 'GPIO4', s: 'good' }, { p: 'GPIO13', s: 'good' }, { p: 'GPIO14', s: 'good' },
            { p: 'GPIO16', s: 'good', why: 'Used by PSRAM on WROVER modules.' },
            { p: 'GPIO17', s: 'good', why: 'Used by PSRAM on WROVER modules.' },
            { p: 'GPIO18', s: 'good' }, { p: 'GPIO19', s: 'good' },
            { p: 'GPIO21', s: 'good', why: 'The usual I²C data pin.' },
            { p: 'GPIO22', s: 'good', why: 'The usual I²C clock pin.' },
            { p: 'GPIO23', s: 'good' }, { p: 'GPIO25', s: 'good' }, { p: 'GPIO26', s: 'good' },
            { p: 'GPIO27', s: 'good' }, { p: 'GPIO32', s: 'good' }, { p: 'GPIO33', s: 'good' },
            { p: 'GPIO0', s: 'careful', why: 'Strapping pin — pulled low to enter flash mode. Anything holding it low at reset stops the board booting.' },
            { p: 'GPIO2', s: 'careful', why: 'Strapping pin, and usually the on-board LED.' },
            { p: 'GPIO5', s: 'careful', why: 'Strapping pin. Fine in practice, but it goes high briefly at boot.' },
            { p: 'GPIO12', s: 'careful', why: 'Strapping pin — must be **low** at boot or the board picks the wrong flash voltage and will not start.' },
            { p: 'GPIO15', s: 'careful', why: 'Strapping pin, and it prints boot noise on startup.' },
            { p: 'GPIO34', s: 'in' }, { p: 'GPIO35', s: 'in' }, { p: 'GPIO36', s: 'in' }, { p: 'GPIO39', s: 'in' },
            { p: 'GPIO1', s: 'avoid', why: 'Serial console TX — using it breaks USB logging.' },
            { p: 'GPIO3', s: 'avoid', why: 'Serial console RX.' },
            { p: 'GPIO6–11', s: 'avoid', why: 'Wired to the flash chip. Touching these bricks the boot.' },
        ],
    },
    esp8266: {
        name: 'ESP8266 (Wemos D1 mini and friends)',
        pins: [
            { p: 'D1', s: 'good', why: 'GPIO5. The usual I²C clock.' },
            { p: 'D2', s: 'good', why: 'GPIO4. The usual I²C data, and a fine infrared pin.' },
            { p: 'D5', s: 'good', why: 'GPIO14.' }, { p: 'D6', s: 'good', why: 'GPIO12.' },
            { p: 'D7', s: 'good', why: 'GPIO13.' },
            { p: 'D0', s: 'careful', why: 'GPIO16. No interrupts and no PWM — it is the deep-sleep wake pin.' },
            { p: 'D3', s: 'careful', why: 'GPIO0. Strapping pin, usually wired to the flash button.' },
            { p: 'D4', s: 'careful', why: 'GPIO2. Strapping pin and the on-board LED; must be high at boot.' },
            { p: 'D8', s: 'careful', why: 'GPIO15. Must be low at boot — a pull-up here stops the board starting.' },
            { p: 'A0', s: 'in', why: 'Analogue in only, 0–1 V.' },
            { p: 'TX / RX', s: 'avoid', why: 'GPIO1 and GPIO3, the serial console.' },
        ],
    },
    esp32c3: {
        name: 'ESP32-C3 (SuperMini and similar)',
        pins: [
            { p: 'GPIO0', s: 'good' }, { p: 'GPIO1', s: 'good' }, { p: 'GPIO3', s: 'good' },
            { p: 'GPIO4', s: 'good' }, { p: 'GPIO5', s: 'good' }, { p: 'GPIO6', s: 'good' },
            { p: 'GPIO7', s: 'good' }, { p: 'GPIO10', s: 'good' },
            { p: 'GPIO2', s: 'careful', why: 'Strapping pin.' },
            { p: 'GPIO8', s: 'careful', why: 'Strapping pin, and usually the on-board LED.' },
            { p: 'GPIO9', s: 'careful', why: 'Strapping pin — this is the boot button.' },
            { p: 'GPIO18', s: 'careful', why: 'USB D−. Using it breaks USB serial.' },
            { p: 'GPIO19', s: 'careful', why: 'USB D+. Using it breaks USB serial.' },
            { p: 'GPIO11–17', s: 'avoid', why: 'Flash and PSRAM.' },
            { p: 'GPIO20 / 21', s: 'avoid', why: 'Serial console.' },
        ],
    },
};

const PIN_LEGEND = {
    good: 'Use freely',
    careful: 'Works, with a catch',
    in: 'Input only — no good for an LED',
    avoid: 'Do not touch',
};

function chipOfBoard() {
    const b = boardOf();
    if (b.chip === 'esp8266') return 'esp8266';
    if (b.variant === 'esp32c3' || b.id === 'esp32c3') return 'esp32c3';
    return 'esp32';
}

function renderPinMap() {
    const host = document.getElementById('pinMap');
    if (!host) return;
    host.textContent = '';

    const b = boardOf();
    if (b.chip === 'adopted') {
        host.appendChild(para(t('pin.adopted'), 'q-hint'));
        return;
    }

    const chip = PINMAP[chipOfBoard()];
    host.appendChild(el('h3', 'pin-title', b.name));
    host.appendChild(rich(el('p', 'q-hint'), tv('pin.lead', { chip: chip.name })));

    /* The same board, drawn. Easier to check against the thing in your hand. */
    if (typeof svgBoard === 'function') {
        const fig = svgBoard(b.id);
        if (fig) {
            const wrap = el('figure', 'figure');
            wrap.appendChild(fig);
            host.appendChild(wrap);
        }
    }

    const legend = el('div', 'pin-legend');
    Object.entries(PIN_LEGEND).forEach(([k, v]) => {
        const s = el('span', 'pin-key is-' + k);
        s.appendChild(el('span', 'pin-dot'));
        s.appendChild(document.createTextNode(v));
        legend.appendChild(s);
    });
    host.appendChild(legend);

    const grid = el('div', 'pin-grid');
    const current = builder.tx || b.tx;
    chip.pins.forEach(pin => {
        const usable = pin.s === 'good' || pin.s === 'careful';
        const item = el(usable ? 'button' : 'div', 'pin is-' + pin.s + (pin.p === current ? ' is-current' : ''));
        if (usable) {
            item.type = 'button';
            item.addEventListener('click', () => {
                builder.tx = pin.p;
                renderBuilder();
                renderPinMap();
                saveState();
                showToast(pin.p + ' set as the infrared pin');
            });
        }
        item.appendChild(el('span', 'pin-name', pin.p));
        if (pin.why) item.appendChild(rich(el('span', 'pin-why'), pin.why));
        if (pin.p === current) item.appendChild(el('span', 'pin-flag', 'in use'));
        grid.appendChild(item);
    });
    host.appendChild(grid);

    const used = [[t('pin.use.led'), builder.tx || b.tx]];
    if (builder.receiver) used.push([t('pin.use.rx'), b.rx]);
    if (builder.sensor) used.push([t('pin.use.sensor'), b.sda + ' + ' + b.scl]);
    if (builder.button && b.btn) used.push([t('pin.use.btn'), b.btn]);
    const taken = el('p', 'q-hint');
    rich(taken, tv('pin.taken', {
        list: used.map(u => u[0] + ' on `' + u[1] + '`').join(', '),
    }));
    host.appendChild(taken);
}

/* ── QR code ─────────────────────────────────────────────────────────────── */
/* A small byte-mode encoder, error correction level L, versions 1–10.
   Enough for a share link; falls back to the plain page URL if one is huge. */
const QR_EC = {
    /* version: [total codewords, EC codewords per block, blocks in group 1,
                 data codewords in group 1, blocks in group 2, data in group 2] */
    1: [26, 7, 1, 19, 0, 0],
    2: [44, 10, 1, 34, 0, 0],
    3: [70, 15, 1, 55, 0, 0],
    4: [100, 20, 1, 80, 0, 0],
    5: [134, 26, 1, 108, 0, 0],
    6: [172, 18, 2, 68, 0, 0],
    7: [196, 20, 2, 78, 0, 0],
    8: [242, 24, 2, 97, 0, 0],
    9: [292, 30, 2, 116, 0, 0],
    10: [346, 18, 2, 68, 2, 69],
};

const QR_ALIGN = {
    1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
    6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
};

/* GF(256) tables for Reed–Solomon, primitive polynomial 0x11D. */
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function buildGf() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
        GF_EXP[i] = x;
        GF_LOG[x] = i;
        x <<= 1;
        if (x & 0x100) x ^= 0x11D;
    }
    for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a, b) {
    if (!a || !b) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGenerator(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
        const next = new Array(poly.length + 1).fill(0);
        for (let j = 0; j < poly.length; j++) {
            next[j] ^= gfMul(poly[j], GF_EXP[i]);
            next[j + 1] ^= poly[j];
        }
        poly = next;
    }
    return poly;
}

function rsEncode(data, ecLen) {
    const gen = rsGenerator(ecLen);
    const res = new Array(ecLen).fill(0);
    data.forEach(byte => {
        const factor = byte ^ res[0];
        res.shift();
        res.push(0);
        for (let i = 0; i < ecLen; i++) res[i] ^= gfMul(gen[i + 1], factor);
    });
    return res;
}

function qrVersionFor(byteLength) {
    for (let v = 1; v <= 10; v++) {
        const [, ec, g1, d1, g2, d2] = QR_EC[v];
        const dataCodewords = g1 * d1 + g2 * d2;
        const countBits = v < 10 ? 8 : 16;
        if (dataCodewords * 8 >= 4 + countBits + byteLength * 8) return v;
    }
    return null;
}

function qrEncode(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    const version = qrVersionFor(bytes.length);
    if (!version) return null;

    const [, ecLen, g1, d1, g2, d2] = QR_EC[version];
    const dataCodewords = g1 * d1 + g2 * d2;
    const countBits = version < 10 ? 8 : 16;

    /* --- bit stream ------------------------------------------------------ */
    const bits = [];
    const push = (value, len) => {
        for (let i = len - 1; i >= 0; i--) bits.push((value >> i) & 1);
    };
    push(0b0100, 4);                       /* byte mode */
    push(bytes.length, countBits);
    bytes.forEach(b => push(b, 8));

    const capacity = dataCodewords * 8;
    for (let i = 0; i < 4 && bits.length < capacity; i++) bits.push(0);   /* terminator */
    while (bits.length % 8) bits.push(0);
    const pad = [0xEC, 0x11];
    let p = 0;
    while (bits.length < capacity) { push(pad[p++ % 2], 8); }

    const codewords = [];
    for (let i = 0; i < bits.length; i += 8) {
        codewords.push(parseInt(bits.slice(i, i + 8).join(''), 2));
    }

    /* --- split into blocks, add error correction, interleave ------------- */
    const blocks = [];
    let at = 0;
    for (let i = 0; i < g1; i++) { blocks.push(codewords.slice(at, at + d1)); at += d1; }
    for (let i = 0; i < g2; i++) { blocks.push(codewords.slice(at, at + d2)); at += d2; }
    const ecBlocks = blocks.map(b => rsEncode(b, ecLen));

    const final = [];
    const maxData = Math.max(...blocks.map(b => b.length));
    for (let i = 0; i < maxData; i++) blocks.forEach(b => { if (i < b.length) final.push(b[i]); });
    for (let i = 0; i < ecLen; i++) ecBlocks.forEach(b => final.push(b[i]));

    /* --- lay out the modules --------------------------------------------- */
    const size = 17 + version * 4;
    const m = Array.from({ length: size }, () => new Array(size).fill(null));
    const reserved = Array.from({ length: size }, () => new Array(size).fill(false));

    const place = (r, c, v) => { if (r >= 0 && c >= 0 && r < size && c < size) { m[r][c] = v; reserved[r][c] = true; } };

    const finder = (r, c) => {
        for (let dr = -1; dr <= 7; dr++) {
            for (let dc = -1; dc <= 7; dc++) {
                const inside = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
                const ring = inside && (dr === 0 || dr === 6 || dc === 0 || dc === 6 ||
                    (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
                place(r + dr, c + dc, ring ? 1 : 0);
            }
        }
    };
    finder(0, 0); finder(0, size - 7); finder(size - 7, 0);

    for (let i = 8; i < size - 8; i++) {
        const v = i % 2 === 0 ? 1 : 0;
        place(6, i, v); place(i, 6, v);
    }

    QR_ALIGN[version].forEach(r => QR_ALIGN[version].forEach(c => {
        if (reserved[r][c]) return;                       /* skip the finder corners */
        for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
                const on = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
                place(r + dr, c + dc, on ? 1 : 0);
            }
        }
    }));

    place(size - 8, 8, 1);                                /* the always-dark module */

    /* Reserve the format areas before laying data down. */
    for (let i = 0; i < 9; i++) { if (m[8][i] === null) place(8, i, 0); if (m[i][8] === null) place(i, 8, 0); }
    for (let i = 0; i < 8; i++) { if (m[8][size - 1 - i] === null) place(8, size - 1 - i, 0); if (m[size - 1 - i][8] === null) place(size - 1 - i, 8, 0); }

    if (version >= 7) {
        const vBits = bchVersion(version);
        for (let i = 0; i < 18; i++) {
            const bit = (vBits >> i) & 1;
            place(Math.floor(i / 3), size - 11 + (i % 3), bit);
            place(size - 11 + (i % 3), Math.floor(i / 3), bit);
        }
    }

    /* Zig-zag data placement, right to left, skipping the timing column. */
    let bitIndex = 0;
    const dataBits = [];
    final.forEach(cw => { for (let i = 7; i >= 0; i--) dataBits.push((cw >> i) & 1); });

    let up = true;
    for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) col--;
        for (let n = 0; n < size; n++) {
            const row = up ? size - 1 - n : n;
            for (let c = 0; c < 2; c++) {
                const cc = col - c;
                if (reserved[row][cc]) continue;
                m[row][cc] = bitIndex < dataBits.length ? dataBits[bitIndex++] : 0;
            }
        }
        up = !up;
    }

    /* --- pick the friendliest mask --------------------------------------- */
    let best = null;
    for (let mask = 0; mask < 8; mask++) {
        const cand = m.map(row => row.slice());
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (reserved[r][c]) continue;
                if (maskAt(mask, r, c)) cand[r][c] ^= 1;
            }
        }
        writeFormat(cand, size, mask);
        const score = maskPenalty(cand, size);
        if (!best || score < best.score) best = { score, grid: cand };
    }

    return { size, grid: best.grid, version };
}

function maskAt(mask, r, c) {
    switch (mask) {
        case 0: return (r + c) % 2 === 0;
        case 1: return r % 2 === 0;
        case 2: return c % 3 === 0;
        case 3: return (r + c) % 3 === 0;
        case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
        case 5: return (r * c) % 2 + (r * c) % 3 === 0;
        case 6: return ((r * c) % 2 + (r * c) % 3) % 2 === 0;
        default: return ((r + c) % 2 + (r * c) % 3) % 2 === 0;
    }
}

function bchFormat(data) {
    let d = data << 10;
    for (let i = 14; i >= 10; i--) if ((d >> i) & 1) d ^= 0x537 << (i - 10);
    return ((data << 10) | d) ^ 0x5412;
}

function bchVersion(version) {
    let d = version << 12;
    for (let i = 17; i >= 12; i--) if ((d >> i) & 1) d ^= 0x1F25 << (i - 12);
    return (version << 12) | d;
}

function writeFormat(grid, size, mask) {
    /* 01 = error correction level L. Placement follows the spec exactly:
       the two copies are NOT mirror images of each other, and getting the
       rows and columns the wrong way round produces a code nothing can read. */
    const bits = bchFormat((0b01 << 3) | mask);
    const bit = i => (bits >>> i) & 1;

    /* Copy one, around the top-left finder. */
    for (let i = 0; i <= 5; i++) grid[i][8] = bit(i);
    grid[7][8] = bit(6);
    grid[8][8] = bit(7);
    grid[8][7] = bit(8);
    for (let i = 9; i < 15; i++) grid[8][14 - i] = bit(i);

    /* Copy two, split between the other two finders. */
    for (let i = 0; i < 8; i++) grid[8][size - 1 - i] = bit(i);
    for (let i = 8; i < 15; i++) grid[size - 15 + i][8] = bit(i);

    grid[size - 8][8] = 1;               /* the module that is always dark */
}

function maskPenalty(g, size) {
    let score = 0;
    /* Rule 1 — runs of five or more */
    for (let i = 0; i < size; i++) {
        for (const line of [g[i], g.map(r => r[i])]) {
            let run = 1;
            for (let j = 1; j < size; j++) {
                if (line[j] === line[j - 1]) { run++; } else { if (run >= 5) score += run - 2; run = 1; }
            }
            if (run >= 5) score += run - 2;
        }
    }
    /* Rule 2 — 2×2 blocks */
    for (let r = 0; r < size - 1; r++) {
        for (let c = 0; c < size - 1; c++) {
            const v = g[r][c];
            if (v === g[r][c + 1] && v === g[r + 1][c] && v === g[r + 1][c + 1]) score += 3;
        }
    }
    /* Rule 3 — finder-like patterns */
    const pat = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
    const rev = pat.slice().reverse();
    const match = (line, i, p) => p.every((v, k) => line[i + k] === v);
    for (let i = 0; i < size; i++) {
        const rows = g[i], cols = g.map(r => r[i]);
        for (let j = 0; j + 11 <= size; j++) {
            if (match(rows, j, pat) || match(rows, j, rev)) score += 40;
            if (match(cols, j, pat) || match(cols, j, rev)) score += 40;
        }
    }
    /* Rule 4 — overall balance */
    let dark = 0;
    g.forEach(row => row.forEach(v => { if (v) dark++; }));
    const pct = (dark * 100) / (size * size);
    score += Math.floor(Math.abs(pct - 50) / 5) * 10;
    return score;
}

function qrSvg(qr, px) {
    const quiet = 4;
    const total = qr.size + quiet * 2;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + total + ' ' + total);
    svg.setAttribute('width', px);
    svg.setAttribute('height', px);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', t('qr.alt'));

    const bg = document.createElementNS(svg.namespaceURI, 'rect');
    bg.setAttribute('width', total);
    bg.setAttribute('height', total);
    bg.setAttribute('fill', '#ffffff');
    svg.appendChild(bg);

    let d = '';
    for (let r = 0; r < qr.size; r++) {
        for (let c = 0; c < qr.size; c++) {
            if (qr.grid[r][c]) d += 'M' + (c + quiet) + ' ' + (r + quiet) + 'h1v1h-1z';
        }
    }
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', '#000000');
    svg.appendChild(path);
    return svg;
}

function showQr() {
    const dlg = document.getElementById('qrPanel');
    const box = document.getElementById('qrBox');
    if (!dlg || !box) return;
    box.textContent = '';

    let target = shareUrl();
    let qr = qrEncode(target);
    let trimmed = false;
    if (!qr) {
        target = location.origin + location.pathname;
        qr = qrEncode(target);
        trimmed = true;
    }

    if (!qr) {
        box.appendChild(para(t('qr.toolong')));
    } else {
        box.appendChild(qrSvg(qr, 240));
        box.appendChild(el('p', 'qr-url', target));
        box.appendChild(para(trimmed ? t('qr.trimmed') : t('qr.ok'), 'q-hint'));
    }

    dlg.hidden = false;
    const close = document.getElementById('qrClose');
    if (close) close.focus();
}

function hideQr() {
    const dlg = document.getElementById('qrPanel');
    if (dlg) dlg.hidden = true;
}

/* ── Markdown export ─────────────────────────────────────────────────────── */
function planMarkdown() {
    const ranked = score();
    const winner = ranked[0].p;
    const bag = shoppingList(winner);
    const r = readiness(winner);
    const L = [];

    L.push('# Frostcaller — ' + winner.name);
    L.push('');
    L.push('_' + winner.sub + '_');
    L.push('');
    L.push('**Where it ends:** ' + winner.ends.replace(/\*\*/g, '**'));
    L.push('');
    L.push('| | |');
    L.push('|---|---|');
    L.push('| Cost | ' + priceRange(winner.low, winner.high) + ' |');
    L.push('| Difficulty | ' + winner.level + ' |');
    L.push('| Time | ' + winner.time + ' |');
    L.push('');

    if (bag.buy.length) {
        L.push('## Still to buy');
        L.push('');
        bag.buy.forEach(p => L.push('- [ ] **' + p.name + '** — ' + priceRange(p.low, p.high) + '  \n      ' + aliLink(p.q)));
        L.push('');
    } else if (r.ready) {
        L.push('## Shopping list');
        L.push('');
        L.push('Nothing — everything this path needs is already in the drawer.');
        L.push('');
    }
    if (bag.have.length) {
        L.push('Already have: ' + bag.have.map(p => p.name).join(', '));
        L.push('');
    }

    L.push('## Notes');
    L.push('');
    notesFor(winner).forEach(n => L.push('- ' + n.replace(/\[([^\]]+)\]\(#[^)]+\)/g, '$1')));
    L.push('');

    L.push('## Steps');
    L.push('');
    winner.steps.forEach((s, i) => {
        L.push((i + 1) + '. **' + s.t + '**');
        (s.p || []).forEach(t => L.push('   ' + stripLinks(t)));
        (s.list || []).forEach(t => L.push('   - ' + stripLinks(t)));
        if (s.code) {
            L.push('');
            L.push('   ```yaml');
            s.code.text.split('\n').forEach(l => L.push('   ' + l));
            L.push('   ```');
        }
        if (s.note) L.push('   > ' + stripLinks(s.note));
        L.push('');
    });

    L.push('## Your configuration');
    L.push('');
    L.push('```yaml');
    L.push(buildYaml().trimEnd());
    L.push('```');
    L.push('');
    L.push('---');
    L.push('');
    L.push('Generated by [Frostcaller](' + shareUrl() + ') · rami.party');
    return L.join('\n');
}

function stripLinks(t) {
    return String(t).replace(/\[([^\]]+)\]\((#[^)]+)\)/g, '$1');
}

/* ── Keyboard shortcuts ──────────────────────────────────────────────────── */
/* ── The shopping card ───────────────────────────────────────────────────── */
/* One small card, printable, to take to the shed or the post office. */
function showCard() {
    const dlg = document.getElementById('cardPanel');
    const box = document.getElementById('cardBox');
    if (!dlg || !box) return;

    const winner = score()[0].p;
    const bag = shoppingList(winner);
    const tr = tc('path.' + winner.id, null);
    box.textContent = '';

    const card = el('div', 'shop-card');
    card.appendChild(el('h3', 'sc-title', winner.glyph + '  ' + (tr ? tr[0] : winner.name)));
    card.appendChild(el('p', 'sc-sub', tr ? tr[1] : winner.sub));

    if (bag.buy.length) {
        const ul = el('ul', 'sc-list');
        let lo = 0, hi = 0;
        bag.buy.forEach(p => {
            lo += p.low; hi += p.high;
            const li = el('li');
            li.appendChild(el('span', 'sc-box', '☐'));
            li.appendChild(el('span', 'sc-name', p.name));
            li.appendChild(el('span', 'sc-cost', priceRange(p.low, p.high)));
            ul.appendChild(li);
        });
        card.appendChild(ul);
        card.appendChild(el('p', 'sc-total', t('res.roughly') + ' ' + priceRange(lo, hi)));
    } else {
        card.appendChild(el('p', 'sc-total', t('card.nothing')));
    }

    if (answers.brand && answers.brand !== 'unknown') {
        card.appendChild(el('p', 'sc-note', 'platform: ' + answers.brand));
    }
    card.appendChild(el('p', 'sc-note', 'rami.party/workshop/frostcaller/'));
    box.appendChild(card);

    /* A card you print and carry deserves a code that scans. If the plan is too
       big to fit, fall back to the plain guide address rather than leaving a
       blank space where a QR obviously ought to be. */
    if (typeof qrEncode === 'function') {
        const full = qrEncode(shareUrl());
        const qr = full || qrEncode(location.origin + location.pathname);
        if (qr) {
            box.appendChild(qrSvg(qr, 128));
            if (!full) box.appendChild(el('p', 'q-hint', t('card.qrplain')));
        }
    }

    const print = el('button', 'btn btn-primary', t('card.print'));
    print.type = 'button';
    print.addEventListener('click', () => {
        document.body.classList.add('print-card');
        window.print();
        setTimeout(() => document.body.classList.remove('print-card'), 800);
    });
    box.appendChild(print);

    dlg.hidden = false;
    const close = document.getElementById('cardClose');
    if (close) close.focus();
}

function hideCard() {
    const dlg = document.getElementById('cardPanel');
    if (dlg) dlg.hidden = true;
}

/* ── Keyboard shortcuts ──────────────────────────────────────────────────── */
const SHORTCUTS = [
    ['/', 'Search everything'],
    ['?', 'Show this list'],
    ['g then p', 'Go to the paths'],
    ['g then d', 'Go to your drawer'],
    ['g then y', 'Go to the config writer'],
    ['g then t', 'Go to the bench tools'],
    ['g then f', 'Go to the fix-it wizard'],
    ['c', 'Copy your share link'],
    ['p', 'Print the guide'],
    ['t', 'Cycle the theme'],
    ['Esc', 'Close whatever is open'],
];

function setupShortcuts() {
    let waitingForG = false;
    const jump = id => {
        const n = document.getElementById(id);
        if (n) n.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    document.addEventListener('keydown', ev => {
        if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
        const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);

        if (ev.key === 'Escape') { hideQr(); hideHelp(); hideCard(); return; }
        if (typing) return;

        if (waitingForG) {
            waitingForG = false;
            const map = { p: 'paths', d: 'inventory', y: 'builder', t: 'toolbox', f: 'fixit', r: 'ready', s: 'software' };
            if (map[ev.key]) { ev.preventDefault(); jump(map[ev.key]); }
            return;
        }

        if (ev.key === 'g') { waitingForG = true; setTimeout(() => { waitingForG = false; }, 1200); return; }
        if (ev.key === '?') { ev.preventDefault(); showHelp(); return; }
        if (ev.key === 'c') { ev.preventDefault(); copyText(shareUrl()); return; }
        if (ev.key === 'p') { ev.preventDefault(); printAll(); return; }
        if (ev.key === 't') {
            ev.preventDefault();
            const i = THEMES.findIndex(t => t.id === settings.theme);
            settings.theme = THEMES[(i + 1) % THEMES.length].id;
            const sel = document.getElementById('themeSelect');
            if (sel) sel.value = settings.theme;
            applyTheme();
            saveState();
            showToast('Theme: ' + THEMES.find(t => t.id === settings.theme).name);
        }
    });
}

function showHelp() {
    const dlg = document.getElementById('helpPanel');
    const box = document.getElementById('helpBox');
    if (!dlg || !box) return;
    box.textContent = '';
    const dl = el('dl', 'keys');
    SHORTCUTS.forEach(([k, v]) => {
        dl.appendChild(el('dt', null, k));
        dl.appendChild(el('dd', null, v));
    });
    box.appendChild(dl);
    dlg.hidden = false;
    const close = document.getElementById('helpClose');
    if (close) close.focus();
}

function hideHelp() {
    const dlg = document.getElementById('helpPanel');
    if (dlg) dlg.hidden = true;
}

/* ── Offline ─────────────────────────────────────────────────────────────── */
function setupOffline() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    navigator.serviceWorker.register('sw.js').catch(() => { /* not fatal, ever */ });
}

/* ── Init ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    renderCompare();
    renderTrouble();
    renderLogReader();
    renderRawTool();
    renderCost();
    renderPinMap();
    setupShortcuts();
    setupOffline();

    [['qrClose', hideQr, 'qrPanel'], ['helpClose', hideHelp, 'helpPanel'],
    ['cardClose', hideCard, 'cardPanel']].forEach(([id, fn, panel]) => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', fn);
        const back = document.getElementById(panel);
        if (back) back.addEventListener('click', ev => { if (ev.target === back) fn(); });
    });

    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) helpBtn.addEventListener('click', showHelp);
});
