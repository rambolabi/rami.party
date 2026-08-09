/* ==========================================================================
   Glamours — renders the spellbook from data.js
   Everything is built with createElement/textContent: this page documents
   code injection, it had better not be injectable itself.
   ========================================================================== */

(function () {
    'use strict';

    var list = document.getElementById('glamour-list');
    if (!list || !Array.isArray(window.GLAMOURS)) return;

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
                copyBtn.textContent = 'Copied ✓';
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
                code.textContent = 'Loading…';
                wrap.hidden = false;
                fetchFile(file).then(function (text) {
                    if (current === file) code.textContent = text;
                }, function () {
                    if (current === file) code.textContent = 'Could not load ' + file + ' — open it directly instead.';
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
            .replace(/\/\*[\s\S]*?\*\//g, ' ')   // strip comments
            .replace(/\s+/g, ' ')                 // collapse whitespace
            .replace(/'/g, "\\'")
            .trim();
        var js = "(function(){var i='rpg-mark-" + id + "',s=document.getElementById(i);" +
            "if(s){s.remove();return}s=document.createElement('style');s.id=i;" +
            "s.textContent='" + css + "';document.documentElement.appendChild(s)})();";
        return 'javascript:' + encodeURIComponent(js);
    }

    /* ---------------- cards ---------------- */

    window.GLAMOURS.forEach(function (g) {
        var card = el('article', 'glamour');
        card.id = g.id;

        var head = el('div', 'g-head');
        head.appendChild(el('span', 'g-glyph', g.glyph || '✨'));
        head.appendChild(el('h3', null, g.title));
        head.appendChild(el('span', 'badge site', g.site));
        (g.kinds || []).forEach(function (k) {
            head.appendChild(el('span', 'badge', k === 'usercss' ? 'CSS-only version' : 'userscript'));
        });
        card.appendChild(head);

        card.appendChild(el('p', 'g-summary', g.summary));

        var viewer = buildViewer();
        var actions = el('div', 'g-actions');

        if (g.files && g.files.userscript) {
            var install = el('a', 'btn primary', '🐒 Install userscript');
            install.href = g.files.userscript;
            install.title = 'With Tampermonkey/Violentmonkey installed, this link opens the install screen.';
            actions.appendChild(install);

            var viewJs = el('button', 'btn', 'View script source');
            viewJs.type = 'button';
            viewJs.addEventListener('click', function () { viewer.show(g.files.userscript); });
            actions.appendChild(viewJs);
        }

        if (g.files && g.files.usercss) {
            var stylus = el('a', 'btn', '🖌️ Install for Stylus');
            stylus.href = g.files.usercss;
            stylus.title = 'With Stylus installed, this link opens its install screen (CSS-only version).';
            actions.appendChild(stylus);

            var viewCss = el('button', 'btn', 'View CSS source');
            viewCss.type = 'button';
            viewCss.addEventListener('click', function () { viewer.show(g.files.usercss); });
            actions.appendChild(viewCss);
        }

        card.appendChild(actions);

        /* Bookmarklet link appears once the usercss has loaded. */
        if (g.bookmarklet && g.files && g.files.usercss) {
            fetchFile(g.files.usercss).then(function (text) {
                var href = buildBookmarklet(text, g.id);
                if (!href) return;
                var mark = el('a', 'btn mark', '🔖 ' + (g.siteName || g.site) + ' comfort');
                mark.href = href;
                mark.title = 'Drag me to your bookmarks bar, then click it on ' + g.site +
                    ' to toggle the CSS tweaks — no extension needed.';
                mark.addEventListener('click', function (e) { e.preventDefault(); });
                actions.appendChild(mark);
                actions.appendChild(el('span', 'badge', '← drag to bookmarks bar'));
            }, function () { /* offline or file:// — skip the bookmarklet */ });
        }

        var cols = el('div', 'g-cols');
        cols.appendChild(fold('🧭 What it does', bullets(g.what), true));
        cols.appendChild(fold('⚙️ How it works', bullets(g.how), false));
        var why = el('p', null, g.why);
        cols.appendChild(fold('💛 Why it\u2019s nice', why, false));
        if (g.caveats && g.caveats.length) {
            cols.appendChild(fold('⚠️ Honest caveats', bullets(g.caveats), false));
        }
        card.appendChild(cols);

        card.appendChild(viewer.node);
        list.appendChild(card);
    });
})();
