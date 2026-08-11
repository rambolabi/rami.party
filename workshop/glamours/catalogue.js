/* ==========================================================================
   Scripts catalogue: search, filter, render.
   Everything is built with createElement/textContent: this page documents
   code injection, so it had better not be injectable itself.
   ========================================================================== */

(function () {
    'use strict';

    var list = document.getElementById('glamour-list');
    if (!list || !Array.isArray(window.GLAMOURS)) return;

    var searchBox = document.getElementById('q');
    var chipBar = document.getElementById('chips');
    var countOut = document.getElementById('count');
    var empty = document.getElementById('empty');

    /* ---------------- tiny DOM helpers ---------------- */

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    function bullets(items) {
        var ul = document.createElement('ul');
        (items || []).forEach(function (item) {
            var li = document.createElement('li');
            li.textContent = item;
            ul.appendChild(li);
        });
        return ul;
    }

    function fold(title, bodyNode, open) {
        var d = document.createElement('details');
        if (open) d.open = true;
        var s = el('summary', null, title);
        var b = el('div', 'g-body');
        b.appendChild(bodyNode);
        d.appendChild(s);
        d.appendChild(b);
        return d;
    }

    /* ---------------- code viewer ---------------- */

    var fileCache = {};

    function fetchFile(name) {
        if (!fileCache[name]) {
            fileCache[name] = fetch(name, { cache: 'no-cache' }).then(function (r) {
                if (!r.ok) throw new Error(r.status);
                return r.text();
            });
        }
        return fileCache[name];
    }

    function buildViewer() {
        var wrap = el('div', 'code-view');
        wrap.hidden = true;

        var bar = el('div', 'code-bar');
        var label = el('span', null, '');
        var spacer = el('span', 'spacer');
        var copyBtn = el('button', null, 'Copy');
        copyBtn.type = 'button';
        var closeBtn = el('button', null, 'Close');
        closeBtn.type = 'button';
        bar.appendChild(label);
        bar.appendChild(spacer);
        bar.appendChild(copyBtn);
        bar.appendChild(closeBtn);

        var pre = document.createElement('pre');
        var code = document.createElement('code');
        pre.appendChild(code);
        wrap.appendChild(bar);
        wrap.appendChild(pre);

        var current = '';

        copyBtn.addEventListener('click', function () {
            navigator.clipboard.writeText(code.textContent).then(function () {
                copyBtn.textContent = 'Copied';
                setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1600);
            }, function () {
                copyBtn.textContent = 'Copy failed';
                setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1600);
            });
        });
        closeBtn.addEventListener('click', function () { wrap.hidden = true; current = ''; });

        return {
            node: wrap,
            show: function (file) {
                if (!wrap.hidden && current === file) { wrap.hidden = true; current = ''; return; }
                current = file;
                label.textContent = file;
                code.textContent = 'Loading...';
                wrap.hidden = false;
                fetchFile(file).then(function (text) {
                    if (current === file) code.textContent = text;
                }, function () {
                    if (current === file) code.textContent = 'Could not load ' + file + ', open it directly instead.';
                });
            }
        };
    }

    /* ---------------- bookmarklet from the usercss markers ---------------- */

    function buildBookmarklet(cssText, id) {
        var start = cssText.indexOf('bookmarklet:start');
        var end = cssText.indexOf('/* bookmarklet:end');
        if (start === -1 || end === -1) return null;
        var chunk = cssText.slice(cssText.indexOf('*/', start) + 2, end);
        var css = chunk
            .replace(/\/\*[\s\S]*?\*\//g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        var js = '(function(){var i=' + JSON.stringify('rpg-mark-' + id) + ',s=document.getElementById(i);' +
            'if(s){s.remove();return}s=document.createElement("style");s.id=i;' +
            's.textContent=' + JSON.stringify(css) + ';document.documentElement.appendChild(s)})();';
        return 'javascript:' + encodeURIComponent(js);
    }

    /* ---------------- bookmarklet from a userscript ----------------
       The whole script travels inside the bookmark, so it keeps the promise
       the userscript makes: nothing is fetched at click time. Comments are
       dropped, but only when they own the whole line, because a blind regex
       would eat the "//" in every URL in the file. */

    function stripComments(src) {
        var meta = src.indexOf('// ==/UserScript==');
        if (meta !== -1) src = src.slice(src.indexOf('\n', meta) + 1);
        var out = [];
        var inBlock = false;
        src.split('\n').forEach(function (line) {
            var t = line.trim();
            if (inBlock) {
                var close = t.indexOf('*/');
                if (close === -1) return;
                inBlock = false;
                t = t.slice(close + 2).trim();
                if (t) out.push(t);
                return;
            }
            if (t.indexOf('/*') === 0) {
                var end = t.indexOf('*/');
                if (end === -1) { inBlock = true; return; }
                t = t.slice(end + 2).trim();
                if (t) out.push(t);
                return;
            }
            if (t.indexOf('//') === 0) return;
            if (t) out.push(t);
        });
        return out.join('\n');
    }

    function buildJsBookmarklet(jsText) {
        var code = stripComments(jsText);
        if (!code) return null;
        return 'javascript:' + encodeURIComponent(code + ';void 0;');
    }

    /* ---------------- cards ---------------- */

    var cards = [];

    function statusBadge(g) {
        var done = g.status === 'complete';
        var b = el('span', 'badge ' + (done ? 'done' : 'wip'), done ? 'Completed' : 'WIP');
        b.title = done ? 'Completed' : 'Work in progress';
        return b;
    }

    function haystack(g) {
        return [g.title, g.site, g.siteName, g.summary, g.why, g.status === 'complete' ? 'completed' : 'work in progress']
            .concat(g.what || [], g.how || [], g.caveats || [], g.kinds || [], g.tags || [])
            .join(' ')
            .toLowerCase();
    }

    window.GLAMOURS.forEach(function (g) {
        var card = el('article', 'glamour');
        card.id = g.id;

        var head = el('div', 'g-head');
        head.appendChild(el('span', 'g-glyph', g.glyph || '*'));
        head.appendChild(el('h3', null, g.title));
        head.appendChild(statusBadge(g));
        head.appendChild(el('span', 'badge site', g.site));
        (g.kinds || []).forEach(function (k) {
            head.appendChild(el('span', 'badge', k === 'usercss' ? 'CSS-only version' : 'userscript'));
        });
        if (g.bookmarklet) head.appendChild(el('span', 'badge', 'bookmarklet'));
        card.appendChild(head);

        card.appendChild(el('p', 'g-summary', g.summary));

        if (g.tags && g.tags.length) {
            var tagRow = el('div', 'g-tags');
            g.tags.forEach(function (t) {
                var tag = el('button', 'tag', t);
                tag.type = 'button';
                tag.title = 'Search for ' + t;
                tag.addEventListener('click', function () {
                    if (searchBox) { searchBox.value = t; apply(); searchBox.focus(); }
                });
                tagRow.appendChild(tag);
            });
            card.appendChild(tagRow);
        }

        var viewer = buildViewer();
        var actions = el('div', 'g-actions');

        if (g.files && g.files.userscript) {
            var install = el('a', 'btn primary', 'Install userscript');
            install.href = g.files.userscript;
            install.title = 'With Tampermonkey or Violentmonkey installed, this link opens the install screen.';
            actions.appendChild(install);

            var viewJs = el('button', 'btn', 'View source');
            viewJs.type = 'button';
            viewJs.addEventListener('click', function () { viewer.show(g.files.userscript); });
            actions.appendChild(viewJs);
        }

        card.appendChild(actions);

        /* The bookmarklet carries the whole script, so its source is only
           fetched once the card is actually on screen. With a long library
           that is the difference between one request and all of them. */
        if (g.bookmarklet) {
            var fromScript = g.bookmarklet === 'userscript';
            var source = fromScript ? (g.files && g.files.userscript) : (g.files && g.files.usercss);
            if (source) {
                card.__loadMark = function () {
                    card.__loadMark = null;
                    fetchFile(source).then(function (text) {
                        var href = fromScript ? buildJsBookmarklet(text) : buildBookmarklet(text, g.id);
                        if (!href) return;
                        var mark = el('a', 'btn mark', 'Bookmarklet: ' + (g.markName || g.siteName || g.site));
                        mark.href = href;
                        mark.title = fromScript
                            ? 'Drag me to your bookmarks bar, then click me on any page to run ' + g.title +
                              ' there without an extension. Click again to hide the panel.'
                            : 'Drag me to your bookmarks bar, then click me on ' + g.site +
                              ' to toggle the CSS tweaks without an extension.';
                        mark.addEventListener('click', function (e) { e.preventDefault(); });
                        actions.appendChild(mark);
                        actions.appendChild(el('span', 'badge', 'drag to bookmarks bar'));
                    }, function () { /* offline or file://, skip the bookmarklet */ });
                };
            }
        }

        var cols = el('div', 'g-cols');
        cols.appendChild(fold('What it does', bullets(g.what), false));
        cols.appendChild(fold('How it works', bullets(g.how), false));
        cols.appendChild(fold('Why it\u2019s nice', el('p', null, g.why), false));
        if (g.caveats && g.caveats.length) {
            cols.appendChild(fold('Limitations', bullets(g.caveats), false));
        }
        card.appendChild(cols);

        card.appendChild(viewer.node);
        list.appendChild(card);

        cards.push({ node: card, text: haystack(g), site: g.site, kinds: g.kinds || [], bookmarklet: !!g.bookmarklet });
    });

    /* ---------------- search and filters ---------------- */

    var activeChip = 'all';

    function chipMatches(c) {
        if (activeChip === 'all') return true;
        if (activeChip === 'usercss') return c.kinds.indexOf('usercss') !== -1;
        if (activeChip === 'bookmarklet') return c.bookmarklet;
        return c.site === activeChip;
    }

    function apply() {
        var q = (searchBox ? searchBox.value : '').trim().toLowerCase();
        var words = q ? q.split(/\s+/) : [];
        var shown = 0;
        cards.forEach(function (c) {
            var hit = chipMatches(c) && words.every(function (w) { return c.text.indexOf(w) !== -1; });
            c.node.hidden = !hit;
            if (hit) shown++;
        });
        if (countOut) {
            countOut.textContent = shown === cards.length
                ? cards.length + (cards.length === 1 ? ' script' : ' scripts')
                : shown + ' of ' + cards.length + ' scripts';
        }
        if (empty) empty.hidden = shown !== 0;
    }

    /* One chip per site, plus the cross-cutting ones. */
    if (chipBar) {
        var sites = [];
        cards.forEach(function (c) { if (sites.indexOf(c.site) === -1) sites.push(c.site); });
        var chips = [['all', 'All']];
        sites.forEach(function (s) { chips.push([s, s === 'any site' ? 'Any site' : s]); });
        chips.push(['usercss', 'Has a CSS-only version']);
        chips.push(['bookmarklet', 'Runs from a bookmark']);

        chips.forEach(function (c) {
            var b = el('button', 'chip', c[1]);
            b.type = 'button';
            b.setAttribute('aria-pressed', String(c[0] === 'all'));
            b.addEventListener('click', function () {
                activeChip = c[0];
                Array.prototype.forEach.call(chipBar.children, function (other) {
                    other.setAttribute('aria-pressed', String(other === b));
                });
                apply();
            });
            chipBar.appendChild(b);
        });
    }

    if (searchBox) {
        searchBox.addEventListener('input', apply);
        searchBox.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { searchBox.value = ''; apply(); }
        });
        /* "/" is the search key everywhere else, so it is here too. */
        document.addEventListener('keydown', function (e) {
            if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey &&
                document.activeElement !== searchBox) {
                e.preventDefault();
                searchBox.focus();
            }
        });
        var preset = new URLSearchParams(location.search).get('q');
        if (preset) searchBox.value = preset;
    }

    apply();

    /* A link straight to one script should open that one. */
    if (location.hash) {
        var target = document.getElementById(location.hash.slice(1));
        if (target && target.classList.contains('glamour')) {
            target.hidden = false;
            var first = target.querySelector('details');
            if (first) first.open = true;
            target.scrollIntoView();
        }
    }

    /* Only cards that reach the screen pay for their bookmarklet source. */
    if (window.IntersectionObserver) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                io.unobserve(entry.target);
                if (entry.target.__loadMark) entry.target.__loadMark();
            });
        }, { rootMargin: '300px' });
        cards.forEach(function (c) { io.observe(c.node); });
    } else {
        cards.forEach(function (c) { if (c.node.__loadMark) c.node.__loadMark(); });
    }
})();
