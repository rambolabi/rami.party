# Mail Ward — todo

The email suite: one guide plus two tools. No build step, no dependencies (except the
volume dashboard's CDN charting library — see below).

```
mail-ward/
  index.html      # the guide: theory, 10-step plan, builder, inspector, runbook
  style.css       # guide styling (themes shared with Subnet Studio)
  app.js          # theme, sticky measurement + scrollspy, builder, inspector,
                  #   opt-in DoH lookup, two wizards, checklist
  suite.css       # the shared Mail Ward bar used by BOTH sub-pages
  og-image.svg
  analyzer/       # ← was workshop/mailheaders/ (moved 2026-07-31, see its own todo.md)
  volume/         # ← was workshop/trace-results/ (moved 2026-07-31)
    charts.js     #   local SVG bar + doughnut renderer (replaced Chart.js)
    xlsx.js       #   local .xlsx reader (replaced the SheetJS CDN bundle)
```

Old paths `workshop/mailheaders/` and `workshop/trace-results/` are now noindex redirect
stubs pointing here; `projects.js` carries **one** consolidated catalogue entry.

## Facts worth keeping

- **The whole suite is third-party-free and works offline.** Zero external requests on all
  three pages — verified by watching the request log, not by reading the markup. The only
  network calls that exist anywhere are user-initiated: the guide's opt-in DoH lookup and the
  analyzer's opt-in MXToolbox/VirusTotal/ICANN buttons. Do not reintroduce a CDN.
- `volume/xlsx.js` reads .xlsx by parsing the ZIP central directory by hand and inflating
  with `DecompressionStream('deflate-raw')`. It handles both DEFLATE (method 8) and STORED
  (method 0) entries. Legacy binary `.xls` is deliberately unsupported — a different
  container entirely — and gets an explicit "re-save as .xlsx or .csv" error.
- `volume/` CSV parsing is a real RFC 4180 reader. It must stay one: message-trace exports
  contain quoted subject lines full of commas, and the old `split(',')` silently shifted
  every column after the first comma.
- `.chart-wrapper` uses `min-height`, not `height` — the SVG charts size themselves to the
  data, and a fixed height clipped them.
- All generated DOM uses `createElement`/`textContent`. Never introduce `innerHTML` here —
  the inspector renders text the user pasted.
- **Sticky offsets are measured, never hard-coded.** The topbar wraps to two rows on narrow
  screens (63px → 112px), so `--topbar-h` and `--stick` are written by `measureSticky()` and
  consumed by `.tocbar { top: }`, `html { scroll-padding-top: }` and `.card`. If you add
  anything to the topbar, nothing needs changing — but do not reintroduce a pixel literal.
- The scrollspy throttles **on the clock, not on `requestAnimationFrame`**: rAF never fires
  while the tab is hidden or occluded, which would latch the handler off permanently.
- `jumpTo()` and the back-to-top button check `prefers-reduced-motion` in JS —
  `window.scrollTo({behavior:'smooth'})` ignores the CSS media query.
- `makeWizard()` drives both decision trees (setup + spoofing triage). Outcomes may carry
  `record` (rendered as a code block) and `link` (an in-page jump that reuses `jumpTo`).
  The step `<li>` elements carry `id="step-0"`…`step-10` — do not renumber them casually.
- The `.tool-card`s in `#tools` are `<div>`s, not `<a>`s, on purpose: they contain links, and
  a nested `<a>` inside an `<a>` is invalid and gets torn apart by the parser.
- `PROVIDERS[].lk` is an **estimated** recursive SPF lookup cost per `include:`. It is
  documented as an estimate in the UI; do not present it as authoritative.
- Vendor `include:` tokens and DKIM selectors drift. Re-verify against vendor docs
  before changing them, and keep the "confirm with your provider" caveats.
- Wording that was deliberately corrected once already — do not let it drift back:
  SPF `permerror` is "never a pass, so SPF contributes nothing to DMARC" (not "receivers
  treat it as no SPF"); `Authentication-Results` — only the **topmost** one is trustworthy;
  `pct` is removed in the forthcoming DMARC revision.

## Open

- [ ] Delete `analyzer/script.js` (58 KB) — the pre-split monolith, loaded by nothing.
      Left in place only so the removal is a deliberate decision rather than a silent one.
- [ ] Re-check every `include:` token and DKIM selector against current vendor docs (they change).
- [ ] Add a DMARC aggregate-report (XML) drop zone that summarises sources locally —
      it belongs next to the volume dashboard, and would complete the "who sends as me" story.
      `volume/xlsx.js` already provides the unzip primitive for the gzipped report attachments.
- [ ] The volume dashboard could chart volume **over time** as well as by sender — the date
      column is read but currently unused.
- [ ] Add an SPF flattening preview (resolve includes over DoH, show the resulting ip4 list)
      with a loud warning about freezing provider IPs.
- [ ] Offer a printable / one-page export of the runbook and the "recognising fakes" section
      so it can be handed to non-technical staff.
- [ ] Translations (nl / fr) — the site's Subnet Studio already carries an i18n pattern to copy.
- [ ] From the analyzer's results, deep-link into the guide when a check fails
      (e.g. `dmarc=fail` → `#spoof`, SPF permerror → `#spf`).
- [ ] Consider a small "cousin domain" generator: given a domain, list the common
      typo/homoglyph variants worth monitoring or registering defensively.

## Verifying

1. `python -m http.server 8844 --bind 127.0.0.1` from `c:\Temp\Git\rami.party`
2. Open `/workshop/mail-ward/` with the HTTP cache disabled — otherwise you test stale JS/CSS.
   The VS Code embedded browser caches `app.js` even through a reload; force it with
   `fetch('app.js', {cache:'reload'})` before `location.reload()`.
3. Check all three pages: `/workshop/mail-ward/`, `/analyzer/`, `/volume/`, plus the two
   redirect stubs at the old paths.
4. Check: theme switch persists, TOC highlights on scroll, every TOC link lands its heading
   clear of the sticky bars, builder reacts to every input, inspector handles
   SPF / DMARC / DKIM / garbage, both wizards reach all of their outcomes (setup: 12,
   triage: 7), checklist survives a reload, the analyzer's "Load an example" still fills in
   the checks / sender / relay / headers panels.
5. For `volume/`, test with a CSV whose subject column contains commas, and with a real
   `.xlsx` — both must produce identical totals. Also test a STORED (uncompressed) .xlsx,
   a non-ZIP file renamed `.xlsx`, an `.xls`, and a wrong column name: each must show a
   helpful error rather than throwing.
6. Assert **zero external requests** on all three pages via the Playwright request log, plus
   no element wider than the viewport at 360 px, and no nested `<a>` anywhere.
7. Note: the embedded browser reports `document.hidden === true`, so **native scroll events
   and `requestAnimationFrame` never fire there**. Test the scrollspy by dispatching
   `new Event('scroll')` manually, or use a real browser. `page.click()` also times out on
   this page — drive buttons with `page.evaluate(() => el.click())`.
