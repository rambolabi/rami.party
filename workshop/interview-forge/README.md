# 🎙️ Interview Forge

A calm, professional companion for job interviews. Prepare the conversation, run it while taking
notes, and walk out with a report — all in the browser, with nothing ever leaving the device.

Live at [`/workshop/interview-forge/`](https://rami.party/workshop/interview-forge/).

## What it does

- **Two ways in.** *Quick start* drops you straight into the workspace with a small starter set.
  *Guided setup* walks through five steps: candidate → position → subjects → questions → review.
- **Positions & roles.** ~40 job profiles (IT service desk, network & firewall engineer, firewall
  expert, Azure engineer, developer, security engineer, pentester, marketing assistant, HR officer,
  project/delivery manager, customer success manager, digital workplace consultant…). Picking a
  position ticks the matching subjects; you can add or drop subjects yourself.
- **Question bank.** Hundreds of trilingual questions across ~34 subjects, each with a **model
  answer** hidden behind a button, so the interviewer can check the answer without bluffing.
  A burger drawer on every screen searches the whole bank by text, subject, role and level.
- **Templates.** Nine curated starter templates keep beginners out of the deep end. Any selection
  can be saved as a template or shared with a link (`#tpl=…`, encoded in the URL — no server).
- **Workspace.** Tabs for briefing, questions, free notes, DISC and the report, plus a split
  "book" view with questions on the left and a running notes pane on the right. Every question has
  its own note field, a 1–5 rating and an *asked* tick.
- **DISC.** A dedicated DISC question list; mark which colour each answer leans to and the bars
  show the indicated profile (red/yellow/green/blue).
- **CV & documents.** Attach the PDF you got from HR or the candidate. Files stay on the device;
  attachments up to ~1.5 MB are remembered between visits, larger ones only for the session.
  They open in a sandboxed frame.
- **Report.** Markdown preview with three scopes — only what you filled in, questions with notes or
  a rating, or all selected questions — optionally including the model answers. Copy, download
  `.md`, print to PDF or export the whole interview as JSON (and import it again).
- **Compare.** Put saved interviews side by side: average score per subject, overall average,
  answered count, dominant DISC colour and verdict, with the best value per row highlighted.
- **Three languages** (English, Dutch, French) and **six themes** (Midnight, Slate, Daylight,
  Parchment, Forest, High contrast).

## Files

```
index.html                app shell (header, drawer, toast)
style.css                 tokens, the six themes, layout, print styles
i18n.js                   IF_LANGS + IF_I18N — every interface string in en/nl/fr
app.js                    state, routing, rendering, storage, Markdown export
data/taxonomy.js          IF_CATEGORIES, IF_ROLES, IF_POSITIONS, IF_TEMPLATES, IF_DISC
data/questions-tech.js    technical question bank
data/questions-soft.js    behaviour, personality and DISC question bank
data/questions-business.js  business, service desk, project, HR and consulting bank
```

There is no build step: open `index.html` and it runs.

## Adding questions

Append an object to any file in `data/`:

```js
window.IF_QUESTIONS = (window.IF_QUESTIONS || []).concat([
    {
        id: 'net-tcp-udp',            // unique, kebab-case
        cat: 'networking',            // one id from IF_CATEGORIES
        roles: ['networking'],        // one or more ids from IF_ROLES
        level: 'junior',              // junior | medior | senior
        q: { en: '…', nl: '…', fr: '…' },
        a: { en: '…', nl: '…', fr: '…' }   // the model answer the interviewer sees
    }
]);
```

DISC questions use `cat: 'disc'`, `roles: ['disc']` and an extra `disc: 'D' | 'I' | 'S' | 'C'`.

Adding a position is one object in `IF_POSITIONS` with the roles it should tick; adding a starter
template is one object in `IF_TEMPLATES` with its roles and a `max` question count.

## Storage

Everything lives in `localStorage`: `if.sessions`, `if.templates`, `if.lang`, `if.theme`,
`if.current`. No account, no network calls, no tracking.
