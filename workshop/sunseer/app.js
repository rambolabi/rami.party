'use strict';

/* =========================================================================
   Sunseer: a live local dashboard for Solis inverters, battery and meter.

   Data path: solis-bridge.py reads the inverters on the LAN (Solarman V5
   sticks on :8899, Modbus TCP on :502, or the stick's HTTP status page) and
   relays normalised JSON to this page over ws://127.0.0.1:7102. A relay is
   needed because browsers cannot open raw TCP sockets and refuse plain-HTTP
   LAN devices from a secure page. Loopback WebSockets are exempt: same
   pattern as the ghosttooth, wakewand and wattwarden bridges.

   History: counter snapshots in localStorage, hourly (14 days) and daily
   (400 days), drawn as bar charts. Demo mode uses its own storage prefix so
   pretend data never pollutes real history.
   ========================================================================= */

const BRIDGE_URL = 'ws://127.0.0.1:7102';
const HOURLY_KEEP = 14 * 24 + 2;
const DAILY_KEEP = 400;
const SPARK_WINDOW_MS = 10 * 60 * 1000;
const STALE_MS = 5 * 60 * 1000;

const THEMES = [['helios', 'Helios'], ['dawn', 'Dawn'], ['aurora', 'Aurora'], ['contrast', 'Contrast']];
const TILES = [
    ['flow', 'Power flow'], ['solar', 'Solar now'], ['today', 'Today'],
    ['battery', 'Battery'], ['grid', 'Grid & meter'], ['house', 'House load'],
    ['inverters', 'Inverters'], ['day24', 'Last 24 hours'], ['days30', 'Last 30 days'],
    ['totals', 'Lifetime counters'], ['loggers', 'Dataloggers'],
];
const DEFAULT_TILES = ['flow', 'solar', 'today', 'battery', 'grid', 'inverters', 'day24', 'days30'];

const MODES = [['solarman', 'Solarman stick (:8899)'], ['modbus', 'Modbus TCP (:502)'], ['http', 'Status page (HTTP)']];
const KINDS = [['auto', 'detect the model'], ['hybrid', 'hybrid (has battery)'], ['string', 'string (PV only)']];
const DEFAULT_PORTS = { solarman: 8899, modbus: 502, http: 80 };

const STATUS_WORDS = {
    0x0: 'waiting for the sun', 0x1: 'generating (open loop)',
    0x2: 'soft start', 0x3: 'generating',
};
const FAULT_WORDS = {
    0x1004: 'grid overvoltage', 0x1010: 'grid undervoltage',
    0x1012: 'grid over-frequency', 0x1013: 'grid under-frequency',
    0x1015: 'no grid detected', 0x1016: 'grid imbalance',
    0x1020: 'DC overvoltage', 0x1032: 'over-temperature protection',
    0x1033: 'PV insulation fault', 0x1039: 'under-temperature protection',
    0x1053: 'battery overvoltage', 0x1054: 'battery undervoltage',
    0x1055: 'battery not connected',
};
const MODE_WORDS = {
    0x21: 'self-use', 0x22: 'optimised revenue', 0x23: 'time-of-use',
    0x24: 'off-grid', 0x28: 'battery wake-up', 0x60: 'feed-in priority',
};

const $ = (id) => document.getElementById(id);

/* ---- settings ------------------------------------------------------------ */
const settings = Object.assign(
    { interval: 10000, theme: 'helios', tiles: DEFAULT_TILES.slice(), gridFlip: false, devices: [] },
    JSON.parse(localStorage.getItem('ss_settings') || '{}'));

function saveSettings() {
    localStorage.setItem('ss_settings', JSON.stringify(settings));
}

/* ---- history store (real + demo live under different prefixes) ------------ */
function makeStore(prefix) {
    const read = (key) => JSON.parse(localStorage.getItem(prefix + key) || '[]');
    const store = {
        hourly: read('hourly'), // {t, gen, imp, exp, chg, dis}
        daily: read('daily'),   // {d, gen, imp, exp, chg, dis}
        lastPersist: 0,
        persist(force) {
            if (!force && Date.now() - store.lastPersist < 20000) return;
            store.lastPersist = Date.now();
            localStorage.setItem(prefix + 'hourly', JSON.stringify(store.hourly));
            localStorage.setItem(prefix + 'daily', JSON.stringify(store.daily));
        },
        wipe() {
            ['hourly', 'daily'].forEach((k) => localStorage.removeItem(prefix + k));
            store.hourly = []; store.daily = [];
        },
    };
    return store;
}
const realStore = makeStore('ss_hist_');
const demoStore = makeStore('ss_demo_');

function dayKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function recordHistory(store, agg, now) {
    if (agg.totGen == null) return;
    const snap = {
        gen: agg.totGen, imp: agg.totImp, exp: agg.totExp,
        chg: agg.totChg, dis: agg.totDis,
    };
    let force = false;

    const hourT = new Date(now); hourT.setMinutes(0, 0, 0);
    const hLast = store.hourly[store.hourly.length - 1];
    if (hLast && hLast.t === hourT.getTime()) Object.assign(hLast, snap);
    else { store.hourly.push({ t: hourT.getTime(), ...snap }); force = true; }
    if (store.hourly.length > HOURLY_KEEP) store.hourly.splice(0, store.hourly.length - HOURLY_KEEP);

    const dKey = dayKey(now);
    const dLast = store.daily[store.daily.length - 1];
    if (dLast && dLast.d === dKey) Object.assign(dLast, snap);
    else { store.daily.push({ d: dKey, ...snap }); force = true; }
    if (store.daily.length > DAILY_KEEP) store.daily.splice(0, store.daily.length - DAILY_KEEP);

    store.persist(force);
}

