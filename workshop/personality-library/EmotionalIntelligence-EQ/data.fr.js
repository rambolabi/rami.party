/* =============================================================================
   L'intelligence émotionnelle (QE) — contenu français
   Structure identique à data.js ; seuls les textes lisibles sont traduits.
   Les clés, couleurs, icônes, points et l'ordre restent inchangés.
   ========================================================================== */
const BOOK_FR = {
  meta: {
    key: "eq",
    title: "L'intelligence émotionnelle",
    subtitle: "La compétence qui gouverne toutes vos relations",
    short: "QE",
    emoji: "🫀",
    accent: "#059669",
    eyebrow: "Un modèle de compétences",
    description:
      "Un atelier pédagogique sur l'intelligence émotionnelle (QE). Mesurez vos compétences émotionnelles — conscience de soi, gestion de soi, empathie et aptitudes sociales — et faites-les progresser.",
    heroTitle: "La compétence la plus<br />décisive n'est pas le QI.",
    heroLead:
      "Votre façon de lire et de gérer les émotions — les vôtres et celles des autres — façonne vos relations, votre travail et votre bonheur bien plus que l'intelligence brute. Mesurez votre <em>QE</em> et apprenez à le développer.",
    heroCta: "Mesurer votre QE",
    footerNote:
      "Un atelier pédagogique sur l'intelligence émotionnelle, popularisée par Daniel Goleman. Un auto-questionnaire est un miroir pour progresser, pas un test clinique validé.",
    footerSupport:
      "L'intelligence émotionnelle est un ensemble de compétences qui s'apprennent. Explorez les autres cadres de <strong>La Bibliothèque Humaine</strong> pour mieux comprendre les personnes avec qui vous les mettez en pratique.",
  },

  learn: {
    kicker: "Les idées",
    heading: "Les quatre compétences du QE",
    sub: "L'intelligence émotionnelle n'est pas un trait figé mais un ensemble de compétences qui s'apprennent, regroupées en quatre domaines. Touchez une carte pour aller plus loin.",
  },

  concepts: [
    {
      icon: "🫀", name: "Ce qu'est le QE", tag: "Lire et gérer l'émotion.",
      summary: "L'intelligence émotionnelle, c'est la capacité à reconnaître, comprendre et gérer les émotions — les vôtres et celles des autres — et à utiliser cette conscience pour guider votre pensée et vos actes. Elle prédit fortement la réussite relationnelle et professionnelle.",
      points: ["Reconnaître les émotions avec justesse.", "Comprendre ce qui les déclenche.", "Les gérer plutôt que les subir.", "S'en servir pour bien décider."],
    },
    {
      icon: "🪞", name: "La conscience de soi", tag: "Connaître votre météo intérieure.",
      summary: "La fondation : remarquer ce que vous ressentez au moment où vous le ressentez, et comprendre comment vos émotions influencent vos pensées et vos actes. Sans elle, les autres compétences n'ont pas de matière.",
      points: ["Nommer les émotions dès qu'elles surgissent.", "Repérer vos déclencheurs et vos schémas.", "Voir comment vos ressentis dictent vos actes.", "Une connaissance de soi honnête, angles morts compris."],
    },
    {
      icon: "🧘", name: "La gestion de soi", tag: "Répondre plutôt que réagir.",
      summary: "Se servir de la conscience de soi pour garder la main : marquer une pause avant de réagir, apaiser les émotions fortes, rester motivé et s'adapter. C'est l'espace entre l'impulsion et l'action.",
      points: ["Marquer une pause entre le ressenti et l'acte.", "Apaiser et canaliser les émotions fortes.", "Rester motivé malgré les revers.", "S'adapter au lieu de s'effondrer."],
    },
    {
      icon: "💞", name: "L'empathie", tag: "Sentir l'ambiance.",
      summary: "Percevoir ce que ressentent les autres et voir les choses de leur point de vue — même quand ils ne le disent pas. L'empathie est le radar social qui rend possibles la confiance, l'influence et le lien.",
      points: ["Capter les ressentis non dits.", "Adopter le point de vue de l'autre.", "Écouter ce qu'il y a sous les mots.", "Répondre à la personne, pas seulement au message."],
    },
    {
      icon: "🤝", name: "Les aptitudes sociales", tag: "Bien mener vos relations.",
      summary: "Tout réunir dans l'échange : communiquer clairement, gérer les conflits, créer du lien et révéler le meilleur des autres. C'est le QE rendu visible dans votre façon de traiter les gens.",
      points: ["Communiquer avec clarté et chaleur.", "Gérer le conflit sans casse.", "Créer du lien et de la confiance.", "Révéler le meilleur des autres."],
    },
  ],

  assessment: {
    mode: "score",
    shuffle: false,
    shuffleOptions: false,
    kicker: "Auto-évaluation",
    heading: "Quel est votre niveau de QE ?",
    sub: "Indiquez à quel point chaque affirmation vous correspond. Quinze items couvrant les quatre compétences vous donnent une lecture. Soyez honnête — c'est un miroir.",
    nav: "Mesurer",
    icon: "🫀",
    introTitle: "15 affirmations",
    introText: "Répondez selon votre façon d'être en général, pas selon celle que vous aimeriez avoir. Environ deux minutes.",
    resultEyebrow: "Votre intelligence émotionnelle",
    scaleLow: "En développement",
    scaleHigh: "Très développée",
    bands: [
      { min: 0, color: "#b3123a", label: "En développement", title: "De la marge pour progresser",
        blurb: "Vos compétences émotionnelles sont encore en construction — et c'est une vraie bonne nouvelle, car contrairement au QI, l'intelligence émotionnelle s'apprend à tout âge.",
        adviceTitle: "Commencez ici",
        advice: ["Nommez vos émotions à mesure qu'elles surgissent — les nommer les apaise.", "Marquez une pause avant de réagir quand quelque chose vous touche.", "Demandez à une personne comment elle va vraiment, et écoutez pleinement.", "Repérez un schéma relationnel que vous aimeriez changer."] },
      { min: 50, color: "#f0a500", label: "Solide", title: "Une boîte à outils émotionnelle solide",
        blurb: "Vous gérez bien les émotions et les relations la plupart du temps, avec une marge nette pour affûter une ou deux des quatre compétences.",
        adviceTitle: "Monter d'un cran",
        advice: ["Identifiez celle des quatre compétences qui est la plus faible et travaillez-la.", "Entraînez-vous à la pause dans vos moments difficiles, pas dans les faciles.", "Approfondissez l'empathie : reformulez ce que l'autre ressent.", "Demandez un retour honnête sur l'image que vous donnez."] },
      { min: 78, color: "#2a9d5c", label: "Élevé", title: "Émotionnellement intelligent",
        blurb: "Vous lisez et gérez les émotions avec habileté, chez vous comme chez les autres. Continuez à vous entraîner — et faites monter le QE de votre entourage.",
        adviceTitle: "Gardez le cap",
        advice: ["Continuez à nommer et à réguler vos propres émotions.", "Servez-vous de votre empathie pour révéler le meilleur des autres.", "Incarnez une communication calme et claire sous pression.", "Accompagnez quelqu'un dans les compétences qui vous viennent naturellement."] },
    ],
    questions: [
      "Je sais nommer ce que je ressens au moment où je le ressens.",
      "Je remarque l'effet de mon humeur sur mes pensées et mes choix.",
      "Je connais mes déclencheurs émotionnels et mes schémas.",
      "Je reste calme et lucide sous pression.",
      "Je marque une pause avant de réagir quand je suis contrarié.",
      "Je me relève d'un revers sans rester longtemps abattu.",
      "Je perçois ce que ressentent les autres, même sans mots.",
      "Je vois sincèrement les situations du point de vue des autres.",
      "Les gens se sentent compris quand ils me parlent.",
      "J'écoute ce qui se cache derrière les mots de l'autre.",
      "Je gère les désaccords sans abîmer la relation.",
      "J'exprime mes ressentis avec clarté et calme.",
      "Je crée facilement du lien et de la confiance avec de nouvelles personnes.",
      "Je sais aider les autres à s'apaiser quand ils sont bouleversés.",
      "J'adapte mon approche selon les personnes et les humeurs.",
    ].map((q) => ({
      q,
      options: [
        { text: "Rarement vrai", points: 0 },
        { text: "Parfois vrai", points: 1 },
        { text: "Souvent vrai", points: 2 },
        { text: "Presque toujours vrai", points: 3 },
      ],
    })),
  },

  handle: {
    kicker: "Mettre en pratique",
    heading: "Développer votre QE",
    sub: "L'intelligence émotionnelle est un muscle. Voici comment entraîner chacune de ses parties.",
    nav: "Progresser",
    cta: "Retour à la Bibliothèque Humaine →",
    cards: [
      { icon: "🪞", title: "Conscience et gestion de soi", tone: "do", items: [
        "Nommez l'émotion dès qu'elle apparaît", "Notez deux lignes sur vos ressentis chaque jour", "Faites une pause et respirez avant de réagir", "Identifiez vos trois principaux déclencheurs", "Demandez-vous : « de quoi ai-je besoin, là ? »",
      ]},
      { icon: "💞", title: "Empathie et aptitudes sociales", tone: "", items: [
        "Reformulez ce que l'autre semble ressentir", "Écoutez pour comprendre, pas pour répondre", "Soyez curieux avant de juger", "Réparez vite après un accrochage", "Félicitez sincèrement et précisément",
      ]},
      { icon: "⛔", title: "À éviter", tone: "dont", items: [
        "Refouler ou nier ses émotions", "Réagir à chaud", "Présumer savoir ce que ressentent les autres", "Gagner un débat au prix de la confiance", "Croire le QE figé — il ne l'est pas",
      ]},
    ],
  },

  faq: [
    { q: "Le QE est-il plus important que le QI ?", a: "Pour les relations, le leadership et le bien-être au quotidien, l'intelligence émotionnelle pèse souvent davantage. Le QI vous fait décrocher le poste ; le QE vous permet d'y réussir, avec les autres." },
    { q: "L'intelligence émotionnelle s'apprend-elle ?", a: "Oui — et c'est le plus enthousiasmant. Contrairement au QI, le QE est un ensemble de compétences que l'on peut construire à tout âge, par la pratique et le retour des autres." },
    { q: "Quelles sont les quatre composantes du QE ?", a: "La conscience de soi (connaître ses émotions), la gestion de soi (les maîtriser), l'empathie (lire les autres) et les aptitudes sociales (bien mener ses relations)." },
    { q: "Un QE élevé, est-ce être « gentil » en permanence ?", a: "Non. C'est être lucide et habile — ce qui suppose parfois de mener calmement une conversation difficile, ou de tenir une limite avec empathie." },
    { q: "Quelle fiabilité pour un auto-test de 15 items ?", a: "C'est un indicateur pour la réflexion, pas un instrument validé, et l'auto-évaluation a ses angles morts. Complétez-le par un retour honnête de proches." },
    { q: "Comment faire réellement progresser mon QE ?", a: "Commencez petit et concret : nommez vos ressentis, marquez une pause avant de réagir et écoutez vraiment une personne par jour. Les compétences grandissent par la répétition." },
  ],
};

window.BOOK_FR = BOOK_FR;
