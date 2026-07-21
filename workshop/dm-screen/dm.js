/* ==========================================================================
   Loregate — Dungeon Master's screen controller (v4)
   Adds per-block weather painting, a drawing + laser layer, a move-to-bottom
   panel control and a fix for the map-jump when dragging pieces.
   ========================================================================== */
(function () {
    'use strict';

    const S = window.Loregate;
    const TERRAIN = S.TERRAIN;
    const ITEMS = S.ITEMS;
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => Array.from(document.querySelectorAll(s));
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const CONDITIONS = ['Poisoned', 'Stunned', 'Prone', 'Frightened', 'Restrained', 'Blessed', 'Concentrating', 'Unconscious'];
    const FLICKER = new Set(['torch', 'campfire', 'portal', 'lantern', 'stove']);
    const INDOOR = new Set(['wall', 'wood', 'plank', 'stone', 'cobble', 'rug']);

    const mapFrame = $('#mapFrame');
    const mapSurface = $('#mapSurface');
    const terrainLayer = $('#terrainLayer');
    const coordLayer = $('#coordLayer');
    const mapGrid = $('#mapGrid');
    const itemLayer = $('#itemLayer');
    const tokenLayer = $('#tokenLayer');
    const fogLayer = $('#fogLayer');
    const nightVeil = $('#nightVeil');
    const fxLayer = $('#fxLayer');
    const drawCanvas = $('#drawCanvas');
    const dctx = drawCanvas.getContext('2d');

    let mode = 'select';   // select|paint|erase|brush|hide|ping|measure|place|wxpaint|wxerase|draw|drawerase|laser
    let pendingItem = null;
    let selectedWeather = 'rain';
    let lastPingT = 0;
    const seenTokens = new Set();
    const seenItems = new Set();
    let diceHistory = [];
    let curStroke = null;
    let lastLaserT = 0;

    let toastTimer;
    function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 1900); }
    function hpColor(r) { return r > 0.5 ? 'var(--emerald)' : r > 0.25 ? 'var(--gold)' : 'var(--blood)'; }
    function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
    function cellFromPointer(evt) {
        const L = S.loc(); const rect = mapFrame.getBoundingClientRect();
        const x = clamp((evt.clientX - rect.left) / rect.width, 0, 0.9999), y = clamp((evt.clientY - rect.top) / rect.height, 0, 0.9999);
        return { c: Math.floor(x * L.map.cols), r: Math.floor(y * L.map.rows) };
    }
    function normFromPointer(evt) {
        const rect = mapFrame.getBoundingClientRect();
        return { x: clamp((evt.clientX - rect.left) / rect.width, 0, 1), y: clamp((evt.clientY - rect.top) / rect.height, 0, 1) };
    }

    function autoLight(L, settings) {
        if (!settings.revealAroundPlayers) return;
        const rad = settings.lightRadius || 4;
        const set = new Set(L.fog);
        const sources = L.tokens.filter((t) => t.kind === 'player').concat(L.items.filter((i) => i.type === 'torch' || i.type === 'campfire' || i.type === 'lantern'));
        sources.forEach((s) => { for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) if (Math.hypot(dc, dr) <= rad) { const c = s.c + dc, r = s.r + dr; if (c >= 0 && r >= 0 && c < L.map.cols && r < L.map.rows) set.add(c + ',' + r); } });
        L.fog = Array.from(set);
    }

    /* ---- Weather model (per-cell) for the ambient layer ---- */
    function weatherModel() {
        const L = S.loc();
        const cells = L.weatherCells || {};
        const base = L.weather || 'none';
        const indoorSafe = L.weatherIndoorSafe;
        const at = (c, r) => {
            const key = c + ',' + r;
            if (cells[key] !== undefined) return cells[key];
            if (indoorSafe) { const t = L.terrain[key] || L.map.bg; if (INDOOR.has(t)) return 'none'; }
            return base;
        };
        const types = new Set();
        if (base && base !== 'none') types.add(base);
        Object.values(cells).forEach((t) => { if (t && t !== 'none') types.add(t); });
        return { cols: L.map.cols, rows: L.map.rows, at, types: [...types] };
    }
    const ambient = window.LoregateAmbient.init($('#ambientCanvas'), weatherModel, () => S.get().settings.animations);

    /* ======================================================================
       MAP RENDER
       ====================================================================== */
    function renderMap() {
        const st = S.get(); const L = S.loc(); const set = st.settings;
        const { cols, rows, bg, imageUrl, grid, fogEnabled } = L.map;
        const anim = set.animations;

        document.body.classList.toggle('no-anim', !anim);
        document.documentElement.style.setProperty('--dm-fog', set.dmFogOpacity);

        const terr = TERRAIN[bg] || TERRAIN.stone;
        if (bg === 'image' && imageUrl) { mapSurface.style.background = '#05040a'; mapSurface.style.backgroundImage = `url("${imageUrl}")`; }
        else { mapSurface.style.background = terr.bg; }
        mapSurface.classList.toggle('anim-water', anim && terr.animated === 'water');
        mapSurface.classList.toggle('anim-lava', anim && terr.animated === 'lava');

        terrainLayer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        terrainLayer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        if (terrainLayer.childElementCount !== cols * rows) {
            terrainLayer.innerHTML = '';
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const cell = document.createElement('div'); cell.className = 'terrain-cell'; cell.dataset.key = c + ',' + r; terrainLayer.appendChild(cell); }
        }
        $$('#terrainLayer .terrain-cell').forEach((cell) => {
            const id = L.terrain[cell.dataset.key];
            if (id && TERRAIN[id]) { cell.style.background = TERRAIN[id].bg; cell.style.opacity = '1'; cell.classList.toggle('anim-water', anim && TERRAIN[id].animated === 'water'); cell.classList.toggle('anim-lava', anim && TERRAIN[id].animated === 'lava'); }
            else { cell.style.background = ''; cell.style.opacity = '0'; }
        });
        terrainLayer.classList.toggle('paint-on', mode === 'paint' || mode === 'erase');

        mapGrid.classList.toggle('on', !!grid);
        mapGrid.style.backgroundSize = `${100 / cols}% ${100 / rows}%`;

        coordLayer.classList.toggle('on', set.showCoords);
        if (set.showCoords && coordLayer.dataset.size !== cols + 'x' + rows) {
            coordLayer.dataset.size = cols + 'x' + rows; let html = '';
            for (let c = 0; c < cols; c++) html += `<span style="position:absolute;top:1px;left:${(c + 0.5) / cols * 100}%;transform:translateX(-50%)">${c}</span>`;
            for (let r = 0; r < rows; r++) html += `<span style="position:absolute;left:1px;top:${(r + 0.5) / rows * 100}%;transform:translateY(-50%)">${r}</span>`;
            coordLayer.innerHTML = html;
        }

        nightVeil.classList.toggle('on', set.night);

        fogLayer.style.display = fogEnabled ? 'grid' : 'none';
        fogLayer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        fogLayer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        const revealed = new Set(L.fog);
        if (fogLayer.childElementCount !== cols * rows) {
            fogLayer.innerHTML = '';
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const cell = document.createElement('div'); cell.className = 'fog-cell'; cell.dataset.key = c + ',' + r; fogLayer.appendChild(cell); }
        }
        $$('#fogLayer .fog-cell').forEach((cell) => cell.classList.toggle('revealed', revealed.has(cell.dataset.key)));
        fogLayer.classList.toggle('brush-on', (mode === 'brush' || mode === 'hide') && fogEnabled);

        itemLayer.innerHTML = '';
        const cellW = 100 / cols;
        L.items.forEach((it) => {
            const el = document.createElement('div');
            el.className = 'map-item draggable' + (it.hidden ? ' is-hidden' : '') + (FLICKER.has(it.type) && anim ? ' flicker' : '');
            el.dataset.id = it.id; el.dataset.kind = 'item';
            el.style.left = ((it.c + 0.5) / cols * 100) + '%'; el.style.top = ((it.r + 0.5) / rows * 100) + '%';
            el.style.width = (cellW * (it.size || 1)) + '%'; el.style.height = (100 / rows * (it.size || 1)) + '%';
            el.title = it.name + (it.hidden ? ' (hidden)' : '');
            el.innerHTML = `<span class="item-emoji" style="font-size:calc(${(it.size || 1)} * clamp(.7rem,2vw,1.3rem))">${it.icon}</span>`;
            if (!seenItems.has(it.id)) { seenItems.add(it.id); if (anim) el.classList.add('spawn-in'); }
            itemLayer.appendChild(el);
        });

        tokenLayer.innerHTML = '';
        L.tokens.filter((t) => !t.staged).forEach((t) => {
            const el = document.createElement('div'); const dead = t.maxHp > 0 && t.hp <= 0; const isNew = !seenTokens.has(t.id);
            el.className = 'token draggable kind-' + t.kind + (t.hidden ? ' is-hidden' : '') + (dead ? ' is-dead' : '') + (st.turn.activeId === t.id ? ' is-active' : '') + (isNew && anim ? ' spawn-in' : '');
            if (isNew) seenTokens.add(t.id);
            el.dataset.id = t.id; el.dataset.kind = 'token';
            el.style.left = ((t.c + 0.5) / cols * 100) + '%'; el.style.top = ((t.r + 0.5) / rows * 100) + '%';
            el.style.width = (cellW * 0.92 * (t.size || 1)) + '%'; el.style.height = (100 / rows * 0.92 * (t.size || 1)) + '%';
            el.style.background = t.color;
            if (set.nameOnHover) el.title = t.name + '  ·  ' + (t.maxHp > 0 ? t.hp + '/' + t.maxHp + ' HP' : '');
            let hp = '';
            if (t.maxHp > 0) { const ratio = clamp(t.hp / t.maxHp, 0, 1); hp = set.hpAsNumbers ? `<span class="token-hpnum">${t.hp}</span>` : `<span class="token-hp"><span style="width:${ratio * 100}%;background:${hpColor(ratio)}"></span></span>`; }
            el.innerHTML = `<span class="token-init">${(t.name || '?').slice(0, 2).toUpperCase()}</span>` + hp;
            tokenLayer.appendChild(el);
        });

        if (L.ping && L.ping.t !== lastPingT && Date.now() - L.ping.t < 4000) {
            lastPingT = L.ping.t;
            const ping = document.createElement('div'); ping.className = 'ping';
            ping.style.left = ((L.ping.c + 0.5) / cols * 100) + '%'; ping.style.top = ((L.ping.r + 0.5) / rows * 100) + '%';
            fxLayer.appendChild(ping); setTimeout(() => ping.remove(), 3200);
        }
        renderLaser();
        renderDrawings();
    }

    /* ---- Laser + drawings ---- */
    function renderLaser() {
        const L = S.loc();
        let dot = fxLayer.querySelector('.laser-dot');
        if (L.laser) { if (!dot) { dot = document.createElement('div'); dot.className = 'laser-dot'; fxLayer.appendChild(dot); } dot.style.left = (L.laser.x * 100) + '%'; dot.style.top = (L.laser.y * 100) + '%'; }
        else if (dot) dot.remove();
    }
    function renderDrawings() {
        const L = S.loc(); const rect = mapFrame.getBoundingClientRect();
        const cw = Math.max(1, Math.round(rect.width)), ch = Math.max(1, Math.round(rect.height));
        if (drawCanvas.width !== cw || drawCanvas.height !== ch) { drawCanvas.width = cw; drawCanvas.height = ch; }
        dctx.clearRect(0, 0, cw, ch);
        S.drawStrokes(dctx, L.drawings, cw, ch);
        if (curStroke && curStroke.points.length) S.drawStrokes(dctx, [curStroke], cw, ch);
        drawCanvas.classList.toggle('draw-on', mode === 'draw' || mode === 'drawerase' || mode === 'laser');
    }

    /* ======================================================================
       POINTER INTERACTIONS
       ====================================================================== */
    let drag = null, painting = false, lastPaintKey = null, measuring = null;

    mapFrame.addEventListener('pointerdown', (e) => {
        if (mode === 'paint' || mode === 'erase') { e.preventDefault(); painting = true; lastPaintKey = null; mapFrame.setPointerCapture(e.pointerId); paintTerrain(e); }
        else if (mode === 'brush' || mode === 'hide') { e.preventDefault(); painting = true; lastPaintKey = null; mapFrame.setPointerCapture(e.pointerId); paintFog(e); }
        else if (mode === 'wxpaint' || mode === 'wxerase') { e.preventDefault(); painting = true; lastPaintKey = null; mapFrame.setPointerCapture(e.pointerId); paintWeather(e); }
        else if (mode === 'draw') { e.preventDefault(); mapFrame.setPointerCapture(e.pointerId); const p = normFromPointer(e); curStroke = { color: $('#drawColor').value, width: Number($('#drawWidth').value) || 4, type: $('#drawType').value, points: [p] }; renderDrawings(); }
        else if (mode === 'drawerase') { e.preventDefault(); painting = true; mapFrame.setPointerCapture(e.pointerId); eraseDrawing(e); }
        else if (mode === 'laser') { e.preventDefault(); mapFrame.setPointerCapture(e.pointerId); setLaser(e); }
        else if (mode === 'measure') { e.preventDefault(); const rect = mapFrame.getBoundingClientRect(); measuring = { x0: e.clientX - rect.left, y0: e.clientY - rect.top }; mapFrame.setPointerCapture(e.pointerId); }
        else if (mode === 'select') { const piece = e.target.closest('.draggable'); if (!piece) return; e.preventDefault(); drag = { el: piece, id: piece.dataset.id, kind: piece.dataset.kind, moved: false }; piece.classList.add('dragging'); mapFrame.setPointerCapture(e.pointerId); }
    });
    mapFrame.addEventListener('pointermove', (e) => {
        if (drag) { const rect = mapFrame.getBoundingClientRect(); drag.el.style.left = clamp((e.clientX - rect.left) / rect.width * 100, 0, 100) + '%'; drag.el.style.top = clamp((e.clientY - rect.top) / rect.height * 100, 0, 100) + '%'; drag.moved = true; }
        else if (painting && (mode === 'paint' || mode === 'erase')) paintTerrain(e);
        else if (painting && (mode === 'brush' || mode === 'hide')) paintFog(e);
        else if (painting && (mode === 'wxpaint' || mode === 'wxerase')) paintWeather(e);
        else if (curStroke && mode === 'draw') { curStroke.points.push(normFromPointer(e)); renderDrawings(); }
        else if (painting && mode === 'drawerase') eraseDrawing(e);
        else if (mode === 'laser' && e.buttons) setLaser(e);
        else if (measuring) drawMeasure(e);
    });
    window.addEventListener('pointerup', (e) => {
        if (drag) {
            const { id, kind, moved } = drag; drag.el.classList.remove('dragging'); const wasDrag = moved; drag = null;
            if (wasDrag) { const { c, r } = cellFromPointer(e); S.update((st) => { const L = S.activeLocation(st); const arr = kind === 'token' ? L.tokens : L.items; const p = arr.find((x) => x.id === id); if (p) { p.c = c; p.r = r; } if (kind === 'token') autoLight(L, st.settings); }); }
        }
        if (curStroke) { const stroke = curStroke; curStroke = null; if (stroke.points.length) S.update((st) => { S.activeLocation(st).drawings.push(stroke); }); }
        if (mode === 'laser') S.update((st) => { S.activeLocation(st).laser = null; });
        painting = false; lastPaintKey = null;
        if (measuring) { measuring = null; clearMeasure(); }
    });
    mapFrame.addEventListener('click', (e) => {
        if (mode === 'ping') { const { c, r } = cellFromPointer(e); S.update((st) => { S.activeLocation(st).ping = { c, r, t: Date.now() }; }); toast('Ping sent to the players'); }
        else if (mode === 'place' && pendingItem) { const { c, r } = cellFromPointer(e); const type = pendingItem; S.update((st) => { S.activeLocation(st).items.push(S.makeItem({ type, c, r })); }); }
    });

    function paintTerrain(evt) { const { c, r } = cellFromPointer(evt); const key = c + ',' + r; if (key === lastPaintKey) return; lastPaintKey = key; const terr = $('#terrainSelect').value; S.update((st) => { const L = S.activeLocation(st); if (mode === 'erase') delete L.terrain[key]; else L.terrain[key] = terr; }); }
    function paintFog(evt) {
        const { c, r } = cellFromPointer(evt); const size = Number($('#brushSize').value) || 1; const half = Math.floor(size / 2);
        const reveal = evt.altKey ? (mode !== 'brush') : (mode === 'brush');
        S.update((st) => { const L = S.activeLocation(st); const fset = new Set(L.fog); for (let dr = -half; dr <= half; dr++) for (let dc = -half; dc <= half; dc++) { const cc = c + dc, rr = r + dr; if (cc < 0 || rr < 0 || cc >= L.map.cols || rr >= L.map.rows) continue; const key = cc + ',' + rr; if (reveal) fset.add(key); else fset.delete(key); } L.fog = Array.from(fset); });
    }
    function paintWeather(evt) {
        const { c, r } = cellFromPointer(evt); const key = c + ',' + r; if (key === lastPaintKey) return; lastPaintKey = key;
        S.update((st) => { const L = S.activeLocation(st); if (!L.weatherCells) L.weatherCells = {}; if (mode === 'wxerase') L.weatherCells[key] = 'none'; else L.weatherCells[key] = selectedWeather; });
    }
    function eraseDrawing(evt) {
        const p = normFromPointer(evt); const th = 0.03;
        S.update((st) => { const L = S.activeLocation(st); L.drawings = L.drawings.filter((s) => !s.points.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < th)); });
    }
    function setLaser(evt) {
        const now = performance.now(); if (now - lastLaserT < 35) return; lastLaserT = now;
        const p = normFromPointer(evt); S.update((st) => { S.activeLocation(st).laser = { x: p.x, y: p.y, t: Date.now() }; });
    }
    function drawMeasure(evt) {
        const L = S.loc(); const rect = mapFrame.getBoundingClientRect();
        const x1 = evt.clientX - rect.left, y1 = evt.clientY - rect.top, dx = x1 - measuring.x0, dy = y1 - measuring.y0;
        const len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI, cellPx = rect.width / L.map.cols, squares = Math.round(len / cellPx);
        clearMeasure();
        const line = document.createElement('div'); line.className = 'measure-line'; line.style.left = measuring.x0 + 'px'; line.style.top = measuring.y0 + 'px'; line.style.width = len + 'px'; line.style.transform = `rotate(${ang}deg)`;
        const label = document.createElement('div'); label.className = 'measure-label'; label.style.left = (measuring.x0 + dx / 2) + 'px'; label.style.top = (measuring.y0 + dy / 2) + 'px'; label.textContent = `${squares} sq · ${squares * 5} ft · ${(squares * 1.5).toFixed(1)} m`;
        fxLayer.append(line, label);
    }
    function clearMeasure() { fxLayer.querySelectorAll('.measure-line,.measure-label').forEach((n) => n.remove()); }

    const MODE_BTNS = [['paintBtn', 'paint'], ['eraseBtn', 'erase'], ['brushBtn', 'brush'], ['hideBrushBtn', 'hide'], ['pingBtn', 'ping'], ['measureBtn', 'measure'], ['wxPaintBtn', 'wxpaint'], ['wxEraseBtn', 'wxerase'], ['drawBtn', 'draw'], ['drawEraseBtn', 'drawerase'], ['laserBtn', 'laser']];
    function setMode(next) {
        mode = (mode === next && next !== 'select') ? 'select' : next;
        if (mode !== 'place') pendingItem = null;
        MODE_BTNS.forEach(([id, m]) => { const el = $('#' + id); if (el) el.classList.toggle('active', mode === m); });
        $$('#palette .pal-item').forEach((p) => p.classList.toggle('active', mode === 'place' && p.dataset.type === pendingItem));
        mapFrame.style.cursor = (mode === 'ping' || mode === 'place') ? 'crosshair' : '';
        renderMap();
    }

    /* ======================================================================
       LOCATION SWITCHER
       ====================================================================== */
    $('#locPrev').addEventListener('click', () => S.update((st) => { st.activeLoc = (st.activeLoc - 1 + st.locations.length) % st.locations.length; }));
    $('#locNext').addEventListener('click', () => S.update((st) => { st.activeLoc = (st.activeLoc + 1) % st.locations.length; }));
    $('#locName').addEventListener('input', (e) => S.update((st) => { S.activeLocation(st).name = e.target.value; }));
    $('#presetSelect').addEventListener('change', (e) => {
        const v = e.target.value; e.target.value = ''; if (!v) return;
        let loc;
        if (v === 'blank') loc = S.makeLocation();
        else if (v === 'tavernNpc') loc = S.presets.tavern(true);
        else if (v === 'tavern') loc = S.presets.tavern(false);
        else if (S.presets[v]) loc = S.presets[v]();
        if (!loc) return;
        // offer to bring the current party along to the new map
        const party = S.loc().tokens.filter((t) => t.kind === 'player' && !t.staged);
        if (party.length && confirm(`Bring the ${party.length} player character(s) onto “${loc.name}” too?`)) {
            party.forEach((t, i) => { const nt = S.clone(t); nt.id = 'tok-' + Math.random().toString(36).slice(2, 9); nt.staged = false; nt.c = 1 + (i % Math.max(1, loc.map.cols - 2)); nt.r = 1; loc.tokens.push(nt); });
        }
        S.update((st) => { st.locations.push(loc); st.activeLoc = st.locations.length - 1; });
        toast('New location: ' + loc.name);
    });
    $('#locDelete').addEventListener('click', () => { const st = S.get(); if (st.locations.length <= 1) { toast('Keep at least one location'); return; } if (st.settings.confirmDelete && !confirm('Delete “' + S.loc().name + '”?')) return; S.update((s) => { s.locations.splice(s.activeLoc, 1); s.activeLoc = Math.max(0, s.activeLoc - 1); }); });
    $('#locExport').addEventListener('click', () => { const blob = new Blob([JSON.stringify(S.loc(), null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'loregate-location-' + (S.loc().name || 'map').replace(/\s+/g, '-').toLowerCase() + '.json'; a.click(); URL.revokeObjectURL(a.href); });
    $('#locImport').addEventListener('click', () => $('#locImportFile').click());
    $('#locImportFile').addEventListener('change', (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const loc = JSON.parse(reader.result); if (!loc || !loc.map) throw 0; loc.id = 'loc-' + Math.random().toString(36).slice(2, 9); S.update((st) => { st.locations.push(loc); st.activeLoc = st.locations.length - 1; }); toast('Location imported'); } catch { toast('That file is not a location'); } }; reader.readAsText(file); e.target.value = ''; });

    /* ======================================================================
       TERRAIN / FOG / WEATHER / DRAW TOOLBARS
       ====================================================================== */
    (function fillTerrainSelect() {
        const sel = $('#terrainSelect');
        Object.keys(TERRAIN).forEach((id) => { const o = document.createElement('option'); o.value = id; o.textContent = TERRAIN[id].label; sel.appendChild(o); });
        const img = document.createElement('option'); img.value = 'image'; img.textContent = 'Custom image…'; sel.appendChild(img);
        sel.value = 'grass';
    })();
    $('#terrainSelect').addEventListener('change', (e) => { $('#bgImage').style.display = e.target.value === 'image' ? 'block' : 'none'; });
    $('#bgImage').addEventListener('input', (e) => S.update((st) => { S.activeLocation(st).map.imageUrl = e.target.value; }));
    $('#fillBtn').addEventListener('click', () => { const terr = $('#terrainSelect').value; S.update((st) => { S.activeLocation(st).map.bg = terr; }); toast('Base terrain set to ' + (TERRAIN[terr] ? TERRAIN[terr].label : terr)); });
    $('#paintBtn').addEventListener('click', () => setMode('paint'));
    $('#eraseBtn').addEventListener('click', () => setMode('erase'));
    $('#brushBtn').addEventListener('click', () => setMode('brush'));
    $('#hideBrushBtn').addEventListener('click', () => setMode('hide'));
    $('#pingBtn').addEventListener('click', () => setMode('ping'));
    $('#measureBtn').addEventListener('click', () => setMode('measure'));
    $('#gridToggle').addEventListener('change', (e) => S.update((st) => { S.activeLocation(st).map.grid = e.target.checked; }));
    $('#fogToggle').addEventListener('change', (e) => S.update((st) => { S.activeLocation(st).map.fogEnabled = e.target.checked; }));
    $('#revealAll').addEventListener('click', () => S.update((st) => { const L = S.activeLocation(st), all = []; for (let r = 0; r < L.map.rows; r++) for (let c = 0; c < L.map.cols; c++) all.push(c + ',' + r); L.fog = all; }));
    $('#hideAll').addEventListener('click', () => S.update((st) => { S.activeLocation(st).fog = []; }));
    $('#dmFog').addEventListener('input', (e) => S.update((st) => { st.settings.dmFogOpacity = clamp(1 - e.target.value / 100, 0.05, 1); }));
    $('#blackoutBtn').addEventListener('click', () => S.update((st) => { st.settings.blackout = !st.settings.blackout; toast(st.settings.blackout ? 'Player screen blacked out' : 'Player screen restored'); }));

    // weather: pick a brush, apply to whole map, paint or erase cells
    function selectWeather(wx) { selectedWeather = wx; $$('.wx').forEach((x) => x.classList.toggle('active', x.dataset.wx === wx)); }
    $$('.wx').forEach((b) => b.addEventListener('click', () => selectWeather(b.dataset.wx)));
    $('#wxWholeBtn').addEventListener('click', () => S.update((st) => { S.activeLocation(st).weather = selectedWeather; toast(selectedWeather + ' across the whole map'); }));
    $('#wxPaintBtn').addEventListener('click', () => setMode('wxpaint'));
    $('#wxEraseBtn').addEventListener('click', () => setMode('wxerase'));
    $('#wxClearBtn').addEventListener('click', () => S.update((st) => { const L = S.activeLocation(st); L.weather = 'none'; L.weatherCells = {}; toast('Weather cleared'); }));
    $('#wxIndoor').addEventListener('change', (e) => S.update((st) => { S.activeLocation(st).weatherIndoorSafe = e.target.checked; }));

    // drawing + laser
    $('#drawBtn').addEventListener('click', () => setMode('draw'));
    $('#drawEraseBtn').addEventListener('click', () => setMode('drawerase'));
    $('#laserBtn').addEventListener('click', () => setMode('laser'));
    $('#drawUndo').addEventListener('click', () => S.update((st) => { S.activeLocation(st).drawings.pop(); }));
    $('#drawClear').addEventListener('click', () => S.update((st) => { S.activeLocation(st).drawings = []; }));

    // Collapsible toolbars (fold to reclaim screen space) — remembered per DM browser
    (function initToolbars() {
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem('loregate.ui.tb') || '{}'); } catch { saved = {}; }
        $$('.map-toolbar.collapsible').forEach((tb) => {
            const key = tb.dataset.tb;
            if (saved[key]) tb.classList.add('collapsed');
            const toggle = tb.querySelector('.tb-toggle');
            if (!toggle) return;
            toggle.setAttribute('aria-expanded', String(!tb.classList.contains('collapsed')));
            toggle.addEventListener('click', () => {
                tb.classList.toggle('collapsed');
                const collapsed = tb.classList.contains('collapsed');
                toggle.setAttribute('aria-expanded', String(!collapsed));
                saved[key] = collapsed;
                try { localStorage.setItem('loregate.ui.tb', JSON.stringify(saved)); } catch { /* ignore */ }
                renderMap();
            });
        });
    })();

    /* ======================================================================
       ITEM PALETTE
       ====================================================================== */
    (function buildPalette() {
        const pal = $('#palette');
        Object.keys(ITEMS).forEach((type) => {
            const b = document.createElement('button'); b.className = 'pal-item'; b.type = 'button'; b.dataset.type = type; b.title = ITEMS[type].label; b.textContent = ITEMS[type].icon;
            b.addEventListener('click', () => { pendingItem = type; mode = 'place'; $$('#palette .pal-item').forEach((p) => p.classList.toggle('active', p === b)); MODE_BTNS.forEach(([id]) => { const el = $('#' + id); if (el) el.classList.remove('active'); }); mapFrame.style.cursor = 'crosshair'; toast('Click the map to place a ' + ITEMS[type].label); });
            pal.appendChild(b);
        });
    })();
    function renderItems() {
        const L = S.loc(); const wrap = $('#itemList'); $('#itemCount').textContent = L.items.length; wrap.innerHTML = '';
        L.items.forEach((it) => {
            const row = document.createElement('div'); row.className = 'roster-item'; row.style.borderLeftColor = 'var(--arcane)';
            row.innerHTML = `<div class="swatch" style="background:transparent;border-color:var(--line);font-size:1rem">${it.icon}</div>
                <div class="roster-main"><input class="j-name" value="${escapeHtml(it.name)}" style="background:transparent;border:0;padding:0;font-weight:600;font-size:.86rem;color:var(--text)"><div class="roster-meta"><span>${it.type}</span><span>cell ${it.c},${it.r}</span></div></div>
                <div class="icon-actions"><button class="mini ${it.hidden ? '' : 'on'} j-vis" title="Show / hide from players">${it.hidden ? '🚫' : '👁️'}</button><button class="mini j-big" title="Cycle size">⤢</button><button class="mini danger j-del" title="Remove">🗑️</button></div>`;
            row.querySelector('.j-name').addEventListener('change', (e) => S.update((st) => { const o = S.activeLocation(st).items.find((x) => x.id === it.id); if (o) o.name = e.target.value; }));
            row.querySelector('.j-vis').addEventListener('click', () => S.update((st) => { const o = S.activeLocation(st).items.find((x) => x.id === it.id); if (o) o.hidden = !o.hidden; }));
            row.querySelector('.j-big').addEventListener('click', () => S.update((st) => { const o = S.activeLocation(st).items.find((x) => x.id === it.id); if (o) o.size = (o.size % 3) + 1; }));
            row.querySelector('.j-del').addEventListener('click', () => S.update((st) => { const L2 = S.activeLocation(st); L2.items = L2.items.filter((x) => x.id !== it.id); }));
            wrap.appendChild(row);
        });
    }

    /* ======================================================================
       ROSTER
       ====================================================================== */
    $('#addTokenForm').addEventListener('submit', (e) => {
        e.preventDefault(); const name = $('#ntName').value.trim(); if (!name) return; const kind = $('#ntKind').value; const hp = Number($('#ntHp').value) || 10; const colors = { player: '#38bdf8', enemy: '#e5484d', npc: '#e8b24c' };
        S.update((st) => { const L = S.activeLocation(st); L.tokens.push(S.makeToken({ name, kind, color: colors[kind], hp, maxHp: hp, c: 1 + (L.tokens.length % Math.max(1, L.map.cols - 2)), r: 1 + (Math.floor(L.tokens.length / 4) % Math.max(1, L.map.rows - 2)), initiative: kind === 'player' ? 10 : Math.ceil(Math.random() * 20) })); autoLight(L, st.settings); });
        e.target.reset(); $('#ntKind').value = kind; $('#ntHp').value = 10; $('#ntName').focus();
    });
    function renderRoster() {
        const st = S.get(); const L = S.loc(); const wrap = $('#roster');
        const onMap = L.tokens.filter((t) => !t.staged);
        $('#rosterCount').textContent = onMap.length; $('#rosterEmpty').style.display = onMap.length ? 'none' : 'block'; wrap.innerHTML = '';
        const otherLocsOpts = st.locations.map((lc, i) => i === st.activeLoc ? '' : `<option value="${i}">${escapeHtml(lc.name)}</option>`).join('');
        const syncChar = (tk, s) => { if (tk.charId) { const ch = s.characters.find((c) => c.id === tk.charId); if (ch) { ch.hp = tk.hp; ch.maxHp = tk.maxHp; } } };
        onMap.forEach((t) => {
            const item = document.createElement('div'); item.className = 'roster-item' + (st.turn.activeId === t.id ? ' active' : ''); item.dataset.id = t.id; item.style.borderLeftColor = t.color; const ratio = t.maxHp > 0 ? clamp(t.hp / t.maxHp, 0, 1) : 0;
            item.innerHTML = `<div class="swatch" style="background:${t.color}">${(t.name || '?').slice(0, 2).toUpperCase()}</div>
                <div class="roster-main"><div class="roster-name">${escapeHtml(t.name)} <span class="badge">${t.kind}</span>${t.charId ? '<span class="badge" title="Has a character sheet">🧑</span>' : ''}</div>
                    <div class="roster-meta"><span>AC ${t.ac}</span><span>Init <input class="hp-input j-init" type="number" value="${t.initiative}" style="width:40px"></span></div>
                    <div class="hp-bar"><span style="width:${ratio * 100}%;background:${hpColor(ratio)}"></span></div>
                    <div class="hp-controls" style="margin-top:.35rem"><button class="hp-step j-dmg" title="Damage 1">−</button><input class="hp-input j-hp" type="number" value="${t.hp}"><span style="color:var(--text-faint);font-size:.75rem">/ ${t.maxHp}</span><button class="hp-step j-heal" title="Heal 1">＋</button></div></div>
                <div class="icon-actions"><button class="mini ${t.hidden ? '' : 'on'} j-vis" title="Show / hide on player screen">${t.hidden ? '🚫' : '👁️'}</button><button class="mini ${t.showHp ? 'on' : ''} j-hp-toggle" title="Show HP to players">❤️</button><button class="mini j-big" title="Cycle size">⤢</button><button class="mini j-center" title="Center on map">🎯</button><button class="mini j-bench" title="Send to the off-map bench">🎭</button><button class="mini danger j-del" title="Remove">🗑️</button></div>
                <div class="conditions">${CONDITIONS.map((c) => `<span class="cond ${t.conditions.includes(c) ? '' : 'off'}" data-cond="${c}">${c}</span>`).join('')}</div>
                ${otherLocsOpts ? `<div class="send-row"><select class="j-send"><option value="">🚚 Copy to another location…</option>${otherLocsOpts}</select></div>` : ''}`;
            const upd = (fn) => S.update((s) => { const tk = S.activeLocation(s).tokens.find((x) => x.id === t.id); if (tk) fn(tk, s); });
            const hpInput = item.querySelector('.j-hp');
            item.querySelector('.j-dmg').addEventListener('click', () => upd((tk, s) => { tk.hp = clamp(tk.hp - 1, 0, tk.maxHp); syncChar(tk, s); }));
            item.querySelector('.j-heal').addEventListener('click', () => upd((tk, s) => { tk.hp = clamp(tk.hp + 1, 0, tk.maxHp); syncChar(tk, s); }));
            hpInput.addEventListener('change', () => upd((tk, s) => { tk.hp = clamp(Number(hpInput.value) || 0, 0, tk.maxHp); syncChar(tk, s); }));
            item.querySelector('.j-init').addEventListener('change', (e) => upd((tk) => tk.initiative = Number(e.target.value) || 0));
            item.querySelector('.j-vis').addEventListener('click', () => upd((tk) => tk.hidden = !tk.hidden));
            item.querySelector('.j-hp-toggle').addEventListener('click', () => upd((tk) => tk.showHp = !tk.showHp));
            item.querySelector('.j-big').addEventListener('click', () => upd((tk) => tk.size = (tk.size % 4) + 1));
            item.querySelector('.j-center').addEventListener('click', () => upd((tk, s) => { const L2 = S.activeLocation(s); tk.c = Math.floor(L2.map.cols / 2); tk.r = Math.floor(L2.map.rows / 2); }));
            item.querySelector('.j-bench').addEventListener('click', () => upd((tk) => tk.staged = true));
            item.querySelector('.j-del').addEventListener('click', () => { if (st.settings.confirmDelete && !confirm(`Remove ${t.name}?`)) return; S.update((s) => { const L2 = S.activeLocation(s); L2.tokens = L2.tokens.filter((x) => x.id !== t.id); if (s.turn.activeId === t.id) s.turn.activeId = null; }); });
            const sendSel = item.querySelector('.j-send');
            if (sendSel) sendSel.addEventListener('change', (e) => { const idx = Number(e.target.value); e.target.value = ''; if (Number.isNaN(idx)) return; S.update((s) => { const target = s.locations[idx]; if (!target) return; const nt = S.clone(t); nt.id = 'tok-' + Math.random().toString(36).slice(2, 9); nt.staged = true; target.tokens.push(nt); }); toast(`${t.name} staged in ${st.locations[idx].name}`); });
            item.querySelectorAll('.cond').forEach((chip) => chip.addEventListener('click', () => upd((tk) => { const cond = chip.dataset.cond; tk.conditions = tk.conditions.includes(cond) ? tk.conditions.filter((x) => x !== cond) : [...tk.conditions, cond]; })));
            wrap.appendChild(item);
        });
    }

    /* ---- Bench (off-map staging) ---- */
    let benchGhost = null, benchDragId = null;
    function renderBench() {
        const L = S.loc(); const staged = L.tokens.filter((t) => t.staged);
        const list = $('#benchList'); $('#benchEmpty').style.display = staged.length ? 'none' : 'block'; list.innerHTML = '';
        staged.forEach((t) => {
            const chip = document.createElement('div'); chip.className = 'bench-chip kind-' + t.kind; chip.dataset.id = t.id;
            chip.innerHTML = `<span class="bench-token" style="background:${t.color}" title="Drag onto the map">${(t.name || '?').slice(0, 2).toUpperCase()}</span><span class="bench-name">${escapeHtml(t.name)}<small>${t.kind}${t.maxHp > 0 ? ' · ' + t.hp + '/' + t.maxHp : ''}</small></span><button class="mini j-deploy" title="Deploy to the centre">⬇</button><button class="mini danger j-unstage" title="Remove from this location">🗑️</button>`;
            chip.querySelector('.j-deploy').addEventListener('click', () => S.update((s) => { const L2 = S.activeLocation(s); const tk = L2.tokens.find((x) => x.id === t.id); if (tk) { tk.staged = false; tk.c = Math.floor(L2.map.cols / 2); tk.r = Math.floor(L2.map.rows / 2); } }));
            chip.querySelector('.j-unstage').addEventListener('click', () => { if (S.get().settings.confirmDelete && !confirm('Remove ' + t.name + ' from this location?')) return; S.update((s) => { const L2 = S.activeLocation(s); L2.tokens = L2.tokens.filter((x) => x.id !== t.id); }); });
            chip.querySelector('.bench-token').addEventListener('pointerdown', (e) => startBenchDrag(e, t.id, t));
            list.appendChild(chip);
        });
    }
    function startBenchDrag(e, id, t) {
        e.preventDefault(); benchDragId = id;
        benchGhost = document.createElement('div'); benchGhost.className = 'bench-ghost'; benchGhost.style.background = t.color; benchGhost.textContent = (t.name || '?').slice(0, 2).toUpperCase();
        document.body.appendChild(benchGhost); moveGhost(e);
        window.addEventListener('pointermove', moveGhost); window.addEventListener('pointerup', endBenchDrag);
    }
    function moveGhost(e) { if (benchGhost) { benchGhost.style.left = e.clientX + 'px'; benchGhost.style.top = e.clientY + 'px'; } }
    function endBenchDrag(e) {
        window.removeEventListener('pointermove', moveGhost); window.removeEventListener('pointerup', endBenchDrag);
        if (benchGhost) { benchGhost.remove(); benchGhost = null; }
        const id = benchDragId; benchDragId = null; if (!id) return;
        const rect = mapFrame.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
            const L = S.loc();
            const c = clamp(Math.floor((e.clientX - rect.left) / rect.width * L.map.cols), 0, L.map.cols - 1);
            const r = clamp(Math.floor((e.clientY - rect.top) / rect.height * L.map.rows), 0, L.map.rows - 1);
            S.update((s) => { const tk = S.activeLocation(s).tokens.find((x) => x.id === id); if (tk) { tk.staged = false; tk.c = c; tk.r = r; } });
            toast('Deployed to the map');
        }
    }

    /* ======================================================================
       INITIATIVE / BESTIARY / BIG BAD / INVENTORY / DICE
       ====================================================================== */
    function renderInitiative() {
        const st = S.get(); const L = S.loc(); const order = [...L.tokens].sort((a, b) => b.initiative - a.initiative);
        $('#roundPill').textContent = 'Round ' + st.turn.round; $('#initEmpty').style.display = order.length ? 'none' : 'block';
        $('#initList').innerHTML = order.map((t) => `<div class="init-row ${st.turn.activeId === t.id ? 'active' : ''}"><span class="init-num">${t.initiative}</span><span class="swatch" style="width:20px;height:20px;background:${t.color}"></span><span class="init-name">${escapeHtml(t.name)}</span><span class="roster-meta">${t.maxHp > 0 ? t.hp + '/' + t.maxHp : ''}</span></div>`).join('');
    }
    $('#rollInit').addEventListener('click', () => S.update((st) => { S.activeLocation(st).tokens.forEach((t) => t.initiative = Math.ceil(Math.random() * 20)); }));
    function advanceTurn(dir) { S.update((st) => { const order = [...S.activeLocation(st).tokens].sort((a, b) => b.initiative - a.initiative); if (!order.length) return; let idx = order.findIndex((t) => t.id === st.turn.activeId); if (idx === -1) idx = dir > 0 ? -1 : order.length; idx += dir; if (idx >= order.length) { idx = 0; st.turn.round += 1; } if (idx < 0) { idx = order.length - 1; st.turn.round = Math.max(1, st.turn.round - 1); } st.turn.activeId = order[idx].id; }); }
    $('#nextTurn').addEventListener('click', () => advanceTurn(1));
    $('#prevTurn').addEventListener('click', () => advanceTurn(-1));
    $('#endCombat').addEventListener('click', () => S.update((st) => { st.turn.activeId = null; st.turn.round = 1; }));

    $('#addBeastForm').addEventListener('submit', (e) => { e.preventDefault(); const name = $('#beName').value.trim(); if (!name) return; S.update((st) => st.bestiary.push({ id: 'be-' + Math.random().toString(36).slice(2, 8), name, cr: $('#beCr').value.trim(), ac: Number($('#beAc').value) || 10, hp: Number($('#beHp').value) || 8, maxHp: Number($('#beHp').value) || 8, notes: $('#beNotes').value.trim() })); e.target.reset(); $('#beName').focus(); });
    function renderBestiary() {
        const st = S.get(); $('#bestiaryCount').textContent = st.bestiary.length; $('#bestiaryEmpty').style.display = st.bestiary.length ? 'none' : 'block'; const wrap = $('#bestiary'); wrap.innerHTML = '';
        st.bestiary.forEach((b) => {
            const item = document.createElement('div'); item.className = 'roster-item'; item.style.borderLeftColor = 'var(--arcane)';
            item.innerHTML = `<div class="swatch" style="background:var(--arcane)">${(b.name || '?').slice(0, 2).toUpperCase()}</div><div class="roster-main"><div class="roster-name">${escapeHtml(b.name)} <span class="badge">CR ${b.cr || '—'}</span></div><div class="roster-meta"><span>AC ${b.ac}</span><span>HP ${b.maxHp}</span></div>${b.notes ? `<div class="hint">${escapeHtml(b.notes)}</div>` : ''}</div><div class="icon-actions"><button class="mini on j-spawn" title="Spawn onto the map">➕</button><button class="mini danger j-rm" title="Remove">🗑️</button></div>`;
            item.querySelector('.j-spawn').addEventListener('click', () => { S.update((st2) => { const L = S.activeLocation(st2); L.tokens.push(S.makeToken({ name: b.name, kind: 'enemy', color: '#e5484d', hp: b.maxHp, maxHp: b.maxHp, ac: b.ac, c: 1 + (L.tokens.length % Math.max(1, L.map.cols - 2)), r: 1 + (Math.floor(L.tokens.length / 4) % Math.max(1, L.map.rows - 2)), initiative: Math.ceil(Math.random() * 20) })); }); toast(b.name + ' spawned'); });
            item.querySelector('.j-rm').addEventListener('click', () => S.update((st2) => { st2.bestiary = st2.bestiary.filter((x) => x.id !== b.id); }));
            wrap.appendChild(item);
        });
    }

    $('#bbToMap').addEventListener('click', () => { const bb = S.get().bigbad; S.update((st) => { const L = S.activeLocation(st); L.tokens.push(S.makeToken({ name: bb.name || 'Big Bad', kind: 'enemy', color: '#b91c1c', size: Number(bb.size) || 2, hp: bb.hp, maxHp: bb.maxHp, ac: Number(bb.ac) || 15, c: Math.floor(L.map.cols / 2), r: Math.floor(L.map.rows / 2), initiative: 20 })); }); toast('The Big Bad enters the map'); });

    $('#addInvForm').addEventListener('submit', (e) => { e.preventDefault(); const name = $('#invName').value.trim(); if (!name) return; const qty = Number($('#invQty').value) || 1; S.update((st) => st.inventory.push({ id: 'inv-' + Math.random().toString(36).slice(2, 8), name, qty, note: '' })); e.target.reset(); $('#invQty').value = 1; $('#invName').focus(); });
    function renderInventory() {
        const st = S.get(); $('#invCount').textContent = st.inventory.length; const wrap = $('#invList'); wrap.innerHTML = '';
        st.inventory.forEach((it) => {
            const row = document.createElement('div'); row.className = 'inv-item';
            row.innerHTML = `<span class="inv-name">${escapeHtml(it.name)}${it.note ? `<small>${escapeHtml(it.note)}</small>` : ''}</span><button class="hp-step j-minus">−</button><input class="inv-qty j-qty" type="number" value="${it.qty}" min="0"><div style="display:flex;gap:.2rem"><button class="hp-step j-plus">＋</button><button class="mini danger j-del">🗑️</button></div>`;
            const upd = (fn) => S.update((s) => { const o = s.inventory.find((x) => x.id === it.id); if (o) fn(o); });
            row.querySelector('.j-minus').addEventListener('click', () => upd((o) => o.qty = Math.max(0, o.qty - 1)));
            row.querySelector('.j-plus').addEventListener('click', () => upd((o) => o.qty += 1));
            row.querySelector('.j-qty').addEventListener('change', (e) => upd((o) => o.qty = Math.max(0, Number(e.target.value) || 0)));
            row.querySelector('.j-del').addEventListener('click', () => S.update((s) => { s.inventory = s.inventory.filter((x) => x.id !== it.id); }));
            wrap.appendChild(row);
        });
        $('#invShowPlayers').checked = st.settings.showInventory;
    }
    $('#invShowPlayers').addEventListener('change', (e) => S.update((st) => { st.settings.showInventory = e.target.checked; }));

    function roll(sides) {
        const qty = clamp(Number($('#diceQty').value) || 1, 1, 20); const mod = Number($('#diceMod').value) || 0; const adv = $('#diceAdv').checked && sides === 20; const rolls = []; let total = 0;
        if (adv) { const a = 1 + Math.floor(Math.random() * 20), b = 1 + Math.floor(Math.random() * 20), best = Math.max(a, b); rolls.push(`${a}/${b}→${best}`); total = best + mod; }
        else { for (let i = 0; i < qty; i++) { const v = 1 + Math.floor(Math.random() * sides); rolls.push(v); total += v; } total += mod; }
        const box = $('#diceResult'); box.className = 'dice-result'; let crit = false, fumble = false;
        if (sides === 20 && !adv && qty === 1) { if (rolls[0] === 20) { box.classList.add('crit'); crit = true; } if (rolls[0] === 1) { box.classList.add('fumble'); fumble = true; } }
        box.querySelector('.total').textContent = total; const label = `${adv ? 'adv ' : ''}${qty}d${sides}${mod ? (mod > 0 ? '+' + mod : mod) : ''}`;
        box.querySelector('.detail').textContent = `${label}  [${rolls.join(', ')}]`;
        diceHistory.unshift(`${label} = ${total}  [${rolls.join(', ')}]`); diceHistory = diceHistory.slice(0, 8);
        $('#diceLog').innerHTML = diceHistory.map((l) => `<div>🎲 ${l}</div>`).join('');
        if (S.get().settings.showDiceToPlayers) S.update((st) => { st.lastRoll = { label, total, rolls, sides, crit, fumble, t: Date.now() }; });
    }
    $$('.die').forEach((d) => d.addEventListener('click', () => roll(Number(d.dataset.die))));
    $('#diceToPlayers').addEventListener('change', (e) => S.update((st) => { st.settings.showDiceToPlayers = e.target.checked; }));

    /* ======================================================================
       PANEL REORDER  (with move-to-bottom, jump-free)
       ====================================================================== */
    $$('#panelCol [data-panel] .panel-tools').forEach((tools) => {
        const b = document.createElement('button'); b.className = 'pmove'; b.dataset.dir = 'bottom'; b.title = 'Move to bottom'; b.type = 'button'; b.textContent = '⤓';
        const down = tools.querySelector('.pmove[data-dir="1"]'); if (down) down.after(b); else tools.appendChild(b);
    });
    $('#panelCol').addEventListener('click', (e) => {
        const btn = e.target.closest('.pmove'); if (!btn) return; e.preventDefault(); e.stopPropagation();
        const panel = btn.closest('[data-panel]'); const id = panel.dataset.panel; const dir = btn.dataset.dir;
        S.update((st) => {
            const ord = st.settings.panelOrder; const from = ord.indexOf(id); if (from < 0) return; let to;
            if (dir === 'bottom') to = ord.length - 1; else if (dir === 'top') to = 0; else to = from + Number(dir);
            to = Math.max(0, Math.min(ord.length - 1, to)); ord.splice(from, 1); ord.splice(to, 0, id);
        });
    });
    let lastPanelSig = '';
    function applyPanelOrder() {
        const order = S.get().settings.panelOrder || []; const sig = order.join(',');
        if (sig === lastPanelSig) return; lastPanelSig = sig;
        const col = $('#panelCol'); const footer = col.querySelector('.footer-note');
        order.forEach((id) => { const p = col.querySelector(`[data-panel="${id}"]`); if (p) col.insertBefore(p, footer); });
    }

    /* ======================================================================
       SETTINGS
       ====================================================================== */
    const SETTINGS = [
        { key: 'animations', label: 'Animations', desc: 'Token pulses, weather, flicker & flourishes', type: 'toggle' },
        { key: 'night', label: 'Night / dim overlay', desc: 'Darken the map edges', type: 'toggle' },
        { key: 'playerGrid', label: 'Grid on player screen', desc: 'Show the battle grid to players', type: 'toggle' },
        { key: 'showCoords', label: 'Coordinates', desc: 'Column & row numbers (DM only)', type: 'toggle' },
        { key: 'snap', label: 'Snap to grid', desc: 'Tokens & items lock to cells', type: 'toggle' },
        { key: 'revealAroundPlayers', label: 'Dynamic light', desc: 'Auto-reveal fog around players, torches & lanterns', type: 'toggle' },
        { key: 'lightRadius', label: 'Light radius', desc: 'Cells revealed around each light', type: 'range', min: 2, max: 8 },
        { key: 'showPlayerStats', label: 'Party stats sidebar', desc: 'Show HP on the players\u2019 screen', type: 'toggle' },
        { key: 'statsScope', label: 'Stats shown', desc: 'Who appears in the sidebar', type: 'select', options: [['players', 'Players only'], ['all-visible', 'All visible w/ HP on']] },
        { key: 'showInventory', label: 'Inventory to players', desc: 'Show party inventory on their screen', type: 'toggle' },
        { key: 'showDiceToPlayers', label: 'Dice to players', desc: 'Reveal rolls on the player screen', type: 'toggle' },
        { key: 'hpAsNumbers', label: 'HP as numbers', desc: 'Show a number instead of a bar on tokens', type: 'toggle' },
        { key: 'nameOnHover', label: 'Names on hover', desc: 'Reveal a token\u2019s name & HP on hover', type: 'toggle' },
        { key: 'confirmDelete', label: 'Confirm deletions', desc: 'Ask before removing things', type: 'toggle' },
    ];
    (function buildSettings() {
        const grid = $('#settingsGrid');
        SETTINGS.forEach((s) => { const row = document.createElement('div'); row.className = 'set-row'; let control = ''; if (s.type === 'toggle') control = `<label class="switch"><input type="checkbox" data-set="${s.key}"><span class="track"></span></label>`; else if (s.type === 'select') control = `<select data-set="${s.key}" style="max-width:160px">${s.options.map((o) => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select>`; else if (s.type === 'range') control = `<input type="range" data-set="${s.key}" min="${s.min}" max="${s.max}" style="max-width:120px">`; row.innerHTML = `<span class="set-label">${s.label}<small>${s.desc}</small></span>${control}`; grid.appendChild(row); });
        grid.addEventListener('change', (e) => { const el = e.target.closest('[data-set]'); if (!el) return; const key = el.dataset.set; const val = el.type === 'checkbox' ? el.checked : (el.type === 'range' ? Number(el.value) : el.value); S.update((st) => { st.settings[key] = val; if ((key === 'revealAroundPlayers' && val) || (key === 'lightRadius' && st.settings.revealAroundPlayers)) autoLight(S.activeLocation(st), st.settings); }); });
        grid.addEventListener('input', (e) => { const el = e.target.closest('input[type="range"][data-set]'); if (!el) return; S.update((st) => { st.settings[el.dataset.set] = Number(el.value); if (st.settings.revealAroundPlayers) autoLight(S.activeLocation(st), st.settings); }); });
    })();
    function syncSettings() { const set = S.get().settings; $$('#settingsGrid [data-set]').forEach((el) => { const k = el.dataset.set; if (el.type === 'checkbox') el.checked = !!set[k]; else if (document.activeElement !== el) el.value = set[k]; }); }

    /* ======================================================================
       FIELD BINDINGS
       ====================================================================== */
    function setPath(o, path, v) { const k = path.split('.'); let x = o; for (let i = 0; i < k.length - 1; i++) x = x[k[i]]; x[k[k.length - 1]] = v; }
    $('#sceneText').addEventListener('input', () => S.update((st) => { S.activeLocation(st).scene = $('#sceneText').value; }));
    $('#revealScene').addEventListener('change', () => S.update((st) => { S.activeLocation(st).revealScene = $('#revealScene').checked; }));
    const GLOBAL_FIELDS = [['campaignTitle', 'campaign.title'], ['dmNotes', 'dmNotes'], ['bbName', 'bigbad.name'], ['bbCr', 'bigbad.cr'], ['bbAc', 'bigbad.ac'], ['bbTraits', 'bigbad.traits'], ['bbNotes', 'bigbad.notes']];
    const GLOBAL_NUM = [['bbHp', 'bigbad.hp'], ['bbMaxHp', 'bigbad.maxHp']];
    GLOBAL_FIELDS.forEach(([id, p]) => $('#' + id).addEventListener('input', () => S.update((st) => setPath(st, p, $('#' + id).value))));
    GLOBAL_NUM.forEach(([id, p]) => $('#' + id).addEventListener('input', () => S.update((st) => setPath(st, p, Number($('#' + id).value)))));
    $('#bbSize').addEventListener('change', () => S.update((st) => { st.bigbad.size = Number($('#bbSize').value); }));

    function syncFields() {
        const st = S.get(); const L = S.loc(); const set = st.settings;
        const g = (id, v) => { const el = $('#' + id); if (el && document.activeElement !== el) el.value = v == null ? '' : v; };
        g('campaignTitle', st.campaign.title); g('dmNotes', st.campaign.dmNotes);
        g('bbName', st.bigbad.name); g('bbCr', st.bigbad.cr); g('bbAc', st.bigbad.ac); g('bbHp', st.bigbad.hp); g('bbMaxHp', st.bigbad.maxHp); g('bbTraits', st.bigbad.traits); g('bbNotes', st.bigbad.notes);
        if (document.activeElement !== $('#bbSize')) $('#bbSize').value = st.bigbad.size || 1;
        g('sceneText', L.scene);
        if (document.activeElement !== $('#revealScene')) $('#revealScene').checked = !!L.revealScene;
        const ratio = st.bigbad.maxHp > 0 ? clamp(st.bigbad.hp / st.bigbad.maxHp, 0, 1) : 0; $('#bbHpBar').style.width = (ratio * 100) + '%'; $('#bbHpBar').style.background = hpColor(ratio);
        if (document.activeElement !== $('#locName')) $('#locName').value = L.name;
        $('#locCount').textContent = `Location ${st.activeLoc + 1} of ${st.locations.length}`;
        $('#gridToggle').checked = L.map.grid; $('#fogToggle').checked = L.map.fogEnabled;
        if (document.activeElement !== $('#dmFog')) $('#dmFog').value = Math.round((1 - set.dmFogOpacity) * 100);
        $('#blackoutBtn').classList.toggle('active', set.blackout);
        if (document.activeElement !== $('#wxIndoor')) $('#wxIndoor').checked = !!L.weatherIndoorSafe;
        if (document.activeElement !== $('#diceToPlayers')) $('#diceToPlayers').checked = !!set.showDiceToPlayers;
    }

    /* ======================================================================
       PLAYER SCREEN + IMPORT / EXPORT / RESET
       ====================================================================== */
    $('#openPlayer').addEventListener('click', () => { window.open('player.html', 'loregate_player', 'noopener'); toast('Drag that window to your second screen, then press F11'); });
    $('#openChars').addEventListener('click', () => { window.open('characters.html', 'loregate_characters'); });
    $('#exportBtn').addEventListener('click', () => { const blob = new Blob([JSON.stringify(S.get(), null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'loregate-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); URL.revokeObjectURL(a.href); });
    $('#importBtn').addEventListener('click', () => $('#importFile').click());
    $('#importFile').addEventListener('change', (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { S.replace(JSON.parse(reader.result)); toast('Campaign loaded'); } catch { toast('That file could not be read'); } }; reader.readAsText(file); e.target.value = ''; });
    $('#resetBtn').addEventListener('click', () => { if (confirm('Reset the entire campaign to a fresh table? This cannot be undone.')) { S.reset(); toast('A fresh table awaits'); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMode('select'); });

    /* ======================================================================
       RENDER PIPELINE
       ====================================================================== */
    function render() {
        applyPanelOrder();
        renderMap(); renderItems(); renderRoster(); renderBench(); renderInitiative(); renderBestiary(); renderInventory(); syncFields(); syncSettings();
        ambient.sync();
    }
    selectWeather(selectedWeather);
    S.subscribe(render);
    render();
    window.addEventListener('resize', () => { renderMap(); ambient.sync(); });
})();
