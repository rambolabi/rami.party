/* =============================================================================
   Entouré de psychopathes — contenu français
   Atelier éducatif inspiré d'« Entouré de psychopathes » de Thomas Erikson.
   Reconnaître la manipulation et se protéger — ce n'est EN AUCUN CAS un outil
   clinique ou diagnostique. Structure identique à data.js.
   ========================================================================== */
const BOOK_FR = {
  meta: {
    key: "psychopaths",
    title: "Entouré de psychopathes",
    subtitle: "Repérer la manipulation et se protéger",
    short: "Psychopathes",
    emoji: "🎭",
    accent: "#b3123a",
    eyebrow: "Un atelier Thomas Erikson",
    description:
      "Un atelier éducatif inspiré d'« Entouré de psychopathes » de Thomas Erikson. Apprenez à reconnaître les techniques de manipulation et à vous protéger — ce n'est pas un outil clinique ou diagnostique.",
    heroTitle: "Tout le monde<br />ne joue pas franc jeu.",
    heroLead:
      "Certaines personnes charment, mentent et manipulent pour arriver à leurs fins. Apprenez à lire leurs techniques avec <em>Entouré de psychopathes</em> de Thomas Erikson — et défendez-vous en toute lucidité.",
    heroCta: "Repérez les signaux d'alerte",
    footerNote:
      "Un atelier éducatif inspiré d'<em>Entouré de psychopathes</em> de Thomas Erikson. Il vous aide à reconnaître les comportements manipulateurs et à vous protéger — ce n'est pas un outil clinique ou diagnostique. Si vous vous sentez en danger, contactez les services d'aide de votre région.",
  },

  learn: {
    kicker: "Les idées",
    heading: "Comment fonctionne la manipulation",
    sub: "La psychopathie s'étend sur un spectre, et la plupart des manipulateurs n'enfreignent jamais la loi — ils se contentent de plier les gens. Touchez une carte pour aller plus loin.",
  },

  concepts: [
    {
      icon: "🎭",
      name: "Le masque du charme",
      tag: "Pourquoi on les apprécie si vite.",
      summary:
        "Les manipulateurs ouvrent par le charme. Ils sont attentionnés, flatteurs et agréables — jusqu'à ce qu'ils obtiennent ce qu'ils veulent. La psychopathie est un spectre : une petite part de la population présente des traits marqués, et bien d'autres emploient les mêmes techniques à l'occasion.",
      points: [
        "Le charme de surface est un outil, pas de la chaleur — il s'éteint dès que vous avez servi.",
        "Ils reflètent vos goûts et vos valeurs pour créer vite une fausse intimité.",
        "Le « love bombing » ou les éloges démesurés du début sont une ouverture classique.",
        "Le spectre compte : il s'agit de comportements à surveiller, pas d'étiquettes à distribuer.",
      ],
    },
    {
      icon: "🧰",
      name: "La boîte à outils du manipulateur",
      tag: "Les techniques récurrentes à reconnaître.",
      summary:
        "La manipulation se résume à quelques mouvements répétables. Dès que vous savez les nommer, ils perdent l'essentiel de leur pouvoir sur vous.",
      points: [
        "<strong>Le mensonge :</strong> fluide, assuré et fréquent, même quand il est inutile.",
        "<strong>Le « gaslighting » :</strong> réécrire les faits jusqu'à ce que vous doutiez de votre mémoire.",
        "<strong>La culpabilisation :</strong> transformer leur problème en votre faute.",
        "<strong>La flatterie :</strong> des compliments qui visent à obtenir quelque chose.",
        "<strong>La triangulation :</strong> monter les gens les uns contre les autres pour garder la main.",
      ],
    },
    {
      icon: "🚩",
      name: "Les signaux d'alerte",
      tag: "Le schéma sous le charme.",
      summary:
        "Aucun moment isolé ne prouve quoi que ce soit — cherchez le schéma dans la durée. Les manipulateurs sont constants sur un point : cela revient toujours à leur avantage.",
      points: [
        "Un visage en public, un autre en privé.",
        "Peu d'empathie réelle quand vous souffrez vraiment.",
        "Les règles s'appliquent à vous, pas à eux.",
        "Vous sortez des échanges vidé, confus, ou d'une manière ou d'une autre dans votre tort.",
      ],
    },
    {
      icon: "🛡️",
      name: "Protégez-vous",
      tag: "Distance, limites, traces écrites.",
      summary:
        "On « gagne » rarement contre un manipulateur en argumentant mieux que lui. On se protège en devenant une mauvaise cible : prévisible, ennuyeuse à provoquer et difficile à déstabiliser.",
      points: [
        "Posez des limites fermes et tenez-les sans longues justifications.",
        "Gardez une trace des accords et conversations importants.",
        "Limitez les informations personnelles que vous livrez — elles deviennent des leviers.",
        "Restez en lien avec des personnes de confiance ; l'isolement est l'allié du manipulateur.",
      ],
    },
    {
      icon: "🧠",
      name: "Pourquoi cela marche sur vous",
      tag: "Ils exploitent vos meilleures qualités.",
      summary:
        "Les manipulateurs visent vos forces : votre empathie, votre loyauté, votre culpabilité ou votre envie de préserver la paix. Connaître vos propres réflexes, c'est la moitié de la défense.",
      points: [
        "Les personnes empathiques s'expliquent trop et accordent des secondes chances — c'est exploité.",
        "Ceux qui fuient le conflit cèdent sous la pression — on s'appuie dessus.",
        "Ceux qui ont besoin d'approbation sont sensibles à la flatterie — on la fournit.",
        "Comprendre vos propres boutons empêche qu'on appuie dessus.",
      ],
    },
  ],

  assessment: {
    mode: "score",
    shuffle: false,
    shuffleOptions: false,
    kicker: "Contrôle des signaux d'alerte",
    heading: "Quelqu'un vous manipule-t-il ?",
    sub: "Pensez à une personne précise. Indiquez à quelle fréquence chaque affirmation lui correspond. C'est une grille de réflexion, pas un diagnostic.",
    nav: "Signaux",
    icon: "🚩",
    introTitle: "12 vérifications de comportement",
    introText: "Gardez une personne en tête et répondez honnêtement sur <em>son</em> comportement. Comptez environ deux minutes.",
    resultEyebrow: "Niveau de signaux d'alerte",
    scaleLow: "Peu de signaux",
    scaleHigh: "Signaux sérieux",
    bands: [
      {
        min: 0,
        color: "#2a9d5c",
        label: "Faible",
        title: "Peu de signaux d'alerte",
        blurb: "D'après vos réponses, cette personne manifeste peu de comportements manipulateurs. Des frictions occasionnelles sont normales dans toute relation.",
        adviceTitle: "À garder en tête",
        advice: [
          "Tout le monde agit parfois par intérêt — c'est le schéma, pas l'incident, qui compte.",
          "Continuez à communiquer ouvertement et directement.",
          "Faites confiance à votre instinct si cela venait à changer.",
        ],
      },
      {
        min: 34,
        color: "#f0a500",
        label: "Vigilance",
        title: "Quelques signaux — restez attentif",
        blurb: "Il y a ici un schéma préoccupant. Ce n'est peut-être pas délibéré, mais cela vaut la peine de protéger vos limites et d'observer l'évolution.",
        adviceTitle: "Que faire",
        advice: [
          "Nommez le comportement pour vous-même, afin qu'il cesse d'être déroutant.",
          "Posez une limite claire sur le point qui vous dérange le plus.",
          "Prenez des notes si les accords « changent » sans cesse.",
          "Parlez-en à une personne de confiance extérieure à la situation.",
        ],
      },
      {
        min: 60,
        color: "#b3123a",
        label: "Élevé",
        title: "Signaux sérieux — protégez-vous",
        blurb: "Ce schéma correspond à une manipulation durable. L'objectif n'est plus de les changer, mais de vous protéger.",
        adviceTitle: "Protégez-vous",
        advice: [
          "Partagez moins — l'information devient un levier.",
          "Cessez de vouloir gagner les discussions ; décrochez plutôt (la méthode du « rocher gris »).",
          "Consignez par écrit les conversations et accords importants.",
          "Appuyez-vous sur des personnes de confiance et cherchez un soutien professionnel si vous vous sentez en danger.",
        ],
      },
    ],
    questions: [
      "Ils déploient le charme pour obtenir ce qu'ils veulent, puis se refroidissent une fois servis.",
      "Ils mentent facilement et de façon convaincante, même sur de petites choses.",
      "Ils déforment vos propos jusqu'à ce que vous doutiez de votre propre mémoire.",
      "Ils montrent peu d'empathie réelle quand vous souffrez.",
      "Ils vous font culpabiliser pour des choses qui ne sont pas de votre fait.",
      "Ils passent outre vos limites même après un non clair.",
      "Quand on les met face à leurs actes, ils accusent tout le monde sauf eux-mêmes.",
      "Ils semblent prendre plaisir à semer le drame ou la discorde entre les gens.",
      "Leurs compliments vous laissent souvent mal à l'aise ou diminué.",
      "Ils présentent un visage très différent en public et en privé.",
      "Ils manifestent rarement de vrais remords après avoir blessé quelqu'un.",
      "Vous vous sentez vidé, confus ou manipulé après avoir passé du temps avec eux.",
    ].map((q) => ({
      q,
      options: [
        { text: "Jamais", points: 0 },
        { text: "Rarement", points: 1 },
        { text: "Parfois", points: 2 },
        { text: "Souvent", points: 3 },
      ],
    })),
  },

  handle: {
    kicker: "Guide de terrain",
    heading: "Comment gérer un manipulateur",
    sub: "On ne bat pas un manipulateur en le manipulant mieux. On devient une mauvaise cible.",
    nav: "Se protéger",
    cta: "Lire le guide de protection →",
    cards: [
      {
        icon: "✅",
        title: "À faire",
        tone: "do",
        items: [
          "Faites confiance à votre instinct — la confusion est une information",
          "Posez des limites fermes et tenez-les",
          "Gardez une trace des accords clés",
          "Limitez les informations personnelles que vous partagez",
          "Restez proche des personnes de confiance",
        ],
      },
      {
        icon: "⛔",
        title: "À éviter",
        tone: "dont",
        items: [
          "Essayer de les « réparer » ou de les sauver",
          "Discuter pour gagner — vous ne gagnerez pas",
          "Livrer des munitions émotionnelles",
          "Attendre une empathie ou des remords sincères",
          "Vous laisser isoler",
        ],
      },
      {
        icon: "🪨",
        title: "La méthode du rocher gris",
        tone: "",
        items: [
          "Soyez calme, bref et ennuyeux à provoquer",
          "Donnez des réponses courtes et neutres",
          "Ne réagissez pas émotionnellement — c'est le carburant",
          "Gardez les échanges pratiques, jamais personnels",
          "Faites de vous une cible sans intérêt",
        ],
      },
    ],
  },

  faq: [
    { q: "Un score élevé signifie-t-il que la personne est psychopathe ?", a: "Non. C'est un outil éducatif de réflexion, pas un diagnostic. Un score élevé signifie que le <em>comportement</em> mérite d'être pris au sérieux et qu'il faut s'en protéger — quelle que soit l'étiquette." },
    { q: "Tout le monde n'est-il pas manipulateur parfois ?", a: "Si — la plupart des gens usent occasionnellement de pression ou de charme. Ce qui compte, c'est un <em>schéma</em> constant qui penche toujours à l'avantage d'une seule personne et laisse l'autre en moins bon état." },
    { q: "Qu'est-ce que le « gaslighting », exactement ?", a: "C'est manipuler quelqu'un jusqu'à ce qu'il doute de sa mémoire ou de sa perception — soutenir que les choses ne se sont pas produites, ou que vous êtes « trop sensible », jusqu'à ce que vous cessiez de vous faire confiance." },
    { q: "Les traits psychopathiques sont-ils fréquents ?", a: "Les traits marqués sont relativement rares, mais ils s'étendent sur un spectre. Bien plus de gens emploient des techniques manipulatrices sans atteindre le moindre seuil clinique. C'est sur le comportement que vous pouvez agir." },
    { q: "Un manipulateur peut-il changer ?", a: "Parfois, mais seulement s'il le veut vraiment et fait le travail — ce qui est rare. Votre bien-être ne devrait pas dépendre de cette attente. Protégez-vous entre-temps." },
    { q: "C'est mon chef ou mon conjoint — et maintenant ?", a: "Misez sur les limites, les traces écrites et le soutien plutôt que sur la confrontation. Pour une relation proche ou dès que vous vous sentez en danger, parlez-en à un professionnel ou à un service d'aide local." },
  ],

  disc: {
    kicker: "Les quatre couleurs",
    heading: "La manipulation et les quatre couleurs",
    sub: "Les manipulateurs appuient sur des boutons différents selon la couleur DISC. Sachez quelle est la vôtre — et défendez-la.",
    nav: "Couleurs",
    labels: { relate: "Comment un manipulateur ferre cette couleur", reflect: "Si c'est vous — protégez-vous", treat: "Votre meilleure défense" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Trouvez votre couleur dans l'atelier DISC →",
    colors: {
      red: {
        relate: "Les manipulateurs flattent la combativité du Rouge et agitent des gains rapides et du statut pour le précipiter vers de mauvaises décisions.",
        reflect: "Votre impatience est la brèche — un manipulateur compte sur vos décisions à chaud. Ralentissez.",
        treat: "Exigez des preuves et du temps. Un vrai accord survit à une pause ; une manipulation, rarement.",
      },
      yellow: {
        relate: "Les Jaunes se font ferrer par le charme, les éloges et la promesse d'être aimés et admirés.",
        reflect: "Votre besoin d'approbation est le levier. Remarquez quand les compliments arrivent juste avant une demande.",
        treat: "Vérifiez les faits derrière la flatterie et gardez des amis lucides qui vous diront la vérité.",
      },
      green: {
        relate: "Les Verts sont exploités par la culpabilité, la loyauté et leur aversion pour le conflit.",
        reflect: "Votre envie de préserver la paix laisse les limites glisser en silence. Vous avez le droit de dire non.",
        treat: "Posez une limite claire et tenez-la — un manipulateur compte sur votre capitulation.",
      },
      blue: {
        relate: "Les Bleus sont attirés par une fausse logique, des détails et l'appel au « vous, au moins, vous êtes raisonnable ».",
        reflect: "Vous risquez de sur-analyser l'argumentation et de manquer la manipulation émotionnelle en dessous.",
        treat: "Fiez-vous au schéma, pas seulement aux mots — pesez les affirmations à l'aune de ce qu'ils font réellement.",
      },
    },
  },
};

window.BOOK_FR = BOOK_FR;
