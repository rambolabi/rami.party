/* =============================================================================
   Surrounded by Setbacks — content
   Educational workshop inspired by Thomas Erikson's "Surrounded by Setbacks".
   Understanding the setback spiral and building a resilient response.
   Assessment mode: "score" (resilience level).
   ========================================================================== */
const BOOK = {
  meta: {
    key: "setbacks",
    title: "Surrounded by Setbacks",
    subtitle: "Turn adversity into your comeback",
    short: "Setbacks",
    emoji: "🧗",
    accent: "#1d4ed8",
    eyebrow: "A Thomas Erikson Workshop",
    description:
      "An educational workshop inspired by Thomas Erikson's 'Surrounded by Setbacks'. Understand the setback spiral and measure your own resilient response.",
    heroTitle: "Knocked down.<br />Now what?",
    heroLead:
      "Setbacks are inevitable; being flattened by them isn't. Learn the resilient response from Thomas Erikson's <em>Surrounded by Setbacks</em> — and measure your own comeback strength.",
    heroCta: "Measure your resilience",
    footerNote:
      "An educational workshop inspired by <em>Surrounded by Setbacks</em> by Thomas Erikson. A reflective tool for building resilience — not therapy or clinical advice.",
  },

  learn: {
    kicker: "The Ideas",
    heading: "Why some people bounce back",
    sub: "Resilience isn't about avoiding setbacks — it's about how you respond to them. Tap a card to go deeper.",
  },

  concepts: [
    {
      icon: "🌊",
      name: "The setback spiral",
      tag: "How one knock becomes many.",
      summary:
        "A single setback rarely stays single in the mind. Left unchecked, it spirals: one failure becomes proof you 'always' fail, which drains motivation, which causes more failure. The spiral is a story you tell yourself — and stories can be rewritten.",
      points: [
        "One event becomes a sweeping conclusion ('I always mess up').",
        "The mood drop lowers effort, causing more setbacks.",
        "Rumination keeps the wound open.",
        "Catching the spiral early is half the battle.",
      ],
    },
    {
      icon: "🎯",
      name: "Reaction vs response",
      tag: "The gap where your power lives.",
      summary:
        "You can't control what happens to you, but you can control your response. Between the setback and your reaction there's a gap — and in that gap is your freedom to choose how you meet it.",
      points: [
        "Events are often outside your control; your response isn't.",
        "A reaction is automatic; a response is chosen.",
        "Pausing before reacting expands your options.",
        "Owning your response is empowering, not blaming.",
      ],
    },
    {
      icon: "🔁",
      name: "The reframe",
      tag: "Temporary, specific, not you.",
      summary:
        "Resilient people explain setbacks differently. Instead of permanent, pervasive and personal ('it'll always be like this, it ruins everything, it's all my fault'), they see them as temporary, specific and workable.",
      points: [
        "<strong>Temporary,</strong> not permanent — 'this is hard right now'.",
        "<strong>Specific,</strong> not pervasive — one area, not your whole life.",
        "<strong>Workable,</strong> not a verdict on your worth.",
        "How you explain a setback shapes what you do next.",
      ],
    },
    {
      icon: "🧗",
      name: "The comeback steps",
      tag: "Accept, reframe, act, connect.",
      summary:
        "A reliable route back: accept what you can't change, reframe the story, take one small action you can control, and reach out for support. Momentum, not perfection, is the goal.",
      points: [
        "<strong>Accept</strong> the parts you can't change.",
        "<strong>Reframe</strong> the setback as temporary and specific.",
        "<strong>Act</strong> — one small step you fully control.",
        "<strong>Connect</strong> — support beats isolation.",
      ],
    },
    {
      icon: "💪",
      name: "Building resilience",
      tag: "A skill, not a trait.",
      summary:
        "Resilience is built like a muscle: through perspective, habits and repetition. Each setback you meet well makes the next one easier. You're not born with a fixed amount of it.",
      points: [
        "Perspective: most setbacks matter less in a year.",
        "Habits: sleep, movement, and people who lift you.",
        "Practice: each recovery builds the next.",
        "Self-compassion beats self-punishment for bouncing back.",
      ],
    },
  ],

  assessment: {
    mode: "score",
    shuffle: false,
    shuffleOptions: false,
    kicker: "Self-check",
    heading: "How resilient is your response?",
    sub: "Rate how true each statement is of you. There are no wrong answers — this is a mirror, not a test.",
    nav: "Self-check",
    icon: "🧗",
    introTitle: "12 statements",
    introText: "Answer honestly about how you <em>usually</em> respond when things go wrong. Takes about two minutes.",
    resultEyebrow: "Your resilience level",
    scaleLow: "Reactive",
    scaleHigh: "Resilient",
    bands: [
      {
        min: 0,
        color: "#b3123a",
        label: "Reactive",
        title: "Setbacks tend to flatten you",
        blurb: "Right now, setbacks hit hard and linger. That's common and very changeable — resilience is a skill you can build, one habit at a time.",
        adviceTitle: "Start here",
        advice: [
          "Catch the spiral: notice when one setback becomes 'always'.",
          "Reframe one setback as temporary and specific, not permanent.",
          "Take a single small action you fully control today.",
          "Reach out to one person instead of withdrawing.",
        ],
      },
      {
        min: 50,
        color: "#f0a500",
        label: "Developing",
        title: "You recover — but it takes a toll",
        blurb: "You bounce back, though setbacks still knock you off balance for a while. A few sharper habits will speed up your comebacks.",
        adviceTitle: "Level up",
        advice: [
          "Shorten the rumination window — act sooner.",
          "Practise the reframe deliberately, in writing.",
          "Protect the basics: sleep, movement, support.",
          "Separate a single failure from your self-worth.",
        ],
      },
      {
        min: 75,
        color: "#2a9d5c",
        label: "Resilient",
        title: "You bounce back well",
        blurb: "You meet setbacks with perspective and action. Keep the habits sharp — and share them, because resilience is contagious.",
        adviceTitle: "Keep it strong",
        advice: [
          "Keep naming setbacks as temporary and specific.",
          "Stay connected and keep your recovery habits.",
          "Help others reframe — teaching deepens the skill.",
          "Watch for burnout: resilience isn't relentless pushing.",
        ],
      },
    ],
    questions: [
      "When something goes wrong, I focus on what I can control rather than who to blame.",
      "I treat setbacks as temporary, not permanent.",
      "I can separate a single failure from my worth as a person.",
      "After a knock, I focus on the next small step I can take.",
      "I ask 'what can I learn from this?' instead of 'why me?'.",
      "I stay hopeful that things can improve with effort.",
      "I reach out for support instead of isolating when things get hard.",
      "I can accept the things I genuinely cannot change.",
      "I avoid blowing a bad day up into a bad life.",
      "I keep perspective — most setbacks matter less a year later.",
      "I take responsibility for my response, even when the cause wasn't my fault.",
      "I bounce back from disappointment within a reasonable time.",
    ].map((q) => ({
      q,
      options: [
        { text: "Strongly disagree", points: 0 },
        { text: "Disagree", points: 1 },
        { text: "Agree", points: 2 },
        { text: "Strongly agree", points: 3 },
      ],
    })),
  },

  handle: {
    kicker: "Field Guide",
    heading: "Your comeback routine",
    sub: "You can't choose the setback. You can choose the comeback.",
    nav: "Comeback",
    cta: "Read the comeback guide →",
    cards: [
      { icon: "✅", title: "Do", tone: "do", items: [
        "Pause before reacting — use the gap", "Reframe: temporary, specific, workable", "Take one small action you control", "Reach out instead of isolating", "Treat yourself as you would a friend",
      ]},
      { icon: "⛔", title: "Don't", tone: "dont", items: [
        "Turn one setback into 'I always fail'", "Ruminate without acting", "Make it a verdict on your worth", "Withdraw from people who help", "Punish yourself back to motivation",
      ]},
      { icon: "🧗", title: "The comeback routine", tone: "", items: [
        "Accept what you can't change", "Reframe the story you're telling", "Act — one controllable step", "Connect — ask for support", "Repeat: momentum over perfection",
      ]},
    ],
  },

  faq: [
    { q: "Is resilience something you're born with?", a: "No. It's a skill built through perspective, habits and practice. Each setback you meet well makes the next easier — anyone can strengthen it." },
    { q: "Doesn't 'take responsibility for your response' mean blaming the victim?", a: "No. It's not about blame for the event — often that's outside your control. It's about reclaiming power over the one thing you can steer: what you do next." },
    { q: "What's the 'setback spiral'?", a: "It's when a single setback snowballs in your mind into 'I always fail', which lowers effort and causes more setbacks. Catching that story early breaks the loop." },
    { q: "What if I'm really struggling?", a: "This workshop is educational, not therapy. If setbacks are overwhelming you or affecting your mental health, please reach out to a professional or a trusted support service." },
    { q: "How is a reframe different from toxic positivity?", a: "Reframing isn't pretending everything's fine. It's seeing a setback accurately — as temporary and specific rather than permanent and total — so you can act." },
    { q: "How long should bouncing back take?", a: "There's no fixed timer, and big losses take real time. Resilience isn't instant recovery — it's not getting permanently stuck in the spiral." },
  ],
};
