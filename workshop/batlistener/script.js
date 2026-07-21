/* ==========================================================================
   Echo — bat sound listener
   Listens to the top of the audible band for high-frequency bat-like calls,
   draws a live spectrogram, and captures / replays the clips it hears.
   Everything runs locally; no audio leaves the device.
   ========================================================================== */
(function () {
    'use strict';

    const $ = (s) => document.querySelector(s);

    /* ---- Elements ---- */
    const canvas = $('#spectro');
    const ctx = canvas.getContext('2d', { alpha: false });
    const listenBtn = $('#listenBtn');
    const listenLabel = listenBtn.querySelector('.btn-label');
    const statusPill = $('#statusPill');
    const statusText = $('#statusText');
    const freqReadout = $('#freqReadout');
    const peakFreqEl = $('#peakFreq');
    const detectFlash = $('#detectFlash');

    const autoPlay = $('#autoPlay');
    const silentMode = $('#silentMode');
    const minFreq = $('#minFreq');
    const minFreqVal = $('#minFreqVal');
    const sensitivity = $('#sensitivity');
    const sensitivityVal = $('#sensitivityVal');

    const captureList = $('#captureList');
    const captureCount = $('#captureCount');
    const capturesEmpty = $('#capturesEmpty');
    const clearBtn = $('#clearBtn');

    /* ---- Audio state ---- */
    let stream = null;
    let audioCtx = null;
    let analyser = null;
    let sourceNode = null;
    let freqData = null;
    let rafId = null;
    let listening = false;

    let recorder = null;
    let capturing = false;
    let cooldownUntil = 0;
    const CLIP_MS = 1300;
    const COOLDOWN_MS = 900;

    let captures = [];
    let captureId = 0;
    let currentAudio = null;

    /* ---- Canvas sizing ---- */
    let cw = 0, ch = 0;
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        cw = Math.max(1, Math.round(rect.width));
        ch = Math.max(1, Math.round(rect.height));
        canvas.width = cw;
        canvas.height = ch;
        ctx.fillStyle = '#04060a';
        ctx.fillRect(0, 0, cw, ch);
    }
    window.addEventListener('resize', resizeCanvas);

    /* ---- Colour map (magnitude 0..255 -> teal→violet→hot) ---- */
    function colorFor(v) {
        // v: 0..255
        const t = v / 255;
        let r, g, b;
        if (t < 0.5) {
            const k = t / 0.5;               // teal -> violet
            r = Math.round(20 + k * 147);
            g = Math.round(60 + k * 79 - 60 * k);
            b = Math.round(90 + k * 160);
        } else {
            const k = (t - 0.5) / 0.5;       // violet -> hot pink
            r = Math.round(167 + k * 84);
            g = Math.round(139 - k * 26);
            b = Math.round(250 - k * 117);
        }
        return `rgb(${r},${g},${b})`;
    }

    /* ---- Settings helpers ---- */
    function minFreqHz() { return parseFloat(minFreq.value) * 1000; }
    function nyquist() { return audioCtx ? audioCtx.sampleRate / 2 : 22050; }
    function binForHz(hz) {
        if (!analyser) return 0;
        return Math.min(analyser.frequencyBinCount - 1,
            Math.round(hz / nyquist() * analyser.frequencyBinCount));
    }
    // threshold magnitude: sensitivity 1..10 -> 210..70
    function threshold() { return 220 - parseInt(sensitivity.value, 10) * 15; }

    const SENS_WORDS = ['Deaf', 'Very low', 'Low', 'Low', 'Medium', 'Medium', 'Alert', 'High', 'Very high', 'Twitchy'];
    function updateReadouts() {
        minFreqVal.textContent = `${parseFloat(minFreq.value)} kHz`;
        sensitivityVal.textContent = SENS_WORDS[parseInt(sensitivity.value, 10) - 1] || 'Medium';
    }
    minFreq.addEventListener('input', updateReadouts);
    sensitivity.addEventListener('input', updateReadouts);

    /* ---- Status ---- */
    function setStatus(state, text) {
        statusPill.className = 'pill pill-' + state;
        statusText.textContent = text;
    }

    /* ---- Start / stop ---- */
    listenBtn.addEventListener('click', () => {
        if (listening) stopListening();
        else startListening();
    });

    async function startListening() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    channelCount: 1,
                },
            });
        } catch (err) {
            setStatus('error', 'Microphone blocked');
            alert('Echo needs microphone access to listen.\n\n' + (err && err.message ? err.message : err));
            return;
        }

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') await audioCtx.resume();

        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.4;
        analyser.minDecibels = -95;
        analyser.maxDecibels = -20;
        freqData = new Uint8Array(analyser.frequencyBinCount);

        sourceNode = audioCtx.createMediaStreamSource(stream);
        sourceNode.connect(analyser);

        listening = true;
        listenBtn.classList.add('listening');
        listenLabel.textContent = 'Stop listening';
        listenBtn.querySelector('.btn-icon').textContent = '⏹️';
        freqReadout.hidden = false;
        setStatus('live', 'Listening');
        resizeCanvas();
        loop();
    }

    function stopListening() {
        listening = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        if (recorder && recorder.state !== 'inactive') {
            try { recorder.stop(); } catch { /* ignore */ }
        }
        capturing = false;
        if (sourceNode) { try { sourceNode.disconnect(); } catch { } }
        if (stream) stream.getTracks().forEach(t => t.stop());
        if (audioCtx) audioCtx.close();
        stream = audioCtx = analyser = sourceNode = null;

        listenBtn.classList.remove('listening');
        listenLabel.textContent = 'Start listening';
        listenBtn.querySelector('.btn-icon').textContent = '🎙️';
        freqReadout.hidden = true;
        setStatus('idle', 'Idle');
    }

    /* ---- Main render + detect loop ---- */
    function loop() {
        rafId = requestAnimationFrame(loop);
        if (!analyser) return;
        analyser.getByteFrequencyData(freqData);

        const startBin = binForHz(minFreqHz());
        const bins = analyser.frequencyBinCount;

        // scroll spectrogram left by 2px, draw newest column on the right
        const step = 2;
        ctx.drawImage(canvas, step, 0, cw - step, ch, 0, 0, cw - step, ch);
        const x = cw - step;

        // draw full spectrum column (log-ish height mapping, high freq at top)
        let peakVal = 0, peakBin = startBin;
        let bandEnergy = 0, bandMax = 0, bandCount = 0;
        for (let y = 0; y < ch; y++) {
            // map y (0=top) to frequency bin (top = nyquist)
            const frac = 1 - y / ch;
            const bin = Math.min(bins - 1, Math.floor(frac * bins));
            const v = freqData[bin];
            ctx.fillStyle = v < 8 ? '#04060a' : colorFor(v);
            ctx.fillRect(x, y, step, 1);
        }

        // analyse the listen band for detection + peak
        for (let b = startBin; b < bins; b++) {
            const v = freqData[b];
            bandEnergy += v;
            bandCount++;
            if (v > bandMax) bandMax = v;
            if (v > peakVal) { peakVal = v; peakBin = b; }
        }

        // draw the listen-threshold line
        const lineY = ch - (startBin / bins) * ch;
        ctx.fillStyle = 'rgba(233,237,246,0.10)';
        ctx.fillRect(0, lineY, cw, 1);

        // peak frequency readout
        if (bandMax > 12) {
            const hz = peakBin / bins * nyquist();
            peakFreqEl.textContent = (hz / 1000).toFixed(1);
        } else {
            peakFreqEl.textContent = '—';
        }

        // detection: strong, concentrated high-frequency burst
        const avg = bandCount ? bandEnergy / bandCount : 0;
        const now = performance.now();
        const detected = bandMax >= threshold() && (bandMax - avg) > 22;
        if (detected && now > cooldownUntil) {
            cooldownUntil = now + COOLDOWN_MS;
            onDetection(peakBin / bins * nyquist());
        }
    }

    /* ---- Detection handler ---- */
    function onDetection(peakHz) {
        detectFlash.classList.remove('on');
        void detectFlash.offsetWidth;
        detectFlash.classList.add('on');

        if (silentMode.checked) return;   // view-only: no capture, no playback
        if (capturing || !stream) return;
        captureClip(peakHz);
    }

    /* ---- Record a short clip on the live stream ---- */
    function captureClip(peakHz) {
        let mime = '';
        for (const m of ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']) {
            if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) { mime = m; break; }
        }
        try {
            recorder = mime ? new MediaRecorder(stream, { mimeType: mime })
                : new MediaRecorder(stream);
        } catch {
            return;
        }
        capturing = true;
        const chunks = [];
        recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
        recorder.onstop = () => {
            capturing = false;
            if (!chunks.length) return;
            const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
            addCapture(blob, peakHz);
        };
        recorder.start();
        setTimeout(() => {
            if (recorder && recorder.state !== 'inactive') {
                try { recorder.stop(); } catch { capturing = false; }
            }
        }, CLIP_MS);
    }

    /* ---- Add a capture to the list ---- */
    async function addCapture(blob, peakHz) {
        const id = ++captureId;
        const url = URL.createObjectURL(blob);
        const time = new Date();
        const item = { id, url, blob, peakHz, time };
        captures.unshift(item);
        renderCaptures();
        drawClipWaveform(item);

        if (autoPlay.checked && !silentMode.checked) playCapture(id);
    }

    /* ---- Draw a static waveform for a saved clip (silent view) ---- */
    async function drawClipWaveform(item) {
        const cv = document.querySelector(`canvas[data-wave="${item.id}"]`);
        if (!cv) return;
        const c = cv.getContext('2d');
        const w = cv.width, h = cv.height;
        c.clearRect(0, 0, w, h);
        try {
            const buf = await item.blob.arrayBuffer();
            const tmpCtx = new (window.AudioContext || window.webkitAudioContext)();
            const audio = await tmpCtx.decodeAudioData(buf);
            tmpCtx.close();
            const data = audio.getChannelData(0);
            const mid = h / 2;
            const bucket = Math.max(1, Math.floor(data.length / w));
            const grad = c.createLinearGradient(0, 0, w, 0);
            grad.addColorStop(0, '#2dd4bf');
            grad.addColorStop(1, '#a78bfa');
            c.fillStyle = grad;
            for (let x = 0; x < w; x++) {
                let peak = 0;
                for (let i = 0; i < bucket; i++) {
                    const s = Math.abs(data[x * bucket + i] || 0);
                    if (s > peak) peak = s;
                }
                const barH = Math.max(1, peak * (h * 0.9));
                c.fillRect(x, mid - barH / 2, 1, barH);
            }
        } catch {
            c.fillStyle = '#626c82';
            c.font = '11px monospace';
            c.fillText('waveform unavailable', 8, h / 2);
        }
    }

    /* ---- Render capture list ---- */
    function renderCaptures() {
        captureCount.textContent = captures.length;
        capturesEmpty.style.display = captures.length ? 'none' : 'block';
        clearBtn.hidden = captures.length === 0;

        captureList.innerHTML = '';
        captures.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'capture';
            const khz = item.peakHz ? (item.peakHz / 1000).toFixed(1) : '—';
            const t = item.time.toLocaleTimeString();
            li.innerHTML = `
                <canvas class="capture-wave" data-wave="${item.id}" width="360" height="46"></canvas>
                <div class="capture-meta">
                    <span class="cf">${khz} kHz</span>
                    <span class="ct">${t}</span>
                </div>
                <div class="capture-actions">
                    <button class="ibtn" data-act="play" data-id="${item.id}" title="Play aloud" aria-label="Play call aloud">▶</button>
                    <button class="ibtn" data-act="download" data-id="${item.id}" title="Download" aria-label="Download call">⭳</button>
                    <button class="ibtn danger" data-act="delete" data-id="${item.id}" title="Delete" aria-label="Delete call">✕</button>
                </div>`;
            captureList.appendChild(li);
        });
    }

    captureList.addEventListener('click', (e) => {
        const btn = e.target.closest('.ibtn');
        if (!btn) return;
        const id = parseInt(btn.dataset.id, 10);
        const act = btn.dataset.act;
        if (act === 'play') playCapture(id, btn);
        else if (act === 'download') downloadCapture(id);
        else if (act === 'delete') deleteCapture(id);
    });

    function playCapture(id, btn) {
        const item = captures.find(c => c.id === id);
        if (!item) return;
        if (currentAudio) { currentAudio.pause(); currentAudio = null; }
        document.querySelectorAll('.ibtn.playing').forEach(b => {
            b.classList.remove('playing'); b.textContent = '▶';
        });
        const audio = new Audio(item.url);
        currentAudio = audio;
        const control = btn || document.querySelector(`.ibtn[data-act="play"][data-id="${id}"]`);
        if (control) { control.classList.add('playing'); control.textContent = '❚❚'; }
        const reset = () => {
            if (control) { control.classList.remove('playing'); control.textContent = '▶'; }
            if (currentAudio === audio) currentAudio = null;
        };
        audio.onended = reset;
        audio.onpause = reset;
        audio.play().catch(reset);
    }

    function downloadCapture(id) {
        const item = captures.find(c => c.id === id);
        if (!item) return;
        const ext = (item.blob.type.includes('ogg')) ? 'ogg' : (item.blob.type.includes('mp4') ? 'm4a' : 'webm');
        const a = document.createElement('a');
        a.href = item.url;
        a.download = `bat-call-${item.time.toISOString().replace(/[:.]/g, '-')}.${ext}`;
        a.click();
    }

    function deleteCapture(id) {
        const idx = captures.findIndex(c => c.id === id);
        if (idx === -1) return;
        URL.revokeObjectURL(captures[idx].url);
        captures.splice(idx, 1);
        renderCaptures();
        captures.forEach(drawClipWaveform);
    }

    clearBtn.addEventListener('click', () => {
        if (!captures.length) return;
        if (!confirm('Delete all captured calls?')) return;
        captures.forEach(c => URL.revokeObjectURL(c.url));
        captures = [];
        renderCaptures();
    });

    /* ---- Init ---- */
    updateReadouts();
    resizeCanvas();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus('error', 'No mic support');
        listenBtn.disabled = true;
        listenLabel.textContent = 'Microphone unsupported';
    }
    window.addEventListener('beforeunload', () => { if (listening) stopListening(); });
})();