/* ---- fleet state ----------------------------------------------------------- */
const latest = new Map(); // id -> {data, ts}
const errors = new Map(); // id -> message

function deviceList() { return demo.on ? demo.devices : settings.devices; }
function deviceName(id) {
    const d = deviceList().find((x) => x.id === id);
    return d ? d.name : id;
}

function sumIf(vals) {
    const present = vals.filter((v) => typeof v === 'number');
    return present.length ? present.reduce((a, b) => a + b, 0) : null;
}

function aggFleet() {
    const devs = deviceList();
    const rows = devs.map((dev) => {
        const hit = latest.get(dev.id);
        return hit && Date.now() - hit.ts < STALE_MS ? { dev, d: hit.data } : { dev, d: null };
    });
    const live = rows.filter((r) => r.d);
    const hyb = live.filter((r) => r.d.kind === 'hybrid').map((r) => r.d);
    const flip = settings.gridFlip ? -1 : 1;
    const gridRaw = sumIf(hyb.map((d) => d.grid.w));
    return {
        rows, liveCount: live.length, total: devs.length,
        solarW: sumIf(live.map((r) => r.d.pdc_w ?? r.d.pac_w)),
        todayGen: sumIf(live.map((r) => r.d.today_kwh)),
        totGen: sumIf(live.map((r) => r.d.total_kwh)),
        bat: hyb.length ? hyb[0].bat : null,
        batW: sumIf(hyb.map((d) => d.bat.w)), // positive = charging
        modeCode: hyb.length ? hyb[0].mode_code : null,
        gridW: gridRaw == null ? null : gridRaw * flip, // positive = importing
        meter: hyb.length ? hyb[0].grid : null,
        loadW: sumIf(hyb.map((d) => d.load.w)),
        backupW: sumIf(hyb.map((d) => d.load.backup_w)),
        todayImp: sumIf(hyb.map((d) => d.grid.today_imp)),
        todayExp: sumIf(hyb.map((d) => d.grid.today_exp)),
        todayChg: sumIf(hyb.map((d) => d.bat.today_chg)),
        todayDis: sumIf(hyb.map((d) => d.bat.today_dis)),
        todayLoad: sumIf(hyb.map((d) => d.load.today_kwh)),
        totImp: sumIf(hyb.map((d) => d.grid.total_imp)),
        totExp: sumIf(hyb.map((d) => d.grid.total_exp)),
        totChg: sumIf(hyb.map((d) => d.bat.total_chg)),
        totDis: sumIf(hyb.map((d) => d.bat.total_dis)),
        totLoad: sumIf(hyb.map((d) => d.load.total_kwh)),
    };
}

/* ---- formatting ------------------------------------------------------------ */
const fmtW = (w) => Math.round(w).toLocaleString('en-GB');
const fmtKwh = (v) => v == null ? '···' : v.toLocaleString('en-GB', { maximumFractionDigits: v < 10 ? 2 : v < 1000 ? 1 : 0 });
const flowFmt = (w) => w == null ? '···' : Math.abs(w) >= 9950 ? (w / 1000).toFixed(1) + ' kW' : fmtW(w) + ' W';

function statusWord(code) {
    if (code == null) return null;
    if (STATUS_WORDS[code]) return STATUS_WORDS[code];
    if (FAULT_WORDS[code]) return 'fault: ' + FAULT_WORDS[code];
    if (code >= 0x1000) return 'fault 0x' + code.toString(16);
    return 'state 0x' + code.toString(16);
}

function sunWord(w) {
    if (w == null) return 'waiting for the first reading';
    if (w < 15) return 'the panels are asleep';
    if (w < 300) return 'first light on the panels';
    if (w < 1500) return 'a decent glow';
    if (w < 3500) return 'strong sunshine';
    return 'full blaze across the roof';
}

/* ---- dashboard rendering ---------------------------------------------------- */
const spark = []; // {t, w}
let lastAgg = null;

function setPill(state, text) {
    const el = $('connPill');
    el.className = 'pill ' + state;
    el.textContent = text;
}

function setEdge(id, watts, threshold) {
    const g = $(id);
    if (watts == null || Math.abs(watts) < threshold) { g.className.baseVal = 'edge'; return; }
    g.className.baseVal = watts >= 0 ? 'edge on' : 'edge on rev';
}

function renderFlow(a) {
    $('fPvVal').textContent = flowFmt(a.solarW);
    $('fBatVal').textContent = a.batW == null ? '···'
        : flowFmt(Math.abs(a.batW)) + (a.bat && a.bat.soc != null ? ' · ' + a.bat.soc + '%' : '');
    $('fGridVal').textContent = a.gridW == null ? '···' : flowFmt(Math.abs(a.gridW));
    $('fLoadVal').textContent = a.loadW == null ? '' : flowFmt(a.loadW);
    setEdge('fPvEdge', a.solarW != null && a.solarW >= 15 ? a.solarW : null, 15);
    // battery edge points at the house: discharge flows forward, charge reversed
    setEdge('fBatEdge', a.batW == null ? null : -a.batW, 25);
    setEdge('fGridEdge', a.gridW, 25);

    const bits = [];
    if (a.solarW != null) bits.push('solar ' + flowFmt(a.solarW));
    if (a.batW != null && Math.abs(a.batW) >= 25) bits.push('battery ' + (a.batW > 0 ? 'charging' : 'giving back') + ' ' + flowFmt(Math.abs(a.batW)));
    if (a.gridW != null && Math.abs(a.gridW) >= 25) bits.push((a.gridW > 0 ? 'importing ' : 'exporting ') + flowFmt(Math.abs(a.gridW)));
    $('flowNote').textContent = bits.length ? bits.join(' · ') : 'solar, battery and grid, seen from the house';
}

