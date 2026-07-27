/* =============================================================================
   Conflict Styles (Thomas–Kilmann) — content
   Educational workshop on the five conflict-handling modes.
   Assessment mode: "classify" (five styles).
   ========================================================================== */
const BOOK = {
  meta: {
    key: "conflict",
    title: "Conflict Styles",
    subtitle: "How you handle disagreement (Thomas–Kilmann)",
    short: "Conflict Styles",
    emoji: "⚔️",
    accent: "#ea580c",
    eyebrow: "A Behaviour Framework",
    description:
      "An educational workshop on the Thomas–Kilmann conflict modes. Discover your default conflict style and learn to flex to the situation.",
    heroTitle: "How do you<br />handle conflict?",
    heroLead:
      "Everyone has a go-to move when tensions rise. The <em>Thomas–Kilmann</em> model maps five conflict styles across assertiveness and cooperation. Find yours — and learn when to switch.",
    heroCta: "Find your conflict style",
    footerNote:
      "An educational workshop on the Thomas–Kilmann Conflict Mode framework. A tool for reflection and better disagreements, not a formal assessment.",
    footerSupport:
      "The five conflict modes come from the Thomas–Kilmann Conflict Mode Instrument. Explore the other frameworks in <strong>The People Library</strong>.",
  },

  learn: {
    kicker: "The Ideas",
    heading: "Five ways to meet a clash",
    sub: "Every conflict style is a mix of how much you assert your own needs and how much you cooperate with the other person. Tap a card to go deeper.",
  },

  concepts: [
    {
      icon: "📐", name: "Two dimensions", tag: "Assertiveness × cooperation.",
      summary: "The model plots conflict behaviour on two axes: how much you pursue your own concerns (assertiveness) and how much you pursue the other person's (cooperativeness). Five styles emerge from the corners and centre.",
      points: ["<strong>Assertiveness</strong> — standing up for your needs.", "<strong>Cooperativeness</strong> — attending to theirs.", "The mix produces five distinct modes.", "Everyone can use all five — you just default to one or two."],
    },
    {
      icon: "🎭", name: "The five modes", tag: "Compete, collaborate, compromise, avoid, accommodate.",
      summary: "Competing (I win), accommodating (you win), avoiding (nobody engages), collaborating (we both win), and compromising (we both give a little). Each fits some situations and misfits others.",
      points: ["<strong>Competing</strong> — high assert, low cooperate.", "<strong>Accommodating</strong> — low assert, high cooperate.", "<strong>Avoiding</strong> — low on both.", "<strong>Collaborating</strong> — high on both.", "<strong>Compromising</strong> — moderate on both."],
    },
    {
      icon: "🎯", name: "No 'best' style", tag: "It's situational.",
      summary: "There's no single right style. Competing suits emergencies; accommodating preserves a valued relationship; avoiding buys time; collaborating solves the important things; compromising settles the rest. Skill is matching the style to the moment.",
      points: ["Emergencies may need competing.", "Trivial issues may need avoiding.", "Big, shared problems reward collaborating.", "Wisdom is flexing, not defaulting."],
    },
    {
      icon: "👀", name: "Read the other side", tag: "Two styles, one clash.",
      summary: "Conflicts are shaped by both people's styles. Two competers escalate; an avoider frustrates a collaborator; an accommodator gets steamrolled by a competer. Spotting both styles helps you steer.",
      points: ["Two competers escalate fast.", "Avoiders leave issues unresolved.", "Accommodators can be run over.", "Naming the dynamic calms it."],
    },
    {
      icon: "🤸", name: "Flex your style", tag: "Grow your range.",
      summary: "The goal is range: to reach for the style the situation calls for rather than always using your favourite. That usually means practising the modes you avoid — often collaborating or, for some, healthy competing.",
      points: ["Notice your automatic default.", "Practise your under-used modes.", "Pick the style on purpose.", "Range beats a single strong habit."],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Self-assessment",
    heading: "What's your conflict style?",
    sub: "Answer how you actually tend to react when there's a disagreement — not how you think you should.",
    nav: "Find yours",
    icon: "⚔️",
    introTitle: "10 questions",
    introText: "Think about how you usually behave in a real disagreement, and pick what fits <em>you</em> best.",
    resultEyebrow: "Your default conflict style",
    categories: {
      competing: { name: "Competing", icon: "🦁", color: "#b91c1c",
        summary: "Assertive and uncooperative — you pursue your own position firmly. Great in a crisis or on principle; costly for relationships if it's your only mode.",
        signsTitle: "You tend to", handleTitle: "How to work with you",
        signs: ["Stand your ground firmly", "Push for your outcome", "Decide fast under pressure", "Can steamroll quieter people"],
        handle: ["Be direct and confident back", "Bring facts, not feelings", "Pick genuinely important battles", "Invite others' input to balance you"] },
      collaborating: { name: "Collaborating", icon: "🤝", color: "#2a9d5c",
        summary: "Assertive and cooperative — you dig for a solution that works for everyone. Powerful for important issues, but slow for trivial ones.",
        signsTitle: "You tend to", handleTitle: "How to work with you",
        signs: ["Seek win-win solutions", "Surface everyone's needs", "Invest time to solve it fully", "Can over-engineer small issues"],
        handle: ["Engage openly and honestly", "Share the real underlying needs", "Reserve it for issues that matter", "Don't mistake it for indecision"] },
      compromising: { name: "Compromising", icon: "⚖️", color: "#f0a500",
        summary: "Moderate on both — you look for a fair middle ground where each side gives a little. Fast and practical, though no one gets everything.",
        signsTitle: "You tend to", handleTitle: "How to work with you",
        signs: ["Split the difference", "Value fairness and speed", "Trade concessions", "Can settle too quickly"],
        handle: ["Come ready to give and take", "Be clear on your must-haves", "Use it when time is short", "Push for collaboration on big issues"] },
      avoiding: { name: "Avoiding", icon: "🚪", color: "#0891b2",
        summary: "Unassertive and uncooperative — you sidestep the conflict. Useful to cool off or dodge trivial fights; harmful when real issues get buried.",
        signsTitle: "You tend to", handleTitle: "How to work with you",
        signs: ["Sidestep or delay conflict", "Keep the peace by withdrawing", "Let some issues fade", "Can leave real problems unresolved"],
        handle: ["Make it safe to engage", "Raise issues gently, not by ambush", "Give time to prepare", "Follow up so it isn't just buried"] },
      accommodating: { name: "Accommodating", icon: "🕊️", color: "#7c3aed",
        summary: "Cooperative and unassertive — you give way to keep the relationship or peace. Generous and gracious, but risky if you never voice your own needs.",
        signsTitle: "You tend to", handleTitle: "How to work with you",
        signs: ["Yield to keep harmony", "Put others' needs first", "Rarely push your own view", "Can build quiet resentment"],
        handle: ["Actively ask for their opinion", "Don't take their 'yes' at face value", "Make it safe to disagree", "Protect them from being steamrolled"] },
    },
    questions: [
      { q: "When a disagreement flares, your instinct is to…", options: [
        { text: "Push hard for your position", cat: "competing" },
        { text: "Dig for a solution that works for all", cat: "collaborating" },
        { text: "Find a fair middle ground", cat: "compromising" },
        { text: "Step back and let it cool", cat: "avoiding" },
        { text: "Give way to keep the peace", cat: "accommodating" } ] },
      { q: "Winning the argument is…", options: [
        { text: "Important — I like to prevail", cat: "competing" },
        { text: "Less important than solving it well", cat: "collaborating" },
        { text: "Fine to split down the middle", cat: "compromising" },
        { text: "Not worth the stress", cat: "avoiding" },
        { text: "Less important than the relationship", cat: "accommodating" } ] },
      { q: "Under pressure you're most likely to…", options: [
        { text: "Take charge and decide", cat: "competing" },
        { text: "Get everyone's needs on the table", cat: "collaborating" },
        { text: "Broker a quick trade-off", cat: "compromising" },
        { text: "Buy time and withdraw", cat: "avoiding" },
        { text: "Defer to keep things calm", cat: "accommodating" } ] },
      { q: "Your risk in conflict is…", options: [
        { text: "Steamrolling people", cat: "competing" },
        { text: "Over-engineering small stuff", cat: "collaborating" },
        { text: "Settling too soon", cat: "compromising" },
        { text: "Leaving issues unresolved", cat: "avoiding" },
        { text: "Never voicing your needs", cat: "accommodating" } ] },
      { q: "You feel best about a conflict when…", options: [
        { text: "You got the outcome you wanted", cat: "competing" },
        { text: "Everyone's needs were met", cat: "collaborating" },
        { text: "It was fair to both sides", cat: "compromising" },
        { text: "It quietly went away", cat: "avoiding" },
        { text: "The relationship stayed warm", cat: "accommodating" } ] },
      { q: "When someone challenges you, you…", options: [
        { text: "Challenge right back", cat: "competing" },
        { text: "Get curious about their view", cat: "collaborating" },
        { text: "Look for a deal", cat: "compromising" },
        { text: "Change the subject or exit", cat: "avoiding" },
        { text: "Often just agree", cat: "accommodating" } ] },
      { q: "Others might say you're…", options: [
        { text: "Forceful", cat: "competing" },
        { text: "Thorough", cat: "collaborating" },
        { text: "Pragmatic", cat: "compromising" },
        { text: "Conflict-shy", cat: "avoiding" },
        { text: "Easy-going", cat: "accommodating" } ] },
      { q: "A trivial disagreement deserves…", options: [
        { text: "A quick, firm resolution", cat: "competing" },
        { text: "A proper discussion anyway", cat: "collaborating" },
        { text: "A fast split", cat: "compromising" },
        { text: "To just be let go", cat: "avoiding" },
        { text: "Letting the other person have it", cat: "accommodating" } ] },
      { q: "Your relationship priority in conflict is…", options: [
        { text: "Getting the right result", cat: "competing" },
        { text: "Result and relationship together", cat: "collaborating" },
        { text: "A workable balance", cat: "compromising" },
        { text: "Avoiding the tension", cat: "avoiding" },
        { text: "Protecting the relationship", cat: "accommodating" } ] },
      { q: "After a conflict you usually feel…", options: [
        { text: "Satisfied if you won", cat: "competing" },
        { text: "Good if it was truly solved", cat: "collaborating" },
        { text: "Okay with a fair trade", cat: "compromising" },
        { text: "Relieved it's over", cat: "avoiding" },
        { text: "Glad if peace was kept", cat: "accommodating" } ] },
    ],
  },

  handle: {
    kicker: "Put it to work",
    heading: "Flexing your style",
    sub: "There's no best style — only the best style for this moment. Grow your range.",
    nav: "Apply",
    cta: "Back to the People Library →",
    cards: [
      { icon: "🧭", title: "Match the moment", tone: "do", items: [
        "Compete when it's an emergency or principle", "Collaborate on important, shared problems", "Compromise when time is short", "Avoid truly trivial or heated moments", "Accommodate when the relationship matters most",
      ]},
      { icon: "🤸", title: "Grow your range", tone: "", items: [
        "Notice your automatic default", "Practise the modes you dodge", "Choose your style consciously", "Ask what the situation actually needs", "Watch how others' styles shape the clash",
      ]},
      { icon: "⛔", title: "Avoid", tone: "dont", items: [
        "Using one style for everything", "Competing over things that don't matter", "Avoiding issues that truly need airing", "Accommodating until you resent it", "Reading their style as a personal attack",
      ]},
    ],
  },

  faq: [
    { q: "Which conflict style is best?", a: "None — it's situational. The skill is flexing: competing in a crisis, collaborating on big shared issues, compromising when time is short, and so on." },
    { q: "Can I have more than one style?", a: "Yes. Most people have a primary and a back-up. The result shows your strongest leaning plus the balance across all five." },
    { q: "Is avoiding always bad?", a: "No. Avoiding is wise for trivial issues or to let a heated moment cool. It only hurts when it becomes your answer to everything." },
    { q: "I always accommodate — is that a problem?", a: "It's generous, but if you never voice your own needs it breeds resentment and lets others steamroll you. Practise a little healthy assertiveness." },
    { q: "How do I deal with a 'competing' person?", a: "Stay calm and confident, bring facts, pick your battles, and don't be provoked. Meeting force with panic or with more force both backfire." },
    { q: "Can my style change?", a: "Yes. Styles are habits, not fixed traits. With awareness and practice you can widen your range and choose your response." },
  ],
};
