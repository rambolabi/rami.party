/* =============================================================================
   Les styles de gestion de conflit (Thomas–Kilmann) — contenu français
   Structure identique à data.js ; seuls les textes lisibles sont traduits.
   Les clés de catégorie, les couleurs, les icônes et l'ordre restent inchangés.
   ========================================================================== */
const BOOK_FR = {
  meta: {
    key: "conflict",
    title: "Les styles de conflit",
    subtitle: "Votre façon de gérer le désaccord (Thomas–Kilmann)",
    short: "Styles de conflit",
    emoji: "⚔️",
    accent: "#ea580c",
    eyebrow: "Un modèle comportemental",
    description:
      "Un atelier éducatif sur les cinq modes de gestion de conflit de Thomas–Kilmann. Découvrez votre style par défaut et apprenez à l'adapter à la situation.",
    heroTitle: "Comment gérez-vous<br />le conflit ?",
    heroLead:
      "Chacun a son réflexe dès que la tension monte. Le modèle <em>Thomas–Kilmann</em> place cinq styles de conflit sur deux axes : l'assertivité et la coopération. Trouvez le vôtre — et apprenez quand en changer.",
    heroCta: "Trouvez votre style",
    footerNote:
      "Un atelier éducatif sur le modèle des modes de conflit de Thomas–Kilmann. Un outil de réflexion pour mieux se disputer, pas une évaluation formelle.",
    footerSupport:
      "Les cinq modes de conflit viennent du Thomas–Kilmann Conflict Mode Instrument. Explorez les autres modèles de <strong>La Bibliothèque Humaine</strong>.",
  },

  learn: {
    kicker: "Les idées",
    heading: "Cinq façons d'aborder un affrontement",
    sub: "Chaque style de conflit est un dosage entre défendre ses propres besoins et coopérer avec l'autre. Touchez une carte pour aller plus loin.",
  },

  concepts: [
    {
      icon: "📐", name: "Deux dimensions", tag: "Assertivité × coopération.",
      summary: "Le modèle situe le comportement en conflit sur deux axes : à quel point vous défendez vos propres intérêts (assertivité) et à quel point vous défendez ceux de l'autre (coopération). Des coins et du centre émergent cinq styles.",
      points: ["<strong>L'assertivité</strong> — défendre ses propres besoins.", "<strong>La coopération</strong> — prendre soin de ceux de l'autre.", "Le dosage produit cinq modes distincts.", "Chacun peut utiliser les cinq — on en privilégie simplement un ou deux."],
    },
    {
      icon: "🎭", name: "Les cinq modes", tag: "Rivaliser, collaborer, transiger, éviter, s'accommoder.",
      summary: "Rivaliser (je gagne), s'accommoder (vous gagnez), éviter (personne ne s'engage), collaborer (nous gagnons tous les deux) et trouver un compromis (chacun cède un peu). Chaque mode convient à certaines situations et détonne dans d'autres.",
      points: ["<strong>Rivaliser</strong> — très assertif, peu coopératif.", "<strong>S'accommoder</strong> — peu assertif, très coopératif.", "<strong>Éviter</strong> — faible sur les deux.", "<strong>Collaborer</strong> — élevé sur les deux.", "<strong>Trouver un compromis</strong> — modéré sur les deux."],
    },
    {
      icon: "🎯", name: "Aucun style « meilleur »", tag: "Tout dépend de la situation.",
      summary: "Il n'existe pas un seul bon style. Rivaliser convient aux urgences ; s'accommoder préserve une relation précieuse ; éviter fait gagner du temps ; collaborer résout ce qui compte ; le compromis règle le reste. Tout l'art est d'accorder le style au moment.",
      points: ["Les urgences appellent parfois la rivalité.", "Les broutilles appellent parfois l'évitement.", "Les grands problèmes partagés récompensent la collaboration.", "La sagesse, c'est de s'adapter, pas de répéter son réflexe."],
    },
    {
      icon: "👀", name: "Lisez l'autre camp", tag: "Deux styles, un affrontement.",
      summary: "Les conflits sont façonnés par le style des deux personnes. Deux compétiteurs escaladent ; un évitant exaspère un collaborateur ; un accommodant se fait écraser par un compétiteur. Repérer les deux styles vous permet de reprendre la barre.",
      points: ["Deux compétiteurs escaladent vite.", "Les évitants laissent les problèmes en suspens.", "Les accommodants peuvent se faire écraser.", "Nommer la dynamique l'apaise."],
    },
    {
      icon: "🤸", name: "Assouplissez votre style", tag: "Élargissez votre palette.",
      summary: "L'objectif est l'amplitude : aller chercher le style que la situation réclame plutôt que d'utiliser toujours votre préféré. Cela suppose généralement de travailler les modes que vous fuyez — souvent la collaboration ou, pour certains, une saine rivalité.",
      points: ["Repérez votre réflexe automatique.", "Entraînez les modes que vous sous-utilisez.", "Choisissez votre style volontairement.", "L'amplitude vaut mieux qu'une seule habitude bien rodée."],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Auto-évaluation",
    heading: "Quel est votre style de conflit ?",
    sub: "Répondez selon votre réaction réelle en cas de désaccord — pas selon ce que vous jugez souhaitable.",
    nav: "Le vôtre",
    icon: "⚔️",
    introTitle: "10 questions",
    introText: "Pensez à votre comportement habituel dans un vrai désaccord et choisissez ce qui <em>vous</em> ressemble le plus.",
    resultEyebrow: "Votre style de conflit par défaut",
    categories: {
      competing: { name: "Rivaliser", icon: "🦁", color: "#b91c1c",
        summary: "Assertif et peu coopératif — vous défendez fermement votre position. Excellent en crise ou sur un principe ; coûteux pour les relations si c'est votre seul mode.",
        signsTitle: "Vous avez tendance à", handleTitle: "Comment travailler avec vous",
        signs: ["Tenir fermement votre position", "Pousser pour obtenir votre résultat", "Décider vite sous pression", "Pouvoir écraser les plus discrets"],
        handle: ["Soyez direct et sûr de vous en retour", "Apportez des faits, pas des émotions", "Choisissez les batailles qui comptent vraiment", "Sollicitez l'avis des autres pour équilibrer"] },
      collaborating: { name: "Collaborer", icon: "🤝", color: "#2a9d5c",
        summary: "Assertif et coopératif — vous creusez jusqu'à une solution qui convient à tous. Puissant sur les sujets importants, mais lent sur les broutilles.",
        signsTitle: "Vous avez tendance à", handleTitle: "Comment travailler avec vous",
        signs: ["Chercher des solutions gagnant-gagnant", "Faire émerger les besoins de chacun", "Investir du temps pour régler le fond", "Pouvoir sur-traiter de petits sujets"],
        handle: ["Engagez-vous ouvertement et honnêtement", "Exposez les vrais besoins sous-jacents", "Réservez ce mode aux sujets qui comptent", "Ne le confondez pas avec de l'indécision"] },
      compromising: { name: "Trouver un compromis", icon: "⚖️", color: "#f0a500",
        summary: "Modéré sur les deux axes — vous cherchez un juste milieu où chacun cède un peu. Rapide et pratique, même si personne n'obtient tout.",
        signsTitle: "Vous avez tendance à", handleTitle: "Comment travailler avec vous",
        signs: ["Couper la poire en deux", "Valoriser l'équité et la rapidité", "Échanger des concessions", "Pouvoir conclure trop vite"],
        handle: ["Venez prêt à donner et à recevoir", "Soyez clair sur vos exigences non négociables", "Utilisez-le quand le temps presse", "Poussez vers la collaboration sur les gros sujets"] },
      avoiding: { name: "Éviter", icon: "🚪", color: "#0891b2",
        summary: "Peu assertif et peu coopératif — vous contournez le conflit. Utile pour laisser retomber ou esquiver une broutille ; nuisible quand les vrais sujets finissent enterrés.",
        signsTitle: "Vous avez tendance à", handleTitle: "Comment travailler avec vous",
        signs: ["Contourner ou repousser le conflit", "Préserver la paix en vous retirant", "Laisser certains sujets s'éteindre", "Laisser de vrais problèmes non résolus"],
        handle: ["Rendez l'échange sécurisant", "Abordez les sujets en douceur, pas en embuscade", "Laissez du temps pour se préparer", "Revenez-y, pour que ce ne soit pas simplement enterré"] },
      accommodating: { name: "S'accommoder", icon: "🕊️", color: "#7c3aed",
        summary: "Coopératif et peu assertif — vous cédez pour préserver la relation ou la paix. Généreux et élégant, mais risqué si vous n'exprimez jamais vos propres besoins.",
        signsTitle: "Vous avez tendance à", handleTitle: "Comment travailler avec vous",
        signs: ["Céder pour préserver l'harmonie", "Faire passer les besoins des autres d'abord", "Rarement imposer votre point de vue", "Accumuler une rancune silencieuse"],
        handle: ["Demandez activement leur avis", "Ne prenez pas leur « oui » pour argent comptant", "Rendez le désaccord sécurisant", "Protégez-les de ceux qui écrasent"] },
    },
    questions: [
      { q: "Quand un désaccord éclate, votre réflexe est de…", options: [
        { text: "Pousser fort pour votre position", cat: "competing" },
        { text: "Creuser une solution qui convienne à tous", cat: "collaborating" },
        { text: "Chercher un juste milieu", cat: "compromising" },
        { text: "Prendre du recul et laisser retomber", cat: "avoiding" },
        { text: "Céder pour préserver la paix", cat: "accommodating" } ] },
      { q: "Gagner la discussion, c'est…", options: [
        { text: "Important — j'aime l'emporter", cat: "competing" },
        { text: "Moins important que bien résoudre le fond", cat: "collaborating" },
        { text: "Très bien si l'on coupe la poire en deux", cat: "compromising" },
        { text: "Pas assez important pour ce stress", cat: "avoiding" },
        { text: "Moins important que la relation", cat: "accommodating" } ] },
      { q: "Sous pression, vous allez le plus probablement…", options: [
        { text: "Prendre les commandes et trancher", cat: "competing" },
        { text: "Mettre les besoins de chacun sur la table", cat: "collaborating" },
        { text: "Négocier vite un arrangement", cat: "compromising" },
        { text: "Gagner du temps et vous retirer", cat: "avoiding" },
        { text: "Vous effacer pour garder le calme", cat: "accommodating" } ] },
      { q: "Votre risque en cas de conflit, c'est…", options: [
        { text: "D'écraser les autres", cat: "competing" },
        { text: "De sur-traiter les petits sujets", cat: "collaborating" },
        { text: "De conclure trop tôt", cat: "compromising" },
        { text: "De laisser les problèmes en suspens", cat: "avoiding" },
        { text: "De ne jamais exprimer vos besoins", cat: "accommodating" } ] },
      { q: "Vous vivez le mieux un conflit quand…", options: [
        { text: "Vous avez obtenu le résultat voulu", cat: "competing" },
        { text: "Les besoins de chacun ont été satisfaits", cat: "collaborating" },
        { text: "C'était équitable des deux côtés", cat: "compromising" },
        { text: "Il s'est éteint tout seul", cat: "avoiding" },
        { text: "La relation est restée chaleureuse", cat: "accommodating" } ] },
      { q: "Quand quelqu'un vous conteste, vous…", options: [
        { text: "Contestez aussitôt en retour", cat: "competing" },
        { text: "Devenez curieux de son point de vue", cat: "collaborating" },
        { text: "Cherchez un arrangement", cat: "compromising" },
        { text: "Changez de sujet ou quittez la pièce", cat: "avoiding" },
        { text: "Finissez souvent par acquiescer", cat: "accommodating" } ] },
      { q: "Les autres vous diraient plutôt…", options: [
        { text: "Combatif", cat: "competing" },
        { text: "Rigoureux", cat: "collaborating" },
        { text: "Pragmatique", cat: "compromising" },
        { text: "Fuyant le conflit", cat: "avoiding" },
        { text: "Accommodant", cat: "accommodating" } ] },
      { q: "Un désaccord anodin mérite…", options: [
        { text: "Une résolution rapide et ferme", cat: "competing" },
        { text: "Une vraie discussion quand même", cat: "collaborating" },
        { text: "Qu'on partage vite la différence", cat: "compromising" },
        { text: "Qu'on laisse simplement filer", cat: "avoiding" },
        { text: "Qu'on laisse l'autre avoir raison", cat: "accommodating" } ] },
      { q: "En conflit, votre priorité relationnelle est…", options: [
        { text: "Obtenir le bon résultat", cat: "competing" },
        { text: "Le résultat et la relation ensemble", cat: "collaborating" },
        { text: "Un équilibre viable", cat: "compromising" },
        { text: "Éviter la tension", cat: "avoiding" },
        { text: "Protéger la relation", cat: "accommodating" } ] },
      { q: "Après un conflit, vous vous sentez en général…", options: [
        { text: "Satisfait si vous avez gagné", cat: "competing" },
        { text: "Bien si le fond a vraiment été réglé", cat: "collaborating" },
        { text: "À l'aise avec un échange équitable", cat: "compromising" },
        { text: "Soulagé que ce soit fini", cat: "avoiding" },
        { text: "Content si la paix a été préservée", cat: "accommodating" } ] },
    ],
  },

  handle: {
    kicker: "Mettre en pratique",
    heading: "Adapter votre style",
    sub: "Il n'y a pas de meilleur style — seulement le meilleur style pour ce moment précis. Élargissez votre palette.",
    nav: "Appliquer",
    cta: "Retour à la Bibliothèque Humaine →",
    cards: [
      { icon: "🧭", title: "Accordez-vous au moment", tone: "do", items: [
        "Rivalisez en cas d'urgence ou de principe", "Collaborez sur les problèmes importants et partagés", "Transigez quand le temps presse", "Évitez les moments vraiment anodins ou trop échauffés", "Accommodez-vous quand la relation prime",
      ]},
      { icon: "🤸", title: "Élargissez votre palette", tone: "", items: [
        "Repérez votre réflexe automatique", "Entraînez les modes que vous esquivez", "Choisissez votre style consciemment", "Demandez-vous ce que la situation exige vraiment", "Observez comment le style des autres façonne l'affrontement",
      ]},
      { icon: "⛔", title: "À éviter", tone: "dont", items: [
        "Utiliser un seul style pour tout", "Rivaliser sur des sujets sans importance", "Fuir des sujets qui ont vraiment besoin d'air", "Céder jusqu'à en éprouver de la rancune", "Prendre leur style pour une attaque personnelle",
      ]},
    ],
  },

  faq: [
    { q: "Quel est le meilleur style de conflit ?", a: "Aucun — tout dépend de la situation. L'art est de s'adapter : rivaliser en crise, collaborer sur les grands sujets partagés, transiger quand le temps presse, et ainsi de suite." },
    { q: "Puis-je avoir plusieurs styles ?", a: "Oui. La plupart des gens ont un style principal et un style de secours. Le résultat montre votre penchant dominant et l'équilibre entre les cinq." },
    { q: "Éviter, est-ce toujours mauvais ?", a: "Non. Éviter est judicieux pour des sujets anodins ou pour laisser retomber un moment tendu. Cela ne nuit que lorsque cela devient votre réponse à tout." },
    { q: "Je cède toujours — est-ce un problème ?", a: "C'est généreux, mais si vous n'exprimez jamais vos besoins, cela nourrit la rancune et invite les autres à vous marcher dessus. Travaillez un peu votre assertivité." },
    { q: "Comment gérer une personne qui rivalise ?", a: "Restez calme et sûr de vous, apportez des faits, choisissez vos batailles et ne vous laissez pas provoquer. Répondre à la force par la panique ou par plus de force échoue dans les deux cas." },
    { q: "Mon style peut-il changer ?", a: "Oui. Les styles sont des habitudes, pas des traits figés. Avec de la conscience et de l'entraînement, vous élargissez votre palette et choisissez votre réaction." },
  ],
};

window.BOOK_FR = BOOK_FR;