function setRow(rowId, valId, value, text) {
    $(rowId).style.display = value == null ? 'none' : '';
    if (value != null) $(valId).textContent = text;
}

function renderFleet() {
    const a = aggFleet();
    lastAgg = a;
    $('emptyState').hidden = true;
    $('tiles').hidden = false;

    // solar now
    if (a.solarW != null) {
        $('nowW').textContent = fmtW(a.solarW);
        $('nowW').classList.toggle('shining', a.solarW >= 15);
        spark.push({ t: Date.now(), w: a.solarW });
        while (spark.length && spark[0].t < Date.now() - SPARK_WINDOW_MS) spark.shift();
        drawSpark();
    }
    $('nowWord').textContent = sunWord(a.solarW);
    const per = $('nowPerInv');
    per.innerHTML = '';
    if (a.rows.length > 1) {
        a.rows.forEach(({ dev, d }) => {
            const div = document.createElement('div');
            const w = d ? (d.pdc_w ?? d.pac_w) : null;
            div.innerHTML = `<b>${esc(dev.name)}</b> · ${w != null ? fmtW(w) + ' W' : errors.has(dev.id) ? 'unreachable' : '···'}`;
            per.appendChild(div);
        });
    }

    renderFlow(a);

    // today
    $('tGen').textContent = fmtKwh(a.todayGen);
    setRow('rowTImp', 'tImp', a.todayImp, fmtKwh(a.todayImp));
    setRow('rowTExp', 'tExp', a.todayExp, fmtKwh(a.todayExp));
    setRow('rowTChg', 'tChg', a.todayChg, fmtKwh(a.todayChg));
    setRow('rowTDis', 'tDis', a.todayDis, fmtKwh(a.todayDis));
    setRow('rowTLoad', 'tLoad', a.todayLoad, fmtKwh(a.todayLoad));
    $('todayPerInv').textContent = a.rows.length > 1
        ? a.rows.map(({ dev, d }) => `${dev.name} ${d && d.today_kwh != null ? fmtKwh(d.today_kwh) : '···'}`).join(' · ') + ' kWh'
        : 'from the inverter\u2019s own daily counter';

    // battery
    if (a.bat) {
        $('socPct').textContent = a.bat.soc ?? '···';
        const fill = $('socFill');
        fill.style.width = (a.bat.soc ?? 0) + '%';
        fill.classList.toggle('low', (a.bat.soc ?? 100) < 20);
        const mode = MODE_WORDS[a.modeCode];
        const word = a.batW == null ? '···'
            : a.batW >= 25 ? `charging at ${flowFmt(a.batW)}`
                : a.batW <= -25 ? `discharging at ${flowFmt(-a.batW)}`
                    : 'idle';
        $('batWord').textContent = word + (mode ? ' · ' + mode + ' mode' : '');
        $('batVA').textContent = a.bat.v != null ? `${a.bat.v.toFixed(1)} V · ${(a.bat.a ?? 0).toFixed(1)} A` : '···';
        $('batSoh').textContent = a.bat.soh != null ? a.bat.soh + '%' : '···';
        $('batChg').textContent = fmtKwh(a.bat.today_chg);
        $('batDis').textContent = fmtKwh(a.bat.today_dis);
    }

    // grid & meter
    if (a.gridW != null) {
        $('gridW').textContent = fmtW(Math.abs(a.gridW));
        $('gridW').classList.toggle('exporting', a.gridW < -25);
        $('gridWord').textContent = a.gridW > 25 ? 'importing from the grid'
            : a.gridW < -25 ? 'exporting to the grid' : 'balanced with the grid';
    }
    $('gToday').textContent = a.todayImp != null || a.todayExp != null
        ? `${fmtKwh(a.todayImp)} / ${fmtKwh(a.todayExp)} kWh` : '···';
    $('gTotal').textContent = a.totImp != null || a.totExp != null
        ? `${fmtKwh(a.totImp)} / ${fmtKwh(a.totExp)} kWh` : '···';
    $('gMeter').textContent = a.meter && a.meter.v != null
        ? `${a.meter.v.toFixed(1)} V · ${(a.meter.hz ?? 0).toFixed(2)} Hz · pf ${(a.meter.pf ?? 0).toFixed(2)}`
        : '···';

    // house load
    $('loadW').textContent = a.loadW != null ? fmtW(a.loadW) : '···';
    $('backupW').textContent = a.backupW != null ? fmtW(a.backupW) : '···';
    $('loadToday').textContent = fmtKwh(a.todayLoad);
    $('loadTotal').textContent = fmtKwh(a.totLoad);

    renderInvCards(a);
    renderLoggers(a);

    // lifetime counters
    $('totGen').textContent = fmtKwh(a.totGen);
    setRow('rowTotGrid', 'totGrid', a.totImp ?? a.totExp, `${fmtKwh(a.totImp)} / ${fmtKwh(a.totExp)} kWh`);
    setRow('rowTotBat', 'totBat', a.totChg ?? a.totDis, `${fmtKwh(a.totChg)} / ${fmtKwh(a.totDis)} kWh`);
    $('totPerInv').textContent = a.rows.length > 1
        ? a.rows.map(({ dev, d }) => `${dev.name} ${d && d.total_kwh != null ? fmtKwh(d.total_kwh) : '···'}`).join(' · ') + ' kWh'
        : '';

    drawCharts(activeStore());
}

