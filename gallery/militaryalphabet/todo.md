# Phonetic Alphabet Studio — TODO &amp; changelog

Single-page tool at `/gallery/militaryalphabet/`.
Stack: plain HTML + CSS + vanilla JS. **No build step, no dependencies, no framework.**

## Layout

```
index.html               markup + script tags (load order matters)
style.css                themeable UI; every colour comes from CSS variables per [data-theme]
manifest.webmanifest     PWA manifest
sw.js                    service worker: network-first pages, stale-while-revalidate assets
icon.svg                 app icon        icon-maskable.svg  maskable variant
js/
  core.js                namespace, storage keys, formatting, toast, clipboard, event bus
  i18n.js                translation engine only (~100 lines)
  lang/en.js             the reference catalogue — no key may be missing here
  lang/fr.js             French: interface + alphabet names/notes + code tables
  lang/nl.js             Dutch: same
  data-alphabets.js      all 28 alphabets (plain script, not JSON — see "no fetch" below)
  data-reference.js      themes, Morse, punctuation, accent folding, prowords, Q-/ten-codes
  speech.js              Web Speech wrapper: voices, rate/pitch/gap, cancellable sequencer
  wake.js                screen wake lock, timer, pomodoro, battery/activity/notify/chime
  translator.js          tokeniser, output formats, reverse decoding, history, CSV/JSON
  grid.js                tile rendering, search filter, jump-to-letter, speak highlight
  quiz.js                four practice drills, score/streak/best
  exporters.js           print, PNG, CSV/JSON download, share links
  ui-wake.js             the two header pills + the timer panel
  ui-translate.js        the TRANSLATE tab
  ui-present.js          the full-screen presentation overlay
  ui.js                  shell: tabs, alphabet/theme/language, voice, shortcuts, clock
  app.js                 bootstrap, in dependency order, and the single 1 Hz heartbeat
```

**Why data lives in `.js` and not `.json`:** a `fetch()` of a local JSON file is blocked over
`file://`, and this tool has to keep working when it is saved to disk or carried on a stick.
Modules attach to a single `window.PAS` namespace and communicate through
`PAS.on` / `PAS.emit`, so no module reaches into another module's internals.

---

## Changelog

### 2026-07-30 (5) — Bug hunt: quiz fairness & export polish

Fourth review pass over the modules least covered so far (quiz internals,
exporters, translate UI). 17 assertions on port 8803, 0 console errors.

**Bugs fixed**
- **Quiz duplicate / ambiguous answers** — `distractors()` only excluded the
  same *character*, so with Western Union (Z and 0 are both ZERO) letter→word
  could show two identical ZERO buttons with one counted wrong, and word→letter
  could offer both Z and 0 where either is really correct. Distractors now must
  differ in both character *and* code word. Verified over 300 rendered rounds.
- **Share sheet cancel copied the link** — dismissing the native share dialog
  rejected with `AbortError`, which fell into the clipboard fallback and
  toasted "Copied". Now only real failures fall back.
- **PNG export showed the untranslated alphabet name** — the canvas header now
  uses the `alpha.<id>.name` translation like the rest of the UI.
- **Silent SPEAK in reverse mode** — with empty output, PHONETIC → TEXT speak
  did nothing; it now toasts "Nothing to speak" like the forward direction.

Service worker cache bumped to `pas-v6` (quiz.js, exporters.js,
ui-translate.js changed).

### 2026-07-30 (4) — Full feature verification

Every feature exercised after the refactor, with assertions rather than eyeballing:
**612 checks, 2 real bugs found and fixed, 0 console errors.**

**Bugs found**

- **ß was never spelt out.** `tokenize()` guarded the accent-folding branch with
  `folded !== up` — but `"ß".toUpperCase()` is already `"SS"`, so the guard was true for
  exactly the character the special-case table exists for. ß and ẞ fell through to a literal
  chip instead of SIERRA SIERRA. The guard was pointless (we only reach that branch after a
  direct lookup has already failed) and is gone. é, ø, æ, ñ, ł, þ, ð, œ and ŋ were and
  remain correct; a genuinely unmappable character still falls through to a literal.
