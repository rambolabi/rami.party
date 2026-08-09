# 🗂️ rami.party — site backlog

Full-repo audit, **2026-08-07**. Every claim below was measured, not guessed.

> Naming note: the root `todo.md` is the original mission brief and
> `workshop/todo.md` is the older roll-up. This file supersedes the latter.

---

## ✅ What the code check found

Automated sweep over the whole tree (`CyberChef` vendor bundle excluded).

| Check | Files | Result |
|---|---|---|
| JS syntax | 187 | **0 errors** (56 ES-module files verified as `type="module"`) |
| Runtime errors + failed requests | 64 pages | **0 errors** |
| HTML duplicate `id` | 73 | clean |
| HTML unclosed / stray tags | 73 | clean |
| Encoding (`U+FFFD`) | 73 | clean |
| Missing local assets | 73 | clean |
| `sitemap.xml` URLs resolving | 44 | clean |
| Registry entries pointing at a missing folder | 41 | clean |
| Registry objects with duplicated keys | 42 | **1 broken — fixed, see below** |
| CSS brace balance | 60 | **1 broken** (see 1.1) |

### 🐞 Fixed during this audit: a registry entry had silently swallowed itself
`projects.js` was missing a `status: 'live',` + `},` + `{` between the prankscreens
entry and Breachlight. JavaScript does not complain about that: the two objects merge
into one and the later keys win. The visible effect was that the prankscreens
cross-listing had **vanished from the Workshop catalogue** while the card count still
looked plausible (41), so nothing looked wrong.

Most likely lost during the five-branch merge. Repaired, and the whole registry is now
scanned for duplicate keys: `RAMI_WORKSHOP` is back to **42** entries with Breachlight
intact. Worth keeping that duplicate-key scan in any future audit — it is a class of bug
no linter here would catch.

Two "failures" that are **not** bugs, confirmed by reading the code:

- `gallery/lore/` fires ~25 image 404s. The gallery binary-searches
  (`lore (128)` → `(256)` → `(192)` → `(176)`…) to discover how many images exist.
  Working as designed.
- `/admin/` hangs the browser. That is the deliberate history-bomb prank.

---

## 1. Bugs

### ✅ 1.1 `workshop/dashboard_v1/style.css` — FIXED
The file was born broken (the fragment exists in its very first commit): an orphaned
media-query body with two stray `}` at lines 1635/1641 discarded every rule after it.
Reconstructed as `@media (max-width: 480px)` around the `.settings-panel` full-width
override (its intent was unambiguous — the base panel is a fixed 450px slide-in) and
dropped the selector-less `height: 95vh` line that never had an owner. Braces now 205/205.

### ✅ 1.2 Volume Seer — FIXED
`https://mail.labidi.eu/volume/` went live (checked: 200), so the entry is now
`external: true, status: 'live'` pointing there instead of a locked teaser at `href: '#'`.

---

## 2. Site-wide

### 2.1 36 pages load third-party CDNs
Every Forge advertises "no CDNs, nothing leaves your machine", yet 36 HTML files still
pull `fonts.googleapis.com` (and the DISC workshop pulls Chart.js). Consequences: every
visitor's IP goes to Google, pages render with fallback fonts offline, and a PWA install
can never be genuinely offline.

**Fix**
1. Download the families actually in use (Quicksand, Cinzel / Cinzel Decorative,
   EB Garamond, Fraunces, Inter) as `woff2` into a shared `/fonts/`.
2. One `@font-face` block per family in `theme.css`, then delete the `<link rel="preconnect">`
   / `<link href="https://fonts.googleapis.com/…">` pairs.
3. Vendor `chart.min.js` locally, or replace that radar with a hand-rolled canvas draw.
4. Verify with DevTools → Offline → hard reload.

This is the single biggest credibility gap on the site and it is mechanical work.

### 2.2 689 `target="_blank"` links without `rel="noopener"`
Mostly the link dumps in `workshop/news/` and `workshop/tools/`. Modern browsers imply
`noopener` for `target="_blank"`, so this is **low severity today**, but it is still the
documented anti-tabnabbing measure and a linter will keep flagging it.

