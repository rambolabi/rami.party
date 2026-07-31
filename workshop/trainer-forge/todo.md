# 💪 Personal Trainer Forge — build log, backlog & sources

> `workshop/trainer-forge/` · static HTML + CSS + vanilla JS, no build step, no dependencies,
> no backend. Everything a user creates lives in their own `localStorage`.
>
> Legend: `[x]` done · `[ ]` open · `[~]` partial · **🐞** = defect found and fixed during the build

---

## 0 · What this project is

A workout-plan generator that behaves like a coach rather than a PDF. The user answers six
questions, and the forge produces a dated, day-by-day training block with warm-ups, working
sets, rest prescriptions, rest days, weekly progression and deload weeks. Opening the page on
any later date shows *that day's* session and how many days of the block remain.

**Files**

| File | Role |
|---|---|
| `index.html` | Page shell, all static SEO copy, structured data, dialogs |
| `style.css` | Complete stylesheet, mobile-first, includes a print sheet |
| `data.js` | Exercise library (140 movements), goal definitions, session templates |
| `engine.js` | Pure deterministic plan generation, analysis and export. No DOM |
| `app.js` | UI layer: builder, Today view, schedule, library, share/import |
| `todo.md` | This file |

---

## 1 · Functionality — implemented

### 1.1 The builder ("Forge")
- [x] **Seven goals**, each with its own set/rep schemes and weekly splits:
  - `lean-strength` — *Strong, not bulky*: 3–6 reps, 2–3 min rest, skill work.
  - `build-muscle` — *Bigger arms & back*: 6–15 reps, 10–20 weekly sets per muscle.
  - `run-far` — *Run further*: polarised 80/20, +10% weekly volume, long run anchored.
  - `lean-down` — *Lean down*: full-body lifting + circuits + daily walking.
  - `move-well` — *Move well*: hip/shoulder/spine flows plus loaded end-range strength.
  - `daily-move` — *Move every day*: 5/10/15 min movement snacks, up to 7 days a week.
  - `all-round` — *All-round health*: the WHO guideline expressed as a calendar.
- [x] **Experience level** (beginner / intermediate / advanced) gates the exercise pool by `level`.
- [x] **Days per week** — offered per goal (`Object.keys(goal.splits)`); most goals allow 2–6,
      `daily-move` allows 3–7 because its doses are small enough to stack daily.
- [x] **Session length** — also per goal. Default 15/30/45/60/75 min; `daily-move` offers 5/10/15.
- [x] **Equipment**: bodyweight (always on), pull-up bar, bands, dumbbells, full gym.
      "Full gym" implicitly unlocks dumbbell and bar movements.
- [x] **Focus areas** (max 3) — boost matching exercises in selection, survive budget trimming
      first, and buy a bonus set when time allows.
- [x] **Block length** 14/28/42/56/84 days, **start date**, **plan name**.
- [x] Live "plan at a glance" summary: session count, weekly minutes, number of deloads.
- [x] Changing the goal clamps frequency and session length to what that goal supports.

### 1.2 The generator (`engine.js`)
- [x] **Deterministic**: a config always regenerates a byte-identical plan. This is why a share
      link only needs to carry the config, not the schedule.
- [x] **Seeded PRNG** (mulberry32 over an FNV-1a hash) — no `Math.random` in generation.
- [x] **Four-week progression cycle**: Base → Build → Peak → Deload (volume ×0.6, RPE −2).
- [x] **Block-stable main lifts**: compound and skill slots are seeded per 4-week block so you
      can actually add weight to them; accessories re-seed weekly for variety.
- [x] **Warm-up** is generated from the muscles the session will use (4–5 moves, 3–8 min).
- [x] **Cool-down** picks stretches matching the muscles that were trained.
- [x] **Cardio prescriptions** are structured sessions (e.g. "6 × 2 min hard, 2 min easy jog"),
      scaled by session length and the weekly phase multiplier.
- [x] **Time budgeting**: every item is costed in seconds (sets × work + rests) and the session
      is trimmed to fit the user's stated minutes.
- [x] **Express mode** (≤15 min): sets capped at 3 and rests at 75 s, with an on-card note
      explaining the trade-off. At ≤10 min the micro templates also tighten rests to 20–30 s.
