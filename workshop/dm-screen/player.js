/* ==========================================================================
   Loregate — player screen renderer (read-only mirror of the DM's table) · v3
   ========================================================================== */
(function () {
    'use strict';

    const S = window.Loregate;
    const TERRAIN = S.TERRAIN;
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => Array.from(document.querySelectorAll(s));
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const FLICKER = new Set(['torch', 'campfire', 'portal', 'lantern', 'stove']);
    const INDOOR = new Set(['wall', 'wood', 'plank', 'stone', 'cobble', 'rug']);
    function hpColor(ratio) { return ratio > 0.5 ? 'var(--emerald)' : ratio > 0.25 ? 'var(--gold)' : 'var(--blood)'; }
    function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

    const mapSurface = $('#mapSurface');
    const terrainLayer = $('#terrainLayer');
    const mapGrid = $('#mapGrid');
    const itemLayer = $('#itemLayer');
    const tokenLayer = $('#tokenLayer');
    const fogLayer = $('#fogLayer');
    const nightVeil = $('#nightVeil');
    const fxLayer = $('#fxLayer');
    const drawCanvas = $('#drawCanvas');
    const dctx = drawCanvas.getContext('2d');
    const mapFrame = $('#mapFrame');
    let lastPingT = 0, lastRollT = 0;

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
    const ambient = window.LoregateAmbient.init(
        $('#ambientCanvas'),
        weatherModel,
        () => S.get().settings.animations
    );

    function renderDrawings() {
        const L = S.loc(); const rect = mapFrame.getBoundingClientRect();
        const cw = Math.max(1, Math.round(rect.width)), ch = Math.max(1, Math.round(rect.height));
        if (drawCanvas.width !== cw || drawCanvas.height !== ch) { drawCanvas.width = cw; drawCanvas.height = ch; }
        dctx.clearRect(0, 0, cw, ch);
        S.drawStrokes(dctx, L.drawings, cw, ch);
    }
    function renderLaser() {
        const L = S.loc(); let dot = fxLayer.querySelector('.laser-dot');
        if (L.laser) { if (!dot) { dot = document.createElement('div'); dot.className = 'laser-dot'; fxLayer.appendChild(dot); } dot.style.left = (L.laser.x * 100) + '%'; dot.style.top = (L.laser.y * 100) + '%'; }
        else if (dot) dot.remove();
    }

    function showDice(roll) {
        const pop = $('#dicePopup');
        const kind = roll.crit ? 'crit' : roll.fumble ? 'fumble' : '';
        pop.className = 'dice-popup show ' + kind;
        pop.innerHTML = `<div class="dp-die">🎲</div>
            <div class="dp-total">${roll.total}</div>
            <div class="dp-label">${escapeHtml(roll.label)} · [${roll.rolls.join(', ')}]${roll.crit ? ' · CRIT!' : roll.fumble ? ' · fumble' : ''}</div>`;
        clearTimeout(pop._t);
        pop._t = setTimeout(() => pop.classList.remove('show'), 3600);
    }

    function render() {
        const st = S.get();
        const L = S.loc();
        const set = st.settings;
        const anim = set.animations;
        const { cols, rows, bg, imageUrl, grid, fogEnabled } = L.map;

        document.body.classList.toggle('no-anim', !anim);

        // blackout
        $('#blackout').classList.toggle('on', !!set.blackout);

        $('#title').textContent = st.campaign.title || 'Loregate';

        const banner = $('#sceneBanner');
        if (L.revealScene && (L.scene || '').trim()) { banner.textContent = L.scene; banner.classList.remove('hidden'); }
        else banner.classList.add('hidden');

        const active = L.tokens.find((t) => t.id === st.turn.activeId && !t.hidden);
        const tb = $('#turnBanner');
        if (active) { tb.classList.add('on'); $('#turnSwatch').style.background = active.color; $('#turnName').textContent = active.name; $('#turnRound').textContent = 'Round ' + st.turn.round; }
        else tb.classList.remove('on');

        const terr = TERRAIN[bg] || TERRAIN.stone;
        if (bg === 'image' && imageUrl) { mapSurface.style.background = '#05040a'; mapSurface.style.backgroundImage = `url("${imageUrl}")`; }
        else { mapSurface.style.background = terr.bg; }
        mapSurface.classList.toggle('anim-water', anim && terr.animated === 'water');
        mapSurface.classList.toggle('anim-lava', anim && terr.animated === 'lava');

        terrainLayer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        terrainLayer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        if (terrainLayer.childElementCount !== cols * rows) {
            terrainLayer.innerHTML = '';
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div'); cell.className = 'terrain-cell'; cell.dataset.key = c + ',' + r; terrainLayer.appendChild(cell);
            }
        }
        $$('#terrainLayer .terrain-cell').forEach((cell) => {
            const id = L.terrain[cell.dataset.key];
            if (id && TERRAIN[id]) {
                cell.style.background = TERRAIN[id].bg; cell.style.opacity = '1';
                cell.classList.toggle('anim-water', anim && TERRAIN[id].animated === 'water');
                cell.classList.toggle('anim-lava', anim && TERRAIN[id].animated === 'lava');
            } else { cell.style.background = ''; cell.style.opacity = '0'; }
        });

        mapGrid.classList.toggle('on', !!grid && set.playerGrid);
        mapGrid.style.backgroundSize = `${100 / cols}% ${100 / rows}%`;

        nightVeil.classList.toggle('on', set.night);

        fogLayer.style.display = fogEnabled ? 'grid' : 'none';
        fogLayer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        fogLayer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        const revealed = new Set(L.fog);
        if (fogLayer.childElementCount !== cols * rows) {
            fogLayer.innerHTML = '';
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div'); cell.className = 'fog-cell'; cell.dataset.key = c + ',' + r; fogLayer.appendChild(cell);
            }
        }
        $$('#fogLayer .fog-cell').forEach((cell) => cell.classList.toggle('revealed', revealed.has(cell.dataset.key)));

        itemLayer.innerHTML = '';
        const cellW = 100 / cols;
        L.items.filter((i) => !i.hidden).forEach((it) => {
            const el = document.createElement('div');
            el.className = 'map-item' + (FLICKER.has(it.type) && anim ? ' flicker' : '');
            el.style.left = ((it.c + 0.5) / cols * 100) + '%';
            el.style.top = ((it.r + 0.5) / rows * 100) + '%';
            el.style.width = (cellW * (it.size || 1)) + '%';
            el.style.height = (100 / rows * (it.size || 1)) + '%';
            el.innerHTML = `<span class="item-emoji" style="font-size:calc(${(it.size || 1)} * clamp(.7rem,2vw,1.3rem))">${it.icon}</span>`;
            itemLayer.appendChild(el);
        });

        tokenLayer.innerHTML = '';
        L.tokens.filter((t) => !t.hidden && !t.staged).forEach((t) => {
            const el = document.createElement('div');
            const dead = t.maxHp > 0 && t.hp <= 0;
            el.className = 'token kind-' + t.kind + (dead ? ' is-dead' : '') + (st.turn.activeId === t.id ? ' is-active' : '');
            el.style.left = ((t.c + 0.5) / cols * 100) + '%';
            el.style.top = ((t.r + 0.5) / rows * 100) + '%';
            el.style.width = (cellW * 0.92 * (t.size || 1)) + '%';
            el.style.height = (100 / rows * 0.92 * (t.size || 1)) + '%';
            el.style.background = t.color;
            let hp = '';
            if (t.showHp && t.maxHp > 0) {
                const ratio = clamp(t.hp / t.maxHp, 0, 1);
                hp = set.hpAsNumbers ? `<span class="token-hpnum">${t.hp}</span>`
                    : `<span class="token-hp"><span style="width:${ratio * 100}%;background:${hpColor(ratio)}"></span></span>`;
            }
            el.innerHTML = `<span class="token-init">${(t.name || '?').slice(0, 2).toUpperCase()}</span>` + hp;
            tokenLayer.appendChild(el);
        });

        if (L.ping && L.ping.t !== lastPingT && Date.now() - L.ping.t < 4000) {
            lastPingT = L.ping.t;
            const ping = document.createElement('div');
            ping.className = 'ping';
            ping.style.left = ((L.ping.c + 0.5) / cols * 100) + '%';
            ping.style.top = ((L.ping.r + 0.5) / rows * 100) + '%';
            fxLayer.appendChild(ping);
            setTimeout(() => ping.remove(), 3200);
        }
        renderLaser();
        renderDrawings();

        // dice popup
        if (st.lastRoll && st.lastRoll.t !== lastRollT && Date.now() - st.lastRoll.t < 6000) {
            lastRollT = st.lastRoll.t;
            showDice(st.lastRoll);
        }

        // party stats sidebar
        const party = $('#partyPanel');
        let members = [];
        if (set.showPlayerStats) {
            members = set.statsScope === 'all-visible'
                ? L.tokens.filter((t) => !t.hidden && !t.staged && t.showHp)
                : L.tokens.filter((t) => t.kind === 'player' && !t.hidden && !t.staged);
        }
        party.classList.toggle('on', set.showPlayerStats && members.length > 0);
        $('#partyList').innerHTML = members.map((t) => {
            const ratio = t.maxHp > 0 ? clamp(t.hp / t.maxHp, 0, 1) : 0;
            const conds = (t.conditions || []).map((c) => `<span>${c}</span>`).join('');
            return `<div class="party-row">
                <div class="party-swatch" style="background:${t.color}">${(t.name || '?').slice(0, 2).toUpperCase()}</div>
                <div class="party-main">
                    <div class="party-name">${escapeHtml(t.name)}<span class="hpnum">${t.maxHp > 0 ? t.hp + '/' + t.maxHp : ''}</span></div>
                    ${t.maxHp > 0 ? `<div class="party-hp"><span style="width:${ratio * 100}%;background:${hpColor(ratio)}"></span></div>` : ''}
                    ${conds ? `<div class="party-cond">${conds}</div>` : ''}
                </div>
            </div>`;
        }).join('');

        const invPanel = $('#inventoryPanel');
        invPanel.classList.toggle('on', set.showInventory && st.inventory.length > 0);
        $('#inventoryList').innerHTML = st.inventory.map((it) =>
            `<div class="inv-line"><span>${escapeHtml(it.name)}</span><span class="q">×${it.qty}</span></div>`).join('');

        const empty = L.tokens.length === 0 && L.items.length === 0 && !L.fog.length;
        $('#idleHint').classList.toggle('on', empty && !set.blackout);

        ambient.sync();
    }

    S.subscribe(render);
    render();
    window.addEventListener('resize', render);
})();
