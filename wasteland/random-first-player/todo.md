# Random First Player — Production Review & TODO

Review date: 2026-07-18
Reviewer: front-end pass before production deployment as a subdomain of **labidi.eu**.

Overall verdict: the app is solid and now production-ready for the web. Several
real bugs were fixed, cross-browser/mobile robustness was improved, and one
dead setting was wired up. A short list of pre-launch and future items remains
below (mostly store-packaging assets and nice-to-haves).

---

## ✅ Bugs fixed

1. **Manual mode spawned invisible fingers on touchscreens.**
   The touch handlers (`handleTouchStart/Move/End`) never checked for manual
   mode, so on a phone every tap inside the Manual Mode UI called
   `preventDefault()` and dropped a hidden touch circle behind the panel
   (and could block typing). Added `if (settings.manualMode) return;` guards.

2. **Text-contrast logic was broken for almost every colour.**
   `generateRandomColor()` produced floating-point HSL (e.g.
   `hsl(210, 85.34%, 63.12%)`) but `getContrastColor()`’s regex only matched
   integers, so it always fell back to white text. Colours are now rounded to
   integers and the regex tolerates decimals/spacing.

3. **Three-teams mode didn’t grey-out fingers while waiting.**
   `getColorForTouch()` only special-cased `twoTeams`, so 3-team games showed
   random colours during the wait phase and only switched at selection. Now
   both team modes share the neutral-grey waiting state, and team 3 is handled.

4. **Turning OFF colourblind numbering left the numbers on screen.**
   `updateTouchIndicatorText()` early-returned when the mode was off and never
   cleared the label. It now clears leftover text.

5. **On-screen numbers could duplicate/skip after removing a finger.**
   Numbers were `size + 1` at creation only. Added `renumberTouches()` which
   re-labels 1…n on every add/remove so colourblind numbers stay correct.

6. **“Winner Effect Duration” setting did nothing.**
   The input existed (default 5s) but was never read. It now drives an
   auto-reset: after a winner/team result is shown for the configured time the
   round clears itself (double-tap still resets sooner). Cleared safely in
   `resetGame()`.

7. **Unreachable countdown-cancel code.**
   Both `handleTouchEnd` and `handleMouseUp` contained a “cancel countdown if
   players < 2” block that could never run (an earlier `return` shadowed it).
   Removed the dead code and documented the intentional “fingers lock in once
   the countdown starts” behaviour.

8. **Fragile inline `onclick` with floating-point IDs.**
   Manual-mode remove buttons used `onclick="removeParticipant(<float>)"` where
   the id was `Date.now() + Math.random()` — precision-risky and CSP-unfriendly.
   Replaced with stable string IDs + a single delegated click listener and
   `data-id`. Removed the global `window.removeParticipant`.

9. **Safari blur (`backdrop-filter`) didn’t render.**
   Added `-webkit-backdrop-filter` to the settings panel and double-tap prompt.

10. **Mobile 100vh jumpiness / notch overlap.**
    Switched full-height elements to `100dvh` (with `100vh` fallback), added
    `viewport-fit=cover`, and used `env(safe-area-inset-*)` so the burger and
    panels clear the notch/home indicator.

## ✨ Improvements added

- **PWA / installability groundwork:** added `manifest.webmanifest`, an SVG
  `favicon.svg`, `theme-color`, `apple-mobile-web-app-*` and a real
  `<meta name="description">`.
- **Tap outside the open settings panel now closes it** (touch + mouse).
- **Long-press context menu / callout suppressed** on the game surface only
  (inputs and settings keep their native menus).
- **Manual mode now honours typed CSS colours** (e.g. `red`, `#0af`) as
  promised by the placeholder; otherwise a random colour is assigned.
- **Accessibility:** remove buttons get `aria-label`s; document is
  `color-scheme: dark`.
- Cleaner, self-documenting code around the touch/mouse lifecycle.

## 📁 Files added

- `favicon.svg` — scalable app icon (three finger dots + winner star).
- `manifest.webmanifest` — PWA manifest (fullscreen, dark, categories).

---

## 🔜 Before / after production (recommended)

- [ ] **Raster icons for stores & legacy browsers.** Export PNGs from
      `favicon.svg`: `192×192`, `512×512`, and a **512×512 maskable** icon, then
      add them to the manifest. Google Play (TWA/Bubblewrap) requires a 512 PNG.
- [ ] **Service worker** for offline play + Android install prompt (the game is
      fully static, so a tiny cache-first SW is enough).
- [ ] **Deploy under the subdomain** (e.g. `tapfate.labidi.eu`) and set a
      `CNAME`. All asset paths are relative, so it will work in a subfolder too.
- [ ] **SEO pass (planned):** Open Graph / Twitter cards, `og:image`,
      canonical URL, `robots.txt`, `sitemap.xml`. (Intentionally deferred.)
- [ ] **Legal/analytics (optional):** privacy note (no data leaves the device —
      good selling point), optional privacy-friendly analytics.
- [ ] **Cross-device test matrix:** iOS Safari, Android Chrome, iPad, desktop
      Chrome/Firefox/Edge/Safari; verify multi-touch on real hardware.

## 💡 Future feature ideas (nice-to-have)

- Sound + haptic (`navigator.vibrate`) feedback on winner selection.
- Winner glow uses the picked colour instead of white.
- “Reverse” mode (pick who goes *last*), or pick an ordered turn sequence for
  the touch game (already exists in manual mode).
- Configurable number of teams (4+).
- Optional on-screen hint that the round auto-clears, or a toggle to disable it.
- Live region (`aria-live`) on the instruction/countdown for screen readers.

---

## 🏷️ Name suggestion

**Recommended: “TapFate”** — already wired in as the working title/manifest name.
Fingers tap the screen, fate decides. It is short, brandable, memorable, easy to
say aloud at a game night, and reads well as an app icon label.

- Domain: **tapfate.labidi.eu**
- Play Store package id: **eu.labidi.tapfate**
- Store tagline: *“Fingers down — let fate pick who goes first.”*

Strong alternatives (in case of trademark/availability issues):

| Name | Vibe | Subdomain |
|------|------|-----------|
| **GoFirst** | plain, descriptive, SEO-friendly | gofirst.labidi.eu |
| **FingerFate** | playful, descriptive | fingerfate.labidi.eu |
| **FirstTouch** | clean, premium feel | firsttouch.labidi.eu |
| **WhoStarts** | literally the question people ask | whostarts.labidi.eu |
| **TapToGo** | snappy, action-y | taptogo.labidi.eu |

If you prefer a purely descriptive store listing for discoverability, title it
**“TapFate — Who Goes First? Random Picker”** so the keywords are present while
keeping the brand name.

> Note: the working name is set in `index.html` (`<title>`, meta tags) and
> `manifest.webmanifest`. If you pick a different name, update those two files.
