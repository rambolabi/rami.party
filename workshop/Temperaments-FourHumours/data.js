/* =============================================================================
   The Four Temperaments — content
   Educational workshop on the classical four temperaments (Hippocrates / Galen)
   and how they map onto modern models. Assessment mode: "classify" (four types).
   ========================================================================== */
const BOOK = {
  meta: {
    key: "temperaments",
    title: "The Four Temperaments",
    subtitle: "The oldest personality map — and how it still fits",
    short: "Temperaments",
    emoji: "🌡️",
    accent: "#9333ea",
    eyebrow: "A Classic Framework",
    description:
      "An educational workshop on the four classical temperaments — sanguine, choleric, melancholic and phlegmatic — and how they map onto DISC and modern models.",
    heroTitle: "The 2,000-year-old<br />personality map.",
    heroLead:
      "Long before modern psychology, the ancients sorted people into four <em>temperaments</em>: sanguine, choleric, melancholic and phlegmatic. Remarkably, they still ring true. Find yours.",
    heroCta: "Find your temperament",
    footerNote:
      "An educational workshop on the classical four temperaments (Hippocrates and Galen). A historical lens for reflection — the old 'humours' biology is long discredited, but the behavioural patterns endure.",
    footerSupport:
      "The four temperaments are the ancestor of many modern models, including DISC. Explore the others in <strong>The People Library</strong>.",
  },

  learn: {
    kicker: "The Ideas",
    heading: "Four flavours of human nature",
    sub: "The four temperaments are the great-grandparent of DISC and the Big Five. Tap a card to go deeper.",
  },

  concepts: [
    {
      icon: "🏛️", name: "Ancient origins", tag: "Hippocrates & Galen.",
      summary: "Over two thousand years ago, Greek physicians linked personality to four bodily 'humours'. The biology was wrong, but the four behavioural patterns they described were sharp — and they've echoed through every personality model since.",
      points: ["Proposed by Hippocrates, developed by Galen.", "The 'humours' biology is discredited.", "The behavioural patterns endured anyway.", "The direct ancestor of DISC and others."],
    },
    {
      icon: "🎭", name: "The four temperaments", tag: "Sanguine, choleric, melancholic, phlegmatic.",
      summary: "Sanguine (sociable and lively), choleric (driven and fiery), melancholic (deep and careful), and phlegmatic (calm and steady). Most people are a blend, with one or two leading.",
      points: ["<strong>Sanguine</strong> — outgoing, cheerful, sociable.", "<strong>Choleric</strong> — bold, driven, decisive.", "<strong>Melancholic</strong> — thoughtful, precise, deep.", "<strong>Phlegmatic</strong> — calm, patient, steady."],
    },
    {
      icon: "🔗", name: "The modern map", tag: "It became DISC.",
      summary: "The four temperaments map almost one-to-one onto the DISC colours: choleric→Red, sanguine→Yellow, phlegmatic→Green, melancholic→Blue. Understanding one deepens the other.",
      points: ["Choleric ≈ DISC Red (Dominance).", "Sanguine ≈ DISC Yellow (Influence).", "Phlegmatic ≈ DISC Green (Steadiness).", "Melancholic ≈ DISC Blue (Conscientiousness)."],
    },
    {
      icon: "🌗", name: "Everyone's a blend", tag: "One or two lead.",
      summary: "Almost nobody is a pure temperament. You'll usually have a dominant one and a supporting one, and the mix is what makes you you. The pairs can even balance each other's weaknesses.",
      points: ["Pure single temperaments are rare.", "A dominant plus a secondary is typical.", "Opposite blends can balance nicely.", "The combination is the real portrait."],
    },
    {
      icon: "🤝", name: "Using it with people", tag: "Old wisdom, still handy.",
      summary: "The temperaments are a quick, memorable way to read a room: energise the sanguine, get to the point with the choleric, reassure the melancholic's need for accuracy, and be patient with the phlegmatic.",
      points: ["Sanguine: keep it warm and fun.", "Choleric: be brief and results-focused.", "Melancholic: give detail and quality.", "Phlegmatic: be patient and steady."],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Self-assessment",
    heading: "Which temperament are you?",
    sub: "Answer for how you generally are, and we'll estimate your leading temperament.",
    nav: "Find yours",
    icon: "🌡️",
    introTitle: "10 questions",
    introText: "Pick the option that fits <em>you</em> best most of the time.",
    resultEyebrow: "Your leading temperament",
    categories: {
      sanguine: { name: "Sanguine", icon: "🎈", color: "#f0a500",
        summary: "Sociable, lively and optimistic — you love people, fun and new experiences. Warm and spontaneous, though sometimes scattered. (DISC Yellow.)",
        signsTitle: "You tend to be", handleTitle: "How to work with you",
        signs: ["Outgoing and cheerful", "Talkative and spontaneous", "Optimistic and warm", "Easily bored by detail"],
        handle: ["Keep it warm and social", "Let them talk and shine", "Give recognition", "Help with structure and follow-through"] },
      choleric: { name: "Choleric", icon: "🔥", color: "#b91c1c",
        summary: "Bold, driven and decisive — you take charge and pursue goals hard. Confident and quick, though sometimes impatient or blunt. (DISC Red.)",
        signsTitle: "You tend to be", handleTitle: "How to work with you",
        signs: ["Ambitious and decisive", "Direct and competitive", "Quick to act", "Impatient with delays"],
        handle: ["Be brief and to the point", "Focus on results", "Offer options and let them choose", "Don't waste their time"] },
      melancholic: { name: "Melancholic", icon: "🌧️", color: "#2563eb",
        summary: "Thoughtful, precise and deep — you value quality, accuracy and meaning. Careful and loyal, though prone to over-thinking. (DISC Blue.)",
        signsTitle: "You tend to be", handleTitle: "How to work with you",
        signs: ["Analytical and careful", "High standards", "Deep and reflective", "Prone to over-thinking"],
        handle: ["Give detail and accuracy", "Respect their standards", "Allow time to consider", "Avoid rushing or vagueness"] },
      phlegmatic: { name: "Phlegmatic", icon: "🍃", color: "#2a9d5c",
        summary: "Calm, patient and steady — you're the peaceful, dependable presence who keeps things balanced. Loyal and easy-going, though change-averse. (DISC Green.)",
        signsTitle: "You tend to be", handleTitle: "How to work with you",
        signs: ["Calm and even-tempered", "Patient and reliable", "Peaceful and accommodating", "Reluctant about change"],
        handle: ["Be patient and personal", "Give reassurance and stability", "Introduce change gradually", "Appreciate their steadiness"] },
    },
    questions: [
      { q: "At a social gathering you're…", options: [
        { text: "Chatting happily with everyone", cat: "sanguine" },
        { text: "Steering the group or the plan", cat: "choleric" },
        { text: "In a deep talk with one person", cat: "melancholic" },
        { text: "Relaxed and going with the flow", cat: "phlegmatic" } ] },
      { q: "Your pace is…", options: [
        { text: "Fast and lively", cat: "sanguine" },
        { text: "Fast and forceful", cat: "choleric" },
        { text: "Careful and measured", cat: "melancholic" },
        { text: "Slow and steady", cat: "phlegmatic" } ] },
      { q: "You care most about…", options: [
        { text: "Fun and people", cat: "sanguine" },
        { text: "Results and winning", cat: "choleric" },
        { text: "Quality and accuracy", cat: "melancholic" },
        { text: "Peace and stability", cat: "phlegmatic" } ] },
      { q: "Your weak spot is…", options: [
        { text: "Getting scattered", cat: "sanguine" },
        { text: "Being impatient", cat: "choleric" },
        { text: "Over-thinking", cat: "melancholic" },
        { text: "Avoiding change", cat: "phlegmatic" } ] },
      { q: "Making decisions, you…", options: [
        { text: "Go on gut and enthusiasm", cat: "sanguine" },
        { text: "Decide fast and firmly", cat: "choleric" },
        { text: "Analyse thoroughly first", cat: "melancholic" },
        { text: "Take your time, seek consensus", cat: "phlegmatic" } ] },
      { q: "Under stress you get…", options: [
        { text: "Disorganised and distracted", cat: "sanguine" },
        { text: "Demanding and sharp", cat: "choleric" },
        { text: "Withdrawn and critical", cat: "melancholic" },
        { text: "Quiet and stubborn", cat: "phlegmatic" } ] },
      { q: "People would call you…", options: [
        { text: "Fun and outgoing", cat: "sanguine" },
        { text: "Driven and bold", cat: "choleric" },
        { text: "Deep and precise", cat: "melancholic" },
        { text: "Calm and dependable", cat: "phlegmatic" } ] },
      { q: "Your ideal work is…", options: [
        { text: "Social and varied", cat: "sanguine" },
        { text: "Challenging with autonomy", cat: "choleric" },
        { text: "Detailed and high-quality", cat: "melancholic" },
        { text: "Stable and harmonious", cat: "phlegmatic" } ] },
      { q: "In conversation you…", options: [
        { text: "Talk a lot and tell stories", cat: "sanguine" },
        { text: "Get straight to the point", cat: "choleric" },
        { text: "Choose your words carefully", cat: "melancholic" },
        { text: "Listen more than you speak", cat: "phlegmatic" } ] },
      { q: "Change and risk feel…", options: [
        { text: "Exciting", cat: "sanguine" },
        { text: "Worth it for the win", cat: "choleric" },
        { text: "Best analysed first", cat: "melancholic" },
        { text: "Unsettling — I prefer stability", cat: "phlegmatic" } ] },
    ],
  },

  handle: {
    kicker: "Put it to work",
    heading: "Working with each temperament",
    sub: "Ancient wisdom, still surprisingly practical for reading a room.",
    nav: "Apply",
    cta: "See the full DISC colour link →",
    cards: [
      { icon: "🎈", title: "With a Sanguine", tone: "do", items: [
        "Keep it warm, fun and social", "Let them talk and be seen", "Give recognition and variety", "Help them with detail and structure",
      ]},
      { icon: "🔥", title: "With a Choleric", tone: "", items: [
        "Be brief and direct", "Focus on results and goals", "Offer choices, let them decide", "Don't waste their time",
      ]},
      { icon: "🌧️", title: "With a Melancholic / Phlegmatic", tone: "dont", items: [
        "Melancholic: give detail, accuracy and time", "Melancholic: respect their high standards", "Phlegmatic: be patient and reassuring", "Phlegmatic: introduce change gently",
      ]},
    ],
  },

  faq: [
    { q: "Isn't the 'four humours' idea debunked?", a: "The biology — that personality comes from blood, bile and phlegm — is completely discredited. But the four <em>behavioural</em> patterns the ancients described proved remarkably durable and feed into modern models." },
    { q: "How does this relate to DISC?", a: "Almost directly: choleric→Red, sanguine→Yellow, phlegmatic→Green, melancholic→Blue. The temperaments are effectively DISC's ancestor. See the colour cross-link below." },
    { q: "Can I be more than one?", a: "Yes — almost everyone is a blend with one or two leading temperaments. The result shows your strongest plus the balance." },
    { q: "Is one temperament better?", a: "No. Each has clear strengths and characteristic weaknesses; they balance each other in teams and relationships." },
    { q: "Why learn an ancient model at all?", a: "It's simple, memorable and maps cleanly onto modern tools — a friendly on-ramp to reading people, and a reminder that human nature is remarkably consistent." },
    { q: "Can my temperament change?", a: "Your core leaning is fairly stable, but life experience, growth and context all shape how it shows up." },
  ],

  disc: {
    kicker: "Cross-link",
    heading: "Temperaments and the DISC colours",
    sub: "The four temperaments map almost one-to-one onto the four DISC colours.",
    nav: "Colours",
    labels: { relate: "Matching temperament", reflect: "Growth edge", treat: "How to meet them" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Explore the full DISC colour workshop →",
    colors: {
      red: { relate: "Choleric — bold, driven, decisive.", reflect: "Grow patience and empathy.", treat: "Be brief, direct and results-focused." },
      yellow: { relate: "Sanguine — sociable, lively, optimistic.", reflect: "Grow focus and follow-through.", treat: "Be warm, social and give recognition." },
      green: { relate: "Phlegmatic — calm, patient, steady.", reflect: "Grow assertiveness and openness to change.", treat: "Be patient, personal and reassuring." },
      blue: { relate: "Melancholic — deep, precise, careful.", reflect: "Grow flexibility; ease the over-thinking.", treat: "Give detail, accuracy and time to think." },
    },
  },
};