- **Western Union could not round-trip the digit 0.** Its Z is spelt ZERO, the same word as
  the digit, so decoding ZERO returned Z. That ambiguity is real in the source table, not an
  error in the data — so the behaviour is left deterministic (the documented letter wins) and
  the alphabet's description now says so, in all three languages. It is the only such
  collision: the other 27 alphabets round-trip their complete tables.

**What was checked**

- *Data integrity, all 28 alphabets*: no duplicate characters, no duplicate Latin keys, no
  Latin key colliding with a real character, no duplicate code words, every entry has a
  pronunciation, 10 digits each, valid BCP-47 tags, Morse for every A–Z0–9 entry, unique
  prowords / Q-codes / ten-codes / punctuation, well-formed Morse table.
- *Translator*: forward and reverse, all seven formats round-tripping in all three languages,
  accent folding, punctuation, callsign mode, direction swap carrying the output across,
  clear, history add/load/copy/clear, share link parameters, PNG canvas, CSV and JSON exports.
- *Chart*: 36 tiles, Morse row toggle, search by word, empty state, single-character jump,
  clear, tile click flash.
- *Practice*: all four drills start with four options, correct field and replay-button
  visibility per mode, wrong answers marked and streak reset.
- *Wake lock*: all seven presets plus no-limit, custom duration with 1–1440 validation,
  +15m and +1h, until HH:MM with invalid input rejected, progress ring, title countdown on
  and off, cancel (twice), the full pomodoro work→break→work cycle with its counter, expiry,
  re-arming the last duration, and all six behaviour switches persisting.
- *Shell*: every one of the 28 alphabets renders the right tile count, all six themes apply
  and update `theme-color`, all thirteen keyboard shortcuts, shortcuts suppressed while
  typing, clock ticking in 24-hour form.
- *Persistence*: alphabet, theme, language, format, callsign, Morse row, sound, rate, pitch,
  gap, active tab, history and a running timer all survive a reload.
- *Deep links*: `?a=`, `?t=`, `?lang=`, `?text=`, `?wake=30`, `?wake=off`, `?wake=pomodoro`.
- *Rendering*: print media still forces the 4-column black-on-white chart with the chrome
  hidden; 390 px mobile with the timer panel open and the longest Dutch strings has zero
  horizontal overflow; `file://` runs everything with the service worker correctly skipped.

### 2026-07-30 (3) — Dead-code audit, split and performance pass

Static audit for unused exports, uncalled functions, orphan DOM ids and dead CSS,
then the splits and optimisations it justified. Behaviour is unchanged.

**Removed (dead)**

- `PAS.speech.isSpeaking()`, `PAS.wake.getOptions()`, `PAS.i18n.apply` — zero callers.
- `PAS.off()` and the unsubscribe closure `PAS.on()` returned: nothing ever unsubscribed,
  so both were pure API surface.
- `PAS.ui.applyAlphabet / applyTheme / applyLanguage` and `PAS.uiTranslate.render / output`
  — exported but never used across module boundaries. Each module now exposes only what
  another module actually calls.
- The `id="wakePip"` attribute: the element is styled by `.status-pill .pip`, nothing
  referenced the id.

No unused CSS classes and no uncalled local functions were found.

**Split**

- `js/i18n.js` was **929 lines / 46 KB** with three catalogues inline. It is now a **103-line
  engine**, with one file per language under `js/lang/`. `i18n-data.js` is gone — its French
  and Dutch content moved into `lang/fr.js` and `lang/nl.js`, so **a language is now exactly
  one file** instead of two blocks in two shared files.
- Presentation mode moved out of `ui.js` into **`js/ui-present.js`** (104 lines). `ui.js`
  dropped from 499 to 422 lines and no longer owns an overlay it had nothing else to do with.

