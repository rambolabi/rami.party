/* ==========================================================================
   Tremorbell — a cute earthquake detector
   Reads devicemotion, high-pass filters out gravity, and converts the
   shaking into a Richter-style local magnitude plus a felt intensity.
   Everything runs locally; only the settings touch localStorage.
   ========================================================================== */
(function () {
    'use strict';

    /* ---------- constants ---------- */
    var G_TO_GAL = 100;            // 1 m/s^2 = 100 gal (cm/s^2)
    var WOOD_ANDERSON_GAIN = 2080; // static magnification of the classic instrument
    var GRAVITY_TAU = 0.6;         // seconds — how quickly the gravity estimate follows
    var WINDOW_MS = 900;           // sliding analysis window
    var EVENT_GAP_MS = 1200;       // quiet time before an event is considered over
    var TRACE_POINTS = 260;
    var STORE_KEY = 'tremorbell.settings.v1';

    /* ---------- dom ---------- */
    var $ = function (id) { return document.getElementById(id); };
    var canvas = $('trace');
    var ctx = canvas.getContext('2d');
    var magNow = $('magNow');
    var magWord = $('magWord');
    var magPeak = $('magPeak');
    var peakWhen = $('peakWhen');
    var pgaNow = $('pgaNow');
    var mmiNow = $('mmiNow');
    var mmiWord = $('mmiWord');
    var gaugeFill = $('gaugeFill');
    var gaugeNeedle = $('gaugeNeedle');
    var needleBubble = $('needleBubble');
    var statusPill = $('statusPill');
    var statusText = $('statusText');
    var sensorTag = $('sensorTag');
    var stageHint = $('stageHint');
    var listenBtn = $('listenBtn');
    var demoBtn = $('demoBtn');
    var calibrateBtn = $('calibrateBtn');
    var threshInput = $('thresh');
    var threshOut = $('threshOut');
    var distInput = $('dist');
    var distOut = $('distOut');
    var soundToggle = $('soundToggle');
    var motionToggle = $('motionToggle');
    var logList = $('log');
    var clearBtn = $('clearBtn');
    var exportBtn = $('exportBtn');
    var liveRegion = $('liveRegion');
    var mascot = $('mascot');
    var magCard = document.querySelector('.card-mag');

    /* ---------- state ---------- */
    var running = false;
    var demoUntil = 0;
    var gravity = { x: 0, y: 0, z: 0 };
    var gravityReady = false;
    var lastSampleAt = 0;
    var samples = [];              // { t, a } with a in gal, gravity removed
    var trace = new Array(TRACE_POINTS).fill(0);
    var sessionPeak = 0;
    var events = [];
    var current = null;            // event being recorded
    var lastAbove = 0;
    var audioCtx = null;
    var rafId = 0;

    var settings = {
        theme: 'peach',
        threshold: 3,
        distance: 10,
        sound: false,
        mascot: true,
    };

    /* ---------- themes ---------- */
    var THEMES = [
        { id: 'peach', label: 'Peach', swatch: '#ff8a5b' },
        { id: 'mint', label: 'Mint', swatch: '#34b39a' },
        { id: 'blossom', label: 'Blossom', swatch: '#d264b6' },
        { id: 'midnight', label: 'Midnight', swatch: '#7c9cff' },
        { id: 'contrast', label: 'High contrast', swatch: '#ffd400' },
    ];

    function buildThemes() {
        var host = $('themeSwatches');
        THEMES.forEach(function (theme) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'swatch';
            btn.style.setProperty('--sw', theme.swatch);
            btn.title = theme.label;
            btn.setAttribute('aria-label', theme.label + ' theme');
            btn.setAttribute('aria-pressed', String(settings.theme === theme.id));
            btn.addEventListener('click', function () {
                settings.theme = theme.id;
                applyTheme();
                save();
            });
            host.appendChild(btn);
        });
    }

    function applyTheme() {
        document.documentElement.setAttribute('data-theme', settings.theme);
        var buttons = document.querySelectorAll('.swatch');
        Array.prototype.forEach.call(buttons, function (btn, i) {
            btn.setAttribute('aria-pressed', String(THEMES[i].id === settings.theme));
        });
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', getComputedStyle(document.body).backgroundColor);
        }
    }

    /* ---------- settings persistence ---------- */
    function save() {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(settings));
        } catch (err) {
            /* storage may be unavailable — settings simply won't persist */
        }
    }

    function load() {
        var raw;
        try {
            raw = localStorage.getItem(STORE_KEY);
        } catch (err) {
            return;
        }
        if (!raw) return;
        try {
            var saved = JSON.parse(raw);
            if (saved && typeof saved === 'object') {
                if (THEMES.some(function (t) { return t.id === saved.theme; })) settings.theme = saved.theme;
                if (isFinite(saved.threshold)) settings.threshold = clamp(+saved.threshold, 1, 60);
                if (isFinite(saved.distance)) settings.distance = clamp(+saved.distance, 1, 600);
                settings.sound = !!saved.sound;
                settings.mascot = saved.mascot !== false;
            }
        } catch (err) {
            /* corrupt settings are ignored */
        }
    }

    /* ---------- maths ---------- */
    function clamp(value, lo, hi) {
        return Math.min(hi, Math.max(lo, value));
    }

    // Dominant frequency of the recent window, from zero crossings (Hz).
    function dominantFrequency(list) {
        if (list.length < 4) return 0;
        var crossings = 0;
        for (var i = 1; i < list.length; i++) {
            if ((list[i - 1].a < 0 && list[i].a >= 0) || (list[i - 1].a > 0 && list[i].a <= 0)) crossings++;
        }
        var span = (list[list.length - 1].t - list[0].t) / 1000;
        if (span <= 0) return 0;
        return crossings / (2 * span);
    }

    // Richter local magnitude from a peak ground acceleration.
    // pga: gal (cm/s^2) · freq: Hz · distance: km
    function localMagnitude(pga, freq, distance) {
        if (!(pga > 0) || !(freq > 0)) return 0;
        var omega = 2 * Math.PI * freq;
        var displacementCm = pga / (omega * omega);          // cm of ground movement
        var traceMm = displacementCm * 10 * WOOD_ANDERSON_GAIN; // Wood-Anderson trace, mm
        if (!(traceMm > 0)) return 0;
        // Hutton & Boore (1987) southern California attenuation.
        var m = Math.log10(traceMm) + 1.11 * Math.log10(distance) + 0.00189 * distance - 2.09;
        return clamp(m, 0, 10);
    }

    // Wald et al. (1999) instrumental intensity from PGA in gal.
    function mercalli(pga) {
        if (!(pga > 0)) return 0;
        return clamp(3.66 * Math.log10(pga) - 1.66, 1, 12);
    }

    var ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

    function roman(mmi) {
        return ROMAN[clamp(Math.round(mmi), 1, 12)] || '—';
    }

    function mmiWords(mmi) {
        if (mmi < 2) return 'Not felt — instruments only';
        if (mmi < 3) return 'Barely felt by a few, very still people';
        if (mmi < 4) return 'Felt indoors — like a truck passing';
        if (mmi < 5) return 'Dishes rattle, doors swing';
        if (mmi < 6) return 'Felt by nearly everyone, things topple';
        if (mmi < 7) return 'Furniture moves, plaster cracks';
        if (mmi < 8) return 'Hard to stand up';
        if (mmi < 9) return 'Serious damage to ordinary buildings';
        return 'Severe — widespread destruction';
    }

    function magWords(m) {
        if (m < 1) return 'Quiet as a sleeping cat';
        if (m < 2) return 'Micro — only instruments notice';
        if (m < 3) return 'Minor — a tiny shiver';
        if (m < 4) return 'Minor — noticed by the attentive';
        if (m < 5) return 'Light — rattling and small shifts';
        if (m < 6) return 'Moderate — weak buildings suffer';
        if (m < 7) return 'Strong — damage over ~100 km';
        if (m < 8) return 'Major — serious, widespread damage';
        return 'Great — catastrophic shaking';
    }

    /* ---------- sensors ---------- */
    function handleMotion(event) {
        var acc = event.accelerationIncludingGravity || event.acceleration;
        if (!acc || acc.x === null || acc.x === undefined) return;
        var now = performance.now();
        var dt = lastSampleAt ? (now - lastSampleAt) / 1000 : 0.02;
        lastSampleAt = now;
        dt = clamp(dt, 0.001, 0.5);

        var x = acc.x || 0;
        var y = acc.y || 0;
        var z = acc.z || 0;

        if (event.acceleration && event.acceleration.x !== null && event.acceleration.x !== undefined) {
            // The device already removed gravity for us.
            pushSample(now, Math.sqrt(x * x + y * y + z * z) * G_TO_GAL);
            return;
        }

        if (!gravityReady) {
            gravity.x = x;
            gravity.y = y;
            gravity.z = z;
            gravityReady = true;
        }
        var alpha = dt / (GRAVITY_TAU + dt);
        gravity.x += alpha * (x - gravity.x);
        gravity.y += alpha * (y - gravity.y);
        gravity.z += alpha * (z - gravity.z);

        var dx = x - gravity.x;
        var dy = y - gravity.y;
        var dz = z - gravity.z;
        pushSample(now, Math.sqrt(dx * dx + dy * dy + dz * dz) * G_TO_GAL);
    }

    function pushSample(t, gal) {
        // Alternate the sign so the zero-crossing frequency estimate stays meaningful
        // for a vector magnitude, which is always positive.
        var signed = samples.length && samples[samples.length - 1].a >= 0 ? -gal : gal;
        samples.push({ t: t, a: signed });
        var cutoff = t - WINDOW_MS;
        while (samples.length && samples[0].t < cutoff) samples.shift();
    }

    /* ---------- demo mode ---------- */
    function demoSample(now) {
        if (now > demoUntil) return;
        var elapsed = (demoUntil - now) / 1000;
        var progress = 1 - elapsed / 6;                      // 6 second scripted quake
        var envelope = Math.exp(-Math.pow((progress - 0.35) * 3.2, 2)) * 120;
        var wave = Math.sin(now / 1000 * 2 * Math.PI * 3.2) + 0.4 * Math.sin(now / 1000 * 2 * Math.PI * 7.5);
        pushSample(now, Math.abs(envelope * wave) + Math.random() * 2);
    }

    /* ---------- analysis loop ---------- */
    function analyse() {
        rafId = requestAnimationFrame(analyse);
        var now = performance.now();
        demoSample(now);

        var recent = samples.filter(function (s) { return s.t > now - WINDOW_MS; });
        var pga = 0;
        for (var i = 0; i < recent.length; i++) {
            var abs = Math.abs(recent[i].a);
            if (abs > pga) pga = abs;
        }

        var freq = dominantFrequency(recent);
        var mag = localMagnitude(pga, freq || 3, settings.distance);
        var mmi = mercalli(pga);

        trace.push(recent.length ? recent[recent.length - 1].a : 0);
        while (trace.length > TRACE_POINTS) trace.shift();

        render(pga, mag, mmi);
        trackEvent(now, pga, mag, mmi);
    }

    function trackEvent(now, pga, mag, mmi) {
        var above = pga >= settings.threshold;
        if (above) {
            lastAbove = now;
            if (!current) {
                current = { start: Date.now(), mag: mag, pga: pga, mmi: mmi };
                setStatus('alert', 'Shaking!');
                if (settings.mascot) mascot.classList.add('wobble');
                ring();
            }
            if (mag > current.mag) current.mag = mag;
            if (pga > current.pga) current.pga = pga;
            if (mmi > current.mmi) current.mmi = mmi;
        } else if (current && now - lastAbove > EVENT_GAP_MS) {
            finishEvent();
        }

        if (current && current.mag > sessionPeak) {
            sessionPeak = current.mag;
            magPeak.textContent = sessionPeak.toFixed(1);
            peakWhen.textContent = 'at ' + new Date().toLocaleTimeString();
        }
    }

    function finishEvent() {
        var done = current;
        current = null;
        mascot.classList.remove('wobble');
        setStatus(running ? 'live' : 'idle', running ? 'Listening' : 'Sleeping');
        if (!done || done.mag <= 0) return;
        done.end = Date.now();
        events.unshift(done);
        if (events.length > 60) events.pop();
        renderLog();
        liveRegion.textContent = 'Tremor recorded, local magnitude ' + done.mag.toFixed(1) +
            ', intensity ' + roman(done.mmi) + '.';
    }

    /* ---------- rendering ---------- */
    function render(pga, mag, mmi) {
        magNow.textContent = mag.toFixed(1);
        magWord.textContent = magWords(mag);
        pgaNow.textContent = pga.toFixed(1);
        mmiNow.textContent = roman(mmi);
        mmiWord.textContent = mmiWords(mmi);
        magCard.classList.toggle('is-shaking', !!current);

        var pct = clamp(mag / 9, 0, 1) * 100;
        gaugeFill.style.width = pct + '%';
        gaugeNeedle.style.left = pct + '%';
        needleBubble.textContent = mag.toFixed(1);

        drawTrace();
    }

    function drawTrace() {
        var dpr = window.devicePixelRatio || 1;
        var w = canvas.clientWidth;
        var h = canvas.clientHeight;
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        var styles = getComputedStyle(document.body);
        var line = styles.getPropertyValue('--accent').trim() || '#ff8a5b';
        var soft = styles.getPropertyValue('--border').trim() || '#eee';

        ctx.strokeStyle = soft;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        var scale = Math.max(20, settings.threshold * 6);
        ctx.strokeStyle = line;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (var i = 0; i < trace.length; i++) {
            var x = (i / (TRACE_POINTS - 1)) * w;
            var y = h / 2 - clamp(trace[i] / scale, -1, 1) * (h / 2 - 8);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    function renderLog() {
        if (!events.length) {
            logList.innerHTML = '<li class="log-empty">Nothing recorded yet — the ground is behaving itself.</li>';
            return;
        }
        logList.textContent = '';
        events.forEach(function (ev) {
            var li = document.createElement('li');
            li.className = 'log-item';

            var mag = document.createElement('span');
            mag.className = 'log-mag';
            mag.textContent = ev.mag.toFixed(1);

            var desc = document.createElement('span');
            desc.className = 'log-desc';
            desc.textContent = magWords(ev.mag) + ' · ' + ev.pga.toFixed(1) + ' gal · intensity ' + roman(ev.mmi);

            var time = document.createElement('span');
            time.className = 'log-time';
            time.textContent = new Date(ev.start).toLocaleTimeString();

            li.appendChild(mag);
            li.appendChild(desc);
            li.appendChild(time);
            logList.appendChild(li);
        });
    }

    function setStatus(kind, text) {
        statusPill.className = 'pill pill-' + kind;
        statusText.textContent = text;
    }

    /* ---------- little bell ---------- */
    function ring() {
        if (!settings.sound) return;
        try {
            if (!audioCtx) {
                var Ctx = window.AudioContext || window.webkitAudioContext;
                if (!Ctx) return;
                audioCtx = new Ctx();
            }
            if (audioCtx.state === 'suspended') audioCtx.resume();
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.7);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.72);
        } catch (err) {
            /* audio is a nicety, never a requirement */
        }
    }

    /* ---------- start / stop ---------- */
    function start() {
        if (typeof DeviceMotionEvent === 'undefined') {
            sensorTag.textContent = 'Sensor: none found';
            stageHint.textContent = 'This device or browser has no motion sensor. Demo mode still works — try it!';
            return;
        }
        var request = window.DeviceMotionEvent && DeviceMotionEvent.requestPermission;
        if (typeof request === 'function') {
            DeviceMotionEvent.requestPermission().then(function (state) {
                if (state === 'granted') attach();
                else {
                    sensorTag.textContent = 'Sensor: permission denied';
                    stageHint.textContent = 'Motion access was denied. You can still explore with demo mode.';
                }
            }).catch(function () {
                sensorTag.textContent = 'Sensor: permission failed';
            });
        } else {
            attach();
        }
    }

    function attach() {
        window.addEventListener('devicemotion', handleMotion, { passive: true });
        running = true;
        gravityReady = false;
        lastSampleAt = 0;
        setStatus('live', 'Listening');
        sensorTag.textContent = 'Sensor: accelerometer live';
        stageHint.textContent = 'Rest the device on a flat surface for the steadiest readings, then tap the table.';
        listenBtn.querySelector('.btn-label').textContent = 'Hush the bell';
        calibrateBtn.disabled = false;
    }

    function stop() {
        window.removeEventListener('devicemotion', handleMotion);
        running = false;
        current = null;
        mascot.classList.remove('wobble');
        setStatus('idle', 'Sleeping');
        sensorTag.textContent = 'Sensor: stopped';
        listenBtn.querySelector('.btn-label').textContent = 'Wake the bell';
        calibrateBtn.disabled = true;
    }

    /* ---------- export ---------- */
    function exportCsv() {
        if (!events.length) {
            liveRegion.textContent = 'Nothing to export yet.';
            return;
        }
        var rows = [['time', 'local_magnitude', 'pga_gal', 'mmi', 'assumed_distance_km']];
        events.forEach(function (ev) {
            rows.push([
                new Date(ev.start).toISOString(),
                ev.mag.toFixed(2),
                ev.pga.toFixed(2),
                roman(ev.mmi),
                String(settings.distance),
            ]);
        });
        var csv = rows.map(function (r) { return r.join(','); }).join('\n');
        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'tremorbell-log.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    /* ---------- wiring ---------- */
    function bind() {
        listenBtn.addEventListener('click', function () {
            if (running) stop();
            else start();
        });

        demoBtn.addEventListener('click', function () {
            demoUntil = performance.now() + 6000;
            if (!running) {
                setStatus('live', 'Demo quake');
                sensorTag.textContent = 'Sensor: simulated';
            }
            stageHint.textContent = 'A scripted magnitude-ish quake is rolling through. Watch the needle climb.';
        });

        calibrateBtn.addEventListener('click', function () {
            gravityReady = false;
            samples = [];
            trace = new Array(TRACE_POINTS).fill(0);
            liveRegion.textContent = 'Sensor re-zeroed.';
        });

        threshInput.addEventListener('input', function () {
            settings.threshold = +threshInput.value;
            threshOut.textContent = threshInput.value;
            save();
        });

        distInput.addEventListener('input', function () {
            settings.distance = +distInput.value;
            distOut.textContent = distInput.value;
            save();
        });

        soundToggle.addEventListener('change', function () {
            settings.sound = soundToggle.checked;
            if (settings.sound) ring();
            save();
        });

        motionToggle.addEventListener('change', function () {
            settings.mascot = motionToggle.checked;
            if (!settings.mascot) mascot.classList.remove('wobble');
            save();
        });

        clearBtn.addEventListener('click', function () {
            events = [];
            sessionPeak = 0;
            magPeak.textContent = '—';
            peakWhen.textContent = 'No tremors yet';
            renderLog();
            liveRegion.textContent = 'Log cleared.';
        });

        exportBtn.addEventListener('click', exportCsv);

        document.addEventListener('visibilitychange', function () {
            if (document.hidden && current) finishEvent();
        });
    }

    /* ---------- boot ---------- */
    load();
    buildThemes();
    applyTheme();
    threshInput.value = settings.threshold;
    threshOut.textContent = settings.threshold;
    distInput.value = settings.distance;
    distOut.textContent = settings.distance;
    soundToggle.checked = settings.sound;
    motionToggle.checked = settings.mascot;
    bind();
    renderLog();
    analyse();

    window.addEventListener('pagehide', function () {
        cancelAnimationFrame(rafId);
    });
})();
