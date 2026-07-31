/* ==========================================================================
   Clamor — sound level meter
   Reads the microphone, turns it into an (approximate) dB SPL readout with
   peak / max / average / Leq statistics, a rolling history graph and a
   configurable loudness alarm. Everything stays on the device.
   ========================================================================== */
(function () {
    'use strict';

    const $ = (s) => document.querySelector(s);

    /* ---- Elements ---- */
    const listenBtn = $('#listenBtn');
    const listenLabel = listenBtn.querySelector('.btn-label');
    const listenIcon = listenBtn.querySelector('.btn-icon');
    const resetBtn = $('#resetBtn');
    const exportBtn = $('#exportBtn');
    const notice = $('#notice');

    const statusPill = $('#statusPill');
    const statusText = $('#statusText');
    const dbNow = $('#dbNow');
    const dbLabel = $('#dbLabel');
    const weightTag = $('#weightTag');
    const liveAnnounce = $('#liveAnnounce');
    const gaugeArc = $('#gaugeArc');
    const peakMark = $('#peakMark');
    const alarmMark = $('#alarmMark');
    const flash = $('#flash');

    const statPeak = $('#statPeak');
    const statMax = $('#statMax');
    const statAvg = $('#statAvg');
    const statMin = $('#statMin');
    const statLeq = $('#statLeq');
    const statTime = $('#statTime');

    const historyCanvas = $('#history');
    const hctx = historyCanvas.getContext('2d');

    const alarmOn = $('#alarmOn');
    const alarmLevel = $('#alarmLevel');
    const alarmLevelVal = $('#alarmLevelVal');
    const alarmHold = $('#alarmHold');
    const alarmHoldVal = $('#alarmHoldVal');
    const alarmSound = $('#alarmSound');
    const alarmFlash = $('#alarmFlash');
    const alarmVibrate = $('#alarmVibrate');
    const alarmNotify = $('#alarmNotify');

    const calibration = $('#calibration');
    const calibrationVal = $('#calibrationVal');
    const response = $('#response');
    const responseVal = $('#responseVal');
    const weighting = $('#weighting');
    const keepAwake = $('#keepAwake');
    const autoStart = $('#autoStart');

    /* ---- Constants ---- */
    const STORE_KEY = 'clamor.settings.v1';
    /* Rough mapping from digital full scale to dB SPL. Consumer microphones
       vary wildly, hence the calibration slider. */
    const REF_SPL = 94;
    const GAUGE_MIN = 20;
    const GAUGE_MAX = 130;
    const HISTORY_SECONDS = 60;
    const HISTORY_HZ = 10;
    const HISTORY_LEN = HISTORY_SECONDS * HISTORY_HZ;
    const LOG_LIMIT = 60 * 60 * HISTORY_HZ;   /* one hour of CSV samples */
    const RESPONSES = [
        { name: 'Slow (1 s)', attack: 1000, release: 1000 },
        { name: 'Fast (125 ms)', attack: 125, release: 125 },
        { name: 'Impulse (35 ms)', attack: 35, release: 1500 },
    ];

    /* ---- Audio state ---- */
    let stream = null;
    let audioCtx = null;
    let analyser = null;
    let sourceNode = null;
    let timeData = null;
    let freqData = null;
    let weights = null;          /* linear power weights per FFT bin */
    let rafId = null;
    let tickId = 0;
    let listening = false;
    let starting = false;

    /* ---- Measurement state ---- */
    let smoothed = null;         /* smoothed level, dB SPL */
    let lastFrame = 0;
    let startedAt = 0;
    let peak = -Infinity;        /* instantaneous sample peak */
    let maxLevel = -Infinity;
    let minLevel = Infinity;
    let sumLevel = 0;
    let sumEnergy = 0;
    let sampleCount = 0;
    let lastHistoryAt = 0;
    let history = new Array(HISTORY_LEN).fill(null);
    let log = [];

    /* ---- Alarm state ---- */
    let aboveSince = 0;
    let alarmActive = false;
    let beepTimer = 0;
    let flashTimer = 0;
    let wakeLock = null;

    /* ---- Helpers ---- */
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const isNum = (v) => typeof v === 'number' && isFinite(v);
    const fmt = (v) => (isNum(v) ? v.toFixed(1) : '—');

    function setNotice(msg) {
        if (!msg) {
            notice.hidden = true;
            notice.textContent = '';
            return;
        }
        notice.textContent = msg;
        notice.hidden = false;
    }

    function setStatus(text, kind) {
        statusText.textContent = text;
        statusPill.className = 'pill pill-' + (kind || 'idle');
    }

    function describe(db) {
        if (db < 30) return 'Very quiet — you could hear a pin drop.';
        if (db < 50) return 'Quiet — library-ish calm.';
        if (db < 70) return 'Normal — conversation level.';
        if (db < 85) return 'Loud — like a busy street.';
        if (db < 100) return 'Very loud — protect your ears if this lasts.';
        return 'Dangerous — hearing damage in minutes.';
    }

    /* A-weighting response in dB at a given frequency (IEC 61672). */
    function aWeightDb(f) {
        if (f <= 0) return -200;
        const f2 = f * f;
        const num = 12194 * 12194 * f2 * f2;
        const den = (f2 + 20.6 * 20.6) *
            Math.sqrt((f2 + 107.7 * 107.7) * (f2 + 737.9 * 737.9)) *
            (f2 + 12194 * 12194);
        return 20 * Math.log10(num / den) + 2.0;
    }

    function buildWeights() {
        if (!analyser || !audioCtx) return;
        const bins = analyser.frequencyBinCount;
        const nyquist = audioCtx.sampleRate / 2;
        weights = new Float32Array(bins);
        for (let i = 0; i < bins; i++) {
            const f = (i + 0.5) * nyquist / bins;
            weights[i] = Math.pow(10, aWeightDb(f) / 10);
        }
    }

    function currentResponse() {
        const idx = Math.round(Number(response.value));
        return RESPONSES[isNum(idx) ? clamp(idx, 0, RESPONSES.length - 1) : 1];
    }

    /* ---- Settings ---- */
    const settingInputs = [alarmOn, alarmLevel, alarmHold, alarmSound, alarmFlash,
        alarmVibrate, alarmNotify, calibration, response, weighting, keepAwake, autoStart];

    function saveSettings() {
        const data = {};
        settingInputs.forEach((el) => {
            data[el.id] = el.type === 'checkbox' ? el.checked : el.value;
        });
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(data));
        } catch (err) {
            /* storage may be disabled — settings simply won't persist */
        }
    }

    function loadSettings() {
        let data = null;
        try {
            data = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
        } catch (err) {
            data = null;
        }
        if (!data || typeof data !== 'object') return;
        settingInputs.forEach((el) => {
            const v = data[el.id];
            if (v === undefined) return;
            if (el.type === 'checkbox') {
                el.checked = !!v;
            } else {
                el.value = String(v);
                if (el.value === '') el.value = el.defaultValue;
            }
        });
    }

    function syncLabels() {
        alarmLevelVal.textContent = alarmLevel.value + ' dB';
        alarmHoldVal.textContent = Number(alarmHold.value).toFixed(1) + ' s';
        const cal = Number(calibration.value);
        calibrationVal.textContent = (cal > 0 ? '+' : '') + cal + ' dB';
        responseVal.textContent = currentResponse().name;
        weightTag.textContent = weighting.checked ? '(A)' : '(Z)';
        updateAlarmMark();
    }

    /* ---- Gauge ---- */
    let arcLength = 0;

    function initGauge() {
        arcLength = gaugeArc.getTotalLength();
        gaugeArc.style.strokeDasharray = String(arcLength);
        gaugeArc.style.strokeDashoffset = String(arcLength);
    }

    const gaugeFraction = (db) =>
        clamp((db - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN), 0, 1);

    function drawGauge(db) {
        const frac = isNum(db) ? gaugeFraction(db) : 0;
        gaugeArc.style.strokeDashoffset = String(arcLength * (1 - frac));
    }

    /* Position a tick on the 160°-wide gauge arc (radius 80, centre 100,110). */
    function placeMark(el, db) {
        const angle = Math.PI - gaugeFraction(db) * Math.PI;
        const cx = 100 + Math.cos(angle) * 80;
        const cy = 110 - Math.sin(angle) * 80;
        const ux = Math.cos(angle);
        const uy = -Math.sin(angle);
        el.setAttribute('x1', (cx - ux * 9).toFixed(2));
        el.setAttribute('y1', (cy - uy * 9).toFixed(2));
        el.setAttribute('x2', (cx + ux * 9).toFixed(2));
        el.setAttribute('y2', (cy + uy * 9).toFixed(2));
    }

    function updateAlarmMark() {
        if (alarmOn.checked) {
            placeMark(alarmMark, Number(alarmLevel.value));
            alarmMark.classList.add('on');
        } else {
            alarmMark.classList.remove('on');
        }
    }

    /* ---- History graph ---- */
    let hw = 0, hh = 0;

    function resizeHistory() {
        const rect = historyCanvas.getBoundingClientRect();
        const dpr = clamp(window.devicePixelRatio || 1, 1, 3);
        hw = Math.max(1, Math.round(rect.width));
        hh = Math.max(1, Math.round(rect.height));
        historyCanvas.width = Math.round(hw * dpr);
        historyCanvas.height = Math.round(hh * dpr);
        hctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawHistory();
    }

    function yFor(db) {
        return hh - gaugeFraction(db) * hh;
    }

    function drawHistory() {
        if (!hw || !hh) return;
        hctx.clearRect(0, 0, hw, hh);

        /* grid */
        hctx.strokeStyle = '#1a2231';
        hctx.fillStyle = '#4b5568';
        hctx.lineWidth = 1;
        hctx.font = '10px ui-monospace, monospace';
        for (let db = 30; db <= 120; db += 30) {
            const y = Math.round(yFor(db)) + 0.5;
            hctx.beginPath();
            hctx.moveTo(0, y);
            hctx.lineTo(hw, y);
            hctx.stroke();
            hctx.fillText(db + ' dB', 4, y - 3);
        }

        /* alarm threshold */
        if (alarmOn.checked) {
            const y = Math.round(yFor(Number(alarmLevel.value))) + 0.5;
            hctx.strokeStyle = 'rgba(251, 113, 133, .8)';
            hctx.setLineDash([5, 4]);
            hctx.beginPath();
            hctx.moveTo(0, y);
            hctx.lineTo(hw, y);
            hctx.stroke();
            hctx.setLineDash([]);
        }

        /* trace */
        const step = hw / (HISTORY_LEN - 1);
        let started = false;
        hctx.beginPath();
        for (let i = 0; i < HISTORY_LEN; i++) {
            const v = history[i];
            if (v === null) { started = false; continue; }
            const x = i * step;
            const y = yFor(v);
            if (!started) { hctx.moveTo(x, y); started = true; }
            else hctx.lineTo(x, y);
        }
        const grad = hctx.createLinearGradient(0, hh, 0, 0);
        grad.addColorStop(0, '#34d399');
        grad.addColorStop(0.55, '#fbbf24');
        grad.addColorStop(1, '#fb7185');
        hctx.strokeStyle = grad;
        hctx.lineWidth = 2;
        hctx.lineJoin = 'round';
        hctx.stroke();
    }

    function pushHistory(db) {
        history.push(db);
        while (history.length > HISTORY_LEN) history.shift();
        drawHistory();
    }

    /* ---- Stats ---- */
    function resetStats() {
        peak = -Infinity;
        maxLevel = -Infinity;
        minLevel = Infinity;
        sumLevel = 0;
        sumEnergy = 0;
        sampleCount = 0;
        startedAt = listening ? performance.now() : 0;
        history = new Array(HISTORY_LEN).fill(null);
        log = [];
        smoothed = null;
        aboveSince = 0;
        renderStats();
        drawHistory();
    }

    function renderStats() {
        statPeak.textContent = isNum(peak) ? fmt(peak) : '—';
        statMax.textContent = isNum(maxLevel) ? fmt(maxLevel) : '—';
        statMin.textContent = isNum(minLevel) ? fmt(minLevel) : '—';
        statAvg.textContent = sampleCount ? fmt(sumLevel / sampleCount) : '—';
        statLeq.textContent = sampleCount
            ? fmt(10 * Math.log10(sumEnergy / sampleCount))
            : '—';
        if (isNum(maxLevel)) placeMark(peakMark, maxLevel);
        peakMark.style.opacity = isNum(maxLevel) ? '.85' : '0';

        const secs = startedAt ? Math.floor((performance.now() - startedAt) / 1000) : 0;
        statTime.textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
    }

    /* ---- Alarm ---- */
    function beep() {
        if (!audioCtx || audioCtx.state === 'closed') return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const t = audioCtx.currentTime;
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, t);
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.25);
            osc.onended = () => {
                try { osc.disconnect(); gain.disconnect(); } catch (err) { /* already gone */ }
            };
        } catch (err) {
            /* audio output unavailable — the other alarm cues still fire */
        }
    }

    function doFlash() {
        flash.classList.add('on');
        clearTimeout(flashTimer);
        flashTimer = setTimeout(() => flash.classList.remove('on'), 140);
    }

    function notify(db) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        try {
            new Notification('Clamor — it is loud in here', {
                body: fmt(db) + ' dB, above your ' + alarmLevel.value + ' dB limit.',
                tag: 'clamor-alarm',
                silent: true,
            });
        } catch (err) {
            /* some browsers require a service worker for notifications */
        }
    }

    function startAlarm(db) {
        if (alarmActive) return;
        alarmActive = true;
        document.body.classList.add('alarming');
        setStatus('Too loud!', 'alarm');
        if (alarmVibrate.checked && navigator.vibrate) {
            try { navigator.vibrate([200, 100, 200]); } catch (err) { /* ignore */ }
        }
        if (alarmNotify.checked) notify(db);
        const tick = () => {
            if (!alarmActive) return;
            if (alarmSound.checked) beep();
            if (alarmFlash.checked) doFlash();
        };
        tick();
        clearInterval(beepTimer);
        beepTimer = setInterval(tick, 600);
    }

    function stopAlarm() {
        if (!alarmActive) return;
        alarmActive = false;
        clearInterval(beepTimer);
        beepTimer = 0;
        document.body.classList.remove('alarming');
        flash.classList.remove('on');
        if (listening) setStatus('Listening', 'live');
    }

    function checkAlarm(db, now) {
        if (!alarmOn.checked || !listening) {
            aboveSince = 0;
            stopAlarm();
            return;
        }
        const limit = Number(alarmLevel.value);
        const holdMs = Number(alarmHold.value) * 1000;
        if (db >= limit) {
            if (!aboveSince) aboveSince = now;
            if (now - aboveSince >= holdMs) startAlarm(db);
        } else if (db < limit - 3) {   /* hysteresis so it doesn't chatter */
            aboveSince = 0;
            stopAlarm();
        }
    }

    /* ---- Measurement loop ---- */
    function frame(now) {
        rafId = requestAnimationFrame(frame);
        measure(now);
    }

    /* Background tabs freeze requestAnimationFrame, so a (throttled) timer
       keeps the meter and the alarm alive while the page is hidden. */
    function startLoop() {
        stopLoop();
        if (document.visibilityState === 'hidden') {
            tickId = setInterval(() => measure(performance.now()), 100);
        } else {
            rafId = requestAnimationFrame(frame);
        }
    }

    function stopLoop() {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        if (tickId) { clearInterval(tickId); tickId = 0; }
    }

    function measure(now) {
        if (!listening || !analyser) return;

        analyser.getFloatTimeDomainData(timeData);

        let sum = 0;
        let maxAbs = 0;
        for (let i = 0; i < timeData.length; i++) {
            const v = timeData[i];
            sum += v * v;
            const a = Math.abs(v);
            if (a > maxAbs) maxAbs = a;
        }
        const rms = Math.sqrt(sum / timeData.length);

        /* A-weighting is applied as a correction derived from the spectrum, so
           toggling it never changes the underlying (unweighted) measurement. */
        let weightDelta = 0;
        if (weighting.checked && weights) {
            analyser.getFloatFrequencyData(freqData);
            let total = 0;
            let weighted = 0;
            for (let i = 1; i < freqData.length; i++) {
                const p = Math.pow(10, freqData[i] / 10);
                total += p;
                weighted += p * weights[i];
            }
            if (total > 1e-20 && weighted > 1e-20) {
                weightDelta = clamp(10 * Math.log10(weighted / total), -60, 10);
            }
        }

        const cal = Number(calibration.value) + REF_SPL + weightDelta;
        const raw = rms > 1e-9 ? 20 * Math.log10(rms) + cal : GAUGE_MIN - 20;
        const level = Math.max(0, raw);

        /* exponential averaging with the selected time weighting */
        const dt = lastFrame ? Math.min(250, now - lastFrame) : 16;
        lastFrame = now;
        const resp = currentResponse();
        if (smoothed === null) {
            smoothed = level;
        } else {
            const tau = level > smoothed ? resp.attack : resp.release;
            const alpha = 1 - Math.exp(-dt / Math.max(1, tau));
            smoothed += (level - smoothed) * alpha;
        }

        const shown = smoothed;
        const instPeak = maxAbs > 1e-9 ? Math.max(0, 20 * Math.log10(maxAbs) + cal) : 0;

        if (instPeak > peak) peak = instPeak;
        if (shown > maxLevel) maxLevel = shown;
        if (shown < minLevel) minLevel = shown;
        sumLevel += shown;
        sumEnergy += Math.pow(10, shown / 10);
        sampleCount++;

        dbNow.textContent = shown.toFixed(1);
        dbLabel.textContent = describe(shown);
        drawGauge(shown);
        checkAlarm(shown, now);

        if (now - lastHistoryAt >= 1000 / HISTORY_HZ) {
            lastHistoryAt = now;
            pushHistory(shown);
            renderStats();
            if (log.length < LOG_LIMIT) {
                log.push([new Date().toISOString(), shown.toFixed(1), instPeak.toFixed(1)]);
            }
        }
    }

    /* Screen-reader friendly updates, throttled to avoid a torrent of speech. */
    setInterval(() => {
        if (!listening || smoothed === null) return;
        liveAnnounce.textContent = smoothed.toFixed(0) + ' decibels. ' + describe(smoothed);
    }, 5000);

    /* ---- Wake lock ---- */
    async function requestWakeLock() {
        if (!keepAwake.checked || !('wakeLock' in navigator) || wakeLock) return;
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => { wakeLock = null; });
        } catch (err) {
            wakeLock = null;
        }
    }

    function releaseWakeLock() {
        if (!wakeLock) return;
        const lock = wakeLock;
        wakeLock = null;
        try { lock.release(); } catch (err) { /* already released */ }
    }

    /* ---- Start / stop ---- */
    async function start() {
        if (listening || starting) return;
        starting = true;
        listenBtn.disabled = true;
        setNotice('');
        setStatus('Asking for the microphone…', 'idle');

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setStatus('Not supported', 'error');
            setNotice('This browser cannot reach the microphone. Try a recent Chrome, Edge, Firefox or Safari over HTTPS.');
            listenBtn.disabled = false;
            starting = false;
            return;
        }

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    /* processing would fight the meter, so ask for raw audio */
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                },
                video: false,
            });

            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) throw new Error('no-audio-context');
            audioCtx = new Ctx();
            if (audioCtx.state === 'suspended') await audioCtx.resume();

            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0;
            timeData = new Float32Array(analyser.fftSize);
            freqData = new Float32Array(analyser.frequencyBinCount);
            buildWeights();

            sourceNode = audioCtx.createMediaStreamSource(stream);
            sourceNode.connect(analyser);   /* not connected to the speakers */

            stream.getAudioTracks().forEach((track) => {
                track.addEventListener('ended', () => {
                    if (listening) {
                        stop();
                        setStatus('Microphone lost', 'error');
                        setNotice('The microphone was disconnected or taken by another app. Press start to try again.');
                    }
                });
            });

            listening = true;
            lastFrame = 0;
            lastHistoryAt = 0;
            resetStats();
            startedAt = performance.now();
            setStatus('Listening', 'live');
            listenLabel.textContent = 'Stop listening';
            listenIcon.textContent = '⏹';
            listenBtn.classList.add('is-live');
            requestWakeLock();
            if (alarmNotify.checked) askNotify();
            startLoop();
        } catch (err) {
            cleanupAudio();
            const name = err && err.name;
            setStatus('No microphone', 'error');
            if (name === 'NotAllowedError' || name === 'SecurityError') {
                setNotice('Microphone blocked. Allow microphone access for this page in your browser settings, then press start again.');
            } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
                setNotice('No microphone was found on this device.');
            } else if (name === 'NotReadableError') {
                setNotice('The microphone is busy — another app or tab may be using it.');
            } else {
                setNotice('Could not start the meter: ' + (err && err.message ? err.message : 'unknown error') + '.');
            }
        } finally {
            listenBtn.disabled = false;
            starting = false;
        }
    }

    function cleanupAudio() {
        stopLoop();
        if (sourceNode) { try { sourceNode.disconnect(); } catch (err) { /* ignore */ } sourceNode = null; }
        if (analyser) { try { analyser.disconnect(); } catch (err) { /* ignore */ } analyser = null; }
        if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
        if (audioCtx) {
            const ctx = audioCtx;
            audioCtx = null;
            if (ctx.state !== 'closed') { ctx.close().catch(() => { /* ignore */ }); }
        }
        timeData = null;
        freqData = null;
        weights = null;
    }

    function stop() {
        stopAlarm();
        listening = false;
        cleanupAudio();
        releaseWakeLock();
        smoothed = null;
        lastFrame = 0;
        dbNow.textContent = '—';
        dbLabel.textContent = 'Stopped — your statistics are kept below.';
        drawGauge(null);
        setStatus('Idle', 'idle');
        listenLabel.textContent = 'Start listening';
        listenIcon.textContent = '🎙️';
        listenBtn.classList.remove('is-live');
        renderStats();
    }

    function askNotify() {
        if (!('Notification' in window)) {
            alarmNotify.checked = false;
            setNotice('This browser cannot show desktop notifications.');
            saveSettings();
            return;
        }
        if (Notification.permission === 'default') {
            Notification.requestPermission().then((perm) => {
                if (perm !== 'granted') {
                    alarmNotify.checked = false;
                    saveSettings();
                }
            }).catch(() => { /* ignore */ });
        } else if (Notification.permission === 'denied') {
            alarmNotify.checked = false;
            setNotice('Notifications are blocked for this page.');
            saveSettings();
        }
    }

    /* ---- Export ---- */
    function exportCsv() {
        if (!log.length) {
            setNotice('Nothing to export yet — start listening first.');
            return;
        }
        const rows = [['timestamp', 'level_db', 'peak_db']].concat(log);
        const csv = rows.map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clamor-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setNotice('');
    }

    /* ---- Events ---- */
    listenBtn.addEventListener('click', () => {
        if (listening) stop(); else start();
    });

    resetBtn.addEventListener('click', () => {
        resetStats();
        if (listening) startedAt = performance.now();
        setNotice('');
    });

    exportBtn.addEventListener('click', exportCsv);

    settingInputs.forEach((el) => {
        el.addEventListener('input', () => {
            syncLabels();
            saveSettings();
            drawHistory();
        });
    });

    alarmOn.addEventListener('change', () => {
        if (!alarmOn.checked) { aboveSince = 0; stopAlarm(); }
    });

    alarmNotify.addEventListener('change', () => {
        if (alarmNotify.checked) askNotify();
    });

    keepAwake.addEventListener('change', () => {
        if (keepAwake.checked && listening) requestWakeLock();
        else releaseWakeLock();
    });

    weighting.addEventListener('change', () => {
        /* weighting changes the scale, so old extremes are no longer comparable */
        if (listening) resetStats();
    });

    document.addEventListener('visibilitychange', () => {
        if (!listening) return;
        if (document.visibilityState === 'visible') {
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume().catch(() => { /* ignore */ });
            }
            requestWakeLock();
        }
        startLoop();
    });

    document.addEventListener('keydown', (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey || !e.key) return;
        if (e.target instanceof HTMLElement) {
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
                tag === 'BUTTON' || tag === 'A' || e.target.isContentEditable) return;
        }
        if (e.code === 'Space') {
            e.preventDefault();
            if (listening) stop(); else start();
        } else if (e.key.toLowerCase() === 'r') {
            resetStats();
        }
    });

    window.addEventListener('resize', resizeHistory);
    window.addEventListener('pagehide', () => { stop(); });

    /* ---- Boot ---- */
    loadSettings();
    syncLabels();
    initGauge();
    resizeHistory();
    renderStats();
    drawGauge(null);

    if (window.ResizeObserver) {
        new ResizeObserver(resizeHistory).observe(historyCanvas);
    }

    if (autoStart.checked) {
        /* only auto-start where permission was already granted, otherwise the
           browser would show a prompt with no user gesture behind it */
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'microphone' })
                .then((res) => { if (res.state === 'granted') start(); })
                .catch(() => { /* permission name unsupported — stay idle */ });
        }
    }
})();
