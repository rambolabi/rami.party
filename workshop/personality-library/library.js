/* =============================================================================
   The People Library — hub content (EN / NL / FR)

   Everything the landing page renders lives here so the three languages stay
   in lockstep. Structural values (href, icon, colour, group) live once, at the
   top; only the prose is per-language.
   ========================================================================== */
window.LIB = (function () {
  "use strict";

  /* ---- Structure (never translated) ------------------------------------- */
  const CARDS = [
    { id: "disc",         group: "know",      icon: "🎨",  c: "#2e6fd6", href: "DISC-profile-SurroundedByIdiots/index.html", featured: true },
    { id: "bigfive",      group: "know",      icon: "🧬",  c: "#2563eb", href: "BigFive-OCEAN/index.html" },
    { id: "mbti",         group: "know",      icon: "🔠",  c: "#7c3aed", href: "MBTI-16Types/index.html" },
    { id: "enneagram",    group: "know",      icon: "🔯",  c: "#db2777", href: "Enneagram-NineTypes/index.html" },
    { id: "temperaments", group: "know",      icon: "🌡️", c: "#9333ea", href: "Temperaments-FourHumours/index.html" },
    { id: "eq",           group: "know",      icon: "🫀",  c: "#059669", href: "EmotionalIntelligence-EQ/index.html" },

    { id: "love",         group: "relate",    icon: "💗",  c: "#e11d48", href: "LoveLanguages-FiveLanguages/index.html" },
    { id: "attachment",   group: "relate",    icon: "🔗",  c: "#0d9488", href: "AttachmentStyles-FourStyles/index.html" },
    { id: "conflict",     group: "relate",    icon: "⚔️", c: "#ea580c", href: "ConflictStyles-ThomasKilmann/index.html" },

    { id: "psychopaths",  group: "difficult", icon: "🎭",  c: "#b3123a", href: "Manipulation-SurroundedByPsychopaths/index.html" },
    { id: "narcissists",  group: "difficult", icon: "🪞",  c: "#7c3aed", href: "Narcissism-SurroundedByNarcissists/index.html" },
    { id: "vampires",     group: "difficult", icon: "🧛",  c: "#9d174d", href: "EnergyDrain-SurroundedByVampires/index.html" },
    { id: "liars",        group: "difficult", icon: "🕵️", c: "#0f766e", href: "Deception-SurroundedByLiars/index.html" },
    { id: "bosses",       group: "difficult", icon: "💼",  c: "#b45309", href: "Leadership-SurroundedByBadBosses/index.html" },

    { id: "setbacks",     group: "grow",      icon: "🧗",  c: "#1d4ed8", href: "Resilience-SurroundedBySetbacks/index.html" },
  ];
  const GROUPS = ["know", "relate", "difficult", "grow"];

  /* ---- Prose ------------------------------------------------------------- */
  const T = {
    en: {
      lang_name: "English",
      lang_label: "Language",
      title: "The People Library — Understand yourself and everyone around you",
      desc: "A library of interactive workshops on personality, behaviour, communication and difficult people — DISC, Big Five, MBTI, Enneagram, attachment, love languages, and Thomas Erikson's 'Surrounded by…' series. If you want to know it, there's a workshop for it.",
      skip: "Skip to content",
      brand: "The People Library",
      nav_toggle: "Toggle navigation",

      hero_eyebrow: "A library of interactive workshops",
      hero_title: "Understand yourself —<br />and everyone around you.",
      hero_lead: "Fifteen bite-sized, interactive workshops on personality, behaviour and communication. Take a quiz, get an instant read, and learn <em>how to treat</em> every kind of person. If you want to know it, there's a workshop for it.",
      hero_cta1: "Start with yourself →",
      hero_cta2: "Deal with difficult people",
      stat1: "Workshops", stat2: "Interactive quizzes", stat3: "Sign-ups needed",

      g_know_nav: "Know yourself",
      g_know_kicker: "Know yourself",
      g_know_h2: "Map your own personality",
      g_know_sub: "Start here. These are the great models for understanding how you think, feel and behave — from the ancient to the scientific.",

      g_relate_nav: "Relationships",
      g_relate_kicker: "Relationships &amp; connection",
      g_relate_h2: "Understand how you bond",
      g_relate_sub: "How you love, connect and clash with the people closest to you.",

      g_difficult_nav: "Difficult people",
      g_difficult_kicker: "Difficult people",
      g_difficult_h2: "Read them — and protect yourself",
      g_difficult_sub: "Thomas Erikson's <em>Surrounded by…</em> series, reimagined as interactive workshops. Spot the behaviour, then learn exactly how to handle it.",

      g_grow_nav: "Grow",
      g_grow_kicker: "Grow &amp; bounce back",
      g_grow_h2: "Build your resilience",
      g_grow_sub: "Because knowing people includes knowing how to handle life when it knocks you down.",

      foot_note: "The Erikson workshops are inspired by <em>Surrounded by Idiots, Psychopaths, Narcissists, Bad Bosses, Liars, Vampires</em> and <em>Setbacks</em> by Thomas Erikson — if they resonate, read the books and support the author. The other workshops draw on established models (DISC, the Big Five, MBTI, the Enneagram, attachment theory, the love languages, Thomas–Kilmann and emotional intelligence). All are educational tools for reflection, not clinical diagnosis.",
      foot_meta: "The People Library",

      cards: {
        disc:         { name: "DISC — The Four Colours",   sub: "If you want to know why people communicate so differently — and exactly how to reach each of them.", tag: "Best starting point" },
        bigfive:      { name: "The Big Five (OCEAN)",      sub: "If you want your personality measured the way science actually does it.",                            tag: "Profile · 5 traits" },
        mbti:         { name: "The 16 Types (MBTI-style)", sub: "If you want your four-letter type — with an honest look at what it's really worth.",                  tag: "Quiz · 16 types" },
        enneagram:    { name: "The Enneagram",             sub: "If you want to know the nine core motivations that secretly drive people.",                          tag: "Quiz · 9 types" },
        temperaments: { name: "The Four Temperaments",     sub: "If you want the 2,000-year-old map that started it all — and became DISC.",                          tag: "Quiz · 4 types" },
        eq:           { name: "Emotional Intelligence (EQ)", sub: "If you want to know how well you read and handle emotions — and how to grow it.",                   tag: "Score · skill" },
        love:         { name: "The Five Love Languages",   sub: "If you want to know how you — and the people you love — actually feel loved.",                       tag: "Quiz · 5 languages" },
        attachment:   { name: "Attachment Styles",         sub: "If you want to know why closeness feels the way it does for you.",                                   tag: "Quiz · 4 styles" },
        conflict:     { name: "Conflict Styles",           sub: "If you want to know your instinct when things get tense — and when to switch it.",                    tag: "Quiz · 5 styles" },
        psychopaths:  { name: "Surrounded by Psychopaths", sub: "If you want to know how manipulators operate — and how to protect yourself.",                        tag: "Erikson · red-flag score" },
        narcissists:  { name: "Surrounded by Narcissists", sub: "If you want to know the four faces of narcissism and how to hold your ground.",                      tag: "Erikson · 4 types" },
        vampires:     { name: "Surrounded by Vampires",    sub: "If you want to know who's draining your energy — and how to stop it.",                               tag: "Erikson · 4 types" },
        liars:        { name: "Surrounded by Liars",       sub: "If you want to know how deception really works — most of what you 'know' is wrong.",                  tag: "Erikson · myth/fact" },
        bosses:       { name: "Surrounded by Bad Bosses",  sub: "If you want to know what kind of boss you've got — and how to manage up.",                           tag: "Erikson · 2 quizzes" },
        setbacks:     { name: "Surrounded by Setbacks",    sub: "If you want to know how to bounce back when everything's gone wrong.",                               tag: "Erikson · resilience score" },
      },
    },

    nl: {
      lang_name: "Nederlands",
      lang_label: "Taal",
      title: "De Mensenbibliotheek — Begrijp jezelf en iedereen om je heen",
      desc: "Een bibliotheek met interactieve workshops over persoonlijkheid, gedrag, communicatie en lastige mensen — DISC, Big Five, MBTI, Enneagram, hechting, liefdestalen en de 'Omringd door…'-reeks van Thomas Erikson. Wil je het weten? Er is een workshop voor.",
      skip: "Naar de inhoud",
      brand: "De Mensenbibliotheek",
      nav_toggle: "Navigatie tonen",

      hero_eyebrow: "Een bibliotheek met interactieve workshops",
      hero_title: "Begrijp jezelf —<br />en iedereen om je heen.",
      hero_lead: "Vijftien behapbare, interactieve workshops over persoonlijkheid, gedrag en communicatie. Doe een test, krijg meteen inzicht en leer <em>hoe je omgaat</em> met elk soort mens. Wil je het weten? Er is een workshop voor.",
      hero_cta1: "Begin bij jezelf →",
      hero_cta2: "Omgaan met lastige mensen",
      stat1: "Workshops", stat2: "Interactieve tests", stat3: "Aanmeldingen nodig",

      g_know_nav: "Ken jezelf",
      g_know_kicker: "Ken jezelf",
      g_know_h2: "Breng je eigen persoonlijkheid in kaart",
      g_know_sub: "Begin hier. Dit zijn de grote modellen om te snappen hoe je denkt, voelt en doet — van eeuwenoud tot streng wetenschappelijk.",

      g_relate_nav: "Relaties",
      g_relate_kicker: "Relaties &amp; verbinding",
      g_relate_h2: "Snap hoe je je hecht",
      g_relate_sub: "Hoe je liefhebt, verbindt en botst met de mensen die het dichtst bij je staan.",

      g_difficult_nav: "Lastige mensen",
      g_difficult_kicker: "Lastige mensen",
      g_difficult_h2: "Lees ze — en bescherm jezelf",
      g_difficult_sub: "De <em>Omringd door…</em>-reeks van Thomas Erikson, omgebouwd tot interactieve workshops. Herken het gedrag en leer precies hoe je ermee omgaat.",

      g_grow_nav: "Groeien",
      g_grow_kicker: "Groeien &amp; terugveren",
      g_grow_h2: "Bouw aan je veerkracht",
      g_grow_sub: "Want mensen kennen betekent ook weten hoe je omgaat met het leven als het je onderuithaalt.",

      foot_note: "De Erikson-workshops zijn geïnspireerd op <em>Omringd door idioten, psychopaten, narcisten, slechte bazen, leugenaars, energievreters</em> en <em>tegenslag</em> van Thomas Erikson — als ze je raken: lees de boeken en steun de auteur. De andere workshops leunen op gevestigde modellen (DISC, de Big Five, MBTI, het Enneagram, hechtingstheorie, de liefdestalen, Thomas–Kilmann en emotionele intelligentie). Allemaal educatieve hulpmiddelen om over na te denken, geen klinische diagnose.",
      foot_meta: "De Mensenbibliotheek",

      cards: {
        disc:         { name: "DISC — De vier kleuren",     sub: "Als je wilt weten waarom mensen zo verschillend communiceren — en hoe je ieder van hen bereikt.",     tag: "Beste startpunt" },
        bigfive:      { name: "De Big Five (OCEAN)",        sub: "Als je je persoonlijkheid wilt meten zoals de wetenschap het echt doet.",                            tag: "Profiel · 5 eigenschappen" },
        mbti:         { name: "De 16 types (MBTI-stijl)",   sub: "Als je je vierlettertype wilt — met een eerlijke blik op wat het écht waard is.",                     tag: "Test · 16 types" },
        enneagram:    { name: "Het Enneagram",              sub: "Als je de negen kernmotieven wilt kennen die mensen heimelijk aandrijven.",                          tag: "Test · 9 types" },
        temperaments: { name: "De vier temperamenten",      sub: "Als je de 2.000 jaar oude kaart wilt waar het mee begon — en waar DISC uit groeide.",                 tag: "Test · 4 types" },
        eq:           { name: "Emotionele intelligentie (EQ)", sub: "Als je wilt weten hoe goed je emoties leest en hanteert — en hoe je daarin groeit.",               tag: "Score · vaardigheid" },
        love:         { name: "De vijf talen van de liefde", sub: "Als je wilt weten hoe jij — en de mensen van wie je houdt — je echt geliefd voelen.",                tag: "Test · 5 talen" },
        attachment:   { name: "Hechtingsstijlen",           sub: "Als je wilt weten waarom nabijheid voor jou voelt zoals het voelt.",                                 tag: "Test · 4 stijlen" },
        conflict:     { name: "Conflictstijlen",            sub: "Als je je reflex wilt kennen wanneer het spannend wordt — en wanneer je moet omschakelen.",           tag: "Test · 5 stijlen" },
        psychopaths:  { name: "Omringd door psychopaten",   sub: "Als je wilt weten hoe manipulators te werk gaan — en hoe je jezelf beschermt.",                       tag: "Erikson · alarmscore" },
        narcissists:  { name: "Omringd door narcisten",     sub: "Als je de vier gezichten van narcisme wilt kennen en wilt leren je staande te houden.",               tag: "Erikson · 4 types" },
        vampires:     { name: "Omringd door energievreters", sub: "Als je wilt weten wie jouw energie wegzuigt — en hoe je dat stopt.",                                tag: "Erikson · 4 types" },
        liars:        { name: "Omringd door leugenaars",    sub: "Als je wilt weten hoe misleiding echt werkt — het meeste wat je 'weet' klopt niet.",                  tag: "Erikson · mythe/feit" },
        bosses:       { name: "Omringd door slechte bazen", sub: "Als je wilt weten wat voor baas je hebt — en hoe je omhoog managet.",                                tag: "Erikson · 2 tests" },
        setbacks:     { name: "Omringd door tegenslag",     sub: "Als je wilt weten hoe je terugveert wanneer alles is misgegaan.",                                    tag: "Erikson · veerkrachtscore" },
      },
    },

    fr: {
      lang_name: "Français",
      lang_label: "Langue",
      title: "La Bibliothèque Humaine — Comprenez-vous, et comprenez les autres",
      desc: "Une bibliothèque d'ateliers interactifs sur la personnalité, le comportement, la communication et les personnes difficiles — DISC, Big Five, MBTI, Ennéagramme, attachement, langages de l'amour et la série « Entouré de… » de Thomas Erikson. Si vous voulez le savoir, il y a un atelier pour ça.",
      skip: "Aller au contenu",
      brand: "La Bibliothèque Humaine",
      nav_toggle: "Afficher la navigation",

      hero_eyebrow: "Une bibliothèque d'ateliers interactifs",
      hero_title: "Comprenez-vous —<br />et comprenez les autres.",
      hero_lead: "Quinze ateliers interactifs et digestes sur la personnalité, le comportement et la communication. Faites un test, obtenez une lecture immédiate et apprenez <em>comment aborder</em> chaque type de personne. Si vous voulez le savoir, il y a un atelier pour ça.",
      hero_cta1: "Commencer par vous →",
      hero_cta2: "Gérer les personnes difficiles",
      stat1: "Ateliers", stat2: "Tests interactifs", stat3: "Inscription requise",

      g_know_nav: "Se connaître",
      g_know_kicker: "Se connaître",
      g_know_h2: "Cartographiez votre personnalité",
      g_know_sub: "Commencez ici. Voici les grands modèles pour comprendre comment vous pensez, ressentez et agissez — de l'antique au scientifique.",

      g_relate_nav: "Relations",
      g_relate_kicker: "Relations &amp; liens",
      g_relate_h2: "Comprenez comment vous vous attachez",
      g_relate_sub: "Comment vous aimez, vous liez et vous heurtez aux personnes les plus proches de vous.",

      g_difficult_nav: "Personnes difficiles",
      g_difficult_kicker: "Personnes difficiles",
      g_difficult_h2: "Décryptez-les — et protégez-vous",
      g_difficult_sub: "La série <em>Entouré de…</em> de Thomas Erikson, repensée en ateliers interactifs. Repérez le comportement, puis apprenez exactement comment y faire face.",

      g_grow_nav: "Progresser",
      g_grow_kicker: "Progresser &amp; rebondir",
      g_grow_h2: "Construisez votre résilience",
      g_grow_sub: "Parce que connaître les gens, c'est aussi savoir encaisser quand la vie vous met à terre.",

      foot_note: "Les ateliers Erikson s'inspirent de <em>Entouré d'idiots, de psychopathes, de narcissiques, de mauvais chefs, de menteurs, de vampires</em> et <em>de revers</em> de Thomas Erikson — s'ils vous parlent, lisez les livres et soutenez l'auteur. Les autres ateliers s'appuient sur des modèles établis (DISC, les Big Five, le MBTI, l'Ennéagramme, la théorie de l'attachement, les langages de l'amour, Thomas–Kilmann et l'intelligence émotionnelle). Ce sont tous des outils pédagogiques de réflexion, pas des diagnostics cliniques.",
      foot_meta: "La Bibliothèque Humaine",

      cards: {
        disc:         { name: "DISC — Les quatre couleurs",  sub: "Si vous voulez savoir pourquoi les gens communiquent si différemment — et comment atteindre chacun d'eux.", tag: "Meilleur point de départ" },
        bigfive:      { name: "Les Big Five (OCEAN)",        sub: "Si vous voulez mesurer votre personnalité comme le fait vraiment la science.",                         tag: "Profil · 5 traits" },
        mbti:         { name: "Les 16 types (façon MBTI)",   sub: "Si vous voulez votre type en quatre lettres — avec un regard honnête sur ce qu'il vaut vraiment.",      tag: "Test · 16 types" },
        enneagram:    { name: "L'Ennéagramme",               sub: "Si vous voulez connaître les neuf motivations profondes qui nous animent en secret.",                  tag: "Test · 9 types" },
        temperaments: { name: "Les quatre tempéraments",     sub: "Si vous voulez la carte vieille de 2 000 ans qui a tout lancé — et qui est devenue le DISC.",           tag: "Test · 4 types" },
        eq:           { name: "L'intelligence émotionnelle (QE)", sub: "Si vous voulez savoir à quel point vous lisez et gérez les émotions — et comment progresser.",     tag: "Score · compétence" },
        love:         { name: "Les cinq langages de l'amour", sub: "Si vous voulez savoir comment vous — et ceux que vous aimez — vous sentez vraiment aimés.",            tag: "Test · 5 langages" },
        attachment:   { name: "Les styles d'attachement",     sub: "Si vous voulez comprendre pourquoi la proximité vous fait cet effet-là.",                             tag: "Test · 4 styles" },
        conflict:     { name: "Les styles de conflit",        sub: "Si vous voulez connaître votre réflexe quand ça se tend — et quand en changer.",                       tag: "Test · 5 styles" },
        psychopaths:  { name: "Entouré de psychopathes",      sub: "Si vous voulez savoir comment opèrent les manipulateurs — et comment vous protéger.",                  tag: "Erikson · score d'alerte" },
        narcissists:  { name: "Entouré de narcissiques",      sub: "Si vous voulez connaître les quatre visages du narcissisme et apprendre à tenir bon.",                 tag: "Erikson · 4 types" },
        vampires:     { name: "Entouré de vampires",          sub: "Si vous voulez savoir qui vous vide de votre énergie — et comment y mettre fin.",                      tag: "Erikson · 4 types" },
        liars:        { name: "Entouré de menteurs",          sub: "Si vous voulez savoir comment fonctionne vraiment le mensonge — l'essentiel de ce qu'on « sait » est faux.", tag: "Erikson · mythe/fait" },
        bosses:       { name: "Entouré de mauvais chefs",     sub: "Si vous voulez savoir quel type de chef vous avez — et comment gérer vers le haut.",                   tag: "Erikson · 2 tests" },
        setbacks:     { name: "Entouré de revers",            sub: "Si vous voulez savoir comment rebondir quand tout est allé de travers.",                              tag: "Erikson · score de résilience" },
      },
    },
  };

  return { CARDS, GROUPS, T };
})();
