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
| `data-scenarios.js` | `OASIS_BANDS` + `OASIS_SCENARIOS` — before/during/after playbooks. |
| `data-trees.js` | `OASIS_TREES` — interactive decision guides. |
| `data-reference.js` | `OASIS_SOURCES` (attribution registry) + `OASIS_TABLES` + `OASIS_LINKS`. |
| `tools.js` | `OASIS_TOOLS` — declarative calculators. |
| `app.js` | Router, renderer, search, log, card, position, theme, install, offline. |
| `sw.js` | Cache-first service worker, self-healing shell cache. |

## Built

- [x] 12 chapters, 93 cards, **42 playbooks**, **6 decision guides**, 21 tables,
      24 calculators, 43 named source authorities
- [x] **`#/now` — "I need help now"**: 13 one-tap critical links plus interactive
      decision guides for unknown situation, casualty, navigation, meeting people,
      water safety and stay-or-go
- [x] **Playbooks**: before / during / after across 8 bands — everyday, infrastructure,
      natural, CBRN, disease, conflict, isolation, long-term collapse
- [x] **People chapter**: what really happens in disasters, meeting strangers,
      running a group, trade and barter, working across a language barrier
- [x] **Navigation**: WGS84 vs ETRS89 vs UTM, using a compass, making a compass,
      night navigation, navigating under cloud, plus the existing sun/stars work
- [x] **Medical completeness**: penetrating trauma, poisoning and fumes, crush and
      entrapment, drowning, electrical injury, bites and envenomation, abdominal
      injury and hernia, eye injuries, childbirth, dental
- [x] **Communications**: satellite, digital modes, non-electronic methods, running
      a net, repairing a radio, CB on 12/24 V, obtaining a beacon, building a
      crystal radio, master table of 38 channels, global alerting table with BE-Alert
- [x] **Position page** (`#/pos`, or tap the status chip): all formats, copy, log,
      save waypoints, GPX export, and a locally drawn range-ring map
- [x] **Emergency card** (`#/card`): fillable, printable, stored only on the device
- [x] Install: `beforeinstallprompt` captured, status-bar button, install card with
      per-platform manual steps and installed-state detection
- [x] 5 themes including red night vision; adjustable text; wake lock; print layouts
- [x] Field log, GPS fix, tool-input persistence, "erase all local data"

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

- [ ] **Offline map tiles** for a user-chosen region — the one genuine gap. The
      position page draws range rings and waypoints to scale, which is a
      substitute, not a map. Any real solution means bundling tiles, which
      conflicts with the zero-fetch rule unless the user imports them by hand.
- [ ] Ship a reduced WMM/IGRF coefficient set so declination needs no observation
      (the solar method now covers it, but a model would work at night)
- [ ] GPX **import** (export is done)
- [ ] Translations — NL/FR first, to match the rest of rami.party
- [ ] Satellite pass prediction from stored TLEs (SGP4 is ~200 lines)
- [ ] Share a waypoint set or the emergency card as a QR code, device to device,
      with no network (needs a QR encoder, ~200 lines)
- [ ] Region selector that surfaces the playbooks and alerting systems for where
      you live, and hides the irrelevant ones
- [ ] More decision guides: chest pain, breathlessness, abdominal pain, fever
- [ ] Playbook: dam failure, train derailment, sinkhole, mass gathering crush

## Migration to oasis.labidi.eu

The code is already origin-agnostic — every internal link is relative and every
asset is local, so the folder runs from any path, any domain, or `file://`.

1. Copy the folder to the new repository root.
2. Edit the `CONFIG` block at the top of `app.js`: set `parentSite: null` to drop
      the "back to rami.party" chip, or repoint it.
3. Update `<link rel="canonical">` in `index.html`.
4. Add `CNAME` containing `oasis.labidi.eu`, plus `robots.txt` and a `sitemap.xml`.
5. Leave a redirect at `/workshop/OASIS/` — installed copies keep working either
      way, but bookmarks and search results will not.
6. Bump `CACHE` in `sw.js` so existing installs pick up the change.

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
- Search is substring-based and requires **all** terms to match, so write `keys`
  in the words a frightened person would actually type. "warzone", "shtf",
  "deserted island" and "martial law" all returned nothing until they were added.
  Add plurals too — "rupture" does not match a search for "ruptures".
- Search scores three fields: title, `keys`, body. Whole-word matches beat
  substring matches and an all-terms-whole-word hit gets a 1.6× bonus. Without
  that, "car" matched inside "cargo" and "car crash" returned the aircraft playbook.
- Every playbook needs `sources`; every tree option must point at a node that
  exists and every path must terminate. The structural audit checks both.
- Contact for gaps is `oasis@labidi.eu`, shown in the footer and on About.
