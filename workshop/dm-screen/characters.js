/* ==========================================================================
   Loregate — character sheets screen
   Full party sheets stored in state.characters. Editing HP / max HP syncs to
   any linked map token (token.charId === character.id) across all locations,
   so the map, roster and player sidebar all update live.
   ========================================================================== */
(function () {
    'use strict';

    const S = window.Loregate;
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => Array.from(document.querySelectorAll(s));
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
    function hpColor(r) { return r > 0.5 ? 'var(--emerald)' : r > 0.25 ? 'var(--gold)' : 'var(--blood)'; }
    function mod(v) { const m = Math.floor((Number(v) - 10) / 2); return (m >= 0 ? '+' : '') + m; }

    let selectedId = (S.get().characters[0] || {}).id || null;

    let toastTimer;
    function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 1800); }

    function current() { return S.get().characters.find((c) => c.id === selectedId); }
    function updChar(fn) { S.update((st) => { const ch = st.characters.find((c) => c.id === selectedId); if (ch) fn(ch, st); }); }
    function propagateHp(ch, st) { st.locations.forEach((l) => l.tokens.forEach((t) => { if (t.charId === ch.id) { t.hp = ch.hp; t.maxHp = ch.maxHp; } })); }

    /* ---- Field bindings ---- */
    const TEXT = [['cName', 'name'], ['cColor', 'color'], ['cClass', 'cls'], ['cRace', 'race'], ['cBackground', 'background'], ['cSkills', 'skills'], ['cMagic', 'magic'], ['cLore', 'lore'], ['cInventory', 'inventory'], ['cNotes', 'notes']];
    const NUM = [['cLevel', 'level'], ['cAc', 'ac']];
    const ABIL = [['cStr', 'str'], ['cDex', 'dex'], ['cCon', 'con'], ['cInt', 'int'], ['cWis', 'wis'], ['cCha', 'cha']];

    TEXT.forEach(([id, key]) => $('#' + id).addEventListener('input', () => updChar((ch) => { ch[key] = $('#' + id).value; })));
    NUM.forEach(([id, key]) => $('#' + id).addEventListener('input', () => updChar((ch) => { ch[key] = Number($('#' + id).value) || 0; })));
    ABIL.forEach(([id, key]) => $('#' + id).addEventListener('input', () => updChar((ch) => { ch.abilities[key] = Number($('#' + id).value) || 0; })));
    $('#cHp').addEventListener('input', () => updChar((ch, st) => { ch.hp = Number($('#cHp').value) || 0; propagateHp(ch, st); }));
    $('#cMaxHp').addEventListener('input', () => updChar((ch, st) => { ch.maxHp = Number($('#cMaxHp').value) || 0; propagateHp(ch, st); }));

    $('#cLink').addEventListener('change', (e) => {
        const val = e.target.value;
        S.update((st) => {
            // one token per character: clear old link first
            st.locations.forEach((l) => l.tokens.forEach((t) => { if (t.charId === selectedId) t.charId = null; }));
            if (val) {
                const [li, tid] = val.split('|');
                const loc = st.locations[Number(li)];
                const tok = loc && loc.tokens.find((t) => t.id === tid);
                const ch = st.characters.find((c) => c.id === selectedId);
                if (tok && ch) { tok.charId = ch.id; tok.hp = ch.hp; tok.maxHp = ch.maxHp; tok.name = tok.name || ch.name; }
            }
        });
        toast(val ? 'Token linked' : 'Token unlinked');
    });

    /* ---- Actions ---- */
    $('#addChar').addEventListener('click', () => {
        const ch = S.makeCharacter({ name: 'New Hero', color: '#a78bfa' });
        S.update((st) => st.characters.push(ch));
        selectedId = ch.id;
        render();
    });
    $('#deleteChar').addEventListener('click', () => {
        const ch = current(); if (!ch) return;
        if (S.get().settings.confirmDelete && !confirm('Delete “' + ch.name + '”? (linked tokens stay on the map)')) return;
        S.update((st) => { st.locations.forEach((l) => l.tokens.forEach((t) => { if (t.charId === ch.id) t.charId = null; })); st.characters = st.characters.filter((c) => c.id !== ch.id); });
        selectedId = (S.get().characters[0] || {}).id || null;
        render();
    });
    $('#exportChars').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(S.get().characters, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'loregate-characters-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); URL.revokeObjectURL(a.href);
    });
    $('#importChars').addEventListener('click', () => $('#importCharsFile').click());
    $('#importCharsFile').addEventListener('change', (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const arr = JSON.parse(reader.result); if (!Array.isArray(arr)) throw 0;
                S.update((st) => { arr.forEach((c) => { c.id = 'char-' + Math.random().toString(36).slice(2, 9); st.characters.push(c); }); });
                toast(arr.length + ' character(s) imported');
            } catch { toast('That file is not a character list'); }
        };
        reader.readAsText(file); e.target.value = '';
    });

    /* ---- Render ---- */
    function renderList() {
        const st = S.get(); const wrap = $('#charList');
        $('#charEmpty').style.display = st.characters.length ? 'none' : 'block';
        wrap.innerHTML = '';
        st.characters.forEach((c) => {
            const card = document.createElement('div');
            card.className = 'char-card' + (c.id === selectedId ? ' active' : '');
            card.style.borderLeftColor = c.color;
            card.innerHTML = `<div class="char-avatar" style="background:${c.color}">${(c.name || '?').slice(0, 2).toUpperCase()}</div>
                <div class="char-card-main"><div class="char-card-name">${escapeHtml(c.name)}</div>
                <div class="char-card-meta">Lv ${c.level} ${escapeHtml(c.race)} ${escapeHtml(c.cls)} · ${c.hp}/${c.maxHp} HP</div></div>`;
            card.addEventListener('click', () => { selectedId = c.id; render(); });
            wrap.appendChild(card);
        });
    }

    function renderLinkOptions(ch) {
        const st = S.get(); const sel = $('#cLink');
        let cur = '';
        let html = '<option value="">— not linked —</option>';
        st.locations.forEach((l, li) => {
            l.tokens.forEach((t) => {
                const val = li + '|' + t.id;
                if (t.charId === ch.id) cur = val;
                html += `<option value="${val}">${escapeHtml(t.name)} — ${escapeHtml(l.name)}${t.staged ? ' (bench)' : ''}</option>`;
            });
        });
        sel.innerHTML = html;
        if (document.activeElement !== sel) sel.value = cur;
    }

    function syncEditor() {
        const ch = current();
        const form = $('#charEditor'); const empty = $('#editorEmpty');
        if (!ch) { form.hidden = true; empty.style.display = 'block'; return; }
        form.hidden = false; empty.style.display = 'none';
        const setVal = (id, v) => { const el = $('#' + id); if (el && document.activeElement !== el) el.value = v == null ? '' : v; };
        TEXT.forEach(([id, key]) => setVal(id, ch[key]));
        NUM.forEach(([id, key]) => setVal(id, ch[key]));
        ABIL.forEach(([id, key]) => setVal(id, ch.abilities[key]));
        setVal('cHp', ch.hp); setVal('cMaxHp', ch.maxHp);
        ABIL.forEach(([id, key]) => { const m = $('#m' + id.slice(1)); if (m) m.textContent = mod(ch.abilities[key]); });
        const ratio = ch.maxHp > 0 ? clamp(ch.hp / ch.maxHp, 0, 1) : 0;
        $('#cHpBar').style.width = (ratio * 100) + '%'; $('#cHpBar').style.background = hpColor(ratio);
        renderLinkOptions(ch);
    }

    function render() { renderList(); syncEditor(); }

    S.subscribe(render);
    render();
})();