**Performance**

- **One 1 Hz heartbeat.** `wake.js` and `ui.js` each ran their own `setInterval`; `app.js` now
  owns a single one that ticks the wake timer, the clock and the quiz.
- **Activity listeners are only attached while the option is on.** `mousemove`, `wheel` and
  `touchstart` handlers were bound at startup for a feature that is off by default.
- **Idle checking no longer scans the DOM every second.** The `audio, video` query now runs
  only once the idle threshold has actually been crossed.
- **Voice lookup is memoised.** `bestVoice()` rescanned the whole voice list for every
  utterance — once per letter during letter-by-letter playback. Cached per language tag and
  invalidated on `voiceschanged`.
- **Tile search text is built once** at render into `data-search`, instead of concatenating
  and upper-casing `textContent` for every tile on every keystroke.
- **The document is translated in one DOM pass** rather than five `querySelectorAll` sweeps.

**Verified**

No unused `PAS.*` members and no uncalled functions remain; script tags, files on disk and
the service-worker shell list are mutually consistent; translation parity holds (250 English
keys, 0 missing in French or Dutch, identical key sets); all six formats still round-trip;
search, presentation mode, drills, the timer and language switching all behave as before;
clean console over http and `file://`.

One incident worth recording: the split briefly produced a broken `lang/fr.js`, the service
worker cached it, and the page kept failing after the fix. Three reloads later it had healed
itself — which is exactly the stale-cache failure mode the new service worker was written to
prevent, confirmed by accident.

### 2026-07-30 (2) — Third-party review pass

A full read-through as if the code were someone else's, then fixes. Eleven defects,
seven data errors and four translation gaps.

**Bugs fixed**

- **The reverse translator could not decode multi-word code words.** NEW YORK (Western
  Union), ENKEL-V / DOBBELT-V (Norwegian), ТВЁРДЫЙ ЗНАК (Russian), DVOJITÉ VÉ (Czech),
  YUMUŞAK G (Turkish) and every two-word punctuation name (QUESTION MARK, OPEN BRACKET)
  came back as bracketed garbage. Replaced the token-at-a-time lookup with a greedy
  longest-match decoder over an index keyed on letters and digits only, so `X-RAY`,
  `X RAY` and `XRAY` all resolve, while `ALFA-BRAVO` still splits into two letters.
- **Only the English "as in" was understood.** The tool's own French and Dutch
  `A comme Alfa` / `A als in Alfa` output could not be pasted back in.
- **"With pronunciation" did not round-trip** — the `(ROW-ME-OH)` hints were parsed as
  code words. Parenthesised groups are now stripped before decoding.
- **"Letters only" lost word breaks**: `R-A-M-I   2-4` decoded to `RAMI24`. All formats
  now separate words with the same ` / ` marker. Every format now round-trips.
- **Switching language during the "spell a word" drill silently skipped a letter** — the
  relabel path called `ask()`, which shifts the queue. Question *selection* and question
  *painting* are now separate functions.
- **Release times were 12-hour in English** ("releases at 03:15 PM") while the footer
  clock was 24-hour. Now 24-hour everywhere, which is also right for a radio tool.
- **The pomodoro phase and block counter were not persisted.** Reloading during a break
  resumed as a work block, and the panel claimed "0 completed" right after a break began.
- **"Chime when the timer ends" did nothing while sound was muted**, with no explanation.
  It now says so when you switch it on.
- **`<output>` is an implicit live region** and was rebuilt on every keystroke, so screen
  readers re-announced the whole translation per character. The chip list is now
  `aria-live="off"` and the short symbol count carries the announcement.
- **The tablist had no arrow-key navigation**, which the ARIA tab pattern requires.
  Left/Right/Home/End now move between tabs.
- **The service worker could pin users to a stale build forever.** It was cache-first with
  `ignoreSearch`, so a deploy only reached a returning visitor if `CACHE` had been bumped
  by hand. Navigations are now network-first with a cache fallback, and static assets are
  stale-while-revalidate — instant offline, and updated by the next load.

