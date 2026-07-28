/* =============================================================================
   Les cinq langages de l'amour — contenu français
   Structure identique à data.js ; seuls les textes lisibles sont traduits.
   Les clés de catégorie, les couleurs, les icônes et l'ordre restent inchangés.
   ========================================================================== */
const BOOK_FR = {
  meta: {
    key: "lovelanguages",
    title: "Les cinq langages de l'amour",
    subtitle: "Votre façon de donner et de recevoir l'amour",
    short: "Langages de l'amour",
    emoji: "💗",
    accent: "#e11d48",
    eyebrow: "Un modèle relationnel",
    description:
      "Un atelier éducatif sur les cinq langages de l'amour de Gary Chapman. Découvrez ce qui vous fait le plus vous sentir aimé — et comment aimer les autres dans leur langage.",
    heroTitle: "Chacun parle<br />l'amour autrement.",
    heroLead:
      "Nous donnons l'amour comme nous aimons le recevoir — et c'est précisément pour cela qu'il se perd si souvent en route. Découvrez les <em>cinq langages de l'amour</em> de Gary Chapman et trouvez le vôtre.",
    heroCta: "Trouvez votre langage",
    footerNote:
      "Un atelier éducatif inspiré des <em>5 langages de l'amour</em> de Gary Chapman. Un outil pour des relations plus chaleureuses, pas un test scientifique.",
    footerSupport:
      "Inspiré des <em>5 langages de l'amour</em> de Gary Chapman. Si cela vous parle, lisez le livre et soutenez l'auteur. Découvrez-en plus dans <strong>La Bibliothèque Humaine</strong>.",
  },

  learn: {
    kicker: "Les idées",
    heading: "Cinq façons de dire « je t'aime »",
    sub: "Chapman a constaté que l'on se sent aimé par cinq canaux principaux — et la plupart d'entre nous en privilégient un ou deux. Touchez une carte pour aller plus loin.",
  },

  concepts: [
    {
      icon: "💗", name: "Les cinq langages", tag: "Paroles, services, cadeaux, temps, toucher.",
      summary: "L'amour se donne et se reçoit par cinq « langages » principaux : les paroles valorisantes, les services rendus, les cadeaux, les moments de qualité et le toucher physique. La plupart des gens en ont un qui leur parle plus fort que les autres.",
      points: ["<strong>Les paroles</strong> — compliments, encouragements, « je t'aime ».", "<strong>Les services</strong> — faire des choses utiles pour l'autre.", "<strong>Les cadeaux</strong> — des attentions qui disent « je pensais à toi ».", "<strong>Le temps</strong> — une attention entière, ensemble.", "<strong>Le toucher</strong> — étreintes, proximité, tendresse physique."],
    },
    {
      icon: "🔁", name: "On donne ce qu'on voudrait recevoir", tag: "Le fossé de traduction.",
      summary: "L'intuition centrale : on exprime naturellement l'amour dans son propre langage, pas dans celui de l'autre. Une personne « paroles » couvre l'autre de compliments ; une personne « services » s'occupe silencieusement des tâches — et chacune peut se sentir mal aimée parce que le message n'arrive jamais.",
      points: ["Par défaut, vous donnez l'amour dans votre langage.", "Votre partenaire « écoute » peut-être sur un autre canal.", "Un effort fait dans le mauvais langage passe presque inaperçu.", "C'est le décalage, et non le manque d'amour, qui blesse le plus."],
    },
    {
      icon: "🗣️", name: "Parlez leur langage", tag: "L'amour sur leur canal.",
      summary: "La solution est simple, pas toujours facile : apprenez le langage principal de l'autre et aimez-le délibérément dans celui-ci — même quand cela ne vous vient pas naturellement. C'est alors que l'amour passe enfin.",
      points: ["Demandez et observez ce qui les illumine.", "Faites-le dans leur langage, pas dans le vôtre.", "Des gestes petits et réguliers valent mieux que de rares grandes envolées.", "C'est une compétence, elle se travaille."],
    },
    {
      icon: "👨‍👩‍👧", name: "Au-delà du couple", tag: "Enfants, amis, collègues.",
      summary: "Les langages de l'amour ne servent pas qu'aux couples. Les enfants, les amis et même les collègues ont leur manière préférée de se sentir reconnus. La même idée crée partout des liens plus chaleureux.",
      points: ["Les enfants aussi ont un langage principal.", "Les amitiés s'approfondissent quand on parle leur langage.", "Au travail, la reconnaissance porte mieux quand elle est ajustée à la personne.", "C'est en réalité un « langage de la reconnaissance » pour tout lien."],
    },
    {
      icon: "⚖️", name: "Chacun est un mélange", tag: "Un principal, un peu de tout.",
      summary: "Vous appréciez les cinq à des degrés divers, mais un ou deux comptent généralement le plus. Connaître le vôtre — et le dire — permet à ceux qui vous aiment de vraiment vous atteindre.",
      points: ["Vous avez un langage principal et un secondaire.", "Partager le vôtre aide les autres à bien vous aimer.", "Votre langage peut évoluer selon les étapes de la vie.", "L'équilibre compte quand même — ne négligez pas le reste."],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Auto-évaluation",
    heading: "Quel est votre langage de l'amour ?",
    sub: "Dix choix rapides entre deux options. Dans chaque paire, prenez ce qui compterait le plus pour vous — pas ce que vous « devriez » choisir.",
    nav: "Le vôtre",
    icon: "💗",
    introTitle: "10 choix entre deux options",
    introText: "Choisissez l'option qui <em>vous</em> ferait le plus vous sentir aimé. Suivez votre cœur.",
    resultEyebrow: "Votre langage de l'amour principal",
    categories: {
      words: { name: "Les paroles valorisantes", icon: "💬", color: "#2563eb",
        summary: "Vous vous sentez aimé par des mots gentils, encourageants et reconnaissants. Les compliments et les « je t'aime » vous touchent profondément ; la critique vous entaille.",
        signsTitle: "Vous vous illuminez quand", handleTitle: "Comment vous aimer",
        signs: ["Quelqu'un vous félicite ou vous encourage", "Vous entendez « je suis fier de toi »", "L'amour se dit à voix haute", "On vous laisse des mots et des messages gentils"],
        handle: ["Dites-le à voix haute et souvent", "Félicitez de façon précise et sincère", "Envoyez des messages encourageants", "Soyez délicat dans la critique"] },
      acts: { name: "Les services rendus", icon: "🛠️", color: "#0891b2",
        summary: "Vous vous sentez aimé quand on fait des choses utiles pour vous. Les actes parlent plus fort que les mots — « laisse-moi faire » est une musique.",
        signsTitle: "Vous vous illuminez quand", handleTitle: "Comment vous aimer",
        signs: ["Quelqu'un allège votre charge", "Les tâches sont faites sans qu'on demande", "L'aide arrive quand vous êtes débordé", "Les promesses sont tenues"],
        handle: ["Faites des choses utiles sans qu'on demande", "Allégez leur charge", "Tenez vos promesses", "Repérez ce qu'il y a à faire et faites-le"] },
      gifts: { name: "Les cadeaux", icon: "🎁", color: "#db2777",
        summary: "Vous vous sentez aimé par des cadeaux et des attentions — pas pour leur prix, mais parce qu'ils disent « je pensais à toi ».",
        signsTitle: "Vous vous illuminez quand", handleTitle: "Comment vous aimer",
        signs: ["Une petite surprise attentionnée", "Quelqu'un s'est souvenu d'un détail que vous aviez mentionné", "Des attentions qui marquent les occasions", "L'intention derrière le cadeau"],
        handle: ["Offrez de petites attentions bien pensées", "Retenez les détails qu'ils mentionnent", "Marquez les occasions", "C'est l'intention qui compte, pas le prix"] },
      time: { name: "Les moments de qualité", icon: "⏳", color: "#2a9d5c",
        summary: "Vous vous sentez aimé par une attention entière — une vraie présence, sans téléphone, à faire des choses ensemble et à vraiment se parler.",
        signsTitle: "Vous vous illuminez quand", handleTitle: "Comment vous aimer",
        signs: ["Une attention entière", "Faire des choses ensemble", "Une vraie conversation sans hâte", "Être la priorité de quelqu'un"],
        handle: ["Donnez une attention pleine, sans téléphone", "Planifiez du temps ensemble", "Écoutez vraiment", "Faites-leur sentir qu'ils passent en premier"] },
      touch: { name: "Le toucher physique", icon: "🤗", color: "#e11d48",
        summary: "Vous vous sentez aimé par la proximité physique — une étreinte, une main tenue, être assis tout près. Le toucher vous rassure comme rien d'autre.",
        signsTitle: "Vous vous illuminez quand", handleTitle: "Comment vous aimer",
        signs: ["Une étreinte chaleureuse", "Une main sur votre épaule", "Être assis tout près", "Une réassurance physique"],
        handle: ["Offrez un contact chaleureux et bienvenu", "Enlacez-les pour dire bonjour et au revoir", "Asseyez-vous tout près", "Rassurez par la proximité physique"] },
    },
    questions: [
      { q: "Qu'est-ce qui compterait le plus pour vous ?", options: [ { text: "Entendre de vrais compliments et « je t'aime »", cat: "words" }, { text: "Qu'on s'occupe d'une tâche à votre place", cat: "acts" } ] },
      { q: "Qu'est-ce qui compterait le plus pour vous ?", options: [ { text: "Un compliment sincère", cat: "words" }, { text: "Un petit cadeau attentionné", cat: "gifts" } ] },
      { q: "Qu'est-ce qui compterait le plus pour vous ?", options: [ { text: "Des paroles d'encouragement", cat: "words" }, { text: "Du temps ensemble sans interruption", cat: "time" } ] },
      { q: "Qu'est-ce qui compterait le plus pour vous ?", options: [ { text: "S'entendre dire qu'on vous aime", cat: "words" }, { text: "Une longue étreinte chaleureuse", cat: "touch" } ] },
      { q: "Qu'est-ce qui compterait le plus pour vous ?", options: [ { text: "Qu'on règle une corvée pour vous", cat: "acts" }, { text: "Un cadeau surprise choisi pour vous", cat: "gifts" } ] },
      { q: "Qu'est-ce qui compterait le plus pour vous ?", options: [ { text: "De l'aide quand vous êtes débordé", cat: "acts" }, { text: "Une soirée d'attention entière", cat: "time" } ] },
      { q: "Qu'est-ce qui compterait le plus pour vous ?", options: [ { text: "Quelqu'un qui allège votre charge de travail", cat: "acts" }, { text: "Être assis tout près, main dans la main", cat: "touch" } ] },
      { q: "Qu'est-ce qui compterait le plus pour vous ?", options: [ { text: "Un souvenir qui a du sens", cat: "gifts" }, { text: "Une journée entière ensemble, rien que vous deux", cat: "time" } ] },
      { q: "Qu'est-ce qui compterait le plus pour vous ?", options: [ { text: "Un cadeau qui montre qu'on vous comprend", cat: "gifts" }, { text: "Une étreinte quand vous passez la porte", cat: "touch" } ] },
      { q: "Qu'est-ce qui compterait le plus pour vous ?", options: [ { text: "Du temps ensemble, pleinement présent", cat: "time" }, { text: "Être serré tout contre l'autre", cat: "touch" } ] },
    ],
  },

  handle: {
    kicker: "Mettre en pratique",
    heading: "Bien aimer les gens",
    sub: "Le but n'est pas de changer votre langage — c'est de parler le leur.",
    nav: "Appliquer",
    cta: "Retour à la Bibliothèque Humaine →",
    cards: [
      { icon: "✅", title: "À faire", tone: "do", items: [
        "Apprenez le langage principal de votre partenaire", "Aimez-le dans son langage, pas dans le vôtre", "Demandez franchement ce qui le fait se sentir aimé", "Multipliez les petits gestes réguliers", "Dites aussi quel est le vôtre",
      ]},
      { icon: "⛔", title: "À éviter", tone: "dont", items: [
        "Supposer qu'il ressent l'amour comme vous", "Ne donner que dans votre propre langage", "Réserver les grands gestes aux grandes occasions", "Lire un décalage comme « il ne tient pas à moi »", "Négliger les langages qui ne sont pas principaux",
      ]},
      { icon: "🌍", title: "Partout", tone: "", items: [
        "Utilisez-le aussi avec les enfants et les amis", "Ajustez la reconnaissance au travail à la personne", "Repérez ce à quoi chacun réagit", "Dites l'amour dans le langage qui arrive à destination", "Regardez le lien s'approfondir",
      ]},
    ],
  },

  faq: [
    { q: "Les langages de l'amour, est-ce scientifique ?", a: "C'est un cadre populaire et pratique plutôt qu'une théorie rigoureusement validée. Les résultats de la recherche sont contrastés — mais beaucoup de couples y trouvent une grille vraiment utile pour parler de leurs besoins." },
    { q: "Mon langage peut-il changer ?", a: "Oui. Il peut évoluer au fil des étapes de la vie et des relations. Les jeunes parents, par exemple, réclament souvent des services rendus ; les couples à distance, des paroles." },
    { q: "Et si mon partenaire et moi sommes différents ?", a: "C'est la norme, et c'est tout l'enjeu. L'art consiste à l'aimer délibérément dans son langage, même quand ce n'est pas naturel pour vous." },
    { q: "Puis-je en avoir plusieurs ?", a: "Oui — la plupart des gens ont un langage principal et un secondaire, et apprécient les cinq à des degrés divers." },
    { q: "Cela fonctionne-t-il hors du couple ?", a: "Tout à fait. Les enfants, les amis et les collègues ont tous leur façon préférée de se sentir reconnus. C'est en réalité un « langage de la reconnaissance » pour toute relation." },
    { q: "« Les cadeaux », n'est-ce pas du matérialisme ?", a: "Non. Pour une personne « cadeaux », c'est l'intention et le symbole qui comptent, pas le prix. Une fleur des champs cueillie à la main peut valoir plus qu'un objet coûteux." },
  ],
};

window.BOOK_FR = BOOK_FR;
