/* =============================================================================
   Omringd door narcisten — Nederlandse inhoud
   Educatieve workshop geïnspireerd op "Omringd door narcisten" van Thomas
   Erikson. Narcistische stijlen herkennen en je staande houden — NADRUKKELIJK
   geen klinisch of diagnostisch instrument. Structuur identiek aan data.js.
   ========================================================================== */
const BOOK_NL = {
  meta: {
    key: "narcissists",
    title: "Omringd door narcisten",
    subtitle: "Herken de vier gezichten en houd je staande",
    short: "Narcisten",
    emoji: "🪞",
    accent: "#7c3aed",
    eyebrow: "Een workshop van Thomas Erikson",
    description:
      "Een educatieve workshop geïnspireerd op 'Omringd door narcisten' van Thomas Erikson. Leer de vier gezichten van narcisme kennen en hoe je overeind blijft — geen klinisch of diagnostisch instrument.",
    heroTitle: "Altijd de belangrijkste<br />persoon in<br />de kamer?",
    heroLead:
      "Sommige mensen buigen elke situatie terug naar zichzelf. Leer de vier gezichten van narcisme uit <em>Omringd door narcisten</em> van Thomas Erikson — en hoe je jezelf staande houdt.",
    heroCta: "Bepaal het type",
    footerNote:
      "Een educatieve workshop geïnspireerd op <em>Omringd door narcisten</em> van Thomas Erikson. Het helpt je zelfgericht gedrag te herkennen en jezelf te beschermen — het is geen klinisch of diagnostisch instrument.",
  },

  learn: {
    kicker: "De ideeën",
    heading: "De vier gezichten van narcisme",
    sub: "Narcisme loopt over een spectrum, en het draagt meer dan één masker. Tik op een kaart om dieper te gaan.",
  },

  concepts: [
    {
      icon: "🌈",
      name: "Het spectrum",
      tag: "Van gezond zelfvertrouwen tot stoornis.",
      summary:
        "Een beetje aandacht voor jezelf is gezond. Narcisme wordt een probleem als iemand voortdurend superieur moet zijn, inleving mist en anderen behandelt als gereedschap voor het eigen imago. De meeste lastige mensen zitten ergens op het spectrum — niet aan het klinische uiteinde.",
      points: [
        "Gezond zelfvertrouwen vereist niet dat anderen kleiner worden.",
        "Het probleempatroon: grootheid + het gevoel ergens recht op te hebben + ontbrekende inleving.",
        "Trekken bestaan op een schaal — je reageert op gedrag, niet op etiketten.",
        "Je kunt iemand niet uit een broos, verdedigd zelfbeeld praten.",
      ],
    },
    {
      icon: "🎭",
      name: "De vier gezichten",
      tag: "Grandioos, kwetsbaar, altruïstisch, kwaadaardig.",
      summary:
        "Narcisme laat zich in heel verschillende stijlen zien. De grandioze schept op; de kwetsbare mokt; de altruïstische speelt deugd; de kwaadaardige controleert. De test helpt je te zien met wie je te maken hebt.",
      points: [
        "<strong>Grandioos:</strong> luid, superieur, hongerig naar bewondering.",
        "<strong>Kwetsbaar:</strong> broos, gekwetst, eeuwig slachtoffer.",
        "<strong>Altruïstisch:</strong> de 'heilige' die als goed gezien moet worden.",
        "<strong>Kwaadaardig:</strong> narcisme plus agressie en controle.",
      ],
    },
    {
      icon: "🔄",
      name: "De cyclus",
      tag: "Idealiseren, devalueren, afdanken.",
      summary:
        "Relaties met een narcist volgen vaak een patroon: eerst idealiseren ze je (liefdesbombardement), dan devalueren ze je zodra de werkelijkheid binnendringt, dan danken ze je af — om je soms daarna weer binnen te zuigen.",
      points: [
        "<strong>Idealiseren:</strong> intense lof en aandacht aan het begin.",
        "<strong>Devalueren:</strong> kritiek, kilte, de lat steeds verleggen.",
        "<strong>Afdanken:</strong> terugtrekken, vervangen of de schuld geven.",
        "De cyclus herkennen helpt je het niet meer persoonlijk op te vatten.",
      ],
    },
    {
      icon: "⛽",
      name: "Voeding en het valse zelf",
      tag: "Waarom ze jou nodig hebben.",
      summary:
        "Onder het bravoure zit een broos zelfbeeld dat constant gevoed moet worden — met aandacht, bewondering, drama of controle. Die brandstof heet 'narcistische voeding', en jij bent een bron ervan.",
      points: [
        "Het zelfverzekerde masker verbergt een kwetsbare kern.",
        "Aandacht — ook negatieve aandacht — is brandstof.",
        "Je reactie terugtrekken laat het patroon verhongeren.",
        "Jij bent niet verantwoordelijk voor het overeind houden van hun zelfbeeld.",
      ],
    },
    {
      icon: "🛡️",
      name: "Je staande houden",
      tag: "Grenzen, grijze steen, afstand.",
      summary:
        "Je verandert een narcist niet door uit te leggen hoe ze je kwetsen. Je beschermt jezelf met grenzen, weinig emotionele reactie en — waar nodig — afstand.",
      points: [
        "Stel grenzen en handhaaf ze zonder lange discussies.",
        "Gebruik de 'grijze steen': rustige, korte, saaie reacties.",
        "Houd je eigen werkelijkheid verankerd met vrienden die je vertrouwt.",
        "Bij kwaadaardig gedrag gaan veiligheid en afstand voor.",
      ],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Welk gezicht?",
    heading: "Met welke narcist heb je te maken?",
    sub: "Denk aan één specifiek persoon. Antwoord op wat je bij diegene waarneemt, dan schatten we in welke stijl het beste past.",
    nav: "Bepalen",
    icon: "🔎",
    introTitle: "12 waarnemingen",
    introText: "Houd één persoon in gedachten en kies de optie die het beste bij <em>hen</em> past. Er zijn geen foute antwoorden.",
    resultEyebrow: "De stijl waar je mee te maken hebt",
    categories: {
      grandiose: {
        name: "De grandioze narcist",
        icon: "👑",
        color: "#7c3aed",
        summary:
          "De klassieke narcist: groots, superieur en hongerig naar bewondering. Verblindend aan de oppervlakte, minachtend eronder.",
        signs: ["Schept voortdurend op en strooit met namen", "Moet de beste en het middelpunt zijn", "Kleineert 'gewone' mensen", "Beantwoordt kritiek met minachting", "Charmant tot je stopt met bewonderen"],
        handle: ["Voed de behoefte aan applaus niet", "Blijf rustig en onaangedaan", "Houd grenzen feitelijk en stevig", "Ga niet wedijveren om status", "Beperk je emotionele investering"],
      },
      vulnerable: {
        name: "De kwetsbare narcist",
        icon: "🌧️",
        color: "#db2777",
        summary:
          "De broze, verborgen narcist: naar buiten toe onzeker en tekortgedaan, maar net zo op zichzelf gericht — alles komt weer uit bij hun pijn.",
        signs: ["Chronisch slachtofferschap", "Overgevoelig voor krenking", "Jaloers en rancuneus", "Passief-agressief", "Praat je een schuldgevoel aan via hun lijden"],
        handle: ["Laat je niet vangen in redden", "Weersta de zuigkracht van het schuldgevoel", "Stel zachte maar stevige grenzen", "Weiger schuld die niet van jou is", "Bescherm je eigen energie"],
      },
      communal: {
        name: "De altruïstische narcist",
        icon: "😇",
        color: "#0891b2",
        summary:
          "De 'heilige' narcist: zoekt status via zichtbare deugd. De aardigste persoon in de kamer — zolang iedereen kijkt.",
        signs: ["Luide, opvoerende vriendelijkheid", "Houdt goede daden bij", "Anders onder vier ogen", "Schuldgevoel aanpraten over alles wat ze 'geven'", "Snakt naar morele bewondering"],
        handle: ["Merk op hoe het van publiek afhangt", "Laat je niet meeslepen door de vertoning", "Bedank ze, maar voel je niet eeuwig schuldig", "Houd je eigen morele kompas", "Beoordeel daden, geen aankondigingen"],
      },
      malignant: {
        name: "De kwaadaardige narcist",
        icon: "🐍",
        color: "#b91c1c",
        summary:
          "De gevaarlijkste mengeling: narcisme plus agressie en een voorliefde voor controle. Charme verbergt echte wreedheid.",
        signs: ["Manipulatief en controlerend", "Wraakzuchtig als je ze dwarszit", "Weinig of geen spijt", "Geniet van het ongemak van anderen", "Kan intimiderend of dreigend zijn"],
        handle: ["Zet je veiligheid voorop", "Beperk contact en haak af", "Leg alles vast", "Ga de confrontatie niet alleen aan", "Zoek zo nodig professionele of juridische steun"],
      },
    },
    questions: [
      { q: "Hoe zoeken ze meestal aandacht?", options: [
        { text: "Openlijk opscheppen over hun succes en status", cat: "grandiose" },
        { text: "Laten doorschemeren hoe ondergewaardeerd en tekortgedaan ze zijn", cat: "vulnerable" },
        { text: "Zorgen dat iedereen ziet hoe zorgzaam ze zijn", cat: "communal" },
        { text: "De ruimte domineren tot alle ogen op hen gericht zijn", cat: "malignant" },
      ]},
      { q: "Bij kritiek…", options: [
        { text: "Zetten ze je weg als jaloers of minder", cat: "grandiose" },
        { text: "Zakken ze weg in gekwetst zelfmedelijden", cat: "vulnerable" },
        { text: "Doen ze geschokt dat iemand zo'n goed mens kan wantrouwen", cat: "communal" },
        { text: "Slaan ze terug en laten ze je ervoor boeten", cat: "malignant" },
      ]},
      { q: "Hoe zien ze diep vanbinnen zichzelf?", options: [
        { text: "Superieur en uitzonderlijk", cat: "grandiose" },
        { text: "Broos maar stiekem bijzonder en onbegrepen", cat: "vulnerable" },
        { text: "Het meest onbaatzuchtige, morele mens in de buurt", cat: "communal" },
        { text: "Gerechtigd om te winnen, tot elke prijs", cat: "malignant" },
      ]},
      { q: "Hoe behandelen ze mensen die hen niets opleveren?", options: [
        { text: "Negeren ze als irrelevant", cat: "grandiose" },
        { text: "Benijden ze en zijn er stilletjes rancuneus over", cat: "vulnerable" },
        { text: "Spelen vriendelijkheid als er publiek is", cat: "communal" },
        { text: "Buiten ze uit of dumpen ze koeltjes", cat: "malignant" },
      ]},
      { q: "In een discussie…", options: [
        { text: "Praten ze met grootse stelligheid over je heen", cat: "grandiose" },
        { text: "Draaien ze het om tot zij het slachtoffer zijn", cat: "vulnerable" },
        { text: "Praten ze je een schuldgevoel aan over alles wat ze voor je deden", cat: "communal" },
        { text: "Dreigen, straffen of intimideren ze", cat: "malignant" },
      ]},
      { q: "Hun inleving is…", options: [
        { text: "Dun — anderen bestaan om hen te bewonderen", cat: "grandiose" },
        { text: "Volledig gericht op hun eigen pijn", cat: "vulnerable" },
        { text: "Een publieke voorstelling, geen privégewoonte", cat: "communal" },
        { text: "In wezen afwezig, soms wreed", cat: "malignant" },
      ]},
      { q: "Waar snakken ze het meest naar?", options: [
        { text: "Bewondering en status", cat: "grandiose" },
        { text: "Geruststelling en medelijden", cat: "vulnerable" },
        { text: "Gezien worden als de beste en de aardigste", cat: "communal" },
        { text: "Macht en controle", cat: "malignant" },
      ]},
      { q: "Als jij succes hebt…", options: [
        { text: "Maken ze het over zichzelf", cat: "grandiose" },
        { text: "Mokken ze of voelen ze zich bedreigd", cat: "vulnerable" },
        { text: "Claimen ze dat zij het mogelijk maakten", cat: "communal" },
        { text: "Ondermijnen of saboteren ze je", cat: "malignant" },
      ]},
      { q: "Hun charme voelt…", options: [
        { text: "Zelfverzekerd en verblindend", cat: "grandiose" },
        { text: "Zacht, behoeftig en meelijwekkend", cat: "vulnerable" },
        { text: "Warm, deugdzaam en behulpzaam", cat: "communal" },
        { text: "Berekend en roofzuchtig", cat: "malignant" },
      ]},
      { q: "Hoe gaan ze om met regels en grenzen?", options: [
        { text: "De regels gelden niet voor iemand als zij", cat: "grandiose" },
        { text: "Ze voelen zich erdoor vervolgd", cat: "vulnerable" },
        { text: "Ze buigen ze 'voor het hogere doel'", cat: "communal" },
        { text: "Ze breken ze en dagen je uit er iets van te zeggen", cat: "malignant" },
      ]},
      { q: "Na een conflict…", options: [
        { text: "Verwachten ze dat jij op je knieën terugkomt", cat: "grandiose" },
        { text: "Wachten ze tot jij hén troost en sorry zegt", cat: "vulnerable" },
        { text: "Herinneren ze iedereen eraan hoe vergevingsgezind ze zijn", cat: "communal" },
        { text: "Koesteren ze wrok en plannen ze wraak", cat: "malignant" },
      ]},
      { q: "Het gevoel waarmee je achterblijft is…", options: [
        { text: "Klein en niet gezien", cat: "grandiose" },
        { text: "Leeggezogen en schuldig", cat: "vulnerable" },
        { text: "Verward — ze lijken zo 'aardig'", cat: "communal" },
        { text: "Onrustig of bang", cat: "malignant" },
      ]},
    ],
  },

  handle: {
    kicker: "Veldgids",
    heading: "Hoe je je staande houdt",
    sub: "Je praat een narcist niet uit hun zelfbeeld. Je kunt wel je eigen grond beschermen.",
    nav: "Bescherm",
    cta: "Lees de overlevingsgids →",
    cards: [
      { icon: "✅", title: "Doen", tone: "do", items: [
        "Houd grenzen helder en consequent", "Blijf rustig en drama-arm (grijze steen)", "Houd je eigen versie van de werkelijkheid verankerd", "Beperk contact waar je kunt", "Zorg voor je eigen steunnetwerk",
      ]},
      { icon: "⛔", title: "Niet doen", tone: "dont", items: [
        "Verwachten dat ze jouw kant zien", "Discussiëren om erkenning die je toch niet krijgt", "Wedijveren om status of het morele gelijk", "Jezelf de schuld geven van de cyclus", "Jezelf afsnijden van bondgenoten",
      ]},
      { icon: "🪨", title: "Grijze steen en grenzen", tone: "", items: [
        "Wees rustig, kort en saai om te provoceren", "Benoem een grens één keer en handel er dan naar", "Leg niet steeds opnieuw uit of verantwoord je niet", "Trek de emotionele 'voeding' terug", "Schakel hulp in als het kwaadaardig wordt",
      ]},
    ],
  },

  faq: [
    { q: "Stelt deze test narcisme vast?", a: "Nee. Het is een educatief reflectiemiddel dat inschat welke <em>stijl</em> van zelfgericht gedrag je mogelijk ziet. Alleen een gekwalificeerd professional kan een narcistische persoonlijkheidsstoornis vaststellen." },
    { q: "Kan iemand meer dan één type zijn?", a: "Ja. De vier gezichten overlappen, en mensen schuiven ertussen afhankelijk van de situatie. Je uitslag toont de sterkste match plus de balans over alle vier." },
    { q: "Kan een narcist veranderen?", a: "Diepe verandering is zeldzaam en vraagt echte motivatie en professionele hulp. Jouw welzijn zou daar niet van mogen afhangen — richt je op grenzen en zelfbescherming." },
    { q: "Wat is de 'grijze steen'?", a: "De grijze steen betekent dat je zo saai en onbewogen wordt als een grijze steen: rustig, kort en emotioneel vlak, zodat je stopt met het leveren van de aandacht en het drama waar het patroon op draait." },
    { q: "Is mensen 'narcist' noemen niet oneerlijk?", a: "Dat kan het zijn. Deze workshop gaat over het herkennen van <em>gedragspatronen</em> en jezelf beschermen — niet over etiketten op mensen plakken. Gebruik het voor jezelf, om te begrijpen wat je meemaakt." },
    { q: "Wat als het kwaadaardig is en ik voel me onveilig?", a: "Zet je veiligheid voorop. Beperk contact, leg voorvallen vast, ga de confrontatie niet alleen aan en zoek contact met een hulpverlener, mensen die je vertrouwt of lokale hulpdiensten." },
  ],

  disc: {
    kicker: "De vier kleuren",
    heading: "Narcisten en de vier kleuren",
    sub: "Elke DISC-kleur loopt op een andere manier tegen een narcist aan. Ken je reflex — en bescherm hem.",
    nav: "Kleuren",
    labels: { relate: "Hoe deze kleur reageert", reflect: "Als dit jij bent — let op", treat: "Jouw beste bescherming" },
    link: "../DISC-profile-SurroundedByIdiots/index.html",
    linkLabel: "Vind jouw kleur in de DISC-workshop →",
    colors: {
      red: {
        relate: "Roden botsen frontaal en maken van elk contact een machtsstrijd waar een narcist van smult.",
        reflect: "Je drang om te winnen kan je vastzetten in een gevecht dat de narcist nooit zal opgeven.",
        treat: "Kies je gevechten en haak af bij ego-wedstrijden. Bescherm je doelen, niet je trots.",
      },
      yellow: {
        relate: "Gelen krijgen makkelijk een liefdesbombardement en snakken naar de verblindende goedkeuring van de narcist.",
        reflect: "Je honger naar bewondering maakt de idealisatiefase bedwelmend — en het afdanken verpletterend.",
        treat: "Anker je eigenwaarde buiten hun applaus en houd eerlijke vrienden dichtbij.",
      },
      green: {
        relate: "Groenen nemen de schuld op zich en bewaren de vrede, wat een narcist maar al te graag uitbuit.",
        reflect: "Je loyaliteit en je hekel aan conflict kunnen je veel te lang in de cyclus vasthouden.",
        treat: "Oefen met nee zeggen. De vrede bewaren is niet alleen jouw taak.",
      },
      blue: {
        relate: "Blauwen proberen te redeneren en punten te bewijzen die een narcist nooit oprecht zal aanvaarden.",
        reflect: "Je kunt energie verspillen aan het najagen van een logische erkenning die nooit komt.",
        treat: "Stop met discussiëren om erkenning. Leun op feiten, vastleggen en stevige grenzen.",
      },
    },
  },
};

window.BOOK_NL = BOOK_NL;