**Data corrected**

- **NATO/ICAO**: A and J are now **ALFA** and **JULIETT**, the spellings in ICAO Annex 10
  (PH is not read as F, and a single final T gets dropped, in several languages). ALPHA,
  JULIET and WHISKY are accepted as input via a new optional `altWords` field.
- **Norwegian**: W = DOBBELT-V (was DOBBEL-V), Æ = ÆRLIG, Ø = ØSTEN, Å = ÅGOT — the three
  extra letters were wrong.
- **Danish**: Ø = ØDIS (was ØRESUND).
- **Finnish**: Å = ÅKE (the descriptor "ruotsalainen O" is what the letter is *called*,
  not its code word).
- **Polish**: G = GUSTAW (was Grażyna).
- **Ten-codes**: 10-97 was a duplicate of 10-23 ("Arrived at scene"); it is "Check (test)
  signal". 10-99 said "Officer needs help" — that is 10-33 in APCO; it is "Records
  indicate wanted or stolen".
- **German**: the description now says this is the traditional table and that DIN 5009
  replaced these names with city names in 2022.
- **Greek**: the note no longer claims a specific keyboard layout.
- **The intro no longer overclaims.** "Screen stays awake while this page is open" became
  "Keeps the screen awake while this tab is visible", which is what the API actually does.

**Translation gaps closed**

- Theme names, all **28 alphabet names**, the easter-egg toast and the controls region
  label were still English-only in French and Dutch.
- The intro now points first-time users at the CHART tab, since the default TRANSLATE tab
  shows no tiles and the old wording said "tap a tile".

**Verified**

- 0 hard-coded user-facing prose left in JS (regex sweep over all modules).
- Interface catalogue: **250 keys × 3 languages, identical key sets** — no missing, no extra.
- Content catalogue: 155 keys, symmetric between French and Dutch.
- All six text formats round-trip `Rami 24` in all three languages; legacy spellings,
  punctuation names and every multi-word code word decode correctly.
- Spell drill survives a mid-drill language switch; pomodoro survives a reload mid-break;
  tab arrow keys wrap correctly; print still forces the 4-column chart; mobile at 390 px
  with the longest Dutch strings and the timer panel open has zero horizontal overflow;
  clean console throughout.

### 2026-07-30 — Interface language picker (English · Français · Nederlands)

A **LANGUAGE** selector sits next to ALPHABET and THEME. The whole interface is
translated, not just the labels.

**Added**

- `js/i18n.js` — a ~40-line engine plus the interface catalogue for **en / fr / nl**
  (~180 keys each). `PAS.t(key, vars, fallback)` resolves against the active language,
  falls back to English, then to an explicit fallback, then to the key. `{n}`-style
  placeholders are interpolated, so word order stays translatable.
- Declarative markup translation — `data-i18n`, `data-i18n-html` (for strings with
  markup), `data-i18n-title`, `data-i18n-placeholder`, `data-i18n-aria-label`. Every
  static string in `index.html` is tagged; nothing is hard-coded in the markup any more.
- `js/i18n-data.js` — French and Dutch versions of the **28 alphabet descriptions** and
  of the reference tables: 24 prowords, 20 Q-codes, 21 ten-codes and 34 punctuation
  descriptions. English stays next to the data it describes and acts as the fallback,
  so adding an alphabet never *requires* touching the translation file.
- Everything painted from JS is translated too: both header pills and all six wake lock
  states, the timer status line, the pomodoro phases, ~45 toasts, the notification bodies,
  the drill names, hints and result line, the output formats, the direction toggle,
  history, presentation controls, the shortcuts overlay and the "why did it pause?" text.
- Language resolution order: **`?lang=` → saved choice → `navigator.language` → English**.
  A `fr-BE` or `nl-NL` browser tag matches the base language.
