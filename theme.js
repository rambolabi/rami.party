/* ==========================================================================
   rami.party — theme conjuror
   --------------------------------------------------------------------------
   Applies the visitor's chosen theme before first paint (no flash), then
   builds an accessible theme picker. Load this in <head>, synchronously:

       <script src="/theme.js"></script>

   The palettes themselves live in theme.css as [data-theme="id"] blocks —
   keep RAMI_THEMES below in sync with them.
   ========================================================================== */

(function () {
    'use strict';

    var STORAGE_KEY = 'rami.theme';
    var AUTO = 'auto';

    var THEMES = [
        { id: 'arcana', name: 'Midnight Arcana', note: 'The house spell', emoji: '✨', mode: 'dark', swatch: ['#a855f7', '#ec4899', '#22d3ee'] },
        { id: 'graphite', name: 'Graphite', note: 'Professional · dark', emoji: '▨', mode: 'dark', swatch: ['#12151c', '#60a5fa', '#94a3b8'] },
        { id: 'daylight', name: 'Daylight', note: 'Professional · light', emoji: '☀', mode: 'light', swatch: ['#ffffff', '#2563eb', '#0ea5e9'] },
        { id: 'neon', name: 'Neon Circuit', note: 'Cyberpunk arcade', emoji: '⚡', mode: 'dark', swatch: ['#ff2e88', '#b026ff', '#00fff0'] },
        { id: 'ember', name: 'Ember Forge', note: 'Molten firelight', emoji: '🔥', mode: 'dark', swatch: ['#ef4444', '#f97316', '#fbbf24'] },
        { id: 'grove', name: 'Deep Grove', note: 'Enchanted forest', emoji: '🌿', mode: 'dark', swatch: ['#34d399', '#a3e635', '#2dd4bf'] },
        { id: 'abyss', name: 'Abyssal Tide', note: 'Bioluminescent deep', emoji: '🌊', mode: 'dark', swatch: ['#05192a', '#38bdf8', '#2dd4bf'] },
        { id: 'terminal', name: 'Terminal', note: 'Phosphor & monospace', emoji: '🖥', mode: 'dark', swatch: ['#000000', '#22c55e', '#86efac'] },
        { id: 'parchment', name: 'Parchment', note: 'Candlelit library', emoji: '📜', mode: 'light', swatch: ['#faf3e2', '#8a5a2b', '#a97400'] },
        { id: 'blossom', name: 'Cherry Blossom', note: 'Soft pastel light', emoji: '🌸', mode: 'light', swatch: ['#fff8fb', '#ec4899', '#8b5cf6'] },
        { id: 'contrast', name: 'High Contrast', note: 'Maximum legibility', emoji: '◐', mode: 'dark', swatch: ['#000000', '#ffffff', '#ffd400'] },
    ];

    var IDS = THEMES.map(function (t) { return t.id; });
    var root = document.documentElement;

    function prefersLight() {
        return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
    }

    function stored() {
        try {
            var v = localStorage.getItem(STORAGE_KEY);
            return (v === AUTO || IDS.indexOf(v) !== -1) ? v : null;
        } catch (err) {
            return null;   // private mode / storage disabled
        }
    }

    function resolve(choice) {
        if (choice === AUTO || !choice) return prefersLight() ? 'daylight' : 'arcana';
        return choice;
    }

    var choice = stored() || AUTO;

    function apply(next, persist) {
        choice = (next === AUTO || IDS.indexOf(next) !== -1) ? next : AUTO;
        var active = resolve(choice);
        root.setAttribute('data-theme', active);
        if (persist) {
            try { localStorage.setItem(STORAGE_KEY, choice); } catch (err) { /* ignore */ }
        }
        syncMeta(active);
        document.dispatchEvent(new CustomEvent('rami:themechange', { detail: { choice: choice, theme: active } }));
    }

    function syncMeta(active) {
        if (!document.head) return;
        var colour = getComputedStyle(root).getPropertyValue('--meta-theme-color').trim();
        if (!colour) return;
        var meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'theme-color');
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', colour);
        void active;
    }

    /* Apply immediately so the first paint is already themed. */
    root.setAttribute('data-theme', resolve(choice));

    /* Follow the system when the visitor never picked a theme. */
    if (window.matchMedia) {
        var mq = window.matchMedia('(prefers-color-scheme: light)');
        var onSystemChange = function () { if (choice === AUTO) apply(AUTO, false); };
        if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
        else if (mq.addListener) mq.addListener(onSystemChange);
    }

    /* ---- Picker ---------------------------------------------------------- */
    function swatchStyle(colours) {
        return 'background: linear-gradient(135deg, ' + colours[0] + ' 0 33%, ' +
            colours[1] + ' 33% 66%, ' + colours[2] + ' 66% 100%);';
    }

    function buildPicker() {
        if (document.querySelector('.theme-fab')) return;

        var fab = document.createElement('button');
        fab.type = 'button';
        fab.className = 'theme-fab';
        fab.id = 'themeFab';
        fab.setAttribute('aria-label', 'Change the theme');
        fab.setAttribute('aria-expanded', 'false');
        fab.setAttribute('aria-controls', 'themePanel');
        fab.innerHTML = '<span aria-hidden="true">🎨</span>';

        var panel = document.createElement('div');
        panel.className = 'theme-panel';
        panel.id = 'themePanel';
        panel.hidden = true;

        var options = THEMES.map(function (t) {
            return '<li>' +
                '<button type="button" class="theme-option" role="radio" data-theme-id="' + t.id + '" aria-checked="false">' +
                '<span class="theme-swatch" aria-hidden="true" style="' + swatchStyle(t.swatch) + '"></span>' +
                '<span class="theme-option-text">' +
                '<span class="theme-option-name">' + t.emoji + ' ' + t.name + '</span>' +
                '<span class="theme-option-note">' + t.note + '</span>' +
                '</span></button></li>';
        }).join('');

        panel.innerHTML =
            '<div class="theme-panel-head"><h2 id="themePanelTitle">Choose your enchantment</h2>' +
            '<p>' + THEMES.length + ' + auto</p></div>' +
            '<ul class="theme-list" role="radiogroup" aria-labelledby="themePanelTitle">' +
            '<li><button type="button" class="theme-option" role="radio" data-theme-id="' + AUTO + '" aria-checked="false">' +
            '<span class="theme-swatch" aria-hidden="true" style="' + swatchStyle(['#0b0524', '#a855f7', '#ffffff']) + '"></span>' +
            '<span class="theme-option-text"><span class="theme-option-name">🪄 Auto</span>' +
            '<span class="theme-option-note">Follow my system</span></span></button></li>' +
            options +
            '</ul>' +
            '<p class="theme-panel-foot">Your choice is remembered on this device.</p>';

        document.body.appendChild(fab);
        document.body.appendChild(panel);

        var buttons = Array.prototype.slice.call(panel.querySelectorAll('.theme-option'));

        function mark() {
            buttons.forEach(function (b) {
                b.setAttribute('aria-checked', b.dataset.themeId === choice ? 'true' : 'false');
            });
        }

        var open = false;
        function setOpen(next) {
            open = next;
            fab.setAttribute('aria-expanded', String(next));
            if (next) {
                panel.hidden = false;
                requestAnimationFrame(function () { panel.classList.add('open'); });
                mark();
                var checked = panel.querySelector('[aria-checked="true"]') || buttons[0];
                if (checked) checked.focus();
            } else {
                panel.classList.remove('open');
                window.setTimeout(function () { if (!open) panel.hidden = true; }, 300);
            }
        }

        fab.addEventListener('click', function () { setOpen(!open); });

        buttons.forEach(function (b, i) {
            b.addEventListener('click', function () {
                apply(b.dataset.themeId, true);
                mark();
            });
            b.addEventListener('keydown', function (e) {
                var step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1
                    : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
                if (!step) return;
                e.preventDefault();
                var next = buttons[(i + step + buttons.length) % buttons.length];
                next.focus();
                apply(next.dataset.themeId, true);
                mark();
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && open) { setOpen(false); fab.focus(); }
        });
        document.addEventListener('click', function (e) {
            if (open && !panel.contains(e.target) && !fab.contains(e.target)) setOpen(false);
        });

        mark();
        syncMeta(resolve(choice));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildPicker);
    } else {
        buildPicker();
    }

    window.RamiTheme = {
        themes: THEMES,
        get: function () { return { choice: choice, theme: resolve(choice) }; },
        set: function (id) { apply(id, true); },
    };
})();
