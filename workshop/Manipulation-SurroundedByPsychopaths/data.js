/* =============================================================================
   Surrounded by Psychopaths — content
   Educational workshop inspired by Thomas Erikson's "Surrounded by Psychopaths".
   Recognising manipulation and protecting yourself — NOT a clinical/diagnostic
   tool. Assessment mode: "score" (manipulation red-flag risk).
   ========================================================================== */
const BOOK = {
  meta: {
    key: "psychopaths",
    title: "Surrounded by Psychopaths",
    subtitle: "Spot manipulation and protect yourself",
    short: "Psychopaths",
    emoji: "🎭",
    accent: "#b3123a",
    eyebrow: "A Thomas Erikson Workshop",
    description:
      "An educational workshop inspired by Thomas Erikson's 'Surrounded by Psychopaths'. Learn to recognise manipulation tactics and protect yourself — not a clinical or diagnostic tool.",
    heroTitle: "Not everyone<br />plays fair.",
    heroLead:
      "Some people charm, lie and manipulate to get their way. Learn to read the tactics from Thomas Erikson's <em>Surrounded by Psychopaths</em> — and defend yourself with clear eyes.",
    heroCta: "Spot the red flags",
    footerNote:
      "An educational workshop inspired by <em>Surrounded by Psychopaths</em> by Thomas Erikson. It helps you recognise manipulative behaviour and protect yourself — it is not a clinical or diagnostic tool. If you ever feel unsafe, contact local support services.",
  },

  learn: {
    kicker: "The Ideas",
    heading: "How manipulation works",
    sub: "Psychopathy sits on a spectrum, and most manipulators never break the law — they just bend people. Tap a card to go deeper.",
  },

  concepts: [
    {
      icon: "🎭",
      name: "The mask of charm",
      tag: "Why they're so easy to like at first.",
      summary:
        "Manipulators lead with charm. They're attentive, flattering and fun — until they have what they want. Psychopathy is a spectrum: a small share of people show strong traits, and many more use the same tactics occasionally.",
      points: [
        "Superficial charm is a tool, not warmth — it switches off once you're 'useful'.",
        "They mirror your interests and values to build fast, false intimacy.",
        "Early 'love-bombing' or over-the-top praise is a common opening move.",
        "The spectrum matters: this is about behaviour to watch, not labels to throw.",
      ],
    },
    {
      icon: "🧰",
      name: "The manipulation toolbox",
      tag: "The recurring tactics to recognise.",
      summary:
        "Manipulation is a small set of repeatable moves. Once you can name them, they lose most of their power over you.",
      points: [
        "<strong>Lying:</strong> smooth, confident and frequent, even when needless.",
        "<strong>Gaslighting:</strong> rewriting events so you doubt your own memory.",
        "<strong>Guilt-tripping:</strong> making their problem your fault.",
        "<strong>Flattery:</strong> praise aimed at getting something.",
        "<strong>Triangulation:</strong> pitting people against each other to stay in control.",
      ],
    },
    {
      icon: "🚩",
      name: "Warning signs",
      tag: "The pattern under the charm.",
      summary:
        "No single moment proves anything — look for the pattern over time. Manipulators are consistent in one thing: it always comes back to their advantage.",
      points: [
        "A different face in public than in private.",
        "Little genuine empathy when you're genuinely hurting.",
        "Rules apply to you, not to them.",
        "You leave interactions drained, confused, or somehow in the wrong.",
      ],
    },
    {
      icon: "🛡️",
      name: "Protect yourself",
      tag: "Distance, boundaries, records.",
      summary:
        "You rarely 'win' with a manipulator by out-arguing them. You protect yourself by becoming a poor target: predictable, boring to provoke, and hard to destabilise.",
      points: [
        "Set firm boundaries and hold them without long justifications.",
        "Keep records of important agreements and conversations.",
        "Limit the personal information you hand over — it becomes leverage.",
        "Stay connected to people you trust; isolation is the manipulator's friend.",
      ],
    },
    {
      icon: "🧠",
      name: "Why it works on you",
      tag: "They exploit your best qualities.",
      summary:
        "Manipulators target your strengths: your empathy, loyalty, guilt or desire to keep the peace. Knowing your own reflexes is half the defence.",
      points: [
        "Empathic people over-explain and give second chances — they exploit that.",
        "Conflict-avoiders cave to pressure — they lean on it.",
        "People who crave approval are moved by flattery — they supply it.",
        "Understanding your own buttons stops them being pressed.",
      ],
    },
  ],

  assessment: {
    mode: "score",
    shuffle: false,
    shuffleOptions: false,
    kicker: "Red-flag check",
    heading: "Is someone manipulating you?",
    sub: "Think of one specific person. Rate how often each statement is true of them. This is a reflective checklist, not a diagnosis.",
    nav: "Red flags",
    icon: "🚩",
    introTitle: "12 behaviour checks",
    introText: "Hold one person in mind and answer honestly about <em>their</em> behaviour. Takes about two minutes.",
    resultEyebrow: "Manipulation red-flag level",
    scaleLow: "Few red flags",
    scaleHigh: "Serious red flags",
    bands: [
      {
        min: 0,
        color: "#2a9d5c",
        label: "Low",
        title: "Few red flags",
        blurb: "Based on your answers, this person shows little manipulative behaviour. Occasional friction is normal in any relationship.",
        adviceTitle: "Keep in mind",
        advice: [
          "Everyone acts selfishly sometimes — a pattern, not a moment, is what matters.",
          "Keep communicating openly and directly.",
          "Trust your gut if that changes over time.",
        ],
      },
      {
        min: 34,
        color: "#f0a500",
        label: "Caution",
        title: "Some red flags — stay alert",
        blurb: "There's a worrying pattern here. It may not be deliberate, but it's worth protecting your boundaries and watching how it develops.",
        adviceTitle: "What to do",
        advice: [
          "Name the behaviour to yourself so it stops being confusing.",
          "Set a clear boundary on the one thing that bothers you most.",
          "Keep notes if agreements keep 'changing'.",
          "Talk it over with someone you trust outside the situation.",
        ],
      },
      {
        min: 60,
        color: "#b3123a",
        label: "High",
        title: "Serious red flags — protect yourself",
        blurb: "This pattern is consistent with sustained manipulation. The goal now is not to fix them, but to protect yourself.",
        adviceTitle: "Protect yourself",
        advice: [
          "Reduce what you share — information becomes leverage.",
          "Stop trying to win arguments; disengage instead (the 'grey rock' approach).",
          "Document important conversations and agreements in writing.",
          "Lean on trusted people, and seek professional support if you feel unsafe.",
        ],
      },
    ],
    questions: [
      "They turn on the charm to get what they want, then go cold once they have it.",
      "They lie easily and convincingly, even about small things.",
      "They twist your words until you doubt your own memory.",
      "They show little genuine empathy when you are hurting.",
      "They make you feel guilty for things that aren't your fault.",
      "They push past your boundaries even after you've said no.",
      "When confronted, they blame everyone but themselves.",
      "They seem to enjoy stirring up drama or conflict between people.",
      "Their compliments often leave you feeling unsettled or 'less than'.",
      "They show a very different face in public than in private.",
      "They rarely show real remorse after hurting someone.",
      "You feel drained, confused or manipulated after spending time with them.",
    ].map((q) => ({
      q,
      options: [
        { text: "Never", points: 0 },
        { text: "Rarely", points: 1 },
        { text: "Sometimes", points: 2 },
        { text: "Often", points: 3 },
      ],
    })),
  },

  handle: {
    kicker: "Field Guide",
    heading: "How to handle a manipulator",
    sub: "You don't beat a manipulator by out-manipulating them. You become a poor target.",
    nav: "Protect",
    cta: "Read the protection guide →",
    cards: [
      {
        icon: "✅",
        title: "Do",
        tone: "do",
        items: [
          "Trust your gut — confusion is data",
          "Set firm boundaries and hold them",
          "Keep records of key agreements",
          "Limit the personal info you share",
          "Stay close to people you trust",
        ],
      },
      {
        icon: "⛔",
        title: "Don't",
        tone: "dont",
        items: [
          "Try to 'fix' or rescue them",
          "Argue to win — you won't",
          "Hand over emotional ammunition",
          "Expect genuine empathy or remorse",
          "Let yourself be isolated",
        ],
      },
      {
        icon: "🪨",
        title: "The grey rock method",
        tone: "",
        items: [
          "Be calm, brief and boring to provoke",
          "Give short, neutral answers",
          "Don't react emotionally — that's the fuel",
          "Keep conversations practical, not personal",
          "Make yourself an uninteresting target",
        ],
      },
    ],
  },

  faq: [
    { q: "Does a high score mean the person is a psychopath?", a: "No. This is an educational reflection tool, not a diagnosis. A high score means the <em>behaviour</em> is worth taking seriously and protecting yourself from — regardless of any label." },
    { q: "Isn't everyone manipulative sometimes?", a: "Yes — most people occasionally use pressure or charm. What matters is a consistent <em>pattern</em> where it always tilts to one person's advantage and leaves the other feeling worse." },
    { q: "What exactly is gaslighting?", a: "Gaslighting is manipulating someone into doubting their own memory or perception — insisting things didn't happen, or that you're 'too sensitive', until you stop trusting yourself." },
    { q: "How common are psychopathic traits?", a: "Strong traits are relatively rare, but they sit on a spectrum. Many more people use manipulative tactics without meeting any clinical threshold. The behaviour is what you can act on." },
    { q: "Can a manipulator change?", a: "Sometimes, but only if they genuinely want to and do the work — which is uncommon. Your wellbeing shouldn't depend on waiting for it. Protect yourself in the meantime." },
    { q: "It's my boss or partner — what now?", a: "Focus on boundaries, documentation and support rather than confrontation. For close relationships or anything that feels unsafe, talk to a counsellor or local support service." },
  ],
};
