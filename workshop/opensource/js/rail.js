/* ==========================================================================
   The shelves and the rail
   Everything you can click to narrow the list: the three shelf buttons, the
   subject list with live counts, and the handful of refinements under it.
   Each control changes OST.state and calls OST.apply(), which app.js owns.
   ========================================================================== */

(function () {
    'use strict';

    var OST = window.OST;
    var make = OST.make;
    var el = {};

    OST.railElements = function (nodes) { el = nodes; };

    /* ---- The three shelves ------------------------------------------------ */

    function shelfButton(id, glyph, label, count) {
        var btn = make('button', 'shelf');
        btn.type = 'button';
        btn.dataset.shelf = id;
        btn.title = label;
        btn.setAttribute('aria-label', label + ', ' + count);
        btn.setAttribute('aria-pressed', OST.state.shelf === id ? 'true' : 'false');
        btn.appendChild(make('span', 'shelf__glyph', glyph));
        btn.appendChild(make('span', 'shelf__label', label));
        btn.appendChild(make('span', 'shelf__count', String(count)));
        return btn;
    }

    OST.renderShelves = function (counts, total) {
        el.shelves.textContent = '';
        el.shelves.appendChild(shelfButton('', '✦', 'Everything', total));
        OST.shelves.forEach(function (s) {
            el.shelves.appendChild(shelfButton(s.id, s.glyph, s.label, counts[s.id] || 0));
        });
    };

    /* ---- The subject list -------------------------------------------------- */

    function subjectButton(id, glyph, label, count) {
        var li = make('li');
        var btn = make('button', 'subject');
        btn.type = 'button';
        btn.dataset.sub = id;
        btn.setAttribute('aria-pressed', OST.state.sub === id ? 'true' : 'false');
        if (!count) btn.disabled = OST.state.sub !== id;
        btn.appendChild(make('span', 'subject__glyph', glyph));
        btn.appendChild(make('span', 'subject__label', label));
        btn.appendChild(make('span', 'subject__count', String(count)));
        li.appendChild(btn);
        return li;
    }

    OST.renderSubjects = function (counts, total) {
        el.subjects.textContent = '';
        el.subjects.appendChild(subjectButton('', '✦', 'Everything', total));
        OST.subjects.forEach(function (s) {
            el.subjects.appendChild(subjectButton(s.id, s.glyph, s.label, counts[s.id] || 0));
        });
    };

    /* ---- The refinements --------------------------------------------------- */

    OST.renderFormat = function () {
        var def = OST.formatDef();
        el.formatField.hidden = !def;
        if (!def) {
            OST.state.format = '';
            return;
        }
        if (el.format.dataset.builtFor !== OST.state.shelf) {
            el.format.textContent = '';
            el.format.appendChild(OST.option('', def.any));
            def.options.forEach(function (o) {
                el.format.appendChild(OST.option(o.id, o.glyph + ' ' + o.label));
            });
            el.format.dataset.builtFor = OST.state.shelf;
            el.formatLabel.textContent = def.label;
        }
        el.format.value = OST.state.format;
    };

    OST.renderWhere = function () {
        if (el.where.dataset.built !== '1') {
            var used = {};
            OST.items.forEach(function (i) { if (i.shelf === 'event') used[i.cc] = true; });

            el.where.appendChild(OST.option('', 'Everywhere'));
            var quick = make('optgroup');
            quick.label = 'Quick picks';
            OST.regions.forEach(function (r) { quick.appendChild(OST.option(r.id, r.label)); });
            el.where.appendChild(quick);

            var byCountry = make('optgroup');
            byCountry.label = 'By country';
            OST.countries.filter(function (c) { return used[c.cc] && c.cc !== 'online' && c.cc !== 'be'; })
                .slice()
                .sort(function (a, b) { return a.name < b.name ? -1 : 1; })
                .forEach(function (c) { byCountry.appendChild(OST.option(c.cc, c.flag + ' ' + c.name)); });
            el.where.appendChild(byCountry);
            el.where.dataset.built = '1';
        }
        el.whereField.hidden = OST.state.shelf !== 'event';
        el.where.value = OST.state.where;
    };

    OST.renderSorts = function () {
        var opts = OST.availableSorts();
        var signature = opts.map(function (s) { return s.id; }).join(',');
        if (el.sort.dataset.builtFor !== signature) {
            el.sort.textContent = '';
            opts.forEach(function (s) { el.sort.appendChild(OST.option(s.id, s.label)); });
            el.sort.dataset.builtFor = signature;
        }
        if (!opts.some(function (s) { return s.id === OST.state.sort; })) OST.state.sort = 'best';
        el.sort.value = OST.state.sort;
    };

    OST.syncSwitches = function () {
        var s = OST.state;
        el.free.setAttribute('aria-pressed', s.free ? 'true' : 'false');
        el.source.setAttribute('aria-pressed', s.source ? 'true' : 'false');
        el.soon.hidden = s.shelf !== 'event';
        el.soon.setAttribute('aria-pressed', s.soon ? 'true' : 'false');
        el.views.forEach(function (btn) {
            btn.setAttribute('aria-pressed', btn.dataset.view === s.view ? 'true' : 'false');
        });
        el.reset.hidden = !OST.activeCount() && !s.q;

        var subject = OST.subjectById[s.sub];
        var n = OST.activeCount();
        el.railNow.textContent = subject ? subject.label : (n ? n + ' active' : 'Everything');
    };

    /* ---- Wiring ------------------------------------------------------------ */

    OST.wireRail = function () {
        var s = OST.state;

        el.shelves.addEventListener('click', function (e) {
            var btn = e.target.closest('.shelf');
            if (!btn || btn.dataset.shelf === s.shelf) return;
            s.shelf = btn.dataset.shelf;
            /* The refinements below mean something else on every shelf. */
            s.format = '';
            s.soon = false;
            s.where = '';
            OST.apply();
            var again = el.shelves.querySelector('[data-shelf="' + s.shelf + '"]');
            if (again) again.focus();
        });

        el.subjects.addEventListener('click', function (e) {
            var btn = e.target.closest('.subject');
            if (!btn) return;
            var id = btn.dataset.sub;
            s.sub = id === s.sub ? '' : id;
            OST.apply();
            var again = el.subjects.querySelector('[data-sub="' + id + '"]');
            if (again) again.focus();
            OST.closeRailOnPhone();
        });

        el.free.addEventListener('click', function () { s.free = !s.free; OST.apply(); });
        el.source.addEventListener('click', function () { s.source = !s.source; OST.apply(); });
        el.soon.addEventListener('click', function () { s.soon = !s.soon; OST.apply(); });
        el.format.addEventListener('change', function () { s.format = el.format.value; OST.apply(); });
        el.where.addEventListener('change', function () { s.where = el.where.value; OST.apply(); });
        el.sort.addEventListener('change', function () { s.sort = el.sort.value; OST.apply(); });

        el.views.forEach(function (btn) {
            btn.addEventListener('click', function () {
                s.view = btn.dataset.view;
                try { localStorage.setItem('ost.view', s.view); } catch (err) { /* not important */ }
                OST.apply();
            });
        });
    };
})();
