# O.A.S.I.S. — todo

**O**ffline **A**dvanced **S**ystem for **I**nformation and **S**urvival.
An air-gapped field reference: doctrine, tables and working calculators that keep
working with the cable cut. `/workshop/OASIS/`

## Hard rules

- **Zero external requests.** No fonts, no CDN, no analytics, no frameworks.
  If a change adds a network call, the change is wrong.
- **No `innerHTML`.** `app.js` builds everything with `createElement`/`textContent`.
  Authored copy supports `**bold**` and backtick-code via `rich()`.
- **Never change an existing `id`** (chapter, card, tool). Hash routes and the
  search index point at them.
- Content is reference, not advice. Every risky topic carries its limits.

## Files

| File | Role |
| --- | --- |
| `index.html` | Shell only — header, rail, `<main>`. Everything else is rendered. |
| `style.css` | Design system + 5 themes via `[data-theme]` + print stylesheet. |
| `geo.js` | Pure geodesy/astronomy → `window.GEO`. No DOM. |
| `data-knowledge.js` | Chapters → cards. The doctrine. |
| `data-reference.js` | `OASIS_TABLES` (lookup tables) + `OASIS_LINKS` (sources to mirror). |
| `tools.js` | `OASIS_TOOLS` — declarative calculators. |
| `app.js` | Router, renderer, search, field log, theme, offline plumbing. |
| `sw.js` | Cache-first service worker, self-healing shell cache. |

## Built

- [x] 11 chapters, 65 cards, 16 tables, 23 calculators, 24 vetted sources
- [x] Hash router with deep links to any card or tool (`#/c/medical/bleeding`)
- [x] Instant weighted search across cards, tables, tools and sources (`/` to focus)
- [x] 5 themes — tactical, daylight, field, survival, **night vision** (red-only,
      monochrome glyphs so nothing destroys dark adaptation)
- [x] Adjustable text size, screen wake lock, print layout per chapter
- [x] Geodesy: DD/DDM/DMS ⇄ UTM ⇄ MGRS ⇄ Maidenhead, distance/bearing,
      waypoint projection, iterative resection, sun/moon, plot board canvas
- [x] Field log with timestamps and text export; GPS fix stored locally
- [x] PWA — installable, offline-first, self-healing cache, "cache everything" button
- [x] Tool inputs persist per tool; "erase all local data" in About

### Verified

- Quarter meridian 10 001 965.730 m (truth …729); global UTM forward/inverse
  round-trip closes < 1.5 mm; MGRS of 0°,0° = `31N AA 66021 00000`
- Resection closes to 0.000 mm across 8 geometries including the dateline and
  both polar regions
- **Zero external requests** — a full session loads exactly 7 same-origin files
  and nothing else, measured from the network log
- All 23 tools × 7 adversarial input sets (empty, zero, negative, 1e21, garbage,
  whitespace) produce no NaN, no Infinity and no exception
- Structural audit passes: no duplicate ids, every table row matches its column
  count, every chapter/tool/table cross-reference resolves, all `**` balanced,
  every select default is a real option, every source link is https
- No horizontal scroll from 320 px to 1440 px; zero console errors on all 16 routes

### Fixed in the post-build audit

- `+'' === 0` is finite, so a cleared numeric field became a real zero instead of
  the default — produced `NaN` in the pace-count tool
- Full-wave loop applied the velocity factor twice (the 1005/f rule already
  includes end effect): antenna was 5 % short and contradicted its own doctrine card
- Morse letter gaps were 4 units and word gaps 8, instead of 3 and 7; SOS now
  sends as an unbroken prosign
- Coordinate parser dropped the minus sign on unsigned-hemisphere DMS, and a
  place name like "BRUSSELS" donated its S and flipped the latitude
- DDM/DMS printed `60.000'` and `60.00"` instead of carrying to the next unit
- Time fields were persisted, freezing the sun/moon and DTG tools at whenever
  you last opened them
- Worked UTM/MGRS example in the coordinates card was simply wrong for its own
  lat/lon; radiation card's halving thicknesses contradicted the shielding table;
  wind chill table was up to 3 °C out; fallout decay figures did not match the
  t⁻¹·² curve the calculator uses; 12 AWG quoted as 4 mm² at under 3 % drop
- Removed `GEO.intersect`: unused, and its docstring invited exactly the
  back-bearing misuse that had already cost 694 m at 64°N
- `aria-live` on tool output re-announced the entire result on every keystroke
- Canvas kept stale theme colours after a theme switch

## Next

- [ ] Offline raster/vector map tiles for a user-chosen region — the one genuine
      gap. The plot board is a substitute, not a map.
- [ ] Magnetic declination without a lookup: ship a reduced WMM coefficient set,
      or derive it from the solar azimuth tool and store it per location
- [ ] Waypoint import/export as GPX so the plot board talks to real GPS units
- [ ] Printable one-page emergency card (position, contacts, allergies, PACE plan)
- [ ] Translations — NL/FR first, to match the rest of rami.party
- [ ] Satellite pass prediction from stored TLEs (SGP4 is ~200 lines)
- [ ] Triage decision trees: chest pain, breathlessness, abdominal pain
- [ ] Group mode: share a waypoint set or config as a QR code, device to device,
      with no network at all
- [ ] Spoken CPR coaching for hands-busy use
- [ ] Chapter: animals, bites, stings and envenomation (region-aware)
- [ ] Chapter: civil and legal — checkpoints, documents, rights, borders

## Content backlog

- [ ] Water: improvised filter build with measured flow rates
- [ ] Comms: a worked CHIRP codeplug for the common cheap handhelds
- [ ] Power: measured draw table for real devices rather than nameplate figures
- [ ] Nav: star charts drawn as SVG for both hemispheres
- [ ] Hazards: volcanic ash, landslide, avalanche and tsunami first-hour actions

## Gotchas

- `+'' === 0` and `Number.isFinite(0)` is true, so "empty means default" needs an
  explicit empty check. `tools.js` has one helper, `n()` — use it, never `+x || d`.
- The service worker calls `clients.claim()`, so it serves stale JS on the very
  next reload. During development: unregister + clear caches + `about:blank`
  before every reload, or you will test yesterday's code.
- Colour emoji break the night-vision theme — glyphs must be monochrome text
  symbols that inherit `currentColor`. That includes the moon-phase glyphs.
- Grid tracks need `minmax(0, 1fr)`. A bare `1fr` cannot shrink below its
  content, and one wide table then takes the whole page sideways.
- A back bearing is **not** the forward bearing plus 180° on a sphere. Resection
  must iterate, or meridian convergence puts you hundreds of metres out.
- Any numbers written into a doctrine card or reference table must be generated
  from the same formula the calculator uses. Every hand-typed table in the first
  draft had at least one wrong cell.
- Canvas drawing reads CSS custom properties, so anything drawn must be
  re-drawn when the theme changes (`sec._redraw`).
