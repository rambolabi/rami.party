/* ==========================================================================
   CHRONOPORT · astro.js
   --------------------------------------------------------------------------
   Self-contained solar & lunar mathematics. No network, no libraries.
   Formulae follow the standard low-precision algorithms described by
   Astronomy Answers (Van Gent) and Meeus, "Astronomical Algorithms".
   Accuracy is roughly ±1 minute for rise/set at moderate latitudes — plenty
   for a portal that mostly wants to look magnificent.
   ========================================================================== */
(function (global) {
    'use strict';

    var RAD = Math.PI / 180;
    var DAY_MS = 86400000;
    var J1970 = 2440588;
    var J2000 = 2451545;
    var E = RAD * 23.4397;               // obliquity of the ecliptic

    /* ---- Julian date helpers --------------------------------------------- */
    function toJulian(date) { return date.valueOf() / DAY_MS - 0.5 + J1970; }
    function fromJulian(j) { return new Date((j + 0.5 - J1970) * DAY_MS); }
    function toDays(date) { return toJulian(date) - J2000; }

    /* ---- General spherical helpers --------------------------------------- */
    function rightAscension(l, b) {
        return Math.atan2(Math.sin(l) * Math.cos(E) - Math.tan(b) * Math.sin(E), Math.cos(l));
    }
    function declination(l, b) {
        return Math.asin(Math.sin(b) * Math.cos(E) + Math.cos(b) * Math.sin(E) * Math.sin(l));
    }
    function azimuth(H, phi, dec) {
        return Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
    }
    function altitude(H, phi, dec) {
        return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
    }
    function siderealTime(d, lw) { return RAD * (280.16 + 360.9856235 * d) - lw; }

    /* Atmospheric refraction correction (Saemundsson / Bennett). */
    function refraction(h) {
        if (h < 0) h = 0;
        return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
    }

    /* ---- Sun ------------------------------------------------------------- */
    function solarMeanAnomaly(d) { return RAD * (357.5291 + 0.98560028 * d); }

    function eclipticLongitude(M) {
        var C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
        var P = RAD * 102.9372;          // perihelion of the Earth
        return M + C + P + Math.PI;
    }

    function sunCoords(d) {
        var M = solarMeanAnomaly(d);
        var L = eclipticLongitude(M);
        return { dec: declination(L, 0), ra: rightAscension(L, 0), M: M, L: L };
    }

    function sunPosition(date, lat, lng) {
        var lw = RAD * -lng, phi = RAD * lat, d = toDays(date);
        var c = sunCoords(d), H = siderealTime(d, lw) - c.ra;
        var h = altitude(H, phi, c.dec);
        return {
            azimuth: azimuth(H, phi, c.dec) + Math.PI,   // 0 = north, clockwise
            altitude: h,
            apparentAltitude: h + refraction(h),
            declination: c.dec,
        };
    }

    /* Sun rise/set calculations (Meeus, chapter 15 style approximation). */
    var J0 = 0.0009;
    function julianCycle(d, lw) { return Math.round(d - J0 - lw / (2 * Math.PI)); }
    function approxTransit(Ht, lw, n) { return J0 + (Ht + lw) / (2 * Math.PI) + n; }
    function solarTransitJ(ds, M, L) {
        return J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    }
    function hourAngle(h, phi, d) {
        var cosH = (Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d));
        if (cosH > 1 || cosH < -1) return null;          // never rises / never sets
        return Math.acos(cosH);
    }

    /* Angles (degrees) for every twilight boundary worth naming. */
    var SUN_EVENTS = [
        [-0.833, 'sunrise', 'sunset'],
        [-0.3, 'sunriseEnd', 'sunsetStart'],
        [-4, 'blueHourEnd', 'blueHourStart'],
        [-6, 'civilEnd', 'civilStart'],
        [-12, 'nauticalEnd', 'nauticalStart'],
        [-18, 'astroEnd', 'astroStart'],
        [6, 'goldenHourEnd', 'goldenHourStart'],
    ];

    function sunTimes(date, lat, lng) {
        var lw = RAD * -lng, phi = RAD * lat;
        var d = toDays(date), n = julianCycle(d, lw), ds = approxTransit(0, lw, n);
        var M = solarMeanAnomaly(ds), L = eclipticLongitude(M), dec = declination(L, 0);
        var Jnoon = solarTransitJ(ds, M, L);

        var result = {
            solarNoon: fromJulian(Jnoon),
            nadir: fromJulian(Jnoon - 0.5),
            declination: dec,
            polarDay: false,
            polarNight: false,
        };

        SUN_EVENTS.forEach(function (ev) {
            var w = hourAngle(RAD * ev[0], phi, dec);
            if (w === null) { result[ev[1]] = null; result[ev[2]] = null; return; }
            var Jset = solarTransitJ(approxTransit(w, lw, n), M, L);
            var Jrise = Jnoon - (Jset - Jnoon);
            result[ev[1]] = fromJulian(Jrise);
            result[ev[2]] = fromJulian(Jset);
        });

        if (!result.sunrise) {
            // No rise/set today: decide between endless day and endless night.
            var noonAlt = altitude(0, phi, dec);
            result.polarDay = noonAlt > -0.833 * RAD;
            result.polarNight = !result.polarDay;
        }
        return result;
    }

    /* ---- Moon ------------------------------------------------------------ */
    function moonCoords(d) {
        var L = RAD * (218.316 + 13.176396 * d);   // ecliptic longitude
        var M = RAD * (134.963 + 13.064993 * d);   // mean anomaly
        var F = RAD * (93.272 + 13.229350 * d);    // mean distance
        var l = L + RAD * 6.289 * Math.sin(M);
        var b = RAD * 5.128 * Math.sin(F);
        var dt = 385001 - 20905 * Math.cos(M);     // distance to the Moon in km
        return { ra: rightAscension(l, b), dec: declination(l, b), dist: dt };
    }

    function moonPosition(date, lat, lng) {
        var lw = RAD * -lng, phi = RAD * lat, d = toDays(date);
        var c = moonCoords(d), H = siderealTime(d, lw) - c.ra;
        var h = altitude(H, phi, c.dec);
        // Parallactic angle, used for the tilt of the lit limb.
        var pa = Math.atan2(Math.sin(H), Math.tan(phi) * Math.cos(c.dec) - Math.sin(c.dec) * Math.cos(H));
        return {
            azimuth: azimuth(H, phi, c.dec) + Math.PI,
            altitude: h + refraction(h),
            distance: c.dist,
            parallacticAngle: pa,
        };
    }

    var SYNODIC = 29.530588853;

    function moonIllumination(date) {
        var d = toDays(date), s = sunCoords(d), m = moonCoords(d);
        var sdist = 149598000;                       // Sun distance, km
        var phi = Math.acos(Math.sin(s.dec) * Math.sin(m.dec) +
            Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra));
        var inc = Math.atan2(sdist * Math.sin(phi), m.dist - sdist * Math.cos(phi));
        var angle = Math.atan2(
            Math.cos(s.dec) * Math.sin(s.ra - m.ra),
            Math.sin(s.dec) * Math.cos(m.dec) - Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra)
        );
        var phase = 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI;
        return {
            fraction: (1 + Math.cos(inc)) / 2,       // illuminated fraction 0..1
            phase: phase,                            // 0 = new, 0.5 = full
            angle: angle,
            age: phase * SYNODIC,                    // days since new moon
            distance: m.dist,
        };
    }

    var PHASE_NAMES = [
        'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
        'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
    ];

    function moonPhaseName(phase) {
        if (phase < 0.0215 || phase >= 0.9785) return PHASE_NAMES[0];
        if (phase < 0.2285) return PHASE_NAMES[1];
        if (phase < 0.2715) return PHASE_NAMES[2];
        if (phase < 0.4785) return PHASE_NAMES[3];
        if (phase < 0.5215) return PHASE_NAMES[4];
        if (phase < 0.7285) return PHASE_NAMES[5];
        if (phase < 0.7715) return PHASE_NAMES[6];
        return PHASE_NAMES[7];
    }

    /* Next new / full moon, found by scanning the phase curve forward. */
    function nextMoonPhase(date, target) {
        var t = date.valueOf();
        var step = 6 * 3600000;                       // 6 hour coarse scan
        var prev = phaseDelta(new Date(t), target);
        for (var i = 1; i <= 4 * 40; i++) {
            var cur = phaseDelta(new Date(t + i * step), target);
            if (prev < 0 && cur >= 0) {
                // Refine with bisection.
                var lo = t + (i - 1) * step, hi = t + i * step;
                for (var k = 0; k < 40; k++) {
                    var mid = (lo + hi) / 2;
                    if (phaseDelta(new Date(mid), target) < 0) lo = mid; else hi = mid;
                }
                return new Date(Math.round((lo + hi) / 2));
            }
            prev = cur;
        }
        return null;
    }
    function phaseDelta(date, target) {
        var p = moonIllumination(date).phase - target;
        if (p > 0.5) p -= 1;
        if (p < -0.5) p += 1;
        return p;
    }

    /* Moon rise/set: sample the altitude hour by hour across the local day. */
    function moonTimes(date, lat, lng) {
        var t = new Date(date);
        t.setHours(0, 0, 0, 0);
        var hc = 0.133 * RAD;
        var h0 = moonPosition(t, lat, lng).altitude - hc;
        var rise = null, set = null, h1, h2, a, b, xe, ye, d, roots, x1 = 0, x2 = 0, dx;

        for (var i = 1; i <= 24; i += 2) {
            h1 = moonPosition(hoursLater(t, i), lat, lng).altitude - hc;
            h2 = moonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;

            a = (h0 + h2) / 2 - h1;
            b = (h2 - h0) / 2;
            xe = -b / (2 * a);
            ye = (a * xe + b) * xe + h1;
            d = b * b - 4 * a * h1;
            roots = 0;

            if (d >= 0) {
                dx = Math.sqrt(d) / (Math.abs(a) * 2);
                x1 = xe - dx; x2 = xe + dx;
                if (Math.abs(x1) <= 1) roots++;
                if (Math.abs(x2) <= 1) roots++;
                if (x1 < -1) x1 = x2;
            }

            if (roots === 1) {
                if (h0 < 0) rise = i + x1; else set = i + x1;
            } else if (roots === 2) {
                rise = i + (ye < 0 ? x2 : x1);
                set = i + (ye < 0 ? x1 : x2);
            }
            if (rise !== null && set !== null) break;
            h0 = h2;
        }

        return {
            rise: rise !== null ? hoursLater(t, rise) : null,
            set: set !== null ? hoursLater(t, set) : null,
            alwaysUp: rise === null && set === null && h0 > 0,
            alwaysDown: rise === null && set === null && h0 <= 0,
        };
    }
    function hoursLater(date, h) { return new Date(date.valueOf() + h * 3600000); }

    /* ---- Extra chronometry ------------------------------------------------ */

    /* Greenwich & local apparent sidereal time, in hours. */
    function localSiderealHours(date, lng) {
        var d = toDays(date);
        var gmst = (280.46061837 + 360.98564736629 * d) % 360;
        var lmst = (gmst + lng) % 360;
        if (lmst < 0) lmst += 360;
        return lmst / 15;
    }

    /* Equation of time in minutes (apparent minus mean solar time). */
    function equationOfTime(date) {
        var d = toDays(date);
        var M = solarMeanAnomaly(d);
        var L = eclipticLongitude(M);
        var ra = rightAscension(L, 0);
        var meanLong = (280.4665 + 0.98564736 * d) * RAD;
        var e = meanLong - ra;
        while (e > Math.PI) e -= 2 * Math.PI;
        while (e < -Math.PI) e += 2 * Math.PI;
        return e * 4 / RAD;                  // radians → degrees → minutes
    }

    /* Seasons: solve for the moment the Sun's apparent longitude hits a target. */
    function seasonEvent(year, targetDeg) {
        var start = Date.UTC(year, 0, 1);
        var step = 12 * 3600000;
        var prev = longitudeDelta(new Date(start), targetDeg);
        for (var i = 1; i <= 366 * 2; i++) {
            var t = start + i * step;
            var cur = longitudeDelta(new Date(t), targetDeg);
            if (prev < 0 && cur >= 0) {
                var lo = t - step, hi = t;
                for (var k = 0; k < 40; k++) {
                    var mid = (lo + hi) / 2;
                    if (longitudeDelta(new Date(mid), targetDeg) < 0) lo = mid; else hi = mid;
                }
                return new Date(Math.round((lo + hi) / 2));
            }
            prev = cur;
        }
        return null;
    }
    function longitudeDelta(date, targetDeg) {
        var diff = sunLongitudeDeg(date) - targetDeg;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        return diff;
    }
    function sunLongitudeDeg(date) {
        // Meeus, chapter 25 — apparent solar longitude, good to about 0.01°.
        var T = toDays(date) / 36525;
        var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
        var M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * RAD;
        var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
            0.000289 * Math.sin(3 * M);
        var omega = (125.04 - 1934.136 * T) * RAD;
        var lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega);
        lambda %= 360;
        return lambda < 0 ? lambda + 360 : lambda;
    }

    /* Earth's current orbital speed & distance to the Sun (approximate). */
    function earthOrbit(date) {
        var d = toDays(date);
        var M = solarMeanAnomaly(d);
        var ecc = 0.0167086;
        var au = 1.00014 - 0.01671 * Math.cos(M) - 0.00014 * Math.cos(2 * M);
        var speed = 29.7859 * Math.sqrt((2 / au) - 1);   // vis-viva, km/s (a = 1 AU)
        return { au: au, km: au * 149597870.7, speed: speed, eccentricity: ecc };
    }

    global.Astro = {
        RAD: RAD,
        SYNODIC: SYNODIC,
        toJulian: toJulian,
        toDays: toDays,
        sunPosition: sunPosition,
        sunTimes: sunTimes,
        moonPosition: moonPosition,
        moonIllumination: moonIllumination,
        moonPhaseName: moonPhaseName,
        moonTimes: moonTimes,
        nextMoonPhase: nextMoonPhase,
        localSiderealHours: localSiderealHours,
        equationOfTime: equationOfTime,
        seasonEvent: seasonEvent,
        earthOrbit: earthOrbit,
    };
})(window);
