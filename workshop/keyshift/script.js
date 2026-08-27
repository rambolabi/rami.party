/* ==========================================================================
   Keyshift — translate text between keyboard layouts
   --------------------------------------------------------------------------
   A remote console that forwards scancodes (Proxmox noVNC, iDRAC, iLO, VMware
   Remote Console, plain KVM-over-IP) does not receive your characters. It
   receives the *positions* you pressed and re-reads them with its own layout.

   So the fix is a position round-trip:

       character -> key position on layout X -> character on layout Y

   Both panes below run that same round-trip in opposite directions, which is
   why one tool covers "what should I type" and "what did that garbage mean".
   ========================================================================== */

(function () {
    'use strict';

    var ROWS = window.KEYSHIFT_ROWS;
    var ROW_OFFSET = window.KEYSHIFT_ROW_OFFSET;
    var MODS = window.KEYSHIFT_MODS;
    var LAYOUTS = window.KEYSHIFT_LAYOUTS;

    var K_THEME = 'keyshift:theme';
    var K_REMOTE = 'keyshift:remote';
    var K_LOCAL = 'keyshift:local';

    var THEMES = [
        { id: 'aurora', name: 'Aurora' },
        { id: 'midnight', name: 'Midnight' },
        { id: 'terminal', name: 'Terminal' },
        { id: 'ember', name: 'Ember' },
        { id: 'paper', name: 'Paper' }
    ];

    var KEY_ORDER = ROWS.reduce(function (all, row) { return all.concat(row); }, []).concat(['SPCE']);
    var PASS_THROUGH = '\n\r\t';

    /* ---------------------------------------------------------------- model */

    function indexLayout(layout) {
        var c2k = Object.create(null);
        var k2c = Object.create(null);

        // Mod-major so the cheapest keystroke wins when a character sits in
        // two places, e.g. a plain key beats the same glyph behind AltGr.
        for (var mod = 0; mod < 4; mod++) {
            for (var i = 0; i < KEY_ORDER.length; i++) {
                var key = KEY_ORDER[i];
                var defs = layout.keys[key];
                if (!defs) continue;
                var ch = defs[mod];
                if (!ch) continue;
                k2c[key + ':' + mod] = ch;
                if (!(ch in c2k)) c2k[ch] = { key: key, mod: mod };
            }
        }
        return { layout: layout, c2k: c2k, k2c: k2c };
    }

    var INDEX = {};
    LAYOUTS.forEach(function (l) { INDEX[l.id] = indexLayout(l); });

    /* Read `text` as if produced on `from`, then render those key presses on `to`. */
    function analyse(text, from, to) {
        var chars = Array.from(text);
        var out = [];

        for (var i = 0; i < chars.length; i++) {
            var ch = chars[i];

            if (PASS_THROUGH.indexOf(ch) !== -1) {
                out.push({ ch: ch, out: ch, state: 'pass' });
                continue;
            }

            var pos = from.c2k[ch];
            if (!pos) {
                out.push({ ch: ch, out: ch, state: 'no-source' });
                continue;
            }

            var typed = to.k2c[pos.key + ':' + pos.mod];
            if (!typed) {
                out.push({ ch: ch, out: ch, state: 'no-target', key: pos.key, mod: pos.mod });
                continue;
            }

            out.push({
                ch: ch,
                out: typed,
                state: 'ok',
                key: pos.key,
                mod: pos.mod,
                dead: to.layout.dead.indexOf(typed) !== -1
            });
        }
        return out;
    }

    function joinOut(rows) {
        return rows.map(function (r) { return r.out; }).join('');
    }

    /* ------------------------------------------------------------------- ui */

    var el = {};
    ['remote-layout', 'local-layout', 'remote-text', 'local-text', 'swap', 'remote-note', 'local-note',
        'summary', 'warnings', 'recipe-body', 'recipe-count', 'kb-remote', 'kb-local',
        'kb-remote-name', 'kb-local-name', 'theme-btn', 'theme-name', 'theme-menu', 'examples']
        .forEach(function (id) {
            el[id] = document.getElementById(id);
        });

    var remoteIdx, localIdx;
    var syncing = false;

    function fillSelect(select, value) {
        select.innerHTML = '';
        LAYOUTS.forEach(function (l) {
            var opt = document.createElement('option');
            opt.value = l.id;
            opt.textContent = l.name;
            select.appendChild(opt);
        });
        select.value = value;
    }

    function readLayouts() {
        remoteIdx = INDEX[el['remote-layout'].value];
        localIdx = INDEX[el['local-layout'].value];
        el['remote-note'].textContent = remoteIdx.layout.note;
        el['local-note'].textContent = localIdx.layout.note;
        el['kb-remote-name'].textContent = remoteIdx.layout.name;
        el['kb-local-name'].textContent = localIdx.layout.name;
        try {
            localStorage.setItem(K_REMOTE, remoteIdx.layout.id);
            localStorage.setItem(K_LOCAL, localIdx.layout.id);
        } catch (e) { /* private mode */ }
    }

    /* The remote pane is the source of truth: it holds the text that should
       exist on the far end, and everything else is derived from it. */
    function fromRemote() {
        var rows = analyse(el['remote-text'].value, remoteIdx, localIdx);
        if (!syncing) el['local-text'].value = joinOut(rows);
        report(rows);
    }

    function fromLocal() {
        var rows = analyse(el['local-text'].value, localIdx, remoteIdx);
        el['remote-text'].value = joinOut(rows);
        syncing = true;
        fromRemote();
        syncing = false;
    }

    function chip(kind, label) {
        return '<span class="chip-stat ' + kind + '">' + label + '</span>';
    }

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    function show(ch) {
        if (ch === ' ') return '␣';
        if (ch === '\n') return '⏎';
        if (ch === '\t') return '⇥';
        return esc(ch);
    }

    function report(rows) {
        var typed = rows.filter(function (r) { return r.state !== 'pass'; });
        var blocked = rows.filter(function (r) { return r.state === 'no-source' || r.state === 'no-target'; });
        var altgr = rows.filter(function (r) { return r.state === 'ok' && r.mod >= 2; });
        var dead = rows.filter(function (r) { return r.state === 'ok' && r.dead; });

        el.summary.innerHTML = typed.length
            ? chip('ok', typed.length + ' character' + (typed.length === 1 ? '' : 's'))
            + (altgr.length ? chip('warn', altgr.length + ' need AltGr') : '')
            + (dead.length ? chip('warn', dead.length + ' dead key' + (dead.length === 1 ? '' : 's')) : '')
            + (blocked.length ? chip('bad', blocked.length + ' cannot be typed') : chip('ok', 'all reachable'))
            : '';

        renderWarnings(blocked, dead, altgr);
        renderRecipe(rows);
        highlightKeys(rows);
    }

    function uniqueChars(rows) {
        var seen = Object.create(null);
        var list = [];
        rows.forEach(function (r) {
            if (seen[r.ch]) return;
            seen[r.ch] = true;
            list.push(r);
        });
        return list;
    }

    function renderWarnings(blocked, dead, altgr) {
        var html = '';

        uniqueChars(blocked).forEach(function (r) {
            var why;
            if (r.state === 'no-source') {
                why = '<strong>' + esc(remoteIdx.layout.short) + '</strong> has no key for this character, '
                    + 'so the remote machine can never print it from a keystroke.';
            } else if (!localIdx.layout.keys[r.key]) {
                why = 'Sits on the key between the left <kbd>Shift</kbd> and the letter row, which a 104 key '
                    + 'ANSI <strong>' + esc(localIdx.layout.short) + '</strong> board does not physically have.';
            } else {
                why = 'Sits on ' + keyLabel(r.key, r.mod) + '. That key exists on your board, but <strong>'
                    + esc(localIdx.layout.short) + '</strong> puts nothing on its '
                    + (MODS[r.mod] || 'base') + ' layer, so the combination is never sent.';
            }
            html += '<li class="bad"><span class="w-char">' + show(r.ch) + '</span><div>'
                + why + '<span class="w-fix">' + workaround(r.ch) + '</span></div></li>';
        });

        uniqueChars(dead).forEach(function (r) {
            html += '<li class="warn"><span class="w-char">' + show(r.ch) + '</span><div>You press <code>'
                + show(r.out) + '</code>, a dead key on <strong>' + esc(localIdx.layout.short)
                + '</strong>. A console that forwards raw key positions is unaffected, but anywhere your own '
                + 'layout composes first (typing the text out by hand, or a paste that is replayed as '
                + 'keystrokes) it will print nothing and quietly accent the next letter instead. '
                + 'Follow it with <kbd>Space</kbd> to force the bare character.</div></li>';
        });

        if (altgr.length) {
            var keys = uniqueChars(altgr).map(function (r) {
                return '<code>' + show(r.ch) + '</code> = ' + keyLabel(r.key, r.mod, true);
            }).join(', ');
            html += '<li class="warn"><span class="w-char">⎇</span><div>Needs the right-hand <kbd>AltGr</kbd> key: '
                + keys + '. On a Mac keyboard or over some web consoles, <kbd>Ctrl</kbd> + <kbd>Alt</kbd> is the stand-in.</div></li>';
        }

        if (!html) {
            el.warnings.innerHTML = '<li class="ok"><span class="w-char">✓</span><div>Every character survives the trip. '
                + 'Paste the right-hand text into the console as-is.</div></li>';
            return;
        }
        el.warnings.innerHTML = html;
    }

    function workaround(ch) {
        var code = ch.codePointAt(0);
        return 'Ways in: the console clipboard or “send text” button if it has one; '
            + '<kbd>Alt</kbd> + <code>' + code + '</code> on the numeric keypad on a Windows guest; '
            + '<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>U</kbd> then <code>' + code.toString(16) + '</code> on a Linux desktop; '
            + 'or set the guest layout to match your own keyboard.';
    }

    function keyLabel(key, mod, withGlyph) {
        var base = localIdx.k2c[key + ':0'];
        var name = base ? '“' + show(base) + '” key' : key;
        var prefix = MODS[mod] ? MODS[mod] + ' + ' : '';
        var out = prefix + name;
        if (withGlyph) {
            var typed = localIdx.k2c[key + ':' + mod];
            if (typed) out += ' (prints <code>' + show(typed) + '</code> for you)';
        }
        return out;
    }

    function renderRecipe(rows) {
        var steps = rows.filter(function (r) { return r.state !== 'pass'; });
        el['recipe-count'].textContent = steps.length ? steps.length + ' keystrokes' : 'nothing yet';

        if (!steps.length) {
            el['recipe-body'].innerHTML = '<tr><td colspan="4" class="empty">Type something on the left to see the keystrokes.</td></tr>';
            return;
        }

        var html = steps.slice(0, 400).map(function (r, i) {
            var cls = r.state === 'ok' ? (r.dead ? 'row-warn' : (r.mod >= 2 ? 'row-warn' : '')) : 'row-bad';
            var press = r.state === 'ok'
                ? (MODS[r.mod] ? '<kbd>' + MODS[r.mod].replace(/ \+ /g, '</kbd> + <kbd>') + '</kbd> + ' : '')
                + '<kbd>' + show(localIdx.k2c[r.key + ':0'] || r.key) + '</kbd>'
                : '<span class="none">not possible</span>';
            var note = r.state === 'ok'
                ? (r.dead ? 'dead key, then Space' : (r.mod >= 2 ? 'AltGr layer' : ''))
                : (r.state === 'no-source' ? 'not on ' + esc(remoteIdx.layout.short) : 'key absent on ' + esc(localIdx.layout.short));
            return '<tr class="' + cls + '" data-key="' + (r.key || '') + '">'
                + '<td class="n">' + (i + 1) + '</td>'
                + '<td class="glyph">' + show(r.ch) + '</td>'
                + '<td>' + press + '</td>'
                + '<td class="note">' + note + '</td></tr>';
        }).join('');

        if (steps.length > 400) {
            html += '<tr><td colspan="4" class="empty">…and ' + (steps.length - 400) + ' more.</td></tr>';
        }
        el['recipe-body'].innerHTML = html;
    }

    /* ------------------------------------------------------------ keyboards */

    function renderKeyboard(host, idx) {
        host.innerHTML = '';
        ROWS.forEach(function (row, ri) {
            var r = document.createElement('div');
            r.className = 'krow';
            if (ROW_OFFSET[ri]) {
                var pad = document.createElement('span');
                pad.className = 'kpad';
                pad.style.flexGrow = String(ROW_OFFSET[ri]);
                r.appendChild(pad);
            }
            row.forEach(function (key) {
                var defs = idx.layout.keys[key];
                var k = document.createElement('span');
                k.className = 'kkey';
                k.dataset.key = key;
                if (!defs) {
                    k.classList.add('absent');
                    k.title = key + ' — this key does not exist on ' + idx.layout.short;
                    k.innerHTML = '<b>–</b>';
                } else {
                    k.title = key;
                    k.innerHTML = '<u>' + (defs[1] ? show(defs[1]) : '') + '</u>'
                        + '<b>' + show(defs[0] || '') + '</b>'
                        + '<i>' + (defs[2] ? show(defs[2]) : '') + '</i>';
                }
                r.appendChild(k);
            });
            host.appendChild(r);
        });
        var space = document.createElement('div');
        space.className = 'krow';
        space.innerHTML = '<span class="kkey kspace" data-key="SPCE"><b>space</b></span>';
        host.appendChild(space);
    }

    function highlightKeys(rows) {
        var used = Object.create(null);
        rows.forEach(function (r) { if (r.key) used[r.key] = true; });
        [el['kb-remote'], el['kb-local']].forEach(function (host) {
            host.querySelectorAll('.kkey').forEach(function (k) {
                k.classList.toggle('lit', !!used[k.dataset.key]);
            });
        });
    }

    /* ---------------------------------------------------------------- theme */

    function applyTheme(id) {
        var t = THEMES.filter(function (x) { return x.id === id; })[0] || THEMES[0];
        document.documentElement.setAttribute('data-theme', t.id);
        el['theme-name'].textContent = t.name;
        try { localStorage.setItem(K_THEME, t.id); } catch (e) { /* private mode */ }
    }

    function buildThemeMenu() {
        THEMES.forEach(function (t) {
            var b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('role', 'menuitem');
            b.textContent = t.name;
            b.addEventListener('click', function () {
                applyTheme(t.id);
                closeMenu();
            });
            el['theme-menu'].appendChild(b);
        });
    }

    function closeMenu() {
        el['theme-menu'].hidden = true;
        el['theme-btn'].setAttribute('aria-expanded', 'false');
    }

    /* ----------------------------------------------------------------- copy */

    function wireCopy() {
        document.querySelectorAll('[data-copy]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var target = document.getElementById(btn.dataset.copy);
                if (!target.value) return;
                var done = function () {
                    var old = btn.textContent;
                    btn.textContent = 'Copied';
                    btn.classList.add('done');
                    setTimeout(function () { btn.textContent = old; btn.classList.remove('done'); }, 1400);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(target.value).then(done, function () {
                        target.select();
                        document.execCommand('copy');
                        done();
                    });
                } else {
                    target.select();
                    document.execCommand('copy');
                    done();
                }
            });
        });
    }

    /* ----------------------------------------------------------------- boot */

    function stored(key, fallback) {
        try {
            var v = localStorage.getItem(key);
            return INDEX[v] ? v : fallback;
        } catch (e) { return fallback; }
    }

    function init() {
        fillSelect(el['remote-layout'], stored(K_REMOTE, 'be'));
        fillSelect(el['local-layout'], stored(K_LOCAL, 'us-intl'));

        buildThemeMenu();
        var savedTheme = 'aurora';
        try { savedTheme = localStorage.getItem(K_THEME) || 'aurora'; } catch (e) { /* private mode */ }
        applyTheme(savedTheme);

        el['theme-btn'].addEventListener('click', function () {
            var open = el['theme-menu'].hidden;
            el['theme-menu'].hidden = !open;
            el['theme-btn'].setAttribute('aria-expanded', String(open));
        });
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.menu')) closeMenu();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });

        function refresh() {
            readLayouts();
            renderKeyboard(el['kb-remote'], remoteIdx);
            renderKeyboard(el['kb-local'], localIdx);
            fromRemote();
        }

        el['remote-layout'].addEventListener('change', refresh);
        el['local-layout'].addEventListener('change', refresh);
        el.swap.addEventListener('click', function () {
            var a = el['remote-layout'].value;
            el['remote-layout'].value = el['local-layout'].value;
            el['local-layout'].value = a;
            refresh();
        });

        el['remote-text'].addEventListener('input', fromRemote);
        el['local-text'].addEventListener('input', fromLocal);

        el.examples.addEventListener('click', function (e) {
            var b = e.target.closest('button[data-ex]');
            if (!b) return;
            el['remote-text'].value = b.dataset.ex;
            fromRemote();
            el['remote-text'].focus();
        });

        el['recipe-body'].addEventListener('mouseover', function (e) {
            var tr = e.target.closest('tr[data-key]');
            if (!tr || !tr.dataset.key) return;
            [el['kb-remote'], el['kb-local']].forEach(function (host) {
                host.querySelectorAll('.kkey').forEach(function (k) {
                    k.classList.toggle('focus', k.dataset.key === tr.dataset.key);
                });
            });
        });

        wireCopy();
        refresh();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