**Fix** — a scripted pass adding `rel="noopener noreferrer"` to any `target="_blank"`
anchor that has no `rel` at all.

- ✅ `workshop/news/` is done (2026-08-09): it was rebuilt data-driven, and every link is
  now created in `app.js`, which sets `rel="noopener noreferrer"` on external anchors.
- ✅ `workshop/tools/` is done (2026-08-09): same rebuild, same data-driven link creation.
  What remains is scattered singles across the smaller pages.

### 2.3 51 HTML files still contain em-dashes
The earlier sweep only covered the 9 hub-level files. The per-project pages were never
processed. Worst offenders: `laser-forge-v2` (53), `laser-forge` (49), `frostcaller` (26),
`chronoport` (23), `frostcaller/writer` (22), `latex-doctor` (16).

**Fix** — same treatment as before: replace with commas, colons or full stops per
sentence rather than swapping in hyphens.

### 2.4 SEO/mobile gaps on older pages — partly done
- **41 pages** have no `<meta name="description">` (includes all 11 prank screens, which is
  arguably fine — they are illusions, not content).
- ✅ The three `breachlight` dev pages got their viewport metas (2026-08-07).
- Remaining without viewport: `og-image.html` (render template) and the preserved
  `wasteland/adhd/` + `old-rami.party` relics — intentional, leave them.
- **4 pages** have no `<html lang>` (all preserved relics).
- **2 pages** have no `<title>`: `og-image.html`, `wasteland/adhd/index.html`.

### 2.5 Sitemap is still hand-maintained
Adding a project means remembering to edit `sitemap.xml`. It has drifted before.

**Fix** — the *Sitemap Scribe* idea already in `RAMI_PLANNED`: generate it from
`projects.js` so it cannot drift.

### 2.6 `wasteland/index.html` is hand-written
The hub and the Workshop render from `projects.js`; the Wastelands index has its seven
cards hard-coded, and they have already drifted from `RAMI_REALMS`.

**Fix** — move the wastes cards into `RAMI_REALMS` and render with `cardMarkup`, with an
optional `relic:` field for the "poke the husk" links.

### 2.7 Stale `TODO` markers in shipped code — partly done
- `workshop/frostcaller/writer/lab.js` — *"TODO: fill these in from your capture diffs."*
- ✅ `workshop/tools/index.html` — the Dutch *"TODO hieronder verder controleren"* comment
  went away with the 2026-08-09 data-driven rebuild.
- ✅ The user-visible `TODO` heading on `webcheck/about.html` now reads "Roadmap" (2026-08-07).
### ✅ 2.8 Theme system gaps — FIXED (2026-08-07)
- `workshop/frostcaller/` and `workshop/frostcaller/writer/` loaded `theme.css` but not
  `theme.js`, so they ignored the saved theme and showed no picker. Both now load the
  engine; a user's choice follows them, and their own content-palette select coexists
  (namespaced `data-theme` vs global `data-rami-theme`).
- The picker's mobile breakpoint hid the "Theme" label, leaving a bare 🔮 glyph nobody
  could identify. The label now stays visible (smaller) on phones, and the toggle uses
  full-contrast text instead of muted.
- Verified: picker mounts and the saved theme applies on all ten themed pages
  (hub, 404, gallery ×3, wasteland, DNS-sinkhole, Engraving, frostcaller ×2).

---

## 3. Per-project

### 3.1 Laser Forge (v1)
Web Workers for dithering/tracing/raster G-code (they block the UI on large images),
boolean ops, on-canvas rulers, origin selector, LPI preview, material presets,
SVG/DXF **import**, live export preview, EAN/UPC barcodes, a11y pass. None of the eight
hardware validation checks have been run on a real machine.