function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const KIND_BADGE = { hybrid: 'hybrid', string: 'string', logger: 'stick' };

function renderInvCards(a) {
    const box = $('invCards');
    box.innerHTML = '';
    a.rows.forEach(({ dev, d }) => {
        const card = document.createElement('article');
        card.className = 'invcard';
        const err = errors.get(dev.id);
        if (!d) {
            card.innerHTML = `<div class="invhead"><h3>${esc(dev.name)}</h3></div>
                <p class="invstatus ${err ? 'bad' : 'idle'}">${err ? esc(err) : 'waiting for a reading…'}</p>`;
            box.appendChild(card);
            return;
        }
        const status = d.kind === 'logger'
            ? (d.alarm && d.alarm !== 'No alarm' && d.alarm !== '' ? 'alarm: ' + esc(d.alarm) : 'reporting')
            : esc(statusWord(d.status_code) ?? 'reporting');
        const bad = /fault|alarm/.test(status);
        const rows = [];
        if (d.pac_w != null) rows.push(['AC power', fmtW(d.pac_w) + ' W']);
        if (d.today_kwh != null) rows.push(['Today · total', `${fmtKwh(d.today_kwh)} · ${fmtKwh(d.total_kwh)} kWh`]);
        if (d.ac_v != null) rows.push(['Grid side', `${d.ac_v.toFixed(1)} V · ${(d.hz ?? 0).toFixed(2)} Hz`]);
        if (d.temp_c != null) rows.push(['Temperature', d.temp_c.toFixed(1) + ' °C']);
        if (d.kind === 'hybrid' && d.bat.soc != null) {
            rows.push(['Battery', `${d.bat.soc}% · ${d.bat.w >= 0 ? 'charging' : 'discharging'} ${fmtW(Math.abs(d.bat.w ?? 0))} W`]);
        }
        if (d.kind === 'logger' && d.inv_sn) rows.push(['Inverter SN', esc(d.inv_sn)]);

        let pvRows = '';
        if (Array.isArray(d.pv)) {
            const watts = d.pv.map((s) => (s.v != null && s.i != null) ? s.v * s.i : null);
            const maxW = Math.max(3000, ...watts.filter((w) => w != null));
            pvRows = d.pv.map((s, i) => {
                if (s.v == null || !(s.v > 5)) return '';
                const w = watts[i] ?? 0;
                return `<div class="pvrow"><span class="pvl">PV${i + 1}</span>
                    <span class="pvbar"><span class="pvfill" style="width:${Math.min(100, w / maxW * 100)}%"></span></span>
                    <span class="pvv">${s.v.toFixed(0)} V · ${(s.i ?? 0).toFixed(1)} A</span></div>`;
            }).join('');
        }
        card.innerHTML = `<div class="invhead"><h3>${esc(dev.name)}</h3>
                <span class="invkind">${KIND_BADGE[d.kind] || esc(d.kind)}</span></div>
            <p class="invstatus${bad ? ' bad' : ''}">${status}</p>
            <dl class="kv">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
            ${pvRows}`;
        box.appendChild(card);
    });
}

function renderLoggers(a) {
    const list = $('loggerList');
    list.innerHTML = '';
    a.rows.forEach(({ dev, d }) => {
        const div = document.createElement('div');
        let text = '···';
        if (d && d.logger && (d.logger.sn || d.logger.ssid)) {
            const bits = [];
            if (d.logger.sn) bits.push('SN ' + esc(d.logger.sn));
            if (d.logger.ssid) bits.push(esc(d.logger.ssid) + (d.logger.rssi != null ? ` (${d.logger.rssi}%)` : ''));
            if (d.logger.fw) bits.push('fw ' + esc(d.logger.fw));
            text = bits.join(' · ');
        } else if (dev.mode) {
            text = demo.on ? 'demo stick' : `${dev.mode} · ${dev.host}:${dev.port || DEFAULT_PORTS[dev.mode]}`;
        }
        div.innerHTML = `<dt>${esc(dev.name)}</dt><dd>${text}</dd>`;
        list.appendChild(div);
    });
}

/* ---- canvas charts ----------------------------------------------------------- */
function canvasCtx(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return null;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w, h };
}

function themeVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function drawSpark() {
    const c = canvasCtx($('sparkCanvas'));
    if (!c || spark.length < 2) return;
    const { ctx, w, h } = c;
    const t0 = Date.now() - SPARK_WINDOW_MS, t1 = Date.now();
    let min = 0;
    let max = Math.max(100, ...spark.map((p) => p.w));
    max += max * 0.1;
    const x = (t) => (t - t0) / (t1 - t0) * w;
    const y = (v) => h - (v - min) / (max - min) * h;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = themeVar('--chart-gen'); ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.beginPath();
    spark.forEach((p, i) => { i ? ctx.lineTo(x(p.t), y(p.w)) : ctx.moveTo(x(p.t), y(p.w)); });
    ctx.stroke();
}

