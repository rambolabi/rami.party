/* ==========================================================================
   Tasks for unlocked computers — the three-way chooser.
   Deep-linkable: #screens, #bbq and #actions open their panel directly, so a
   link can point straight at the BBQ mailer or the action list.
   ========================================================================== */
(function () {
    'use strict';

    var tabs = Array.prototype.slice.call(document.querySelectorAll('.choice'));
    if (!tabs.length) return;

    var panels = {};
    tabs.forEach(function (t) {
        panels[t.dataset.panel] = document.getElementById('panel-' + t.dataset.panel);
    });

    function show(name, focus) {
        if (!panels[name]) return;
        tabs.forEach(function (t) {
            var on = t.dataset.panel === name;
            t.setAttribute('aria-selected', on ? 'true' : 'false');
            t.tabIndex = on ? 0 : -1;
            t.classList.toggle('is-active', on);
            panels[t.dataset.panel].hidden = !on;
        });
        if (focus) {
            var el = document.getElementById('tab-' + name);
            if (el) el.focus();
        }
        if (history.replaceState) history.replaceState(null, '', '#' + name);
    }

    tabs.forEach(function (t) {
        t.addEventListener('click', function () { show(t.dataset.panel); });
    });

    // Left/right arrows move between tabs, as a tablist is expected to.
    document.querySelector('.chooser').addEventListener('keydown', function (e) {
        var i = tabs.indexOf(document.activeElement);
        if (i === -1) return;
        var next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
        if (next === -1) return;
        e.preventDefault();
        show(tabs[(next + tabs.length) % tabs.length].dataset.panel, true);
    });

    var start = (location.hash || '').replace('#', '');
    show(panels[start] ? start : 'screens');
})();
