/* ==========================================================================
   Frostcaller — the colour themes
   --------------------------------------------------------------------------
   Shared by the guide and by The Scribe, so both pages offer the same list and
   the choice carries from one to the other. Each id matches a
   `:root[data-theme="…"]` block in style.css; adding one here without adding
   the block there gives you the default colours and no error, which is the
   right way round for a mistake to fail.

   `group` splits the picker into two: "pro" for the quiet ones you would read
   a manual in, "fun" for the rest.
   ========================================================================== */

'use strict';

const THEMES = [
    { id: 'frost', name: 'Frost', group: 'fun', note: 'Cyan and violet on deep night. The original.' },
    { id: 'ember', name: 'Ember', group: 'fun', note: 'Warm amber — for the heating half of the year.' },
    { id: 'aurora', name: 'Aurora', group: 'fun', note: 'Green and teal, like a good night sky.' },
    { id: 'candy', name: 'Candy', group: 'fun', note: 'Pink, loud and entirely unserious.' },
    { id: 'vapor', name: 'Vapour', group: 'fun', note: 'Magenta and cyan, 1987 forever.' },
    { id: 'paper', name: 'Paper', group: 'pro', note: 'Light, calm, high contrast. Best for reading and printing.' },
    { id: 'slate', name: 'Slate', group: 'pro', note: 'Muted grey-blue. Looks like work.' },
    { id: 'blueprint', name: 'Blueprint', group: 'pro', note: 'Drafting-table blue and white ink.' },
    { id: 'terminal', name: 'Terminal', group: 'pro', note: 'Green on black. You know why.' },
    { id: 'contrast', name: 'Contrast', group: 'pro', note: 'Near-black, plain white text, no glow and no stars.' },
];

/* The one place both pages agree on where the choice is written down. */
const STORE_KEY = 'frostcaller.v1';

/**
 * Paint a theme and keep the browser chrome in step. Safe to call before the
 * rest of a page has drawn itself.
 */
function applyThemeId(id) {
    const known = THEMES.some(t => t.id === id) ? id : 'frost';
    document.documentElement.dataset.theme = known;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = known === 'paper' ? '#f4f2fa' : '#0b0524';
    return known;
}

/** Read the shared settings blob without caring what else is in it. */
function readShared() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
}

/**
 * Change one or two shared settings, leaving everything else — the drawer, the
 * picker answers, the half-finished YAML — exactly as the other page left it.
 */
function writeShared(patch) {
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify(Object.assign(readShared(), patch)));
    } catch (e) { /* private mode: the choice simply will not stick */ }
}
