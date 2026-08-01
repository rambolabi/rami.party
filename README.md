# ✨ rami.party — An Enchanted Playground

A whimsical hub of tiny web experiments. Each "realm" is its own little website or toy.
Magical on the outside, tidy and maintainable on the inside.

## 🗺️ Structure

```
/                     Enchanted hub (index.html, script.js)
theme.css             Shared palette, the six themes, backdrop & chrome (imported everywhere)
theme.js              Theme engine — applies the saved theme before first paint, renders the picker
style.css             Hub-only styles (hero + realm groups + portal cards)
projects.js           Realm registry — groups + portals, the single source of truth
favicon.svg           Sparkle icon (also used by the manifest)
og-image.png          1200×630 social share banner
admin/                Generic CMS-style login (keeps the classic history-bomb prank JS)
404.html              "Lost in the aether" error page
gallery/              🏛️ The Gallery of Wonders — finished realms (+ its own index)
  lore/               📜 Lore Gallery — image grimoire
  prankscreens/       🖥️ Prank Screens — fake OS/boot screens (hub is enchanted;
                          individual screens stay pixel-accurate on purpose)
workshop/             ⚗️ The Workshop — a data-driven catalogue of every WIP
wasteland/            ☄️ The Wastelands — retired experiments + its own index
  neko/               🐱 Neko Paradise (draggable chibi sprites)
  old-rami.party/     Previous jQuery-era incarnation (preserved)
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
    tags: ['demo', 'wip'],
    aura: 'violet',        // violet | cyan | pink | gold | ash
    status: 'live',        // 'soon' renders a locked teaser card
    // external: true,     // opens in a new tab with an ↗ marker
}
```

The hub renders the card in the right realm automatically. Array order = ranking.
Work-in-progress folders go in `RAMI_WORKSHOP` instead (its `href` is relative to `/workshop/`),
and ideas that have no folder yet go in `RAMI_PLANNED`. Finally, add the URL to
[`sitemap.xml`](sitemap.xml) — the one manual step left.

## 🎭 Themes

Every page that loads `theme.css` also loads `theme.js`, which writes `data-theme` on `<html>`
**before first paint** (no flash), remembers the choice in `localStorage` under `rami.theme`, keeps
open tabs in sync and updates `<meta name="theme-color">`. The picker lives in the site header.

| id | Name | |
|---|---|---|
| `enchanted` | Enchanted | Midnight arcane — the default house style (dark) |
| `slate` | **Professional Dark** | Calm slate & steel blue, no fairy dust |
| `daylight` | **Professional Light** | Crisp, printable, boardroom-safe |
| `parchment` | Grimoire | Warm parchment & ink (light) |
| `terminal` | Phosphor | A CRT that wandered in from 1983 (dark) |
| `contrast` | High Contrast | Maximum legibility, no decoration |
| `auto` | Match system | Follows `prefers-color-scheme` |

Adding a theme is one CSS block: copy a `:root[data-theme="…"]` rule in
[`theme.css`](theme.css), restate the tokens you want to change, then add one entry to the
`THEMES` array in [`theme.js`](theme.js). Nothing else needs to know. Because every colour in
`theme.css`/`style.css` comes from a token, sub-realms inherit the theme for free.

Scripted control, if a sub-realm needs it: `RamiTheme.set('daylight')`, `RamiTheme.get()`,
`RamiTheme.resolved()`, plus a `rami:themechange` event on `document`.

## 🎨 Design language

Midnight-arcane by default: deep indigo/violet gradients, a twinkling starfield, drifting aurorae,
a glowing gradient wordmark (Cinzel Decorative), and glassmorphism portal cards — with five more
themes a click away. Fully responsive, keyboard accessible, respects `prefers-reduced-motion`, and
every theme clears WCAG AA contrast on hub text.

Handy on the hub: press <kbd>/</kbd> or <kbd>Ctrl/⌘</kbd>+<kbd>K</kbd> to jump to the search box,
<kbd>Esc</kbd> to clear it. Searches are shareable — the query lands in the URL as `?q=…`.

## 🔗 Allied realms

- Professional projects — [Labidi.eu](https://labidi.eu)
- Professional services — [Compyra.com](https://compyra.com)
- Home inspection — [Huiskeuring.be](https://huiskeuring.be)

## 📝 Notes

See [`followUp.md`](followUp.md) for pending decisions and next steps.

---

*"That's not a bug, it's a feature."* — Ancient Developer Proverb