- [x] **No periodisation for habit goals** (`goal.steady`): `daily-move` runs a flat "Steady"
      phase, because deloading a five-minute habit only breaks the streak.
- [x] **Weekly volume analysis**: hard sets per muscle group, cardio minutes, total hours.
- [x] Config **whitelist validation** on every import — see §4.

### 1.2b Movement snacks (5–15 minutes)
- [x] Seven short templates, all flagged `micro: true` with `cap: 15`:
      *Morning wake-up*, *Core snack*, *Legs & glutes snack*, *Push & pull snack*,
      *Desk reset*, *Heart-rate spark* (a burst circuit) and *Easy flow*.
- [x] `cap` keeps them short even inside a plan whose normal session is an hour, so a snack
      dropped onto a rest day stays a snack.
- [x] Available two ways: as the whole `daily-move` goal, or as a one-day substitution on
      **any** plan (see §1.3b).
- [x] Budgets for 5 and 10 minute sessions, with a two-move warm-up and a one-move cool-down
      (or none at all at 5 minutes) rather than the standard five and three.

### 1.3b Changing a day
- [x] **Change this session / Train today instead** on the Today card and on any row in the
      schedule — opens a picker listing every session in the plan, every movement snack, and
      "make it a rest day".
- [x] **Rest instead** turns a training day off in one tap.
- [x] **Swap this exercise** (⇄) on every exercise in today's main block: re-rolls that one
      slot from the same filter.
- [x] **Undo changes** restores a single day to the original plan.
- [x] Changes are stored as `config.overrides[date]`, so they survive a reload, travel with a
      share link, and are re-applied deterministically on the receiving device.
- [x] Overrides are re-keyed when the plan is shifted to today, and swaps are cleared whenever
      the day's template changes (slot indices belong to a template).
- [x] Edited days are badged ✎ in both the Today view and the schedule.

### 1.3 The Today view
- [x] Anchored to real dates: `dayIndex = today − startDate`.
- [x] Shows day *n* of *N*, days remaining, current week + phase, sessions logged, progress bar.
- [x] Per-exercise tick boxes and a "mark session complete" button, both persisted.
- [x] "Plan starts in *n* days" and "block complete" states.
- [x] **Missed-session detection** with a one-tap *Shift plan to today* that re-anchors the
      start date to the first unfinished session.
- [x] "Coming up" preview of the next four days.
- [x] Re-renders on `visibilitychange` so a tab left open overnight rolls to the new day.

### 1.4 The schedule view
- [x] Collapsible weeks, current week auto-opened, phase badge per week.
- [x] Weekly hard-set count per muscle group and weekly cardio minutes.
- [x] Per-day rows expand lazily into the full session (kept fast on 84-day plans).
- [x] Actions: share/export, shift to today, rebuild, delete (with confirmation).

### 1.5 Exercise library
- [x] 140 movements with category, equipment, level, target muscles, a coaching cue and an
      easier/harder variation.
- [x] Search across name, muscles, category and cue; filter by movement pattern.

### 1.6 Export, share and import
- [x] **Share link** — `#p=<base64url(config)>`; short, because the plan is regenerated.
- [x] **Copy as text** — full markdown-ish schedule, every day, every set.
- [x] **Download `.json`** — the config, re-importable.
- [x] **Print / save as PDF** — expands every week, then a dedicated print stylesheet strips
      the chrome and renders the whole block in black on white.
- [x] **Import** accepts a share link, a raw JSON file or a bare base64 payload.

### 1.7 SEO & accessibility
- [x] Unique title, meta description, keywords, canonical, Open Graph and Twitter cards.
- [x] JSON-LD `@graph`: `WebApplication`, `BreadcrumbList`, `HowTo`, `FAQPage` — the FAQ
      entries mirror the visible FAQ text exactly (no cloaking).
- [x] ~1,900 words of genuinely useful static copy: six programming principles, six goal
      explainers, nine FAQs and a sourced reading list. All server-rendered HTML.
- [x] Semantic landmarks, one `h1`, ordered heading levels, skip link, `aria-selected` tabs,
      `role="radiogroup"`, live regions for the toast and the plan summary.
- [x] `prefers-reduced-motion` honoured. Focus-visible rings everywhere.
- [x] Mobile-first: verified with zero horizontal overflow at 320, 360, 390, 414, 768, 1024
      and 1440 px. Touch targets ≥ 36 px (ticks get an invisible 48 px hit area).
