'use strict';

/* Sunseer Stick View: https://rami.party/workshop/sunseer/
   Injected by the Sunseer bookmarklet ON the status page of a Solis
   datalogging stick (S2-WL-ST and friends), at http://<stick-ip>/.
   Because it runs on the stick's own page, every fetch is same-origin:
   no relay, no Python, no browser flags. It reads /status.html and
   /inverter.html, paints a live mini-dashboard, refreshes every 10 s and
   keeps a little daily history in this browser's localStorage. */

(function () {
    if (window.__sunseerStick) { window.__sunseerStick.tick(); return; }

    var C = {
        bg: '#120e08', raise: '#1d1712', ink: '#f5ecdc', muted: '#ab9d84',
        line: '#3a3021', accent: '#ffc247', good: '#7bd98c', danger: '#e06a5a',
    };
    var S = { timer: 0, spark: [], els: {} };
    window.__sunseerStick = S;

    function num(s) {
        if (!s) return null;
        var m = String(s).replace(',', '.').match(/-?\d+(?:\.\d+)?/);
        return m ? parseFloat(m[0]) : null;
    }
    function fmt(v, digits) {
        return v == null ? '···' : v.toLocaleString('en-GB', { maximumFractionDigits: digits == null ? 1 : digits });
    }

    function grab(path) {
        return fetch(path, { cache: 'no-store' })
            .then(function (r) { return r.ok ? r.text() : ''; })
            .catch(function () { return ''; });
    }

    function el(tag, css, text) {
        var e = document.createElement(tag);
        if (css) e.style.cssText = css;
        if (text) e.textContent = text;
        return e;
    }

    /* ---- daily history: {"2026-08-23": 12.3, ...} kept in the stick's origin ---- */
    var DAYS_KEY = 'sunseer_stick_days';
    function dayKey(d) {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    function saveDay(todayKwh) {
        if (todayKwh == null) return;
        try {
            var days = JSON.parse(localStorage.getItem(DAYS_KEY) || '{}');
            var key = dayKey(new Date());
            days[key] = Math.max(days[key] || 0, todayKwh);
            var keys = Object.keys(days).sort();
            while (keys.length > 60) delete days[keys.shift()];
            localStorage.setItem(DAYS_KEY, JSON.stringify(days));
        } catch (e) { /* storage full or blocked */ }
    }

    /* ---- overlay ---- */
    function build() {
        var wrap = el('div', 'position:fixed;inset:0;z-index:2147483647;overflow:auto;background:' + C.bg
            + ';color:' + C.ink + ';font:16px/1.5 system-ui,Segoe UI,Roboto,sans-serif;');
        var inner = el('div', 'max-width:640px;margin:0 auto;padding:18px 18px 32px;');
        wrap.appendChild(inner);

        var head = el('div', 'display:flex;justify-content:space-between;align-items:center;gap:10px;');
        head.appendChild(el('div', 'font-weight:700;letter-spacing:.04em;color:' + C.accent, '\u2600 Sunseer Stick View'));
        var close = el('button', 'border:1px solid ' + C.line + ';background:' + C.raise + ';color:' + C.ink
            + ';border-radius:999px;width:36px;height:36px;font-size:15px;cursor:pointer;', '\u2715');
        close.setAttribute('aria-label', 'Close the Stick View');
        close.onclick = function () {
            clearTimeout(S.timer);
            S.timer = 0;
            wrap.remove();
            window.__sunseerStick = null;
        };
        head.appendChild(close);
        inner.appendChild(head);

        S.els.state = el('div', 'margin:6px 0 2px;font-size:13px;color:' + C.muted, 'reading the stick\u2026');
        inner.appendChild(S.els.state);

        var big = el('div', 'font:700 64px/1.1 ui-monospace,Consolas,monospace;color:' + C.accent + ';margin-top:6px;');
        S.els.watts = el('span', '', '···');
        big.appendChild(S.els.watts);
        big.appendChild(el('span', 'font-size:22px;color:' + C.muted + ';margin-left:8px;font-weight:400;', 'W'));
        inner.appendChild(big);
        S.els.word = el('div', 'color:' + C.muted + ';font-size:14px;margin-bottom:8px;', '');
        inner.appendChild(S.els.word);

        S.els.spark = el('canvas', 'width:100%;height:56px;display:block;margin:6px 0 14px;');
        inner.appendChild(S.els.spark);

        var card = el('div', 'background:' + C.raise + ';border:1px solid ' + C.line + ';border-radius:12px;padding:12px 14px;');
        S.els.rows = card;
        inner.appendChild(card);

        inner.appendChild(el('div', 'margin:16px 0 4px;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:' + C.muted,
            'Last days (kWh)'));
        S.els.bars = el('canvas', 'width:100%;height:90px;display:block;');
        inner.appendChild(S.els.bars);

        inner.appendChild(el('div', 'margin-top:18px;font-size:12px;color:' + C.muted,
            'Refreshes every 10 s \u00b7 reads this stick\u2019s own pages \u00b7 history stays in this browser \u00b7 rami.party/workshop/sunseer'));
        document.body.appendChild(wrap);
    }

    function row(label, value, color) {
        var r = el('div', 'display:flex;justify-content:space-between;gap:14px;padding:5px 0;border-bottom:1px dotted ' + C.line + ';font-size:14px;');
        r.appendChild(el('span', 'color:' + C.muted, label));
        r.appendChild(el('span', 'font-family:ui-monospace,Consolas,monospace;text-align:right;color:' + (color || C.ink), value));
        return r;
    }

    function drawSpark() {
        var c = S.els.spark;
        var w = c.clientWidth, h = c.clientHeight;
        if (!w || S.spark.length < 2) return;
        c.width = w * (devicePixelRatio || 1); c.height = h * (devicePixelRatio || 1);
        var x = c.getContext('2d');
        x.scale(devicePixelRatio || 1, devicePixelRatio || 1);
        var max = Math.max(100, Math.max.apply(null, S.spark)) * 1.1;
        x.strokeStyle = C.accent; x.lineWidth = 2; x.lineJoin = 'round';
        x.beginPath();
        for (var i = 0; i < S.spark.length; i++) {
            var px = i / (S.spark.length - 1) * w, py = h - (S.spark[i] / max) * h;
            if (i) x.lineTo(px, py); else x.moveTo(px, py);
        }
        x.stroke();
    }

    function drawBars() {
        var c = S.els.bars;
        var w = c.clientWidth, h = c.clientHeight;
        if (!w) return;
        c.width = w * (devicePixelRatio || 1); c.height = h * (devicePixelRatio || 1);
        var x = c.getContext('2d');
        x.scale(devicePixelRatio || 1, devicePixelRatio || 1);
        var days;
        try { days = JSON.parse(localStorage.getItem(DAYS_KEY) || '{}'); } catch (e) { days = {}; }
        var keys = Object.keys(days).sort().slice(-14);
        if (!keys.length) {
            x.fillStyle = C.muted; x.font = '12px system-ui,sans-serif'; x.textAlign = 'center';
            x.fillText('history grows a bar per day', w / 2, h / 2);
            return;
        }
        var max = 0.1;
        keys.forEach(function (k) { if (days[k] > max) max = days[k]; });
        var slot = w / keys.length, bw = Math.max(3, Math.min(30, slot * 0.65));
        keys.forEach(function (k, i) {
            var bh = (days[k] / max) * (h - 26);
            x.fillStyle = C.accent;
            x.fillRect(slot * i + (slot - bw) / 2, h - 14 - bh, bw, bh);
        });
        x.fillStyle = C.muted; x.font = '11px system-ui,sans-serif';
        x.textAlign = 'left'; x.fillText(keys[0].slice(5), 2, h - 2);
        x.textAlign = 'right'; x.fillText(keys[keys.length - 1].slice(5) + ' \u00b7 max ' + fmt(max), w - 2, h - 2);
    }

    function render(f, reachable) {
        var now = num(f.webdata_now_p);
        var today = num(f.webdata_today_e);
        var alarm = (f.webdata_alarm || '').trim();
        var bad = alarm && !/^(no|none|normal|f00)/i.test(alarm);

        S.els.state.textContent = reachable
            ? 'live \u00b7 ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            : 'no reply from the stick: did the login expire? Reload the page and log in again.';
        S.els.state.style.color = reachable ? C.good : C.danger;
        if (!reachable) return;

        S.els.watts.textContent = now == null ? '···' : Math.round(now).toLocaleString('en-GB');
        S.els.word.textContent = now == null ? '' :
            now < 15 ? 'the panels are asleep' :
                now < 300 ? 'first light on the panels' :
                    now < 1500 ? 'a decent glow' :
                        now < 3500 ? 'strong sunshine' : 'full blaze across the roof';

        if (now != null) {
            S.spark.push(now);
            if (S.spark.length > 90) S.spark.shift();
        }

        var rows = S.els.rows;
        rows.textContent = '';
        rows.appendChild(row('Today', fmt(today, 2) + ' kWh'));
        if (f.webdata_yesterday_e) rows.appendChild(row('Yesterday', fmt(num(f.webdata_yesterday_e), 2) + ' kWh'));
        rows.appendChild(row('All time', fmt(num(f.webdata_total_e), 1) + ' kWh'));
        rows.appendChild(row('Alarm', bad ? alarm : 'none', bad ? C.danger : C.good));
        if (f.webdata_sn) rows.appendChild(row('Inverter SN', f.webdata_sn));
        if (f.cover_mid) rows.appendChild(row('Stick SN', f.cover_mid));
        if (f.cover_sta_ssid) {
            var rssi = num(f.cover_sta_rssi);
            rows.appendChild(row('Wi-Fi', f.cover_sta_ssid + (rssi != null ? ' (' + rssi + '%)' : '')));
        }
        if (f.cover_ver) rows.appendChild(row('Stick firmware', f.cover_ver));

        saveDay(today);
        drawSpark();
        drawBars();
    }

    S.tick = function () {
        clearTimeout(S.timer);
        Promise.all([grab('/status.html'), grab('/inverter.html')]).then(function (texts) {
            var found = {}, got = false;
            texts.forEach(function (t) {
                if (!t) return;
                got = true;
                var re = /var\s+(\w+)\s*=\s*"([^"]*)"/g, m;
                while ((m = re.exec(t))) found[m[1]] = m[2];
            });
            render(found, got);
            S.timer = setTimeout(S.tick, 10000);
        });
    };

    build();
    S.tick();
})();
