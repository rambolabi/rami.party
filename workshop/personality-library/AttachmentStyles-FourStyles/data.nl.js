/* =============================================================================
   Hechtingsstijlen — Nederlandse inhoud
   Structuur identiek aan data.js; alleen de leesbare teksten zijn vertaald.
   Categoriesleutels, kleuren, iconen en volgorde blijven ongewijzigd.
   ========================================================================== */
const BOOK_NL = {
  meta: {
    key: "attachment",
    title: "Hechtingsstijlen",
    subtitle: "Hoe je bindt, liefhebt en met nabijheid omgaat",
    short: "Hechting",
    emoji: "🔗",
    accent: "#0d9488",
    eyebrow: "Een relatiemodel",
    description:
      "Een educatieve workshop over de vier hechtingsstijlen bij volwassenen. Ontdek hoe jij met nabijheid omgaat en hoe je naar veilige verbinding groeit.",
    heroTitle: "Hoe doe jij<br />nabijheid?",
    heroLead:
      "De manier waarop je je als kind hechtte, kleurt hoe je als volwassene liefhebt. Leer de vier <em>hechtingsstijlen</em> kennen — veilig, angstig, vermijdend en angstig-vermijdend — en vind de jouwe.",
    heroCta: "Vind jouw stijl",
    footerNote:
      "Een educatieve workshop over hechtingstheorie bij volwassenen (Bowlby, Ainsworth en latere onderzoekers). Een hulpmiddel om over na te denken en te groeien, geen klinische diagnose of therapie.",
    footerSupport:
      "Hechtingstheorie komt uit decennia psychologisch onderzoek. Ontdek de andere modellen in <strong>De Mensenbibliotheek</strong> voor het grotere plaatje.",
  },

  learn: {
    kicker: "De ideeën",
    heading: "De blauwdruk voor nabijheid",
    sub: "Vroege banden vormen een sjabloon voor hoe veilig intimiteit voelt. Tik op een kaart om dieper te gaan.",
  },

  concepts: [
    {
      icon: "🔗", name: "Wat hechting is", tag: "Jouw blauwdruk voor nabijheid.",
      summary: "Hechtingstheorie zegt dat onze allereerste relaties ons leren of mensen veilig en betrouwbaar zijn, en of je op ze kunt bouwen. Die les wordt een sjabloon dat we meenemen naar vriendschappen en liefde als volwassene.",
      points: ["Opgebouwd uit vroege ervaringen met zorg.", "Bepaalt hoe veilig intimiteit voelt.", "Draait grotendeels op de automatische piloot.", "Komt het sterkst naar boven bij stress en ruzie."],
    },
    {
      icon: "🧭", name: "De vier stijlen", tag: "Veilig, angstig, vermijdend, angstig-vermijdend.",
      summary: "Volwassenen neigen naar een van vier stijlen: veilig (op je gemak met nabijheid), angstig (snakt ernaar maar vreest verlating), vermijdend (zet zelfstandigheid boven intimiteit) en angstig-vermijdend (wil nabijheid maar is bang om gekwetst te worden).",
      points: ["<strong>Veilig</strong> — vertrouwt en leunt zonder moeite.", "<strong>Angstig</strong> — snakt naar nabijheid, vreest verlating.", "<strong>Vermijdend</strong> — koestert vrijheid, ontwijkt intimiteit.", "<strong>Angstig-vermijdend</strong> — wil liefde maar zet zich schrap voor pijn."],
    },
    {
      icon: "🌱", name: "Waar het vandaan komt", tag: "Niet jouw schuld.",
      summary: "Je stijl is geen gebrek en geen keuze — het is een aanpassing aan hoe beschikbaar en consequent je eerste verzorgers waren. Het met mildheid begrijpen is de eerste stap om het te veranderen.",
      points: ["Het is een aanpassing, geen defect.", "Consequente zorg bouwt meestal veiligheid.", "Wisselvallige zorg kan angst voeden.", "Afstandelijke zorg kan vermijding voeden."],
    },
    {
      icon: "🔄", name: "Stijlen kunnen veranderen", tag: "Verworven veiligheid.",
      summary: "Je hechtingsstijl is geen levenslange straf. Via gezonde relaties, zelfinzicht en soms therapie kunnen mensen opschuiven naar 'verworven veiligheid' — het goede nieuws in het hart van de theorie.",
      points: ["Je stijl kan met de tijd verschuiven.", "Veilige partners kunnen je helpen helen.", "Zelfinzicht maakt oude patronen losser.", "'Verworven veiligheid' is heel goed mogelijk."],
    },
    {
      icon: "🤝", name: "Hoe stijlen botsen", tag: "Waarom stellen vastlopen.",
      summary: "Stijlen werken op elkaar in. De klassieke pijnlijke combinatie is angstig plus vermijdend: de een achtervolgt, de ander trekt zich terug. Als je de dans doorhebt, kun je eruit stappen in plaats van elkaar de schuld te geven.",
      points: ["Angstig + vermijdend = achtervolgen en wegtrekken.", "Twee veilige mensen bouwen rustige stabiliteit.", "Het patroon benoemen haalt de angel eruit.", "Je kunt reageren met aandacht, niet alleen terugslaan."],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Zelftest",
    heading: "Wat is jouw hechtingsstijl?",
    sub: "Antwoord eerlijk over hoe je je voelt in hechte relaties — vooral als het spannend wordt. Er zijn geen foute antwoorden.",
    nav: "Vind de jouwe",
    icon: "🔗",
    introTitle: "12 vragen",
    introText: "Denk aan hoe je meestal bent in hechte relaties en kies wat het beste bij <em>jou</em> past.",
    resultEyebrow: "Jouw waarschijnlijke hechtingsstijl",
    categories: {
      secure: { name: "Veilig", icon: "🌳", color: "#2a9d5c",
        summary: "Je voelt je prettig bij nabijheid én bij zelfstandigheid. Je vertrouwt, zegt direct wat je nodig hebt en gaat conflicten aan zonder paniek of dichtklappen.",
        signsTitle: "Je neigt ertoe", handleTitle: "Hoe anderen jou benaderen",
        signs: ["Vertrouwen en moeiteloos leunen", "Je behoeften direct benoemen", "Rustig blijven bij conflict", "Makkelijk steun geven en aannemen"],
        handle: ["Wees eerlijk en consequent", "Geniet van gezond geven en nemen", "Houd de communicatie open", "Jij bent een stabiliserende partner voor anderen"] },
      anxious: { name: "Angstig", icon: "🌊", color: "#db2777",
        summary: "Je snakt naar nabijheid en geeft veel, maar bent bang om verlaten te worden. Je voelt de stemming van je partner haarfijn aan en kunt gaan piekeren als geruststelling uitblijft.",
        signsTitle: "Je neigt ertoe", handleTitle: "Hoe anderen jou steunen",
        signs: ["Snakken naar nabijheid en geruststelling", "Bang zijn om verlaten te worden", "Te veel lezen in stemmingen en stiltes", "Protesteren of vastklampen bij spanning"],
        handle: ["Geef rustige, consequente geruststelling", "Wees duidelijk en voorspelbaar", "Trek je niet terug zonder uitleg", "Help ze zichzelf te kalmeren, met zachtheid"] },
      avoidant: { name: "Vermijdend", icon: "🧱", color: "#0891b2",
        summary: "Je koestert je zelfstandigheid en kunt het benauwd krijgen van te veel nabijheid. Je regelt dingen liever alleen en trekt je terug of doet je behoeften weg als het intiem wordt.",
        signsTitle: "Je neigt ertoe", handleTitle: "Hoe anderen jou steunen",
        signs: ["Zelfstandigheid hoog in het vaandel dragen", "Het benauwd krijgen van te veel nabijheid", "Je terugtrekken onder druk", "Je eigen behoeften kleiner maken"],
        handle: ["Respecteer hun behoefte aan ruimte", "Ga niet achtervolgen of pushen", "Wees betrouwbaar maar niet klef", "Nodig uit tot nabijheid zonder te eisen"] },
      fearful: { name: "Angstig-vermijdend", icon: "🌀", color: "#7c3aed",
        summary: "Je verlangt naar nabijheid maar zet je schrap voor pijn, dus je kunt warm en koud blazen — toenadering zoeken en dan weer wegtrekken. Meestal komt het doordat nabijheid ooit onveilig aanvoelde.",
        signsTitle: "Je neigt ertoe", handleTitle: "Hoe anderen jou steunen",
        signs: ["Nabijheid willen én vrezen", "Warm en koud blazen", "Moeite hebben met vertrouwen", "Duwen en trekken in relaties"],
        handle: ["Wees geduldig, rustig en consequent", "Maak veiligheid en voorspelbaarheid zichtbaar", "Vat het duwen en trekken niet persoonlijk op", "Zachte standvastigheid herstelt na verloop van tijd het vertrouwen"] },
    },
    questions: [
      { q: "Als je dicht bij iemand komt…", options: [
        { text: "Voel je je prettig en veilig", cat: "secure" },
        { text: "Vrees je dat ze zich terugtrekken", cat: "anxious" },
        { text: "Krijg je het een beetje benauwd", cat: "avoidant" },
        { text: "Wil je het, maar voelt het onrustig", cat: "fearful" } ] },
      { q: "Als een partner ruimte nodig heeft…", options: [
        { text: "Geef je die zonder zorgen", cat: "secure" },
        { text: "Voel je je onrustig en afgewezen", cat: "anxious" },
        { text: "Ben je eerlijk gezegd opgelucht", cat: "avoidant" },
        { text: "Voel je je gekwetst én veiliger", cat: "fearful" } ] },
      { q: "Bij conflict neig je ertoe…", options: [
        { text: "Rustig te blijven en het uit te praten", cat: "secure" },
        { text: "Overspoeld te raken en geruststelling te zoeken", cat: "anxious" },
        { text: "Dicht te klappen en je terug te trekken", cat: "avoidant" },
        { text: "Tussen die twee heen en weer te slaan", cat: "fearful" } ] },
      { q: "Leunen op anderen voelt…", options: [
        { text: "Natuurlijk en prima", cat: "secure" },
        { text: "Nodig maar eng", cat: "anxious" },
        { text: "Ongemakkelijk — liever niet", cat: "avoidant" },
        { text: "Als iets wat ik wil maar niet vertrouw", cat: "fearful" } ] },
      { q: "Als iemand een tijd niet antwoordt…", options: [
        { text: "Ga je ervan uit dat ze druk zijn", cat: "secure" },
        { text: "Begin je te vrezen dat er iets mis is", cat: "anxious" },
        { text: "Merk je het nauwelijks", cat: "avoidant" },
        { text: "Schiet er even angst door je heen, daarna haak je af", cat: "fearful" } ] },
      { q: "Jouw kijk op relaties is…", options: [
        { text: "Grotendeels veilig en verrijkend", cat: "secure" },
        { text: "Prachtig maar wankel", cat: "anxious" },
        { text: "Leuk, maar alleen gaat het ook goed", cat: "avoidant" },
        { text: "Gewenst maar riskant", cat: "fearful" } ] },
      { q: "Je diepste gevoelens delen is…", options: [
        { text: "Prettig, met de juiste persoon", cat: "secure" },
        { text: "Iets wat ik snel doe om te binden", cat: "anxious" },
        { text: "Moeilijk — ik houd dingen privé", cat: "avoidant" },
        { text: "Iets waar ik naartoe kruip en dan van wegvlucht", cat: "fearful" } ] },
      { q: "Als een relatie serieus wordt…", options: [
        { text: "Ga je er met vertrouwen in mee", cat: "secure" },
        { text: "Wil je voortdurend nabijheid", cat: "anxious" },
        { text: "Voel je de drang om afstand te scheppen", cat: "avoidant" },
        { text: "Ben je tegelijk opgetogen en in paniek", cat: "fearful" } ] },
      { q: "Geruststelling van een partner…", options: [
        { text: "Is fijn, maar ik heb er weinig van nodig", cat: "secure" },
        { text: "Heb ik vaak nodig", cat: "anxious" },
        { text: "Voelt een beetje verstikkend", cat: "avoidant" },
        { text: "Kalmeert eerst en maakt me dan wantrouwig", cat: "fearful" } ] },
      { q: "Na een breuk doe je meestal…", options: [
        { text: "Rouwen en dan gestaag herstellen", cat: "secure" },
        { text: "Worstelen om los te laten", cat: "anxious" },
        { text: "Snel verdergaan, ogenschijnlijk onaangedaan", cat: "avoidant" },
        { text: "Je verscheurd én opgelucht voelen", cat: "fearful" } ] },
      { q: "Iemand nieuw vertrouwen gaat…", options: [
        { text: "Redelijk vanzelf", cat: "secure" },
        { text: "Snel, en daarna angstig", cat: "anxious" },
        { text: "Traag, als het al lukt", cat: "avoidant" },
        { text: "Met hoop en zware voorzichtigheid", cat: "fearful" } ] },
      { q: "Jouw zelfstandigheid en nabijheid zijn…", options: [
        { text: "Comfortabel in balans", cat: "secure" },
        { text: "Doorgeslagen naar nabijheid nodig hebben", cat: "anxious" },
        { text: "Doorgeslagen naar ruimte nodig hebben", cat: "avoidant" },
        { text: "Voortdurend met elkaar in gevecht", cat: "fearful" } ] },
    ],
  },

  handle: {
    kicker: "Aan de slag",
    heading: "Naar veilige verbinding",
    sub: "Elke stijl kan veiliger worden — in jezelf en met de mensen van wie je houdt.",
    nav: "Toepassen",
    cta: "Terug naar de Mensenbibliotheek →",
    cards: [
      { icon: "🌳", title: "Kweek je veiligheid", tone: "do", items: [
        "Benoem je patroon zonder schaamte", "Zeg direct en op tijd wat je nodig hebt", "Kies rustige, consequente mensen", "Leer jezelf te kalmeren bij triggers", "Herstel na ruzie, ontwijk het niet",
      ]},
      { icon: "💞", title: "Met een angstige partner", tone: "", items: [
        "Geef rustige, voorspelbare geruststelling", "Leg uit wanneer je ruimte nodig hebt", "Doe wat je zegt", "Straf niet af door je terug te trekken", "Vier nabijheid, dose het niet",
      ]},
      { icon: "🧱", title: "Met een vermijdende partner", tone: "", items: [
        "Respecteer hun ruimte zonder achtervolgen", "Blijf betrouwbaar en zonder druk", "Nodig zachtjes uit tot nabijheid", "Lees afstand niet als afwijzing", "Geef ze de ruimte om naar jou toe te komen",
      ]},
    ],
  },

  faq: [
    { q: "Ligt je hechtingsstijl voor het leven vast?", a: "Nee. Hij is stabiel maar veranderlijk. Met zelfinzicht, veilige relaties en soms therapie schuiven mensen op naar 'verworven veiligheid'." },
    { q: "Is één stijl gewoon 'beter'?", a: "Veilige hechting is het prettigst en het veerkrachtigst, maar de andere zijn geen karakterfouten — het zijn begrijpelijke aanpassingen waar je uit kunt groeien." },
    { q: "Kan ik een mix van stijlen zijn?", a: "Ja. Veel mensen zijn een mengeling, en je stijl kan zelfs per relatie verschillen. De uitslag toont je sterkste neiging plus de balans." },
    { q: "Waar komt mijn stijl vandaan?", a: "Vooral uit hoe consequent en beschikbaar je eerste verzorgers waren — al vormen latere relaties en ervaringen hem mee." },
    { q: "Waarom trekken angstige en vermijdende mensen elkaar aan?", a: "Ze bevestigen elkaars angsten: de angstige partner zoekt nabijheid, de vermijdende schept afstand, en die pijnlijke dans voelt voor allebei vreemd vertrouwd." },
    { q: "Is dit therapie?", a: "Nee. Het is een educatief hulpmiddel om over na te denken. Als hechtingswonden je leven serieus in de weg zitten, kan een gekwalificeerde therapeut je helpen naar meer veiligheid." },
  ],
};

window.BOOK_NL = BOOK_NL;
