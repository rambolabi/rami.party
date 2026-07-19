# filldisk.com — recreation · TODO & build log

A faithful, self-contained recreation of **[filldisk.com](https://www.filldisk.com/)**
by Feross Aboukhadijeh — *"Masterful trolling with HTML5 localStorage"*.
Reference source: <https://github.com/feross/filldisk.com>.

Location: `rami.party/workshop/fill/` · Files: `index.html`, `style.css`, `script.js` (+ this `todo.md`).

---

## What the original did

- Exploited a browser bug: `localStorage` was capped at ~5 MB **per origin**, but
  Chrome/Safari/IE did **not** enforce a limit **across subdomains**.
- The page loaded an `<iframe>` for `1.filldisk.com/frame.html`, which filled its
  own 5 MB store, `postMessage`d its frame number back, and the parent loaded
  `2.filldisk.com`, `3.filldisk.com`, … — filling the whole disk, ~5 MB at a time.
- Showed a rising **"Used N MB"** counter, a new **cat** each step, a background
  that **reddened** as it filled, a looping **"trololo"** song, a *"Fork me on
  GitHub"* ribbon, and a **"Stop the madness!"** button to reclaim the space.
- Firefox was immune (it enforced the cross-subdomain limit), so it showed an alert.

## Why a 1:1 copy is impossible today

- The cross-subdomain quota bug is **patched** in all modern browsers.
- We only have a single origin (`…/workshop/fill/`), so the browser caps us to a
  few MB of **this page's** localStorage. Filling a real disk is no longer possible
  (and would be user-hostile), so this is an honest, safe homage rather than a
  working exploit.

---

## ✅ Done

- [x] Fetched & studied the original `index.html` and `index.js` from the repo.
- [x] Recreated the page in **3 core files** (`index.html`, `style.css`, `script.js`).
- [x] Reproduced the iconic UI:
  - [x] Headings — *"The Joys of HTML5"* / *"HTML5 Hard Disk Filler™ API"*.
  - [x] *"Oh hai there… Filling your hard disk with lots of cats…"* lede.
  - [x] **"Used `N` MB of disk space!"** live counter.
  - [x] Cat that changes every tick + a growing **wall of cats**.
  - [x] Background **reddens** (white → red) as it fills, like the original.
  - [x] **"Fork me on GitHub"** ribbon linking to the source repo.
  - [x] **"Stop the madness!"** reclaim button.
  - [x] Credits/links to Feross, the blog post, and the source.
- [x] Implemented the fill engine on a single origin:
  - [x] Writes ~100 KB chunks to `localStorage` under a `filldisk:` prefix on a timer.
  - [x] Catches `QuotaExceededError` and reports the reached cap.
  - [x] **Reclaim** removes only our `filldisk:` keys (won't nuke other site data).
  - [x] Restores/º continues from leftover data on repeat visits.
  - [x] Progress meter + tabular MB counter.
- [x] Bonus faithful touches: optional **WebAudio "trololo"** loop toggle, emoji
  **favicon**, Arvo web font, reduced-motion support, mobile-responsive layout.
- [x] Safety/ethics improvements over the original:
  - [x] **Opt-in** — fills only after the user clicks (no auto-fill on load).
  - [x] Only ever touches its own `localStorage` keys; fully reversible.
  - [x] No tracking/analytics (original had Google Analytics + StatCounter).

## 🔜 Still to do / optional

- [ ] **Add it to the rami.party workshop catalogue** (`projects.js` → `RAMI_WORKSHOP`)
      with a hidden `search` description, if it should appear on the hub.
- [ ] Optional: swap emoji cats for real cat images/GIFs (the original used photos)
      if you want a pixel-faithful look — needs bundled image assets.
- [ ] Optional: add a real `trololo` audio file instead of the synthesized loop.
- [ ] Cross-browser spot-check on Safari/iOS and Firefox (quota + audio behaviour).
- [ ] Decide whether to note the exact reached cap differs per browser
      (Chrome/Edge ~5–10 MB, Firefox ~5–10 MB, Safari ~5 MB).

## ⚠️ Notes / limitations

- Cannot truly fill a disk anymore — the underlying browser bug is fixed. This is
  a demonstration/homage, capped by the browser to a few MB.
- The optional tune is a small synthesized motif (WebAudio), not the actual
  "Trololo" recording, to avoid bundling copyrighted audio.
- Cats are emoji (no external/image dependencies) so the page is fully offline-capable.
