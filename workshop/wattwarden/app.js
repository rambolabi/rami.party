'use strict';

/* =========================================================================
   Wattwarden — a live dashboard for P1 smart meter dongles.

   Data path, tried in order:
   1. Direct fetch from this page to http://<meter>/api/v1/data. Works when
      the browser lets a page reach LAN devices (http-served copies, or
      Chromium's local-network-access permission via targetAddressSpace)
      AND the meter answers with CORS headers. Zero installs: right for a
      wall tablet.
   2. p1-bridge.py relaying over ws://127.0.0.1:7101 for browsers that
      block the direct path (mixed content / CORS). Loopback WebSockets are
      exempt: same pattern as ghosttooth and wakewand.

   History: counter snapshots in localStorage, hourly (14 days) and daily
   (400 days), drawn as bar charts. Demo mode uses its own storage prefix so
   pretend data never pollutes real history.
   ========================================================================= */

const BRIDGE_URL = 'ws://127.0.0.1:7101';
const HOURLY_KEEP = 14 * 24 + 2;
const DAILY_KEEP = 400;
const SPARK_WINDOW_MS = 10 * 60 * 1000;

const THEMES = [['ember', 'Ember'], ['aurora', 'Aurora'], ['paper', 'Paper'], ['contrast', 'Contrast']];
const TILES = [
    ['now', 'Right now'], ['today', 'Today'], ['day24', 'Last 24 hours'],
    ['days30', 'Last 30 days'], ['gas', 'Gas'], ['totals', 'Meter counters'],
    ['phases', 'Per phase'], ['lines', 'Voltage & current'], ['peak', 'Monthly peak'],
    ['water', 'Water'], ['quality', 'Connection & grid'],
];
const DEFAULT_TILES = ['now', 'today', 'day24', 'days30', 'gas', 'totals'];

const $ = (id) => document.getElementById(id);

/* ---- settings ------------------------------------------------------------ */
const settings = Object.assign(
    { host: '', interval: 5000, theme: 'ember', tiles: DEFAULT_TILES.slice(), keepAwake: true },
    JSON.parse(localStorage.getItem('ww_settings') || '{}'));

function saveSettings() {
    localStorage.setItem('ww_settings', JSON.stringify(settings));
}

/* ---- history store (real + demo live under different prefixes) ------------ */
function makeStore(prefix) {
    const read = (key) => JSON.parse(localStorage.getItem(prefix + key) || '[]');
    const store = {
        hourly: read('hourly'), // {t, imp, exp, gas}
        daily: read('daily'),   // {d, imp, exp, gas, water}
        base: JSON.parse(localStorage.getItem(prefix + 'base') || 'null'), // first reading of today
        lastPersist: 0,
        persist(force) {
            if (!force && Date.now() - store.lastPersist < 20000) return;
            store.lastPersist = Date.now();
            localStorage.setItem(prefix + 'hourly', JSON.stringify(store.hourly));
            localStorage.setItem(prefix + 'daily', JSON.stringify(store.daily));
            localStorage.setItem(prefix + 'base', JSON.stringify(store.base));
        },
        wipe() {
            ['hourly', 'daily', 'base'].forEach((k) => localStorage.removeItem(prefix + k));
            store.hourly = []; store.daily = []; store.base = null;
        },
    };
    return store;
}
const realStore = makeStore('ww_hist_');
const demoStore = makeStore('ww_demo_');

function dayKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function recordHistory(store, m, now) {
    const rollover = { hour: false, day: false };
    if (m.imp == null) return rollover;
    const snap = { imp: m.imp, exp: m.exp || 0, gas: m.gas, water: m.water };

    const hourT = new Date(now); hourT.setMinutes(0, 0, 0);
    const hLast = store.hourly[store.hourly.length - 1];
    if (hLast && hLast.t === hourT.getTime()) Object.assign(hLast, snap);
    else { store.hourly.push({ t: hourT.getTime(), ...snap }); rollover.hour = true; }
    if (store.hourly.length > HOURLY_KEEP) store.hourly.splice(0, store.hourly.length - HOURLY_KEEP);

    const dKey = dayKey(now);
    const dLast = store.daily[store.daily.length - 1];
    if (dLast && dLast.d === dKey) Object.assign(dLast, snap);
    else { store.daily.push({ d: dKey, ...snap }); rollover.day = true; }
    if (store.daily.length > DAILY_KEEP) store.daily.splice(0, store.daily.length - DAILY_KEEP);

    if (!store.base || store.base.d !== dKey) {
        // prefer yesterday's closing counters as today's baseline
        const prev = store.daily[store.daily.length - 2];
        store.base = (prev && m.imp - prev.imp >= 0 && m.imp - prev.imp < 200)
            ? { d: dKey, imp: prev.imp, exp: prev.exp, gas: prev.gas }
            : { d: dKey, imp: m.imp, exp: m.exp || 0, gas: m.gas };
    }
    // counters only ever count up; a regression means the meter was swapped or reset
    if (m.imp < store.base.imp || (m.gas != null && store.base.gas != null && m.gas < store.base.gas)) {
        store.base = { d: dKey, imp: m.imp, exp: m.exp || 0, gas: m.gas };
    }
    store.persist(rollover.hour || rollover.day);
    return rollover;
}