- [x] `viewport-fit=cover` plus `env(safe-area-inset-*)` for notched phones.

---

## 2 · Defects found and fixed during the build

| 🐞 | Symptom | Cause | Fix |
|---|---|---|---|
| 1 | Radio chips unclickable in the builder | `legend { float: left; width: 100% }` overlapped the grid below it — grids form a new formatting context and do not flow around floats | Visually hidden `<legend>` for semantics + a normal-flow `<h3 class="step-title">` |
| 2 | Horizontal scrollbar below ~380 px | `<fieldset>` defaults to `min-inline-size: min-content` and refuses to shrink | `fieldset { min-inline-size: 0 }` |
| 3 | Same, on card grids | `minmax(270px, 1fr)` tracks cannot shrink below 270 px | `minmax(min(270px, 100%), 1fr)` everywhere |
| 4 | "Hill repeats" prescribed as calf work inside a strength session | Cardio exercises matched muscle-only filters | `allowedInSlot()` — cardio can only fill a slot that asked for cardio |
| 5 | Jumping jacks appearing in a shoulder mobility flow | Warm-up drills are typed `mobility` | `prep: true` flag, excluded from mobility slots |
| 6 | Mobility and core sessions half-empty; wild time estimates | A timed scheme (`"45–60 s"`) applied to a rep-based exercise was costed as 52 *reps* | `timedScheme` detection in `makeItem()` converts the item to a hold |
| 7 | A "bigger arms" plan lost its arm work at 45 min | Budget overflow dropped the *tail* slots, which are the isolation slots | `trimToBudget()` drops by role priority and protects focus-matching work |
| 8 | 15-minute sessions contained only two exercises | Strength rests of 150 s consumed the entire budget | Express mode caps sets/rests and says so on the card |
| 9 | Duplicate exercise in one session | The last-resort selection fallback ignored the `used` list | Fallback now respects `used` and may return `null` |
| 10 | Fartlek prescribed as a 40-second circuit station | Circuit asked for `zone: 'hard'` cardio | `burst: true` flag; circuits only use burst-friendly conditioning |
| 11 | Long runs silently overshot the stated session length | 1.45× multiplier, unexplained | Reduced to 1.35× **and** an explicit note on the card |
| 12 | Sticky header covered anchored content | `scroll-padding-top` smaller than header + tab bar | Raised to `7.5rem` |
| 13 | An ankle rock was prescribed as calf *training* | Mobility drills matched muscle-only filters | `allowedInSlot()` now also refuses mobility exercises in non-mobility slots |
| 14 | Deload weeks *increased* the sets on one-set mobility schemes | `Math.max(2, floor(sets * 0.6))` has a floor of 2 | Clamped to `min(base, round(base * 0.6))`, never above the base week |
| 15 | A 5-minute session contained a single exercise | A flat 30 s setup allowance per exercise ate most of a 4-minute budget | `SETUP_SECONDS` reduced to a realistic 20 s |
| 16 | Swapping an exercise, then changing the session, silently altered the new one | Slot salts are per index and were carried across templates | Swaps are cleared whenever `mode`/`tpl` changes |

**Automated sweep run after every fix:** 7,800 generated sessions (every goal × every weekly
frequency it offers × every session length it offers × 3 levels × 28 days) checked for empty
sessions, duplicate exercises, cardio or mobility leaking into strength slots, missing
warm-up/cool-down and time overruns.
Current result: **0 problems, 0 console errors, generation confirmed deterministic.**
Layout re-verified at 320 / 360 / 390 / 414 / 768 / 1024 / 1440 px: **no horizontal overflow,
no touch target under 32 px.**

---

## 3 · Open / next

- [ ] **Rest timer** — tap a set to start a countdown for that exercise's prescribed rest,
      with a vibration on finish (`navigator.vibrate`, progressively enhanced).
- [ ] **Log the load** — an optional weight field per set, stored per date, so "last time you
      did 3 × 8 at 22.5 kg" can be shown next to the prescription.
- [ ] **Auto-regulation** — if three sessions in a row are logged complete, offer a small
      volume bump; if two are missed, offer to repeat the week instead of shifting.
