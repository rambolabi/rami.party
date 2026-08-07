/* ==========================================================================
   PDF Search
   --------------------------------------------------------------------------
   Searches the text extracted from every PDF on the shelf.

   The one thing worth knowing: the source PDFs are typeset with kerning that
   makes extraction emit spurious spaces inside words, so page 1 of the Cyber
   Resilience Act contains "cybersecur ity" and "REGUL A TION". A plain
   substring search finds nothing. So every page is indexed twice over:

     norm   the text lowercased with ALL whitespace removed, which is what
            queries are matched against, so broken words still match
     map    norm index -> index in the original text, to map hits back for
            snippets and highlighting
     start  per norm character, whether it begins a word in the ORIGINAL text
     end    likewise, whether it ends one

   start/end are what make "Whole words only" meaningful even though the text
   being searched has no spaces left in it.
   ========================================================================== */

(function () {
    'use strict';

    var manifest = window.PDF_SEARCH_MANIFEST || [];
    var docs = [];                 // { id, title, blurb, file, pages:[raw], index:[...] }
    var selected = new Set();
    var indexed = false;
    var lastResults = null;
    var pageCap = 40;                  // result rows drawn before "show the rest"

    var $ = function (id) { return document.getElementById(id); };
    var qInput = $('q');
    var clearBtn = $('clear');
    var wholeBox = $('whole');
    var sortSel = $('sort');
    var docList = $('docs');
    var results = $('results');
    var summary = $('summary');

    /* ---- Text helpers ---------------------------------------------------- */

    function isWordCode(c) {
        return (c >= 48 && c <= 57) || (c >= 97 && c <= 122) || c >= 192;
    }

    function isSpaceCode(c) {
        return c <= 32 || c === 160;
    }

    function buildIndex(raw) {
        var lower = raw.toLowerCase();
        var n = lower.length;
        var map = new Int32Array(n);
        var start = new Uint8Array(n);
        var end = new Uint8Array(n);
        var out = new Array(n);
        var k = 0;

        for (var i = 0; i < n; i++) {
            var c = lower.charCodeAt(i);
            if (isSpaceCode(c)) continue;
            out[k] = lower.charAt(i);
            map[k] = i;
            if (isWordCode(c)) {
                var prev = i > 0 ? lower.charCodeAt(i - 1) : 0;
                var next = i + 1 < n ? lower.charCodeAt(i + 1) : 0;
                start[k] = isWordCode(prev) ? 0 : 1;
                end[k] = isWordCode(next) ? 0 : 1;
            }
            k++;
        }

        return {
            norm: out.slice(0, k).join(''),
            map: map.subarray(0, k),
            start: start.subarray(0, k),
            end: end.subarray(0, k)
        };
    }

    function normalise(s) {
        return s.toLowerCase().replace(/[\s\u00a0]+/g, '');
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    /* ---- Query parsing --------------------------------------------------- */

    function parseQuery(raw) {
        var terms = [];
        var excluded = [];
        var re = /(-?)"([^"]*)"|(-?)(\S+)/g;
        var m;

        while ((m = re.exec(raw)) !== null) {
            var neg = (m[1] || m[3]) === '-';
            var word = m[2] !== undefined ? m[2] : m[4];
            var norm = normalise(word);
            if (!norm) continue;
            (neg ? excluded : terms).push({ raw: word, norm: norm });
        }
        return { terms: terms, excluded: excluded };
    }

    /* ---- Matching -------------------------------------------------------- */

    function findAll(idx, needle, whole) {
        var hits = [];
        var from = 0;
        var len = needle.length;

        for (;;) {
            var at = idx.norm.indexOf(needle, from);
            if (at === -1) break;
            from = at + 1;
            if (whole && !(idx.start[at] === 1 && idx.end[at + len - 1] === 1)) continue;
            hits.push({ s: idx.map[at], e: idx.map[at + len - 1] + 1 });
        }
        return hits;
    }

    function searchPage(idx, query, whole) {
        for (var x = 0; x < query.excluded.length; x++) {
            if (findAll(idx, query.excluded[x].norm, whole).length) return null;
        }

        var all = [];
        for (var t = 0; t < query.terms.length; t++) {
            var hits = findAll(idx, query.terms[t].norm, whole);
            if (!hits.length) return null;                 // every term must appear
            all = all.concat(hits);
        }
        if (!all.length) return null;

        all.sort(function (a, b) { return a.s - b.s; });
        return all;
    }

    /* ---- Snippets -------------------------------------------------------- */

    var PAD = 110;

    function snippets(raw, hits, limit) {
        var out = [];
        var i = 0;

        while (i < hits.length && out.length < limit) {
            var from = Math.max(0, hits[i].s - PAD);
            var to = Math.min(raw.length, hits[i].e + PAD);
            var group = [hits[i]];
            var j = i + 1;

            while (j < hits.length && hits[j].s < to) {
                to = Math.min(raw.length, Math.max(to, hits[j].e + PAD));
                group.push(hits[j]);
                j++;
            }

            // Nudge the window to whole words so snippets don't start mid-syllable.
            while (from > 0 && !isSpaceCode(raw.charCodeAt(from - 1))) from--;
            while (to < raw.length && !isSpaceCode(raw.charCodeAt(to))) to++;

            var html = '';
            var cursor = from;
            for (var g = 0; g < group.length; g++) {
                var h = group[g];
                if (h.s < cursor) continue;                // overlapping terms
                html += escapeHtml(raw.slice(cursor, h.s));
                html += '<mark>' + escapeHtml(raw.slice(h.s, h.e)) + '</mark>';
                cursor = h.e;
            }
            html += escapeHtml(raw.slice(cursor, to));

            out.push((from > 0 ? '… ' : '') + html + (to < raw.length ? ' …' : ''));
            i = j;
        }
        return out;
    }

    /* ---- Loading --------------------------------------------------------- */

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var el = document.createElement('script');
            el.src = src;
            el.onload = resolve;
            el.onerror = function () { reject(new Error('Could not load ' + src)); };
            document.head.appendChild(el);
        });
    }

    function boot() {
        document.body.dataset.state = 'loading';
        if (!manifest.length) {
            document.body.dataset.state = 'ready';
            docList.innerHTML = '<li class="empty">No documents yet. Drop PDFs in <code>pdf/</code> ' +
                'and run <code>python tools/build.py</code>.</li>';
            return;
        }

        Promise.all(manifest.map(function (d) {
            return loadScript('data/' + encodeURIComponent(d.id) + '.js?v=20260806');
        })).then(function () {
            var store = window.PDF_SEARCH_DATA || {};
            docs = manifest.map(function (d) {
                return {
                    id: d.id, title: d.title, blurb: d.blurb, file: d.file,
                    pages: store[d.id] || [], count: d.pages
                };
            });
            docs.forEach(function (d) { selected.add(d.id); });
            renderDocs();
            // Index off the critical path so the shelf paints first.
            setTimeout(buildAll, 0);
        }).catch(function (err) {
            document.body.dataset.state = 'error';
            docList.innerHTML = '<li class="empty">' + escapeHtml(err.message) + '</li>';
        });
    }

    function buildAll() {
        docs.forEach(function (d) {
            d.index = d.pages.map(buildIndex);
        });
        indexed = true;
        document.body.dataset.state = 'ready';
        if (qInput.value.trim()) run();
    }

    /* ---- Rendering ------------------------------------------------------- */

    function renderDocs(hitCounts) {
        docList.innerHTML = '';
        docs.forEach(function (d) {
            var li = document.createElement('li');
            li.className = 'doc' + (selected.has(d.id) ? '' : ' off');

            var cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = selected.has(d.id);
            cb.id = 'cb-' + d.id;
            cb.addEventListener('change', function () {
                if (cb.checked) selected.add(d.id); else selected.delete(d.id);
                li.className = 'doc' + (cb.checked ? '' : ' off');
                run();
            });

            var body = document.createElement('div');
            var label = document.createElement('label');
            label.className = 'doc-title';
            label.htmlFor = cb.id;
            label.textContent = d.title;
            body.appendChild(label);

            if (d.blurb) {
                var blurb = document.createElement('p');
                blurb.className = 'doc-blurb';
                blurb.textContent = d.blurb;
                body.appendChild(blurb);
            }

            var meta = document.createElement('p');
            meta.className = 'doc-meta';
            var pages = document.createElement('span');
            pages.textContent = d.count + ' pages';
            var link = document.createElement('a');
            link.href = 'pdf/' + encodeURIComponent(d.file);
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = 'open the PDF';
            meta.appendChild(pages);
            meta.appendChild(link);
            body.appendChild(meta);

            var hits = document.createElement('span');
            var n = hitCounts ? (hitCounts[d.id] || 0) : null;
            hits.className = 'doc-hits' + (n ? '' : ' zero');
            hits.textContent = n === null ? '' : (n ? n + (n === 1 ? ' hit' : ' hits') : 'no hits');
            if (n === null) hits.hidden = true;

            li.appendChild(cb);
            li.appendChild(body);
            li.appendChild(hits);
            docList.appendChild(li);
        });
    }

    function run() {
        var raw = qInput.value.trim();
        clearBtn.hidden = !raw;

        if (!raw) {
            results.innerHTML = '<p class="hint">Type something above to search across the selected documents.</p>';
            summary.textContent = '';
            lastResults = null;
            renderDocs();
            return;
        }
        if (!indexed) {
            summary.textContent = 'Reading the documents…';
            results.innerHTML = '<p class="hint">Reading the documents. Your search will run the moment they are ready.</p>';
            return;
        }

        var query = parseQuery(raw);
        if (!query.terms.length) {
            results.innerHTML = '<p class="empty">Add at least one word to search for. ' +
                'A query cannot be only exclusions.</p>';
            summary.textContent = '';
            return;
        }

        var whole = wholeBox.checked;
        var groups = [];
        var counts = {};
        var totalHits = 0;
        var totalPages = 0;

        docs.forEach(function (d) {
            counts[d.id] = 0;
            if (!selected.has(d.id) || !d.index) return;

            var pages = [];
            for (var p = 0; p < d.index.length; p++) {
                var hits = searchPage(d.index[p], query, whole);
                if (!hits) continue;
                pages.push({ page: p + 1, hits: hits, raw: d.pages[p] });
                counts[d.id] += hits.length;
            }
            if (!pages.length) return;

            if (sortSel.value === 'relevance') {
                pages.sort(function (a, b) { return b.hits.length - a.hits.length || a.page - b.page; });
            }
            totalHits += counts[d.id];
            totalPages += pages.length;
            groups.push({ doc: d, pages: pages });
        });

        if (sortSel.value === 'relevance') {
            groups.sort(function (a, b) { return counts[b.doc.id] - counts[a.doc.id]; });
        }

        renderDocs(counts);
        lastResults = { query: raw, groups: groups };

        if (!groups.length) {
            var scope = selected.size;
            results.innerHTML = '<p class="empty">Nothing found for <strong>' + escapeHtml(raw) +
                '</strong>' + (scope ? ' in the ' + scope + ' selected document' + (scope === 1 ? '' : 's') :
                    '. No documents are selected') + '.</p>';
            summary.textContent = '0 matches';
            return;
        }

        summary.textContent = totalHits + (totalHits === 1 ? ' match' : ' matches') +
            ' on ' + totalPages + (totalPages === 1 ? ' page' : ' pages') +
            ' in ' + groups.length + (groups.length === 1 ? ' document' : ' documents');

        results.innerHTML = '';
        var drawn = 0;
        var skipped = 0;

        groups.forEach(function (g) {
            var sec = document.createElement('section');
            sec.className = 'rgroup';

            var h = document.createElement('h3');
            h.textContent = g.doc.title + ' ';
            var c = document.createElement('span');
            c.className = 'count';
            c.textContent = '— ' + counts[g.doc.id] + ' on ' + g.pages.length +
                (g.pages.length === 1 ? ' page' : ' pages');
            h.appendChild(c);
            sec.appendChild(h);

            g.pages.forEach(function (p) {
                if (drawn >= pageCap) { skipped++; return; }
                sec.appendChild(renderHit(g.doc, p));
                drawn++;
            });
            results.appendChild(sec);
        });

        if (skipped) {
            var note = document.createElement('p');
            note.className = 'hint';
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'more';
            btn.textContent = 'Show the remaining ' + skipped +
                (skipped === 1 ? ' page' : ' pages');
            btn.addEventListener('click', function () {
                pageCap += 200;
                run();
            });
            note.textContent = 'Showing the first ' + drawn + ' pages. ';
            note.appendChild(btn);
            results.appendChild(note);
        }
    }

    function renderHit(doc, p) {
        var wrap = document.createElement('div');
        wrap.className = 'hit';

        var head = document.createElement('div');
        head.className = 'hit-head';

        var pg = document.createElement('span');
        pg.className = 'hit-page';
        var a = document.createElement('a');
        a.href = 'pdf/' + encodeURIComponent(doc.file) + '#page=' + p.page;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = 'Page ' + p.page;
        pg.appendChild(a);

        var n = document.createElement('span');
        n.className = 'hit-n';
        n.textContent = p.hits.length + (p.hits.length === 1 ? ' match' : ' matches');

        head.appendChild(pg);
        head.appendChild(n);
        wrap.appendChild(head);

        var shown = 2;
        var render = function (limit) {
            Array.prototype.slice.call(wrap.querySelectorAll('.snippet, .more')).forEach(function (el) {
                el.remove();
            });
            var list = snippets(p.raw, p.hits, limit);
            list.forEach(function (html) {
                var el = document.createElement('p');
                el.className = 'snippet';
                el.innerHTML = html;                       // built from escaped text plus <mark>
                wrap.appendChild(el);
            });
            if (p.hits.length > list.length) {
                var more = document.createElement('button');
                more.type = 'button';
                more.className = 'more';
                more.textContent = 'Show more from this page';
                more.addEventListener('click', function () { render(limit + 4); });
                wrap.appendChild(more);
            }
        };
        render(shown);

        return wrap;
    }

    /* ---- Copy ------------------------------------------------------------ */

    function copyResults() {
        if (!lastResults || !lastResults.groups.length) return;
        var lines = ['# PDF Search: ' + lastResults.query, ''];

        lastResults.groups.forEach(function (g) {
            lines.push('## ' + g.doc.title);
            g.pages.forEach(function (p) {
                var text = snippets(p.raw, p.hits, 1)[0] || '';
                lines.push('- p.' + p.page + ' (' + p.hits.length + '): ' +
                    text.replace(/<\/?mark>/g, '**').replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                        .replace(/&quot;/g, '"').replace(/&#39;/g, "'"));
            });
            lines.push('');
        });

        var text = lines.join('\n');
        var done = function () {
            var btn = $('copy');
            var old = btn.textContent;
            btn.textContent = 'Copied';
            setTimeout(function () { btn.textContent = old; }, 1400);
        };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(done, function () { });
        } else {
            var ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); done(); } catch (e) { }
            ta.remove();
        }
    }

    /* ---- Wiring ---------------------------------------------------------- */

    var timer;
    qInput.addEventListener('input', function () {
        clearTimeout(timer);
        pageCap = 40;                  // a new query starts from the top again
        timer = setTimeout(run, 130);
    });
    qInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { qInput.value = ''; run(); }
    });

    clearBtn.addEventListener('click', function () {
        qInput.value = '';
        run();
        qInput.focus();
    });

    wholeBox.addEventListener('change', run);
    sortSel.addEventListener('change', run);
    $('copy').addEventListener('click', copyResults);

    $('all').addEventListener('click', function () {
        docs.forEach(function (d) { selected.add(d.id); });
        renderDocs();
        run();
    });
    $('none').addEventListener('click', function () {
        selected.clear();
        renderDocs();
        run();
    });

    Array.prototype.forEach.call(document.querySelectorAll('.chip'), function (btn) {
        btn.addEventListener('click', function () {
            qInput.value = btn.dataset.q;
            run();
            qInput.focus();
        });
    });

    document.addEventListener('keydown', function (e) {
        var el = document.activeElement;
        var typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
        var shortcut = (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) ||
            (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey));
        if (!shortcut) return;
        e.preventDefault();
        qInput.focus();
        qInput.select();
    });

    boot();
})();
