/* =============================================================================
   Entouré de mauvais chefs (et d'employés paresseux) — contenu français
   Atelier éducatif inspiré du livre de Thomas Erikson. Structure identique à
   data.js ; les clés de catégorie, les couleurs, les icônes et l'ordre restent
   inchangés.
   ========================================================================== */
const BOOK_FR = {
  meta: {
    key: "bad-bosses",
    title: "Entouré de mauvais chefs",
    subtitle: "Repérez le type et apprenez à gérer votre chef",
    short: "Mauvais chefs",
    emoji: "💼",
    accent: "#b45309",
    eyebrow: "Un atelier Thomas Erikson",
    description:
      "Un atelier éducatif inspiré d'« Entouré de mauvais chefs et d'employés paresseux » de Thomas Erikson. Repérez les dérives du management et apprenez à gérer votre chef.",
    heroTitle: "Votre chef est-il<br />le problème ?",
    heroLead:
      "Rien n'épuise une équipe plus vite qu'un mauvais management. Découvrez les grands types de mauvais chefs avec <em>Entouré de mauvais chefs et d'employés paresseux</em> de Thomas Erikson — et apprenez à manager vers le haut.",
    heroCta: "Diagnostiquez votre chef",
    footerNote:
      "Un atelier éducatif inspiré d'<em>Entouré de mauvais chefs et d'employés paresseux</em> de Thomas Erikson. Un outil de réflexion pour de meilleures relations de travail — pas une évaluation d'une personne réelle.",
  },

  learn: {
    kicker: "Les idées",
    heading: "Pourquoi le bon management est rare",
    sub: "La plupart des mauvais chefs ne sont pas des méchants — ce sont des gens promus au-delà de leurs compétences, sous pression, qui dirigent à l'instinct. Touchez une carte pour aller plus loin.",
  },

  concepts: [
    {
      icon: "🧭",
      name: "Diriger, c'est un comportement",
      tag: "Pas un titre — un ensemble d'habitudes.",
      summary:
        "Le leadership n'est pas une personnalité innée ; c'est un comportement que l'on choisit. Les meilleurs managers adaptent leur style à la personne et à la situation. Les pires imposent un style rigide à tout le monde et appellent cela « c'est comme ça que je suis ».",
      points: [
        "Un bon management s'adapte à l'individu, pas à l'organigramme.",
        "Chacun a besoin d'une dose différente de cadrage et de soutien.",
        "La plupart des « mauvais chefs » dirigent en pilotage automatique, pas par malveillance.",
        "Un même comportement peut être une force ou un poison selon la dose.",
      ],
    },
    {
      icon: "🎭",
      name: "Les types de mauvais chefs",
      tag: "Tyran, micromanager, chef fantôme, chef trop conciliant.",
      summary:
        "Le mauvais management se regroupe en dérives reconnaissables : régner par la peur, contrôler chaque détail, disparaître totalement ou fuir toute décision difficile. Le questionnaire estime à qui vous avez affaire.",
      points: [
        "<strong>Le tyran :</strong> dirige par la peur, la pression et le reproche.",
        "<strong>Le micromanager :</strong> incapable de déléguer ou de faire confiance.",
        "<strong>Le chef fantôme :</strong> absent, vague, sans cap.",
        "<strong>Le chef trop conciliant :</strong> fuit les décisions et les conflits.",
      ],
    },
    {
      icon: "😴",
      name: "Le mythe de l'« employé paresseux »",
      tag: "Le désengagement a des causes.",
      summary:
        "Erikson soutient que la plupart des employés « paresseux » ne le sont pas — ils manquent de clarté, de motivation, sont mal placés ou mal encadrés. Un comportement qui ressemble à de la paresse a presque toujours une cause qu'on peut corriger.",
      points: [
        "Des attentes floues ressemblent à de la paresse.",
        "Un poste inadapté aux forces de la personne ressemble à de la paresse.",
        "Une motivation perdue après avoir été ignoré ressemble à de la paresse.",
        "Traitez la cause avant de juger la personne.",
      ],
    },
    {
      icon: "⬆️",
      name: "Manager vers le haut",
      tag: "Composez avec le chef que vous avez.",
      summary:
        "On choisit rarement son chef, mais on peut gérer la relation. Comprenez ce qu'il craint et ce qu'il valorise, adaptez votre façon de communiquer, et facilitez-lui la confiance.",
      points: [
        "Découvrez ce qui inquiète vraiment votre chef.",
        "Donnez-lui l'information sous la forme qu'il préfère.",
        "Réduisez son incertitude et vous réduirez ses dérapages.",
        "Consignez les accords pour que les objectifs ne bougent pas en douce.",
      ],
    },
    {
      icon: "🔧",
      name: "Si c'est vous, le chef",
      tag: "Le manager lucide.",
      summary:
        "On glisse facilement dans chacun de ces types sous pression. L'antidote est la lucidité : repérez votre dérive habituelle et allez délibérément vers ce dont chacun a besoin.",
      points: [
        "Sachez vers quel type de mauvais chef vous dérivez sous stress.",
        "Demandez un retour sincère — et agissez vraiment dessus.",
        "Déléguez des résultats, pas seulement des tâches.",
        "Adaptez votre style à chaque membre de l'équipe.",
      ],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Diagnostic",
    heading: "Quel genre de chef avez-vous ?",
    sub: "Pensez à un manager précis — actuel ou passé. Répondez selon ce que vous observez et nous estimerons sa dérive dominante.",
    nav: "Diagnostic",
    icon: "🔎",
    introTitle: "12 observations",
    introText: "Gardez un chef en tête et choisissez l'option qui <em>lui</em> ressemble le plus.",
    resultEyebrow: "Le type dominant de votre chef",
    categories: {
      tyrant: {
        name: "Le tyran",
        icon: "⚡",
        color: "#b91c1c",
        summary:
          "Dirige par la peur, la pression et le reproche. Des résultats tout de suite, des égards jamais. L'équipe produit par angoisse, pas par engagement — et s'épuise.",
        signs: ["Règne par l'intimidation et la pression", "Reproche au lieu de faire progresser", "Critique en public, s'attribue le mérite en privé", "Peu d'égards pour la charge de travail ou les gens", "Les conversations s'arrêtent quand il entre"],
        handle: ["Restez calme, factuel et sûr de vous", "Apportez des solutions, pas des problèmes", "Consignez décisions et consignes", "Posez des limites face aux comportements inacceptables", "Protégez votre santé et connaissez vos portes de sortie"],
      },
      micromanager: {
        name: "Le micromanager",
        icon: "🔬",
        color: "#b45309",
        summary:
          "Incapable de déléguer ou de faire confiance. Veut valider chaque détail, réécrit votre travail et confond contrôle et qualité. Les talents étouffent sous sa coupe.",
        signs: ["Veut tout vérifier et tout valider", "Réécrit inutilement le travail", "Réclame des points d'étape en continu", "Peine à confier une vraie responsabilité", "Confond contrôle et qualité"],
        handle: ["Communiquez l'avancement en amont, généreusement", "Partagez votre plan avant qu'il le demande", "Bâtissez la confiance par de petites réussites fiables", "Convenez de points de contrôle pour supprimer la surprise", "Demandez calmement la responsabilité de périmètres définis"],
      },
      ghost: {
        name: "Le chef fantôme",
        icon: "👻",
        color: "#64748b",
        summary:
          "Absent et vague. Aucun cap, aucun retour, injoignable quand il faut trancher — puis surpris quand ça dérape, ou discrètement là pour récolter le mérite.",
        signs: ["Indisponible et difficile à saisir", "Donne un cap flou, ou aucun", "Peu de retours et de soutien", "Les décisions s'enlisent en l'attendant", "Réapparaît quand il y a du mérite à prendre"],
        handle: ["Demandez des décisions précises et écrites", "Proposez des défauts : « sauf objection, je vais… »", "Créez votre propre clarté et faites-la confirmer", "Gardez une trace de vos contributions", "Bâtissez un réseau de soutien en dehors de lui"],
      },
      pushover: {
        name: "Le chef trop conciliant",
        icon: "🌾",
        color: "#0891b2",
        summary:
          "Fuit le conflit et l'indécision règne. Si soucieux d'être apprécié que les problèmes s'enveniment, que les mauvaises performances passent et que l'équipe dérive sans gouvernail.",
        signs: ["Évite les décisions difficiles et les conflits", "Dit oui à tous, ne tient parole avec personne", "Laisse filer problèmes et contre-performances", "Change de cap selon le dernier qui a parlé", "L'équipe manque de priorités claires"],
        handle: ["Apportez des recommandations claires à trancher", "Rendez le « oui » facile et peu risqué", "Mettez les priorités par écrit pour l'y tenir", "Comblez le vide par votre propre clarté", "Faites remonter les blocages, poliment mais fermement"],
      },
    },
    questions: [
      { q: "Comment donne-t-il le cap ?", options: [
        { text: "Des ordres, avec la pression du résultat", cat: "tyrant" },
        { text: "Dans un détail exhaustif et contrôlant", cat: "micromanager" },
        { text: "Vaguement, quand il le fait", cat: "ghost" },
        { text: "Selon ce qui plaît au dernier qui a demandé", cat: "pushover" },
      ]},
      { q: "Quand quelque chose dérape, il…", options: [
        { text: "Cherche un coupable", cat: "tyrant" },
        { text: "Reprend tout et le refait lui-même", cat: "micromanager" },
        { text: "Est introuvable", cat: "ghost" },
        { text: "Évite complètement d'en parler", cat: "pushover" },
      ]},
      { q: "Comment traite-t-il votre travail ?", options: [
        { text: "Il en exige plus, et plus vite", cat: "tyrant" },
        { text: "Il vérifie et réécrit chaque détail", cat: "micromanager" },
        { text: "Il y jette à peine un œil", cat: "ghost" },
        { text: "Il valide tout pour éviter les frictions", cat: "pushover" },
      ]},
      { q: "En réunion, il…", options: [
        { text: "Domine et intimide", cat: "tyrant" },
        { text: "S'enfonce dans des détails minuscules", cat: "micromanager" },
        { text: "Est absent ou distrait", cat: "ghost" },
        { text: "Approuve tout le monde et ne décide rien", cat: "pushover" },
      ]},
      { q: "Ses retours sont en général…", options: [
        { text: "Durs et critiques", cat: "tyrant" },
        { text: "Pointilleux et incessants", cat: "micromanager" },
        { text: "Rares ou inexistants", cat: "ghost" },
        { text: "Flous et rassurants, jamais utiles", cat: "pushover" },
      ]},
      { q: "Comment traite-t-il les erreurs ?", options: [
        { text: "Il les sanctionne", cat: "tyrant" },
        { text: "Il s'en sert pour justifier plus de contrôle", cat: "micromanager" },
        { text: "Il ne les voit qu'une fois la crise arrivée", cat: "ghost" },
        { text: "Il les balaie sous le tapis", cat: "pushover" },
      ]},
      { q: "Quelle confiance accorde-t-il à l'équipe ?", options: [
        { text: "Uniquement par la peur et la surveillance", cat: "tyrant" },
        { text: "Aucune — il doit tout valider", cat: "micromanager" },
        { text: "Il a complètement décroché", cat: "ghost" },
        { text: "Il fait confiance à tous pareillement, même aux plus faibles", cat: "pushover" },
      ]},
      { q: "Quand il vous faut une décision, il…", options: [
        { text: "Tranche vite mais écrase les objections", cat: "tyrant" },
        { text: "Ne décide pas sans le moindre détail", cat: "micromanager" },
        { text: "Est impossible à joindre", cat: "ghost" },
        { text: "Repousse sans cesse pour ne contrarier personne", cat: "pushover" },
      ]},
      { q: "Comment gère-t-il le mérite ?", options: [
        { text: "Il le prend et fait redescendre le blâme", cat: "tyrant" },
        { text: "Il affirme que votre travail a eu besoin de toutes ses corrections", cat: "micromanager" },
        { text: "Il n'apparaît que quand il y a du mérite à récolter", cat: "ghost" },
        { text: "Il le distribue pour préserver la paix", cat: "pushover" },
      ]},
      { q: "L'ambiance qu'il installe est…", options: [
        { text: "Tendue et anxiogène", cat: "tyrant" },
        { text: "Inquiète, où l'on doute de soi", cat: "micromanager" },
        { text: "Sans gouvernail et confuse", cat: "ghost" },
        { text: "Sans cap et frustrante", cat: "pushover" },
      ]},
      { q: "Les personnes en difficulté dans l'équipe sont…", options: [
        { text: "Poussées dehors", cat: "tyrant" },
        { text: "Gérées en leur retirant toute autonomie", cat: "micromanager" },
        { text: "Ignorées, comme tout le monde", cat: "ghost" },
        { text: "Jamais recadrées", cat: "pushover" },
      ]},
      { q: "Quand vous lui tenez tête, il…", options: [
        { text: "Réagit avec colère", cat: "tyrant" },
        { text: "Resserre son emprise", cat: "micromanager" },
        { text: "Se désengage encore plus", cat: "ghost" },
        { text: "Cède, puis en garde discrètement rancune", cat: "pushover" },
      ]},
    ],
  },

  assessment2: {
    mode: "classify",
    kicker: "Deuxième évaluation",
    heading: "Cet employé est-il vraiment paresseux ?",
    sub: "Erikson soutient que la plupart des employés « paresseux » ne le sont pas — ils manquent de clarté, sont mal placés, démotivés ou désengagés. Pensez à une personne en difficulté et cherchez la vraie cause.",
    nav: "Employés paresseux",
    icon: "\uD83D\uDE34",
    introTitle: "10 observations",
    introText: "Gardez en tête une personne en difficulté et choisissez ce qui <em>lui</em> ressemble le plus.",
    resultEyebrow: "La vraie raison derrière la « paresse »",
    categories: {
      unclear: {
        name: "Celui qui manque de clarté", icon: "\u2753", color: "#0891b2",
        summary: "Pas paresseux — mal informé. Il ne sait tout simplement pas à quoi ressemble « bien fait », alors l'effort s'éparpille ou s'arrête.",
        signsTitle: "Ce que vous observerez", handleTitle: "Comment le remobiliser",
        signs: ["De la bonne volonté, mais de la confusion", "Un travail qui rate régulièrement la cible", "Surpris par les retours", "Souvent nouveau ou récemment réorganisé"],
        handle: ["Explicitez les attentes et ce que « terminé » veut dire", "Convenez des priorités et des points d'étape", "Vérifiez la compréhension — ne la présumez pas", "Corrigez le cap tôt et souvent"],
      },
      mismatched: {
        name: "Celui qui n'est pas à sa place", icon: "\uD83E\uDDE9", color: "#b45309",
        summary: "Pas paresseux — mal placé. C'est une pièce carrée dans un trou rond ; ses forces sont ailleurs.",
        signsTitle: "Ce que vous observerez", handleTitle: "Comment le remobiliser",
        signs: ["S'acharne sur les mauvaises choses", "Peine durablement malgré ses efforts", "Brille sur d'autres tâches", "N'a jamais tout à fait la bonne taille pour le poste"],
        handle: ["Identifiez ses véritables forces", "Redessinez le poste ou changez-le de place", "Appuyez-vous sur ce qu'il fait bien", "Ne confondez pas mauvaise adéquation et mauvaise volonté"],
      },
      demotivated: {
        name: "Le démotivé", icon: "\uD83D\uDD0B", color: "#64748b",
        summary: "Pas paresseux — démotivé. Il tenait à son travail, s'est senti ignoré ou pris pour acquis, et a débranché.",
        signsTitle: "Ce que vous observerez", handleTitle: "Comment le remobiliser",
        signs: ["Une énergie plate et découragée", "Une attitude « à quoi bon »", "Revit dès qu'on le reconnaît", "Un passé d'invisibilité"],
        handle: ["Reconnaissez sa contribution sincèrement", "Associez-le aux décisions", "Reconnectez son travail à un sens", "Rebâtissez la confiance en tenant vos engagements"],
      },
      checkedout: {
        name: "Le désengagé", icon: "\uD83D\uDEAA", color: "#b91c1c",
        summary: "Vraiment désengagé ou épuisé. Il est parti mentalement — cela demande une remise à plat honnête, pas davantage de pression.",
        signsTitle: "Ce que vous observerez", handleTitle: "Comment le remobiliser",
        signs: ["Un engagement minimal", "Presque aucune réaction aux retours", "Malheureux ou épuisé depuis longtemps", "Fait les gestes, sans plus"],
        handle: ["Ayez une conversation franche et bienveillante", "Distinguez épuisement et désengagement", "Convenez d'un cap clair : se remobiliser ou partir", "Traitez la cause, n'ajoutez pas de pression"],
      },
    },
    questions: [
      { q: "Quand vous demandez pourquoi le travail n'est pas fait, il répond…", options: [
        { text: "« Je ne savais pas que c'était ce que vous vouliez »", cat: "unclear" },
        { text: "« Ce n'est pas vraiment le genre de chose où je suis bon »", cat: "mismatched" },
        { text: "« À quoi bon, personne ne le remarque de toute façon »", cat: "demotivated" },
        { text: "« Honnêtement, ça ne m'intéresse plus »", cat: "checkedout" },
      ]},
      { q: "Son énergie est…", options: [
        { text: "Volontaire mais confuse", cat: "unclear" },
        { text: "Investie à fond dans les mauvaises choses", cat: "mismatched" },
        { text: "Plate et découragée", cat: "demotivated" },
        { text: "Absente", cat: "checkedout" },
      ]},
      { q: "Avec une tâche claire et bien adaptée, il…", options: [
        { text: "Livre soudain du bon travail", cat: "unclear" },
        { text: "Peine quand même", cat: "mismatched" },
        { text: "S'y met s'il se sent apprécié", cat: "demotivated" },
        { text: "Ne s'implique toujours pas", cat: "checkedout" },
      ]},
      { q: "Il reprend vie quand…", options: [
        { text: "Les attentes sont explicitées", cat: "unclear" },
        { text: "On le place sur un travail qui lui convient", cat: "mismatched" },
        { text: "Son effort est reconnu", cat: "demotivated" },
        { text: "Rarement — il est déjà parti mentalement", cat: "checkedout" },
      ]},
      { q: "La cause profonde ressemble à…", options: [
        { text: "Une mauvaise communication", cat: "unclear" },
        { text: "Un poste inadapté", cat: "mismatched" },
        { text: "Le sentiment d'être pris pour acquis", cat: "demotivated" },
        { text: "Un désengagement profond ou un burn-out", cat: "checkedout" },
      ]},
      { q: "Son parcours, c'est…", options: [
        { text: "Un poste nouveau ou récemment modifié", cat: "unclear" },
        { text: "Un rôle qui a toujours été un cran trop haut", cat: "mismatched" },
        { text: "Il s'investissait, puis on l'a ignoré", cat: "demotivated" },
        { text: "Malheureux ou épuisé depuis longtemps", cat: "checkedout" },
      ]},
      { q: "Quand vous lui faites un retour, il…", options: [
        { text: "Dit « ah, je n'avais pas réalisé »", cat: "unclear" },
        { text: "Est d'accord mais n'arrive pas à progresser", cat: "mismatched" },
        { text: "Hausse les épaules — « à quoi bon »", cat: "demotivated" },
        { text: "Réagit à peine", cat: "checkedout" },
      ]},
      { q: "Il réagit le mieux à…", options: [
        { text: "Des objectifs clairs et des points d'étape", cat: "unclear" },
        { text: "Un poste redessiné ou un changement", cat: "mismatched" },
        { text: "De la reconnaissance et de l'implication", cat: "demotivated" },
        { text: "Une discussion franche sur rester ou partir", cat: "checkedout" },
      ]},
      { q: "Son potentiel est…", options: [
        { text: "Élevé, une fois bien aligné", cat: "unclear" },
        { text: "Mieux employé ailleurs", cat: "mismatched" },
        { text: "Récupérable avec de la reconnaissance", cat: "demotivated" },
        { text: "Incertain — il faut repartir de zéro", cat: "checkedout" },
      ]},
      { q: "Ce dont il a le plus besoin, c'est…", options: [
        { text: "De clarté", cat: "unclear" },
        { text: "D'un poste mieux adapté", cat: "mismatched" },
        { text: "De se sentir reconnu", cat: "demotivated" },
        { text: "D'une vraie conversation honnête", cat: "checkedout" },
      ]},
    ],
  },

  handle: {
    kicker: "Guide de terrain",
    heading: "Comment manager vers le haut",
    sub: "On ne choisit pas son chef, mais on peut gérer la relation — et protéger son travail comme sa santé.",
    nav: "Gérer son chef",
    cta: "Lire le guide pour manager vers le haut →",
    cards: [
      { icon: "✅", title: "À faire", tone: "do", items: [
        "Découvrez ce que votre chef craint et valorise", "Communiquez dans le style qu'il préfère", "Réduisez son incertitude sans qu'il le demande", "Mettez les accords clés par écrit", "Gardez une trace de vos contributions",
      ]},
      { icon: "⛔", title: "À éviter", tone: "dont", items: [
        "Prendre son comportement pour un verdict sur vous", "N'apporter que des problèmes, jamais de solutions", "Croire qu'il verra votre bon travail tout seul", "Débattre en public ou sous le coup de la colère", "Souffrir en silence — construisez du soutien",
      ]},
      { icon: "🧩", title: "Ajustez-vous au type", tone: "", items: [
        "Tyran : soyez calme, factuel et clair sur vos limites", "Micromanager : communiquez l'avancement en amont", "Chef fantôme : demandez des décisions écrites et proposez des défauts", "Chef trop conciliant : apportez des recommandations nettes", "Toujours : consignez, consignez, consignez",
      ]},
    ],
  },

  faq: [
    { q: "Mon chef est-il vraiment « mauvais », ou juste différent ?", a: "Cet outil repère des <em>dérives</em>, pas des verdicts. Un chef exigeant n'est pas automatiquement un tyran. Cherchez un schéma constant qui abîme l'équipe, pas une seule semaine de tension." },
    { q: "Un mauvais chef peut-il s'améliorer ?", a: "Souvent, oui — beaucoup sont simplement inconscients de leur effet ou sous pression. Des retours honnêtes, de la lucidité et un style adapté à chacun peuvent tout renverser." },
    { q: "Les « employés paresseux » sont-ils vraiment paresseux ?", a: "Rarement. Erikson soutient que le désengagement vient le plus souvent d'attentes floues, d'un poste inadapté, d'une motivation perdue ou d'un mauvais encadrement. Traitez la cause avant de juger la personne." },
    { q: "Et si manager vers le haut ne suffit pas ?", a: "Parfois, la décision la plus saine est de changer d'équipe ou de poste. Protégez votre santé, gardez la trace de vos contributions et connaissez vos options." },
    { q: "Un chef peut-il être plusieurs types ?", a: "Oui. Selon les pressions, un manager peut basculer — un micromanager qui devient fantôme quand il est débordé, par exemple. Votre résultat montre la correspondance la plus forte et l'équilibre." },
    { q: "Je crois que je suis l'un de ces types — et maintenant ?", a: "La lucidité, c'est déjà l'essentiel du chemin. Repérez votre réflexe sous stress, demandez à votre équipe un retour sincère, déléguez des résultats et adaptez votre style à chacun." },
  ],

  disc: {
    kicker: "Les quatre couleurs",
    heading: "Les mauvais chefs et les quatre couleurs",
    sub: "Sous pression, chaque couleur DISC dérive vers une faille différente — comme chef ou comme collaborateur. Repérez la vôtre, et apprenez à composer avec chacune.",
    nav: "Couleurs",
    labels: { relate: "Sous pression, cette couleur dérive vers", reflect: "Si c'est vous — autocontrôle", treat: "Comment travailler avec eux" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Découvrir l'atelier des couleurs DISC →",
    colors: {
      red: {
        relate: "Un Rouge stressé devient le tyran — il pousse plus fort, accuse et écrase l'équipe.",
        reflect: "Demandez-vous si vous poussez les résultats ou simplement les gens. Marquez un temps avant d'aboyer.",
        treat: "Soyez bref et centré sur les résultats ; tenez votre position calmement et apportez des solutions, pas des problèmes.",
      },
      yellow: {
        relate: "Un Jaune stressé dérive vers le chef fantôme — il court après ce qui l'amuse et fuit l'administratif et les décisions difficiles.",
        reflect: "Regardez ce que vous évitez. C'est en allant au bout que se construit votre crédibilité.",
        treat: "Gardez le ton enjoué, mais fixez décisions et détails par écrit.",
      },
      green: {
        relate: "Un Vert stressé devient le chef trop conciliant — il fuit le conflit jusqu'à ce que les problèmes s'enveniment en silence.",
        reflect: "Repérez où « ménager tout le monde » revient en réalité à esquiver une conversation difficile.",
        treat: "Soyez patient et rassurant ; aidez-le à s'engager sur des priorités claires et écrites.",
      },
      blue: {
        relate: "Un Bleu stressé devient le micromanager — il contrôle chaque détail, incapable de faire confiance.",
        reflect: "Demandez-vous si vos exigences élevées ont viré au contrôle. Déléguez des résultats, pas seulement des tâches.",
        treat: "Apportez du détail et des données ; gagnez sa confiance par des livraisons fiables et exactes.",
      },
    },
  },
};

window.BOOK_FR = BOOK_FR;
