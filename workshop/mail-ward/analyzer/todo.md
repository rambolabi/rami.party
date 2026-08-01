# Email Header Analyzer — TODO

Tool that parses raw email headers (or a full `.eml`) and reports
SPF / DKIM / DMARC / ARC results, sender details, relay path, attachments and
a safe body preview. Runs 100% client-side. External lookups are strictly opt-in.

**Moved 2026-07-31** from `workshop/mailheaders/` to `workshop/mail-ward/analyzer/` — it is
now the second page of the Mail Ward suite. The old path is a noindex redirect stub.
The shared suite bar comes from `../suite.css`; the page's own theme picker was relocated
into that bar (its original `position: fixed` would have overlapped it).

## Architecture (modular)
```
mail-ward/
  suite.css                 # shared suite bar, used by every page
  analyzer/
    index.html
    css/
      themes.css            # colour tokens per theme
      main.css              # layout / components
    js/
      data-iana-tlds.js     # bundled ICANN TLD snapshot (Set)
      data-tlds-twopart.js  # second-level public suffixes
      data-tlds-risky.js    # abuse-heavy TLDs
      data-tlds-nonpublic.js# internal/private pseudo-TLDs
      data-brands.js        # impersonated global brands
      data-example.js       # "Load an example" sample
      lookups.js            # ALL external-lookup intelligence (opt-in)
      analyzer.js           # core logic / the intelligence
    data/
      tlds-alpha-by-domain.txt # verbatim ICANN copy (provenance)
    script.js               # ⚠ DEAD: the pre-split monolith, loaded by nothing.
                            #   Safe to delete — kept only so the decision is explicit.
```

## Done ✅

### Structure
- [x] Split the monolithic `script.js`/`style.css` into the modular layout above.
- [x] Bundled a verbatim copy of the ICANN TLD list + a parsed `IANA_TLDS` Set.
- [x] **Unknown-TLD detection** against the bundled ICANN snapshot, with an opt-in
      "Check live ICANN list" button (fetches data.iana.org on demand, CORS-safe
      fallback to opening the list) and a live-vs-bundled comparison.
- [x] Expanded impersonated-brands list; risky / two-part / non-public TLD lists
      each in their own data file.

### Themes & UX
- [x] Multi-theme system (Light · Slate, Dark · Graphite, Midnight · Indigo,
      Nord · Arctic, Solarized, Matrix · Terminal) via `data-theme` + theme picker.
- [x] Variable-driven CSS — every colour is a token; themes need no per-element overrides.
- [x] Theme choice persisted in `localStorage` (private-mode fallback).
- [x] Toast notifications, Clear input / Clear results / Copy summary buttons.
- [x] Accessibility (`aria-*`, labels, `prefers-reduced-motion`), meta tags, favicon.
- [x] Responsive polish.

### Security fixes
- [x] Escape security-check values before `innerHTML` (header-sourced XSS).
- [x] Clipboard hardening (insecure-context guard, empty handling, no blocking `alert`).
- [x] Ctrl/Cmd+V handles `v`/`V` and ignores focus-in-field.

### Parser bug fixes (previously "potential bugs")
- [x] **Multiple `Authentication-Results`** headers are now merged before parsing.
- [x] **ARC** result parsed (guarded against matching `arc=` inside `dmarc=`) and
      surfaced as its own check.
- [x] **Received-SPF** parsed, shown, and reconciled against Authentication-Results.
- [x] **Received date parsing** now strips parenthetical timezone comments (e.g. `(PDT)`)
      and reads the last `;`-segment (fixes headers with a `for <...>;` clause).
- [x] Folded-header continuation verified for long DKIM `b=`/`bh=` values.

### New investigation / analysis features
- [x] Display-name spoofing detection (embedded domain/email + brand impersonation).
- [x] Reply-To and Return-Path mismatch checks in the Security grid.
- [x] Offline DNS/domain heuristics: IDN/punycode (`xn--`), risky TLDs, IP-literal senders.
- [x] Relay timeline: hop count + **total transit time** (with clock-skew handling).
- [x] **External Lookups** panel (opt-in, click-only, opens a new tab):
      - Domains → who.is (WHOIS/age), MXToolbox MX/SPF/DMARC/Blacklist, VirusTotal.
      - IPs → MXToolbox Blacklist/PTR/ARIN, AbuseIPDB, VirusTotal.
      - Private/reserved IPs and internal TLDs are filtered out.
- [x] Domain registration age / DNS health delegated to opt-in MXToolbox/who.is links
      (not possible purely client-side without a network request).
- [x] Full `.eml` support: split headers/body, **MIME parsing** (multipart, base64,
      quoted-printable, nested parts).
- [x] **Attachments**: extracted, sized, hashed with SHA-256 locally → opt-in VirusTotal
      hash link.
- [x] **Message body preview** with three modes:
      - Plain text (via `DOMParser`, never loads remote resources).
      - Safe HTML — sandboxed iframe, no scripts, CSP blocks all remote content (no tracking pixels).
      - Raw HTML — scripts + remote allowed, behind an explicit warning + confirm.
- [x] Drag-and-drop a `.eml`/`.txt` file anywhere on the page (5 MB cap).
- [x] "Load an example" (phishing-style sample).
- [x] Export report as **JSON** and **Markdown**.

## Potential bugs to watch / verify
- [ ] Organizational-domain check uses a small built-in two-part-TLD list (no full
      Public Suffix List) — exotic ccTLDs may mis-align. Acceptable trade-off for offline use.
- [ ] MIME parser is pragmatic, not a full RFC 2045/2046 implementation
      (e.g. `message/rfc822` nesting, RFC 2231 filenames only partially handled).
- [ ] Very large base64 attachments hash on the main thread — could move to a Web Worker.
- [ ] `charset` decoding relies on `TextDecoder`; rare legacy charsets fall back to latin1.

## Future improvements (more security / investigation ideas)
- [ ] Decode RFC 2047 encoded-words (`=?utf-8?B?...?=`) in Subject / From display names.
- [ ] Extract & list all body URLs with per-link opt-in VirusTotal/urlscan lookups,
      and flag look-alike/punycode link domains + mismatched anchor-text vs href.
- [ ] Detect tracking pixels (1×1 images / known trackers) and list them explicitly.
- [ ] Highlight reverse-DNS (PTR) vs HELO name mismatches per relay hop.
- [ ] Bundle a small offline Public Suffix List for accurate organizational-domain alignment.
- [ ] Flag forged `Received` chains (private-IP origin, impossible timestamps, missing hops).
- [ ] Parse & display DMARC/DKIM policy tags (p=, sp=, adkim/aspf, selector, key length).
- [ ] Optional bundled homoglyph/confusable table to score look-alike domains offline.
- [ ] Header anomaly scan: duplicate From, bare-newline injection, oversized header count.
- [ ] Message-ID domain vs From domain consistency check.
- [ ] "Copy as defanged" (hxxp://, [.]) output for safe sharing in tickets/reports.
- [ ] Shareable permalink that encodes the report in the URL hash (local only, no upload).
- [ ] Move attachment hashing + large-body parsing into a Web Worker for responsiveness.
