/* ==========================================================================
   IT News Scroll
   Builds the whole page from data.js: filters, counts, sorting, two views
   and a shareable URL. No inline handlers, no innerHTML with data in it.
   ========================================================================== */

(function () {
    'use strict';

    var CATS = window.NEWS_CATEGORIES || [];
    var KINDS = window.NEWS_KINDS || [];
    var COUNTRIES = window.NEWS_COUNTRIES || [];
    var META = window.NEWS_META || {};

    var CAT_BY_ID = {};
    CATS.forEach(function (c) { CAT_BY_ID[c.id] = c; });
    var KIND_BY_ID = {};
    KINDS.forEach(function (k) { KIND_BY_ID[k.id] = k; });
    var COUNTRY_BY_CC = {};
    COUNTRIES.forEach(function (c) { COUNTRY_BY_CC[c.cc] = c; });

    var NEIGHBOURS = ['be', 'nl', 'lu', 'fr', 'de', 'uk'];
    var BENELUX = ['be', 'nl', 'lu'];

    var ACCESS_LABEL = {
        open: { glyph: '🌐', text: 'Open to all' },
        account: { glyph: '🔐', text: 'Account needed' },
    };
    var COST_LABEL = {
        free: { glyph: '💚', text: 'Free' },
        freemium: { glyph: '💎', text: 'Free tier' },
        paid: { glyph: '💳', text: 'Paid' },
    };
    var CADENCE_LABEL = {
        annual: 'every year',
        biennial: 'every two years',
        quadrennial: 'every four years',
        multi: 'several times a year',
        rolling: 'all year round',
    };

    var SORTS = {
        resource: [
            { id: 'curated', label: 'Grouped by topic' },
            { id: 'name', label: 'Name, A to Z' },
            { id: 'name-desc', label: 'Name, Z to A' },
        ],
        event: [
            { id: 'soonest', label: 'Soonest first' },
            { id: 'name', label: 'Name, A to Z' },
            { id: 'name-desc', label: 'Name, Z to A' },
            { id: 'country', label: 'By country' },
        ],
    };

    var TODAY = new Date().toISOString().slice(0, 10);

    /* ---- Build the working list ------------------------------------------ */

    function normalise(raw, type, order) {
        var item = Object.create(null);
        Object.keys(raw).forEach(function (k) { item[k] = raw[k]; });
        item.type = type;
        item.order = order;
        item.links = Array.isArray(raw.links) ? raw.links : [];

        var words = [raw.name, raw.desc, raw.tags || ''];
        if (type === 'resource') {
            (raw.cats || []).forEach(function (id) {
                if (CAT_BY_ID[id]) words.push(CAT_BY_ID[id].label);
            });
            item.groupId = (raw.cats || [])[0] || '';
        } else {
            var kind = KIND_BY_ID[raw.kind];
            var country = COUNTRY_BY_CC[raw.cc];
            if (kind) words.push(kind.label);
            if (country) words.push(country.name);
            words.push(raw.place || '', raw.when || '', raw.next || '', raw.held || '');
            item.groupId = raw.kind || '';
            item.upcoming = !!(raw.nextIso && raw.nextIso >= TODAY);
        }
        item.links.forEach(function (l) { words.push(l.t, l.u); });
        item.haystack = words.join(' ').toLowerCase();
        item.sortKey = raw.name.toLowerCase().replace(/^the\s+/, '');
        return item;
    }

    var ITEMS = []
        .concat((window.NEWS_RESOURCES || []).map(function (r, i) { return normalise(r, 'resource', i); }))
        .concat((window.NEWS_EVENTS || []).map(function (e, i) { return normalise(e, 'event', i); }));

    var CAT_ORDER = {};
    CATS.forEach(function (c, i) { CAT_ORDER[c.id] = i; });
    KINDS.forEach(function (k, i) { CAT_ORDER[k.id] = i; });

    /* ---- State ------------------------------------------------------------ */

    var state = {
        tab: 'resource',
        cat: '',
        q: '',
        free: false,
        open: false,
        region: '',
        upcoming: false,
        sort: 'curated',
        view: 'cards',
    };

    var el = {};

    function readUrl() {
        var p = new URLSearchParams(location.search);
        if (p.get('tab') === 'events') state.tab = 'event';
        state.sort = SORTS[state.tab][0].id;

        var cat = p.get('cat') || '';
        if (state.tab === 'resource' ? CAT_BY_ID[cat] : KIND_BY_ID[cat]) state.cat = cat;

        state.q = (p.get('q') || '').slice(0, 100);
        state.free = p.get('free') === '1';
        state.open = p.get('open') === '1';
        state.upcoming = p.get('soon') === '1';

        var region = p.get('where') || '';
        if (region === 'near' || region === 'benelux' || COUNTRY_BY_CC[region]) state.region = region;

        var sort = p.get('sort') || '';
        if (SORTS[state.tab].some(function (s) { return s.id === sort; })) state.sort = sort;

        if (p.get('view') === 'compact') state.view = 'compact';

        try {
            if (!p.has('view')) {
                var saved = localStorage.getItem('news.view');
                if (saved === 'compact' || saved === 'cards') state.view = saved;
            }
        } catch (err) { /* storage blocked, the default view is fine */ }
    }

    function writeUrl() {
        var p = new URLSearchParams();
        if (state.tab === 'event') p.set('tab', 'events');
        if (state.cat) p.set('cat', state.cat);
        if (state.q) p.set('q', state.q);
        if (state.free) p.set('free', '1');
        if (state.open) p.set('open', '1');
        if (state.tab === 'event' && state.upcoming) p.set('soon', '1');
        if (state.tab === 'event' && state.region) p.set('where', state.region);
        if (state.sort !== SORTS[state.tab][0].id) p.set('sort', state.sort);
        if (state.view !== 'cards') p.set('view', state.view);
        var qs = p.toString();
        history.replaceState(null, '', qs ? '?' + qs : location.pathname);
    }

    /* ---- Filtering -------------------------------------------------------- */

    function tokens() {
        return state.q.toLowerCase().split(/\s+/).filter(Boolean);
    }

    function matchesQuery(item, toks) {
        for (var i = 0; i < toks.length; i++) {
            if (item.haystack.indexOf(toks[i]) === -1) return false;
        }
        return true;
    }

    function score(item, toks) {
        if (!toks.length) return 0;
        var name = item.name.toLowerCase();
        var total = 0;
        toks.forEach(function (t) {
            if (name.indexOf(t) === 0) total += 100;
            else if (name.indexOf(t) !== -1) total += 60;
            else if ((item.tags || '').toLowerCase().indexOf(t) !== -1) total += 25;
            else total += 5;
        });
        return total;
    }

    function inRegion(item) {
        if (!state.region) return true;
        if (state.region === 'near') return NEIGHBOURS.indexOf(item.cc) !== -1;
        if (state.region === 'benelux') return BENELUX.indexOf(item.cc) !== -1;
        return item.cc === state.region;
    }

    function passesFacets(item) {
        if (state.free && item.cost !== 'free') return false;
        if (item.type === 'resource') {
            if (state.open && item.access !== 'open') return false;
        } else {
            if (!inRegion(item)) return false;
            if (state.upcoming && !item.upcoming) return false;
        }
        return true;
    }

    /* Everything except the category chips, so the chips can show honest counts. */
    function preFiltered(tab) {
        var toks = tokens();
        return ITEMS.filter(function (item) {
            return item.type === tab && matchesQuery(item, toks) && passesFacets(item);
        });
    }

    function sortItems(list) {
        var toks = tokens();
        var byName = function (a, b) { return a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0; };

        /* Relevance only replaces the resource default. Events stay in date
           order while searching, which is what people actually want there. */
        if (toks.length && state.tab === 'resource' && state.sort === 'curated') {
            return list.slice().sort(function (a, b) {
                var d = score(b, toks) - score(a, toks);
                return d || byName(a, b);
            });
        }
        if (state.sort === 'name') return list.slice().sort(byName);
        if (state.sort === 'name-desc') return list.slice().sort(function (a, b) { return byName(b, a); });
        if (state.sort === 'country') {
            return list.slice().sort(function (a, b) {
                var an = (COUNTRY_BY_CC[a.cc] || {}).name || '';
                var bn = (COUNTRY_BY_CC[b.cc] || {}).name || '';
                return an === bn ? byName(a, b) : (an < bn ? -1 : 1);
            });
        }
        if (state.sort === 'soonest') {
            return list.slice().sort(function (a, b) {
                var ai = a.nextIso || '', bi = b.nextIso || '';
                if (ai && bi) return ai === bi ? byName(a, b) : (ai < bi ? -1 : 1);
                if (ai) return -1;
                if (bi) return 1;
                return byName(a, b);
            });
        }
        /* curated: the order of the category list, then the order in data.js */
        return list.slice().sort(function (a, b) {
            var ao = CAT_ORDER[a.groupId], bo = CAT_ORDER[b.groupId];
            if (ao === undefined) ao = 99;
            if (bo === undefined) bo = 99;
            return ao === bo ? a.order - b.order : ao - bo;
        });
    }

    /* ---- Small DOM helpers ------------------------------------------------ */

    function make(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = text;
        return node;
    }

    function badge(glyph, text, modifier) {
        var li = make('li', 'badge' + (modifier ? ' badge--' + modifier : ''));
        li.appendChild(make('span', 'badge__glyph', glyph));
        li.appendChild(make('span', 'badge__text', text));
        return li;
    }

    function isExternal(url) {
        return /^https?:\/\//i.test(url);
    }

    function linkTo(link, className) {
        var a = make('a', className);
        a.href = link.u;
        if (isExternal(link.u)) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        }
        a.appendChild(make('span', 'link__glyph', link.g || '🔗'));
        a.appendChild(make('span', 'link__text', link.t));
        if (isExternal(link.u)) {
            var mark = make('span', 'link__ext', '↗');
            mark.setAttribute('aria-hidden', 'true');
            a.appendChild(mark);
        }
        return a;
    }

    /* ---- Cards ------------------------------------------------------------ */

    function metaRow(dl, key, value) {
        var wrap = make('div', 'meta__row');
        wrap.appendChild(make('dt', 'meta__key', key));
        wrap.appendChild(make('dd', 'meta__val', value));
        dl.appendChild(wrap);
    }

    function buildCard(item) {
        var card = make('article', 'card card--' + item.type);
        card.appendChild(make('h3', 'card__title', item.name));

        var badges = make('ul', 'badges');
        if (item.type === 'resource') {
            (item.cats || []).forEach(function (id) {
                var c = CAT_BY_ID[id];
                if (c) badges.appendChild(badge(c.glyph, c.label, 'cat'));
            });
            var access = ACCESS_LABEL[item.access];
            if (access) badges.appendChild(badge(access.glyph, access.text, 'access'));
        } else {
            var kind = KIND_BY_ID[item.kind];
            if (kind) badges.appendChild(badge(kind.glyph, kind.label.replace(/s$/, ''), 'cat'));
            if (item.upcoming) badges.appendChild(badge('⏳', 'Still to come', 'soon'));
        }
        var cost = COST_LABEL[item.cost];
        if (cost) badges.appendChild(badge(cost.glyph, cost.text, 'cost'));
        card.appendChild(badges);

        if (item.type === 'event') {
            var dl = make('dl', 'meta');
            var country = COUNTRY_BY_CC[item.cc] || { name: '', flag: '📍' };
            var where = item.place || country.name;
            if (country.name && item.place && item.place.indexOf(country.name) === -1 && item.cc !== 'online') {
                where = item.place + ', ' + country.name;
            }
            metaRow(dl, 'Where', country.flag + ' ' + where);
            var when = item.when || '';
            var cadence = CADENCE_LABEL[item.cadence];
            if (cadence && item.cadence !== 'rolling') when += ', ' + cadence;
            else if (cadence) when = when || cadence;
            metaRow(dl, 'When', when);
            if (item.next) metaRow(dl, 'Next', item.next);
            if (item.held) metaRow(dl, 'Latest', item.held);
            card.appendChild(dl);
        }

        card.appendChild(make('p', 'card__desc', item.desc));

        var foot = make('div', 'card__links');
        if (item.links.length) {
            foot.appendChild(linkTo(item.links[0], 'btn btn-primary card__cta'));
        }
        if (item.links.length > 1) {
            var details = make('details', 'more');
            var summary = make('summary', 'more__summary');
            summary.appendChild(make('span', null, 'More links'));
            summary.appendChild(make('span', 'more__count', String(item.links.length - 1)));
            details.appendChild(summary);
            var list = make('div', 'more__list');
            item.links.slice(1).forEach(function (l) { list.appendChild(linkTo(l, 'more__link')); });
            details.appendChild(list);
            foot.appendChild(details);
        }
        card.appendChild(foot);
        return card;
    }

    /* ---- Chips ------------------------------------------------------------ */

    function renderChips() {
        var defs = state.tab === 'resource' ? CATS : KINDS;
        var pool = preFiltered(state.tab);
        var counts = {};
        pool.forEach(function (item) {
            var ids = item.type === 'resource' ? (item.cats || []) : [item.kind];
            ids.forEach(function (id) { counts[id] = (counts[id] || 0) + 1; });
        });

        el.chips.textContent = '';
        el.chips.appendChild(chip('', '✦', 'Everything', pool.length));
        defs.forEach(function (d) {
            var n = counts[d.id] || 0;
            if (!n && state.cat !== d.id) return;
            el.chips.appendChild(chip(d.id, d.glyph, d.label, n));
        });
    }

    function chip(id, glyph, label, count) {
        var btn = make('button', 'chip');
        btn.type = 'button';
        btn.dataset.cat = id;
        btn.setAttribute('aria-pressed', state.cat === id ? 'true' : 'false');
        btn.appendChild(make('span', 'chip__glyph', glyph));
        btn.appendChild(make('span', 'chip__text', label));
        btn.appendChild(make('span', 'chip__count', String(count)));
        return btn;
    }

    /* ---- Region picker ---------------------------------------------------- */

    function renderRegions() {
        var used = {};
        ITEMS.forEach(function (i) { if (i.type === 'event') used[i.cc] = true; });

        el.region.textContent = '';
        var quick = make('optgroup');
        quick.label = 'Quick picks';
        [
            ['', 'Everywhere'],
            ['be', '🇧🇪 Belgium only'],
            ['benelux', 'Benelux'],
            ['near', 'Belgium and its neighbours'],
            ['online', '🌐 Online only'],
        ].forEach(function (pair) {
            var o = make('option', null, pair[1]);
            o.value = pair[0];
            quick.appendChild(o);
        });
        el.region.appendChild(quick);

        var byCountry = make('optgroup');
        byCountry.label = 'By country';
        COUNTRIES.filter(function (c) { return used[c.cc] && c.cc !== 'online' && c.cc !== 'be'; })
            .slice()
            .sort(function (a, b) { return a.name < b.name ? -1 : 1; })
            .forEach(function (c) {
                var o = make('option', null, c.flag + ' ' + c.name);
                o.value = c.cc;
                byCountry.appendChild(o);
            });
        el.region.appendChild(byCountry);
        el.region.value = state.region;
    }

    function renderSorts() {
        var opts = SORTS[state.tab];
        /* Rebuilding a focused <select> loses the open dropdown, so only do it
           when the tab actually changed the option set. */
        if (el.sort.dataset.builtFor !== state.tab) {
            el.sort.textContent = '';
            opts.forEach(function (s) {
                var o = make('option', null, s.label);
                o.value = s.id;
                el.sort.appendChild(o);
            });
            el.sort.dataset.builtFor = state.tab;
        }
        if (!opts.some(function (s) { return s.id === state.sort; })) state.sort = opts[0].id;
        el.sort.value = state.sort;
    }

    /* ---- Main render ------------------------------------------------------ */

    function render() {
        var pool = preFiltered(state.tab);
        var list = state.cat
            ? pool.filter(function (item) {
                return item.type === 'resource'
                    ? (item.cats || []).indexOf(state.cat) !== -1
                    : item.kind === state.cat;
            })
            : pool;
        list = sortItems(list);

        renderChips();
        renderSorts();

        el.tabs.forEach(function (btn) {
            var on = btn.dataset.tab === state.tab;
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        el.eventFilters.hidden = state.tab !== 'event';
        el.resourceFilters.hidden = state.tab !== 'resource';
        el.searchInput.placeholder = state.tab === 'event'
            ? 'Search events, cities, countries…'
            : 'Search resources, tools, topics…';
        el.clearSearch.hidden = !state.q;
        el.freeToggle.setAttribute('aria-pressed', state.free ? 'true' : 'false');
        el.openToggle.setAttribute('aria-pressed', state.open ? 'true' : 'false');
        el.upcomingToggle.setAttribute('aria-pressed', state.upcoming ? 'true' : 'false');
        el.region.value = state.region;
        el.viewButtons.forEach(function (btn) {
            btn.setAttribute('aria-pressed', btn.dataset.view === state.view ? 'true' : 'false');
        });

        el.grid.className = 'grid' + (state.view === 'compact' ? ' grid--compact' : '');
        el.grid.textContent = '';
        var frag = document.createDocumentFragment();
        list.forEach(function (item) { frag.appendChild(buildCard(item)); });
        el.grid.appendChild(frag);

        var noun = state.tab === 'event' ? 'event' : 'resource';
        el.count.textContent = list.length + ' ' + noun + (list.length === 1 ? '' : 's') + ' shown';
        el.empty.hidden = list.length !== 0;

        renderCrossHint();
        updateFilterSummary();
        writeUrl();
        /* The bar's own height decides the swap point, and a shorter list can
           pull the page back above it. */
        if (el.anchor) {
            if (!condensed) measureReserve();
            onScroll();
        }
    }

    function renderCrossHint() {
        var other = state.tab === 'resource' ? 'event' : 'resource';
        var toks = tokens();
        el.crossHint.textContent = '';
        if (!toks.length) { el.crossHint.hidden = true; return; }

        var n = ITEMS.filter(function (i) { return i.type === other && matchesQuery(i, toks); }).length;
        if (!n) { el.crossHint.hidden = true; return; }

        var label = other === 'event' ? 'event' : 'resource';
        el.crossHint.hidden = false;
        el.crossHint.appendChild(document.createTextNode('Also ' + n + ' matching ' + label + (n === 1 ? '' : 's') + ' in the other list. '));
        var btn = make('button', 'link-btn', 'Look there instead');
        btn.type = 'button';
        btn.addEventListener('click', function () {
            state.tab = other;
            state.cat = '';
            state.sort = SORTS[state.tab][0].id;
            render();
            el.grid.scrollIntoView({ block: 'start' });
        });
        el.crossHint.appendChild(btn);
    }

    function filtersActive() {
        return !!(state.q || state.cat || state.free
            || (state.tab === 'resource' && state.open)
            || (state.tab === 'event' && (state.region || state.upcoming)));
    }

    /* The search box stays visible while condensed, so it is not counted here. */
    function activeFilterCount() {
        var n = 0;
        if (state.cat) n++;
        if (state.free) n++;
        if (state.tab === 'resource' && state.open) n++;
        if (state.tab === 'event' && state.region) n++;
        if (state.tab === 'event' && state.upcoming) n++;
        return n;
    }

    function updateFilterSummary() {
        el.reset.hidden = !filtersActive();
        var n = activeFilterCount();
        el.filtersCount.hidden = n === 0;
        el.filtersCount.textContent = String(n);
        el.filtersBtn.setAttribute('aria-label', n
            ? 'Filters, ' + n + ' active'
            : 'Filters');
    }

    function resetFilters() {
        state.q = '';
        state.cat = '';
        state.free = false;
        state.open = false;
        state.region = '';
        state.upcoming = false;
        el.searchInput.value = '';
        render();
    }

    /* ---- Condense the toolbar once it is stuck to the top ---------------- */

    var condensed = false;
    var panelOpen = false;
    var reservePx = 0;

    function setToolbarState() {
        el.toolbar.classList.toggle('is-condensed', condensed);
        el.toolbar.classList.toggle('is-open', condensed && panelOpen);
        el.filtersBtn.setAttribute('aria-expanded', (!condensed || panelOpen) ? 'true' : 'false');
        /* Anchor jumps have to clear whatever the floating bar covers. */
        var h = condensed ? Math.min(el.toolbar.getBoundingClientRect().height, 220) + 16 : 0;
        document.documentElement.style.scrollPaddingTop = h ? Math.round(h) + 'px' : '';
    }

    /* Only meaningful while the bar is in flow, which is the only time it is
       measured: condensed, the bar is fixed and reports its shrunken size. */
    function measureReserve() {
        var cs = getComputedStyle(el.toolbar);
        reservePx = Math.round(el.toolbar.getBoundingClientRect().height +
            (parseFloat(cs.marginBottom) || 0));
    }

    function applyCondensed(next) {
        if (next) {
            /* The sentinel takes over the space the bar leaves, so the document
               height never changes and scroll anchoring stays out of it. */
            el.anchor.style.height = reservePx + 'px';
            condensed = true;
        } else {
            condensed = false;
            panelOpen = false;
            el.anchor.style.height = '';
        }
        setToolbarState();
    }

    function onScroll() {
        /* Swap only once the whole bar has scrolled past, so the space it
           leaves behind is never on screen as a gap. */
        var top = el.anchor.getBoundingClientRect().top;
        var next = condensed ? top < -(reservePx - 4) : top < -(reservePx + 4);
        if (next !== condensed) applyCondensed(next);
        var showTop = (window.scrollY || window.pageYOffset || 0) >= 600;
        if (showTop === el.toTop.hidden) el.toTop.hidden = !showTop;
    }

    /* The reserved height depends on how the toolbar wraps, so remeasure it. */
    function onResize() {
        if (condensed) applyCondensed(false);
        measureReserve();
        onScroll();
    }

    /* ---- Wiring ----------------------------------------------------------- */

    function debounce(fn, ms) {
        var t;
        return function () {
            clearTimeout(t);
            t = setTimeout(fn, ms);
        };
    }

    function wire() {
        el.tabs.forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (state.tab === btn.dataset.tab) return;
                state.tab = btn.dataset.tab;
                state.cat = '';
                state.sort = SORTS[state.tab][0].id;
                render();
            });
        });

        el.chips.addEventListener('click', function (e) {
            var btn = e.target.closest('.chip');
            if (!btn) return;
            var id = btn.dataset.cat;
            state.cat = id === state.cat ? '' : id;
            render();
            /* render() replaces the chip that was just clicked. */
            var again = el.chips.querySelector('[data-cat="' + (id ? id : '') + '"]');
            if (again) again.focus();
        });

        var onType = debounce(function () {
            state.q = el.searchInput.value.trim();
            render();
        }, 140);
        el.searchInput.addEventListener('input', onType);
        el.searchInput.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            if (el.searchInput.value) {
                el.searchInput.value = '';
                state.q = '';
                render();
            } else {
                el.searchInput.blur();
            }
        });
        el.clearSearch.addEventListener('click', function () {
            el.searchInput.value = '';
            state.q = '';
            el.searchInput.focus();
            render();
        });

        el.freeToggle.addEventListener('click', function () { state.free = !state.free; render(); });
        el.openToggle.addEventListener('click', function () { state.open = !state.open; render(); });
        el.upcomingToggle.addEventListener('click', function () { state.upcoming = !state.upcoming; render(); });
        el.region.addEventListener('change', function () { state.region = el.region.value; render(); });
        el.sort.addEventListener('change', function () { state.sort = el.sort.value; render(); });

        el.viewButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                state.view = btn.dataset.view;
                try { localStorage.setItem('news.view', state.view); } catch (err) { /* not important */ }
                render();
            });
        });

        el.reset.addEventListener('click', resetFilters);
        el.emptyReset.addEventListener('click', resetFilters);

        el.share.addEventListener('click', function () {
            var url = location.href;
            var done = function (ok) {
                el.share.classList.toggle('is-done', ok);
                el.shareText.textContent = ok ? 'Link copied' : 'Press Ctrl+C';
                setTimeout(function () {
                    el.share.classList.remove('is-done');
                    el.shareText.textContent = 'Copy this view';
                }, 2200);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); });
            } else {
                done(false);
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && condensed && panelOpen) {
                panelOpen = false;
                setToolbarState();
                el.filtersBtn.focus();
                return;
            }
            if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
            var tag = (document.activeElement && document.activeElement.tagName) || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            e.preventDefault();
            el.searchInput.focus();
            el.searchInput.select();
        });

        el.filtersBtn.addEventListener('click', function () {
            if (!condensed) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            panelOpen = !panelOpen;
            setToolbarState();
        });

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });
        el.toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---- Starfield backdrop (self-contained, matches rami.party) ---------- */
    function startStarfield() {
        var canvas = document.getElementById('starfield');
        if (!canvas || !canvas.getContext) return;
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var ctx = canvas.getContext('2d');
        var stars = [];
        var w, h, dpr, rafId;

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.width = Math.floor(innerWidth * dpr);
            h = canvas.height = Math.floor(innerHeight * dpr);
            canvas.style.width = innerWidth + 'px';
            canvas.style.height = innerHeight + 'px';
            var count = Math.min(160, Math.floor((innerWidth * innerHeight) / 9000));
            var palette = ['#ffffff', '#c99bff', '#7fe6f7', '#ffd77a', '#ff9ecb'];
            stars = [];
            for (var i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: (Math.random() * 1.4 + 0.3) * dpr,
                    a: Math.random(),
                    tw: Math.random() * 0.02 + 0.004,
                    dir: Math.random() > 0.5 ? 1 : -1,
                    c: palette[(Math.random() * palette.length) | 0],
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            for (var i = 0; i < stars.length; i++) {
                var s = stars[i];
                s.a += s.tw * s.dir;
                if (s.a <= 0.1 || s.a >= 1) s.dir *= -1;
                ctx.globalAlpha = Math.max(0.1, Math.min(1, s.a));
                ctx.fillStyle = s.c;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            if (!reduceMotion) rafId = requestAnimationFrame(draw);
        }

        resize();
        window.addEventListener('resize', function () {
            cancelAnimationFrame(rafId);
            resize();
            draw();
        });
        draw();
    }

    /* ---- Boot ------------------------------------------------------------- */

    function init() {
        el.chips = document.getElementById('chips');
        el.grid = document.getElementById('grid');
        el.count = document.getElementById('resultCount');
        el.empty = document.getElementById('emptyState');
        el.emptyReset = document.getElementById('emptyReset');
        el.reset = document.getElementById('resetFilters');
        el.searchInput = document.getElementById('searchInput');
        el.clearSearch = document.getElementById('clearSearch');
        el.freeToggle = document.getElementById('freeToggle');
        el.openToggle = document.getElementById('openToggle');
        el.upcomingToggle = document.getElementById('upcomingToggle');
        el.region = document.getElementById('regionSelect');
        el.sort = document.getElementById('sortSelect');
        el.eventFilters = document.getElementById('eventFilters');
        el.resourceFilters = document.getElementById('resourceFilters');
        el.crossHint = document.getElementById('crossHint');
        el.share = document.getElementById('shareBtn');
        el.shareText = document.getElementById('shareText');
        el.toolbar = document.getElementById('filterbar');
        el.anchor = document.getElementById('toolbarAnchor');
        el.filtersBtn = document.getElementById('filtersBtn');
        el.filtersCount = document.getElementById('filtersCount');
        el.toTop = document.getElementById('toTop');
        el.tabs = Array.prototype.slice.call(document.querySelectorAll('[data-tab]'));
        el.viewButtons = Array.prototype.slice.call(document.querySelectorAll('[data-view]'));

        readUrl();
        el.searchInput.value = state.q;
        renderRegions();

        var totalRes = ITEMS.filter(function (i) { return i.type === 'resource'; }).length;
        var totalEv = ITEMS.filter(function (i) { return i.type === 'event'; }).length;
        var soon = ITEMS.filter(function (i) { return i.type === 'event' && i.upcoming; }).length;
        setText('statResources', String(totalRes));
        setText('statEvents', String(totalEv));
        setText('statSoon', String(soon));
        setText('tabResourceCount', String(totalRes));
        setText('tabEventCount', String(totalEv));
        if (META.checkedLabel) setText('checkedOn', META.checkedLabel);

        wire();
        render();
        setToolbarState();
        onScroll();
        startStarfield();
    }

    function setText(id, text) {
        var node = document.getElementById(id);
        if (node) node.textContent = text;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
