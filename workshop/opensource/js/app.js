/* ==========================================================================
   The page
   Puts the pieces together: filter, count, draw, and keep the address bar
   in step. Every control calls OST.apply(), and nothing else redraws.
   ========================================================================== */

(function () {
    'use strict';

    var OST = window.OST;
    var el = {};

    /* ---- Filtering --------------------------------------------------------- */

    function inWhere(item) {
        var want = OST.state.where;
        if (!want) return true;
        var region = OST.regions.filter(function (r) { return r.id === want; })[0];
        return region ? region.ccs.indexOf(item.cc) !== -1 : item.cc === want;
    }

    /* Facets that apply whichever shelf you are on. */
    function passesShared(item, toks) {
        if (!OST.matches(item, toks)) return false;
        if (OST.state.free && item.cost !== 'free') return false;
        if (OST.state.source && !item.source) return false;
        return true;
    }

    /* Facets that only exist once a shelf is chosen. */
    function passesShelf(item) {
        var s = OST.state;
        if (s.shelf && item.shelf !== s.shelf) return false;
        var def = OST.formatDef();
        if (def && s.format && item[def.key] !== s.format) return false;
        if (s.shelf === 'event') {
            if (s.soon && !item.upcoming) return false;
            if (!inWhere(item)) return false;
        }
        return true;
    }

    function hasSubject(item) {
        return !OST.state.sub || item.subs.indexOf(OST.state.sub) !== -1;
    }

    /* ---- Draw --------------------------------------------------------------- */

    function countBy(list, pick) {
        var counts = {};
        list.forEach(function (item) {
            [].concat(pick(item)).forEach(function (id) {
                if (id) counts[id] = (counts[id] || 0) + 1;
            });
        });
        return counts;
    }

    OST.apply = function () {
        var s = OST.state;
        if (!OST.availableSorts().some(function (x) { return x.id === s.sort; })) s.sort = 'best';

        var toks = OST.tokenise(s.q);
        var shared = OST.items.filter(function (i) { return passesShared(i, toks); });

        /* Shelf counts ignore the shelf, subject counts ignore the subject, so
           every number on screen is what you would actually get. */
        var forShelves = shared.filter(hasSubject);
        OST.renderShelves(countBy(forShelves, function (i) { return i.shelf; }), forShelves.length);

        var forSubjects = shared.filter(passesShelf);
        OST.renderSubjects(countBy(forSubjects, function (i) { return i.subs; }), forSubjects.length);

        OST.renderFormat();
        OST.renderWhere();
        OST.renderSorts();
        OST.syncSwitches();
        el.clearSearch.hidden = !s.q;

        var list = OST.sort(forSubjects.filter(hasSubject), s.sort, toks);
        var frag = document.createDocumentFragment();
        list.forEach(function (item) { frag.appendChild(OST.card(item)); });
        el.results.className = 'grid' + (s.view === 'list' ? ' grid--list' : '');
        el.results.textContent = '';
        el.results.appendChild(frag);

        var shelf = OST.shelfById[s.shelf];
        var noun = shelf
            ? (list.length === 1 ? shelf.one : shelf.many)
            : (list.length === 1 ? 'entry' : 'entries');
        el.count.textContent = list.length + ' ' + noun + ' shown';
        el.empty.hidden = list.length !== 0;

        OST.writeUrl();
    };

    /* ---- The rail on small screens ------------------------------------------ */

    function railIsCollapsible() {
        return el.railToggle.offsetParent !== null;
    }

    function openRail(open) {
        el.rail.classList.toggle('is-open', open);
        el.railToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    OST.closeRailOnPhone = function () {
        if (railIsCollapsible()) openRail(false);
    };

    /* The rail sticks below the search bar, which wraps to two rows when it
       runs out of width, so the offset is measured rather than guessed. */
    function measureBar() {
        var h = el.searchbar.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--bar-h', Math.round(h) + 'px');
    }

    /* ---- Wiring -------------------------------------------------------------- */

    function debounce(fn, ms) {
        var t;
        return function () {
            clearTimeout(t);
            t = setTimeout(fn, ms);
        };
    }

    function reset() {
        OST.clear();
        el.search.value = '';
        OST.apply();
    }

    function wire() {
        var onType = debounce(function () {
            OST.state.q = el.search.value.trim();
            OST.apply();
        }, 140);
        el.search.addEventListener('input', onType);
        el.search.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            if (el.search.value) {
                el.search.value = '';
                OST.state.q = '';
                OST.apply();
            } else {
                el.search.blur();
            }
        });
        el.clearSearch.addEventListener('click', function () {
            el.search.value = '';
            OST.state.q = '';
            el.search.focus();
            OST.apply();
        });

        el.reset.addEventListener('click', reset);
        el.emptyReset.addEventListener('click', reset);
        el.railToggle.addEventListener('click', function () {
            openRail(!el.rail.classList.contains('is-open'));
        });

        el.share.addEventListener('click', function () {
            var done = function (ok) {
                el.share.classList.toggle('is-done', ok);
                el.shareText.textContent = ok ? 'Link copied' : 'Press Ctrl+C';
                setTimeout(function () {
                    el.share.classList.remove('is-done');
                    el.shareText.textContent = 'Copy this view';
                }, 2200);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(location.href).then(function () { done(true); }, function () { done(false); });
            } else {
                done(false);
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
            var tag = (document.activeElement && document.activeElement.tagName) || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            e.preventDefault();
            el.search.focus();
            el.search.select();
        });

        window.addEventListener('scroll', function () {
            el.toTop.hidden = (window.scrollY || window.pageYOffset || 0) < 600;
        }, { passive: true });
        window.addEventListener('resize', measureBar, { passive: true });
        el.toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        OST.wireRail();
    }

    /* ---- Boot ---------------------------------------------------------------- */

    function init() {
        el.searchbar = document.getElementById('searchbar');
        el.search = document.getElementById('searchInput');
        el.clearSearch = document.getElementById('clearSearch');
        el.results = document.getElementById('results');
        el.count = document.getElementById('resultCount');
        el.empty = document.getElementById('emptyState');
        el.rail = document.getElementById('rail');
        el.railToggle = document.getElementById('railToggle');
        el.reset = document.getElementById('resetFilters');
        el.emptyReset = document.getElementById('emptyReset');
        el.share = document.getElementById('shareBtn');
        el.shareText = document.getElementById('shareText');
        el.toTop = document.getElementById('toTop');

        OST.railElements({
            shelves: document.getElementById('shelves'),
            subjects: document.getElementById('subjects'),
            formatField: document.getElementById('formatField'),
            formatLabel: document.getElementById('formatLabel'),
            format: document.getElementById('formatSelect'),
            whereField: document.getElementById('whereField'),
            where: document.getElementById('whereSelect'),
            sort: document.getElementById('sortSelect'),
            free: document.getElementById('freeToggle'),
            source: document.getElementById('sourceToggle'),
            soon: document.getElementById('soonToggle'),
            views: Array.prototype.slice.call(document.querySelectorAll('.view-btn')),
            reset: el.reset,
            railNow: document.getElementById('railNow'),
        });

        var counts = OST.countPerShelf();
        document.getElementById('statTools').textContent = counts.tool || 0;
        document.getElementById('statRead').textContent = counts.read || 0;
        document.getElementById('statEvents').textContent = counts.event || 0;
        document.getElementById('checkedOn').textContent = OST.checked;

        OST.readUrl();
        el.search.value = OST.state.q;

        wire();
        measureBar();
        OST.apply();
        OST.startStarfield();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
