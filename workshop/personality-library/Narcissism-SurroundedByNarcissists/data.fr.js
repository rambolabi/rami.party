/* =============================================================================
   Entouré de narcissiques — contenu français
   Atelier éducatif inspiré d'« Entouré de narcissiques » de Thomas Erikson.
   Reconnaître les styles narcissiques et tenir sa place — ce n'est EN AUCUN CAS
   un outil clinique ou diagnostique. Structure identique à data.js.
   ========================================================================== */
const BOOK_FR = {
  meta: {
    key: "narcissists",
    title: "Entouré de narcissiques",
    subtitle: "Reconnaître les quatre visages et tenir sa place",
    short: "Narcissiques",
    emoji: "🪞",
    accent: "#7c3aed",
    eyebrow: "Un atelier Thomas Erikson",
    description:
      "Un atelier éducatif inspiré d'« Entouré de narcissiques » de Thomas Erikson. Découvrez les quatre visages du narcissisme et comment garder pied — ce n'est pas un outil clinique ou diagnostique.",
    heroTitle: "Toujours la personne<br />la plus importante<br />de la pièce ?",
    heroLead:
      "Certaines personnes ramènent chaque situation à elles-mêmes. Découvrez les quatre visages du narcissisme avec <em>Entouré de narcissiques</em> de Thomas Erikson — et comment protéger votre équilibre.",
    heroCta: "Identifiez le type",
    footerNote:
      "Un atelier éducatif inspiré d'<em>Entouré de narcissiques</em> de Thomas Erikson. Il vous aide à reconnaître les comportements égocentrés et à vous protéger — ce n'est pas un outil clinique ou diagnostique.",
  },

  learn: {
    kicker: "Les idées",
    heading: "Les quatre visages du narcissisme",
    sub: "Le narcissisme s'étend sur un spectre, et il porte plus d'un masque. Touchez une carte pour aller plus loin.",
  },

  concepts: [
    {
      icon: "🌈",
      name: "Le spectre",
      tag: "De la confiance saine au trouble.",
      summary:
        "Un peu d'attention à soi est sain. Le narcissisme devient un problème quand quelqu'un a constamment besoin d'être supérieur, manque d'empathie et traite les autres comme des outils au service de son image. La plupart des personnes difficiles se situent quelque part sur le spectre — pas à son extrémité clinique.",
      points: [
        "Une estime de soi saine n'exige pas que les autres se rapetissent.",
        "Le schéma problématique : grandiosité + sentiment de tout mériter + empathie absente.",
        "Les traits existent sur une échelle — on répond au comportement, pas aux étiquettes.",
        "On ne fait pas sortir quelqu'un par la raison d'une image de soi fragile et défendue.",
      ],
    },
    {
      icon: "🎭",
      name: "Les quatre visages",
      tag: "Grandiose, vulnérable, communautaire, malveillant.",
      summary:
        "Le narcissisme se manifeste dans des styles très différents. Le grandiose se vante ; le vulnérable boude ; le communautaire met en scène sa vertu ; le malveillant contrôle. Le questionnaire vous aide à repérer à qui vous avez affaire.",
      points: [
        "<strong>Grandiose :</strong> bruyant, supérieur, affamé d'admiration.",
        "<strong>Vulnérable :</strong> fragile, blessé, éternelle victime.",
        "<strong>Communautaire :</strong> le « saint » qui a besoin d'être vu comme bon.",
        "<strong>Malveillant :</strong> narcissisme plus agressivité et contrôle.",
      ],
    },
    {
      icon: "🔄",
      name: "Le cycle",
      tag: "Idéalisation, dévalorisation, rejet.",
      summary:
        "Les relations avec un narcissique suivent souvent un schéma : il vous idéalise (« love bombing »), puis vous dévalorise à mesure que la réalité s'invite, puis vous rejette — avant, parfois, de vous réaspirer.",
      points: [
        "<strong>Idéalisation :</strong> éloges et attention intenses au départ.",
        "<strong>Dévalorisation :</strong> critiques, froideur, exigences qui se déplacent.",
        "<strong>Rejet :</strong> retrait, remplacement ou accusation.",
        "Reconnaître le cycle aide à cesser de le prendre pour soi.",
      ],
    },
    {
      icon: "⛽",
      name: "Le carburant et le faux self",
      tag: "Pourquoi ils ont besoin de vous.",
      summary:
        "Sous la bravade se cache une image de soi fragile qu'il faut nourrir en permanence — d'attention, d'admiration, de drame ou de contrôle. Ce carburant s'appelle l'« approvisionnement narcissique », et vous en êtes une source.",
      points: [
        "Le masque assuré cache un noyau fragile.",
        "L'attention — même négative — est du carburant.",
        "Retirer votre réaction affame le schéma.",
        "Vous n'êtes pas responsable de soutenir leur image d'eux-mêmes.",
      ],
    },
    {
      icon: "🛡️",
      name: "Tenir sa place",
      tag: "Limites, rocher gris, distance.",
      summary:
        "Vous ne changerez pas un narcissique en lui expliquant qu'il vous blesse. Vous vous protégez par des limites, une faible réactivité émotionnelle et — si nécessaire — de la distance.",
      points: [
        "Posez des limites et faites-les respecter sans longs débats.",
        "Utilisez le « rocher gris » : des réponses calmes, brèves et sans récompense.",
        "Gardez votre réalité ancrée grâce à des amis de confiance.",
        "Face à un comportement malveillant, la sécurité et la distance priment.",
      ],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Quel visage ?",
    heading: "À quel narcissique avez-vous affaire ?",
    sub: "Pensez à une personne précise. Répondez sur ce que vous observez chez elle et nous estimerons le style qui correspond le mieux.",
    nav: "Identifier",
    icon: "🔎",
    introTitle: "12 observations",
    introText: "Gardez une personne en tête et choisissez l'option qui <em>lui</em> ressemble le plus. Il n'y a pas de mauvaise réponse.",
    resultEyebrow: "Le style auquel vous avez affaire",
    categories: {
      grandiose: {
        name: "Le narcissique grandiose",
        icon: "👑",
        color: "#7c3aed",
        summary:
          "Le narcissique classique : grandiose, supérieur et affamé d'admiration. Éblouissant en surface, méprisant en dessous.",
        signs: ["Se vante et cite des noms sans cesse", "Doit être le meilleur et le centre de tout", "Rabaisse les gens « ordinaires »", "Accueille la critique par le mépris", "Charmant jusqu'à ce que vous cessiez de l'admirer"],
        handle: ["N'alimentez pas le besoin d'applaudissements", "Restez calme et peu impressionné", "Gardez des limites factuelles et fermes", "N'entrez pas en compétition de statut", "Limitez votre investissement émotionnel"],
      },
      vulnerable: {
        name: "Le narcissique vulnérable",
        icon: "🌧️",
        color: "#db2777",
        summary:
          "Le narcissique fragile ou dissimulé : en apparence peu sûr de lui et lésé, mais tout aussi centré sur lui-même — tout ramène à sa souffrance.",
        signs: ["Victimisation chronique", "Hypersensible aux vexations", "Envieux et rancunier", "Passif-agressif", "Vous culpabilise par sa souffrance"],
        handle: ["Ne vous laissez pas piéger dans le sauvetage", "Résistez à l'appel de la culpabilité", "Posez des limites douces mais fermes", "Refusez une faute qui n'est pas la vôtre", "Protégez votre propre énergie"],
      },
      communal: {
        name: "Le narcissique communautaire",
        icon: "😇",
        color: "#0891b2",
        summary:
          "Le narcissique « saint » : il cherche son statut dans une vertu bien visible. La personne la plus gentille de la pièce — tant que tout le monde regarde.",
        signs: ["Une gentillesse bruyante, mise en scène", "Tient le compte de ses bonnes actions", "Différent en privé", "Culpabilise les autres avec tout ce qu'il « donne »", "Assoiffé d'admiration morale"],
        handle: ["Remarquez la dépendance au public", "Ne vous laissez pas emporter par le spectacle", "Remerciez-les, sans vous sentir éternellement redevable", "Gardez votre propre boussole morale", "Jugez les actes, pas les annonces"],
      },
      malignant: {
        name: "Le narcissique malveillant",
        icon: "🐍",
        color: "#b91c1c",
        summary:
          "Le mélange le plus dangereux : narcissisme, agressivité et goût du contrôle. Le charme y masque une véritable cruauté.",
        signs: ["Manipulateur et contrôlant", "Vindicatif dès qu'on lui résiste", "Peu ou pas de remords", "Prend plaisir au malaise des autres", "Peut être intimidant ou menaçant"],
        handle: ["Faites passer votre sécurité d'abord", "Réduisez le contact et décrochez", "Documentez tout", "Ne les affrontez pas seul", "Cherchez un appui professionnel ou juridique si nécessaire"],
      },
    },
    questions: [
      { q: "Comment cherchent-ils habituellement l'attention ?", options: [
        { text: "En se vantant ouvertement de leur réussite et de leur statut", cat: "grandiose" },
        { text: "En laissant entendre à quel point ils sont méconnus et lésés", cat: "vulnerable" },
        { text: "En s'assurant que tout le monde voie combien ils sont attentionnés", cat: "communal" },
        { text: "En dominant la pièce jusqu'à ce que tous les regards convergent", cat: "malignant" },
      ]},
      { q: "Face à une critique, ils…", options: [
        { text: "Vous écartent comme jaloux ou inférieur", cat: "grandiose" },
        { text: "S'effondrent dans un apitoiement blessé", cat: "vulnerable" },
        { text: "Jouent la stupeur qu'on puisse douter d'une si bonne personne", cat: "communal" },
        { text: "Ripostent et cherchent à vous le faire payer", cat: "malignant" },
      ]},
      { q: "Au fond, comment se voient-ils ?", options: [
        { text: "Supérieurs et exceptionnels", cat: "grandiose" },
        { text: "Fragiles mais secrètement spéciaux et incompris", cat: "vulnerable" },
        { text: "La personne la plus désintéressée et la plus morale qui soit", cat: "communal" },
        { text: "En droit de gagner à n'importe quel prix", cat: "malignant" },
      ]},
      { q: "Comment traitent-ils ceux qui ne peuvent rien pour eux ?", options: [
        { text: "Ils les ignorent comme insignifiants", cat: "grandiose" },
        { text: "Ils les envient et leur en veulent en silence", cat: "vulnerable" },
        { text: "Ils jouent la bienveillance quand il y a du public", cat: "communal" },
        { text: "Ils les exploitent ou les écartent froidement", cat: "malignant" },
      ]},
      { q: "Dans une dispute, ils…", options: [
        { text: "Vous coupent la parole avec une certitude grandiose", cat: "grandiose" },
        { text: "Retournent la situation pour devenir la victime", cat: "vulnerable" },
        { text: "Vous culpabilisent avec tout ce qu'ils ont fait pour vous", cat: "communal" },
        { text: "Menacent, punissent ou intimident", cat: "malignant" },
      ]},
      { q: "Leur empathie est…", options: [
        { text: "Mince — les autres existent pour les admirer", cat: "grandiose" },
        { text: "Entièrement tournée vers leur propre douleur", cat: "vulnerable" },
        { text: "Une représentation publique, pas une habitude privée", cat: "communal" },
        { text: "Essentiellement absente, parfois cruelle", cat: "malignant" },
      ]},
      { q: "De quoi ont-ils le plus soif ?", options: [
        { text: "D'admiration et de statut", cat: "grandiose" },
        { text: "De réassurance et de compassion", cat: "vulnerable" },
        { text: "D'être vus comme les meilleurs et les plus gentils", cat: "communal" },
        { text: "De pouvoir et de contrôle", cat: "malignant" },
      ]},
      { q: "Quand vous réussissez, ils…", options: [
        { text: "Ramènent tout à eux", cat: "grandiose" },
        { text: "Boudent ou se sentent menacés", cat: "vulnerable" },
        { text: "Affirment que c'est grâce à eux", cat: "communal" },
        { text: "Vous minent ou vous sabotent", cat: "malignant" },
      ]},
      { q: "Leur charme paraît…", options: [
        { text: "Assuré et éblouissant", cat: "grandiose" },
        { text: "Doux, demandeur et attendrissant", cat: "vulnerable" },
        { text: "Chaleureux, vertueux et serviable", cat: "communal" },
        { text: "Calculé et prédateur", cat: "malignant" },
      ]},
      { q: "Comment traitent-ils les règles et les limites ?", options: [
        { text: "Les règles ne s'appliquent pas à quelqu'un comme eux", cat: "grandiose" },
        { text: "Ils s'en sentent persécutés", cat: "vulnerable" },
        { text: "Ils les contournent « pour la bonne cause »", cat: "communal" },
        { text: "Ils les brisent et vous défient d'y redire quelque chose", cat: "malignant" },
      ]},
      { q: "Après un conflit, ils…", options: [
        { text: "Attendent que vous reveniez en rampant", cat: "grandiose" },
        { text: "Attendent que vous les consoliez et vous excusiez", cat: "vulnerable" },
        { text: "Rappellent à tous combien ils savent pardonner", cat: "communal" },
        { text: "Gardent rancune et préparent leur revanche", cat: "malignant" },
      ]},
      { q: "Le sentiment qui vous reste est…", options: [
        { text: "Celui d'être petit et invisible", cat: "grandiose" },
        { text: "Celui d'être vidé et coupable", cat: "vulnerable" },
        { text: "La confusion — ils ont l'air si « gentils »", cat: "communal" },
        { text: "L'inquiétude ou la peur", cat: "malignant" },
      ]},
    ],
  },

  handle: {
    kicker: "Guide de terrain",
    heading: "Comment tenir sa place",
    sub: "On ne raisonne pas un narcissique hors de son image de soi. On peut protéger son propre équilibre.",
    nav: "Se protéger",
    cta: "Lire le guide de survie →",
    cards: [
      { icon: "✅", title: "À faire", tone: "do", items: [
        "Gardez des limites claires et constantes", "Restez calme et sans drame (rocher gris)", "Gardez votre version de la réalité bien ancrée", "Réduisez le contact quand c'est possible", "Prenez soin de votre réseau de soutien",
      ]},
      { icon: "⛔", title: "À éviter", tone: "dont", items: [
        "Attendre qu'ils comprennent votre point de vue", "Discuter pour une reconnaissance qui ne viendra pas", "Rivaliser de statut ou de supériorité morale", "Vous reprocher le cycle", "Vous couper de vos alliés",
      ]},
      { icon: "🪨", title: "Rocher gris et limites", tone: "", items: [
        "Soyez calme, bref et sans intérêt à provoquer", "Énoncez une limite une fois, puis appliquez-la", "N'expliquez pas et ne vous justifiez pas en boucle", "Coupez l'« approvisionnement » émotionnel", "Faites appel à de l'aide si cela devient malveillant",
      ]},
    ],
  },

  faq: [
    { q: "Ce test diagnostique-t-il le narcissisme ?", a: "Non. C'est un outil éducatif de réflexion qui estime quel <em>style</em> de comportement égocentré vous observez peut-être. Seul un professionnel qualifié peut diagnostiquer un trouble de la personnalité narcissique." },
    { q: "Peut-on être plusieurs types ?", a: "Oui. Les quatre visages se recoupent, et les gens passent de l'un à l'autre selon la situation. Votre résultat montre la correspondance la plus forte et l'équilibre entre les quatre." },
    { q: "Un narcissique peut-il changer ?", a: "Un changement profond est rare et exige une motivation sincère et un accompagnement professionnel. Votre bien-être ne devrait pas dépendre de cette attente — misez sur les limites et l'autoprotection." },
    { q: "Qu'est-ce que le « rocher gris » ?", a: "Le rocher gris consiste à devenir aussi ennuyeux et impassible qu'une pierre grise : calme, bref et émotionnellement plat, pour cesser de fournir l'attention et le drame dont le schéma se nourrit." },
    { q: "N'est-il pas injuste de traiter les gens de « narcissiques » ?", a: "Cela peut l'être. Cet atelier porte sur la reconnaissance de <em>schémas de comportement</em> et sur votre protection — pas sur l'apposition d'étiquettes. Servez-vous-en pour vous, afin de comprendre ce que vous vivez." },
    { q: "Et si c'est malveillant et que je ne me sens pas en sécurité ?", a: "Faites passer votre sécurité en premier. Réduisez le contact, consignez les incidents, évitez de les affronter seul et adressez-vous à un professionnel, à des personnes de confiance ou aux services d'aide de votre région." },
  ],

  disc: {
    kicker: "Les quatre couleurs",
    heading: "Les narcissiques et les quatre couleurs",
    sub: "Chaque couleur DISC se fait attraper différemment par un narcissique. Connaissez votre réflexe — et protégez-le.",
    nav: "Couleurs",
    labels: { relate: "Comment cette couleur réagit", reflect: "Si c'est vous — méfiez-vous de", treat: "Votre meilleure protection" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Trouvez votre couleur dans l'atelier DISC →",
    colors: {
      red: {
        relate: "Les Rouges s'opposent frontalement, transformant chaque échange en rapport de force dont le narcissique se délecte.",
        reflect: "Votre besoin de gagner peut vous enfermer dans un combat que le narcissique ne concédera jamais.",
        treat: "Choisissez vos batailles et sortez des concours d'ego. Protégez vos objectifs, pas votre fierté.",
      },
      yellow: {
        relate: "Les Jaunes sont facilement soumis au « love bombing » et recherchent l'approbation éblouissante du narcissique.",
        reflect: "Votre appétit d'admiration rend la phase d'idéalisation enivrante — et le rejet écrasant.",
        treat: "Ancrez votre valeur hors de leurs applaudissements et gardez près de vous des amis sincères.",
      },
      green: {
        relate: "Les Verts absorbent les reproches et préservent la paix, ce que le narcissique exploite avec plaisir.",
        reflect: "Votre loyauté et votre aversion pour le conflit peuvent vous retenir bien trop longtemps dans le cycle.",
        treat: "Entraînez-vous à dire non. La paix n'est pas à vous seul de la porter.",
      },
      blue: {
        relate: "Les Bleus tentent de raisonner et de démontrer des points qu'un narcissique n'admettra jamais sincèrement.",
        reflect: "Vous risquez d'épuiser votre énergie à courir après une reconnaissance logique qui ne viendra pas.",
        treat: "Cessez de débattre pour obtenir une validation. Appuyez-vous plutôt sur les faits, les traces écrites et des limites fermes.",
      },
    },
  },
};

window.BOOK_FR = BOOK_FR;
