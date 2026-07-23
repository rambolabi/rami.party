// machine.js — Web Serial machine-control panel UI (mounts into the sidebar).
// Ties the GrblController to buttons, a DRO, a jog pad, framing, job streaming,
// overrides, an always-visible E-STOP, a safety gate, and a disconnect/idle watchdog.

import { GrblController, RT } from './serial.js';
import { toGcode, DEFAULT_GCODE, machineMap, artboardBBox } from './exporters.js';

const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

export function mountMachinePanel(mount, { store }) {
    let armed = false;              // safety acknowledgement
    let running = false;
    const ctrl = new GrblController({
        onLine: (l) => log(l),
        onState: (s) => renderState(s),
        onProgress: (a, b) => { prog.max = b; prog.value = a; progLbl.textContent = `${a}/${b} lines`; if (a >= b) setRunning(false); },
        onDisconnect: () => { setConnected(false); setRunning(false); },
    });

    // ---- UI ----------------------------------------------------------------
    if (!GrblController.supported) {
        mount.appendChild(el('p', 'muted tiny',
            '⚠ Web Serial isn’t available in this browser. Use desktop <strong>Chrome</strong> or <strong>Edge</strong> over HTTPS (or localhost) to control a laser directly. You can still design &amp; export files.'));
        return { controller: ctrl };
    }

    const bar = el('div', 'mc-row');
    const connectBtn = el('button', 'btn btn-primary', '🔌 Connect');
    const statePill = el('span', 'mc-pill', 'Offline');
    bar.append(connectBtn, statePill);

    const dro = el('div', 'mc-dro muted tiny', 'X —  Y —  ·  F 0');

    // safety gate
    const gate = el('label', 'check mc-gate');
    const gateCb = el('input'); gateCb.type = 'checkbox';
    gate.append(gateCb, document.createTextNode(' I understand — eyewear on, fumes extracted, fire ready, never unattended.'));

    // jog pad
    const jog = el('div', 'mc-jog');
    const mk = (t, dx, dy) => { const b = el('button', 'btn', t); b.addEventListener('click', () => doJog(dx, dy)); return b; };
    const stepSel = el('select', 'mc-step');
    stepSel.innerHTML = ['0.1', '1', '5', '10', '50'].map((s) => `<option ${s === '1' ? 'selected' : ''}>${s}</option>`).join('');
    jog.append(
        el('span'), mk('▲', 0, 1), el('span', null, `<select class="mc-step-mount"></select>`),
        mk('◀', -1, 0), mk('⌂', 'home', 'home'), mk('▶', 1, 0),
        el('span'), mk('▼', 0, -1), el('span'),
    );
    // replace the middle select placeholder with the real one
    jog.querySelector('.mc-step-mount').replaceWith(stepSel);

    const motionRow = el('div', 'mc-row');
    const homeBtn = el('button', 'btn', '⌂ Home');
    const unlockBtn = el('button', 'btn', '🔓 Unlock');
    const setOrgBtn = el('button', 'btn', '⦿ Set origin');
    const gotoOrgBtn = el('button', 'btn', '↖ Go 0,0');
    motionRow.append(homeBtn, unlockBtn, setOrgBtn, gotoOrgBtn);

    const jobRow = el('div', 'mc-row');
    const modeSel = el('select', 'mc-step');
    modeSel.innerHTML = '<option value="vector">Vector job</option><option value="raster">Raster job</option>';
    const frameBtn = el('button', 'btn', '⧉ Frame');
    const runBtn = el('button', 'btn btn-primary', '▶ Run');
    const pauseBtn = el('button', 'btn', '⏸ Pause');
    const resumeBtn = el('button', 'btn', '⏵ Resume');
    const stopBtn = el('button', 'btn', '⏹ Stop');
    jobRow.append(modeSel, frameBtn, runBtn, pauseBtn, resumeBtn, stopBtn);

    const prog = el('progress', 'mc-prog'); prog.max = 1; prog.value = 0;
    const progLbl = el('span', 'muted tiny', '');

    // overrides
    const ovRow = el('div', 'mc-row');
    const ov = (t, byte) => { const b = el('button', 'btn tiny', t); b.addEventListener('click', () => ctrl.realtime(byte)); return b; };
    ovRow.append(
        el('span', 'muted tiny', 'Feed'), ov('−', RT.FEED_DN10), ov('+', RT.FEED_UP10),
        el('span', 'muted tiny', 'Power'), ov('−', RT.POW_DN10), ov('+', RT.POW_UP10),
    );

    const estop = el('button', 'btn mc-estop', '■ E-STOP');

    // console
    const con = el('div', 'mc-con');
    const conIn = el('input', 'mc-conin'); conIn.placeholder = 'G-code / $ command… (Enter)';
    conIn.addEventListener('keydown', (e) => { if (e.key === 'Enter' && conIn.value.trim()) { ctrl.command(conIn.value.trim()); conIn.value = ''; } });

    mount.append(bar, dro, gate, jog, motionRow, jobRow, prog, progLbl, ovRow, estop,
        el('p', 'muted tiny', 'Console'), con, conIn);

    const motionButtons = [...jog.querySelectorAll('button'), homeBtn, unlockBtn, setOrgBtn, gotoOrgBtn, frameBtn, runBtn, pauseBtn, resumeBtn];

    // ---- helpers -----------------------------------------------------------
    function log(line) {
        const p = el('div', null, escapeHtml(String(line)));
        con.appendChild(p); con.scrollTop = con.scrollHeight;
        while (con.childElementCount > 250) con.removeChild(con.firstChild);
    }
    function renderState(s) {
        statePill.textContent = s.state;
        statePill.dataset.state = s.state;
        const pos = s.wpos || s.mpos;
        if (pos) dro.textContent = `X ${pos.x.toFixed(1)}  Y ${pos.y.toFixed(1)}  ·  F ${s.feed ?? 0}`;
        if (/Alarm/i.test(s.state)) { setRunning(false); }
    }
    function setConnected(on) {
        connectBtn.textContent = on ? '⏏ Disconnect' : '🔌 Connect';
        connectBtn.classList.toggle('btn-primary', !on);
        statePill.textContent = on ? (ctrl.status.state || 'Idle') : 'Offline';
        updateEnabled();
    }
    function setRunning(on) {
        running = on;
        estop.classList.toggle('active', on);
        updateEnabled();
    }
    function updateEnabled() {
        const canMove = ctrl.connected && armed && !running;
        motionButtons.forEach((b) => { b.disabled = !canMove; });
        pauseBtn.disabled = !(ctrl.connected && running);
        resumeBtn.disabled = !(ctrl.connected && running);
        stopBtn.disabled = !ctrl.connected;
        estop.disabled = !ctrl.connected;
        conIn.disabled = !ctrl.connected;
    }

    gateCb.addEventListener('change', () => { armed = gateCb.checked; updateEnabled(); });

    connectBtn.addEventListener('click', async () => {
        if (ctrl.connected) { await ctrl.disconnect(); setConnected(false); return; }
        try { await ctrl.connect(); setConnected(true); log('Connected. Waking GRBL…'); }
        catch (e) { alert('Connect failed: ' + e.message); }
    });

    function doJog(dx, dy) {
        if (dx === 'home') return ctrl.home();
        const step = parseFloat(stepSel.value) || 1;
        ctrl.jog(dx * step, dy * step, 1500);
    }
    homeBtn.addEventListener('click', () => ctrl.home());
    unlockBtn.addEventListener('click', () => ctrl.unlock());
    setOrgBtn.addEventListener('click', () => ctrl.setOrigin());
    gotoOrgBtn.addEventListener('click', () => ctrl.gotoOrigin());

    frameBtn.addEventListener('click', async () => {
        const bb = artboardBBox(store);
        if (!bb) { alert('Nothing to frame — add objects first.'); return; }
        const mp = machineMap(store);
        const corners = [
            mp(bb.minX, bb.minY), mp(bb.maxX, bb.minY),
            mp(bb.maxX, bb.maxY), mp(bb.minX, bb.maxY),
        ];
        log('Framing bounding box (laser off)…');
        await ctrl.command('M5');
        await ctrl.command('G90');
        await ctrl.command(`G0 X${corners[0].x.toFixed(2)} Y${corners[0].y.toFixed(2)}`);
        for (const c of [...corners.slice(1), corners[0]]) await ctrl.command(`G0 X${c.x.toFixed(2)} Y${c.y.toFixed(2)}`);
    });

    runBtn.addEventListener('click', () => {
        if (!confirm('Start the job on the laser now? Stay at the machine and keep the E-STOP within reach.')) return;
        const opts = readGcodeOpts();
        opts.mode = modeSel.value;
        Promise.resolve(toGcode(store, opts)).then((g) => {
            setRunning(true);
            prog.value = 0;
            log(`Streaming ${modeSel.value} job…`);
            ctrl.runJob(g);
        });
    });
    pauseBtn.addEventListener('click', () => { ctrl.pauseJob(); log('⏸ Paused (feed-hold).'); });
    resumeBtn.addEventListener('click', () => { ctrl.resumeJob(); log('⏵ Resumed.'); });
    stopBtn.addEventListener('click', () => { ctrl.stopJob(); setRunning(false); log('⏹ Stopped + reset.'); });
    estop.addEventListener('click', () => {
        ctrl.stopJob();
        ctrl.realtime(RT.RESET);
        ctrl.command('M5');
        setRunning(false);
        log('■ E-STOP — reset issued, laser off.');
    });

    // watchdog: if the tab is hidden or focus lost mid-job, feed-hold immediately
    const holdIfRunning = () => { if (ctrl.connected && running) { ctrl.pauseJob(); log('⚠ Tab hidden — auto feed-hold. Press Resume when back.'); } };
    document.addEventListener('visibilitychange', () => { if (document.hidden) holdIfRunning(); });
    window.addEventListener('blur', holdIfRunning);
    window.addEventListener('beforeunload', (e) => { if (ctrl.connected && running) { e.preventDefault(); e.returnValue = ''; } });

    function readGcodeOpts() {
        const val = (id, d) => { const e = document.getElementById(id); return e ? parseFloat(e.value) || d : d; };
        const sel = (id, d) => { const e = document.getElementById(id); return e ? e.value : d; };
        return {
            ...DEFAULT_GCODE,
            laserMode: sel('g-laser', 'M4'),
            engraveSpeed: val('g-espeed', DEFAULT_GCODE.engraveSpeed),
            cutSpeed: val('g-cspeed', DEFAULT_GCODE.cutSpeed),
            powerEngrave: val('g-epow', DEFAULT_GCODE.powerEngrave),
            powerCut: val('g-cpow', DEFAULT_GCODE.powerCut),
            maxPower: val('g-max', DEFAULT_GCODE.maxPower),
            dpi: val('g-dpi', DEFAULT_GCODE.dpi),
        };
    }

    updateEnabled();
    return { controller: ctrl };
}

function escapeHtml(s) { return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
