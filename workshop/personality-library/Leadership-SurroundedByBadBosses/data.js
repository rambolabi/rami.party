/* =============================================================================
   Surrounded by Bad Bosses (and Lazy Employees) — content
   Educational workshop inspired by Thomas Erikson's book. Recognising leadership
   failure modes and how to manage up. Assessment mode: "classify" (boss types).
   ========================================================================== */
const BOOK = {
  meta: {
    key: "bad-bosses",
    title: "Surrounded by Bad Bosses",
    subtitle: "Spot the type and learn to manage up",
    short: "Bad Bosses",
    emoji: "💼",
    accent: "#b45309",
    eyebrow: "A Thomas Erikson Workshop",
    description:
      "An educational workshop inspired by Thomas Erikson's 'Surrounded by Bad Bosses and Lazy Employees'. Recognise leadership failure modes and learn to manage up.",
    heroTitle: "Is your boss<br />the problem?",
    heroLead:
      "Bad management drains teams faster than anything else. Learn the classic bad-boss types from Thomas Erikson's <em>Surrounded by Bad Bosses and Lazy Employees</em> — and how to manage up.",
    heroCta: "Diagnose your boss",
    footerNote:
      "An educational workshop inspired by <em>Surrounded by Bad Bosses and Lazy Employees</em> by Thomas Erikson. A tool for reflection and better working relationships — not a performance review of any real person.",
  },

  learn: {
    kicker: "The Ideas",
    heading: "Why good management is rare",
    sub: "Most bad bosses aren't villains — they're people promoted past their skill, under pressure, leading on instinct. Tap a card to go deeper.",
  },

  concepts: [
    {
      icon: "🧭",
      name: "Leadership is behaviour",
      tag: "Not a title — a set of habits.",
      summary:
        "Leadership isn't a personality you're born with; it's behaviour you choose. The best managers flex their style to the person and the situation. The worst apply one rigid style to everyone and call it 'who I am'.",
      points: [
        "Good management adapts to the individual, not the org chart.",
        "Different people need different amounts of direction and support.",
        "Most 'bad bosses' lead on autopilot, not malice.",
        "The same behaviour can be strong or toxic depending on dose.",
      ],
    },
    {
      icon: "🎭",
      name: "The bad-boss types",
      tag: "Tyrant, micromanager, ghost, pushover.",
      summary:
        "Bad management clusters into recognisable failure modes: ruling by fear, controlling every detail, vanishing entirely, or avoiding every hard call. The assessment estimates which you're dealing with.",
      points: [
        "<strong>The Tyrant:</strong> leads by fear, pressure and blame.",
        "<strong>The Micromanager:</strong> can't delegate or trust.",
        "<strong>The Ghost:</strong> absent, vague, no direction.",
        "<strong>The Pushover:</strong> avoids decisions and conflict.",
      ],
    },
    {
      icon: "😴",
      name: "The 'lazy employee' myth",
      tag: "Disengagement has causes.",
      summary:
        "Erikson argues most 'lazy' employees aren't lazy — they're unclear, unmotivated, mismatched or badly led. Behaviour that looks like laziness usually has a fixable cause.",
      points: [
        "Unclear expectations look like laziness.",
        "The wrong role for someone's strengths looks like laziness.",
        "Lost motivation after being ignored looks like laziness.",
        "Fix the cause before judging the person.",
      ],
    },
    {
      icon: "⬆️",
      name: "Managing up",
      tag: "Handle the boss you have.",
      summary:
        "You rarely get to choose your boss, but you can manage the relationship. Understand what they fear and value, adapt how you communicate, and make it easy for them to trust you.",
      points: [
        "Learn what your boss actually worries about.",
        "Give them information in the form they prefer.",
        "Reduce their uncertainty and you reduce their bad behaviour.",
        "Document agreements so goalposts can't quietly move.",
      ],
    },
    {
      icon: "🔧",
      name: "If you're the boss",
      tag: "The self-aware manager.",
      summary:
        "Every one of these types is easy to slip into under pressure. The antidote is self-awareness: notice your default failure mode and deliberately flex toward what each person needs.",
      points: [
        "Know which bad-boss type you drift into when stressed.",
        "Ask for honest feedback and actually act on it.",
        "Delegate outcomes, not just tasks.",
        "Adapt your style to each team member.",
      ],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Diagnose",
    heading: "What kind of boss do you have?",
    sub: "Think of one specific manager — current or past. Answer what you observe, and we'll estimate their dominant failure mode.",
    nav: "Diagnose",
    icon: "🔎",
    introTitle: "12 observations",
    introText: "Hold one boss in mind and choose the option that fits <em>them</em> best.",
    resultEyebrow: "Your boss's dominant type",
    categories: {
      tyrant: {
        name: "The Tyrant",
        icon: "⚡",
        color: "#b91c1c",
        summary:
          "Leads by fear, pressure and blame. Results now, feelings never. The team performs out of anxiety, not commitment — and burns out.",
        signs: ["Rules by intimidation and pressure", "Blames rather than coaches", "Public criticism, private credit-taking", "Little empathy for workload or people", "People go quiet when they enter the room"],
        handle: ["Stay calm, factual and confident", "Bring solutions, not problems", "Document decisions and instructions", "Set boundaries on unacceptable behaviour", "Protect your wellbeing and know your exits"],
      },
      micromanager: {
        name: "The Micromanager",
        icon: "🔬",
        color: "#b45309",
        summary:
          "Can't delegate or trust. Wants to approve every detail, rewrites your work, and mistakes control for quality. Talented people suffocate under them.",
        signs: ["Wants to check and approve everything", "Rewrites work unnecessarily", "Asks for constant updates", "Struggles to delegate real ownership", "Confuses control with quality"],
        handle: ["Over-communicate progress up front", "Share your plan before they ask", "Build trust with small reliable wins", "Agree check-in points to reduce surprise", "Gently ask for ownership of defined areas"],
      },
      ghost: {
        name: "The Ghost",
        icon: "👻",
        color: "#64748b",
        summary:
          "Absent and vague. No direction, no feedback, unreachable when you need a decision — then surprised when things go wrong or quietly taking the credit.",
        signs: ["Unavailable and hard to pin down", "Gives vague or no direction", "Little feedback or support", "Decisions stall waiting on them", "Appears when there's credit to take"],
        handle: ["Ask for specific, written decisions", "Propose defaults: 'unless you object, I'll…'", "Create your own clarity and confirm it", "Keep a record of your contributions", "Build a support network beyond them"],
      },
      pushover: {
        name: "The Pushover",
        icon: "🌾",
        color: "#0891b2",
        summary:
          "Conflict-averse and indecisive. So eager to be liked that problems fester, poor performers go unchallenged, and the team drifts without a rudder.",
        signs: ["Avoids hard decisions and conflict", "Says yes to everyone, follows through with no one", "Lets problems and poor performers slide", "Changes direction to please the last voice", "The team lacks clear priorities"],
        handle: ["Bring clear recommendations to decide on", "Make saying 'yes' easy and low-risk", "Put priorities in writing to hold them", "Fill the vacuum with your own clarity", "Escalate blockers politely but firmly"],
      },
    },
    questions: [
      { q: "How do they give direction?", options: [
        { text: "Orders, with pressure to deliver", cat: "tyrant" },
        { text: "In exhaustive, controlling detail", cat: "micromanager" },
        { text: "Vaguely, if at all", cat: "ghost" },
        { text: "Whatever pleases whoever asked last", cat: "pushover" },
      ]},
      { q: "When something goes wrong, they…", options: [
        { text: "Look for someone to blame", cat: "tyrant" },
        { text: "Take over and redo it themselves", cat: "micromanager" },
        { text: "Are nowhere to be found", cat: "ghost" },
        { text: "Avoid addressing it at all", cat: "pushover" },
      ]},
      { q: "How do they handle your work?", options: [
        { text: "Demand more, faster", cat: "tyrant" },
        { text: "Check and rewrite every detail", cat: "micromanager" },
        { text: "Barely look at it", cat: "ghost" },
        { text: "Approve anything to avoid friction", cat: "pushover" },
      ]},
      { q: "In meetings they…", options: [
        { text: "Dominate and intimidate", cat: "tyrant" },
        { text: "Drill into tiny details", cat: "micromanager" },
        { text: "Are absent or distracted", cat: "ghost" },
        { text: "Agree with everyone and decide nothing", cat: "pushover" },
      ]},
      { q: "Their feedback is usually…", options: [
        { text: "Harsh and critical", cat: "tyrant" },
        { text: "Nit-picking and constant", cat: "micromanager" },
        { text: "Rare or non-existent", cat: "ghost" },
        { text: "Vague and reassuring, never useful", cat: "pushover" },
      ]},
      { q: "How do they treat mistakes?", options: [
        { text: "Punish them", cat: "tyrant" },
        { text: "Use them to justify more control", cat: "micromanager" },
        { text: "Don't notice until it's a crisis", cat: "ghost" },
        { text: "Sweep them under the carpet", cat: "pushover" },
      ]},
      { q: "How much do they trust the team?", options: [
        { text: "Only through fear and oversight", cat: "tyrant" },
        { text: "Not at all — they must approve everything", cat: "micromanager" },
        { text: "They've checked out entirely", cat: "ghost" },
        { text: "They trust everyone equally, even poor performers", cat: "pushover" },
      ]},
      { q: "When you need a decision, they…", options: [
        { text: "Decide fast but bulldoze objections", cat: "tyrant" },
        { text: "Won't decide without every detail", cat: "micromanager" },
        { text: "Are impossible to reach", cat: "ghost" },
        { text: "Keep deferring to avoid upsetting anyone", cat: "pushover" },
      ]},
      { q: "How do they handle credit?", options: [
        { text: "Take it and pass down the blame", cat: "tyrant" },
        { text: "Claim your work needed all their fixes", cat: "micromanager" },
        { text: "Appear only when there's credit going", cat: "ghost" },
        { text: "Give it away to keep the peace", cat: "pushover" },
      ]},
      { q: "The mood they create is…", options: [
        { text: "Tense and fearful", cat: "tyrant" },
        { text: "Anxious and second-guessing", cat: "micromanager" },
        { text: "Rudderless and confused", cat: "ghost" },
        { text: "Directionless and frustrated", cat: "pushover" },
      ]},
      { q: "Poor performers on the team are…", options: [
        { text: "Bullied out", cat: "tyrant" },
        { text: "Managed by removing all their autonomy", cat: "micromanager" },
        { text: "Ignored like everyone else", cat: "ghost" },
        { text: "Never confronted", cat: "pushover" },
      ]},
      { q: "When you push back, they…", options: [
        { text: "React with anger", cat: "tyrant" },
        { text: "Tighten their grip", cat: "micromanager" },
        { text: "Disengage further", cat: "ghost" },
        { text: "Cave, then quietly resent it", cat: "pushover" },
      ]},
    ],
  },

  assessment2: {
    mode: "classify",
    kicker: "Second assessment",
    heading: "Is that employee really lazy?",
    sub: "Erikson argues most 'lazy' employees aren't lazy — they're unclear, mismatched, demotivated or checked-out. Think of one underperformer and find the real cause.",
    nav: "Lazy employees",
    icon: "\uD83D\uDE34",
    introTitle: "10 observations",
    introText: "Hold one underperforming person in mind and pick what fits <em>them</em> best.",
    resultEyebrow: "The real reason behind the 'laziness'",
    categories: {
      unclear: {
        name: "The Unclear", icon: "\u2753", color: "#0891b2",
        summary: "Not lazy — unclear. They don't actually know what 'good' looks like, so effort scatters or stalls.",
        signsTitle: "What you'll notice", handleTitle: "How to re-engage them",
        signs: ["Willing but confused", "Work keeps missing the mark", "Surprised by feedback", "Often new or recently reorganised"],
        handle: ["Spell out expectations and what 'done' looks like", "Agree priorities and check-in points", "Confirm understanding — don't assume", "Course-correct early and often"],
      },
      mismatched: {
        name: "The Mismatched", icon: "\uD83E\uDDE9", color: "#b45309",
        summary: "Not lazy — mismatched. They're a square peg in a round role; their strengths lie elsewhere.",
        signsTitle: "What you'll notice", handleTitle: "How to re-engage them",
        signs: ["Tries hard at the wrong things", "Persistent struggle despite effort", "Shines in different tasks", "Never quite fits the role"],
        handle: ["Identify their real strengths", "Redesign the role or move them", "Play to what they do well", "Don't mistake poor fit for poor attitude"],
      },
      demotivated: {
        name: "The Demotivated", icon: "\uD83D\uDD0B", color: "#64748b",
        summary: "Not lazy — demotivated. They used to care, then felt ignored or taken for granted, and switched off.",
        signsTitle: "What you'll notice", handleTitle: "How to re-engage them",
        signs: ["Flat, disheartened energy", "A 'why bother' attitude", "Revives with recognition", "A history of being overlooked"],
        handle: ["Recognise their contribution sincerely", "Involve them in decisions", "Reconnect their work to meaning", "Rebuild trust with follow-through"],
      },
      checkedout: {
        name: "The Checked-Out", icon: "\uD83D\uDEAA", color: "#b91c1c",
        summary: "Genuinely disengaged or burned out. They've mentally left — this needs an honest reset, not more pressure.",
        signsTitle: "What you'll notice", handleTitle: "How to re-engage them",
        signs: ["Minimal engagement", "Little reaction to feedback", "Long-term unhappy or exhausted", "Going through the motions"],
        handle: ["Have a frank, kind conversation", "Explore burnout vs. disengagement", "Agree a clear path: re-engage or move on", "Address the cause, don't pile on pressure"],
      },
    },
    questions: [
      { q: "When you ask why work isn't done, they say…", options: [
        { text: "'I didn't know that was what you wanted'", cat: "unclear" },
        { text: "'This isn't really the kind of thing I'm good at'", cat: "mismatched" },
        { text: "'What's the point, nobody notices anyway'", cat: "demotivated" },
        { text: "'Honestly, I've stopped caring'", cat: "checkedout" },
      ]},
      { q: "Their energy is…", options: [
        { text: "Willing but confused", cat: "unclear" },
        { text: "Trying hard at the wrong things", cat: "mismatched" },
        { text: "Flat and disheartened", cat: "demotivated" },
        { text: "Absent", cat: "checkedout" },
      ]},
      { q: "Given a clear, well-matched task they…", options: [
        { text: "Suddenly deliver well", cat: "unclear" },
        { text: "Still struggle", cat: "mismatched" },
        { text: "Do it if they feel appreciated", cat: "demotivated" },
        { text: "Still don't engage", cat: "checkedout" },
      ]},
      { q: "They perk up when…", options: [
        { text: "Expectations are spelled out", cat: "unclear" },
        { text: "They're moved to work that suits them", cat: "mismatched" },
        { text: "Their effort is recognised", cat: "demotivated" },
        { text: "Rarely — they've mentally left", cat: "checkedout" },
      ]},
      { q: "The root cause looks like…", options: [
        { text: "Poor communication", cat: "unclear" },
        { text: "Wrong role fit", cat: "mismatched" },
        { text: "Being taken for granted", cat: "demotivated" },
        { text: "Deep disengagement or burnout", cat: "checkedout" },
      ]},
      { q: "Their history is…", options: [
        { text: "New or recently changed role", cat: "unclear" },
        { text: "Always been a stretch for them", cat: "mismatched" },
        { text: "Used to care, then got ignored", cat: "demotivated" },
        { text: "Long-term unhappy or exhausted", cat: "checkedout" },
      ]},
      { q: "When you give feedback they…", options: [
        { text: "Say 'oh, I didn't realise'", cat: "unclear" },
        { text: "Agree but can't seem to improve", cat: "mismatched" },
        { text: "Shrug — 'why bother'", cat: "demotivated" },
        { text: "Barely react", cat: "checkedout" },
      ]},
      { q: "They respond best to…", options: [
        { text: "Clear goals and check-ins", cat: "unclear" },
        { text: "A role redesign or move", cat: "mismatched" },
        { text: "Recognition and involvement", cat: "demotivated" },
        { text: "A frank talk about staying or going", cat: "checkedout" },
      ]},
      { q: "Their potential is…", options: [
        { text: "High, once aligned", cat: "unclear" },
        { text: "Better used elsewhere", cat: "mismatched" },
        { text: "Recoverable with appreciation", cat: "demotivated" },
        { text: "Uncertain — needs a reset", cat: "checkedout" },
      ]},
      { q: "What they most need is…", options: [
        { text: "Clarity", cat: "unclear" },
        { text: "A better-fitting role", cat: "mismatched" },
        { text: "To feel valued", cat: "demotivated" },
        { text: "A real, honest conversation", cat: "checkedout" },
      ]},
    ],
  },

  handle: {
    kicker: "Field Guide",
    heading: "How to manage up",
    sub: "You can't pick your boss, but you can manage the relationship — and protect your work and wellbeing.",
    nav: "Manage up",
    cta: "Read the managing-up guide →",
    cards: [
      { icon: "✅", title: "Do", tone: "do", items: [
        "Learn what your boss fears and values", "Communicate in their preferred style", "Reduce their uncertainty proactively", "Put key agreements in writing", "Keep a record of your contributions",
      ]},
      { icon: "⛔", title: "Don't", tone: "dont", items: [
        "Take their behaviour as your verdict", "Only bring problems, never solutions", "Assume they'll notice your good work", "Argue in public or in anger", "Suffer in silence — build support",
      ]},
      { icon: "🧩", title: "Match the type", tone: "", items: [
        "Tyrant: be calm, factual, boundaried", "Micromanager: over-communicate progress", "Ghost: ask for written decisions & defaults", "Pushover: bring clear recommendations", "Always: document, document, document",
      ]},
    ],
  },

  faq: [
    { q: "Is my boss really 'bad', or just different?", a: "This tool spots <em>failure modes</em>, not verdicts. A demanding boss isn't automatically a tyrant. Look for a consistent pattern that harms the team, not a single stressful week." },
    { q: "Can a bad boss improve?", a: "Often, yes — many are simply unaware or under pressure. Honest feedback, self-awareness and adapting their style to each person can turn things around." },
    { q: "Are 'lazy employees' really lazy?", a: "Rarely. Erikson argues most disengagement comes from unclear expectations, the wrong role, lost motivation or poor leadership. Fix the cause before judging the person." },
    { q: "What if managing up isn't enough?", a: "Sometimes the healthiest move is to change teams or roles. Protect your wellbeing, keep your record of contributions, and know your options." },
    { q: "Can a boss be more than one type?", a: "Yes. Under different pressures a manager can shift — a micromanager who goes ghost when overwhelmed, for example. Your result shows the strongest match and the balance." },
    { q: "I think I'm one of these types — now what?", a: "Good self-awareness is the whole battle. Notice your stress default, ask your team for honest feedback, delegate outcomes, and flex your style to each person." },
  ],

  disc: {
    kicker: "The Four Colours",
    heading: "Bad bosses and the four colours",
    sub: "Under pressure, each DISC colour drifts toward a different failure mode — as a boss or a report. Spot yours, and learn how to work with each.",
    nav: "Colours",
    labels: { relate: "Under pressure this colour drifts toward", reflect: "If this is you — self-check", treat: "How to work with them" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Explore the DISC colour workshop →",
    colors: {
      red: {
        relate: "A stressed Red becomes the Tyrant — pushing harder, blaming, steamrolling the team.",
        reflect: "Ask whether you're driving results or just driving people. Pause before you bark.",
        treat: "Be brief and results-focused; stand your ground calmly and bring solutions, not problems.",
      },
      yellow: {
        relate: "A stressed Yellow drifts toward the Ghost — chasing the fun and dodging admin and hard calls.",
        reflect: "Check what you're avoiding. Follow-through is where your credibility is built.",
        treat: "Keep it upbeat, but pin down decisions and details in writing.",
      },
      green: {
        relate: "A stressed Green becomes the Pushover — avoiding conflict until problems quietly fester.",
        reflect: "Notice where 'keeping everyone happy' is really dodging a hard conversation.",
        treat: "Be patient and reassuring; help them commit to clear, written priorities.",
      },
      blue: {
        relate: "A stressed Blue becomes the Micromanager — controlling every detail, unable to trust.",
        reflect: "Ask if your high standards have tipped into control. Delegate outcomes, not just tasks.",
        treat: "Bring detail and data; earn trust through reliable, accurate delivery.",
      },
    },
  },
};
