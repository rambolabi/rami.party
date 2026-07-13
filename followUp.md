# ✨ rami.party — Follow-ups & Decisions

Living notes for the enchanted-playground revamp. The `workshop/projects` migration is now done. ✅

---

## 🗺️ Current structure
```
/                     hub (index.html, theme.css, style.css, script.js, projects.js)
favicon.svg · og-image.png · admin/ · 404.html
gallery/lore/         📜 Lore Gallery  (Gallery of Wonders)
gallery/prankscreens/ 🖥️ Prank Screens (Gallery of Wonders)
workshop/             ⚗️ The Workshop — now a data-driven catalogue of every WIP
  bluetooth/ blur/ clear/ dashboard_v1/ DNS-sinkhole/ Engraving/ fakeupdate/
  house/ laser/ mailheaders/ md/ militaryalphabet/ news/ prank/ rami/
  random-first-player/ scoreboard/ subnets/ to-check/ trace-results/ webcheck/
wasteland/            ☄️ The Wastelands (index)
  neko/           🐱 Neko Paradise (relic)
  old-rami.party/ 🏚️ jQuery-era relic
  adhd/           🌀 empty husk
```
External realms surfaced on the hub: 🔥 The BBQ (lebon.info/bbq).

---

## ✅ Done this round
- **Emptied `workshop/projects/`** — all 20 project folders were moved up one level into
  `workshop/<name>/`, and `house.zip` was extracted to `workshop/house/`. The now-empty
  `projects/` folder (plus the obsolete lebon.info listing page, `projects.css`, and the empty
  `fill` stub) was **deleted**.
- **The Workshop is now a real catalogue.** `workshop/index.html` renders its cards from a new
  `RAMI_WORKSHOP` array in `projects.js` (single source of truth, ranked top-to-bottom). Card
  markup is shared with the hub via `window.cardMarkup` in `script.js`.
- **Hidden 4th category added — “Planned Spells.”** Names of not-yet-started ideas render as a
  chip list at the bottom of `workshop/index.html`, sourced from `RAMI_PLANNED` in `projects.js`.
  Styling lives in `style.css` (`.planned-list` / `.planned-chip`).
- **Hub Workshop teaser updated** — the “A new spell is brewing” placeholder now reads
  “Enter the Workshop · 21 spells brewing” and links into the populated `/workshop/`.
- **WIP vs not-started audit** — every folder was inspected. Only `fill` was truly empty →
  it became the sole “Planned” entry (**Screen Fill**). Everything else had real, functional
  content and is listed in the Workshop as `status:'live'`.
- **Broken links fixed after the move:**
  - `workshop/bluetooth/` back-link pointed to lebon.info → now `/workshop/`.
  - `workshop/news/` depended on lebon.info’s shared `Tools/style.css` → copied locally as
    `workshop/news/theme.css`; back-link now `/workshop/`.
- **Validated** the whole thing over a local static server: hub, workshop catalogue, planned
  chips, and every moved project (`/workshop/<name>/`) all return 200 and render correctly.

---

## 🔮 Still open / next
- [ ] **`workshop/laser/` is missing its media.** The page references `./media/*.jpg` (hero,
      gallery) but has no `media/` folder. Add the images or leave it as an obvious WIP.
- [ ] **BBQ full migration is blocked by the backend.** The BBQ mailer needs a server-side
      handler (`submit.php` on lebon.info); rami.party is static (GitHub Pages), so it stays an
      **external link** for now. To bring it here: swap the form to a static-friendly backend
      (e.g. Formspree / a serverless function), then copy `lebon.info/bbq` → `gallery/bbq/` and
      flip the BBQ realm in `projects.js` from `external:true` to `./gallery/bbq/`.
- [ ] **Possible duplicate:** `workshop/bluetooth/` (GHOSTTOOTH) overlaps with the standalone
      `ghosttooth.labidi.eu` project. Decide whether to keep both or retire the copy here.
- [ ] **Residual lebon.info branding** in a few projects (page `<title>`s / code comments in
      `subnets`, `webcheck`, `bluetooth`). Cosmetic only — rename to rami.party if desired.
- [ ] **Per-project completeness review.** Every Workshop entry is currently `status:'live'`.
      Set any you’d rather lock as a teaser to `status:'soon'` in `RAMI_WORKSHOP`.
- [ ] **Grow the Planned list.** Only *Screen Fill* is listed. Add more future ideas as objects
      in `RAMI_PLANNED` (`{ name, note }`).
- [ ] **SEO / sitemap** — still deferred (site is `noindex`). When ready: flip `robots` off
      `noindex`, refresh `sitemap.xml` to list `/`, `/gallery/lore/`, `/gallery/prankscreens/`,
      `/workshop/`, `/wasteland/`, `/wasteland/neko/`, and add canonical URLs.

---

## 🧩 How to add / rank a project
- **Finished realm (hub):** append an object to `RAMI_REALMS` in `projects.js` with a `category`
  of `gallery` or `wastes`. Order within the array = ranking. `external:true` opens in a new tab.
- **Work in progress (Workshop):** drop the folder in `/workshop/<name>/`, then append an object
  to `RAMI_WORKSHOP`. `href` is relative to `/workshop/` (e.g. `./webcheck/`). Order = ranking.
  `status:'live'` is clickable; `status:'soon'` shows a locked teaser.
- **Planned idea (name only):** add `{ name, note }` to `RAMI_PLANNED`. Move it up into
  `RAMI_WORKSHOP` once its folder exists and has content.

Nothing else to touch — the hub and the Workshop page both render from `projects.js`.
