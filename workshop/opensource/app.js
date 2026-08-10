/* ==========================================================================
   Rami's Open Source Toolkit
   --------------------------------------------------------------------------
   One search over the two catalogues that already live here: the IT Toolkit
   (../tools/data.js) and the IT News Scroll (../news/data.js). Those files
   stay the single source of truth — this page never copies an entry, it only
   re-indexes them under one shared set of subjects.

   Adding an entry anywhere in either data file makes it show up here on the
   next reload, with no work in this file.
   ========================================================================== */

(function () {
    'use strict';

    var TOOL_CATS = window.TOOLS_CATEGORIES || [];
    var TOOL_TYPES = window.TOOLS_TYPES || [];
    var READ_CATS = window.NEWS_CATEGORIES || [];
    var EVENT_KINDS = window.NEWS_KINDS || [];
    var COUNTRIES = window.NEWS_COUNTRIES || [];

    var TYPE_BY_ID = {};
    TOOL_TYPES.forEach(function (t) { TYPE_BY_ID[t.id] = t; });
    var KIND_BY_ID = {};
    EVENT_KINDS.forEach(function (k) { KIND_BY_ID[k.id] = k; });
    var COUNTRY_BY_CC = {};
    COUNTRIES.forEach(function (c) { COUNTRY_BY_CC[c.cc] = c; });

    var NEIGHBOURS = ['be', 'nl', 'lu', 'fr', 'de', 'uk'];
    var BENELUX = ['be', 'nl', 'lu'];

    /* ---- The three shelves ------------------------------------------------ */

    var SHELVES = [
        { id: 'tool', glyph: '🧰', label: 'Tools', one: 'tool', from: 'IT Toolkit', href: '../tools/', base: '../tools/' },
        { id: 'read', glyph: '📚', label: 'Reading', one: 'resource', from: 'IT News Scroll', href: '../news/', base: '../news/' },
        { id: 'event', glyph: '📅', label: 'Events', one: 'event', from: 'IT News Scroll', href: '../news/?tab=events', base: '../news/' },
    ];
    var SHELF_BY_ID = {};
    SHELVES.forEach(function (s, i) { SHELF_BY_ID[s.id] = s; s.order = i; });

    /* ---- The shared subjects ----------------------------------------------
       Both catalogues have their own topic lists, drawn up for their own page.
       These are the subjects they have in common, plus the ones only one of
       them needed. The two maps below say which source topic lands where. */

    var SUBJECTS = [
        { id: 'security', glyph: '🔒', label: 'Security' },
        { id: 'incident', glyph: '🚨', label: 'Incident response' },
        { id: 'osint', glyph: '🔍', label: 'OSINT & forensics' },
        { id: 'network', glyph: '🔌', label: 'Network' },
        { id: 'system', glyph: '⚙️', label: 'System & Windows' },
        { id: 'microsoft', glyph: '🔷', label: 'Microsoft & cloud' },
        { id: 'development', glyph: '💻', label: 'Development' },
        { id: 'opensource', glyph: '🐧', label: 'Open source & Linux' },
        { id: 'selfhost', glyph: '🏠', label: 'Self-host & hosting' },
        { id: 'learning', glyph: '📚', label: 'Learning' },
        { id: 'practice', glyph: '🚩', label: 'Labs & CTF' },
        { id: 'feeds', glyph: '📺', label: 'Podcasts, video & news' },
        { id: 'community', glyph: '💬', label: 'Communities' },
        { id: 'belgium', glyph: '🇧🇪', label: 'Belgium & EU' },
        { id: 'creative', glyph: '🎨', label: 'Media & creative' },
        { id: 'productivity', glyph: '🗂️', label: 'Office & notes' },
        { id: 'ai', glyph: '✨', label: 'AI assistants' },
        { id: 'browser', glyph: '🌍', label: 'Browsers & extensions' },
    ];
    var SUBJECT_BY_ID = {};
    var SUBJECT_ORDER = {};
    SUBJECTS.forEach(function (s, i) { SUBJECT_BY_ID[s.id] = s; SUBJECT_ORDER[s.id] = i; });

    var TOOL_SUBJECT = {
        network: 'network', system: 'system', development: 'development',
        language: 'development', security: 'security', forensics: 'osint',
        microsoft: 'microsoft', media: 'creative', productivity: 'productivity',
        ai: 'ai', browser: 'browser', selfhost: 'selfhost', rdh: 'selfhost',
    };
    var READ_SUBJECT = {
        security: 'security', microsoft: 'microsoft', belgium: 'belgium',
        framework: 'learning', learning: 'learning', ctf: 'practice',
        lab: 'practice', osint: 'osint', incident: 'incident',
        podcast: 'feeds', video: 'feeds', newsletter: 'feeds', forum: 'community',
    };

    /* Events carry a kind and a country, never a topic, so their subject is
       read off their name and tags. It is a signpost, not a label — hence the
       line in the footer saying so. */
    var EVENT_RULES = [
        { s: 'practice', re: /\bctf\b|capture the flag|advent of code|flare-on|hack the box|holiday hack|cyber security challenge|zerodays/ },
        { s: 'opensource', re: /fosdem|open source|logiciel libre|du libre|linux|fossgis|oggcamp|state of open|open knowledge|bsd|nluug|nllgg|froscon|chaos|gulasch|easterhegg|datenspuren|mrmcd|debian|ubuntu/ },
        { s: 'development', re: /devoxx|\bphp\b|\bjava\b|javaland|javascript|react|jsnation|fronteers|python|pycon|pygrunn|breizhcamp|mixit|snowcamp|touraine tech|sunny tech|volcamp|paris web|devops|kubecon|kubernetes|cloud native|cloudnative|devsec|developer|frontend|front-end/ },
        { s: 'microsoft', re: /microsoft|azure|techorama|ignite|visug|experts live|m365|office 365|dotnet|\.net\b/ },
        { s: 'network', re: /\bripe\b|denog|internet days|peering|networking/ },
        { s: 'ai', re: /\bai\b|artificial intelligence|machine learning/ },
        { s: 'community', re: /beltug|owasp|meetup|2600|def con group|isaca|chapter/ },
        { s: 'learning', re: /nerdland|science|training|academy|summit|course|school|university/ },
        { s: 'security', re: /security|securi-tay|cyber|hack|\bsec\b|sec-t|secit|bsides|infosec|pentest|offensive|red team|blue team|malware|forensic|threat|privacy|black hat|chaos communication|congress|troopers|offensivecon|nullcon|deepsec|brucon|sstic|botconf|barbhack|thcon|defcamp|hacktivity|confidence|x33fcon|m0lecon|no hat|rootedcon|euskalhack|disobey|area41|black alps|insomni|steelcon|44con|irisscon|romhack|pass the salt|grehack|sthack|hexacon|wiccon|nahamcon|\bfirst\b|helsec|nook/ },
    ];

    /* What is left over after the rules: this calendar was collected as a
       security and hacker event calendar, so that is the honest default. */
    var EVENT_FALLBACK = { conference: 'security', camp: 'security', expo: 'security', contest: 'practice', training: 'learning', meetup: 'community' };

    function eventSubjects(raw) {
        var hay = (raw.name + ' ' + (raw.tags || '') + ' ' + (raw.kind || '')).toLowerCase();
        var out = [];
        EVENT_RULES.forEach(function (rule) {
            if (rule.re.test(hay) && out.indexOf(rule.s) === -1) out.push(rule.s);
        });
        if (raw.kind === 'camp' && out.indexOf('security') === -1) out.push('security');
        if (!out.length) {
            var fallback = EVENT_FALLBACK[raw.kind] || 'security';
            out.push(fallback);
        }
        return out;
    }

    /* ---- Labels ------------------------------------------------------------ */

    var COST_LABEL = {
        free: { glyph: '💚', text: 'Free' },
        freemium: { glyph: '💎', text: 'Free tier' },
        trial: { glyph: '⏳', text: 'Trial' },
        paid: { glyph: '💳', text: 'Paid' },
    };
    var ACCESS = [
        { id: 'open', glyph: '🌐', label: 'Open to all' },
        { id: 'account', glyph: '🔐', label: 'Account needed' },
    ];
    var ACCESS_BY_ID = {};
    ACCESS.forEach(function (a) { ACCESS_BY_ID[a.id] = a; });
    var CADENCE_LABEL = {
        annual: 'every year',
        biennial: 'every two years',
        quadrennial: 'every four years',
        multi: 'several times a year',
        rolling: 'all year round',
    };

    /* The one contextual picker: it means something different per shelf, so it
       is built from the shelf rather than duplicated three times in the HTML. */
    var FORMATS = {
        tool: { label: 'Runs as', any: 'Any format', opts: TOOL_TYPES, key: 'type' },
        read: { label: 'Access', any: 'Any access', opts: ACCESS, key: 'access' },
        event: { label: 'Kind', any: 'Any kind', opts: EVENT_KINDS, key: 'kind' },
    };

    var SORTS = [
        { id: 'best', label: 'Grouped by subject' },
        { id: 'name', label: 'Name, A to Z' },
        { id: 'name-desc', label: 'Name, Z to A' },
    ];
    var SORT_SOONEST = { id: 'soonest', label: 'Soonest first' };

    var TODAY = new Date().toISOString().slice(0, 10);

    /* A link to a repository is a fact about the entry; a licence is not, so
       the badge says "source", never "open source". */
    var SOURCE_RE = /^https?:\/\/(www\.)?(github\.com|gitlab\.com|codeberg\.org|git\.sr\.ht|bitbucket\.org|sourceforge\.net|gitea\.com)\//i;

    /* ---- Build one working list ------------------------------------------- */

    /* Both catalogues link to pages next to themselves ('./cve/'), which from
       here would resolve one folder too high. */
    function resolve(u, base) {
        if (!u || /^[a-z][a-z0-9+.-]*:/i.test(u) || u.charAt(0) === '/' || u.charAt(0) === '#') return u;
        return base + u.replace(/^\.\//, '');
    }

    function normalise(raw, shelfId, order) {
        var shelf = SHELF_BY_ID[shelfId];
        var item = Object.create(null);
        Object.keys(raw).forEach(function (k) { item[k] = raw[k]; });
        item.shelf = shelfId;
        item.order = order;
        item.links = (Array.isArray(raw.links) ? raw.links : []).map(function (l) {
            return { t: l.t, g: l.g, u: resolve(l.u, shelf.base) };
        });
        item.source = item.links.some(function (l) { return SOURCE_RE.test(l.u); });

        var subs = [];
        var add = function (id) { if (id && SUBJECT_BY_ID[id] && subs.indexOf(id) === -1) subs.push(id); };
        if (shelfId === 'event') {
            eventSubjects(raw).forEach(add);
        } else {
            var map = shelfId === 'tool' ? TOOL_SUBJECT : READ_SUBJECT;
            /* An id the map has not heard of still works if the two lists
               happen to agree on it, so a new topic is never simply lost. */
            (raw.cats || []).forEach(function (id) { add(map[id] || id); });
        }
        subs.sort(function (a, b) { return SUBJECT_ORDER[a] - SUBJECT_ORDER[b]; });
        item.subs = subs;
        item.groupSub = subs[0] || '';

        var words = [raw.name, raw.desc, raw.note || '', raw.tags || '', shelf.label, shelf.from];
        subs.forEach(function (id) { words.push(SUBJECT_BY_ID[id].label); });
        if (shelfId === 'tool') {
            if (TYPE_BY_ID[raw.type]) words.push(TYPE_BY_ID[raw.type].label);
            if (raw.gdpr) words.push('gdpr');
            if (raw.local) words.push('rami.party hosted here');
        } else if (shelfId === 'read') {
            if (ACCESS_BY_ID[raw.access]) words.push(ACCESS_BY_ID[raw.access].label);
        } else {
            var country = COUNTRY_BY_CC[raw.cc];
            if (KIND_BY_ID[raw.kind]) words.push(KIND_BY_ID[raw.kind].label);
            if (country) words.push(country.name);
            words.push(raw.place || '', raw.when || '', raw.next || '', raw.held || '');
            item.upcoming = !!(raw.nextIso && raw.nextIso >= TODAY);
        }
        if (item.source) words.push('open source repository github');
        item.links.forEach(function (l) { words.push(l.t, l.u); });
        item.haystack = words.join(' ').toLowerCase();
        item.sortKey = raw.name.toLowerCase().replace(/^the\s+/, '');
        return item;
    }

    var ITEMS = []
        .concat((window.TOOLS || []).map(function (r, i) { return normalise(r, 'tool', i); }))
        .concat((window.NEWS_RESOURCES || []).map(function (r, i) { return normalise(r, 'read', i); }))
        .concat((window.NEWS_EVENTS || []).map(function (r, i) { return normalise(r, 'event', i); }));

    /* ---- State ------------------------------------------------------------ */

    var state = {
        shelf: '',
        sub: '',
        q: '',
        format: '',
        free: false,
        source: false,
        soon: false,
        where: '',
        sort: 'best',
        view: 'cards',
    };

    var el = {};

    function sorts() {
        return state.shelf === 'event' ? SORTS.slice(0, 1).concat([SORT_SOONEST], SORTS.slice(1)) : SORTS;
    }

    function formatDef() {
        return state.shelf ? FORMATS[state.shelf] : null;
    }

    function readUrl() {
        var p = new URLSearchParams(location.search);

        var shelf = p.get('shelf') || '';
        if (SHELF_BY_ID[shelf]) state.shelf = shelf;

        var sub = p.get('sub') || '';
        if (SUBJECT_BY_ID[sub]) state.sub = sub;

        state.q = (p.get('q') || '').slice(0, 100);
        state.free = p.get('free') === '1';
        state.source = p.get('src') === '1';

        var def = formatDef();
        var format = p.get('format') || '';
        if (def && def.opts.some(function (o) { return o.id === format; })) state.format = format;

        if (state.shelf === 'event') {
            state.soon = p.get('soon') === '1';
            var where = p.get('where') || '';
            if (where === 'near' || where === 'benelux' || COUNTRY_BY_CC[where]) state.where = where;
        }

        var sort = p.get('sort') || '';
        if (sorts().some(function (s) { return s.id === sort; })) state.sort = sort;

        if (p.get('view') === 'compact') state.view = 'compact';
        try {
            if (!p.has('view')) {
                var saved = localStorage.getItem('ost.view');
                if (saved === 'compact' || saved === 'cards') state.view = saved;
            }
        } catch (err) { /* storage blocked, the default view is fine */ }
    }

    function writeUrl() {
        var p = new URLSearchParams();
        if (state.shelf) p.set('shelf', state.shelf);
        if (state.sub) p.set('sub', state.sub);
        if (state.q) p.set('q', state.q);
        if (state.format) p.set('format', state.format);
        if (state.free) p.set('free', '1');
        if (state.source) p.set('src', '1');
        if (state.shelf === 'event' && state.soon) p.set('soon', '1');
        if (state.shelf === 'event' && state.where) p.set('where', state.where);
        if (state.sort !== 'best') p.set('sort', state.sort);
        if (state.view !== 'cards') p.set('view', state.view);
        var qs = p.toString();
        history.replaceState(null, '', qs ? '?' + qs : location.pathname);
    }

    /* ---- Filtering --------------------------------------------------------- */

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
        if (!state.where) return true;
        if (state.where === 'near') return NEIGHBOURS.indexOf(item.cc) !== -1;
        if (state.where === 'benelux') return BENELUX.indexOf(item.cc) !== -1;
        return item.cc === state.where;
    }

    /* Facets every shelf shares, so the shelf counts can stay honest. */
    function passesShared(item, toks) {
        if (!matchesQuery(item, toks)) return false;
        if (state.free && item.cost !== 'free') return false;
        if (state.source && !item.source) return false;
        return true;
    }

    /* Facets that only exist while one shelf is chosen. */
    function passesShelf(item) {
        if (state.shelf && item.shelf !== state.shelf) return false;
        var def = formatDef();
        if (def && state.format && item[def.key] !== state.format) return false;
        if (state.shelf === 'event') {
            if (state.soon && !item.upcoming) return false;
            if (!inRegion(item)) return false;
        }
        return true;
    }

    function hasSubject(item) {
        return !state.sub || item.subs.indexOf(state.sub) !== -1;
    }

    /* Everything except the subject chips, so the chips can show real counts. */
    function preFiltered() {
        var toks = tokens();
        return ITEMS.filter(function (item) { return passesShared(item, toks) && passesShelf(item); });
    }

    function sortItems(list) {
        var toks = tokens();
        var byName = function (a, b) { return a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0; };

        if (state.sort === 'name') return list.slice().sort(byName);
        if (state.sort === 'name-desc') return list.slice().sort(function (a, b) { return byName(b, a); });
        if (state.sort === 'soonest') {
            return list.slice().sort(function (a, b) {
                var ai = a.nextIso || '', bi = b.nextIso || '';
                if (ai && bi) return ai === bi ? byName(a, b) : (ai < bi ? -1 : 1);
                if (ai) return -1;
                if (bi) return 1;
                return byName(a, b);
            });
        }
        /* Typing replaces the grouping with relevance — that is what the box
           is for. */
        if (toks.length) {
            return list.slice().sort(function (a, b) {
                var d = score(b, toks) - score(a, toks);
                return d || byName(a, b);
            });
        }
        return list.slice().sort(function (a, b) {
            var ao = SUBJECT_ORDER[a.groupSub], bo = SUBJECT_ORDER[b.groupSub];
            if (ao === undefined) ao = 99;
            if (bo === undefined) bo = 99;
            if (ao !== bo) return ao - bo;
            if (a.shelf !== b.shelf) return SHELF_BY_ID[a.shelf].order - SHELF_BY_ID[b.shelf].order;
            return a.order - b.order;
        });
    }

    /* ---- Small DOM helpers ------------------------------------------------- */

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

    /* ---- Cards -------------------------------------------------------------- */

    function metaRow(dl, key, value) {
        var wrap = make('div', 'meta__row');
        wrap.appendChild(make('dt', 'meta__key', key));
        wrap.appendChild(make('dd', 'meta__val', value));
        dl.appendChild(wrap);
    }

    function originLink(item) {
        var shelf = SHELF_BY_ID[item.shelf];
        var a = make('a', 'card__origin');
        a.href = shelf.href + (shelf.href.indexOf('?') === -1 ? '?' : '&') + 'q=' + encodeURIComponent(item.name);
        a.appendChild(make('span', 'card__origin-glyph', shelf.glyph));
        a.appendChild(make('span', null, 'in the ' + shelf.from));
        return a;
    }

    function buildCard(item) {
        var card = make('article', 'card card--' + item.shelf);
        card.appendChild(make('h3', 'card__title', item.name));

        var badges = make('ul', 'badges');
        var shelf = SHELF_BY_ID[item.shelf];
        badges.appendChild(badge(shelf.glyph, shelf.label.replace(/s$/, ''), 'shelf'));
        item.subs.forEach(function (id) {
            var s = SUBJECT_BY_ID[id];
            badges.appendChild(badge(s.glyph, s.label, 'sub'));
        });
        if (item.shelf === 'tool' && TYPE_BY_ID[item.type]) {
            badges.appendChild(badge(TYPE_BY_ID[item.type].glyph, TYPE_BY_ID[item.type].label, 'format'));
        }
        if (item.shelf === 'read' && ACCESS_BY_ID[item.access]) {
            badges.appendChild(badge(ACCESS_BY_ID[item.access].glyph, ACCESS_BY_ID[item.access].label, 'format'));
        }
        if (item.shelf === 'event' && KIND_BY_ID[item.kind]) {
            badges.appendChild(badge(KIND_BY_ID[item.kind].glyph, KIND_BY_ID[item.kind].label.replace(/s$/, ''), 'format'));
        }
        if (item.upcoming) badges.appendChild(badge('⏳', 'Still to come', 'soon'));
        var cost = COST_LABEL[item.cost];
        if (cost) badges.appendChild(badge(cost.glyph, cost.text, 'cost'));
        if (item.source) badges.appendChild(badge('🐙', 'Source', 'source'));
        if (item.gdpr) badges.appendChild(badge('🛡️', 'GDPR', 'gdpr'));
        if (item.local) badges.appendChild(badge('📍', 'rami.party', 'local'));
        card.appendChild(badges);

        if (item.shelf === 'event') {
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
        if (item.note) {
            var note = make('p', 'card__note');
            note.appendChild(make('span', 'card__note-glyph', '⚠️'));
            note.appendChild(make('span', null, item.note));
            card.appendChild(note);
        }

        var foot = make('div', 'card__links');
        if (item.links.length) foot.appendChild(linkTo(item.links[0], 'btn btn-primary card__cta'));
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
        foot.appendChild(originLink(item));
        card.appendChild(foot);
        return card;
    }

    /* ---- Shelves ------------------------------------------------------------ */

    function renderShelves() {
        var toks = tokens();
        var pool = ITEMS.filter(function (item) { return passesShared(item, toks) && hasSubject(item); });
        var counts = {};
        pool.forEach(function (item) { counts[item.shelf] = (counts[item.shelf] || 0) + 1; });

        el.shelves.textContent = '';
        el.shelves.appendChild(seg('', '✦', 'Everything', pool.length));
        SHELVES.forEach(function (s) {
            el.shelves.appendChild(seg(s.id, s.glyph, s.label, counts[s.id] || 0));
        });
    }

    function seg(id, glyph, label, count) {
        var btn = make('button', 'seg');
        btn.type = 'button';
        btn.dataset.shelf = id;
        btn.setAttribute('aria-pressed', state.shelf === id ? 'true' : 'false');
        btn.appendChild(make('span', 'seg__glyph', glyph));
        btn.appendChild(make('span', 'seg__text', label));
        btn.appendChild(make('span', 'seg__count', String(count)));
        return btn;
    }

    /* ---- Subject chips ------------------------------------------------------ */

    function renderChips() {
        var pool = preFiltered();
        var counts = {};
        pool.forEach(function (item) {
            item.subs.forEach(function (id) { counts[id] = (counts[id] || 0) + 1; });
        });

        el.chips.textContent = '';
        el.chips.appendChild(chip('', '✦', 'Every subject', pool.length));
        SUBJECTS.forEach(function (s) {
            var n = counts[s.id] || 0;
            if (!n && state.sub !== s.id) return;
            el.chips.appendChild(chip(s.id, s.glyph, s.label, n));
        });
    }

    function chip(id, glyph, label, count) {
        var btn = make('button', 'chip');
        btn.type = 'button';
        btn.dataset.sub = id;
        btn.setAttribute('aria-pressed', state.sub === id ? 'true' : 'false');
        btn.appendChild(make('span', 'chip__glyph', glyph));
        btn.appendChild(make('span', 'chip__text', label));
        btn.appendChild(make('span', 'chip__count', String(count)));
        return btn;
    }

    /* ---- The contextual pickers --------------------------------------------- */

    function renderFormat() {
        var def = formatDef();
        el.formatWrap.hidden = !def;
        if (!def) {
            state.format = '';
            return;
        }
        if (el.format.dataset.builtFor !== state.shelf) {
            el.format.textContent = '';
            var any = make('option', null, def.any);
            any.value = '';
            el.format.appendChild(any);
            def.opts.forEach(function (o) {
                var opt = make('option', null, o.glyph + ' ' + o.label);
                opt.value = o.id;
                el.format.appendChild(opt);
            });
            el.format.dataset.builtFor = state.shelf;
            el.formatLabel.textContent = def.label;
        }
        el.format.value = state.format;
    }

    function renderRegions() {
        if (el.region.dataset.built !== '1') {
            var used = {};
            ITEMS.forEach(function (i) { if (i.shelf === 'event') used[i.cc] = true; });

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
            el.region.dataset.built = '1';
        }
        el.regionWrap.hidden = state.shelf !== 'event';
        el.region.value = state.where;
    }

    function renderSorts() {
        var opts = sorts();
        var signature = opts.map(function (s) { return s.id; }).join(',');
        if (el.sort.dataset.builtFor !== signature) {
            el.sort.textContent = '';
            opts.forEach(function (s) {
                var o = make('option', null, s.label);
                o.value = s.id;
                el.sort.appendChild(o);
            });
            el.sort.dataset.builtFor = signature;
        }
        if (!opts.some(function (s) { return s.id === state.sort; })) state.sort = 'best';
        el.sort.value = state.sort;
    }

    /* ---- Main render --------------------------------------------------------- */

    function render() {
        /* "Soonest first" only exists on the events shelf, so a shelf change
           has to settle the sort before anything is ordered by it. */
        if (!sorts().some(function (s) { return s.id === state.sort; })) state.sort = 'best';
        var list = sortItems(preFiltered().filter(hasSubject));

        renderShelves();
        renderChips();
        renderFormat();
        renderRegions();
        renderSorts();

        el.clearSearch.hidden = !state.q;
        el.freeToggle.setAttribute('aria-pressed', state.free ? 'true' : 'false');
        el.sourceToggle.setAttribute('aria-pressed', state.source ? 'true' : 'false');
        el.soonToggle.hidden = state.shelf !== 'event';
        el.soonToggle.setAttribute('aria-pressed', state.soon ? 'true' : 'false');
        el.viewButtons.forEach(function (btn) {
            btn.setAttribute('aria-pressed', btn.dataset.view === state.view ? 'true' : 'false');
        });

        el.grid.className = 'grid' + (state.view === 'compact' ? ' grid--compact' : '');
        el.grid.textContent = '';
        var frag = document.createDocumentFragment();
        list.forEach(function (item) { frag.appendChild(buildCard(item)); });
        el.grid.appendChild(frag);

        var noun = state.shelf ? SHELF_BY_ID[state.shelf].one : 'entr' + (list.length === 1 ? 'y' : 'ies');
        if (state.shelf) noun += list.length === 1 ? '' : 's';
        el.count.textContent = list.length + ' ' + noun + ' shown';
        el.empty.hidden = list.length !== 0;

        updateFilterSummary();
        writeUrl();
    }

    function activeFilterCount() {
        var n = 0;
        if (state.shelf) n++;
        if (state.sub) n++;
        if (state.format) n++;
        if (state.free) n++;
        if (state.source) n++;
        if (state.shelf === 'event' && state.soon) n++;
        if (state.shelf === 'event' && state.where) n++;
        return n;
    }

    function updateFilterSummary() {
        var n = activeFilterCount();
        el.reset.hidden = !n && !state.q;
        el.filtersCount.hidden = n === 0;
        el.filtersCount.textContent = String(n);
        el.filtersBtn.setAttribute('aria-label', n ? 'Filters, ' + n + ' active' : 'Filters');
    }

    function resetFilters() {
        state.shelf = '';
        state.sub = '';
        state.q = '';
        state.format = '';
        state.free = false;
        state.source = false;
        state.soon = false;
        state.where = '';
        el.searchInput.value = '';
        render();
    }

    /* ---- The filter panel ----------------------------------------------------
       Eighteen subjects make a tall bar, and the bar is sticky, so it folds
       itself away once you are reading results — until you touch the button,
       after which it does exactly what you told it to and nothing else. */

    var panelOpen = true;
    var panelAuto = true;
    var scrolledPast = false;

    function setPanel(open, byUser) {
        if (byUser) {
            panelAuto = false;
            try { localStorage.setItem('ost.filters', open ? 'open' : 'closed'); } catch (err) { /* not important */ }
        }
        if (open === panelOpen) return;
        panelOpen = open;
        el.toolbar.classList.toggle('is-closed', !open);
        el.filtersBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    /* Two thresholds: the panel must not reopen on the reflow its own collapse
       causes. The marker sits above the bar, so folding the bar never moves it. */
    function onScroll() {
        var top = el.anchor.getBoundingClientRect().top;
        scrolledPast = scrolledPast ? top < -40 : top < -200;
        if (panelAuto) setPanel(!scrolledPast, false);
        el.toTop.hidden = (window.scrollY || window.pageYOffset || 0) < 600;
    }

    /* ---- Wiring -------------------------------------------------------------- */

    function debounce(fn, ms) {
        var t;
        return function () {
            clearTimeout(t);
            t = setTimeout(fn, ms);
        };
    }

    function wire() {
        el.shelves.addEventListener('click', function (e) {
            var btn = e.target.closest('.seg');
            if (!btn || btn.dataset.shelf === state.shelf) return;
            state.shelf = btn.dataset.shelf;
            /* The pickers below mean something else on every shelf. */
            state.format = '';
            state.soon = false;
            state.where = '';
            render();
            var again = el.shelves.querySelector('[data-shelf="' + state.shelf + '"]');
            if (again) again.focus();
        });

        el.chips.addEventListener('click', function (e) {
            var btn = e.target.closest('.chip');
            if (!btn) return;
            var id = btn.dataset.sub;
            state.sub = id === state.sub ? '' : id;
            render();
            /* render() replaces the chip that was just clicked. */
            var again = el.chips.querySelector('[data-sub="' + id + '"]');
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
        el.sourceToggle.addEventListener('click', function () { state.source = !state.source; render(); });
        el.soonToggle.addEventListener('click', function () { state.soon = !state.soon; render(); });
        el.format.addEventListener('change', function () { state.format = el.format.value; render(); });
        el.region.addEventListener('change', function () { state.where = el.region.value; render(); });
        el.sort.addEventListener('change', function () { state.sort = el.sort.value; render(); });

        el.viewButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                state.view = btn.dataset.view;
                try { localStorage.setItem('ost.view', state.view); } catch (err) { /* not important */ }
                render();
            });
        });

        el.reset.addEventListener('click', resetFilters);
        el.emptyReset.addEventListener('click', resetFilters);
        el.filtersBtn.addEventListener('click', function () { setPanel(!panelOpen, true); });

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
            el.searchInput.focus();
            el.searchInput.select();
        });

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        el.toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---- Starfield backdrop (self-contained, matches rami.party) ------------- */

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
        draw();
        window.addEventListener('resize', function () {
            cancelAnimationFrame(rafId);
            resize();
            draw();
        });
    }

    /* ---- Boot ----------------------------------------------------------------- */

    function init() {
        el.toolbar = document.getElementById('filterbar');
        el.anchor = document.getElementById('toolbarAnchor');
        el.shelves = document.getElementById('shelves');
        el.chips = document.getElementById('chips');
        el.searchInput = document.getElementById('searchInput');
        el.clearSearch = document.getElementById('clearSearch');
        el.count = document.getElementById('resultCount');
        el.grid = document.getElementById('grid');
        el.empty = document.getElementById('emptyState');
        el.freeToggle = document.getElementById('freeToggle');
        el.sourceToggle = document.getElementById('sourceToggle');
        el.soonToggle = document.getElementById('soonToggle');
        el.formatWrap = document.getElementById('formatWrap');
        el.formatLabel = document.getElementById('formatLabel');
        el.format = document.getElementById('formatSelect');
        el.regionWrap = document.getElementById('regionWrap');
        el.region = document.getElementById('regionSelect');
        el.sort = document.getElementById('sortSelect');
        el.viewButtons = Array.prototype.slice.call(document.querySelectorAll('.view-btn'));
        el.reset = document.getElementById('resetFilters');
        el.emptyReset = document.getElementById('emptyReset');
        el.share = document.getElementById('shareBtn');
        el.shareText = document.getElementById('shareText');
        el.filtersBtn = document.getElementById('filtersBtn');
        el.filtersCount = document.getElementById('filtersCount');
        el.toTop = document.getElementById('toTop');

        readUrl();
        el.searchInput.value = state.q;

        var counts = { tool: 0, read: 0, event: 0 };
        ITEMS.forEach(function (i) { counts[i.shelf]++; });
        document.getElementById('statTools').textContent = counts.tool;
        document.getElementById('statRead').textContent = counts.read;
        document.getElementById('statEvents').textContent = counts.event;
        document.getElementById('statSubjects').textContent = SUBJECTS.length;

        var checked = (window.TOOLS_META || {}).checkedLabel || (window.NEWS_META || {}).checkedLabel;
        if (checked) document.getElementById('checkedOn').textContent = checked;

        try {
            if (localStorage.getItem('ost.filters') === 'closed') setPanel(false, true);
        } catch (err) { /* the panel stays open */ }

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
