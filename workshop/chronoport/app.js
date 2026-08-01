/* ==========================================================================
   CHRONOPORT · app.js
   --------------------------------------------------------------------------
   A time traveller's console from the year 3050. Vanilla JS, no libraries.
   Everything is derived from the device clock plus a pair of coordinates.
   ========================================================================== */
(function () {
    'use strict';

    var A = window.Astro;
    var CITIES = window.CHRONO_CITIES || [];
    var STORE_KEY = 'chronoport:anchor';
    var RAD = Math.PI / 180;
    var MOON_RADIUS_KM = 1737.4;
    var C_KM_S = 299792.458;

    var state = {
        lat: null,
        lng: null,
        label: null,
        source: 'guess',
        frozen: false,
        frozenAt: null,
        sort: 'offset',
        filter: '',
        warp: 0.5,
    };

    /* ---------------------------------------------------------------- utils */
    var $ = function (id) { return document.getElementById(id); };
    function pad(n, w) { n = String(Math.floor(Math.abs(n))); while (n.length < (w || 2)) n = '0' + n; return n; }
    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function now() { return state.frozen && state.frozenAt ? new Date(state.frozenAt) : new Date(); }

    function fmtClock(date, zone, withSeconds) {
        if (!date || isNaN(date)) return '——:——';
        var opt = { hour: '2-digit', minute: '2-digit', hour12: false };
        if (withSeconds) opt.second = '2-digit';
        if (zone) opt.timeZone = zone;
        try { return new Intl.DateTimeFormat('en-GB', opt).format(date); }
        catch (e) { return '——:——'; }
    }
    function fmtDate(date, zone) {
        var opt = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        if (zone) opt.timeZone = zone;
        return new Intl.DateTimeFormat('en-GB', opt).format(date);
    }
    function fmtNum(n, d) {
        if (n === null || n === undefined || !isFinite(n)) return '—';
        return Number(n).toLocaleString('en-GB', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
    }
    function deg(rad, d) { return fmtNum(rad / RAD, d === undefined ? 1 : d) + '°'; }

    var COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    function compass(rad) {
        var a = ((rad / RAD) % 360 + 360) % 360;
        return COMPASS[Math.round(a / 22.5) % 16];
    }

    function humanDuration(ms, parts) {
        if (ms === null || !isFinite(ms)) return '—';
        var neg = ms < 0; ms = Math.abs(ms);
        var units = [
            ['y', 31557600000], ['d', 86400000], ['h', 3600000], ['m', 60000], ['s', 1000],
        ];
        var out = [], want = parts || 2;
        for (var i = 0; i < units.length && out.length < want; i++) {
            var v = Math.floor(ms / units[i][1]);
            if (v > 0 || out.length) { out.push(v + units[i][0]); ms -= v * units[i][1]; }
        }
        if (!out.length) out.push('0s');
        return (neg ? '−' : '') + out.join(' ');
    }
    function hhmm(ms) {
        if (!isFinite(ms)) return '—';
        var mins = Math.round(ms / 60000);
        return Math.floor(mins / 60) + 'h ' + pad(mins % 60) + 'm';
    }

    function zoneOffsetMinutes(date, zone) {
        try {
            var dtf = new Intl.DateTimeFormat('en-US', {
                timeZone: zone, hour12: false,
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
            });
            var p = {};
            dtf.formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
            var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, (+p.hour) % 24, +p.minute, +p.second);
            return Math.round((asUTC - date.valueOf()) / 60000);
        } catch (e) { return 0; }
    }
    function fmtOffset(mins) {
        var s = mins < 0 ? '−' : '+', m = Math.abs(mins);
        return 'UTC' + s + pad(m / 60) + ':' + pad(m % 60);
    }

    /* ------------------------------------------------------------ location */
    function guessFromZone() {
        var zone = '';
        try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { }
        var hit = CITIES.filter(function (c) { return c.zone === zone; })[0];
        if (hit) return { lat: hit.lat, lng: hit.lng, label: hit.name + ', ' + hit.country };
        // Fall back to the zone's own offset → a longitude on the right meridian.
        var off = zoneOffsetMinutes(new Date(), zone || 'UTC');
        return { lat: 45, lng: clamp(off / 4, -180, 180), label: zone || 'Unknown sector' };
    }

    function setAnchor(lat, lng, label, source, remember) {
        state.lat = clamp(lat, -90, 90);
        state.lng = ((lng + 180) % 360 + 360) % 360 - 180;
        state.label = label;
        state.source = source;
        if (remember) {
            try {
                localStorage.setItem(STORE_KEY, JSON.stringify({
                    lat: state.lat, lng: state.lng, label: label, source: source,
                }));
            } catch (e) { }
        }
        paintBeacon();
        renderAll();
    }

    function paintBeacon() {
        var s = $('beaconState');
        var coords = fmtNum(state.lat, 4) + '°, ' + fmtNum(state.lng, 4) + '°';
        var word = { gps: 'Position locked by your device', manual: 'Anchor set by hand', saved: 'Anchor restored from your last visit', guess: 'Estimated from your time zone' }[state.source] || 'Anchor set';
        s.innerHTML = '<b>' + esc(word) + '</b> · <span class="mono">' + esc(coords) + '</span>' +
            (state.label ? ' · ' + esc(state.label) : '') +
            (state.source === 'guess' ? ' — lock on for real readings.' : '');
        $('linkState').textContent = state.source === 'gps' ? 'LOCKED' : state.source === 'guess' ? 'ESTIMATED' : 'ANCHORED';
    }

    function locate() {
        if (!navigator.geolocation) {
            $('beaconState').textContent = 'This browser refuses to share a position. Enter coordinates instead.';
            return;
        }
        $('beaconState').textContent = 'Triangulating…';
        navigator.geolocation.getCurrentPosition(function (pos) {
            setAnchor(pos.coords.latitude, pos.coords.longitude, null, 'gps', true);
        }, function () {
            $('beaconState').textContent = 'Position denied or unavailable — enter coordinates by hand.';
        }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
    }

    /* ------------------------------------------------------- stat rendering */
    function statItem(label, value, note, tone) {
        return '<li class="stat' + (tone ? ' is-' + tone : '') + '">' +
            '<span class="stat-label">' + esc(label) + '</span>' +
            '<span class="stat-value">' + value + '</span>' +
            (note ? '<span class="stat-note">' + note + '</span>' : '') +
            '</li>';
    }
    function mono(v) { return '<span class="mono">' + esc(v) + '</span>'; }

    /* ================================================================ PRIME */
    function renderPrime() {
        var d = now();
        var ms = d.getMilliseconds();
        $('primeTime').textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
        $('primeFrac').textContent = '.' + pad(ms, 3);
        $('primeDate').textContent = fmtDate(d);
        var zone = 'Local';
        try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local'; } catch (e) { }
        $('primeZone').textContent = zone;
        $('primeOffset').textContent = fmtOffset(-d.getTimezoneOffset());
        $('topbarUtc').textContent = 'UTC ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());

        var toMillennium = Date.UTC(3050, 0, 1) - d.valueOf();
        $('heroEyebrow').innerHTML = state.frozen
            ? 'Temporal anchor · <b>FROZEN</b> — the flow is held still'
            : 'Temporal anchor · ' + esc(humanDuration(toMillennium, 3)) + ' until the year 3050';
    }

    /* ================================================================== SUN */
    function renderSun() {
        var d = now(), lat = state.lat, lng = state.lng;
        var t = A.sunTimes(d, lat, lng);
        var p = A.sunPosition(d, lat, lng);
        var orbit = A.earthOrbit(d);
        var up = p.apparentAltitude > 0;

        var dayLen = (t.sunrise && t.sunset) ? t.sunset - t.sunrise : (t.polarDay ? 86400000 : 0);
        var head = t.polarDay ? 'Endless day — the Sun never dips below the horizon here today.'
            : t.polarNight ? 'Polar night — the Sun stays below the horizon all day.'
                : up ? 'The Sun is up, ' + deg(p.apparentAltitude) + ' above the horizon in the ' + compass(p.azimuth) + '.'
                    : 'The Sun is below the horizon, ' + deg(-p.apparentAltitude) + ' down toward the ' + compass(p.azimuth) + '.';
        $('sunHeadline').textContent = head;

        var next = nextSunEvent(d, t, lat, lng);
        var shadow = up && p.apparentAltitude > 0.5 * RAD
            ? fmtNum(1 / Math.tan(p.apparentAltitude), 2) + '×'
            : '—';
        var eot = A.equationOfTime(d);
        var solarTime = new Date(d.valueOf() + (lng * 4 + eot) * 60000 + d.getTimezoneOffset() * 60000);

        var rows = [
            statItem('Sunrise', mono(t.sunrise ? fmtClock(t.sunrise, null, true) : t.polarDay ? 'already up' : 'no rise'),
                t.sunrise ? 'azimuth ' + compass(A.sunPosition(t.sunrise, lat, lng).azimuth) : t.polarDay ? 'the Sun is up all day' : 'the Sun stays down all day'),
            statItem('Sunset', mono(t.sunset ? fmtClock(t.sunset, null, true) : t.polarDay ? 'never sets' : 'no set'),
                t.sunset ? 'azimuth ' + compass(A.sunPosition(t.sunset, lat, lng).azimuth) : t.polarDay ? 'midnight sun' : 'polar night'),
            statItem('Daylight today', mono(t.polarDay ? '24h 00m' : hhmm(dayLen)),
                t.polarDay || t.polarNight ? '' : fmtNum(dayLen / 864000, 1) + '% of the day'),
            statItem('Next solar event', mono(next ? next.name : '—'),
                next ? 'in ' + humanDuration(next.at - d, 2) + ' · ' + fmtClock(next.at, null, true) : ''),
            statItem('Altitude', mono(deg(p.apparentAltitude, 2)), up ? 'above the horizon' : 'below the horizon', up ? 'good' : ''),
            statItem('Azimuth', mono(deg(p.azimuth, 1)), 'bearing ' + compass(p.azimuth)),
            statItem('Solar noon', mono(fmtClock(t.solarNoon, null, true)), 'highest point of the day'),
            statItem('Shadow length', mono(shadow), 'multiples of your height'),
            statItem('True solar time', mono(fmtClock(solarTime, null, true)), 'sundial time at your meridian'),
            statItem('Equation of time', mono((eot >= 0 ? '+' : '−') + fmtNum(Math.abs(eot), 2) + ' min'), 'sundial minus clock'),
            statItem('Solar declination', mono(deg(t.declination, 2)), 'latitude the Sun is overhead'),
            statItem('Distance to the Sun', mono(fmtNum(orbit.km, 0) + ' km'), fmtNum(orbit.au, 5) + ' AU'),
            statItem('Sunlight delay', mono(hms(orbit.km / C_KM_S)), 'age of the light hitting you now'),
            statItem('Earth orbital speed', mono(fmtNum(orbit.speed, 2) + ' km/s'), fmtNum(orbit.speed * 3600, 0) + ' km/h'),
        ];
        $('sunStats').innerHTML = rows.join('');

        renderTwilight(d, t);
        drawSkyArc(d, t, p);
    }

    function hms(sec) {
        var m = Math.floor(sec / 60), s = sec - m * 60;
        return m + 'm ' + fmtNum(s, 1) + 's';
    }

    var TWILIGHT_ROWS = [
        ['astroEnd', 'Astronomical dawn', 'the first grey of the sky'],
        ['nauticalEnd', 'Nautical dawn', 'the horizon becomes visible'],
        ['civilEnd', 'Civil dawn', 'bright enough to read outside'],
        ['sunrise', 'Sunrise', 'the disc breaks the horizon'],
        ['goldenHourEnd', 'Golden hour ends', 'the soft light fades'],
        ['solarNoon', 'Solar noon', 'the Sun is at its highest'],
        ['goldenHourStart', 'Golden hour begins', 'the warm light returns'],
        ['sunset', 'Sunset', 'the disc slips away'],
        ['civilStart', 'Civil dusk', 'street lights come on'],
        ['nauticalStart', 'Nautical dusk', 'the horizon dissolves'],
        ['astroStart', 'Astronomical dusk', 'true darkness, stars at full'],
    ];

    function renderTwilight(d, t) {
        var html = TWILIGHT_ROWS.map(function (r) {
            var when = t[r[0]];
            var past = when && when < d;
            return '<li class="tw' + (past ? ' is-past' : '') + '">' +
                '<span class="tw-time mono">' + esc(when ? fmtClock(when, null, true) : '——:——:——') + '</span>' +
                '<span class="tw-name">' + esc(r[1]) + '</span>' +
                '<span class="tw-note">' + esc(r[2]) + '</span>' +
                '</li>';
        }).join('');
        $('twilightList').innerHTML = html;
    }

    function nextSunEvent(d, t, lat, lng) {
        var candidates = [];
        TWILIGHT_ROWS.forEach(function (r) { if (t[r[0]]) candidates.push({ name: r[1], at: t[r[0]] }); });
        candidates = candidates.filter(function (c) { return c.at > d; })
            .sort(function (a, b) { return a.at - b.at; });
        if (candidates.length) return candidates[0];
        // Nothing left today — look at tomorrow's sunrise.
        var t2 = A.sunTimes(new Date(d.valueOf() + 86400000), lat, lng);
        return t2.sunrise ? { name: 'Sunrise', at: t2.sunrise } : null;
    }

    /* ---- Sky arc canvas --------------------------------------------------- */
    function drawSkyArc(d, t, p) {
        var cv = $('skyArc'), ctx = cv.getContext('2d');
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var w = cv.clientWidth || 720, h = Math.round((cv.clientWidth || 720) * 0.46);
        cv.width = w * dpr; cv.height = h * dpr;
        cv.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        var m = 26, gw = w - m * 2, gh = h - m * 2;
        var start = new Date(d); start.setHours(0, 0, 0, 0);
        var samples = 240, alts = [], maxAlt = 5 * RAD, minAlt = -5 * RAD;
        for (var i = 0; i <= samples; i++) {
            var tt = new Date(start.valueOf() + (i / samples) * 86400000);
            var a = A.sunPosition(tt, state.lat, state.lng).altitude;
            alts.push(a);
            if (a > maxAlt) maxAlt = a;
            if (a < minAlt) minAlt = a;
        }
        var span = Math.max(maxAlt - minAlt, 20 * RAD);
        var top = maxAlt + span * 0.12, bottom = minAlt - span * 0.12;
        function y(alt) { return m + gh * (top - alt) / (top - bottom); }
        function x(frac) { return m + gw * frac; }

        // Twilight bands as horizontal strata.
        var bands = [
            [top, 0, 'rgba(80,190,255,0.16)'],
            [0, -6 * RAD, 'rgba(90,120,255,0.15)'],
            [-6 * RAD, -12 * RAD, 'rgba(70,80,200,0.14)'],
            [-12 * RAD, -18 * RAD, 'rgba(50,50,150,0.13)'],
            [-18 * RAD, bottom, 'rgba(10,10,40,0.30)'],
        ];
        bands.forEach(function (b) {
            var y1 = y(Math.min(b[0], top)), y2 = y(Math.max(b[1], bottom));
            if (y2 <= y1) return;
            ctx.fillStyle = b[2];
            ctx.fillRect(m, y1, gw, y2 - y1);
        });

        // Horizon line.
        ctx.strokeStyle = 'rgba(120,240,255,0.55)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(m, y(0)); ctx.lineTo(m + gw, y(0)); ctx.stroke();
        ctx.setLineDash([]);

        // Hour ticks.
        ctx.fillStyle = 'rgba(180,220,255,0.55)';
        ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.textAlign = 'center';
        for (var hh = 0; hh <= 24; hh += 3) {
            var xx = x(hh / 24);
            ctx.strokeStyle = 'rgba(120,200,255,0.14)';
            ctx.beginPath(); ctx.moveTo(xx, m); ctx.lineTo(xx, m + gh); ctx.stroke();
            if (hh < 24) ctx.fillText(pad(hh) + ':00', xx, h - 8);
        }

        // The Sun's path.
        var grad = ctx.createLinearGradient(0, m, 0, m + gh);
        grad.addColorStop(0, '#ffd479');
        grad.addColorStop(0.55, '#ff9f4d');
        grad.addColorStop(1, '#6c7bff');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(255,180,80,0.55)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        alts.forEach(function (a, i) {
            var px = x(i / samples), py = y(a);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;

        // The Sun right now.
        var frac = (d - start) / 86400000;
        var sx = x(clamp(frac, 0, 1)), sy = y(p.altitude);
        var glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 26);
        glow.addColorStop(0, 'rgba(255,225,150,0.95)');
        glow.addColorStop(1, 'rgba(255,170,60,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(sx, sy, 26, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff3cf';
        ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2); ctx.fill();

        // Now marker.
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(sx, m); ctx.lineTo(sx, m + gh); ctx.stroke();
        ctx.setLineDash([]);

        $('skyCaption').textContent = 'The Sun\'s altitude across the whole of ' +
            fmtDate(d).replace(/^\w+,?\s/, '') + ' at ' + fmtNum(state.lat, 3) + '°, ' +
            fmtNum(state.lng, 3) + '° — the dashed line is the horizon, the bands are twilight.';
    }

    /* ================================================================= MOON */
    function renderMoon() {
        var d = now(), lat = state.lat, lng = state.lng;
        var ill = A.moonIllumination(d);
        var pos = A.moonPosition(d, lat, lng);
        var times = A.moonTimes(d, lat, lng);
        var nextFull = A.nextMoonPhase(d, 0.5);
        var nextNew = A.nextMoonPhase(d, 0);
        var name = A.moonPhaseName(ill.phase);
        var up = pos.altitude > 0;
        var angularSize = 2 * Math.atan(MOON_RADIUS_KM / ill.distance) / RAD * 60; // arcminutes

        $('moonPhaseName').textContent = name;
        $('moonHeadline').textContent = (up
            ? 'The Moon is above you, ' + deg(pos.altitude) + ' high in the ' + compass(pos.azimuth)
            : 'The Moon is below the horizon, ' + deg(-pos.altitude) + ' down toward the ' + compass(pos.azimuth))
            + ' — ' + fmtNum(ill.fraction * 100, 1) + '% lit.';

        var rows = [
            statItem('Phase', mono(name), (ill.phase < 0.5 ? 'waxing' : 'waning') + ' · ' + fmtNum(ill.phase * 100, 1) + '% through the cycle'),
            statItem('Illumination', mono(fmtNum(ill.fraction * 100, 2) + '%'), 'of the disc lit from here'),
            statItem('Moon age', mono(fmtNum(ill.age, 2) + ' days'), 'since the last new moon'),
            statItem('Moonrise', mono(times.rise ? fmtClock(times.rise, null, true) : times.alwaysUp ? 'never sets' : '—'), 'today, local time'),
            statItem('Moonset', mono(times.set ? fmtClock(times.set, null, true) : times.alwaysDown ? 'never rises' : '—'), 'today, local time'),
            statItem('Altitude', mono(deg(pos.altitude, 2)), up ? 'visible above the horizon' : 'below the horizon', up ? 'good' : ''),
            statItem('Azimuth', mono(deg(pos.azimuth, 1)), 'bearing ' + compass(pos.azimuth)),
            statItem('Distance', mono(fmtNum(pos.distance, 0) + ' km'), fmtNum(pos.distance / 384400 * 100, 1) + '% of the mean orbit'),
            statItem('Light delay', mono(fmtNum(pos.distance / C_KM_S, 3) + ' s'), 'each way, at light speed'),
            statItem('Apparent size', mono(fmtNum(angularSize, 2) + '′'), angularSize > 32 ? 'larger than average — a supermoon-ish disc' : 'smaller than average'),
            statItem('Next full moon', mono(nextFull ? fmtClock(nextFull, null, false) + ' · ' + fmtDate(nextFull).replace(/^\w+,?\s/, '') : '—'),
                nextFull ? 'in ' + humanDuration(nextFull - d, 2) : ''),
            statItem('Next new moon', mono(nextNew ? fmtClock(nextNew, null, false) + ' · ' + fmtDate(nextNew).replace(/^\w+,?\s/, '') : '—'),
                nextNew ? 'in ' + humanDuration(nextNew - d, 2) : ''),
            statItem('Synodic month', mono(fmtNum(A.SYNODIC, 6) + ' days'), 'new moon to new moon'),
            statItem('Tidal pull', mono(fmtNum(Math.pow(384400 / pos.distance, 3) * 100, 1) + '%'), 'of the mean lunar tide force'),
        ];
        $('moonStats').innerHTML = rows.join('');

        var track = $('moonTrack');
        track.style.setProperty('--phase', ill.phase);
        drawMoon(ill, pos);
    }

    function drawMoon(ill, pos) {
        var cv = $('moonDisc'), ctx = cv.getContext('2d');
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var size = cv.clientWidth || 300;
        cv.width = size * dpr; cv.height = size * dpr;
        cv.style.height = size + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, size, size);

        var cx = size / 2, cy = size / 2, r = size * 0.38;

        // Halo.
        var halo = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.7);
        halo.addColorStop(0, 'rgba(150,200,255,0.22)');
        halo.addColorStop(1, 'rgba(150,200,255,0)');
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(cx, cy, r * 1.7, 0, Math.PI * 2); ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        // Tilt the terminator the way it really hangs in your sky.
        ctx.rotate(-(ill.angle - pos.parallacticAngle));
        ctx.translate(-cx, -cy);

        // Dark side.
        ctx.fillStyle = '#131a2c';
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

        // Lit side: limb semicircle + the terminator ellipse, drawn as one path.
        var waxing = ill.phase < 0.5;
        var f = clamp(ill.fraction, 0, 1);
        var sLit = waxing ? 1 : -1;                  // lit limb on the right while waxing
        var termX = -sLit * r * (2 * f - 1);         // terminator half-width, signed
        ctx.save();
        ctx.beginPath();
        var steps = 96, i, th;
        for (i = 0; i <= steps; i++) {               // lit limb, bottom → top
            th = -Math.PI / 2 + (i / steps) * Math.PI;
            ctx.lineTo(cx + sLit * r * Math.cos(th), cy + r * Math.sin(th));
        }
        for (i = steps; i >= 0; i--) {               // terminator, top → bottom
            th = -Math.PI / 2 + (i / steps) * Math.PI;
            ctx.lineTo(cx + termX * Math.cos(th), cy + r * Math.sin(th));
        }
        ctx.closePath();
        var lit = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.1, cx, cy, r * 1.1);
        lit.addColorStop(0, '#ffffff');
        lit.addColorStop(0.6, '#dfe6f5');
        lit.addColorStop(1, '#9fb0cf');
        ctx.fillStyle = lit;
        ctx.fill();
        ctx.restore();

        // Maria — a few soft grey patches so it reads as the Moon.
        var maria = [[-0.28, -0.24, 0.20], [0.12, -0.32, 0.13], [-0.06, 0.10, 0.26], [0.30, 0.22, 0.15], [-0.34, 0.30, 0.11]];
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
        maria.forEach(function (m) {
            ctx.fillStyle = 'rgba(70,85,120,0.30)';
            ctx.beginPath();
            ctx.arc(cx + m[0] * r, cy + m[1] * r, m[2] * r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
        ctx.restore();

        // Rim.
        ctx.strokeStyle = 'rgba(160,210,255,0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    }

    /* ================================================================ WORLD */
    function renderWorld() {
        var d = now();
        var localOffset = -d.getTimezoneOffset();
        var q = state.filter.trim().toLowerCase();

        var rows = CITIES.map(function (c) {
            var off = zoneOffsetMinutes(d, c.zone);
            var sun = A.sunPosition(d, c.lat, c.lng);
            var alt = sun.apparentAltitude / RAD;
            var phase = alt > 6 ? 'day' : alt > -0.833 ? 'golden' : alt > -6 ? 'civil' : alt > -18 ? 'night' : 'deep';
            return {
                city: c, off: off, alt: alt, phase: phase,
                delta: off - localOffset,
                time: fmtClock(d, c.zone, true),
                day: new Intl.DateTimeFormat('en-GB', { timeZone: c.zone, weekday: 'short', day: 'numeric', month: 'short' }).format(d),
            };
        }).filter(function (r) {
            if (!q) return true;
            return (r.city.name + ' ' + r.city.country + ' ' + r.city.zone).toLowerCase().indexOf(q) > -1;
        });

        rows.sort(function (a, b) {
            if (state.sort === 'name') return a.city.name.localeCompare(b.city.name);
            if (state.sort === 'sun') return b.alt - a.alt;
            return a.off - b.off || a.city.name.localeCompare(b.city.name);
        });

        var LABEL = { day: 'Daylight', golden: 'Golden light', civil: 'Twilight', night: 'Night', deep: 'Deep night' };
        $('worldGrid').innerHTML = rows.map(function (r) {
            var delta = r.delta === 0 ? 'same hour as you'
                : (r.delta > 0 ? '+' : '−') + hhmm(Math.abs(r.delta) * 60000).replace(' ', '') + ' from you';
            return '<li class="wc is-' + r.phase + '">' +
                '<div class="wc-top">' +
                '<span class="wc-city">' + esc(r.city.name) + '</span>' +
                '<span class="wc-flagless">' + esc(r.city.country) + '</span>' +
                '</div>' +
                '<div class="wc-time mono">' + esc(r.time) + '</div>' +
                '<div class="wc-date">' + esc(r.day) + '</div>' +
                '<div class="wc-meta">' +
                '<span class="wc-pill">' + esc(LABEL[r.phase]) + '</span>' +
                '<span class="wc-off mono">' + esc(fmtOffset(r.off)) + '</span>' +
                '</div>' +
                '<div class="wc-delta">' + esc(delta) + ' · sun ' + esc(fmtNum(r.alt, 1)) + '°</div>' +
                '</li>';
        }).join('');

        var lit = rows.filter(function (r) { return r.alt > -0.833; }).length;
        var subsolarLng = -((d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600) - 12) * 15;
        subsolarLng = ((subsolarLng + 180) % 360 + 360) % 360 - 180;
        $('terminatorNote').textContent =
            lit + ' of ' + rows.length + ' waypoints are in daylight. The Sun is directly overhead near ' +
            fmtNum(A.sunTimes(d, 0, 0).declination / RAD, 2) + '°, ' + fmtNum(subsolarLng, 2) +
            '° — the day/night terminator is sweeping west at about 1,670 km/h at the equator.';
    }

    /* ========================================================== CHRONOMETRICS */
    function renderMetrics() {
        var d = now();
        var unix = Math.floor(d.valueOf() / 1000);
        var jd = A.toJulian(d);
        var startOfYear = new Date(d.getFullYear(), 0, 1);
        var doy = Math.floor((d - startOfYear) / 86400000) + 1;
        var startOfDay = new Date(d); startOfDay.setHours(0, 0, 0, 0);
        var secOfDay = (d - startOfDay) / 1000;
        var beat = ((d.getUTCHours() + 1) % 24 * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds()) / 86.4;
        var decimal = secOfDay / 86400 * 10;
        var hexTime = Math.floor(secOfDay / 86400 * 65536);
        var lst = A.localSiderealHours(d, state.lng);
        var gpsEpoch = Date.UTC(1980, 0, 6);
        var gpsWeek = Math.floor((d - gpsEpoch) / (7 * 86400000));
        var isoWeek = getISOWeek(d);
        var year = d.getFullYear();
        var leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        var y3050 = Date.UTC(3050, 0, 1);

        var rows = [
            statItem('Unix epoch', mono(fmtNum(unix, 0)), 'seconds since 1 Jan 1970 UTC'),
            statItem('Epoch milliseconds', mono(fmtNum(d.valueOf(), 0)), 'the number this page actually runs on'),
            statItem('ISO 8601 (UTC)', mono(d.toISOString()), 'the machine-readable instant'),
            statItem('Julian date', mono(fmtNum(jd, 5)), 'days since 4713 BC — the astronomer\'s count'),
            statItem('Modified Julian', mono(fmtNum(jd - 2400000.5, 5)), 'JD minus 2 400 000.5'),
            statItem('Local sidereal time', mono(hoursToHMS(lst)), 'the sky\'s own clock at your longitude'),
            statItem('Day of year', mono(doy + ' / ' + (leap ? 366 : 365)), 'ISO week ' + isoWeek.week + ' of ' + isoWeek.year),
            statItem('Swatch .beat', mono('@' + fmtNum(beat, 2)), 'internet time, 1000 beats a day'),
            statItem('Decimal time', mono(fmtNum(decimal, 5)), 'the French Revolution\'s ten-hour day'),
            statItem('Hexadecimal time', mono('.' + hexTime.toString(16).toUpperCase().padStart(4, '0')), '65 536 ticks a day'),
            statItem('Kiloseconds today', mono(fmtNum(secOfDay / 1000, 3) + ' ks'), 'of 86.4 ks in a day'),
            statItem('GPS time', mono('week ' + fmtNum(gpsWeek, 0)), 'plus ' + fmtNum(((d - gpsEpoch) / 1000) % 604800, 0) + ' s'),
            statItem('Your UTC offset', mono(fmtOffset(-d.getTimezoneOffset())), leap ? 'leap year' : 'common year'),
            statItem('Countdown to 3050', mono(humanDuration(y3050 - d, 3)), fmtNum((y3050 - d) / 86400000, 0) + ' days of waiting'),
        ];
        $('metricStats').innerHTML = rows.join('');

        renderBars(d);
    }

    function hoursToHMS(h) {
        var s = Math.round(h * 3600);
        return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
    }

    function getISOWeek(date) {
        var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        var dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return { week: Math.ceil(((d - yearStart) / 86400000 + 1) / 7), year: d.getUTCFullYear() };
    }

    function renderBars(d) {
        var startDay = new Date(d); startDay.setHours(0, 0, 0, 0);
        var startWeek = new Date(startDay);
        startWeek.setDate(startWeek.getDate() - ((startWeek.getDay() + 6) % 7));
        var startMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        var endMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        var startYear = new Date(d.getFullYear(), 0, 1);
        var endYear = new Date(d.getFullYear() + 1, 0, 1);
        var decadeStart = new Date(Math.floor(d.getFullYear() / 10) * 10, 0, 1);
        var decadeEnd = new Date(Math.floor(d.getFullYear() / 10) * 10 + 10, 0, 1);
        var startMill = Date.UTC(2000, 0, 1), endMill = Date.UTC(3050, 0, 1);

        var bars = [
            ['This day', (d - startDay) / 86400000],
            ['This week', (d - startWeek) / (7 * 86400000)],
            ['This month', (d - startMonth) / (endMonth - startMonth)],
            ['This year', (d - startYear) / (endYear - startYear)],
            ['This decade', (d - decadeStart) / (decadeEnd - decadeStart)],
            ['The road to 3050', (d - startMill) / (endMill - startMill)],
        ];
        $('cycleBars').innerHTML = bars.map(function (b) {
            var pct = clamp(b[1], 0, 1) * 100;
            return '<div class="bar">' +
                '<div class="bar-head"><span>' + esc(b[0]) + '</span><span class="mono">' + fmtNum(pct, 4) + '%</span></div>' +
                '<div class="bar-rail"><i style="width:' + pct.toFixed(4) + '%"></i></div>' +
                '</div>';
        }).join('');
    }

    /* ============================================================== WARP */
    function renderWarp() {
        var beta = clamp(state.warp, 0, 0.999999);
        var gamma = 1 / Math.sqrt(1 - beta * beta);
        var v = beta * C_KM_S;
        $('warpOut').textContent = fmtNum(beta, 6) + ' c';

        var rows = [
            statItem('Lorentz factor γ', mono(fmtNum(gamma, 6)), 'the whole trick in one number'),
            statItem('Velocity', mono(fmtNum(v, 0) + ' km/s'), fmtNum(v * 3600, 0) + ' km/h'),
            statItem('One shipboard day', mono(fmtNum(gamma, 4) + ' days'), 'pass outside while you live one'),
            statItem('Clock drift per hour', mono(fmtNum((gamma - 1) * 3600, 3) + ' s'), 'you fall behind the universe'),
            statItem('Length contraction', mono(fmtNum(100 / gamma, 3) + '%'), 'of a metre stick, as seen outside'),
            statItem('Energy to get there', mono(fmtNum((gamma - 1) * 89.9, 3) + ' PJ'), 'per kilogram of ship'),
            statItem('Earth → Proxima', mono(fmtNum(4.2465 / beta, 3) + ' yr'), fmtNum(4.2465 / beta / gamma, 3) + ' yr aboard'),
            statItem('Time to the Moon', mono(fmtNum(384400 / v, 3) + ' s'), 'at this speed, one way'),
        ];
        $('warpStats').innerHTML = rows.join('');

        var d = now();
        var toY3050ms = Date.UTC(3050, 0, 1) - d;
        $('warpYears').textContent = fmtNum(gamma, 4) + ' years';
        $('warpEta').textContent = humanDuration(toY3050ms / gamma, 2);
    }

    /* ============================================================ ALMANAC */
    function renderAlmanac() {
        var d = now(), y = d.getFullYear();
        var seasons = [];
        [0, 90, 180, 270].forEach(function (target) {
            [y, y + 1].forEach(function (yy) {
                var e = A.seasonEvent(yy, target);
                if (e) seasons.push({ deg: target, at: e });
            });
        });
        var north = state.lat >= 0;
        var NAMES = {
            0: north ? 'March equinox (spring)' : 'March equinox (autumn)',
            90: north ? 'June solstice (longest day)' : 'June solstice (shortest day)',
            180: north ? 'September equinox (autumn)' : 'September equinox (spring)',
            270: north ? 'December solstice (shortest day)' : 'December solstice (longest day)',
        };
        var upcoming = seasons.filter(function (s) { return s.at > d; })
            .sort(function (a, b) { return a.at - b.at; }).slice(0, 4);

        var orbit = A.earthOrbit(d);
        var rotationSpeed = 1670.0 * Math.cos(state.lat * RAD);
        var sun = A.sunPosition(d, state.lat, state.lng);
        var sunTimes = A.sunTimes(d, state.lat, state.lng);
        var tomorrow = A.sunTimes(new Date(d.valueOf() + 86400000), state.lat, state.lng);
        var dayLenToday = sunTimes.sunrise && sunTimes.sunset ? sunTimes.sunset - sunTimes.sunrise : null;
        var dayLenTom = tomorrow.sunrise && tomorrow.sunset ? tomorrow.sunset - tomorrow.sunrise : null;
        var trend = (dayLenToday !== null && dayLenTom !== null) ? dayLenTom - dayLenToday : null;

        var rows = upcoming.map(function (s) {
            return statItem(NAMES[s.deg], mono(fmtDate(s.at).replace(/^\w+,?\s/, '')),
                'in ' + humanDuration(s.at - d, 2) + ' · ' + fmtClock(s.at, null, false) + ' local');
        });

        rows.push(
            statItem('Daylight trend', mono(trend === null ? '—' : (trend >= 0 ? '+' : '−') + fmtNum(Math.abs(trend) / 1000, 0) + ' s/day'),
                trend === null ? 'no rise or set today' : (trend >= 0 ? 'the days are getting longer' : 'the days are getting shorter')),
            statItem('Your ground speed', mono(fmtNum(rotationSpeed, 1) + ' km/h'), 'carried east by Earth\'s spin at your latitude'),
            statItem('Around the Sun', mono(fmtNum(orbit.speed, 3) + ' km/s'), 'plus 220 km/s around the galaxy, if you\'re counting'),
            statItem('Sun overhead at', mono(deg(sunTimes.declination, 2) + ' latitude'), Math.abs(sunTimes.declination / RAD) < 0.5 ? 'the Sun is over the equator' : (sunTimes.declination > 0 ? 'northern hemisphere summer half' : 'southern hemisphere summer half')),
            statItem('Solar elevation cap', mono(deg((90 - Math.abs(state.lat - sunTimes.declination / RAD)) * RAD, 2)), 'the highest the Sun gets here today'),
            statItem('Sidereal day', mono('23:56:04.0905'), 'one true rotation — 3m 56s short of a clock day'),
            statItem('Leap second status', mono('none scheduled'), 'UTC has held steady since 2016; drift is watched by the IERS'),
            statItem('Sun bearing at noon', mono(compass(A.sunPosition(sunTimes.solarNoon, state.lat, state.lng).azimuth)), 'where shadows point away from at midday'),
            statItem('Current sun azimuth', mono(deg(sun.azimuth, 1)), 'clockwise from true north'),
            statItem('Precession cycle', mono('25 772 years'), 'the wobble that will move Polaris off the pole')
        );

        $('almanacStats').innerHTML = rows.join('');
    }

    /* ============================================================ WARPFIELD */
    function startWarpfield() {
        var cv = $('warpfield'), ctx = cv.getContext('2d');
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var stars = [], w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

        function resize() {
            w = window.innerWidth; h = window.innerHeight;
            cv.width = w * dpr; cv.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            stars = [];
            var count = Math.min(320, Math.round(w * h / 7000));
            for (var i = 0; i < count; i++) stars.push(newStar(true));
        }
        function newStar(spread) {
            return {
                x: (Math.random() - 0.5) * w * 2,
                y: (Math.random() - 0.5) * h * 2,
                z: spread ? Math.random() * w : w,
                hue: Math.random() < 0.25 ? 280 : 190,
            };
        }
        function frame() {
            ctx.fillStyle = 'rgba(4,6,15,0.35)';
            ctx.fillRect(0, 0, w, h);
            var cx = w / 2, cy = h * 0.42;
            var speed = state.frozen ? 0.6 : 5.5;
            stars.forEach(function (s, i) {
                s.z -= speed;
                if (s.z <= 1) { stars[i] = newStar(false); return; }
                var k = 128 / s.z;
                var px = cx + s.x * k, py = cy + s.y * k;
                if (px < 0 || px > w || py < 0 || py > h) { stars[i] = newStar(false); return; }
                var kPrev = 128 / (s.z + speed * 3);
                var size = clamp((1 - s.z / w) * 2.2, 0.2, 2.4);
                ctx.strokeStyle = 'hsla(' + s.hue + ',100%,' + clamp(60 + (1 - s.z / w) * 35, 50, 92) + '%,' + clamp(1 - s.z / w, 0.06, 0.9) + ')';
                ctx.lineWidth = size;
                ctx.beginPath();
                ctx.moveTo(cx + s.x * kPrev, cy + s.y * kPrev);
                ctx.lineTo(px, py);
                ctx.stroke();
            });
            raf = requestAnimationFrame(frame);
        }

        var raf = null;
        resize();
        window.addEventListener('resize', debounce(function () { resize(); drawAllCanvases(); }, 200));
        if (reduce) {
            ctx.fillStyle = '#04060f'; ctx.fillRect(0, 0, w, h);
            stars.forEach(function (s) {
                var k = 128 / s.z, cx = w / 2, cy = h * 0.42;
                ctx.fillStyle = 'hsla(' + s.hue + ',100%,80%,0.55)';
                ctx.fillRect(cx + s.x * k, cy + s.y * k, 1.4, 1.4);
            });
        } else {
            raf = requestAnimationFrame(frame);
        }
    }

    function debounce(fn, ms) {
        var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); };
    }
    function drawAllCanvases() {
        var d = now();
        drawSkyArc(d, A.sunTimes(d, state.lat, state.lng), A.sunPosition(d, state.lat, state.lng));
        drawMoon(A.moonIllumination(d), A.moonPosition(d, state.lat, state.lng));
    }

    /* ================================================================ WIRING */
    function renderAll() {
        renderPrime();
        renderSun();
        renderMoon();
        renderWorld();
        renderMetrics();
        renderWarp();
        renderAlmanac();
    }

    function boot() {
        $('year').textContent = new Date().getFullYear();

        // Waypoint picker.
        var sel = $('inCity');
        CITIES.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (c) {
            var o = document.createElement('option');
            o.value = c.lat + ',' + c.lng;
            o.textContent = c.name + ' — ' + c.country;
            sel.appendChild(o);
        });

        // Restore or guess the anchor.
        var saved = null;
        try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { }
        if (saved && isFinite(saved.lat) && isFinite(saved.lng)) {
            state.lat = saved.lat; state.lng = saved.lng;
            state.label = saved.label; state.source = 'saved';
        } else {
            var g = guessFromZone();
            state.lat = g.lat; state.lng = g.lng; state.label = g.label; state.source = 'guess';
        }
        paintBeacon();

        $('btnLocate').addEventListener('click', locate);
        $('btnManual').addEventListener('click', function () {
            var form = $('manualForm');
            var open = form.hidden;
            form.hidden = !open;
            this.setAttribute('aria-expanded', String(open));
            if (open) {
                $('inLat').value = fmtNum(state.lat, 4).replace(/,/g, '');
                $('inLng').value = fmtNum(state.lng, 4).replace(/,/g, '');
                $('inLat').focus();
            }
        });
        $('manualForm').addEventListener('submit', function (ev) {
            ev.preventDefault();
            var lat = parseFloat($('inLat').value), lng = parseFloat($('inLng').value);
            if (!isFinite(lat) || !isFinite(lng)) return;
            setAnchor(lat, lng, $('inCity').selectedIndex > 0 ? $('inCity').options[$('inCity').selectedIndex].textContent : null, 'manual', true);
            this.hidden = true;
            $('btnManual').setAttribute('aria-expanded', 'false');
        });
        sel.addEventListener('change', function () {
            if (!this.value) return;
            var parts = this.value.split(',');
            $('inLat').value = parts[0];
            $('inLng').value = parts[1];
        });
        $('btnAnchor').addEventListener('click', function () {
            state.frozen = !state.frozen;
            state.frozenAt = state.frozen ? new Date() : null;
            $('btnAnchorLabel').textContent = state.frozen ? 'Resume time' : 'Freeze time';
            this.classList.toggle('is-on', state.frozen);
            document.body.classList.toggle('is-frozen', state.frozen);
            renderAll();
        });

        $('worldFilter').addEventListener('input', function () {
            state.filter = this.value;
            renderWorld();
        });
        Array.prototype.forEach.call(document.querySelectorAll('.seg'), function (btn) {
            btn.addEventListener('click', function () {
                Array.prototype.forEach.call(document.querySelectorAll('.seg'), function (b) { b.classList.remove('is-on'); });
                btn.classList.add('is-on');
                state.sort = btn.dataset.sort;
                renderWorld();
            });
        });
        $('warpRange').addEventListener('input', function () {
            state.warp = parseFloat(this.value);
            renderWarp();
        });

        startWarpfield();
        renderAll();

        // Fast lane: the prime clock. Slow lane: everything else.
        var tickFast = function () {
            renderPrime();
            requestAnimationFrame(tickFast);
        };
        requestAnimationFrame(tickFast);
        setInterval(function () { if (!state.frozen) { renderSun(); renderMoon(); renderWorld(); renderMetrics(); } }, 1000);
        setInterval(function () { if (!state.frozen) { renderWarp(); renderAlmanac(); } }, 60000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
