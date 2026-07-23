/* =============================================================================
   DISC Workshop — Content & Question Data
   Based on the DISC model popularised by Thomas Erikson in "Surrounded by
   Idiots" and the original behavioural work of William Moulton Marston.

   All content lives here so the logic in app.js stays clean and the workshop
   text can be edited without touching the engine.
   ========================================================================== */

const DISC = {
  /* ---- The four colour profiles ------------------------------------------ */
  colors: {
    red: {
      key: "red",
      name: "Red",
      label: "Dominance",
      archetype: "The Driver",
      hex: "#e63946",
      soft: "rgba(230, 57, 70, 0.12)",
      icon: "🔴",
      tagline: "Direct, decisive and results-driven.",
      summary:
        "Reds are fast, ambitious and goal-oriented. They take charge, make quick decisions and push relentlessly toward results. Time is their most valuable currency, so they get straight to the point.",
      traits: ["Direct", "Decisive", "Competitive", "Ambitious", "Strong-willed", "Impatient"],
      communication:
        "Brief and to the point. Reds tell rather than ask, focus on the bottom line, and have little patience for small talk or long explanations. Give them the headline first.",
      decisions:
        "Fast and instinctive. They are comfortable taking risks and prefer a quick imperfect decision over a slow perfect one. They decide, then move on.",
      workEnv:
        "Fast-paced environments with autonomy, challenge and control. They dislike routine, micromanagement and anything that slows them down.",
      strengths: ["Leadership and drive", "Gets results under pressure", "Efficient problem-solving", "Takes on challenges others avoid", "Decisive in a crisis"],
      weaknesses: ["Impatient and blunt", "Poor listener", "Can be insensitive", "Controlling", "Steamrolls quieter people"],
      motivators: ["Winning", "Control and autonomy", "New challenges", "Visible results", "Power to decide"],
      stress:
        "Under pressure a Red becomes autocratic, aggressive and even more impatient — barking orders and running over people.",
      interact:
        "Be brief, be bright, be gone. Lead with the conclusion, offer clear options and let them choose, and never waste their time with unnecessary detail.",
    },
    yellow: {
      key: "yellow",
      name: "Yellow",
      label: "Influence",
      archetype: "The Inspirer",
      hex: "#f0a500",
      soft: "rgba(240, 165, 0, 0.14)",
      icon: "🟡",
      tagline: "Enthusiastic, sociable and persuasive.",
      summary:
        "Yellows are the optimists in the room. Warm, talkative and creative, they thrive on social contact, ideas and attention. They inspire others with energy and see possibility everywhere.",
      traits: ["Enthusiastic", "Optimistic", "Sociable", "Persuasive", "Creative", "Spontaneous"],
      communication:
        "Expressive and animated. Yellows tell stories, use lots of words and emotion, and love an audience. They talk more than they listen and value warmth over precision.",
      decisions:
        "Intuitive and feelings-based. They decide quickly on optimism and gut instinct, but can struggle with follow-through and details.",
      workEnv:
        "Social, collaborative and flexible, with variety, recognition and fun. They wilt in isolated, rigid or highly detailed roles.",
      strengths: ["Inspires and motivates", "Natural networker", "Creative idea generator", "Boundless energy and optimism", "Great in front of people"],
      weaknesses: ["Disorganised", "Poor with details", "Talks over others", "Overpromises", "Loses track of time and focus"],
      motivators: ["Recognition and applause", "Social approval", "New experiences", "Fun and variety", "Being liked"],
      stress:
        "Under pressure a Yellow becomes scattered, disorganised and defensive — talking even more while losing focus.",
      interact:
        "Be friendly and social, let them talk, give genuine recognition, and keep things light. Help them with structure and details without dampening their energy.",
    },
    green: {
      key: "green",
      name: "Green",
      label: "Steadiness",
      archetype: "The Supporter",
      hex: "#2a9d5c",
      soft: "rgba(42, 157, 92, 0.13)",
      icon: "🟢",
      tagline: "Calm, patient and dependable.",
      summary:
        "Greens are the steady, loyal glue of any team. Patient, kind and reliable, they value harmony and security, listen more than they speak, and quietly support everyone around them.",
      traits: ["Patient", "Reliable", "Supportive", "Loyal", "Good listener", "Easy-going"],
      communication:
        "Warm and gentle. Greens listen carefully, speak softly and avoid conflict. They are agreeable and considerate, rarely pushing their own opinion forward.",
      decisions:
        "Slow and cautious. They seek consensus, dislike sudden change and prefer security. They need time and reassurance before committing.",
      workEnv:
        "Stable, harmonious and predictable, with cooperation and clear security. They dislike conflict, upheaval and constant change.",
      strengths: ["Dependable and loyal", "Patient and calming", "Excellent listener", "Strong team player", "Supportive under pressure"],
      weaknesses: ["Indecisive", "Avoids conflict", "Resistant to change", "Overly accommodating", "Holds concerns in silently"],
      motivators: ["Security and stability", "Harmony", "Appreciation", "Helping others", "Predictable routine"],
      stress:
        "Under pressure a Green becomes quiet and withdrawn, agreeing outwardly while resisting inwardly and holding on to grievances.",
      interact:
        "Be patient and personal. Slow down, offer reassurance, avoid pushing for instant decisions, and show that change is safe and gradual.",
    },
    blue: {
      key: "blue",
      name: "Blue",
      label: "Conscientiousness",
      archetype: "The Analyst",
      hex: "#2e6fd6",
      soft: "rgba(46, 111, 214, 0.13)",
      icon: "🔵",
      tagline: "Precise, logical and quality-focused.",
      summary:
        "Blues are the careful thinkers. Analytical, systematic and detail-driven, they insist on accuracy and quality, gather all the facts before acting, and take pride in getting things exactly right.",
      traits: ["Precise", "Logical", "Analytical", "Systematic", "Quality-focused", "Reserved"],
      communication:
        "Factual and precise. Blues use few but exact words, focus on details and accuracy, and ask many questions. They prefer written data over emotional appeals.",
      decisions:
        "Slow and thorough. They analyse all available facts, avoid risk and want complete information before committing. Speed matters less than being right.",
      workEnv:
        "Organised, structured and quiet, with clear expectations and high quality standards. They dislike chaos, vagueness and being rushed.",
      strengths: ["Accurate and thorough", "High quality standards", "Strong planner", "Analytical thinker", "Spots flaws others miss"],
      weaknesses: ["Perfectionist", "Overly critical", "Slow to decide", "Can seem cold or aloof", "Analysis paralysis"],
      motivators: ["Correctness and quality", "Logic and expertise", "Clear rules and structure", "Being right", "Time to do it properly"],
      stress:
        "Under pressure a Blue becomes critical, withdrawn and stuck in analysis — demanding ever more data before acting.",
      interact:
        "Be prepared and precise. Bring facts and detail, be accurate, give them time to consider, and avoid pressure or excessive emotion.",
    },
  },

  /* ---- How each colour gets along with each colour ----------------------- */
  interactions: {
    red: {
      red: "Two Reds respect each other's drive but clash over control. Agree on who owns what and compete on results, not egos.",
      yellow: "Reds value the Yellow's energy but get frustrated by the chatter. Reds should let them talk briefly; Yellows should get to the point.",
      green: "Reds can steamroll Greens. Slow down, invite their input and value their loyalty rather than mistaking quiet for agreement.",
      blue: "Reds want speed, Blues want certainty. Give Blues the facts and a deadline; Reds should respect that quality takes time.",
    },
    yellow: {
      red: "Yellows should keep it short and focus on outcomes with Reds. Reds should acknowledge the Yellow's ideas before shooting them down.",
      yellow: "Two Yellows have huge fun but little follow-through. Assign someone to capture decisions and details.",
      green: "A warm, easy pairing. Yellows energise Greens; Greens ground Yellows. Yellows should not overwhelm the quieter Green.",
      blue: "Opposites. Yellows feel judged, Blues feel rushed. Yellows should bring facts; Blues should not dismiss enthusiasm.",
    },
    green: {
      red: "Greens should state their needs directly with Reds rather than going silent. Reds should be patient and reassuring.",
      yellow: "Greens enjoy the Yellow's warmth but need calm too. Let the Yellow lead socially; ask them to slow down.",
      green: "Two Greens create harmony but avoid hard decisions. Someone must be willing to raise the difficult topic.",
      blue: "A stable, thoughtful pairing. Both dislike conflict and change, so watch for stagnation and unspoken issues.",
    },
    blue: {
      red: "Blues should give Reds the bottom line first, then offer detail on request. Reds should not pressure Blues into snap calls.",
      yellow: "Blues find Yellows imprecise; Yellows find Blues cold. Blues should soften; Yellows should back claims with facts.",
      green: "A calm, careful pairing. Both value stability. Push each other gently toward timely decisions.",
      blue: "Two Blues produce high quality but risk endless analysis. Set a 'good enough' bar and a deadline.",
    },
  },

  /* ---- Self assessment: rate how much each statement fits YOU ------------- */
  /* Likert 1–5. Each statement maps to one colour. Order is shuffled at run. */
  selfQuestions: [
    { color: "red", text: "I get straight to the point and dislike wasting time." },
    { color: "red", text: "I enjoy taking charge and making decisions quickly." },
    { color: "red", text: "I am competitive and driven to win." },
    { color: "red", text: "I focus on results more than on people's feelings." },
    { color: "red", text: "I am comfortable taking risks to reach a goal." },
    { color: "yellow", text: "I love meeting new people and being the centre of attention." },
    { color: "yellow", text: "I am optimistic and usually see the bright side of things." },
    { color: "yellow", text: "I win people over with enthusiasm and energy." },
    { color: "yellow", text: "I enjoy talking and easily strike up conversations with strangers." },
    { color: "yellow", text: "I prefer flexibility and variety over routine." },
    { color: "green", text: "I am patient and rarely lose my temper." },
    { color: "green", text: "I value harmony and try to avoid conflict." },
    { color: "green", text: "People see me as reliable and supportive." },
    { color: "green", text: "I prefer stability and dislike sudden changes." },
    { color: "green", text: "I listen carefully and often put others' needs before my own." },
    { color: "blue", text: "I pay close attention to details and accuracy." },
    { color: "blue", text: "I like to analyse all the facts before I decide." },
    { color: "blue", text: "I prefer to follow proven methods and clear rules." },
    { color: "blue", text: "I hold high standards for the quality of my work." },
    { color: "blue", text: "I would rather work slowly and thoroughly than fast and rough." },
  ],

  /* ---- Observe someone else: pick the option that fits them best ---------- */
  /* Each option maps to a colour. Chart updates live after every answer.     */
  othersQuestions: [
    {
      q: "How does this person usually communicate?",
      options: [
        { color: "red", text: "Direct and to the point, focused on the bottom line" },
        { color: "yellow", text: "Enthusiastic and expressive, full of stories" },
        { color: "green", text: "Calm and warm, listening more than speaking" },
        { color: "blue", text: "Precise and factual, focused on the details" },
      ],
    },
    {
      q: "How do they make decisions?",
      options: [
        { color: "red", text: "Quickly and decisively" },
        { color: "yellow", text: "On gut feeling and optimism" },
        { color: "green", text: "Slowly, seeking agreement from others" },
        { color: "blue", text: "Carefully, after analysing the facts" },
      ],
    },
    {
      q: "In a meeting they are most likely to…",
      options: [
        { color: "red", text: "Take control and push for a conclusion" },
        { color: "yellow", text: "Talk a lot and bring energy to the room" },
        { color: "green", text: "Support others and keep the peace" },
        { color: "blue", text: "Ask detailed questions and point out flaws" },
      ],
    },
    {
      q: "Their workspace tends to be…",
      options: [
        { color: "red", text: "Functional — whatever gets results" },
        { color: "yellow", text: "Cluttered with personal items and mementos" },
        { color: "green", text: "Comfortable and welcoming" },
        { color: "blue", text: "Neat, organised and systematic" },
      ],
    },
    {
      q: "When facing a problem, they…",
      options: [
        { color: "red", text: "Tackle it head-on and act fast" },
        { color: "yellow", text: "Brainstorm creative ideas out loud" },
        { color: "green", text: "Look for a solution everyone can accept" },
        { color: "blue", text: "Research it thoroughly before acting" },
      ],
    },
    {
      q: "Under pressure they become…",
      options: [
        { color: "red", text: "Demanding and controlling" },
        { color: "yellow", text: "Scattered and disorganised" },
        { color: "green", text: "Quiet and withdrawn" },
        { color: "blue", text: "Critical and overly cautious" },
      ],
    },
    {
      q: "What seems to motivate them most?",
      options: [
        { color: "red", text: "Winning and achieving results" },
        { color: "yellow", text: "Recognition and social approval" },
        { color: "green", text: "Security and helping others" },
        { color: "blue", text: "Being correct and doing quality work" },
      ],
    },
    {
      q: "How do they handle change?",
      options: [
        { color: "red", text: "Embrace it if it means progress" },
        { color: "yellow", text: "Get excited about the possibilities" },
        { color: "green", text: "Resist it and prefer stability" },
        { color: "blue", text: "Want to understand it fully first" },
      ],
    },
    {
      q: "Their body language is usually…",
      options: [
        { color: "red", text: "Firm, direct eye contact, fast movements" },
        { color: "yellow", text: "Animated, lots of gestures, smiling" },
        { color: "green", text: "Relaxed, gentle and warm" },
        { color: "blue", text: "Reserved, controlled, few gestures" },
      ],
    },
    {
      q: "When you disagree with them, they…",
      options: [
        { color: "red", text: "Argue back and stand their ground" },
        { color: "yellow", text: "Try to win you over with charm" },
        { color: "green", text: "Avoid the conflict and give in" },
        { color: "blue", text: "Counter with facts and logic" },
      ],
    },
    {
      q: "How do they approach deadlines?",
      options: [
        { color: "red", text: "Push hard to finish first" },
        { color: "yellow", text: "Often run late but talk their way out" },
        { color: "green", text: "Steady and dependable" },
        { color: "blue", text: "Plan carefully to meet them precisely" },
      ],
    },
    {
      q: "In social settings they…",
      options: [
        { color: "red", text: "Network with purpose, then leave" },
        { color: "yellow", text: "Are the life of the party" },
        { color: "green", text: "Prefer small, familiar groups" },
        { color: "blue", text: "Observe quietly from the edge" },
      ],
    },
    {
      q: "Their greatest strength is…",
      options: [
        { color: "red", text: "Getting things done" },
        { color: "yellow", text: "Inspiring and motivating people" },
        { color: "green", text: "Being loyal and dependable" },
        { color: "blue", text: "Delivering accurate, high-quality work" },
      ],
    },
    {
      q: "Their most obvious weakness is…",
      options: [
        { color: "red", text: "Being impatient and blunt" },
        { color: "yellow", text: "Being disorganised and unfocused" },
        { color: "green", text: "Being indecisive and conflict-averse" },
        { color: "blue", text: "Being overly critical and slow" },
      ],
    },
    {
      q: "When giving feedback they are…",
      options: [
        { color: "red", text: "Blunt and straightforward" },
        { color: "yellow", text: "Encouraging and positive" },
        { color: "green", text: "Gentle and considerate" },
        { color: "blue", text: "Detailed and precise" },
      ],
    },
    {
      q: "How do they prefer to receive information?",
      options: [
        { color: "red", text: "Headlines only — keep it brief" },
        { color: "yellow", text: "With energy and a personal touch" },
        { color: "green", text: "In a friendly, unhurried way" },
        { color: "blue", text: "In full detail, backed by data" },
      ],
    },
  ],

  /* ---- Quick identifier: 4 rapid picks ----------------------------------- */
  quickQuestions: [
    {
      q: "Pick the word that fits best:",
      options: [
        { color: "red", text: "Driven" },
        { color: "yellow", text: "Outgoing" },
        { color: "green", text: "Patient" },
        { color: "blue", text: "Precise" },
      ],
    },
    {
      q: "At its core, the pace is:",
      options: [
        { color: "red", text: "Fast & forceful" },
        { color: "yellow", text: "Fast & friendly" },
        { color: "green", text: "Slow & steady" },
        { color: "blue", text: "Slow & careful" },
      ],
    },
    {
      q: "The main focus is on:",
      options: [
        { color: "red", text: "Results" },
        { color: "yellow", text: "People & fun" },
        { color: "green", text: "Harmony" },
        { color: "blue", text: "Accuracy" },
      ],
    },
    {
      q: "When stressed they turn:",
      options: [
        { color: "red", text: "Controlling" },
        { color: "yellow", text: "Scattered" },
        { color: "green", text: "Withdrawn" },
        { color: "blue", text: "Critical" },
      ],
    },
  ],

  /* ---- Do / Don't tips for working with each colour ---------------------- */
  tips: {
    red: {
      do: ["Be brief and get to the point", "Focus on results and goals", "Offer options and let them decide", "Be confident and direct"],
      dont: ["Ramble or over-explain", "Waste their time", "Get too personal or emotional", "Try to control them"],
    },
    yellow: {
      do: ["Be warm and sociable", "Let them talk and share ideas", "Give recognition and praise", "Keep it fun and upbeat"],
      dont: ["Bury them in detail", "Be cold or dismissive", "Ignore their feelings", "Pin them down with rigid rules"],
    },
    green: {
      do: ["Be patient and personal", "Give reassurance and security", "Introduce change slowly", "Show genuine appreciation"],
      dont: ["Rush or pressure them", "Force sudden change", "Create conflict", "Take their silence as full agreement"],
    },
    blue: {
      do: ["Be prepared and accurate", "Provide facts and detail", "Give them time to think", "Respect their standards"],
      dont: ["Be vague or sloppy", "Rush their decisions", "Get overly emotional", "Dismiss their questions"],
    },
  },

  /* ---- FAQ ---------------------------------------------------------------- */
  faq: [
    {
      q: "What is the DISC model?",
      a: "DISC is a behavioural model that describes four main styles of behaviour and communication: Dominance (Red), Influence (Yellow), Steadiness (Green) and Conscientiousness (Blue). It was built on the work of psychologist William Moulton Marston and popularised for a wide audience by Thomas Erikson in <em>Surrounded by Idiots</em>.",
    },
    {
      q: "Can I be more than one colour?",
      a: "Almost everyone is a blend. Roughly 80% of people are a mix of two colours, and many combine three. Pure single-colour profiles are rare. Your result shows the balance of all four so you can see your dominant and secondary styles.",
    },
    {
      q: "Is one colour better than the others?",
      a: "No. Every colour has genuine strengths and real blind spots. The goal is not to become a 'better' colour but to understand your own style and flex it to communicate well with others.",
    },
    {
      q: "Is this a scientific personality test?",
      a: "This workshop is an educational, self-reflective tool inspired by the DISC language in <em>Surrounded by Idiots</em>. It is designed to spark insight and better conversations, not to serve as a clinical or hiring assessment.",
    },
    {
      q: "How accurate is the 'observe someone else' quiz?",
      a: "It reflects your perception of another person's behaviour, which is a useful starting point. Real people are complex and behave differently in different settings, so treat the result as a conversation starter rather than a verdict.",
    },
    {
      q: "Why do I behave differently at work and at home?",
      a: "People often adapt their behaviour to the situation. You may lead with one colour under pressure at work and another when relaxed at home. That flexibility is normal and healthy.",
    },
  ],
};
