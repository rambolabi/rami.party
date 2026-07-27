/* =============================================================================
   DISC Workshop — Inhoud & vragendata (Nederlands)
   Gebaseerd op het DISC-model dat Thomas Erikson populair maakte in "Omringd
   door idioten" en op het oorspronkelijke gedragsonderzoek van William
   Moulton Marston.

   Alle inhoud staat hier, zodat de logica in app.js schoon blijft en de
   workshoptekst aangepast kan worden zonder de motor aan te raken.
   ========================================================================== */

const DISC_NL = {
  /* ---- De vier kleurprofielen -------------------------------------------- */
  colors: {
    red: {
      key: "red",
      name: "Rood",
      label: "Dominantie",
      archetype: "De Drijver",
      hex: "#e63946",
      soft: "rgba(230, 57, 70, 0.12)",
      icon: "🔴",
      tagline: "Direct, daadkrachtig en resultaatgericht.",
      summary:
        "Roden zijn snel, ambitieus en doelgericht. Ze nemen het voortouw, beslissen razendsnel en gaan onvermoeibaar voor resultaat. Tijd is hun kostbaarste bezit, dus ze komen meteen ter zake.",
      traits: ["Direct", "Daadkrachtig", "Competitief", "Ambitieus", "Wilskrachtig", "Ongeduldig"],
      communication:
        "Kort en bondig. Roden vertellen liever dan dat ze vragen, focussen op de kern en hebben weinig geduld voor koetjes en kalfjes of lange uitleg. Geef ze eerst de conclusie.",
      decisions:
        "Snel en op instinct. Ze durven risico te nemen en kiezen liever een snelle imperfecte beslissing dan een trage perfecte. Ze beslissen en gaan door.",
      workEnv:
        "Een omgeving met tempo, autonomie, uitdaging en controle. Ze hebben een hekel aan routine, micromanagement en alles wat vertraagt.",
      strengths: ["Leiderschap en drive", "Levert onder druk", "Lost problemen efficiënt op", "Pakt uitdagingen op die anderen mijden", "Daadkrachtig in een crisis"],
      weaknesses: ["Ongeduldig en bot", "Slechte luisteraar", "Kan ongevoelig zijn", "Controlerend", "Walst over stillere mensen heen"],
      motivators: ["Winnen", "Controle en autonomie", "Nieuwe uitdagingen", "Zichtbaar resultaat", "De macht om te beslissen"],
      stress:
        "Onder druk wordt een Rode autoritair, agressief en nog ongeduldiger — bevelen blaffend en over mensen heen lopend.",
      interact:
        "Wees kort, wees helder, wees weg. Begin met de conclusie, bied duidelijke opties aan en laat hen kiezen, en verspil hun tijd nooit met overbodige details.",
    },
    yellow: {
      key: "yellow",
      name: "Geel",
      label: "Invloed",
      archetype: "De Inspirator",
      hex: "#f0a500",
      soft: "rgba(240, 165, 0, 0.14)",
      icon: "🟡",
      tagline: "Enthousiast, sociaal en overtuigend.",
      summary:
        "Gelen zijn de optimisten in de ruimte. Warm, spraakzaam en creatief: ze leven op van contact, ideeën en aandacht. Ze inspireren anderen met energie en zien overal mogelijkheden.",
      traits: ["Enthousiast", "Optimistisch", "Sociaal", "Overtuigend", "Creatief", "Spontaan"],
      communication:
        "Expressief en levendig. Gelen vertellen verhalen, gebruiken veel woorden en emotie, en houden van een publiek. Ze praten meer dan ze luisteren en kiezen warmte boven precisie.",
      decisions:
        "Intuïtief en op gevoel. Ze beslissen snel vanuit optimisme en onderbuik, maar opvolging en details blijven vaak liggen.",
      workEnv:
        "Sociaal, samenwerkend en flexibel, met afwisseling, erkenning en plezier. In een geïsoleerde, starre of detailzware rol gaan ze kwijnen.",
      strengths: ["Inspireert en motiveert", "Geboren netwerker", "Creatieve ideeënmachine", "Onuitputtelijke energie en optimisme", "Sterk voor een groep"],
      weaknesses: ["Chaotisch", "Slordig met details", "Praat door anderen heen", "Belooft te veel", "Verliest tijd en focus uit het oog"],
      motivators: ["Erkenning en applaus", "Sociale goedkeuring", "Nieuwe ervaringen", "Plezier en afwisseling", "Aardig gevonden worden"],
      stress:
        "Onder druk wordt een Gele warrig, chaotisch en defensief — nog meer praten terwijl de focus verdwijnt.",
      interact:
        "Wees vriendelijk en sociaal, laat hen praten, geef oprechte erkenning en houd het luchtig. Help met structuur en details zonder hun energie te doven.",
    },
    green: {
      key: "green",
      name: "Groen",
      label: "Stabiliteit",
      archetype: "De Steunpilaar",
      hex: "#2a9d5c",
      soft: "rgba(42, 157, 92, 0.13)",
      icon: "🟢",
      tagline: "Kalm, geduldig en betrouwbaar.",
      summary:
        "Groenen zijn de stabiele, loyale lijm van elk team. Geduldig, vriendelijk en betrouwbaar: ze hechten aan harmonie en zekerheid, luisteren meer dan ze praten en steunen iedereen om hen heen in stilte.",
      traits: ["Geduldig", "Betrouwbaar", "Ondersteunend", "Loyaal", "Goede luisteraar", "Gemakkelijk in de omgang"],
      communication:
        "Warm en zacht. Groenen luisteren aandachtig, praten rustig en mijden conflict. Ze zijn meegaand en attent, en dringen hun eigen mening zelden op.",
      decisions:
        "Langzaam en voorzichtig. Ze zoeken draagvlak, houden niet van plotselinge verandering en kiezen voor zekerheid. Ze hebben tijd en geruststelling nodig voordat ze ja zeggen.",
      workEnv:
        "Stabiel, harmonieus en voorspelbaar, met samenwerking en duidelijke zekerheid. Ze hebben een hekel aan conflict, onrust en constante verandering.",
      strengths: ["Betrouwbaar en loyaal", "Geduldig en rustgevend", "Uitstekende luisteraar", "Sterke teamspeler", "Ondersteunend onder druk"],
      weaknesses: ["Besluiteloos", "Mijdt conflict", "Weerstand tegen verandering", "Te meegaand", "Houdt bezwaren stil voor zich"],
      motivators: ["Zekerheid en stabiliteit", "Harmonie", "Waardering", "Anderen helpen", "Voorspelbare routine"],
      stress:
        "Onder druk wordt een Groene stil en teruggetrokken: naar buiten toe instemmend, van binnen in verzet, en oud zeer blijft hangen.",
      interact:
        "Wees geduldig en persoonlijk. Schakel een tandje terug, stel gerust, dring niet aan op een beslissing op het moment zelf, en laat zien dat verandering veilig en geleidelijk gaat.",
    },
    blue: {
      key: "blue",
      name: "Blauw",
      label: "Consciëntieusheid",
      archetype: "De Analist",
      hex: "#2e6fd6",
      soft: "rgba(46, 111, 214, 0.13)",
      icon: "🔵",
      tagline: "Precies, logisch en kwaliteitsgericht.",
      summary:
        "Blauwen zijn de zorgvuldige denkers. Analytisch, systematisch en detailgericht: ze staan voor nauwkeurigheid en kwaliteit, verzamelen eerst alle feiten en zijn er trots op dat het precies klopt.",
      traits: ["Precies", "Logisch", "Analytisch", "Systematisch", "Kwaliteitsgericht", "Gereserveerd"],
      communication:
        "Feitelijk en exact. Blauwen gebruiken weinig maar nauwkeurige woorden, letten op details en juistheid, en stellen veel vragen. Ze verkiezen cijfers op papier boven emotionele argumenten.",
      decisions:
        "Langzaam en grondig. Ze analyseren alle beschikbare feiten, mijden risico en willen volledige informatie voordat ze zich vastleggen. Snelheid telt minder dan gelijk hebben.",
      workEnv:
        "Georganiseerd, gestructureerd en rustig, met heldere verwachtingen en hoge kwaliteitsnormen. Ze hebben een hekel aan chaos, vaagheid en opgejaagd worden.",
      strengths: ["Nauwkeurig en grondig", "Hoge kwaliteitsnormen", "Sterke planner", "Analytische denker", "Ziet fouten die anderen missen"],
      weaknesses: ["Perfectionistisch", "Te kritisch", "Traag met beslissen", "Kan koel of afstandelijk overkomen", "Analyseverlamming"],
      motivators: ["Correctheid en kwaliteit", "Logica en expertise", "Duidelijke regels en structuur", "Gelijk hebben", "Tijd om het goed te doen"],
      stress:
        "Onder druk wordt een Blauwe kritisch, teruggetrokken en blijft hangen in analyse — steeds meer data eisen voordat er iets gebeurt.",
      interact:
        "Wees voorbereid en precies. Kom met feiten en details, klop je cijfers, geef hen bedenktijd en vermijd druk of overdreven emotie.",
    },
  },

  /* ---- Hoe elke kleur met elke kleur omgaat ------------------------------- */
  interactions: {
    red: {
      red: "Twee Roden respecteren elkaars drive maar botsen over controle. Spreek af wie waarover gaat en concurreer op resultaat, niet op ego.",
      yellow: "Roden waarderen de energie van Gelen maar raken geïrriteerd door het gepraat. Roden: gun ze even het woord; Gelen: kom ter zake.",
      green: "Roden walsen makkelijk over Groenen heen. Schakel terug, vraag actief om hun mening en waardeer hun loyaliteit in plaats van stilte voor instemming aan te zien.",
      blue: "Roden willen snelheid, Blauwen willen zekerheid. Geef Blauwen de feiten én een deadline; Roden mogen accepteren dat kwaliteit tijd kost.",
    },
    yellow: {
      red: "Gelen houden het bij Roden kort en richten zich op de uitkomst. Roden mogen de ideeën van Gelen erkennen voordat ze die neerschieten.",
      yellow: "Twee Gelen hebben enorm veel plezier maar weinig opvolging. Wijs iemand aan die besluiten en details vastlegt.",
      green: "Een warme, soepele combinatie. Gelen geven Groenen energie; Groenen aarden Gelen. Gelen moeten de rustigere Groene niet overweldigen.",
      blue: "Tegenpolen. Gelen voelen zich beoordeeld, Blauwen voelen zich opgejaagd. Gelen: kom met feiten; Blauwen: veeg enthousiasme niet weg.",
    },
    green: {
      red: "Groenen mogen hun wensen bij Roden hardop uitspreken in plaats van te verstommen. Roden mogen geduldig en geruststellend zijn.",
      yellow: "Groenen genieten van de warmte van Gelen maar hebben ook rust nodig. Laat de Gele sociaal het voortouw nemen en vraag om wat gas terug.",
      green: "Twee Groenen creëren harmonie maar mijden lastige besluiten. Iemand moet bereid zijn het moeilijke onderwerp aan te snijden.",
      blue: "Een stabiele, bedachtzame combinatie. Beiden mijden conflict en verandering, dus let op stilstand en onuitgesproken kwesties.",
    },
    blue: {
      red: "Blauwen geven Roden eerst de kern en pas op verzoek de details. Roden mogen Blauwen niet dwingen tot beslissingen uit de losse pols.",
      yellow: "Blauwen vinden Gelen onnauwkeurig; Gelen vinden Blauwen koud. Blauwen mogen milder zijn; Gelen mogen hun beweringen onderbouwen.",
      green: "Een rustige, zorgvuldige combinatie. Beiden hechten aan stabiliteit. Duw elkaar vriendelijk richting tijdige besluiten.",
      blue: "Twee Blauwen leveren hoge kwaliteit maar riskeren eindeloze analyse. Spreek een 'goed genoeg'-grens en een deadline af.",
    },
  },

  /* ---- Zelftest: geef aan hoe goed elke stelling bij JOU past ------------- */
  /* Likert 1–5. Elke stelling hoort bij één kleur. Volgorde wordt geschud.    */
  selfQuestions: [
    { color: "red", text: "Ik kom meteen ter zake en heb een hekel aan tijdverspilling." },
    { color: "red", text: "Ik neem graag de leiding en beslis snel." },
    { color: "red", text: "Ik ben competitief en wil winnen." },
    { color: "red", text: "Ik let meer op het resultaat dan op de gevoelens van anderen." },
    { color: "red", text: "Ik durf risico te nemen om een doel te bereiken." },
    { color: "yellow", text: "Ik ontmoet graag nieuwe mensen en sta graag in het middelpunt." },
    { color: "yellow", text: "Ik ben optimistisch en zie meestal de zonnige kant." },
    { color: "yellow", text: "Ik win mensen voor me met enthousiasme en energie." },
    { color: "yellow", text: "Ik praat graag en raak makkelijk aan de praat met vreemden." },
    { color: "yellow", text: "Ik kies liever flexibiliteit en afwisseling dan routine." },
    { color: "green", text: "Ik ben geduldig en verlies zelden mijn kalmte." },
    { color: "green", text: "Ik hecht aan harmonie en probeer conflict te vermijden." },
    { color: "green", text: "Mensen zien mij als betrouwbaar en ondersteunend." },
    { color: "green", text: "Ik hou van stabiliteit en niet van plotselinge veranderingen." },
    { color: "green", text: "Ik luister aandachtig en zet de behoeften van anderen vaak voor die van mezelf." },
    { color: "blue", text: "Ik let scherp op details en nauwkeurigheid." },
    { color: "blue", text: "Ik analyseer graag alle feiten voordat ik beslis." },
    { color: "blue", text: "Ik volg liever beproefde methodes en duidelijke regels." },
    { color: "blue", text: "Ik stel hoge eisen aan de kwaliteit van mijn werk." },
    { color: "blue", text: "Ik werk liever langzaam en grondig dan snel en slordig." },
  ],

  /* ---- Iemand anders observeren: kies wat het beste bij die persoon past -- */
  /* Elke optie hoort bij een kleur. De grafiek werkt na elk antwoord bij.     */
  othersQuestions: [
    {
      q: "Hoe communiceert deze persoon meestal?",
      options: [
        { color: "red", text: "Direct en bondig, gericht op de kern" },
        { color: "yellow", text: "Enthousiast en expressief, vol verhalen" },
        { color: "green", text: "Kalm en warm, luistert meer dan hij praat" },
        { color: "blue", text: "Precies en feitelijk, gericht op de details" },
      ],
    },
    {
      q: "Hoe neemt deze persoon beslissingen?",
      options: [
        { color: "red", text: "Snel en daadkrachtig" },
        { color: "yellow", text: "Op onderbuikgevoel en optimisme" },
        { color: "green", text: "Langzaam, op zoek naar instemming van anderen" },
        { color: "blue", text: "Zorgvuldig, na analyse van de feiten" },
      ],
    },
    {
      q: "In een vergadering zal deze persoon vooral…",
      options: [
        { color: "red", text: "De regie pakken en aansturen op een besluit" },
        { color: "yellow", text: "Veel praten en energie in de ruimte brengen" },
        { color: "green", text: "Anderen steunen en de rust bewaren" },
        { color: "blue", text: "Detailvragen stellen en gaten in het plan aanwijzen" },
      ],
    },
    {
      q: "Hun werkplek is meestal…",
      options: [
        { color: "red", text: "Functioneel — wat maar werkt" },
        { color: "yellow", text: "Vol persoonlijke spullen en souvenirs" },
        { color: "green", text: "Comfortabel en uitnodigend" },
        { color: "blue", text: "Netjes, geordend en systematisch" },
      ],
    },
    {
      q: "Bij een probleem gaan ze…",
      options: [
        { color: "red", text: "Het frontaal aanpakken en snel handelen" },
        { color: "yellow", text: "Hardop creatieve ideeën spuien" },
        { color: "green", text: "Zoeken naar een oplossing waar iedereen mee kan leven" },
        { color: "blue", text: "Het eerst grondig uitzoeken" },
      ],
    },
    {
      q: "Onder druk worden ze…",
      options: [
        { color: "red", text: "Veeleisend en controlerend" },
        { color: "yellow", text: "Warrig en chaotisch" },
        { color: "green", text: "Stil en teruggetrokken" },
        { color: "blue", text: "Kritisch en overdreven voorzichtig" },
      ],
    },
    {
      q: "Wat lijkt hen het meest te motiveren?",
      options: [
        { color: "red", text: "Winnen en resultaat boeken" },
        { color: "yellow", text: "Erkenning en sociale waardering" },
        { color: "green", text: "Zekerheid en anderen helpen" },
        { color: "blue", text: "Gelijk hebben en kwaliteit leveren" },
      ],
    },
    {
      q: "Hoe gaan ze om met verandering?",
      options: [
        { color: "red", text: "Omarmen die als het vooruitgang betekent" },
        { color: "yellow", text: "Worden enthousiast van de mogelijkheden" },
        { color: "green", text: "Verzetten zich en kiezen voor stabiliteit" },
        { color: "blue", text: "Willen die eerst volledig begrijpen" },
      ],
    },
    {
      q: "Hun lichaamstaal is meestal…",
      options: [
        { color: "red", text: "Stevig, direct oogcontact, snelle bewegingen" },
        { color: "yellow", text: "Levendig, veel gebaren, lachend" },
        { color: "green", text: "Ontspannen, zacht en warm" },
        { color: "blue", text: "Gereserveerd, beheerst, weinig gebaren" },
      ],
    },
    {
      q: "Als je het niet met hen eens bent, gaan ze…",
      options: [
        { color: "red", text: "Tegengas geven en hun poot stijf houden" },
        { color: "yellow", text: "Je met charme overtuigen" },
        { color: "green", text: "Het conflict mijden en toegeven" },
        { color: "blue", text: "Weerleggen met feiten en logica" },
      ],
    },
    {
      q: "Hoe gaan ze om met deadlines?",
      options: [
        { color: "red", text: "Duwen door om als eerste klaar te zijn" },
        { color: "yellow", text: "Zijn vaak te laat maar praten zich eruit" },
        { color: "green", text: "Gestaag en betrouwbaar" },
        { color: "blue", text: "Plannen zorgvuldig om ze precies te halen" },
      ],
    },
    {
      q: "In sociale situaties…",
      options: [
        { color: "red", text: "Netwerken ze doelgericht en vertrekken dan" },
        { color: "yellow", text: "Zijn ze het middelpunt van het feest" },
        { color: "green", text: "Verkiezen ze kleine, vertrouwde groepjes" },
        { color: "blue", text: "Kijken ze rustig toe vanaf de zijlijn" },
      ],
    },
    {
      q: "Hun grootste kracht is…",
      options: [
        { color: "red", text: "Dingen voor elkaar krijgen" },
        { color: "yellow", text: "Mensen inspireren en motiveren" },
        { color: "green", text: "Loyaal en betrouwbaar zijn" },
        { color: "blue", text: "Nauwkeurig werk van hoge kwaliteit leveren" },
      ],
    },
    {
      q: "Hun duidelijkste valkuil is…",
      options: [
        { color: "red", text: "Ongeduldig en bot zijn" },
        { color: "yellow", text: "Chaotisch en ongefocust zijn" },
        { color: "green", text: "Besluiteloos en conflictmijdend zijn" },
        { color: "blue", text: "Te kritisch en te traag zijn" },
      ],
    },
    {
      q: "Als ze feedback geven, zijn ze…",
      options: [
        { color: "red", text: "Bot en recht voor z'n raap" },
        { color: "yellow", text: "Aanmoedigend en positief" },
        { color: "green", text: "Zacht en tactvol" },
        { color: "blue", text: "Gedetailleerd en precies" },
      ],
    },
    {
      q: "Hoe ontvangen ze informatie het liefst?",
      options: [
        { color: "red", text: "Alleen de kern — houd het kort" },
        { color: "yellow", text: "Met energie en een persoonlijke toets" },
        { color: "green", text: "Op een vriendelijke, ontspannen manier" },
        { color: "blue", text: "Volledig uitgewerkt, onderbouwd met data" },
      ],
    },
  ],

  /* ---- Snelle indicator: 4 razendsnelle keuzes ---------------------------- */
  quickQuestions: [
    {
      q: "Kies het woord dat het beste past:",
      options: [
        { color: "red", text: "Gedreven" },
        { color: "yellow", text: "Extravert" },
        { color: "green", text: "Geduldig" },
        { color: "blue", text: "Precies" },
      ],
    },
    {
      q: "Het tempo is in de kern:",
      options: [
        { color: "red", text: "Snel & doortastend" },
        { color: "yellow", text: "Snel & hartelijk" },
        { color: "green", text: "Rustig & gestaag" },
        { color: "blue", text: "Rustig & zorgvuldig" },
      ],
    },
    {
      q: "De focus ligt vooral op:",
      options: [
        { color: "red", text: "Resultaat" },
        { color: "yellow", text: "Mensen & plezier" },
        { color: "green", text: "Harmonie" },
        { color: "blue", text: "Nauwkeurigheid" },
      ],
    },
    {
      q: "Onder stress worden ze:",
      options: [
        { color: "red", text: "Controlerend" },
        { color: "yellow", text: "Warrig" },
        { color: "green", text: "Teruggetrokken" },
        { color: "blue", text: "Kritisch" },
      ],
    },
  ],

  /* ---- Wel/niet doen bij elke kleur --------------------------------------- */
  tips: {
    red: {
      do: ["Wees kort en kom ter zake", "Focus op resultaat en doelen", "Bied opties en laat hen kiezen", "Wees zelfverzekerd en direct"],
      dont: ["Afdwalen of te veel uitleggen", "Hun tijd verspillen", "Te persoonlijk of emotioneel worden", "Hen proberen te sturen"],
    },
    yellow: {
      do: ["Wees warm en sociaal", "Laat hen praten en ideeën delen", "Geef erkenning en complimenten", "Houd het luchtig en positief"],
      dont: ["Ze bedelven onder details", "Koel of afwijzend doen", "Hun gevoelens negeren", "Ze vastpinnen met starre regels"],
    },
    green: {
      do: ["Wees geduldig en persoonlijk", "Geef geruststelling en zekerheid", "Voer verandering geleidelijk in", "Toon oprechte waardering"],
      dont: ["Ze opjagen of onder druk zetten", "Plotselinge verandering opleggen", "Conflict veroorzaken", "Hun stilte voor volledige instemming aanzien"],
    },
    blue: {
      do: ["Wees voorbereid en nauwkeurig", "Lever feiten en details", "Geef hen denktijd", "Respecteer hun standaarden"],
      dont: ["Vaag of slordig zijn", "Hun beslissing opjagen", "Te emotioneel worden", "Hun vragen wegwuiven"],
    },
  },

  /* ---- Veelgestelde vragen ------------------------------------------------ */
  faq: [
    {
      q: "Wat is het DISC-model?",
      a: "DISC is een gedragsmodel dat vier hoofdstijlen van gedrag en communicatie beschrijft: Dominantie (Rood), Invloed (Geel), Stabiliteit (Groen) en Consciëntieusheid (Blauw). Het bouwt voort op het werk van psycholoog William Moulton Marston en werd voor een breed publiek toegankelijk gemaakt door Thomas Erikson in <em>Omringd door idioten</em>.",
    },
    {
      q: "Kan ik meer dan één kleur zijn?",
      a: "Bijna iedereen is een mengeling. Ruwweg 80% van de mensen is een mix van twee kleuren, en velen combineren er drie. Zuivere eenkleurprofielen zijn zeldzaam. Je uitslag toont de verhouding tussen alle vier, zodat je je dominante en je secundaire stijl ziet.",
    },
    {
      q: "Is de ene kleur beter dan de andere?",
      a: "Nee. Elke kleur heeft echte sterktes en echte blinde vlekken. Het doel is niet om een 'betere' kleur te worden, maar om je eigen stijl te begrijpen en die bij te stellen om goed met anderen te communiceren.",
    },
    {
      q: "Is dit een wetenschappelijke persoonlijkheidstest?",
      a: "Deze workshop is een educatief instrument voor zelfreflectie, geïnspireerd op de DISC-taal uit <em>Omringd door idioten</em>. Hij is bedoeld om inzicht en betere gesprekken op gang te brengen, niet als klinische test of selectie-instrument.",
    },
    {
      q: "Hoe betrouwbaar is de test 'observeer iemand anders'?",
      a: "Die weerspiegelt jouw beeld van het gedrag van iemand anders, en dat is een nuttig startpunt. Echte mensen zijn complex en gedragen zich per situatie anders, dus zie de uitslag als een gespreksopener en niet als een oordeel.",
    },
    {
      q: "Waarom gedraag ik me anders op het werk dan thuis?",
      a: "Mensen passen hun gedrag vaak aan de situatie aan. Op het werk kun je onder druk vanuit de ene kleur leiden en thuis ontspannen vanuit een andere. Die flexibiliteit is normaal en gezond. Dit is precies het verschil tussen je <em>natuurlijke</em> stijl en je <em>aangepaste</em> stijl.",
    },
  ],

  /* ---- Observator RONDE 2: aangepaste stijl / stijl onder druk ------------ */
  /* Een korte tweede ronde. Vergeleken met ronde 1 laat die zien hoe iemand  */
  /* schuift van zijn natuurlijke naar zijn aangepaste (werk-/stress-)stijl.  */
  othersAdaptedQuestions: [
    {
      q: "Bij een krappe deadline gaan ze meestal…",
      options: [
        { color: "red", text: "Het overnemen en iedereen hard aansturen" },
        { color: "yellow", text: "De boel opzwepen en de stemming hooghouden" },
        { color: "green", text: "In stilte de boel stabiel houden" },
        { color: "blue", text: "Zich in de details terugtrekken en alles dubbelchecken" },
      ],
    },
    {
      q: "Als er een conflict uitbreekt, gaan ze…",
      options: [
        { color: "red", text: "Het frontaal aangaan" },
        { color: "yellow", text: "Het met charme gladstrijken" },
        { color: "green", text: "Zich terugtrekken en geen partij kiezen" },
        { color: "blue", text: "Een stap terug doen en analyseren wie gelijk heeft" },
      ],
    },
    {
      q: "Onder stress wordt hun toon…",
      options: [
        { color: "red", text: "Scherper en meer bevelend" },
        { color: "yellow", text: "Luider en warriger" },
        { color: "green", text: "Stiller en geslotener" },
        { color: "blue", text: "Koeler en kritischer" },
      ],
    },
    {
      q: "Als de druk oploopt, richten ze zich op…",
      options: [
        { color: "red", text: "Winnen en als eerste klaar zijn" },
        { color: "yellow", text: "Iedereen gemotiveerd houden" },
        { color: "green", text: "Het team bij elkaar houden" },
        { color: "blue", text: "Elk detail precies kloppend krijgen" },
      ],
    },
    {
      q: "Als plannen plotseling wijzigen, gaan ze…",
      options: [
        { color: "red", text: "Meteen een nieuwe richting doordrukken" },
        { color: "yellow", text: "Improviseren en positief blijven" },
        { color: "green", text: "Zich onzeker voelen en geruststelling zoeken" },
        { color: "blue", text: "Tijd willen om de feiten opnieuw te wegen" },
      ],
    },
    {
      q: "Op hun zwaarst belast noemen anderen hen soms…",
      options: [
        { color: "red", text: "Overheersend" },
        { color: "yellow", text: "Ongefocust" },
        { color: "green", text: "Te passief" },
        { color: "blue", text: "Muggenzifterig" },
      ],
    },
  ],

  /* ---- Zelftest met gedwongen keuze (ipsatief) ---------------------------- */
  /* Elke groep bevat één woord per kleur. De deelnemer kiest wat het MEEST en */
  /* het MINST bij hem past. Dit is de klassieke DISC-methode die sommige      */
  /* puristen verkiezen — hier als alternatief voor de Likert-test, zodat je   */
  /* beide kunt vergelijken.                                                   */
  forcedChoiceGroups: [
    { red: "Direct", yellow: "Enthousiast", green: "Geduldig", blue: "Precies" },
    { red: "Daadkrachtig", yellow: "Sociaal", green: "Loyaal", blue: "Analytisch" },
    { red: "Competitief", yellow: "Optimistisch", green: "Kalm", blue: "Zorgvuldig" },
    { red: "Stoutmoedig", yellow: "Spraakzaam", green: "Ondersteunend", blue: "Systematisch" },
    { red: "Resultaatgericht", yellow: "Overtuigend", green: "Betrouwbaar", blue: "Detailgericht" },
    { red: "Gezaghebbend", yellow: "Charmant", green: "Meegaand", blue: "Gereserveerd" },
    { red: "Ongeduldig", yellow: "Spontaan", green: "Gestaag", blue: "Grondig" },
    { red: "Veeleisend", yellow: "Speels", green: "Inschikkelijk", blue: "Voorzichtig" },
    { red: "Ambitieus", yellow: "Inspirerend", green: "Standvastig", blue: "Logisch" },
    { red: "Doortastend", yellow: "Expressief", green: "Zachtaardig", blue: "Nauwkeurig" },
  ],

  /* ---- Communicatiekaarten: "Hoe communiceer je met een …" ---------------- */
  /* Essentiële, deelbare omgangsinfo per kleur. Gebruikt colors[] plus de     */
  /* extra velden hieronder.                                                   */
  comms: {
    red: {
      essence: "Wees snel, wees kort, wees weg. Roden willen de kern, niet de aanloop.",
      intro:
        "Een Rode is gedreven, direct en ongeduldig. Ze meten een gesprek af aan het resultaat en haten verspilde tijd. Respecteer hun tempo en hun behoefte aan controle, en ze respecteren jou.",
      rules: [
        "Begin met de conclusie en geef daarna pas de redenen — nooit andersom.",
        "Bied duidelijke opties aan en laat hen de knoop doorhakken.",
        "Houd het kort: koppen, geen betogen.",
      ],
      goodPhrases: ["\"Kort samengevat: …\"", "\"Twee opties — jij beslist.\"", "\"Zo halen we het resultaat sneller.\""],
      badPhrases: ["\"Laat me eerst even de hele achtergrond schetsen…\"", "\"Ik weet het niet zeker, wat vind jij dat we moeten…\"", "\"Kunnen we het even hebben over hoe ik me hierbij voel?\""],
      email: "Maximaal één scherm. De onderwerpregel bevat de vraag. Bullets, benodigd besluit, deadline. Geen inleidend gebabbel.",
      conflict: "Blijf kalm en feitelijk, geef direct tegengas en trek je de botheid niet persoonlijk aan. Roden respecteren mensen die staan voor hun standpunt.",
      motivate: "Geef ze een uitdaging, autonomie en een duidelijke winst om achteraan te gaan. Ruim obstakels uit de weg.",
    },
    yellow: {
      essence: "Wees warm, wees sociaal, laat hen schitteren. Gelen verbinden via energie en mensen.",
      intro:
        "Een Gele is enthousiast, spraakzaam en verlangt naar contact en erkenning. Ze denken hardop en beslissen op gevoel. Sluit aan bij hun energie en ze nemen je moeiteloos mee.",
      rules: [
        "Open met warmte en wat gezellig gebabbel — de relatie komt eerst.",
        "Laat hen praten en help daarna vriendelijk de details en volgende stappen vastleggen.",
        "Benoem hun ideeën en bijdragen hardop.",
      ],
      goodPhrases: ["\"Goed idee — vertel me meer!\"", "\"Jij zou hier fantastisch in zijn.\"", "\"Laten we er iets leuks van maken.\""],
      badPhrases: ["\"Blijf alsjeblieft gewoon bij de feiten.\"", "\"Dat gaat nooit werken.\"", "\"Hier is een specificatie van 12 pagina's om te lezen.\""],
      email: "Houd het opgewekt en persoonlijk. Een vriendelijke opening, kleur en enthousiasme, en een duidelijke maar lichte oproep tot actie. Zet de details in bullets zodat ze niet verloren gaan.",
      conflict: "Kaart problemen zacht en persoonlijk aan, nooit via een koele schriftelijke uitbrander. Stel gerust dat de relatie goed zit terwijl je het probleem oplost.",
      motivate: "Geef ze erkenning, een podium, afwisseling en sociaal contact. Vier successen in het openbaar.",
    },
    green: {
      essence: "Wees geduldig, wees persoonlijk, wees geruststellend. Groenen openen zich als ze zich veilig voelen.",
      intro:
        "Een Groene is kalm, loyaal en hecht bovenal aan harmonie en zekerheid. Ze houden niet van druk, plotselinge verandering en conflict. Schakel terug, wees oprecht en geef ze tijd om zich op hun gemak te voelen.",
      rules: [
        "Neem het tempo terug en houd het persoonlijk en oprecht.",
        "Voer verandering geleidelijk in en leg het 'waarom' én het vangnet uit.",
        "Vraag rechtstreeks naar hun mening — uit zichzelf komen ze er zelden mee.",
      ],
      goodPhrases: ["\"Neem gerust je tijd, er is geen haast bij.\"", "\"Hoe voelt dit voor jou?\"", "\"We doen dit samen, stap voor stap.\""],
      badPhrases: ["\"Ik wil hier nu meteen een besluit over.\"", "\"Vanaf maandag gaat alles anders.\"", "\"Los het gewoon op.\""],
      email: "Warm en vriendelijk, niet kortaf. Schets de context, stel gerust over de impact en kondig ruim op tijd aan. Vermijd abrupte eisen.",
      conflict: "Drijf ze nooit in het nauw. Kaart zaken rustig aan, onder vier ogen, en bevestig dat de relatie veilig is. Let op stille, onuitgesproken bezwaren.",
      motivate: "Bied zekerheid, waardering, een stabiele routine en de kans om anderen te helpen. Benoem hun betrouwbaarheid oprecht.",
    },
    blue: {
      essence: "Wees voorbereid, wees nauwkeurig, wees logisch. Blauwen vertrouwen op feiten, niet op enthousiasme.",
      intro:
        "Een Blauwe is precies, analytisch en kwaliteitsgedreven. Ze willen feiten, details en denktijd, en wantrouwen bombarie en druk. Kom voorbereid en zorg dat je details kloppen.",
      rules: [
        "Kom met feiten, cijfers en details — en zorg dat ze exact kloppen.",
        "Geef ze tijd en ruimte om te analyseren; jaag het besluit niet op.",
        "Houd de emotie laag en de logica hoog.",
      ],
      goodPhrases: ["\"Hier zijn de cijfers en de bronnen.\"", "\"Neem de tijd die je nodig hebt om het na te kijken.\"", "\"Laten we dit precies goed doen.\""],
      badPhrases: ["\"Vertrouw me nou maar.\"", "\"We moeten dit binnen vijf minuten beslissen.\"", "\"Maak je niet druk om de details.\""],
      email: "Gestructureerd, correct en volledig. Geef het hele plaatje, onderbouwende data en duidelijke bronvermelding. Niets overdrijven — ze zien elke fout.",
      conflict: "Blijf kalm, feitelijk en zakelijk. Argumenteer met bewijs in plaats van gevoel, en geef ze bedenktijd voordat ze reageren.",
      motivate: "Geef ze heldere normen, kwalitatief werk, vakkennis om zich in te verdiepen en de tijd om het goed te doen. Respecteer hun behoefte om gelijk te hebben.",
    },
  },

  /* ---- Communicatiekaarten voor tweekleurige combinaties ------------------ */
  /* De sleutels zijn alfabetisch gerangschikte kleurenparen.                  */
  pairComms: {
    "blue-red": {
      title: "Rood · Blauw",
      intro:
        "Een Rood-Blauwe combinatie is een gedreven perfectionist: snel resultaat <em>én</em> precies goed. Taakgericht en weinig warm, waardoor ze bot, veeleisend en moeilijk tevreden te stellen kunnen overkomen.",
      tension: "Rood zegt 'nu live'; Blauw zegt 'pas als het perfect is'. Van binnen willen ze snelheid en kwaliteit tegelijk, wat hen kritisch maakt op iedereen die geen van beide levert.",
      howTo: [
        "Kom met zowel de kern als de onderbouwende details paraat.",
        "Wees efficiënt maar nauwkeurig — slordige snelheid verliest de Blauwe, eindeloze details de Rode.",
        "Reken op directheid en hoge eisen; trek kritiek je niet persoonlijk aan.",
        "Geef ze de regie en zorg dat je feiten kloppen.",
      ],
      watch: "Bijzonder weinig geduld voor omhaal, gevoelens of fouten. Houd het strak, correct en to the point.",
    },
    "red-yellow": {
      title: "Rood · Geel",
      intro:
        "Een Rood-Gele combinatie is een snelle, doortastende en charismatische drijfveer: stoutmoedig en resultaatbelust, maar ook extravert en overtuigend. Ze leiden vanaf de voorste linie en winnen graag met stijl.",
      tension: "Rood wil resultaat, Geel wil applaus — dus jagen ze op grote, zichtbare successen en lopen ze onderweg makkelijk over stillere mensen heen.",
      howTo: [
        "Wees energiek en kom ter zake — sluit aan bij hun tempo en hun bruis.",
        "Geef ze zowel een uitdaging als erkenning.",
        "Laat ze leiden en schitteren, maar houd ze aan de opvolging en de details.",
        "Wees niet timide — ze respecteren zelfvertrouwen.",
      ],
      watch: "Ongeduldig en dominant. Ze praten door je heen en slaan details over — leg specifieke afspraken vast voordat ze weer verder zijn.",
    },
    "green-red": {
      title: "Rood · Groen",
      intro:
        "Een Rood-Groene combinatie is ongewoon — een gedreven presteerder met een zorgzame, mensgerichte kant. Ze duwen door op resultaat maar zorgen oprecht voor hun team, en schakelen tussen doortastend en ondersteunend.",
      tension: "Rood wil vooruit stormen, Groen wil harmonie en stabiliteit — daardoor kunnen ze inconsequent lijken: het ene moment beslist, het volgende meegaand.",
      howTo: [
        "Lees af in welke modus ze zitten: resultaatdrijver of steunpilaar.",
        "Wees direct maar persoonlijk — respecteer zowel het doel als de relatie.",
        "Gun ze tijd bij mensenbeslissingen en tempo bij taakbeslissingen.",
        "Wees oprecht; ze hebben een hekel aan politiek spel.",
      ],
      watch: "De twee kanten kunnen van binnen botsen. Verwar hun ondersteunende momenten niet met een gebrek aan drive.",
    },
    "blue-yellow": {
      title: "Geel · Blauw",
      intro:
        "Een Geel-Blauwe combinatie is een zeldzamere koppeling van tegenpolen: creatief en sociaal én tegelijk precies en analytisch. Ze bedenken grootse ideeën en pluizen die daarna tot op de komma uit.",
      tension: "Geel wil enthousiasmeren en improviseren, Blauw wil feiten en structuur — dus slaan ze om van uitgelaten naar veeleisend, soms binnen één zin.",
      howTo: [
        "Breng zowel warmte als bewijs mee — ze reageren op enthousiasme dat feitelijk klopt.",
        "Geef ruimte aan ideeën en help die daarna structureren.",
        "Wees niet te drammerig en niet te vaag; tegen allebei komen ze in verzet.",
        "Erken zowel hun creativiteit als hun nauwkeurigheid.",
      ],
      watch: "Ze kunnen razendsnel omslaan van optimistisch naar kritisch. Geef ze feiten zodat ze het enthousiasme durven vertrouwen.",
    },
    "green-yellow": {
      title: "Geel · Groen",
      intro:
        "Een Geel-Groene combinatie is de warmste van allemaal: sociaal, vriendelijk, ondersteunend en makkelijk aardig te vinden. Ze zetten mensen en relaties voorop en houden de sfeer positief.",
      tension: "Beide kanten mijden conflict en lastige besluiten, dus beloven ze soms te veel, vermijden ze moeilijke boodschappen of vinden ze het lastig om nee te zeggen.",
      howTo: [
        "Wees vriendelijk, warm en zonder haast — de relatie telt het zwaarst.",
        "Geef geruststelling en oprechte waardering.",
        "Help ze met structuur, deadlines en moeilijke keuzes.",
        "Wees nooit hard of koel — dat komt bij hen binnen.",
      ],
      watch: "Ze mijden conflict en zeggen soms ja alleen om de lieve vrede te bewaren. Check of een 'ja' echt een ja is.",
    },
    "blue-green": {
      title: "Groen · Blauw",
      intro:
        "Een Groen-Blauwe combinatie is kalm, zorgvuldig en door en door betrouwbaar: rustig, precies en stabiel. Ze hechten aan zekerheid, kwaliteit en het netjes doen, en zoeken zelden de schijnwerpers.",
      tension: "Beide kanten zijn voorzichtig en veranderingsschuw, dus kunnen ze traag beslissen en zich verzetten tegen alles wat plotseling of riskant is.",
      howTo: [
        "Wees geduldig, voorbereid en precies tegelijk.",
        "Geef ze details, geruststelling en tijd — jaag ze nooit op.",
        "Voer verandering langzaam in, met feiten en een helder plan.",
        "Respecteer hun standaarden en hun behoefte aan zekerheid.",
      ],
      watch: "Traag, stil en risicomijdend. Stilte kan onenigheid verbergen — vraag actief naar hun eerlijke mening.",
    },
  },
};

window.DISC_NL = DISC_NL;
