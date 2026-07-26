# Markdown Editor — TODO & Notes

A fully offline, dependency-free Markdown editor. No CDNs, no external APIs, no
tracking. Everything runs locally in the browser.

---

## 🐛 Bugs found & fixed

- **External CDN dependency (critical).** The old editor loaded the Showdown
  parser from `cdnjs.cloudflare.com`. This broke the app completely when
  offline and leaked a request to a third party. → Replaced with a
  self-contained, hand-written Markdown parser (`parseMarkdown` in
  [script.js](script.js)).
- **XSS vulnerability.** The converted HTML was injected with `innerHTML`
  without sanitisation, so `<script>`/`onerror=` payloads in the markdown could
  execute. → Added an HTML sanitiser that strips scripts, event handlers and
  dangerous URI schemes before rendering.
- **Dark-mode icon never updated.** The ☀️ button always showed the sun,
  regardless of state, and did not reflect the saved preference on load. →
  Icon now syncs with the active theme.
- **Toggle-preview label desync.** On mobile the preview starts hidden via CSS
  but the button read "Toggle Preview", and the first click showed the wrong
  label. → Button label and `aria-pressed` now always match real state.
- **No content persistence.** Everything typed was lost on refresh. → Content
  is auto-saved to `localStorage` (debounced) and restored on load.
- **Missing accessibility.** No labels, roles, focus styles or keyboard hints.
  → Added ARIA labels, visible focus rings, skip semantics and a `prefers-
  reduced-motion` fallback.
- **Layout overlap.** The floating toggle sat on top of the editor text. →
  Moved into a proper toolbar.

## ✨ Features added

- Fully local Markdown parser: headings, **bold**, *italic*, ~~strike~~,
  ==highlight==, `inline code`, fenced code blocks, blockquotes,
  ordered/unordered lists, task lists, tables, links, images, horizontal
  rules, auto-links.
- HTML sanitiser (XSS-safe rendering).
- **10 themes** with a live theme picker (Aurora, Midnight, Solar, Nord,
  Dracula, Rosé, Matrix, Paper, Sunset, Cyberpunk) — persisted per user.
- Formatting toolbar (bold, italic, heading, link, code, list, quote) with
  smart selection wrapping.
- Keyboard shortcuts: `Ctrl/Cmd+B`, `I`, `K` (link), `` ` ``, `S` (save file),
  `F` (find).
- Live statistics: words, characters, lines, reading time.
- Synchronised scrolling between editor and preview.
- Export: copy HTML, download `.md`, download standalone `.html`, Print/PDF.
- Auto-save + restore via `localStorage`, plus a "clear" action.
- Drag-and-drop / open a local `.md` file.
- Responsive split view with a mobile preview toggle.
- Starter document shown on first run.
- **Syntax highlighting** in fenced code blocks — local generic tokenizer,
  keyword/string/comment/number/function colouring, safe span output.
- **Table of contents** drawer generated from headings; click to scroll.
- **Slash-command menu** — type `/` at the start of a line for quick inserts
  (headings, lists, table, diagram, date, …), keyboard-navigable.
- **Find & replace** bar (`Ctrl/Cmd+F`) with match count, next/prev, replace
  and replace-all.
- **Multiple documents / tabs** stored locally — new, rename (double-click),
  close, switch; each tab persists independently.
- **Markdown lint hints** — trailing whitespace, missing `#` space, empty link
  URLs, multiple blank lines, unclosed code fences; click a hint to jump.
- **PWA / offline install** — `manifest.webmanifest` + `sw.js` service worker
  (auto-registers over http(s); no-op on `file://`).
- **Mermaid-style diagrams** — local SVG renderer for `graph TD/LR` flowcharts
  with rect/round/diamond nodes and labelled edges, built via DOM (XSS-safe).
- **Vim keybinding mode** (toggle in ⚙ settings) — normal/insert/visual modes,
  `h j k l`, `w b`, `0 $`, `gg G`, `i a I A o O`, `x`, `dd D`, `yy p P`, `v`,
  `u`, `/`, with a mode indicator in the status bar.

## 🌈 Themes

| Theme      | Vibe                          |
|------------|-------------------------------|
| Aurora     | Violet/cyan glass (default)   |
| Midnight   | Deep blue minimalist          |
| Solar      | Warm light, sepia             |
| Nord       | Arctic muted blues            |
| Dracula    | Classic purple/pink dark      |
| Rosé Pine  | Soft rose + iris              |
| Matrix     | Green-on-black terminal       |
| Paper      | Clean white, print-like       |
| Sunset     | Orange/magenta gradient       |
| Cyberpunk  | Neon yellow + magenta         |

## 🔮 Future ideas (next steps)

- [ ] Language-specific highlighting grammars (currently one generic tokenizer).
- [ ] More diagram types (sequence, pie, gantt).
- [ ] Slash-command menu positioned with real caret metrics on wrapped lines.
- [ ] Cloud-free sync between devices via export/import bundles.
- [ ] Configurable Vim leader mappings and `.` repeat.
- [ ] Emacs keybinding mode.
- [ ] Outline-based drag-to-reorder sections.
- [ ] Word-count goals and focus/typewriter mode.

