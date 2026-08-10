/* ==========================================================================
   The catalogue
   --------------------------------------------------------------------------
   Every file in ../data/ calls OST.add('<shelf>', [ … ]). This turns those
   plain objects into the shape the page filters on, and nothing else knows
   how many files there were.
   ========================================================================== */

(function () {
    'use strict';

    var OST = window.OST;

    OST.items = [];

    var byId = function (list, key) {
        var map = {};
        list.forEach(function (x, i) { map[x[key || 'id']] = x; x.order = i; });
        return map;
    };

    OST.shelfById = byId(OST.shelves);
    OST.subjectById = byId(OST.subjects);
    OST.typeById = byId(OST.types);
    OST.accessById = byId(OST.access);
    OST.kindById = byId(OST.kinds);
    OST.countryByCc = byId(OST.countries, 'cc');

    /* A link to a repository is a fact about the entry. A licence is not, so
       this flag is called "source", never "open source". */
    var SOURCE_RE = /^https?:\/\/(www\.)?(github\.com|gitlab\.com|codeberg\.org|git\.sr\.ht|bitbucket\.org|sourceforge\.net|gitea\.com)\//i;

    var TODAY = new Date().toISOString().slice(0, 10);

    function haystack(item) {
        var words = [item.name, item.desc, item.note || '', item.tags || '', item.id];
        var shelf = OST.shelfById[item.shelf];
        if (shelf) words.push(shelf.label);
        item.subs.forEach(function (id) {
            if (OST.subjectById[id]) words.push(OST.subjectById[id].label);
        });
        if (OST.typeById[item.type]) words.push(OST.typeById[item.type].label);
        if (OST.accessById[item.access]) words.push(OST.accessById[item.access].label);
        if (OST.kindById[item.kind]) words.push(OST.kindById[item.kind].label);
        if (OST.countryByCc[item.cc]) words.push(OST.countryByCc[item.cc].name);
        words.push(item.place || '', item.when || '', item.next || '', item.held || '');
        if (item.gdpr) words.push('gdpr');
        if (item.local) words.push('hosted here on rami.party');
        if (item.source) words.push('open source repository github');
        item.links.forEach(function (l) { words.push(l.t, l.u); });
        return words.join(' ').toLowerCase();
    }

    OST.add = function (shelf, list) {
        list.forEach(function (raw) {
            var item = Object.create(null);
            Object.keys(raw).forEach(function (k) { item[k] = raw[k]; });
            item.shelf = shelf;
            item.order = OST.items.length;
            item.links = Array.isArray(raw.links) ? raw.links : [];
            item.subs = (Array.isArray(raw.subs) ? raw.subs : []).filter(function (id) {
                return !!OST.subjectById[id];
            });
            item.source = item.links.some(function (l) { return SOURCE_RE.test(l.u); });
            item.upcoming = !!(raw.nextIso && raw.nextIso >= TODAY);
            item.sortKey = raw.name.toLowerCase().replace(/^the\s+/, '');
            item.haystack = haystack(item);
            OST.items.push(item);
        });
    };

    /* The value the contextual "Format" picker filters on, per shelf. */
    OST.formats = {
        tool: { label: 'Runs as', any: 'Any format', key: 'type', options: OST.types },
        read: { label: 'Access', any: 'Any access', key: 'access', options: OST.access },
        event: { label: 'Event type', any: 'Any type', key: 'kind', options: OST.kinds },
    };

    OST.countPerShelf = function () {
        var counts = {};
        OST.items.forEach(function (i) { counts[i.shelf] = (counts[i.shelf] || 0) + 1; });
        return counts;
    };
})();
