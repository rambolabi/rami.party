/* ==========================================================================
   IT Toolkit
   Builds the whole page from data.js: filters, counts, sorting, two views
   and a shareable URL. No inline handlers, no innerHTML with data in it.
   ========================================================================== */

(function () {
    'use strict';

    var CATS = window.TOOLS_CATEGORIES || [];
    var TYPES = window.TOOLS_TYPES || [];
    var META = window.TOOLS_META || {};

    var CAT_BY_ID = {};
    CATS.forEach(function (c) { CAT_BY_ID[c.id] = c; });
    var TYPE_BY_ID = {};
    TYPES.forEach(function (t) { TYPE_BY_ID[t.id] = t; });

    var COST_LABEL = {
        free: { glyph: '💚', text: 'Free' },
        freemium: { glyph: '💎', text: 'Free tier' },
        trial: { glyph: '⏳', text: 'Trial' },
        paid: { glyph: '💳', text: 'Paid' },
    };

    var SORTS = [
        { id: 'curated', label: 'Grouped by topic' },
        { id: 'name', label: 'Name, A to Z' },
        { id: 'name-desc', label: 'Name, Z to A' },
        { id: 'type', label: 'By type' },
    ];

    /* ---- Build the working list ------------------------------------------ */

    function normalise(raw, order) {
        var item = Object.create(null);
        Object.keys(raw).forEach(function (k) { item[k] = raw[k]; });
        item.order = order;
        item.links = Array.isArray(raw.links) ? raw.links : [];

        var words = [raw.name, raw.desc, raw.note || '', raw.tags || ''];
        (raw.cats || []).forEach(function (id) {
            if (CAT_BY_ID[id]) words.push(CAT_BY_ID[id].label);
        });
        if (TYPE_BY_ID[raw.type]) words.push(TYPE_BY_ID[raw.type].label);
        if (raw.gdpr) words.push('gdpr');
        if (raw.local) words.push('rami.party hosted here');
        item.links.forEach(function (l) { words.push(l.t, l.u); });
        item.haystack = words.join(' ').toLowerCase();
        item.groupId = (raw.cats || [])[0] || '';
        item.sortKey = raw.name.toLowerCase().replace(/^the\s+/, '');
        return item;
    }

    var ITEMS = (window.TOOLS || []).map(normalise);

    var CAT_ORDER = {};
    CATS.forEach(function (c, i) { CAT_ORDER[c.id] = i; });
    var TYPE_ORDER = {};
    TYPES.forEach(function (t, i) { TYPE_ORDER[t.id] = i; });

    /* ---- State ------------------------------------------------------------ */

    var state = {
        cat: '',
        q: '',
        type: '',
        free: false,
        gdpr: false,
        sort: 'curated',
        view: 'cards',
    };

    var el = {};

    function readUrl() {
        var p = new URLSearchParams(location.search);

        var cat = p.get('cat') || '';
        if (CAT_BY_ID[cat]) state.cat = cat;

        state.q = (p.get('q') || '').slice(0, 100);
        state.free = p.get('free') === '1';
        state.gdpr = p.get('gdpr') === '1';

        var type = p.get('type') || '';
        if (TYPE_BY_ID[type]) state.type = type;

        var sort = p.get('sort') || '';
        if (SORTS.some(function (s) { return s.id === sort; })) state.sort = sort;

        if (p.get('view') === 'compact') state.view = 'compact';

        try {
            if (!p.has('view')) {
                var saved = localStorage.getItem('tools.view');
                if (saved === 'compact' || saved === 'cards') state.view = saved;
            }
        } catch (err) { /* storage blocked, the default view is fine */ }
    }

    function writeUrl() {
        var p = new URLSearchParams();
        if (state.cat) p.set('cat', state.cat);
        if (state.q) p.set('q', state.q);
        if (state.type) p.set('type', state.type);
        if (state.free) p.set('free', '1');
        if (state.gdpr) p.set('gdpr', '1');
        if (state.sort !== 'curated') p.set('sort', state.sort);
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

    function passesFacets(item) {
        if (state.type && item.type !== state.type) return false;
        if (state.free && item.cost !== 'free') return false;
        if (state.gdpr && !item.gdpr) return false;
        return true;
    }

    /* Everything except the category chips, so the chips can show honest counts. */
    function preFiltered() {
        var toks = tokens();
        return ITEMS.filter(function (item) {
            return matchesQuery(item, toks) && passesFacets(item);
        });
    }

    function sortItems(list) {
        var toks = tokens();
        var byName = function (a, b) { return a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0; };
        var curated = function (a, b) {
            var ao = CAT_ORDER[a.groupId], bo = CAT_ORDER[b.groupId];
            if (ao === undefined) ao = 99;
            if (bo === undefined) bo = 99;
            return ao === bo ? a.order - b.order : ao - bo;
        };

        /* Searching replaces the curated order with relevance. */
        if (toks.length && state.sort === 'curated') {
            return list.slice().sort(function (a, b) {
                var d = score(b, toks) - score(a, toks);
                return d || byName(a, b);
            });
        }
        if (state.sort === 'name') return list.slice().sort(byName);
        if (state.sort === 'name-desc') return list.slice().sort(function (a, b) { return byName(b, a); });
        if (state.sort === 'type') {
            return list.slice().sort(function (a, b) {
                var d = (TYPE_ORDER[a.type] || 0) - (TYPE_ORDER[b.type] || 0);
                return d || curated(a, b);
            });
        }
        return list.slice().sort(curated);
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

    function buildCard(item) {
        var card = make('article', 'card');
        card.appendChild(make('h3', 'card__title', item.name));

        var badges = make('ul', 'badges');
        var type = TYPE_BY_ID[item.type];
        if (type) badges.appendChild(badge(type.glyph, type.label, 'type'));
        (item.cats || []).forEach(function (id) {
            var c = CAT_BY_ID[id];
            if (c) badges.appendChild(badge(c.glyph, c.label, 'cat'));
        });
        var cost = COST_LABEL[item.cost];
        if (cost) badges.appendChild(badge(cost.glyph, cost.text, 'cost'));
        if (item.gdpr) badges.appendChild(badge('🛡️', 'GDPR', 'gdpr'));
        if (item.local) badges.appendChild(badge('📍', 'rami.party', 'local'));
        card.appendChild(badges);

        card.appendChild(make('p', 'card__desc', item.desc));
        if (item.note) {
            var note = make('p', 'card__note');
            note.appendChild(make('span', 'card__note-glyph', '⚠️'));
            note.appendChild(make('span', null, item.note));
            card.appendChild(note);
        }

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
        var pool = preFiltered();
        var counts = {};
        pool.forEach(function (item) {
            (item.cats || []).forEach(function (id) { counts[id] = (counts[id] || 0) + 1; });
        });

        el.chips.textContent = '';
        el.chips.appendChild(chip('', '✦', 'Everything', pool.length));
        CATS.forEach(function (d) {
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

    /* ---- Selects ----------------------------------------------------------- */

    function renderTypeSelect() {
        el.type.textContent = '';
        var any = make('option', null, 'Any type');
        any.value = '';
        el.type.appendChild(any);
        TYPES.forEach(function (t) {
            var o = make('option', null, t.glyph + ' ' + t.label);
            o.value = t.id;
            el.type.appendChild(o);
        });
        el.type.value = state.type;
    }

    function renderSorts() {
        el.sort.textContent = '';
        SORTS.forEach(function (s) {
            var o = make('option', null, s.label);
            o.value = s.id;
            el.sort.appendChild(o);
        });
        el.sort.value = state.sort;
    }

    /* ---- Main render ------------------------------------------------------ */

    function render() {
        var pool = preFiltered();
        var list = state.cat
            ? pool.filter(function (item) { return (item.cats || []).indexOf(state.cat) !== -1; })
            : pool;
        list = sortItems(list);

        renderChips();

        el.clearSearch.hidden = !state.q;
        el.freeToggle.setAttribute('aria-pressed', state.free ? 'true' : 'false');
        el.gdprToggle.setAttribute('aria-pressed', state.gdpr ? 'true' : 'false');
        el.type.value = state.type;
        el.sort.value = state.sort;
        el.viewButtons.forEach(function (btn) {
            btn.setAttribute('aria-pressed', btn.dataset.view === state.view ? 'true' : 'false');
        });

        el.grid.className = 'grid' + (state.view === 'compact' ? ' grid--compact' : '');
        el.grid.textContent = '';
        var frag = document.createDocumentFragment();
        list.forEach(function (item) { frag.appendChild(buildCard(item)); });
        el.grid.appendChild(frag);

        el.count.textContent = list.length + ' tool' + (list.length === 1 ? '' : 's') + ' shown';
        el.empty.hidden = list.length !== 0;

        updateFilterSummary();
        writeUrl();
    }

    function filtersActive() {
        return !!(state.q || state.cat || state.type || state.free || state.gdpr);
    }

    /* The search box stays visible while condensed, so it is not counted here. */
    function activeFilterCount() {
        var n = 0;
        if (state.cat) n++;
        if (state.type) n++;
        if (state.free) n++;
        if (state.gdpr) n++;
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
        state.type = '';
        state.free = false;
        state.gdpr = false;
        el.searchInput.value = '';
        render();
    }

    /* ---- Condense the toolbar once it is stuck to the top ---------------- */

    var condensed = false;
    var panelOpen = false;

    function setToolbarState() {
        el.toolbar.classList.toggle('is-condensed', condensed);
        el.toolbar.classList.toggle('is-open', condensed && panelOpen);
        el.filtersBtn.setAttribute('aria-expanded', (!condensed || panelOpen) ? 'true' : 'false');
    }

    function onScroll() {
        var anchor = el.toolbar.offsetTop;
        var y = window.scrollY || window.pageYOffset || 0;
        /* Two thresholds, so the toolbar cannot flip back and forth on the
           reflow its own collapse causes. */
        var next = condensed ? y > anchor + 20 : y > anchor + 140;
        if (next !== condensed) {
            condensed = next;
            if (!condensed) panelOpen = false;
            setToolbarState();
        }
        el.toTop.hidden = y < 600;
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
        el.gdprToggle.addEventListener('click', function () { state.gdpr = !state.gdpr; render(); });
        el.type.addEventListener('change', function () { state.type = el.type.value; render(); });
        el.sort.addEventListener('change', function () { state.sort = el.sort.value; render(); });

        el.viewButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                state.view = btn.dataset.view;
                try { localStorage.setItem('tools.view', state.view); } catch (err) { /* not important */ }
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
        window.addEventListener('resize', onScroll, { passive: true });
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

    function setText(id, text) {
        var node = document.getElementById(id);
        if (node) node.textContent = text;
    }

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
        el.gdprToggle = document.getElementById('gdprToggle');
        el.type = document.getElementById('typeSelect');
        el.sort = document.getElementById('sortSelect');
        el.share = document.getElementById('shareBtn');
        el.shareText = document.getElementById('shareText');
        el.toolbar = document.getElementById('filterbar');
        el.filtersBtn = document.getElementById('filtersBtn');
        el.filtersCount = document.getElementById('filtersCount');
        el.toTop = document.getElementById('toTop');
        el.viewButtons = Array.prototype.slice.call(document.querySelectorAll('[data-view]'));

        readUrl();
        el.searchInput.value = state.q;
        renderTypeSelect();
        renderSorts();

        setText('statTools', String(ITEMS.length));
        setText('statFree', String(ITEMS.filter(function (i) { return i.cost === 'free'; }).length));
        setText('statLocal', String(ITEMS.filter(function (i) { return i.local; }).length));
        if (META.checkedLabel) setText('checkedOn', META.checkedLabel);

        wire();
        render();
        onScroll();
        startStarfield();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
