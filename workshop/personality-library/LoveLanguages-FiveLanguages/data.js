/* =============================================================================
   The Five Love Languages — content
   Educational workshop on Gary Chapman's five love languages.
   Assessment mode: "classify" (five languages, forced-choice pairs).
   ========================================================================== */
const BOOK = {
  meta: {
    key: "lovelanguages",
    title: "The Five Love Languages",
    subtitle: "How you give and receive love",
    short: "Love Languages",
    emoji: "💗",
    accent: "#e11d48",
    eyebrow: "A Relationship Framework",
    description:
      "An educational workshop on Gary Chapman's five love languages. Discover how you most feel loved — and how to love others in their language.",
    heroTitle: "Everyone speaks<br />love differently.",
    heroLead:
      "We give love the way we like to receive it — which is why it so often gets lost in translation. Learn Gary Chapman's <em>five love languages</em> and find yours.",
    heroCta: "Find your love language",
    footerNote:
      "An educational workshop inspired by <em>The 5 Love Languages</em> by Gary Chapman. A tool for warmer relationships, not a scientific test.",
    footerSupport:
      "Inspired by <em>The 5 Love Languages</em> by Gary Chapman. If it resonates, read the book and support the author. Explore more in <strong>The People Library</strong>.",
  },

  learn: {
    kicker: "The Ideas",
    heading: "Five ways to say 'I love you'",
    sub: "Chapman found that people feel loved through five main channels — and most of us lead with one or two. Tap a card to go deeper.",
  },

  concepts: [
    {
      icon: "💗", name: "The five languages", tag: "Words, acts, gifts, time, touch.",
      summary: "Love is expressed and received through five main 'languages': words of affirmation, acts of service, receiving gifts, quality time, and physical touch. Most people have a primary one that speaks loudest to them.",
      points: ["<strong>Words</strong> — praise, encouragement, 'I love you'.", "<strong>Acts</strong> — doing helpful things for someone.", "<strong>Gifts</strong> — thoughtful tokens that say 'I was thinking of you'.", "<strong>Time</strong> — undivided attention together.", "<strong>Touch</strong> — hugs, closeness, physical affection."],
    },
    {
      icon: "🔁", name: "We give what we want", tag: "The translation gap.",
      summary: "The core insight: we naturally express love in our own language, not the other person's. A words person showers praise; an acts person quietly does chores — and each can feel unloved because the message never lands.",
      points: ["You give love in your own language by default.", "Your partner may be 'listening' on another channel.", "Effort spent in the wrong language barely registers.", "Mismatch — not a lack of love — causes much hurt."],
    },
    {
      icon: "🗣️", name: "Speak their language", tag: "Love on their channel.",
      summary: "The fix is simple but not always easy: learn the other person's primary language and deliberately love them in it — even when it isn't natural for you. That's when love finally gets through.",
      points: ["Ask and observe what lights them up.", "Do it in their language, not yours.", "Small, regular acts beat rare grand ones.", "It's a skill you can practise."],
    },
    {
      icon: "👨‍👩‍👧", name: "Beyond romance", tag: "Kids, friends, colleagues.",
      summary: "Love languages aren't just for couples. Children, friends and even colleagues have preferred ways of feeling valued. The same idea builds warmer connections everywhere.",
      points: ["Children feel loved in a primary language too.", "Friendships deepen when you speak their language.", "At work, recognition lands better tailored to the person.", "It's really a 'appreciation language' for all bonds."],
    },
    {
      icon: "⚖️", name: "Everyone has a mix", tag: "One primary, some of all.",
      summary: "You value all five to some degree, but usually one or two matter most. Knowing your own — and sharing it — helps the people who love you actually reach you.",
      points: ["You have a primary and secondary language.", "Sharing yours helps others love you well.", "Your language can shift across life stages.", "Balance still matters — don't neglect the rest."],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Self-assessment",
    heading: "What's your love language?",
    sub: "Ten quick either/or choices. In each pair, pick what would mean more to you — not what you 'should' choose.",
    nav: "Find yours",
    icon: "💗",
    introTitle: "10 either/or choices",
    introText: "Choose the option that would make <em>you</em> feel most loved. Go with your heart.",
    resultEyebrow: "Your primary love language",
    categories: {
      words: { name: "Words of Affirmation", icon: "💬", color: "#2563eb",
        summary: "You feel most loved through kind, encouraging and appreciative words. Praise and 'I love you' land deep; criticism cuts hard.",
        signsTitle: "You light up when", handleTitle: "How to love you",
        signs: ["Someone praises or encourages you", "You hear 'I'm proud of you'", "Love is spoken out loud", "Kind notes and messages"],
        handle: ["Say it out loud and often", "Praise specifically and sincerely", "Send encouraging messages", "Be gentle with criticism"] },
      acts: { name: "Acts of Service", icon: "🛠️", color: "#0891b2",
        summary: "You feel loved when people do helpful things for you. Actions speak louder than words — 'let me do that for you' is music.",
        signsTitle: "You light up when", handleTitle: "How to love you",
        signs: ["Someone lightens your load", "Chores get done without asking", "Help arrives when you're stretched", "Follow-through on promises"],
        handle: ["Do helpful things unprompted", "Ease their burden", "Keep your promises", "Notice what needs doing and do it"] },
      gifts: { name: "Receiving Gifts", icon: "🎁", color: "#db2777",
        summary: "You feel loved through thoughtful gifts and tokens — not for the cost, but because they say 'I was thinking of you'.",
        signsTitle: "You light up when", handleTitle: "How to love you",
        signs: ["A thoughtful little surprise", "Someone remembered something you mentioned", "Tokens that mark occasions", "The thought behind the gift"],
        handle: ["Give small, thoughtful tokens", "Remember the details they mention", "Mark occasions", "It's the thought, not the price"] },
      time: { name: "Quality Time", icon: "⏳", color: "#2a9d5c",
        summary: "You feel loved through undivided attention — real presence, no phones, doing things together and really talking.",
        signsTitle: "You light up when", handleTitle: "How to love you",
        signs: ["Undivided attention", "Doing things together", "Real, unhurried conversation", "Being someone's priority"],
        handle: ["Give full, phone-free attention", "Plan time together", "Listen properly", "Make them feel like a priority"] },
      touch: { name: "Physical Touch", icon: "🤗", color: "#e11d48",
        summary: "You feel loved through physical closeness — hugs, a hand held, sitting close. Touch reassures you like nothing else.",
        signsTitle: "You light up when", handleTitle: "How to love you",
        signs: ["A warm hug", "A hand on your shoulder", "Sitting close together", "Physical reassurance"],
        handle: ["Offer warm, welcome touch", "Hug hello and goodbye", "Sit close", "Reassure through physical closeness"] },
    },
    questions: [
      { q: "Which would mean more to you?", options: [ { text: "Hearing genuine praise and 'I love you'", cat: "words" }, { text: "Them doing a helpful task for you", cat: "acts" } ] },
      { q: "Which would mean more to you?", options: [ { text: "A heartfelt compliment", cat: "words" }, { text: "A thoughtful little gift", cat: "gifts" } ] },
      { q: "Which would mean more to you?", options: [ { text: "Words of encouragement", cat: "words" }, { text: "Uninterrupted time together", cat: "time" } ] },
      { q: "Which would mean more to you?", options: [ { text: "Being told you're loved", cat: "words" }, { text: "A long, warm hug", cat: "touch" } ] },
      { q: "Which would mean more to you?", options: [ { text: "Them handling a chore for you", cat: "acts" }, { text: "A surprise gift they picked for you", cat: "gifts" } ] },
      { q: "Which would mean more to you?", options: [ { text: "Help when you're overwhelmed", cat: "acts" }, { text: "An evening of full attention", cat: "time" } ] },
      { q: "Which would mean more to you?", options: [ { text: "Someone easing your workload", cat: "acts" }, { text: "Sitting close, holding hands", cat: "touch" } ] },
      { q: "Which would mean more to you?", options: [ { text: "A meaningful keepsake", cat: "gifts" }, { text: "A whole day together, just you two", cat: "time" } ] },
      { q: "Which would mean more to you?", options: [ { text: "A gift that shows they get you", cat: "gifts" }, { text: "A hug when you walk in the door", cat: "touch" } ] },
      { q: "Which would mean more to you?", options: [ { text: "Undivided, present time together", cat: "time" }, { text: "Being held close", cat: "touch" } ] },
    ],
  },

  handle: {
    kicker: "Put it to work",
    heading: "Loving people well",
    sub: "The goal isn't to change your language — it's to speak theirs.",
    nav: "Apply",
    cta: "Back to the People Library →",
    cards: [
      { icon: "✅", title: "Do", tone: "do", items: [
        "Learn your partner's primary language", "Love them in their language, not yours", "Ask directly what makes them feel loved", "Make small, regular gestures", "Share your own language too",
      ]},
      { icon: "⛔", title: "Don't", tone: "dont", items: [
        "Assume they feel loved the way you do", "Only give in your own language", "Save big gestures for rare occasions", "Take a mismatch as 'they don't care'", "Ignore the languages that aren't primary",
      ]},
      { icon: "🌍", title: "Everywhere", tone: "", items: [
        "Use it with kids and friends too", "Tailor appreciation at work to the person", "Notice what each person responds to", "Speak love in the language that lands", "Watch connection deepen",
      ]},
    ],
  },

  faq: [
    { q: "Is the love-languages idea scientific?", a: "It's a popular, practical framework rather than a rigorously validated theory. Research on it is mixed — but many couples find it a genuinely useful lens for talking about needs." },
    { q: "Can my love language change?", a: "Yes. It can shift across life stages and relationships. New parents, for example, often crave acts of service; long-distance partners crave words." },
    { q: "What if my partner and I differ?", a: "That's the norm, and the whole point. The skill is deliberately loving them in their language even when it isn't natural for you." },
    { q: "Can I have more than one?", a: "Yes — most people have a primary and a secondary language, and value all five to some degree." },
    { q: "Does it work outside romance?", a: "Very much so. Children, friends and colleagues all have preferred ways of feeling valued. It's really an 'appreciation language' for any relationship." },
    { q: "Isn't 'gifts' just materialism?", a: "No. For a gifts person it's the thought and symbolism, not the price. A hand-picked wildflower can mean more than something expensive." },
  ],
};
