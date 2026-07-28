/* =============================================================================
   Entouré de vampires — contenu français
   Atelier éducatif inspiré du travail de Thomas Erikson sur les vampires
   énergétiques. Structure identique à data.js ; clés, couleurs, icônes, points
   et seuils de bande restent inchangés.
   ========================================================================== */
const BOOK_FR = {
  meta: {
    key: "vampires",
    title: "Entouré de vampires",
    subtitle: "Repérez les vampires énergétiques et protégez votre batterie",
    short: "Vampires",
    emoji: "🧛",
    accent: "#9d174d",
    eyebrow: "Un atelier Thomas Erikson",
    description:
      "Un atelier éducatif inspiré du travail de Thomas Erikson sur les vampires énergétiques. Découvrez les quatre profils qui vous vident et comment protéger votre énergie.",
    heroTitle: "Qui vide<br />votre batterie ?",
    heroLead:
      "Certaines personnes vous laissent à plat à chaque fois. Découvrez les quatre types de vampires énergétiques — inspirés d'<em>Entouré de vampires</em> de Thomas Erikson — et comment protéger votre énergie.",
    heroCta: "Identifiez le vampire",
    footerNote:
      "Un atelier éducatif inspiré d'<em>Entouré de vampires</em> de Thomas Erikson. Un outil de réflexion pour des relations plus saines — pas une étiquette à coller sur quelqu'un.",
  },

  learn: {
    kicker: "Les idées",
    heading: "Les gens qui vous vident",
    sub: "Les vampires énergétiques ne sont pas des monstres — ce sont des personnes dont les habitudes vous laissent épuisé. Touchez une carte pour aller plus loin.",
  },

  concepts: [
    {
      icon: "🧛",
      name: "Qu'est-ce qu'un vampire énergétique ?",
      tag: "De l'épuisement, pas de la méchanceté.",
      summary:
        "Un vampire énergétique est toute personne qui vous laisse systématiquement vidé — par sa négativité, sa dépendance, son chaos ou son besoin de contrôle. La plupart ne le font pas exprès : c'est simplement leur façon d'être en relation. Nommer le schéma est le premier pas pour se protéger.",
      points: [
        "Le signe est simple : vous vous sentez moins bien après chaque rencontre.",
        "C'est en général une habitude, pas une cruauté délibérée.",
        "Votre énergie est une ressource qui mérite d'être défendue.",
        "On peut tenir à quelqu'un et limiter malgré tout la fuite d'énergie.",
      ],
    },
    {
      icon: "🩸",
      name: "Les quatre types",
      tag: "Victime, critique, drame, contrôleur.",
      summary:
        "Les vampires énergétiques se répartissent en styles reconnaissables : l'éternelle victime, le critique infatigable, l'aimant à drames et le contrôleur. Chacun vous vide différemment — et se gère différemment.",
      points: [
        "<strong>La victime :</strong> vous vide par la culpabilité et des problèmes sans fin.",
        "<strong>Le critique :</strong> vous vide par la négativité et le jugement.",
        "<strong>L'aimant à drames :</strong> vous vide par la crise permanente.",
        "<strong>Le contrôleur :</strong> vous vide par la pression et l'obligation.",
      ],
    },
    {
      icon: "🔋",
      name: "Comment ils vous vident",
      tag: "Ils s'accrochent à vos meilleurs réflexes.",
      summary:
        "Les vampires énergétiques s'accrochent à votre empathie, à votre envie d'aider, à votre besoin d'approbation ou à votre peur du conflit. La fuite fonctionne parce que vous continuez à donner ce qu'ils continuent à prendre.",
      points: [
        "La culpabilité vous maintient dans le sauvetage de la victime.",
        "Le désir d'approbation vous garde auprès du critique.",
        "L'adrénaline vous accroche au drame.",
        "La peur du conflit vous fait obéir au contrôleur.",
      ],
    },
    {
      icon: "🛡️",
      name: "Protégez votre énergie",
      tag: "Limites et distance.",
      summary:
        "Vous protégez votre batterie en limitant l'exposition, en tenant vos limites et en refusant de fournir la réaction dont ils se nourrissent. Vous n'avez pas à les réparer — arrêtez simplement de vous vider.",
      points: [
        "Limitez le temps et l'accès que vous leur accordez.",
        "Tenez vos limites sans longues justifications.",
        "Ne fournissez ni la culpabilité, ni l'approbation, ni le drame qu'ils recherchent.",
        "Rechargez votre énergie délibérément.",
      ],
    },
    {
      icon: "💡",
      name: "Gérez votre propre état",
      tag: "C'est vous qui tenez la prise.",
      summary:
        "La seule chose que vous maîtrisez toujours, c'est votre propre réaction. Restez calme, gardez du recul et décidez à l'avance ce que vous êtes prêt à donner. Une personne stable est une cible bien plus petite.",
      points: [
        "Fixez vos limites avant la rencontre, pas pendant.",
        "Restez calme — votre réaction est le carburant.",
        "Gardez du recul sur ce qui relève vraiment de vous.",
        "Protégez et rechargez votre énergie volontairement.",
      ],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Identifier",
    heading: "Quel vampire énergétique est-ce ?",
    sub: "Pensez à une personne précise qui vous laisse vidé. Répondez sur ce que vous observez et nous estimerons son type.",
    nav: "Identifier",
    icon: "🔎",
    introTitle: "12 observations",
    introText: "Gardez en tête une personne qui vous épuise et choisissez l'option qui <em>lui</em> ressemble le plus.",
    resultEyebrow: "Le vampire énergétique auquel vous faites face",
    categories: {
      victim: {
        name: "La victime",
        icon: "🌀",
        color: "#6d28d9",
        summary:
          "Rien n'est jamais de sa faute et rien ne s'améliore jamais. Elle vous vide par la culpabilité et un besoin sans fond d'être sauvée.",
        signs: ["Un récit de malheur permanent", "Jamais sa responsabilité", "Rejette toutes les solutions proposées", "Vous rend coupable et indispensable", "Ne change jamais rien, en réalité"],
        handle: ["Montrez de l'empathie sans reprendre le problème à votre compte", "Cessez de proposer des solutions qu'elle refusera", "Limitez votre temps de sauvetage", "Refusez la culpabilité", "Orientez-la vers une véritable aide professionnelle"],
      },
      critic: {
        name: "Le critique",
        icon: "🗯️",
        color: "#b45309",
        summary:
          "Un chercheur de défauts infatigable. Sa négativité et ses jugements rongent peu à peu votre confiance et votre énergie.",
        signs: ["Trouve le défaut en toute chose", "Compliments à double tranchant", "Dit rarement quelque chose de positif", "Juge les gens et leurs choix", "Vous laisse dans le doute de vous-même"],
        handle: ["Ne courez pas après son approbation", "Rappelez-vous d'où cela vient", "Gardez vos propres critères", "Limitez votre exposition", "Décrochez au lieu de vous défendre"],
      },
      drama: {
        name: "L'aimant à drames",
        icon: "🎭",
        color: "#db2777",
        summary:
          "Passe de crise en crise et vous entraîne dedans. Tout est urgent, énorme et épuisant.",
        signs: ["Un flot ininterrompu d'urgences", "Tout prend des proportions énormes", "Se nourrit du chaos", "Amplifie les petites choses", "Vous laisse à cran"],
        handle: ["Restez calme et sans précipitation", "N'épousez pas leur urgence", "Distinguez les vraies crises du bruit", "Gardez des limites fermes", "Refusez d'être le public"],
      },
      controller: {
        name: "Le contrôleur",
        icon: "🕸️",
        color: "#0f766e",
        summary:
          "Il faut que tout se passe à sa manière, et il use de culpabilité, de pression et d'obligation pour y parvenir. Auprès de lui, on marche sur des œufs.",
        signs: ["Passe outre vos limites", "Culpabilité et obligation comme outils", "Sa manière ou rien", "Punit le « non »", "Vous rend craintif face à vos propres choix"],
        handle: ["Tenez vos limites avec calme", "N'expliquez pas votre « non » à l'excès", "Réduisez le levier qu'il a sur vous", "Gardez la propriété de vos décisions", "Cherchez du soutien si cela devient coercitif"],
      },
    },
    questions: [
      { q: "Après un moment avec eux, vous vous sentez…", options: [
        { text: "Coupable et responsable de leurs problèmes", cat: "victim" },
        { text: "Jugé et dégonflé", cat: "critic" },
        { text: "Épuisé par les crises incessantes", cat: "drama" },
        { text: "Sous pression et enfermé", cat: "controller" },
      ]},
      { q: "Leur sujet favori, c'est…", options: [
        { text: "Tout ce qui a mal tourné pour eux", cat: "victim" },
        { text: "Ce qui ne va pas chez tout le monde et en toute chose", cat: "critic" },
        { text: "La dernière urgence en date", cat: "drama" },
        { text: "Comment il faudrait faire — à leur manière", cat: "controller" },
      ]},
      { q: "Quand vous annoncez une bonne nouvelle, ils…", options: [
        { text: "Ramènent la conversation à leurs ennuis", cat: "victim" },
        { text: "Trouvent le défaut ou le piège", cat: "critic" },
        { text: "Surenchérissent avec une histoire plus grosse", cat: "drama" },
        { text: "Vous disent ce que vous devriez faire ensuite", cat: "controller" },
      ]},
      { q: "Ils vous gardent accroché en…", options: [
        { text: "Vous rendant indispensable et coupable", cat: "victim" },
        { text: "Vous faisant convoiter leur rare approbation", cat: "critic" },
        { text: "Vous entraînant dans l'excitation", cat: "drama" },
        { text: "Vous faisant redouter les suites d'un « non »", cat: "controller" },
      ]},
      { q: "La responsabilité des problèmes…", options: [
        { text: "N'est jamais la leur", cat: "victim" },
        { text: "Est toujours la faute d'un autre", cat: "critic" },
        { text: "N'a pas d'importance — place au drame", cat: "drama" },
        { text: "Est la vôtre si vous n'avez pas obéi", cat: "controller" },
      ]},
      { q: "Quand vous posez une limite, ils…", options: [
        { text: "Vous culpabilisent de les abandonner", cat: "victim" },
        { text: "Vous rabaissent pour cela", cat: "critic" },
        { text: "En font une scène énorme", cat: "drama" },
        { text: "L'ignorent et forcent quand même", cat: "controller" },
      ]},
      { q: "Ils vous vident par…", options: [
        { text: "La compassion et l'obligation", cat: "victim" },
        { text: "La négativité et les remarques cassantes", cat: "critic" },
        { text: "Le chaos et l'urgence", cat: "drama" },
        { text: "La culpabilité et la pression", cat: "controller" },
      ]},
      { q: "Ce qu'ils attendent de vous, c'est…", options: [
        { text: "Un sauvetage sans fin", cat: "victim" },
        { text: "Un acquiescement à leurs jugements", cat: "critic" },
        { text: "Un public pour le spectacle", cat: "drama" },
        { text: "De l'obéissance", cat: "controller" },
      ]},
      { q: "À leurs côtés, vous devenez…", options: [
        { text: "Un thérapeute que vous n'avez jamais choisi d'être", cat: "victim" },
        { text: "Plus petit et plus incertain", cat: "critic" },
        { text: "Emporté et à cran", cat: "drama" },
        { text: "Quelqu'un qui marche sur des œufs", cat: "controller" },
      ]},
      { q: "Ils font rarement…", options: [
        { text: "Quelque chose pour régler le problème", cat: "victim" },
        { text: "Une remarque positive", cat: "critic" },
        { text: "En sorte que les choses restent calmes", cat: "drama" },
        { text: "En sorte que vous choisissiez vous-même", cat: "controller" },
      ]},
      { q: "Leur ton habituel est…", options: [
        { text: "Plaintif et impuissant", cat: "victim" },
        { text: "Cassant et négatif", cat: "critic" },
        { text: "Bruyant et chaotique", cat: "drama" },
        { text: "Exigeant et forceur de limites", cat: "controller" },
      ]},
      { q: "La relation tourne grâce à…", options: [
        { text: "Votre culpabilité", cat: "victim" },
        { text: "Votre besoin d'approbation", cat: "critic" },
        { text: "Votre adrénaline", cat: "drama" },
        { text: "Votre peur", cat: "controller" },
      ]},
    ],
  },

  assessment2: {
    mode: "score",
    shuffle: false,
    shuffleOptions: false,
    kicker: "Deuxième évaluation",
    heading: "Et si c'était vous qui vidiez les autres ?",
    sub: "La question la plus courageuse. Indiquez honnêtement à quelle fréquence chaque phrase vous correspond. C'est un miroir privé, pas un verdict.",
    nav: "Est-ce moi ?",
    icon: "\uD83E\uDE9E",
    introTitle: "10 affirmations sincères",
    introText: "Répondez sur <em>vos propres</em> habitudes, aussi sincèrement que possible.",
    resultEyebrow: "Votre propre tendance à vider les autres",
    scaleLow: "Vous ressourcez",
    scaleHigh: "Vous épuisez",
    bands: [
      { min: 0, color: "#2a9d5c", label: "Faible", title: "Vous donnez plus d'énergie que vous n'en prenez", blurb: "Vos habitudes laissent le plus souvent les autres ressourcés. Continuez — et restez lucide les jours difficiles.", adviceTitle: "Gardez le cap", advice: ["Continuez à laisser aux autres de la place et du calme.", "Repérez votre réflexe sous stress et gérez-le.", "Rechargez-vous pour avoir de l'énergie à donner."] },
      { min: 34, color: "#f0a500", label: "Quelques-unes", title: "Quelques habitudes à surveiller", blurb: "Vous ressourcez souvent les autres, mais certaines habitudes peuvent les user. De petits ajustements changent beaucoup.", adviceTitle: "Ajustez", advice: ["Repérez l'habitude qui a le score le plus haut et adoucissez-la.", "Demandez un retour sincère à un ami de confiance.", "Décompressez moins, reliez-vous davantage — et assumez votre propre état.", "Rechargez-vous au lieu de vous appuyer sur une seule personne."] },
      { min: 60, color: "#b3123a", label: "Élevée", title: "Vous épuisez peut-être votre entourage", blurb: "Certaines de vos habitudes laissent sans doute les gens vidés. C'est tout à fait modifiable — et la prise de conscience est déjà le premier pas.", adviceTitle: "Commencez ici", advice: ["Assumez votre propre état au lieu de le sous-traiter.", "Laissez aux autres de l'espace, la parole et du calme.", "Remplacez la plainte par une demande ou une action.", "Envisagez d'en parler à un coach ou à un thérapeute."] },
    ],
    questions: [
      "Je déballe souvent mes problèmes sans vraiment vouloir de solution.",
      "Je souligne fréquemment ce qui ne va pas chez les gens et dans les choses.",
      "J'ai tendance à transformer les situations en crise ou en drame.",
      "J'use de culpabilité ou de pression pour que les gens fassent ce que je veux.",
      "Quand quelqu'un annonce une bonne nouvelle, je ramène la conversation à moi.",
      "Les gens semblent fatigués ou éteints après avoir passé du temps avec moi.",
      "Je prends rarement mes responsabilités quand les choses tournent mal.",
      "J'ai du mal à laisser une conversation rester légère et positive.",
      "J'attends des autres qu'ils règlent mes problèmes à ma place.",
      "Je passe outre les limites des autres quand je veux quelque chose.",
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
    heading: "Comment protéger votre énergie",
    sub: "Vous n'avez pas à réparer un vampire énergétique. Vous avez seulement à cesser de vous vider.",
    nav: "Se protéger",
    cta: "Lire le guide de protection de l'énergie →",
    cards: [
      { icon: "✅", title: "À faire", tone: "do", items: [
        "Fixez vos limites avant d'y aller", "Tenez vos limites calmement et brièvement", "Restez sans réaction — votre réaction est le carburant", "Limitez le temps et l'accès qu'ils obtiennent", "Rechargez votre énergie volontairement",
      ]},
      { icon: "⛔", title: "À éviter", tone: "dont", items: [
        "Essayer de les réparer ou de les sauver", "Courir après l'approbation ou vouloir gagner les discussions", "Épouser leur drame ou leur urgence", "Accepter une culpabilité qui n'est pas la vôtre", "Les laisser dicter vos choix",
      ]},
      { icon: "🔋", title: "Des limites d'énergie", tone: "", items: [
        "Bornez le temps : « j'ai dix minutes »", "Réorientez : de l'empathie, puis on avance", "Ne fournissez ni culpabilité, ni approbation, ni drame", "Reculez dès que cela s'envenime", "Rechargez-vous auprès de ceux qui vous remplissent",
      ]},
    ],
  },

  faq: [
    { q: "Un vampire énergétique est-il une mauvaise personne ?", a: "Pas nécessairement. La plupart vident les autres par habitude, non par malveillance — la victime se sent réellement impuissante, le critique voit réellement des défauts. C'est le comportement qui vous épuise, quelle que soit l'intention." },
    { q: "Peut-on être plusieurs types ?", a: "Oui. Beaucoup de gens mélangent les profils — une victime qui devient contrôlante, un critique qui adore le drame. Votre résultat montre la correspondance la plus forte et l'équilibre entre les quatre." },
    { q: "Et si le vampire énergétique, c'est moi ?", a: "Question honnête, et saine. Repérez le schéma dans lequel vous glissez sous stress, assumez votre propre état et offrez aux autres le calme et l'espace que vous voudriez recevoir." },
    { q: "Comment protéger mon énergie sans être froid ?", a: "Poser des limites n'a rien de cruel. Vous pouvez rester chaleureux tout en limitant le temps, en refusant la culpabilité et en cessant d'alimenter le drame. Bienveillance et protection de soi vont très bien ensemble." },
    { q: "Quand faut-il partir ?", a: "Si quelqu'un vous vide systématiquement et ne respecte aucune limite — ou si la relation devient coercitive — réduire ou couper le contact est un choix légitime et sain." },
    { q: "Tout le monde n'épuise-t-il pas les autres parfois ?", a: "Si. Chacun a ses mauvais jours. Le souci, c'est un <em>schéma</em> persistant où les habitudes d'une même personne vous laissent invariablement vidé." },
  ],

  disc: {
    kicker: "Les quatre couleurs",
    heading: "L'énergie et les quatre couleurs",
    sub: "Chaque couleur DISC vide les autres et se vide elle-même à sa manière. Connaître les deux protège tout le monde.",
    nav: "Couleurs",
    labels: { relate: "Comment cette couleur vide les autres", reflect: "Comment cette couleur se vide", treat: "La solution" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Découvrir l'atelier des couleurs DISC →",
    colors: {
      red: {
        relate: "Les Rouges vident les autres en passant en force, par impatience et en transformant tout en pression.",
        reflect: "Les Rouges se vident face à l'inefficacité, aux tergiversations et à ceux qui n'en viennent pas au fait.",
        treat: "Ralentissez pour les autres ; protégez votre énergie en déléguant et en abandonnant les batailles sans valeur.",
      },
      yellow: {
        relate: "Les Jaunes vident les autres par un flot de paroles, du drame et un besoin d'attention permanent.",
        reflect: "Les Jaunes se vident dans l'isolement, sous la critique et dans les routines ternes et pointilleuses.",
        treat: "Laissez la parole aux autres ; rechargez-vous par la variété et les rencontres, pas en déversant tout sur un seul ami.",
      },
      green: {
        relate: "Les Verts vident les autres par une résistance passive, la culpabilité et le refus de dire ce dont ils ont besoin.",
        reflect: "Les Verts se vident dans le conflit, face à l'insistance et à force de porter les problèmes de tous.",
        treat: "Dites directement ce dont vous avez besoin ; protégez-vous en n'absorbant pas chaque fardeau.",
      },
      blue: {
        relate: "Les Bleus vident les autres par une critique incessante, la négativité et les « ça ne marchera jamais ».",
        reflect: "Les Bleus se vident dans le chaos, le flou et la précipitation.",
        treat: "Équilibrez la critique par ce qui fonctionne ; protégez votre énergie avec de la structure et des informations claires.",
      },
    },
  },
};

window.BOOK_FR = BOOK_FR;
