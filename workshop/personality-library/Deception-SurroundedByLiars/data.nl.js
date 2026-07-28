/* =============================================================================
   Omringd door leugenaars — Nederlandse inhoud
   Educatieve workshop geïnspireerd op "Omringd door leugenaars" van Thomas
   Erikson. Structuur identiek aan data.js; de vlag `correct: true` staat op
   exact dezelfde optie-index als in het Engels.
   ========================================================================== */
const BOOK_NL = {
  meta: {
    key: "liars",
    title: "Omringd door leugenaars",
    subtitle: "Begrijp misleiding en lees de waarheid",
    short: "Leugenaars",
    emoji: "🕵️",
    accent: "#0f766e",
    eyebrow: "Een workshop van Thomas Erikson",
    description:
      "Een educatieve workshop geïnspireerd op 'Omringd door leugenaars' van Thomas Erikson. Leer waarom mensen liegen, ontkracht de mythes over leugens herkennen en test je eigen kennis.",
    heroTitle: "Iedereen liegt.<br />Zie jij het?",
    heroLead:
      "Het meeste wat we 'weten' over leugenaars herkennen klopt niet. Leer hoe misleiding echt werkt uit <em>Omringd door leugenaars</em> van Thomas Erikson — en test hoeveel je er werkelijk van weet.",
    heroCta: "Test jezelf: mythe of feit?",
    footerNote:
      "Een educatieve workshop geïnspireerd op <em>Omringd door leugenaars</em> van Thomas Erikson. Een hulpmiddel om te leren en na te denken — geen manier om iemand te beschuldigen of te 'bewijzen' dat iemand liegt.",
  },

  learn: {
    kicker: "De ideeën",
    heading: "Hoe misleiding echt werkt",
    sub: "Liegen is universeel, en het herkennen ervan is veel moeilijker dan de volkswijsheid doet vermoeden. Tik op een kaart om dieper te gaan.",
  },

  concepts: [
    {
      icon: "🤥",
      name: "Waarom we liegen",
      tag: "Bijna altijd zelfbescherming.",
      summary:
        "Mensen liegen zelden voor de kick. De meeste leugens beschermen iets: conflict vermijden, gevolgen ontlopen, voordeel halen of iemands gevoelens sparen. Het motief begrijpen is nuttiger dan letten op zenuwtrekjes.",
      points: [
        "Om straf of conflict te ontlopen.",
        "Om voordeel te halen of er beter uit te komen.",
        "Om iemand anders te beschermen (leugentjes om bestwil).",
        "Het motief zegt je meer dan welk 'signaal' dan ook.",
      ],
    },
    {
      icon: "🧬",
      name: "De anatomie van een leugen",
      tag: "Kleine leugens groeien.",
      summary:
        "Misleiding neigt te escaleren. Een kleine leugen heeft een tweede nodig om hem af te dekken, dan een derde — en elke leugen verhoogt de prijs van de waarheid. Culturen en relaties glijden af naar oneerlijkheid, één handige stap tegelijk.",
      points: [
        "Eén leugen heeft er meestal nog een nodig om overeind te blijven.",
        "Elke leugen verhoogt de prijs van schoon schip maken.",
        "Kleine, 'onschuldige' leugens maken grotere normaal.",
        "Omgevingen die eerlijkheid afstraffen kweken leugens.",
      ],
    },
    {
      icon: "🕵️",
      name: "Mythes over leugens herkennen",
      tag: "Lichaamstaal verraadt zelden iets.",
      summary:
        "Vrijwel alles wat de volkswijsheid leert over leugenaars herkennen is onbetrouwbaar. Wegkijken, friemelen en zenuwachtigheid zijn tekenen van stress, geen bewijs van liegen — en geoefende leugenaars doen vaak juist het tegenovergestelde.",
      points: [
        "Oogcontact en friemelen verraden leugens niet betrouwbaar.",
        "Zelfs getrainde waarnemers scoren op lichaamstaal nauwelijks beter dan gokken.",
        "Zenuwachtige eerlijke mensen lijken ook 'schuldig'.",
        "Leugendetectors zijn verre van de onfeilbare apparaten uit films.",
      ],
    },
    {
      icon: "✅",
      name: "Wat wél helpt",
      tag: "Luister, staar niet.",
      summary:
        "De betere aanwijzingen zijn talig en contextueel: tegenstrijdigheden over de tijd, vage of verschuivende verhalen, en of het verhaal standhoudt tegen wat je al weet. Contact maken en open vragen leveren veel meer op dan beschuldigen.",
      points: [
        "Richt je op de inhoud en de samenhang van het verhaal.",
        "Leg het naast feiten die je kunt controleren.",
        "Stel open vragen en laat mensen praten.",
        "Weeg motief en context, niet minigebaartjes.",
      ],
    },
    {
      icon: "🤝",
      name: "Een cultuur van waarheid bouwen",
      tag: "Maak eerlijkheid de makkelijke keuze.",
      summary:
        "De beste verdediging tegen leugens is een omgeving waarin de waarheid veilig te vertellen is. Als eerlijkheid niet wordt afgestraft, hebben mensen veel minder reden om te misleiden.",
      points: [
        "Schiet niet op de boodschapper — beloon eerlijkheid.",
        "Maak het veilig om fouten toe te geven.",
        "Geef zelf het voorbeeld in eerlijkheid.",
        "Verminder de druk die liegen aantrekkelijk maakt.",
      ],
    },
  ],

  assessment: {
    mode: "quiz",
    shuffleOptions: false,
    kicker: "Mythe of feit?",
    heading: "Test je kennis over leugens herkennen",
    sub: "Tien gangbare overtuigingen over liegen. Bepaal of elke uitspraak een mythe of een feit is — en zie daarna wat het onderzoek echt zegt.",
    nav: "Test",
    icon: "🕵️",
    introTitle: "10 mythe-of-feitvragen",
    introText: "Kies bij elke uitspraak <em>Mythe</em> of <em>Feit</em>. Aan het eind krijg je het juiste antwoord met een korte uitleg.",
    resultEyebrow: "Jouw kennis over leugens herkennen",
    bands: [
      { min: 0, color: "#b3123a", label: "Mythegestuurd", title: "Misleid door volkswijsheid", blurb: "Je intuïtie volgt grotendeels de populaire mythes — en precies zo glippen goede leugenaars langs mensen. Het goede nieuws: de wetenschap is te leren." },
      { min: 50, color: "#f0a500", label: "Scherper", title: "Op de goede weg", blurb: "Je hebt een deel van de mythes losgelaten, maar een paar klassiekers laten je nog struikelen. Richt je op de inhoud en het motief in plaats van op lichaamstaal." },
      { min: 80, color: "#2a9d5c", label: "Waarheidsvast", title: "Waarheidsvast", blurb: "Je kijkt door de lichaamstaalfolklore heen en let op wat echt werkt: samenhang, feiten en motief. Lastig om de hand te lichten." },
    ],
    questions: [
      { q: "\"Leugenaars vermijden oogcontact.\"", explain: "Mythe. Veel leugenaars houden juist <em>meer</em> oogcontact om oprecht te lijken. Oogcontact zegt vrijwel niets over eerlijkheid.",
        options: [ { text: "Mythe", correct: true }, { text: "Feit" } ] },
      { q: "\"Je kunt een leugenaar betrouwbaar herkennen aan lichaamstaal alleen.\"", explain: "Mythe. Zelfs getrainde professionals scoren met lichaamstaal nauwelijks beter dan gokken. Er bestaat geen betrouwbaar 'signaal'.",
        options: [ { text: "Mythe", correct: true }, { text: "Feit" } ] },
      { q: "\"Friemelen en zenuwachtigheid bewijzen dat iemand liegt.\"", explain: "Mythe. Dat zijn tekenen van <em>stress</em>. Eerlijke maar gespannen mensen friemelen ook, en rustige leugenaars vaak niet.",
        options: [ { text: "Mythe", correct: true }, { text: "Feit" } ] },
      { q: "\"Wát iemand zegt verraadt meer dan hoe iemand beweegt.\"", explain: "Feit. Talige aanwijzingen — tegenstrijdigheden, vaagheid, botsen met bekende feiten — zijn veel nuttiger dan lichamelijke 'signalen'.",
        options: [ { text: "Feit", correct: true }, { text: "Mythe" } ] },
      { q: "\"Leugendetectors zijn nauwkeurig en overal geaccepteerd.\"", explain: "Mythe. Een polygraaf meet opwinding, geen leugens, maakt veel fouten en is in veel rechtbanken niet toelaatbaar.",
        options: [ { text: "Mythe", correct: true }, { text: "Feit" } ] },
      { q: "\"Omhoog en opzij kijken bewijst dat iemand liegt.\"", explain: "Mythe. Het idee van de 'oogrichting' uit de populaire psychologie is keer op keer ontkracht.",
        options: [ { text: "Mythe", correct: true }, { text: "Feit" } ] },
      { q: "\"Kleine leugens leiden meestal tot grotere.\"", explain: "Feit. Misleiding escaleert — één leugen heeft er nog een nodig om hem af te dekken, en elke leugen verhoogt de prijs van de waarheid.",
        options: [ { text: "Feit", correct: true }, { text: "Mythe" } ] },
      { q: "\"Wie zelfverzekerd en vlot praat, kan niet liegen.\"", explain: "Mythe. Geoefende leugenaars zijn juist vaak soepel en zelfverzekerd — vlotheid is geen eerlijkheid.",
        options: [ { text: "Mythe", correct: true }, { text: "Feit" } ] },
      { q: "\"Open vragen stellen en contact maken levert meer op dan beschuldigen.\"", explain: "Feit. Mensen laten praten legt tegenstrijdigheden bloot; beschuldigen maakt iedereen alleen defensief.",
        options: [ { text: "Feit", correct: true }, { text: "Mythe" } ] },
      { q: "\"Nadenken over het motief — waarom zouden ze liegen? — werkt beter dan letten op zenuwtrekjes.\"", explain: "Feit. Context en motief horen bij de nuttigste aanwijzingen; losse gebaartjes zijn ruis.",
        options: [ { text: "Feit", correct: true }, { text: "Mythe" } ] },
    ],
  },

  assessment2: {
    mode: "classify",
    kicker: "Tweede test",
    heading: "Het pad van de leugen",
    sub: "Misleiding escaleert in fasen. Denk aan een concrete situatie en kijk hoe ver die het pad al is afgelegd.",
    nav: "Het pad",
    icon: "\uD83E\uDDEC",
    introTitle: "8 waarnemingen",
    introText: "Houd één situatie in gedachten en kies de optie die er het beste bij past.",
    resultEyebrow: "Hoe ver de misleiding is geëscaleerd",
    categories: {
      white: {
        name: "Het leugentje om bestwil", icon: "\uD83D\uDD4A\uFE0F", color: "#64748b",
        summary: "Onschuldige sociale leugentjes die het dagelijks leven soepel houden. Op zich geen probleem — maar wel de deur waar de rest doorheen loopt.",
        signsTitle: "Hoe het eruitziet", handleTitle: "Wat je nu doet",
        signs: ["Kleine, vriendelijke smoesjes", "Geen echte prijs voor de waarheid", "Af en toe en sociaal", "Vertrouwen intact"],
        handle: ["Wees niet te streng op gewone sociale beleefdheid", "Geef het goede voorbeeld waar het ertoe doet", "Let op als 'onschuldig' begint op te schuiven", "Houd de waarheid goedkoop om te vertellen"],
      },
      cover: {
        name: "De doofpot", icon: "\uD83E\uDDE5", color: "#0891b2",
        summary: "Een leugen om één specifieke fout te verbergen of een gevolg te ontlopen. Nog beheersbaar — maar hier begint de escalatie.",
        signsTitle: "Hoe het eruitziet", handleTitle: "Wat je nu doet",
        signs: ["Eén specifiek ding verbergen", "Motief: de gevolgen ontlopen", "Eén barst in het vertrouwen", "Zet door als het in het nauw komt"],
        handle: ["Maak het veilig om de fout op te pakken", "Pak de angst achter de leugen aan", "Vang het op voordat er een tweede leugen nodig is", "Straf niet de eerlijkheid af die je wilt"],
      },
      web: {
        name: "Het web", icon: "\uD83D\uDD78\uFE0F", color: "#b45309",
        summary: "Leugens die zich vermenigvuldigen om elkaar overeind te houden. Elke nieuwe leugen verhoogt de prijs van de waarheid, en het verhaal gaat de persoon besturen.",
        signsTitle: "Hoe het eruitziet", handleTitle: "Wat je nu doet",
        signs: ["Leugens die leugens stutten", "Voortdurend, om consistent te blijven", "Vertrouwen ernstig aangetast", "Voegt een leugen toe zodra je doorvraagt"],
        handle: ["Bied een duidelijke, drama-arme uitweg naar de waarheid", "Verlaag de straf op schoon schip maken", "Schep veiligheid in plaats van detective te spelen", "Verwacht dat het eerst erger wordt voor het beter wordt"],
      },
      culture: {
        name: "De leugencultuur", icon: "\uD83C\uDFAD", color: "#b91c1c",
        summary: "Oneerlijkheid is normaal geworden — systemisch, verwacht, zelfs beloond. Het probleem is de omgeving, niet één persoon.",
        signsTitle: "Hoe het eruitziet", handleTitle: "Wat je nu doet",
        signs: ["Liegen is de norm", "Eerlijkheid geldt als naïef", "Vertrouwen is in wezen weg", "Een heel team of systeem doet mee"],
        handle: ["Verander wat beloond en bestraft wordt", "Bescherm en vier eerlijkheid in het openbaar", "Geef onvermoeibaar het voorbeeld van bovenaf", "Verminder de druk die liegen lonend maakt"],
      },
    },
    questions: [
      { q: "De leugens die je ziet zijn…", options: [
        { text: "Klein en sociaal smerend", cat: "white" },
        { text: "Bedoeld om één specifieke fout te verbergen", cat: "cover" },
        { text: "Aan het vermenigvuldigen om elkaar te stutten", cat: "web" },
        { text: "Overal — zo gaat het hier nu eenmaal", cat: "culture" },
      ]},
      { q: "Het motief lijkt te zijn…", options: [
        { text: "Gevoelens sparen", cat: "white" },
        { text: "Gevolgen ontlopen", cat: "cover" },
        { text: "Eerdere leugens beschermen", cat: "web" },
        { text: "Vooruitkomen in een oneerlijk systeem", cat: "culture" },
      ]},
      { q: "De prijs van de waarheid is nu…", options: [
        { text: "Vrijwel niets", cat: "white" },
        { text: "Een beetje schaamte", cat: "cover" },
        { text: "Een heel verhaal ontrafelen", cat: "web" },
        { text: "Je positie in de groep", cat: "culture" },
      ]},
      { q: "Hoe vaak gebeurt het?", options: [
        { text: "Af en toe en onschuldig", cat: "white" },
        { text: "Als ze in het nauw zitten", cat: "cover" },
        { text: "Voortdurend, om consistent te blijven", cat: "web" },
        { text: "Het is de norm, niet de uitzondering", cat: "culture" },
      ]},
      { q: "Als je doorvraagt…", options: [
        { text: "Geven ze het lachend toe", cat: "white" },
        { text: "Zetten ze door om gezichtsverlies te voorkomen", cat: "cover" },
        { text: "Voegen ze er nog een leugen aan toe", cat: "web" },
        { text: "Doen ze alsof eerlijkheid naïef is", cat: "culture" },
      ]},
      { q: "Het effect op het vertrouwen is…", options: [
        { text: "Nauwelijks noemenswaardig", cat: "white" },
        { text: "Een kleine barst", cat: "cover" },
        { text: "Ernstig aangetast", cat: "web" },
        { text: "Vertrouwen is in wezen weg", cat: "culture" },
      ]},
      { q: "Wie zijn erbij betrokken?", options: [
        { text: "Gewoon een vriendelijk smoesje", cat: "white" },
        { text: "Eén persoon die één ding verbergt", cat: "cover" },
        { text: "Eén persoon verstrikt in veel leugens", cat: "web" },
        { text: "Een heel team of systeem", cat: "culture" },
      ]},
      { q: "De eerlijke weg vraagt nu…", options: [
        { text: "Niets — het is prima zo", cat: "white" },
        { text: "Een snelle, ongevaarlijke bekentenis", cat: "cover" },
        { text: "Meerdere leugens tegelijk ontwarren", cat: "web" },
        { text: "De hele omgeving veranderen", cat: "culture" },
      ]},
    ],
  },

  handle: {
    kicker: "Veldgids",
    heading: "Hoe je dichter bij de waarheid komt",
    sub: "Je 'betrapt' leugenaars niet door harder te staren. Je komt dichter bij de waarheid door beter te luisteren.",
    nav: "De waarheid",
    cta: "Lees de gids voor waarheidsvinding →",
    cards: [
      { icon: "✅", title: "Doen", tone: "do", items: [
        "Luister naar het verhaal, niet naar de zenuwtrekjes", "Leg verklaringen naast bekende feiten", "Stel open vragen en laat mensen praten", "Weeg motief en context", "Geef eerlijkheid een veilige plek om te landen",
      ]},
      { icon: "⛔", title: "Niet doen", tone: "dont", items: [
        "Oogcontact of friemelen als bewijs zien", "Vertrouwen op je gevoel als 'leugendetector'", "Beschuldigen voordat je het begrijpt", "De boodschapper straffen", "Zenuwachtigheid lezen als schuld",
      ]},
      { icon: "🤝", title: "Het waarheidsvriendelijke gesprek", tone: "", items: [
        "Begin rustig, zonder oordeel", "Vraag ze het in hun eigen woorden te vertellen", "Vraag door op gaten en tegenstrijdigheden", "Stel gerust dat eerlijkheid veilig is", "Weeg het hele beeld, niet één moment",
      ]},
    ],
  },

  faq: [
    { q: "Is er dus geen betrouwbare manier om een leugenaar te herkennen?", a: "Geen enkel 'signaal' werkt op zichzelf. De beste aanpak combineert de inhoud van het verhaal, de samenhang met de feiten en het motief over de tijd — niet de volkswijsheid over lichaamstaal." },
    { q: "Waarom houden de mythes stand?", a: "Ze zijn intuïtief en worden eindeloos herhaald in film en televisie. Maar onderzoek laat steevast zien dat mensen — ook professionals — er nauwelijks beter mee scoren dan gokken." },
    { q: "Zijn leugendetectors waardeloos?", a: "Ze meten fysiologische opwinding, geen misleiding. Ze maken flink wat fouten en zijn in veel rechtssystemen niet toelaatbaar, dus ze zijn verre van de onfeilbare apparaten uit films." },
    { q: "Is een beetje liegen niet normaal?", a: "Jawel — kleine sociale leugentjes houden het dagelijks leven soepel. De zorg zit in escalatie: als leugens zich opstapelen, of als een cultuur eerlijkheid onveilig maakt." },
    { q: "Hoe zorg ik dat mensen niet tegen mij liegen?", a: "Maak de waarheid veilig. Als eerlijkheid niet wordt afgestraft en fouten toegegeven mogen worden, hebben mensen veel minder reden om te misleiden." },
    { q: "Kan ik hiermee bewijzen dat iemand gelogen heeft?", a: "Nee. Dit is een educatief hulpmiddel over hoe misleiding werkt, geen methode om iets over een echt persoon te beschuldigen of te 'bewijzen'." },
  ],

  disc: {
    kicker: "De vier kleuren",
    heading: "Liegen en de vier kleuren",
    sub: "Elke DISC-kleur buigt de waarheid op haar eigen manier. Ken het signaal — en dat van jezelf.",
    nav: "Kleuren",
    labels: { relate: "Hoe deze kleur meestal liegt", reflect: "Als dit jij bent — check jezelf", treat: "Hoe krijg je de waarheid boven" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Ontdek de DISC-kleurenworkshop →",
    colors: {
      red: {
        relate: "Roden liegen door te walsen — stevige overdrijving en 'vertrouw me nou maar' om te winnen en door te gaan.",
        reflect: "Controleer of je zelfverzekerdheid niet harder loopt dan de feiten.",
        treat: "Vraag om details en bewijs; laat je niet overrijden door pure stelligheid.",
      },
      yellow: {
        relate: "Gelen overdrijven en versieren om er goed uit te komen en het verhaal spannend te houden.",
        reflect: "Merk op wanneer een beter verhaal stilletjes het ware verhaal vervangt.",
        treat: "Geniet van het verhaal en toets daarna zachtjes de details aan de werkelijkheid.",
      },
      green: {
        relate: "Groenen vertellen vredesleugens — ja zeggen om een conflict te vermijden dat ze eigenlijk niet accepteren.",
        reflect: "Vraag jezelf af of je 'ja' eerlijk is of gewoon een lastig moment ontwijkt.",
        treat: "Maak het veilig om het oneens te zijn, zodat hun echte antwoord boven kan komen.",
      },
      blue: {
        relate: "Blauwen liegen zelden regelrecht, maar kunnen misleiden door dingen weg te laten of zich achter formaliteiten te verschuilen.",
        reflect: "Controleer of je precieze formulering niet de volledige waarheid verhult.",
        treat: "Stel volledige, specifieke vragen — ze beantwoorden precies wat je vraagt.",
      },
    },
  },
};

window.BOOK_NL = BOOK_NL;
