/* ==========================================================================
   O.A.S.I.S. — geo.js
   --------------------------------------------------------------------------
   Pure geodesy + astronomy. No DOM, no globals other than window.GEO.
   Everything here has to be right: people navigate with it.

   Contents
     • WGS84 distance / bearing / destination / midpoint
     • Coordinate formats: DD, DDM, DMS, UTM, MGRS, Maidenhead
     • Sun: declination, azimuth, elevation, sunrise/transit/sunset, twilights
     • Moon: phase, illumination, age
     • Resection: intersection of two bearing lines (where am I?)
     • Local tangent-plane projection for the plot board
   ========================================================================== */

(function () {
    'use strict';

    const D2R = Math.PI / 180, R2D = 180 / Math.PI;
    const R_EARTH = 6371008.8;             // mean radius, metres (IUGG)

    const rad = d => d * D2R;
    const deg = r => r * R2D;
    const norm360 = d => ((d % 360) + 360) % 360;

    /* ---------------------------------------------------------------- great circle */

    /** Great-circle distance in metres (haversine — stable for short legs). */
    function distance(lat1, lon1, lat2, lon2) {
        const p1 = rad(lat1), p2 = rad(lat2);
        const dp = rad(lat2 - lat1), dl = rad(lon2 - lon1);
        const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
        return 2 * R_EARTH * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /** Initial (forward) true bearing in degrees, 0–360. */
    function bearing(lat1, lon1, lat2, lon2) {
        const p1 = rad(lat1), p2 = rad(lat2), dl = rad(lon2 - lon1);
        const y = Math.sin(dl) * Math.cos(p2);
        const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
        return norm360(deg(Math.atan2(y, x)));
    }

    /** Where you end up after walking `dist` metres on true bearing `brg`. */
    function destination(lat, lon, brg, dist) {
        const d = dist / R_EARTH, t = rad(brg), p1 = rad(lat), l1 = rad(lon);
        const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(t));
        const l2 = l1 + Math.atan2(Math.sin(t) * Math.sin(d) * Math.cos(p1),
            Math.cos(d) - Math.sin(p1) * Math.sin(p2));
        return { lat: deg(p2), lon: ((deg(l2) + 540) % 360) - 180 };
    }

    /**
     * Field resection. You stand at an unknown point and shoot a bearing TO
     * each of two known landmarks.
     *
     * The naive method — add 180° and intersect — is wrong on a sphere,
     * because meridians converge: the reverse of a great-circle bearing is
     * not the forward bearing plus 180°. Over long legs at high latitude that
     * error reaches hundreds of metres.
     *
     * So: intersect the two rays in a tangent plane, re-centre that plane on
     * the answer, correct each ray by the residual bearing error, and repeat.
     * Both sources of error vanish together and it converges in a few passes.
     */
    function resect(lat1, lon1, brgTo1, lat2, lon2, brgTo2) {
        const wrap = x => ((x % 360) + 540) % 360 - 180;
        let oLat = (lat1 + lat2) / 2, oLon = (lon1 + lon2) / 2;
        let bb1 = brgTo1 + 180, bb2 = brgTo2 + 180;
        let P = null;

        for (let i = 0; i < 40; i++) {
            const k = Math.cos(rad(oLat));
            if (Math.abs(k) < 1e-9) return null;                 // sitting on a pole
            const A = project(oLat, oLon, lat1, lon1);
            const B = project(oLat, oLon, lat2, lon2);
            const d1 = { x: Math.sin(rad(bb1)), y: Math.cos(rad(bb1)) };
            const d2 = { x: Math.sin(rad(bb2)), y: Math.cos(rad(bb2)) };

            const den = d1.x * d2.y - d1.y * d2.x;
            if (Math.abs(den) < 1e-12) return null;              // bearings parallel
            const t = ((B.x - A.x) * d2.y - (B.y - A.y) * d2.x) / den;
            const X = A.x + d1.x * t, Y = A.y + d1.y * t;

            const lat = oLat + deg(Y / R_EARTH);
            const lon = oLon + deg(X / (R_EARTH * k));
            if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90) return P;
            P = { lat, lon: ((lon + 540) % 360) - 180 };

            const e1 = wrap(bearing(P.lat, P.lon, lat1, lon1) - brgTo1);
            const e2 = wrap(bearing(P.lat, P.lon, lat2, lon2) - brgTo2);
            if (Math.abs(e1) < 1e-11 && Math.abs(e2) < 1e-11) return P;
            bb1 -= e1; bb2 -= e2;
            oLat = P.lat; oLon = P.lon;
        }
        return P;
    }

    /* ------------------------------------------------------------- coordinate text */

    function toDDM(lat, lon) {
        const one = (v, pos, neg, pad) => {
            const h = v < 0 ? neg : pos, a = Math.abs(v);
            let d = Math.floor(a), m = (a - d) * 60;
            /* Carry, or 50.99999° prints as "50° 60.000'" — which is not a position. */
            if (+m.toFixed(3) >= 60) { m = 0; d += 1; }
            return `${h} ${String(d).padStart(pad, '0')}° ${m.toFixed(3).padStart(6, '0')}'`;
        };
        return `${one(lat, 'N', 'S', 2)}  ${one(lon, 'E', 'W', 3)}`;
    }

    function toDMS(lat, lon) {
        const one = (v, pos, neg, pad) => {
            const h = v < 0 ? neg : pos, a = Math.abs(v);
            let d = Math.floor(a);
            const mf = (a - d) * 60;
            let m = Math.floor(mf);
            let s = (mf - m) * 60;
            if (+s.toFixed(2) >= 60) { s = 0; m += 1; }
            if (m >= 60) { m = 0; d += 1; }
            return `${h} ${String(d).padStart(pad, '0')}° ${String(m).padStart(2, '0')}' ${s.toFixed(2).padStart(5, '0')}"`;
        };
        return `${one(lat, 'N', 'S', 2)}  ${one(lon, 'E', 'W', 3)}`;
    }

    /**
     * Accepts almost anything a person, a chart or a GPS will hand you:
     *   "50.85, 4.35"   "-33.87 151.21"   "N 50 51.020 E 004 21.103"
     *   "50°51'01.2\"N 4°21'06.2\"E"    "50 51 01 4 21 06"
     * Returns { lat, lon }, or null rather than guessing past real ambiguity.
     */
    function parseLatLon(text) {
        if (!text) return null;
        const s = String(text).trim()
            .replace(/[\u2032\u2019]/g, "'")
            .replace(/[\u2033\u201D]/g, '"')
            .toUpperCase();

        /* One half of a position: 1–3 numbers, optionally hemisphere-tagged.
           The letter only counts at the very start or very end, so a place
           name like "BRUSSELS" cannot donate its S and flip the sign. */
        const readHalf = str => {
            const hm = str.match(/^\s*([NSEW])|([NSEW])\s*$/);
            const hem = hm ? (hm[1] || hm[2]) : null;
            const nums = str.match(/-?\d+(?:\.\d+)?/g);
            if (!nums || nums.length > 3) return null;
            const p = nums.map(Number);
            let v = Math.abs(p[0]) + Math.abs(p[1] || 0) / 60 + Math.abs(p[2] || 0) / 3600;
            if (p[0] < 0) v = -v;
            if (hem === 'S' || hem === 'W') v = -Math.abs(v);
            else if (hem === 'N' || hem === 'E') v = Math.abs(v);
            return { v, hem };
        };

        const idx = [];
        const numRe = /-?\d+(?:\.\d+)?/g;
        let m;
        while ((m = numRe.exec(s)) !== null) idx.push(m.index);
        if (idx.length < 2 || idx.length % 2 !== 0 || idx.length > 6) return null;

        let halves = null;

        // 1) An explicit separator is the most reliable signal there is.
        const bySep = s.split(/[,;]/);
        if (bySep.length === 2 && /\d/.test(bySep[0]) && /\d/.test(bySep[1])) halves = bySep;

        // 2) Exactly two hemisphere letters delimit the two halves.
        if (!halves) {
            const letters = [];
            for (let i = 0; i < s.length; i++) if ('NSEW'.indexOf(s[i]) >= 0) letters.push(i);
            if (letters.length === 2) {
                const prefixed = letters[0] < idx[0];        // "N50…" rather than "…50N"
                const cut = prefixed ? letters[1] : letters[0] + 1;
                halves = [s.slice(0, cut), s.slice(cut)];
            }
        }

        // 3) Otherwise split the number list down the middle.
        if (!halves) halves = [s.slice(0, idx[idx.length / 2]), s.slice(idx[idx.length / 2])];

        const a = readHalf(halves[0]), b = readHalf(halves[1]);
        if (!a || !b) return null;

        // Hemisphere letters decide the order; otherwise latitude comes first.
        let la = a, lo = b;
        if (a.hem === 'E' || a.hem === 'W' || b.hem === 'N' || b.hem === 'S') { la = b; lo = a; }
        if (!isFinite(la.v) || !isFinite(lo.v)) return null;
        if (Math.abs(la.v) > 90 || Math.abs(lo.v) > 180) return null;
        return { lat: la.v, lon: lo.v };
    }

    /* ------------------------------------------------------------------ UTM / MGRS */

    const A = 6378137.0, F = 1 / 298.257223563;
    const E2 = F * (2 - F), EP2 = E2 / (1 - E2), K0 = 0.9996;
    const BANDS = 'CDEFGHJKLMNPQRSTUVWXX';

    function latBand(lat) {
        if (lat >= 84) return 'X';
        if (lat < -80) return null;
        return BANDS.charAt(Math.floor((lat + 80) / 8));
    }

    /** WGS84 lat/lon → UTM. Handles the Norway (32V) and Svalbard exceptions. */
    function toUTM(lat, lon) {
        if (lat > 84 || lat < -80) return null;                  // UPS territory
        let zone = Math.floor((lon + 180) / 6) + 1;
        if (lat >= 56 && lat < 64 && lon >= 3 && lon < 12) zone = 32;
        if (lat >= 72 && lat < 84) {
            if (lon >= 0 && lon < 9) zone = 31;
            else if (lon >= 9 && lon < 21) zone = 33;
            else if (lon >= 21 && lon < 33) zone = 35;
            else if (lon >= 33 && lon < 42) zone = 37;
        }
        const lon0 = rad((zone - 1) * 6 - 180 + 3);
        const p = rad(lat), l = rad(lon);
        const N = A / Math.sqrt(1 - E2 * Math.sin(p) ** 2);
        const T = Math.tan(p) ** 2;
        const C = EP2 * Math.cos(p) ** 2;
        const Aa = Math.cos(p) * (l - lon0);
        const M = A * ((1 - E2 / 4 - 3 * E2 ** 2 / 64 - 5 * E2 ** 3 / 256) * p
            - (3 * E2 / 8 + 3 * E2 ** 2 / 32 + 45 * E2 ** 3 / 1024) * Math.sin(2 * p)
            + (15 * E2 ** 2 / 256 + 45 * E2 ** 3 / 1024) * Math.sin(4 * p)
            - (35 * E2 ** 3 / 3072) * Math.sin(6 * p));

        const easting = K0 * N * (Aa + (1 - T + C) * Aa ** 3 / 6
            + (5 - 18 * T + T ** 2 + 72 * C - 58 * EP2) * Aa ** 5 / 120) + 500000;
        let northing = K0 * (M + N * Math.tan(p) * (Aa ** 2 / 2
            + (5 - T + 9 * C + 4 * C ** 2) * Aa ** 4 / 24
            + (61 - 58 * T + T ** 2 + 600 * C - 330 * EP2) * Aa ** 6 / 720));
        if (lat < 0) northing += 10000000;

        return { zone, band: latBand(lat), easting, northing, hemisphere: lat < 0 ? 'S' : 'N' };
    }

    const COL = ['ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ'];
    const ROW = ['ABCDEFGHJKLMNPQRSTUV', 'FGHJKLMNPQRSTUVABCDE'];

    /** UTM → MGRS at the requested precision (1 m … 10 km). */
    function toMGRS(lat, lon, digits) {
        const u = toUTM(lat, lon);
        if (!u || !u.band) return null;
        const d = [5, 4, 3, 2, 1].indexOf(digits) >= 0 ? digits : 5;
        const col = COL[(u.zone - 1) % 3].charAt(Math.floor(u.easting / 100000) - 1);
        const row = ROW[(u.zone - 1) % 2].charAt(Math.floor(u.northing / 100000) % 20);
        if (!col || !row) return null;                       // outside the valid grid
        const cut = v => String(Math.floor((v % 100000) / Math.pow(10, 5 - d))).padStart(d, '0');
        return `${u.zone}${u.band} ${col}${row} ${cut(u.easting)} ${cut(u.northing)}`;
    }

    /* ----------------------------------------------------------------- Maidenhead */

    /** Amateur-radio grid square, 4/6/8 characters. */
    function toMaidenhead(lat, lon, len) {
        const n = [4, 6, 8].indexOf(len) >= 0 ? len : 6;
        /* The grid is defined on half-open intervals: exactly 180°E or 90°N
           would index one field past the end and produce a nonsense letter. */
        let x = Math.min(359.99999, Math.max(0, lon + 180));
        let y = Math.min(179.99999, Math.max(0, lat + 90));
        let s = String.fromCharCode(65 + Math.floor(x / 20)) + String.fromCharCode(65 + Math.floor(y / 10));
        x %= 20; y %= 10;
        s += Math.floor(x / 2) + '' + Math.floor(y / 1);
        if (n === 4) return s;
        x %= 2; y %= 1;
        s += String.fromCharCode(97 + Math.floor(x * 12)) + String.fromCharCode(97 + Math.floor(y * 24));
        if (n === 6) return s;
        x = x * 12 % 1; y = y * 24 % 1;
        return s + Math.floor(x * 10) + '' + Math.floor(y * 10);
    }

    /* ---------------------------------------------------------------------- solar */

    const J2000 = 2451545.0;
    const OBLIQ = rad(23.4397);

    const toJulian = date => date.valueOf() / 86400000 - 0.5 + 2440588;
    const fromJulian = j => new Date((j + 0.5 - 2440588) * 86400000);
    const daysSince2000 = date => toJulian(date) - J2000;

    function solarCoords(d) {
        const M = rad(357.5291 + 0.98560028 * d);                      // mean anomaly
        const C = rad(1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
        const L = M + C + rad(102.9372) + Math.PI;                     // ecliptic longitude
        const dec = Math.asin(Math.sin(L) * Math.sin(OBLIQ));
        const ra = Math.atan2(Math.sin(L) * Math.cos(OBLIQ), Math.cos(L));
        return { M, L, dec, ra };
    }

    const siderealTime = (d, lw) => rad(280.16 + 360.9856235 * d) - lw;

    /** Sun altitude + azimuth (azimuth measured clockwise FROM TRUE NORTH). */
    function sunPosition(date, lat, lon) {
        const lw = rad(-lon), phi = rad(lat), d = daysSince2000(date);
        const c = solarCoords(d);
        const H = siderealTime(d, lw) - c.ra;
        const alt = Math.asin(Math.sin(phi) * Math.sin(c.dec) + Math.cos(phi) * Math.cos(c.dec) * Math.cos(H));
        const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(c.dec) * Math.cos(phi));
        return { altitude: deg(alt), azimuth: norm360(deg(az) + 180), declination: deg(c.dec) };
    }

    /**
     * Sun event times for the local day containing `date`.
     * `angles` are altitudes in degrees: -0.833 rise/set, -6 civil, -12 nautical, -18 astro.
     * Returns { transit, events: { '-0.833': {rise, set}, … } } — null when it never happens.
     */
    function sunTimes(date, lat, lon, angles) {
        const lw = rad(-lon), phi = rad(lat);
        const n = Math.round(daysSince2000(date) - 0.0009 - lw / (2 * Math.PI));
        const ds = 0.0009 + lw / (2 * Math.PI) + n;
        const c = solarCoords(ds);
        const jTransit = J2000 + ds + 0.0053 * Math.sin(c.M) - 0.0069 * Math.sin(2 * (c.L - Math.PI));

        const out = { transit: fromJulian(jTransit), events: {} };
        for (const h of (angles || [-0.833, -6, -12, -18])) {
            const cosW = (Math.sin(rad(h)) - Math.sin(phi) * Math.sin(c.dec)) / (Math.cos(phi) * Math.cos(c.dec));
            if (cosW > 1) { out.events[h] = { rise: null, set: null, state: 'stays below' }; continue; }
            if (cosW < -1) { out.events[h] = { rise: null, set: null, state: 'stays above' }; continue; }
            const w = Math.acos(cosW);
            const jSet = J2000 + (0.0009 + (w + lw) / (2 * Math.PI) + n)
                + 0.0053 * Math.sin(c.M) - 0.0069 * Math.sin(2 * (c.L - Math.PI));
            out.events[h] = { rise: fromJulian(jTransit - (jSet - jTransit)), set: fromJulian(jSet), state: 'ok' };
        }
        return out;
    }

    /* ----------------------------------------------------------------------- moon */

    const SYNODIC = 29.530588853;
    const NEW_MOON_J = 2451550.09766;   // 2000-01-06 18:14 UTC

    function moonPhase(date) {
        const j = toJulian(date);
        let age = (j - NEW_MOON_J) % SYNODIC;
        if (age < 0) age += SYNODIC;
        const frac = age / SYNODIC;
        const illum = (1 - Math.cos(2 * Math.PI * frac)) / 2;
        /* Monochrome glyphs only: a colour emoji moon would blaze white in the
           night-vision theme and cost the reader their dark adaptation. */
        const names = [
            [0.020, 'New moon', '●'], [0.235, 'Waxing crescent', '◔'], [0.265, 'First quarter', '◑'],
            [0.485, 'Waxing gibbous', '◕'], [0.515, 'Full moon', '○'], [0.735, 'Waning gibbous', '◕'],
            [0.765, 'Last quarter', '◐'], [0.980, 'Waning crescent', '◔'], [1.001, 'New moon', '●'],
        ];
        const hit = names.find(n => frac < n[0]) || names[names.length - 1];
        return { age, fraction: frac, illumination: illum, name: hit[1], glyph: hit[2] };
    }

    /* ------------------------------------------------------- local tangent plane */

    /**
     * Equirectangular projection about `origin` — metres east/north.
     * Accurate enough for a plot board out to a few hundred kilometres.
     */
    function project(originLat, originLon, lat, lon) {
        const k = Math.cos(rad(originLat));
        return {
            x: rad(lon - originLon) * R_EARTH * k,
            y: rad(lat - originLat) * R_EARTH,
        };
    }

    /* ------------------------------------------------------------------ formatting */

    function fmtDistance(m) {
        if (!isFinite(m)) return '—';
        if (m < 1000) return `${m.toFixed(m < 100 ? 1 : 0)} m`;
        if (m < 100000) return `${(m / 1000).toFixed(2)} km`;
        return `${(m / 1000).toFixed(0)} km`;
    }

    /** 348° → "NNW". 16-point compass rose. */
    function compassPoint(brg) {
        const pts = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
            'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        return pts[Math.round(norm360(brg) / 22.5) % 16];
    }

    /** Mils are what a military compass and most rifle optics speak. */
    const degToMil = d => norm360(d) * 6400 / 360;

    window.GEO = {
        R_EARTH, rad, deg, norm360,
        distance, bearing, destination, resect,
        toDDM, toDMS, parseLatLon, toUTM, toMGRS, toMaidenhead, latBand,
        sunPosition, sunTimes, moonPhase, toJulian, fromJulian,
        project, fmtDistance, compassPoint, degToMil,
    };
})();
