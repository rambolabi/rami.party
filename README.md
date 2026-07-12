# ✨ rami.party — An Enchanted Playground

A whimsical hub of tiny web experiments. Each "realm" is its own little website or toy.
Magical on the outside, tidy and maintainable on the inside.

## 🗺️ Structure

```
/                     Enchanted hub (index.html, style.css, script.js)
projects.js           Realm registry — the single source of truth for the grid
favicon.svg           Sparkle icon (also used by the manifest)
404.html              "Lost in the aether" error page
archive/              🗝️ The Vault — retired experiments + its own index
  old-rami.party/     Previous jQuery-era incarnation (preserved)
  adhd/               An empty husk (kept as a relic)
fun/
  lore/               📜 Lore Gallery — image grimoire
  prankscreens/       🖥️ Prank Screens — fake OS/boot screens
neko/                 🐱 Neko Paradise — draggable chibi sprites
```

## ➕ Adding a new project

You (almost) never touch HTML. Open [`projects.js`](projects.js) and append one object:

```js
{
    title: 'My New Realm',
    href: './path/to/project/',
    glyph: '🌟',
    tagline: 'A short hook',
    description: 'One or two sentences of enchantment.',
    tags: ['demo', 'wip'],
    aura: 'violet',        // violet | cyan | pink | gold
    status: 'live',        // 'soon' renders a locked teaser card
}
```

The hub renders the card automatically. That's it.

## 🎨 Design language

Midnight-arcane: deep indigo/violet gradients, a twinkling starfield, drifting aurorae, a glowing
gradient wordmark (Cinzel Decorative), and glassmorphism portal cards. Fully responsive, keyboard
accessible, and respects `prefers-reduced-motion`.

## 🔗 Allied realms

- Professional services — [Compyra.com](https://compyra.com)
- Project index — [Lebon.info](https://lebon.info)
- Home inspection — [Huiskeuring.be](https://huiskeuring.be)

## 📝 Notes

See [`followUp.md`](followUp.md) for pending decisions and next steps.

---

*"That's not a bug, it's a feature."* — Ancient Developer Proverb

