# ✨ rami.party — An Enchanted Playground

A whimsical hub of tiny web experiments. Each "realm" is its own little website or toy.
Magical on the outside, tidy and maintainable on the inside.

## 🗺️ Structure

```
/                     Enchanted hub (index.html, script.js)
theme.css             Shared palette, tokens, backdrop & chrome (imported everywhere)
style.css             Hub-only styles (hero + realm groups)
projects.js           Realm registry — groups + portals, the single source of truth
favicon.svg           Sparkle icon (also used by the manifest)
og-image.png          1200×630 social share banner
admin/                Generic CMS-style login (keeps the classic history-bomb prank JS)
404.html              "Lost in the aether" error page
gallery/              🏛️ The Gallery of Wonders — finished realms
  lore/               📜 Lore Gallery — image grimoire
  prankscreens/       🖥️ Prank Screens — fake OS/boot screens (hub is enchanted;
                          individual screens stay pixel-accurate on purpose)
workshop/             ⚗️ The Workshop — works-in-progress (landing page for now)
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

## 🎨 Design language

Midnight-arcane: deep indigo/violet gradients, a twinkling starfield, drifting aurorae, a glowing
gradient wordmark (Cinzel Decorative), and glassmorphism portal cards. Fully responsive, keyboard
accessible, and respects `prefers-reduced-motion`.

## 🔗 Allied realms

- Professional projects — [Labidi.eu](https://labidi.eu)
- Professional services — [Compyra.com](https://compyra.com)
- Project index — [Lebon.info](https://lebon.info)
- Home inspection — [Huiskeuring.be](https://huiskeuring.be)

## 📝 Notes

See [`followUp.md`](followUp.md) for pending decisions and next steps.

---

*"That's not a bug, it's a feature."* — Ancient Developer Proverb