/* ---- reading normalisation ------------------------------------------------ */
function sumIf(...vals) {
    const present = vals.filter((v) => typeof v === 'number');
    return present.length ? present.reduce((a, b) => a + b, 0) : null;
}

function parseDsmrStamp(n) {
    if (n == null) return null;
    const s = String(n).padStart(12, '0');
    const d = new Date(2000 + +s.slice(0, 2), +s.slice(2, 4) - 1, +s.slice(4, 6),
        +s.slice(6, 8), +s.slice(8, 10), +s.slice(10, 12));
    return isNaN(d) ? null : d;
}

function normalise(raw) {
    const ext = Array.isArray(raw.external) ? raw.external : [];
    const gasExt = ext.find((e) => e.type === 'gas_meter');
    const waterExt = ext.find((e) => e.type === 'water_meter');
    return {
        power: raw.active_power_w ?? null,
        imp: raw.total_power_import_kwh
            ?? sumIf(raw.total_power_import_t1_kwh, raw.total_power_import_t2_kwh,
                raw.total_power_import_t3_kwh, raw.total_power_import_t4_kwh),
        exp: raw.total_power_export_kwh
            ?? sumIf(raw.total_power_export_t1_kwh, raw.total_power_export_t2_kwh,
                raw.total_power_export_t3_kwh, raw.total_power_export_t4_kwh),
        impT1: raw.total_power_import_t1_kwh, impT2: raw.total_power_import_t2_kwh,
        expT1: raw.total_power_export_t1_kwh, expT2: raw.total_power_export_t2_kwh,
        tariff: raw.active_tariff ?? null,
        phases: [raw.active_power_l1_w, raw.active_power_l2_w, raw.active_power_l3_w],
        volts: [raw.active_voltage_l1_v, raw.active_voltage_l2_v, raw.active_voltage_l3_v],
        amps: [raw.active_current_l1_a, raw.active_current_l2_a, raw.active_current_l3_a],
        gas: gasExt ? gasExt.value : raw.total_gas_m3,
        gasWhen: parseDsmrStamp(gasExt ? gasExt.timestamp : raw.gas_timestamp),
        water: waterExt ? waterExt.value : null,
        peakW: raw.montly_power_peak_w ?? raw.monthly_power_peak_w ?? null,
        peakWhen: parseDsmrStamp(raw.montly_power_peak_timestamp ?? raw.monthly_power_peak_timestamp),
        wifiSsid: raw.wifi_ssid, wifiPct: raw.wifi_strength,
        failsAny: raw.any_power_fail_count, failsLong: raw.long_power_fail_count,
        sags: sumIf(raw.voltage_sag_l1_count, raw.voltage_sag_l2_count, raw.voltage_sag_l3_count),
        swells: sumIf(raw.voltage_swell_l1_count, raw.voltage_swell_l2_count, raw.voltage_swell_l3_count),
        meterModel: raw.meter_model, smr: raw.smr_version,
    };
}

/* ---- formatting ------------------------------------------------------------ */
const fmtW = (w) => Math.round(w).toLocaleString('en-GB');
const fmtKwh = (v) => v == null ? '···' : v.toLocaleString('en-GB', { maximumFractionDigits: v < 10 ? 2 : 1 });
const fmtM3 = (v) => v == null ? '···' : v.toLocaleString('en-GB', { maximumFractionDigits: 3 });
const fmtTime = (d) => d ? d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '···';