- `<html lang>`, `document.title` and the tab-title countdown all follow the choice, and
  `?lang=` is now part of the generated share links.
- Switching language repaints live state in place: a running countdown, an in-progress
  drill, a finished drill's summary and the selected preset all survive the switch.
- Localised formatting: durations (`2 heures`, `1 u 30 min`), release times via
  `toLocaleTimeString` in the interface language, and the `"A as in Alpha"` joiner
  (`A comme Alpha`, `A als in Alpha`).

**Scope decisions**

- **Alphabet names stay untranslated** (“NATO / ICAO (Military)”, “West-Vlaams”) — they
  are proper names of the tables. Their *descriptions* and their *group headings* are
  translated.
- **Code words and punctuation prowords stay in their own language.** `.` reads STOP and
  `@` reads AT whatever the interface language is, because those are the spoken forms on
  the air. Only their explanations in the CODES tab are translated. Per-alphabet spoken
  punctuation is on the backlog.
- Theme names stay untranslated — they are one-word brand-ish labels (Slate, Amber CRT).
- The `<meta name="description">` stays English: it is what search engines index for this
  URL, and there is no per-language URL to point them at.

**Testing note (not a code bug, but it cost time)**

The service worker is cache-first, and `Network.setCacheDisabled` does **not** bypass it.
Edits appeared not to apply — a newly added attribute read back as `null` and a new key
returned itself. Unregister the worker and clear `caches` before re-testing:

```js
navigator.serviceWorker.getRegistrations().then(r => r.forEach(x => x.unregister()));
caches.keys().then(k => k.forEach(n => caches.delete(n)));
```

**Verified in-browser**

All three languages across every tab and overlay; `?lang=fr` deep links; persistence
across reload; switching language mid-timer and mid-drill; no untranslated keys leaking
to the DOM; mobile at 390 px with the longer French and Dutch strings — no horizontal
overflow; clean console throughout.

### 2026-07-29 (2) — Full feature build &amp; module split

Everything on the previous backlog is now implemented. `script.js` (one 700-line IIFE)
was split into the 14 modules above; `index.html` gained a tabbed shell.

**Wake lock**

- **Extend while running** — `+15m` and `+1h` buttons add to the live countdown, capped at 24 h.
- **Keep awake until a wall-clock time** — `UNTIL 17:30`; a time already past rolls to tomorrow.
- **Progress ring** — SVG arc around the remaining time, updated once per second.
- **Pomodoro chaining** — 25 min awake / 5 min asleep, looping, with a completed-block counter.
  The lock is genuinely released during the break so the screen can actually dim.
- **Expiry chime** — three-tone WebAudio blip, no audio asset needed. Respects the mute switch.
- **System notification** on expiry (and on battery release), permission requested on opt-in only.
- **Countdown in the tab title** — `⏱ 1:29:59 · Phonetic…`, so a background tab still shows it.
- **Battery-aware release** — drops the lock below 20 % when discharging (Battery Status API).
- **Activity mode** — parks the lock after 5 minutes of no input and re-acquires on the next
  move/keypress. Playing audio or video counts as activity.
- **Video fallback** — an opt-in 2×2 `canvas.captureStream()` fed into a muted, `playsinline`,
  looping `<video>` for browsers with no Wake Lock API. The pill reads `WAKE LOCK: VIDEO`.
- **"Why did the wake lock pause?"** explainer in the panel covering hidden tabs, display-only
  scope and the secure-context requirement.
- **`?wake=` URL parameter** — `?wake=480` for an 8-hour shift display, `?wake=pomodoro`,
  `?wake=off`. Handy for kiosks and dashboards.
- Six behaviour switches persist independently in `localStorage`.

**Alphabets — 11 → 28**

- Historical &amp; services: **LAPD/APCO**, **Western Union**, **Able Baker (1941–56)**,
  **ICAO 1947**, **RAF 1924–42**, **Royal Navy 1917**.
