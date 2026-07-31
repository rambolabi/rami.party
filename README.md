# ✨ rami.party — An Enchanted Playground

A whimsical hub of tiny web experiments. Each "realm" is its own little website or toy.
Magical on the outside, tidy and maintainable on the inside.

## 🗺️ Structure

```
/                     Enchanted hub (index.html, script.js)
theme.css             Shared palette, tokens, themes, backdrop & chrome (imported everywhere)
theme.js              Theme conjuror — applies the saved theme before paint + the theme picker
style.css             Hub-only styles (hero + realm groups + portal cards)
projects.js           Realm registry — groups + portals, the single source of truth
favicon.svg           Sparkle icon (also used by the manifest)
og-image.png          1200×630 social share banner (og-image.html is its source)
sitemap.xml           Crawlable list of every public realm
admin/                Generic CMS-style login (keeps the classic history-bomb prank JS)
404.html              "Lost in the aether" error page
gallery/              🏛️ The Gallery of Wonders — finished realms
  lore/               📜 Lore Gallery — image grimoire
  prankscreens/       🖥️ Prank Screens — fake OS/boot screens (hub is enchanted;
                          individual screens stay pixel-accurate on purpose)
workshop/             ⚗️ The Workshop — works in progress, one folder per spell
  index.html          The workbench: renders every RAMI_WORKSHOP card + the planned list
wasteland/            ☄️ The Wastelands — retired experiments + its own index
  neko/               🐱 Neko Paradise (draggable chibi sprites)
  old-rami.party/     Previous jQuery-era incarnation (preserved)
  notes/              🗒️ The original notes & todo scratchpad
  bluetooth/          📡 The husk left behind by GhostTooth
  house/              🏠 The husk left behind by Huiskeuring
  random-first-player/ 🎲 The husk left behind by TapFate
  adhd/               An empty husk (kept as a relic)
```

The folder names mirror the three realms: **gallery** (finished), **workshop** (WIP) and
**wasteland** (archive).

## ➕ Adding a new project

You (almost) never touch HTML. Open [`projects.js`](projects.js) and append one object:

```js
{
    category: 'gallery',   // gallery | workshop | wastes
    title: 'My New Realm',
    href: './path/to/project/',
    glyph: '🌟',
    tagline: 'A short hook',
    description: 'One or two sentences of enchantment.',
    search: 'Plain, boring, keyword-rich text — used by the search box only.',
    tags: ['demo', 'wip'],
    aura: 'violet',        // violet | cyan | pink | gold | ash
    status: 'live',        // 'soon' renders a locked teaser card
    // external: true,     // opens in a new tab with an ↗ marker
}
```

Work-in-progress spells go in `RAMI_WORKSHOP` instead (their `href` is relative to `/workshop/`),
and ideas with no folder yet go in `RAMI_PLANNED` as `{ name, note }`.

The hub renders the card in the right realm automatically. Array order = ranking. Never point an
entry at a folder that doesn't exist — use `status: 'soon'` with `href: '#'` instead of a dead
link. Finally, add the new URL to [`sitemap.xml`](sitemap.xml).

## 🎨 Design language

Midnight-arcane by default: deep indigo/violet gradients, a twinkling starfield, drifting aurorae,
a glowing gradient wordmark (Cinzel Decorative), and glassmorphism portal cards. Fully responsive,
keyboard accessible, and respects `prefers-reduced-motion`.

### 🌈 Themes

Every colour is a CSS custom property in [`theme.css`](theme.css), so the whole site re-skins from
one `data-theme` attribute on `<html>`. [`theme.js`](theme.js) applies the visitor's saved choice
*before* first paint (no flash), keeps `<meta name="theme-color">` in sync, and builds the 🎨 picker
in the corner of every shared-chrome page.

| Theme | Flavour |
| --- | --- |
| ✨ Midnight Arcana | the house spell — the original violet enchantment (default) |
| ▨ Graphite | **professional dark** — calm slate, one confident blue accent |
| ☀ Daylight | **professional light** — paper white, ink blue, no glare |
| ⚡ Neon Circuit | cyberpunk arcade: hot magenta over electric cyan |
| 🔥 Ember Forge | molten coal, rust and firelight |
| 🌿 Deep Grove | enchanted forest: moss, jade and moonlit fern |
| 🌊 Abyssal Tide | deep-sea teal and bioluminescence |
| 🖥 Terminal | phosphor green on black, monospace everywhere |
| 📜 Parchment | candlelit library: aged paper, sepia ink, gold leaf |
| 🌸 Cherry Blossom | soft pastel light: petals and morning sky |
| ◐ High Contrast | pure black, white and amber for maximum legibility |

Plus **🪄 Auto**, which follows the visitor's `prefers-color-scheme`. The choice is stored in
`localStorage` under `rami.theme`.

**Adding a theme:** add one `[data-theme="id"] { … }` token block to `theme.css` and one entry to
`RAMI_THEMES` in `theme.js`. No component CSS needs to change. Themes only redefine tokens, so
respect the whole set — especially `--body-bg`, `--star-colors`, `--btn-primary-ink` and
`--meta-theme-color`.

**Adding a page to the shared chrome:** link `/theme.css` in `<head>`, add
`<script src="/theme.js"></script>` just before it, and the picker appears automatically.

## 🔗 Allied realms

- Professional projects — [Labidi.eu](https://labidi.eu)
- Professional services — [Compyra.com](https://compyra.com)
- Home inspection — [Huiskeuring.be](https://huiskeuring.be)

## 📝 Notes

See [`followUp.md`](followUp.md) for pending decisions and next steps.

---

*"That's not a bug, it's a feature."* — Ancient Developer Proverb

