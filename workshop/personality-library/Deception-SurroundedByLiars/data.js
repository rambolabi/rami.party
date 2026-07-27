/* =============================================================================
   Surrounded by Liars — content
   Educational workshop inspired by Thomas Erikson's "Surrounded by Liars".
   Understanding deception and testing lie-detection literacy.
   Assessment mode: "quiz" (myth or fact).
   ========================================================================== */
const BOOK = {
  meta: {
    key: "liars",
    title: "Surrounded by Liars",
    subtitle: "Understand deception and read the truth",
    short: "Liars",
    emoji: "🕵️",
    accent: "#0f766e",
    eyebrow: "A Thomas Erikson Workshop",
    description:
      "An educational workshop inspired by Thomas Erikson's 'Surrounded by Liars'. Learn why people lie, bust the myths of lie detection, and test your own truth literacy.",
    heroTitle: "Everybody lies.<br />Can you tell?",
    heroLead:
      "Most of what we 'know' about spotting liars is wrong. Learn how deception really works from Thomas Erikson's <em>Surrounded by Liars</em> — and test your lie-detection literacy.",
    heroCta: "Test yourself: myth or fact?",
    footerNote:
      "An educational workshop inspired by <em>Surrounded by Liars</em> by Thomas Erikson. A tool for learning and reflection — not a way to accuse or 'prove' anyone is lying.",
  },

  learn: {
    kicker: "The Ideas",
    heading: "How deception really works",
    sub: "Lying is universal, and detecting it is far harder than folklore suggests. Tap a card to go deeper.",
  },

  concepts: [
    {
      icon: "🤥",
      name: "Why we lie",
      tag: "Almost always self-protection.",
      summary:
        "People rarely lie for the thrill of it. Most lies protect something: avoiding conflict, escaping consequences, gaining an advantage, or sparing someone's feelings. Understanding the motive is more useful than watching for twitches.",
      points: [
        "To avoid punishment or conflict.",
        "To gain an advantage or look better.",
        "To protect someone else (white lies).",
        "Motive tells you more than any 'tell'.",
      ],
    },
    {
      icon: "🧬",
      name: "The anatomy of a lie",
      tag: "Small lies grow.",
      summary:
        "Deception tends to escalate. A small lie needs a second to cover it, then a third — and each one raises the cost of the truth. Cultures and relationships slide into dishonesty one convenient step at a time.",
      points: [
        "One lie usually needs another to support it.",
        "Each lie raises the price of coming clean.",
        "Small, 'harmless' lies normalise bigger ones.",
        "Environments that punish honesty breed lying.",
      ],
    },
    {
      icon: "🕵️",
      name: "Myths of detection",
      tag: "Body language rarely tells.",
      summary:
        "Almost everything folklore teaches about spotting liars is unreliable. Averted eyes, fidgeting and nervousness are signs of stress, not proof of lying — and skilled liars often do the opposite.",
      points: [
        "Eye contact and fidgeting don't reliably reveal lies.",
        "Even trained observers barely beat chance on body language.",
        "Nervous honest people look 'guilty' too.",
        "Polygraphs are far from the infallible 'lie detectors' of fiction.",
      ],
    },
    {
      icon: "✅",
      name: "What actually helps",
      tag: "Listen, don't stare.",
      summary:
        "The better cues are verbal and contextual: inconsistencies over time, vague or shifting stories, and whether the account holds up against known facts. Rapport and open questions reveal far more than accusation.",
      points: [
        "Focus on the content and consistency of the story.",
        "Compare it against facts you can verify.",
        "Ask open questions and let people talk.",
        "Consider motive and context, not micro-gestures.",
      ],
    },
    {
      icon: "🤝",
      name: "Building a truth culture",
      tag: "Make honesty the easy choice.",
      summary:
        "The best defence against lies is an environment where the truth is safe to tell. When honesty isn't punished, people have far less reason to deceive in the first place.",
      points: [
        "Don't shoot the messenger — reward honesty.",
        "Make it safe to admit mistakes.",
        "Model the truthfulness you want to see.",
        "Reduce the pressures that make lying tempting.",
      ],
    },
  ],

  assessment: {
    mode: "quiz",
    shuffleOptions: false,
    kicker: "Myth or fact?",
    heading: "Test your lie-detection literacy",
    sub: "Ten common beliefs about lying. Decide whether each is a myth or a fact — then see what the research really says.",
    nav: "Test",
    icon: "🕵️",
    introTitle: "10 myth-or-fact questions",
    introText: "For each statement, choose <em>Myth</em> or <em>Fact</em>. You'll get the correct answer and a short explanation at the end.",
    resultEyebrow: "Your lie-detection literacy",
    bands: [
      { min: 0, color: "#b3123a", label: "Myth-led", title: "Fooled by folklore", blurb: "Most of your instincts follow the popular myths — which is exactly how good liars slip past people. The good news: the science is learnable." },
      { min: 50, color: "#f0a500", label: "Getting sharper", title: "On the right track", blurb: "You've shed some of the myths but a few classics still trip you up. Focus on verbal content and motive over body language." },
      { min: 80, color: "#2a9d5c", label: "Truth-savvy", title: "Truth-savvy", blurb: "You see past the body-language folklore and focus on what actually works: consistency, facts and motive. Hard to fool." },
    ],
    questions: [
      { q: "\"Liars avoid eye contact.\"", explain: "Myth. Many liars deliberately hold <em>more</em> eye contact to seem sincere. Eye contact reveals almost nothing about honesty.",
        options: [ { text: "Myth", correct: true }, { text: "Fact" } ] },
      { q: "\"You can reliably spot a liar from body language alone.\"", explain: "Myth. Even trained professionals barely beat chance using body language. There is no reliable 'tell'.",
        options: [ { text: "Myth", correct: true }, { text: "Fact" } ] },
      { q: "\"Fidgeting and nervousness prove someone is lying.\"", explain: "Myth. Those are signs of <em>stress</em>. Honest but anxious people fidget too, and calm liars often don't.",
        options: [ { text: "Myth", correct: true }, { text: "Fact" } ] },
      { q: "\"The content of what someone says reveals more than how they move.\"", explain: "Fact. Verbal cues — inconsistencies, vagueness, contradictions with known facts — are far more useful than physical 'tells'.",
        options: [ { text: "Fact", correct: true }, { text: "Myth" } ] },
      { q: "\"Polygraph 'lie detectors' are accurate and accepted everywhere.\"", explain: "Myth. Polygraphs measure arousal, not lies, produce many errors, and are inadmissible in many courts.",
        options: [ { text: "Myth", correct: true }, { text: "Fact" } ] },
      { q: "\"Looking up and to one side proves someone is lying.\"", explain: "Myth. The 'eye-direction' idea from pop psychology has been repeatedly debunked.",
        options: [ { text: "Myth", correct: true }, { text: "Fact" } ] },
      { q: "\"Small lies tend to lead to bigger ones.\"", explain: "Fact. Deception escalates — one lie needs another to cover it, and each raises the cost of the truth.",
        options: [ { text: "Fact", correct: true }, { text: "Myth" } ] },
      { q: "\"A confident, fluent speaker can't be lying.\"", explain: "Myth. Practised liars are often smooth and confident — fluency is not honesty.",
        options: [ { text: "Myth", correct: true }, { text: "Fact" } ] },
      { q: "\"Asking open questions and building rapport reveals more than accusing.\"", explain: "Fact. Letting people talk exposes inconsistencies; accusation just makes everyone defensive.",
        options: [ { text: "Fact", correct: true }, { text: "Myth" } ] },
      { q: "\"Thinking about motive — why would they lie? — beats watching for twitches.\"", explain: "Fact. Context and motive are among the most useful cues; isolated gestures are noise.",
        options: [ { text: "Fact", correct: true }, { text: "Myth" } ] },
    ],
  },

  assessment2: {
    mode: "classify",
    kicker: "Second assessment",
    heading: "The path of lies",
    sub: "Deception escalates in stages. Think of a specific situation and see how far along the path it has travelled.",
    nav: "The path",
    icon: "\uD83E\uDDEC",
    introTitle: "8 observations",
    introText: "Hold one situation in mind and choose the option that fits it best.",
    resultEyebrow: "How far the deception has escalated",
    categories: {
      white: {
        name: "The White Lie", icon: "\uD83D\uDD4A\uFE0F", color: "#64748b",
        summary: "Harmless social lies that smooth everyday life. Not a problem in themselves — but the doorway the others walk through.",
        signsTitle: "What it looks like", handleTitle: "What to do now",
        signs: ["Small, kind fibs", "No real cost to the truth", "Occasional and social", "Trust intact"],
        handle: ["Don't over-police normal social grace", "Model honesty where it matters", "Notice if 'harmless' starts creeping", "Keep the truth cheap to tell"],
      },
      cover: {
        name: "The Cover-Up", icon: "\uD83E\uDDE5", color: "#0891b2",
        summary: "A lie to hide a specific mistake or avoid a consequence. Still contained — but this is where escalation begins.",
        signsTitle: "What it looks like", handleTitle: "What to do now",
        signs: ["Hiding one specific thing", "Motive is avoiding fallout", "A single crack in trust", "Doubles down if cornered"],
        handle: ["Make it safe to own the mistake", "Address the fear driving the lie", "Catch it before it needs a second lie", "Don't punish the honesty you want"],
      },
      web: {
        name: "The Web", icon: "\uD83D\uDD78\uFE0F", color: "#b45309",
        summary: "Lies multiplying to support each other. Each new lie raises the cost of the truth, and the story starts to run the person.",
        signsTitle: "What it looks like", handleTitle: "What to do now",
        signs: ["Lies propping up lies", "Constant, to stay consistent", "Trust seriously eroded", "Adds a lie when challenged"],
        handle: ["Offer a clear, low-drama off-ramp to the truth", "Reduce the punishment for coming clean", "Create safety instead of playing detective", "Expect it to worsen before it improves"],
      },
      culture: {
        name: "The Culture of Lies", icon: "\uD83C\uDFAD", color: "#b91c1c",
        summary: "Dishonesty has become normal — systemic, expected, even rewarded. The problem is the environment, not one person.",
        signsTitle: "What it looks like", handleTitle: "What to do now",
        signs: ["Lying is the norm", "Honesty seen as naive", "Trust basically gone", "A whole team or system involved"],
        handle: ["Change what gets rewarded and punished", "Protect and celebrate honesty publicly", "Model it relentlessly from the top", "Reduce the pressures that make lying pay"],
      },
    },
    questions: [
      { q: "The lies you're seeing are…", options: [
        { text: "Small and socially smoothing", cat: "white" },
        { text: "Aimed at hiding a specific mistake", cat: "cover" },
        { text: "Multiplying to prop each other up", cat: "web" },
        { text: "Everywhere — it's just how things run here", cat: "culture" },
      ]},
      { q: "The motive seems to be…", options: [
        { text: "Sparing feelings", cat: "white" },
        { text: "Avoiding consequences", cat: "cover" },
        { text: "Protecting earlier lies", cat: "web" },
        { text: "Getting ahead in a dishonest system", cat: "culture" },
      ]},
      { q: "The cost of the truth now is…", options: [
        { text: "Basically nothing", cat: "white" },
        { text: "A bit of embarrassment", cat: "cover" },
        { text: "Unravelling a whole story", cat: "web" },
        { text: "Your standing in the group", cat: "culture" },
      ]},
      { q: "How often does it happen?", options: [
        { text: "Occasionally and harmlessly", cat: "white" },
        { text: "When they're cornered", cat: "cover" },
        { text: "Constantly, to stay consistent", cat: "web" },
        { text: "It's the norm, not the exception", cat: "culture" },
      ]},
      { q: "If challenged, they…", options: [
        { text: "Admit it with a laugh", cat: "white" },
        { text: "Double down to save face", cat: "cover" },
        { text: "Add another lie", cat: "web" },
        { text: "Act like honesty is naive", cat: "culture" },
      ]},
      { q: "The effect on trust is…", options: [
        { text: "None to speak of", cat: "white" },
        { text: "A small crack", cat: "cover" },
        { text: "Seriously eroded", cat: "web" },
        { text: "Trust is basically gone", cat: "culture" },
      ]},
      { q: "Who is involved?", options: [
        { text: "Just a kind fib", cat: "white" },
        { text: "One person hiding one thing", cat: "cover" },
        { text: "One person tangled in many lies", cat: "web" },
        { text: "A whole team or system", cat: "culture" },
      ]},
      { q: "The honest path now needs…", options: [
        { text: "Nothing — it's fine", cat: "white" },
        { text: "A quick, low-stakes admission", cat: "cover" },
        { text: "Untangling several lies at once", cat: "web" },
        { text: "Changing the whole environment", cat: "culture" },
      ]},
    ],
  },

  handle: {
    kicker: "Field Guide",
    heading: "How to get closer to the truth",
    sub: "You can't 'catch' liars by staring harder. You get closer to the truth by listening better.",
    nav: "Get the truth",
    cta: "Read the truth-seeking guide →",
    cards: [
      { icon: "✅", title: "Do", tone: "do", items: [
        "Listen to the story, not the twitches", "Compare accounts against known facts", "Ask open questions and let people talk", "Consider motive and context", "Give honesty a safe place to land",
      ]},
      { icon: "⛔", title: "Don't", tone: "dont", items: [
        "Trust eye contact or fidgeting as proof", "Rely on gut 'lie detector' feelings", "Accuse before you understand", "Punish the messenger", "Treat nervousness as guilt",
      ]},
      { icon: "🤝", title: "The truth-friendly talk", tone: "", items: [
        "Open calmly, without a verdict", "Ask them to tell it in their own words", "Follow up on gaps and contradictions", "Reassure that honesty is safe", "Weigh the whole picture, not one moment",
      ]},
    ],
  },

  faq: [
    { q: "So there's no reliable way to spot a liar?", a: "No single 'tell' works. The best approach combines verbal content, consistency with facts, and motive over time — not body-language folklore." },
    { q: "Why do the myths persist?", a: "They're intuitive and endlessly repeated in film and TV. But research consistently shows people — including professionals — barely beat chance using them." },
    { q: "Are polygraphs useless?", a: "They measure physiological arousal, not deception. They produce significant error rates and are inadmissible in many legal systems, so they're far from the infallible devices of fiction." },
    { q: "Isn't some lying normal?", a: "Yes — small social lies smooth everyday life. The concern is escalation: when lies compound, or when a culture makes honesty unsafe." },
    { q: "How do I stop people lying to me?", a: "Make the truth safe. When honesty isn't punished and mistakes can be admitted, people have far less reason to deceive." },
    { q: "Can I use this to prove someone lied?", a: "No. This is an educational tool about how deception works, not a method to accuse or 'prove' anything about a real person." },
  ],

  disc: {
    kicker: "The Four Colours",
    heading: "Lying and the four colours",
    sub: "Each DISC colour bends the truth in its own style. Know the tell — and your own.",
    nav: "Colours",
    labels: { relate: "How this colour tends to lie", reflect: "If this is you — self-check", treat: "How to get the truth from them" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Explore the DISC colour workshop →",
    colors: {
      red: {
        relate: "Reds lie by bulldozing — bold overstatement and 'just trust me' to win and move on.",
        reflect: "Check whether your confidence is outrunning the actual facts.",
        treat: "Ask for specifics and evidence; don't be steamrolled by sheer certainty.",
      },
      yellow: {
        relate: "Yellows exaggerate and embellish to look good and keep the story exciting.",
        reflect: "Notice when a better story is quietly replacing the true one.",
        treat: "Enjoy the tale, then gently check the details against reality.",
      },
      green: {
        relate: "Greens tell peace-keeping lies — saying yes to avoid a conflict they don't actually accept.",
        reflect: "Ask whether your 'yes' is honest, or just avoiding a hard moment.",
        treat: "Make it safe to disagree so their real answer can surface.",
      },
      blue: {
        relate: "Blues rarely lie outright but may mislead by omission or hide behind technicalities.",
        reflect: "Check whether precise wording is concealing the fuller truth.",
        treat: "Ask complete, specific questions — they tend to answer exactly what you ask.",
      },
    },
  },
};
