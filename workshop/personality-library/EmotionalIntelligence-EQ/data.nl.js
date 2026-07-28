/* =============================================================================
   Emotionele intelligentie (EQ) — Nederlandse inhoud
   Structuur identiek aan data.js; alleen de leesbare teksten zijn vertaald.
   Sleutels, kleuren, iconen, punten en volgorde blijven ongewijzigd.
   ========================================================================== */
const BOOK_NL = {
  meta: {
    key: "eq",
    title: "Emotionele intelligentie",
    subtitle: "De vaardigheid achter elke relatie",
    short: "EQ",
    emoji: "🫀",
    accent: "#059669",
    eyebrow: "Een vaardighedenmodel",
    description:
      "Een educatieve workshop over emotionele intelligentie (EQ). Meet je emotionele vaardigheden op zelfbewustzijn, zelfmanagement, empathie en sociale vaardigheid — en laat ze groeien.",
    heroTitle: "De slimste vaardigheid<br />is niet IQ.",
    heroLead:
      "Hoe goed je emoties leest en hanteert — die van jezelf en die van anderen — bepaalt je relaties, je werk en je geluk meer dan puur verstand. Meet je <em>EQ</em> en leer hem te laten groeien.",
    heroCta: "Meet je EQ",
    footerNote:
      "Een educatieve workshop over emotionele intelligentie, bekend geworden door Daniel Goleman. Een zelftest is een spiegel om van te groeien, geen gevalideerde klinische test.",
    footerSupport:
      "Emotionele intelligentie is een set vaardigheden die je kunt leren. Ontdek de andere modellen in <strong>De Mensenbibliotheek</strong> en begrijp de mensen op wie je ze toepast.",
  },

  learn: {
    kicker: "De ideeën",
    heading: "De vier vaardigheden van EQ",
    sub: "Emotionele intelligentie is geen vaste eigenschap maar een set aan te leren vaardigheden, meestal gegroepeerd in vier domeinen. Tik op een kaart om dieper te gaan.",
  },

  concepts: [
    {
      icon: "🫀", name: "Wat EQ is", tag: "Emoties lezen en hanteren.",
      summary: "Emotionele intelligentie is het vermogen om emoties te herkennen, te begrijpen en te sturen — die van jou en die van anderen — en dat besef te gebruiken om je denken en doen te leiden. Het voorspelt succes in relaties en loopbaan sterk.",
      points: ["Emoties accuraat herkennen.", "Begrijpen wat ze aandrijft.", "Ze sturen in plaats van erdoor geregeerd worden.", "Ze gebruiken om goede keuzes te maken."],
    },
    {
      icon: "🪞", name: "Zelfbewustzijn", tag: "Ken je eigen weer.",
      summary: "De basis: opmerken wat je voelt terwijl je het voelt, en begrijpen hoe je emoties je denken en je gedrag kleuren. Zonder dit hebben de andere vaardigheden niets om mee te werken.",
      points: ["Benoem emoties zodra ze opkomen.", "Merk je triggers en patronen op.", "Zie hoe gevoelens je daden sturen.", "Eerlijke zelfkennis, blinde vlekken incluis."],
    },
    {
      icon: "🧘", name: "Zelfmanagement", tag: "Reageer bewust, niet impulsief.",
      summary: "Zelfbewustzijn inzetten om de regie te houden: pauzeren voor je reageert, heftige gevoelens kalmeren, gemotiveerd blijven en meebewegen. Het is de ruimte tussen een impuls en een daad.",
      points: ["Pauzeer tussen voelen en doen.", "Kalmeer en kanaliseer heftige emoties.", "Blijf gemotiveerd na tegenslag.", "Pas je aan in plaats van te ontploffen."],
    },
    {
      icon: "💞", name: "Empathie", tag: "Voel de sfeer aan.",
      summary: "Aanvoelen wat anderen voelen en de dingen vanuit hun kant zien — ook als ze het niet zeggen. Empathie is de sociale radar die vertrouwen, invloed en verbinding mogelijk maakt.",
      points: ["Pik onuitgesproken gevoelens op.", "Kijk door de ogen van de ander.", "Luister naar wat onder de woorden zit.", "Reageer op de mens, niet alleen op de boodschap."],
    },
    {
      icon: "🤝", name: "Sociale vaardigheid", tag: "Ga goed om met relaties.",
      summary: "Alles samenbrengen in het contact zelf: helder communiceren, conflict hanteren, een klik opbouwen en het beste in mensen naar boven halen. Het is EQ die zichtbaar wordt in hoe je met anderen omgaat.",
      points: ["Communiceer helder en warm.", "Hanteer conflict zonder schade.", "Bouw een klik en vertrouwen op.", "Haal het beste in mensen naar boven."],
    },
  ],

  assessment: {
    mode: "score",
    shuffle: false,
    shuffleOptions: false,
    kicker: "Zelftest",
    heading: "Hoe hoog is jouw EQ?",
    sub: "Geef aan hoe waar elke stelling voor jou is. Vijftien items over de vier EQ-vaardigheden geven je een meting. Wees eerlijk — dit is een spiegel.",
    nav: "Meten",
    icon: "🫀",
    introTitle: "15 stellingen",
    introText: "Antwoord over hoe je doorgaans bent, niet over hoe je zou willen zijn. Duurt ongeveer twee minuten.",
    resultEyebrow: "Jouw emotionele intelligentie",
    scaleLow: "In ontwikkeling",
    scaleHigh: "Sterk ontwikkeld",
    bands: [
      { min: 0, color: "#b3123a", label: "In ontwikkeling", title: "Ruimte om te groeien",
        blurb: "Je EQ-vaardigheden zijn nog in ontwikkeling — en dat is echt goed nieuws, want anders dan IQ kun je emotionele intelligentie op elke leeftijd leren.",
        adviceTitle: "Begin hier",
        advice: ["Benoem je emoties zodra ze opkomen — benoemen kalmeert.", "Pauzeer voor je reageert als iets je raakt.", "Vraag één iemand hoe het écht gaat, en luister helemaal.", "Kies één patroon in een relatie dat je wilt veranderen."] },
      { min: 50, color: "#f0a500", label: "Degelijk", title: "Een degelijke emotionele gereedschapskist",
        blurb: "Je gaat vaak goed om met emoties en relaties, met duidelijke ruimte om één of twee van de vier vaardigheden aan te scherpen.",
        adviceTitle: "Een niveau hoger",
        advice: ["Zoek uit welke van de vier vaardigheden je zwakste is en werk daaraan.", "Oefen het pauzeren op je moeilijkste momenten, niet op je makkelijke.", "Verdiep je empathie: spiegel terug wat de ander voelt.", "Vraag eerlijke feedback over hoe je overkomt."] },
      { min: 78, color: "#2a9d5c", label: "Hoog", title: "Emotioneel intelligent",
        blurb: "Je leest en stuurt emoties vaardig, bij jezelf en bij anderen. Blijf oefenen — en help het EQ van de mensen om je heen omhoog.",
        adviceTitle: "Houd het sterk",
        advice: ["Blijf je eigen emoties benoemen en reguleren.", "Gebruik je empathie om het beste in anderen naar boven te halen.", "Wees het voorbeeld van kalme, heldere communicatie onder druk.", "Coach iemand in de vaardigheden die jou makkelijk afgaan."] },
    ],
    questions: [
      "Ik kan benoemen wat ik voel terwijl ik het voel.",
      "Ik merk hoe mijn stemming mijn gedachten en keuzes kleurt.",
      "Ik ken mijn emotionele triggers en patronen.",
      "Ik blijf kalm en helder denken onder druk.",
      "Ik pauzeer voor ik reageer als ik van slag ben.",
      "Ik veer op na tegenslag zonder er lang in te blijven hangen.",
      "Ik voel aan hoe anderen zich voelen, ook als ze het niet zeggen.",
      "Ik kan situaties echt door de ogen van anderen zien.",
      "Mensen voelen zich begrepen als ze met mij praten.",
      "Ik luister naar wat er onder iemands woorden zit.",
      "Ik ga om met meningsverschillen zonder de relatie te beschadigen.",
      "Ik breng mijn gevoelens helder en rustig onder woorden.",
      "Ik bouw makkelijk een klik en vertrouwen op met nieuwe mensen.",
      "Ik kan anderen helpen kalmeren als ze van slag zijn.",
      "Ik pas mijn aanpak aan op verschillende mensen en stemmingen.",
    ].map((q) => ({
      q,
      options: [
        { text: "Zelden waar", points: 0 },
        { text: "Soms waar", points: 1 },
        { text: "Vaak waar", points: 2 },
        { text: "Bijna altijd waar", points: 3 },
      ],
    })),
  },

  handle: {
    kicker: "Aan de slag",
    heading: "Je EQ laten groeien",
    sub: "Emotionele intelligentie is een spier. Zo train je elk onderdeel ervan.",
    nav: "Groeien",
    cta: "Terug naar de Mensenbibliotheek →",
    cards: [
      { icon: "🪞", title: "Zelfbewustzijn & zelfmanagement", tone: "do", items: [
        "Benoem emoties op het moment dat ze opkomen", "Schrijf elke dag twee regels over hoe je je voelt", "Pauzeer en adem voor je reageert", "Benoem je drie grootste triggers", "Vraag jezelf: 'wat heb ik nu eigenlijk nodig?'",
      ]},
      { icon: "💞", title: "Empathie & sociale vaardigheid", tone: "", items: [
        "Spiegel terug wat de ander lijkt te voelen", "Luister om te begrijpen, niet om te antwoorden", "Word nieuwsgierig voor je oordeelt", "Herstel snel na wrijving", "Complimenteer oprecht en concreet",
      ]},
      { icon: "⛔", title: "Vermijd", tone: "dont", items: [
        "Emoties opkroppen of ontkennen", "Reageren in het heetst van de strijd", "Aannemen dat je weet wat anderen voelen", "Discussies winnen ten koste van vertrouwen", "EQ zien als vaststaand — dat is het niet",
      ]},
    ],
  },

  faq: [
    { q: "Is EQ belangrijker dan IQ?", a: "Voor relaties, leiderschap en dagelijks geluk telt emotionele intelligentie vaak zwaarder. IQ helpt je aan de baan; EQ helpt je erin te floreren, met mensen erbij." },
    { q: "Kun je emotionele intelligentie leren?", a: "Ja — en dat is het mooie eraan. Anders dan IQ is EQ een set vaardigheden die je op elke leeftijd kunt opbouwen met oefening en feedback." },
    { q: "Wat zijn de vier delen van EQ?", a: "Zelfbewustzijn (je emoties kennen), zelfmanagement (ermee omgaan), empathie (anderen lezen) en sociale vaardigheid (relaties goed hanteren)." },
    { q: "Betekent een hoog EQ dat je altijd 'aardig' bent?", a: "Nee. Het betekent bewust en vaardig zijn — en soms vraagt dat om een lastig gesprek dat je rustig voert, of om een grens die je met empathie bewaakt." },
    { q: "Hoe nauwkeurig is een zelftest van 15 items?", a: "Het is een spiegel om over na te denken, geen gevalideerd instrument, en zelfrapportage heeft blinde vlekken. Combineer het met eerlijke feedback van mensen die je kennen." },
    { q: "Hoe verhoog ik mijn EQ echt?", a: "Begin klein en concreet: benoem je gevoelens, pauzeer voor je reageert en luister elke dag echt naar één iemand. Vaardigheden groeien door herhaling." },
  ],
};

window.BOOK_NL = BOOK_NL;
