/* =============================================================================
   Emotional Intelligence (EQ) — content
   Educational workshop on emotional intelligence (Goleman's domains).
   Assessment mode: "score" (a self-reported EQ reading).
   ========================================================================== */
const BOOK = {
  meta: {
    key: "eq",
    title: "Emotional Intelligence",
    subtitle: "The skill that runs every relationship",
    short: "EQ",
    emoji: "🫀",
    accent: "#059669",
    eyebrow: "A Skills Framework",
    description:
      "An educational workshop on emotional intelligence (EQ). Measure your emotional skills across self-awareness, self-management, empathy and social skill — and grow them.",
    heroTitle: "The smartest skill<br />isn't IQ.",
    heroLead:
      "How well you read and handle emotions — your own and others' — shapes your relationships, work and happiness more than raw intellect. Measure your <em>EQ</em> and learn to grow it.",
    heroCta: "Measure your EQ",
    footerNote:
      "An educational workshop on emotional intelligence, popularised by Daniel Goleman. A self-report is a mirror for growth, not a validated clinical test.",
    footerSupport:
      "Emotional intelligence is a learnable set of skills. Explore the other frameworks in <strong>The People Library</strong> to understand the people you use them with.",
  },

  learn: {
    kicker: "The Ideas",
    heading: "The four skills of EQ",
    sub: "Emotional intelligence is not a fixed trait but a set of learnable skills, usually grouped into four domains. Tap a card to go deeper.",
  },

  concepts: [
    {
      icon: "🫀", name: "What EQ is", tag: "Reading and handling emotion.",
      summary: "Emotional intelligence is the ability to recognise, understand and manage emotions — yours and other people's — and to use that awareness to guide how you think and act. It predicts relationship and career success strongly.",
      points: ["Recognise emotions accurately.", "Understand what drives them.", "Manage rather than be ruled by them.", "Use them to guide good decisions."],
    },
    {
      icon: "🪞", name: "Self-awareness", tag: "Know your own weather.",
      summary: "The foundation: noticing what you feel as you feel it, and understanding how your emotions affect your thoughts and behaviour. Without it, the other skills have nothing to work with.",
      points: ["Name emotions as they arise.", "Notice your triggers and patterns.", "See how feelings drive your actions.", "Honest self-knowledge, including blind spots."],
    },
    {
      icon: "🧘", name: "Self-management", tag: "Respond, don't react.",
      summary: "Using self-awareness to stay in control: pausing before reacting, calming strong feelings, staying motivated, and adapting. It's the gap between an impulse and an action.",
      points: ["Pause between feeling and acting.", "Calm and channel strong emotions.", "Stay motivated through setbacks.", "Adapt instead of melting down."],
    },
    {
      icon: "💞", name: "Empathy", tag: "Read the room.",
      summary: "Sensing what others feel and seeing things from their perspective — even when they don't say it. Empathy is the social radar that makes trust, influence and connection possible.",
      points: ["Pick up unspoken feelings.", "See from others' perspectives.", "Listen for what's underneath the words.", "Respond to the person, not just the message."],
    },
    {
      icon: "🤝", name: "Social skill", tag: "Handle relationships well.",
      summary: "Putting it all together in interactions: communicating clearly, managing conflict, building rapport and bringing out the best in people. It's EQ made visible in how you treat others.",
      points: ["Communicate clearly and warmly.", "Handle conflict without damage.", "Build rapport and trust.", "Bring out the best in people."],
    },
  ],

  assessment: {
    mode: "score",
    shuffle: false,
    shuffleOptions: false,
    kicker: "Self-assessment",
    heading: "How high is your EQ?",
    sub: "Rate how true each statement is of you. Fifteen items across the four EQ skills give you a reading. Be honest — this is a mirror.",
    nav: "Measure",
    icon: "🫀",
    introTitle: "15 statements",
    introText: "Answer about how you generally are, not how you'd like to be. Takes about two minutes.",
    resultEyebrow: "Your emotional intelligence",
    scaleLow: "Developing",
    scaleHigh: "Highly emotionally intelligent",
    bands: [
      { min: 0, color: "#b3123a", label: "Developing", title: "Room to grow",
        blurb: "Your EQ skills are still developing — and that's genuinely good news, because unlike IQ, emotional intelligence can be learned at any age.",
        adviceTitle: "Start here",
        advice: ["Name your emotions as they happen — labelling calms them.", "Pause before reacting when you feel triggered.", "Ask one person how they're really doing, and listen fully.", "Notice one relationship pattern you'd like to change."] },
      { min: 50, color: "#f0a500", label: "Solid", title: "A solid emotional toolkit",
        blurb: "You handle emotions and relationships well much of the time, with clear room to sharpen one or two of the four skills.",
        adviceTitle: "Level up",
        advice: ["Spot which of the four skills is your weakest and target it.", "Practise pausing in your hardest moments, not your easy ones.", "Deepen empathy: reflect back what others feel.", "Seek honest feedback on how you come across."] },
      { min: 78, color: "#2a9d5c", label: "High", title: "Emotionally intelligent",
        blurb: "You read and manage emotions skilfully, in yourself and others. Keep practising — and help raise the EQ of the people around you.",
        adviceTitle: "Keep it strong",
        advice: ["Keep naming and regulating your own emotions.", "Use your empathy to bring out the best in others.", "Model calm, clear communication under pressure.", "Mentor someone in the skills that come easily to you."] },
    ],
    questions: [
      "I can name what I'm feeling as it happens.",
      "I notice how my mood affects my thoughts and choices.",
      "I'm aware of my emotional triggers and patterns.",
      "I can stay calm and think clearly under pressure.",
      "I pause before reacting when I'm upset.",
      "I bounce back from setbacks without staying down for long.",
      "I can sense how others are feeling, even unspoken.",
      "I genuinely see situations from other people's perspectives.",
      "People feel understood when they talk to me.",
      "I listen for what's underneath what someone says.",
      "I handle disagreements without damaging the relationship.",
      "I communicate my feelings clearly and calmly.",
      "I build rapport and trust easily with new people.",
      "I can help calm others down when they're upset.",
      "I adapt my approach to different people and moods.",
    ].map((q) => ({
      q,
      options: [
        { text: "Rarely true", points: 0 },
        { text: "Sometimes true", points: 1 },
        { text: "Often true", points: 2 },
        { text: "Almost always true", points: 3 },
      ],
    })),
  },

  handle: {
    kicker: "Put it to work",
    heading: "Growing your EQ",
    sub: "Emotional intelligence is a muscle. Here's how to train each part of it.",
    nav: "Grow it",
    cta: "Back to the People Library →",
    cards: [
      { icon: "🪞", title: "Self-awareness & management", tone: "do", items: [
        "Label emotions the moment they arise", "Keep a two-line feelings note each day", "Pause and breathe before reacting", "Name your top three triggers", "Ask 'what do I actually need right now?'",
      ]},
      { icon: "💞", title: "Empathy & social skill", tone: "", items: [
        "Reflect back what others seem to feel", "Listen to understand, not to reply", "Get curious before you judge", "Repair quickly after friction", "Praise sincerely and specifically",
      ]},
      { icon: "⛔", title: "Avoid", tone: "dont", items: [
        "Bottling up or denying emotions", "Reacting in the heat of the moment", "Assuming you know how others feel", "Winning arguments at the cost of trust", "Treating EQ as fixed — it isn't",
      ]},
    ],
  },

  faq: [
    { q: "Is EQ more important than IQ?", a: "For relationships, leadership and day-to-day happiness, emotional intelligence often matters more. IQ helps you get the job; EQ helps you thrive in it and with people." },
    { q: "Can emotional intelligence be learned?", a: "Yes — that's the exciting part. Unlike IQ, EQ is a set of skills you can build at any age with practice and feedback." },
    { q: "What are the four parts of EQ?", a: "Self-awareness (knowing your emotions), self-management (handling them), empathy (reading others), and social skill (managing relationships well)." },
    { q: "Does high EQ mean being 'nice' all the time?", a: "No. It means being aware and skilful — which sometimes means having a hard conversation calmly, or holding a boundary with empathy." },
    { q: "How accurate is a 15-item self-test?", a: "It's a reflective indicator, not a validated instrument, and self-report has blind spots. Pair it with honest feedback from people who know you." },
    { q: "How do I actually raise my EQ?", a: "Start small and specific: label your feelings, pause before reacting, and truly listen to one person a day. Skills grow with repetition." },
  ],
};
