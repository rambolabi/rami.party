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
   (400 days), incl. per-tariff counters so costs stay honest. Demo mode
   uses its own storage prefix so pretend data never pollutes real history.
   The feature backlog lives in todo-features.md.
   ========================================================================= */

const BRIDGE_URL = 'ws://127.0.0.1:7101';
const HOURLY_KEEP = 14 * 24 + 2;
const DAILY_KEEP = 400;

const THEMES = [
    ['ember', 'Ember'], ['aurora', 'Aurora'], ['paper', 'Paper'], ['contrast', 'Contrast'],
    ['solar', 'Solar'], ['oled', 'OLED black'], ['nord', 'Nord'],
];
const TILES = [
    ['now', 'Right now'], ['today', 'Today'], ['costs', 'Costs'], ['stats', "Today's shape"],
    ['compare', 'Compare'], ['flow', 'Power flow'], ['hour60', 'Last 60 minutes'],
    ['day24', 'Last 24 hours'], ['history', 'History'], ['gas', 'Gas'], ['totals', 'Meter counters'],
    ['phases', 'Per phase'], ['lines', 'Voltage & current'], ['peak', 'Monthly peak'],
    ['water', 'Water'], ['eco', 'Footprint'], ['quality', 'Connection & grid'],
];
const DEFAULT_TILES = ['now', 'today', 'costs', 'stats', 'hour60', 'day24', 'history', 'gas', 'totals'];
const CURRENCIES = ['€', '£', '$', 'kr', 'CHF'];
const VOLT_LOW = 207, VOLT_HIGH = 253; // EN 50160 ±10%

const $ = (id) => document.getElementById(id);

/* ---- settings ------------------------------------------------------------ */
const DEFAULTS = {
    host: '', interval: 5000, pauseHidden: false,
    theme: 'ember', accent: '', scale: 100, density: false, unitsKw: true,
    clock: false, sparkMin: 10, histPeriod: '30d', wideScreen: false,
    tiles: DEFAULT_TILES.slice(), order: TILES.map(([t]) => t),
    keepAwake: true, dimOn: false, dimFrom: '23:00', dimTo: '06:30', dimLevel: 70,
    currency: '€', dualPrices: false, priceImp: 0.30, priceImpT1: 0.28, priceImpT2: 0.32,
    priceExp: 0.05, priceGas: 1.20, priceWater: 1.05, standingDay: 0.65,
    co2Kwh: 300, co2Gas: 1780,
    alertsOn: true, alertW: 4000, alertOffline: true, alertVolts: true,
    alertPeakGuard: false, peakMargin: 10, fuseA: 25, alertSound: false, alertNotify: false,
};
const settings = Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem('ww_settings') || '{}'));
(function migrateSettings() {
    const ids = TILES.map(([t]) => t);
    settings.tiles = (settings.tiles || [])
        .map((t) => (t === 'days30' ? 'history' : t))
        .filter((t) => ids.includes(t));
    if (!settings.tiles.length) settings.tiles = DEFAULT_TILES.slice();
    settings.order = (settings.order || []).filter((t) => ids.includes(t));
    ids.forEach((t) => { if (!settings.order.includes(t)) settings.order.push(t); });
    // one-time: slot the 60-minute chart in front of the 24-hour one for older setups
    if (!settings.migr60) {
        settings.migr60 = true;
        if (settings.tiles.includes('day24') && !settings.tiles.includes('hour60')) {
            settings.tiles.splice(settings.tiles.indexOf('day24'), 0, 'hour60');
        }
        settings.order = settings.order.filter((t) => t !== 'hour60');
        const oi = settings.order.indexOf('day24');
        settings.order.splice(oi < 0 ? settings.order.length : oi, 0, 'hour60');
        saveSettings();
    }
})();

function saveSettings() {
    localStorage.setItem('ww_settings', JSON.stringify(settings));
}

