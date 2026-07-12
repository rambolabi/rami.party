/* ==========================================================================
   rami.party — Realm registry
   --------------------------------------------------------------------------
   The single source of truth for every "realm" (project) shown on the hub.
   ➕ To add a new project, drop a new object in this array — nothing else to
      touch. Keep `status: 'live'` for active portals, or 'soon' to tease a
      work-in-progress (rendered as a locked, non-clickable card).
   ========================================================================== */

window.RAMI_REALMS = [
    {
        title: 'Lore Gallery',
        href: './fun/lore/',
        glyph: '📜',
        tagline: 'A grimoire of images',
        description: 'Leaf through a living grimoire of magical lore, muggle mischief and impossibly cute creatures.',
        tags: ['gallery', 'magic'],
        aura: 'violet',
        status: 'live',
    },
    {
        title: 'Prank Screens',
        href: './fun/prankscreens/',
        glyph: '🖥️',
        tagline: 'Full-screen illusions',
        description: 'Conjure convincing fake boot screens, BIOS spells and “hacked” terminals to bewitch your friends.',
        tags: ['prank', 'fullscreen'],
        aura: 'cyan',
        status: 'live',
    },
    {
        title: 'Neko Paradise',
        href: './neko/',
        glyph: '🐱',
        tagline: 'A clowder of sprites',
        description: 'Summon a mischievous clowder of chibi neko familiars, then drag them into a purring party.',
        tags: ['toy', 'cats'],
        aura: 'pink',
        status: 'live',
    },
    {
        title: 'The Vault',
        href: './archive/',
        glyph: '🗝️',
        tagline: 'Relics of the past',
        description: 'Descend into the vault where retired experiments and ancient prototypes slumber in dust.',
        tags: ['archive'],
        aura: 'gold',
        status: 'live',
    },
];
