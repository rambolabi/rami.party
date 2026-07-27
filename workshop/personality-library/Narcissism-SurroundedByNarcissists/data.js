/* =============================================================================
   Surrounded by Narcissists — content
   Educational workshop inspired by Thomas Erikson's "Surrounded by Narcissists".
   Recognising narcissistic styles and holding your ground — NOT a clinical or
   diagnostic tool. Assessment mode: "classify" (four narcissist styles).
   ========================================================================== */
const BOOK = {
  meta: {
    key: "narcissists",
    title: "Surrounded by Narcissists",
    subtitle: "Recognise the four faces and hold your ground",
    short: "Narcissists",
    emoji: "🪞",
    accent: "#7c3aed",
    eyebrow: "A Thomas Erikson Workshop",
    description:
      "An educational workshop inspired by Thomas Erikson's 'Surrounded by Narcissists'. Learn the four faces of narcissism and how to keep your footing — not a clinical or diagnostic tool.",
    heroTitle: "Always the most<br />important person<br />in the room?",
    heroLead:
      "Some people bend every situation back to themselves. Learn the four faces of narcissism from Thomas Erikson's <em>Surrounded by Narcissists</em> — and how to protect your footing.",
    heroCta: "Identify the type",
    footerNote:
      "An educational workshop inspired by <em>Surrounded by Narcissists</em> by Thomas Erikson. It helps you recognise self-centred behaviour and protect yourself — it is not a clinical or diagnostic tool.",
  },

  learn: {
    kicker: "The Ideas",
    heading: "The four faces of narcissism",
    sub: "Narcissism runs on a spectrum, and it wears more than one mask. Tap a card to go deeper.",
  },

  concepts: [
    {
      icon: "🌈",
      name: "The spectrum",
      tag: "From healthy confidence to disorder.",
      summary:
        "A little self-focus is healthy. Narcissism becomes a problem when someone consistently needs to be superior, lacks empathy, and treats others as tools for their own image. Most difficult people sit somewhere on the spectrum — not at the clinical extreme.",
      points: [
        "Healthy self-esteem doesn't require others to be smaller.",
        "The problem pattern: grandiosity + entitlement + missing empathy.",
        "Traits exist on a scale — behaviour is what you respond to, not labels.",
        "You can't argue someone out of a fragile, defended self-image.",
      ],
    },
    {
      icon: "🎭",
      name: "The four faces",
      tag: "Grandiose, vulnerable, communal, malignant.",
      summary:
        "Narcissism shows up in very different styles. The grandiose boasts; the vulnerable sulks; the communal performs virtue; the malignant controls. The assessment helps you spot which you're dealing with.",
      points: [
        "<strong>Grandiose:</strong> loud, superior, admiration-hungry.",
        "<strong>Vulnerable:</strong> fragile, wounded, eternal victim.",
        "<strong>Communal:</strong> the 'saint' who needs to be seen as good.",
        "<strong>Malignant:</strong> narcissism plus aggression and control.",
      ],
    },
    {
      icon: "🔄",
      name: "The cycle",
      tag: "Idealise, devalue, discard.",
      summary:
        "Relationships with a narcissist often follow a pattern: they idealise you (love-bombing), then devalue you as reality intrudes, then discard you — before sometimes hoovering you back in.",
      points: [
        "<strong>Idealise:</strong> intense praise and attention up front.",
        "<strong>Devalue:</strong> criticism, coldness, moving the goalposts.",
        "<strong>Discard:</strong> withdrawal, replacement, or blame.",
        "Recognising the cycle helps you stop taking it personally.",
      ],
    },
    {
      icon: "⛽",
      name: "Supply & the false self",
      tag: "Why they need you.",
      summary:
        "Underneath the bravado is a brittle self-image that needs constant feeding — attention, admiration, drama, or control. That fuel is called 'narcissistic supply', and you are a source of it.",
      points: [
        "The confident mask hides a fragile core.",
        "Attention — even negative attention — is fuel.",
        "Withdrawing your reaction starves the pattern.",
        "You are not responsible for propping up their self-image.",
      ],
    },
    {
      icon: "🛡️",
      name: "Holding your ground",
      tag: "Boundaries, grey rock, distance.",
      summary:
        "You won't change a narcissist by explaining how they hurt you. You protect yourself with boundaries, low emotional reactivity, and — where needed — distance.",
      points: [
        "Set boundaries and enforce them without long debates.",
        "Use 'grey rock': calm, brief, unrewarding responses.",
        "Keep your reality anchored with trusted friends.",
        "For malignant behaviour, prioritise safety and distance.",
      ],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Which face?",
    heading: "Which narcissist are you dealing with?",
    sub: "Think of one specific person. Answer what you observe about them, and we'll estimate which style fits best.",
    nav: "Identify",
    icon: "🔎",
    introTitle: "12 observations",
    introText: "Hold one person in mind and choose the option that fits <em>them</em> best. There are no wrong answers.",
    resultEyebrow: "The style you're dealing with",
    categories: {
      grandiose: {
        name: "The Grandiose Narcissist",
        icon: "👑",
        color: "#7c3aed",
        summary:
          "The classic narcissist: grand, superior and hungry for admiration. Dazzling on the surface, contemptuous underneath.",
        signs: ["Boasts and name-drops constantly", "Needs to be the best and the centre", "Belittles 'ordinary' people", "Meets criticism with contempt", "Charming until you stop admiring them"],
        handle: ["Don't feed the need for applause", "Stay calm and unimpressed", "Keep boundaries factual and firm", "Don't compete for status", "Limit your emotional investment"],
      },
      vulnerable: {
        name: "The Vulnerable Narcissist",
        icon: "🌧️",
        color: "#db2777",
        summary:
          "The fragile, covert narcissist: outwardly insecure and hard-done-by, yet just as self-focused — everything routes back to their pain.",
        signs: ["Chronic victimhood", "Hypersensitive to slights", "Envious and resentful", "Passive-aggressive", "Guilt-trips you through their suffering"],
        handle: ["Don't get trapped in rescuing them", "Resist the guilt pull", "Set gentle but firm limits", "Refuse blame that isn't yours", "Protect your own energy"],
      },
      communal: {
        name: "The Communal Narcissist",
        icon: "😇",
        color: "#0891b2",
        summary:
          "The 'saintly' narcissist: seeks status through visible virtue. The kindest person in the room — as long as everyone is watching.",
        signs: ["Loud, performative kindness", "Keeps score of good deeds", "Different in private", "Guilt about all they 'give'", "Craves moral admiration"],
        handle: ["Notice the audience-dependence", "Don't be swept up by the performance", "Thank them, but don't over-owe", "Keep your own moral compass", "Judge actions, not announcements"],
      },
      malignant: {
        name: "The Malignant Narcissist",
        icon: "🐍",
        color: "#b91c1c",
        summary:
          "The most dangerous blend: narcissism plus aggression and a taste for control. Charm hides genuine cruelty.",
        signs: ["Manipulative and controlling", "Vengeful when crossed", "Little or no remorse", "Enjoys others' discomfort", "Can be intimidating or threatening"],
        handle: ["Prioritise your safety", "Reduce contact and disengage", "Document everything", "Don't confront them alone", "Seek professional or legal support if needed"],
      },
    },
    questions: [
      { q: "How do they usually seek attention?", options: [
        { text: "Boasting openly about their success and status", cat: "grandiose" },
        { text: "Hinting how unappreciated and hard-done-by they are", cat: "vulnerable" },
        { text: "Making sure everyone sees how caring they are", cat: "communal" },
        { text: "Dominating the room until all eyes are on them", cat: "malignant" },
      ]},
      { q: "When criticised, they…", options: [
        { text: "Dismiss you as jealous or beneath them", cat: "grandiose" },
        { text: "Collapse into wounded self-pity", cat: "vulnerable" },
        { text: "Act shocked anyone could doubt such a good person", cat: "communal" },
        { text: "Retaliate and try to make you pay", cat: "malignant" },
      ]},
      { q: "Deep down, how do they see themselves?", options: [
        { text: "Superior and exceptional", cat: "grandiose" },
        { text: "Fragile but secretly special and misunderstood", cat: "vulnerable" },
        { text: "The most selfless, moral person around", cat: "communal" },
        { text: "Entitled to win at any cost", cat: "malignant" },
      ]},
      { q: "How do they treat people who can't help them?", options: [
        { text: "Ignore them as irrelevant", cat: "grandiose" },
        { text: "Envy and quietly resent them", cat: "vulnerable" },
        { text: "Perform kindness when there's an audience", cat: "communal" },
        { text: "Exploit or discard them coldly", cat: "malignant" },
      ]},
      { q: "In an argument they…", options: [
        { text: "Talk over you with grand certainty", cat: "grandiose" },
        { text: "Turn it around so they're the victim", cat: "vulnerable" },
        { text: "Guilt-trip you about all they've done for you", cat: "communal" },
        { text: "Threaten, punish or intimidate", cat: "malignant" },
      ]},
      { q: "Their empathy is…", options: [
        { text: "Thin — others exist to admire them", cat: "grandiose" },
        { text: "Aimed entirely at their own pain", cat: "vulnerable" },
        { text: "A public performance, not a private habit", cat: "communal" },
        { text: "Essentially absent, sometimes cruel", cat: "malignant" },
      ]},
      { q: "What do they crave most?", options: [
        { text: "Admiration and status", cat: "grandiose" },
        { text: "Reassurance and sympathy", cat: "vulnerable" },
        { text: "To be seen as the best and kindest", cat: "communal" },
        { text: "Power and control", cat: "malignant" },
      ]},
      { q: "When you succeed, they…", options: [
        { text: "Make it about themselves", cat: "grandiose" },
        { text: "Sulk or feel threatened", cat: "vulnerable" },
        { text: "Claim they made it possible", cat: "communal" },
        { text: "Undermine or sabotage you", cat: "malignant" },
      ]},
      { q: "Their charm feels…", options: [
        { text: "Confident and dazzling", cat: "grandiose" },
        { text: "Soft, needy and sympathetic", cat: "vulnerable" },
        { text: "Warm, virtuous and helpful", cat: "communal" },
        { text: "Calculated and predatory", cat: "malignant" },
      ]},
      { q: "How do they handle rules and boundaries?", options: [
        { text: "The rules don't apply to someone like them", cat: "grandiose" },
        { text: "They feel persecuted by them", cat: "vulnerable" },
        { text: "They bend them 'for the greater good'", cat: "communal" },
        { text: "They break them and dare you to object", cat: "malignant" },
      ]},
      { q: "After a conflict, they…", options: [
        { text: "Expect you to come crawling back", cat: "grandiose" },
        { text: "Wait for you to comfort and apologise to them", cat: "vulnerable" },
        { text: "Remind everyone how forgiving they are", cat: "communal" },
        { text: "Hold a grudge and plan payback", cat: "malignant" },
      ]},
      { q: "The feeling you're left with is…", options: [
        { text: "Small and unseen", cat: "grandiose" },
        { text: "Drained and guilty", cat: "vulnerable" },
        { text: "Confused — they seem so 'nice'", cat: "communal" },
        { text: "Anxious or afraid", cat: "malignant" },
      ]},
    ],
  },

  handle: {
    kicker: "Field Guide",
    heading: "How to hold your ground",
    sub: "You can't reason a narcissist out of their self-image. You can protect your own footing.",
    nav: "Protect",
    cta: "Read the survival guide →",
    cards: [
      { icon: "✅", title: "Do", tone: "do", items: [
        "Keep boundaries clear and consistent", "Stay calm and low-drama (grey rock)", "Keep your own version of reality anchored", "Reduce contact where you can", "Look after your own support network",
      ]},
      { icon: "⛔", title: "Don't", tone: "dont", items: [
        "Expect them to see your point of view", "Argue for validation you won't get", "Compete for status or the moral high ground", "Blame yourself for the cycle", "Isolate yourself from allies",
      ]},
      { icon: "🪨", title: "Grey rock & boundaries", tone: "", items: [
        "Be calm, brief and unrewarding to provoke", "State boundaries once, then act on them", "Don't explain or justify repeatedly", "Withdraw the emotional 'supply'", "Escalate to support if it turns malignant",
      ]},
    ],
  },

  faq: [
    { q: "Does this test diagnose narcissism?", a: "No. It's an educational reflection tool that estimates which <em>style</em> of self-centred behaviour you may be seeing. Only a qualified professional can diagnose narcissistic personality disorder." },
    { q: "Can someone be more than one type?", a: "Yes. The four faces overlap, and people shift between them depending on the situation. Your result shows the strongest match plus the balance across all four." },
    { q: "Can a narcissist change?", a: "Deep change is rare and requires genuine motivation and professional help. Your wellbeing shouldn't hinge on waiting for it — focus on boundaries and self-protection." },
    { q: "What is 'grey rock'?", a: "Grey rock means becoming as boring and unreactive as a grey stone: calm, brief, and emotionally flat, so you stop supplying the attention and drama the pattern feeds on." },
    { q: "Isn't calling people 'narcissists' unfair?", a: "It can be. This workshop is about recognising <em>behaviour patterns</em> and protecting yourself — not slapping labels on people. Use it privately, to make sense of what you're experiencing." },
    { q: "What if it's malignant and I feel unsafe?", a: "Prioritise your safety. Reduce contact, document incidents, avoid confronting them alone, and reach out to a counsellor, trusted people, or local support services." },
  ],

  disc: {
    kicker: "The Four Colours",
    heading: "Narcissists and the four colours",
    sub: "Each DISC colour gets caught by a narcissist differently. Know your reflex — and protect it.",
    nav: "Colours",
    labels: { relate: "How this colour reacts", reflect: "If this is you — watch for", treat: "Your best protection" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Find your colour in the DISC workshop →",
    colors: {
      red: {
        relate: "Reds clash head-on, turning every interaction into a power struggle a narcissist relishes.",
        reflect: "Your need to win can keep you locked in a fight the narcissist will never concede.",
        treat: "Pick your battles and disengage from ego contests. Protect your goals, not your pride.",
      },
      yellow: {
        relate: "Yellows are love-bombed easily and crave the narcissist's dazzling approval.",
        reflect: "Your hunger for admiration makes the idealise phase intoxicating — and the discard crushing.",
        treat: "Anchor your worth outside their applause, and keep honest friends close.",
      },
      green: {
        relate: "Greens absorb the blame and keep the peace, which a narcissist happily exploits.",
        reflect: "Your loyalty and dislike of conflict can trap you in the cycle far too long.",
        treat: "Practise saying no. Keeping the peace is not yours alone to carry.",
      },
      blue: {
        relate: "Blues try to reason and prove points a narcissist will never genuinely accept.",
        reflect: "You can waste energy chasing a logical acknowledgement that never comes.",
        treat: "Stop debating for validation. Rely on facts, records and firm boundaries instead.",
      },
    },
  },
};
