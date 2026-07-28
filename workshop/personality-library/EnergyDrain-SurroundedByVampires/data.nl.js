/* =============================================================================
   Omringd door energievreters — Nederlandse inhoud
   Educatieve workshop geïnspireerd op het werk van Thomas Erikson over
   energievreters. Structuur identiek aan data.js; sleutels, kleuren, iconen,
   punten en bandgrenzen blijven ongewijzigd.
   ========================================================================== */
const BOOK_NL = {
  meta: {
    key: "vampires",
    title: "Omringd door energievreters",
    subtitle: "Herken wie je leegzuigt en bescherm je batterij",
    short: "Energievreters",
    emoji: "🧛",
    accent: "#9d174d",
    eyebrow: "Een workshop van Thomas Erikson",
    description:
      "Een educatieve workshop geïnspireerd op het werk van Thomas Erikson over energievreters. Leer de vier soorten energiezuigers kennen en hoe je je energie beschermt.",
    heroTitle: "Wie leegt<br />jouw batterij?",
    heroLead:
      "Sommige mensen laten je élke keer plat achter. Leer de vier soorten energievreters kennen — geïnspireerd op <em>Omringd door energievreters</em> van Thomas Erikson — en hoe je je energie beschermt.",
    heroCta: "Bepaal de energievreter",
    footerNote:
      "Een educatieve workshop geïnspireerd op <em>Omringd door energievreters</em> van Thomas Erikson. Een hulpmiddel om over na te denken en gezondere relaties te bouwen — geen etiket om op iemand te plakken.",
  },

  learn: {
    kicker: "De ideeën",
    heading: "De mensen die je leegzuigen",
    sub: "Energievreters zijn geen monsters — het zijn mensen wier gewoonten jou uitgeput achterlaten. Tik op een kaart om dieper te gaan.",
  },

  concepts: [
    {
      icon: "🧛",
      name: "Wat is een energievreter?",
      tag: "Uitputting, geen kwaad.",
      summary:
        "Een energievreter is iedereen die je stelselmatig leeg achterlaat — via negativiteit, behoeftigheid, chaos of controle. De meesten doen het niet expres; het is gewoon hun standaardmanier van omgang. Het patroon benoemen is de eerste stap om jezelf te beschermen.",
      points: [
        "Het signaal is simpel: je voelt je na elk contact slechter.",
        "Meestal is het gewoonte, geen bewuste wreedheid.",
        "Je energie is een hulpbron die verdediging verdient.",
        "Je kunt om iemand geven en toch de leegloop beperken.",
      ],
    },
    {
      icon: "🩸",
      name: "De vier types",
      tag: "Slachtoffer, criticus, drama, controleur.",
      summary:
        "Energiezuigers vallen uiteen in herkenbare stijlen: het eeuwige slachtoffer, de onvermoeibare criticus, de dramamagneet en de controleur. Elk zuigt je op een andere manier leeg — en elk vraagt om een andere aanpak.",
      points: [
        "<strong>Het slachtoffer:</strong> zuigt leeg via schuldgevoel en eindeloze problemen.",
        "<strong>De criticus:</strong> zuigt leeg via negativiteit en oordeel.",
        "<strong>De dramamagneet:</strong> zuigt leeg via voortdurende crisis.",
        "<strong>De controleur:</strong> zuigt leeg via druk en verplichting.",
      ],
    },
    {
      icon: "🔋",
      name: "Hoe ze je leegzuigen",
      tag: "Ze haken in op je beste eigenschappen.",
      summary:
        "Energievreters haken zich vast aan je inlevingsvermogen, je wil om te helpen, je behoefte aan goedkeuring of je angst voor conflict. De leegloop werkt omdat jij blijft geven wat zij blijven nemen.",
      points: [
        "Schuldgevoel houdt je in de reddersrol bij het slachtoffer.",
        "De wens om goedgekeurd te worden houdt je bij de criticus.",
        "Adrenaline houdt je vast aan het drama.",
        "Angst voor conflict houdt je gehoorzaam bij de controleur.",
      ],
    },
    {
      icon: "🛡️",
      name: "Bescherm je energie",
      tag: "Grenzen en afstand.",
      summary:
        "Je beschermt je batterij door blootstelling te beperken, grenzen vast te houden en de reactie waar ze op teren niet te leveren. Je hoeft ze niet te repareren — stop gewoon met jezelf leeg te trekken.",
      points: [
        "Beperk de tijd en de toegang die ze krijgen.",
        "Houd grenzen vast zonder lange verantwoording.",
        "Lever niet het schuldgevoel, de goedkeuring of het drama dat ze zoeken.",
        "Laad je eigen energie bewust weer op.",
      ],
    },
    {
      icon: "💡",
      name: "Beheer je eigen toestand",
      tag: "Jij bedient het stopcontact.",
      summary:
        "Het enige wat je altijd in de hand hebt, is je eigen reactie. Blijf kalm, houd perspectief en bepaal vooraf hoeveel je wilt geven. Een stabiele jij is een veel kleiner doelwit.",
      points: [
        "Bepaal je grens vóór het contact, niet tijdens.",
        "Blijf kalm — je reactie is de brandstof.",
        "Houd zicht op wat werkelijk jouw verantwoordelijkheid is.",
        "Bescherm en vul je energie bewust aan.",
      ],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Bepalen",
    heading: "Welke energievreter is het?",
    sub: "Denk aan één specifiek persoon die je leeg achterlaat. Antwoord op wat je waarneemt, dan schatten we in welk type het is.",
    nav: "Bepalen",
    icon: "🔎",
    introTitle: "12 waarnemingen",
    introText: "Houd één slopende persoon in gedachten en kies de optie die het beste bij <em>hen</em> past.",
    resultEyebrow: "De energievreter waar je mee te maken hebt",
    categories: {
      victim: {
        name: "Het slachtoffer",
        icon: "🌀",
        color: "#6d28d9",
        summary:
          "Niets is ooit hun schuld en niets wordt ooit beter. Ze zuigen je leeg via schuldgevoel en een bodemloze behoefte om gered te worden.",
        signs: ["Een eindeloos klaagverhaal", "Nooit hun verantwoordelijkheid", "Wijst elke oplossing af", "Geeft je een schuldgevoel én het gevoel nodig te zijn", "Verandert uiteindelijk nooit iets"],
        handle: ["Toon inleving zonder het over te nemen", "Stop met oplossingen aanbieden die ze toch afwijzen", "Stel een grens aan je reddingstijd", "Weiger het schuldgevoel", "Wijs ze de weg naar echte, professionele hulp"],
      },
      critic: {
        name: "De criticus",
        icon: "🗯️",
        color: "#b45309",
        summary:
          "Een onvermoeibare vlekkenzoeker. Hun negativiteit en oordeel maken je zelfvertrouwen en je energie langzaam kleiner.",
        signs: ["Vindt overal de fout", "Complimenten met een weerhaakje", "Zegt zelden iets positiefs", "Oordeelt over mensen en keuzes", "Laat je twijfelen aan jezelf"],
        handle: ["Ga niet achter hun goedkeuring aan", "Kijk naar wie het zegt", "Houd je eigen maatstaven vast", "Beperk je blootstelling", "Haak af in plaats van jezelf te verdedigen"],
      },
      drama: {
        name: "De dramamagneet",
        icon: "🎭",
        color: "#db2777",
        summary:
          "Struikelt van crisis naar crisis en trekt jou mee. Alles is dringend, enorm en uitputtend.",
        signs: ["Een aanhoudende stroom noodgevallen", "Alles is een groot drama", "Bloeit op bij chaos", "Blaast kleine dingen op", "Laat je opgejaagd achter"],
        handle: ["Blijf rustig en zonder haast", "Ga niet mee in hun urgentie", "Scheid echte crises van ruis", "Houd stevige grenzen", "Weiger het publiek te zijn"],
      },
      controller: {
        name: "De controleur",
        icon: "🕸️",
        color: "#0f766e",
        summary:
          "Moet alles op hun manier hebben en gebruikt schuldgevoel, druk en verplichting om dat te krijgen. In hun buurt loop je op eierschalen.",
        signs: ["Gaat over je grenzen heen", "Schuldgevoel en verplichting als gereedschap", "Hun manier of geen manier", "Straft een 'nee' af", "Maakt je bang voor je eigen keuzes"],
        handle: ["Houd grenzen rustig vast", "Leg je 'nee' niet eindeloos uit", "Verklein de hefboom die ze op je hebben", "Houd je beslissingen in eigen hand", "Zoek steun als het dwingend wordt"],
      },
    },
    questions: [
      { q: "Na tijd met ze voel je je…", options: [
        { text: "Schuldig en verantwoordelijk voor hun problemen", cat: "victim" },
        { text: "Beoordeeld en leeggelopen", cat: "critic" },
        { text: "Uitgeput door de constante crises", cat: "drama" },
        { text: "Onder druk gezet en klemgezet", cat: "controller" },
      ]},
      { q: "Hun favoriete onderwerp is…", options: [
        { text: "Alles wat er voor hen misging", cat: "victim" },
        { text: "Wat er mis is met iedereen en alles", cat: "critic" },
        { text: "Het nieuwste noodgeval", cat: "drama" },
        { text: "Hoe dingen horen te gaan — op hun manier", cat: "controller" },
      ]},
      { q: "Als je goed nieuws deelt…", options: [
        { text: "Buigen ze het om naar hun eigen ellende", cat: "victim" },
        { text: "Vinden ze de fout of het addertje", cat: "critic" },
        { text: "Overtroeven ze het met een groter verhaal", cat: "drama" },
        { text: "Vertellen ze je wat je nu moet doen", cat: "controller" },
      ]},
      { q: "Ze houden je vast door…", options: [
        { text: "Je nodig én schuldig te laten voelen", cat: "victim" },
        { text: "Je te laten snakken naar hun zeldzame goedkeuring", cat: "critic" },
        { text: "Je mee te trekken in de opwinding", cat: "drama" },
        { text: "Je bang te maken voor de gevolgen van 'nee'", cat: "controller" },
      ]},
      { q: "Verantwoordelijkheid voor problemen…", options: [
        { text: "Ligt nooit bij hen", cat: "victim" },
        { text: "Is altijd andermans schuld", cat: "critic" },
        { text: "Doet er niet toe — voel het drama", cat: "drama" },
        { text: "Ligt bij jou als je niet gehoorzaamde", cat: "controller" },
      ]},
      { q: "Als je een grens stelt…", options: [
        { text: "Praten ze je een schuldgevoel aan dat je ze in de steek laat", cat: "victim" },
        { text: "Kleineren ze je erom", cat: "critic" },
        { text: "Blazen ze het op tot een enorme scène", cat: "drama" },
        { text: "Negeren ze hem en duwen ze toch door", cat: "controller" },
      ]},
      { q: "Ze zuigen je leeg via…", options: [
        { text: "Medelijden en verplichting", cat: "victim" },
        { text: "Negativiteit en afkraken", cat: "critic" },
        { text: "Chaos en urgentie", cat: "drama" },
        { text: "Schuldgevoel en druk", cat: "controller" },
      ]},
      { q: "Wat ze van je willen is…", options: [
        { text: "Eindeloos gered worden", cat: "victim" },
        { text: "Instemming met hun oordeel", cat: "critic" },
        { text: "Publiek voor de voorstelling", cat: "drama" },
        { text: "Gehoorzaamheid", cat: "controller" },
      ]},
      { q: "In hun buurt word je…", options: [
        { text: "Een therapeut waar je nooit voor tekende", cat: "victim" },
        { text: "Kleiner en onzekerder", cat: "critic" },
        { text: "Meegesleurd en opgejaagd", cat: "drama" },
        { text: "Iemand die op eierschalen loopt", cat: "controller" },
      ]},
      { q: "Ze doen zelden…", options: [
        { text: "Iets om het op te lossen", cat: "victim" },
        { text: "Iets positiefs zeggen", cat: "critic" },
        { text: "Het rustig laten worden", cat: "drama" },
        { text: "Jou je eigen keuze laten maken", cat: "controller" },
      ]},
      { q: "Hun standaardtoon is…", options: [
        { text: "Klagend en hulpeloos", cat: "victim" },
        { text: "Snijdend en negatief", cat: "critic" },
        { text: "Luid en chaotisch", cat: "drama" },
        { text: "Eisend en over grenzen heen duwend", cat: "controller" },
      ]},
      { q: "De relatie draait op…", options: [
        { text: "Jouw schuldgevoel", cat: "victim" },
        { text: "Jouw behoefte aan goedkeuring", cat: "critic" },
        { text: "Jouw adrenaline", cat: "drama" },
        { text: "Jouw angst", cat: "controller" },
      ]},
    ],
  },

  assessment2: {
    mode: "score",
    shuffle: false,
    shuffleOptions: false,
    kicker: "Tweede test",
    heading: "Zuig jij anderen leeg?",
    sub: "De dapperste vraag van allemaal. Geef eerlijk aan hoe vaak elke uitspraak op jou slaat. Dit is een privéspiegel, geen vonnis.",
    nav: "Ben ik het?",
    icon: "\uD83E\uDE9E",
    introTitle: "10 eerlijke uitspraken",
    introText: "Antwoord over je <em>eigen</em> gewoonten, zo eerlijk als je kunt.",
    resultEyebrow: "Jouw eigen slopende neiging",
    scaleLow: "Je tilt anderen op",
    scaleHigh: "Je zuigt anderen leeg",
    bands: [
      { min: 0, color: "#2a9d5c", label: "Laag", title: "Je tilt meer op dan je leegzuigt", blurb: "Je gewoonten laten anderen meestal met energie achter. Zo houden — en blijf alert op je zware dagen.", adviceTitle: "Houd het sterk", advice: ["Blijf anderen ruimte en rust geven.", "Merk je stressreflex op en houd hem in de hand.", "Laad jezelf op, zodat je energie hébt om te geven."] },
      { min: 34, color: "#f0a500", label: "Enigszins", title: "Een paar slopende gewoonten om op te letten", blurb: "Je tilt anderen vaak op, maar sommige gewoonten kunnen mensen uitputten. Kleine bijstellingen maken veel verschil.", adviceTitle: "Bijstellen", advice: ["Pak de gewoonte met de hoogste score en verzacht die.", "Vraag een vriend die je vertrouwt om eerlijke feedback.", "Klaag minder, verbind meer — en neem je eigen toestand in eigen hand.", "Laad jezelf op in plaats van op één iemand te leunen."] },
      { min: 60, color: "#b3123a", label: "Hoog", title: "Je zuigt de mensen om je heen mogelijk leeg", blurb: "Sommige van je gewoonten laten mensen waarschijnlijk uitgeput achter. Dat is heel goed te veranderen — en zelfinzicht ís de eerste stap.", adviceTitle: "Begin hier", advice: ["Neem je eigen toestand in eigen hand in plaats van die uit te besteden.", "Geef anderen ruimte, spreektijd en rust.", "Ruil een klacht in voor een verzoek of een actie.", "Overweeg met een coach of hulpverlener over het patroon te praten."] },
    ],
    questions: [
      "Ik lucht vaak mijn hart over problemen zonder echt een oplossing te willen.",
      "Ik wijs regelmatig aan wat er mis is met dingen en met mensen.",
      "Ik neig ertoe situaties tot een crisis of drama te maken.",
      "Ik gebruik schuldgevoel of druk om mensen te laten doen wat ik wil.",
      "Als iemand goed nieuws deelt, buig ik het om naar mezelf.",
      "Mensen lijken moe of vlak na tijd met mij door te brengen.",
      "Ik neem zelden verantwoordelijkheid als er iets misgaat.",
      "Ik vind het lastig om een gesprek licht en positief te laten blijven.",
      "Ik verwacht dat anderen mijn problemen voor me oplossen.",
      "Ik ga over de grenzen van anderen heen als ik iets wil.",
    ].map((q) => ({
      q,
      options: [
        { text: "Nooit", points: 0 },
        { text: "Zelden", points: 1 },
        { text: "Soms", points: 2 },
        { text: "Vaak", points: 3 },
      ],
    })),
  },

  handle: {
    kicker: "Veldgids",
    heading: "Hoe bescherm je je energie",
    sub: "Je hoeft een energievreter niet te repareren. Je hoeft alleen te stoppen met jezelf leeg te trekken.",
    nav: "Bescherm",
    cta: "Lees de gids voor energiebescherming →",
    cards: [
      { icon: "✅", title: "Doen", tone: "do", items: [
        "Bepaal je grenzen voordat je erin gaat", "Houd grenzen rustig en kort", "Blijf onbewogen — je reactie is de brandstof", "Beperk de tijd en toegang die ze krijgen", "Laad je eigen energie bewust weer op",
      ]},
      { icon: "⛔", title: "Niet doen", tone: "dont", items: [
        "Proberen ze te repareren of te redden", "Achter goedkeuring aangaan of discussies willen winnen", "Meegaan in hun drama of urgentie", "Schuld aanvaarden die niet van jou is", "Ze jouw keuzes laten bepalen",
      ]},
      { icon: "🔋", title: "Energiegrenzen", tone: "", items: [
        "Zet een klok op de tijd: 'ik heb tien minuten'", "Buig om: eerst inleving, dan door", "Lever het schuldgevoel / de goedkeuring / het drama niet", "Stap terug zodra het escaleert", "Laad op bij mensen die je vullen",
      ]},
    ],
  },

  faq: [
    { q: "Is een energievreter een slecht mens?", a: "Niet per se. De meesten zuigen anderen leeg uit gewoonte, niet uit kwaadwil — het slachtoffer voelt zich echt hulpeloos, de criticus ziet echt gebreken. Het is het gedrag dat je uitput, wat de bedoeling ook is." },
    { q: "Kan iemand meer dan één type zijn?", a: "Ja. Veel mensen zijn een mengeling — een slachtoffer dat controlerend wordt, een criticus die van drama houdt. Je uitslag toont de sterkste match plus de balans over alle vier." },
    { q: "Wat als ik zelf de energievreter ben?", a: "Eerlijke vraag, en een gezonde. Merk op in welk patroon je schiet onder stress, neem je eigen toestand in eigen hand en geef anderen de rust en ruimte die je zelf zou willen." },
    { q: "Hoe bescherm ik mijn energie zonder kil te zijn?", a: "Grenzen zijn geen wreedheid. Je kunt warm zijn en tegelijk je tijd beperken, het schuldgevoel afwijzen en weigeren het drama te voeden. Vriendelijkheid en zelfbescherming gaan prima samen." },
    { q: "Wanneer moet ik weglopen?", a: "Als iemand je stelselmatig leegzuigt en geen enkele grens respecteert — of als de relatie dwingend wordt — is contact beperken of beëindigen een legitieme, gezonde keuze." },
    { q: "Is iedereen niet weleens slopend?", a: "Ja. Iedereen heeft zware dagen. De zorg zit in een hardnekkig <em>patroon</em> waarin de gewoonten van één persoon jou steevast uitgeput achterlaten." },
  ],

  disc: {
    kicker: "De vier kleuren",
    heading: "Energie en de vier kleuren",
    sub: "Elke DISC-kleur zuigt anderen op haar eigen manier leeg én raakt zelf op een eigen manier leeg. Beide kennen beschermt iedereen.",
    nav: "Kleuren",
    labels: { relate: "Hoe deze kleur anderen leegzuigt", reflect: "Hoe deze kleur zelf leegloopt", treat: "De oplossing" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Ontdek de DISC-kleurenworkshop →",
    colors: {
      red: {
        relate: "Roden zuigen anderen leeg door te walsen, ongeduld en van alles een drukketel te maken.",
        reflect: "Roden lopen leeg van inefficiëntie, getreuzel en mensen die niet ter zake komen.",
        treat: "Doe rustiger aan voor anderen; bescherm je eigen energie door te delegeren en waardeloze gevechten te laten lopen.",
      },
      yellow: {
        relate: "Gelen zuigen anderen leeg met non-stop praten, drama en een behoefte aan constante aandacht.",
        reflect: "Gelen lopen leeg van isolatie, kritiek en saaie, detailzware routines.",
        treat: "Geef anderen ook spreektijd; laad op met afwisseling en mensen, niet door alles bij één vriend te dumpen.",
      },
      green: {
        relate: "Groenen zuigen anderen leeg via passief verzet, schuldgevoel en nooit zeggen wat ze nodig hebben.",
        reflect: "Groenen lopen leeg van conflict, drammerigheid en het dragen van ieders problemen.",
        treat: "Zeg direct wat je nodig hebt; bescherm jezelf door niet elke last op te nemen.",
      },
      blue: {
        relate: "Blauwen zuigen anderen leeg met onophoudelijke kritiek, negativiteit en 'dat gaat nooit werken'.",
        reflect: "Blauwen lopen leeg van chaos, vaagheid en opgejaagd worden.",
        treat: "Zet naast de kritiek ook wat er wél werkt; bescherm je energie met structuur en heldere informatie.",
      },
    },
  },
};

window.BOOK_NL = BOOK_NL;