function drawBars(canvas, rows, labelOf) {
    const c = canvasCtx(canvas);
    if (!c) return;
    const { ctx, w, h } = c;
    ctx.clearRect(0, 0, w, h);
    ctx.font = '11px system-ui, sans-serif';
    if (rows.length < 1) {
        ctx.fillStyle = themeVar('--muted');
        ctx.textAlign = 'center';
        ctx.fillText('collecting history, come back after the first hour…', w / 2, h / 2);
        return;
    }
    const top = 14, bottom = 16;
    const maxGen = Math.max(0.01, ...rows.map((r) => r.gen));
    const maxExp = Math.max(0, ...rows.map((r) => r.exp));
    const span = maxGen + maxExp;
    const zeroY = top + (maxGen / span) * (h - top - bottom);
    const slot = w / rows.length;
    const bw = Math.max(2, Math.min(26, slot * 0.7));

    rows.forEach((r, i) => {
        const cx = slot * i + slot / 2;
        ctx.fillStyle = themeVar('--chart-gen');
        const gh = (r.gen / span) * (h - top - bottom);
        ctx.fillRect(cx - bw / 2, zeroY - gh, bw, gh);
        if (r.exp > 0.0005) {
            ctx.fillStyle = themeVar('--chart-exp');
            const eh = (r.exp / span) * (h - top - bottom);
            ctx.fillRect(cx - bw / 2, zeroY, bw, eh);
        }
    });
    ctx.strokeStyle = themeVar('--line');
    ctx.beginPath(); ctx.moveTo(0, zeroY); ctx.lineTo(w, zeroY); ctx.stroke();

    ctx.fillStyle = themeVar('--muted');
    ctx.textAlign = 'left';
    ctx.fillText(`▲ max ${fmtKwh(maxGen)} kWh`, 4, 11);
    ctx.fillText(labelOf(rows[0]), 4, h - 4);
    ctx.textAlign = 'right';
    if (maxExp > 0.0005) ctx.fillText(`▼ max ${fmtKwh(maxExp)} kWh`, w - 4, 11);
    ctx.fillText(labelOf(rows[rows.length - 1]), w - 4, h - 4);
}

function deltas(snaps, keyOf) {
    const out = [];
    for (let i = 1; i < snaps.length; i++) {
        const gen = snaps[i].gen - snaps[i - 1].gen;
        const exp = (snaps[i].exp || 0) - (snaps[i - 1].exp || 0);
        if (gen >= 0 && gen < 500) out.push({ key: keyOf(snaps[i]), gen, exp: Math.max(0, Math.min(exp, 500)) });
    }
    return out;
}

function drawCharts(store) {
    drawBars($('day24Canvas'),
        deltas(store.hourly.slice(-25), (s) => s.t).slice(-24),
        (r) => new Date(r.key).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    drawBars($('days30Canvas'),
        deltas(store.daily.slice(-31), (s) => s.d).slice(-30),
        (r) => r.key.slice(5));
}

/* ---- bridge channel ----------------------------------------------------------- */
const bridge = { ws: null, open: false, retryTimer: 0 };

function activeStore() { return demo.on ? demoStore : realStore; }

function connectBridge() {
    if (bridge.ws && (bridge.ws.readyState === 0 || bridge.ws.readyState === 1)) return;
    clearTimeout(bridge.retryTimer);
    let ws;
    try { ws = new WebSocket(BRIDGE_URL); } catch { bridgeDown(); return; }
    bridge.ws = ws;
    ws.onopen = () => {
        bridge.open = true;
        $('bridgeState').textContent = 'Relay: connected on 127.0.0.1:7102';
        sendWatch();
        refreshStatus();
    };
    ws.onmessage = (ev) => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch { return; }
        if (demo.on) return; // demo has the floor
        if (msg.type === 'data' && msg.data) {
            latest.set(msg.id, { data: msg.data, ts: Date.now() });
            errors.delete(msg.id);
            refreshStatus();
            renderFleet();
            recordHistory(realStore, lastAgg, new Date());
        } else if (msg.type === 'error') {
            errors.set(msg.id, msg.msg || 'unreachable');
            refreshStatus();
            if (latest.size) renderFleet();
        }
    };
    ws.onclose = () => bridgeDown();
    ws.onerror = () => { /* onclose follows */ };
}

function bridgeDown() {
    bridge.open = false;
    bridge.ws = null;
    $('bridgeState').textContent = 'Relay: not running (start solis-bridge.py)';
    refreshStatus();
    bridge.retryTimer = setTimeout(connectBridge, 10000);
}

function validDevices() {
    return settings.devices.filter((d) => d.host && d.host.trim());
}

function sendWatch() {
    if (!bridge.open) return;
    const devices = validDevices().map((d) => ({
        id: d.id, mode: d.mode, host: d.host.trim(), port: d.port || undefined,
        serial: d.serial || undefined, unit: d.unit || 1, kind: d.kind,
        user: d.user || undefined, pass: d.pass || undefined,
    }));
    bridge.ws.send(JSON.stringify({ cmd: 'watch', interval: settings.interval, devices }));
}

function refreshStatus() {
    if (demo.on) {
        setPill('demo', 'demo rooftop');
        $('fleetLine').textContent = 'pretend 3.6K hybrid + 4.6K string, stored separately';
        return;
    }
    if (!bridge.open) { setPill('off', 'relay offline'); $('fleetLine').textContent = 'start solis-bridge.py on this machine'; return; }
    const devs = validDevices();
    if (!devs.length) { setPill('idle', 'no inverters yet'); $('fleetLine').textContent = 'add your inverters in ⚙ Settings'; return; }
    const fresh = devs.filter((d) => latest.has(d.id) && Date.now() - latest.get(d.id).ts < STALE_MS).length;
    if (!fresh) { setPill('idle', 'waiting for readings…'); $('fleetLine').textContent = devs.map((d) => d.host).join(' · '); return; }
    setPill('on', 'live');
    $('fleetLine').textContent = `${fresh} of ${devs.length} inverter${devs.length > 1 ? 's' : ''} reporting`;
}

