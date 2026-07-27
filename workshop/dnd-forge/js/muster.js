/* =====================================================================
 * D&D Forge — DM Muster
 * Ingests player "muster codes"/links and shows the whole party, flagging
 * anyone who didn't build under the DM's Charter (by curse fingerprint).
 * ===================================================================== */
(function () {
    'use strict';
    const D = window.DND;
    const $ = (id) => document.getElementById(id);
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
    const signed = (n) => (n >= 0 ? '+' : '') + n;
    const mod = (v) => Math.floor((v - 10) / 2);
    const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

    // Must match app.js exactly.
    function hashStr(s) { let h = 5381; for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) + s.charCodeAt(i); h |= 0; } return h >>> 0; }
    function charterCurse(ch) {
        if (!ch) return 0;
        const canon = JSON.stringify({ e: ch.edition || '', lm: ch.levelMode || 'any', lv: ch.level || 20,
            m: (ch.methods || []).slice().sort(), mt: ch.maxAbilityTotal || 0, ms: ch.maxAbilityScore || 0,
            mw: ch.maxWeapons || 0, msp: ch.maxSpells || 0,
            br: (ch.bannedRaces || []).slice().sort(), bc: (ch.bannedClasses || []).slice().sort(), n: ch.note || '' });
        return hashStr(canon) % 100000;
    }
    const curseStr = (n) => 'CURSE #' + String(n).padStart(5, '0');

    function decode(b64) { return JSON.parse(decodeURIComponent(escape(atob(b64)))); }
    function extract(line) {
        line = line.trim(); if (!line) return null;
        let m;
        if ((m = line.match(/[#&]c=([^\s&#]+)/))) return { type: 'char', code: m[1] };
        if ((m = line.match(/[#&]charter=([^\s&#]+)/))) return { type: 'charter', code: m[1] };
        return { type: 'char', code: line }; // assume raw base64 character code
    }

    let expectedCurse = null;
    function toast(msg, danger) {
        const el = document.createElement('div'); el.className = 'toast'; if (danger) el.style.borderColor = 'var(--danger)';
        el.textContent = msg; $('toastWrap').appendChild(el); setTimeout(() => el.remove(), 3000);
    }

    // ---- DM charter link → expected curse ----
    $('charterInput').addEventListener('input', () => {
        const v = $('charterInput').value.trim();
        const info = $('charterInfo');
        if (!v) { expectedCurse = null; info.textContent = ''; return; }
        try {
            const ex = extract(v);
            const payload = decode(ex.code);
            const ch = payload.charter || payload;
            expectedCurse = charterCurse(ch);
            info.innerHTML = `✅ Charter recognised — <b>${curseStr(expectedCurse)}</b>. Characters not bound to it will be flagged.`;
            info.style.color = 'var(--green)';
        } catch (e) { expectedCurse = null; info.textContent = '⚠️ Could not read that Charter link.'; info.style.color = 'var(--danger)'; }
    });

    function charOf(state) {
        // Prefer the stored summary; fall back to raw ids.
        if (state.summary) return state.summary;
        const cls = D.classes.find(c => c.id === state.classId);
        const race = D.races.find(r => r.id === state.raceId);
        return {
            name: (state.identity && state.identity.name) || 'Unnamed Hero',
            portrait: (state.identity && state.identity.portrait) || '🧝',
            race: race ? race.name : '', cls: cls ? cls.name : '', level: state.level || 1,
            alignment: state.identity && state.identity.alignment, scores: null, ac: '—', hp: '—', prof: 0, curse: state.charterCurse
        };
    }
    function curseOf(state) {
        if (state.charterCurse != null) return state.charterCurse;
        if (state.charter && state.charter.active) return charterCurse(state.charter);
        return null;
    }

    function render() {
        const board = $('board'); board.innerHTML = '';
        const lines = $('codesInput').value.split('\n').map(l => l.trim()).filter(Boolean);
        let ok = 0;
        lines.forEach(line => {
            const ex = extract(line); if (!ex || ex.type !== 'char') return;
            let state;
            try { state = decode(ex.code); } catch (e) {
                board.insertAdjacentHTML('beforeend', `<div class="pc-card mismatch"><div class="pc-top"><span class="pc-portrait">❓</span><div><div class="pc-name">Unreadable code</div><div class="pc-sub">${esc(line.slice(0, 40))}…</div></div></div></div>`);
                return;
            }
            ok++;
            const c = charOf(state);
            const curse = curseOf(state);
            let badge = '';
            if (expectedCurse != null) {
                if (curse === expectedCurse) badge = `<span class="pc-ok">✔ Charter-bound</span>`;
                else badge = `<span class="pc-warn">⚠ Not your Charter${curse != null ? ' (' + curseStr(curse) + ')' : ' (unbound)'}</span>`;
            } else if (curse != null) {
                badge = `<span class="pc-ok">🔒 ${curseStr(curse)}</span>`;
            }
            const mismatch = expectedCurse != null && curse !== expectedCurse;
            const sub = [c.race, c.cls ? 'Lv ' + c.level + ' ' + c.cls : '', c.subclass].filter(Boolean).join(' · ');
            const scores = c.scores;
            board.insertAdjacentHTML('beforeend', `
                <div class="pc-card ${mismatch ? 'mismatch' : ''}">
                    <div class="pc-top">
                        <span class="pc-portrait">${esc(c.portrait)}</span>
                        <div><div class="pc-name">${esc(c.name)}</div><div class="pc-sub">${esc(sub || 'Unfinished hero')}</div></div>
                        ${badge}
                    </div>
                    <div class="pc-stats">
                        <div class="pc-stat"><div class="n">${c.ac ?? '—'}</div><div class="l">AC</div></div>
                        <div class="pc-stat"><div class="n">${c.cur != null ? c.cur + '/' + c.hp : (c.hp ?? '—')}</div><div class="l">HP</div></div>
                        <div class="pc-stat"><div class="n">${c.prof != null ? signed(c.prof) : '—'}</div><div class="l">Prof</div></div>
                    </div>
                    ${scores ? `<div class="pc-abils">${['str', 'dex', 'con', 'int', 'wis', 'cha'].map(a => `<span class="ci">${cap(a)} ${scores[a]} (${signed(mod(scores[a]))})</span>`).join('')}</div>` : ''}
                    <div class="pc-sub" style="margin-top:8px">${esc(c.alignment || '')}${c.background ? ' · ' + esc(c.background) : ''}${c.edition ? ' · ' + esc(c.edition) : ''}${c.saveDC ? ' · Spell DC ' + c.saveDC : ''}</div>
                </div>`);
        });
        $('partyCount').textContent = ok ? ok + ' hero' + (ok > 1 ? 'es' : '') + ' mustered' : '';
        if (!ok) board.innerHTML = `<div class="empty" style="grid-column:1/-1;text-align:center;color:var(--ink-dim)">Paste player codes above and press “Assemble party”.</div>`;
    }

    $('assembleBtn').addEventListener('click', render);
    $('clearBtn').addEventListener('click', () => { $('codesInput').value = ''; render(); });

    // theme from the forge, if any
    try { const t = localStorage.getItem('dndforge:theme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) {}
    render();
})();
