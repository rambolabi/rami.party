/* ==========================================================================
   Frostcaller — the one inline text renderer
   --------------------------------------------------------------------------
   Both pages write author text that wants a little markup, and both must do it
   without innerHTML. Rather than each page growing its own near-copy, they
   share this one — so there is exactly one place where a string can turn into
   an element, and exactly one place to audit.

   Supported, and nothing else:
       `code`      **bold**      [label](url)

   They do NOT nest. `**[a](b)**` renders as bold raw markup, not a bold link.
   Pick one. This has caused a visible bug once already.
   ========================================================================== */

'use strict';

const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
}

/**
 * Gate for every href `rich()` is allowed to produce.
 *
 * Allows absolute https, in-page anchors, and ordinary relative paths —
 * including bare ones like `writer/`, which is the form the content actually
 * uses. Rejects anything carrying a scheme (`javascript:`, `data:`) and
 * protocol-relative URLs, which are the two ways this could be abused.
 */
function safeUrl(u) {
    const s = String(u).trim();
    if (!s || s.startsWith('//')) return false;
    if (/^(https:\/\/|#|\.\/|\.\.\/)/.test(s)) return true;
    return !/^[a-z][a-z0-9+.-]*:/i.test(s);
}

/** Fills `node` with text, honouring `code`, **bold** and [links](url). */
function rich(node, text) {
    String(text).split(INLINE).forEach(part => {
        if (!part) return;
        if (part.length > 1 && part.startsWith('`') && part.endsWith('`')) {
            node.appendChild(el('code', null, part.slice(1, -1)));
        } else if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
            node.appendChild(el('strong', null, part.slice(2, -2)));
        } else if (part.startsWith('[')) {
            const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
            if (m && safeUrl(m[2])) {
                const a = el('a', null, m[1]);
                a.href = m[2];
                if (m[2].startsWith('https://')) { a.target = '_blank'; a.rel = 'noopener'; }
                node.appendChild(a);
            } else {
                node.appendChild(document.createTextNode(part));
            }
        } else {
            node.appendChild(document.createTextNode(part));
        }
    });
    return node;
}

function para(text, cls) { return rich(el('p', cls || null), text); }
