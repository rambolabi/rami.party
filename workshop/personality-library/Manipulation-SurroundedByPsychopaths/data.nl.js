/* =============================================================================
   Omringd door psychopaten — Nederlandse inhoud
   Educatieve workshop geïnspireerd op "Omringd door psychopaten" van Thomas
   Erikson. Manipulatie herkennen en jezelf beschermen — NADRUKKELIJK geen
   klinisch of diagnostisch instrument. Structuur identiek aan data.js.
   ========================================================================== */
const BOOK_NL = {
  meta: {
    key: "psychopaths",
    title: "Omringd door psychopaten",
    subtitle: "Herken manipulatie en bescherm jezelf",
    short: "Psychopaten",
    emoji: "🎭",
    accent: "#b3123a",
    eyebrow: "Een workshop van Thomas Erikson",
    description:
      "Een educatieve workshop geïnspireerd op 'Omringd door psychopaten' van Thomas Erikson. Leer manipulatietechnieken herkennen en jezelf beschermen — geen klinisch of diagnostisch instrument.",
    heroTitle: "Niet iedereen<br />speelt eerlijk.",
    heroLead:
      "Sommige mensen charmeren, liegen en manipuleren om hun zin te krijgen. Leer de technieken lezen uit <em>Omringd door psychopaten</em> van Thomas Erikson — en verdedig jezelf met heldere blik.",
    heroCta: "Herken de rode vlaggen",
    footerNote:
      "Een educatieve workshop geïnspireerd op <em>Omringd door psychopaten</em> van Thomas Erikson. Het helpt je manipulatief gedrag te herkennen en jezelf te beschermen — het is geen klinisch of diagnostisch instrument. Voel je je ooit onveilig, neem dan contact op met lokale hulpverlening.",
  },

  learn: {
    kicker: "De ideeën",
    heading: "Hoe manipulatie werkt",
    sub: "Psychopathie zit op een spectrum, en de meeste manipulators overtreden nooit de wet — ze buigen alleen mensen. Tik op een kaart om dieper te gaan.",
  },

  concepts: [
    {
      icon: "🎭",
      name: "Het masker van charme",
      tag: "Waarom je ze in het begin zo aardig vindt.",
      summary:
        "Manipulators openen met charme. Ze zijn attent, vleiend en leuk gezelschap — tot ze hebben wat ze willen. Psychopathie is een spectrum: een kleine groep mensen vertoont sterke trekken, en veel meer mensen gebruiken af en toe dezelfde technieken.",
      points: [
        "Oppervlakkige charme is een werktuig, geen warmte — hij gaat uit zodra je 'nuttig' bent geweest.",
        "Ze spiegelen jouw interesses en waarden om snel een valse intimiteit te bouwen.",
        "Vroeg 'liefdesbombardement' of overdreven lof is een klassieke openingszet.",
        "Het spectrum doet ertoe: dit gaat over gedrag om op te letten, niet over etiketten om rond te strooien.",
      ],
    },
    {
      icon: "🧰",
      name: "De gereedschapskist van de manipulator",
      tag: "De terugkerende technieken die je moet herkennen.",
      summary:
        "Manipulatie is een klein setje herhaalbare zetten. Zodra je ze kunt benoemen, verliezen ze het grootste deel van hun macht over je.",
      points: [
        "<strong>Liegen:</strong> soepel, zelfverzekerd en vaak, zelfs als het nergens voor nodig is.",
        "<strong>Gaslighting:</strong> de gebeurtenissen herschrijven tot je aan je eigen geheugen twijfelt.",
        "<strong>Schuldgevoel aanpraten:</strong> hun probleem tot jouw fout maken.",
        "<strong>Vleierij:</strong> complimenten die iets willen loskrijgen.",
        "<strong>Triangulatie:</strong> mensen tegen elkaar uitspelen om zelf de touwtjes te houden.",
      ],
    },
    {
      icon: "🚩",
      name: "Waarschuwingssignalen",
      tag: "Het patroon onder de charme.",
      summary:
        "Eén moment bewijst niets — kijk naar het patroon over de tijd. In één ding zijn manipulators consequent: het komt altijd op hun voordeel uit.",
      points: [
        "In het openbaar een ander gezicht dan onder vier ogen.",
        "Weinig echte inleving als jij het echt zwaar hebt.",
        "Regels gelden voor jou, niet voor hen.",
        "Je komt uit een gesprek leeggezogen, verward of op de een of andere manier in de fout.",
      ],
    },
    {
      icon: "🛡️",
      name: "Bescherm jezelf",
      tag: "Afstand, grenzen, vastleggen.",
      summary:
        "Je 'wint' zelden van een manipulator door beter te argumenteren. Je beschermt jezelf door een slecht doelwit te worden: voorspelbaar, saai om te provoceren en moeilijk uit balans te brengen.",
      points: [
        "Stel stevige grenzen en houd ze vast zonder lange verantwoording.",
        "Leg belangrijke afspraken en gesprekken vast.",
        "Beperk de persoonlijke informatie die je weggeeft — die wordt drukmiddel.",
        "Blijf verbonden met mensen die je vertrouwt; isolatie is de beste vriend van de manipulator.",
      ],
    },
    {
      icon: "🧠",
      name: "Waarom het bij jou werkt",
      tag: "Ze misbruiken je beste eigenschappen.",
      summary:
        "Manipulators mikken op je sterke kanten: je inlevingsvermogen, je loyaliteit, je schuldgevoel of je wens de vrede te bewaren. Je eigen reflexen kennen is het halve verweer.",
      points: [
        "Empathische mensen leggen te veel uit en geven tweede kansen — daar wordt op gespeeld.",
        "Conflictvermijders zwichten onder druk — daar wordt op geleund.",
        "Wie snakt naar goedkeuring is gevoelig voor vleierij — die wordt geleverd.",
        "Je eigen knoppen kennen zorgt dat er niet meer op gedrukt wordt.",
      ],
    },
  ],

  assessment: {
    mode: "score",
    shuffle: false,
    shuffleOptions: false,
    kicker: "Check op rode vlaggen",
    heading: "Manipuleert iemand jou?",
    sub: "Denk aan één specifiek persoon. Geef aan hoe vaak elke uitspraak op diegene van toepassing is. Dit is een reflectielijst, geen diagnose.",
    nav: "Rode vlaggen",
    icon: "🚩",
    introTitle: "12 gedragschecks",
    introText: "Houd één persoon in gedachten en antwoord eerlijk over <em>hun</em> gedrag. Kost ongeveer twee minuten.",
    resultEyebrow: "Niveau van rode vlaggen",
    scaleLow: "Weinig rode vlaggen",
    scaleHigh: "Ernstige rode vlaggen",
    bands: [
      {
        min: 0,
        color: "#2a9d5c",
        label: "Laag",
        title: "Weinig rode vlaggen",
        blurb: "Op basis van je antwoorden vertoont deze persoon weinig manipulatief gedrag. Af en toe wrijving hoort bij elke relatie.",
        adviceTitle: "Houd in gedachten",
        advice: [
          "Iedereen gedraagt zich weleens egoïstisch — het gaat om een patroon, niet om één moment.",
          "Blijf open en direct communiceren.",
          "Vertrouw op je gevoel als dat mettertijd verandert.",
        ],
      },
      {
        min: 34,
        color: "#f0a500",
        label: "Let op",
        title: "Enkele rode vlaggen — blijf alert",
        blurb: "Hier zit een zorgelijk patroon. Het is misschien niet bewust, maar het is de moeite waard je grenzen te bewaken en te kijken hoe het zich ontwikkelt.",
        adviceTitle: "Wat je kunt doen",
        advice: [
          "Benoem het gedrag voor jezelf, zodat het niet langer verwarrend is.",
          "Stel één duidelijke grens op het punt dat je het meest dwarszit.",
          "Maak aantekeningen als afspraken steeds 'veranderen'.",
          "Bespreek het met iemand buiten de situatie die je vertrouwt.",
        ],
      },
      {
        min: 60,
        color: "#b3123a",
        label: "Hoog",
        title: "Ernstige rode vlaggen — bescherm jezelf",
        blurb: "Dit patroon past bij aanhoudende manipulatie. Het doel is nu niet om hen te repareren, maar om jezelf te beschermen.",
        adviceTitle: "Bescherm jezelf",
        advice: [
          "Deel minder — informatie wordt drukmiddel.",
          "Stop met discussies willen winnen; haak juist af (de 'grijze steen'-aanpak).",
          "Leg belangrijke gesprekken en afspraken schriftelijk vast.",
          "Leun op mensen die je vertrouwt en zoek professionele hulp als je je onveilig voelt.",
        ],
      },
    ],
    questions: [
      "Ze zetten de charme aan om te krijgen wat ze willen, en worden koud zodra ze het hebben.",
      "Ze liegen makkelijk en overtuigend, zelfs over kleine dingen.",
      "Ze verdraaien je woorden tot je aan je eigen geheugen twijfelt.",
      "Ze tonen weinig echte inleving als jij het zwaar hebt.",
      "Ze geven je een schuldgevoel over dingen die niet jouw schuld zijn.",
      "Ze gaan over je grenzen heen, ook nadat je nee hebt gezegd.",
      "Als je ze aanspreekt, geven ze iedereen de schuld behalve zichzelf.",
      "Ze lijken ervan te genieten om drama of ruzie tussen mensen te stoken.",
      "Hun complimenten laten je vaak ongemakkelijk of 'minder' achter.",
      "Ze laten in het openbaar een heel ander gezicht zien dan onder vier ogen.",
      "Ze tonen zelden echte spijt nadat ze iemand hebben gekwetst.",
      "Je voelt je leeg, verward of gemanipuleerd na tijd met ze door te brengen.",
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
    heading: "Hoe ga je om met een manipulator",
    sub: "Je verslaat een manipulator niet door beter te manipuleren. Je wordt een slecht doelwit.",
    nav: "Bescherm",
    cta: "Lees de beschermingsgids →",
    cards: [
      {
        icon: "✅",
        title: "Doen",
        tone: "do",
        items: [
          "Vertrouw op je gevoel — verwarring is informatie",
          "Stel stevige grenzen en houd ze vast",
          "Leg belangrijke afspraken vast",
          "Beperk de persoonlijke info die je deelt",
          "Blijf dicht bij mensen die je vertrouwt",
        ],
      },
      {
        icon: "⛔",
        title: "Niet doen",
        tone: "dont",
        items: [
          "Proberen ze te 'repareren' of te redden",
          "Discussiëren om te winnen — dat lukt niet",
          "Emotionele munitie weggeven",
          "Echte inleving of spijt verwachten",
          "Je laten isoleren",
        ],
      },
      {
        icon: "🪨",
        title: "De grijze-steenmethode",
        tone: "",
        items: [
          "Wees kalm, kort en saai om te provoceren",
          "Geef korte, neutrale antwoorden",
          "Reageer niet emotioneel — dat is de brandstof",
          "Houd gesprekken praktisch, niet persoonlijk",
          "Maak jezelf een oninteressant doelwit",
        ],
      },
    ],
  },

  faq: [
    { q: "Betekent een hoge score dat die persoon een psychopaat is?", a: "Nee. Dit is een educatief reflectiemiddel, geen diagnose. Een hoge score betekent dat het <em>gedrag</em> serieus genomen moet worden en dat je jezelf ertegen mag beschermen — los van welk etiket dan ook." },
    { q: "Is niet iedereen weleens manipulatief?", a: "Ja — de meeste mensen gebruiken af en toe druk of charme. Wat telt is een consequent <em>patroon</em> waarin het altijd naar het voordeel van één persoon overhelt en de ander zich slechter voelt." },
    { q: "Wat is gaslighting precies?", a: "Gaslighting is iemand zo manipuleren dat die aan het eigen geheugen of de eigen waarneming gaat twijfelen — volhouden dat iets niet gebeurd is, of dat je 'te gevoelig' bent, tot je jezelf niet meer vertrouwt." },
    { q: "Hoe vaak komen psychopathische trekken voor?", a: "Sterke trekken zijn tamelijk zeldzaam, maar ze zitten op een spectrum. Veel meer mensen gebruiken manipulatieve technieken zonder ook maar in de buurt van een klinische grens te komen. Op het gedrag kun je wél handelen." },
    { q: "Kan een manipulator veranderen?", a: "Soms, maar alleen als diegene het écht wil en het werk doet — en dat komt weinig voor. Jouw welzijn zou niet mogen afhangen van dat afwachten. Bescherm jezelf ondertussen." },
    { q: "Het is mijn baas of partner — en nu?", a: "Richt je op grenzen, vastleggen en steun in plaats van op confrontatie. Gaat het om een hechte relatie of voelt iets onveilig, praat dan met een hulpverlener of een lokale hulpdienst." },
  ],

  disc: {
    kicker: "De vier kleuren",
    heading: "Manipulatie en de vier kleuren",
    sub: "Manipulators drukken bij elke DISC-kleur op andere knoppen. Weet welke de jouwe is — en verdedig hem.",
    nav: "Kleuren",
    labels: { relate: "Hoe een manipulator deze kleur inpalmt", reflect: "Als dit jij bent — bescherm jezelf", treat: "Jouw sterkste verdediging" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Vind jouw kleur in de DISC-workshop →",
    colors: {
      red: {
        relate: "Manipulators vleien de drive van een Rood en houden snelle winst en status voor om hen tot slechte beslissingen te jagen.",
        reflect: "Je ongeduld is de opening — een manipulator rekent op je snelle besluiten. Doe rustiger aan.",
        treat: "Eis bewijs en tijd. Een echte deal overleeft een pauze; manipulatie zelden.",
      },
      yellow: {
        relate: "Gelen worden ingepalmd via charme, lof en de belofte aardig gevonden en bewonderd te worden.",
        reflect: "Je behoefte aan goedkeuring is de hefboom. Merk op wanneer de lof net vóór een verzoek komt.",
        treat: "Controleer de feiten achter de vleierij en houd nuchtere vrienden die je de waarheid zeggen.",
      },
      green: {
        relate: "Groenen worden uitgebuit via schuldgevoel, loyaliteit en hun hekel aan conflict.",
        reflect: "Je drang om de vrede te bewaren laat grenzen stilletjes wegglijden. Nee zeggen mag.",
        treat: "Stel één duidelijke grens en houd hem vast — een manipulator rekent erop dat je zwicht.",
      },
      blue: {
        relate: "Blauwen worden binnengehaald met schijnlogica, detail en een beroep op 'jij bent toch de redelijke'.",
        reflect: "Je kunt de argumenten stukanalyseren en de emotionele manipulatie eronder missen.",
        treat: "Vertrouw op het patroon, niet alleen op de woorden — weeg beweringen tegen wat ze werkelijk doen.",
      },
    },
  },
};

window.BOOK_NL = BOOK_NL;
