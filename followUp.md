# ✨ rami.party — Follow-ups & Decisions

Living notes for the enchanted-playground revamp. Tick things off or hand them back to a human
when a decision is needed.

---

## ✅ Done in this pass
- **New enchanted hub**: rebuilt `index.html`, `style.css`, `script.js` into a midnight-arcane theme
  (starfield canvas, aurora blobs, glowing gradient wordmark, glassmorphism portal cards).
- **Data-driven realms**: `projects.js` (`window.RAMI_REALMS`) is the single source of truth. Add a
  project by appending one object — the grid renders itself. Use `status:'soon'` for locked teasers.
- **Reorganised structure**: `Archive/` → lowercase **`archive/`**; empty/broken `projects/adhd`
  moved to `archive/adhd`; empty `projects/` folder removed.
- **The Vault**: new `archive/index.html` lists archived relics (old rami.party, the empty ADHD husk).
- **404** restyled to match the theme.
- **Consistent meta**: Open Graph/Twitter tags, `theme-color`, SVG favicon (`favicon.svg`), refreshed
  `site.webmanifest` (was pointing at non-existent PNG icons).
- **A11y/perf**: semantic landmarks, skip links, focus states, `prefers-reduced-motion` support,
  keyboard-friendly mobile nav, no heavy libraries.

## 🔮 Recommended next (nice-to-have)
- [ ] **Re-skin the sub-projects to match the hub.** `fun/lore/`, `fun/prankscreens/` (hub page) and
      `neko/` still use their own older styling. A shared `theme.css` (extracted from `style.css`)
      could give them the same enchanted chrome + a "← back to rami.party" link. *Decision: how far
      to restyle prank screens — they intentionally imitate real OSes, so probably leave the
      individual screens alone and only re-skin the hub/landing page.*
Yes, re-skin all of them, move the neko to the archive.
Make sure the prankscreens, the BBQ and the lore still work fine.

- [ ] **Extract a shared `theme.css`** with the palette/tokens so every page imports one file.
Yes, do this.

- [ ] **Consistent project home.** Active projects live under `fun/` and `neko/`. Consider migrating
      future projects under a single `realms/` (or `projects/`) folder for tidiness. Kept current URLs
      as-is this pass to avoid breaking existing links/bookmarks.
yes, create realms.
Create three different realms. The old failed realms, give it a matching name. Perhaps apocalypse related. That's the archive.
One for projects we are still working on or playing with.
And one for finished projects.

- [ ] **Add a real social share image** (`og-image.png`, 1200×630) and wire `og:image`/`twitter:image`.
      Only the text OG tags exist right now.
Create a matching rami.party image.

## 🧹 Cleanup / space
- [ ] `archive/old-rami.party/protected/assets/media/*.psd` (~745 KB of Photoshop sources) add no value
      to a web archive. **Decision needed:** delete to slim the repo, or keep for sentimental/source
      reasons? (They also include duplicate `.gif`/`.png` exports.)
Leave all old file, we have enough space.

- [ ] `archive/old-rami.party` still ships `jquery-2.1.1.min.js` — fine for an archived relic, but worth
      noting it's an old, unmaintained dependency.
That's archived. You can leave it.

## 🔍 SEO / crawlability
- The site is intentionally `noindex, nofollow` (owner's demo domain). Kept that, but added rich
  link-preview metadata so shared links still look good.
- [ ] If indexing is ever desired: flip robots, refresh `sitemap.xml` to list the realms
      (`/`, `/fun/lore/`, `/fun/prankscreens/`, `/neko/`, `/archive/`), and add canonical URLs.
Wait before implementing this we need to finish the clean realm folders.

## ❓ Open questions for Rami
1. Delete the `.psd` files in the archive? (space vs. keepsake)
No
2. Should prank screens get the enchanted chrome, or stay pixel-accurate OS clones?
Yes create a similar enchanting view.
3. Keep `admin.html` (looks like a prank/placeholder) or archive it too?
Add some very small content in the admin page, make it look like a login screen for a average CMS. Leave the Javascript
4. Any projects you want promoted to the top of the realm grid, or new ones to add to `projects.js`?
Not yet, leave the option to choose the ranking easily.

Add labidi.eu to the allied realms for the professional projects. Rami.party will be for demo, testing or the fun projects.