/* ---- history store (real + demo live under different prefixes) ------------ */
function makeStore(prefix) {
    const read = (key, fb) => JSON.parse(localStorage.getItem(prefix + key) || fb);
    const store = {
        hourly: read('hourly', '[]'), // {t, imp, exp, gas, water, it1, it2}
        daily: read('daily', '[]'),   // {d, imp, exp, gas, water, it1, it2}
        base: read('base', 'null'),   // today's baseline counters
        stats: read('stats', 'null'), // {d, maxW, maxAt, minW, sum, n}
        lastPersist: 0,
        persist(force) {
            if (!force && Date.now() - store.lastPersist < 20000) return;
            store.lastPersist = Date.now();
            localStorage.setItem(prefix + 'hourly', JSON.stringify(store.hourly));
            localStorage.setItem(prefix + 'daily', JSON.stringify(store.daily));
            localStorage.setItem(prefix + 'base', JSON.stringify(store.base));
            localStorage.setItem(prefix + 'stats', JSON.stringify(store.stats));
        },
        wipe() {
            ['hourly', 'daily', 'base', 'stats'].forEach((k) => localStorage.removeItem(prefix + k));
            store.hourly = []; store.daily = []; store.base = null; store.stats = null;
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
    if (m.imp == null) return;
    const snap = { imp: m.imp, exp: m.exp || 0, gas: m.gas, water: m.water, it1: m.impT1, it2: m.impT2 };
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

    if (!store.base || store.base.d !== dKey) {
        // prefer yesterday's closing counters as today's baseline
        const prev = store.daily[store.daily.length - 2];
        store.base = (prev && m.imp - prev.imp >= 0 && m.imp - prev.imp < 200)
            ? { d: dKey, imp: prev.imp, exp: prev.exp, gas: prev.gas, it1: prev.it1, it2: prev.it2 }
            : { d: dKey, imp: m.imp, exp: m.exp || 0, gas: m.gas, it1: m.impT1, it2: m.impT2 };
    }
    // counters only ever count up; a regression means the meter was swapped or reset
    if (m.imp < store.base.imp || (m.gas != null && store.base.gas != null && m.gas < store.base.gas)) {
        store.base = { d: dKey, imp: m.imp, exp: m.exp || 0, gas: m.gas, it1: m.impT1, it2: m.impT2 };
    }

    if (m.power != null) {
        if (!store.stats || store.stats.d !== dKey) {
            store.stats = { d: dKey, maxW: m.power, maxAt: +now, minW: m.power, sum: 0, n: 0 };
        }
        const st = store.stats;
        if (m.power > st.maxW) { st.maxW = m.power; st.maxAt = +now; }
        if (m.power < st.minW) st.minW = m.power;
        st.sum += m.power; st.n++;
    }
    store.persist(force);
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
        avgW: raw.active_power_average_w ?? null,
        freq: raw.active_frequency_hz ?? null,
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
const fmtKwh = (v) => v == null ? '···' : v.toLocaleString('en-GB', { maximumFractionDigits: Math.abs(v) < 10 ? 2 : 1 });
const fmtM3 = (v) => v == null ? '···' : v.toLocaleString('en-GB', { maximumFractionDigits: 3 });
const fmtTime = (d) => d ? d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '···';
const fmtClock = (d) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

function fmtPowerParts(w) {
    if (settings.unitsKw && Math.abs(w) >= 1000) return [(w / 1000).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 'kW'];
    return [fmtW(w), 'W'];
}
const fmtPower = (w) => w == null ? '···' : fmtPowerParts(w).join(' ');
const money = (v) => v == null ? '···' : `${settings.currency} ${v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function powerWord(w) {
    if (w < 0) return 'exporting to the grid ☀';
    if (w < 250) return 'quiet baseline hum';
    if (w < 900) return 'a normal busy household';
    if (w < 2500) return 'something big is heating';
    return 'heavy load right now';
}

/* ---- costs ------------------------------------------------------------------ */
function costOfDelta(d) {
    // d: {imp, exp, gas, it1, it2} deltas; per-tariff when both stored, else blended
    let c = 0;
    if (settings.dualPrices && d.it1 != null && d.it2 != null) {
        c += d.it1 * settings.priceImpT1 + d.it2 * settings.priceImpT2;
    } else {
        c += (d.imp || 0) * settings.priceImp;
    }
    c -= (d.exp || 0) * settings.priceExp;
    if (d.gas > 0) c += d.gas * settings.priceGas;
    if (d.water > 0) c += d.water * settings.priceWater;
    return c;
}

function todayDelta(store, m) {
    const b = store.base;
    if (!b || m.imp == null) return null;
    return {
        imp: m.imp - b.imp, exp: (m.exp || 0) - (b.exp || 0),
        gas: m.gas != null && b.gas != null ? m.gas - b.gas : 0,
        it1: m.impT1 != null && b.it1 != null ? m.impT1 - b.it1 : null,
        it2: m.impT2 != null && b.it2 != null ? m.impT2 - b.it2 : null,
    };
}

function dailyDeltas(store) {
    return deltas(store.daily, (s) => s.d);
}

function monthTotals(store, m) {
    // sum of daily deltas grouped per YYYY-MM, current month topped up with today
    const rows = dailyDeltas(store);
    const map = new Map();
    rows.forEach((r) => {
        const k = r.key.slice(0, 7);
        const acc = map.get(k) || { key: k, imp: 0, exp: 0, gas: 0, it1: 0, it2: 0, days: 0 };
        acc.imp += r.imp; acc.exp += r.exp; acc.gas += r.gas || 0;
        acc.it1 += r.it1 || 0; acc.it2 += r.it2 || 0; acc.days++;
        map.set(k, acc);
    });
    const t = m ? todayDelta(activeStore(), m) : null;
    if (t) {
        const k = dayKey(new Date()).slice(0, 7);
        const acc = map.get(k) || { key: k, imp: 0, exp: 0, gas: 0, it1: 0, it2: 0, days: 0 };
        acc.imp += t.imp; acc.exp += t.exp; acc.gas += t.gas || 0;
        acc.it1 += t.it1 || 0; acc.it2 += t.it2 || 0; acc.days++;
        map.set(k, acc);
    }
    return map;
}

/* ---- dashboard rendering ---------------------------------------------------- */
// spark: {t, w} samples kept for 60 min; persisted so reloads keep the hour chart
const spark = JSON.parse(localStorage.getItem('ww_spark') || '[]')
    .filter((p) => p && typeof p.w === 'number' && p.t >= Date.now() - 60 * 60000);
let sparkSavedAt = 0;
let lastMetrics = null;
let lastRaw = null;
let lastReadingAt = 0;
let lastVia = '';
let lastLatency = null;

function setPill(state, text) {
    const el = $('connPill');
    el.className = 'pill ' + state;
    el.textContent = text;
}

function renderReading(m, store) {
    lastMetrics = m;
    $('emptyState').hidden = true;
    $('tiles').hidden = false;

    renderNow(m);
    renderToday(m, store);
    renderCosts(m, store);
    renderStats(m, store);
    renderCompare(m, store);
    renderFlow(m);
    renderSimple(m);
    renderQuality(m);
    renderEco(m, store);
    drawCharts(store);
    checkAlerts(m);
    if ($('settingsVeil') && !$('settingsVeil').hidden) refreshRawBox();
}

function renderNow(m) {
    if (m.power == null) return;
    const [num, unit] = fmtPowerParts(m.power);
    $('nowW').textContent = num;
    $('nowUnit').textContent = unit;
    $('nowW').classList.toggle('exporting', m.power < 0);
    $('nowWord').textContent = powerWord(m.power);
    const badge = $('tariffBadge');
    badge.hidden = m.tariff == null;
    if (m.tariff != null) badge.textContent = `tariff T${m.tariff}`;

    const ceiling = Math.max(settings.alertW || 0, 3000);
    const fill = $('powerFill');
    fill.style.width = `${Math.min(100, Math.abs(m.power) / ceiling * 100)}%`;
    fill.classList.toggle('neg', m.power < 0);

    spark.push({ t: Date.now(), w: m.power });
    while (spark.length && spark[0].t < Date.now() - 60 * 60000) spark.shift();
    if (!demo.on && Date.now() - sparkSavedAt > 20000) {
        sparkSavedAt = Date.now();
        localStorage.setItem('ww_spark', JSON.stringify(spark));
    }
    drawSpark();
    drawHour();
}

function renderToday(m, store) {
    const t = todayDelta(store, m);
    if (!t) return;
    $('todayImp').textContent = fmtKwh(t.imp);
    $('todayExp').textContent = fmtKwh(t.exp);
    $('todayGas').textContent = m.gas != null ? fmtM3(t.gas) : '···';
    $('todayGasRow').style.display = m.gas != null ? '' : 'none';
    $('todayNet').textContent = fmtKwh(t.imp - t.exp);
}

function renderCosts(m, store) {
    const t = todayDelta(store, m);
    if (!t) return;
    const today = costOfDelta(t) + settings.standingDay;
    $('costToday').textContent = money(today);

    const months = monthTotals(store, m);
    const nowD = new Date();
    const thisKey = dayKey(nowD).slice(0, 7);
    const cur = months.get(thisKey);
    if (cur) {
        const daysElapsed = nowD.getDate();
        const monthCost = costOfDelta(cur) + settings.standingDay * daysElapsed;
        $('costMonth').textContent = money(monthCost);
        const daysInMonth = new Date(nowD.getFullYear(), nowD.getMonth() + 1, 0).getDate();
        $('costProject').textContent = `± ${money(monthCost / daysElapsed * daysInMonth)}`;
    } else {
        $('costMonth').textContent = '···';
        $('costProject').textContent = '···';
    }
    $('costNote').textContent = `today, incl. ${money(settings.standingDay)} standing charge`;
}

function renderStats(m, store) {
    const st = store.stats;
    if (!st || !st.n) return;
    $('statMax').textContent = `${fmtPower(st.maxW)} at ${new Date(st.maxAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    $('statMin').textContent = fmtPower(st.minW);
    $('statAvg').textContent = fmtPower(st.sum / st.n);
    const base = Math.max(0, st.minW);
    $('statBase').textContent = fmtPower(base);
    $('baseCost').textContent = money(base * 24 * 365 / 1000 * settings.priceImp);
}

function renderCompare(m, store) {
    const t = todayDelta(store, m);
    $('cmpToday').textContent = t ? `${fmtKwh(t.imp)} kWh` : '···';
    const rows = dailyDeltas(store);
    const y = rows[rows.length - 1]; // last full day-to-day delta (yesterday)
    $('cmpYesterday').textContent = y ? `${fmtKwh(y.imp)} kWh` : '···';
    if (rows.length >= 7) {
        const wk = rows.slice(-7).reduce((a, r) => a + r.imp, 0) / 7;
        $('cmpWeek').textContent = `${fmtKwh(wk)} kWh`;
    } else { $('cmpWeek').textContent = '···'; }
    const months = monthTotals(store, m);
    const nowD = new Date();
    const thisKey = dayKey(nowD).slice(0, 7);
    const lastD = new Date(nowD.getFullYear(), nowD.getMonth() - 1, 15);
    const lastKey = dayKey(lastD).slice(0, 7);
    const cur = months.get(thisKey), prev = months.get(lastKey);
    $('cmpMonth').textContent = cur ? `${fmtKwh(cur.imp)} kWh` : '···';
    $('cmpLastMonth').textContent = prev ? `${fmtKwh(prev.imp)} kWh` : '···';
}

function renderFlow(m) {
    if (m.power == null) return;
    const box = $('flowBox');
    const exporting = m.power < 0;
    box.classList.toggle('rev', exporting);
    box.classList.toggle('idle', Math.abs(m.power) < 15);
    $('flowNote').textContent = Math.abs(m.power) < 15
        ? 'nearly nothing moving'
        : exporting
            ? `feeding ${fmtPower(-m.power)} back to the grid`
            : `drawing ${fmtPower(m.power)} from the grid`;
}

function renderSimple(m) {
    $('gasTotal').textContent = fmtM3(m.gas);
    $('gasWhen').textContent = fmtTime(m.gasWhen);
    $('impT1').textContent = fmtKwh(m.impT1);
    $('impT2').textContent = fmtKwh(m.impT2);
    $('expT1').textContent = fmtKwh(m.expT1);
    $('expT2').textContent = fmtKwh(m.expT2);
    $('peakW').textContent = m.peakW != null ? fmtW(m.peakW) : '···';
    $('peakWhen').textContent = fmtTime(m.peakWhen);
    $('waterTotal').textContent = fmtM3(m.water);

    const bars = $('phaseBars');
    bars.innerHTML = '';
    const present = m.phases.filter((p) => p != null);
    const maxP = Math.max(300, ...present.map((p) => Math.abs(p)));
    m.phases.forEach((p, i) => {
        if (p == null) return;
        const row = document.createElement('div');
        row.className = 'phaserow';
        row.dataset.info = `Power on phase L${i + 1} right now. Negative means this phase is feeding the grid.`;
        row.innerHTML = `<span class="pl">L${i + 1}</span><span class="pbar"><span class="pfill${p < 0 ? ' neg' : ''}" style="width:${Math.min(100, Math.abs(p) / maxP * 100)}%"></span></span><span class="pv">${fmtW(p)} W</span>`;
        bars.appendChild(row);
    });
    const hot = m.amps.some((a) => a != null && settings.fuseA > 0 && a >= settings.fuseA * 0.9);
    $('phaseNote').hidden = !hot;
    if (hot) $('phaseNote').textContent = `⚠ a phase is near your ${settings.fuseA} A main fuse`;

    const lines = $('lineList');
    lines.innerHTML = '';
    let zeroQuirk = false;
    m.volts.forEach((v, i) => {
        if (v == null && m.amps[i] == null) return;
        // exactly 0 V with current flowing = the meter does not report voltage there
        const quirk = v === 0 && (m.amps[i] || 0) > 0;
        zeroQuirk = zeroQuirk || quirk;
        const bad = v != null && !quirk && v !== 0 && (v < VOLT_LOW || v > VOLT_HIGH);
        const div = document.createElement('div');
        div.dataset.info = quirk
            ? `The meter reports no voltage on L${i + 1} even though current flows; that is a meter quirk, not a fault.`
            : `Voltage and current on phase L${i + 1}. A healthy grid stays between 207 and 253 V.`;
        div.innerHTML = `<dt>L${i + 1}</dt><dd${bad ? ' class="bad"' : ''}>${v != null ? v.toFixed(1) + ' V' : ''}${v != null && m.amps[i] != null ? ' · ' : ''}${m.amps[i] != null ? m.amps[i].toFixed(1) + ' A' : ''}</dd>`;
        lines.appendChild(div);
    });
    $('voltNote').hidden = !zeroQuirk;
    if (zeroQuirk) $('voltNote').textContent = 'a 0.0 V line while current flows means the smart meter does not report voltage on that phase';
    $('freqNote').hidden = m.freq == null;
    if (m.freq != null) $('freqNote').textContent = `grid frequency ${m.freq.toFixed(2)} Hz`;
}

function renderQuality(m) {
    $('srcInfo').textContent = lastVia
        ? `${lastVia}${lastLatency != null ? ` · ${lastLatency} ms` : ''}`
        : '···';
    $('ageInfo').textContent = lastReadingAt
        ? new Date(lastReadingAt).toLocaleTimeString('en-GB')
        : '···';
    $('wifi').textContent = m.wifiSsid ? `${m.wifiSsid} (${m.wifiPct ?? '?'}%)` : '···';
    $('fails').textContent = m.failsAny != null ? `${m.failsAny} total · ${m.failsLong ?? 0} long` : '···';
    $('sags').textContent = m.sags != null ? `${m.sags} / ${m.swells ?? 0}` : '···';
    $('meterModel').textContent = m.meterModel ? `${m.meterModel} (DSMR ${(m.smr ?? 0) / 10})` : '···';
}

function renderEco(m, store) {
    const t = todayDelta(store, m);
    if (!t) return;
    const kg = (d) => (d.imp * settings.co2Kwh + (d.gas > 0 ? d.gas * settings.co2Gas : 0)) / 1000;
    $('co2Today').textContent = `${kg(t).toLocaleString('en-GB', { maximumFractionDigits: 1 })} kg`;
    const cur = monthTotals(store, m).get(dayKey(new Date()).slice(0, 7));
    $('co2Month').textContent = cur ? `${kg(cur).toLocaleString('en-GB', { maximumFractionDigits: 0 })} kg` : '···';
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
    if (!c) return;
    const windowMs = settings.sparkMin * 60000;
    const pts = spark.filter((p) => p.t >= Date.now() - windowMs);
    const sc = $('sparkCanvas');
    sc._pts = pts;
    sc._t0 = Date.now() - windowMs;
    sc._t1 = Date.now();
    if (pts.length < 2) return;
    const { ctx, w, h } = c;
    const t0 = sc._t0, t1 = sc._t1;
    const dataMin = Math.min(...pts.map((p) => p.w));
    let min = Math.min(0, dataMin);
    let max = Math.max(100, ...pts.map((p) => p.w));
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
    pts.forEach((p, i) => { i ? ctx.lineTo(x(p.t), y(p.w)) : ctx.moveTo(x(p.t), y(p.w)); });
    ctx.stroke();
}

function drawHour() {
    const canvas = $('hourCanvas');
    const pts = spark;
    // young data fills the whole width and grows into a true hour
    const span = pts.length ? Math.max(5 * 60000, Date.now() - pts[0].t) : 60 * 60000;
    canvas._pts = pts;
    canvas._t0 = Date.now() - Math.min(60 * 60000, span);
    canvas._t1 = Date.now();
    const c = canvasCtx(canvas);
    if (!c) return;
    const { ctx, w, h } = c;
    ctx.clearRect(0, 0, w, h);
    ctx.font = '11px system-ui, sans-serif';
    if (pts.length < 2) {
        ctx.fillStyle = themeVar('--muted');
        ctx.textAlign = 'center';
        ctx.fillText('collecting readings, the hour fills up as you watch…', w / 2, h / 2);
        return;
    }
    const top = 14, bottom = 16;
    const dataMin = Math.min(...pts.map((p) => p.w));
    const dataMax = Math.max(...pts.map((p) => p.w));
    let min = Math.min(0, dataMin);
    let max = Math.max(100, dataMax);
    const pad = (max - min) * 0.08 || 50;
    if (min < 0) min -= pad;
    max += pad;
    const x = (t) => (t - canvas._t0) / (canvas._t1 - canvas._t0) * w;
    const y = (v) => top + (1 - (v - min) / (max - min)) * (h - top - bottom);
    const y0 = y(0);

    // area fill: import tint above the zero line, export tint below it
    const area = new Path2D();
    area.moveTo(x(pts[0].t), y0);
    pts.forEach((p) => area.lineTo(x(p.t), y(p.w)));
    area.lineTo(x(pts[pts.length - 1].t), y0);
    area.closePath();
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, w, y0); ctx.clip();
    ctx.globalAlpha = 0.18; ctx.fillStyle = themeVar('--chart-imp'); ctx.fill(area);
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.rect(0, y0, w, h - y0); ctx.clip();
    ctx.globalAlpha = 0.22; ctx.fillStyle = themeVar('--chart-exp'); ctx.fill(area);
    ctx.restore();

    if (dataMin < 0) {
        ctx.strokeStyle = themeVar('--line'); ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(w, y0); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle = themeVar('--chart-imp'); ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach((p, i) => { i ? ctx.lineTo(x(p.t), y(p.w)) : ctx.moveTo(x(p.t), y(p.w)); });
    ctx.stroke();

    ctx.fillStyle = themeVar('--muted');
    ctx.textAlign = 'left';
    ctx.fillText(`▲ peak ${fmtPower(dataMax)}`, 4, 11);
    ctx.fillText(new Date(canvas._t0).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 4, h - 4);
    ctx.textAlign = 'right';
    if (dataMin < 0) ctx.fillText(`▼ export peak ${fmtPower(-dataMin)}`, w - 4, 11);
    ctx.fillText('now', w - 4, h - 4);
}

function drawBars(canvas, rows, labelOf) {
    canvas._rows = rows;
    canvas._label = labelOf;
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

    // cost overlay on its own scale (feature 32); exact figures sit in the bar tooltips
    const costs = rows.map((r) => costOfDelta(r));
    const maxC = Math.max(...costs);
    if (maxC > 0.005 && rows.length > 1) {
        const cy = (v) => top + (1 - Math.max(0, v) / maxC) * (h - top - bottom);
        ctx.strokeStyle = themeVar('--warn');
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        costs.forEach((v, i) => {
            const cx = slot * i + slot / 2;
            i ? ctx.lineTo(cx, cy(v)) : ctx.moveTo(cx, cy(v));
        });
        ctx.stroke();
        ctx.fillStyle = themeVar('--warn');
        costs.forEach((v, i) => {
            ctx.beginPath();
            ctx.arc(slot * i + slot / 2, cy(v), 2, 0, 7);
            ctx.fill();
        });
        ctx.textAlign = 'center';
        ctx.fillText(`cost line · peak ${money(maxC)}`, w / 2, 11);
    }

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
        if (imp >= 0 && imp < 500) {
            const gas = snaps[i].gas != null && snaps[i - 1].gas != null ? snaps[i].gas - snaps[i - 1].gas : 0;
            const it1 = snaps[i].it1 != null && snaps[i - 1].it1 != null ? snaps[i].it1 - snaps[i - 1].it1 : null;
            const it2 = snaps[i].it2 != null && snaps[i - 1].it2 != null ? snaps[i].it2 - snaps[i - 1].it2 : null;
            out.push({ key: keyOf(snaps[i]), imp, exp: Math.max(0, exp), gas: Math.max(0, gas), it1, it2 });
        }
    }
    return out;
}

function drawCharts(store) {
    drawBars($('day24Canvas'),
        deltas(store.hourly.slice(-25), (s) => s.t).slice(-24),
        (r) => new Date(r.key).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));

    const p = settings.histPeriod;
    let rows, label;
    if (p === '12m') {
        rows = [...monthTotals(store, null).values()].slice(-12);
        label = (r) => r.key.slice(2);
    } else {
        const n = p === '7d' ? 7 : 30;
        rows = dailyDeltas(store).slice(-n);
        label = (r) => r.key.slice(5);
    }
    drawBars($('historyCanvas'), rows, label);
    document.querySelectorAll('#tiles .chip').forEach((b) =>
        b.classList.toggle('on', b.dataset.period === settings.histPeriod));
}

/* ---- tooltips: hover or press any stat or chart bar for more info ---------- */
const tipEl = document.createElement('div');
tipEl.className = 'tip';
tipEl.hidden = true;
let tipTimer = 0;

function showTip(html, x, y) {
    tipEl.innerHTML = html;
    tipEl.hidden = false;
    const r = tipEl.getBoundingClientRect();
    const left = Math.min(Math.max(8, x + 12), window.innerWidth - r.width - 8);
    const top = (y + 14 + r.height > window.innerHeight) ? y - r.height - 12 : y + 14;
    tipEl.style.left = `${left}px`;
    tipEl.style.top = `${Math.max(8, top)}px`;
    clearTimeout(tipTimer);
    tipTimer = setTimeout(hideTip, 6000);
}

function hideTip() {
    clearTimeout(tipTimer);
    tipEl.hidden = true;
}

const escHtml = (s) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

function barTipHandler(canvas) {
    return (e) => {
        const rows = canvas._rows;
        if (!rows || !rows.length) { hideTip(); return; }
        const rect = canvas.getBoundingClientRect();
        const i = Math.max(0, Math.min(rows.length - 1,
            Math.floor((e.clientX - rect.left) / (rect.width / rows.length))));
        const r = rows[i];
        const parts = [`<b>${escHtml(String(canvas._label(r)))}</b>`, `\u25b2 ${fmtKwh(r.imp)} kWh in`];
        if (r.exp > 0.0005) parts.push(`\u25bc ${fmtKwh(r.exp)} kWh out`);
        if (r.gas > 0.0005) parts.push(`${fmtM3(r.gas)} m\u00b3 gas`);
        parts.push(money(costOfDelta(r)));
        showTip(parts.join(' \u00b7 '), e.clientX, e.clientY);
    };
}

function lineTipHandler(canvas) {
    return (e) => {
        const pts = canvas._pts;
        if (!pts || pts.length < 2) { hideTip(); return; }
        const rect = canvas.getBoundingClientRect();
        const t = canvas._t0 + (e.clientX - rect.left) / rect.width * (canvas._t1 - canvas._t0);
        let best = pts[0];
        for (const p of pts) if (Math.abs(p.t - t) < Math.abs(best.t - t)) best = p;
        const dir = best.w < 0 ? ' exporting' : '';
        showTip(`<b>${new Date(best.t).toLocaleTimeString('en-GB')}</b> \u00b7 ${fmtPower(best.w)}${dir}`, e.clientX, e.clientY);
    };
}

function initTips() {
    document.body.appendChild(tipEl);
    [$('day24Canvas'), $('historyCanvas')].forEach((c) => {
        const handler = barTipHandler(c);
        c.addEventListener('pointermove', handler);
        c.addEventListener('pointerdown', handler);
        c.addEventListener('pointerleave', hideTip);
    });
    [$('sparkCanvas'), $('hourCanvas')].forEach((c) => {
        const handler = lineTipHandler(c);
        c.addEventListener('pointermove', handler);
        c.addEventListener('pointerdown', handler);
        c.addEventListener('pointerleave', hideTip);
    });

    const infoOf = (e) => (e.target.closest ? e.target.closest('[data-info]') : null);
    document.addEventListener('pointerover', (e) => {
        const t = infoOf(e);
        if (t) showTip(escHtml(t.dataset.info), e.clientX, e.clientY);
    });
    document.addEventListener('pointerout', (e) => { if (infoOf(e)) hideTip(); });
    document.addEventListener('pointerdown', (e) => {
        const t = infoOf(e);
        if (t) showTip(escHtml(t.dataset.info), e.clientX, e.clientY);
        else if (!e.target.closest('canvas')) hideTip();
    });
    document.addEventListener('scroll', hideTip, true);
}

/* ---- alerts ------------------------------------------------------------------- */
const alertState = new Map(); // id -> active bool
let audioCtx = null;

function beep() {
    if (!settings.alertSound) return;
    try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.frequency.value = 880; o.type = 'sine';
        g.gain.setValueAtTime(0.12, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
        o.connect(g).connect(audioCtx.destination);
        o.start(); o.stop(audioCtx.currentTime + 0.5);
    } catch { /* no audio available */ }
}

function notify(text) {
    if (!settings.alertNotify || !('Notification' in window) || Notification.permission !== 'granted') return;
    try { new Notification('Wattwarden', { body: text, icon: 'icon.svg' }); } catch { /* blocked */ }
}

function setAlert(id, active, text) {
    const was = alertState.get(id) || false;
    alertState.set(id, active);
    if (active && !was) { beep(); notify(text); }
    if (active) alertState.set(id + ':text', text);
}

function renderAlerts() {
    const texts = [];
    alertState.forEach((v, k) => { if (v === true) texts.push(alertState.get(k + ':text')); });
    const bar = $('alertBar');
    bar.hidden = texts.length === 0;
    bar.textContent = texts.length ? `⚠ ${texts.join(' · ')}` : '';
}

function checkAlerts(m) {
    if (!settings.alertsOn) { alertState.clear(); renderAlerts(); return; }
    if (m) {
        setAlert('high', settings.alertW > 0 && m.power != null && m.power >= settings.alertW,
            `high usage: ${fmtPower(m.power)} (limit ${fmtPower(settings.alertW)})`);
        // 0 V readings are a meter reporting quirk, not a grid fault
        const badVolts = m.volts
            .map((v, i) => ({ v, i }))
            .filter(({ v }) => v != null && v !== 0 && (v < VOLT_LOW || v > VOLT_HIGH));
        setAlert('volts', settings.alertVolts && badVolts.length > 0,
            `voltage out of band: ${badVolts.map(({ v, i }) => `L${i + 1} at ${v.toFixed(1)} V`).join(', ')} (normal 207-253 V)`);
        const hotAmps = m.amps
            .map((a, i) => ({ a, i }))
            .filter(({ a }) => a != null && settings.fuseA > 0 && a >= settings.fuseA * 0.9);
        setAlert('fuse', hotAmps.length > 0,
            `near the ${settings.fuseA} A main fuse: ${hotAmps.map(({ a, i }) => `L${i + 1} at ${a.toFixed(1)} A`).join(', ')}`);
        setAlert('peak', settings.alertPeakGuard && m.avgW != null && m.peakW > 0
            && m.avgW >= m.peakW * (1 - settings.peakMargin / 100),
            `15-min average ${fmtW(m.avgW)} W is nearing this month's peak of ${fmtW(m.peakW)} W`);
    }
    renderAlerts();
}

function watchdogTick() {
    if (settings.alertsOn && settings.alertOffline && settings.host && !demo.on) {
        const stale = lastReadingAt && Date.now() - lastReadingAt > settings.interval * 3 + 8000;
        setAlert('offline', !!stale,
            `no reading since ${lastReadingAt ? new Date(lastReadingAt).toLocaleTimeString('en-GB') : '?'}`);
        renderAlerts();
    }
}

/* ---- connection: direct browser fetch first, loopback relay fallback ------ */
const conn = { mode: null, token: 0, directErr: '', pollTimer: 0, reprobeTimer: 0, failStreak: 0 };
const bridge = { ws: null, open: false, retryTimer: 0 };

function activeStore() { return demo.on ? demoStore : realStore; }

async function directFetch(host) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), Math.min(4000, settings.interval));
    const started = performance.now();
    try {
        // targetAddressSpace lets Chromium ask for local-network permission
        // instead of hard-blocking mixed content; other browsers ignore it
        const res = await fetch(`http://${host}/api/v1/data`, {
            cache: 'no-store', signal: ctrl.signal, targetAddressSpace: 'private',
        });
        if (res.status === 403) throw new Error('the meter refused: enable Local API in the HomeWizard app');
        if (!res.ok) throw new Error(`meter answered HTTP ${res.status}`);
        const json = await res.json();
        lastLatency = Math.round(performance.now() - started);
        return json;
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
    lastRaw = raw;
    lastVia = via;
    lastReadingAt = Date.now();
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
    if (settings.pauseHidden && document.visibilityState === 'hidden') return;
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
        connectBridge();
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

/* only knock on the relay's door while it would actually be used; a page
   happily polling direct must not spam the console with WS failures */
function bridgeUseful() {
    return !demo.on && !!settings.host && conn.mode !== 'direct';
}

function connectBridge() {
    if (!bridgeUseful()) return;
    if (bridge.ws && (bridge.ws.readyState === 0 || bridge.ws.readyState === 1)) return;
    clearTimeout(bridge.retryTimer);
    let ws;
    try { ws = new WebSocket(BRIDGE_URL); } catch { bridgeDown(); return; }
    bridge.ws = ws;
    ws.onopen = () => {
        bridge.open = true;
        bridge.attempts = 0;
        $('bridgeState').textContent = 'Relay: connected on 127.0.0.1:7101';
        if (conn.mode === 'bridge') bridgeSend({ cmd: 'watch', host: settings.host, interval: settings.interval });
        refreshStatus();
    };
    ws.onmessage = (ev) => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch { return; }
        if (demo.on || conn.mode !== 'bridge') return;
        if (msg.type === 'data' && msg.data) {
            lastLatency = null;
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
    if (bridgeUseful()) {
        bridge.attempts = (bridge.attempts || 0) + 1;
        const delay = Math.min(60000, 15000 * Math.pow(2, Math.min(bridge.attempts - 1, 2)));
        bridge.retryTimer = setTimeout(connectBridge, delay);
    }
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

/* ---- kiosk helpers: wake lock, dim, clock, fullscreen ----------------------- */
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

function inDimWindow(now) {
    const [fh, fm] = settings.dimFrom.split(':').map(Number);
    const [th, tm] = settings.dimTo.split(':').map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    const from = fh * 60 + fm, to = th * 60 + tm;
    return from <= to ? (mins >= from && mins < to) : (mins >= from || mins < to);
}

function applyDim() {
    const veil = $('dimVeil');
    const on = settings.dimOn && inDimWindow(new Date());
    veil.hidden = !on;
    if (on) veil.style.opacity = settings.dimLevel / 100;
}

let clockTimer = 0;
function applyClock() {
    clearInterval(clockTimer);
    const el = $('clockEl');
    el.hidden = !settings.clock;
    if (settings.clock) {
        const tick = () => { el.textContent = fmtClock(new Date()); };
        tick();
        clockTimer = setInterval(tick, 1000);
    }
}

function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
    else document.documentElement.requestFullscreen().catch(() => { });
}

function applyKiosk() {
    const on = !!document.fullscreenElement;
    document.body.classList.toggle('kiosk', on);
    $('btnFull').textContent = on ? '⛶ Exit fullscreen' : '⛶ Fullscreen';
    redraw();
}

function applyWide() {
    document.body.classList.toggle('wide', settings.wideScreen);
    redraw();
}

/* ---- appearance -------------------------------------------------------------- */
function applyTheme() {
    document.documentElement.dataset.theme = settings.theme;
    document.querySelectorAll('#themeGrid .swatch').forEach((b) =>
        b.setAttribute('aria-checked', String(b.dataset.theme === settings.theme)));
    applyAccent();
    redraw();
}

function applyAccent() {
    const root = document.documentElement.style;
    if (settings.accent) {
        root.setProperty('--accent', settings.accent);
        root.setProperty('--chart-imp', settings.accent);
    } else {
        root.removeProperty('--accent');
        root.removeProperty('--chart-imp');
    }
}

function applyScale() {
    document.documentElement.style.fontSize = `${16 * settings.scale / 100}px`;
    $('scaleVal').textContent = `${settings.scale}%`;
    redraw();
}

function applyDensity() {
    document.body.classList.toggle('compact', settings.density);
    redraw();
}

function applyTiles() {
    document.querySelectorAll('#tiles [data-tile]').forEach((sec) => {
        sec.hidden = !settings.tiles.includes(sec.dataset.tile);
        sec.style.order = settings.order.indexOf(sec.dataset.tile);
    });
    redraw();
}

let redrawTimer = 0;
function redraw() {
    clearTimeout(redrawTimer);
    redrawTimer = setTimeout(() => {
        drawHour();
        if (lastMetrics) { drawSpark(); drawCharts(activeStore()); }
        else if (activeStore().daily.length) drawCharts(activeStore());
    }, 60);
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
        active_frequency_hz: 49.97 + Math.random() * 0.06,
        active_power_average_w: 450 + Math.random() * 120,
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
    let imp = demo.imp - 400 * 9, exp = demo.exp, gas = demo.gas - 400 * 1.0;
    exp = Math.max(0, exp - 400 * 3);
    for (let d = 400; d >= 1; d--) {
        const day = new Date(now); day.setDate(day.getDate() - d); day.setHours(23, 59, 0, 0);
        const weekend = day.getDay() === 0 || day.getDay() === 6;
        const winter = [11, 0, 1, 2].includes(day.getMonth());
        imp += 6 + Math.random() * 4 + (weekend ? 2 : 0) + (winter ? 2 : 0);
        exp += (winter ? 1 : 4) + Math.random() * 2.5;
        gas += (winter ? 2.2 : 0.35) + Math.random() * 0.4;
        demoStore.daily.push({
            d: dayKey(day), imp, exp, gas, water: demo.water - d * 0.11,
            it1: imp * 0.44, it2: imp * 0.56,
        });
    }
    let hImp = imp, hExp = exp, hGas = gas;
    for (let h = 48; h >= 1; h--) {
        const t = new Date(now); t.setMinutes(0, 0, 0); t.setHours(t.getHours() - h);
        const hr = t.getHours();
        hImp += hr > 6 && hr < 23 ? 0.25 + Math.random() * 0.5 : 0.08;
        hExp += hr > 9 && hr < 17 ? 0.3 + Math.random() * 0.4 : 0;
        hGas += (hr > 6 && hr < 9) || (hr > 17 && hr < 22) ? 0.1 : 0.005;
        demoStore.hourly.push({ t: t.getTime(), imp: hImp, exp: hExp, gas: hGas, it1: hImp * 0.44, it2: hImp * 0.56 });
    }
    demo.imp = hImp; demo.exp = hExp; demo.gas = hGas;
    demoStore.persist(true);
}

function demoTick() {
    const raw = demoRaw(new Date());
    lastRaw = raw;
    lastVia = 'demo';
    lastReadingAt = Date.now();
    const m = normalise(raw);
    recordHistory(demoStore, m, new Date());
    renderReading(m, demoStore);
    demo.timer = setTimeout(demoTick, Math.min(settings.interval, 5000));
}

function setDemo(on) {
    demo.on = on;
    $('setDemo').checked = on;
    clearTimeout(demo.timer);
    spark.length = 0;
    demo.lastAt = 0;
    alertState.clear();
    renderAlerts();
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

/* ---- transfer between browsers / devices --------------------------------- */
function bytesToB64(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
}

function b64ToBytes(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
}

async function packTransfer() {
    const payload = new TextEncoder().encode(JSON.stringify({
        w: 1, settings: { ...settings }, hourly: realStore.hourly, daily: realStore.daily,
    }));
    if ('CompressionStream' in window) {
        const stream = new Blob([payload]).stream().pipeThrough(new CompressionStream('gzip'));
        return 'WW1g:' + bytesToB64(new Uint8Array(await new Response(stream).arrayBuffer()));
    }
    return 'WW1j:' + bytesToB64(payload);
}

async function unpackTransfer(code) {
    const m = /^WW1([gj]):([A-Za-z0-9+/=\s]+)$/.exec(code.trim());
    if (!m) throw new Error('not a Wattwarden transfer code');
    let bytes = b64ToBytes(m[2].replace(/\s+/g, ''));
    if (m[1] === 'g') {
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
        bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    }
    return JSON.parse(new TextDecoder().decode(bytes));
}

function applyImportedData(data, note) {
    const mergeBy = (mine, theirs, keyOf) => {
        const map = new Map(mine.map((s) => [keyOf(s), s]));
        (Array.isArray(theirs) ? theirs : []).forEach((s) => {
            if (s && typeof s.imp === 'number' && keyOf(s) != null && !map.has(keyOf(s))) map.set(keyOf(s), s);
        });
        return [...map.values()].sort((a, b) => (keyOf(a) < keyOf(b) ? -1 : 1));
    };
    realStore.hourly = mergeBy(realStore.hourly, data.hourly, (s) => s.t).slice(-HOURLY_KEEP);
    realStore.daily = mergeBy(realStore.daily, data.daily, (s) => s.d).slice(-DAILY_KEEP);
    realStore.persist(true);
    if (data.settings && typeof data.settings === 'object'
        && confirm('Also apply the settings from this data (meter address, prices, themes, tiles)? The page reloads afterwards.')) {
        Object.keys(DEFAULTS).forEach((k) => {
            if (k in data.settings) settings[k] = data.settings[k];
        });
        saveSettings();
        location.reload();
        return;
    }
    histSummary();
    redraw();
    $('histInfo').textContent += ` · ${note} ✔`;
}

async function copyTransfer() {
    const code = await packTransfer();
    let done = false;
    try { await navigator.clipboard.writeText(code); done = true; } catch { /* clipboard blocked */ }
    if (!done) {
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        done = document.execCommand('copy');
        ta.remove();
    }
    $('histInfo').textContent = done
        ? `Transfer code copied (${(code.length / 1024).toFixed(1)} KB). Paste it on the other device.`
        : 'Could not reach the clipboard; use Export JSON instead.';
}

async function pasteTransfer() {
    const code = prompt('Paste the transfer code from the other device:');
    if (!code) return;
    try {
        applyImportedData(await unpackTransfer(code), 'transfer merged');
    } catch (err) {
        $('histInfo').textContent = `That code did not work: ${err.message}`;
    }
}

/* ---- data management --------------------------------------------------------- */
function download(name, mime, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: mime }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
}

function exportJson() {
    download(`wattwarden-history-${dayKey(new Date())}.json`, 'application/json',
        JSON.stringify({
            exported: new Date().toISOString(),
            settings: { ...settings },
            hourly: realStore.hourly, daily: realStore.daily,
        }, null, 1));
}

function exportCsv() {
    const esc = (v) => v == null ? '' : String(v);
    const lines = ['type,key,imp_kwh,exp_kwh,gas_m3,water_m3,imp_t1_kwh,imp_t2_kwh'];
    realStore.hourly.forEach((s) => lines.push(
        `hour,${new Date(s.t).toISOString()},${esc(s.imp)},${esc(s.exp)},${esc(s.gas)},${esc(s.water)},${esc(s.it1)},${esc(s.it2)}`));
    realStore.daily.forEach((s) => lines.push(
        `day,${s.d},${esc(s.imp)},${esc(s.exp)},${esc(s.gas)},${esc(s.water)},${esc(s.it1)},${esc(s.it2)}`));
    download(`wattwarden-history-${dayKey(new Date())}.csv`, 'text/csv', lines.join('\r\n'));
}

function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
        try {
            applyImportedData(JSON.parse(reader.result), 'import merged');
        } catch {
            $('histInfo').textContent = 'That file could not be read as a Wattwarden export.';
        }
    };
    reader.readAsText(file);
}

