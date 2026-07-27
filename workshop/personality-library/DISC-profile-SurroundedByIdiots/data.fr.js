/* =============================================================================
   Atelier DISC — Contenus et données des questionnaires (français)
   Basé sur le modèle DISC popularisé par Thomas Erikson dans « Entouré
   d'idiots » et sur les travaux comportementaux de William Moulton Marston.

   Tout le contenu vit ici afin que la logique d'app.js reste propre et que le
   texte de l'atelier puisse être modifié sans toucher au moteur.
   ========================================================================== */

const DISC_FR = {
  /* ---- Les quatre profils de couleur ------------------------------------- */
  colors: {
    red: {
      key: "red",
      name: "Rouge",
      label: "Dominance",
      archetype: "Le Fonceur",
      hex: "#e63946",
      soft: "rgba(230, 57, 70, 0.12)",
      icon: "🔴",
      tagline: "Direct, décidé et tourné vers les résultats.",
      summary:
        "Les Rouges sont rapides, ambitieux et orientés objectifs. Ils prennent les commandes, décident vite et avancent sans relâche vers le résultat. Le temps est leur monnaie la plus précieuse : ils vont donc droit au but.",
      traits: ["Direct", "Décidé", "Compétitif", "Ambitieux", "Volontaire", "Impatient"],
      communication:
        "Brève et sans détour. Le Rouge affirme plutôt qu'il ne demande, se concentre sur l'essentiel et supporte mal les bavardages ou les longues explications. Donnez-lui d'abord la conclusion.",
      decisions:
        "Rapides et instinctives. Le Rouge est à l'aise avec le risque et préfère une décision imparfaite prise vite à une décision parfaite prise tard. Il tranche, puis passe à la suite.",
      workEnv:
        "Des environnements rapides, avec de l'autonomie, du défi et du contrôle. Il déteste la routine, le micromanagement et tout ce qui le ralentit.",
      strengths: ["Leadership et énergie", "Obtient des résultats sous pression", "Résolution de problèmes efficace", "Relève les défis que d'autres évitent", "Décisif en situation de crise"],
      weaknesses: ["Impatient et abrupt", "Écoute peu", "Peut manquer de tact", "Cherche à tout contrôler", "Écrase les personnalités discrètes"],
      motivators: ["Gagner", "Contrôle et autonomie", "Nouveaux défis", "Résultats visibles", "Pouvoir de décision"],
      stress:
        "Sous pression, un Rouge devient autoritaire, agressif et encore plus impatient — il donne des ordres et passe sur les autres.",
      interact:
        "Soyez bref, soyez clair, puis laissez-le travailler. Commencez par la conclusion, proposez des options nettes et laissez-le choisir, sans jamais lui faire perdre de temps en détails inutiles.",
    },
    yellow: {
      key: "yellow",
      name: "Jaune",
      label: "Influence",
      archetype: "L'Inspirateur",
      hex: "#f0a500",
      soft: "rgba(240, 165, 0, 0.14)",
      icon: "🟡",
      tagline: "Enthousiaste, sociable et persuasif.",
      summary:
        "Les Jaunes sont les optimistes de la pièce. Chaleureux, bavards et créatifs, ils s'épanouissent dans le contact, les idées et l'attention. Leur énergie inspire les autres et ils voient des possibilités partout.",
      traits: ["Enthousiaste", "Optimiste", "Sociable", "Persuasif", "Créatif", "Spontané"],
      communication:
        "Expressive et vivante. Le Jaune raconte des histoires, emploie beaucoup de mots et d'émotion, et adore avoir un public. Il parle plus qu'il n'écoute et privilégie la chaleur à la précision.",
      decisions:
        "Intuitives et guidées par le ressenti. Il décide vite, porté par l'optimisme et l'instinct, mais peine parfois sur le suivi et les détails.",
      workEnv:
        "Un cadre social, collaboratif et souple, avec de la variété, de la reconnaissance et de la bonne humeur. Il dépérit dans les postes isolés, rigides ou très pointilleux.",
      strengths: ["Inspire et motive", "Réseauteur naturel", "Générateur d'idées créatives", "Énergie et optimisme sans limite", "Excellent devant un public"],
      weaknesses: ["Désorganisé", "Peu à l'aise avec les détails", "Coupe la parole", "Promet plus qu'il ne peut tenir", "Perd le fil du temps et de la priorité"],
      motivators: ["Reconnaissance et applaudissements", "Approbation sociale", "Nouvelles expériences", "Plaisir et variété", "Être apprécié"],
      stress:
        "Sous pression, un Jaune devient dispersé, désorganisé et sur la défensive — il parle encore plus tout en perdant le fil.",
      interact:
        "Soyez chaleureux et sociable, laissez-le s'exprimer, offrez une reconnaissance sincère et gardez un ton léger. Aidez-le sur la structure et les détails sans éteindre son énergie.",
    },
    green: {
      key: "green",
      name: "Vert",
      label: "Stabilité",
      archetype: "Le Soutien",
      hex: "#2a9d5c",
      soft: "rgba(42, 157, 92, 0.13)",
      icon: "🟢",
      tagline: "Calme, patient et fiable.",
      summary:
        "Les Verts sont le ciment loyal et stable de toute équipe. Patients, bienveillants et fiables, ils tiennent à l'harmonie et à la sécurité, écoutent plus qu'ils ne parlent et soutiennent discrètement tout le monde autour d'eux.",
      traits: ["Patient", "Fiable", "Soutenant", "Loyal", "Bon auditeur", "Accommodant"],
      communication:
        "Chaleureuse et douce. Le Vert écoute attentivement, parle posément et évite le conflit. Il est conciliant et attentionné, et met rarement son opinion en avant.",
      decisions:
        "Lentes et prudentes. Il recherche le consensus, n'aime pas les changements brusques et privilégie la sécurité. Il lui faut du temps et des garanties avant de s'engager.",
      workEnv:
        "Un cadre stable, harmonieux et prévisible, fait de coopération et de sécurité claire. Il déteste le conflit, les bouleversements et le changement permanent.",
      strengths: ["Fiable et loyal", "Patient et apaisant", "Excellent auditeur", "Vrai esprit d'équipe", "Soutient les autres sous pression"],
      weaknesses: ["Indécis", "Évite le conflit", "Résiste au changement", "Trop accommodant", "Garde ses réserves pour lui"],
      motivators: ["Sécurité et stabilité", "Harmonie", "Reconnaissance sincère", "Aider les autres", "Une routine prévisible"],
      stress:
        "Sous pression, un Vert se referme et s'efface : il acquiesce en surface tout en résistant intérieurement et en accumulant les non-dits.",
      interact:
        "Soyez patient et personnel. Ralentissez le rythme, rassurez, n'exigez pas de décision immédiate et montrez que le changement sera progressif et sans danger.",
    },
    blue: {
      key: "blue",
      name: "Bleu",
      label: "Conformité",
      archetype: "L'Analyste",
      hex: "#2e6fd6",
      soft: "rgba(46, 111, 214, 0.13)",
      icon: "🔵",
      tagline: "Précis, logique et exigeant sur la qualité.",
      summary:
        "Les Bleus sont les penseurs méticuleux. Analytiques, méthodiques et attentifs au détail, ils exigent exactitude et qualité, rassemblent tous les faits avant d'agir et mettent un point d'honneur à faire les choses correctement.",
      traits: ["Précis", "Logique", "Analytique", "Méthodique", "Exigeant sur la qualité", "Réservé"],
      communication:
        "Factuelle et précise. Le Bleu emploie peu de mots mais les bons, se concentre sur les détails et l'exactitude, et pose beaucoup de questions. Il préfère les données écrites aux arguments émotionnels.",
      decisions:
        "Lentes et approfondies. Il analyse tous les faits disponibles, évite le risque et veut une information complète avant de s'engager. La vitesse compte moins que la justesse.",
      workEnv:
        "Un cadre organisé, structuré et calme, avec des attentes claires et de hauts standards de qualité. Il déteste le désordre, le flou et la précipitation.",
      strengths: ["Exact et rigoureux", "Standards de qualité élevés", "Excellent planificateur", "Esprit analytique", "Repère les failles que d'autres ne voient pas"],
      weaknesses: ["Perfectionniste", "Trop critique", "Lent à décider", "Peut paraître froid ou distant", "Paralysie par l'analyse"],
      motivators: ["Exactitude et qualité", "Logique et expertise", "Règles et structure claires", "Avoir raison", "Le temps de bien faire"],
      stress:
        "Sous pression, un Bleu devient critique, se replie et s'enferme dans l'analyse — il réclame toujours plus de données avant d'agir.",
      interact:
        "Soyez préparé et précis. Apportez des faits et du détail, restez exact, laissez-lui le temps de réfléchir et évitez la pression comme les excès d'émotion.",
    },
  },

  /* ---- Comment chaque couleur s'entend avec les autres -------------------- */
  interactions: {
    red: {
      red: "Deux Rouges respectent mutuellement leur énergie mais s'affrontent sur le contrôle. Répartissez clairement les responsabilités et rivalisez sur les résultats, pas sur les ego.",
      yellow: "Le Rouge apprécie l'énergie du Jaune mais s'agace du bavardage. Au Rouge de le laisser parler un moment, au Jaune d'aller à l'essentiel.",
      green: "Le Rouge peut écraser le Vert. Ralentissez, sollicitez son avis et valorisez sa loyauté au lieu de prendre son silence pour un accord.",
      blue: "Le Rouge veut de la vitesse, le Bleu de la certitude. Donnez au Bleu les faits et une échéance ; au Rouge d'accepter que la qualité demande du temps.",
    },
    yellow: {
      red: "Avec un Rouge, le Jaune doit faire court et parler résultats. Le Rouge, lui, doit reconnaître les idées du Jaune avant de les balayer.",
      yellow: "Deux Jaunes s'amusent énormément mais concrétisent peu. Désignez quelqu'un pour noter les décisions et les détails.",
      green: "Un duo chaleureux et facile. Le Jaune dynamise le Vert, le Vert ancre le Jaune. Le Jaune doit veiller à ne pas submerger son partenaire plus discret.",
      blue: "Deux opposés. Le Jaune se sent jugé, le Bleu se sent bousculé. Au Jaune d'apporter des faits, au Bleu de ne pas balayer l'enthousiasme.",
    },
    green: {
      red: "Face à un Rouge, le Vert doit exprimer ses besoins clairement plutôt que de se taire. Le Rouge, lui, doit être patient et rassurant.",
      yellow: "Le Vert apprécie la chaleur du Jaune mais a aussi besoin de calme. Laissez le Jaune mener sur le plan social et demandez-lui de ralentir.",
      green: "Deux Verts créent de l'harmonie mais fuient les décisions difficiles. Quelqu'un doit accepter de mettre les sujets délicats sur la table.",
      blue: "Un duo stable et réfléchi. Tous deux fuient le conflit et le changement : attention à l'immobilisme et aux non-dits.",
    },
    blue: {
      red: "Le Bleu doit donner l'essentiel au Rouge d'abord, puis le détail à la demande. Le Rouge doit éviter de le forcer à trancher dans l'urgence.",
      yellow: "Le Bleu trouve le Jaune imprécis, le Jaune trouve le Bleu froid. Au Bleu d'adoucir le ton, au Jaune d'étayer ses affirmations par des faits.",
      green: "Un duo calme et consciencieux. Tous deux aiment la stabilité. Poussez-vous mutuellement, en douceur, à décider en temps voulu.",
      blue: "Deux Bleus produisent de la haute qualité mais risquent l'analyse sans fin. Fixez un seuil de « suffisamment bon » et une échéance.",
    },
  },

  /* ---- Auto-évaluation : à quel point chaque phrase VOUS correspond ------- */
  /* Échelle de Likert 1–5. Chaque phrase correspond à une couleur. L'ordre    */
  /* est mélangé à l'exécution.                                               */
  selfQuestions: [
    { color: "red", text: "Je vais droit au but et je déteste perdre du temps." },
    { color: "red", text: "J'aime prendre les commandes et décider rapidement." },
    { color: "red", text: "Je suis compétitif et j'ai besoin de gagner." },
    { color: "red", text: "Je me concentre sur les résultats plus que sur les états d'âme." },
    { color: "red", text: "Je suis à l'aise avec le risque quand il sert un objectif." },
    { color: "yellow", text: "J'adore rencontrer de nouvelles personnes et être au centre de l'attention." },
    { color: "yellow", text: "Je suis optimiste et je vois généralement le bon côté des choses." },
    { color: "yellow", text: "Je convaincs les autres par mon enthousiasme et mon énergie." },
    { color: "yellow", text: "J'aime parler et j'engage facilement la conversation avec des inconnus." },
    { color: "yellow", text: "Je préfère la souplesse et la variété à la routine." },
    { color: "green", text: "Je suis patient et je m'emporte rarement." },
    { color: "green", text: "Je tiens à l'harmonie et j'essaie d'éviter les conflits." },
    { color: "green", text: "On me perçoit comme quelqu'un de fiable et de soutenant." },
    { color: "green", text: "Je préfère la stabilité et je n'aime pas les changements soudains." },
    { color: "green", text: "J'écoute attentivement et je fais souvent passer les besoins des autres avant les miens." },
    { color: "blue", text: "Je suis très attentif aux détails et à l'exactitude." },
    { color: "blue", text: "J'aime analyser tous les faits avant de décider." },
    { color: "blue", text: "Je préfère suivre des méthodes éprouvées et des règles claires." },
    { color: "blue", text: "J'ai des exigences élevées quant à la qualité de mon travail." },
    { color: "blue", text: "Je préfère travailler lentement et à fond plutôt que vite et mal." },
  ],

  /* ---- Observer quelqu'un d'autre : choisir l'option qui lui ressemble ---- */
  /* Chaque option correspond à une couleur. Le graphique se met à jour       */
  /* après chaque réponse.                                                    */
  othersQuestions: [
    {
      q: "Comment cette personne communique-t-elle habituellement ?",
      options: [
        { color: "red", text: "De façon directe et concise, centrée sur l'essentiel" },
        { color: "yellow", text: "Avec enthousiasme et expressivité, pleine d'anecdotes" },
        { color: "green", text: "Calmement et chaleureusement, en écoutant plus qu'en parlant" },
        { color: "blue", text: "Avec précision et rigueur, centrée sur les détails" },
      ],
    },
    {
      q: "Comment prend-elle ses décisions ?",
      options: [
        { color: "red", text: "Rapidement et sans hésiter" },
        { color: "yellow", text: "À l'instinct et avec optimisme" },
        { color: "green", text: "Lentement, en cherchant l'accord des autres" },
        { color: "blue", text: "Avec prudence, après avoir analysé les faits" },
      ],
    },
    {
      q: "En réunion, elle a surtout tendance à…",
      options: [
        { color: "red", text: "Prendre le contrôle et pousser vers une conclusion" },
        { color: "yellow", text: "Beaucoup parler et mettre de l'énergie dans la salle" },
        { color: "green", text: "Soutenir les autres et préserver la bonne entente" },
        { color: "blue", text: "Poser des questions pointues et relever les failles" },
      ],
    },
    {
      q: "Son espace de travail est plutôt…",
      options: [
        { color: "red", text: "Fonctionnel — tout ce qui sert le résultat" },
        { color: "yellow", text: "Encombré d'objets personnels et de souvenirs" },
        { color: "green", text: "Confortable et accueillant" },
        { color: "blue", text: "Net, rangé et méthodique" },
      ],
    },
    {
      q: "Face à un problème, elle…",
      options: [
        { color: "red", text: "L'attaque de front et agit vite" },
        { color: "yellow", text: "Lance des idées créatives à voix haute" },
        { color: "green", text: "Cherche une solution acceptable pour tout le monde" },
        { color: "blue", text: "Se documente à fond avant d'agir" },
      ],
    },
    {
      q: "Sous pression, elle devient…",
      options: [
        { color: "red", text: "Exigeante et autoritaire" },
        { color: "yellow", text: "Dispersée et désorganisée" },
        { color: "green", text: "Silencieuse et en retrait" },
        { color: "blue", text: "Critique et excessivement prudente" },
      ],
    },
    {
      q: "Qu'est-ce qui semble la motiver le plus ?",
      options: [
        { color: "red", text: "Gagner et obtenir des résultats" },
        { color: "yellow", text: "La reconnaissance et l'approbation des autres" },
        { color: "green", text: "La sécurité et le fait d'aider les autres" },
        { color: "blue", text: "Avoir raison et livrer un travail de qualité" },
      ],
    },
    {
      q: "Comment gère-t-elle le changement ?",
      options: [
        { color: "red", text: "Elle l'accueille s'il fait avancer les choses" },
        { color: "yellow", text: "Elle s'enthousiasme pour les possibilités" },
        { color: "green", text: "Elle y résiste et préfère la stabilité" },
        { color: "blue", text: "Elle veut d'abord tout comprendre en détail" },
      ],
    },
    {
      q: "Son langage corporel est généralement…",
      options: [
        { color: "red", text: "Ferme, regard direct, gestes rapides" },
        { color: "yellow", text: "Animé, beaucoup de gestes, souriant" },
        { color: "green", text: "Détendu, doux et chaleureux" },
        { color: "blue", text: "Réservé, maîtrisé, peu de gestes" },
      ],
    },
    {
      q: "Quand vous n'êtes pas d'accord avec elle, elle…",
      options: [
        { color: "red", text: "Réplique et campe sur ses positions" },
        { color: "yellow", text: "Essaie de vous séduire pour vous rallier" },
        { color: "green", text: "Évite le conflit et cède" },
        { color: "blue", text: "Répond par des faits et de la logique" },
      ],
    },
    {
      q: "Comment aborde-t-elle les échéances ?",
      options: [
        { color: "red", text: "Elle pousse fort pour finir la première" },
        { color: "yellow", text: "Elle est souvent en retard mais s'en sort par la parole" },
        { color: "green", text: "De façon régulière et fiable" },
        { color: "blue", text: "Elle planifie soigneusement pour les tenir au jour près" },
      ],
    },
    {
      q: "En contexte social, elle…",
      options: [
        { color: "red", text: "Réseaute avec un objectif, puis s'en va" },
        { color: "yellow", text: "Est l'âme de la fête" },
        { color: "green", text: "Préfère les petits groupes familiers" },
        { color: "blue", text: "Observe discrètement, un peu en retrait" },
      ],
    },
    {
      q: "Sa plus grande force est…",
      options: [
        { color: "red", text: "De faire avancer les choses" },
        { color: "yellow", text: "D'inspirer et de motiver les autres" },
        { color: "green", text: "D'être loyale et fiable" },
        { color: "blue", text: "De livrer un travail exact et de grande qualité" },
      ],
    },
    {
      q: "Sa faiblesse la plus visible est…",
      options: [
        { color: "red", text: "Son impatience et sa brusquerie" },
        { color: "yellow", text: "Sa désorganisation et son manque de concentration" },
        { color: "green", text: "Son indécision et sa fuite du conflit" },
        { color: "blue", text: "Son excès de critique et sa lenteur" },
      ],
    },
    {
      q: "Quand elle donne un retour, elle est…",
      options: [
        { color: "red", text: "Franche et sans détour" },
        { color: "yellow", text: "Encourageante et positive" },
        { color: "green", text: "Douce et attentionnée" },
        { color: "blue", text: "Détaillée et précise" },
      ],
    },
    {
      q: "Comment préfère-t-elle recevoir l'information ?",
      options: [
        { color: "red", text: "L'essentiel seulement — court et net" },
        { color: "yellow", text: "Avec de l'énergie et une touche personnelle" },
        { color: "green", text: "De façon amicale et sans précipitation" },
        { color: "blue", text: "En détail, chiffres à l'appui" },
      ],
    },
  ],

  /* ---- Identification rapide : 4 choix éclair ---------------------------- */
  quickQuestions: [
    {
      q: "Choisissez le mot qui convient le mieux :",
      options: [
        { color: "red", text: "Déterminé" },
        { color: "yellow", text: "Expansif" },
        { color: "green", text: "Patient" },
        { color: "blue", text: "Précis" },
      ],
    },
    {
      q: "Au fond, le rythme est :",
      options: [
        { color: "red", text: "Rapide et énergique" },
        { color: "yellow", text: "Rapide et chaleureux" },
        { color: "green", text: "Lent et régulier" },
        { color: "blue", text: "Lent et minutieux" },
      ],
    },
    {
      q: "L'attention se porte surtout sur :",
      options: [
        { color: "red", text: "Les résultats" },
        { color: "yellow", text: "Les gens et le plaisir" },
        { color: "green", text: "L'harmonie" },
        { color: "blue", text: "L'exactitude" },
      ],
    },
    {
      q: "Sous stress, cette personne devient :",
      options: [
        { color: "red", text: "Autoritaire" },
        { color: "yellow", text: "Dispersée" },
        { color: "green", text: "En retrait" },
        { color: "blue", text: "Critique" },
      ],
    },
  ],

  /* ---- À faire / à éviter avec chaque couleur ---------------------------- */
  tips: {
    red: {
      do: ["Être bref et aller à l'essentiel", "Parler résultats et objectifs", "Proposer des options et le laisser décider", "Être assuré et direct"],
      dont: ["Digresser ou sur-expliquer", "Lui faire perdre son temps", "Devenir trop personnel ou émotif", "Chercher à le contrôler"],
    },
    yellow: {
      do: ["Être chaleureux et sociable", "Le laisser parler et partager ses idées", "Reconnaître et féliciter", "Garder un ton léger et positif"],
      dont: ["L'ensevelir sous les détails", "Être froid ou dédaigneux", "Ignorer ce qu'il ressent", "L'enfermer dans des règles rigides"],
    },
    green: {
      do: ["Être patient et personnel", "Rassurer et sécuriser", "Introduire le changement progressivement", "Montrer une gratitude sincère"],
      dont: ["Le presser ou le bousculer", "Imposer un changement brutal", "Créer du conflit", "Prendre son silence pour un plein accord"],
    },
    blue: {
      do: ["Être préparé et exact", "Fournir les faits et le détail", "Lui laisser le temps de réfléchir", "Respecter ses exigences"],
      dont: ["Rester vague ou approximatif", "Précipiter sa décision", "S'emporter émotionnellement", "Balayer ses questions"],
    },
  },

  /* ---- FAQ ---------------------------------------------------------------- */
  faq: [
    {
      q: "Qu'est-ce que le modèle DISC ?",
      a: "Le DISC est un modèle comportemental qui décrit quatre grands styles de comportement et de communication : Dominance (Rouge), Influence (Jaune), Stabilité (Vert) et Conformité (Bleu). Il s'appuie sur les travaux du psychologue William Moulton Marston et a été popularisé auprès du grand public par Thomas Erikson dans <em>Entouré d'idiots</em>.",
    },
    {
      q: "Puis-je appartenir à plusieurs couleurs ?",
      a: "Presque tout le monde est un mélange. Environ 80 % des gens combinent deux couleurs, et beaucoup en associent trois. Les profils d'une seule couleur pure sont rares. Votre résultat montre l'équilibre entre les quatre, afin de faire apparaître votre style dominant et votre style secondaire.",
    },
    {
      q: "Une couleur est-elle meilleure que les autres ?",
      a: "Non. Chaque couleur possède de vraies forces et de vrais angles morts. L'objectif n'est pas de devenir une « meilleure » couleur, mais de comprendre votre propre style et de savoir l'adapter pour mieux communiquer avec les autres.",
    },
    {
      q: "Est-ce un test de personnalité scientifique ?",
      a: "Cet atelier est un outil pédagogique et introspectif, inspiré du langage DISC popularisé par <em>Entouré d'idiots</em>. Il vise à susciter des prises de conscience et de meilleures conversations, non à servir d'évaluation clinique ou de recrutement.",
    },
    {
      q: "Le questionnaire « observer quelqu'un d'autre » est-il fiable ?",
      a: "Il reflète votre perception du comportement d'une autre personne, ce qui constitue un bon point de départ. Les gens sont complexes et se comportent différemment selon les contextes : voyez donc le résultat comme une amorce de discussion, pas comme un verdict.",
    },
    {
      q: "Pourquoi mon comportement diffère-t-il au travail et à la maison ?",
      a: "Nous adaptons souvent notre comportement à la situation. Vous pouvez mener avec une couleur sous pression au bureau et avec une autre une fois détendu à la maison. Cette souplesse est normale et saine. C'est toute la différence entre votre style <em>naturel</em> et votre style <em>adapté</em>.",
    },
  ],

  /* ---- Observation, PASSAGE 2 : le style adapté / sous pression ----------- */
  /* Un second passage rapide. Comparé au passage 1, il révèle comment une     */
  /* personne glisse de son style naturel vers son style adapté (travail /     */
  /* stress).                                                                  */
  othersAdaptedQuestions: [
    {
      q: "Face à une échéance serrée, cette personne a tendance à…",
      options: [
        { color: "red", text: "Prendre les commandes et pousser tout le monde" },
        { color: "yellow", text: "Galvaniser le groupe et entretenir la bonne humeur" },
        { color: "green", text: "Maintenir le cap discrètement" },
        { color: "blue", text: "Se replier sur le détail et tout revérifier" },
      ],
    },
    {
      q: "Quand un conflit éclate, elle…",
      options: [
        { color: "red", text: "L'affronte de face" },
        { color: "yellow", text: "Tente de désamorcer par le charme" },
        { color: "green", text: "Se retire et évite de prendre parti" },
        { color: "blue", text: "Prend du recul et analyse qui a raison" },
      ],
    },
    {
      q: "Sous stress, son ton devient…",
      options: [
        { color: "red", text: "Plus tranchant et plus impératif" },
        { color: "yellow", text: "Plus fort et plus décousu" },
        { color: "green", text: "Plus bas et plus réservé" },
        { color: "blue", text: "Plus froid et plus critique" },
      ],
    },
    {
      q: "Quand la pression monte, elle se concentre sur…",
      options: [
        { color: "red", text: "Gagner et finir la première" },
        { color: "yellow", text: "Maintenir la motivation de chacun" },
        { color: "green", text: "Garder l'équipe soudée" },
        { color: "blue", text: "Rendre chaque détail parfaitement juste" },
      ],
    },
    {
      q: "Si les plans changent soudainement, elle…",
      options: [
        { color: "red", text: "Impose immédiatement une nouvelle direction" },
        { color: "yellow", text: "Improvise et garde le moral" },
        { color: "green", text: "Se sent déstabilisée et a besoin d'être rassurée" },
        { color: "blue", text: "Veut du temps pour réévaluer les faits" },
      ],
    },
    {
      q: "Quand elle est poussée à bout, on dit d'elle qu'elle peut être…",
      options: [
        { color: "red", text: "Écrasante" },
        { color: "yellow", text: "Éparpillée" },
        { color: "green", text: "Trop passive" },
        { color: "blue", text: "Tatillonne" },
      ],
    },
  ],

  /* ---- Auto-test à choix forcé (ipsatif) --------------------------------- */
  /* Chaque groupe propose un mot par couleur. La personne choisit celui qui   */
  /* lui ressemble LE PLUS et celui qui lui ressemble LE MOINS. C'est la       */
  /* méthode DISC classique, que certains puristes préfèrent — proposée ici    */
  /* comme alternative au test de Likert afin de comparer les deux.            */
  forcedChoiceGroups: [
    { red: "Direct", yellow: "Enthousiaste", green: "Patient", blue: "Précis" },
    { red: "Décidé", yellow: "Sociable", green: "Loyal", blue: "Analytique" },
    { red: "Compétitif", yellow: "Optimiste", green: "Calme", blue: "Prudent" },
    { red: "Audacieux", yellow: "Bavard", green: "Soutenant", blue: "Méthodique" },
    { red: "Orienté résultats", yellow: "Persuasif", green: "Fiable", blue: "Minutieux" },
    { red: "Autoritaire", yellow: "Charmeur", green: "Accommodant", blue: "Réservé" },
    { red: "Impatient", yellow: "Spontané", green: "Constant", blue: "Rigoureux" },
    { red: "Exigeant", yellow: "Joueur", green: "Conciliant", blue: "Circonspect" },
    { red: "Ambitieux", yellow: "Inspirant", green: "Sûr", blue: "Logique" },
    { red: "Énergique", yellow: "Expressif", green: "Doux", blue: "Exact" },
  ],

  /* ---- Fiches de communication : « Comment communiquer avec un… » -------- */
  /* Informations essentielles et partageables pour chaque couleur. Complète   */
  /* colors[] avec les champs ci-dessous.                                      */
  comms: {
    red: {
      essence: "Soyez rapide, soyez bref, puis laissez-le agir. Le Rouge veut le fond, pas le préambule.",
      intro:
        "Un Rouge est déterminé, direct et impatient. Il mesure une conversation à ses résultats et déteste qu'on lui fasse perdre son temps. Respectez son rythme et son besoin de contrôle, et il vous respectera.",
      rules: [
        "Commencez par la conclusion, puis les raisons — jamais l'inverse.",
        "Proposez des options claires et laissez-le trancher.",
        "Faites court : des titres, pas des dissertations.",
      ],
      goodPhrases: ["\"En résumé : …\"", "\"Voici deux options — à vous de choisir.\"", "\"Cela nous fait gagner du temps sur le résultat.\""],
      badPhrases: ["\"Laissez-moi d'abord vous raconter tout le contexte…\"", "\"Je ne sais pas trop, qu'est-ce qu'on devrait…\"", "\"On peut parler de ce que je ressens là-dessus ?\""],
      email: "Un écran maximum. L'objet annonce la demande. Des puces, la décision attendue, l'échéance. Pas de bavardage.",
      conflict: "Restez calme et factuel, tenez tête directement et ne prenez pas sa brusquerie pour vous. Le Rouge respecte ceux qui ne se dérobent pas.",
      motivate: "Offrez-lui un défi, de l'autonomie et une victoire claire à décrocher. Dégagez les obstacles de sa route.",
    },
    yellow: {
      essence: "Soyez chaleureux, soyez sociable, laissez-le briller. Le Jaune se relie par l'énergie et les gens.",
      intro:
        "Un Jaune est enthousiaste, bavard et avide de lien et de reconnaissance. Il pense à voix haute et décide au feeling. Accordez-vous à son énergie et il vous embarquera avec lui.",
      rules: [
        "Ouvrez avec chaleur et un peu de conversation informelle — la relation passe d'abord.",
        "Laissez-le parler, puis aidez-le en douceur à fixer les détails et les prochaines étapes.",
        "Reconnaissez ses idées et ses apports à voix haute.",
      ],
      goodPhrases: ["\"Excellente idée — racontez-m'en plus !\"", "\"Vous seriez formidable là-dessus.\"", "\"Faisons-en quelque chose de sympa.\""],
      badPhrases: ["\"Tenons-nous-en aux faits, s'il vous plaît.\"", "\"Ça ne marchera jamais.\"", "\"Voici un cahier des charges de 12 pages à lire.\""],
      email: "Gardez un ton positif et personnel. Une entrée amicale, de la couleur et de l'enthousiasme, puis un appel à l'action clair mais léger. Mettez les détails en puces pour qu'ils ne se perdent pas.",
      conflict: "Abordez les problèmes avec tact et en face à face, jamais par un recadrage écrit et froid. Rassurez-le sur la relation pendant que vous réglez le fond.",
      motivate: "Offrez-lui de la reconnaissance, un public, de la variété et du contact humain. Célébrez ses victoires publiquement.",
    },
    green: {
      essence: "Soyez patient, personnel et rassurant. Le Vert s'ouvre quand il se sent en sécurité.",
      intro:
        "Un Vert est calme, loyal et attache plus d'importance qu'à tout à l'harmonie et à la sécurité. Il déteste la pression, les changements brusques et les conflits. Ralentissez, soyez sincère et laissez-lui le temps de se sentir à l'aise.",
      rules: [
        "Ralentissez le rythme et restez personnel et sincère.",
        "Introduisez le changement progressivement, en expliquant le « pourquoi » et le filet de sécurité.",
        "Demandez-lui son avis explicitement — il le met rarement en avant de lui-même.",
      ],
      goodPhrases: ["\"Prenez votre temps, rien ne presse.\"", "\"Qu'en pensez-vous, comment le ressentez-vous ?\"", "\"On avancera ensemble, étape par étape.\""],
      badPhrases: ["\"Il me faut cette décision tout de suite.\"", "\"Tout change dès lundi.\"", "\"Débrouillez-vous avec ça.\""],
      email: "Chaleureux et amical, jamais sec. Expliquez le contexte, rassurez sur les conséquences et prévenez largement à l'avance. Évitez les demandes abruptes.",
      conflict: "Ne l'acculez jamais. Abordez les sujets avec douceur, en privé, et rassurez-le sur la solidité de la relation. Guettez les désaccords silencieux.",
      motivate: "Offrez-lui de la sécurité, de la reconnaissance, une routine stable et l'occasion d'aider les autres. Saluez sincèrement sa fiabilité.",
    },
    blue: {
      essence: "Soyez préparé, exact et logique. Le Bleu fait confiance aux faits, pas à l'enthousiasme.",
      intro:
        "Un Bleu est précis, analytique et exigeant sur la qualité. Il veut des faits, du détail et du temps pour réfléchir, et se méfie du battage et de la pression. Venez préparé et soignez vos détails.",
      rules: [
        "Apportez des faits, des données et du détail — et rendez-les parfaitement exacts.",
        "Laissez-lui le temps et l'espace d'analyser ; ne précipitez pas la décision.",
        "Peu d'émotion, beaucoup de logique.",
      ],
      goodPhrases: ["\"Voici les données et les sources.\"", "\"Prenez le temps qu'il vous faut pour l'examiner.\"", "\"Faisons les choses parfaitement.\""],
      badPhrases: ["\"Faites-moi confiance là-dessus.\"", "\"Il faut décider dans les cinq minutes.\"", "\"Ne vous souciez pas des détails.\""],
      email: "Structuré, exact et complet. Donnez la vue d'ensemble, les données à l'appui et des références claires. Aucune exagération — il repérera la moindre erreur.",
      conflict: "Restez calme, factuel et détaché. Argumentez avec des preuves, pas avec des émotions, et laissez-lui le temps de réfléchir avant de répondre.",
      motivate: "Donnez-lui des standards clairs, un travail de qualité, une expertise à maîtriser et le temps de bien faire. Respectez son besoin d'avoir raison.",
    },
  },

  /* ---- Fiches de communication pour les profils à deux couleurs ---------- */
  /* Les clés sont des paires de couleurs classées par ordre alphabétique.     */
  pairComms: {
    "blue-red": {
      title: "Rouge · Bleu",
      intro:
        "Un profil Rouge-Bleu est un perfectionniste sous tension : il veut des résultats vite <em>et</em> parfaitement exécutés. Centré sur la tâche et peu porté sur la chaleur humaine, il peut se montrer abrupt, exigeant et difficile à satisfaire.",
      tension: "Le Rouge dit « on livre maintenant », le Bleu répond « pas tant que ce n'est pas parfait ». Intérieurement, il exige vitesse et qualité à la fois, ce qui le rend critique envers quiconque n'offre ni l'une ni l'autre.",
      howTo: [
        "Arrivez avec l'essentiel et le détail à l'appui, prêts tous les deux.",
        "Soyez efficace mais exact — la vitesse bâclée perd le Bleu, le détail sans fin perd le Rouge.",
        "Attendez-vous à de la franchise et à de hautes exigences ; ne prenez pas la critique pour vous.",
        "Laissez-lui le contrôle et soignez vos faits.",
      ],
      watch: "Très peu de patience pour le flou, les états d'âme ou les erreurs. Restez concis, juste et direct.",
    },
    "red-yellow": {
      title: "Rouge · Jaune",
      intro:
        "Un profil Rouge-Jaune est un moteur rapide, puissant et charismatique : audacieux et affamé de résultats, mais aussi extraverti et persuasif. Il mène depuis l'avant et aime gagner avec panache.",
      tension: "Le Rouge veut des résultats, le Jaune veut des applaudissements — il court donc après les victoires spectaculaires et peut écraser les plus discrets au passage.",
      howTo: [
        "Soyez énergique et allez à l'essentiel — accordez-vous à son rythme et à son enthousiasme.",
        "Offrez-lui à la fois un défi et de la reconnaissance.",
        "Laissez-le mener et briller, mais tenez-le au suivi et aux détails.",
        "Ne soyez pas timide — il respecte l'assurance.",
      ],
      watch: "Impatient et dominant. Il peut vous couper la parole et sauter le détail — verrouillez les points précis avant qu'il ne passe à autre chose.",
    },
    "green-red": {
      title: "Rouge · Vert",
      intro:
        "Un profil Rouge-Vert est peu courant : un fonceur doublé d'une fibre humaine sincère. Il sait pousser pour obtenir des résultats tout en veillant réellement sur son équipe, alternant fermeté et soutien.",
      tension: "Le Rouge veut foncer, le Vert veut de l'harmonie et de la stabilité — il peut donc sembler inconstant, tranchant à un moment, conciliant l'instant d'après.",
      howTo: [
        "Repérez le mode dans lequel il se trouve : moteur de résultats ou soutien.",
        "Soyez direct mais humain — respectez à la fois l'objectif et la relation.",
        "Laissez-lui du temps sur les décisions humaines, de la vitesse sur les décisions techniques.",
        "Soyez sincère ; il n'aime pas la politique pure.",
      ],
      watch: "Ses deux faces peuvent entrer en conflit intérieur. Ne confondez pas ses moments de soutien avec un manque d'ambition.",
    },
    "blue-yellow": {
      title: "Jaune · Bleu",
      intro:
        "Un profil Jaune-Bleu est un assemblage d'opposés plus rare : créatif et sociable, mais aussi précis et analytique. Il peut imaginer de grandes idées puis en disséquer chaque détail.",
      tension: "Le Jaune veut enflammer et improviser, le Bleu veut des faits et de la structure — il oscille donc entre exaltation et exigence, parfois dans la même phrase.",
      howTo: [
        "Apportez à la fois de la chaleur et des preuves — il répond à l'enthousiasme étayé par des faits.",
        "Laissez de la place aux idées, puis aidez à les structurer.",
        "Ne soyez ni trop insistant ni trop vague ; il résistera aux deux.",
        "Saluez sa créativité autant que sa rigueur.",
      ],
      watch: "Il peut basculer très vite de l'optimisme à la critique. Donnez-lui des faits pour qu'il ose son enthousiasme.",
    },
    "green-yellow": {
      title: "Jaune · Vert",
      intro:
        "Un profil Jaune-Vert est la combinaison la plus chaleureuse : sociable, bienveillante, soutenante et facile à apprécier. Elle place les gens et les relations au premier plan et entretient une ambiance positive.",
      tension: "Les deux couleurs fuient le conflit et les décisions difficiles : cette personne peut donc trop promettre, éviter les messages délicats ou peiner à dire non.",
      howTo: [
        "Soyez amical, chaleureux et sans précipitation — la relation compte plus que tout.",
        "Apportez des garanties et une gratitude sincère.",
        "Aidez sur la structure, les échéances et les décisions difficiles.",
        "Ne soyez jamais dur ni froid — cela le touche profondément.",
      ],
      watch: "Il évite le conflit et peut acquiescer juste pour préserver la paix. Vérifiez qu'un « oui » est un vrai oui.",
    },
    "blue-green": {
      title: "Vert · Bleu",
      intro:
        "Un profil Vert-Bleu est calme, consciencieux et totalement fiable : discret, précis et constant. Il tient à la stabilité, à la qualité et au travail bien fait, et recherche rarement la lumière.",
      tension: "Les deux couleurs sont prudentes et réfractaires au changement : cette personne peut donc être lente à décider et résister à tout ce qui est soudain ou risqué.",
      howTo: [
        "Soyez patient, préparé et précis, tout à la fois.",
        "Donnez-lui du détail, des garanties et du temps — ne le pressez jamais.",
        "Introduisez le changement lentement, avec des faits et un plan clair.",
        "Respectez ses exigences et son besoin de sécurité.",
      ],
      watch: "Lent, discret et prudent. Le silence peut cacher un désaccord — invitez-le à donner son avis franchement.",
    },
  },
};

window.DISC_FR = DISC_FR;
