/* =============================================================================
   Surrounded by Vampires — content
   Educational workshop inspired by Thomas Erikson's book on energy vampires.
   Recognising who drains you and protecting your energy.
   Assessment mode: "classify" (four energy-vampire types).
   ========================================================================== */
const BOOK = {
  meta: {
    key: "vampires",
    title: "Surrounded by Vampires",
    subtitle: "Spot the energy drainers and protect your battery",
    short: "Vampires",
    emoji: "🧛",
    accent: "#9d174d",
    eyebrow: "A Thomas Erikson Workshop",
    description:
      "An educational workshop inspired by Thomas Erikson's work on energy vampires. Learn the four kinds of energy drainer and how to protect your energy.",
    heroTitle: "Who's draining<br />your battery?",
    heroLead:
      "Some people leave you flat every single time. Learn the four kinds of energy vampire — inspired by Thomas Erikson's <em>Surrounded by Vampires</em> — and how to protect your energy.",
    heroCta: "Identify the drainer",
    footerNote:
      "An educational workshop inspired by <em>Surrounded by Vampires</em> by Thomas Erikson. A tool for reflection and healthier relationships — not a label to pin on anyone.",
  },

  learn: {
    kicker: "The Ideas",
    heading: "The people who drain you",
    sub: "Energy vampires aren't monsters — they're people whose habits leave you depleted. Tap a card to go deeper.",
  },

  concepts: [
    {
      icon: "🧛",
      name: "What is an energy vampire?",
      tag: "Depletion, not evil.",
      summary:
        "An energy vampire is anyone who consistently leaves you drained — through negativity, neediness, chaos or control. Most aren't doing it on purpose; it's simply their default way of relating. Naming the pattern is the first step to protecting yourself.",
      points: [
        "The tell is simple: you feel worse after every encounter.",
        "It's usually habit, not deliberate cruelty.",
        "Your energy is a resource worth defending.",
        "You can care about someone and still limit the drain.",
      ],
    },
    {
      icon: "🩸",
      name: "The four types",
      tag: "Victim, critic, drama, controller.",
      summary:
        "Energy drainers cluster into recognisable styles: the eternal victim, the relentless critic, the drama magnet, and the controller. Each drains you differently — and each is handled differently.",
      points: [
        "<strong>The Victim:</strong> drains through guilt and endless problems.",
        "<strong>The Critic:</strong> drains through negativity and judgment.",
        "<strong>The Drama Magnet:</strong> drains through constant crisis.",
        "<strong>The Controller:</strong> drains through pressure and obligation.",
      ],
    },
    {
      icon: "🔋",
      name: "How they drain you",
      tag: "They hook your best instincts.",
      summary:
        "Energy vampires latch onto your empathy, your desire to help, your need for approval, or your fear of conflict. The drain works because you keep giving what they keep taking.",
      points: [
        "Guilt keeps you rescuing the victim.",
        "The wish for approval keeps you near the critic.",
        "Adrenaline keeps you hooked on the drama.",
        "Fear of conflict keeps you obeying the controller.",
      ],
    },
    {
      icon: "🛡️",
      name: "Protect your energy",
      tag: "Boundaries and distance.",
      summary:
        "You protect your battery by limiting exposure, holding boundaries, and refusing to supply the reaction they feed on. You don't have to fix them — just stop draining yourself.",
      points: [
        "Limit the time and access they get.",
        "Hold boundaries without long justifications.",
        "Don't supply the guilt, approval or drama they seek.",
        "Refill your own energy deliberately.",
      ],
    },
    {
      icon: "💡",
      name: "Manage your own state",
      tag: "You control the outlet.",
      summary:
        "The one thing you always control is your own reaction. Stay calm, keep perspective, and decide in advance how much you're willing to give. A steady you is a much smaller target.",
      points: [
        "Decide your limits before the encounter, not during.",
        "Stay calm — your reaction is the fuel.",
        "Keep perspective on what's really your responsibility.",
        "Protect and refill your energy on purpose.",
      ],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Identify",
    heading: "Which energy vampire is it?",
    sub: "Think of one specific person who leaves you drained. Answer what you observe, and we'll estimate which type they are.",
    nav: "Identify",
    icon: "🔎",
    introTitle: "12 observations",
    introText: "Hold one draining person in mind and choose the option that fits <em>them</em> best.",
    resultEyebrow: "The energy vampire you're facing",
    categories: {
      victim: {
        name: "The Victim",
        icon: "🌀",
        color: "#6d28d9",
        summary:
          "Nothing is ever their fault and nothing ever improves. They drain you through guilt and a bottomless need to be rescued.",
        signs: ["A constant tale of woe", "Never their responsibility", "Rejects every solution offered", "Makes you feel guilty and needed", "Never actually changes anything"],
        handle: ["Show empathy without taking ownership", "Stop offering solutions they'll reject", "Set limits on rescue time", "Refuse the guilt", "Point them toward real, professional help"],
      },
      critic: {
        name: "The Critic",
        icon: "🗯️",
        color: "#b45309",
        summary:
          "A relentless fault-finder. Their negativity and judgment slowly shrink your confidence and your energy.",
        signs: ["Finds the flaw in everything", "Backhanded compliments", "Rarely says anything positive", "Judges people and choices", "Leaves you self-doubting"],
        handle: ["Don't chase their approval", "Consider the source", "Keep your own standards", "Limit your exposure", "Disengage instead of defending"],
      },
      drama: {
        name: "The Drama Magnet",
        icon: "🎭",
        color: "#db2777",
        summary:
          "Lurches from crisis to crisis and pulls you in. Everything is urgent, enormous and exhausting.",
        signs: ["A constant stream of emergencies", "Everything is a huge deal", "Thrives on chaos", "Escalates small things", "Leaves you frazzled"],
        handle: ["Stay calm and unhurried", "Don't match their urgency", "Separate real crises from noise", "Keep firm boundaries", "Refuse to be the audience"],
      },
      controller: {
        name: "The Controller",
        icon: "🕸️",
        color: "#0f766e",
        summary:
          "Must have things their way, and uses guilt, pressure and obligation to get it. Around them you walk on eggshells.",
        signs: ["Pushes past your boundaries", "Guilt and obligation as tools", "Their way or no way", "Punishes 'no'", "Makes you fearful of your own choices"],
        handle: ["Hold boundaries calmly", "Don't over-explain your 'no'", "Reduce the leverage they have", "Keep ownership of your decisions", "Seek support if it becomes coercive"],
      },
    },
    questions: [
      { q: "After time with them, you feel…", options: [
        { text: "Guilty and responsible for their problems", cat: "victim" },
        { text: "Judged and deflated", cat: "critic" },
        { text: "Exhausted by the constant crises", cat: "drama" },
        { text: "Pressured and boxed in", cat: "controller" },
      ]},
      { q: "Their favourite topic is…", options: [
        { text: "Everything that's gone wrong for them", cat: "victim" },
        { text: "What's wrong with everyone and everything", cat: "critic" },
        { text: "The latest emergency", cat: "drama" },
        { text: "How things should be done — their way", cat: "controller" },
      ]},
      { q: "When you share good news, they…", options: [
        { text: "Redirect to their own troubles", cat: "victim" },
        { text: "Find the flaw or the catch", cat: "critic" },
        { text: "Top it with a bigger story", cat: "drama" },
        { text: "Tell you what you should do next", cat: "controller" },
      ]},
      { q: "They keep you hooked by…", options: [
        { text: "Making you feel needed and guilty", cat: "victim" },
        { text: "Making you crave their rare approval", cat: "critic" },
        { text: "Pulling you into the excitement", cat: "drama" },
        { text: "Making you fear the fallout of 'no'", cat: "controller" },
      ]},
      { q: "Responsibility for problems…", options: [
        { text: "Is never theirs", cat: "victim" },
        { text: "Is always someone else's fault", cat: "critic" },
        { text: "Is beside the point — feel the drama", cat: "drama" },
        { text: "Is yours if you didn't obey", cat: "controller" },
      ]},
      { q: "When you set a boundary, they…", options: [
        { text: "Guilt-trip you for abandoning them", cat: "victim" },
        { text: "Belittle you for it", cat: "critic" },
        { text: "Blow it into a huge scene", cat: "drama" },
        { text: "Ignore it and push anyway", cat: "controller" },
      ]},
      { q: "They drain you through…", options: [
        { text: "Sympathy and obligation", cat: "victim" },
        { text: "Negativity and put-downs", cat: "critic" },
        { text: "Chaos and urgency", cat: "drama" },
        { text: "Guilt and pressure", cat: "controller" },
      ]},
      { q: "What they want from you is…", options: [
        { text: "Endless rescuing", cat: "victim" },
        { text: "Agreement with their judgments", cat: "critic" },
        { text: "An audience for the show", cat: "drama" },
        { text: "Compliance", cat: "controller" },
      ]},
      { q: "Around them you become…", options: [
        { text: "A therapist you never signed up to be", cat: "victim" },
        { text: "Smaller and more self-doubting", cat: "critic" },
        { text: "Swept up and frazzled", cat: "drama" },
        { text: "Someone walking on eggshells", cat: "controller" },
      ]},
      { q: "They rarely…", options: [
        { text: "Take action to fix anything", cat: "victim" },
        { text: "Say anything positive", cat: "critic" },
        { text: "Let things stay calm", cat: "drama" },
        { text: "Let you make your own choice", cat: "controller" },
      ]},
      { q: "Their default tone is…", options: [
        { text: "Woeful and helpless", cat: "victim" },
        { text: "Cutting and negative", cat: "critic" },
        { text: "Loud and chaotic", cat: "drama" },
        { text: "Demanding and boundary-pushing", cat: "controller" },
      ]},
      { q: "The relationship runs on…", options: [
        { text: "Your guilt", cat: "victim" },
        { text: "Your need for approval", cat: "critic" },
        { text: "Your adrenaline", cat: "drama" },
        { text: "Your fear", cat: "controller" },
      ]},
    ],
  },

  assessment2: {
    mode: "score",
    shuffle: false,
    shuffleOptions: false,
    kicker: "Second assessment",
    heading: "Are you draining others?",
    sub: "The bravest question of all. Rate how often each is true of you — honestly. This is a private mirror, not a verdict.",
    nav: "Is it me?",
    icon: "\uD83E\uDE9E",
    introTitle: "10 honest statements",
    introText: "Answer about your <em>own</em> habits, as truthfully as you can.",
    resultEyebrow: "Your own draining tendency",
    scaleLow: "You lift others",
    scaleHigh: "You drain others",
    bands: [
      { min: 0, color: "#2a9d5c", label: "Low", title: "You lift more than you drain", blurb: "Your habits mostly leave others energised. Keep it up — and stay aware on your hard days.", adviceTitle: "Keep it strong", advice: ["Keep giving others airtime and calm.", "Notice your stress default and manage it.", "Recharge yourself so you have energy to give."] },
      { min: 34, color: "#f0a500", label: "Some", title: "A few draining habits to watch", blurb: "You lift others often, but some habits can wear people down. Small tweaks make a big difference.", adviceTitle: "Adjust", advice: ["Catch the habit that scored highest and soften it.", "Ask a trusted friend for honest feedback.", "Vent less, connect more — and take responsibility for your state.", "Recharge yourself instead of leaning on one person."] },
      { min: 60, color: "#b3123a", label: "High", title: "You may be draining those around you", blurb: "Some of your habits likely leave people depleted. That's very changeable — and self-awareness is the whole first step.", adviceTitle: "Start here", advice: ["Own your own state instead of outsourcing it.", "Give others space, airtime and calm.", "Swap complaint for a request or an action.", "Consider talking to a coach or counsellor about the pattern."] },
    ],
    questions: [
      "I often vent my problems without really wanting a solution.",
      "I frequently point out what's wrong with things and people.",
      "I tend to turn situations into a crisis or a drama.",
      "I use guilt or pressure to get people to do what I want.",
      "When someone shares good news, I redirect it to myself.",
      "People seem tired or flat after spending time with me.",
      "I rarely take responsibility when things go wrong.",
      "I struggle to let a conversation stay light and positive.",
      "I expect others to fix my problems for me.",
      "I push past people's boundaries when I want something.",
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
    heading: "How to protect your energy",
    sub: "You don't have to fix an energy vampire. You just have to stop draining yourself.",
    nav: "Protect",
    cta: "Read the energy-protection guide →",
    cards: [
      { icon: "✅", title: "Do", tone: "do", items: [
        "Decide your limits before you engage", "Hold boundaries calmly and briefly", "Stay unreactive — your reaction is the fuel", "Limit the time and access they get", "Refill your own energy on purpose",
      ]},
      { icon: "⛔", title: "Don't", tone: "dont", items: [
        "Try to fix or rescue them", "Chase approval or win arguments", "Match their drama or urgency", "Accept guilt that isn't yours", "Let them dictate your choices",
      ]},
      { icon: "🔋", title: "Energy boundaries", tone: "", items: [
        "Cap the time: 'I've got ten minutes'", "Redirect: empathy, then move on", "Don't supply the guilt / approval / drama", "Step back when it escalates", "Recharge with people who fill you up",
      ]},
    ],
  },

  faq: [
    { q: "Is an energy vampire a bad person?", a: "Not necessarily. Most drain others out of habit, not malice — the victim genuinely feels helpless, the critic genuinely sees flaws. The behaviour is what depletes you, whatever the intent." },
    { q: "Can someone be more than one type?", a: "Yes. Many people blend types — a victim who turns controlling, a critic who loves drama. Your result shows the strongest match plus the balance across all four." },
    { q: "What if the energy vampire is me?", a: "Honest question, and a healthy one. Notice which pattern you slip into when stressed, take responsibility for your own state, and give others the calm and space you'd want." },
    { q: "How do I protect my energy without being cold?", a: "Boundaries aren't cruelty. You can be warm and still limit time, decline the guilt, and refuse to feed the drama. Kindness and self-protection can coexist." },
    { q: "When should I walk away?", a: "If someone consistently drains you and won't respect any boundary — or the relationship turns coercive — reducing or ending contact is a legitimate, healthy choice." },
    { q: "Isn't everyone draining sometimes?", a: "Yes. Everyone has hard days. The concern is a persistent <em>pattern</em> where one person's habits reliably leave you depleted." },
  ],

  disc: {
    kicker: "The Four Colours",
    heading: "Energy and the four colours",
    sub: "Each DISC colour both drains others and gets drained in its own way. Knowing both protects everyone.",
    nav: "Colours",
    labels: { relate: "How this colour drains others", reflect: "How this colour gets drained", treat: "The fix" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Explore the DISC colour workshop →",
    colors: {
      red: {
        relate: "Reds drain others by steamrolling, impatience and turning everything into pressure.",
        reflect: "Reds get drained by inefficiency, dithering and people who won't get to the point.",
        treat: "Slow down for others; protect your own energy by delegating and dropping low-value battles.",
      },
      yellow: {
        relate: "Yellows drain others with non-stop talking, drama and a need for constant attention.",
        reflect: "Yellows get drained by isolation, criticism and dull, detail-heavy routines.",
        treat: "Give others airtime; recharge with variety and people, not by dumping on one friend.",
      },
      green: {
        relate: "Greens drain others through passive resistance, guilt and never stating what they need.",
        reflect: "Greens get drained by conflict, pushiness and carrying everyone's problems.",
        treat: "Say what you need directly; protect yourself by not absorbing every burden.",
      },
      blue: {
        relate: "Blues drain others with relentless criticism, negativity and 'that will never work'.",
        reflect: "Blues get drained by chaos, vagueness and being rushed.",
        treat: "Balance critique with what's working; protect your energy with structure and clear information.",
      },
    },
  },
};