function refreshRawBox() {
    const box = $('rawJson');
    if (box && lastRaw) box.textContent = JSON.stringify(lastRaw, null, 1);
}

function histSummary() {
    const bytes = (localStorage.getItem('ww_hist_hourly') || '').length
        + (localStorage.getItem('ww_hist_daily') || '').length;
    $('histInfo').textContent =
        `${realStore.hourly.length} hourly + ${realStore.daily.length} daily snapshots, ${(bytes / 1024).toFixed(1)} KB of localStorage.`;
}

/* ---- settings UI ------------------------------------------------------------------ */
function bindCheck(id, key, after) {
    const el = $(id);
    el.checked = !!settings[key];
    el.addEventListener('change', () => { settings[key] = el.checked; saveSettings(); if (after) after(); });
}

function bindNum(id, key, after) {
    const el = $(id);
    el.value = String(settings[key]);
    el.addEventListener('change', () => {
        const v = parseFloat(el.value);
        if (!Number.isNaN(v)) settings[key] = v;
        el.value = String(settings[key]);
        saveSettings(); if (after) after();
    });
}

function bindSelect(id, key, numeric, after) {
    const el = $(id);
    el.value = String(settings[key]);
    el.addEventListener('change', () => { settings[key] = numeric ? +el.value : el.value; saveSettings(); if (after) after(); });
}

