/* =============================================================================
   Entouré de menteurs — contenu français
   Atelier éducatif inspiré d'« Entouré de menteurs » de Thomas Erikson.
   Structure identique à data.js ; l'indicateur `correct: true` reste sur
   exactement le même index d'option que dans la version anglaise.
   ========================================================================== */
const BOOK_FR = {
  meta: {
    key: "liars",
    title: "Entouré de menteurs",
    subtitle: "Comprendre le mensonge et lire la vérité",
    short: "Menteurs",
    emoji: "🕵️",
    accent: "#0f766e",
    eyebrow: "Un atelier Thomas Erikson",
    description:
      "Un atelier éducatif inspiré d'« Entouré de menteurs » de Thomas Erikson. Comprenez pourquoi on ment, démontez les mythes de la détection du mensonge et testez vos connaissances.",
    heroTitle: "Tout le monde ment.<br />Le voyez-vous ?",
    heroLead:
      "L'essentiel de ce que nous « savons » sur la détection du mensonge est faux. Découvrez comment la tromperie fonctionne vraiment avec <em>Entouré de menteurs</em> de Thomas Erikson — et testez vos connaissances.",
    heroCta: "Testez-vous : mythe ou fait ?",
    footerNote:
      "Un atelier éducatif inspiré d'<em>Entouré de menteurs</em> de Thomas Erikson. Un outil d'apprentissage et de réflexion — pas un moyen d'accuser quelqu'un ni de « prouver » qu'il ment.",
  },

  learn: {
    kicker: "Les idées",
    heading: "Comment fonctionne vraiment le mensonge",
    sub: "Mentir est universel, et le détecter est bien plus difficile que ne le laisse croire la sagesse populaire. Touchez une carte pour aller plus loin.",
  },

  concepts: [
    {
      icon: "🤥",
      name: "Pourquoi nous mentons",
      tag: "Presque toujours pour se protéger.",
      summary:
        "On ment rarement pour le plaisir. La plupart des mensonges protègent quelque chose : éviter un conflit, échapper à des conséquences, prendre un avantage ou ménager quelqu'un. Comprendre le mobile est plus utile que guetter les tics.",
      points: [
        "Pour éviter une sanction ou un conflit.",
        "Pour prendre l'avantage ou paraître meilleur.",
        "Pour protéger quelqu'un d'autre (les pieux mensonges).",
        "Le mobile en dit plus que n'importe quel « signe ».",
      ],
    },
    {
      icon: "🧬",
      name: "L'anatomie d'un mensonge",
      tag: "Les petits mensonges grandissent.",
      summary:
        "La tromperie a tendance à s'aggraver. Un petit mensonge en appelle un deuxième pour le couvrir, puis un troisième — et chacun augmente le prix de la vérité. Les cultures et les relations glissent vers la malhonnêteté, une commodité à la fois.",
      points: [
        "Un mensonge en appelle généralement un autre pour tenir debout.",
        "Chaque mensonge renchérit le retour à la vérité.",
        "Les petits mensonges « sans gravité » banalisent les grands.",
        "Les environnements qui punissent l'honnêteté fabriquent des menteurs.",
      ],
    },
    {
      icon: "🕵️",
      name: "Les mythes de la détection",
      tag: "Le corps ne trahit presque jamais.",
      summary:
        "Presque tout ce que la sagesse populaire enseigne sur la détection du mensonge est peu fiable. Éviter le regard, gigoter et paraître nerveux sont des signes de stress, pas des preuves de mensonge — et les menteurs aguerris font souvent l'inverse.",
      points: [
        "Le regard et l'agitation ne révèlent pas fiablement un mensonge.",
        "Même des observateurs formés dépassent à peine le hasard avec le langage corporel.",
        "Les personnes honnêtes mais nerveuses ont l'air « coupables » aussi.",
        "Les polygraphes sont loin des « détecteurs de mensonge » infaillibles de la fiction.",
      ],
    },
    {
      icon: "✅",
      name: "Ce qui aide vraiment",
      tag: "Écoutez, ne fixez pas.",
      summary:
        "Les meilleurs indices sont verbaux et contextuels : les incohérences dans la durée, les récits vagues ou changeants, et la solidité du récit face aux faits connus. Créer du lien et poser des questions ouvertes révèle bien plus que l'accusation.",
      points: [
        "Concentrez-vous sur le contenu et la cohérence du récit.",
        "Confrontez-le à des faits vérifiables.",
        "Posez des questions ouvertes et laissez parler.",
        "Considérez le mobile et le contexte, pas les micro-gestes.",
      ],
    },
    {
      icon: "🤝",
      name: "Construire une culture de vérité",
      tag: "Faites de l'honnêteté le choix facile.",
      summary:
        "La meilleure défense contre le mensonge est un environnement où la vérité peut se dire sans risque. Quand l'honnêteté n'est pas punie, on a bien moins de raisons de tromper.",
      points: [
        "Ne tirez pas sur le messager — récompensez l'honnêteté.",
        "Rendez l'aveu d'une erreur sans danger.",
        "Incarnez la sincérité que vous attendez.",
        "Réduisez les pressions qui rendent le mensonge tentant.",
      ],
    },
  ],

  assessment: {
    mode: "quiz",
    shuffleOptions: false,
    kicker: "Mythe ou fait ?",
    heading: "Testez vos connaissances sur le mensonge",
    sub: "Dix croyances répandues sur le mensonge. Décidez si chacune est un mythe ou un fait — puis découvrez ce que dit vraiment la recherche.",
    nav: "Test",
    icon: "🕵️",
    introTitle: "10 questions mythe ou fait",
    introText: "Pour chaque affirmation, choisissez <em>Mythe</em> ou <em>Fait</em>. Vous aurez la bonne réponse et une brève explication à la fin.",
    resultEyebrow: "Vos connaissances sur le mensonge",
    bands: [
      { min: 0, color: "#b3123a", label: "Guidé par les mythes", title: "Trompé par la sagesse populaire", blurb: "Vos intuitions suivent surtout les mythes populaires — c'est exactement ainsi que les bons menteurs passent entre les mailles. La bonne nouvelle : la science, ça s'apprend." },
      { min: 50, color: "#f0a500", label: "Plus affûté", title: "Sur la bonne voie", blurb: "Vous avez abandonné certains mythes, mais quelques classiques vous font encore trébucher. Concentrez-vous sur le contenu verbal et le mobile plutôt que sur le langage corporel." },
      { min: 80, color: "#2a9d5c", label: "Lucide", title: "Lucide sur la vérité", blurb: "Vous voyez au-delà du folklore du langage corporel et vous vous appuyez sur ce qui marche vraiment : la cohérence, les faits et le mobile. Difficile à berner." },
    ],
    questions: [
      { q: "« Les menteurs évitent le regard. »", explain: "Mythe. Beaucoup de menteurs soutiennent au contraire <em>davantage</em> le regard pour paraître sincères. Le contact visuel ne dit presque rien de l'honnêteté.",
        options: [ { text: "Mythe", correct: true }, { text: "Fait" } ] },
      { q: "« On peut repérer un menteur de façon fiable rien qu'au langage corporel. »", explain: "Mythe. Même les professionnels formés dépassent à peine le hasard avec le langage corporel. Il n'existe aucun « signe » fiable.",
        options: [ { text: "Mythe", correct: true }, { text: "Fait" } ] },
      { q: "« Gigoter et paraître nerveux prouve qu'on ment. »", explain: "Mythe. Ce sont des signes de <em>stress</em>. Les personnes honnêtes mais anxieuses gigotent aussi, et les menteurs calmes souvent pas.",
        options: [ { text: "Mythe", correct: true }, { text: "Fait" } ] },
      { q: "« Ce que dit quelqu'un révèle plus que la façon dont il bouge. »", explain: "Fait. Les indices verbaux — incohérences, imprécisions, contradictions avec des faits connus — sont bien plus utiles que les « signes » corporels.",
        options: [ { text: "Fait", correct: true }, { text: "Mythe" } ] },
      { q: "« Les polygraphes sont fiables et acceptés partout. »", explain: "Mythe. Le polygraphe mesure l'activation physiologique, pas le mensonge ; il produit de nombreuses erreurs et n'est pas recevable devant beaucoup de tribunaux.",
        options: [ { text: "Mythe", correct: true }, { text: "Fait" } ] },
      { q: "« Regarder en haut et de côté prouve qu'on ment. »", explain: "Mythe. L'idée de la « direction du regard », issue de la psychologie populaire, a été réfutée à maintes reprises.",
        options: [ { text: "Mythe", correct: true }, { text: "Fait" } ] },
      { q: "« Les petits mensonges mènent en général à de plus gros. »", explain: "Fait. La tromperie s'aggrave — un mensonge en appelle un autre pour le couvrir, et chacun renchérit la vérité.",
        options: [ { text: "Fait", correct: true }, { text: "Mythe" } ] },
      { q: "« Quelqu'un d'assuré et de fluide ne peut pas mentir. »", explain: "Mythe. Les menteurs entraînés sont souvent fluides et sûrs d'eux — l'aisance n'est pas l'honnêteté.",
        options: [ { text: "Mythe", correct: true }, { text: "Fait" } ] },
      { q: "« Poser des questions ouvertes et créer du lien révèle plus qu'accuser. »", explain: "Fait. Laisser parler fait apparaître les incohérences ; accuser ne fait que mettre tout le monde sur la défensive.",
        options: [ { text: "Fait", correct: true }, { text: "Mythe" } ] },
      { q: "« Réfléchir au mobile — pourquoi mentirait-il ? — vaut mieux que guetter les tics. »", explain: "Fait. Le contexte et le mobile comptent parmi les indices les plus utiles ; les gestes isolés ne sont que du bruit.",
        options: [ { text: "Fait", correct: true }, { text: "Mythe" } ] },
    ],
  },

  assessment2: {
    mode: "classify",
    kicker: "Deuxième évaluation",
    heading: "Le chemin du mensonge",
    sub: "La tromperie s'aggrave par étapes. Pensez à une situation précise et voyez jusqu'où elle a avancé sur ce chemin.",
    nav: "Le chemin",
    icon: "\uD83E\uDDEC",
    introTitle: "8 observations",
    introText: "Gardez une situation en tête et choisissez l'option qui lui correspond le mieux.",
    resultEyebrow: "Jusqu'où la tromperie est allée",
    categories: {
      white: {
        name: "Le pieux mensonge", icon: "\uD83D\uDD4A\uFE0F", color: "#64748b",
        summary: "De petits mensonges sociaux qui huilent le quotidien. Sans gravité en eux-mêmes — mais c'est la porte par laquelle passent les autres.",
        signsTitle: "À quoi cela ressemble", handleTitle: "Que faire maintenant",
        signs: ["De petites entorses bienveillantes", "Aucun vrai coût à dire la vérité", "Occasionnels et sociaux", "Confiance intacte"],
        handle: ["Ne surveillez pas à l'excès la politesse ordinaire", "Incarnez l'honnêteté là où cela compte", "Repérez si « sans gravité » commence à déraper", "Gardez la vérité facile à dire"],
      },
      cover: {
        name: "La dissimulation", icon: "\uD83E\uDDE5", color: "#0891b2",
        summary: "Un mensonge pour cacher une erreur précise ou éviter une conséquence. Encore circonscrit — mais c'est là que commence l'escalade.",
        signsTitle: "À quoi cela ressemble", handleTitle: "Que faire maintenant",
        signs: ["Cacher une chose précise", "Le mobile : échapper aux retombées", "Une seule fissure dans la confiance", "S'entête si on l'acculait"],
        handle: ["Rendez l'aveu de l'erreur sans danger", "Traitez la peur qui alimente le mensonge", "Intervenez avant qu'un second mensonge soit nécessaire", "Ne punissez pas l'honnêteté que vous réclamez"],
      },
      web: {
        name: "La toile", icon: "\uD83D\uDD78\uFE0F", color: "#b45309",
        summary: "Les mensonges se multiplient pour se soutenir les uns les autres. Chaque nouveau mensonge renchérit la vérité, et le récit finit par diriger la personne.",
        signsTitle: "À quoi cela ressemble", handleTitle: "Que faire maintenant",
        signs: ["Des mensonges qui étayent des mensonges", "Permanents, pour rester cohérent", "Confiance sérieusement entamée", "Ajoute un mensonge dès qu'on l'interroge"],
        handle: ["Offrez une sortie claire et sans drame vers la vérité", "Réduisez la sanction associée à l'aveu", "Créez de la sécurité plutôt que de jouer au détective", "Attendez-vous à ce que cela empire avant de s'arranger"],
      },
      culture: {
        name: "La culture du mensonge", icon: "\uD83C\uDFAD", color: "#b91c1c",
        summary: "La malhonnêteté est devenue normale — systémique, attendue, voire récompensée. Le problème, c'est l'environnement, pas une personne.",
        signsTitle: "À quoi cela ressemble", handleTitle: "Que faire maintenant",
        signs: ["Mentir est la norme", "L'honnêteté passe pour de la naïveté", "La confiance a pour ainsi dire disparu", "Toute une équipe ou tout un système est impliqué"],
        handle: ["Changez ce qui est récompensé et ce qui est puni", "Protégez et célébrez publiquement l'honnêteté", "Incarnez-la sans relâche depuis le sommet", "Réduisez les pressions qui rendent le mensonge payant"],
      },
    },
    questions: [
      { q: "Les mensonges que vous observez sont…", options: [
        { text: "Petits et destinés à huiler les rapports", cat: "white" },
        { text: "Destinés à cacher une erreur précise", cat: "cover" },
        { text: "En train de se multiplier pour s'étayer", cat: "web" },
        { text: "Partout — c'est simplement ainsi que ça marche ici", cat: "culture" },
      ]},
      { q: "Le mobile semble être…", options: [
        { text: "Ménager les sentiments", cat: "white" },
        { text: "Échapper aux conséquences", cat: "cover" },
        { text: "Protéger des mensonges antérieurs", cat: "web" },
        { text: "Progresser dans un système malhonnête", cat: "culture" },
      ]},
      { q: "Le prix de la vérité, aujourd'hui, c'est…", options: [
        { text: "À peu près rien", cat: "white" },
        { text: "Un peu de gêne", cat: "cover" },
        { text: "Défaire tout un récit", cat: "web" },
        { text: "Votre place dans le groupe", cat: "culture" },
      ]},
      { q: "À quelle fréquence cela arrive-t-il ?", options: [
        { text: "Occasionnellement et sans gravité", cat: "white" },
        { text: "Quand ils sont acculés", cat: "cover" },
        { text: "En permanence, pour rester cohérents", cat: "web" },
        { text: "C'est la norme, pas l'exception", cat: "culture" },
      ]},
      { q: "Si on les interroge, ils…", options: [
        { text: "L'admettent en riant", cat: "white" },
        { text: "S'entêtent pour sauver la face", cat: "cover" },
        { text: "Ajoutent un mensonge de plus", cat: "web" },
        { text: "Font comme si l'honnêteté était naïve", cat: "culture" },
      ]},
      { q: "L'effet sur la confiance est…", options: [
        { text: "Négligeable", cat: "white" },
        { text: "Une petite fissure", cat: "cover" },
        { text: "Sérieusement entamé", cat: "web" },
        { text: "La confiance a pour ainsi dire disparu", cat: "culture" },
      ]},
      { q: "Qui est impliqué ?", options: [
        { text: "Juste une petite entorse bienveillante", cat: "white" },
        { text: "Une personne qui cache une chose", cat: "cover" },
        { text: "Une personne empêtrée dans de nombreux mensonges", cat: "web" },
        { text: "Toute une équipe ou tout un système", cat: "culture" },
      ]},
      { q: "Le chemin honnête exige désormais…", options: [
        { text: "Rien — tout va bien", cat: "white" },
        { text: "Un aveu rapide et sans grand enjeu", cat: "cover" },
        { text: "De démêler plusieurs mensonges à la fois", cat: "web" },
        { text: "De changer tout l'environnement", cat: "culture" },
      ]},
    ],
  },

  handle: {
    kicker: "Guide de terrain",
    heading: "Comment se rapprocher de la vérité",
    sub: "On n'« attrape » pas les menteurs en les fixant davantage. On se rapproche de la vérité en écoutant mieux.",
    nav: "La vérité",
    cta: "Lire le guide de la recherche de vérité →",
    cards: [
      { icon: "✅", title: "À faire", tone: "do", items: [
        "Écoutez le récit, pas les tics", "Confrontez les versions aux faits connus", "Posez des questions ouvertes et laissez parler", "Considérez le mobile et le contexte", "Offrez à l'honnêteté un endroit sûr où atterrir",
      ]},
      { icon: "⛔", title: "À éviter", tone: "dont", items: [
        "Prendre le regard ou l'agitation pour une preuve", "Se fier à son « détecteur de mensonge » intérieur", "Accuser avant d'avoir compris", "Punir le messager", "Prendre la nervosité pour de la culpabilité",
      ]},
      { icon: "🤝", title: "L'entretien favorable à la vérité", tone: "", items: [
        "Ouvrez calmement, sans verdict", "Demandez-leur de raconter avec leurs mots", "Revenez sur les trous et les contradictions", "Rassurez : l'honnêteté est sans danger", "Pesez l'ensemble du tableau, pas un seul instant",
      ]},
    ],
  },

  faq: [
    { q: "Il n'existe donc aucun moyen fiable de repérer un menteur ?", a: "Aucun « signe » isolé ne fonctionne. La meilleure approche combine le contenu verbal, la cohérence avec les faits et le mobile dans la durée — pas le folklore du langage corporel." },
    { q: "Pourquoi ces mythes persistent-ils ?", a: "Ils sont intuitifs et répétés sans fin au cinéma et à la télévision. Mais la recherche montre invariablement que les gens — professionnels compris — dépassent à peine le hasard en s'y fiant." },
    { q: "Les polygraphes sont-ils inutiles ?", a: "Ils mesurent l'activation physiologique, pas le mensonge. Leur taux d'erreur est important et ils ne sont pas recevables dans de nombreux systèmes judiciaires : on est loin des appareils infaillibles de la fiction." },
    { q: "Un peu de mensonge, n'est-ce pas normal ?", a: "Si — les petits mensonges sociaux huilent le quotidien. Le souci, c'est l'escalade : quand les mensonges s'accumulent, ou quand une culture rend l'honnêteté dangereuse." },
    { q: "Comment faire pour qu'on ne me mente plus ?", a: "Rendez la vérité sûre. Quand l'honnêteté n'est pas punie et que les erreurs peuvent s'avouer, on a bien moins de raisons de tromper." },
    { q: "Puis-je m'en servir pour prouver que quelqu'un a menti ?", a: "Non. C'est un outil éducatif sur le fonctionnement de la tromperie, pas une méthode pour accuser ni « prouver » quoi que ce soit au sujet d'une personne réelle." },
  ],

  disc: {
    kicker: "Les quatre couleurs",
    heading: "Le mensonge et les quatre couleurs",
    sub: "Chaque couleur DISC arrange la vérité à sa manière. Connaissez le signe — et le vôtre.",
    nav: "Couleurs",
    labels: { relate: "Comment cette couleur ment", reflect: "Si c'est vous — autocontrôle", treat: "Comment obtenir la vérité" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Découvrir l'atelier des couleurs DISC →",
    colors: {
      red: {
        relate: "Les Rouges mentent en passant en force — grosse exagération et « faites-moi confiance » pour gagner et passer à la suite.",
        reflect: "Vérifiez si votre assurance ne court pas plus vite que les faits.",
        treat: "Demandez des précisions et des preuves ; ne vous laissez pas écraser par la seule certitude.",
      },
      yellow: {
        relate: "Les Jaunes exagèrent et enjolivent pour bien paraître et garder le récit palpitant.",
        reflect: "Remarquez quand une meilleure histoire remplace discrètement la vraie.",
        treat: "Savourez le récit, puis vérifiez doucement les détails face à la réalité.",
      },
      green: {
        relate: "Les Verts font des mensonges de paix — dire oui pour éviter un conflit qu'ils n'acceptent pas vraiment.",
        reflect: "Demandez-vous si votre « oui » est sincère ou s'il esquive juste un moment difficile.",
        treat: "Rendez le désaccord sécurisant pour que leur vraie réponse puisse émerger.",
      },
      blue: {
        relate: "Les Bleus mentent rarement franchement, mais peuvent induire en erreur par omission ou se retrancher derrière des détails techniques.",
        reflect: "Vérifiez si une formulation très précise ne masque pas la vérité complète.",
        treat: "Posez des questions complètes et précises — ils répondent exactement à ce qu'on leur demande.",
      },
    },
  },
};

window.BOOK_FR = BOOK_FR;
