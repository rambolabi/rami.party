/* =============================================================================
   Les 16 types (style MBTI) — contenu français
   Structure identique à data.js ; seuls les textes lisibles sont traduits.
   Les axes, les codes de lettres (E/I/S/N/T/F/J/P) et les 16 clés de type
   restent inchangés : le moteur assemble les lettres en un code de quatre
   caractères.
   ========================================================================== */
const BOOK_FR = {
  meta: {
    key: "mbti",
    title: "Les 16 types",
    subtitle: "Le modèle des quatre lettres, expliqué honnêtement",
    short: "16 types",
    emoji: "🔠",
    accent: "#7c3aed",
    eyebrow: "Un modèle de personnalité",
    description:
      "Un atelier éducatif sur les 16 types de personnalité (style MBTI) : quatre axes qui se combinent en un code de quatre lettres. Présenté avec des réserves honnêtes.",
    heroTitle: "Quatre lettres,<br />seize types.",
    heroLead:
      "Le test de personnalité le plus célèbre au monde répartit les gens selon quatre axes en seize types. Immensément populaire — et à comprendre <em>autant</em> qu'à questionner. Trouvez vos quatre lettres.",
    heroCta: "Trouvez votre type",
    footerNote:
      "Un atelier éducatif sur le modèle des 16 types (style MBTI), fondé sur les idées de Carl Jung. Populaire et utile pour la réflexion, mais scientifiquement plus faible que les Big Five — considérez votre résultat comme un miroir, pas comme une case.",
    footerSupport:
      "Le modèle des 16 types est populaire mais scientifiquement contesté. Pour l'alternative validée par la recherche, essayez les <strong>Big Five</strong> dans La Bibliothèque Humaine.",
  },

  learn: {
    kicker: "Les idées",
    heading: "Comment fonctionnent les seize types",
    sub: "Quatre préférences binaires se combinent en un type de quatre lettres. Touchez une carte pour aller plus loin.",
  },

  concepts: [
    {
      icon: "🔠",
      name: "Quatre axes, seize types",
      tag: "E/I · S/N · T/F · J/P.",
      summary:
        "Le modèle demande où vous préférez porter votre attention, comment vous captez l'information, comment vous décidez et comment vous organisez votre vie. Chaque axe a deux pôles, et vos préférences se combinent en l'un des seize types de quatre lettres. Les lettres sont les initiales anglaises et restent identiques dans toutes les langues.",
      points: [
        "<strong>E/I</strong> — d'où vient votre énergie : les autres (Extraverti) ou la solitude (Introverti).",
        "<strong>S/N</strong> — ce que vous remarquez : les faits (Sensation) ou les schémas (iNtuition).",
        "<strong>T/F</strong> — comment vous décidez : la logique (Thinking, pensée) ou les valeurs (Feeling, sentiment).",
        "<strong>J/P</strong> — comment vous vivez : planifié (Jugement) ou souple (Perception).",
      ],
    },
    {
      icon: "🧭",
      name: "Des préférences, pas des aptitudes",
      tag: "Main droite ou main gauche.",
      summary:
        "Une préférence, c'est comme être droitier ou gaucher : vous pouvez utiliser les deux, mais l'une vous semble naturelle. Être introverti ne veut pas dire qu'on ne sait pas être en société — simplement que cela coûte plus d'énergie que cela n'en donne.",
      points: [
        "Vous utilisez les deux pôles ; l'un n'est que votre réflexe.",
        "Les préférences ne disent rien de la compétence ni de l'intelligence.",
        "La plupart des gens sont plus tranchés sur certains axes que sur d'autres.",
        "Un axe proche du 50/50 signifie simplement que vous passez facilement de l'un à l'autre.",
      ],
    },
    {
      icon: "⚠️",
      name: "Une réserve honnête",
      tag: "Amusant, mais pas parole d'évangile.",
      summary:
        "Le modèle des 16 types est stimulant et peut susciter des prises de conscience, mais il est scientifiquement fragile : les résultats changent d'une passation à l'autre, et enfermer les gens dans des cases binaires fait perdre la nuance. Prenez-le comme un miroir — ne vous en servez pas pour étiqueter ni limiter qui que ce soit.",
      points: [
        "Une nouvelle passation donne souvent une ou deux lettres différentes.",
        "Les vrais traits sont des spectres, pas des interrupteurs.",
        "N'utilisez jamais le type pour recruter, juger ou excuser un comportement.",
        "Pour de la rigueur, associez-le aux Big Five.",
      ],
    },
    {
      icon: "🤝",
      name: "Se servir du type avec les autres",
      tag: "Rejoignez leurs préférences.",
      summary:
        "Le type est surtout utile comme grille de communication : donnez du détail concret aux « Sensation », donnez la vision aux « Intuition », donnez la logique aux « Pensée », donnez l'impact humain aux « Sentiment », et respectez le goût de chacun pour le planifié ou l'ouvert.",
      points: [
        "Les « Sensation » veulent des faits ; les « Intuition » veulent la grande idée.",
        "Les « Pensée » veulent de la logique ; les « Sentiment » veulent des valeurs et de l'impact.",
        "Les « Jugement » veulent des décisions ; les « Perception » veulent des options.",
        "Les introvertis veulent du temps pour réfléchir ; les extravertis pensent à voix haute.",
      ],
    },
    {
      icon: "🔄",
      name: "Le type n'est pas un destin",
      tag: "Vous êtes plus que quatre lettres.",
      summary:
        "Aucune combinaison de quatre lettres ne peut contenir une personne entière. Servez-vous de votre type comme point de départ pour réfléchir et mieux dialoguer — puis tenez-le d'une main légère. Grandir, c'est aussi développer les côtés que vous préférez le moins.",
      points: [
        "Votre type est une hypothèse, pas un verdict.",
        "Une croissance saine étire vos préférences les plus faibles.",
        "Le contexte et l'humeur déplacent votre comportement chaque jour.",
        "Deux personnes du même type peuvent être très différentes.",
      ],
    },
  ],

  assessment: {
    mode: "axes",
    axisColor: "#7c3aed",
    kicker: "Auto-évaluation",
    heading: "Trouvez vos quatre lettres",
    sub: "Douze choix binaires. Prenez l'option qui vous semble la plus naturelle — même de peu.",
    nav: "Votre type",
    icon: "🔠",
    introTitle: "12 choix binaires",
    introText: "Pour chaque paire, choisissez l'option qui vous correspond le mieux la plupart du temps.",
    resultEyebrow: "Votre type",
    axes: [
      { key: "EI", left: { code: "E", name: "Extraversion" }, right: { code: "I", name: "Introversion" } },
      { key: "SN", left: { code: "S", name: "Sensation" }, right: { code: "N", name: "Intuition" } },
      { key: "TF", left: { code: "T", name: "Pensée" }, right: { code: "F", name: "Sentiment" } },
      { key: "JP", left: { code: "J", name: "Jugement" }, right: { code: "P", name: "Perception" } },
    ],
    questions: [
      { q: "Dans une fête animée, vous allez plutôt…", axis: "EI", options: [ { text: "Circuler partout et dynamiser la salle", side: "L" }, { text: "Discuter en profondeur avec quelques personnes", side: "R" } ] },
      { q: "Après une semaine chargée, vous rechargez en…", axis: "EI", options: [ { text: "Sortant et voyant du monde", side: "L" }, { text: "Savourant un moment tranquille seul", side: "R" } ] },
      { q: "Vous avez tendance à…", axis: "EI", options: [ { text: "Penser à voix haute", side: "L" }, { text: "Réfléchir avant de parler", side: "R" } ] },
      { q: "Vous vous fiez davantage…", axis: "SN", options: [ { text: "Aux faits concrets et à l'expérience", side: "L" }, { text: "Aux schémas et aux possibles", side: "R" } ] },
      { q: "Vous vous concentrez plutôt sur…", axis: "SN", options: [ { text: "Les détails que vous avez sous les yeux", side: "L" }, { text: "La vue d'ensemble et ce qui pourrait être", side: "R" } ] },
      { q: "Vous préféreriez qu'on vous voie comme…", axis: "SN", options: [ { text: "Pratique et les pieds sur terre", side: "L" }, { text: "Imaginatif et original", side: "R" } ] },
      { q: "Vous décidez surtout avec…", axis: "TF", options: [ { text: "La logique et l'analyse objective", side: "L" }, { text: "Les valeurs et le ressenti des gens", side: "R" } ] },
      { q: "En cas de désaccord, votre priorité est…", axis: "TF", options: [ { text: "Ce qui est juste et exact", side: "L" }, { text: "L'harmonie et l'empathie", side: "R" } ] },
      { q: "Vous préféreriez qu'on vous dise…", axis: "TF", options: [ { text: "Rationnel", side: "L" }, { text: "Bienveillant", side: "R" } ] },
      { q: "Vous préférez une vie…", axis: "JP", options: [ { text: "Planifiée et arrêtée", side: "L" }, { text: "Souple et ouverte", side: "R" } ] },
      { q: "Vous êtes plus à l'aise quand les choses sont…", axis: "JP", options: [ { text: "Décidées", side: "L" }, { text: "Encore ouvertes", side: "R" } ] },
      { q: "Votre emploi du temps est plutôt…", axis: "JP", options: [ { text: "Structuré et ordonné", side: "L" }, { text: "Spontané et adaptable", side: "R" } ] },
    ],
    types: {
      INTJ: { name: "L'Architecte", blurb: "Visionnaires stratèges et indépendants, qui adorent maîtriser les systèmes complexes.", strengths: ["Stratégie à long terme", "Pensée indépendante"], watch: ["Peut sembler distant", "Impatient face à l'inefficacité"] },
      INTP: { name: "Le Logicien", blurb: "Analystes curieux et inventifs, qui vivent pour les idées et la compréhension.", strengths: ["Résolution de problèmes originale", "Profondeur logique"], watch: ["Peut sur-analyser", "Peut négliger le concret"] },
      ENTJ: { name: "Le Commandant", blurb: "Dirigeants décidés et déterminés, qui organisent les gens et les plans vers de grands objectifs.", strengths: ["Leadership naturel", "Élan stratégique"], watch: ["Peut écraser les autres", "Impatient"] },
      ENTP: { name: "L'Innovateur", blurb: "Vifs et inventifs, ils adorent un bon défi intellectuel ou une bonne joute d'idées.", strengths: ["Production d'idées", "Adaptabilité"], watch: ["Débat parfois pour le sport", "Suivi approximatif"] },
      INFJ: { name: "L'Avocat", blurb: "Idéalistes clairvoyants et fidèles à leurs principes, mus par un désir discret d'aider.", strengths: ["Empathie profonde", "Vision et conviction"], watch: ["Perfectionnisme", "Épuisement à trop donner"] },
      INFP: { name: "Le Médiateur", blurb: "Idéalistes doux et imaginatifs, guidés par des valeurs personnelles fortes.", strengths: ["Compassion", "Créativité"], watch: ["Idéalisme excessif", "Évitement du conflit"] },
      ENFJ: { name: "Le Protagoniste", blurb: "Mentors chaleureux et charismatiques, qui inspirent et rassemblent.", strengths: ["Inspirer les autres", "Lire les gens"], watch: ["Trop impliqué", "Cherche à plaire"] },
      ENFP: { name: "L'Inspirateur", blurb: "Esprits libres, enthousiastes et créatifs, qui voient des possibles partout.", strengths: ["Enthousiasme", "Créer du lien"], watch: ["Attention dispersée", "Agitation"] },
      ISTJ: { name: "Le Logisticien", blurb: "Réalistes fiables et méthodiques, attachés au devoir et au travail bien fait.", strengths: ["Fiabilité", "Souci du détail"], watch: ["Rigide face au changement", "Trop attaché au règlement"] },
      ISFJ: { name: "Le Défenseur", blurb: "Protecteurs chaleureux et loyaux, dévoués au soin de leur entourage.", strengths: ["Loyauté", "Attention concrète"], watch: ["S'oublie soi-même", "Fuit le conflit"] },
      ESTJ: { name: "Le Directeur", blurb: "Gestionnaires organisés et décidés, qui mettent de l'ordre et font avancer les choses.", strengths: ["Organisation", "Sens de la décision"], watch: ["Peu flexible", "Abrupt"] },
      ESFJ: { name: "Le Consul", blurb: "Organisateurs sociables et attentionnés, qui font vivre et tenir les collectifs.", strengths: ["Chaleur humaine", "Harmonie d'équipe"], watch: ["Besoin d'approbation", "Fuit le conflit"] },
      ISTP: { name: "Le Virtuose", blurb: "Bricoleurs pragmatiques et imperturbables, qui adorent résoudre des problèmes concrets.", strengths: ["Maîtrise pratique", "Calme en situation de crise"], watch: ["Peut sembler détaché", "Attiré par le risque"] },
      ISFP: { name: "L'Aventurier", blurb: "Âmes douces et artistes, qui vivent l'instant et chérissent leur liberté.", strengths: ["Sens esthétique", "Chaleur discrète"], watch: ["Évite le conflit", "Difficile à déchiffrer"] },
      ESTP: { name: "L'Entrepreneur", blurb: "Réalistes audacieux et énergiques, qui s'épanouissent dans l'action et le résultat rapide.", strengths: ["Audace", "Action rapide"], watch: ["Impatient", "En quête de risque"] },
      ESFP: { name: "L'Amuseur", blurb: "Spontanés et joyeux, ils apportent de l'énergie et de la gaieté partout où ils passent.", strengths: ["Enthousiasme", "Vivre l'instant"], watch: ["Déteste la routine", "Fuit la planification stricte"] },
    },
  },

  handle: {
    kicker: "Mettre en pratique",
    heading: "Se parler d'un type à l'autre",
    sub: "Le type sert surtout de grille de communication. Rejoignez les gens dans leurs préférences.",
    nav: "Appliquer",
    cta: "Voir le lien avec les couleurs DISC →",
    cards: [
      { icon: "✅", title: "À faire", tone: "do", items: [
        "Donnez aux « Sensation » des faits et des étapes concrètes", "Donnez aux « Intuition » la vision et le « pourquoi »", "Donnez aux « Pensée » une logique claire", "Donnez aux « Sentiment » l'impact humain", "Laissez aux introvertis le temps de réfléchir",
      ]},
      { icon: "⛔", title: "À éviter", tone: "dont", items: [
        "Utiliser le type pour juger ou cataloguer les gens", "Croire que même type = même personne", "Le traiter comme figé et immuable", "Enfermer les « Perception » dans des plans rigides", "Obliger les extravertis à rester silencieux",
      ]},
      { icon: "🪞", title: "Tenez-le d'une main légère", tone: "", items: [
        "Servez-vous-en pour réfléchir, pas pour étiqueter", "Attendez-vous à ce que vos lettres bougent avec le temps", "Développez aussi vos côtés non préférés", "Associez-le aux Big Five pour plus de rigueur", "Laissez les gens vous surprendre",
      ]},
    ],
  },

  faq: [
    { q: "Le test des 16 types est-il scientifique ?", a: "Il est populaire et peut éclairer, mais les psychologues le jugent faible comme instrument de mesure : les résultats changent souvent d'une passation à l'autre, et réduire des spectres à des cases binaires coûte en précision. Prenez-le comme un miroir, pas comme un verdict." },
    { q: "Pourquoi ai-je obtenu un autre type la dernière fois ?", a: "Parce que plusieurs axes sont proches du 50/50 chez beaucoup de gens : une petite variation d'humeur ou de formulation peut faire basculer une lettre. C'est une limite connue de tout test binaire." },
    { q: "Que signifient les lettres ?", a: "Ce sont les initiales anglaises. E/I désigne la source d'énergie (les autres ou la solitude), S/N ce que vous remarquez (les faits ou les schémas), T/F votre façon de décider (la logique ou les valeurs), et J/P votre façon d'organiser votre vie (planifiée ou souple)." },
    { q: "Un type est-il meilleur qu'un autre ?", a: "Non. Chaque type a ses forces et ses angles morts. Il n'y a pas de meilleur type — seulement des adéquations plus ou moins heureuses avec une situation ou un rôle." },
    { q: "Mon type peut-il changer ?", a: "Vos préférences peuvent se déplacer progressivement, et vous pouvez délibérément développer vos côtés les plus faibles. Vous n'êtes jamais enfermé dans quatre lettres." },
    { q: "Puis-je m'en servir au travail pour sélectionner des gens ?", a: "Non. Ce n'est ni assez fiable ni assez équitable pour le recrutement ou la sélection. Réservez-le à la réflexion personnelle et à une meilleure communication." },
  ],

  disc: {
    kicker: "Passerelle",
    heading: "Les 16 types et les couleurs DISC",
    sub: "Les modèles ne sont pas identiques, mais ils se répondent. Voici un pont approximatif vers les couleurs DISC.",
    nav: "Couleurs",
    labels: { relate: "Types qui penchent souvent par ici", reflect: "Axe de progression", treat: "Comment les aborder" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Découvrir l'atelier des couleurs DISC →",
    colors: {
      red: {
        relate: "Souvent les types ExTJ décidés (ENTJ, ESTJ) — déterminés et prompts à prendre les commandes.",
        reflect: "Développez la patience et l'empathie envers les tempéraments plus lents ou plus doux.",
        treat: "Soyez bref, logique et centré sur les résultats.",
      },
      yellow: {
        relate: "Souvent les types expansifs ExFP / ENxP — sociables, enthousiastes, amoureux des idées.",
        reflect: "Développez la concentration et la finition.",
        treat: "Soyez chaleureux, enjoué et laissez-leur de la place pour parler.",
      },
      green: {
        relate: "Souvent les types attentionnés IxFx (ISFJ, INFP) — loyaux, doux, en quête d'harmonie.",
        reflect: "Développez l'assertivité et l'aisance dans le conflit.",
        treat: "Soyez patient, personnel et rassurant.",
      },
      blue: {
        relate: "Souvent les types analytiques IxTx (INTJ, ISTJ) — précis et méthodiques.",
        reflect: "Développez la souplesse et l'ouverture aux émotions des autres.",
        treat: "Apportez du détail, de la logique et du temps pour réfléchir.",
      },
    },
  },
};

window.BOOK_FR = BOOK_FR;
