/* =============================================================================
   The Big Five (OCEAN) — content
   Educational workshop on the most research-backed model of personality.
   Assessment mode: "profile" (five independent trait meters).
   ========================================================================== */
const BOOK = {
  meta: {
    key: "bigfive",
    title: "The Big Five",
    subtitle: "The science-backed map of personality (OCEAN)",
    short: "Big Five",
    emoji: "🧬",
    accent: "#2563eb",
    eyebrow: "A Personality Framework",
    description:
      "An educational workshop on the Big Five (OCEAN) — the most scientifically respected model of personality. Measure your five traits and learn to read others.",
    heroTitle: "Five dials that<br />describe everyone.",
    heroLead:
      "Forget boxes and types. The <em>Big Five</em> is the most research-backed model in psychology — five independent traits, each a spectrum you sit somewhere along. Find your profile.",
    heroCta: "Measure your five traits",
    footerNote:
      "An educational workshop on the Big Five (OCEAN) model. A short self-report is a mirror for reflection, not a clinical assessment.",
    footerSupport:
      "The Big Five is the most research-backed model of personality (the OCEAN traits). Explore the other frameworks in <strong>The People Library</strong> to see how they connect.",
  },

  learn: {
    kicker: "The Ideas",
    heading: "Personality, measured",
    sub: "The Big Five emerged from decades of research as the five dimensions that best describe how people differ. Tap a card to go deeper.",
  },

  concepts: [
    {
      icon: "🧬",
      name: "The most trusted model",
      tag: "Built from evidence, not intuition.",
      summary:
        "Unlike type systems, the Big Five was discovered statistically — by analysing the words we use to describe people across languages and cultures. It's the model academic psychology relies on because it predicts real-world outcomes and stays stable over time.",
      points: [
        "Derived from data, not one person's theory.",
        "Replicates across cultures and languages.",
        "Predicts outcomes like health, work and relationships.",
        "The scientific benchmark other tests are measured against.",
      ],
    },
    {
      icon: "🎚️",
      name: "Traits are spectrums",
      tag: "Not boxes — dials.",
      summary:
        "You're not one 'type'. On each of the five traits you sit somewhere on a sliding scale, usually near the middle. There's no good or bad end — each has strengths and trade-offs depending on the situation.",
      points: [
        "Everyone has all five traits, to different degrees.",
        "Most people are mid-range on most traits.",
        "No end of a trait is 'better' — context decides.",
        "Your profile is the combination, not any single score.",
      ],
    },
    {
      icon: "🔤",
      name: "The five traits (OCEAN)",
      tag: "Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism.",
      summary:
        "The five capture curiosity, discipline, sociability, warmth and emotional sensitivity. Together they sketch a rich, flexible picture of how someone thinks, works and connects.",
      points: [
        "<strong>O</strong>penness — curiosity, imagination, love of the new.",
        "<strong>C</strong>onscientiousness — organisation, discipline, reliability.",
        "<strong>E</strong>xtraversion — sociability, energy from people.",
        "<strong>A</strong>greeableness — warmth, trust, cooperation.",
        "<strong>N</strong>euroticism — sensitivity to stress and negative emotion.",
      ],
    },
    {
      icon: "🔄",
      name: "Traits vs. states",
      tag: "Stable, but not fixed.",
      summary:
        "Traits are fairly stable, but they drift gradually across life — most people grow more conscientious and agreeable and less neurotic with age. And in any moment your behaviour flexes with the situation.",
      points: [
        "Traits shift slowly over years, not overnight.",
        "You can act out of character when it matters.",
        "Growth is normal — you're not stuck with a score.",
        "Behaviour = trait + situation.",
      ],
    },
    {
      icon: "🤝",
      name: "Using it with people",
      tag: "Read the dials, adapt.",
      summary:
        "Once you can estimate someone's traits, you can meet them better: give detail to the conscientious, space to the introvert, warmth to the agreeable, and calm to the highly sensitive.",
      points: [
        "High conscientiousness: give structure and clear plans.",
        "Low extraversion: allow quiet and one-to-one contact.",
        "High neuroticism: offer reassurance and steadiness.",
        "High openness: bring ideas, novelty and the big picture.",
      ],
    },
  ],

  assessment: {
    mode: "profile",
    kicker: "Self-assessment",
    heading: "Find your Big Five profile",
    sub: "Rate how much you agree with each statement. Fifteen quick items give you a reading on all five traits.",
    nav: "Measure",
    icon: "🎚️",
    introTitle: "15 statements",
    introText: "Answer honestly and instinctively about how you generally are. Takes about two minutes.",
    resultEyebrow: "Your five-trait profile",
    resultTitle: "Your Big Five profile",
    resultBlurb: "Five independent spectrums. There's no 'best' profile — only yours. Higher isn't better; each end has its strengths.",
    traitOrder: ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"],
    traits: {
      openness: { name: "Openness", icon: "🌈", color: "#2563eb",
        high: "You're curious, imaginative and drawn to new ideas, art and experiences. You may get bored by routine.",
        low: "You're practical, grounded and prefer the familiar and proven. You may resist change for its own sake.",
        mid: "You balance curiosity with practicality — open to new ideas but happy with what works." },
      conscientiousness: { name: "Conscientiousness", icon: "🎯", color: "#0891b2",
        high: "You're organised, disciplined and reliable. Watch for perfectionism and rigidity.",
        low: "You're flexible and spontaneous, but may struggle with structure, deadlines and follow-through.",
        mid: "You can be organised when it matters without being ruled by rules." },
      extraversion: { name: "Extraversion", icon: "☀️", color: "#f0a500",
        high: "You're sociable, energetic and draw energy from people. Quiet or alone time can drain you.",
        low: "You're more reserved and reflective, recharging in calm and solitude. Big social settings can tire you.",
        mid: "You enjoy people and solitude in roughly equal measure — an ambivert." },
      agreeableness: { name: "Agreeableness", icon: "🤝", color: "#2a9d5c",
        high: "You're warm, trusting and cooperative. Watch that you don't neglect your own needs or avoid conflict.",
        low: "You're direct, competitive and sceptical — great for tough calls, but you can seem blunt or cold.",
        mid: "You balance warmth with honesty, cooperating without being a pushover." },
      neuroticism: { name: "Neuroticism", icon: "🌊", color: "#db2777",
        high: "You feel emotions intensely and are sensitive to stress. That brings empathy and awareness, but also worry.",
        low: "You're emotionally steady and calm under pressure. Just make sure you still tune in to real risks and feelings.",
        mid: "You feel stress like anyone but generally keep your balance." },
    },
    questions: [
      { q: "I enjoy trying new things, ideas and experiences.", trait: "openness" },
      { q: "I have a vivid imagination and love exploring ideas.", trait: "openness" },
      { q: "I prefer familiar routine over variety and change.", trait: "openness", reverse: true },
      { q: "I like to keep things organised and planned.", trait: "conscientiousness" },
      { q: "I follow through reliably on what I commit to.", trait: "conscientiousness" },
      { q: "I often leave things until the last minute.", trait: "conscientiousness", reverse: true },
      { q: "I feel energised when I'm around lots of people.", trait: "extraversion" },
      { q: "I find it easy to start conversations with strangers.", trait: "extraversion" },
      { q: "I prefer quiet time alone to big social events.", trait: "extraversion", reverse: true },
      { q: "I go out of my way to help and cooperate with others.", trait: "agreeableness" },
      { q: "I generally trust people and assume good intentions.", trait: "agreeableness" },
      { q: "I can be blunt and put my own needs first.", trait: "agreeableness", reverse: true },
      { q: "I worry about things quite a lot.", trait: "neuroticism" },
      { q: "My mood can shift quickly and strongly.", trait: "neuroticism" },
      { q: "I stay calm and steady under pressure.", trait: "neuroticism", reverse: true },
    ],
  },

  handle: {
    kicker: "Put it to work",
    heading: "Reading and meeting people",
    sub: "The point of the Big Five isn't a label — it's flexing to meet people where they are.",
    nav: "Apply",
    cta: "See how it links to DISC colours →",
    cards: [
      { icon: "🧭", title: "Read the dials", tone: "do", items: [
        "Notice energy: outgoing vs. reserved (E)", "Notice order: planned vs. spontaneous (C)", "Notice openness to new ideas (O)", "Notice warmth vs. bluntness (A)", "Notice stress sensitivity (N)",
      ]},
      { icon: "💪", title: "Play to strengths", tone: "", items: [
        "Give the conscientious clear structure", "Give the open novelty and vision", "Give the extravert people and buzz", "Give the agreeable a cooperative feel", "Give the sensitive calm and reassurance",
      ]},
      { icon: "⚖️", title: "Bridge differences", tone: "dont", items: [
        "Don't force an introvert to 'perform'", "Don't drown a spontaneous person in process", "Don't dismiss a sensitive person as 'too much'", "Don't read bluntness as personal dislike", "Adapt your style, don't demand they change",
      ]},
    ],
  },

  faq: [
    { q: "Is the Big Five better than Myers-Briggs?", a: "Scientifically, yes. The Big Five is built from data, measures spectrums rather than boxes, and is more reliable and predictive. MBTI is popular and intuitive but far weaker as a measurement. Both can be useful for reflection." },
    { q: "Can my traits change?", a: "Slowly. Traits are stable over months but drift across life — most people become more conscientious and agreeable and less neurotic with age. Deliberate effort can shift them too." },
    { q: "Is a high or low score better?", a: "Neither. Each end of every trait has strengths and trade-offs depending on the situation. High conscientiousness helps you finish; low helps you adapt. It's about fit, not ranking." },
    { q: "What is neuroticism, really?", a: "It's simply how sensitive you are to stress and negative emotion. High isn't a flaw — it comes with empathy and vigilance. Low brings calm but can miss real risks." },
    { q: "How accurate is a 15-item quiz?", a: "It's a quick indicator, not a validated clinical instrument. It's enough to spark useful reflection; full research scales use many more items." },
    { q: "How does this relate to the DISC colours?", a: "They overlap: DISC's Red maps loosely to low agreeableness + high extraversion/drive, Yellow to high extraversion + openness, Green to high agreeableness + low neuroticism, Blue to high conscientiousness. See the DISC workshop for more." },
  ],

  disc: {
    kicker: "Cross-link",
    heading: "The Big Five and the DISC colours",
    sub: "The two models overlap. Here's roughly how each DISC colour maps onto the five traits.",
    nav: "Colours",
    labels: { relate: "Typical Big Five leaning", reflect: "Growth edge", treat: "How to meet them" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Explore the DISC colour workshop →",
    colors: {
      red: {
        relate: "Lower agreeableness, higher drive and assertiveness — direct and results-focused.",
        reflect: "Grow warmth and patience; not every moment is a competition.",
        treat: "Be brief, factual and outcome-focused.",
      },
      yellow: {
        relate: "High extraversion and openness — sociable, enthusiastic, idea-driven.",
        reflect: "Grow conscientiousness: follow through on the details.",
        treat: "Be warm, social and give recognition.",
      },
      green: {
        relate: "High agreeableness, lower neuroticism — warm, steady, cooperative.",
        reflect: "Grow assertiveness: state your own needs too.",
        treat: "Be patient, personal and reassuring.",
      },
      blue: {
        relate: "High conscientiousness, more reserved — precise, careful, quality-driven.",
        reflect: "Grow flexibility; don't let standards tip into rigidity.",
        treat: "Bring detail, accuracy and time to think.",
      },
    },
  },
};
