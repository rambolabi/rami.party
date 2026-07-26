/* ==========================================================================
   Markdown Studio — 100% local, zero external dependencies.
   Features: local parser, XSS sanitiser, syntax highlighting, mermaid-style
   diagrams, TOC, slash commands, find & replace, multi-document tabs, linting,
   themes, export, autosave, sync-scroll, Vim mode, PWA offline support.
   ========================================================================== */
(function () {
    'use strict';

    /* --- Storage keys ----------------------------------------------------- */
    const K = {
        docs: 'md-studio:docs',
        active: 'md-studio:active',
        theme: 'md-studio:theme',
        vim: 'md-studio:vim',
        hl: 'md-studio:highlight',
        legacy: 'md-studio:doc'
    };

    const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* quota */ } };

    const THEMES = [
        { id: 'aurora', name: 'Aurora', sw: ['#a855f7', '#22d3ee'] },
        { id: 'midnight', name: 'Midnight', sw: ['#3b82f6', '#38bdf8'] },
        { id: 'solar', name: 'Solar', sw: ['#b58900', '#cb4b16'] },
        { id: 'nord', name: 'Nord', sw: ['#5e81ac', '#88c0d0'] },
        { id: 'dracula', name: 'Dracula', sw: ['#bd93f9', '#ff79c6'] },
        { id: 'rose', name: 'Rosé Pine', sw: ['#c4a7e7', '#ebbcba'] },
        { id: 'matrix', name: 'Matrix', sw: ['#00ff66', '#008f39'] },
        { id: 'paper', name: 'Paper', sw: ['#2563eb', '#db2777'] },
        { id: 'sunset', name: 'Sunset', sw: ['#fb923c', '#f472b6'] },
        { id: 'cyberpunk', name: 'Cyberpunk', sw: ['#ff00c8', '#00f0ff'] }
    ];

    const STARTER = [
        '# Welcome to Markdown Studio ✨',
        '',
        'A fast, **private**, fully-offline editor. Nothing you type ever leaves this device.',
        '',
        '## Everything you need',
        '',
        '- **Bold**, *italic*, ~~strikethrough~~ and `inline code`',
        '- Ordered and unordered lists',
        '- [x] Task lists',
        '- [ ] …that stay in sync',
        '- [Links](https://example.com) and images',
        '',
        '> Tip: press **/** for slash commands, `Ctrl+F` to find, `Ctrl+B` for bold.',
        '',
        '```js',
        'function greet(name) {',
        '  // syntax highlighted, locally',
        '  return `Hello, ${name}!`;',
        '}',
        '```',
        '',
        '### Diagrams work too',
        '',
        '```mermaid',
        'graph TD',
        'A[Write] --> B{Preview}',
        'B --> C[Export]',
        'B --> D[Share]',
        '```',
        '',
        '| Feature | Local? |',
        '| ------- | ------ |',
        '| Parser  | Yes    |',
        '| Privacy | Always |',
        '',
        '---',
        '',
        'Happy writing!'
    ].join('\n');

    const $ = (id) => document.getElementById(id);
    const html = document.documentElement;
    const body = document.body;
    const input = $('markdown-input');
    const output = $('preview-output');

    /* ====================================================================== *
     *  SYNTAX HIGHLIGHTING (local, generic tokenizer)
     * ====================================================================== */
    const KEYWORDS = {
        default: 'break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield await async of static get set null true false undefined NaN',
        json: 'true false null',
        python: 'def class return if elif else for while in and or not is None True False import from as with try except finally raise lambda yield global nonlocal pass break continue assert del print self async await',
        css: 'important important',
        bash: 'if then else elif fi for while do done case esac function return echo export local read cd exit',
        sql: 'select from where insert update delete create table drop alter join left right inner outer on group by order having limit as and or not null values into set distinct'
    };
    const HASH_COMMENT = new Set(['python', 'py', 'bash', 'sh', 'shell', 'yaml', 'yml', 'toml', 'ini', 'ruby', 'rb', 'r', 'perl']);

    function esc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function highlightCode(code, lang) {
        lang = (lang || '').toLowerCase();
        const kwSet = new Set((KEYWORDS[lang] || KEYWORDS.default).split(/\s+/));
        const useHash = HASH_COMMENT.has(lang);
        let out = '';
        let i = 0;
        const n = code.length;
        const wrap = (cls, txt) => `<span class="tok-${cls}">${esc(txt)}</span>`;

        while (i < n) {
            const rest = code.slice(i);
            let m;
            // Block comment
            if ((m = /^\/\*[\s\S]*?\*\//.exec(rest))) { out += wrap('comment', m[0]); i += m[0].length; continue; }
            // Line comment
            if (rest.startsWith('//') || (useHash && rest[0] === '#')) {
                const end = rest.indexOf('\n'); const seg = end === -1 ? rest : rest.slice(0, end);
                out += wrap('comment', seg); i += seg.length; continue;
            }
            // Strings
            if ((m = /^"(?:\\.|[^"\\])*"?|^'(?:\\.|[^'\\])*'?|^`(?:\\.|[^`\\])*`?/.exec(rest)) && /['"`]/.test(rest[0])) {
                out += wrap('string', m[0]); i += m[0].length; continue;
            }
            // Numbers
            if ((m = /^\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\b/i.exec(rest))) {
                out += wrap('number', m[0]); i += m[0].length; continue;
            }
            // Identifiers / keywords
            if ((m = /^[A-Za-z_$][\w$]*/.exec(rest))) {
                const word = m[0];
                if (kwSet.has(word)) out += wrap('keyword', word);
                else if (code[i + word.length] === '(') out += wrap('func', word);
                else out += esc(word);
                i += word.length; continue;
            }
            // Punctuation / operators
            if ((m = /^[{}()[\]]+/.exec(rest))) { out += wrap('punct', m[0]); i += m[0].length; continue; }
            if ((m = /^[+\-*/%=<>!&|^~?:.,;]+/.exec(rest))) { out += wrap('op', m[0]); i += m[0].length; continue; }
            // Any other single char
            out += esc(code[i]); i += 1;
        }
        return out;
    }

    /* ====================================================================== *
     *  MARKDOWN PARSER
     * ====================================================================== */
    function inline(text) {
        const codes = [];
        text = text.replace(/`([^`]+)`/g, (_, c) => {
            codes.push('<code>' + esc(c) + '</code>');
            return '\u0000' + (codes.length - 1) + '\u0000';
        });
        text = esc(text);
        text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
            (_, alt, url, title) => `<img src="${url}" alt="${alt}"${title ? ` title="${title}"` : ''}>`);
        text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
            (_, txt, url, title) => `<a href="${url}"${title ? ` title="${title}"` : ''}>${txt}</a>`);
        text = text.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (_, pre, url) => `${pre}<a href="${url}">${url}</a>`);
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        text = text.replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>');
        text = text.replace(/(^|[^_])_([^_\s][^_]*?)_/g, '$1<em>$2</em>');
        text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
        text = text.replace(/==([^=]+)==/g, '<mark>$1</mark>');
        text = text.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[+i]);
        return text;
    }

    const tableRow = (line) => line.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

    function parseMarkdown(src) {
        const lines = src.replace(/\r\n?/g, '\n').split('\n');
        let out = '';
        let i = 0;
        while (i < lines.length) {
            const line = lines[i];
            const fence = line.match(/^\s*(```|~~~)(.*)$/);
            if (fence) {
                const marker = fence[1];
                const lang = fence[2].trim().replace(/[^a-z0-9+#-]/gi, '');
                const buf = [];
                i++;
                while (i < lines.length && !lines[i].trim().startsWith(marker)) { buf.push(lines[i]); i++; }
                i++;
                const codeText = buf.join('\n');
                if (/^(mermaid|graph|flowchart)$/i.test(lang)) {
                    out += `<pre class="mermaid-src" hidden>${esc(codeText)}</pre>`;
                } else {
                    const hlEnabled = lsGet(K.hl) !== 'off';
                    const bodyHtml = hlEnabled ? highlightCode(codeText, lang) : esc(codeText);
                    out += `<pre><code${lang ? ` class="language-${lang}"` : ''}>${bodyHtml}</code></pre>`;
                }
                continue;
            }
            if (/^\s*$/.test(line)) { i++; continue; }
            if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out += '<hr>'; i++; continue; }
            const h = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
            if (h) { out += `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`; i++; continue; }
            if (/^\s*>/.test(line)) {
                const buf = [];
                while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
                out += `<blockquote>${parseMarkdown(buf.join('\n'))}</blockquote>`;
                continue;
            }
            if (/\|/.test(line) && i + 1 < lines.length &&
                /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && /-/.test(lines[i + 1])) {
                const header = tableRow(line);
                const aligns = tableRow(lines[i + 1]).map((c) => {
                    const l = c.startsWith(':'), r = c.endsWith(':');
                    return l && r ? 'center' : r ? 'right' : l ? 'left' : '';
                });
                i += 2;
                const thead = '<tr>' + header.map((c, idx) =>
                    `<th${aligns[idx] ? ` style="text-align:${aligns[idx]}"` : ''}>${inline(c)}</th>`).join('') + '</tr>';
                let rows = '';
                while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim() !== '') {
                    const cells = tableRow(lines[i]);
                    rows += '<tr>' + cells.map((c, idx) =>
                        `<td${aligns[idx] ? ` style="text-align:${aligns[idx]}"` : ''}>${inline(c)}</td>`).join('') + '</tr>';
                    i++;
                }
                out += `<table><thead>${thead}</thead><tbody>${rows}</tbody></table>`;
                continue;
            }
            if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
                const ordered = /^\s*\d+\.\s+/.test(line);
                const buf = [];
                while (i < lines.length && (/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) ||
                    (/^\s{2,}\S/.test(lines[i]) && buf.length))) { buf.push(lines[i]); i++; }
                out += renderList(buf, ordered);
                continue;
            }
            const para = [];
            while (i < lines.length && !/^\s*$/.test(lines[i]) &&
                !/^\s*(#{1,6}\s|>|```|~~~|([-*_])(\s*\2){2,}\s*$)/.test(lines[i]) &&
                !/^\s*([-*+]|\d+\.)\s+/.test(lines[i])) { para.push(lines[i]); i++; }
            if (para.length) out += `<p>${inline(para.join('\n')).replace(/\n/g, '<br>')}</p>`;
        }
        return out;
    }

    function renderList(items, ordered) {
        let out = ordered ? '<ol>' : '<ul>';
        for (const raw of items) {
            const m = raw.match(/^\s*(?:[-*+]|\d+\.)\s+(.*)$/);
            if (!m) continue;
            const task = m[1].match(/^\[([ xX])\]\s+(.*)$/);
            if (task) {
                const checked = task[1].toLowerCase() === 'x';
                out += `<li class="task"><input type="checkbox" disabled${checked ? ' checked' : ''}> ${inline(task[2])}</li>`;
            } else out += `<li>${inline(m[1])}</li>`;
        }
        return out + (ordered ? '</ol>' : '</ul>');
    }

    /* ====================================================================== *
     *  SANITISER
     * ====================================================================== */
    const ALLOWED = new Set(['A', 'P', 'BR', 'HR', 'EM', 'STRONG', 'DEL', 'MARK', 'CODE', 'PRE',
        'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI',
        'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'IMG', 'INPUT', 'KBD', 'SPAN']);
    const SAFE_URL = /^(https?:|mailto:|tel:|#|\/|\.\/|\.\.\/|data:image\/(png|jpe?g|gif|webp|svg\+xml);)/i;

    function sanitize(dirty) {
        const tpl = document.createElement('template');
        tpl.innerHTML = dirty;
        (function walk(node) {
            for (const child of Array.from(node.childNodes)) {
                if (child.nodeType === 1) {
                    const tag = child.tagName;
                    if (!ALLOWED.has(tag)) { child.remove(); continue; }
                    // keep hidden mermaid-src placeholders through (PRE + class)
                    for (const attr of Array.from(child.attributes)) {
                        const name = attr.name.toLowerCase();
                        if (name.startsWith('on')) { child.removeAttribute(attr.name); continue; }
                        if ((name === 'href' || name === 'src') && !SAFE_URL.test(attr.value.trim())) {
                            child.removeAttribute(attr.name); continue;
                        }
                        if (!['href', 'src', 'alt', 'title', 'class', 'style', 'type',
                            'checked', 'disabled', 'hidden'].includes(name)) child.removeAttribute(attr.name);
                    }
                    if (tag === 'A') { child.setAttribute('rel', 'noopener noreferrer'); child.setAttribute('target', '_blank'); }
                    walk(child);
                } else if (child.nodeType === 8) child.remove();
            }
        })(tpl.content);
        return tpl.innerHTML;
    }

    const renderHtml = (md) => sanitize(parseMarkdown(md));

    /* ====================================================================== *
     *  MERMAID-STYLE DIAGRAMS (local SVG, built via DOM = XSS-safe)
     * ====================================================================== */
    const SVGNS = 'http://www.w3.org/2000/svg';
    function svgEl(name, attrs) {
        const el = document.createElementNS(SVGNS, name);
        for (const k in attrs) el.setAttribute(k, attrs[k]);
        return el;
    }

    function parseGraph(src) {
        const lines = src.split('\n').map((l) => l.trim()).filter(Boolean);
        let dir = 'TD';
        const nodes = new Map();
        const edges = [];
        const ensure = (id, label, shape) => {
            if (!nodes.has(id)) nodes.set(id, { id, label: label || id, shape: shape || 'rect' });
            else if (label) { nodes.get(id).label = label; nodes.get(id).shape = shape || nodes.get(id).shape; }
            return nodes.get(id);
        };
        const nodeRe = /([A-Za-z0-9_]+)(?:(\[)([^\]]*)\]|(\()([^)]*)\)|(\{)([^}]*)\})?/;
        const parseNode = (token) => {
            const m = nodeRe.exec(token.trim());
            if (!m) return null;
            const id = m[1];
            let label = m[3] ?? m[5] ?? m[7];
            let shape = m[2] ? 'rect' : m[4] ? 'round' : m[6] ? 'diamond' : 'rect';
            return ensure(id, label, shape);
        };
        for (const line of lines) {
            let m;
            if ((m = /^(graph|flowchart)\s+(TD|TB|LR|RL|BT)/i.exec(line))) { dir = m[2].toUpperCase(); continue; }
            const edge = /^(.+?)\s*(-->|---|-\.->|==>)\s*(?:\|([^|]*)\|\s*)?(.+)$/.exec(line);
            if (edge) {
                const a = parseNode(edge[1]); const b = parseNode(edge[4]);
                if (a && b) edges.push({ from: a.id, to: b.id, label: edge[3] || '' });
                continue;
            }
            parseNode(line);
        }
        return { dir, nodes, edges };
    }

    function renderGraph(src) {
        const { dir, nodes, edges } = parseGraph(src);
        if (!nodes.size) return null;
        // Rank via longest path (topological-ish; tolerates cycles).
        const rank = new Map();
        [...nodes.keys()].forEach((id) => rank.set(id, 0));
        for (let pass = 0; pass < nodes.size; pass++) {
            let changed = false;
            for (const e of edges) {
                if (rank.get(e.to) < rank.get(e.from) + 1) { rank.set(e.to, rank.get(e.from) + 1); changed = true; }
            }
            if (!changed) break;
        }
        const byRank = new Map();
        for (const [id, r] of rank) { if (!byRank.has(r)) byRank.set(r, []); byRank.get(r).push(id); }
        const horizontal = dir === 'LR' || dir === 'RL';
        const NW = 130, NH = 46, GAPX = 60, GAPY = 46;
        const pos = new Map();
        let maxCross = 0;
        for (const [r, ids] of byRank) maxCross = Math.max(maxCross, ids.length);
        for (const [r, ids] of byRank) {
            ids.forEach((id, idx) => {
                const cross = idx - (ids.length - 1) / 2;
                if (horizontal) {
                    pos.set(id, { x: r * (NW + GAPX) + NW / 2 + 20, y: (maxCross / 2 + cross) * (NH + GAPY) + NH / 2 + 20 });
                } else {
                    pos.set(id, { x: (maxCross / 2 + cross) * (NW + GAPX) + NW / 2 + 20, y: r * (NH + GAPY) + NH / 2 + 20 });
                }
            });
        }
        let W = 40, H = 40;
        for (const p of pos.values()) { W = Math.max(W, p.x + NW / 2 + 20); H = Math.max(H, p.y + NH / 2 + 20); }

        const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'diagram', width: W, height: H });
        const defs = svgEl('defs', {});
        const marker = svgEl('marker', { id: 'arrow', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' });
        marker.appendChild(svgEl('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'var(--accent)' }));
        defs.appendChild(marker);
        svg.appendChild(defs);

        // Edges
        for (const e of edges) {
            const a = pos.get(e.from), b = pos.get(e.to);
            if (!a || !b) continue;
            const line = svgEl('line', {
                x1: a.x, y1: a.y, x2: b.x, y2: b.y,
                stroke: 'var(--accent)', 'stroke-width': '2', 'marker-end': 'url(#arrow)', opacity: '0.75'
            });
            svg.appendChild(line);
            if (e.label) {
                const t = svgEl('text', { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 4, 'text-anchor': 'middle', class: 'diagram-edge-label' });
                t.textContent = e.label;
                const bg = svgEl('rect', { class: 'diagram-edge-bg' });
                svg.appendChild(bg); svg.appendChild(t);
                // size bg after text is in DOM later; approximate now
                bg.setAttribute('x', (a.x + b.x) / 2 - e.label.length * 3.6 - 4);
                bg.setAttribute('y', (a.y + b.y) / 2 - 16);
                bg.setAttribute('width', e.label.length * 7.2 + 8);
                bg.setAttribute('height', 16);
                bg.setAttribute('rx', 4);
            }
        }
        // Nodes
        for (const [id, node] of nodes) {
            const p = pos.get(id);
            if (!p) continue;
            const g = svgEl('g', { class: 'diagram-node' });
            if (node.shape === 'diamond') {
                g.appendChild(svgEl('polygon', {
                    points: `${p.x},${p.y - NH / 2} ${p.x + NW / 2},${p.y} ${p.x},${p.y + NH / 2} ${p.x - NW / 2},${p.y}`,
                    class: 'diagram-shape'
                }));
            } else {
                g.appendChild(svgEl('rect', {
                    x: p.x - NW / 2, y: p.y - NH / 2, width: NW, height: NH,
                    rx: node.shape === 'round' ? NH / 2 : 10, class: 'diagram-shape'
                }));
            }
            const t = svgEl('text', { x: p.x, y: p.y, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'diagram-label' });
            t.textContent = node.label;
            g.appendChild(t);
            svg.appendChild(g);
        }
        return svg;
    }

    function renderDiagrams() {
        output.querySelectorAll('pre.mermaid-src').forEach((pre) => {
            const wrap = document.createElement('div');
            wrap.className = 'diagram-wrap';
            let svg = null;
            try { svg = renderGraph(pre.textContent); } catch (e) { svg = null; }
            if (svg) wrap.appendChild(svg);
            else { const err = document.createElement('div'); err.className = 'diagram-error'; err.textContent = 'Could not render diagram'; wrap.appendChild(err); }
            pre.replaceWith(wrap);
        });
    }

    /* ====================================================================== *
     *  PREVIEW · STATS · LINT · TOC
     * ====================================================================== */
    function slugify(s) {
        return s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') || 'section';
    }

    function buildTOC() {
        const drawer = $('toc-list');
        if (!drawer) return;
        const heads = output.querySelectorAll('h1, h2, h3, h4, h5, h6');
        drawer.innerHTML = '';
        const seen = {};
        if (!heads.length) { drawer.innerHTML = '<p class="toc-empty">No headings yet.</p>'; return; }
        heads.forEach((h) => {
            let id = slugify(h.textContent);
            seen[id] = (seen[id] || 0) + 1;
            if (seen[id] > 1) id += '-' + seen[id];
            h.id = id;
            const a = document.createElement('a');
            a.href = '#' + id;
            a.textContent = h.textContent;
            a.className = 'toc-l' + h.tagName[1];
            a.addEventListener('click', (e) => { e.preventDefault(); h.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
            drawer.appendChild(a);
        });
    }

    function lint(text) {
        const issues = [];
        const lines = text.split('\n');
        let fences = 0;
        lines.forEach((ln, idx) => {
            const no = idx + 1;
            if (/^\s*(```|~~~)/.test(ln)) fences++;
            if (/[ \t]+$/.test(ln) && ln.trim() !== '') issues.push({ line: no, msg: 'Trailing whitespace' });
            if (/^#{1,6}[^#\s]/.test(ln)) issues.push({ line: no, msg: 'Add a space after #' });
            if (/\]\(\s*\)/.test(ln)) issues.push({ line: no, msg: 'Empty link URL' });
            if (idx > 0 && ln.trim() === '' && lines[idx - 1].trim() === '' && (idx < 2 || lines[idx - 2].trim() === ''))
                issues.push({ line: no, msg: 'Multiple blank lines' });
        });
        if (fences % 2 !== 0) issues.push({ line: lines.length, msg: 'Unclosed code fence' });
        return issues;
    }

    function updateLint(text) {
        const issues = lint(text);
        const badge = $('lint-count');
        badge.textContent = issues.length ? issues.length + (issues.length === 1 ? ' hint' : ' hints') : 'No issues';
        badge.classList.toggle('has-issues', issues.length > 0);
        const list = $('lint-list');
        if (!list) return;
        list.innerHTML = '';
        if (!issues.length) { list.innerHTML = '<p class="toc-empty">Looks clean. ✨</p>'; return; }
        issues.forEach((iss) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.innerHTML = `<span class="lint-line">L${iss.line}</span> ${iss.msg}`;
            b.addEventListener('click', () => gotoLine(iss.line));
            list.appendChild(b);
        });
    }

    function gotoLine(line) {
        const lines = input.value.split('\n');
        let pos = 0;
        for (let i = 0; i < line - 1 && i < lines.length; i++) pos += lines[i].length + 1;
        input.focus();
        input.setSelectionRange(pos, pos + (lines[line - 1] || '').length);
        const ratio = (line - 1) / Math.max(1, lines.length);
        input.scrollTop = ratio * (input.scrollHeight - input.clientHeight);
    }

    let previewTimer = null;
    function updatePreview() {
        output.innerHTML = renderHtml(input.value);
        renderDiagrams();
        buildTOC();
        updateStats();
        updateLint(input.value);
    }
    function schedulePreview() {
        clearTimeout(previewTimer);
        previewTimer = setTimeout(updatePreview, 80);
    }

    function updateStats() {
        const text = input.value;
        const words = (text.trim().match(/\S+/g) || []).length;
        const chars = text.length;
        const lines = text === '' ? 0 : text.split('\n').length;
        const mins = Math.max(1, Math.round(words / 200));
        $('stat-words').textContent = words + (words === 1 ? ' word' : ' words');
        $('stat-chars').textContent = chars + (chars === 1 ? ' character' : ' characters');
        $('stat-lines').textContent = lines + (lines === 1 ? ' line' : ' lines');
        $('stat-read').textContent = words ? mins + ' min read' : '0 min read';
    }

    /* ====================================================================== *
     *  DOCUMENT MANAGER (tabs, multi-doc, autosave)
     * ====================================================================== */
    const genId = () => 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    let docs = [];
    let activeId = null;

    function loadDocs() {
        let raw = lsGet(K.docs);
        if (raw) {
            try { docs = JSON.parse(raw) || []; } catch (e) { docs = []; }
        }
        if (!docs.length) {
            const legacy = lsGet(K.legacy);
            docs = [{ id: genId(), name: 'Untitled', content: (legacy && legacy.trim()) ? legacy : STARTER }];
        }
        activeId = lsGet(K.active);
        if (!docs.find((d) => d.id === activeId)) activeId = docs[0].id;
    }

    const activeDoc = () => docs.find((d) => d.id === activeId) || docs[0];

    function persistDocs() {
        lsSet(K.docs, JSON.stringify(docs));
        lsSet(K.active, activeId);
    }

    function renderTabs() {
        const bar = $('tabbar');
        bar.querySelectorAll('.tab').forEach((t) => t.remove());
        const addBtn = $('new-tab');
        docs.forEach((d) => {
            const tab = document.createElement('div');
            tab.className = 'tab' + (d.id === activeId ? ' active' : '');
            tab.dataset.id = d.id;
            const name = document.createElement('span');
            name.className = 'tab-name';
            name.textContent = d.name;
            name.title = 'Double-click to rename';
            tab.appendChild(name);
            const close = document.createElement('button');
            close.className = 'tab-close';
            close.type = 'button';
            close.textContent = '×';
            close.title = 'Close';
            close.addEventListener('click', (e) => { e.stopPropagation(); closeDoc(d.id); });
            tab.appendChild(close);
            tab.addEventListener('click', () => switchDoc(d.id));
            name.addEventListener('dblclick', (e) => { e.stopPropagation(); renameDoc(d.id, name); });
            bar.insertBefore(tab, addBtn);
        });
    }

    function switchDoc(id, skipSave) {
        if (!skipSave) syncActiveContent();
        activeId = id;
        input.value = activeDoc().content;
        persistDocs();
        renderTabs();
        updatePreview();
        markSaved();
        input.focus();
    }

    function newDoc() {
        syncActiveContent();
        const d = { id: genId(), name: 'Untitled', content: '' };
        docs.push(d);
        switchDoc(d.id, true);
    }

    function closeDoc(id) {
        const idx = docs.findIndex((d) => d.id === id);
        if (idx === -1) return;
        if (docs[idx].content.trim() && !confirm('Close "' + docs[idx].name + '"? Unsaved text in this tab is discarded.')) return;
        docs.splice(idx, 1);
        if (!docs.length) docs.push({ id: genId(), name: 'Untitled', content: '' });
        if (activeId === id) activeId = docs[Math.max(0, idx - 1)].id;
        input.value = activeDoc().content;
        persistDocs();
        renderTabs();
        updatePreview();
    }

    function renameDoc(id, nameEl) {
        const d = docs.find((x) => x.id === id);
        if (!d) return;
        const inp = document.createElement('input');
        inp.className = 'tab-rename';
        inp.value = d.name;
        nameEl.replaceWith(inp);
        inp.focus(); inp.select();
        const commit = () => {
            d.name = inp.value.trim() || 'Untitled';
            persistDocs(); renderTabs();
        };
        inp.addEventListener('blur', commit);
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); inp.blur(); }
            if (e.key === 'Escape') { inp.value = d.name; inp.blur(); }
        });
    }

    function syncActiveContent() {
        const d = activeDoc();
        if (d) d.content = input.value;
    }

    /* --- Autosave --------------------------------------------------------- */
    let saveTimer = null;
    const saveState = $('save-state');
    function markSaved() { saveState.textContent = 'Saved'; saveState.className = 'save-state saved'; }
    function scheduleSave() {
        saveState.textContent = 'Saving…';
        saveState.className = 'save-state saving';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => { syncActiveContent(); persistDocs(); markSaved(); }, 500);
    }

    /* ====================================================================== *
     *  TOOLBAR ACTIONS
     * ====================================================================== */
    function surround(before, after, placeholder) {
        const start = input.selectionStart, end = input.selectionEnd;
        const sel = input.value.slice(start, end) || placeholder || '';
        input.setRangeText(before + sel + after, start, end, 'end');
        input.selectionStart = start + before.length;
        input.selectionEnd = start + before.length + sel.length;
        input.focus();
        onInput();
    }
    function prefixLines(prefix, numbered) {
        const start = input.selectionStart, end = input.selectionEnd;
        const value = input.value;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const block = value.slice(lineStart, end);
        let n = 1;
        const replaced = block.split('\n').map((l) => (numbered ? (n++) + '. ' : prefix) + l).join('\n');
        input.setRangeText(replaced, lineStart, end, 'end');
        input.focus();
        onInput();
    }
    const ACTIONS = {
        bold: () => surround('**', '**', 'bold text'),
        italic: () => surround('*', '*', 'italic text'),
        strike: () => surround('~~', '~~', 'strikethrough'),
        code: () => surround('`', '`', 'code'),
        codeblock: () => surround('\n```\n', '\n```\n', 'code here'),
        link: () => surround('[', '](https://)', 'link text'),
        image: () => surround('![', '](https://)', 'alt text'),
        h1: () => prefixLines('# '),
        h2: () => prefixLines('## '),
        quote: () => prefixLines('> '),
        ul: () => prefixLines('- '),
        ol: () => prefixLines('', true),
        task: () => prefixLines('- [ ] '),
        hr: () => surround('\n\n---\n\n', '', ''),
        table: () => surround('\n| Column A | Column B |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n', '', ''),
        mermaid: () => surround('\n```mermaid\ngraph TD\nA[Start] --> B[End]\n```\n', '', ''),
        date: () => surround(new Date().toISOString().slice(0, 10), '', '')
    };
    document.querySelectorAll('.toolbar [data-action]').forEach((btn) =>
        btn.addEventListener('click', () => { const fn = ACTIONS[btn.dataset.action]; if (fn) fn(); }));

    /* ====================================================================== *
     *  SLASH COMMAND MENU
     * ====================================================================== */
    const SLASH = [
        { key: 'h1', label: 'Heading 1', hint: '# ' }, { key: 'h2', label: 'Heading 2', hint: '## ' },
        { key: 'h3', label: 'Heading 3', hint: '### ' }, { key: 'bold', label: 'Bold', hint: '**' },
        { key: 'italic', label: 'Italic', hint: '*' }, { key: 'quote', label: 'Quote', hint: '>' },
        { key: 'ul', label: 'Bullet list', hint: '-' }, { key: 'ol', label: 'Numbered list', hint: '1.' },
        { key: 'task', label: 'Task item', hint: '[ ]' }, { key: 'code', label: 'Inline code', hint: '`' },
        { key: 'codeblock', label: 'Code block', hint: '```' }, { key: 'table', label: 'Table', hint: '▦' },
        { key: 'mermaid', label: 'Diagram', hint: 'graph' }, { key: 'hr', label: 'Divider', hint: '---' },
        { key: 'link', label: 'Link', hint: '🔗' }, { key: 'image', label: 'Image', hint: '🖼' },
        { key: 'date', label: 'Today’s date', hint: '📅' }
    ];
    const slashMenu = $('slash-menu');
    let slashOpen = false, slashStart = -1, slashItems = [], slashIdx = 0;

    function caretCoords(pos) {
        const div = document.createElement('div');
        const s = getComputedStyle(input);
        ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'padding',
            'border', 'boxSizing', 'whiteSpace', 'wordWrap', 'width', 'tabSize'].forEach((p) => div.style[p] = s[p]);
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordWrap = 'break-word';
        div.textContent = input.value.slice(0, pos);
        const span = document.createElement('span');
        span.textContent = '\u200b';
        div.appendChild(span);
        document.body.appendChild(div);
        const r = input.getBoundingClientRect();
        const top = r.top + span.offsetTop - input.scrollTop + parseInt(s.lineHeight || '20');
        const left = r.left + span.offsetLeft - input.scrollLeft;
        document.body.removeChild(div);
        return { top, left };
    }

    function openSlash() {
        slashStart = input.selectionStart;
        slashOpen = true; slashIdx = 0;
        filterSlash('');
        const c = caretCoords(input.selectionStart);
        slashMenu.style.top = Math.min(window.innerHeight - 260, c.top) + 'px';
        slashMenu.style.left = Math.min(window.innerWidth - 230, c.left) + 'px';
        slashMenu.hidden = false;
    }
    function closeSlash() { slashOpen = false; slashMenu.hidden = true; }
    function filterSlash(q) {
        slashItems = SLASH.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()) || c.key.includes(q.toLowerCase()));
        slashIdx = 0;
        slashMenu.innerHTML = '';
        if (!slashItems.length) { closeSlash(); return; }
        slashItems.forEach((c, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = i === slashIdx ? 'active' : '';
            b.innerHTML = `<span>${c.label}</span><kbd>${c.hint}</kbd>`;
            b.addEventListener('mousedown', (e) => { e.preventDefault(); runSlash(c); });
            slashMenu.appendChild(b);
        });
    }
    function moveSlash(delta) {
        slashIdx = (slashIdx + delta + slashItems.length) % slashItems.length;
        [...slashMenu.children].forEach((b, i) => b.classList.toggle('active', i === slashIdx));
    }
    function runSlash(cmd) {
        const pos = input.selectionStart;
        input.setRangeText('', slashStart - 1, pos, 'end'); // remove "/query"
        closeSlash();
        if (ACTIONS[cmd.key]) ACTIONS[cmd.key]();
        else onInput();
    }

    /* ====================================================================== *
     *  FIND & REPLACE
     * ====================================================================== */
    const findBar = $('find-bar');
    const findInput = $('find-input');
    const replaceInput = $('replace-input');
    let findMatches = [], findPos = -1;

    function openFind() {
        findBar.hidden = false;
        const sel = input.value.slice(input.selectionStart, input.selectionEnd);
        if (sel && !sel.includes('\n')) findInput.value = sel;
        findInput.focus(); findInput.select();
        runFind();
    }
    function closeFind() { findBar.hidden = true; input.focus(); }
    function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    function runFind() {
        const q = findInput.value;
        findMatches = [];
        if (q) {
            const re = new RegExp(escapeRe(q), 'gi');
            let m;
            while ((m = re.exec(input.value))) { findMatches.push([m.index, m.index + m[0].length]); if (m.index === re.lastIndex) re.lastIndex++; }
        }
        findPos = findMatches.length ? 0 : -1;
        $('find-count').textContent = findMatches.length ? (findPos + 1) + '/' + findMatches.length : (q ? '0/0' : '');
        if (findPos >= 0) selectMatch();
    }
    function selectMatch() {
        const m = findMatches[findPos];
        if (!m) return;
        input.focus();
        input.setSelectionRange(m[0], m[1]);
        const before = input.value.slice(0, m[0]).split('\n').length;
        input.scrollTop = ((before - 1) / Math.max(1, input.value.split('\n').length)) * (input.scrollHeight - input.clientHeight);
        $('find-count').textContent = (findPos + 1) + '/' + findMatches.length;
    }
    function stepFind(delta) { if (!findMatches.length) return; findPos = (findPos + delta + findMatches.length) % findMatches.length; selectMatch(); }
    function replaceOne() {
        if (findPos < 0 || !findMatches[findPos]) return;
        const m = findMatches[findPos];
        input.setRangeText(replaceInput.value, m[0], m[1], 'end');
        onInput(); runFind();
    }
    function replaceAll() {
        const q = findInput.value;
        if (!q) return;
        input.value = input.value.split(new RegExp(escapeRe(q), 'gi')).join(replaceInput.value);
        onInput(); runFind();
    }

    /* ====================================================================== *
     *  DRAWERS (TOC / Lint)
     * ====================================================================== */
    function toggleDrawer(name) {
        const el = $(name + '-drawer');
        const opening = el.hidden;
        document.querySelectorAll('.drawer').forEach((d) => { d.hidden = true; });
        el.hidden = !opening;
    }

    /* ====================================================================== *
     *  THEMES
     * ====================================================================== */
    const themeMenu = $('theme-menu');
    function applyTheme(id) {
        const theme = THEMES.find((t) => t.id === id) || THEMES[0];
        html.setAttribute('data-theme', theme.id);
        $('theme-name').textContent = theme.name;
        lsSet(K.theme, theme.id);
        const meta = $('meta-theme'); if (meta) meta.setAttribute('content', getComputedStyle(html).getPropertyValue('--bg-1').trim());
        themeMenu.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.theme === theme.id));
    }
    THEMES.forEach((t) => {
        const b = document.createElement('button');
        b.type = 'button'; b.setAttribute('role', 'menuitem'); b.dataset.theme = t.id;
        b.innerHTML = `<span class="swatch" style="--sw1:${t.sw[0]};--sw2:${t.sw[1]}"></span>${t.name}`;
        b.addEventListener('click', () => { applyTheme(t.id); closeMenus(); });
        themeMenu.appendChild(b);
    });

    /* ====================================================================== *
     *  MENUS
     * ====================================================================== */
    function closeMenus() {
        document.querySelectorAll('.menu-list').forEach((m) => { m.hidden = true; });
        document.querySelectorAll('.menu > button').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    }
    function toggleMenu(btn, menu) {
        const willOpen = menu.hidden; closeMenus(); menu.hidden = !willOpen;
        btn.setAttribute('aria-expanded', String(willOpen));
    }
    $('theme-btn').addEventListener('click', (e) => { e.stopPropagation(); toggleMenu($('theme-btn'), themeMenu); });
    $('export-btn').addEventListener('click', (e) => { e.stopPropagation(); toggleMenu($('export-btn'), $('export-menu')); });
    $('view-btn').addEventListener('click', (e) => { e.stopPropagation(); toggleMenu($('view-btn'), $('view-menu')); });
    document.addEventListener('click', closeMenus);

    /* ====================================================================== *
     *  EXPORT
     * ====================================================================== */
    function download(filename, content, mime) {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    function standaloneHtml() {
        const cs = getComputedStyle(html);
        const bodyHtml = renderHtml(input.value);
        const g = (v) => cs.getPropertyValue(v).trim();
        return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${activeDoc().name}</title>
<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.7;max-width:820px;margin:40px auto;padding:0 20px;color:${g('--text')};background:${g('--bg-0')};}
a{color:${g('--accent-2')};}pre,code{font-family:ui-monospace,Consolas,monospace;background:${g('--code-bg')};border-radius:6px;}
pre{padding:14px;overflow:auto;}code{padding:2px 5px;}table{border-collapse:collapse;}th,td{border:1px solid #8884;padding:6px 10px;}
blockquote{border-left:3px solid ${g('--accent')};margin:0;padding-left:1em;opacity:.85;}img{max-width:100%;}hr{border:none;border-top:1px solid #8884;}
.tok-keyword{color:${g('--accent')};}.tok-string{color:${g('--accent-2')};}.tok-comment{opacity:.6;font-style:italic;}.tok-number{color:${g('--accent-3')};}.tok-func{color:${g('--accent-2')};}
</style></head><body>${bodyHtml}</body></html>`;
    }
    async function copy(text) {
        try { await navigator.clipboard.writeText(text); flash('Copied to clipboard'); }
        catch (e) {
            const ta = document.createElement('textarea');
            ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); flash('Copied to clipboard'); } catch (_) { flash('Copy failed'); }
            ta.remove();
        }
    }
    $('export-menu').addEventListener('click', (e) => {
        const t = e.target.closest('[data-export]'); if (!t) return;
        const nm = (activeDoc().name || 'document').replace(/[^\w.-]+/g, '_');
        switch (t.dataset.export) {
            case 'md': download(nm + '.md', input.value, 'text/markdown'); break;
            case 'html': download(nm + '.html', standaloneHtml(), 'text/html'); break;
            case 'copy-html': copy(renderHtml(input.value)); break;
            case 'copy-md': copy(input.value); break;
            case 'print': window.print(); break;
        }
        closeMenus();
    });

    /* ====================================================================== *
     *  TOAST
     * ====================================================================== */
    let toastEl = null, toastTimer = null;
    function flash(msg) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'toast'; toastEl.setAttribute('role', 'status');
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = msg; toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
    }

    /* ====================================================================== *
     *  FILE OPEN · DRAG&DROP · CLEAR
     * ====================================================================== */
    function loadFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            syncActiveContent();
            const d = { id: genId(), name: file.name.replace(/\.[^.]+$/, ''), content: String(reader.result) };
            docs.push(d); switchDoc(d.id, true); flash('Opened ' + file.name);
        };
        reader.readAsText(file);
    }
    $('file-input').addEventListener('change', (e) => loadFile(e.target.files[0]));
    ['dragover', 'drop'].forEach((ev) => window.addEventListener(ev, (e) => e.preventDefault()));
    window.addEventListener('drop', (e) => { const f = e.dataTransfer && e.dataTransfer.files[0]; if (f) loadFile(f); });
    $('clear-btn').addEventListener('click', () => {
        if (input.value.trim() === '' || confirm('Clear the current document?')) { input.value = ''; onInput(); input.focus(); }
    });

    /* ====================================================================== *
     *  PREVIEW TOGGLE (mobile)
     * ====================================================================== */
    const togglePreview = $('toggle-preview');
    function setPreviewHidden(hidden) {
        body.classList.toggle('preview-hidden', hidden);
        togglePreview.textContent = hidden ? '👁 Preview' : '✎ Editor';
        togglePreview.setAttribute('aria-pressed', String(!hidden));
    }
    setPreviewHidden(true);
    togglePreview.addEventListener('click', () => setPreviewHidden(!body.classList.contains('preview-hidden')));

    /* ====================================================================== *
     *  RESIZABLE DIVIDER
     * ====================================================================== */
    const divider = $('divider'), workspace = $('workspace');
    let dragging = false;
    divider.addEventListener('pointerdown', (e) => { dragging = true; divider.classList.add('dragging'); divider.setPointerCapture(e.pointerId); });
    divider.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const rect = workspace.getBoundingClientRect();
        let ratio = Math.min(0.8, Math.max(0.2, (e.clientX - rect.left) / rect.width));
        document.querySelector('.editor-pane').style.flex = `0 0 ${ratio * 100}%`;
        document.querySelector('.preview-pane').style.flex = `1 1 ${(1 - ratio) * 100}%`;
    });
    divider.addEventListener('pointerup', () => { dragging = false; divider.classList.remove('dragging'); });

    /* ====================================================================== *
     *  SYNC SCROLL
     * ====================================================================== */
    let syncing = false;
    function linkScroll(a, b) {
        a.addEventListener('scroll', () => {
            if (syncing) { syncing = false; return; }
            const ratio = a.scrollTop / (a.scrollHeight - a.clientHeight || 1);
            syncing = true; b.scrollTop = ratio * (b.scrollHeight - b.clientHeight);
        });
    }
    linkScroll(input, output); linkScroll(output, input);

    /* ====================================================================== *
     *  VIM MODE
     * ====================================================================== */
    const Vim = {
        enabled: false, mode: 'normal', register: '', pending: '', count: '',
        visualAnchor: 0,
        badge: $('vim-badge'),
        setMode(m) {
            this.mode = m;
            this.badge.textContent = '-- ' + m.toUpperCase() + ' --';
            this.badge.className = 'vim-badge ' + m;
        },
        enable(on) {
            this.enabled = on;
            lsSet(K.vim, on ? 'on' : 'off');
            this.badge.hidden = !on;
            body.classList.toggle('vim-on', on);
            if (on) { this.setMode('normal'); input.blur(); }
            const chk = $('vim-toggle'); if (chk) chk.setAttribute('aria-checked', String(on));
            const vt = $('vim-toggle'); if (vt) vt.classList.toggle('active', on);
        },
        lineBounds(pos) {
            const v = input.value;
            const start = v.lastIndexOf('\n', pos - 1) + 1;
            let end = v.indexOf('\n', pos); if (end === -1) end = v.length;
            return { start, end };
        },
        move(pos) { input.selectionStart = input.selectionEnd = Math.max(0, Math.min(input.value.length, pos)); },
        handle(e) {
            if (!this.enabled) return false;
            if (this.mode === 'insert') {
                if (e.key === 'Escape') { e.preventDefault(); this.setMode('normal'); const p = input.selectionStart; this.move(p); return true; }
                return false; // let typing through
            }
            // normal / visual
            const key = e.key;
            if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta') return false;
            e.preventDefault();
            const v = input.value;
            let pos = input.selectionStart;
            const num = this.count ? parseInt(this.count) : 1;

            const applySel = () => { if (this.mode === 'visual') input.setSelectionRange(Math.min(this.visualAnchor, input.selectionStart), Math.max(this.visualAnchor, input.selectionStart)); };

            if (/^[0-9]$/.test(key) && !(key === '0' && this.count === '')) { this.count += key; return true; }

            switch (key) {
                case 'i': this.setMode('insert'); input.focus(); break;
                case 'a': this.move(pos + 1); this.setMode('insert'); input.focus(); break;
                case 'I': { const b = this.lineBounds(pos); this.move(b.start); this.setMode('insert'); input.focus(); break; }
                case 'A': { const b = this.lineBounds(pos); this.move(b.end); this.setMode('insert'); input.focus(); break; }
                case 'o': { const b = this.lineBounds(pos); this.move(b.end); input.setRangeText('\n', b.end, b.end, 'end'); this.setMode('insert'); input.focus(); break; }
                case 'O': { const b = this.lineBounds(pos); input.setRangeText('\n', b.start, b.start, 'start'); this.move(b.start); this.setMode('insert'); input.focus(); break; }
                case 'h': this.move(pos - num); applySel(); break;
                case 'l': this.move(pos + num); applySel(); break;
                case 'j': { for (let k = 0; k < num; k++) { const b = this.lineBounds(input.selectionStart); const col = input.selectionStart - b.start; const nb = this.lineBounds(b.end + 1); this.move(Math.min(nb.start + col, nb.end)); } applySel(); break; }
                case 'k': { for (let k = 0; k < num; k++) { const b = this.lineBounds(input.selectionStart); const col = input.selectionStart - b.start; if (b.start === 0) break; const pb = this.lineBounds(b.start - 1); this.move(Math.min(pb.start + col, pb.end)); } applySel(); break; }
                case '0': { const b = this.lineBounds(pos); this.move(b.start); applySel(); break; }
                case '$': { const b = this.lineBounds(pos); this.move(b.end); applySel(); break; }
                case 'w': { const m = /\W*\w+/.exec(v.slice(pos)); this.move(pos + (m ? m[0].length : 1)); applySel(); break; }
                case 'b': { const m = /\w+\W*$/.exec(v.slice(0, pos)); this.move(m ? pos - m[0].length : pos - 1); applySel(); break; }
                case 'G': this.move(v.length); applySel(); break;
                case 'g': if (this.pending === 'g') { this.move(0); this.pending = ''; applySel(); } else this.pending = 'g'; break;
                case 'x': { input.setRangeText('', pos, Math.min(v.length, pos + num), 'start'); onInput(); break; }
                case 'D': { const b = this.lineBounds(pos); this.register = v.slice(pos, b.end); input.setRangeText('', pos, b.end, 'start'); onInput(); break; }
                case 'd':
                    if (this.pending === 'd') { const b = this.lineBounds(pos); this.register = v.slice(b.start, Math.min(v.length, b.end + 1)); input.setRangeText('', b.start, Math.min(v.length, b.end + 1), 'start'); this.move(b.start); this.pending = ''; onInput(); }
                    else if (this.mode === 'visual') { const s = input.selectionStart, en = input.selectionEnd; this.register = v.slice(s, en); input.setRangeText('', s, en, 'start'); this.setMode('normal'); onInput(); }
                    else this.pending = 'd';
                    break;
                case 'y':
                    if (this.pending === 'y') { const b = this.lineBounds(pos); this.register = v.slice(b.start, Math.min(v.length, b.end + 1)); this.pending = ''; flash('Yanked line'); }
                    else if (this.mode === 'visual') { this.register = v.slice(input.selectionStart, input.selectionEnd); this.setMode('normal'); this.move(input.selectionStart); flash('Yanked'); }
                    else this.pending = 'y';
                    break;
                case 'p': if (this.register) { const at = pos + 1; input.setRangeText(this.register, at, at, 'end'); onInput(); } break;
                case 'P': if (this.register) { input.setRangeText(this.register, pos, pos, 'end'); onInput(); } break;
                case 'v': if (this.mode === 'visual') { this.setMode('normal'); this.move(input.selectionStart); } else { this.visualAnchor = pos; this.setMode('visual'); } break;
                case 'u': document.execCommand('undo'); onInput(); break;
                case '/': openFind(); break;
                case 'Escape': this.setMode('normal'); this.pending = ''; this.count = ''; this.move(input.selectionStart); break;
                default: break;
            }
            if (key !== 'g' && key !== 'd' && key !== 'y') this.pending = '';
            if (!/^[0-9]$/.test(key)) this.count = '';
            return true;
        }
    };

    /* ====================================================================== *
     *  INPUT PIPELINE + KEYBOARD
     * ====================================================================== */
    function onInput() { schedulePreview(); scheduleSave(); }

    input.addEventListener('input', () => {
        onInput();
        if (slashOpen) {
            const q = input.value.slice(slashStart, input.selectionStart);
            if (/[^\w]/.test(q) || input.selectionStart < slashStart) closeSlash();
            else filterSlash(q);
        }
    });

    input.addEventListener('keydown', (e) => {
        // Slash menu navigation
        if (slashOpen && !e.ctrlKey && !e.metaKey) {
            if (e.key === 'ArrowDown') { e.preventDefault(); moveSlash(1); return; }
            if (e.key === 'ArrowUp') { e.preventDefault(); moveSlash(-1); return; }
            if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); runSlash(slashItems[slashIdx]); return; }
            if (e.key === 'Escape') { e.preventDefault(); closeSlash(); return; }
        }
        // Vim
        if (Vim.enabled && Vim.handle(e)) return;

        const mod = e.ctrlKey || e.metaKey;
        if (e.key === '/' && !mod && !slashOpen && (!Vim.enabled || Vim.mode === 'insert')) {
            const before = input.value[input.selectionStart - 1];
            if (input.selectionStart === 0 || before === '\n' || before === ' ') setTimeout(openSlash, 0);
        }
        if (e.key === 'Tab' && !slashOpen) {
            e.preventDefault();
            input.setRangeText('  ', input.selectionStart, input.selectionEnd, 'end');
            return;
        }
        if (!mod) return;
        const k = e.key.toLowerCase();
        const map = { b: 'bold', i: 'italic', k: 'link', '`': 'code' };
        if (map[k]) { e.preventDefault(); ACTIONS[map[k]](); }
        else if (k === 's') { e.preventDefault(); download((activeDoc().name || 'document') + '.md', input.value, 'text/markdown'); }
        else if (k === 'f') { e.preventDefault(); openFind(); }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeMenus(); if (!findBar.hidden) closeFind(); closeSlash(); }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f' && document.activeElement !== input) { e.preventDefault(); openFind(); }
    });

    /* --- Wire up panels & buttons ---------------------------------------- */
    $('new-tab').addEventListener('click', newDoc);
    $('toc-btn').addEventListener('click', () => toggleDrawer('toc'));
    $('lint-btn').addEventListener('click', () => toggleDrawer('lint'));
    document.querySelectorAll('.drawer-close').forEach((b) => b.addEventListener('click', () => { b.closest('.drawer').hidden = true; }));

    $('find-input').addEventListener('input', runFind);
    $('find-next').addEventListener('click', () => stepFind(1));
    $('find-prev').addEventListener('click', () => stepFind(-1));
    $('find-replace-one').addEventListener('click', replaceOne);
    $('find-replace-all').addEventListener('click', replaceAll);
    $('find-close').addEventListener('click', closeFind);
    findInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); stepFind(e.shiftKey ? -1 : 1); } if (e.key === 'Escape') closeFind(); });
    replaceInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); replaceOne(); } if (e.key === 'Escape') closeFind(); });

    $('vim-toggle').addEventListener('click', () => { Vim.enable(!Vim.enabled); closeMenus(); });
    $('hl-toggle').addEventListener('click', () => {
        const on = lsGet(K.hl) !== 'off';
        lsSet(K.hl, on ? 'off' : 'on');
        $('hl-toggle').classList.toggle('active', !on);
        updatePreview(); closeMenus();
    });

    /* ====================================================================== *
     *  PWA
     * ====================================================================== */
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }

    /* ====================================================================== *
     *  INIT
     * ====================================================================== */
    (function init() {
        applyTheme(lsGet(K.theme) || 'aurora');
        loadDocs();
        input.value = activeDoc().content;
        renderTabs();
        if (lsGet(K.hl) === 'off') $('hl-toggle').classList.add('active');
        if (lsGet(K.vim) === 'on') Vim.enable(true); else Vim.badge.hidden = true;
        updatePreview();
        markSaved();
    })();
})();