- World languages: **Portuguese, Swedish, Danish, Norwegian, Finnish, Polish, Czech, Turkish,
  Greek, Russian, Japanese Wabun (和文通話表)**.
- Non-Latin alphabets carry optional **Latin keys** as a fourth field, so a QWERTY keyboard
  drives them: Greek uses Beta Code (`q`=Θ, `c`=Χ, `y`=Ψ, `w`=Ω), Russian a single-character
  transliteration (`x`=Ж, `c`=Ц, `q`=Ч, `w`=Ш), Japanese maps the gojūon rows.
- Alphabets are no longer 26+10: German has Ä/Ö/Ü/ß, the Nordics Å/Æ/Ø, Spanish Ñ, Turkish
  Ç/Ğ/İ/Ö/Ş/Ü (and no Q/W/X), Russian 33 letters, Wabun 46 kana. The renderer is data-driven,
  so the tile count follows the data.

**Translator**

- **Reverse direction** — `ALPHA BRAVO / ONE` → `AB 1`, one click on the direction pill. It also
  accepts `A as in Alpha` phrasing, commas and hyphens, and swapping carries the output across.
- **Seven output formats** — code words, hyphenated, comma separated, "A as in Alpha",
  with pronunciation, letters only, and **Morse**.
- **Punctuation &amp; symbols** — 34 entries (`@` = AT, `.` = STOP, `/` = SLANT …) rendered as
  dashed chips instead of being passed through as literals.
- **Accent folding** — `é` → ECHO, `ß` → SIERRA SIERRA, `ø` → OSCAR, via NFD plus a small table
  for characters NFD cannot split. A native tile always wins over folding, so Turkish `Ç`
  still resolves to ÇANAKKALE.
- **Callsign mode** — strips everything that is not a letter or digit so `PH-BFA / 24` reads as
  one unbroken group.
- **Speak-along** — letter-by-letter playback with an adjustable inter-letter pause; the chip
  and the matching chart tile light up as each word is read.
- **Voice, rate and pitch** pickers; the voice defaults to one matching the alphabet's language.
- **Recent history** — last 20 translations, click to reload, per-row copy, clearable.
- **Dictation** — SpeechRecognition drops what you say into the reverse translator.
- **Copy as image** — renders the translation onto a themed canvas and writes a PNG to the
  clipboard, falling back to a download when the clipboard is blocked.
- **Share links** — `?a=…&t=…&text=…&wake=…`, via the Web Share sheet when available.

**Chart**

- **Morse row** on every tile (toggleable), derived from the character or its Latin key.
- **Search** across characters, words, pronunciations and Morse; typing a single character
  jumps to and flashes that tile.
- **Printable cheat sheet** — a real `@media print` stylesheet: chrome removed, the chart forced
  visible even from another tab, 4 columns, black on white. Print to PDF for the PDF export.
- **CSV / JSON download** of the active alphabet.
- **Presentation mode** — full-screen single card, arrow keys or auto-advance, speaks each word,
  and forces the wake lock on for the duration (restoring the previous state on exit).

**Practice**

- Four drills: letter → code word, code word → letter, **listen** → letter, and
  **spell a word** (type your name and step through it).
- Score, current streak and a per-drill best streak, plus an optional 60-second run.

**Codes tab**

- 24 prowords with the traps spelled out (never "Roger Wilco", never "repeat"), 20 Q-codes,
  21 ten-codes and the punctuation table.

**Shell**

- Four tabs with real `role="tab"` / `aria-controls` wiring, restored from `localStorage`.
- **Keyboard shortcuts**: `S` speak, `C` copy, `X` swap direction, `M` mute, `W` wake lock,
  `T` timer, `P` present, `/` search, `1`–`4` tabs, `?` help, `Esc` close, `←`/`→` in presentation.
  All suppressed while the caret is in a field.
- **Auto-selects the alphabet from `navigator.language`** on the very first visit only.
- **PWA** — manifest, icons and a cache-first service worker, so the whole tool works offline.
  Registration is skipped over `file://`.

