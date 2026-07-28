/* =============================================================================
   De vijf talen van de liefde — Nederlandse inhoud
   Structuur identiek aan data.js; alleen de leesbare teksten zijn vertaald.
   Categoriesleutels, kleuren, iconen en volgorde blijven ongewijzigd.
   ========================================================================== */
const BOOK_NL = {
  meta: {
    key: "lovelanguages",
    title: "De vijf talen van de liefde",
    subtitle: "Hoe je liefde geeft en ontvangt",
    short: "Liefdestalen",
    emoji: "💗",
    accent: "#e11d48",
    eyebrow: "Een relatiemodel",
    description:
      "Een educatieve workshop over de vijf talen van de liefde van Gary Chapman. Ontdek waardoor jij je het meest geliefd voelt — en hoe je anderen in hún taal liefhebt.",
    heroTitle: "Iedereen spreekt<br />liefde anders.",
    heroLead:
      "We geven liefde zoals we die zelf graag krijgen — en juist daardoor gaat er zo vaak iets verloren in de vertaling. Leer de <em>vijf talen van de liefde</em> van Gary Chapman en vind de jouwe.",
    heroCta: "Vind jouw liefdestaal",
    footerNote:
      "Een educatieve workshop geïnspireerd op <em>De 5 talen van de liefde</em> van Gary Chapman. Een hulpmiddel voor warmere relaties, geen wetenschappelijke test.",
    footerSupport:
      "Geïnspireerd op <em>De 5 talen van de liefde</em> van Gary Chapman. Als het je raakt: lees het boek en steun de auteur. Ontdek meer in <strong>De Mensenbibliotheek</strong>.",
  },

  learn: {
    kicker: "De ideeën",
    heading: "Vijf manieren om 'ik hou van je' te zeggen",
    sub: "Chapman ontdekte dat mensen zich geliefd voelen via vijf hoofdkanalen — en de meesten van ons leunen op één of twee. Tik op een kaart om dieper te gaan.",
  },

  concepts: [
    {
      icon: "💗", name: "De vijf talen", tag: "Woorden, daden, cadeaus, tijd, aanraking.",
      summary: "Liefde wordt gegeven en ontvangen via vijf 'talen': bevestigende woorden, dienstbaarheid, cadeaus krijgen, tijd en aandacht, en lichamelijke aanraking. De meeste mensen hebben één taal die het hardst binnenkomt.",
      points: ["<strong>Woorden</strong> — complimenten, aanmoediging, 'ik hou van je'.", "<strong>Daden</strong> — praktische dingen voor iemand doen.", "<strong>Cadeaus</strong> — attente blijken van 'ik dacht aan je'.", "<strong>Tijd</strong> — onverdeelde aandacht, samen.", "<strong>Aanraking</strong> — knuffels, nabijheid, lichamelijke warmte."],
    },
    {
      icon: "🔁", name: "We geven wat we zelf willen", tag: "Het vertaalgat.",
      summary: "Het kerninzicht: we uiten liefde vanzelf in onze eigen taal, niet in die van de ander. Iemand van de woorden strooit met complimenten; iemand van de daden doet zwijgend het huishouden — en allebei kunnen ze zich ongeliefd voelen omdat de boodschap nooit aankomt.",
      points: ["Je geeft liefde standaard in je eigen taal.", "Je partner 'luistert' misschien op een ander kanaal.", "Moeite in de verkeerde taal komt nauwelijks binnen.", "Niet gebrek aan liefde, maar mismatch veroorzaakt veel pijn."],
    },
    {
      icon: "🗣️", name: "Spreek hun taal", tag: "Liefde op hun kanaal.",
      summary: "De oplossing is simpel maar niet altijd makkelijk: leer de hoofdtaal van de ander en heb ze daar bewust in lief — ook als het jou niet natuurlijk afgaat. Dan pas komt liefde echt aan.",
      points: ["Vraag en kijk waar ze van opknappen.", "Doe het in hún taal, niet in de jouwe.", "Klein en regelmatig wint van zeldzaam en groots.", "Het is een vaardigheid die je kunt oefenen."],
    },
    {
      icon: "👨‍👩‍👧", name: "Meer dan romantiek", tag: "Kinderen, vrienden, collega's.",
      summary: "Liefdestalen zijn niet alleen voor stellen. Kinderen, vrienden en zelfs collega's hebben hun eigen manier om zich gewaardeerd te voelen. Hetzelfde idee bouwt overal warmere banden.",
      points: ["Ook kinderen hebben een hoofdtaal.", "Vriendschappen verdiepen als je hun taal spreekt.", "Op het werk komt erkenning beter aan op maat.", "Eigenlijk is het een 'waarderingstaal' voor elke band."],
    },
    {
      icon: "⚖️", name: "Iedereen is een mix", tag: "Eén hoofdtaal, iets van alles.",
      summary: "Je waardeert alle vijf in zekere mate, maar meestal wegen één of twee het zwaarst. Als je die van jezelf kent — en deelt — kunnen de mensen die van je houden je ook echt bereiken.",
      points: ["Je hebt een hoofdtaal en een tweede taal.", "Die van jou delen helpt anderen goed liefhebben.", "Je taal kan verschuiven per levensfase.", "Balans blijft belangrijk — verwaarloos de rest niet."],
    },
  ],

  assessment: {
    mode: "classify",
    kicker: "Zelftest",
    heading: "Wat is jouw liefdestaal?",
    sub: "Tien snelle of-of-keuzes. Kies bij elk paar wat jou méér zou doen — niet wat je 'hoort' te kiezen.",
    nav: "Vind de jouwe",
    icon: "💗",
    introTitle: "10 of-of-keuzes",
    introText: "Kies de optie waardoor <em>jij</em> je het meest geliefd zou voelen. Volg je hart.",
    resultEyebrow: "Jouw belangrijkste liefdestaal",
    categories: {
      words: { name: "Bevestigende woorden", icon: "💬", color: "#2563eb",
        summary: "Je voelt je het meest geliefd door lieve, aanmoedigende en waarderende woorden. Complimenten en 'ik hou van je' komen diep binnen; kritiek snijdt hard.",
        signsTitle: "Je bloeit op bij", handleTitle: "Hoe je jou liefheeft",
        signs: ["Iemand die je prijst of aanmoedigt", "'Ik ben trots op je' horen", "Liefde die hardop wordt uitgesproken", "Lieve briefjes en berichtjes"],
        handle: ["Zeg het hardop en vaak", "Prijs concreet en oprecht", "Stuur aanmoedigende berichtjes", "Wees mild met kritiek"] },
      acts: { name: "Dienstbaarheid", icon: "🛠️", color: "#0891b2",
        summary: "Je voelt je geliefd als mensen praktische dingen voor je doen. Daden zeggen meer dan woorden — 'laat mij dat even doen' is muziek.",
        signsTitle: "Je bloeit op bij", handleTitle: "Hoe je jou liefheeft",
        signs: ["Iemand die je last verlicht", "Klusjes die ongevraagd gedaan zijn", "Hulp op het moment dat je het zwaar hebt", "Beloftes die worden nagekomen"],
        handle: ["Doe ongevraagd nuttige dingen", "Verlicht hun last", "Kom je beloftes na", "Zie wat er moet gebeuren en doe het"] },
      gifts: { name: "Cadeaus", icon: "🎁", color: "#db2777",
        summary: "Je voelt je geliefd door attente cadeaus en blijken — niet om de prijs, maar omdat ze zeggen: 'ik dacht aan je'.",
        signsTitle: "Je bloeit op bij", handleTitle: "Hoe je jou liefheeft",
        signs: ["Een attente kleine verrassing", "Iemand die iets onthield wat je noemde", "Kleinigheden die een moment markeren", "De gedachte achter het cadeau"],
        handle: ["Geef kleine, attente blijken", "Onthoud de details die ze noemen", "Sta stil bij bijzondere momenten", "Het gaat om de gedachte, niet om de prijs"] },
      time: { name: "Tijd en aandacht", icon: "⏳", color: "#2a9d5c",
        summary: "Je voelt je geliefd door onverdeelde aandacht — echt aanwezig zijn, geen telefoons, samen dingen doen en echt praten.",
        signsTitle: "Je bloeit op bij", handleTitle: "Hoe je jou liefheeft",
        signs: ["Onverdeelde aandacht", "Samen dingen doen", "Echte, ongehaaste gesprekken", "Iemands prioriteit zijn"],
        handle: ["Geef volle aandacht, zonder telefoon", "Plan samen tijd in", "Luister echt", "Laat ze voelen dat ze voorrang hebben"] },
      touch: { name: "Lichamelijke aanraking", icon: "🤗", color: "#e11d48",
        summary: "Je voelt je geliefd door lichamelijke nabijheid — knuffels, een hand vasthouden, dicht tegen elkaar zitten. Aanraking stelt je gerust als niets anders.",
        signsTitle: "Je bloeit op bij", handleTitle: "Hoe je jou liefheeft",
        signs: ["Een warme knuffel", "Een hand op je schouder", "Dicht tegen elkaar aan zitten", "Lichamelijke geruststelling"],
        handle: ["Bied warme, welkome aanraking", "Knuffel bij hallo en tot ziens", "Ga dicht bij elkaar zitten", "Stel gerust via lichamelijke nabijheid"] },
    },
    questions: [
      { q: "Wat zou jou meer doen?", options: [ { text: "Oprechte lof horen en 'ik hou van je'", cat: "words" }, { text: "Dat ze een klus voor je opknappen", cat: "acts" } ] },
      { q: "Wat zou jou meer doen?", options: [ { text: "Een gemeend compliment", cat: "words" }, { text: "Een attent klein cadeautje", cat: "gifts" } ] },
      { q: "Wat zou jou meer doen?", options: [ { text: "Aanmoedigende woorden", cat: "words" }, { text: "Ongestoorde tijd samen", cat: "time" } ] },
      { q: "Wat zou jou meer doen?", options: [ { text: "Te horen krijgen dat je geliefd bent", cat: "words" }, { text: "Een lange, warme knuffel", cat: "touch" } ] },
      { q: "Wat zou jou meer doen?", options: [ { text: "Dat ze een klusje voor je regelen", cat: "acts" }, { text: "Een verrassingscadeau dat ze voor je uitkozen", cat: "gifts" } ] },
      { q: "Wat zou jou meer doen?", options: [ { text: "Hulp als het je te veel wordt", cat: "acts" }, { text: "Een avond met volle aandacht", cat: "time" } ] },
      { q: "Wat zou jou meer doen?", options: [ { text: "Iemand die je werkdruk verlicht", cat: "acts" }, { text: "Dicht bij elkaar zitten, hand in hand", cat: "touch" } ] },
      { q: "Wat zou jou meer doen?", options: [ { text: "Een betekenisvol aandenken", cat: "gifts" }, { text: "Een hele dag samen, alleen jullie twee", cat: "time" } ] },
      { q: "Wat zou jou meer doen?", options: [ { text: "Een cadeau waaruit blijkt dat ze je kennen", cat: "gifts" }, { text: "Een knuffel als je binnenkomt", cat: "touch" } ] },
      { q: "Wat zou jou meer doen?", options: [ { text: "Onverdeelde, aanwezige tijd samen", cat: "time" }, { text: "Dicht tegen je aan gehouden worden", cat: "touch" } ] },
    ],
  },

  handle: {
    kicker: "Aan de slag",
    heading: "Mensen goed liefhebben",
    sub: "Het doel is niet om jouw taal te veranderen — het is om die van hen te spreken.",
    nav: "Toepassen",
    cta: "Terug naar de Mensenbibliotheek →",
    cards: [
      { icon: "✅", title: "Doen", tone: "do", items: [
        "Leer de hoofdtaal van je partner", "Heb ze lief in hún taal, niet in de jouwe", "Vraag gewoon wat ze zich geliefd doet voelen", "Maak kleine, regelmatige gebaren", "Deel ook je eigen taal",
      ]},
      { icon: "⛔", title: "Niet doen", tone: "dont", items: [
        "Aannemen dat zij liefde net zo voelen als jij", "Alleen geven in je eigen taal", "Grote gebaren bewaren voor zeldzame momenten", "Een mismatch lezen als 'ze geven niet om me'", "De talen negeren die niet de hoofdtaal zijn",
      ]},
      { icon: "🌍", title: "Overal", tone: "", items: [
        "Gebruik het ook bij kinderen en vrienden", "Stem waardering op het werk af op de persoon", "Merk op waar iemand op reageert", "Spreek liefde in de taal die aankomt", "Zie de verbinding dieper worden",
      ]},
    ],
  },

  faq: [
    { q: "Is het idee van liefdestalen wetenschappelijk?", a: "Het is eerder een populair, praktisch model dan een streng gevalideerde theorie. Het onderzoek ernaar is wisselend — maar veel stellen vinden het een oprecht bruikbare bril om over behoeften te praten." },
    { q: "Kan mijn liefdestaal veranderen?", a: "Ja. Hij kan verschuiven per levensfase en per relatie. Kersverse ouders snakken bijvoorbeeld vaak naar dienstbaarheid; partners op afstand naar woorden." },
    { q: "Wat als mijn partner en ik verschillen?", a: "Dat is de regel, en precies waar het om gaat. De kunst is ze bewust lief te hebben in hun taal, ook als die jou niet natuurlijk afgaat." },
    { q: "Kan ik er meer dan één hebben?", a: "Ja — de meeste mensen hebben een hoofdtaal en een tweede taal, en waarderen alle vijf in zekere mate." },
    { q: "Werkt het ook buiten de romantiek?", a: "Zeker. Kinderen, vrienden en collega's hebben allemaal hun eigen manier om zich gewaardeerd te voelen. Eigenlijk is het een 'waarderingstaal' voor elke relatie." },
    { q: "Is 'cadeaus' niet gewoon materialisme?", a: "Nee. Voor een cadeaumens gaat het om de gedachte en de symboliek, niet om de prijs. Een zelf geplukt bloemetje kan meer zeggen dan iets duurs." },
  ],
};

window.BOOK_NL = BOOK_NL;
