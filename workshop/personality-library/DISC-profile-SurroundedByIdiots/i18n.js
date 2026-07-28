/* =============================================================================
   The Four Colours — localisation (EN / NL / FR)

   Load order matters:
     data.js  →  data.nl.js  →  data.fr.js  →  i18n.js  →  shared.js  →  app.js

   This file
     · picks the active language (?lang= → saved choice → browser → English),
     · exposes the matching content pack as the global `DISC`,
     · holds every interface string that is not part of the content packs,
     · applies those strings to [data-i18n*] elements and builds the switcher.
   ========================================================================== */
const DISC_I18N = (function () {
  "use strict";

  const LANGS = ["en", "nl", "fr"];
  const STORE_KEY = "disc.lang";

  /* ==========================================================================
     UI STRINGS
     {1}, {2}… and {who} / {name} are replaced at render time.
     ========================================================================== */
  const UI = {
    /* ------------------------------------------------------------------ EN */
    en: {
      lang_name: "English",
      meta_title: "The Four Colours — A DISC Personality Workshop",
      meta_desc:
        "An interactive DISC personality workshop inspired by 'Surrounded by Idiots' by Thomas Erikson. Learn the four colour profiles — Red, Yellow, Green and Blue — and take live self and observer assessments.",

      skip: "Skip to content",
      brand: "Four Colours",
      nav_toggle: "Toggle navigation",
      lang_label: "Language",
      nav_learn: "Learn",
      nav_self: "Test Yourself",
      nav_observe: "Read Someone",
      nav_quick: "Quick ID",
      nav_tips: "Tips",
      nav_cards: "Cards",
      nav_faq: "FAQ",

      hero_eyebrow: "A DISC Personality Workshop",
      hero_title: "Are you really<br />surrounded by idiots?",
      hero_lead:
        "Or do the people around you simply speak a different colour? Discover the four behavioural styles from Thomas Erikson's <em>Surrounded by Idiots</em>, find your own, and learn to read everyone else.",
      hero_cta1: "Test yourself",
      hero_cta2: "Meet the colours",
      col_red: "Red",
      col_yellow: "Yellow",
      col_green: "Green",
      col_blue: "Blue",
      lbl_red: "Dominance",
      lbl_yellow: "Influence",
      lbl_green: "Steadiness",
      lbl_blue: "Conscientiousness",

      learn_kicker: "The Model",
      learn_h2: "Meet the four colours",
      learn_sub:
        "Every person is a blend, but most of us lead with one or two colours. Click a card to explore how that style communicates, decides, works and connects.",
      explore: "Explore {name} →",
      close: "Close",
      d_comm: "Communication",
      d_dec: "Decision making",
      d_env: "Work environment",
      d_stress: "Under stress",
      d_str: "Strengths",
      d_watch: "Watch-outs",
      d_motiv: "Motivated by",
      d_connect: "How to connect",

      matrix_title: "How the colours get along",
      matrix_sub: "Pick two colours to see how they clash and click.",
      matrix_you: "You are",
      matrix_they: "They are",
      matrix_empty: "Choose a colour in each row above.",
      matrix_meets: "meets",

      self_kicker: "Assessment 1",
      self_h2: "Test yourself",
      self_sub:
        "Rate how well each statement describes you. There are no right answers and questions appear one at a time — your full profile is revealed only at the end.",
      self_intro_h3: "20 quick statements",
      self_intro_p:
        "Answer honestly and instinctively — go with your first reaction. Takes about three minutes.",
      self_start: "Begin assessment",
      self_alt:
        'Prefer a different method? Try the <a href="self-forced-choice.html">forced-choice test</a> (most / least like me) and compare.',
      likert1: "Strongly <br>disagree",
      likert2: "Disagree",
      likert3: "Neutral",
      likert4: "Agree",
      likert5: "Strongly <br>agree",
      prev: "← Previous",
      self_chart_aria: "Your DISC colour balance",
      self_eyebrow: "Your dominant style",
      retake: "Retake",
      print: "Print / Save PDF",
      to_observe: "Now read someone else →",
      cta_pair_self: "📇 Share your “How to communicate with me” card →",
      cta_single_self: "📇 Share your {name} communication card →",

      obs_kicker: "Assessment 2",
      obs_h2: "Read someone else",
      obs_sub:
        "Think of one specific person — a colleague, partner or friend. First read their <em>natural</em> style (watch the graph shift live), then a short second pass reveals their <em>adapted</em> style under pressure.",
      obs_intro_h3: "Who are you reading?",
      obs_intro_p: "Give them a name or label so you can run this for several people.",
      obs_name_ph: "e.g. My manager, Alex, Mum…",
      obs_name_aria: "Person's name",
      obs_start: "Start reading",
      toggle_hide: "Hide colour hints",
      toggle_show: "Show colour hints",
      who_fallback: "this person",
      reading_who: "Reading: <b>{who}</b> · natural style",
      live_title: "Live reading",
      live_wait: "Answer to begin…",
      live_leading: "{c} leading",
      obs_chart_aria: "Live colour probability",
      bridge_h3: "Now — under pressure",
      bridge_text:
        "At their natural best, {who} reads as mostly {top}. Now, six quick questions on how {who} behaves <em>under pressure</em> — their <strong>adapted</strong> style.",
      obs_continue: "Continue",
      adapt_who: "Under pressure &amp; stress",
      obs_result_chart_aria: "Natural vs under-pressure colour balance",
      obs_eyebrow: "{who}'s natural style",
      conf_high: "High confidence",
      conf_mid: "Moderate confidence",
      conf_low: "Low confidence — a genuine blend",
      shift_h4: "Natural vs. under pressure",
      shift_same:
        "{Who} stays fairly consistent — {nat} leads whether relaxed or stretched. What you see is close to what you get.",
      shift_diff:
        "At ease, {who} leads with {nat}. Under pressure {who} shifts toward {adapt} — the {riser} side rises while {faller} fades. Expect a noticeably different person on a stressful day, and adjust how you approach {who}.",
      radar_natural: "Natural",
      radar_pressure: "Under pressure",
      obs_restart: "Read another person",
      to_tips: "How to work with them →",
      cta_pair_other: "📇 Their “How to communicate with them” card →",
      cta_single_other: "📇 The {name} communication card →",

      quick_kicker: "60 Seconds",
      quick_h2: "Quick identifier",
      quick_sub:
        "In a hurry? Four rapid picks give you a rough read on anyone — including yourself.",
      quick_again: "Try again",

      tips_kicker: "Field Guide",
      tips_h2: "Working with each colour",
      tips_sub: "Practical do's and don'ts for communicating with every style.",
      tip_do: "Do",
      tip_dont: "Don't",

      cards_kicker: "Shareable",
      cards_h2: "“How to communicate with me” cards",
      cards_sub:
        "One focused page per colour — and one for every two-colour blend — with the critical do's, don'ts and phrases. Send yours to a colleague, or open someone else's before your next conversation.",
      cards_singles: "Single colours",
      cards_pairs: "Two-colour blends",

      faq_kicker: "Questions",
      faq_h2: "Frequently asked",

      footer_note:
        "An educational workshop inspired by <em>Surrounded by Idiots</em> by Thomas Erikson and the DISC behavioural model of William Moulton Marston. Built for reflection and better conversations — not clinical diagnosis.",
      footer_support:
        "Want the full picture? <strong>Read <em>Surrounded by Idiots</em> by Thomas Erikson</strong> — buy the book and support the author.",
      footer_edition: "Workshop edition",

      /* — communication card page — */
      cc_meta_desc:
        "A shareable DISC communication card: the critical do's, don'ts and phrases for communicating with each colour and two-colour blend. Inspired by 'Surrounded by Idiots' by Thomas Erikson.",
      cc_title_single: "How to communicate with a {name} — DISC Communication Card",
      cc_title_pair: "How to communicate with a {title} blend — DISC Communication Card",
      cc_back_all: "← All cards & workshop",
      cc_other: "Other communication cards",
      cc_back_workshop: "← Back to the workshop",
      cc_kicker: "How to communicate with",
      cc_h1_single: "a {name} <span>· {label}</span>",
      cc_share_single:
        "Share this card with anyone who works with a {name} — or keep it as a mirror for yourself.",
      cc_rules: "Three golden rules",
      cc_good: "Phrases that work",
      cc_bad: "Phrases that backfire",
      cc_practice: "In practice",
      cc_writing: "In writing",
      cc_conflict: "In conflict",
      cc_motivate: "To motivate them",
      cc_pressure: "Under pressure they turn",
      cc_h1_pair: "a {title} blend",
      cc_share_pair:
        "For people who mix {a} and {b} — the most common way real people show up.",
      cc_tension: "The inner tension",
      cc_handle: "How to handle them",
      cc_watch: "Watch out for",
      cc_side: "The {name} side",
      cc_open: "Open the full {name} card →",
      footer_workshop: "The Four Colours workshop",

      /* — forced-choice page — */
      fc_meta_title: "Forced-Choice Test — The Four Colours (DISC Workshop)",
      fc_meta_desc:
        "An alternative DISC self-test using the classic forced-choice method — pick what is MOST and LEAST like you. Compare it with the Likert test in the Four Colours workshop.",
      fc_back: "← Back to workshop",
      fc_kicker: "Alternative method",
      fc_h2: "Forced-choice self-test",
      fc_sub:
        'The classic DISC approach some practitioners prefer: for each group of four words, pick the one that is <em>most</em> like you and the one that is <em>least</em> like you. Compare your result with the <a href="index.html#self">Likert test</a> to see which feels truer.',
      fc_intro_h3: "10 word groups",
      fc_intro_p:
        "In each group of four, choose your <b>Most</b> and your <b>Least</b>. Quick and instinctive is best.",
      fc_start: "Begin test",
      fc_question: "Which is most &amp; least like you?",
      fc_legend:
        '<span><b class="m">● Most</b> — most like me</span><span><b class="l">● Least</b> — least like me</span>',
      fc_most: "Most",
      fc_least: "Least",
      fc_most_aria: "Most like me",
      fc_least_aria: "Least like me",
      fc_eyebrow: "Your dominant style (forced-choice)",
      fc_note:
        '<b>Comparing methods:</b> forced-choice (ipsative) scoring exaggerates your strongest and weakest colours because every pick trades one colour off against another. The <a href="index.html#self">Likert test</a> lets colours score independently, so mild blends show up more softly. Neither is “correct” — together they triangulate the real you.',
      fc_to_likert: "Try the Likert test →",
      fc_cta_pair: "📇 Your “How to communicate with me” card →",
      fc_cta_single: "📇 Your {name} communication card →",

      rd_strengths: "Core strengths",
      rd_watch: "Watch-outs",
      rd_motiv_self: "You are motivated by",
      rd_motiv_other: "They are motivated by",
      rd_connect_self: "How you connect best",
      rd_connect_other: "How to connect with them",

      blend_pure_self:
        "You score as an almost pure {1} — a rare, unusually clear single-colour profile.",
      blend_four_self:
        "You're an unusually even blend of all four colours — {1}, {2}, {3} and {4} sit close together. Rather than one fixed style, you shift considerably depending on the situation and the people around you. Read the moment before deciding which colour you're showing.",
      blend_three_self:
        "You're a broad three-colour blend of {1}, {2} and {3}. You draw on whichever fits the moment, so your style flexes noticeably with the situation rather than staying fixed.",
      blend_strong_self:
        "You lead strongly with {1}, backed by {2} as your clear secondary style.",
      blend_common_self:
        "You lead with {1}, strongly supported by {2} — a common two-colour blend.",
      blend_even_self:
        "You're an almost even blend of {1} and {2}, flexing fluidly between the two.",
      blend_pure_other:
        "This person scores as an almost pure {1} — a rare, unusually clear single-colour profile.",
      blend_four_other:
        "This person is an unusually even blend of all four colours — {1}, {2}, {3} and {4} sit close together. Rather than one fixed style, they shift considerably depending on the situation and the people around them. Read the moment before deciding which colour you are seeing.",
      blend_three_other:
        "This person is a broad three-colour blend of {1}, {2} and {3}, drawing on whichever fits the moment, so their style flexes noticeably with the situation rather than staying fixed.",
      blend_strong_other:
        "They lead strongly with {1}, backed by {2} as their clear secondary style.",
      blend_common_other:
        "They lead with {1}, strongly supported by {2} — a common two-colour blend.",
      blend_even_other:
        "They're an almost even blend of {1} and {2}, flexing fluidly between the two.",
    },

    /* ------------------------------------------------------------------ NL */
    nl: {
      lang_name: "Nederlands",
      meta_title: "De Vier Kleuren — Een DISC-persoonlijkheidsworkshop",
      meta_desc:
        "Een interactieve DISC-workshop geïnspireerd op 'Omringd door idioten' van Thomas Erikson. Leer de vier kleurprofielen — Rood, Geel, Groen en Blauw — en doe live zelf- en observatietests.",

      skip: "Naar de inhoud",
      brand: "Vier Kleuren",
      nav_toggle: "Menu openen",
      lang_label: "Taal",
      nav_learn: "Leren",
      nav_self: "Test jezelf",
      nav_observe: "Lees iemand",
      nav_quick: "Snelscan",
      nav_tips: "Tips",
      nav_cards: "Kaarten",
      nav_faq: "FAQ",

      hero_eyebrow: "Een DISC-persoonlijkheidsworkshop",
      hero_title: "Ben je echt<br />omringd door idioten?",
      hero_lead:
        "Of spreken de mensen om je heen simpelweg een andere kleur? Ontdek de vier gedragsstijlen uit <em>Omringd door idioten</em> van Thomas Erikson, vind die van jezelf en leer alle anderen lezen.",
      hero_cta1: "Test jezelf",
      hero_cta2: "Ontmoet de kleuren",
      col_red: "Rood",
      col_yellow: "Geel",
      col_green: "Groen",
      col_blue: "Blauw",
      lbl_red: "Dominantie",
      lbl_yellow: "Invloed",
      lbl_green: "Stabiliteit",
      lbl_blue: "Consciëntieusheid",

      learn_kicker: "Het model",
      learn_h2: "Ontmoet de vier kleuren",
      learn_sub:
        "Iedereen is een mix, maar de meesten van ons leiden met één of twee kleuren. Klik op een kaart om te zien hoe die stijl communiceert, beslist, werkt en verbindt.",
      explore: "Ontdek {name} →",
      close: "Sluiten",
      d_comm: "Communicatie",
      d_dec: "Besluitvorming",
      d_env: "Werkomgeving",
      d_stress: "Onder stress",
      d_str: "Sterke kanten",
      d_watch: "Let op",
      d_motiv: "Gemotiveerd door",
      d_connect: "Zo maak je contact",

      matrix_title: "Hoe de kleuren met elkaar omgaan",
      matrix_sub: "Kies twee kleuren en zie waar het botst en waar het klikt.",
      matrix_you: "Jij bent",
      matrix_they: "Zij zijn",
      matrix_empty: "Kies hierboven in elke rij een kleur.",
      matrix_meets: "ontmoet",

      self_kicker: "Test 1",
      self_h2: "Test jezelf",
      self_sub:
        "Geef aan hoe goed elke stelling bij je past. Er zijn geen goede antwoorden en de vragen komen één voor één — je volledige profiel zie je pas aan het eind.",
      self_intro_h3: "20 korte stellingen",
      self_intro_p:
        "Antwoord eerlijk en op gevoel — ga af op je eerste reactie. Het duurt ongeveer drie minuten.",
      self_start: "Start de test",
      self_alt:
        'Liever een andere methode? Probeer de <a href="self-forced-choice.html">keuzetest</a> (meest / minst zoals ik) en vergelijk.',
      likert1: "Zeer <br>oneens",
      likert2: "Oneens",
      likert3: "Neutraal",
      likert4: "Eens",
      likert5: "Zeer <br>eens",
      prev: "← Vorige",
      self_chart_aria: "Jouw DISC-kleurbalans",
      self_eyebrow: "Jouw dominante stijl",
      retake: "Opnieuw doen",
      print: "Printen / pdf opslaan",
      to_observe: "Lees nu iemand anders →",
      cta_pair_self: "📇 Deel je kaart “Zo communiceer je met mij” →",
      cta_single_self: "📇 Deel je {name}-communicatiekaart →",

      obs_kicker: "Test 2",
      obs_h2: "Lees iemand anders",
      obs_sub:
        "Denk aan één specifiek persoon — een collega, partner of vriend. Lees eerst de <em>natuurlijke</em> stijl (de grafiek beweegt live mee), daarna onthult een korte tweede ronde de <em>aangepaste</em> stijl onder druk.",
      obs_intro_h3: "Wie ga je lezen?",
      obs_intro_p: "Geef een naam of label, zodat je dit voor meerdere mensen kunt doen.",
      obs_name_ph: "bijv. Mijn manager, Alex, mama…",
      obs_name_aria: "Naam van de persoon",
      obs_start: "Begin met lezen",
      toggle_hide: "Kleurhints verbergen",
      toggle_show: "Kleurhints tonen",
      who_fallback: "deze persoon",
      reading_who: "Je leest: <b>{who}</b> · natuurlijke stijl",
      live_title: "Live analyse",
      live_wait: "Beantwoord een vraag om te starten…",
      live_leading: "{c} voorop",
      obs_chart_aria: "Live kleurverdeling",
      bridge_h3: "En nu — onder druk",
      bridge_text:
        "Van nature komt {who} vooral over als {top}. Nu zes korte vragen over hoe {who} zich <em>onder druk</em> gedraagt — de <strong>aangepaste</strong> stijl.",
      obs_continue: "Verder",
      adapt_who: "Onder druk &amp; stress",
      obs_result_chart_aria: "Natuurlijke stijl versus stijl onder druk",
      obs_eyebrow: "De natuurlijke stijl van {who}",
      conf_high: "Hoge zekerheid",
      conf_mid: "Redelijke zekerheid",
      conf_low: "Lage zekerheid — een echte mix",
      shift_h4: "Natuurlijk versus onder druk",
      shift_same:
        "{Who} blijft redelijk consistent — {nat} leidt zowel ontspannen als onder spanning. Wat je ziet, is wat je krijgt.",
      shift_diff:
        "Ontspannen leidt {who} met {nat}. Onder druk verschuift {who} richting {adapt} — {riser} komt op terwijl {faller} wegvalt. Verwacht op een stressvolle dag een merkbaar ander persoon en pas je aanpak daarop aan.",
      radar_natural: "Natuurlijk",
      radar_pressure: "Onder druk",
      obs_restart: "Lees iemand anders",
      to_tips: "Zo werk je met hen →",
      cta_pair_other: "📇 De kaart “Zo communiceer je met hen” →",
      cta_single_other: "📇 De {name}-communicatiekaart →",

      quick_kicker: "60 seconden",
      quick_h2: "Snelle typering",
      quick_sub:
        "Weinig tijd? Vier snelle keuzes geven je een ruwe indruk van iedereen — jezelf inbegrepen.",
      quick_again: "Opnieuw",

      tips_kicker: "Veldgids",
      tips_h2: "Werken met elke kleur",
      tips_sub: "Praktische do's en don'ts voor het communiceren met elke stijl.",
      tip_do: "Wel doen",
      tip_dont: "Niet doen",

      cards_kicker: "Deelbaar",
      cards_h2: "Kaarten “Zo communiceer je met mij”",
      cards_sub:
        "Eén compacte pagina per kleur — en één voor elke tweekleurenmix — met de belangrijkste do's, don'ts en zinnen. Stuur die van jou naar een collega, of open die van een ander vóór je volgende gesprek.",
      cards_singles: "Losse kleuren",
      cards_pairs: "Tweekleurenmixen",

      faq_kicker: "Vragen",
      faq_h2: "Veelgestelde vragen",

      footer_note:
        "Een educatieve workshop geïnspireerd op <em>Omringd door idioten</em> van Thomas Erikson en het DISC-gedragsmodel van William Moulton Marston. Bedoeld voor reflectie en betere gesprekken — niet voor klinische diagnose.",
      footer_support:
        "Wil je het hele verhaal? <strong>Lees <em>Omringd door idioten</em> van Thomas Erikson</strong> — koop het boek en steun de auteur.",
      footer_edition: "Workshopeditie",

      /* — communicatiekaartpagina — */
      cc_meta_desc:
        "Een deelbare DISC-communicatiekaart: de belangrijkste do's, don'ts en zinnen voor het communiceren met elke kleur en elke tweekleurenmix. Geïnspireerd op 'Omringd door idioten' van Thomas Erikson.",
      cc_title_single: "Zo communiceer je met een {name} type — DISC-communicatiekaart",
      cc_title_pair: "Zo communiceer je met een {title}-mix — DISC-communicatiekaart",
      cc_back_all: "← Alle kaarten & workshop",
      cc_other: "Andere communicatiekaarten",
      cc_back_workshop: "← Terug naar de workshop",
      cc_kicker: "Zo communiceer je met",
      cc_h1_single: "een {name} type <span>· {label}</span>",
      cc_share_single:
        "Deel deze kaart met iedereen die met een {name} type werkt — of houd hem als spiegel voor jezelf.",
      cc_rules: "Drie gouden regels",
      cc_good: "Zinnen die werken",
      cc_bad: "Zinnen die averechts werken",
      cc_practice: "In de praktijk",
      cc_writing: "Op schrift",
      cc_conflict: "Bij conflict",
      cc_motivate: "Om te motiveren",
      cc_pressure: "Onder druk worden ze",
      cc_h1_pair: "een {title}-mix",
      cc_share_pair:
        "Voor mensen die {a} en {b} combineren — zoals echte mensen zich meestal laten zien.",
      cc_tension: "De innerlijke spanning",
      cc_handle: "Zo ga je met hen om",
      cc_watch: "Let op",
      cc_side: "De {name} kant",
      cc_open: "Open de volledige {name}-kaart →",
      footer_workshop: "De workshop Vier Kleuren",

      /* — keuzetestpagina — */
      fc_meta_title: "Keuzetest — De Vier Kleuren (DISC-workshop)",
      fc_meta_desc:
        "Een alternatieve DISC-zelftest volgens de klassieke keuzemethode — kies wat het MEEST en het MINST bij je past. Vergelijk het met de likerttest in de workshop Vier Kleuren.",
      fc_back: "← Terug naar de workshop",
      fc_kicker: "Alternatieve methode",
      fc_h2: "Keuzetest over jezelf",
      fc_sub:
        'De klassieke DISC-aanpak die sommige professionals verkiezen: kies bij elke groep van vier woorden het woord dat het <em>meest</em> bij je past en het woord dat het <em>minst</em> bij je past. Vergelijk je uitkomst met de <a href="index.html#self">likerttest</a> en kijk welke het beste klopt.',
      fc_intro_h3: "10 woordgroepen",
      fc_intro_p:
        "Kies in elke groep van vier je <b>Meest</b> en je <b>Minst</b>. Snel en op gevoel werkt het best.",
      fc_start: "Start de test",
      fc_question: "Wat past het meest &amp; het minst bij je?",
      fc_legend:
        '<span><b class="m">● Meest</b> — past het meest bij mij</span><span><b class="l">● Minst</b> — past het minst bij mij</span>',
      fc_most: "Meest",
      fc_least: "Minst",
      fc_most_aria: "Past het meest bij mij",
      fc_least_aria: "Past het minst bij mij",
      fc_eyebrow: "Jouw dominante stijl (keuzetest)",
      fc_note:
        '<b>Methodes vergelijken:</b> een keuzetest (ipsatief) overdrijft je sterkste en zwakste kleuren, omdat elke keuze de ene kleur tegen de andere afweegt. Bij de <a href="index.html#self">likerttest</a> scoren kleuren onafhankelijk van elkaar, waardoor milde mixen zachter uitvallen. Geen van beide is “de juiste” — samen brengen ze je echte profiel in beeld.',
      fc_to_likert: "Probeer de likerttest →",
      fc_cta_pair: "📇 Jouw kaart “Zo communiceer je met mij” →",
      fc_cta_single: "📇 Jouw {name}-communicatiekaart →",

      rd_strengths: "Belangrijkste sterktes",
      rd_watch: "Let op",
      rd_motiv_self: "Jij wordt gemotiveerd door",
      rd_motiv_other: "Deze persoon wordt gemotiveerd door",
      rd_connect_self: "Zo maak jij het beste contact",
      rd_connect_other: "Zo maak je contact met hen",

      blend_pure_self:
        "Je scoort als een bijna zuivere {1} — een zeldzaam, uitzonderlijk helder eenkleurig profiel.",
      blend_four_self:
        "Je bent een opvallend gelijkmatige mix van alle vier de kleuren — {1}, {2}, {3} en {4} liggen dicht bij elkaar. In plaats van één vaste stijl schakel je flink, afhankelijk van de situatie en de mensen om je heen. Lees het moment voordat je bepaalt welke kleur je laat zien.",
      blend_three_self:
        "Je bent een brede driekleurenmix van {1}, {2} en {3}. Je put uit wat op dat moment past, waardoor je stijl duidelijk meebeweegt met de situatie in plaats van vast te liggen.",
      blend_strong_self:
        "Je leidt sterk met {1}, ondersteund door {2} als duidelijke tweede stijl.",
      blend_common_self:
        "Je leidt met {1}, stevig ondersteund door {2} — een veelvoorkomende tweekleurenmix.",
      blend_even_self:
        "Je bent een vrijwel gelijke mix van {1} en {2} en beweegt soepel tussen beide.",
      blend_pure_other:
        "Deze persoon scoort als een bijna zuivere {1} — een zeldzaam, uitzonderlijk helder eenkleurig profiel.",
      blend_four_other:
        "Deze persoon is een opvallend gelijkmatige mix van alle vier de kleuren — {1}, {2}, {3} en {4} liggen dicht bij elkaar. In plaats van één vaste stijl schakelt deze persoon flink, afhankelijk van de situatie en de mensen eromheen. Lees het moment voordat je bepaalt welke kleur je ziet.",
      blend_three_other:
        "Deze persoon is een brede driekleurenmix van {1}, {2} en {3} en put uit wat op dat moment past, waardoor de stijl duidelijk meebeweegt met de situatie.",
      blend_strong_other:
        "Deze persoon leidt sterk met {1}, ondersteund door {2} als duidelijke tweede stijl.",
      blend_common_other:
        "Deze persoon leidt met {1}, stevig ondersteund door {2} — een veelvoorkomende tweekleurenmix.",
      blend_even_other:
        "Deze persoon is een vrijwel gelijke mix van {1} en {2} en beweegt soepel tussen beide.",
    },

    /* ------------------------------------------------------------------ FR */
    fr: {
      lang_name: "Français",
      meta_title: "Les Quatre Couleurs — Un atelier de personnalité DISC",
      meta_desc:
        "Un atelier DISC interactif inspiré d'« Entouré d'idiots » de Thomas Erikson. Découvrez les quatre profils de couleur — Rouge, Jaune, Vert et Bleu — et passez les tests d'auto-évaluation et d'observation en direct.",

      skip: "Aller au contenu",
      brand: "Quatre Couleurs",
      nav_toggle: "Ouvrir le menu",
      lang_label: "Langue",
      nav_learn: "Comprendre",
      nav_self: "Se tester",
      nav_observe: "Lire quelqu'un",
      nav_quick: "Test express",
      nav_tips: "Conseils",
      nav_cards: "Fiches",
      nav_faq: "FAQ",

      hero_eyebrow: "Un atelier de personnalité DISC",
      hero_title: "Êtes-vous vraiment<br />entouré d'idiots ?",
      hero_lead:
        "Ou les gens autour de vous parlent-ils simplement une autre couleur ? Découvrez les quatre styles comportementaux d'<em>Entouré d'idiots</em> de Thomas Erikson, trouvez le vôtre et apprenez à lire tous les autres.",
      hero_cta1: "Se tester",
      hero_cta2: "Voir les couleurs",
      col_red: "Rouge",
      col_yellow: "Jaune",
      col_green: "Vert",
      col_blue: "Bleu",
      lbl_red: "Dominance",
      lbl_yellow: "Influence",
      lbl_green: "Stabilité",
      lbl_blue: "Conformité",

      learn_kicker: "Le modèle",
      learn_h2: "Les quatre couleurs",
      learn_sub:
        "Chacun est un mélange, mais la plupart d'entre nous mènent avec une ou deux couleurs. Cliquez sur une carte pour voir comment ce style communique, décide, travaille et crée du lien.",
      explore: "Découvrir {name} →",
      close: "Fermer",
      d_comm: "Communication",
      d_dec: "Prise de décision",
      d_env: "Environnement de travail",
      d_stress: "Sous stress",
      d_str: "Forces",
      d_watch: "Points de vigilance",
      d_motiv: "Motivé par",
      d_connect: "Comment créer le lien",

      matrix_title: "Comment les couleurs s'entendent",
      matrix_sub: "Choisissez deux couleurs pour voir ce qui accroche et ce qui coince.",
      matrix_you: "Vous êtes",
      matrix_they: "L'autre est",
      matrix_empty: "Choisissez une couleur dans chaque ligne ci-dessus.",
      matrix_meets: "rencontre",

      self_kicker: "Test 1",
      self_h2: "Se tester",
      self_sub:
        "Indiquez à quel point chaque affirmation vous décrit. Il n'y a pas de bonne réponse et les questions s'affichent une à une — votre profil complet n'apparaît qu'à la fin.",
      self_intro_h3: "20 affirmations rapides",
      self_intro_p:
        "Répondez honnêtement et spontanément — fiez-vous à votre première réaction. Comptez environ trois minutes.",
      self_start: "Commencer le test",
      self_alt:
        'Vous préférez une autre méthode ? Essayez le <a href="self-forced-choice.html">test à choix forcé</a> (le plus / le moins comme moi) et comparez.',
      likert1: "Pas du tout <br>d'accord",
      likert2: "Plutôt pas <br>d'accord",
      likert3: "Neutre",
      likert4: "Plutôt <br>d'accord",
      likert5: "Tout à fait <br>d'accord",
      prev: "← Précédent",
      self_chart_aria: "Votre équilibre de couleurs DISC",
      self_eyebrow: "Votre style dominant",
      retake: "Refaire",
      print: "Imprimer / PDF",
      to_observe: "Lisez quelqu'un d'autre →",
      cta_pair_self: "📇 Partagez votre fiche « Comment communiquer avec moi » →",
      cta_single_self: "📇 Partagez votre fiche de communication {name} →",

      obs_kicker: "Test 2",
      obs_h2: "Lire quelqu'un d'autre",
      obs_sub:
        "Pensez à une personne précise — un collègue, un proche ou un ami. Lisez d'abord son style <em>naturel</em> (le graphique bouge en direct), puis une courte seconde série révèle son style <em>adapté</em> sous pression.",
      obs_intro_h3: "Qui allez-vous lire ?",
      obs_intro_p: "Donnez un nom ou une étiquette pour pouvoir refaire l'exercice avec plusieurs personnes.",
      obs_name_ph: "ex. Mon manager, Alex, maman…",
      obs_name_aria: "Nom de la personne",
      obs_start: "Commencer la lecture",
      toggle_hide: "Masquer les indices de couleur",
      toggle_show: "Afficher les indices de couleur",
      who_fallback: "cette personne",
      reading_who: "Lecture : <b>{who}</b> · style naturel",
      live_title: "Lecture en direct",
      live_wait: "Répondez pour commencer…",
      live_leading: "{c} en tête",
      obs_chart_aria: "Probabilité de couleur en direct",
      bridge_h3: "Et maintenant — sous pression",
      bridge_text:
        "Au naturel, {who} se lit surtout comme {top}. Place à six questions rapides sur le comportement de {who} <em>sous pression</em> — son style <strong>adapté</strong>.",
      obs_continue: "Continuer",
      adapt_who: "Sous pression &amp; stress",
      obs_result_chart_aria: "Équilibre des couleurs, naturel contre sous pression",
      obs_eyebrow: "Le style naturel de {who}",
      conf_high: "Confiance élevée",
      conf_mid: "Confiance modérée",
      conf_low: "Confiance faible — un vrai mélange",
      shift_h4: "Naturel contre sous pression",
      shift_same:
        "{Who} reste plutôt constant — {nat} domine, détendu comme sous tension. Ce que vous voyez est proche de ce que vous obtenez.",
      shift_diff:
        "Au calme, {who} mène avec {nat}. Sous pression, {who} glisse vers {adapt} — {riser} monte tandis que {faller} s'efface. Attendez-vous à une personne nettement différente les jours de tension, et adaptez votre approche.",
      radar_natural: "Naturel",
      radar_pressure: "Sous pression",
      obs_restart: "Lire une autre personne",
      to_tips: "Comment travailler avec cette personne →",
      cta_pair_other: "📇 Sa fiche « Comment communiquer avec cette personne » →",
      cta_single_other: "📇 La fiche de communication {name} →",

      quick_kicker: "60 secondes",
      quick_h2: "Identification express",
      quick_sub:
        "Pressé ? Quatre choix rapides donnent une lecture approximative de n'importe qui — vous compris.",
      quick_again: "Recommencer",

      tips_kicker: "Guide de terrain",
      tips_h2: "Travailler avec chaque couleur",
      tips_sub: "À faire et à éviter pour communiquer avec chaque style.",
      tip_do: "À faire",
      tip_dont: "À éviter",

      cards_kicker: "À partager",
      cards_h2: "Fiches « Comment communiquer avec moi »",
      cards_sub:
        "Une page ciblée par couleur — et une pour chaque mélange de deux couleurs — avec l'essentiel : à faire, à éviter et les phrases qui marchent. Envoyez la vôtre à un collègue, ou ouvrez celle d'un autre avant votre prochaine conversation.",
      cards_singles: "Couleurs seules",
      cards_pairs: "Mélanges de deux couleurs",

      faq_kicker: "Questions",
      faq_h2: "Questions fréquentes",

      footer_note:
        "Un atelier pédagogique inspiré d'<em>Entouré d'idiots</em> de Thomas Erikson et du modèle comportemental DISC de William Moulton Marston. Conçu pour la réflexion et de meilleures conversations — pas pour un diagnostic clinique.",
      footer_support:
        "Envie du tableau complet ? <strong>Lisez <em>Entouré d'idiots</em> de Thomas Erikson</strong> — achetez le livre et soutenez l'auteur.",
      footer_edition: "Édition atelier",

      /* — page fiche de communication — */
      cc_meta_desc:
        "Une fiche de communication DISC à partager : l'essentiel à faire, à éviter et les phrases qui marchent pour chaque couleur et chaque mélange de deux couleurs. Inspirée d'« Entouré d'idiots » de Thomas Erikson.",
      cc_title_single: "Comment communiquer avec un {name} — Fiche de communication DISC",
      cc_title_pair: "Comment communiquer avec un mélange {title} — Fiche de communication DISC",
      cc_back_all: "← Toutes les fiches & l'atelier",
      cc_other: "Autres fiches de communication",
      cc_back_workshop: "← Retour à l'atelier",
      cc_kicker: "Comment communiquer avec",
      cc_h1_single: "un {name} <span>· {label}</span>",
      cc_share_single:
        "Partagez cette fiche avec tous ceux qui travaillent avec un {name} — ou gardez-la comme miroir pour vous-même.",
      cc_rules: "Trois règles d'or",
      cc_good: "Les phrases qui marchent",
      cc_bad: "Les phrases qui braquent",
      cc_practice: "En pratique",
      cc_writing: "À l'écrit",
      cc_conflict: "En cas de conflit",
      cc_motivate: "Pour motiver",
      cc_pressure: "Sous pression, cette personne devient",
      cc_h1_pair: "un mélange {title}",
      cc_share_pair:
        "Pour celles et ceux qui mêlent {a} et {b} — la façon la plus courante dont les gens se présentent vraiment.",
      cc_tension: "La tension intérieure",
      cc_handle: "Comment s'y prendre",
      cc_watch: "À surveiller",
      cc_side: "Le côté {name}",
      cc_open: "Ouvrir la fiche {name} complète →",
      footer_workshop: "L'atelier Quatre Couleurs",

      /* — page test à choix forcé — */
      fc_meta_title: "Test à choix forcé — Les Quatre Couleurs (atelier DISC)",
      fc_meta_desc:
        "Une auto-évaluation DISC alternative selon la méthode classique du choix forcé — désignez ce qui vous ressemble le PLUS et le MOINS. Comparez avec le test de Likert de l'atelier Quatre Couleurs.",
      fc_back: "← Retour à l'atelier",
      fc_kicker: "Méthode alternative",
      fc_h2: "Auto-évaluation à choix forcé",
      fc_sub:
        'L\'approche DISC classique que certains praticiens préfèrent : dans chaque groupe de quatre mots, choisissez celui qui vous ressemble le <em>plus</em> et celui qui vous ressemble le <em>moins</em>. Comparez votre résultat avec le <a href="index.html#self">test de Likert</a> pour voir lequel sonne le plus juste.',
      fc_intro_h3: "10 groupes de mots",
      fc_intro_p:
        "Dans chaque groupe de quatre, choisissez votre <b>Plus</b> et votre <b>Moins</b>. Rapide et instinctif, c'est le mieux.",
      fc_start: "Commencer le test",
      fc_question: "Qu'est-ce qui vous ressemble le plus &amp; le moins ?",
      fc_legend:
        '<span><b class="m">● Plus</b> — me ressemble le plus</span><span><b class="l">● Moins</b> — me ressemble le moins</span>',
      fc_most: "Plus",
      fc_least: "Moins",
      fc_most_aria: "Me ressemble le plus",
      fc_least_aria: "Me ressemble le moins",
      fc_eyebrow: "Votre style dominant (choix forcé)",
      fc_note:
        '<b>Comparer les méthodes :</b> le choix forcé (ipsatif) exagère vos couleurs les plus fortes et les plus faibles, car chaque choix oppose une couleur à une autre. Le <a href="index.html#self">test de Likert</a> laisse les couleurs se noter indépendamment, si bien que les mélanges légers ressortent plus en douceur. Aucun n\'est « correct » — ensemble, ils cernent la personne que vous êtes vraiment.',
      fc_to_likert: "Essayer le test de Likert →",
      fc_cta_pair: "📇 Votre fiche « Comment communiquer avec moi » →",
      fc_cta_single: "📇 Votre fiche de communication {name} →",

      rd_strengths: "Forces principales",
      rd_watch: "Points de vigilance",
      rd_motiv_self: "Vous êtes motivé par",
      rd_motiv_other: "Cette personne est motivée par",
      rd_connect_self: "Comment vous créez le lien",
      rd_connect_other: "Comment créer le lien avec elle",

      blend_pure_self:
        "Vous obtenez un profil presque purement {1} — un profil monochrome rare et exceptionnellement net.",
      blend_four_self:
        "Vous êtes un mélange étonnamment équilibré des quatre couleurs — {1}, {2}, {3} et {4} se tiennent de très près. Plutôt qu'un style figé, vous changez sensiblement selon la situation et les personnes autour de vous. Lisez le moment avant de décider quelle couleur vous montrez.",
      blend_three_self:
        "Vous êtes un large mélange de trois couleurs : {1}, {2} et {3}. Vous puisez dans celle qui convient au moment, si bien que votre style s'adapte nettement à la situation au lieu de rester figé.",
      blend_strong_self:
        "Vous menez nettement avec {1}, appuyé par {2} comme style secondaire clair.",
      blend_common_self:
        "Vous menez avec {1}, fortement soutenu par {2} — un mélange à deux couleurs très courant.",
      blend_even_self:
        "Vous êtes un mélange presque égal de {1} et de {2}, passant de l'un à l'autre avec fluidité.",
      blend_pure_other:
        "Cette personne obtient un profil presque purement {1} — un profil monochrome rare et exceptionnellement net.",
      blend_four_other:
        "Cette personne est un mélange étonnamment équilibré des quatre couleurs — {1}, {2}, {3} et {4} se tiennent de très près. Plutôt qu'un style figé, elle change sensiblement selon la situation et les personnes autour d'elle. Lisez le moment avant de décider quelle couleur elle montre.",
      blend_three_other:
        "Cette personne est un large mélange de trois couleurs : {1}, {2} et {3}. Elle puise dans celle qui convient au moment, si bien que son style s'adapte nettement à la situation.",
      blend_strong_other:
        "Cette personne mène nettement avec {1}, appuyée par {2} comme style secondaire clair.",
      blend_common_other:
        "Cette personne mène avec {1}, fortement soutenue par {2} — un mélange à deux couleurs très courant.",
      blend_even_other:
        "Cette personne est un mélange presque égal de {1} et de {2}, passant de l'un à l'autre avec fluidité.",
    },
  };

  /* ==========================================================================
     LANGUAGE SELECTION
     ========================================================================== */
  function fromQuery() {
    try {
      const q = new URLSearchParams(window.location.search).get("lang");
      return q ? q.slice(0, 2).toLowerCase() : null;
    } catch (e) {
      return null;
    }
  }
  function fromStore() {
    try {
      return localStorage.getItem(STORE_KEY);
    } catch (e) {
      return null;
    }
  }
  function fromBrowser() {
    const list = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || ""];
    for (const raw of list) {
      const code = String(raw).slice(0, 2).toLowerCase();
      if (LANGS.indexOf(code) !== -1) return code;
    }
    return null;
  }
  function detect() {
    const candidates = [fromQuery(), fromStore(), fromBrowser()];
    for (const c of candidates) if (c && LANGS.indexOf(c) !== -1) return c;
    return "en";
  }

  const lang = detect();
  // Only an explicit choice (?lang= or the switcher) is remembered, so browser
  // detection keeps working for visitors who never picked a language.
  if (fromQuery()) {
    try {
      localStorage.setItem(STORE_KEY, lang);
    } catch (e) {
      /* private mode — fall back to per-page detection */
    }
  }

  function setLang(next) {
    if (LANGS.indexOf(next) === -1 || next === lang) return;
    try {
      localStorage.setItem(STORE_KEY, next);
    } catch (e) {
      /* ignore */
    }
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.location.replace(url.toString());
  }

  /* ==========================================================================
     TRANSLATION
     ========================================================================== */
  function fill(str, vars) {
    if (!vars) return str;
    return str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  }
  function t(key, vars) {
    const table = UI[lang] || UI.en;
    const str = key in table ? table[key] : UI.en[key];
    return fill(str === undefined ? key : str, vars);
  }
  /* Capitalise the first letter — used where a name or "this person" opens a sentence. */
  function cap(s) {
    return String(s).charAt(0).toUpperCase() + String(s).slice(1);
  }

  /* ==========================================================================
     DOM APPLICATION
     ========================================================================== */
  function apply(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    scope.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    scope.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPh);
    });
    scope.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.dataset.i18nAria));
    });
  }

  function applyDocument() {
    const root = document.documentElement;
    root.lang = lang;
    // Pages that build their own <title> (the communication card) simply omit
    // data-i18n-title and keep control of it.
    if (root.dataset.i18nTitle) document.title = t(root.dataset.i18nTitle);
    if (root.dataset.i18nDesc) {
      const copy = t(root.dataset.i18nDesc);
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", copy);
      const ogD = document.querySelector('meta[property="og:description"]');
      if (ogD) ogD.setAttribute("content", copy);
    }
    if (root.dataset.i18nTitle) {
      const ogT = document.querySelector('meta[property="og:title"]');
      if (ogT) ogT.setAttribute("content", t(root.dataset.i18nTitle));
    }
    apply(document);
    buildSwitcher();
  }

  /* Wire up any .lang-switch present on the page. */
  function buildSwitcher() {
    document.querySelectorAll(".lang-switch").forEach((box) => {
      box.setAttribute("aria-label", t("lang_label"));
      box.querySelectorAll("[data-lang]").forEach((btn) => {
        const code = btn.dataset.lang;
        const on = code === lang;
        btn.classList.toggle("on", on);
        btn.setAttribute("aria-pressed", String(on));
        btn.title = UI[code] ? UI[code].lang_name : code;
        btn.addEventListener("click", () => setLang(code));
      });
    });
  }

  document.addEventListener("DOMContentLoaded", applyDocument);

  return { LANGS, lang, t, cap, setLang, apply, UI };
})();

/* The content pack for the active language — every other script reads `DISC`. */
const DISC =
  window["DISC_" + DISC_I18N.lang.toUpperCase()] || window.DISC_EN;