/* ---- demo mode ------------------------------------------------------------------ */
const demo = {
    on: false, timer: 0,
    devices: [
        { id: 'demoA', name: 'East roof (hybrid 3.6K)', mode: 'demo' },
        { id: 'demoB', name: 'West roof (string 4.6K)', mode: 'demo' },
    ],
    soc: 62, capWh: 7200,
    totA: 6421.4, totB: 8123.9, impT: 1450.2, expT: 2890.7, chgT: 812.3, disT: 790.1, loadT: 4302.6,
    day: '', tdA: 0, tdB: 0, tdImp: 0, tdExp: 0, tdChg: 0, tdDis: 0, tdLoad: 0,
};

function demoSun(hr, peakW) {
    const cloud = 0.72 + 0.28 * Math.sin(Date.now() / 47000);
    return Math.max(0, peakW * Math.exp(-((hr - 13.1) ** 2) / 7.5)) * cloud;
}

function seedDemoToday(now) {
    if (demo.day === dayKey(now)) return;
    demo.day = dayKey(now);
    const hr = now.getHours() + now.getMinutes() / 60;
    const f0 = Math.min(1, Math.max(0, (hr - 6.5) / 13.5));
    const f = f0 * f0 * (3 - 2 * f0); // how much of the solar day is behind us
    demo.tdA = 10.8 * f; demo.tdB = 13.9 * f;
    demo.tdExp = 7.6 * f; demo.tdChg = 4.4 * f;
    demo.tdImp = 1.9 * hr / 24; demo.tdDis = hr > 17 ? 2.1 * (hr - 17) / 6 : 0.3;
    demo.tdLoad = 9.8 * hr / 24;
}

function demoTick() {
    const now = new Date();
    const hr = now.getHours() + now.getMinutes() / 60;
    if (demo.day !== dayKey(now)) {
        demo.day = dayKey(now);
        demo.tdA = demo.tdB = demo.tdImp = demo.tdExp = demo.tdChg = demo.tdDis = demo.tdLoad = 0;
    }
    const solarA = demoSun(hr, 3050) + Math.random() * 40;
    const solarB = demoSun(hr, 3900) + Math.random() * 40;
    const evening = hr > 17.5 && hr < 23 ? 650 : 0;
    const morning = hr > 6.5 && hr < 9 ? 380 : 0;
    const spike = Math.random() < 0.05 ? 1200 + Math.random() * 1400 : 0;
    const load = Math.round(280 + evening + morning + spike + Math.random() * 60);

    let surplus = solarA + solarB - load;
    let batW = 0; // positive = charging
    if (surplus > 50 && demo.soc < 100) batW = Math.min(2800, surplus * 0.95);
    else if (surplus < -50 && demo.soc > 12) batW = Math.max(-3000, surplus * 0.95);
    const gridW = Math.round(load + batW - solarA - solarB); // positive = importing

    const dtH = Math.min(settings.interval, 5000) / 3600000;
    demo.soc = Math.min(100, Math.max(5, demo.soc + (batW * dtH) / demo.capWh * 100));
    demo.totA += solarA * dtH / 1000; demo.tdA += solarA * dtH / 1000;
    demo.totB += solarB * dtH / 1000; demo.tdB += solarB * dtH / 1000;
    if (gridW > 0) { demo.impT += gridW * dtH / 1000; demo.tdImp += gridW * dtH / 1000; }
    else { demo.expT += -gridW * dtH / 1000; demo.tdExp += -gridW * dtH / 1000; }
    if (batW > 0) { demo.chgT += batW * dtH / 1000; demo.tdChg += batW * dtH / 1000; }
    else { demo.disT += -batW * dtH / 1000; demo.tdDis += -batW * dtH / 1000; }
    demo.loadT += load * dtH / 1000; demo.tdLoad += load * dtH / 1000;

    const round1 = (v) => Math.round(v * 10) / 10;
    const batV = 51.2 + (demo.soc - 50) * 0.04;
    latest.set('demoA', {
        ts: Date.now(), data: {
            kind: 'hybrid',
            pdc_w: Math.round(solarA), pac_w: Math.round(solarA - batW),
            today_kwh: round1(demo.tdA), yesterday_kwh: 11.3, total_kwh: Math.round(demo.totA * 10) / 10,
            pv: [{ v: 342 + Math.random() * 6, i: solarA * 0.55 / 340 }, { v: 338 + Math.random() * 6, i: solarA * 0.45 / 338 }],
            ac_v: 231 + Math.random() * 3, ac_a: (solarA - batW) / 231, hz: 49.98 + Math.random() * 0.05,
            temp_c: 34 + solarA / 400, status_code: solarA > 20 ? 3 : 0, mode_code: 0x21,
            bat: {
                v: batV, a: batW / batV, w: Math.round(batW),
                soc: Math.round(demo.soc), soh: 99, bms_v: batV, bms_a: batW / batV,
                today_chg: round1(demo.tdChg), today_dis: round1(demo.tdDis),
                total_chg: Math.round(demo.chgT), total_dis: Math.round(demo.disT),
            },
            grid: {
                w: gridW, v: 230.4 + Math.random() * 2, a: gridW / 230, pf: 0.98, hz: 50,
                today_imp: round1(demo.tdImp), today_exp: round1(demo.tdExp),
                total_imp: Math.round(demo.impT), total_exp: Math.round(demo.expT),
            },
            load: {
                w: load, backup_w: 120, today_kwh: round1(demo.tdLoad), total_kwh: Math.round(demo.loadT),
            },
            logger: { sn: '1923456789', fw: 'MW_08_512_0501_1.94', ssid: 'Demo-WiFi', rssi: 82 },
        },
    });
    latest.set('demoB', {
        ts: Date.now(), data: {
            kind: 'string',
            pdc_w: Math.round(solarB * 1.03), pac_w: Math.round(solarB),
            today_kwh: round1(demo.tdB), yesterday_kwh: 14.8, total_kwh: Math.round(demo.totB * 10) / 10,
            pv: [{ v: 351 + Math.random() * 6, i: solarB * 0.5 / 350 }, { v: 347 + Math.random() * 6, i: solarB * 0.5 / 347 }],
            ac_v: 230 + Math.random() * 3, ac_a: solarB / 230, hz: 50.01 + Math.random() * 0.04,
            temp_c: 31 + solarB / 420, status_code: solarB > 20 ? 3 : 0,
            logger: { sn: '4031234567', fw: 'MW_08_512_0501_1.94', ssid: 'Demo-WiFi', rssi: 74 },
        },
    });
    renderFleet();
    recordHistory(demoStore, lastAgg, now);
    demo.timer = setTimeout(demoTick, Math.min(settings.interval, 5000));
}

