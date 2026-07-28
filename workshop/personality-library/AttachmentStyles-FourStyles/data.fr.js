/* =============================================================================
   Les styles d'attachement — contenu français
   Structure identique à data.js ; seuls les textes lisibles sont traduits.
   Les clés de catégorie, les couleurs, les icônes et l'ordre restent inchangés.
   ========================================================================== */
const BOOK_FR = {
  meta: {
    key: "attachment",
    title: "Les styles d'attachement",
    subtitle: "Votre façon de vous lier, d'aimer et de vivre la proximité",
    short: "Attachement",
    emoji: "🔗",
    accent: "#0d9488",
    eyebrow: "Un modèle relationnel",
    description:
      "Un atelier éducatif sur les quatre styles d'attachement à l'âge adulte. Découvrez votre rapport à la proximité et comment aller vers un lien sécure.",
    heroTitle: "Comment vivez-vous<br />la proximité ?",
    heroLead:
      "La manière dont vous vous êtes lié enfant façonne votre façon d'aimer adulte. Découvrez les quatre <em>styles d'attachement</em> — sécure, anxieux, évitant et craintif — et trouvez le vôtre.",
    heroCta: "Trouvez votre style",
    footerNote:
      "Un atelier éducatif sur la théorie de l'attachement adulte (Bowlby, Ainsworth et les chercheurs qui ont suivi). Un outil de réflexion et de progression, pas un diagnostic clinique ni une thérapie.",
    footerSupport:
      "La théorie de l'attachement s'appuie sur des décennies de recherche en psychologie. Explorez les autres modèles de <strong>La Bibliothèque Humaine</strong> pour voir le tableau d'ensemble.",
  },

  learn: {
    kicker: "Les idées",
    heading: "Le plan de la proximité",
    sub: "Les liens précoces créent un modèle qui détermine à quel point l'intimité nous semble sûre. Touchez une carte pour aller plus loin.",
  },

  concepts: [
    {
      icon: "🔗", name: "Ce qu'est l'attachement", tag: "Votre plan de la proximité.",
      summary: "La théorie de l'attachement affirme que nos toutes premières relations nous apprennent si les autres sont sûrs, fiables et dignes qu'on s'appuie sur eux. Cette leçon devient un modèle que l'on emporte dans ses amitiés et ses amours d'adulte.",
      points: ["Construit à partir des premières expériences de soin.", "Détermine à quel point l'intimité semble sûre.", "Fonctionne surtout en pilotage automatique.", "Se révèle surtout sous stress et en conflit."],
    },
    {
      icon: "🧭", name: "Les quatre styles", tag: "Sécure, anxieux, évitant, craintif.",
      summary: "Les adultes penchent vers l'un des quatre styles : sécure (à l'aise avec la proximité), anxieux (qui la recherche mais craint l'abandon), évitant (qui préfère l'indépendance à l'intimité) et craintif-évitant (qui veut la proximité mais redoute d'être blessé).",
      points: ["<strong>Sécure</strong> — fait confiance et s'appuie sans peine.", "<strong>Anxieux</strong> — recherche la proximité, redoute l'abandon.", "<strong>Évitant</strong> — chérit son indépendance, esquive l'intimité.", "<strong>Craintif</strong> — veut aimer mais s'arme contre la blessure."],
    },
    {
      icon: "🌱", name: "D'où cela vient", tag: "Ce n'est pas votre faute.",
      summary: "Votre style n'est ni un défaut ni un choix : c'est une adaptation à la disponibilité et à la constance de vos premières figures de soin. Le comprendre avec bienveillance est le premier pas pour le faire évoluer.",
      points: ["C'est une adaptation, pas un défaut.", "Des soins constants construisent en général la sécurité.", "Des soins irréguliers peuvent nourrir l'anxiété.", "Des soins distants peuvent nourrir l'évitement."],
    },
    {
      icon: "🔄", name: "Les styles peuvent évoluer", tag: "La sécurité acquise.",
      summary: "Le style d'attachement n'est pas une condamnation à perpétuité. Grâce à des relations saines, à la conscience de soi et parfois à une thérapie, on peut aller vers la « sécurité acquise » — la bonne nouvelle au cœur de la théorie.",
      points: ["Le style peut se déplacer avec le temps.", "Des partenaires sécures peuvent aider à guérir.", "La conscience de soi desserre les vieux schémas.", "La « sécurité acquise » est tout à fait possible."],
    },
    {
      icon: "🤝", name: "La dynamique des couples", tag: "Pourquoi les couples s'affrontent.",
      summary: "Les styles interagissent. Le duo douloureux par excellence est anxieux + évitant : l'un poursuit, l'autre se retire. Reconnaître cette danse permet d'en sortir plutôt que de s'accuser mutuellement.",
      points: ["Anxieux + évitant = poursuite et retrait.", "Deux sécures construisent un calme solide.", "Nommer le schéma le désamorce.", "On peut répondre, plutôt que simplement réagir."],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Auto-évaluation",
    heading: "Quel est votre style d'attachement ?",
    sub: "Répondez honnêtement sur votre ressenti dans les relations proches — surtout sous tension. Il n'y a pas de mauvaise réponse.",
    nav: "Le vôtre",
    icon: "🔗",
    introTitle: "12 questions",
    introText: "Pensez à votre manière d'être habituelle dans les relations proches et choisissez ce qui <em>vous</em> ressemble le plus.",
    resultEyebrow: "Votre style d'attachement probable",
    categories: {
      secure: { name: "Sécure", icon: "🌳", color: "#2a9d5c",
        summary: "Vous êtes à l'aise avec la proximité comme avec l'indépendance. Vous faites confiance, exprimez vos besoins directement et traversez les conflits sans panique ni fermeture.",
        signsTitle: "Vous avez tendance à", handleTitle: "Comment vous aborder",
        signs: ["Faire confiance et vous appuyer sans peine", "Exprimer vos besoins directement", "Gérer le conflit avec calme", "Donner et recevoir du soutien facilement"],
        handle: ["Soyez honnête et constant", "Profitez d'un échange équilibré", "Gardez la communication ouverte", "Vous êtes un partenaire stabilisant pour les autres"] },
      anxious: { name: "Anxieux", icon: "🌊", color: "#db2777",
        summary: "Vous recherchez la proximité et donnez beaucoup, mais vous craignez l'abandon. Vous captez finement les humeurs de votre partenaire et pouvez basculer dans l'inquiétude quand la réassurance manque.",
        signsTitle: "Vous avez tendance à", handleTitle: "Comment vous soutenir",
        signs: ["Rechercher proximité et réassurance", "Craindre d'être abandonné", "Sur-interpréter les humeurs et les silences", "Protester ou vous accrocher quand l'angoisse monte"],
        handle: ["Offrez une réassurance stable et régulière", "Soyez clair et prévisible", "Ne vous retirez pas sans expliquer", "Aidez-les à s'apaiser eux-mêmes, en douceur"] },
      avoidant: { name: "Évitant", icon: "🧱", color: "#0891b2",
        summary: "Vous chérissez votre indépendance et pouvez vous sentir envahi par trop de proximité. Vous gérez seul et pouvez vous retirer ou minimiser vos besoins quand l'intimité s'intensifie.",
        signsTitle: "Vous avez tendance à", handleTitle: "Comment vous soutenir",
        signs: ["Placer l'indépendance très haut", "Vous sentir envahi par trop de proximité", "Vous retirer sous la pression", "Minimiser vos propres besoins"],
        handle: ["Respectez leur besoin d'espace", "Ne poursuivez pas, ne forcez pas", "Soyez fiable sans être collant", "Invitez à la proximité sans l'exiger"] },
      fearful: { name: "Craintif-évitant", icon: "🌀", color: "#7c3aed",
        summary: "Vous aspirez à la proximité tout en vous armant contre la blessure : vous soufflez donc le chaud et le froid, vous rapprochant puis vous éloignant. Cela vient le plus souvent d'une proximité qui a un jour semblé dangereuse.",
        signsTitle: "Vous avez tendance à", handleTitle: "Comment vous soutenir",
        signs: ["Vouloir la proximité et la redouter", "Souffler le chaud et le froid", "Peiner à faire confiance", "Alterner entre attirer et repousser"],
        handle: ["Soyez patient, calme et constant", "Rendez la sécurité et la prévisibilité visibles", "Ne prenez pas ce va-et-vient pour vous", "Une douceur constante finit par restaurer la confiance"] },
    },
    questions: [
      { q: "Quand vous devenez proche de quelqu'un, vous…", options: [
        { text: "Vous sentez à l'aise et en sécurité", cat: "secure" },
        { text: "Craignez qu'il s'éloigne", cat: "anxious" },
        { text: "Commencez à vous sentir un peu envahi", cat: "avoidant" },
        { text: "Le voulez, mais restez mal à l'aise", cat: "fearful" } ] },
      { q: "Quand un partenaire a besoin d'espace, vous…", options: [
        { text: "Le donnez sans inquiétude", cat: "secure" },
        { text: "Vous sentez anxieux et rejeté", cat: "anxious" },
        { text: "Êtes soulagé, honnêtement", cat: "avoidant" },
        { text: "Vous sentez blessé et plus en sécurité à la fois", cat: "fearful" } ] },
      { q: "En cas de conflit, vous avez tendance à…", options: [
        { text: "Rester calme et en parler", cat: "secure" },
        { text: "Être submergé et chercher à être rassuré", cat: "anxious" },
        { text: "Vous fermer et vous retirer", cat: "avoidant" },
        { text: "Osciller entre les deux", cat: "fearful" } ] },
      { q: "Dépendre des autres vous semble…", options: [
        { text: "Naturel et très bien ainsi", cat: "secure" },
        { text: "Nécessaire mais effrayant", cat: "anxious" },
        { text: "Inconfortable — je préfère éviter", cat: "avoidant" },
        { text: "Quelque chose que je veux mais dont je me méfie", cat: "fearful" } ] },
      { q: "Quand quelqu'un ne répond pas pendant un moment, vous…", options: [
        { text: "Supposez qu'il est simplement occupé", cat: "secure" },
        { text: "Commencez à craindre qu'il y ait un problème", cat: "anxious" },
        { text: "Le remarquez à peine", cat: "avoidant" },
        { text: "Ressentez un éclair de peur, puis vous détachez", cat: "fearful" } ] },
      { q: "Votre vision des relations est…", options: [
        { text: "Plutôt sûre et enrichissante", cat: "secure" },
        { text: "Merveilleuse mais fragile", cat: "anxious" },
        { text: "Agréable, mais je vis très bien seul", cat: "avoidant" },
        { text: "Désirable mais risquée", cat: "fearful" } ] },
      { q: "Partager vos sentiments les plus profonds, c'est…", options: [
        { text: "Confortable avec la bonne personne", cat: "secure" },
        { text: "Quelque chose que je fais vite pour créer du lien", cat: "anxious" },
        { text: "Difficile — je garde les choses pour moi", cat: "avoidant" },
        { text: "Quelque chose dont j'approche puis dont je m'éloigne", cat: "fearful" } ] },
      { q: "Quand une relation devient sérieuse, vous…", options: [
        { text: "Vous y engagez avec confiance", cat: "secure" },
        { text: "Voulez une proximité permanente", cat: "anxious" },
        { text: "Sentez l'envie de créer de la distance", cat: "avoidant" },
        { text: "Êtes enthousiaste et paniqué en même temps", cat: "fearful" } ] },
      { q: "La réassurance d'un partenaire…", options: [
        { text: "Est agréable, mais je n'en ai pas besoin de beaucoup", cat: "secure" },
        { text: "M'est nécessaire souvent", cat: "anxious" },
        { text: "Me semble un peu étouffante", cat: "avoidant" },
        { text: "M'apaise puis me rend méfiant", cat: "fearful" } ] },
      { q: "Après une rupture, en général vous…", options: [
        { text: "Faites votre deuil, puis remontez régulièrement", cat: "secure" },
        { text: "Peinez à lâcher prise", cat: "anxious" },
        { text: "Passez vite à autre chose, l'air imperturbable", cat: "avoidant" },
        { text: "Vous sentez déchiré et soulagé", cat: "fearful" } ] },
      { q: "Faire confiance à quelqu'un de nouveau vient…", options: [
        { text: "Assez naturellement", cat: "secure" },
        { text: "Vite, puis avec anxiété", cat: "anxious" },
        { text: "Lentement, si tant est que cela vienne", cat: "avoidant" },
        { text: "Avec de l'espoir et beaucoup de prudence", cat: "fearful" } ] },
      { q: "Votre indépendance et votre besoin de proximité sont…", options: [
        { text: "Confortablement équilibrés", cat: "secure" },
        { text: "Penchés vers le besoin de proximité", cat: "anxious" },
        { text: "Penchés vers le besoin d'espace", cat: "avoidant" },
        { text: "En tension permanente", cat: "fearful" } ] },
    ],
  },

  handle: {
    kicker: "Mettre en pratique",
    heading: "Vers un lien sécure",
    sub: "Chaque style peut gagner en sécurité — en vous et avec ceux que vous aimez.",
    nav: "Appliquer",
    cta: "Retour à la Bibliothèque Humaine →",
    cards: [
      { icon: "🌳", title: "Cultivez votre sécurité", tone: "do", items: [
        "Nommez votre schéma sans honte", "Exprimez vos besoins directement et tôt", "Choisissez des personnes calmes et constantes", "Apprenez à apaiser vos propres déclencheurs", "Réparez après le conflit, ne le fuyez pas",
      ]},
      { icon: "💞", title: "Avec un partenaire anxieux", tone: "", items: [
        "Offrez une réassurance stable et prévisible", "Expliquez quand vous avez besoin d'espace", "Faites ce que vous avez dit", "Ne punissez pas par le retrait", "Célébrez la proximité, ne la rationnez pas",
      ]},
      { icon: "🧱", title: "Avec un partenaire évitant", tone: "", items: [
        "Respectez son espace sans le poursuivre", "Restez fiable et sans pression", "Invitez à la proximité en douceur", "Ne lisez pas la distance comme un rejet", "Laissez-lui la place de venir vers vous",
      ]},
    ],
  },

  faq: [
    { q: "Le style d'attachement est-il figé à vie ?", a: "Non. Il est stable mais modifiable. Grâce à la conscience de soi, à des relations sécures et parfois à une thérapie, on avance vers la « sécurité acquise »." },
    { q: "Un style est-il tout simplement « meilleur » ?", a: "L'attachement sécure est le plus confortable et le plus résilient, mais les autres ne sont pas des défauts de caractère : ce sont des adaptations compréhensibles dont on peut sortir." },
    { q: "Puis-je être un mélange de styles ?", a: "Oui. Beaucoup de gens mélangent, et votre style peut même varier d'une relation à l'autre. Le résultat montre votre penchant dominant et l'équilibre général." },
    { q: "D'où vient mon style ?", a: "Surtout de la constance et de la disponibilité de vos premières figures de soin — même si les relations et les expériences ultérieures le façonnent aussi." },
    { q: "Pourquoi les anxieux et les évitants s'attirent-ils ?", a: "Chacun confirme les peurs de l'autre : l'anxieux poursuit la proximité, l'évitant crée de la distance, et cette danse douloureuse semble étrangement familière aux deux." },
    { q: "Est-ce une thérapie ?", a: "Non. C'est un outil éducatif de réflexion. Si des blessures d'attachement affectent sérieusement votre vie, un thérapeute qualifié peut vous aider à avancer vers la sécurité." },
  ],
};

window.BOOK_FR = BOOK_FR;
