/* =============================================================================
   Les Big Five (OCEAN) — contenu français
   Structure identique à data.js ; seuls les textes lisibles sont traduits.
   Les clés de traits, couleurs, icônes et l'ordre restent inchangés.
   ========================================================================== */
const BOOK_FR = {
  meta: {
    key: "bigfive",
    title: "Les Big Five",
    subtitle: "La carte de la personnalité validée par la science (OCEAN)",
    short: "Big Five",
    emoji: "🧬",
    accent: "#2563eb",
    eyebrow: "Un modèle de personnalité",
    description:
      "Un atelier pédagogique sur les Big Five (OCEAN) — le modèle de personnalité le plus respecté scientifiquement. Mesurez vos cinq traits et apprenez à lire les autres.",
    heroTitle: "Cinq curseurs qui<br />décrivent tout le monde.",
    heroLead:
      "Oubliez les cases et les types. Les <em>Big Five</em> forment le modèle le mieux étayé de la psychologie — cinq traits indépendants, chacun un spectre sur lequel vous vous situez quelque part. Découvrez votre profil.",
    heroCta: "Mesurer vos cinq traits",
    footerNote:
      "Un atelier pédagogique sur le modèle des Big Five (OCEAN). Un court auto-questionnaire est un miroir pour la réflexion, pas une évaluation clinique.",
    footerSupport:
      "Les Big Five constituent le modèle de personnalité le mieux étayé par la recherche (les traits OCEAN). Explorez les autres cadres de <strong>La Bibliothèque Humaine</strong> pour voir comment ils se rejoignent.",
  },

  learn: {
    kicker: "Les idées",
    heading: "La personnalité, mesurée",
    sub: "Les Big Five ont émergé de décennies de recherche comme les cinq dimensions qui décrivent le mieux nos différences. Touchez une carte pour aller plus loin.",
  },

  concepts: [
    {
      icon: "🧬",
      name: "Le modèle le plus fiable",
      tag: "Construit sur des preuves, pas sur l'intuition.",
      summary:
        "Contrairement aux systèmes de types, les Big Five ont été découverts statistiquement — en analysant les mots que nous utilisons pour décrire les gens, à travers les langues et les cultures. C'est le modèle sur lequel s'appuie la psychologie académique, parce qu'il prédit des résultats concrets et reste stable dans le temps.",
      points: [
        "Issu des données, pas de la théorie d'une seule personne.",
        "Se reproduit à travers les cultures et les langues.",
        "Prédit des résultats en matière de santé, de travail et de relations.",
        "La référence scientifique à laquelle les autres tests sont comparés.",
      ],
    },
    {
      icon: "🎚️",
      name: "Les traits sont des spectres",
      tag: "Pas des cases — des curseurs.",
      summary:
        "Vous n'êtes pas un « type ». Sur chacun des cinq traits, vous vous situez quelque part sur une échelle continue, le plus souvent près du milieu. Aucune extrémité n'est bonne ou mauvaise — chacune a ses forces et ses compromis selon la situation.",
      points: [
        "Tout le monde possède les cinq traits, à des degrés différents.",
        "La plupart des gens sont au milieu sur la plupart des traits.",
        "Aucune extrémité n'est « meilleure » — c'est le contexte qui décide.",
        "Votre profil, c'est la combinaison, pas un score isolé.",
      ],
    },
    {
      icon: "🔤",
      name: "Les cinq traits (OCEAN)",
      tag: "Ouverture, Conscienciosité, Extraversion, Agréabilité, Névrosisme.",
      summary:
        "Les cinq captent la curiosité, la discipline, la sociabilité, la chaleur humaine et la sensibilité émotionnelle. Ensemble, ils dessinent une image riche et souple de la façon dont quelqu'un pense, travaille et se lie.",
      points: [
        "<strong>O</strong>uverture — curiosité, imagination, goût de la nouveauté.",
        "<strong>C</strong>onscienciosité — organisation, discipline, fiabilité.",
        "<strong>E</strong>xtraversion — sociabilité, énergie puisée chez les autres.",
        "<strong>A</strong>gréabilité — chaleur, confiance, coopération.",
        "<strong>N</strong>évrosisme — sensibilité au stress et aux émotions négatives.",
      ],
    },
    {
      icon: "🔄",
      name: "Traits et états",
      tag: "Stables, mais pas figés.",
      summary:
        "Les traits sont assez stables, mais ils dérivent progressivement au fil de la vie — la plupart des gens deviennent plus consciencieux et plus agréables, et moins névrosés, en vieillissant. Et à chaque instant, votre comportement s'ajuste à la situation.",
      points: [
        "Les traits évoluent sur des années, pas du jour au lendemain.",
        "Vous pouvez agir à contre-courant de votre nature quand cela compte.",
        "Évoluer est normal — vous n'êtes pas prisonnier d'un score.",
        "Comportement = trait + situation.",
      ],
    },
    {
      icon: "🤝",
      name: "L'utiliser avec les autres",
      tag: "Lisez les curseurs, adaptez-vous.",
      summary:
        "Dès que vous savez estimer les traits de quelqu'un, vous pouvez mieux l'aborder : du détail pour le consciencieux, de l'espace pour l'introverti, de la chaleur pour l'agréable et du calme pour le très sensible.",
      points: [
        "Conscienciosité élevée : donnez de la structure et des plans clairs.",
        "Extraversion faible : laissez du silence et des échanges en tête-à-tête.",
        "Névrosisme élevé : offrez de la réassurance et de la stabilité.",
        "Ouverture élevée : apportez des idées, de la nouveauté et une vision d'ensemble.",
      ],
    },
  ],

  assessment: {
    mode: "profile",
    kicker: "Auto-évaluation",
    heading: "Trouvez votre profil Big Five",
    sub: "Indiquez à quel point vous êtes d'accord avec chaque affirmation. Quinze items rapides vous donnent une lecture sur les cinq traits.",
    nav: "Mesurer",
    icon: "🎚️",
    introTitle: "15 affirmations",
    introText: "Répondez honnêtement et spontanément, sur votre façon d'être en général. Environ deux minutes.",
    resultEyebrow: "Votre profil sur cinq traits",
    resultTitle: "Votre profil Big Five",
    resultBlurb: "Cinq spectres indépendants. Il n'y a pas de « meilleur » profil — seulement le vôtre. Plus haut n'est pas mieux ; chaque extrémité a ses forces.",
    traitOrder: ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"],
    traits: {
      openness: { name: "Ouverture", icon: "🌈", color: "#2563eb",
        high: "Vous êtes curieux, imaginatif et attiré par les idées, l'art et les expériences nouvelles. La routine peut vous ennuyer.",
        low: "Vous êtes pragmatique, ancré et préférez le familier et l'éprouvé. Vous pouvez résister au changement pour le changement.",
        mid: "Vous conciliez curiosité et pragmatisme — ouvert aux idées neuves, mais à l'aise avec ce qui fonctionne." },
      conscientiousness: { name: "Conscienciosité", icon: "🎯", color: "#0891b2",
        high: "Vous êtes organisé, discipliné et fiable. Attention au perfectionnisme et à la rigidité.",
        low: "Vous êtes souple et spontané, mais la structure, les échéances et le fait d'aller au bout peuvent être difficiles.",
        mid: "Vous savez être organisé quand cela compte, sans vous laisser gouverner par les règles." },
      extraversion: { name: "Extraversion", icon: "☀️", color: "#f0a500",
        high: "Vous êtes sociable, énergique et vous rechargez auprès des autres. Le calme ou la solitude peuvent vous vider.",
        low: "Vous êtes plus réservé et réfléchi, et vous vous ressourcez dans le calme et la solitude. Les grands cadres sociaux vous fatiguent.",
        mid: "Vous appréciez la compagnie et la solitude à parts à peu près égales — un ambivert." },
      agreeableness: { name: "Agréabilité", icon: "🤝", color: "#2a9d5c",
        high: "Vous êtes chaleureux, confiant et coopératif. Veillez à ne pas négliger vos propres besoins ni à fuir le conflit.",
        low: "Vous êtes direct, compétitif et sceptique — précieux pour les décisions difficiles, mais vous pouvez paraître brusque ou froid.",
        mid: "Vous alliez chaleur et franchise : vous coopérez sans vous laisser marcher dessus." },
      neuroticism: { name: "Névrosisme", icon: "🌊", color: "#db2777",
        high: "Vous ressentez les émotions intensément et êtes sensible au stress. Cela apporte de l'empathie et de la vigilance, mais aussi de l'inquiétude.",
        low: "Vous êtes stable émotionnellement et calme sous pression. Veillez simplement à rester attentif aux risques réels et aux ressentis.",
        mid: "Vous ressentez le stress comme tout le monde, mais vous gardez généralement votre équilibre." },
    },
    questions: [
      { q: "J'aime essayer de nouvelles choses, idées et expériences.", trait: "openness" },
      { q: "J'ai une imagination vive et j'adore explorer des idées.", trait: "openness" },
      { q: "Je préfère la routine familière à la variété et au changement.", trait: "openness", reverse: true },
      { q: "J'aime que les choses soient organisées et planifiées.", trait: "conscientiousness" },
      { q: "Je tiens mes engagements de façon fiable.", trait: "conscientiousness" },
      { q: "Je remets souvent les choses à la dernière minute.", trait: "conscientiousness", reverse: true },
      { q: "Je me sens plein d'énergie quand je suis entouré de beaucoup de monde.", trait: "extraversion" },
      { q: "J'engage facilement la conversation avec des inconnus.", trait: "extraversion" },
      { q: "Je préfère un moment tranquille seul à une grande sortie entre gens.", trait: "extraversion", reverse: true },
      { q: "Je fais des efforts particuliers pour aider les autres et coopérer.", trait: "agreeableness" },
      { q: "Je fais généralement confiance et je présume de bonnes intentions.", trait: "agreeableness" },
      { q: "Je peux être brusque et faire passer mes besoins en premier.", trait: "agreeableness", reverse: true },
      { q: "Je me fais beaucoup de souci pour les choses.", trait: "neuroticism" },
      { q: "Mon humeur peut basculer vite et fort.", trait: "neuroticism" },
      { q: "Je reste calme et stable sous pression.", trait: "neuroticism", reverse: true },
    ],
  },

  handle: {
    kicker: "Mettre en pratique",
    heading: "Lire les autres et aller vers eux",
    sub: "L'intérêt des Big Five n'est pas l'étiquette — c'est de s'adapter pour rejoindre les gens là où ils sont.",
    nav: "Appliquer",
    cta: "Voir le lien avec les couleurs DISC →",
    cards: [
      { icon: "🧭", title: "Lisez les curseurs", tone: "do", items: [
        "Observez l'énergie : expansif ou réservé (E)", "Observez l'ordre : planifié ou spontané (C)", "Observez l'ouverture aux idées nouvelles (O)", "Observez la chaleur ou la franchise brute (A)", "Observez la sensibilité au stress (N)",
      ]},
      { icon: "💪", title: "Appuyez-vous sur les forces", tone: "", items: [
        "Donnez au consciencieux une structure claire", "Donnez à l'esprit ouvert de la nouveauté et une vision", "Donnez à l'extraverti du monde et de l'animation", "Donnez à l'agréable un climat de coopération", "Donnez au sensible du calme et de la réassurance",
      ]},
      { icon: "⚖️", title: "Faites le pont", tone: "dont", items: [
        "N'obligez pas un introverti à « faire le show »", "Ne noyez pas un esprit spontané sous les procédures", "Ne balayez pas une personne sensible d'un « trop, c'est trop »", "Ne prenez pas la franchise brute pour de l'antipathie", "Adaptez votre style, n'exigez pas qu'ils changent",
      ]},
    ],
  },

  faq: [
    { q: "Les Big Five valent-ils mieux que le Myers-Briggs ?", a: "Scientifiquement, oui. Les Big Five sont construits à partir de données, mesurent des spectres plutôt que des cases, et sont plus fiables et plus prédictifs. Le MBTI est populaire et intuitif, mais bien plus faible comme instrument de mesure. Les deux peuvent nourrir la réflexion." },
    { q: "Mes traits peuvent-ils changer ?", a: "Lentement. Les traits sont stables sur quelques mois, mais dérivent au fil de la vie — la plupart des gens deviennent plus consciencieux et plus agréables, et moins névrosés, en vieillissant. Un effort délibéré peut aussi les déplacer." },
    { q: "Vaut-il mieux un score élevé ou faible ?", a: "Ni l'un ni l'autre. Chaque extrémité de chaque trait a ses forces et ses compromis selon la situation. Une conscienciosité élevée vous aide à finir ; une plus faible vous aide à vous adapter. C'est une question d'adéquation, pas de classement." },
    { q: "Qu'est-ce que le névrosisme, au juste ?", a: "Simplement votre degré de sensibilité au stress et aux émotions négatives. Un score élevé n'est pas un défaut — il s'accompagne d'empathie et de vigilance. Un score faible apporte du calme, mais peut manquer des risques réels." },
    { q: "Quelle fiabilité pour un test de 15 items ?", a: "C'est un indicateur rapide, pas un instrument clinique validé. C'est suffisant pour amorcer une réflexion utile ; les échelles de recherche complètes utilisent beaucoup plus d'items." },
    { q: "Quel rapport avec les couleurs DISC ?", a: "Elles se recoupent : le Rouge du DISC correspond grossièrement à une faible agréabilité associée à une forte extraversion et à de la combativité, le Jaune à une forte extraversion et ouverture, le Vert à une forte agréabilité et un faible névrosisme, et le Bleu à une forte conscienciosité. Voir l'atelier DISC pour aller plus loin." },
  ],

  disc: {
    kicker: "Passerelle",
    heading: "Les Big Five et les couleurs DISC",
    sub: "Les deux modèles se recoupent. Voici comment chaque couleur DISC se projette, en gros, sur les cinq traits.",
    nav: "Couleurs",
    labels: { relate: "Tendance Big Five typique", reflect: "Axe de progression", treat: "Comment les aborder" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Découvrir l'atelier des couleurs DISC →",
    colors: {
      red: {
        relate: "Agréabilité plus faible, combativité et assertivité plus fortes — direct et orienté résultats.",
        reflect: "Développez la chaleur et la patience ; tout n'est pas une compétition.",
        treat: "Soyez bref, factuel et centré sur le résultat.",
      },
      yellow: {
        relate: "Forte extraversion et ouverture — sociable, enthousiaste, porté par les idées.",
        reflect: "Développez la conscienciosité : allez au bout des détails.",
        treat: "Soyez chaleureux, sociable et donnez de la reconnaissance.",
      },
      green: {
        relate: "Forte agréabilité, névrosisme plus faible — chaleureux, stable, coopératif.",
        reflect: "Développez l'assertivité : exprimez aussi vos propres besoins.",
        treat: "Soyez patient, personnel et rassurant.",
      },
      blue: {
        relate: "Forte conscienciosité, plus réservé — précis, minutieux, exigeant sur la qualité.",
        reflect: "Développez la souplesse ; ne laissez pas les standards virer à la rigidité.",
        treat: "Apportez du détail, de l'exactitude et du temps pour réfléchir.",
      },
    },
  },
};

window.BOOK_FR = BOOK_FR;