function rerenderAll() {
    if (lastMetrics) renderReading(lastMetrics, activeStore());
    else redraw();
}

function buildTileList() {
    const list = $('tileToggles');
    list.innerHTML = '';
    settings.order.forEach((id, idx) => {
        const label = (TILES.find(([t]) => t === id) || [id, id])[1];
        const row = document.createElement('div');
        row.className = 'tilerow';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = `tile_${id}`;
        cb.checked = settings.tiles.includes(id);
        cb.addEventListener('change', () => {
            settings.tiles = settings.order.filter((t) => (t === id ? cb.checked : settings.tiles.includes(t)));
            saveSettings(); applyTiles();
        });
        const lb = document.createElement('label');
        lb.htmlFor = cb.id;
        lb.textContent = label;
        const up = document.createElement('button');
        up.className = 'mini'; up.textContent = '▲'; up.disabled = idx === 0;
        up.setAttribute('aria-label', `Move ${label} up`);
        const down = document.createElement('button');
        down.className = 'mini'; down.textContent = '▼'; down.disabled = idx === settings.order.length - 1;
        down.setAttribute('aria-label', `Move ${label} down`);
        const move = (dir) => {
            const i = settings.order.indexOf(id);
            settings.order.splice(i, 1);
            settings.order.splice(i + dir, 0, id);
            saveSettings(); applyTiles(); buildTileList();
        };
        up.addEventListener('click', () => move(-1));
        down.addEventListener('click', () => move(1));
        row.append(cb, lb, up, down);
        list.appendChild(row);
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

    const cur = $('setCurrency');
    CURRENCIES.forEach((c) => {
        const o = document.createElement('option');
        o.value = c; o.textContent = c;
        cur.appendChild(o);
    });

    buildTileList();

    // connection
    $('setHost').value = settings.host;
    $('setHost').addEventListener('change', () => {
        settings.host = $('setHost').value.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        $('setHost').value = settings.host;
        saveSettings(); startConnection();
    });
    bindSelect('setInterval', 'interval', true, startConnection);
    bindCheck('setPauseHidden', 'pauseHidden');
    $('btnReconnect').addEventListener('click', () => { connectBridge(); startConnection(); });

    // costs
    bindSelect('setCurrency', 'currency', false, rerenderAll);
    bindNum('setStandingDay', 'standingDay', rerenderAll);
    bindCheck('setDualPrices', 'dualPrices', () => { syncPriceRows(); rerenderAll(); });
    bindNum('setPriceImp', 'priceImp', rerenderAll);
    bindNum('setPriceExp', 'priceExp', rerenderAll);
    bindNum('setPriceImpT1', 'priceImpT1', rerenderAll);
    bindNum('setPriceImpT2', 'priceImpT2', rerenderAll);
    bindNum('setPriceGas', 'priceGas', rerenderAll);
    bindNum('setPriceWater', 'priceWater', rerenderAll);
    bindNum('setCo2Kwh', 'co2Kwh', rerenderAll);
    bindNum('setCo2Gas', 'co2Gas', rerenderAll);
    syncPriceRows();

    // alerts
    bindCheck('setAlertsOn', 'alertsOn', () => checkAlerts(lastMetrics));
    bindNum('setAlertW', 'alertW', () => checkAlerts(lastMetrics));
    bindNum('setFuseA', 'fuseA', () => checkAlerts(lastMetrics));
    bindCheck('setAlertOffline', 'alertOffline');
    bindCheck('setAlertVolts', 'alertVolts', () => checkAlerts(lastMetrics));
    bindCheck('setAlertPeakGuard', 'alertPeakGuard', () => checkAlerts(lastMetrics));
    bindNum('setPeakMargin', 'peakMargin', () => checkAlerts(lastMetrics));
    bindCheck('setAlertSound', 'alertSound');
    bindCheck('setAlertNotify', 'alertNotify', syncNotifyState);
    $('btnNotifyPerm').addEventListener('click', async () => {
        if ('Notification' in window) await Notification.requestPermission();
        syncNotifyState();
    });
    syncNotifyState();

    // appearance
    $('setAccent').value = settings.accent || '#ffb347';
    $('setAccent').addEventListener('input', () => { settings.accent = $('setAccent').value; saveSettings(); applyAccent(); redraw(); });
    $('btnAccentReset').addEventListener('click', () => { settings.accent = ''; saveSettings(); applyAccent(); redraw(); });
    $('setScale').value = String(settings.scale);
    $('setScale').addEventListener('input', () => { settings.scale = +$('setScale').value; saveSettings(); applyScale(); });
    $('scaleVal').textContent = `${settings.scale}%`;
    bindCheck('setDensity', 'density', applyDensity);
    bindCheck('setUnitsKw', 'unitsKw', rerenderAll);
    bindCheck('setWide', 'wideScreen', applyWide);
    bindCheck('setClock', 'clock', applyClock);
    bindSelect('setSparkMin', 'sparkMin', true, () => drawSpark());

    // wall tablet
    bindCheck('setAwake', 'keepAwake', applyWakeLock);
    bindCheck('setDimOn', 'dimOn', applyDim);
    $('setDimFrom').value = settings.dimFrom;
    $('setDimFrom').addEventListener('change', () => { settings.dimFrom = $('setDimFrom').value || '23:00'; saveSettings(); applyDim(); });
    $('setDimTo').value = settings.dimTo;
    $('setDimTo').addEventListener('change', () => { settings.dimTo = $('setDimTo').value || '06:30'; saveSettings(); applyDim(); });
    $('setDimLevel').value = String(settings.dimLevel);
    $('dimVal').textContent = `${settings.dimLevel}%`;
    $('setDimLevel').addEventListener('input', () => {
        settings.dimLevel = +$('setDimLevel').value;
        $('dimVal').textContent = `${settings.dimLevel}%`;
        saveSettings(); applyDim();
    });

    // data & demo
    $('setDemo').addEventListener('change', () => setDemo($('setDemo').checked));
    $('btnExport').addEventListener('click', exportJson);
    $('btnExportCsv').addEventListener('click', exportCsv);
    $('btnCopyTransfer').addEventListener('click', copyTransfer);
    $('btnPasteTransfer').addEventListener('click', pasteTransfer);
    $('importFile').addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) importJson(e.target.files[0]);
        e.target.value = '';
    });
    $('btnWipe').addEventListener('click', () => {
        if (!confirm('Delete all stored meter history from this browser?')) return;
        realStore.wipe(); realStore.persist(true);
        localStorage.removeItem('ww_spark');
        spark.length = 0;
        histSummary(); redraw();
    });

    // history period chips
    document.querySelectorAll('#tiles .chip').forEach((b) => {
        b.addEventListener('click', () => {
            settings.histPeriod = b.dataset.period;
            saveSettings();
            drawCharts(activeStore());
        });
    });
}

