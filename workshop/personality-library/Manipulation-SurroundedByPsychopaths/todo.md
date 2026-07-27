# Surrounded by Psychopaths — Web Application Project

## Project Overview
An educational, interactive workshop based on Thomas Erikson's *Surrounded by Psychopaths*.
It teaches people to recognise manipulation tactics and protect themselves — responsibly framed
as behavioural awareness, **not** clinical diagnosis.

## Key Requirements

### 1. Educational Content
- The mask of charm (psychopathy as a spectrum, superficial charm, love-bombing)
- The manipulation toolbox (lying, gaslighting, guilt-tripping, flattery, triangulation)
- Warning signs (patterns over time, public vs private face)
- Protect yourself (boundaries, records, limiting information, avoiding isolation)
- Why it works on you (they exploit empathy, loyalty, guilt, approval-seeking)

### 2. Self / Observer Assessment
- Reflective "red-flag" checklist about one specific person (12 behaviour statements)
- Frequency scale (Never → Often) → percentage risk score
- Result banded: Low / Caution / High, each with tailored protective advice
- Score meter visualisation

### 3. Handle / Field Guide
- Do / Don't cards
- The grey-rock method

### 4. Design & UX
- Clean, modern, professional, colour-coded (deep crimson accent)
- Responsive, accessible, print-friendly results
- Progress indicator, one question at a time, result only at end

### 5. Technical Implementation
- Shared data-driven engine (`app.js`) + `style.css`
- Book-specific content in `data.js` (`BOOK` object, assessment mode `score`)
- No backend, static site

## Content Authority & Responsibility
Inspired by *Surrounded by Psychopaths* by Thomas Erikson. Educational only — not a diagnostic
or clinical tool. Footer invites readers to buy the book and support the author, and to seek
professional support if they feel unsafe.

## Build Status — DELIVERED
- `index.html` — data-driven workshop skeleton
- `style.css` — shared theme (crimson accent)
- `app.js` — shared engine (score assessment mode)
- `data.js` — psychopaths content + 12-question red-flag checklist
- [x] Educational cards + detail drawers
- [x] Red-flag score assessment with banded advice + meter
- [x] Do/Don't + grey-rock field guide
- [x] FAQ with responsible disclaimers
- [x] Responsive, accessible, print-friendly, buy-the-book footer

## Questions for Thomas Erikson
1. Tone — is the "red-flag checklist" framing responsible enough, or would you prefer softer wording?
Stay with the wording from the book.
2. Should we add a DISC cross-link (which colours are most vulnerable to which tactics)?
Yes, include how each color can self reflect and how to take care of this behavior from the perspective of a certain color.
3. Any specific safety resources/help-line wording you'd like in the footer?
Current wording is fine.