function powerWord(w) {
    if (w < 0) return 'exporting to the grid ☀';
    if (w < 250) return 'quiet baseline hum';
    if (w < 900) return 'a normal busy household';
    if (w < 2500) return 'something big is heating';
    return 'heavy load right now';
}

/* ---- dashboard rendering ---------------------------------------------------- */
const spark = []; // {t, w}
let lastMetrics = null;

function setPill(state, text) {
    const el = $('connPill');
    el.className = 'pill ' + state;
    el.textContent = text;
}

function renderReading(m, store) {
    lastMetrics = m;
    $('emptyState').hidden = true;
    $('tiles').hidden = false;

    if (m.power != null) {
        $('nowW').textContent = fmtW(m.power);
        $('nowW').classList.toggle('exporting', m.power < 0);
        $('nowWord').textContent = powerWord(m.power);
        spark.push({ t: Date.now(), w: m.power });
        while (spark.length && spark[0].t < Date.now() - SPARK_WINDOW_MS) spark.shift();
        drawSpark();
    }
    const badge = $('tariffBadge');
    badge.hidden = m.tariff == null;
    if (m.tariff != null) badge.textContent = `tariff T${m.tariff}`;

    if (store.base) {
        $('todayImp').textContent = fmtKwh(m.imp != null ? m.imp - store.base.imp : null);
        $('todayExp').textContent = fmtKwh(m.exp != null ? m.exp - store.base.exp : null);
        $('todayGas').textContent = m.gas != null && store.base.gas != null ? fmtM3(m.gas - store.base.gas) : '···';
        $('todayGasRow').style.display = m.gas != null ? '' : 'none';
    }

    $('gasTotal').textContent = fmtM3(m.gas);
    $('gasWhen').textContent = fmtTime(m.gasWhen);
    $('impT1').textContent = fmtKwh(m.impT1);
    $('impT2').textContent = fmtKwh(m.impT2);
    $('expT1').textContent = fmtKwh(m.expT1);
    $('expT2').textContent = fmtKwh(m.expT2);

    const bars = $('phaseBars');
    bars.innerHTML = '';
    const present = m.phases.filter((p) => p != null);
    const maxP = Math.max(300, ...present.map((p) => Math.abs(p)));
    m.phases.forEach((p, i) => {
        if (p == null) return;
        const row = document.createElement('div');
        row.className = 'phaserow';
        row.innerHTML = `<span class="pl">L${i + 1}</span><span class="pbar"><span class="pfill${p < 0 ? ' neg' : ''}" style="width:${Math.min(100, Math.abs(p) / maxP * 100)}%"></span></span><span class="pv">${fmtW(p)} W</span>`;
        bars.appendChild(row);
    });

    const lines = $('lineList');
    lines.innerHTML = '';
    m.volts.forEach((v, i) => {
        if (v == null && m.amps[i] == null) return;
        const div = document.createElement('div');
        div.innerHTML = `<dt>L${i + 1}</dt><dd>${v != null ? v.toFixed(1) + ' V' : ''}${v != null && m.amps[i] != null ? ' · ' : ''}${m.amps[i] != null ? m.amps[i].toFixed(1) + ' A' : ''}</dd>`;
        lines.appendChild(div);
    });

    $('peakW').textContent = m.peakW != null ? fmtW(m.peakW) : '···';
    $('peakWhen').textContent = fmtTime(m.peakWhen);
    $('waterTotal').textContent = fmtM3(m.water);

    $('wifi').textContent = m.wifiSsid ? `${m.wifiSsid} (${m.wifiPct ?? '?'}%)` : '···';
    $('fails').textContent = m.failsAny != null ? `${m.failsAny} total · ${m.failsLong ?? 0} long` : '···';
    $('sags').textContent = m.sags != null ? `${m.sags} / ${m.swells ?? 0}` : '···';
    $('meterModel').textContent = m.meterModel ? `${m.meterModel} (DSMR ${(m.smr ?? 0) / 10})` : '···';

    drawCharts(store);
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
    const dataMin = Math.min(...spark.map((p) => p.w));
    let min = Math.min(0, dataMin);
    let max = Math.max(100, ...spark.map((p) => p.w));
    const pad = (max - min) * 0.1 || 50; min -= pad; max += pad;
    const x = (t) => (t - t0) / (t1 - t0) * w;
    const y = (v) => h - (v - min) / (max - min) * h;

    ctx.clearRect(0, 0, w, h);
    if (dataMin < 0) { // zero line when exporting
        ctx.strokeStyle = themeVar('--line'); ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(0, y(0)); ctx.lineTo(w, y(0)); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle = themeVar('--chart-imp'); ctx.lineWidth = 2; ctx.lineJoin = 'round';
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
    const maxImp = Math.max(0.01, ...rows.map((r) => r.imp));
    const maxExp = Math.max(0, ...rows.map((r) => r.exp));
    const span = maxImp + maxExp;
    const zeroY = top + (maxImp / span) * (h - top - bottom);
    const slot = w / rows.length;
    const bw = Math.max(2, Math.min(26, slot * 0.7));

    rows.forEach((r, i) => {
        const cx = slot * i + slot / 2;
        ctx.fillStyle = themeVar('--chart-imp');
        const ih = (r.imp / span) * (h - top - bottom);
        ctx.fillRect(cx - bw / 2, zeroY - ih, bw, ih);
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
    ctx.fillText(`▲ max ${fmtKwh(maxImp)} kWh`, 4, 11);
    ctx.fillText(labelOf(rows[0]), 4, h - 4);
    ctx.textAlign = 'right';
    if (maxExp > 0.0005) ctx.fillText(`▼ max ${fmtKwh(maxExp)} kWh`, w - 4, 11);
    ctx.fillText(labelOf(rows[rows.length - 1]), w - 4, h - 4);
}

function deltas(snaps, keyOf) {
    const out = [];
    for (let i = 1; i < snaps.length; i++) {
        const imp = snaps[i].imp - snaps[i - 1].imp;
        const exp = (snaps[i].exp || 0) - (snaps[i - 1].exp || 0);
        if (imp >= 0 && imp < 500) out.push({ key: keyOf(snaps[i]), imp, exp: Math.max(0, exp) });
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

/* ---- connection: direct browser fetch first, loopback relay fallback ------ */
const conn = { mode: null, token: 0, directErr: '', pollTimer: 0, reprobeTimer: 0, failStreak: 0 };
const bridge = { ws: null, open: false, retryTimer: 0 };

function activeStore() { return demo.on ? demoStore : realStore; }

async function directFetch(host) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), Math.min(4000, settings.interval));
    try {
        // targetAddressSpace lets Chromium ask for local-network permission
        // instead of hard-blocking mixed content; other browsers ignore it
        const res = await fetch(`http://${host}/api/v1/data`, {
            cache: 'no-store', signal: ctrl.signal, targetAddressSpace: 'private',
        });
        if (res.status === 403) throw new Error('the meter refused: enable Local API in the HomeWizard app');
        if (!res.ok) throw new Error(`meter answered HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        if (err.name === 'AbortError') throw new Error(`no reply from ${host}`);
        if (err.name === 'SyntaxError') throw new Error('the reply was not JSON (is this really a P1 meter?)');
        if (err instanceof TypeError) {
            throw new Error(location.protocol === 'https:'
                ? 'browser blocked the direct LAN connection (permission, mixed content or meter CORS)'
                : 'meter unreachable, or it does not allow browser access (CORS)');
        }
        throw err;
    } finally { clearTimeout(timer); }
}

function liveIngest(raw, via) {
    if (demo.on) return;
    setPill('on', 'live');
    $('meterLine').textContent = `${settings.host} · ${raw.wifi_ssid || 'meter online'} · ${via}`;
    const m = normalise(raw);
    recordHistory(realStore, m, new Date());
    renderReading(m, realStore);
}

async function directPollTick(token) {
    if (token !== conn.token || demo.on || conn.mode !== 'direct') return;
    try {
        const raw = await directFetch(settings.host);
        if (token !== conn.token) return;
        conn.failStreak = 0;
        liveIngest(raw, 'direct');
    } catch (err) {
        if (token !== conn.token) return;
        conn.failStreak++;
        if (conn.failStreak >= 3) { startConnection(); return; } // full re-probe, may fall back
        setPill('idle', 'retrying…');
        $('meterLine').textContent = err.message;
    }
    conn.pollTimer = setTimeout(() => directPollTick(token), settings.interval);
}

async function startConnection() {
    const token = ++conn.token;
    clearTimeout(conn.pollTimer);
    clearTimeout(conn.reprobeTimer);
    conn.mode = null;
    conn.failStreak = 0;
    if (demo.on || !settings.host) { refreshStatus(); updateConnDetail(); return; }
    setPill('idle', 'connecting…');
    $('meterLine').textContent = settings.host;
    try {
        const raw = await directFetch(settings.host);
        if (token !== conn.token) return;
        conn.mode = 'direct';
        conn.directErr = '';
        bridgeSend({ cmd: 'stop' });
        liveIngest(raw, 'direct');
        conn.pollTimer = setTimeout(() => directPollTick(token), settings.interval);
    } catch (err) {
        if (token !== conn.token) return;
        conn.directErr = err.message;
        conn.mode = 'bridge';
        bridgeSend({ cmd: 'watch', host: settings.host, interval: settings.interval });
        refreshStatus();
        // the direct path may start working later (permission granted, meter back online)
        conn.reprobeTimer = setTimeout(startConnection, 60000);
    }
    updateConnDetail();
}

function bridgeSend(obj) {
    if (bridge.open) bridge.ws.send(JSON.stringify(obj));
}

function connectBridge() {
    if (bridge.ws && (bridge.ws.readyState === 0 || bridge.ws.readyState === 1)) return;
    clearTimeout(bridge.retryTimer);
    let ws;
    try { ws = new WebSocket(BRIDGE_URL); } catch { bridgeDown(); return; }
    bridge.ws = ws;
    ws.onopen = () => {
        bridge.open = true;
        $('bridgeState').textContent = 'Relay: connected on 127.0.0.1:7101';
        if (conn.mode === 'bridge') bridgeSend({ cmd: 'watch', host: settings.host, interval: settings.interval });
        refreshStatus();
    };
    ws.onmessage = (ev) => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch { return; }
        if (demo.on || conn.mode !== 'bridge') return;
        if (msg.type === 'data' && msg.data) {
            liveIngest(msg.data, 'relay');
        } else if (msg.type === 'error') {
            setPill('off', 'meter unreachable');
            $('meterLine').textContent = msg.msg || '';
        }
    };
    ws.onclose = () => bridgeDown();
    ws.onerror = () => { /* onclose follows */ };
}

function bridgeDown() {
    bridge.open = false;
    bridge.ws = null;
    $('bridgeState').textContent = 'Relay: not running (start p1-bridge.py)';
    refreshStatus();
    bridge.retryTimer = setTimeout(connectBridge, 10000);
}

function refreshStatus() {
    if (demo.on) { setPill('demo', 'demo household'); $('meterLine').textContent = 'pretend data, stored separately'; return; }
    if (!settings.host) { setPill('idle', 'no meter address'); $('meterLine').textContent = 'set the meter IP in ⚙ Settings'; return; }
    if (conn.mode === 'direct') return; // live pill is set on each reading
    if (conn.mode === 'bridge' && !bridge.open) {
        setPill('off', 'no connection');
        $('meterLine').textContent = `${conn.directErr} · relay not running`;
        return;
    }
    setPill('idle', 'waiting for reading…');
    $('meterLine').textContent = settings.host;
}

function updateConnDetail() {
    const el = $('connDetail');
    if (!settings.host) { el.textContent = 'Direct connection: enter a meter address first.'; return; }
    el.textContent = conn.mode === 'direct'
        ? 'Direct connection: working, no relay needed.'
        : `Direct connection failed: ${conn.directErr || 'not tried yet'}. Falling back to the relay.`;
}

/* ---- keep the screen awake (wall tablet mode) ------------------------------ */
const wake = { sentinel: null };

async function applyWakeLock() {
    if (!('wakeLock' in navigator)) {
        $('wakeState').textContent = 'This browser has no wake-lock support; set the device\u2019s screen timeout instead.';
        return;
    }
    if (settings.keepAwake && !wake.sentinel && document.visibilityState === 'visible') {
        try {
            wake.sentinel = await navigator.wakeLock.request('screen');
            wake.sentinel.addEventListener('release', () => { wake.sentinel = null; });
        } catch (err) {
            $('wakeState').textContent = `Wake lock refused (${err.name}); the OS may be saving battery.`;
            return;
        }
    }
    if (!settings.keepAwake && wake.sentinel) {
        wake.sentinel.release();
        wake.sentinel = null;
    }
    $('wakeState').textContent = wake.sentinel
        ? 'The screen will stay awake while this tab is visible.'
        : 'The screen may turn off on its own schedule.';
}

/* ---- demo mode ------------------------------------------------------------------ */
const demo = { on: false, timer: 0, lastAt: 0, imp: 8421.337, exp: 1204.5, gas: 3111.25, water: 512.4, peak: 0 };

function demoRaw(now) {
    const hr = now.getHours() + now.getMinutes() / 60;
    const dow = now.getDay();
    const dtH = demo.lastAt ? (+now - demo.lastAt) / 3600000 : 0;
    demo.lastAt = +now;
    const fridge = (Math.sin(now.getTime() / 300000) > 0.2) ? 85 : 0;
    const evening = hr > 17 && hr < 23 ? 320 : 0;
    const morning = hr > 6.5 && hr < 9 ? 240 : 0;
    const spike = Math.random() < 0.06 ? 1400 + Math.random() * 1600 : 0;
    const solar = Math.max(0, 2600 * Math.exp(-((hr - 13.2) ** 2) / 6)) * (0.55 + Math.random() * 0.25);
    const load = 165 + fridge + evening + morning + spike + Math.random() * 60;
    const power = Math.round(load - solar);

    if (power > 0) demo.imp += power * dtH / 1000; else demo.exp += -power * dtH / 1000;
    if ((hr > 6 && hr < 9) || (hr > 17 && hr < 22)) demo.gas += 0.12 * dtH;
    demo.water += 0.9 * dtH;
    demo.peak = Math.max(demo.peak, power > 0 ? power : 0);
    const tariff = (dow >= 1 && dow <= 5 && hr >= 7 && hr < 21) ? 2 : 1;

    const l1 = Math.round(power * 0.55), l2 = Math.round(power * 0.25);
    return {
        wifi_ssid: 'Demo-WiFi', wifi_strength: 88,
        meter_model: 'ISKRA 2M550T-101', smr_version: 50, active_tariff: tariff,
        total_power_import_kwh: demo.imp,
        total_power_import_t1_kwh: demo.imp * 0.44, total_power_import_t2_kwh: demo.imp * 0.56,
        total_power_export_kwh: demo.exp,
        total_power_export_t1_kwh: demo.exp * 0.4, total_power_export_t2_kwh: demo.exp * 0.6,
        active_power_w: power, active_power_l1_w: l1, active_power_l2_w: l2,
        active_power_l3_w: power - l1 - l2,
        active_voltage_l1_v: 229 + Math.random() * 4, active_voltage_l2_v: 231 + Math.random() * 4,
        active_voltage_l3_v: 230 + Math.random() * 4,
        active_current_l1_a: Math.abs(l1) / 230, active_current_l2_a: Math.abs(l2) / 230,
        active_current_l3_a: Math.abs(power - l1 - l2) / 230,
        any_power_fail_count: 4, long_power_fail_count: 1,
        voltage_sag_l1_count: 2, voltage_swell_l1_count: 0,
        montly_power_peak_w: Math.max(2140, demo.peak),
        montly_power_peak_timestamp: 260803081500,
        total_gas_m3: demo.gas, gas_timestamp: 260821143000,
        external: [{ type: 'water_meter', value: demo.water, unit: 'm3', timestamp: 260821143000 }],
    };
}

function seedDemoHistory() {
    if (demoStore.daily.length > 5) return;
    demoStore.wipe();
    const now = new Date();
    let imp = demo.imp - 35 * 9, exp = demo.exp - 35 * 4, gas = demo.gas - 35 * 1.1;
    for (let d = 35; d >= 1; d--) {
        const day = new Date(now); day.setDate(day.getDate() - d); day.setHours(23, 59, 0, 0);
        const weekend = day.getDay() === 0 || day.getDay() === 6;
        imp += 7 + Math.random() * 4 + (weekend ? 2 : 0);
        exp += 2.5 + Math.random() * 3.5;
        gas += 0.8 + Math.random() * 0.7;
        demoStore.daily.push({ d: dayKey(day), imp, exp, gas, water: demo.water - d * 0.11 });
    }
    let hImp = imp, hExp = exp, hGas = gas;
    for (let h = 48; h >= 1; h--) {
        const t = new Date(now); t.setMinutes(0, 0, 0); t.setHours(t.getHours() - h);
        const hr = t.getHours();
        hImp += hr > 6 && hr < 23 ? 0.25 + Math.random() * 0.5 : 0.08;
        hExp += hr > 9 && hr < 17 ? 0.3 + Math.random() * 0.4 : 0;
        hGas += (hr > 6 && hr < 9) || (hr > 17 && hr < 22) ? 0.1 : 0.005;
        demoStore.hourly.push({ t: t.getTime(), imp: hImp, exp: hExp, gas: hGas });
    }
    demo.imp = hImp; demo.exp = hExp; demo.gas = hGas;
    demoStore.persist(true);
}

function demoTick() {
    const m = normalise(demoRaw(new Date()));
    recordHistory(demoStore, m, new Date());
    renderReading(m, demoStore);
    demo.timer = setTimeout(demoTick, Math.min(settings.interval, 5000));
}

function setDemo(on) {
    demo.on = on;
    $('btnDemo').setAttribute('aria-pressed', String(on));
    $('btnDemo').textContent = on ? '⏹ Stop the demo' : '▶ Try the demo';
    clearTimeout(demo.timer);
    spark.length = 0;
    demo.lastAt = 0;
    if (on) {
        clearTimeout(conn.pollTimer);
        clearTimeout(conn.reprobeTimer);
        conn.mode = null;
        bridgeSend({ cmd: 'stop' });
        refreshStatus();
        seedDemoHistory();
        demoTick();
    } else {
        if (realStore.daily.length === 0) { $('tiles').hidden = true; $('emptyState').hidden = false; }
        startConnection();
    }
}

/* ---- settings UI ------------------------------------------------------------------ */
function applyTheme() {
    document.documentElement.dataset.theme = settings.theme;
    document.querySelectorAll('#themeGrid .swatch').forEach((b) =>
        b.setAttribute('aria-checked', String(b.dataset.theme === settings.theme)));
    if (lastMetrics) { drawSpark(); drawCharts(activeStore()); }
}

function applyTiles() {
    document.querySelectorAll('#tiles [data-tile]').forEach((sec) => {
        sec.hidden = !settings.tiles.includes(sec.dataset.tile);
    });
}

function histSummary() {
    const bytes = (localStorage.getItem('ww_hist_hourly') || '').length
        + (localStorage.getItem('ww_hist_daily') || '').length;
    $('histInfo').textContent =
        `${realStore.hourly.length} hourly + ${realStore.daily.length} daily snapshots, ${(bytes / 1024).toFixed(1)} KB of localStorage.`;
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

    $('setHost').value = settings.host;
    $('setInterval').value = String(settings.interval);
    $('setHost').addEventListener('change', () => {
        settings.host = $('setHost').value.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        $('setHost').value = settings.host;
        saveSettings(); startConnection();
    });
    $('setInterval').addEventListener('change', () => {
        settings.interval = +$('setInterval').value;
        saveSettings(); startConnection();
    });

    $('setAwake').checked = !!settings.keepAwake;
    $('setAwake').addEventListener('change', () => {
        settings.keepAwake = $('setAwake').checked;
        saveSettings(); applyWakeLock();
    });

    $('btnReconnect').addEventListener('click', () => { connectBridge(); startConnection(); });
    $('btnExport').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify({
            exported: new Date().toISOString(),
            settings: { host: settings.host, interval: settings.interval },
            hourly: realStore.hourly, daily: realStore.daily,
        }, null, 1)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `wattwarden-history-${dayKey(new Date())}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    });
    $('btnWipe').addEventListener('click', () => {
        if (!confirm('Delete all stored meter history from this browser?')) return;
        realStore.wipe(); realStore.persist(true); histSummary(); drawCharts(activeStore());
    });
}

function openSettings(open) {
    $('settingsVeil').hidden = !open;
    if (open) { histSummary(); $('setHost').focus(); }
}

/* ---- boot --------------------------------------------------------------------------- */
function init() {
    applyTheme();
    applyTiles();
    buildSettings();
    refreshStatus();
    connectBridge();
    startConnection();
    applyWakeLock();
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') applyWakeLock();
    });

    $('btnSettings').addEventListener('click', () => openSettings(true));
    $('btnCloseSettings').addEventListener('click', () => openSettings(false));
    $('settingsVeil').addEventListener('click', (e) => { if (e.target === $('settingsVeil')) openSettings(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') openSettings(false); });
    $('btnDemo').addEventListener('click', () => setDemo(!demo.on));

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { if (lastMetrics) { drawSpark(); drawCharts(activeStore()); } }, 150);
    });

    // returning visitor with history: show the dashboard shell immediately
    if (realStore.daily.length) {
        $('emptyState').hidden = true;
        $('tiles').hidden = false;
        drawCharts(realStore);
    }
}

document.addEventListener('DOMContentLoaded', init);
