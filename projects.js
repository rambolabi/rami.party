/* ==========================================================================
   rami.party — Realm registry
   --------------------------------------------------------------------------
   The single source of truth for every realm shown on the hub.

   • RAMI_GROUPS  → the three great realms (categories), rendered in order.
   • RAMI_REALMS  → individual portals. Set `category` to a group id.

   ➕ To add a project: append one object to RAMI_REALMS. Order within a group
      = ranking (top of the array shows first). Nothing else to touch.
      status: 'live' (clickable) · 'soon' (locked teaser)
      external: true opens in a new tab and shows an ↗ marker.
   ========================================================================== */

window.RAMI_GROUPS = [
    {
        id: 'gallery',
        emoji: '🏛️',
        title: 'The Gallery of Wonders',
        blurb: 'Finished realms, polished and ready to explore.',
    },
    {
        id: 'workshop',
        emoji: '⚗️',
        title: 'The Workshop',
        blurb: 'Spells still being brewed — works in progress & playthings.',
    },
    {
        id: 'wastes',
        emoji: '☄️',
        title: 'The Wastelands',
        blurb: 'Fallen, forgotten and abandoned experiments. Enter the ruins.',
    },
];

window.RAMI_REALMS = [
    /* ---- The Gallery of Wonders (finished) ---- */
    {
        category: 'gallery',
        title: 'Lore Gallery',
        href: './gallery/lore/',
        glyph: '📜',
        tagline: 'A grimoire of images',
        description: 'Leaf through a living grimoire of magical lore, muggle mischief and impossibly cute creatures.',
        tags: ['gallery', 'magic'],
        aura: 'violet',
        status: 'live',
    },
    {
        category: 'gallery',
        title: 'Prank Screens',
        href: './gallery/prankscreens/',
        glyph: '🖥️',
        tagline: 'Full-screen illusions',
        description: 'Conjure convincing fake boot screens, BIOS spells and “hacked” terminals to bewitch your friends.',
        tags: ['prank', 'fullscreen'],
        aura: 'cyan',
        status: 'live',
    },
    {
        category: 'gallery',
        title: 'The BBQ',
        href: 'https://lebon.info/bbq',
        glyph: '🔥',
        tagline: 'A feast of flames',
        description: 'Gather round the coals — a crackling little BBQ companion living over on lebon.info.',
        tags: ['tool', 'food'],
        aura: 'gold',
        status: 'live',
        external: true,
    },

    /* ---- The Workshop (WIP / playthings) ---- */
    {
        category: 'workshop',
        title: 'A new spell is brewing',
        href: './workshop/',
        glyph: '✨',
        tagline: 'Coming soon',
        description: 'Something curious is bubbling in the cauldron. Peek into the workshop to see what hatches.',
        tags: ['wip'],
        aura: 'pink',
        status: 'live',
    },

    /* ---- The Wastelands (archived / fallen) ---- */
    {
        category: 'wastes',
        title: 'Neko Paradise',
        href: './wasteland/neko/',
        glyph: '🐱',
        tagline: 'A clowder of sprites',
        description: 'A mischievous clowder of chibi neko familiars — retired to the ruins, but still purring.',
        tags: ['toy', 'cats'],
        aura: 'ash',
        status: 'live',
    },
    {
        category: 'wastes',
        title: 'Old rami.party',
        href: './wasteland/old-rami.party/',
        glyph: '🏚️',
        tagline: 'The jQuery era',
        description: 'The previous incarnation of this domain — a paws-and-cats relic, preserved as it was found.',
        tags: ['legacy', 'jquery'],
        aura: 'ash',
        status: 'live',
    },
    {
        category: 'wastes',
        title: 'ADHD experiment',
        href: '#',
        glyph: '🌀',
        tagline: 'Never drew breath',
        description: 'An empty husk — a project that was conjured but never filled. A reminder that not every spell takes.',
        tags: ['empty'],
        aura: 'ash',
        status: 'soon',
    },
];
