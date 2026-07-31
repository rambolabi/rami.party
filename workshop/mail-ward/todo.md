# Mail Ward — todo

Static guide + tools for SPF / DKIM / DMARC. No build step, no dependencies.
`index.html` (all content) · `style.css` (themes shared with Subnet Studio) ·
`app.js` (theme, scrollspy, builder, inspector, opt-in DoH lookup, triage wizard, checklist).

## Facts worth keeping

- The only network call on the page is the **opt-in** DNS-over-HTTPS lookup against
  `cloudflare-dns.com`, behind a `<details>` and a button press. Keep it that way, and keep
  the disclosure text next to it.
- All generated DOM uses `createElement`/`textContent`. Never introduce `innerHTML` here —
  the inspector renders text the user pasted.
- `PROVIDERS[].lk` is an **estimated** recursive SPF lookup cost per `include:`. It is
  documented as an estimate in the UI; do not present it as authoritative.
- Vendor `include:` tokens and DKIM selectors drift. Re-verify against vendor docs
  before changing them, and keep the "confirm with your provider" caveats.

## Open

- [ ] Re-check every `include:` token and DKIM selector against current vendor docs (they change).
- [ ] Add a DMARC aggregate-report (XML) drop zone that summarises sources locally,
      the same way the Mail Headers project handles `.eml` files.
- [ ] Add an SPF flattening preview (resolve includes over DoH, show the resulting ip4 list)
      with a loud warning about freezing provider IPs.
- [ ] Offer a printable / one-page export of the runbook and the "recognising fakes" section
      so it can be handed to non-technical staff.
- [ ] Translations (nl / fr) — the site's Subnet Studio already carries an i18n pattern to copy.
- [ ] Cross-link from the Mail Headers analyzer results when it reports `dmarc=fail`.
- [ ] Consider a small "cousin domain" generator: given a domain, list the common
      typo/homoglyph variants worth monitoring or registering defensively.

## Verifying

1. `python -m http.server 8877 --bind 127.0.0.1` from `c:\Temp\Git\rami.party`
2. Open `/workshop/mail-ward/` with the HTTP cache disabled — otherwise you test stale JS/CSS.
3. Check: theme switch persists, TOC highlights on scroll, builder reacts to every input,
   inspector handles SPF / DMARC / DKIM / garbage, triage reaches all seven outcomes,
   checklist survives a reload.
4. Assert no element is wider than the viewport at 360 px.
