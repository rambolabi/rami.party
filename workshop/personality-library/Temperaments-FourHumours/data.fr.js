/* =============================================================================
   Les quatre tempéraments — contenu français
   Structure identique à data.js ; seuls les textes lisibles sont traduits.
   Les clés de catégorie, les couleurs, les icônes et l'ordre restent inchangés.
   ========================================================================== */
const BOOK_FR = {
  meta: {
    key: "temperaments",
    title: "Les quatre tempéraments",
    subtitle: "La plus ancienne carte de la personnalité — et sa pertinence actuelle",
    short: "Tempéraments",
    emoji: "🌡️",
    accent: "#9333ea",
    eyebrow: "Un modèle classique",
    description:
      "Un atelier éducatif sur les quatre tempéraments classiques — sanguin, colérique, mélancolique et flegmatique — et leur correspondance avec le DISC et les modèles modernes.",
    heroTitle: "La carte de la personnalité<br />vieille de 2 000 ans.",
    heroLead:
      "Bien avant la psychologie moderne, les Anciens classaient les gens en quatre <em>tempéraments</em> : sanguin, colérique, mélancolique et flegmatique. Chose remarquable, cela sonne encore juste. Trouvez le vôtre.",
    heroCta: "Trouvez votre tempérament",
    footerNote:
      "Un atelier éducatif sur les quatre tempéraments classiques (Hippocrate et Galien). Une grille de lecture historique — la vieille biologie des « humeurs » est discréditée depuis longtemps, mais les schémas de comportement ont survécu.",
    footerSupport:
      "Les quatre tempéraments sont l'ancêtre de nombreux modèles modernes, dont le DISC. Découvrez les autres dans <strong>La Bibliothèque Humaine</strong>.",
  },

  learn: {
    kicker: "Les idées",
    heading: "Quatre saveurs de la nature humaine",
    sub: "Les quatre tempéraments sont l'arrière-grand-parent du DISC et des Big Five. Touchez une carte pour aller plus loin.",
  },

  concepts: [
    {
      icon: "🏛️", name: "Origines antiques", tag: "Hippocrate et Galien.",
      summary: "Il y a plus de deux mille ans, des médecins grecs reliaient la personnalité à quatre « humeurs » corporelles. La biologie était fausse, mais les quatre schémas de comportement décrits étaient justes — et ils résonnent dans tous les modèles de personnalité depuis.",
      points: ["Proposés par Hippocrate, développés par Galien.", "La biologie des « humeurs » est discréditée.", "Les schémas de comportement ont tout de même survécu.", "L'ancêtre direct du DISC et de bien d'autres."],
    },
    {
      icon: "🎭", name: "Les quatre tempéraments", tag: "Sanguin, colérique, mélancolique, flegmatique.",
      summary: "Le sanguin (sociable et enjoué), le colérique (déterminé et bouillonnant), le mélancolique (profond et minutieux) et le flegmatique (calme et constant). La plupart des gens sont un mélange, avec un ou deux tempéraments dominants.",
      points: ["<strong>Sanguin</strong> — expansif, gai, sociable.", "<strong>Colérique</strong> — audacieux, déterminé, décidé.", "<strong>Mélancolique</strong> — réfléchi, précis, profond.", "<strong>Flegmatique</strong> — calme, patient, stable."],
    },
    {
      icon: "🔗", name: "La transposition moderne", tag: "C'est devenu le DISC.",
      summary: "Les quatre tempéraments correspondent presque terme à terme aux couleurs DISC : colérique→Rouge, sanguin→Jaune, flegmatique→Vert, mélancolique→Bleu. Comprendre l'un approfondit l'autre.",
      points: ["Colérique ≈ DISC Rouge (Dominance).", "Sanguin ≈ DISC Jaune (Influence).", "Flegmatique ≈ DISC Vert (Stabilité).", "Mélancolique ≈ DISC Bleu (Conformité)."],
    },
    {
      icon: "🌗", name: "Chacun est un mélange", tag: "Un ou deux dominent.",
      summary: "Presque personne n'est un tempérament pur. Vous aurez généralement un tempérament dominant et un tempérament d'appui, et c'est ce mélange qui fait votre singularité. Les paires peuvent même compenser leurs faiblesses respectives.",
      points: ["Les tempéraments purs sont rares.", "Un dominant plus un secondaire, c'est la norme.", "Les mélanges opposés s'équilibrent bien.", "La combinaison est le vrai portrait."],
    },
    {
      icon: "🤝", name: "S'en servir avec les autres", tag: "Vieille sagesse, toujours utile.",
      summary: "Les tempéraments sont une manière rapide et mémorable de lire une pièce : dynamisez le sanguin, allez droit au but avec le colérique, répondez au besoin d'exactitude du mélancolique et soyez patient avec le flegmatique.",
      points: ["Sanguin : gardez de la chaleur et du plaisir.", "Colérique : soyez bref et centré sur le résultat.", "Mélancolique : donnez du détail et de la qualité.", "Flegmatique : soyez patient et constant."],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Auto-évaluation",
    heading: "Quel tempérament êtes-vous ?",
    sub: "Répondez selon votre manière d'être habituelle, et nous estimerons votre tempérament dominant.",
    nav: "Le vôtre",
    icon: "🌡️",
    introTitle: "10 questions",
    introText: "Choisissez l'option qui <em>vous</em> ressemble le plus, la plupart du temps.",
    resultEyebrow: "Votre tempérament dominant",
    categories: {
      sanguine: { name: "Sanguin", icon: "🎈", color: "#f0a500",
        summary: "Sociable, enjoué et optimiste — vous aimez les gens, le plaisir et la nouveauté. Chaleureux et spontané, parfois un peu éparpillé. (DISC Jaune.)",
        signsTitle: "Vous êtes plutôt", handleTitle: "Comment travailler avec vous",
        signs: ["Expansif et gai", "Bavard et spontané", "Optimiste et chaleureux", "Vite lassé par les détails"],
        handle: ["Gardez un cadre chaleureux et convivial", "Laissez-les parler et briller", "Donnez de la reconnaissance", "Aidez-les sur la structure et la finition"] },
      choleric: { name: "Colérique", icon: "🔥", color: "#b91c1c",
        summary: "Audacieux, déterminé et décidé — vous prenez les commandes et poussez fort vers vos objectifs. Sûr de vous et rapide, parfois impatient ou abrupt. (DISC Rouge.)",
        signsTitle: "Vous êtes plutôt", handleTitle: "Comment travailler avec vous",
        signs: ["Ambitieux et décidé", "Direct et compétitif", "Prompt à agir", "Impatient face aux lenteurs"],
        handle: ["Soyez bref et allez au but", "Concentrez-vous sur les résultats", "Proposez des options et laissez-les choisir", "Ne perdez pas leur temps"] },
      melancholic: { name: "Mélancolique", icon: "🌧️", color: "#2563eb",
        summary: "Réfléchi, précis et profond — vous tenez à la qualité, à l'exactitude et au sens. Minutieux et loyal, avec une tendance à trop réfléchir. (DISC Bleu.)",
        signsTitle: "Vous êtes plutôt", handleTitle: "Comment travailler avec vous",
        signs: ["Analytique et minutieux", "Exigeant sur les standards", "Profond et réfléchi", "Enclin à trop réfléchir"],
        handle: ["Donnez du détail et de l'exactitude", "Respectez leurs exigences", "Laissez du temps pour réfléchir", "Évitez la précipitation et le flou"] },
      phlegmatic: { name: "Flegmatique", icon: "🍃", color: "#2a9d5c",
        summary: "Calme, patient et stable — vous êtes la présence paisible et fiable qui maintient l'équilibre. Loyal et facile à vivre, mais peu enclin au changement. (DISC Vert.)",
        signsTitle: "Vous êtes plutôt", handleTitle: "Comment travailler avec vous",
        signs: ["Calme et d'humeur égale", "Patient et fiable", "Paisible et conciliant", "Réticent au changement"],
        handle: ["Soyez patient et personnel", "Apportez réassurance et stabilité", "Introduisez le changement progressivement", "Appréciez leur constance"] },
    },
    questions: [
      { q: "Lors d'une soirée, vous êtes…", options: [
        { text: "En train de bavarder joyeusement avec tout le monde", cat: "sanguine" },
        { text: "En train d'orienter le groupe ou le programme", cat: "choleric" },
        { text: "En pleine conversation profonde avec une personne", cat: "melancholic" },
        { text: "Détendu, à suivre le mouvement", cat: "phlegmatic" } ] },
      { q: "Votre rythme est…", options: [
        { text: "Rapide et enjoué", cat: "sanguine" },
        { text: "Rapide et énergique", cat: "choleric" },
        { text: "Prudent et mesuré", cat: "melancholic" },
        { text: "Lent et régulier", cat: "phlegmatic" } ] },
      { q: "Ce à quoi vous tenez le plus…", options: [
        { text: "Le plaisir et les gens", cat: "sanguine" },
        { text: "Les résultats et la victoire", cat: "choleric" },
        { text: "La qualité et l'exactitude", cat: "melancholic" },
        { text: "La paix et la stabilité", cat: "phlegmatic" } ] },
      { q: "Votre point faible, c'est…", options: [
        { text: "De vous éparpiller", cat: "sanguine" },
        { text: "D'être impatient", cat: "choleric" },
        { text: "De trop réfléchir", cat: "melancholic" },
        { text: "D'éviter le changement", cat: "phlegmatic" } ] },
      { q: "Pour décider, vous…", options: [
        { text: "Suivez votre instinct et votre enthousiasme", cat: "sanguine" },
        { text: "Tranchez vite et fermement", cat: "choleric" },
        { text: "Analysez à fond d'abord", cat: "melancholic" },
        { text: "Prenez votre temps et cherchez le consensus", cat: "phlegmatic" } ] },
      { q: "Sous stress, vous devenez…", options: [
        { text: "Désorganisé et distrait", cat: "sanguine" },
        { text: "Exigeant et cassant", cat: "choleric" },
        { text: "Renfermé et critique", cat: "melancholic" },
        { text: "Silencieux et têtu", cat: "phlegmatic" } ] },
      { q: "On vous décrirait comme…", options: [
        { text: "Drôle et expansif", cat: "sanguine" },
        { text: "Déterminé et audacieux", cat: "choleric" },
        { text: "Profond et précis", cat: "melancholic" },
        { text: "Calme et fiable", cat: "phlegmatic" } ] },
      { q: "Votre travail idéal est…", options: [
        { text: "Social et varié", cat: "sanguine" },
        { text: "Exigeant, avec de l'autonomie", cat: "choleric" },
        { text: "Détaillé et de haute qualité", cat: "melancholic" },
        { text: "Stable et harmonieux", cat: "phlegmatic" } ] },
      { q: "En conversation, vous…", options: [
        { text: "Parlez beaucoup et racontez des histoires", cat: "sanguine" },
        { text: "Allez droit au but", cat: "choleric" },
        { text: "Choisissez vos mots avec soin", cat: "melancholic" },
        { text: "Écoutez plus que vous ne parlez", cat: "phlegmatic" } ] },
      { q: "Le changement et le risque vous semblent…", options: [
        { text: "Stimulants", cat: "sanguine" },
        { text: "Payants si l'on gagne", cat: "choleric" },
        { text: "À analyser d'abord", cat: "melancholic" },
        { text: "Déstabilisants — je préfère la stabilité", cat: "phlegmatic" } ] },
    ],
  },

  handle: {
    kicker: "Mettre en pratique",
    heading: "Travailler avec chaque tempérament",
    sub: "Une sagesse antique, étonnamment pratique pour lire une pièce.",
    nav: "Appliquer",
    cta: "Voir le lien complet avec les couleurs DISC →",
    cards: [
      { icon: "🎈", title: "Avec un sanguin", tone: "do", items: [
        "Gardez un cadre chaleureux, joyeux et convivial", "Laissez-le parler et être vu", "Donnez reconnaissance et variété", "Aidez-le sur le détail et la structure",
      ]},
      { icon: "🔥", title: "Avec un colérique", tone: "", items: [
        "Soyez bref et direct", "Concentrez-vous sur les résultats et les objectifs", "Proposez des choix, laissez-le décider", "Ne perdez pas son temps",
      ]},
      { icon: "🌧️", title: "Avec un mélancolique / flegmatique", tone: "dont", items: [
        "Mélancolique : donnez du détail, de l'exactitude et du temps", "Mélancolique : respectez ses exigences élevées", "Flegmatique : soyez patient et rassurant", "Flegmatique : amenez le changement en douceur",
      ]},
    ],
  },

  faq: [
    { q: "L'idée des « quatre humeurs » n'est-elle pas réfutée ?", a: "La biologie — l'idée que la personnalité viendrait du sang, de la bile et du phlegme — est totalement discréditée. Mais les quatre schémas <em>comportementaux</em> décrits par les Anciens se sont révélés remarquablement durables et nourrissent les modèles modernes." },
    { q: "Quel rapport avec le DISC ?", a: "Presque direct : colérique→Rouge, sanguin→Jaune, flegmatique→Vert, mélancolique→Bleu. Les tempéraments sont en pratique l'ancêtre du DISC. Voir la passerelle couleurs ci-dessous." },
    { q: "Puis-je en être plusieurs ?", a: "Oui — presque tout le monde est un mélange avec un ou deux tempéraments dominants. Le résultat montre le plus marqué et l'équilibre général." },
    { q: "Un tempérament est-il meilleur ?", a: "Non. Chacun a des forces nettes et des faiblesses caractéristiques ; ils s'équilibrent dans les équipes et les relations." },
    { q: "Pourquoi apprendre un modèle antique ?", a: "Il est simple, mémorable et se transpose proprement dans les outils modernes — une porte d'entrée conviviale pour lire les gens, et un rappel que la nature humaine est remarquablement constante." },
    { q: "Mon tempérament peut-il changer ?", a: "Votre penchant de fond est assez stable, mais l'expérience, la maturation et le contexte façonnent la manière dont il s'exprime." },
  ],

  disc: {
    kicker: "Passerelle",
    heading: "Les tempéraments et les couleurs DISC",
    sub: "Les quatre tempéraments correspondent presque terme à terme aux quatre couleurs DISC.",
    nav: "Couleurs",
    labels: { relate: "Tempérament correspondant", reflect: "Axe de progression", treat: "Comment les aborder" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Découvrir l'atelier complet des couleurs DISC →",
    colors: {
      red: { relate: "Colérique — audacieux, déterminé, décidé.", reflect: "Développez la patience et l'empathie.", treat: "Soyez bref, direct et centré sur les résultats." },
      yellow: { relate: "Sanguin — sociable, enjoué, optimiste.", reflect: "Développez la concentration et la finition.", treat: "Soyez chaleureux, sociable et donnez de la reconnaissance." },
      green: { relate: "Flegmatique — calme, patient, stable.", reflect: "Développez l'assertivité et l'ouverture au changement.", treat: "Soyez patient, personnel et rassurant." },
      blue: { relate: "Mélancolique — profond, précis, minutieux.", reflect: "Développez la souplesse ; allégez la sur-réflexion.", treat: "Donnez du détail, de l'exactitude et du temps pour réfléchir." },
    },
  },
};

window.BOOK_FR = BOOK_FR;
