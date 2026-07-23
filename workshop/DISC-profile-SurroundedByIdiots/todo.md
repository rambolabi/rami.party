# DISC Personality Workshop - Web Application Project

## Project Overview
Create a professional, interactive webpage based on "Surrounded by Idiots" by Thomas Erikson that educates users about the 4 DISC personality color profiles with engaging quizzes.

## Key Requirements

### 1. Educational Content Section
- **Red (Dominant/Driver)**: Direct, results-oriented, competitive, decisive, commanding
- **Yellow (Expressive/Influencer)**: Enthusiastic, outgoing, optimistic, sociable, persuasive
- **Green (Steady/Supporter)**: Calm, patient, reliable, supportive, team-focused
- **Blue (Conscientious/Analyser)**: Careful, logical, precise, quality-focused, thoughtful

For each color, include:
- Core characteristics and traits
- Communication style
- Decision-making approach
- Work environment preferences
- Strengths and potential weaknesses
- How they interact with other colors

### 2. Self-Assessment Quiz
- 15-25 targeted questions about personal preferences and behaviors
- Questions hidden during the quiz experience
- Results displayed ONLY at the end
- Single color result or percentage breakdown
- Detailed interpretation page with recommendations

### 3. Others Assessment Quiz
- 15-25 questions about observing someone else's behavior
- **Real-time dynamic graph** updating after each answer
- Graph shows live probability distribution across all 4 colors
- Visual indicators showing which color is currently "winning"
- Final result with confidence levels
- Ability to take multiple assessments for different people

### 4. Design & UX Requirements
- Clean, modern, professional layout
- Color-coded sections matching each personality (Red, Yellow, Green, Blue)
- Responsive design (mobile, tablet, desktop)
- Easy navigation between content and quizzes
- Progress indicators for quizzes
- Print-friendly results pages
- Accessibility standards compliance (WCAG 2.1)

### 5. Technical Implementation
- HTML5/CSS3 for structure and styling
- JavaScript for quiz logic and real-time graph updates
- Chart library (Chart.js or similar) for dynamic visualization
- Local storage for session management
- No backend required (static site acceptable)

### 6. Additional Features
- Information cards/panels for quick reference
- FAQ section addressing common questions
- Quick personality identifier (rapid assessment)
- Shareable results (with permission)
- Tips for working with each color type
- Workshop facilitation guide integration

## Content Authority
Information sourced from "Surrounded by Idiots" and established DISC methodology by William Moulton Marston.

---

## Build Status — DELIVERED (v1)
A complete, self-contained application has been built:
- `index.html` — single-page workshop with 7 sections + sticky nav + mobile menu
- `style.css` — clean, modern, professional light theme with the 4 DISC accents, fully responsive + print styles
- `data.js` — all educational content, 20 self statements, 16 observer questions, 4 quick picks, tips, FAQ
- `app.js` — quiz engines, live radar/doughnut charts (Chart.js), interaction matrix, scoring

Delivered features vs. requirements:
- [x] Educational content for all 4 colours (traits, communication, decisions, work env, strengths, watch-outs, motivators, stress, how-to-connect)
- [x] Colour-to-colour interaction matrix
- [x] Self-assessment (20 Likert statements, one at a time, result only at end, % breakdown + radar)
- [x] Others-assessment (16 questions, REAL-TIME radar + live bars updating after each answer, confidence level, multiple people via name label)
- [x] Quick identifier (4 rapid picks)
- [x] Tips (do/don't per colour) + FAQ
- [x] Responsive, accessible (skip link, ARIA), print-friendly results
- [x] Chart.js via CDN, no backend

## Questions for Thomas Erikson (collaboration notes)
Please confirm / advise so v2 stays faithful to the book:
1. **Terminology** — For a general audience, do you prefer the plain colour names (Red/Yellow/Green/Blue) foregrounded over the DISC letters? Current build leads with colours and shows DISC labels as secondary. OK?
2. **Blend messaging** — The book stresses ~80% of people are two-colour blends. I surface the top-two blend when the gap is small. Would you like the results to *always* name a primary + secondary pair rather than a single colour?
3. **Question wording** — Any statements/observations you'd rephrase to match the book's voice? Happy to swap in your preferred phrasings verbatim.
4. **Scoring weights** — Self-test maps Likert 1–5 to weight 0–4 per colour. Do you want forced-choice ("most/least like me") ranking instead, which some DISC purists prefer?
5. **Stress vs. baseline** — Should the observer test distinguish a person's *adapted* (work/pressure) style from their *natural* style, as the book discusses? Could add a second short pass.
6. **Attribution / licensing** — Any specific credit line, disclaimer, or trademark wording you want on the footer regarding the book and the DISC model?
7. **Facilitation guide** — The todo mentions a workshop facilitation guide. Do you want a printable facilitator's script/slide companion added as a separate page?
8. **Colour meanings nuance** — Any corrections to the strengths/watch-outs lists you'd like adjusted to avoid stereotyping?