- [ ] **Undo all edits** — a single "restore the original plan" action alongside the per-day undo.
- [ ] **Swap from the schedule view too** — exercise-level swaps are currently Today-only.
- [ ] **Service worker** for true offline use and an installable PWA manifest.
- [ ] **Calendar export** (`.ics`) so sessions land in the user's own calendar app.
- [ ] **Exercise illustrations** — inline SVG line art; must stay under a sensible page weight.
- [ ] **A second block suggestion** on completion: same goal, level bumped, new seed.
- [ ] **Dutch and French copy** — reuse the pattern from the `library.labidi.eu` repo
      (`_shared/i18n.js` + per-language `data.<lang>.js` packs).
- [ ] `og-image` for the social cards (the rest of rami.party has none either).

---

## 4 · Security & privacy notes

- No network calls, no analytics, no cookies, no accounts. The only third-party request is the
  Google Fonts stylesheet.
- **Every** value that can arrive from a URL hash or a pasted file passes through
  `TF_ENGINE.validateConfig()`, which whitelists goal ids, level, days per week, minutes, block
  length, equipment ids and focus ids against the data tables, strips control characters from
  the plan name and caps it at 60 characters, and regex-checks the start date.
- The DOM is built exclusively with `createElement` + `textContent`. There is no `innerHTML`
  anywhere in `app.js`, so an imported plan name of `<script>…</script>` renders as literal
  text — verified in the browser.
- A share link never overwrites an existing local plan without an explicit confirmation.

---

## 5 · Where the programming rules come from

These are the sources behind the set/rep schemes, the rest prescriptions, the frequency
choices, the deload cadence and the endurance intensity split. They are public guidelines and
peer-reviewed reviews, not personal opinion.

### Guidelines
1. **World Health Organization (2020).** *Guidelines on physical activity and sedentary
   behaviour.* 150–300 min moderate or 75–150 min vigorous aerobic activity per week, plus
   muscle-strengthening on ≥2 days. → the `all-round` goal.
   <https://www.who.int/news-room/fact-sheets/detail/physical-activity>
2. **US Department of Health & Human Services (2018).** *Physical Activity Guidelines for
   Americans, 2nd edition.* Same baseline with dose–response detail.
   <https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines>
3. **Ratamess, N. A. et al. (2009).** ACSM Position Stand: *Progression Models in Resistance
   Training for Healthy Adults.* Medicine & Science in Sports & Exercise, 41(3), 687–708.
   → rep ranges and rest intervals by training outcome (strength vs hypertrophy vs endurance).
4. **NSCA.** *Essentials of Strength Training and Conditioning*, 4th ed. → movement-pattern
   based session structure (push / pull / squat / hinge / lunge / carry / core).
5. **NHS.** *Couch to 5K.* → the beginner run/walk progression used by `run-far` at level 1.
   <https://www.nhs.uk/live-well/exercise/get-running-with-couch-to-5k/>

### Short bouts and daily movement
6. **WHO (2020) and the US Physical Activity Guidelines (2018)** both removed the old rule that
   activity had to come in bouts of at least ten minutes to count. Any bout counts towards the
   weekly total. → the entire premise of the `daily-move` goal.
7. **Stamatakis, E. et al. (2022).** *Vigorous intermittent lifestyle physical activity and
   mortality.* Nature Medicine, 28. → brief, repeated bursts of everyday vigorous movement are
   associated with meaningful health benefit, without any structured session at all.
8. **Islam, H. et al. (2022) and Jenkins, E. M. et al. (2019).** "Exercise snacks" — very short,
   repeated efforts — improve cardiorespiratory fitness in previously inactive people.
   → the *Heart-rate spark* template.
