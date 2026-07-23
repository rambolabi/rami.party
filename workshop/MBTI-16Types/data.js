/* =============================================================================
   The 16 Types (MBTI-style) — content
   Educational workshop on the four-axis type model popularised by Myers & Briggs
   (built on Carl Jung). Assessment mode: "axes" (four dichotomies → 4-letter type).
   Presented with the usual scientific caveats — a mirror, not a box.
   ========================================================================== */
const BOOK = {
  meta: {
    key: "mbti",
    title: "The 16 Types",
    subtitle: "The four-letter type model, explained honestly",
    short: "16 Types",
    emoji: "🔠",
    accent: "#7c3aed",
    eyebrow: "A Personality Framework",
    description:
      "An educational workshop on the 16 personality types (MBTI-style): four axes that combine into a four-letter type. Presented with honest caveats.",
    heroTitle: "Four letters,<br />sixteen types.",
    heroLead:
      "The world's most famous personality test sorts people along four axes into sixteen types. Hugely popular — and worth understanding <em>and</em> questioning. Find your four letters.",
    heroCta: "Find your type",
    footerNote:
      "An educational workshop on the 16-type (MBTI-style) model, built on Carl Jung's ideas. Popular and useful for reflection, but weaker scientifically than the Big Five — treat your result as a mirror, not a box.",
    footerSupport:
      "The 16-type model is popular but scientifically contested. For the research-backed alternative, try the <strong>Big Five</strong> in The People Library.",
  },

  learn: {
    kicker: "The Ideas",
    heading: "How the sixteen types work",
    sub: "Four either/or preferences combine into a four-letter type. Tap a card to go deeper.",
  },

  concepts: [
    {
      icon: "🔠",
      name: "Four axes, sixteen types",
      tag: "E/I · S/N · T/F · J/P.",
      summary:
        "The model asks where you prefer to focus, how you take in information, how you decide, and how you organise your life. Each axis has two poles, and your preferences combine into one of sixteen four-letter types.",
      points: [
        "<strong>E/I</strong> — where you get energy: people or solitude.",
        "<strong>S/N</strong> — what you notice: facts or patterns.",
        "<strong>T/F</strong> — how you decide: logic or values.",
        "<strong>J/P</strong> — how you live: planned or flexible.",
      ],
    },
    {
      icon: "🧭",
      name: "Preferences, not abilities",
      tag: "Left or right hand.",
      summary:
        "A preference is like being right- or left-handed: you can use both, but one feels natural. Being an Introvert doesn't mean you can't socialise — just that it costs more energy than it gives.",
      points: [
        "You use both poles; one is just your default.",
        "Preferences say nothing about skill or intelligence.",
        "Most people are clearer on some axes than others.",
        "A near-50/50 axis simply means you flex easily.",
      ],
    },
    {
      icon: "⚠️",
      name: "An honest caveat",
      tag: "Fun, but not gospel.",
      summary:
        "The 16-type model is engaging and can spark insight, but it's scientifically shaky: results can change on retaking, and forcing people into either/or boxes loses nuance. Enjoy it as a mirror — don't use it to label or limit anyone.",
      points: [
        "Retests often give a different letter or two.",
        "Real traits are spectrums, not on/off switches.",
        "Never use type to hire, judge or excuse behaviour.",
        "For rigour, pair it with the Big Five.",
      ],
    },
    {
      icon: "🤝",
      name: "Using type with people",
      tag: "Meet their preferences.",
      summary:
        "Type is most useful as a lens for communication: give Sensors concrete detail, give Intuitives the vision, give Thinkers the logic, give Feelers the human impact, and respect whether someone prefers things planned or open.",
      points: [
        "Sensors want facts; Intuitives want the big idea.",
        "Thinkers want logic; Feelers want values and impact.",
        "Judgers want decisions; Perceivers want options.",
        "Introverts want processing time; Extraverts think aloud.",
      ],
    },
    {
      icon: "🔄",
      name: "Type isn't destiny",
      tag: "You are more than four letters.",
      summary:
        "No four letters can capture a whole person. Use your type as a starting point for self-reflection and better conversations — then hold it lightly. Growth means developing your non-preferred sides too.",
      points: [
        "Your type is a hypothesis, not a verdict.",
        "Healthy growth stretches your weaker preferences.",
        "Context and mood shift your behaviour daily.",
        "Two people of the same type can be very different.",
      ],
    },
  ],

  assessment: {
    mode: "axes",
    axisColor: "#7c3aed",
    kicker: "Self-assessment",
    heading: "Find your four letters",
    sub: "Twelve either/or choices. Pick the option that feels more natural — even if only slightly.",
    nav: "Find type",
    icon: "🔠",
    introTitle: "12 either/or choices",
    introText: "For each pair, choose the option that fits you better most of the time.",
    resultEyebrow: "Your type",
    axes: [
      { key: "EI", left: { code: "E", name: "Extraversion" }, right: { code: "I", name: "Introversion" } },
      { key: "SN", left: { code: "S", name: "Sensing" }, right: { code: "N", name: "Intuition" } },
      { key: "TF", left: { code: "T", name: "Thinking" }, right: { code: "F", name: "Feeling" } },
      { key: "JP", left: { code: "J", name: "Judging" }, right: { code: "P", name: "Perceiving" } },
    ],
    questions: [
      { q: "At a lively party, you're more likely to…", axis: "EI", options: [ { text: "Mingle widely and energise the room", side: "L" }, { text: "Have deeper chats with a few people", side: "R" } ] },
      { q: "After a busy week you recharge by…", axis: "EI", options: [ { text: "Going out and seeing people", side: "L" }, { text: "Enjoying quiet time alone", side: "R" } ] },
      { q: "You tend to…", axis: "EI", options: [ { text: "Think out loud", side: "L" }, { text: "Think it through before speaking", side: "R" } ] },
      { q: "You trust more…", axis: "SN", options: [ { text: "Concrete facts and experience", side: "L" }, { text: "Patterns and possibilities", side: "R" } ] },
      { q: "You focus more on…", axis: "SN", options: [ { text: "The details in front of you", side: "L" }, { text: "The big picture and what could be", side: "R" } ] },
      { q: "You'd rather be seen as…", axis: "SN", options: [ { text: "Practical and grounded", side: "L" }, { text: "Imaginative and original", side: "R" } ] },
      { q: "You make decisions mainly with…", axis: "TF", options: [ { text: "Logic and objective analysis", side: "L" }, { text: "Values and how people feel", side: "R" } ] },
      { q: "In a disagreement you prioritise…", axis: "TF", options: [ { text: "What's fair and correct", side: "L" }, { text: "Harmony and empathy", side: "R" } ] },
      { q: "You'd rather be called…", axis: "TF", options: [ { text: "Reasonable", side: "L" }, { text: "Compassionate", side: "R" } ] },
      { q: "You prefer your life…", axis: "JP", options: [ { text: "Planned and settled", side: "L" }, { text: "Flexible and open", side: "R" } ] },
      { q: "You feel better when things are…", axis: "JP", options: [ { text: "Decided", side: "L" }, { text: "Still open to options", side: "R" } ] },
      { q: "Your schedule tends to be…", axis: "JP", options: [ { text: "Structured and orderly", side: "L" }, { text: "Spontaneous and adaptable", side: "R" } ] },
    ],
    types: {
      INTJ: { name: "The Architect", blurb: "Strategic, independent visionaries who love mastering complex systems.", strengths: ["Long-range strategy", "Independent thinking"], watch: ["Can seem aloof", "Impatient with inefficiency"] },
      INTP: { name: "The Logician", blurb: "Curious, inventive analysts who live for ideas and understanding.", strengths: ["Original problem-solving", "Logical depth"], watch: ["Can over-analyse", "May neglect practicalities"] },
      ENTJ: { name: "The Commander", blurb: "Decisive, driven leaders who organise people and plans toward big goals.", strengths: ["Natural leadership", "Strategic drive"], watch: ["Can steamroll others", "Impatient"] },
      ENTP: { name: "The Debater", blurb: "Quick, inventive and love a good intellectual challenge or argument.", strengths: ["Idea generation", "Adaptability"], watch: ["Can argue for sport", "Loose on follow-through"] },
      INFJ: { name: "The Advocate", blurb: "Insightful, principled idealists quietly driven to help others.", strengths: ["Deep empathy", "Vision with conviction"], watch: ["Perfectionism", "Burnout from over-giving"] },
      INFP: { name: "The Mediator", blurb: "Gentle, imaginative idealists guided by strong personal values.", strengths: ["Compassion", "Creativity"], watch: ["Over-idealism", "Conflict-avoidance"] },
      ENFJ: { name: "The Protagonist", blurb: "Warm, charismatic mentors who inspire and bring people together.", strengths: ["Inspiring others", "Reading people"], watch: ["Over-involved", "People-pleasing"] },
      ENFP: { name: "The Campaigner", blurb: "Enthusiastic, creative free spirits who see possibility everywhere.", strengths: ["Enthusiasm", "Connecting with people"], watch: ["Scattered focus", "Restless"] },
      ISTJ: { name: "The Logistician", blurb: "Dependable, thorough realists who value duty and getting it right.", strengths: ["Reliability", "Attention to detail"], watch: ["Rigid about change", "Overly by-the-book"] },
      ISFJ: { name: "The Defender", blurb: "Warm, loyal protectors devoted to caring for the people around them.", strengths: ["Loyalty", "Practical care"], watch: ["Self-neglect", "Avoids conflict"] },
      ESTJ: { name: "The Executive", blurb: "Organised, decisive managers who bring order and get things done.", strengths: ["Organisation", "Decisiveness"], watch: ["Inflexible", "Blunt"] },
      ESFJ: { name: "The Consul", blurb: "Sociable, caring organisers who keep communities running and connected.", strengths: ["Warmth", "Team harmony"], watch: ["Needs approval", "Avoids conflict"] },
      ISTP: { name: "The Virtuoso", blurb: "Practical, cool-headed tinkerers who love solving hands-on problems.", strengths: ["Practical mastery", "Calm in a crisis"], watch: ["Can seem detached", "Risk-prone"] },
      ISFP: { name: "The Adventurer", blurb: "Gentle, artistic spirits who live in the moment and value freedom.", strengths: ["Aesthetic sense", "Quiet warmth"], watch: ["Conflict-avoidant", "Hard to read"] },
      ESTP: { name: "The Entrepreneur", blurb: "Bold, energetic realists who thrive on action and quick results.", strengths: ["Boldness", "Fast action"], watch: ["Impatient", "Risk-seeking"] },
      ESFP: { name: "The Entertainer", blurb: "Spontaneous, fun-loving people who bring energy and joy to a room.", strengths: ["Enthusiasm", "Living in the now"], watch: ["Dislikes routine", "Avoids hard planning"] },
    },
  },

  handle: {
    kicker: "Put it to work",
    heading: "Talking across the types",
    sub: "Type is most useful as a communication lens. Meet people in their preferences.",
    nav: "Apply",
    cta: "See how it links to DISC colours →",
    cards: [
      { icon: "✅", title: "Do", tone: "do", items: [
        "Give Sensors concrete facts and steps", "Give Intuitives the vision and the 'why'", "Give Thinkers clear logic", "Give Feelers the human impact", "Give Introverts time to process",
      ]},
      { icon: "⛔", title: "Don't", tone: "dont", items: [
        "Use type to judge or pigeonhole people", "Assume same type = same person", "Treat it as fixed and unchangeable", "Force Perceivers into rigid plans", "Make Extraverts sit in silence",
      ]},
      { icon: "🪞", title: "Hold it lightly", tone: "", items: [
        "Use it to reflect, not to label", "Expect your letters to shift over time", "Develop your non-preferred sides", "Pair it with the Big Five for rigour", "Let people surprise you",
      ]},
    ],
  },

  faq: [
    { q: "Is the 16-type test scientific?", a: "It's popular and can be insightful, but psychologists consider it weak as a measurement: results often change on retesting, and forcing spectrums into either/or boxes loses accuracy. Treat it as a mirror, not a verdict." },
    { q: "Why did I get a different type before?", a: "Because several axes are close to 50/50 for many people, a small mood or wording change can flip a letter. That's a known limitation of any either/or test." },
    { q: "What do the letters mean?", a: "E/I is where you get energy (people vs. solitude), S/N is what you notice (facts vs. patterns), T/F is how you decide (logic vs. values), and J/P is how you organise life (planned vs. flexible)." },
    { q: "Is one type better than another?", a: "No. Every type has strengths and blind spots. There's no best type — only better and worse fits for a given situation or role." },
    { q: "Can I change my type?", a: "Your preferences can shift gradually, and you can deliberately develop your weaker sides. You're never locked into four letters." },
    { q: "Should I use type at work to pick people?", a: "No. It's not reliable or fair enough for hiring or selection. Use it for self-reflection and better communication only." },
  ],

  disc: {
    kicker: "Cross-link",
    heading: "The 16 types and the DISC colours",
    sub: "The models aren't identical, but they rhyme. Here's a rough bridge to the DISC colours.",
    nav: "Colours",
    labels: { relate: "Types that often lean here", reflect: "Growth edge", treat: "How to meet them" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Explore the DISC colour workshop →",
    colors: {
      red: {
        relate: "Often the decisive ExTJ types (ENTJ, ESTJ) — driven and take-charge.",
        reflect: "Grow patience and empathy for slower, gentler people.",
        treat: "Be brief, logical and results-focused.",
      },
      yellow: {
        relate: "Often the outgoing ExFP / ENxP types — sociable, enthusiastic, idea-loving.",
        reflect: "Grow focus and follow-through.",
        treat: "Be warm, upbeat and give them room to talk.",
      },
      green: {
        relate: "Often the caring IxFx types (ISFJ, INFP) — loyal, gentle, harmony-seeking.",
        reflect: "Grow assertiveness and comfort with conflict.",
        treat: "Be patient, personal and reassuring.",
      },
      blue: {
        relate: "Often the analytical IxTx types (INTJ, ISTJ) — precise and thorough.",
        reflect: "Grow flexibility and openness to others' feelings.",
        treat: "Bring detail, logic and time to think.",
      },
    },
  },
};