function seedDemoHistory() {
    if (demoStore.daily.length > 5) return;
    demoStore.wipe();
    const now = new Date();
    let gen = demo.totA + demo.totB - 35 * 16, imp = demo.impT - 35 * 3.5, exp = demo.expT - 35 * 7;
    let chg = demo.chgT - 35 * 4, dis = demo.disT - 35 * 3.8;
    for (let d = 35; d >= 1; d--) {
        const day = new Date(now); day.setDate(day.getDate() - d); day.setHours(23, 59, 0, 0);
        const sunny = 0.4 + Math.random() * 0.6;
        gen += (6 + 14 * sunny);
        exp += (1 + 9 * sunny);
        imp += 2.2 + Math.random() * 2.5;
        chg += 3 + 2 * sunny; dis += 2.8 + 2 * sunny;
        demoStore.daily.push({ d: dayKey(day), gen, imp, exp, chg, dis });
    }
    let hGen = gen, hImp = imp, hExp = exp;
    for (let h = 48; h >= 1; h--) {
        const t = new Date(now); t.setMinutes(0, 0, 0); t.setHours(t.getHours() - h);
        const hr = t.getHours();
        const sun = Math.max(0, Math.exp(-((hr - 13) ** 2) / 7.5));
        hGen += sun * (4 + Math.random() * 2.5);
        hExp += sun > 0.4 ? sun * 2.6 * Math.random() : 0;
        hImp += hr > 17 || hr < 7 ? 0.25 + Math.random() * 0.3 : 0.05;
        demoStore.hourly.push({ t: t.getTime(), gen: hGen, imp: hImp, exp: hExp, chg, dis });
    }
    demo.totA = hGen * 0.44; demo.totB = hGen * 0.56;
    demo.impT = hImp; demo.expT = hExp;
    demoStore.persist(true);
}

function setDemo(on) {
    demo.on = on;
    $('btnDemo').setAttribute('aria-pressed', String(on));
    $('btnDemo').textContent = on ? '⏹ Stop the demo' : '▶ Try the demo';
    clearTimeout(demo.timer);
    spark.length = 0;
    latest.clear();
    errors.clear();
    if (on) { seedDemoHistory(); seedDemoToday(new Date()); demoTick(); }
    else if (realStore.daily.length === 0) { $('tiles').hidden = true; $('emptyState').hidden = false; }
    refreshStatus();
}

/* ---- settings UI ------------------------------------------------------------------ */
function applyTheme() {
    document.documentElement.dataset.theme = settings.theme;
    document.querySelectorAll('#themeGrid .swatch').forEach((b) =>
        b.setAttribute('aria-checked', String(b.dataset.theme === settings.theme)));
    if (lastAgg) { drawSpark(); drawCharts(activeStore()); }
}

function applyTiles() {
    document.querySelectorAll('#tiles [data-tile]').forEach((sec) => {
        sec.hidden = !settings.tiles.includes(sec.dataset.tile);
    });
    if (lastAgg) { drawSpark(); drawCharts(activeStore()); }
}

function histSummary() {
    const bytes = (localStorage.getItem('ss_hist_hourly') || '').length
        + (localStorage.getItem('ss_hist_daily') || '').length;
    $('histInfo').textContent =
        `${realStore.hourly.length} hourly + ${realStore.daily.length} daily snapshots, ${(bytes / 1024).toFixed(1)} KB of localStorage.`;
}

function devField(labelText, input, span2) {
    const l = document.createElement('label');
    l.className = 'field' + (span2 ? ' span2' : '');
    l.append(labelText, input);
    return l;
}