**Fixed**

- `showTab("chart")` focused the search box on every switch, so after pressing `2` every later
  keystroke landed in the field and all shortcuts silently stopped working. Focus is now only
  stolen by the dedicated `/` shortcut.
- The mute preference was being written with inverted meaning against the old `ma.muted` key
  (`"1"` had meant *muted*), which would have turned sound on for returning users. Restored.
- `[hidden]` lost to components that set an explicit `display` (`.tile`, `.quiz-stage`,
  `.control`, `.switch`), so "hidden" tiles and fields stayed on screen. One global
  `[hidden] { display: none !important }` replaces the four ad-hoc rules.
- The pomodoro button sits inside the preset row, so the delegated preset handler also fired for
  it — `parseInt(undefined) || 0` started an unlimited timer at the same moment pomodoro started.
  The delegate now only matches `.timer-preset[data-minutes]`.
- The title-bar countdown froze at `00:00` for up to a second after expiry because `tick()`
  painted the title before evaluating the deadline. `expire()` repaints it.
- Callsign mode only stripped whitespace and a handful of separators, so commas and exclamation
  marks still produced COMMA/EXCLAMATION chips inside a callsign.
- `.countdown` (tabular numerals) was scoped to `.status-pill`, so the ring label, quiz clock
  and presentation counter still jittered as digits changed.

**Housekeeping (all three items closed)**

- Alphabet data lives in its own file, deliberately as a script rather than JSON so `file://`
  keeps working — the constraint the previous note flagged.
- `PAS.wake.debug` (`setRemaining`, `expireNow`, `snapshot`) drives the countdown in tests
  without stubbing `Date` or the Wake Lock API.
- Contrast audited for `.timer-preset.is-active` in **all six** themes (measured WCAG ratios of
  bg-on-accent): pro 5.91, slate 8.47, paper 4.56, amber 10.53, terminal 14.76, arcane 7.79 —
  all above the 4.5 AA threshold.

**Verified in-browser**

Two-way translation, all seven formats, punctuation/accents, callsign mode, Greek/Russian/
Japanese via Latin keys, chart search and jump, Morse toggle, all four drills, every timer
control (presets, custom, +15m/+1h, until-time, pomodoro roll-over, expiry, cancel), video
fallback, title countdown, deep links, presentation mode, shortcuts overlay, print media,
service worker registration, mobile at 390 px with zero horizontal overflow, and a clean
console on load.

**Known limitations**

- The Screen Wake Lock API needs a secure context (HTTPS or `localhost`) and a visible tab.
  Automated browsers deny the permission outright, which is why the debug hook exists.
- The video fallback relies on `canvas.captureStream()`. It is not the classic base64-MP4 trick
  and will not help on very old iOS; iOS 16.4+ has the real API anyway.
- Ten-code meanings vary by agency — the tab says so.
- Dictation (SpeechRecognition) is Chromium-only; the button hides itself elsewhere.
- `Notification` on iOS Safari only fires for installed PWAs.

### 2026-07-29 (1) — Wake Lock timer

**Added** — the timer itself: presets (15 min, 30 min, 1 h, 2 h, 4 h, 8 h, 12 h, ∞), a custom
1–1440 minute field, a `TIMER:` pill with a live countdown that turns red in the final minute,
a status line, and persistence of the intent, the last duration and the running deadline so a
reload resumes the countdown and an expired timer comes back as OFF.

**Fixed** — stacked wake lock sentinels on every `visibilitychange`; a stale sentinel reference
after the browser released the lock; wake intent never persisted; `OFF` shown when the lock was
merely paused; UI state written from four places (collapsed into one render function);
countdown drifting in throttled background tabs (now wall-clock based).

---

## Backlog

The previous backlog is complete. What is left is genuinely new ground.

### Deliberately deferred

