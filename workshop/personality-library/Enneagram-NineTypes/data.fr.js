/* =============================================================================
   L'Ennéagramme — contenu français
   Structure identique à data.js ; seuls les textes lisibles sont traduits.
   Les clés de catégorie, les couleurs, les icônes et l'ordre restent inchangés.
   ========================================================================== */
const BOOK_FR = {
  meta: {
    key: "enneagram",
    title: "L'Ennéagramme",
    subtitle: "Neuf types, neuf motivations profondes",
    short: "Ennéagramme",
    emoji: "🔯",
    accent: "#db2777",
    eyebrow: "Un modèle de personnalité",
    description:
      "Un atelier éducatif sur les neuf types de l'Ennéagramme — une carte de la personnalité fondée sur la motivation. Découvrez votre type de base et comment aborder les neuf.",
    heroTitle: "Neuf façons de<br />voir le monde.",
    heroLead:
      "L'Ennéagramme cartographie la personnalité par le <em>pourquoi</em> de nos actes — neuf motivations, peurs et désirs fondamentaux. Trouvez votre type, et apprenez à comprendre les huit autres.",
    heroCta: "Trouvez votre type",
    footerNote:
      "Un atelier éducatif sur l'Ennéagramme. Un outil de réflexion sur soi et de compréhension des autres — pas un instrument scientifique ni une case où enfermer qui que ce soit.",
    footerSupport:
      "L'Ennéagramme est un outil populaire de connaissance de soi. Explorez les autres modèles de <strong>La Bibliothèque Humaine</strong> pour compléter le tableau.",
  },

  learn: {
    kicker: "Les idées",
    heading: "Une carte des motivations",
    sub: "L'Ennéagramme classe les gens non par leur comportement mais par les moteurs profonds qui le sous-tendent. Touchez une carte pour aller plus loin.",
  },

  concepts: [
    {
      icon: "🔯", name: "Neuf types", tag: "Un type de base chacun.",
      summary: "L'Ennéagramme décrit neuf types de personnalité distincts, chacun avec sa motivation profonde, sa peur fondamentale et son désir fondamental. La plupart des gens ont un type dominant qui façonne leur regard sur le monde et leur façon d'y avancer.",
      points: ["Chaque type a une peur profonde et un désir profond.", "Vous avez un type dominant, pas neuf.", "Les types décrivent la motivation, pas seulement le comportement.", "Aucun type n'est meilleur — chacun a ses dons et ses pièges."],
    },
    {
      icon: "🧭", name: "Le pourquoi, pas le quoi", tag: "La motivation avant le comportement.",
      summary: "Deux personnes peuvent faire exactement la même chose pour des raisons opposées. La force de l'Ennéagramme est de regarder sous la surface, du côté de la motivation qui pousse au comportement — d'où cette impression de justesse troublante.",
      points: ["Un même acte peut naître de types différents.", "Il met un nom sur votre « pourquoi » caché.", "C'est ce qui le rend si personnel.", "Connaître son moteur, c'est retrouver un choix."],
    },
    {
      icon: "➡️", name: "Ailes et flèches", tag: "Les types ne sont pas isolés.",
      summary: "Votre type de base est nuancé par ses voisins (vos « ailes »), et vous glissez vers d'autres types en croissance et sous stress (les « flèches »). C'est un système dynamique, pas neuf cases figées.",
      points: ["Les ailes : les deux types voisins colorent votre style.", "Les flèches : vous allez vers un type en croissance, un autre sous stress.", "Cela explique pourquoi vous êtes différent les bons et les mauvais jours.", "Le système est fluide, pas figé."],
    },
    {
      icon: "🌱", name: "Croissance et stress", tag: "Même type, sain ou non.",
      summary: "Chaque type a des expressions saines, moyennes et malsaines. Le but n'est pas de changer de type mais d'aller vers la version saine du sien — plus libre, moins gouvernée par la peur.",
      points: ["Chaque type a son meilleur et son pire visage.", "Grandir = être moins gouverné par sa peur profonde.", "La conscience de soi est le premier pas.", "On fait grandir son type, on n'en change pas."],
    },
    {
      icon: "🤝", name: "S'en servir avec les autres", tag: "Rejoignez leur motivation.",
      summary: "Dès que vous percevez le type de quelqu'un, vous pouvez répondre à ce dont il a réellement besoin — de la réassurance pour un Six, de la reconnaissance pour un Deux, du respect pour un Huit, de l'espace pour un Cinq.",
      points: ["Répondez au besoin profond, pas seulement au comportement.", "Les types ont besoin de choses très différentes.", "Cela développe la patience et l'empathie.", "Ne typez pas les gens pour les juger — mais pour les comprendre."],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Auto-évaluation",
    heading: "Quel type de l'Ennéagramme êtes-vous ?",
    sub: "À chaque question, choisissez l'option la plus juste sur ce qui vous meut. Répondez pour vous en général, pas pour un moment particulier.",
    nav: "Votre type",
    icon: "🔯",
    introTitle: "9 questions",
    introText: "Choisissez à chaque fois l'option la plus proche de votre motivation réelle — suivez votre intuition.",
    resultEyebrow: "Votre type de base probable",
    categories: {
      one: { name: "1 · Le Perfectionniste", icon: "🎯", color: "#b45309",
        summary: "Guidé par ses principes, déterminé et maître de lui, avec une critique intérieure sévère. Animé par le désir de bien faire et d'améliorer les choses.",
        signsTitle: "Schéma de fond", handleTitle: "Comment les aborder",
        signs: ["Veut faire les choses correctement", "Fort sens du « il faudrait »", "Autocritique et précis", "Peur d'être dans l'erreur ou dans la faute"],
        handle: ["Reconnaissez leurs exigences", "Soyez équitable et fiable", "Ne chipotez pas en retour", "Aidez-les à adoucir leur critique intérieure"] },
      two: { name: "2 · L'Altruiste", icon: "🤲", color: "#db2777",
        summary: "Chaleureux, généreux et tourné vers les autres, avec le besoin d'être utile et aimé. Peut négliger ses propres besoins.",
        signsTitle: "Schéma de fond", handleTitle: "Comment les aborder",
        signs: ["Se centre sur les besoins des autres", "Veut se sentir apprécié", "A du mal à demander de l'aide", "Peur de n'être désiré par personne"],
        handle: ["Remerciez-les sincèrement", "Demandez aussi ce dont ils ont besoin", "Ne prenez pas leur générosité pour acquise", "Encouragez des limites saines"] },
      three: { name: "3 · Le Battant", icon: "🏆", color: "#f0a500",
        summary: "Déterminé, adaptable et soucieux de son image, avec l'envie de réussir et d'être admiré. Peut perdre le contact avec ses émotions.",
        signsTitle: "Schéma de fond", handleTitle: "Comment les aborder",
        signs: ["Orienté objectifs et efficacité", "Attaché à l'image et à la réussite", "Peut trop travailler", "Peur de n'avoir aucune valeur"],
        handle: ["Appréciez-les pour ce qu'ils sont, pas seulement pour leurs succès", "Soyez direct et efficace", "Aidez-les à ralentir", "N'entrez pas en compétition de statut"] },
      four: { name: "4 · L'Individualiste", icon: "🎨", color: "#7c3aed",
        summary: "Sensible, expressif et introspectif, en quête d'authenticité et de singularité. Enclin à la mélancolie et à la comparaison.",
        signsTitle: "Schéma de fond", handleTitle: "Comment les aborder",
        signs: ["Profondeur émotionnelle", "Veut être vu comme unique", "Enclin à l'envie et au manque", "Peur de n'avoir aucune identité propre"],
        handle: ["Honorez leurs émotions", "Ne les pressez pas et ne cherchez pas à les réparer", "Valorisez leur authenticité", "Ancrez-les doucement dans le présent"] },
      five: { name: "5 · L'Observateur", icon: "🔬", color: "#2563eb",
        summary: "Perspicace, discret et cérébral, en quête de savoir et économe de son énergie. Peut se retirer et se détacher.",
        signsTitle: "Schéma de fond", handleTitle: "Comment les aborder",
        signs: ["Soif de comprendre", "Protège son temps et son intimité", "Réservé et indépendant", "Peur d'être vidé ou envahi"],
        handle: ["Respectez leur espace et leur énergie", "Laissez-leur le temps de réfléchir", "Soyez clair et non intrusif", "N'exigez pas de démonstration émotionnelle"] },
      six: { name: "6 · Le Loyaliste", icon: "🛡️", color: "#0891b2",
        summary: "Engagé, responsable et attaché à la sécurité, toujours à l'affût du danger. Loyal, mais anxieux et enclin au doute.",
        signsTitle: "Schéma de fond", handleTitle: "Comment les aborder",
        signs: ["Loyal et prévoyant", "Anticipe ce qui pourrait mal tourner", "Cherche réassurance et confiance", "Peur de se retrouver sans soutien"],
        handle: ["Soyez constant et digne de confiance", "Offrez une réassurance calme", "Parlez de leurs inquiétudes avec eux", "N'arrivez pas avec des surprises"] },
      seven: { name: "7 · L'Épicurien", icon: "🎈", color: "#e11d48",
        summary: "Spontané, enjoué et polyvalent, en quête d'expériences et d'options. Fuit la douleur et le sentiment d'être coincé.",
        signsTitle: "Schéma de fond", handleTitle: "Comment les aborder",
        signs: ["Aime le plaisir et les possibles", "Garde ses options ouvertes", "Fuit la douleur et l'ennui", "Peur d'être coincé ou privé"],
        handle: ["Apportez de l'énergie et des idées", "Laissez-leur de la liberté", "Aidez-les doucement à finir les choses", "Laissez-les aussi ressentir ce qui est difficile"] },
      eight: { name: "8 · Le Challenger", icon: "⚡", color: "#b91c1c",
        summary: "Puissant, décidé et protecteur, en quête de contrôle et fuyant la vulnérabilité. Direct et intense.",
        signsTitle: "Schéma de fond", handleTitle: "Comment les aborder",
        signs: ["Prend naturellement les commandes", "Protège les siens", "Direct et volontaire", "Peur d'être contrôlé ou blessé"],
        handle: ["Soyez franc et solide", "Ne jouez pas de jeux, ne manipulez pas", "Respectez leur autonomie", "Montrez-leur que la vulnérabilité est sans danger"] },
      nine: { name: "9 · Le Médiateur", icon: "☮️", color: "#2a9d5c",
        summary: "Accommodant, accueillant et stable, en quête d'harmonie et fuyant le conflit. Peut s'installer dans l'inertie et s'oublier.",
        signsTitle: "Schéma de fond", handleTitle: "Comment les aborder",
        signs: ["Calme et conciliant", "Évite le conflit", "Se fond dans les projets des autres", "Peur de la perte et de la séparation"],
        handle: ["Sollicitez leur véritable avis", "Soyez patient, ne forcez pas", "Valorisez leur constance", "Aidez-les à se présenter pour eux-mêmes"] },
    },
    questions: [
      { q: "Qu'est-ce qui compte le plus pour vous ?", options: [
        { text: "Faire les choses comme il faut", cat: "one" },
        { text: "Comprendre comment les choses fonctionnent vraiment", cat: "five" },
        { text: "Que tout le monde s'entende", cat: "nine" } ] },
      { q: "En groupe, vous avez tendance à…", options: [
        { text: "Veiller aux besoins de chacun", cat: "two" },
        { text: "Guetter ce qui pourrait mal tourner", cat: "six" },
        { text: "Apporter la bonne humeur et les idées", cat: "seven" } ] },
      { q: "Vous voulez avant tout être…", options: [
        { text: "Reconnu et admiré", cat: "three" },
        { text: "Authentique et singulier", cat: "four" },
        { text: "Fort et maître de la situation", cat: "eight" } ] },
      { q: "Votre voix intérieure vous pousse à être…", options: [
        { text: "Bon et irréprochable", cat: "one" },
        { text: "Utile et aimé", cat: "two" },
        { text: "Impressionnant et gagnant", cat: "three" } ] },
      { q: "Sous stress, vous…", options: [
        { text: "Vous repliez dans vos émotions", cat: "four" },
        { text: "Vous retirez pour réfléchir seul", cat: "five" },
        { text: "Cherchez à être rassuré et préparez le pire", cat: "six" } ] },
      { q: "Ce que vous voulez le plus éviter…", options: [
        { text: "L'ennui et le sentiment d'être coincé", cat: "seven" },
        { text: "La faiblesse et le fait d'être contrôlé", cat: "eight" },
        { text: "Le conflit et la pression", cat: "nine" } ] },
      { q: "Votre énergie naturelle est…", options: [
        { text: "Disciplinée, tournée vers l'amélioration", cat: "one" },
        { text: "Profonde et émotionnellement riche", cat: "four" },
        { text: "Enjouée et déjà tournée vers la suite", cat: "seven" } ] },
      { q: "En relation, vous…", options: [
        { text: "Donnez beaucoup et attendez de la reconnaissance", cat: "two" },
        { text: "Avez besoin de beaucoup d'espace et d'intimité", cat: "five" },
        { text: "Protégez les vôtres et prenez les commandes", cat: "eight" } ] },
      { q: "Vous vous sentez le plus en sécurité quand…", options: [
        { text: "Vous avancez et tenez le cap", cat: "three" },
        { text: "Vous savez à qui et à quoi vous fier", cat: "six" },
        { text: "Tout est calme et à sa place", cat: "nine" } ] },
    ],
  },

  handle: {
    kicker: "Mettre en pratique",
    heading: "Aborder les neuf types",
    sub: "Chaque type a besoin d'autre chose. Rejoignez la motivation et vous rejoignez la personne.",
    nav: "Appliquer",
    cta: "Voir le lien avec les couleurs DISC →",
    cards: [
      { icon: "🤝", title: "Répondez au besoin", tone: "do", items: [
        "1 et 6 : fiabilité et réassurance", "2 et 9 : reconnaissance et une vraie voix", "3 et 7 : respectez leur élan, aidez-les à atterrir", "4 : honorez les émotions ; 5 : laissez de l'espace", "8 : soyez franc et solide",
      ]},
      { icon: "🌱", title: "Soutenez la croissance", tone: "", items: [
        "Renvoyez-leur le reflet de leurs dons", "Nommez la peur avec douceur, jamais comme une arme", "Encouragez la version saine de leur type", "Soyez patient — le changement est lent", "Montrez qu'on peut relâcher le schéma sans danger",
      ]},
      { icon: "⛔", title: "À éviter", tone: "dont", items: [
        "Se servir du type pour étiqueter ou écarter les gens", "Croire connaître quelqu'un à partir d'un chiffre", "Juger un type meilleur ou pire", "Typer les autres pour gagner une discussion", "Le traiter comme figé et définitif",
      ]},
    ],
  },

  faq: [
    { q: "L'Ennéagramme est-il scientifique ?", a: "C'est un outil populaire de connaissance de soi plutôt qu'un instrument scientifiquement validé comme les Big Five. Beaucoup le trouvent éclairant — tenez-le simplement pour un miroir, pas pour un fait." },
    { q: "Puis-je être plusieurs types ?", a: "Vous avez un type de base, mais il est nuancé par vos « ailes » (les types voisins) et vous glissez vers d'autres en croissance et sous stress. Vous vous reconnaîtrez donc dans plusieurs." },
    { q: "Mon type peut-il changer ?", a: "La plupart des enseignants estiment que le type de base reste stable toute la vie, mais la santé avec laquelle vous l'exprimez peut beaucoup évoluer. Grandir, c'est devenir la meilleure version de son type." },
    { q: "Et si deux types me semblent aussi justes ?", a: "C'est fréquent. Regardez votre motivation profonde et votre peur plutôt que le comportement — l'Ennéagramme parle du <em>pourquoi</em>, et cela désigne en général un seul type." },
    { q: "Un type est-il meilleur qu'un autre ?", a: "Non. Chaque type a de vrais dons et des pièges caractéristiques. Il n'y a ni meilleur ni pire — seulement des moteurs différents." },
    { q: "Quel rapport avec le DISC ?", a: "Ce sont des cartes différentes, mais elles se recoupent. Voyez l'atelier DISC et la passerelle couleurs ci-dessous pour un pont approximatif." },
  ],

  disc: {
    kicker: "Passerelle",
    heading: "L'Ennéagramme et les couleurs DISC",
    sub: "Un pont approximatif entre les neuf types et les quatre couleurs DISC.",
    nav: "Couleurs",
    labels: { relate: "Types qui penchent souvent par ici", reflect: "Axe de progression", treat: "Comment les aborder" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Découvrir l'atelier des couleurs DISC →",
    colors: {
      red: { relate: "Souvent des Huit et des Trois très déterminés — assertifs et prompts à prendre les commandes.", reflect: "Développez la patience, la douceur et la confiance.", treat: "Soyez direct, solide et allez au but." },
      yellow: { relate: "Souvent des Sept et des Trois soucieux de leur image — enjoués et expressifs.", reflect: "Développez la profondeur et la finition.", treat: "Soyez chaleureux, positif et laissez-leur de la place." },
      green: { relate: "Souvent des Neuf et des Deux — en quête d'harmonie et attentionnés.", reflect: "Développez une voix plus ferme et plus claire.", treat: "Soyez patient, doux et reconnaissant." },
      blue: { relate: "Souvent des Un, des Cinq et des Six — minutieux et réfléchis.", reflect: "Développez la souplesse et la confiance en soi.", treat: "Soyez exact, calme et laissez de l'espace pour réfléchir." },
    },
  },
};

window.BOOK_FR = BOOK_FR;
