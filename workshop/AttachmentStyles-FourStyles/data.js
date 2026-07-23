/* =============================================================================
   Attachment Styles — content
   Educational workshop on the four adult attachment styles (Bowlby / Ainsworth).
   Assessment mode: "classify" (four styles).
   ========================================================================== */
const BOOK = {
  meta: {
    key: "attachment",
    title: "Attachment Styles",
    subtitle: "How you bond, love and handle closeness",
    short: "Attachment",
    emoji: "🔗",
    accent: "#0d9488",
    eyebrow: "A Relationship Framework",
    description:
      "An educational workshop on the four adult attachment styles. Discover how you relate to closeness and how to move toward secure connection.",
    heroTitle: "How do you do<br />closeness?",
    heroLead:
      "The way you bonded as a child shapes how you love as an adult. Learn the four <em>attachment styles</em> — secure, anxious, avoidant and fearful — and find yours.",
    heroCta: "Find your style",
    footerNote:
      "An educational workshop on adult attachment theory (Bowlby, Ainsworth, and later researchers). A tool for reflection and growth, not a clinical diagnosis or therapy.",
    footerSupport:
      "Attachment theory comes from decades of psychological research. Explore the other frameworks in <strong>The People Library</strong> to see the wider picture.",
  },

  learn: {
    kicker: "The Ideas",
    heading: "The blueprint for closeness",
    sub: "Early bonds create a template for how safe we feel with intimacy. Tap a card to go deeper.",
  },

  concepts: [
    {
      icon: "🔗", name: "What attachment is", tag: "Your closeness blueprint.",
      summary: "Attachment theory says our earliest relationships teach us whether people are safe, reliable and worth depending on. That lesson becomes a template we carry into adult friendships and love.",
      points: ["Built from early experiences of care.", "Shapes how safe intimacy feels.", "Runs mostly on autopilot.", "Shows up most under stress and conflict."],
    },
    {
      icon: "🧭", name: "The four styles", tag: "Secure, anxious, avoidant, fearful.",
      summary: "Adults tend toward one of four styles: secure (comfortable with closeness), anxious (craves it but fears abandonment), avoidant (values independence over intimacy), and fearful-avoidant (wants closeness but fears being hurt).",
      points: ["<strong>Secure</strong> — trusts and depends comfortably.", "<strong>Anxious</strong> — craves closeness, fears abandonment.", "<strong>Avoidant</strong> — prizes independence, dodges intimacy.", "<strong>Fearful</strong> — wants love but braces for hurt."],
    },
    {
      icon: "🌱", name: "Where it comes from", tag: "Not your fault.",
      summary: "Your style isn't a flaw or a choice — it's an adaptation to how available and consistent your early caregivers were. Understanding it with compassion is the first step to changing it.",
      points: ["It's an adaptation, not a defect.", "Consistent care tends to build security.", "Inconsistent care can breed anxiety.", "Distant care can breed avoidance."],
    },
    {
      icon: "🔄", name: "Styles can change", tag: "Earned security.",
      summary: "Attachment style is not a life sentence. Through healthy relationships, self-awareness and sometimes therapy, people can move toward 'earned secure' — the good news at the heart of the theory.",
      points: ["Style can shift over time.", "Secure partners can help you heal.", "Self-awareness loosens old patterns.", "'Earned secure' is very possible."],
    },
    {
      icon: "🤝", name: "Pairing dynamics", tag: "Why couples clash.",
      summary: "Styles interact. The classic painful pairing is anxious-plus-avoidant, where one chases and one withdraws. Knowing the dance lets you step out of it instead of blaming each other.",
      points: ["Anxious + avoidant = chase-and-withdraw.", "Two secures build steady calm.", "Naming the pattern defuses it.", "You can respond, not just react."],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Self-assessment",
    heading: "What's your attachment style?",
    sub: "Answer honestly about how you feel in close relationships — especially under stress. There are no wrong answers.",
    nav: "Find yours",
    icon: "🔗",
    introTitle: "12 questions",
    introText: "Think about how you generally are in close relationships, and pick what fits <em>you</em> best.",
    resultEyebrow: "Your likely attachment style",
    categories: {
      secure: { name: "Secure", icon: "🌳", color: "#2a9d5c",
        summary: "You're comfortable with closeness and with independence. You trust, communicate needs directly, and handle conflict without panic or shutdown.",
        signsTitle: "You tend to", handleTitle: "How to relate to you",
        signs: ["Trust and depend comfortably", "Communicate needs directly", "Handle conflict calmly", "Give and receive support easily"],
        handle: ["Be honest and consistent", "Enjoy healthy give-and-take", "Keep communication open", "You're a stabilising partner for others"] },
      anxious: { name: "Anxious", icon: "🌊", color: "#db2777",
        summary: "You crave closeness and give a lot, but fear abandonment. You're attuned to your partner's moods and can spiral into worry when reassurance is missing.",
        signsTitle: "You tend to", handleTitle: "How to support you",
        signs: ["Crave closeness and reassurance", "Fear being abandoned", "Over-read moods and silences", "Protest or cling when anxious"],
        handle: ["Offer steady, consistent reassurance", "Be clear and predictable", "Don't withdraw without explaining", "Help them self-soothe, gently"] },
      avoidant: { name: "Avoidant", icon: "🧱", color: "#0891b2",
        summary: "You prize independence and can feel crowded by too much closeness. You handle things alone and may withdraw or downplay needs when intimacy intensifies.",
        signsTitle: "You tend to", handleTitle: "How to support you",
        signs: ["Value independence highly", "Feel crowded by too much closeness", "Withdraw under pressure", "Downplay your own needs"],
        handle: ["Respect their need for space", "Don't chase or pressure", "Be reliable but not clingy", "Invite closeness without demanding it"] },
      fearful: { name: "Fearful-Avoidant", icon: "🌀", color: "#7c3aed",
        summary: "You long for closeness but brace for hurt, so you can run hot and cold — reaching out, then pulling away. It usually stems from closeness once feeling unsafe.",
        signsTitle: "You tend to", handleTitle: "How to support you",
        signs: ["Want closeness but fear it", "Run hot and cold", "Struggle to trust", "Push-pull in relationships"],
        handle: ["Be patient, calm and consistent", "Make safety and predictability visible", "Don't take the push-pull personally", "Gentle steadiness over time rebuilds trust"] },
    },
    questions: [
      { q: "When you get close to someone, you…", options: [
        { text: "Feel comfortable and secure", cat: "secure" },
        { text: "Worry they'll pull away", cat: "anxious" },
        { text: "Start to feel a bit crowded", cat: "avoidant" },
        { text: "Want it but feel uneasy", cat: "fearful" } ] },
      { q: "When a partner needs space, you…", options: [
        { text: "Give it without worry", cat: "secure" },
        { text: "Feel anxious and rejected", cat: "anxious" },
        { text: "Feel relieved, honestly", cat: "avoidant" },
        { text: "Feel both hurt and safer", cat: "fearful" } ] },
      { q: "In conflict you tend to…", options: [
        { text: "Stay calm and talk it through", cat: "secure" },
        { text: "Get flooded and seek reassurance", cat: "anxious" },
        { text: "Shut down and withdraw", cat: "avoidant" },
        { text: "Swing between the two", cat: "fearful" } ] },
      { q: "Depending on others feels…", options: [
        { text: "Natural and fine", cat: "secure" },
        { text: "Necessary but scary", cat: "anxious" },
        { text: "Uncomfortable — I'd rather not", cat: "avoidant" },
        { text: "Something I want but distrust", cat: "fearful" } ] },
      { q: "When someone doesn't reply for a while, you…", options: [
        { text: "Assume they're just busy", cat: "secure" },
        { text: "Start to worry something's wrong", cat: "anxious" },
        { text: "Barely notice", cat: "avoidant" },
        { text: "Feel a flash of fear, then detach", cat: "fearful" } ] },
      { q: "Your view of relationships is…", options: [
        { text: "Mostly safe and rewarding", cat: "secure" },
        { text: "Wonderful but precarious", cat: "anxious" },
        { text: "Nice, but I'm fine alone", cat: "avoidant" },
        { text: "Wanted but risky", cat: "fearful" } ] },
      { q: "Sharing your deepest feelings is…", options: [
        { text: "Comfortable with the right person", cat: "secure" },
        { text: "Something I do quickly to bond", cat: "anxious" },
        { text: "Hard — I keep things private", cat: "avoidant" },
        { text: "Something I approach then retreat from", cat: "fearful" } ] },
      { q: "When a relationship gets serious, you…", options: [
        { text: "Lean in with trust", cat: "secure" },
        { text: "Want constant closeness", cat: "anxious" },
        { text: "Feel the urge to create distance", cat: "avoidant" },
        { text: "Feel excited and panicked at once", cat: "fearful" } ] },
      { q: "Reassurance from a partner…", options: [
        { text: "Is nice but I don't need much", cat: "secure" },
        { text: "I need it often", cat: "anxious" },
        { text: "Feels a bit smothering", cat: "avoidant" },
        { text: "Soothes then makes me wary", cat: "fearful" } ] },
      { q: "After a breakup you typically…", options: [
        { text: "Grieve, then recover steadily", cat: "secure" },
        { text: "Struggle to let go", cat: "anxious" },
        { text: "Move on fast, seem unaffected", cat: "avoidant" },
        { text: "Feel torn apart and relieved", cat: "fearful" } ] },
      { q: "Trusting a new person comes…", options: [
        { text: "Fairly naturally", cat: "secure" },
        { text: "Fast, then anxiously", cat: "anxious" },
        { text: "Slowly, if at all", cat: "avoidant" },
        { text: "With hope and heavy caution", cat: "fearful" } ] },
      { q: "Your independence and closeness are…", options: [
        { text: "Comfortably balanced", cat: "secure" },
        { text: "Tilted toward needing closeness", cat: "anxious" },
        { text: "Tilted toward needing space", cat: "avoidant" },
        { text: "In constant tension", cat: "fearful" } ] },
    ],
  },

  handle: {
    kicker: "Put it to work",
    heading: "Toward secure connection",
    sub: "Every style can grow more secure — in yourself and with the people you love.",
    nav: "Apply",
    cta: "Back to the People Library →",
    cards: [
      { icon: "🌳", title: "Grow your security", tone: "do", items: [
        "Name your pattern without shame", "Communicate needs directly and early", "Choose calm, consistent people", "Learn to self-soothe your triggers", "Repair after conflict, don't avoid it",
      ]},
      { icon: "💞", title: "With an anxious partner", tone: "", items: [
        "Give steady, predictable reassurance", "Explain when you need space", "Follow through on what you say", "Don't punish with withdrawal", "Celebrate closeness, don't ration it",
      ]},
      { icon: "🧱", title: "With an avoidant partner", tone: "", items: [
        "Respect their space without chasing", "Stay reliable and low-pressure", "Invite closeness gently", "Don't read distance as rejection", "Give them room to come toward you",
      ]},
    ],
  },

  faq: [
    { q: "Is attachment style fixed for life?", a: "No. It's stable but changeable. Through self-awareness, secure relationships and sometimes therapy, people move toward 'earned secure'." },
    { q: "Is one style just 'better'?", a: "Secure attachment is the most comfortable and resilient, but the others aren't character flaws — they're understandable adaptations that can be grown out of." },
    { q: "Can I be a mix of styles?", a: "Yes. Many people blend, and your style can even differ across relationships. The result shows your strongest leaning plus the balance." },
    { q: "Where does my style come from?", a: "Largely from how consistent and available your early caregivers were — though later relationships and experiences also shape it." },
    { q: "Why do anxious and avoidant people attract?", a: "Each confirms the other's fears: the anxious partner chases closeness, the avoidant creates distance, and the painful dance feels oddly familiar to both." },
    { q: "Is this therapy?", a: "No. It's an educational tool for reflection. If attachment wounds are seriously affecting your life, a qualified therapist can help you work toward security." },
  ],
};
