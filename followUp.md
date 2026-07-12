# ✨ rami.party — Follow-ups & Decisions

Living notes for the enchanted-playground revamp. All of Rami's decisions from the previous round
have now been actioned. ✅

---

## ✅ Done in this pass (round 2)
- **Shared `theme.css`** extracted — palette, tokens, backdrop, header/wordmark, buttons, footer,
  mobile nav, back-home pill, reveal & reduced-motion all live in one file. Every page imports it.
- **Three great realms** (categories) on the hub, driven by `RAMI_GROUPS` in `projects.js`:
  - 🏛️ **The Gallery of Wonders** — finished realms (Lore, Prank Screens, the BBQ).
  - ⚗️ **The Workshop** — works-in-progress / playthings (teaser card for now).
  - ☄️ **The Wastelands** — the old archive, renamed & re-themed apocalyptic.
  - Ranking is just array order — trivial to reorder.
- **Neko moved** to `wasteland/neko/` and now lives in The Wastelands (with a themed back link).
- **Sub-projects re-skinned** to the enchanted theme: Lore Gallery, Prank Screens hub, the Wastelands
  page, 404. Each keeps its original scripts/IDs, so **lore, prank screens and the BBQ all still work**.
  - Individual prank *screens* stay pixel-accurate OS clones on purpose (only the hub is enchanted).
- **`/admin/`** rebuilt to look like a small, generic CMS login — while quietly keeping the original
  browser history-bomb prank script (“leave the Javascript”).
- **`labidi.eu`** added to the allied realms (professional projects), above Compyra.
- **Social share image** `og-image.png` (1200×630) created and wired via `og:image`/`twitter:image`.
- **Old files kept** (per decision): PSDs, jQuery and all legacy assets remain in `wasteland/old-rami.party`.

## 🗺️ Current structure
```
/                 hub (index.html, theme.css, style.css, script.js, projects.js)
favicon.svg · og-image.png · admin/ · 404.html
gallery/lore/         📜 Lore Gallery  (Gallery of Wonders)
gallery/prankscreens/ 🖥️ Prank Screens (Gallery of Wonders)
workshop/             ⚗️ The Workshop (WIP landing)
wasteland/            ☄️ The Wastelands (index)
  neko/           🐱 Neko Paradise (relic)
  old-rami.party/ 🏚️ jQuery-era relic
  adhd/           🌀 empty husk
```
External realms surfaced on the hub: 🔥 The BBQ (lebon.info/bbq).

## 🔮 Still open / next
- [ ] **SEO / sitemap** — deferred until the realm folders were finalised (now they are). When you're
      ready to allow indexing: flip `robots` off `noindex`, refresh `sitemap.xml` to list `/`,
      `/gallery/lore/`, `/gallery/prankscreens/`, `/wasteland/`, `/wasteland/neko/`, and add canonical URLs.
      Left as-is for now since the domain is still your demo/playground.
- [ ] **Fill The Workshop** — the group currently shows one “coming soon” teaser. Drop a real WIP
      project object into `projects.js` (category `workshop`) whenever one is ready.
- [ ] **Optional:** give the neko toy a deeper enchanted restyle (it's an archived relic, so it only
      got a themed back-link + tag this round; its internals are untouched and fully working).

## 🧩 How to add / rank a project
Edit `projects.js` → append one object to `RAMI_REALMS` with a `category` of `gallery`, `workshop`
or `wastes`. Order within the array = ranking. `status:'soon'` makes a locked teaser; `external:true`
opens in a new tab. Nothing else to touch.