### 3.2 Laser Forge · Direct Control (v2)
Still a **verbatim copy of v1** — correctly marked `soon` and `noindex` with a canonical
back to v1. The whole Web Serial plan (connect, character-counted streamer, DRO, jog,
framing, overrides, E-STOP, machine profiles) plus the blocking safety gate is unbuilt.
Decide whether this folder earns its keep or gets folded back into v1.

### 3.3 3D Forge
CSG booleans are the biggest gap (cut holes, merge text onto a base). Then: logo→extrude
tool (the tracer already exists, just needs a button), templates gallery, dome/box
lithophanes, mesh decimation, wall-thickness checker, multi-material 3MF, glTF export.

### 3.4 D&D Forge
Older editions (1E/2E/3.5/4E) are **5E data wearing a costume** — THAC0, 3.x skill points
and 4E powers are not modelled. Either implement them or relabel the options honestly.
Also: multiclassing, prepared/known spell limits, starting equipment, attunement,
undo/redo, global search, PWA, a11y.

### 3.5 Loregate (DM screen)
Undo/redo for map edits, per-panel state persistence, tablet touch testing, wall-drawing
tool, per-token line-of-sight, confirm-before-overwrite on import. The map renderer is
duplicated between `dm.js` and `player.js` — de-duplicating it is the prerequisite for the
multiplayer plan in `multiplayer.md`.

### 3.6 PDF Search *(new today)*
Working with 3 documents / 167 pages / 616k characters. Next: OCR fallback for
image-only PDFs (`tools/build.py` already warns when a PDF yields empty pages), per-document
date/source metadata, and a "search only these pages" filter.

### 3.7 Tasks for unlocked computers *(renamed today)*
The three-way chooser is live and the BBQ mailer moved in. Remaining: the three WIP screens
(`bios`, `hacked`, `hp-bios`) are still behind a "testing phase" divider — finish or drop
them. Keyboard-lock Esc capture only works on Chrome/Edge desktop; other browsers fall back
to re-entering fullscreen on the next click.

### 3.8 Laser Works
Still `soon`. Needs 16 real photographs, and the testimonials are **invented people** with
invented quotes — fine for a layout demo, not for a storefront. Label it a demo or replace
them.

---

## 4. Housekeeping

- **`workshop/rami/` and `workshop/dashboard_v1/`** — both `soon`, both stubs. Finish, or
  move to `wasteland/`.
- **`workshop/to-check/`** — a link dump of GitHub tools. Fold into *IT Tools Workbench* or retire.
- **README per project** — only a handful of the 42 have one.
- **Uncommitted work** — `workshop/breachlight/` has 15 modified files from another task,
  plus today's prankscreens / pdf-search / registry changes. Nothing is pushed.
- **7 tombstone redirects** (`OASIS`, `mail-ward`, `mailheaders`, `md`,
  `personality-library`, `trace-results`, `militaryalphabet`) are all correct and
  consistent: `noindex`, canonical, meta-refresh + `location.replace`. Leave them.
- **Bump `?v=` before pushing.** GitHub Pages serves these assets with `max-age=14400`,
  so a stale `projects.js` will hide every change above for four hours. This bit us during
  testing today: the browser served a cached registry and the rename looked like it had
  failed.
- **7 tombstone redirects** (`OASIS`, `mail-ward`, `mailheaders`, `md`,
  `personality-library`, `trace-results`, `militaryalphabet`) are all correct and
  consistent: `noindex`, canonical, meta-refresh + `location.replace`. Leave them.

---

## 🎯 Suggested order

1. **1.1** the CSS brace bug and **1.2** Volume Seer — minutes each.
2. **2.1** self-host the fonts. Biggest credibility win, mechanical.
3. **2.3** the em-dash sweep across the 51 remaining pages.
4. **2.2** the `rel="noopener"` pass, scripted.
5. **2.5 + 2.6** generate the sitemap and make the Wastelands data-driven.
6. **3.3 / 3.1** CSG booleans and Web Workers — the two biggest feature unlocks.
7. **3.4** decide what to do about D&D Forge's fake older editions.

---

_Generated 2026-08-07. Per-project `todo.md` files remain the detailed source of truth;
this is the roll-up._
