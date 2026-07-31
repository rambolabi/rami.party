/* ==========================================================================
   Sixth Sense — detect the undetectable
   --------------------------------------------------------------------------
   Wakes every sensor/API the device is willing to expose, renders live
   readings, and watches for signals a human can't perceive: micro-tremors,
   magnetic field shifts, infra/ultrasound, invisible light flicker and
   sub-degree tilt drift. Everything stays on the device.
   ========================================================================== */

(function () {
    'use strict';

    /* ---------------------------------------------------------------- utils */

    const $ = (id) => document.getElementById(id);
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const fmt = (v, digits = 2) =>
        (v === null || v === undefined || Number.isNaN(v)) ? '—' : Number(v).toFixed(digits);
    const isSecure = window.isSecureContext;

    // Exponential moving statistics — cheap baseline + deviation tracking.
    function Tracker(alpha) {
        this.alpha = alpha;
        this.mean = null;
        this.varSum = 0;
    }
    Tracker.prototype.push = function (x) {
        if (!Number.isFinite(x)) return;
        if (this.mean === null) { this.mean = x; return; }
        const d = x - this.mean;
        this.mean += this.alpha * d;
        this.varSum = (1 - this.alpha) * (this.varSum + this.alpha * d * d);
    };
    Tracker.prototype.sd = function () { return Math.sqrt(this.varSum); };

    /* ---------------------------------------------------------------- state */

    const state = {
        running: false,
        baseline: null,
        motion: { x: null, y: null, z: null, gx: null, gy: null, gz: null, hz: 0, count: 0 },
        orientation: { alpha: null, beta: null, gamma: null, absolute: false, heading: null },
        magnet: { x: null, y: null, z: null, magnitude: null },
        light: { lux: null },
        proximity: { cm: null, near: null },
        geo: null,
        audio: { infra: null, ultra: null, level: null, peak: null },
        camera: { brightness: null, flicker: null, red: null },
        anomaly: { tremor: 0, field: 0, infra: 0, ultra: 0, flicker: 0, tilt: 0 },
    };

    const trackers = {
        tremor: new Tracker(0.05),
        field: new Tracker(0.02),
        infra: new Tracker(0.05),
        ultra: new Tracker(0.05),
        flicker: new Tracker(0.05),
        tilt: new Tracker(0.02),
    };

    const cleanups = [];
    const onStop = (fn) => cleanups.push(fn);

    /* ------------------------------------------------------------ live cards */

    const CARDS = [
        { id: 'motion', glyph: '📈', title: 'Accelerometer', note: 'Linear acceleration in m/s². The noise floor alone reveals footsteps, fans and passing traffic.' },
        { id: 'gyro', glyph: '🌀', title: 'Gyroscope', note: 'Rotation rate in °/s — sensitive enough to feel your pulse through a table.' },
        { id: 'orient', glyph: '🧭', title: 'Orientation & compass', note: 'Where the device thinks up and north are.' },
        { id: 'magnet', glyph: '🧲', title: 'Magnetometer', note: 'Earth\'s field is ~25–65 µT. Wiring, magnets and motors bend it.' },
        { id: 'light', glyph: '💡', title: 'Ambient light', note: 'Illuminance in lux, if the browser exposes the light sensor.' },
        { id: 'prox', glyph: '👁️', title: 'Proximity', note: 'The sensor that blanks your screen during calls.' },
        { id: 'audio', glyph: '🎙️', title: 'Microphone bands', note: 'Energy below 40 Hz (infrasound) and above 15 kHz (near-ultrasound) — both mostly inaudible.' },
        { id: 'geo', glyph: '📍', title: 'Geolocation', note: 'GNSS / Wi-Fi positioning, including altitude and heading when available.' },
        { id: 'battery', glyph: '🔋', title: 'Battery', note: 'Charge state and rate — a crude power meter.' },
        { id: 'network', glyph: '🛰️', title: 'Network', note: 'Radio class, estimated bandwidth and round-trip time.' },
        { id: 'screen', glyph: '🖵', title: 'Display', note: 'Pixels, density, colour depth and refresh-driven frame rate.' },
        { id: 'device', glyph: '⚙️', title: 'Device profile', note: 'Cores, memory, pointer type and platform hints.' },
        { id: 'media', glyph: '🎛️', title: 'Media hardware', note: 'How many cameras, microphones and speakers are attached.' },
        { id: 'gamepad', glyph: '🎮', title: 'Gamepads', note: 'Controllers report their own axes and buttons.' },
    ];

    const cardRows = {};

    function buildCards() {
        const grid = $('liveGrid');
        const frag = document.createDocumentFragment();
        CARDS.forEach((card) => {
            const el = document.createElement('article');
            el.className = 'card';
            el.innerHTML =
                '<div class="card-head">' +
                '<span class="card-glyph" aria-hidden="true"></span>' +
                '<span class="card-title"></span>' +
                '<span class="card-status">idle</span>' +
                '</div>' +
                '<div class="card-rows"></div>' +
                '<p class="card-note"></p>';
            el.querySelector('.card-glyph').textContent = card.glyph;
            el.querySelector('.card-title').textContent = card.title;
            el.querySelector('.card-note').textContent = card.note;
            cardRows[card.id] = {
                rows: el.querySelector('.card-rows'),
                status: el.querySelector('.card-status'),
            };
            frag.appendChild(el);
        });
        grid.appendChild(frag);
    }

    function setStatus(id, text, kind) {
        const card = cardRows[id];
        if (!card) return;
        card.status.textContent = text;
        card.status.className = 'card-status' + (kind ? ' ' + kind : '');
    }

    function setRows(id, pairs) {
        const card = cardRows[id];
        if (!card) return;
        const frag = document.createDocumentFragment();
        pairs.forEach(([k, v]) => {
            const row = document.createElement('div');
            row.className = 'row';
            const ke = document.createElement('span');
            ke.className = 'k';
            ke.textContent = k;
            const ve = document.createElement('span');
            ve.className = 'v';
            ve.textContent = String(v);
            row.append(ke, ve);
            frag.appendChild(row);
        });
        card.rows.replaceChildren(frag);
    }

    /* --------------------------------------------------------- capabilities */

    function capabilities() {
        const g = window.navigator;
        return [
            ['Secure context (HTTPS)', isSecure],
            ['DeviceMotion (accel/gyro)', 'DeviceMotionEvent' in window],
            ['DeviceOrientation', 'DeviceOrientationEvent' in window],
            ['Absolute orientation', 'ondeviceorientationabsolute' in window],
            ['Generic Sensor: Accelerometer', 'Accelerometer' in window],
            ['Generic Sensor: Gyroscope', 'Gyroscope' in window],
            ['Generic Sensor: Magnetometer', 'Magnetometer' in window],
            ['Generic Sensor: Gravity', 'GravitySensor' in window],
            ['Generic Sensor: Linear accel.', 'LinearAccelerationSensor' in window],
            ['Ambient light sensor', 'AmbientLightSensor' in window],
            ['Proximity sensor', 'ProximitySensor' in window || 'ondeviceproximity' in window],
            ['Microphone / camera', !!(g.mediaDevices && g.mediaDevices.getUserMedia)],
            ['Web Audio API', 'AudioContext' in window || 'webkitAudioContext' in window],
            ['Geolocation', 'geolocation' in g],
            ['Battery status', 'getBattery' in g],
            ['Network information', 'connection' in g],
            ['Vibration / haptics', 'vibrate' in g],
            ['Web Bluetooth', 'bluetooth' in g],
            ['Web NFC (NDEF)', 'NDEFReader' in window],
            ['Web USB', 'usb' in g],
            ['Web Serial', 'serial' in g],
            ['Web HID', 'hid' in g],
            ['Gamepads', 'getGamepads' in g],
            ['WebXR (spatial tracking)', 'xr' in g],
            ['WebGPU', 'gpu' in g],
            ['Screen orientation', !!(window.screen && window.screen.orientation)],
            ['Screen wake lock', 'wakeLock' in g],
            ['Idle detection', 'IdleDetector' in window],
            ['Pressure observer', 'PressureObserver' in window],
            ['Permissions API', 'permissions' in g],
            ['Touch input', 'ontouchstart' in window || g.maxTouchPoints > 0],
            ['Media session', 'mediaSession' in g],
        ];
    }

    function buildCaps() {
        const grid = $('capGrid');
        const frag = document.createDocumentFragment();
        capabilities().forEach(([label, has]) => {
            const el = document.createElement('div');
            el.className = 'cap ' + (has ? 'yes' : 'no');
            const mark = document.createElement('span');
            mark.className = 'cap-mark';
            mark.textContent = has ? '✓' : '✕';
            const text = document.createElement('span');
            text.textContent = label;
            el.append(mark, text);
            frag.appendChild(el);
        });
        grid.replaceChildren(frag);
    }

    /* ------------------------------------------------- passive/static senses */

    function readStaticSenses() {
        const g = navigator;

        setRows('device', [
            ['CPU cores', g.hardwareConcurrency || 'unknown'],
            ['Memory (GB≈)', g.deviceMemory || 'hidden'],
            ['Touch points', g.maxTouchPoints || 0],
            ['Platform', (g.userAgentData && g.userAgentData.platform) || g.platform || 'unknown'],
            ['Languages', (g.languages || [g.language]).join(', ')],
            ['Time zone', Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'],
            ['Reduced motion', window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'yes' : 'no'],
        ]);
        setStatus('device', 'read', 'on');

        const s = window.screen || {};
        setRows('screen', [
            ['Viewport', window.innerWidth + '×' + window.innerHeight],
            ['Screen', (s.width || '?') + '×' + (s.height || '?')],
            ['Pixel ratio', fmt(window.devicePixelRatio, 2)],
            ['Colour depth', (s.colorDepth || '?') + ' bit'],
            ['Orientation', (s.orientation && s.orientation.type) || 'unknown'],
            ['Frame rate', '—'],
        ]);
        setStatus('screen', 'read', 'on');

        const c = g.connection;
        if (c) {
            const paint = () => {
                setRows('network', [
                    ['Type', c.type || c.effectiveType || 'unknown'],
                    ['Effective', c.effectiveType || 'unknown'],
                    ['Downlink', fmt(c.downlink, 1) + ' Mb/s'],
                    ['Round trip', fmt(c.rtt, 0) + ' ms'],
                    ['Data saver', c.saveData ? 'on' : 'off'],
                    ['Online', g.onLine ? 'yes' : 'no'],
                ]);
            };
            paint();
            c.addEventListener('change', paint);
            onStop(() => c.removeEventListener('change', paint));
            setStatus('network', 'live', 'on');
        } else {
            setRows('network', [['Online', g.onLine ? 'yes' : 'no']]);
            setStatus('network', 'partial');
        }

        if (g.getBattery) {
            g.getBattery().then((bat) => {
                const paint = () => setRows('battery', [
                    ['Level', Math.round(bat.level * 100) + '%'],
                    ['Charging', bat.charging ? 'yes' : 'no'],
                    ['Time to full', Number.isFinite(bat.chargingTime) && bat.chargingTime > 0 ? Math.round(bat.chargingTime / 60) + ' min' : '—'],
                    ['Time to empty', Number.isFinite(bat.dischargingTime) && bat.dischargingTime !== Infinity ? Math.round(bat.dischargingTime / 60) + ' min' : '—'],
                ]);
                paint();
                ['levelchange', 'chargingchange', 'chargingtimechange', 'dischargingtimechange']
                    .forEach((ev) => bat.addEventListener(ev, paint));
                setStatus('battery', 'live', 'on');
            }).catch(() => setStatus('battery', 'blocked', 'off'));
        } else {
            setStatus('battery', 'absent', 'off');
        }

        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            const paintDevices = () => navigator.mediaDevices.enumerateDevices().then((list) => {
                const count = (kind) => list.filter((d) => d.kind === kind).length;
                setRows('media', [
                    ['Cameras', count('videoinput')],
                    ['Microphones', count('audioinput')],
                    ['Speakers', count('audiooutput')],
                    ['Labels visible', list.some((d) => d.label) ? 'yes (granted)' : 'no (not granted)'],
                ]);
                setStatus('media', 'read', 'on');
            }).catch(() => setStatus('media', 'blocked', 'off'));
            paintDevices();
            navigator.mediaDevices.addEventListener('devicechange', paintDevices);
            onStop(() => navigator.mediaDevices.removeEventListener('devicechange', paintDevices));
        } else {
            setStatus('media', 'absent', 'off');
        }
    }

    /* -------------------------------------------------------------- gamepads */

    function pollGamepads() {
        if (!navigator.getGamepads) { setStatus('gamepad', 'absent', 'off'); return; }
        const pads = Array.from(navigator.getGamepads()).filter(Boolean);
        if (!pads.length) {
            setRows('gamepad', [['Connected', 0], ['Tip', 'press a button']]);
            setStatus('gamepad', 'idle');
            return;
        }
        const p = pads[0];
        setRows('gamepad', [
            ['Connected', pads.length],
            ['First', (p.id || 'pad').slice(0, 22)],
            ['Axes', p.axes.map((a) => fmt(a, 2)).join(' ')],
            ['Buttons down', p.buttons.filter((b) => b.pressed).length],
        ]);
        setStatus('gamepad', 'live', 'on');
    }

    /* --------------------------------------------------------- motion sensors */

    function startMotion() {
        if (!('DeviceMotionEvent' in window)) { setStatus('motion', 'absent', 'off'); setStatus('gyro', 'absent', 'off'); return; }

        let last = performance.now();
        let frames = 0;
        let hz = 0;

        const onMotion = (e) => {
            const acc = e.acceleration && e.acceleration.x !== null ? e.acceleration : e.accelerationIncludingGravity;
            if (acc) {
                state.motion.x = acc.x;
                state.motion.y = acc.y;
                state.motion.z = acc.z;
                const mag = Math.hypot(acc.x || 0, acc.y || 0, acc.z || 0);
                trackers.tremor.push(mag);
                state.motion.jitter = trackers.tremor.sd();
            }
            const rot = e.rotationRate;
            if (rot) {
                state.motion.gx = rot.alpha;
                state.motion.gy = rot.beta;
                state.motion.gz = rot.gamma;
            }
            frames += 1;
            const now = performance.now();
            if (now - last >= 1000) {
                hz = frames * 1000 / (now - last);
                frames = 0;
                last = now;
                state.motion.hz = hz;
            }
            state.motion.count += 1;
        };

        window.addEventListener('devicemotion', onMotion);
        onStop(() => window.removeEventListener('devicemotion', onMotion));
        setStatus('motion', 'live', 'on');
        setStatus('gyro', 'live', 'on');

        // If nothing ever arrives, say so rather than lying.
        const check = setTimeout(() => {
            if (!state.motion.count) {
                setStatus('motion', 'silent', 'off');
                setStatus('gyro', 'silent', 'off');
            }
        }, 2500);
        onStop(() => clearTimeout(check));
    }

    function startOrientation() {
        if (!('DeviceOrientationEvent' in window)) { setStatus('orient', 'absent', 'off'); return; }
        const onOrient = (e) => {
            state.orientation.alpha = e.alpha;
            state.orientation.beta = e.beta;
            state.orientation.gamma = e.gamma;
            state.orientation.absolute = !!e.absolute;
            if (typeof e.webkitCompassHeading === 'number') state.orientation.heading = e.webkitCompassHeading;
            else if (typeof e.alpha === 'number' && e.absolute) state.orientation.heading = (360 - e.alpha) % 360;
            if (Number.isFinite(e.beta) && Number.isFinite(e.gamma)) {
                trackers.tilt.push(Math.hypot(e.beta, e.gamma));
            }
            setStatus('orient', 'live', 'on');
        };
        const evt = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
        window.addEventListener(evt, onOrient);
        onStop(() => window.removeEventListener(evt, onOrient));
    }

    // Generic Sensor API wrapper — used for magnetometer, light and friends.
    function startGenericSensor(Ctor, options, onReading, cardId) {
        if (typeof Ctor !== 'function') { setStatus(cardId, 'absent', 'off'); return; }
        try {
            const sensor = new Ctor(options);
            sensor.addEventListener('reading', () => onReading(sensor));
            sensor.addEventListener('error', (e) => {
                const name = (e.error && e.error.name) || 'error';
                setStatus(cardId, name === 'NotAllowedError' ? 'denied' : 'error', 'off');
            });
            sensor.start();
            onStop(() => { try { sensor.stop(); } catch (_) { /* already stopped */ } });
            setStatus(cardId, 'live', 'on');
        } catch (_) {
            setStatus(cardId, 'blocked', 'off');
        }
    }

    function startMagnetometer() {
        startGenericSensor(window.Magnetometer, { frequency: 20 }, (s) => {
            state.magnet.x = s.x;
            state.magnet.y = s.y;
            state.magnet.z = s.z;
            const mag = Math.hypot(s.x || 0, s.y || 0, s.z || 0);
            state.magnet.magnitude = mag;
            trackers.field.push(mag);
        }, 'magnet');
    }

    function startLight() {
        startGenericSensor(window.AmbientLightSensor, { frequency: 10 }, (s) => {
            state.light.lux = s.illuminance;
            trackers.flicker.push(s.illuminance);
        }, 'light');
    }

    function startProximity() {
        if ('ondeviceproximity' in window) {
            const onProx = (e) => {
                state.proximity.cm = e.value;
                state.proximity.near = e.value < (e.min + 1);
                setStatus('prox', 'live', 'on');
            };
            window.addEventListener('deviceproximity', onProx);
            onStop(() => window.removeEventListener('deviceproximity', onProx));
        } else if ('onuserproximity' in window) {
            const onNear = (e) => { state.proximity.near = e.near; setStatus('prox', 'live', 'on'); };
            window.addEventListener('userproximity', onNear);
            onStop(() => window.removeEventListener('userproximity', onNear));
        } else {
            setStatus('prox', 'absent', 'off');
        }
    }

    /* ----------------------------------------------------------- geolocation */

    function startGeolocation() {
        if (!navigator.geolocation) { setStatus('geo', 'absent', 'off'); return; }
        setStatus('geo', 'asking');
        const id = navigator.geolocation.watchPosition(
            (pos) => {
                state.geo = pos.coords;
                setStatus('geo', 'live', 'on');
            },
            (err) => {
                setStatus('geo', err.code === err.PERMISSION_DENIED ? 'denied' : 'error', 'off');
            },
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
        );
        onStop(() => navigator.geolocation.clearWatch(id));
    }

    /* ------------------------------------------------------------- microphone */

    let audioCtx = null;
    let analyser = null;
    let freqData = null;
    let micStream = null;

    function startMicrophone() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setStatus('audio', 'absent', 'off');
            return Promise.resolve();
        }
        setStatus('audio', 'asking');
        return navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
            },
        }).then((stream) => {
            micStream = stream;
            const Ctx = window.AudioContext || window.webkitAudioContext;
            audioCtx = new Ctx();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const src = audioCtx.createMediaStreamSource(stream);
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 4096;
            analyser.smoothingTimeConstant = 0.6;
            src.connect(analyser);
            freqData = new Uint8Array(analyser.frequencyBinCount);
            setStatus('audio', 'live', 'on');
            onStop(() => {
                stream.getTracks().forEach((t) => t.stop());
                if (audioCtx) audioCtx.close();
                audioCtx = null;
                analyser = null;
                micStream = null;
            });
        }).catch(() => {
            setStatus('audio', 'denied', 'off');
        });
    }

    function bandEnergy(from, to, sampleRate, bins) {
        const nyquist = sampleRate / 2;
        const lo = clamp(Math.floor(from / nyquist * bins.length), 0, bins.length - 1);
        const hi = clamp(Math.ceil(to / nyquist * bins.length), 0, bins.length - 1);
        let sum = 0;
        let n = 0;
        for (let i = lo; i <= hi; i += 1) { sum += bins[i]; n += 1; }
        return n ? sum / n / 255 : 0;
    }

    function readAudio() {
        if (!analyser || !audioCtx) return;
        analyser.getByteFrequencyData(freqData);
        const rate = audioCtx.sampleRate;
        const nyquist = rate / 2;

        state.audio.infra = bandEnergy(1, 40, rate, freqData);
        state.audio.ultra = bandEnergy(15000, Math.min(nyquist - 1, 24000), rate, freqData);
        state.audio.level = bandEnergy(20, nyquist - 1, rate, freqData);

        let peakIdx = 0;
        for (let i = 1; i < freqData.length; i += 1) {
            if (freqData[i] > freqData[peakIdx]) peakIdx = i;
        }
        state.audio.peak = peakIdx / freqData.length * nyquist;

        trackers.infra.push(state.audio.infra);
        trackers.ultra.push(state.audio.ultra);
        drawScope();
    }

    function drawScope() {
        const canvas = $('scope');
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#05070d';
        ctx.fillRect(0, 0, w, h);
        if (!freqData) {
            ctx.fillStyle = '#626c82';
            ctx.font = '12px monospace';
            ctx.fillText('microphone asleep', 12, 22);
            return;
        }
        const bars = 128;
        const step = Math.floor(freqData.length / bars) || 1;
        const bw = w / bars;
        for (let i = 0; i < bars; i += 1) {
            let v = 0;
            for (let j = 0; j < step; j += 1) v = Math.max(v, freqData[i * step + j] || 0);
            const bh = (v / 255) * (h - 6);
            const t = i / bars;
            ctx.fillStyle = 'hsl(' + Math.round(190 + t * 90) + ', 85%, ' + Math.round(45 + (v / 255) * 25) + '%)';
            ctx.fillRect(i * bw, h - bh, Math.max(1, bw - 1), bh);
        }
    }

    /* ----------------------------------------------------------- camera probe */

    let camStream = null;
    let camActive = false;

    function toggleCamera() {
        if (camActive) { stopCamera(); return; }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            $('probeNote').textContent = 'This browser exposes no camera.';
            return;
        }
        navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 320 }, height: { ideal: 240 } },
        }).then((stream) => {
            camStream = stream;
            camActive = true;
            const video = $('cam');
            video.srcObject = stream;
            video.hidden = false;
            $('camCanvas').hidden = false;
            $('cameraBtn').classList.add('is-on');
            $('cameraBtn').textContent = '📷 Stop watching light';
            $('probeNote').textContent =
                'Watching brightness frame by frame: infrared remotes flash bright violet-white here, ' +
                'and lamps reveal their mains flicker as a rippling average.';
            return video.play();
        }).catch(() => {
            $('probeNote').textContent = 'Camera permission refused — nothing was captured.';
        });
    }

    function stopCamera() {
        if (camStream) camStream.getTracks().forEach((t) => t.stop());
        camStream = null;
        camActive = false;
        const video = $('cam');
        video.srcObject = null;
        video.hidden = true;
        $('camCanvas').hidden = true;
        $('cameraBtn').classList.remove('is-on');
        $('cameraBtn').textContent = '📷 Watch invisible light';
        state.camera.brightness = null;
        state.camera.flicker = null;
        state.camera.red = null;
    }
    onStop(stopCamera);

    function readCamera() {
        if (!camActive) return;
        const video = $('cam');
        if (!video.videoWidth) return;
        const canvas = $('camCanvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const w = 96;
        const h = Math.round(w * video.videoHeight / video.videoWidth) || 72;
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
        ctx.drawImage(video, 0, 0, w, h);
        let data;
        try {
            data = ctx.getImageData(0, 0, w, h).data;
        } catch (_) {
            return; // tainted canvas — should not happen with a local stream
        }
        let sum = 0;
        let red = 0;
        for (let i = 0; i < data.length; i += 4) {
            sum += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            red += data[i] - (data[i + 1] + data[i + 2]) / 2;
        }
        const px = data.length / 4;
        state.camera.brightness = sum / px;
        state.camera.red = red / px;
        trackers.flicker.push(state.camera.brightness);
        state.camera.flicker = trackers.flicker.sd();
    }

    /* -------------------------------------------------------- optional radios */

    function probeNfc() {
        if (!('NDEFReader' in window)) {
            $('probeNote').textContent = 'Web NFC is not available here (Chrome on Android only).';
            return;
        }
        try {
            const reader = new window.NDEFReader();
            reader.scan().then(() => {
                $('nfcBtn').classList.add('is-on');
                $('probeNote').textContent = 'NFC antenna listening — hold a tag or card against the back of the device.';
                reader.onreading = (e) => {
                    $('probeNote').textContent = 'NFC tag detected: ' + e.serialNumber + ' (' + e.message.records.length + ' record(s)).';
                };
                reader.onreadingerror = () => {
                    $('probeNote').textContent = 'A tag came close but could not be read.';
                };
            }).catch(() => {
                $('probeNote').textContent = 'NFC scan refused or unsupported on this device.';
            });
        } catch (_) {
            $('probeNote').textContent = 'NFC scan could not be started.';
        }
    }

    function probeBluetooth() {
        if (!navigator.bluetooth) {
            $('probeNote').textContent = 'Web Bluetooth is not available in this browser.';
            return;
        }
        navigator.bluetooth.requestDevice({ acceptAllDevices: true })
            .then((device) => {
                $('probeNote').textContent = 'Bluetooth radio reached: ' + (device.name || 'unnamed device') + '.';
            })
            .catch(() => {
                $('probeNote').textContent = 'No Bluetooth device chosen — the radio stays quiet.';
            });
    }

    function probeHaptics() {
        if (!navigator.vibrate) {
            $('probeNote').textContent = 'No vibration motor exposed to the browser.';
            return;
        }
        const ok = navigator.vibrate([30, 60, 30, 60, 120]);
        $('probeNote').textContent = ok
            ? 'Haptic pattern sent — a Morse-like pulse through the vibration motor.'
            : 'The browser accepted no vibration (often blocked without interaction).';
    }

    /* ---------------------------------------------------------- anomaly logic */

    function relative(value, base) {
        if (!Number.isFinite(value)) return 0;
        if (!Number.isFinite(base) || base <= 0) return value > 0 ? 1 : 0;
        return value / base;
    }

    function updateAnomaly() {
        const b = state.baseline;
        const a = state.anomaly;

        a.tremor = b ? clamp(relative(trackers.tremor.sd(), b.tremor) - 1, 0, 6) / 6 : 0;
        a.tilt = b ? clamp(relative(trackers.tilt.sd(), b.tilt) - 1, 0, 6) / 6 : 0;

        if (Number.isFinite(state.magnet.magnitude) && b && Number.isFinite(b.field)) {
            a.field = clamp(Math.abs(state.magnet.magnitude - b.field) / 15, 0, 1);
        } else {
            a.field = 0;
        }

        if (b && Number.isFinite(state.audio.infra)) {
            a.infra = clamp((state.audio.infra - b.infra) / 0.25, 0, 1);
            a.ultra = clamp((state.audio.ultra - b.ultra) / 0.2, 0, 1);
        } else {
            a.infra = 0;
            a.ultra = 0;
        }

        if (b && Number.isFinite(b.flicker)) {
            a.flicker = clamp(relative(trackers.flicker.sd(), b.flicker) - 1, 0, 6) / 6;
        } else {
            a.flicker = 0;
        }

        const pairs = [
            ['aTremor', a.tremor, fmt(trackers.tremor.sd() * 1000, 1) + ' mm/s²'],
            ['aField', a.field, Number.isFinite(state.magnet.magnitude) ? fmt(state.magnet.magnitude, 1) + ' µT' : 'no sensor'],
            ['aInfra', a.infra, Number.isFinite(state.audio.infra) ? fmt(state.audio.infra * 100, 0) + '%' : 'no mic'],
            ['aUltra', a.ultra, Number.isFinite(state.audio.ultra) ? fmt(state.audio.ultra * 100, 0) + '%' : 'no mic'],
            ['aFlicker', a.flicker, Number.isFinite(state.camera.flicker) || Number.isFinite(state.light.lux) ? fmt(trackers.flicker.sd(), 2) : 'no light probe'],
            ['aTilt', a.tilt, fmt(trackers.tilt.sd() * 1000, 0) + ' m°'],
        ];
        pairs.forEach(([id, score, text]) => {
            const el = $(id);
            if (!el) return;
            el.textContent = text;
            el.parentElement.classList.toggle('hot', score > 0.5);
        });

        const total = Math.max(a.tremor, a.field, a.infra, a.ultra, a.flicker, a.tilt);
        $('meterFill').style.width = Math.round(total * 100) + '%';

        const pill = $('anomalyState');
        const label = $('anomalyStateText');
        if (!state.running) {
            pill.className = 'pill pill-idle';
            label.textContent = 'Dormant';
        } else if (!state.baseline) {
            pill.className = 'pill pill-live';
            label.textContent = 'Awake — calibrate me';
        } else if (total > 0.5) {
            pill.className = 'pill pill-alert';
            label.textContent = 'Something moved';
        } else {
            pill.className = 'pill pill-live';
            label.textContent = 'Quiet';
        }
    }

    function calibrate() {
        state.baseline = {
            tremor: Math.max(trackers.tremor.sd(), 1e-4),
            tilt: Math.max(trackers.tilt.sd(), 1e-4),
            field: state.magnet.magnitude,
            infra: state.audio.infra || 0,
            ultra: state.audio.ultra || 0,
            flicker: Math.max(trackers.flicker.sd(), 1e-3),
            at: new Date(),
        };
        $('anomalyNote').textContent =
            'Baseline captured at ' + state.baseline.at.toLocaleTimeString() +
            '. Deviations from this "quiet" world are what light the meter up.';
    }

    /* ----------------------------------------------------------- render loop */

    let rafId = null;
    let lastPaint = 0;
    let frameCount = 0;
    let fpsWindow = performance.now();
    let fps = 0;

    function paint() {
        const m = state.motion;
        setRows('motion', [
            ['x', fmt(m.x, 3)],
            ['y', fmt(m.y, 3)],
            ['z', fmt(m.z, 3)],
            ['noise σ', fmt(trackers.tremor.sd(), 4)],
            ['sample rate', fmt(m.hz, 0) + ' Hz'],
        ]);

        setRows('gyro', [
            ['α rate', fmt(m.gx, 2)],
            ['β rate', fmt(m.gy, 2)],
            ['γ rate', fmt(m.gz, 2)],
        ]);

        const o = state.orientation;
        setRows('orient', [
            ['alpha', fmt(o.alpha, 1) + '°'],
            ['beta (pitch)', fmt(o.beta, 1) + '°'],
            ['gamma (roll)', fmt(o.gamma, 1) + '°'],
            ['heading', o.heading === null ? '—' : fmt(o.heading, 1) + '°'],
            ['absolute', o.absolute ? 'yes' : 'no'],
        ]);

        setRows('magnet', [
            ['x', fmt(state.magnet.x, 1) + ' µT'],
            ['y', fmt(state.magnet.y, 1) + ' µT'],
            ['z', fmt(state.magnet.z, 1) + ' µT'],
            ['strength', fmt(state.magnet.magnitude, 1) + ' µT'],
        ]);

        setRows('light', [
            ['illuminance', state.light.lux === null ? '—' : fmt(state.light.lux, 1) + ' lx'],
            ['camera brightness', state.camera.brightness === null ? '—' : fmt(state.camera.brightness, 1) + '/255'],
            ['infrared hint', state.camera.red === null ? '—' : fmt(state.camera.red, 1)],
        ]);

        setRows('prox', [
            ['distance', state.proximity.cm === null ? '—' : fmt(state.proximity.cm, 1) + ' cm'],
            ['near', state.proximity.near === null ? '—' : (state.proximity.near ? 'yes' : 'no')],
        ]);

        setRows('audio', [
            ['infrasound <40 Hz', state.audio.infra === null ? '—' : fmt(state.audio.infra * 100, 0) + '%'],
            ['ultrasound >15 kHz', state.audio.ultra === null ? '—' : fmt(state.audio.ultra * 100, 0) + '%'],
            ['overall level', state.audio.level === null ? '—' : fmt(state.audio.level * 100, 0) + '%'],
            ['peak', state.audio.peak === null ? '—' : fmt(state.audio.peak / 1000, 2) + ' kHz'],
            ['sample rate', audioCtx ? fmt(audioCtx.sampleRate / 1000, 1) + ' kHz' : '—'],
        ]);

        const g = state.geo;
        setRows('geo', g ? [
            ['latitude', fmt(g.latitude, 5)],
            ['longitude', fmt(g.longitude, 5)],
            ['accuracy', fmt(g.accuracy, 1) + ' m'],
            ['altitude', g.altitude === null ? '—' : fmt(g.altitude, 1) + ' m'],
            ['speed', g.speed === null ? '—' : fmt(g.speed, 2) + ' m/s'],
            ['heading', g.heading === null ? '—' : fmt(g.heading, 1) + '°'],
        ] : [['status', 'no fix yet']]);

        const s = window.screen || {};
        setRows('screen', [
            ['Viewport', window.innerWidth + '×' + window.innerHeight],
            ['Screen', (s.width || '?') + '×' + (s.height || '?')],
            ['Pixel ratio', fmt(window.devicePixelRatio, 2)],
            ['Colour depth', (s.colorDepth || '?') + ' bit'],
            ['Orientation', (s.orientation && s.orientation.type) || 'unknown'],
            ['Frame rate', fmt(fps, 0) + ' fps'],
        ]);

        pollGamepads();
        updateAnomaly();
    }

    function loop(now) {
        rafId = requestAnimationFrame(loop);

        frameCount += 1;
        if (now - fpsWindow >= 1000) {
            fps = frameCount * 1000 / (now - fpsWindow);
            frameCount = 0;
            fpsWindow = now;
        }

        readAudio();
        readCamera();

        if (now - lastPaint >= 200) {
            lastPaint = now;
            paint();
        }
    }

    /* ---------------------------------------------------------- orchestration */

    function requestMotionPermission() {
        const needs = [];
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            needs.push(DeviceMotionEvent.requestPermission());
        }
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            needs.push(DeviceOrientationEvent.requestPermission());
        }
        if (!needs.length) return Promise.resolve();
        return Promise.all(needs).catch(() => undefined);
    }

    function awaken() {
        if (state.running) return;
        state.running = true;
        $('awakenBtn').disabled = true;
        $('calibrateBtn').disabled = false;
        $('stopBtn').disabled = false;

        if (!isSecure) {
            $('hint').textContent =
                'This page is not in a secure context, so most sensors will stay silent. Open it over HTTPS.';
        }

        readStaticSenses();
        requestMotionPermission().then(() => {
            startMotion();
            startOrientation();
            startMagnetometer();
            startLight();
            startProximity();
            startGeolocation();
            return startMicrophone();
        }).then(() => {
            // Settle for a moment, then take an automatic first baseline.
            const t = setTimeout(() => { if (state.running) calibrate(); }, 3000);
            onStop(() => clearTimeout(t));
        });

        if (!rafId) rafId = requestAnimationFrame(loop);
    }

    function rest() {
        state.running = false;
        state.baseline = null;
        while (cleanups.length) {
            const fn = cleanups.pop();
            try { fn(); } catch (_) { /* ignore teardown noise */ }
        }
        onStop(stopCamera);
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        $('awakenBtn').disabled = false;
        $('calibrateBtn').disabled = true;
        $('stopBtn').disabled = true;
        $('anomalyNote').textContent = 'Senses at rest. Nothing is being read.';
        CARDS.forEach((c) => setStatus(c.id, 'idle'));
        updateAnomaly();
        drawScope();
    }

    /* ------------------------------------------------------------------ boot */

    function init() {
        buildCards();
        buildCaps();
        drawScope();
        updateAnomaly();

        $('awakenBtn').addEventListener('click', awaken);
        $('calibrateBtn').addEventListener('click', calibrate);
        $('stopBtn').addEventListener('click', rest);
        $('cameraBtn').addEventListener('click', toggleCamera);
        $('nfcBtn').addEventListener('click', probeNfc);
        $('btBtn').addEventListener('click', probeBluetooth);
        $('buzzBtn').addEventListener('click', probeHaptics);

        window.addEventListener('pagehide', () => { if (state.running) rest(); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
