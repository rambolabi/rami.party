/* =============================================================================
   The Enneagram — content
   Educational workshop on the nine Enneagram types (motivation-based personality).
   Assessment mode: "classify" (nine types).
   ========================================================================== */
const BOOK = {
  meta: {
    key: "enneagram",
    title: "The Enneagram",
    subtitle: "Nine types, nine core motivations",
    short: "Enneagram",
    emoji: "🔯",
    accent: "#db2777",
    eyebrow: "A Personality Framework",
    description:
      "An educational workshop on the nine Enneagram types — a motivation-based map of personality. Discover your core type and how to relate to all nine.",
    heroTitle: "Nine ways of<br />seeing the world.",
    heroLead:
      "The Enneagram maps personality by <em>why</em> we do things — nine core motivations, fears and desires. Find your type, and learn to understand the other eight.",
    heroCta: "Find your type",
    footerNote:
      "An educational workshop on the Enneagram. A tool for self-reflection and understanding others — not a scientific instrument or a box to trap anyone in.",
    footerSupport:
      "The Enneagram is a popular tool for self-understanding. Explore the other frameworks in <strong>The People Library</strong> to round out the picture.",
  },

  learn: {
    kicker: "The Ideas",
    heading: "A map of motivations",
    sub: "The Enneagram sorts people not by behaviour but by the deeper drives beneath it. Tap a card to go deeper.",
  },

  concepts: [
    {
      icon: "🔯", name: "Nine types", tag: "One core type each.",
      summary: "The Enneagram describes nine distinct personality types, each with its own core motivation, basic fear and basic desire. Most people have one dominant type that shapes how they see and move through the world.",
      points: ["Each type has a core fear and a core desire.", "You have one dominant type, not nine.", "Types describe motivation, not just behaviour.", "No type is better — each has gifts and traps."],
    },
    {
      icon: "🧭", name: "Why, not what", tag: "Motivation over behaviour.",
      summary: "Two people can do the same thing for opposite reasons. The Enneagram's power is that it looks under the surface at the motivation driving the behaviour — which is why it can feel so revealing.",
      points: ["The same action can spring from different types.", "It names your hidden 'why'.", "That's what makes it feel personal.", "Knowing your driver gives you a choice."],
    },
    {
      icon: "➡️", name: "Wings & arrows", tag: "Types don't stand alone.",
      summary: "Your core type is flavoured by its neighbours (your 'wings'), and you shift toward other types in growth and stress (the 'arrows'). It's a dynamic system, not nine static boxes.",
      points: ["Wings: the two types next to yours colour your style.", "Arrows: you move toward one type in growth, another in stress.", "This explains why you feel different on good and bad days.", "The system is fluid, not fixed."],
    },
    {
      icon: "🌱", name: "Growth & stress", tag: "Same type, healthy or not.",
      summary: "Each type has healthy, average and unhealthy expressions. The goal isn't to change type but to move toward the healthy version of your own — more free, less driven by fear.",
      points: ["Every type has a best and worst self.", "Growth = less ruled by your core fear.", "Self-awareness is the first step.", "You grow your type, you don't swap it."],
    },
    {
      icon: "🤝", name: "Using it with people", tag: "Meet their motivation.",
      summary: "Once you sense someone's type, you can speak to what they actually need — reassurance for a Six, appreciation for a Two, respect for an Eight, space for a Five.",
      points: ["Address the core need, not just the behaviour.", "Different types need very different things.", "It builds patience and empathy.", "Don't type people to judge them — to understand them."],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Self-assessment",
    heading: "Which Enneagram type are you?",
    sub: "For each question, choose the option that rings most true about what drives you. Answer for your general self, not one moment.",
    nav: "Find type",
    icon: "🔯",
    introTitle: "9 questions",
    introText: "Pick the option closest to your real motivation each time — go with your gut.",
    resultEyebrow: "Your likely core type",
    categories: {
      one: { name: "1 · The Reformer", icon: "🎯", color: "#b45309",
        summary: "Principled, purposeful and self-controlled, with a strong inner critic. Driven to be good and to improve things.",
        signsTitle: "Core pattern", handleTitle: "How to relate to them",
        signs: ["Wants to do things right", "Strong sense of should", "Self-critical and precise", "Fear of being wrong or corrupt"],
        handle: ["Acknowledge their standards", "Be fair and reliable", "Don't nit-pick back", "Help them ease the inner critic"] },
      two: { name: "2 · The Helper", icon: "🤲", color: "#db2777",
        summary: "Warm, generous and people-focused, wanting to be needed and loved. Can neglect their own needs.",
        signsTitle: "Core pattern", handleTitle: "How to relate to them",
        signs: ["Focuses on others' needs", "Wants to feel appreciated", "Struggles to ask for help", "Fear of being unwanted"],
        handle: ["Appreciate them sincerely", "Ask what they need too", "Don't take their giving for granted", "Encourage healthy boundaries"] },
      three: { name: "3 · The Achiever", icon: "🏆", color: "#f0a500",
        summary: "Driven, adaptable and image-conscious, wanting to succeed and be admired. Can lose touch with their feelings.",
        signsTitle: "Core pattern", handleTitle: "How to relate to them",
        signs: ["Goal-driven and efficient", "Cares about image and success", "Can overwork", "Fear of being worthless"],
        handle: ["Value them for who they are, not just wins", "Be direct and efficient", "Help them slow down", "Don't compete for status"] },
      four: { name: "4 · The Individualist", icon: "🎨", color: "#7c3aed",
        summary: "Sensitive, expressive and introspective, longing to be authentic and unique. Prone to melancholy and comparison.",
        signsTitle: "Core pattern", handleTitle: "How to relate to them",
        signs: ["Emotionally deep", "Wants to be seen as unique", "Prone to envy and longing", "Fear of having no identity"],
        handle: ["Honour their feelings", "Don't rush or fix them", "Value their authenticity", "Gently anchor them in the present"] },
      five: { name: "5 · The Investigator", icon: "🔬", color: "#2563eb",
        summary: "Perceptive, private and cerebral, seeking knowledge and guarding their energy. Can withdraw and detach.",
        signsTitle: "Core pattern", handleTitle: "How to relate to them",
        signs: ["Craves understanding", "Guards time and privacy", "Reserved and independent", "Fear of being depleted or invaded"],
        handle: ["Respect their space and energy", "Give them time to think", "Be clear and unintrusive", "Don't demand emotional performance"] },
      six: { name: "6 · The Loyalist", icon: "🛡️", color: "#0891b2",
        summary: "Committed, responsible and security-oriented, scanning for danger. Loyal but anxious and doubting.",
        signsTitle: "Core pattern", handleTitle: "How to relate to them",
        signs: ["Loyal and prepared", "Anticipates what could go wrong", "Seeks reassurance and trust", "Fear of being without support"],
        handle: ["Be consistent and trustworthy", "Offer calm reassurance", "Talk through their worries", "Don't spring surprises"] },
      seven: { name: "7 · The Enthusiast", icon: "🎈", color: "#e11d48",
        summary: "Spontaneous, upbeat and versatile, chasing experiences and options. Avoids pain and being trapped.",
        signsTitle: "Core pattern", handleTitle: "How to relate to them",
        signs: ["Loves fun and possibility", "Keeps options open", "Avoids pain and boredom", "Fear of being trapped or deprived"],
        handle: ["Bring energy and ideas", "Give them freedom", "Gently help them finish things", "Let them feel the hard stuff too"] },
      eight: { name: "8 · The Challenger", icon: "⚡", color: "#b91c1c",
        summary: "Powerful, decisive and protective, wanting control and to avoid vulnerability. Direct and intense.",
        signsTitle: "Core pattern", handleTitle: "How to relate to them",
        signs: ["Takes charge naturally", "Protects their people", "Direct and strong-willed", "Fear of being controlled or harmed"],
        handle: ["Be straight and strong", "Don't play games or manipulate", "Respect their autonomy", "Show them vulnerability is safe"] },
      nine: { name: "9 · The Peacemaker", icon: "☮️", color: "#2a9d5c",
        summary: "Easygoing, accepting and steady, seeking harmony and avoiding conflict. Can be complacent and self-forgetting.",
        signsTitle: "Core pattern", handleTitle: "How to relate to them",
        signs: ["Calm and accommodating", "Avoids conflict", "Merges with others' agendas", "Fear of loss and separation"],
        handle: ["Invite their real opinion", "Be patient, don't pressure", "Value their steadiness", "Help them show up for themselves"] },
    },
    questions: [
      { q: "What matters most to you?", options: [
        { text: "Doing things the right way", cat: "one" },
        { text: "Understanding how things really work", cat: "five" },
        { text: "Everyone getting along", cat: "nine" } ] },
      { q: "In a group you tend to…", options: [
        { text: "Look after everyone's needs", cat: "two" },
        { text: "Watch for what could go wrong", cat: "six" },
        { text: "Bring the fun and the ideas", cat: "seven" } ] },
      { q: "You most want to be…", options: [
        { text: "Successful and admired", cat: "three" },
        { text: "Authentic and unique", cat: "four" },
        { text: "Strong and in control", cat: "eight" } ] },
      { q: "Your inner voice pushes you to be…", options: [
        { text: "Good and correct", cat: "one" },
        { text: "Needed and loved", cat: "two" },
        { text: "Impressive and winning", cat: "three" } ] },
      { q: "Under stress you…", options: [
        { text: "Withdraw into your feelings", cat: "four" },
        { text: "Retreat to think alone", cat: "five" },
        { text: "Seek reassurance and plan for the worst", cat: "six" } ] },
      { q: "You most want to avoid…", options: [
        { text: "Boredom and being trapped", cat: "seven" },
        { text: "Weakness and being controlled", cat: "eight" },
        { text: "Conflict and being pushed", cat: "nine" } ] },
      { q: "Your natural energy is…", options: [
        { text: "Disciplined and improving things", cat: "one" },
        { text: "Deep and emotionally rich", cat: "four" },
        { text: "Upbeat and onto the next thing", cat: "seven" } ] },
      { q: "In relationships you…", options: [
        { text: "Give a lot and want appreciation", cat: "two" },
        { text: "Need plenty of space and privacy", cat: "five" },
        { text: "Protect your people and take charge", cat: "eight" } ] },
      { q: "You feel safest when…", options: [
        { text: "You're achieving and on track", cat: "three" },
        { text: "You know who and what to trust", cat: "six" },
        { text: "Things are calm and settled", cat: "nine" } ] },
    ],
  },

  handle: {
    kicker: "Put it to work",
    heading: "Relating to all nine",
    sub: "Each type needs something different. Meet the motivation and you meet the person.",
    nav: "Apply",
    cta: "See how it links to DISC colours →",
    cards: [
      { icon: "🤝", title: "Meet the need", tone: "do", items: [
        "1 & 6: reliability and reassurance", "2 & 9: appreciation and a real voice", "3 & 7: respect their drive, help them land", "4: honour feelings; 5: give space", "8: be straight and strong",
      ]},
      { icon: "🌱", title: "Support growth", tone: "", items: [
        "Reflect their gifts back to them", "Name the fear gently, not as a weapon", "Encourage the healthy version of their type", "Give patience — change is slow", "Model that it's safe to relax the pattern",
      ]},
      { icon: "⛔", title: "Avoid", tone: "dont", items: [
        "Using type to label or dismiss people", "Assuming you know them from a number", "Judging a type as better or worse", "Typing others to win arguments", "Treating it as fixed and final",
      ]},
    ],
  },

  faq: [
    { q: "Is the Enneagram scientific?", a: "It's a popular tool for self-understanding rather than a validated scientific instrument like the Big Five. Many people find it insightful — just hold it as a mirror, not a fact." },
    { q: "Can I be more than one type?", a: "You have one core type, but it's flavoured by your 'wings' (neighbouring types) and you shift toward others in growth and stress. So you'll recognise yourself in several." },
    { q: "Can my type change?", a: "Most teachers say your core type is stable for life, but how healthily you express it can change a great deal. Growth means becoming the best version of your type." },
    { q: "What if two types feel equally true?", a: "That's common. Look at your core motivation and fear rather than behaviour — the Enneagram is about <em>why</em> you do things, which usually points to one." },
    { q: "Is one type better than another?", a: "No. Every type has real gifts and characteristic traps. There's no best or worst — just different core drives." },
    { q: "How does this relate to DISC?", a: "They're different maps, but they overlap. See the DISC workshop and the colour cross-link below for a rough bridge." },
  ],

  disc: {
    kicker: "Cross-link",
    heading: "The Enneagram and the DISC colours",
    sub: "A rough bridge between the nine types and the four DISC colours.",
    nav: "Colours",
    labels: { relate: "Types that often lean here", reflect: "Growth edge", treat: "How to meet them" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Explore the DISC colour workshop →",
    colors: {
      red: { relate: "Often Eights and driven Threes — assertive and take-charge.", reflect: "Grow patience, softness and trust.", treat: "Be direct, strong and to the point." },
      yellow: { relate: "Often Sevens and image-driven Threes — upbeat and expressive.", reflect: "Grow depth and follow-through.", treat: "Be warm, positive and give them room." },
      green: { relate: "Often Nines and Twos — harmonious and caring.", reflect: "Grow a stronger, clearer voice.", treat: "Be patient, gentle and appreciative." },
      blue: { relate: "Often Ones, Fives and Sixes — careful and thoughtful.", reflect: "Grow flexibility and self-trust.", treat: "Be accurate, calm and give space to think." },
    },
  },
};