function syncPriceRows() {
    $('singlePriceRow').querySelector('#setPriceImp').parentElement.style.display = settings.dualPrices ? 'none' : '';
    $('dualPriceRow').hidden = !settings.dualPrices;
}

function syncNotifyState() {
    const el = $('notifyState');
    if (!('Notification' in window)) { el.textContent = 'This browser has no notification support.'; return; }
    el.textContent = `Notification permission: ${Notification.permission}.`;
}

function openSettings(open) {
    $('settingsVeil').hidden = !open;
    if (open) { histSummary(); refreshRawBox(); $('setHost').focus(); }
}

/* ---- boot --------------------------------------------------------------------------- */
function init() {
    applyTheme();
    applyScale();
    applyDensity();
    applyWide();
    applyTiles();
    applyClock();
    applyDim();
    buildSettings();
    initTips();
    refreshStatus();
    updateConnDetail();
    startConnection();
    applyWakeLock();

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            applyWakeLock();
            if (settings.pauseHidden && !demo.on) startConnection();
        } else if (settings.pauseHidden && !demo.on) {
            clearTimeout(conn.pollTimer);
            clearTimeout(conn.reprobeTimer);
            bridgeSend({ cmd: 'stop' });
        }
    });

    $('btnSettings').addEventListener('click', () => openSettings(true));
    $('btnCloseSettings').addEventListener('click', () => openSettings(false));
    $('settingsVeil').addEventListener('click', (e) => { if (e.target === $('settingsVeil')) openSettings(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') openSettings(false); });
    $('btnFull').addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', applyKiosk);

    window.addEventListener('resize', redraw);
    // canvases render blank while a tab is backgrounded (zero layout width);
    // repaint the moment they get real dimensions
    if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(redraw);
        ['sparkCanvas', 'hourCanvas', 'day24Canvas', 'historyCanvas'].forEach((id) => ro.observe($(id)));
    }
    setInterval(watchdogTick, 5000);
    setInterval(applyDim, 30000);

    if ('serviceWorker' in navigator && location.protocol === 'https:') {
        navigator.serviceWorker.register('sw.js', { scope: './', updateViaCache: 'none' }).catch(() => { });
    }

    // returning visitor with history: show the dashboard shell immediately
    if (realStore.daily.length) {
        $('emptyState').hidden = true;
        $('tiles').hidden = false;
        redraw();
    }
}

document.addEventListener('DOMContentLoaded', init);
