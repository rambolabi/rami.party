# ✨ rami.party — Follow-ups & Decisions

Living notes for the enchanted playground. **Decisions only** — the full task backlog now lives
in [`workshop/todo.md`](workshop/todo.md).

---

## 🗺️ Current structure
```
/                     hub (index.html, theme.css, style.css, script.js, projects.js)
favicon.svg · og-image.png · admin/ · 404.html · robots.txt · sitemap.xml
gallery/              🏛️ The Gallery of Wonders
  militaryalphabet/   🔤 Phonetic Codex — moved to alphabet.labidi.eu (redirect + tombstone sw)
  lore/               📜 Lore Gallery
  prankscreens/       🖥️ Prank Screens
workshop/             ⚗️ The Workshop — a data-driven catalogue of every WIP
  md/                 📝 Markdown Studio — moved to md.labidi.eu (redirect + tombstone sw)
  3d-forge/ batlistener/ bbq/ blur/ character-forge/ clear/ dashboard_v1/
  demoscene-forge/ dm-screen/ dnd-forge/ DNS-sinkhole/ Engraving/ fill/ laser/
  laser-forge/ laser-forge-v2/ mailheaders/ news/ personality-library/ rami/
  scoreboard/ subnets/ to-check/ todo/ tools/ trace-results/ webcheck/
  personality-library/ + its 15 book workshops (DISC, Big Five, MBTI, Enneagram,
    Attachment, Love Languages, Temperaments, Conflict Styles, EQ, Liars,
    Vampires, Bad Bosses, Psychopaths, Narcissists, Setbacks)
wasteland/            ☄️ The Wastelands (index)
  neko/  old-rami.party/  adhd/  notes/  bluetooth/  house/  random-first-player/
```
Realms that graduated to their own domains: O.A.S.I.S. (`oasis.labidi.eu`), Phonetic Codex
(`alphabet.labidi.eu`), Markdown Studio (`md.labidi.eu`), GhostTooth, Huiskeuring, TapFate.
GhostTooth, Huiskeuring and TapFate left husks in `wasteland/` as mementos, each reachable
from its card; O.A.S.I.S., the Phonetic Codex and Markdown Studio left a redirect page plus a
**tombstone `sw.js`** in place, because all three were installable PWAs whose old service
worker would otherwise keep serving a frozen copy from the visitor's own storage. Those three
folders must not be deleted. Each tombstone scopes its teardown to its own cache prefix and
scope path — `caches` and the service worker registry are shared by the whole origin, so a
blanket wipe would destroy the other workshop apps' offline copies.

---

## ✅ Decisions taken (2026-07-27)

| Decision | Choice | Why |
|---|---|---|
| **Indexing** | **Publish.** `noindex` removed from real content pages; canonicals added. | `robots.txt` already invited crawlers and linked a sitemap — the signals contradicted each other. Reverse by putting `content="noindex, nofollow"` back. |
| Still `noindex` | `404.html`, `admin/`, `dm-screen/player.html`, `dm-screen/characters.html`, `laser-forge-v2/`, `wasteland/bluetooth/` | Error page, private, companion screens, and two duplicate-content pages (v2 canonicals to v1, bluetooth canonicals to ghosttooth.labidi.eu). |
| **`D&D Forge` folder name** | Renamed to **`dnd-forge/`** via `git mv`. | A space and `&` in a path must be percent-encoded everywhere — a permanent source of broken links. |
| **The 15 book workshops** | Surfaced as **one** catalogue entry, *The People Library*. | 15 near-identical cards would drown the Workshop; the library page is already a good hub. |
| **BBQ Mailer** | Keep local, no backend needed. | It composes a `mailto:` link (`sendEmail()` in `script.js`) — it never needed `submit.php`. The old note was wrong. |
| **`workshop/laser/` photography** | Local SVG placeholders + `status:'soon'`. | Honest, keeps the layout intact, and swapping in real photos is a one-file change. |
| **lebon.info branding** | User-visible strings rebranded; *source-comment attributions kept*. | `/* Based on lebon.info Terminal Theme */` is accurate history, not a leak. |
| **External lebon.info links** | **Removed.** `note.lebon.info` → `note.labidi.eu`, `lebon.info/project/` → `labidi.eu/#projects`, the `scan.lebon.info` "Network Scanner" card dropped (no successor). | lebon.info is being retired; links now point at the live rami.party / labidi.eu equivalents. |
| **`BBQ@lebon.info`** | **Open.** Still hardcoded in `workshop/bbq/` (`index.html`, `script.js`). | It is a real mailbox, not a link — needs a working replacement address before it can be swapped. |

---

## 🧩 How to add / rank a project
- **Finished realm (hub):** append an object to `RAMI_REALMS` in `projects.js` with a `category`
  of `gallery` or `wastes`. Order within the array = ranking. `external:true` opens in a new tab.
- **Work in progress (Workshop):** drop the folder in `/workshop/<name>/`, then append an object
  to `RAMI_WORKSHOP`. `href` is relative to `/workshop/` (e.g. `./webcheck/`). Order = ranking.
  `status:'live'` is clickable; `status:'soon'` shows a locked teaser.
- **Planned idea (name only):** add `{ name, note }` to `RAMI_PLANNED`. Move it up into
  `RAMI_WORKSHOP` once its folder exists and has content.
- **Then add it to `sitemap.xml`** — the one manual step left. (A generator is on the backlog as
  *Sitemap Scribe*.)

---

## ⚖️ Open decisions (need a human)

- [ ] **`wasteland/bluetooth/` — keep or delete?** It duplicates `ghosttooth.labidi.eu`. It is now
      noindexed and canonicalised to the live site, so keeping it is harmless. Delete if you'd
      rather not maintain two copies.
- [ ] **`workshop/laser/` — real business site or demo?** If it's only a layout demo, say so on
      the page (the testimonials are fictional people). If it's meant to be a real storefront, it
      needs real photography, a real address and a working contact form.
- [ ] **`workshop/to-check/` — still useful?** A link dump of GitHub tools. Fold into
      *IT Tools Workbench* or retire it.
- [ ] **`workshop/rami/` and `workshop/dashboard_v1/`** — both are now `status:'soon'`. Finish
      them, or move them to `wasteland/`.
- [ ] **Chart.js CDN in the DISC workshop** — every other realm is offline-first. Vendor it
      locally, or accept the exception.
- [ ] **`wasteland/index.html` is hand-written** while everything else renders from
      `projects.js`. Make it data-driven too, or accept the divergence.

---

_Task backlog: [`workshop/todo.md`](workshop/todo.md) · Per-project detail: each project's own
`todo.md`._