function renderDevList() {
    const box = $('devList');
    box.innerHTML = '';
    if (!settings.devices.length) {
        const p = document.createElement('p');
        p.className = 'fine';
        p.textContent = 'Nothing here yet: add one entry per inverter (or per datalogging stick).';
        box.appendChild(p);
    }
    settings.devices.forEach((dev) => {
        const row = document.createElement('div');
        row.className = 'devrow';

        const mk = (prop, attrs = {}) => {
            const el = document.createElement(attrs.tag || 'input');
            if (!attrs.tag) { el.type = 'text'; el.autocomplete = 'off'; el.spellcheck = false; }
            Object.assign(el, attrs.props || {});
            el.value = dev[prop] ?? '';
            el.addEventListener('change', () => {
                dev[prop] = attrs.num ? (parseInt(el.value, 10) || '') : el.value.trim();
                if (prop === 'host') dev.host = dev.host.replace(/^https?:\/\//, '').replace(/[/:].*$/, '');
                saveSettings(); renderDevList(); sendWatch(); refreshStatus();
            });
            return el;
        };
        const sel = (prop, options) => {
            const el = document.createElement('select');
            options.forEach(([v, label]) => {
                const o = document.createElement('option');
                o.value = v; o.textContent = label;
                el.appendChild(o);
            });
            el.value = dev[prop];
            el.addEventListener('change', () => {
                dev[prop] = el.value;
                saveSettings(); renderDevList(); sendWatch(); refreshStatus();
            });
            return el;
        };

        row.appendChild(devField('Name (for the tiles)', mk('name'), true));
        row.appendChild(devField('How it talks', sel('mode', MODES)));
        row.appendChild(devField('Model', sel('kind', KINDS)));
        row.appendChild(devField('IP address on your network', mk('host', { props: { placeholder: '192.168.1.60', inputMode: 'decimal' } })));
        row.appendChild(devField('Port (blank = default)', mk('port', { num: true, props: { placeholder: String(DEFAULT_PORTS[dev.mode] || '') } })));
        if (dev.mode === 'solarman') {
            row.appendChild(devField('Stick serial number (10 digits, on the label)', mk('serial', { props: { placeholder: '1712345678', inputMode: 'numeric' } }), true));
        }
        if (dev.mode !== 'http') {
            row.appendChild(devField('Modbus unit id', mk('unit', { num: true, props: { placeholder: '1', inputMode: 'numeric' } })));
        } else {
            row.appendChild(devField('Stick login', mk('user', { props: { placeholder: 'admin' } })));
            row.appendChild(devField('Stick password', mk('pass', { props: { placeholder: 'admin' } })));
        }
        const foot = document.createElement('div');
        foot.className = 'devfoot';
        const del = document.createElement('button');
        del.className = 'btn btn-ghost danger btn-mini';
        del.textContent = 'Remove';
        del.addEventListener('click', () => {
            settings.devices = settings.devices.filter((d) => d !== dev);
            latest.delete(dev.id); errors.delete(dev.id);
            saveSettings(); renderDevList(); sendWatch(); refreshStatus();
        });
        foot.appendChild(del);
        row.appendChild(foot);
        box.appendChild(row);
    });
}

function buildSettings() {
    const grid = $('themeGrid');
    THEMES.forEach(([id, label]) => {
        const b = document.createElement('button');
        b.className = 'swatch';
        b.dataset.theme = id;
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', String(settings.theme === id));
        b.innerHTML = `<span class="swatch-dot" data-t="${id}"></span>${label}`;
        b.addEventListener('click', () => { settings.theme = id; saveSettings(); applyTheme(); });
        grid.appendChild(b);
    });

    const toggles = $('tileToggles');
    TILES.forEach(([id, label]) => {
        const l = document.createElement('label');
        l.className = 'tiletoggle';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = settings.tiles.includes(id);
        cb.addEventListener('change', () => {
            settings.tiles = TILES.map(([t]) => t).filter((t) =>
                t === id ? cb.checked : settings.tiles.includes(t));
            saveSettings(); applyTiles();
        });
        l.append(cb, document.createTextNode(' ' + label));
        toggles.appendChild(l);
    });

    renderDevList();
    $('btnAddDev').addEventListener('click', () => {
        settings.devices.push({
            id: 'd' + Date.now().toString(36),
            name: `Inverter ${settings.devices.length + 1}`,
            mode: 'solarman', host: '', port: '', serial: '', unit: 1,
            kind: 'auto', user: 'admin', pass: 'admin',
        });
        saveSettings(); renderDevList(); refreshStatus();
    });

    $('setInterval').value = String(settings.interval);
    $('setInterval').addEventListener('change', () => {
        settings.interval = +$('setInterval').value;
        saveSettings(); sendWatch();
    });
    $('gridFlip').checked = !!settings.gridFlip;
    $('gridFlip').addEventListener('change', () => {
        settings.gridFlip = $('gridFlip').checked;
        saveSettings();
        if (lastAgg) renderFleet();
    });

    $('btnReconnect').addEventListener('click', connectBridge);
    $('btnExport').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify({
            exported: new Date().toISOString(),
            devices: settings.devices.map(({ pass, ...rest }) => rest),
            hourly: realStore.hourly, daily: realStore.daily,
        }, null, 1)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `sunseer-history-${dayKey(new Date())}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    });
    $('btnWipe').addEventListener('click', () => {
        if (!confirm('Delete all stored solar history from this browser?')) return;
        realStore.wipe(); realStore.persist(true); histSummary(); drawCharts(activeStore());
    });
}

function openSettings(open) {
    $('settingsVeil').hidden = !open;
    if (open) histSummary();
}

/* ---- boot --------------------------------------------------------------------------- */
function init() {
    applyTheme();
    applyTiles();
    buildSettings();
    refreshStatus();
    connectBridge();

    $('btnSettings').addEventListener('click', () => openSettings(true));
    $('btnCloseSettings').addEventListener('click', () => openSettings(false));
    $('settingsVeil').addEventListener('click', (e) => { if (e.target === $('settingsVeil')) openSettings(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') openSettings(false); });
    $('btnDemo').addEventListener('click', () => setDemo(!demo.on));

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { if (lastAgg) { drawSpark(); drawCharts(activeStore()); } }, 150);
    });

    // returning visitor with history: show the dashboard shell immediately
    if (realStore.daily.length) {
        $('emptyState').hidden = true;
        $('tiles').hidden = false;
        drawCharts(realStore);
    }
}

document.addEventListener('DOMContentLoaded', init);
