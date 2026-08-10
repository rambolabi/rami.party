/* ==========================================================================
   What you are looking at
   One state object, mirrored into the address bar so any view can be
   shared or bookmarked, plus the two things worth remembering between visits.
   ========================================================================== */

(function () {
    'use strict';

    var OST = window.OST;

    OST.state = {
        shelf: '',      // '' = all three
        sub: '',        // '' = every subject
        q: '',
        format: '',     // means something different per shelf
        free: false,
        source: false,
        soon: false,    // events only
        where: '',      // events only: a region id or a country code
        sort: 'best',
        view: 'cards',
    };

    /* "Soonest first" is only offered where dates exist. */
    OST.availableSorts = function () {
        return OST.state.shelf === 'event'
            ? [OST.sorts[0], OST.sortSoonest].concat(OST.sorts.slice(1))
            : OST.sorts;
    };

    OST.formatDef = function () {
        return OST.state.shelf ? OST.formats[OST.state.shelf] : null;
    };

    OST.knownWhere = function (id) {
        return OST.regions.some(function (r) { return r.id === id; }) || !!OST.countryByCc[id];
    };

    OST.readUrl = function () {
        var s = OST.state;
        var p = new URLSearchParams(location.search);

        if (OST.shelfById[p.get('shelf')]) s.shelf = p.get('shelf');
        if (OST.subjectById[p.get('sub')]) s.sub = p.get('sub');
        s.q = (p.get('q') || '').slice(0, 100);
        s.free = p.get('free') === '1';
        s.source = p.get('src') === '1';

        var def = OST.formatDef();
        var format = p.get('format') || '';
        if (def && def.options.some(function (o) { return o.id === format; })) s.format = format;

        if (s.shelf === 'event') {
            s.soon = p.get('soon') === '1';
            if (OST.knownWhere(p.get('where'))) s.where = p.get('where');
        }

        var sort = p.get('sort') || '';
        if (OST.availableSorts().some(function (x) { return x.id === sort; })) s.sort = sort;

        if (p.get('view') === 'list') s.view = 'list';
        try {
            if (!p.has('view')) {
                var saved = localStorage.getItem('ost.view');
                if (saved === 'list' || saved === 'cards') s.view = saved;
            }
        } catch (err) { /* storage blocked, the default view is fine */ }
    };

    OST.writeUrl = function () {
        var s = OST.state;
        var p = new URLSearchParams();
        if (s.shelf) p.set('shelf', s.shelf);
        if (s.sub) p.set('sub', s.sub);
        if (s.q) p.set('q', s.q);
        if (s.format) p.set('format', s.format);
        if (s.free) p.set('free', '1');
        if (s.source) p.set('src', '1');
        if (s.shelf === 'event' && s.soon) p.set('soon', '1');
        if (s.shelf === 'event' && s.where) p.set('where', s.where);
        if (s.sort !== 'best') p.set('sort', s.sort);
        if (s.view !== 'cards') p.set('view', s.view);
        var qs = p.toString();
        history.replaceState(null, '', qs ? '?' + qs : location.pathname);
    };

    OST.clear = function () {
        var s = OST.state;
        s.shelf = s.sub = s.q = s.format = s.where = '';
        s.free = s.source = s.soon = false;
        s.sort = 'best';
    };

    /* How many choices are narrowing the list, for the mobile summary line. */
    OST.activeCount = function () {
        var s = OST.state;
        var n = 0;
        if (s.shelf) n++;
        if (s.sub) n++;
        if (s.format) n++;
        if (s.free) n++;
        if (s.source) n++;
        if (s.shelf === 'event' && s.soon) n++;
        if (s.shelf === 'event' && s.where) n++;
        return n;
    };
})();
