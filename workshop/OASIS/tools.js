/* ==========================================================================
   O.A.S.I.S. — tools.js
   --------------------------------------------------------------------------
   Every calculator in the system, declared as data.

   Tool schema
     id, chapter, title, glyph, blurb
     fields[]   { k, label, type, def, step, min, max, options[], hint, wide }
     run(v)     → { rows: [[label, value, 'hero'?], …], msg, alarm }
     mount(el, ctx)  optional — build interactive widgets once.
                     ctx = { values(), recompute(), out }
     draw(el, v)     optional — redraw a canvas or live element on every change.

   Nothing here touches the network, and nothing needs a library.
   ========================================================================== */

(function () {
    'use strict';

    const G = window.GEO;
    /* An empty field must fall back to the default, NOT to zero: `+'' === 0`
       is finite, so a naive isFinite check silently turns a cleared box into
       a real zero and then into NaN further down. */
    const n = (x, d) => {
        if (x === '' || x == null) return d;
        const v = +x;
        return Number.isFinite(v) ? v : d;
    };
    const f = (x, p) => Number.isFinite(x) ? x.toFixed(p == null ? 2 : p) : '—';
    const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

    /* Shared audio context — created on first user gesture, never before. */
    let AC = null;
    function audio() {
        if (!AC) {
            const C = window.AudioContext || window.webkitAudioContext;
            if (C) AC = new C();
        }
        if (AC && AC.state === 'suspended') AC.resume();
        return AC;
    }

    function beep(freq, ms, vol) {
        const ac = audio();
        if (!ac) return;
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, ac.currentTime);
        g.gain.linearRampToValueAtTime(vol == null ? 0.25 : vol, ac.currentTime + 0.008);
        g.gain.setValueAtTime(vol == null ? 0.25 : vol, ac.currentTime + ms / 1000 - 0.01);
        g.gain.linearRampToValueAtTime(0, ac.currentTime + ms / 1000);
        o.connect(g).connect(ac.destination);
        o.start();
        o.stop(ac.currentTime + ms / 1000 + 0.02);
    }

    const MORSE = {
        A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
        I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
        Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
        Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
        5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
        '.': '.-.-.-', ',': '--..--', '?': '..--..', '/': '-..-.', '-': '-....-',
        '(': '-.--.', ')': '-.--.-', ':': '---...', "'": '.----.', '=': '-...-', '+': '.-.-.', '@': '.--.-.',
    };

    const localISO = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    /* 24-hour, always. "7:30" without a suffix has killed people. */
    const hhmm = d => d instanceof Date && !isNaN(d)
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '—';

    /**
     * Exact Morse timing. The unit is the dot: elements inside a letter are
     * separated by 1 unit, letters by 3, words by 7. Getting this wrong makes
     * a signal that a trained listener cannot read.
     *
     * SOS is a prosign — it is sent as one unbroken group with no letter gaps,
     * which is what makes it recognisable. It is special-cased for that reason.
     */
    function morseSchedule(text, dot) {
        const events = [];
        let t = 0;
        const raw = String(text || '').toUpperCase().trim();
        const words = raw ? raw.split(/\s+/) : [];
        const prosign = raw === 'SOS';

        words.forEach((word, wi) => {
            const chars = word.split('');
            chars.forEach((ch, ci) => {
                const code = MORSE[ch];
                if (!code) return;
                code.split('').forEach(sym => {
                    const len = sym === '-' ? dot * 3 : dot;
                    events.push({ at: t, len });
                    t += len + dot;                          // 1-unit gap after each element
                });
                if (!prosign && ci < chars.length - 1) t += dot * 2;   // → 3 units between letters
            });
            if (wi < words.length - 1) t += dot * 6;          // → 7 units between words
        });

        return { events, total: events.length ? t - dot : 0 };
    }

    /* Parses "name, lat, lon" per line — the shared waypoint format. */
    function parseWaypoints(text) {
        const out = [];
        String(text || '').split(/\r?\n/).forEach(line => {
            const t = line.trim();
            if (!t || t.charAt(0) === '#') return;
            const parts = t.split(/[,;\t]/).map(s => s.trim()).filter(Boolean);
            /* Take the LAST one or two fields as the position and treat
               everything before it as the name, so "Bear Ridge, 50.8, 4.3"
               cannot have its name parsed as a hemisphere. */
            let ll = null, name = '';
            for (let take = Math.min(2, parts.length); take >= 1 && !ll; take--) {
                ll = G.parseLatLon(parts.slice(-take).join(' '));
                if (ll) name = parts.slice(0, parts.length - take).join(', ');
            }
            if (ll) out.push({ name: name || `WP${out.length + 1}`, lat: ll.lat, lon: ll.lon });
        });
        return out;
    }

    window.OASIS_TOOLS = [

        /* ================================================================ NAV */
        {
            id: 'coord',
            chapter: 'nav',
            title: 'Coordinate converter',
            glyph: '⌖',
            blurb: 'One position in every format anyone will ask you for. Paste almost any notation into the free-text box.',
            fields: [
                { k: 'paste', label: 'Paste any position', type: 'text', def: '', wide: true, hint: 'e.g. 50.8503, 4.3517  ·  N 50 51.02 E 004 21.10  ·  50°51\'01"N 4°21\'06"E' },
                { k: 'lat', label: 'Latitude (°)', type: 'number', def: 50.85034, step: 'any' },
                { k: 'lon', label: 'Longitude (°)', type: 'number', def: 4.35171, step: 'any' },
                { k: 'prec', label: 'MGRS precision', type: 'select', def: '5', options: [['5', '10 digits — 1 m'], ['4', '8 digits — 10 m'], ['3', '6 digits — 100 m'], ['2', '4 digits — 1 km'], ['1', '2 digits — 10 km']] },
            ],
            run(v) {
                let lat = n(v.lat, 0), lon = n(v.lon, 0);
                const p = v.paste && G.parseLatLon(v.paste);
                if (p) { lat = p.lat; lon = p.lon; }
                if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return { rows: [], msg: 'Latitude must be −90…90 and longitude −180…180.', alarm: true };

                const u = G.toUTM(lat, lon);
                const mgrs = G.toMGRS(lat, lon, +v.prec);
                const rows = [
                    ['Decimal degrees', `${lat.toFixed(6)}, ${lon.toFixed(6)}`, 'hero'],
                    ['Degrees + minutes', G.toDDM(lat, lon)],
                    ['Deg min sec', G.toDMS(lat, lon)],
                    ['UTM', u ? `${u.zone}${u.band} ${Math.round(u.easting)}E ${Math.round(u.northing)}N` : 'outside UTM (polar)'],
                    ['MGRS', mgrs || 'outside MGRS (polar)'],
                    ['Maidenhead', G.toMaidenhead(lat, lon, 8)],
                    ['Hemisphere', `${lat >= 0 ? 'Northern' : 'Southern'} · ${lon >= 0 ? 'Eastern' : 'Western'}`],
                ];
                return {
                    rows,
                    msg: p ? 'Parsed from the pasted text. Clear that box to use the numeric fields.'
                        : 'Datum is WGS84 — state that when you pass the position on.',
                };
            },
        },

        {
            id: 'distbrg',
            chapter: 'nav',
            title: 'Distance and bearing',
            glyph: '↗',
            blurb: 'Great-circle distance and true, magnetic and mil bearings between two points, with a walking time estimate.',
            fields: [
                { k: 'a', label: 'From (lat, lon)', type: 'text', def: '50.85034, 4.35171', wide: true },
                { k: 'b', label: 'To (lat, lon)', type: 'text', def: '50.89120, 4.41960', wide: true },
                { k: 'dec', label: 'Magnetic declination (° E+)', type: 'number', def: 1.5, step: 0.1 },
                { k: 'ascent', label: 'Ascent on route (m)', type: 'number', def: 120, step: 10 },
            ],
            run(v) {
                const A = G.parseLatLon(v.a), B = G.parseLatLon(v.b);
                if (!A || !B) return { rows: [], msg: 'Enter both positions as "lat, lon".', alarm: true };

                const d = G.distance(A.lat, A.lon, B.lat, B.lon);
                const t = G.bearing(A.lat, A.lon, B.lat, B.lon);
                const back = G.norm360(t + 180);
                const dec = n(v.dec, 0);
                const mag = G.norm360(t - dec);           // true → magnetic: subtract east declination
                const km = d / 1000, asc = Math.max(0, n(v.ascent, 0));
                const hours = km / 5 + asc / 600;         // Naismith

                return {
                    rows: [
                        ['Distance', G.fmtDistance(d), 'hero'],
                        ['True bearing', `${f(t, 1)}°  (${G.compassPoint(t)})`],
                        ['Magnetic bearing', `${f(mag, 1)}°  — set this on the compass`],
                        ['Back bearing (true)', `${f(back, 1)}°`],
                        ['Mils (NATO)', `${Math.round(G.degToMil(t))} mils`],
                        ['Naismith time', `${Math.floor(hours)} h ${Math.round((hours % 1) * 60)} min at 5 km/h`],
                        ['Realistic (rough ground)', `${Math.floor(hours * 1.35)} h ${Math.round(((hours * 1.35) % 1) * 60)} min`],
                        ['Nautical miles', `${f(d / 1852, 2)} NM`],
                    ],
                    msg: 'Declination sign: east positive. True → magnetic subtracts east declination; a 1° error costs ~17 m per km.',
                };
            },
        },

        {
            id: 'dest',
            chapter: 'nav',
            title: 'Project a waypoint',
            glyph: '⇥',
            blurb: 'Where do I end up if I walk this bearing for this distance? Also converts a magnetic bearing you read off a compass into a real position.',
            fields: [
                { k: 'a', label: 'Start (lat, lon)', type: 'text', def: '50.85034, 4.35171', wide: true },
                { k: 'brg', label: 'Bearing (°)', type: 'number', def: 45, step: 0.5 },
                { k: 'type', label: 'Bearing type', type: 'select', def: 'mag', options: [['mag', 'Magnetic (off a compass)'], ['true', 'True / grid']] },
                { k: 'dec', label: 'Declination (° E+)', type: 'number', def: 1.5, step: 0.1 },
                { k: 'dist', label: 'Distance (m)', type: 'number', def: 2500, step: 10 },
            ],
            run(v) {
                const A = G.parseLatLon(v.a);
                if (!A) return { rows: [], msg: 'Enter the start position as "lat, lon".', alarm: true };
                const trueBrg = v.type === 'mag' ? G.norm360(n(v.brg, 0) + n(v.dec, 0)) : G.norm360(n(v.brg, 0));
                const d = Math.max(0, n(v.dist, 0));
                const P = G.destination(A.lat, A.lon, trueBrg, d);
                return {
                    rows: [
                        ['Position', `${P.lat.toFixed(6)}, ${P.lon.toFixed(6)}`, 'hero'],
                        ['MGRS', G.toMGRS(P.lat, P.lon, 4) || '—'],
                        ['Deg + min', G.toDDM(P.lat, P.lon)],
                        ['True bearing used', `${f(trueBrg, 1)}° (${G.compassPoint(trueBrg)})`],
                        ['Return bearing (true)', `${f(G.norm360(trueBrg + 180), 1)}°`],
                        ['Return bearing (magnetic)', `${f(G.norm360(trueBrg + 180 - n(v.dec, 0)), 1)}°`],
                    ],
                    msg: 'Write the return bearing down before you set off. It is the number you will want and cannot compute when tired.',
                };
            },
        },

        {
            id: 'resection',
            chapter: 'nav',
            title: 'Resection — where am I?',
            glyph: '⊕',
            blurb: 'Two landmarks you can see and identify, two compass bearings, and your own position falls out. No GPS involved.',
            fields: [
                { k: 'p1', label: 'Landmark 1 (lat, lon)', type: 'text', def: '50.9000, 4.3000', wide: true },
                { k: 'b1', label: 'Bearing TO landmark 1 (°)', type: 'number', def: 340, step: 0.5 },
                { k: 'p2', label: 'Landmark 2 (lat, lon)', type: 'text', def: '50.8600, 4.4500', wide: true },
                { k: 'b2', label: 'Bearing TO landmark 2 (°)', type: 'number', def: 75, step: 0.5 },
                { k: 'dec', label: 'Declination (° E+)', type: 'number', def: 1.5, step: 0.1 },
                { k: 'type', label: 'Bearings are', type: 'select', def: 'mag', options: [['mag', 'Magnetic'], ['true', 'True / grid']] },
            ],
            run(v) {
                const P1 = G.parseLatLon(v.p1), P2 = G.parseLatLon(v.p2);
                if (!P1 || !P2) return { rows: [], msg: 'Enter both landmark positions.', alarm: true };
                const dec = v.type === 'mag' ? n(v.dec, 0) : 0;
                const t1 = G.norm360(n(v.b1, 0) + dec), t2 = G.norm360(n(v.b2, 0) + dec);
                const cut = Math.abs(((t1 - t2 + 540) % 360) - 180);

                // Iterative resection — handles meridian convergence correctly.
                const me = G.resect(P1.lat, P1.lon, t1, P2.lat, P2.lon, t2);
                if (!me) return { rows: [['Cut angle', `${f(cut, 0)}°`]], msg: 'Those bearings do not intersect. Check that you have not swapped the landmarks, and that the bearings really point at them.', alarm: true };

                const rows = [
                    ['Your position', `${me.lat.toFixed(5)}, ${me.lon.toFixed(5)}`, 'hero'],
                    ['MGRS', G.toMGRS(me.lat, me.lon, 4) || '—'],
                    ['Deg + min', G.toDDM(me.lat, me.lon)],
                    ['Distance to landmark 1', G.fmtDistance(G.distance(me.lat, me.lon, P1.lat, P1.lon))],
                    ['Distance to landmark 2', G.fmtDistance(G.distance(me.lat, me.lon, P2.lat, P2.lon))],
                    ['Cut angle', `${f(cut, 0)}°`],
                ];
                let msg = 'Confirm with a third landmark whenever you can.';
                let alarm = false;
                if (cut < 30 || cut > 150) { msg = 'Cut angle is poor. Bearings closer than 30° apart give a long, unreliable fix — pick landmarks 60–120° apart.'; alarm = true; }
                return { rows, msg, alarm };
            },
        },

        {
            id: 'sunmoon',
            chapter: 'nav',
            title: 'Sun and moon',
            glyph: '☉',
            blurb: 'Sunrise, sunset, twilight, solar noon and the sun\'s exact bearing right now — which is also how you check a compass or find true north without one.',
            fields: [
                { k: 'pos', label: 'Position (lat, lon)', type: 'text', def: '50.85034, 4.35171', wide: true },
                { k: 'when', label: 'Date and time (local)', type: 'datetime-local', def: '' },
            ],
            run(v) {
                const P = G.parseLatLon(v.pos);
                if (!P) return { rows: [], msg: 'Enter a position as "lat, lon".', alarm: true };
                const when = v.when ? new Date(v.when) : new Date();
                if (isNaN(when)) return { rows: [], msg: 'Invalid date.', alarm: true };

                const t = G.sunTimes(when, P.lat, P.lon, [-0.833, -6, -12, -18]);
                const s = G.sunPosition(when, P.lat, P.lon);
                const m = G.moonPhase(when);
                const day = t.events['-0.833'];
                const civil = t.events['-6'];
                const len = day.rise && day.set ? (day.set - day.rise) / 3600000 : null;
                /* At high latitude there is simply no rise or set. Say which. */
                const polar = (ev, below, above) =>
                    ev.state === 'stays below' ? below : ev.state === 'stays above' ? above : null;

                const rows = [
                    ['Sun bearing now', `${f(s.azimuth, 1)}° true (${G.compassPoint(s.azimuth)})`, 'hero'],
                    ['Sun altitude', `${f(s.altitude, 1)}°${s.altitude < 0 ? ' — below horizon' : ''}`],
                    ['Solar noon (true south/north)', hhmm(t.transit)],
                    ['Sunrise', day.state === 'ok' ? hhmm(day.rise) : polar(day, 'none — polar night', 'none — midnight sun')],
                    ['Sunset', day.state === 'ok' ? hhmm(day.set) : polar(day, 'none — polar night', 'none — midnight sun')],
                    ['Civil twilight', civil.state === 'ok' ? `${hhmm(civil.rise)} → ${hhmm(civil.set)}`
                        : polar(civil, 'never gets light', 'never gets dark')],
                    ['Nautical twilight ends', t.events['-12'].state === 'ok' ? hhmm(t.events['-12'].set)
                        : polar(t.events['-12'], 'never reached', 'never reached')],
                    ['Astronomical dark', t.events['-18'].state === 'ok' ? `after ${hhmm(t.events['-18'].set)}`
                        : polar(t.events['-18'], 'all day', 'never fully dark')],
                    ['Day length', len ? `${Math.floor(len)} h ${Math.round((len % 1) * 60)} min`
                        : (day.state === 'stays above' ? '24 h' : day.state === 'stays below' ? '0 h' : '—')],
                    ['Moon', `${m.glyph} ${m.name} — ${Math.round(m.illumination * 100)} % lit, age ${f(m.age, 1)} days`],
                    ['Solar declination', `${f(s.declination, 2)}°`],
                ];

                let msg = 'To find true north: point the sun bearing above at the sun, and north is 0° on that same rotation. To check a compass: read the sun\'s magnetic bearing and subtract it from the true bearing here — the difference is your local declination.';
                if (day.state === 'ok' && day.set) {
                    const left = (day.set - when) / 3600000;
                    if (left > 0 && left < 3) msg = `⚠ ${f(left, 1)} hours of daylight left. Stop travelling and build shelter now — do not run out of light mid-task.`;
                }
                return { rows, msg };
            },
            mount(el, ctx) {
                const input = el.closest('.tool').querySelector('[name="when"]');
                if (input && !input.value) { input.value = localISO(new Date()); ctx.recompute(); }
            },
        },

        {
            id: 'declination',
            chapter: 'nav',
            title: 'Find magnetic declination from the sun',
            glyph: '⊕',
            blurb: 'No magnetic model, no internet, no map margin. Compare the compass bearing you read to the sun against the sun\'s true bearing computed here, and the difference IS your local declination.',
            fields: [
                { k: 'pos', label: 'Position (lat, lon)', type: 'text', def: '50.85034, 4.35171', wide: true },
                { k: 'when', label: 'Time of the observation (local)', type: 'datetime-local', def: '' },
                { k: 'obs', label: 'Compass bearing you read to the sun (°)', type: 'number', def: 180, step: 0.5, min: 0, max: 360 },
            ],
            run(v) {
                const P = G.parseLatLon(v.pos);
                if (!P) return { rows: [], msg: 'Enter a position as "lat, lon".', alarm: true };
                const when = v.when ? new Date(v.when) : new Date();
                if (isNaN(when)) return { rows: [], msg: 'Invalid date.', alarm: true };

                const s = G.sunPosition(when, P.lat, P.lon);
                const obs = G.norm360(n(v.obs, 0));
                /* declination = true - magnetic, east positive */
                const dec = ((s.azimuth - obs + 540) % 360) - 180;

                const rows = [
                    ['Local declination', `${dec >= 0 ? '+' : ''}${f(dec, 1)}° ${dec >= 0 ? 'EAST' : 'WEST'}`, 'hero'],
                    ['Sun\'s true bearing now', `${f(s.azimuth, 1)}° (${G.compassPoint(s.azimuth)})`],
                    ['Sun altitude', `${f(s.altitude, 1)}°`],
                    ['Use it: true → magnetic', `${dec >= 0 ? 'subtract' : 'add'} ${f(Math.abs(dec), 1)}°`],
                    ['Use it: magnetic → true', `${dec >= 0 ? 'add' : 'subtract'} ${f(Math.abs(dec), 1)}°`],
                ];

                let msg = 'Sight the sun with the compass — safely, never through a lens and never staring at it. '
                    + 'Take three readings and average them. Then set this number on your compass\'s declination '
                    + 'adjustment and write it on the compass and in your log.';
                let alarm = false;
                if (s.altitude < 0) {
                    msg = '⚠ The sun is below the horizon at that time and place, so no bearing to it exists. Check the time.';
                    alarm = true;
                } else if (s.altitude > 60) {
                    msg = '⚠ The sun is very high (' + f(s.altitude, 0) + '°). A bearing to a high sun is inaccurate — '
                        + 'take the observation within a couple of hours of sunrise or sunset instead.';
                    alarm = true;
                }
                return { rows, msg, alarm };
            },
            mount(el, ctx) {
                const input = el.closest('.tool').querySelector('[name="when"]');
                if (input && !input.value) { input.value = localISO(new Date()); ctx.recompute(); }
            },
        },

        {
            id: 'pace',
            chapter: 'nav',
            title: 'Pace count',
            glyph: '⇢',
            blurb: 'Calibrate your pace on a measured 100 m, then convert counts into distance — the way you navigate in fog, forest and darkness.',
            fields: [
                { k: 'cal', label: 'Double-paces per 100 m', type: 'number', def: 65, step: 1, min: 20 },
                { k: 'count', label: 'Paces counted', type: 'number', def: 260, step: 1 },
                { k: 'terrain', label: 'Terrain', type: 'select', def: '1', options: [['1', 'Flat, firm, daylight'], ['1.1', 'Rough ground / light brush'], ['1.2', 'Steep uphill'], ['0.9', 'Steep downhill'], ['1.25', 'Deep snow or sand'], ['1.15', 'Night / heavy load']] },
                { k: 'target', label: 'Distance to cover (m)', type: 'number', def: 750, step: 10 },
            ],
            run(v) {
                const cal = Math.max(1, n(v.cal, 65)) * n(v.terrain, 1);
                const dist = n(v.count, 0) / cal * 100;
                const need = n(v.target, 0) * cal / 100;
                return {
                    rows: [
                        ['Distance travelled', G.fmtDistance(dist), 'hero'],
                        ['Adjusted pace count', `${f(cal, 1)} double-paces per 100 m`],
                        ['Paces to reach target', `${Math.round(need)} double-paces`],
                        ['Ranger beads to move', `${Math.round(n(v.target, 0) / 100)} × 100 m segments`],
                        ['Expected error', `± ${G.fmtDistance(dist * 0.07)} (about 7 % without a fix)`],
                    ],
                    msg: 'Count every time your LEFT foot lands. Move a bead or a pebble at each 100 m — you will lose count otherwise, and you will not notice that you have.',
                };
            },
        },

        {
            id: 'plot',
            chapter: 'nav',
            title: 'Plot board',
            glyph: '▦',
            blurb: 'An offline map substitute. Enter waypoints as coordinates and it draws their true geometry with a scale bar and north arrow, then gives you a leg-by-leg route card.',
            fields: [
                {
                    k: 'wps', label: 'Waypoints — one per line: name, lat, lon', type: 'textarea', wide: true,
                    def: 'START, 50.8503, 4.3517\nBRIDGE, 50.8621, 4.3702\nWATER, 50.8688, 4.3411\nRALLY, 50.8802, 4.3605',
                },
                { k: 'dec', label: 'Declination (° E+)', type: 'number', def: 1.5, step: 0.1 },
                { k: 'speed', label: 'Travel speed (km/h)', type: 'number', def: 4, step: 0.5, min: 0.5 },
            ],
            run(v) {
                const wps = parseWaypoints(v.wps);
                if (wps.length < 1) return { rows: [], msg: 'Enter at least one waypoint as "name, lat, lon".', alarm: true };
                if (wps.length === 1) return { rows: [[wps[0].name, `${wps[0].lat.toFixed(5)}, ${wps[0].lon.toFixed(5)}`]], msg: 'Add a second waypoint to get a route card.' };

                const dec = n(v.dec, 0), spd = Math.max(0.5, n(v.speed, 4));
                const rows = [];
                let total = 0;
                for (let i = 1; i < wps.length; i++) {
                    const a = wps[i - 1], b = wps[i];
                    const d = G.distance(a.lat, a.lon, b.lat, b.lon);
                    const t = G.bearing(a.lat, a.lon, b.lat, b.lon);
                    total += d;
                    const mag = Math.round(G.norm360(t - dec)) % 360;
                    rows.push([`${i}. ${a.name} → ${b.name}`,
                    `${String(mag).padStart(3, '0')}° mag · ${G.fmtDistance(d)} · ${Math.round(d / 1000 / spd * 60)} min`]);
                }
                rows.unshift(['Total route', `${G.fmtDistance(total)} · ${f(total / 1000 / spd, 1)} h`, 'hero']);
                return { rows, msg: 'Bearings are magnetic — set them straight onto a compass. Copy this card onto paper before you rely on it.' };
            },
            draw(el, v) {
                const wps = parseWaypoints(v.wps);
                let cv = el.querySelector('canvas');
                if (!cv) {
                    cv = document.createElement('canvas');
                    cv.className = 'plot';
                    cv.width = 900; cv.height = 620;
                    cv.setAttribute('role', 'img');
                    el.appendChild(cv);
                }
                cv.setAttribute('aria-label', `Plot of ${wps.length} waypoints`);
                const g = cv.getContext('2d');
                const cs = getComputedStyle(document.documentElement);
                const ink = cs.getPropertyValue('--ink').trim() || '#ddd';
                const dim = cs.getPropertyValue('--ink-dim').trim() || '#888';
                const acc = cs.getPropertyValue('--accent').trim() || '#5f5';
                const warn = cs.getPropertyValue('--warn').trim() || '#fa4';
                const bg = cs.getPropertyValue('--bg-2').trim() || '#111';

                g.fillStyle = bg;
                g.fillRect(0, 0, cv.width, cv.height);
                if (!wps.length) return;

                const o = wps[0];
                const pts = wps.map(w => Object.assign({}, w, G.project(o.lat, o.lon, w.lat, w.lon)));
                const minX = Math.min.apply(null, pts.map(p => p.x)), maxX = Math.max.apply(null, pts.map(p => p.x));
                const minY = Math.min.apply(null, pts.map(p => p.y)), maxY = Math.max.apply(null, pts.map(p => p.y));
                const spanX = Math.max(maxX - minX, 1), spanY = Math.max(maxY - minY, 1);
                const pad = 70;
                const k = Math.min((cv.width - pad * 2) / spanX, (cv.height - pad * 2) / spanY);
                const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
                const X = p => cv.width / 2 + (p.x - cx) * k;
                const Y = p => cv.height / 2 - (p.y - cy) * k;

                // Grid at a round metric interval.
                const targetPx = 110;
                const raw = targetPx / k;
                const pow = Math.pow(10, Math.floor(Math.log10(raw)));
                let step = [1, 2, 5, 10].map(m => m * pow).find(s => s >= raw) || pow * 10;
                /* A zero or non-finite step would make the loops below never
                   terminate and hang the page. Never risk that here. */
                if (!isFinite(step) || step <= 0) step = 1;

                // Cover the whole canvas, not just the waypoint bounding box.
                const left = cx - (cv.width / 2) / k, right = cx + (cv.width / 2) / k;
                const bottom = cy - (cv.height / 2) / k, top = cy + (cv.height / 2) / k;
                g.strokeStyle = dim; g.globalAlpha = 0.18; g.lineWidth = 1;
                for (let gx = Math.ceil(left / step) * step; gx <= right; gx += step) {
                    const px = X({ x: gx }); g.beginPath(); g.moveTo(px, 0); g.lineTo(px, cv.height); g.stroke();
                }
                for (let gy = Math.ceil(bottom / step) * step; gy <= top; gy += step) {
                    const py = Y({ y: gy }); g.beginPath(); g.moveTo(0, py); g.lineTo(cv.width, py); g.stroke();
                }
                g.globalAlpha = 1;

                // Route.
                if (pts.length > 1) {
                    g.strokeStyle = acc; g.lineWidth = 2.5; g.setLineDash([9, 6]);
                    g.beginPath();
                    pts.forEach((p, i) => i ? g.lineTo(X(p), Y(p)) : g.moveTo(X(p), Y(p)));
                    g.stroke();
                    g.setLineDash([]);
                }

                // Waypoints.
                g.font = '600 15px ui-monospace, monospace';
                pts.forEach((p, i) => {
                    const px = X(p), py = Y(p);
                    g.fillStyle = i === 0 ? warn : acc;
                    g.beginPath(); g.arc(px, py, 6, 0, Math.PI * 2); g.fill();
                    g.strokeStyle = bg; g.lineWidth = 2; g.stroke();
                    g.fillStyle = ink;
                    g.fillText(p.name, px + 11, py + 5);
                });

                // North arrow.
                g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 2;
                const ax = cv.width - 42, ay = 34;
                g.beginPath(); g.moveTo(ax, ay + 40); g.lineTo(ax, ay); g.stroke();
                g.beginPath(); g.moveTo(ax, ay - 6); g.lineTo(ax - 6, ay + 8); g.lineTo(ax + 6, ay + 8); g.closePath(); g.fill();
                g.font = '700 14px ui-monospace, monospace';
                g.fillText('N', ax - 5, ay + 58);

                // Scale bar.
                const barPx = step * k;
                const bx = 34, by = cv.height - 34;
                g.strokeStyle = ink; g.lineWidth = 3;
                g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + barPx, by); g.stroke();
                g.beginPath(); g.moveTo(bx, by - 6); g.lineTo(bx, by + 6);
                g.moveTo(bx + barPx, by - 6); g.lineTo(bx + barPx, by + 6); g.stroke();
                g.font = '600 13px ui-monospace, monospace';
                g.fillStyle = ink;
                g.fillText(step >= 1000 ? `${step / 1000} km` : `${step} m`, bx, by - 12);
            },
        },

        /* ============================================================== COMMS */
        {
            id: 'antenna',
            chapter: 'comms',
            title: 'Antenna cutting chart',
            glyph: '∏',
            blurb: 'Wire lengths for any frequency. The single cheapest way to double your usable range is to replace a stubby antenna with a correctly cut one.',
            fields: [
                { k: 'f', label: 'Frequency (MHz)', type: 'number', def: 145.5, step: 0.001, min: 0.1 },
                { k: 'vf', label: 'Velocity factor', type: 'number', def: 0.95, step: 0.01, min: 0.5, max: 1, hint: '0.95 for bare wire, 0.66 for typical coax' },
            ],
            run(v) {
                const fr = Math.max(0.01, n(v.f, 145.5));
                const vf = clamp(n(v.vf, 0.95), 0.3, 1);
                const lam = 299.792458 / fr;
                const el = lam * vf;
                const m = x => `${f(x, 3)} m  (${f(x * 39.3701, 1)} in)`;
                return {
                    rows: [
                        ['Quarter wave (whip / radial)', m(el / 4), 'hero'],
                        ['Half-wave dipole, each leg', m(el / 4)],
                        ['Half-wave dipole, total', m(el / 2)],
                        ['5/8 wave vertical', m(el * 0.625)],
                        /* The 1005/f loop rule already allows for end effect,
                           so the velocity factor must NOT be applied again. */
                        ['Full-wave loop (total wire)', m(lam * 1.021)],
                        ['J-pole: long element / stub', `${m(el * 0.75)} / ${m(el / 4)}`],
                        ['Free-space wavelength', m(lam)],
                        ['Coax quarter-wave stub (VF 0.66)', m(lam * 0.66 / 4)],
                    ],
                    msg: 'Cut long, then trim a few millimetres at a time — you cannot add wire back. A quarter-wave whip needs a ground plane: three or four radials of the same length, sloping down at about 45°.',
                };
            },
        },

        {
            id: 'los',
            chapter: 'comms',
            title: 'Radio horizon',
            glyph: '△',
            blurb: 'How far VHF and UHF will actually reach. Above 30 MHz, height beats power every time — this shows by how much.',
            fields: [
                { k: 'h1', label: 'Your antenna height (m)', type: 'number', def: 2, step: 0.5, min: 0 },
                { k: 'h2', label: 'Their antenna height (m)', type: 'number', def: 30, step: 1, min: 0 },
            ],
            run(v) {
                const h1 = Math.max(0, n(v.h1, 2)), h2 = Math.max(0, n(v.h2, 30));
                const radio = 4.12 * (Math.sqrt(h1) + Math.sqrt(h2));      // 4/3-Earth radio horizon
                const optical = 3.57 * (Math.sqrt(h1) + Math.sqrt(h2));
                const doubled = 4.12 * (Math.sqrt(h1 * 2) + Math.sqrt(h2));
                return {
                    rows: [
                        ['Radio horizon', `${f(radio, 1)} km  (${f(radio / 1.609, 1)} mi)`, 'hero'],
                        ['Optical horizon', `${f(optical, 1)} km`],
                        ['If YOU climb to double height', `${f(doubled, 1)} km  (+${f(doubled - radio, 1)} km)`],
                        ['Your horizon alone', `${f(4.12 * Math.sqrt(h1), 1)} km`],
                        ['Their horizon alone', `${f(4.12 * Math.sqrt(h2), 1)} km`],
                    ],
                    msg: 'This is a clear-path best case. Terrain, buildings and trees cut it hard, especially at UHF. Doubling transmit power gains 3 dB — barely noticeable. Doubling your height usually gains far more.',
                };
            },
        },

        {
            id: 'morse',
            chapter: 'comms',
            title: 'Morse translator',
            glyph: '· −',
            blurb: 'Text to Morse, with audible tone and screen flash. Works for signalling with a torch, a mirror, a whistle or a radio.',
            fields: [
                { k: 'text', label: 'Message', type: 'text', def: 'SOS', wide: true },
                { k: 'wpm', label: 'Speed (words per minute)', type: 'number', def: 12, step: 1, min: 3, max: 40 },
                { k: 'tone', label: 'Tone (Hz)', type: 'number', def: 700, step: 50, min: 200, max: 2000 },
            ],
            run(v) {
                const txt = String(v.text || '').toUpperCase();
                const code = txt.split('').map(ch => ch === ' ' ? '/' : (MORSE[ch] || '')).filter(Boolean).join(' ');
                const wpm = clamp(n(v.wpm, 12), 3, 40);
                const dot = 1200 / wpm;
                const sched = morseSchedule(txt, dot);
                const unknown = txt.replace(/\s/g, '').split('').filter(c => !MORSE[c]);
                return {
                    rows: [
                        ['Morse', code.replace(/\./g, '·').replace(/-/g, '−') || '—', 'hero'],
                        ['Dot length', `${Math.round(dot)} ms`],
                        ['Send time', `${f(sched.total / 1000, 1)} s`],
                        ['Characters', String(txt.replace(/\s/g, '').length)],
                    ],
                    msg: unknown.length
                        ? `No Morse equivalent for ${unknown.join(' ')} — those characters are skipped entirely. Spell the message with letters and digits only.`
                        : 'International distress is SOS sent as one unbroken group: ···———···  Three of anything means distress; two of anything means "message received".',
                    alarm: unknown.length > 0,
                };
            },
            mount(el, ctx) {
                const row = document.createElement('div');
                row.className = 'btn-row';
                let stop = null;

                const play = (flash) => {
                    if (stop) { stop(); return; }
                    const v = ctx.values();
                    const wpm = clamp(n(v.wpm, 12), 3, 40);
                    const dot = 1200 / wpm;
                    const tone = clamp(n(v.tone, 700), 200, 2000);
                    const sched = morseSchedule(v.text, dot);
                    if (!sched.events.length) return;

                    let overlay = null, onKey = null;
                    if (flash) {
                        overlay = document.createElement('div');
                        overlay.className = 'beacon';
                        const b = document.createElement('button');
                        b.type = 'button';
                        b.textContent = 'Tap or press Esc to stop';
                        overlay.appendChild(b);
                        b.addEventListener('click', () => stop && stop());
                        document.body.appendChild(overlay);
                        b.focus();
                        onKey = e => { if (e.key === 'Escape') { e.preventDefault(); if (stop) stop(); } };
                        document.addEventListener('keydown', onKey);
                    }

                    const timers = [];
                    sched.events.forEach(ev => {
                        timers.push(setTimeout(() => {
                            beep(tone, ev.len);
                            if (overlay) {
                                overlay.classList.add('on');
                                timers.push(setTimeout(() => overlay.classList.remove('on'), ev.len));
                            }
                        }, ev.at));
                    });
                    timers.push(setTimeout(() => { if (stop) stop(); }, sched.total + 400));

                    btnPlay.textContent = '■ Stop';
                    btnFlash.textContent = '■ Stop';
                    stop = () => {
                        timers.forEach(clearTimeout);
                        if (overlay) overlay.remove();
                        if (onKey) document.removeEventListener('keydown', onKey);
                        btnPlay.textContent = '▶ Play tone';
                        btnFlash.textContent = '⚡ Flash screen';
                        stop = null;
                    };
                };

                const btnPlay = document.createElement('button');
                btnPlay.type = 'button'; btnPlay.className = 'btn'; btnPlay.textContent = '▶ Play tone';
                btnPlay.addEventListener('click', () => play(false));

                const btnFlash = document.createElement('button');
                btnFlash.type = 'button'; btnFlash.className = 'btn ghost'; btnFlash.textContent = '⚡ Flash screen';
                btnFlash.addEventListener('click', () => play(true));

                const btnSOS = document.createElement('button');
                btnSOS.type = 'button'; btnSOS.className = 'btn ghost'; btnSOS.textContent = 'Set to SOS';
                btnSOS.addEventListener('click', () => {
                    const input = el.closest('.tool').querySelector('[name="text"]');
                    if (input) { input.value = 'SOS'; ctx.recompute(); }
                });

                row.append(btnPlay, btnFlash, btnSOS);
                el.appendChild(row);
            },
        },

        {
            id: 'dtg',
            chapter: 'comms',
            title: 'Time, UTC and DTG',
            glyph: '⏱',
            blurb: 'Everyone coordinating across an incident works in UTC (Zulu). Getting the time zone wrong has cancelled real rescues.',
            fields: [
                { k: 'when', label: 'Local date and time', type: 'datetime-local', def: '' },
            ],
            run(v) {
                const d = v.when ? new Date(v.when) : new Date();
                if (isNaN(d)) return { rows: [], msg: 'Invalid date.', alarm: true };
                const M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                const p = (x, w) => String(x).padStart(w || 2, '0');
                const dtg = `${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}Z ${M[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
                const off = -d.getTimezoneOffset() / 60;
                const jd = G.toJulian(d);
                /* Count days in UTC: a local-midnight subtraction is off by one
                   across a daylight-saving boundary. */
                const doy = Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
                    - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000) + 1;
                return {
                    rows: [
                        ['DTG (military)', dtg, 'hero'],
                        ['UTC / Zulu', d.toISOString().replace('T', ' ').slice(0, 19) + 'Z'],
                        ['Local', d.toLocaleString()],
                        ['UTC offset', `${off >= 0 ? '+' : ''}${off} h`],
                        ['ISO 8601', d.toISOString()],
                        ['Day of year', String(doy)],
                        ['Julian date', f(jd, 4)],
                        ['Unix time', String(Math.floor(d.getTime() / 1000))],
                    ],
                    msg: 'Always state the zone. "We move at 0600" is worthless; "we move at 0600Z" is not.',
                };
            },
            mount(el, ctx) {
                const input = el.closest('.tool').querySelector('[name="when"]');
                if (input && !input.value) { input.value = localISO(new Date()); ctx.recompute(); }
            },
        },

        /* ============================================================== POWER */
        {
            id: 'battery',
            chapter: 'power',
            title: 'Battery runtime',
            glyph: '▮',
            blurb: 'How long will this battery actually run this load? Accounts for chemistry, usable depth of discharge and conversion losses.',
            fields: [
                { k: 'cap', label: 'Capacity', type: 'number', def: 20000, step: 100, min: 0 },
                { k: 'unit', label: 'Capacity unit', type: 'select', def: 'mah', options: [['mah', 'mAh'], ['ah', 'Ah'], ['wh', 'Wh']] },
                { k: 'volt', label: 'Nominal voltage (V)', type: 'number', def: 3.7, step: 0.1, min: 0.1 },
                {
                    k: 'chem', label: 'Chemistry', type: 'select', def: '0.85', options: [
                        ['0.95', 'LiFePO4 — 95 % usable'], ['0.85', 'Li-ion / LiPo — 85 %'],
                        ['0.5', 'Lead-acid — 50 %'], ['0.6', 'AGM / gel — 60 %'], ['1', 'Ignore limits — 100 %']] },
                { k: 'load', label: 'Load (W)', type: 'number', def: 5, step: 0.5, min: 0.01 },
                {
                    k: 'conv', label: 'Delivery path', type: 'select', def: '0.85', options: [
                        ['0.95', 'Direct DC — 95 %'], ['0.85', 'USB / DC-DC converter — 85 %'],
                        ['0.8', 'Mains inverter — 80 %'], ['0.7', 'Cheap inverter + idle — 70 %']] },
            ],
            run(v) {
                const cap = Math.max(0, n(v.cap, 0));
                const volt = Math.max(0.1, n(v.volt, 3.7));
                const wh = v.unit === 'wh' ? cap : (v.unit === 'ah' ? cap * volt : cap / 1000 * volt);
                const usable = wh * n(v.chem, 0.85) * n(v.conv, 0.85);
                const load = Math.max(0.01, n(v.load, 5));
                const hours = usable / load;
                return {
                    rows: [
                        ['Runtime', hours >= 48 ? `${f(hours / 24, 1)} days` : `${Math.floor(hours)} h ${Math.round((hours % 1) * 60)} min`, 'hero'],
                        ['Nameplate energy', `${f(wh, 1)} Wh`],
                        ['Realistically usable', `${f(usable, 1)} Wh`],
                        ['Losses', `${f(wh - usable, 1)} Wh (${wh > 0 ? Math.round((1 - usable / wh) * 100) : 0} %)`],
                        ['Phone charges (15 Wh each)', f(usable / 15, 1)],
                        ['Radio hours (RX 0.5 W)', f(usable / 0.5, 0)],
                        ['LED lantern hours (3 W)', f(usable / 3, 0)],
                    ],
                    msg: 'Cold cuts lithium capacity sharply — keep banks in an inside pocket. Never charge a lithium cell below 0 °C.',
                };
            },
        },

        {
            id: 'solar',
            chapter: 'power',
            title: 'Solar sizing',
            glyph: '☉',
            blurb: 'Realistic daily yield from a panel, and how much panel your loads actually need. The number on the box is a laboratory figure.',
            fields: [
                { k: 'w', label: 'Panel rating (W)', type: 'number', def: 100, step: 5, min: 1 },
                {
                    k: 'psh', label: 'Peak sun hours/day', type: 'select', def: '4', options: [
                        ['1', '1 — temperate winter, overcast'], ['2', '2 — temperate winter, clear'],
                        ['3', '3 — temperate spring/autumn'], ['4', '4 — temperate summer'],
                        ['5', '5 — Mediterranean summer'], ['6', '6 — desert / tropics']] },
                {
                    k: 'ctrl', label: 'Charge controller', type: 'select', def: '0.75', options: [
                        ['0.75', 'MPPT — 75 % system derate'], ['0.6', 'PWM — 60 %'], ['0.55', 'USB panel direct — 55 %']] },
                { k: 'need', label: 'Daily energy needed (Wh)', type: 'number', def: 200, step: 10, min: 0 },
            ],
            run(v) {
                const w = Math.max(1, n(v.w, 100));
                const psh = n(v.psh, 4), der = n(v.ctrl, 0.75);
                const yield_ = w * psh * der;
                const need = Math.max(0, n(v.need, 0));
                const panelNeeded = need / (psh * der);
                const surplus = yield_ - need;
                return {
                    rows: [
                        ['Realistic daily yield', `${f(yield_, 0)} Wh/day`, 'hero'],
                        ['Panel needed for your load', `${f(panelNeeded, 0)} W`],
                        ['Daily balance', `${surplus >= 0 ? '+' : ''}${f(surplus, 0)} Wh`],
                        ['Battery for 3 cloudy days', `${f(need * 3 / 0.9, 0)} Wh (LiFePO4)`],
                        ['That is', `${f(need * 3 / 0.9 / 12.8, 0)} Ah at 12.8 V`],
                        ['Charge current at 12 V', `${f(yield_ / psh / 12, 1)} A — size the controller above this`],
                    ],
                    msg: surplus < 0
                        ? '⚠ Deficit. Add panel, cut load, or accept that the battery drains a little further every day.'
                        : 'Re-aim the panel three times a day for 20–40 % more. One shaded cell can collapse the whole panel output — keep it completely clear.',
                    alarm: surplus < 0,
                };
            },
        },

        {
            id: 'loadbudget',
            chapter: 'power',
            title: 'Energy budget',
            glyph: '▤',
            blurb: 'List your loads as "name, watts, hours per day" and get the daily total, the battery bank that covers it, and where the energy is really going.',
            fields: [
                {
                    k: 'list', label: 'Loads — name, watts, hours/day', type: 'textarea', wide: true,
                    def: 'Phone charging, 10, 2\nLED lantern, 3, 5\nHandheld radio, 1, 8\nLaptop, 45, 1.5\nMesh node, 0.3, 24\nCPAP, 40, 7',
                },
                { k: 'days', label: 'Days of autonomy', type: 'number', def: 3, step: 1, min: 1 },
            ],
            run(v) {
                const items = [];
                String(v.list || '').split(/\r?\n/).forEach(line => {
                    const p = line.split(/[,;\t]/).map(s => s.trim());
                    if (p.length < 3) return;
                    const w = parseFloat(p[1]), h = parseFloat(p[2]);
                    if (!isFinite(w) || !isFinite(h)) return;
                    items.push({ name: p[0] || '—', wh: w * h });
                });
                if (!items.length) return { rows: [], msg: 'Enter at least one line as "name, watts, hours".', alarm: true };

                const total = items.reduce((s, i) => s + i.wh, 0);
                const days = Math.max(1, n(v.days, 3));
                const rows = [['Daily total', `${f(total, 0)} Wh/day`, 'hero']];
                items.sort((a, b) => b.wh - a.wh).forEach(i =>
                    rows.push([i.name, `${f(i.wh, 1)} Wh  (${Math.round(i.wh / total * 100)} %)`]));
                rows.push(['Bank for ' + days + ' days (LiFePO4)', `${f(total * days / 0.9, 0)} Wh`]);
                rows.push(['Bank for ' + days + ' days (lead-acid)', `${f(total * days / 0.5, 0)} Wh`]);
                rows.push(['Solar to sustain it (temperate summer)', `${f(total / (4 * 0.75), 0)} W of panel`]);
                return { rows, msg: 'The top line of that list is where your effort belongs. Cutting the largest item usually beats buying more battery.' };
            },
        },

        /* ============================================================== WATER */
        {
            id: 'waterdose',
            chapter: 'water',
            title: 'Water treatment dosing',
            glyph: '≈',
            blurb: 'Exactly how much bleach, how many drops, and how long to wait — for the volume in front of you.',
            fields: [
                { k: 'vol', label: 'Volume to treat (litres)', type: 'number', def: 10, step: 0.5, min: 0.1 },
                { k: 'conc', label: 'Bleach strength (% NaClO)', type: 'number', def: 5, step: 0.25, min: 0.5, max: 15 },
                { k: 'quality', label: 'Water condition', type: 'select', def: 'clear', options: [['clear', 'Clear and warm'], ['cold', 'Clear but cold (< 10 °C)'], ['cloudy', 'Cloudy or cold and cloudy']] },
                { k: 'alt', label: 'Altitude (m)', type: 'number', def: 0, step: 100, min: 0 },
            ],
            run(v) {
                const vol = Math.max(0.1, n(v.vol, 10));
                const conc = clamp(n(v.conc, 5), 0.5, 15);
                const hard = v.quality !== 'clear';
                const mult = hard ? 2 : 1;
                const dropsPerL = 2 * (6 / conc) * mult;
                const drops = dropsPerL * vol;
                const ml = drops * 0.05;
                const wait = hard ? 60 : 30;
                const boil = n(v.alt, 0) >= 2000 ? 3 : 1;
                return {
                    rows: [
                        ['Bleach to add', ml >= 5 ? `${f(ml, 1)} ml  (${Math.ceil(drops)} drops)` : `${Math.ceil(drops)} drops`, 'hero'],
                        ['Per litre', `${f(dropsPerL, 1)} drops`],
                        ['Wait before drinking', `${wait} minutes`],
                        ['In teaspoons', `${f(ml / 5, 2)} tsp  (1 tsp = 5 ml)`],
                        ['Boiling instead', `rolling boil for ${boil} minute${boil > 1 ? 's' : ''} at ${n(v.alt, 0)} m`],
                        ['Chlorine dioxide tablets', `follow the packet; allow 4 h if Cryptosporidium is possible`],
                        ['Iodine 2 % tincture', `${Math.ceil(5 * vol * mult)} drops, ${wait} min — not in pregnancy or thyroid disease`],
                    ],
                    msg: hard
                        ? 'Cold or cloudy: dose and time are both doubled. Clarify first — settle, then pour off, then filter through cloth. It makes everything else work.'
                        : 'After the wait it should smell faintly of chlorine. If it does not, dose once more and wait another 15 minutes. Use unscented household bleach only — never scented, thickened or colour-safe.',
                };
            },
        },

        {
            id: 'waterneed',
            chapter: 'water',
            title: 'Water requirement',
            glyph: '≣',
            blurb: 'How much water a group needs, how long a store lasts, and what that weighs if you have to carry it.',
            fields: [
                { k: 'people', label: 'People', type: 'number', def: 4, step: 1, min: 1 },
                { k: 'days', label: 'Days', type: 'number', def: 14, step: 1, min: 1 },
                {
                    k: 'mode', label: 'Situation', type: 'select', def: '15', options: [
                        ['2', 'Survival minimum — drinking only'], ['4', 'Drinking, temperate, resting'],
                        ['8', 'Drinking, hot climate or working'], ['15', 'Household — drinking, cooking, hygiene'],
                        ['30', 'Household with sanitation and washing']] },
                { k: 'have', label: 'Litres you already have', type: 'number', def: 60, step: 5, min: 0 },
            ],
            run(v) {
                const p = Math.max(1, n(v.people, 1)), d = Math.max(1, n(v.days, 1));
                const per = n(v.mode, 15);
                const need = p * d * per;
                const have = Math.max(0, n(v.have, 0));
                const lasts = have / (p * per);
                return {
                    rows: [
                        ['Total needed', `${f(need, 0)} litres`, 'hero'],
                        ['Per day, whole group', `${f(p * per, 0)} L/day`],
                        ['Your stock lasts', `${f(lasts, 1)} days`],
                        ['Shortfall', need - have > 0 ? `${f(need - have, 0)} L` : 'none — you are covered'],
                        ['Weight of the full requirement', `${f(need, 0)} kg`],
                        ['Bathtub equivalent', `${f(need / 150, 1)} baths (≈150 L each)`],
                        ['Hot water tank equivalent', `${f(need / 150, 1)} tanks`],
                    ],
                    msg: have < need
                        ? '⚠ You are short. Fill everything now — bath, pots, bottles, kettles — while pressure still exists, and add a filter to the plan.'
                        : 'Rotate stored tap water every 6–12 months. Keep it dark, cool and off concrete.',
                    alarm: have < need,
                };
            },
        },

        /* =============================================================== FOOD */
        {
            id: 'rations',
            chapter: 'food',
            title: 'Ration planner',
            glyph: '◈',
            blurb: 'Calories a group needs, what that weighs, and how long the food you have will really last.',
            fields: [
                { k: 'adults', label: 'Adults', type: 'number', def: 2, step: 1, min: 0 },
                { k: 'kids', label: 'Children', type: 'number', def: 2, step: 1, min: 0 },
                { k: 'days', label: 'Days', type: 'number', def: 14, step: 1, min: 1 },
                {
                    k: 'act', label: 'Activity level', type: 'select', def: '2400', options: [
                        ['1200', 'Survival ration — losing weight'], ['2000', 'Sheltering, sedentary'],
                        ['2400', 'Normal activity'], ['3500', 'Hard work / walking with a load'],
                        ['4500', 'Cold weather manual work']] },
                { k: 'kcal100', label: 'Store energy density (kcal/100 g)', type: 'number', def: 350, step: 10, min: 50 },
                { k: 'have', label: 'Food you have (kg)', type: 'number', def: 25, step: 1, min: 0 },
            ],
            run(v) {
                const a = Math.max(0, n(v.adults, 0)), c = Math.max(0, n(v.kids, 0));
                const d = Math.max(1, n(v.days, 1)), per = n(v.act, 2400);
                const dailyKcal = a * per + c * per * 0.7;
                if (dailyKcal <= 0) return { rows: [], msg: 'Enter at least one person.', alarm: true };
                const totalKcal = dailyKcal * d;
                const dens = Math.max(50, n(v.kcal100, 350));
                const kgNeeded = totalKcal / (dens * 10);
                const have = Math.max(0, n(v.have, 0));
                const lasts = have * dens * 10 / dailyKcal;
                return {
                    rows: [
                        ['Total energy needed', `${f(totalKcal / 1000, 1)} × 1 000 kcal`, 'hero'],
                        ['Per day, whole group', `${f(dailyKcal, 0)} kcal/day`],
                        ['Food mass needed', `${f(kgNeeded, 1)} kg`],
                        ['Your stock lasts', `${f(lasts, 1)} days`],
                        ['Shortfall', kgNeeded - have > 0 ? `${f(kgNeeded - have, 1)} kg` : 'none — you are covered'],
                        ['On survival ration (1 200 kcal)', `${f(have * dens * 10 / ((a + c * 0.7) * 1200), 1)} days`],
                        ['Water to cook and digest it', `${f((a + c) * d * 3, 0)} L on top of drinking water`],
                    ],
                    msg: 'Children under about 12 are counted at 70 % of an adult. Store what you already eat — an untouched stockpile of unfamiliar food fails exactly when it matters.',
                    alarm: kgNeeded > have,
                };
            },
        },

        /* ============================================================ MEDICAL */
        {
            id: 'ors',
            chapter: 'medical',
            title: 'Rehydration mixer',
            glyph: '⊕',
            blurb: 'The WHO oral rehydration formula, scaled to the container you actually have. Getting the salt right matters — too much is dangerous.',
            fields: [
                { k: 'vol', label: 'Water volume (litres)', type: 'number', def: 1, step: 0.1, min: 0.1, max: 20 },
                { k: 'kg', label: 'Casualty weight (kg)', type: 'number', def: 70, step: 1, min: 2 },
                { k: 'sev', label: 'Dehydration', type: 'select', def: 'mod', options: [['mild', 'Mild — thirsty, dark urine'], ['mod', 'Moderate — dry mouth, little urine, sunken eyes'], ['sev', 'Severe — drowsy, no urine, weak pulse']] },
            ],
            run(v) {
                const L = clamp(n(v.vol, 1), 0.1, 20);
                const kg = Math.max(2, n(v.kg, 70));
                const sugarTsp = 6 * L, saltTsp = 0.5 * L;
                const deficit = { mild: 0.05, mod: 0.08, sev: 0.1 }[v.sev] || 0.08;
                const replace = kg * deficit;            // litres ≈ kg
                return {
                    rows: [
                        ['Sugar', `${f(sugarTsp, 1)} level teaspoons  (${f(sugarTsp * 4.2, 0)} g)`, 'hero'],
                        ['Salt', `${f(saltTsp, 2)} level teaspoons  (${f(saltTsp * 6, 1)} g)`, 'hero'],
                        ['Water', `${f(L, 2)} litres — clean, boiled and cooled if possible`],
                        ['Give over 4 hours', `${f(replace, 1)} litres`],
                        ['That is roughly', `${f(replace * 1000 / 4 / 12, 0)} ml every 5 minutes`],
                        ['Child dose after each loose stool', `${f(kg * 10, 0)} ml`],
                        ['Optional', 'a pinch of salt substitute (KCl), or ½ cup orange juice / mashed banana for potassium'],
                    ],
                    msg: v.sev === 'sev'
                        ? '⚠ Severe dehydration needs intravenous fluids and medical care. Give oral fluid on the way, but do not delay evacuation for it, and never force fluid into a drowsy casualty.'
                        : 'It should taste no saltier than tears. Small sips, continuously. Keep giving it even if they vomit — wait 10 minutes, then a teaspoon every minute.',
                    alarm: v.sev === 'sev',
                };
            },
        },

        {
            id: 'cprmetro',
            chapter: 'medical',
            title: 'CPR metronome',
            glyph: '♥︎',
            blurb: 'A 110 beat-per-minute pacer. Compression rate is the thing rescuers most often get wrong, and it is the easiest thing to fix.',
            fields: [
                { k: 'bpm', label: 'Rate (compressions/min)', type: 'number', def: 110, step: 5, min: 100, max: 120 },
            ],
            run(v) {
                const bpm = clamp(n(v.bpm, 110), 60, 140);
                return {
                    rows: [
                        ['Rate', `${bpm} per minute`, 'hero'],
                        ['Interval', `${Math.round(60000 / bpm)} ms`],
                        ['Depth (adult)', '5–6 cm — allow full recoil between each'],
                        ['Ratio', '30 compressions : 2 breaths (compression-only is fine if untrained)'],
                        ['Swap rescuers', 'every 2 minutes — about 220 compressions'],
                        ['Child / infant', 'depth ⅓ of chest, 15:2 with two rescuers, 5 rescue breaths first'],
                    ],
                    msg: 'Push hard, push fast, minimise interruptions. Attach a defibrillator the moment one arrives and do exactly what it says.',
                };
            },
            mount(el, ctx) {
                const row = document.createElement('div');
                row.className = 'btn-row';
                const btn = document.createElement('button');
                btn.type = 'button'; btn.className = 'btn'; btn.textContent = '▶ Start metronome';
                let timer = null, count = 0;
                const readout = document.createElement('span');
                readout.className = 'chip';
                readout.textContent = '0 compressions';

                /* Spoken coaching, using the browser's built-in synthesiser.
                   Hands are busy during CPR; a voice is worth more than a screen. */
                const speak = txt => {
                    if (!voiceOn || !window.speechSynthesis) return;
                    try {
                        window.speechSynthesis.cancel();
                        const u = new SpeechSynthesisUtterance(txt);
                        u.rate = 1.05;
                        window.speechSynthesis.speak(u);
                    } catch (e) { /* not available */ }
                };

                let voiceOn = false;
                const btnVoice = document.createElement('button');
                btnVoice.type = 'button'; btnVoice.className = 'btn ghost';
                btnVoice.textContent = '🔈 Voice coaching off';
                btnVoice.addEventListener('click', () => {
                    if (!window.speechSynthesis) { btnVoice.textContent = 'No voice on this device'; return; }
                    voiceOn = !voiceOn;
                    btnVoice.textContent = voiceOn ? '🔊 Voice coaching ON' : '🔈 Voice coaching off';
                    if (voiceOn) speak('Voice coaching on. Push hard and fast in the centre of the chest.');
                });

                btn.addEventListener('click', () => {
                    if (timer) {
                        clearInterval(timer); timer = null;
                        btn.textContent = '▶ Start metronome';
                        if (window.speechSynthesis) window.speechSynthesis.cancel();
                        return;
                    }
                    const bpm = clamp(n(ctx.values().bpm, 110), 60, 140);
                    count = 0;
                    btn.textContent = '■ Stop';
                    speak('Starting. Push hard and fast, five to six centimetres, centre of the chest.');
                    const tick = () => {
                        count++;
                        beep(count % 30 === 0 ? 1200 : 880, 45, 0.3);
                        readout.textContent = `${count} compressions · ${Math.floor(count / 30)} cycles`;
                        if (count % 30 === 0) speak('Two breaths.');
                        else if (count % 220 === 0) speak('Two minutes. Change rescuer if you can.');
                        else if (count === 10) speak('Let the chest come all the way back up each time.');
                    };
                    tick();
                    timer = setInterval(tick, 60000 / bpm);
                });

                row.append(btn, btnVoice, readout);
                el.appendChild(row);
            },
        },

        {
            id: 'tbsa',
            chapter: 'medical',
            title: 'Burn area — rule of nines',
            glyph: '▲',
            blurb: 'Estimates burned body surface area, which is what decides whether a burn is a dressing or an evacuation.',
            fields: [
                { k: 'head', label: 'Head & neck burned (%)', type: 'number', def: 0, step: 25, min: 0, max: 100 },
                { k: 'arm', label: 'Arms burned (% of both)', type: 'number', def: 0, step: 25, min: 0, max: 100 },
                { k: 'trunkF', label: 'Front torso (%)', type: 'number', def: 0, step: 25, min: 0, max: 100 },
                { k: 'trunkB', label: 'Back torso (%)', type: 'number', def: 0, step: 25, min: 0, max: 100 },
                { k: 'leg', label: 'Legs burned (% of both)', type: 'number', def: 0, step: 25, min: 0, max: 100 },
                { k: 'age', label: 'Casualty', type: 'select', def: 'adult', options: [['adult', 'Adult'], ['child', 'Child (head 18 %, legs 14 % each)']] },
                { k: 'kg', label: 'Weight (kg)', type: 'number', def: 70, step: 1, min: 3 },
            ],
            run(v) {
                const child = v.age === 'child';
                const headMax = child ? 18 : 9;
                const legMax = child ? 28 : 36;
                const tbsa =
                    n(v.head, 0) / 100 * headMax +
                    n(v.arm, 0) / 100 * 18 +
                    n(v.trunkF, 0) / 100 * 18 +
                    n(v.trunkB, 0) / 100 * 18 +
                    n(v.leg, 0) / 100 * legMax;
                const kg = Math.max(3, n(v.kg, 70));
                const parkland = 4 * kg * tbsa;      // ml in first 24 h, half in first 8
                const major = tbsa >= (child ? 10 : 15);
                return {
                    rows: [
                        ['Burned surface area', `${f(tbsa, 1)} %`, 'hero'],
                        ['Classification', major ? 'MAJOR — evacuate urgently' : tbsa >= 5 ? 'Significant — seek medical care' : 'Minor — treat and monitor'],
                        ['Fluid guide (Parkland, 24 h)', tbsa >= 10 ? `${f(parkland, 0)} ml crystalloid` : 'not indicated below 10 %'],
                        ['Half of that in the first 8 h', tbsa >= 10 ? `${f(parkland / 2, 0)} ml` : '—'],
                        ['Rule of palm cross-check', 'the casualty\'s palm and fingers ≈ 1 % of their body surface'],
                    ],
                    msg: major
                        ? '⚠ Cool for 20 minutes, cover with cling film laid on (not wrapped), keep the rest of them warm, and evacuate. The Parkland figure is for trained providers with intravenous access — it is here as a guide to how serious this is.'
                        : 'Cool with cool running water for 20 minutes — effective up to 3 hours after the burn. Never ice, butter or toothpaste. Do not burst blisters.',
                    alarm: major,
                };
            },
        },

        /* ============================================================= HAZARD */
        {
            id: 'radcalc',
            chapter: 'hazard',
            title: 'Fallout decay (7-10 rule)',
            glyph: '☢︎',
            blurb: 'How fast fallout radiation drops, and therefore when a short trip outside stops being reckless. The curve is steeper than almost anyone expects.',
            fields: [
                { k: 'r1', label: 'Dose rate measured (units/h)', type: 'number', def: 1000, step: 1, min: 0 },
                { k: 't1', label: 'Hours after the event when measured', type: 'number', def: 1, step: 0.5, min: 0.1 },
                { k: 't2', label: 'Hours after the event to predict', type: 'number', def: 48, step: 1, min: 0.1 },
            ],
            run(v) {
                const r1 = Math.max(0, n(v.r1, 1000));
                const t1 = Math.max(0.1, n(v.t1, 1)), t2 = Math.max(0.1, n(v.t2, 48));
                const decay = t => r1 * Math.pow(t / t1, -1.2);
                const r2 = decay(t2);
                const marks = [1, 7, 24, 49, 168, 343, 720];
                const rows = [
                    ['Predicted rate', `${r2 < 1 ? r2.toFixed(3) : f(r2, 1)} units/h at H+${f(t2, 0)}`, 'hero'],
                    ['Reduction factor', `${f(r1 / r2, 0)}× lower than the measurement`],
                ];
                marks.forEach(t => rows.push([`H + ${t} h${t >= 24 ? ` (${f(t / 24, 1)} d)` : ''}`,
                `${decay(t) < 1 ? decay(t).toFixed(3) : f(decay(t), 1)} units/h`]));
                return {
                    rows,
                    msg: 'The 7-10 rule: every 7-fold increase in time cuts the rate 10-fold. Practically, staying inside for the first 48 hours avoids the large majority of the total dose. Get inside, stay inside, stay tuned.',
                };
            },
        },

        {
            id: 'windchill',
            chapter: 'hazard',
            title: 'Wind chill and heat index',
            glyph: '℃',
            blurb: 'What the weather does to a human, not to a thermometer. Both directions, plus how long exposed skin lasts.',
            fields: [
                { k: 'temp', label: 'Air temperature (°C)', type: 'number', def: -5, step: 1 },
                { k: 'wind', label: 'Wind speed (km/h)', type: 'number', def: 30, step: 1, min: 0 },
                { k: 'rh', label: 'Relative humidity (%)', type: 'number', def: 50, step: 5, min: 0, max: 100 },
            ],
            run(v) {
                const T = n(v.temp, 0), W = Math.max(0, n(v.wind, 0)), RH = clamp(n(v.rh, 50), 0, 100);
                const rows = [];
                let msg = '', alarm = false;

                if (T <= 10 && W >= 4.8) {
                    const wc = 13.12 + 0.6215 * T - 11.37 * Math.pow(W, 0.16) + 0.3965 * T * Math.pow(W, 0.16);
                    rows.push(['Wind chill', `${f(wc, 1)} °C feels-like`, 'hero']);
                    let fb = 'negligible';
                    if (wc <= -55) fb = 'under 2 minutes';
                    else if (wc <= -48) fb = '2–5 minutes';
                    else if (wc <= -40) fb = '5–10 minutes';
                    else if (wc <= -28) fb = '10–30 minutes';
                    else if (wc <= -18) fb = 'over 30 minutes';
                    rows.push(['Frostbite on exposed skin', fb]);
                    if (wc <= -28) { msg = '⚠ Cover every square centimetre of skin. Check faces and fingers on other people — you cannot feel your own freezing.'; alarm = true; }
                    else msg = 'Wet clothing removes most of your insulation. Change into dry layers before you stop moving, not after.';
                } else if (T >= 26) {
                    const Tf = T * 9 / 5 + 32;
                    const hiF = -42.379 + 2.04901523 * Tf + 10.14333127 * RH - 0.22475541 * Tf * RH
                        - 0.00683783 * Tf * Tf - 0.05481717 * RH * RH + 0.00122874 * Tf * Tf * RH
                        + 0.00085282 * Tf * RH * RH - 0.00000199 * Tf * Tf * RH * RH;
                    /* The regression dips below the air temperature in dry air,
                       which would be nonsense: it cannot feel cooler than it is. */
                    const hi = Math.max((hiF - 32) * 5 / 9, T);
                    rows.push(['Heat index', `${f(hi, 1)} °C feels-like`, 'hero']);
                    let risk = 'Caution';
                    if (hi >= 54) risk = 'EXTREME DANGER — heat stroke imminent';
                    else if (hi >= 41) risk = 'DANGER — heat stroke likely with continued exposure';
                    else if (hi >= 32) risk = 'Extreme caution — heat exhaustion possible';
                    rows.push(['Risk level', risk]);
                    rows.push(['Water requirement', `${hi >= 41 ? '1 L or more' : '0.5–1 L'} per hour of work`]);
                    if (hi >= 41) { msg = '⚠ Stop work. Shade, cool, drink. Anyone confused in this heat is a heat stroke until proven otherwise — cool aggressively before transporting.'; alarm = true; }
                    else msg = 'Work in the cool hours, rest in the heat. Cover up rather than stripping off — clothing reduces water loss.';
                } else {
                    rows.push(['Apparent temperature', `${f(T, 1)} °C — close to actual`, 'hero']);
                    msg = 'Neither wind chill (needs ≤ 10 °C and wind) nor heat index (needs ≥ 26 °C) applies in this range.';
                }

                rows.push(['Wind speed', `${f(W, 0)} km/h · ${f(W / 3.6, 1)} m/s · ${f(W / 1.852, 0)} kn`]);
                rows.push(['Temperature', `${f(T, 1)} °C · ${f(T * 9 / 5 + 32, 1)} °F`]);
                return { rows, msg, alarm };
            },
        },

        {
            id: 'lightning',
            chapter: 'hazard',
            title: 'Storm distance',
            glyph: '↯',
            blurb: 'Count the seconds between the flash and the thunder. Under 30 seconds means the storm can already reach you.',
            fields: [
                { k: 'sec', label: 'Seconds from flash to thunder', type: 'number', def: 15, step: 1, min: 0 },
                { k: 'prev', label: 'Previous count (seconds)', type: 'number', def: 25, step: 1, min: 0 },
                { k: 'gap', label: 'Minutes between the two counts', type: 'number', def: 5, step: 1, min: 1 },
            ],
            run(v) {
                const s = Math.max(0, n(v.sec, 0));
                const km = s / 3, mi = s / 5;
                const prevKm = Math.max(0, n(v.prev, 0)) / 3;
                const gap = Math.max(1, n(v.gap, 5));
                const closing = (prevKm - km) / (gap / 60);      // km/h
                const eta = closing > 0 ? km / closing * 60 : null;
                const danger = s <= 30;
                return {
                    rows: [
                        ['Distance to the strike', `${f(km, 1)} km  (${f(mi, 1)} mi)`, 'hero'],
                        ['30/30 rule', danger ? '⚠ INSIDE — seek shelter now' : 'Outside the immediate danger zone — keep counting'],
                        ['Storm movement', closing > 0 ? `closing at ${f(closing, 0)} km/h` : closing < 0 ? `moving away at ${f(-closing, 0)} km/h` : 'stationary or unclear'],
                        ['Estimated arrival', eta ? `${f(eta, 0)} minutes` : '—'],
                        ['All-clear', '30 minutes after the last thunder'],
                    ],
                    msg: danger
                        ? '⚠ Get into a substantial building or a hard-topped vehicle. If you cannot: off ridges, out of water, away from isolated tall trees and metal, crouch low with feet together, and spread the group out so one strike cannot take everyone.'
                        : 'Lightning routinely strikes up to 15 km from the parent cloud, well ahead of any rain. Sound travels roughly 1 km every 3 seconds.',
                    alarm: danger,
                };
            },
        },
    ];
})();