- [ ] **Hebrew and Arabic spelling alphabets.** Listed in an earlier backlog and skipped on
      purpose: unlike the tables above there is no single widely published civil standard, and
      inventing one would be worse than omitting it. Needs a citable source (an IDF signal
      manual / an ITU member-state table) before it goes in.
- [ ] **PNG export of the whole chart.** Print-to-PDF covers the paper use case; a chart-sized
      canvas render is a lot of layout code for a narrow win.
- [ ] **DIN 5009:2022 German city table** as a separate alphabet. The current German entry is
      the traditional one and now says so, but the 2022 standard is what German officialdom
      uses today.

### Interface languages

- [ ] **German and Spanish** next — the alphabets are already there, only the ~250 interface
      keys and the content strings are missing. Copy `js/lang/nl.js` to `js/lang/de.js`,
      translate it, and add one entry to `PAS.LANGUAGES` plus one script tag. Nothing else
      needs to change.
- [ ] **Load only the active language.** All three catalogues (59 KB) are parsed on every
      visit though only one plus the English fallback is ever read. Now that each language is
      its own file this is a small change — inject the active `lang/<code>.js` before
      bootstrap — but it adds an async step to startup, so it is worth doing at four or five
      languages, not three.
- [ ] **Per-alphabet spoken punctuation.** Today `.` always reads STOP. With the French
      alphabet selected it arguably should read POINT, and with the German one PUNKT — that is
      a property of the alphabet, not of the interface language, so it belongs in
      `data-alphabets.js` as an optional `punctuation` override.
- [ ] A tiny lint that diffs the key sets of `en` / `fr` / `nl` and fails on a missing key.
      A missing key falls back to English, which is safe but invisible. Checked by hand with
      a throwaway script during the 2026-07-30 review (250/250/250, symmetric) — worth making
      repeatable before a fourth language lands.
- [ ] Translate the pronunciation column. It is written for an English speaker (`AL-FAH`),
      which is the wrong hint for a French or Dutch reader.

### Wake lock

- [ ] Configurable pomodoro lengths (25/5 is hard-coded) and a long break every fourth block.
- [ ] Configurable idle timeout and battery threshold — both are constants today.
- [ ] Remember several named timers ("shift", "render", "download") for one-click re-arming.
- [ ] Warn before the countdown ends (e.g. a toast at T-60s offering `+15m`).
- [ ] Wake lock combined with fullscreen + screen orientation lock for a true kiosk mode.

### Alphabet

- [ ] Morse **playback** — key the tones out at a selectable WPM, plus a Koch-method trainer.
- [ ] Spaced repetition in practice mode: weight questions towards the letters you miss.
- [ ] Per-alphabet history graph of best streaks over time.
- [ ] Diff view comparing two alphabets side by side (NATO vs. Able Baker is a common request).
- [ ] Aviation extras: callsign prefixes by country, runway/heading readback drills.
- [ ] Cache a recorded audio set for the NATO alphabet so pronunciation still works on devices
      with no TTS engine installed.
- [ ] `prefers-contrast: more` theme and a dyslexia-friendly font toggle.

### Engineering

- [ ] There is no automated test suite — everything is verified by driving a real browser. A
      handful of headless assertions around `translator.js` (pure functions, no DOM) would be
      cheap insurance; the 2026-07-30 reviews found six decoder and folding bugs that a
      modest set of round-trip assertions would have caught immediately. The checks written
      during the verification round are a good starting point — in particular "every alphabet
      round-trips its own complete table", which is one loop and caught two separate faults.
- [ ] `sw.js` lists the shell files by hand; a missing entry means a file is never cached.
      Bump `CACHE` when a shell file is added or renamed. Serving a stale build is no longer
      possible (navigations are network-first, assets stale-while-revalidate), but a file
      missing from `SHELL` still will not be available offline on the first visit.
- [ ] `data-alphabets.js` is ~665 lines and growing. Past ~40 alphabets, split it by group
      (`data-alphabets-world.js` etc.) rather than moving to JSON.