9. **Perkin, O. J. et al. (2019).** Short bouts of resistance exercise ("resistance exercise
   snacking") are feasible and improve function in inactive adults. → the strength snacks.

### Hypertrophy and strength
10. **Schoenfeld, B. J., Ogborn, D. & Krieger, J. W. (2017).** *Dose-response relationship
    between weekly resistance training volume and increases in muscle mass.* Journal of Sports
    Sciences, 35(11), 1073–1082. → 10–20 hard sets per muscle per week.
11. **Schoenfeld, B. J., Grgic, J. & Krieger, J. (2019).** *How many times per week should a
    muscle be trained to maximize muscle hypertrophy?* Journal of Sports Sciences, 37(11).
    → each muscle group at least twice a week; drives the full-body 2–3 day splits.
12. **Grgic, J. et al. (2018).** *Effects of rest interval duration in resistance training on
    measures of muscular strength: a systematic review.* Sports Medicine, 48(1).
    → 2–3 min rest on compound lifts; shorter is acceptable on isolation work.
13. **Schoenfeld, B. J. et al. (2021).** *Loading recommendations for muscle strength,
    hypertrophy and local endurance.* Frontiers in Physiology. → why "3–6 reps heavy" builds
    strength with less growth than "6–20 reps to near failure".
14. **Helms, E. R., Aragon, A. A. & Fitschen, P. J. (2014).** *Evidence-based recommendations
    for natural bodybuilding contest preparation.* JISSN, 11:20. → reps-in-reserve
    autoregulation, which is where the RPE targets come from.
15. **Morton, R. W. et al. (2018).** *A systematic review, meta-analysis and meta-regression of
    the effect of protein supplementation on resistance training-induced gains.* BJSM, 52(6).
    → the ~1.6 g protein per kg bodyweight figure in the recovery tips.

### Recovery, deloads and soreness
16. **Bell, L. et al. (2022) and Kraemer, W. J. et al. (2002).** Periodisation and planned
    volume reduction: fatigue accumulates faster than fitness, so a lower-volume week every
    third or fourth week preserves progress. → the four-week Base/Build/Peak/Deload cycle.
17. **Damas, F. et al. (2016).** *A review of resistance training-induced changes in skeletal
    muscle protein synthesis.* Sports Medicine, 45(6). → MPS elevated ~24–48 h post-session,
    which is why splits never train the same muscle group hard on consecutive days.
18. **Hyldahl, R. D. & Hubal, M. J. (2014).** *Lengthening our perspective: eccentric exercise,
    muscle damage and the repeated bout effect.* Muscle & Nerve, 49(2). → soreness peaks at
    24–72 h and fades with repetition; soreness is not a quality marker.
19. **Fullagar, H. H. K. et al. (2015).** *Sleep and athletic performance.* Sports Medicine,
    45(2). → sleep as the highest-leverage recovery variable.

### Endurance
20. **Seiler, S. (2010).** *What is best practice for training intensity and duration
    distribution in endurance athletes?* IJSPP, 5(3), 276–291. → the ~80/20 polarised split.
21. **Daniels, J.** *Daniels' Running Formula*, 3rd ed. → easy / threshold / interval session
    definitions and the structure of the tempo and interval prescriptions.
22. **Nielsen, R. O. et al. (2012).** Training-load progression and running injury risk.
    → the "no more than about 10% more per week" volume rule.
23. **Lauersen, J. B. et al. (2014).** *The effectiveness of exercise interventions to prevent
    sports injuries.* BJSM, 48(11). → strength training roughly halves overuse injury risk;
    justifies the mandatory strength days inside the running plan.

### Mobility
24. **Afonso, J. et al. (2021).** Stretching versus strength training for range of motion.
    → loaded end-range strength work retains mobility better than passive stretching alone,
    which is why `move-well` pairs every flow with a strength block.

> **Disclaimer shipped on the page:** this is a general fitness planner, not medical advice.
> Anyone pregnant, injured, over 65 and new to exercise, or managing a cardiac, joint or
> metabolic condition is told to speak to a professional first.

---

## 6 · Testing checklist (repeat after any change to `data.js` or `engine.js`)

1. Serve the repo: `python -m http.server 8777 --bind 127.0.0.1` from `c:\Temp\Git\rami.party`.
2. Open `/workshop/trainer-forge/` with the HTTP cache disabled (otherwise you test stale JS).
3. In the console, run the sweep: build a plan for every goal × {2,3,4,5,6} days ×
   {15,30,45,60,75} min × {1,2,3} level and assert — no empty sessions, no duplicate exercise
   within a session, no cardio in a non-cardio slot, warm-up and cool-down present, and
   `estimate ≤ mins × 1.35 + 6` for everything except the deliberately longer long run.
4. Confirm two identical configs produce identical plans (determinism).
5. Round-trip a share link containing `<script>` in the plan name and confirm it renders as text.
6. Re-check for horizontal overflow at 320 / 360 / 390 / 414 / 768 / 1024 / 1440 px.
