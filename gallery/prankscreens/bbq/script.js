/* ============================================================
   BBQ Mailer — data-driven, trilingual (NL / EN / FR)
   Features: language switcher, dark mode, search, live preview,
   editable body, copy to clipboard, favorites, recommended emails.
   All client-side, no backend.
   ============================================================ */

// ---------- UI strings ----------
const i18n = {
    nl: {
        htmlLang: 'nl',
        pageTitle: 'BBQ E-mail',
        introLine1: 'Computer Vergeten Te Vergrendelen?',
        introLine2: 'Tijd om een grappige mail te sturen!',
        recipientsLabel: '# Verstuur naar (selecteer één of meerdere):',
        bbqRecipientDesc: '(Ik tel anoniem hoeveel mensen hun computer niet vergrendelen)',
        customEmailLabel: 'Eigen e-mailadres:',
        customEmailPlaceholder: 'naam@voorbeeld.be',
        recommendedUsed: 'Eerder gebruikt e-mailadres',
        chooseEmailLabel: '# Kies je prank e-mail:',
        searchPlaceholder: 'Zoek een e-mail...',
        randomBtn: '🎲 Random',
        noResults: 'Geen e-mail gevonden.',
        previewTitle: '# Voorbeeld van de e-mail:',
        previewEmpty: 'Selecteer hierboven een e-mail om het voorbeeld te zien.',
        previewTo: 'Aan:',
        previewSubject: 'Onderwerp:',
        previewBody: 'Bericht (aanpasbaar):',
        sendBtn: '📧 Openen in mail',
        copyBtn: '📋 Kopiëren',
        copiedMsg: 'Gekopieerd!',
        noRecipient: 'Selecteer minstens één ontvanger.',
        favTitle: 'Zet bij favorieten',
        unfavTitle: 'Verwijder uit favorieten',
        noRecipientPreview: '(nog geen ontvanger geselecteerd)'
    },
    en: {
        htmlLang: 'en',
        pageTitle: 'BBQ Email',
        introLine1: 'Forgot To Lock Your Computer?',
        introLine2: 'Time to send a funny email!',
        recipientsLabel: '# Send to (select one or more):',
        bbqRecipientDesc: '(I anonymously count how many people forget to lock their computer)',
        customEmailLabel: 'Your own email address:',
        customEmailPlaceholder: 'name@example.com',
        recommendedUsed: 'Previously used address',
        chooseEmailLabel: '# Pick your prank email:',
        searchPlaceholder: 'Search an email...',
        randomBtn: '🎲 Random',
        noResults: 'No email found.',
        previewTitle: '# Email preview:',
        previewEmpty: 'Select an email above to see the preview.',
        previewTo: 'To:',
        previewSubject: 'Subject:',
        previewBody: 'Message (editable):',
        sendBtn: '📧 Open in mail',
        copyBtn: '📋 Copy',
        copiedMsg: 'Copied!',
        noRecipient: 'Select at least one recipient.',
        favTitle: 'Add to favorites',
        unfavTitle: 'Remove from favorites',
        noRecipientPreview: '(no recipient selected yet)'
    },
    fr: {
        htmlLang: 'fr',
        pageTitle: 'E-mail BBQ',
        introLine1: 'Ordinateur Pas Verrouillé ?',
        introLine2: 'Il est temps d\u2019envoyer un e-mail rigolo !',
        recipientsLabel: '# Envoyer à (sélectionnez un ou plusieurs) :',
        bbqRecipientDesc: '(Je compte anonymement combien de personnes oublient de verrouiller leur ordinateur)',
        customEmailLabel: 'Votre propre adresse e-mail :',
        customEmailPlaceholder: 'nom@exemple.com',
        recommendedUsed: 'Adresse déjà utilisée',
        chooseEmailLabel: '# Choisissez votre e-mail farceur :',
        searchPlaceholder: 'Rechercher un e-mail...',
        randomBtn: '🎲 Aléatoire',
        noResults: 'Aucun e-mail trouvé.',
        previewTitle: '# Aperçu de l\u2019e-mail :',
        previewEmpty: 'Sélectionnez un e-mail ci-dessus pour voir l\u2019aperçu.',
        previewTo: 'À :',
        previewSubject: 'Objet :',
        previewBody: 'Message (modifiable) :',
        sendBtn: '📧 Ouvrir dans le mail',
        copyBtn: '📋 Copier',
        copiedMsg: 'Copié !',
        noRecipient: 'Sélectionnez au moins un destinataire.',
        favTitle: 'Ajouter aux favoris',
        unfavTitle: 'Retirer des favoris',
        noRecipientPreview: '(aucun destinataire sélectionné)'
    }
};

// ---------- Email templates ----------
// Each template: icon + per-language { label, preview, subject, body }.
const emailTemplates = [
    {
        id: 'bbq', icon: '🍖',
        nl: {
            label: 'BBQ Organiseren',
            preview: 'Premium BBQ met Hawaiiaanse dresscode...',
            subject: 'Ik organiseer een bedrijfs-BBQ! 🍖',
            body: `Beste collega's,

Ik voel me vandaag bijzonder genereus! Daarom heb ik besloten om een spectaculaire bedrijfs-BBQ te organiseren. Ik neem de volledige organisatie en kosten op mij.

Datum: Aanstaande zaterdag
Locatie: Mijn achtertuin
Dresscode: Hawaiiaans shirt verplicht

Ik ga volledig all-in met:
- Premium steaks en worsten
- Verse salades
- Drankjes zonder limiet
- Live DJ
- Springkasteel voor de kinderen (en volwassenen die jong van hart zijn)

Laat me voor maandag weten of je komt, zodat ik voldoende kan inkopen!

Met gegrilde groeten,`
        },
        en: {
            label: 'Organize a BBQ',
            preview: 'Premium BBQ with a Hawaiian dress code...',
            subject: 'I\u2019m organizing a company BBQ! 🍖',
            body: `Dear colleagues,

I\u2019m feeling especially generous today! That\u2019s why I\u2019ve decided to organize a spectacular company BBQ. I\u2019ll handle all the organizing and cover every cost myself.

Date: This coming Saturday
Location: My back garden
Dress code: Hawaiian shirt mandatory

I\u2019m going all in with:
- Premium steaks and sausages
- Fresh salads
- Unlimited drinks
- A live DJ
- A bouncy castle for the kids (and adults who are young at heart)

Let me know before Monday if you\u2019re coming so I can buy enough!

Grilled regards,`
        },
        fr: {
            label: 'Organiser un BBQ',
            preview: 'BBQ premium avec code vestimentaire hawaïen...',
            subject: 'J\u2019organise un BBQ d\u2019entreprise ! 🍖',
            body: `Chers collègues,

Je me sens particulièrement généreux aujourd\u2019hui ! J\u2019ai donc décidé d\u2019organiser un BBQ d\u2019entreprise spectaculaire. Je prends toute l\u2019organisation et les frais à ma charge.

Date : Ce samedi
Lieu : Mon jardin
Code vestimentaire : Chemise hawaïenne obligatoire

Je fais les choses en grand :
- Steaks et saucisses premium
- Salades fraîches
- Boissons à volonté
- DJ en direct
- Château gonflable pour les enfants (et les adultes restés jeunes de cœur)

Dites-moi avant lundi si vous venez, pour que je puisse prévoir assez !

Cordialement grillées,`
        }
    },
    {
        id: 'pizza', icon: '🍕',
        nl: {
            label: 'Pizza Party',
            preview: '20 pizza\u2019s voor het hele kantoor...',
            subject: '🍕 Ik trakteer iedereen op pizza!',
            body: `Hallo team,

Omdat ik vandaag mijn computer niet had vergrendeld, trakteer ik als goedmaker het HELE kantoor op pizza! 🍕

Ik bestel 20 grote pizza\u2019s (margherita, pepperoni, vegetarisch, en een paar gekke smaken voor de avonturiers).

Wanneer: Vrijdag om 12:00
Waar: De grote vergaderzaal

Laat me voor woensdag je voorkeur weten, dan bestel ik genoeg.

Buon appetito!`
        },
        en: {
            label: 'Pizza Party',
            preview: '20 pizzas for the whole office...',
            subject: '🍕 Pizza on me for everyone!',
            body: `Hi team,

Since I forgot to lock my computer today, I\u2019m making up for it by treating the WHOLE office to pizza! 🍕

I\u2019m ordering 20 large pizzas (margherita, pepperoni, vegetarian, and a few wild flavours for the adventurous).

When: Friday at 12:00
Where: The big meeting room

Let me know your preference before Wednesday so I order enough.

Buon appetito!`
        },
        fr: {
            label: 'Soirée Pizza',
            preview: '20 pizzas pour tout le bureau...',
            subject: '🍕 Pizza offerte à tout le monde !',
            body: `Salut l\u2019équipe,

Comme j\u2019ai oublié de verrouiller mon ordinateur aujourd\u2019hui, je me rattrape en offrant des pizzas à TOUT le bureau ! 🍕

Je commande 20 grandes pizzas (margherita, pepperoni, végétarienne et quelques saveurs folles pour les aventuriers).

Quand : Vendredi à 12h00
Où : La grande salle de réunion

Dites-moi votre préférence avant mercredi pour que j\u2019en commande assez.

Buon appetito !`
        }
    },
    {
        id: 'snacks', icon: '🍩',
        nl: {
            label: 'Gratis Snacks',
            preview: '50 dozen donuts voor iedereen...',
            subject: 'GRATIS SNACKS VOOR IEDEREEN! 🍩',
            body: `Hallo team,

Ik trakteer vandaag op snacks! Ik heb net 50 dozen donuts, chips, chocolade en energy drinks besteld die binnen een uur worden geleverd.

Waarom? Gewoon omdat ik in een goede bui ben en vind dat we het allemaal verdienen!

Verzamel om 15:00 in de vergaderzaal voor de grote snack-uitdeling.

P.S. Ik heb ook vegetarische versies van de donuts!

Smakelijk!`
        },
        en: {
            label: 'Free Snacks',
            preview: '50 boxes of donuts for everyone...',
            subject: 'FREE SNACKS FOR EVERYONE! 🍩',
            body: `Hi team,

Snacks are on me today! I just ordered 50 boxes of donuts, chips, chocolate and energy drinks, all arriving within the hour.

Why? Simply because I\u2019m in a great mood and I think we all deserve it!

Gather in the meeting room at 15:00 for the great snack giveaway.

P.S. I got vegetarian donuts too!

Enjoy!`
        },
        fr: {
            label: 'Snacks Gratuits',
            preview: '50 boîtes de donuts pour tous...',
            subject: 'SNACKS GRATUITS POUR TOUS ! 🍩',
            body: `Salut l\u2019équipe,

Les snacks, c\u2019est pour moi aujourd\u2019hui ! Je viens de commander 50 boîtes de donuts, chips, chocolat et boissons énergisantes, livrées dans l\u2019heure.

Pourquoi ? Simplement parce que je suis de bonne humeur et que nous le méritons tous !

Rendez-vous à 15h00 dans la salle de réunion pour la grande distribution.

P.S. J\u2019ai aussi des donuts végétariens !

Bon appétit !`
        }
    },
    {
        id: 'cake', icon: '🎂',
        nl: {
            label: 'Verjaardagstaart',
            preview: '3 verdiepingen chocolade, vanille en red velvet...',
            subject: '🎂 Verjaardagstaart voor iedereen!',
            body: `Lieve collega's,

Hoewel het niet mijn verjaardag is, voel ik me vandaag jarig in mijn hart! ❤️

Daarom heb ik een GIGANTISCHE verjaardagstaart besteld van 3 verdiepingen met verschillende smaken:
- Chocolade
- Vanille
- Red velvet

De taart wordt in de namiddag geleverd in de kantine. Iedereen is welkom om mee te vieren en een stuk te pakken!

Breng je goede humeur mee (en eventueel een vork).

Tot dan!`
        },
        en: {
            label: 'Birthday Cake',
            preview: '3 tiers of chocolate, vanilla and red velvet...',
            subject: '🎂 Birthday cake for everyone!',
            body: `Dear colleagues,

Even though it\u2019s not my birthday, my heart feels like celebrating today! ❤️

So I ordered a GIGANTIC 3-tier birthday cake with different flavours:
- Chocolate
- Vanilla
- Red velvet

The cake will be delivered to the canteen this afternoon. Everyone is welcome to celebrate and grab a slice!

Bring your good mood (and maybe a fork).

See you then!`
        },
        fr: {
            label: 'Gâteau d\u2019anniversaire',
            preview: '3 étages de chocolat, vanille et red velvet...',
            subject: '🎂 Un gâteau d\u2019anniversaire pour tous !',
            body: `Chers collègues,

Même si ce n\u2019est pas mon anniversaire, mon cœur a envie de faire la fête aujourd\u2019hui ! ❤️

J\u2019ai donc commandé un GIGANTESQUE gâteau d\u2019anniversaire à 3 étages, avec plusieurs parfums :
- Chocolat
- Vanille
- Red velvet

Le gâteau sera livré à la cafétéria cet après-midi. Tout le monde est le bienvenu pour fêter ça et prendre une part !

Apportez votre bonne humeur (et éventuellement une fourchette).

À tout à l\u2019heure !`
        }
    },
    {
        id: 'icecream', icon: '🍦',
        nl: {
            label: 'IJscoman Komt Langs',
            preview: 'Een echte ijskar op het parkeerterrein...',
            subject: '🍦 De ijscoman komt naar kantoor!',
            body: `Beste collega's,

Verrassing! Ik heb een echte ijskar geboekt die vanmiddag naar ons parkeerterrein komt. 🍦

Iedereen mag onbeperkt kiezen:
- Softijs met alle toppings
- Waterijsjes
- Milkshakes
- Vegan en suikervrije opties

Wanneer: Vandaag om 14:30
Waar: Parkeerterrein voor de ingang

Luister naar het bekende deuntje en kom naar buiten. Alles is gratis, want ik ben vandaag in een zonnige bui!

Verkoelende groeten,`
        },
        en: {
            label: 'Ice Cream Truck',
            preview: 'A real ice cream van in the parking lot...',
            subject: '🍦 The ice cream van is coming to the office!',
            body: `Dear colleagues,

Surprise! I booked a real ice cream van that\u2019s coming to our parking lot this afternoon. 🍦

Unlimited choice for everyone:
- Soft serve with all the toppings
- Ice lollies
- Milkshakes
- Vegan and sugar-free options

When: Today at 14:30
Where: The parking lot by the entrance

Listen for the famous jingle and come outside. Everything is free, because I\u2019m in a sunny mood today!

Cool regards,`
        },
        fr: {
            label: 'Camion de Glaces',
            preview: 'Un vrai camion de glaces sur le parking...',
            subject: '🍦 Le camion de glaces arrive au bureau !',
            body: `Chers collègues,

Surprise ! J\u2019ai réservé un vrai camion de glaces qui vient sur notre parking cet après-midi. 🍦

Choix illimité pour tout le monde :
- Glace à l\u2019italienne avec tous les toppings
- Glaces à l\u2019eau
- Milkshakes
- Options véganes et sans sucre

Quand : Aujourd\u2019hui à 14h30
Où : Le parking devant l\u2019entrée

Écoutez le fameux jingle et sortez. Tout est gratuit, car je suis d\u2019humeur ensoleillée aujourd\u2019hui !

Fraîches salutations,`
        }
    },
    {
        id: 'lottery', icon: '💰',
        nl: {
            label: 'Loterij Gewonnen',
            preview: '€2.5 miljoen en bonussen voor iedereen...',
            subject: '💰 IK HEB DE LOTERIJ GEWONNEN!!!',
            body: `BESTE IEDEREEN,

ONGELOOFLIJK NIEUWS! Ik heb gisteren de Nationale Loterij gewonnen - €2.500.000!!!

Om dit te vieren wil ik iets terugdoen voor dit geweldige team:
- Iedereen krijgt een bonus van €5.000
- Teamuitje naar Dubai (all-inclusive, 1 week)
- Nieuwe laptops voor het hele kantoor
- Gratis parkeren voor het leven

Ik kom maandag langs met de cheques en de vliegtickets!

Dit meen ik echt, dit is GEEN grap! (Al heb ik wel vergeten mijn laptop te vergrendelen, dus misschien is het dat wel... 😉)

Rijk gegroet,`
        },
        en: {
            label: 'Won the Lottery',
            preview: '\u20ac2.5 million and bonuses for everyone...',
            subject: '💰 I WON THE LOTTERY!!!',
            body: `DEAR EVERYONE,

INCREDIBLE NEWS! I won the National Lottery yesterday \u2014 \u20ac2,500,000!!!

To celebrate, I want to give something back to this amazing team:
- Everyone gets a \u20ac5,000 bonus
- Team trip to Dubai (all-inclusive, 1 week)
- New laptops for the whole office
- Free parking for life

I\u2019ll drop by Monday with the cheques and the plane tickets!

I really mean it, this is NOT a joke! (Although I did forget to lock my laptop, so maybe it is... 😉)

Wealthy regards,`
        },
        fr: {
            label: 'Loterie Gagnée',
            preview: '2,5 millions d\u2019euros et des primes pour tous...',
            subject: '💰 J\u2019AI GAGNÉ À LA LOTERIE !!!',
            body: `CHERS TOUS,

NOUVELLE INCROYABLE ! J\u2019ai gagné à la Loterie Nationale hier \u2014 2 500 000 \u20ac !!!

Pour fêter ça, je veux redonner quelque chose à cette équipe formidable :
- Une prime de 5 000 \u20ac pour chacun
- Un voyage d\u2019équipe à Dubaï (tout compris, 1 semaine)
- De nouveaux ordinateurs portables pour tout le bureau
- Parking gratuit à vie

Je passe lundi avec les chèques et les billets d\u2019avion !

Je suis sérieux, ce n\u2019est PAS une blague ! (Bon, j\u2019ai oublié de verrouiller mon ordinateur, alors c\u2019en est peut-être une... 😉)

Riches salutations,`
        }
    },
    {
        id: 'vacation', icon: '🏖️',
        nl: {
            label: 'Extra Vakantie',
            preview: '5 gratis vakantiedagen weggeven...',
            subject: '🏖️ Extra vakantiedagen - mijn cadeau aan jullie!',
            body: `Dag collega's,

Ik heb een deal gesloten met management: ik heb mijn eigen vakantiedagen "gekocht" om ze aan jullie te geven!

Iedereen krijgt 5 extra vakantiedagen van mij cadeau! 🎁

Waarom? Omdat ik deze maand toch geen vakantie kan opnemen en ik vind dat jullie harder werken dan ik. Beschouw het maar als mijn manier om dank je wel te zeggen.

Geniet ervan en boek die droomvakantie!

Zonnige groeten,`
        },
        en: {
            label: 'Extra Holidays',
            preview: 'Giving away 5 free holiday days...',
            subject: '🏖️ Extra holiday days - my gift to you!',
            body: `Hi colleagues,

I struck a deal with management: I "bought" my own holiday days to give them to you!

Everyone gets 5 extra holiday days from me! 🎁

Why? Because I can\u2019t take holidays this month anyway and I think you all work harder than me. Consider it my way of saying thank you.

Enjoy them and book that dream trip!

Sunny regards,`
        },
        fr: {
            label: 'Congés Supplémentaires',
            preview: '5 jours de congé offerts...',
            subject: '🏖️ Des jours de congé en plus - mon cadeau pour vous !',
            body: `Bonjour à tous,

J\u2019ai conclu un accord avec la direction : j\u2019ai « acheté » mes propres jours de congé pour vous les offrir !

Chacun reçoit 5 jours de congé supplémentaires de ma part ! 🎁

Pourquoi ? Parce que je ne peux pas partir en vacances ce mois-ci de toute façon et que vous travaillez tous plus dur que moi. Voyez-y ma façon de dire merci.

Profitez-en et réservez le voyage de vos rêves !

Ensoleillées salutations,`
        }
    },
    {
        id: 'promotion', icon: '📈',
        nl: {
            label: 'CEO Sollicitatie',
            preview: '4-daagse werkweek en pyjama dresscode...',
            subject: '📈 Ik heb gevraagd om directeur te worden!',
            body: `Hallo allemaal,

Groot nieuws! Ik heb vandaag officieel gesolliciteerd naar de functie van Algemeen Directeur.

In mijn sollicitatiebrief heb ik beloofd dat als ik word aangenomen, ik de volgende veranderingen doorvoer:
- 4-daagse werkweek
- Onbeperkt chips, snacks en budget voor kantoorfeesten
- Elke vrijdag om 14:00 stoppen
- Verplichte powernaps tussen 12-13u
- Dresscode: pyjama's toegestaan

Ik reken op jullie steun! Wie wil mijn aanbevelingsbrief ondertekenen?

Toekomstige baas groet,`
        },
        en: {
            label: 'CEO Application',
            preview: '4-day work week and pyjama dress code...',
            subject: '📈 I applied to become the director!',
            body: `Hi everyone,

Big news! I officially applied for the position of General Director today.

In my application letter I promised that if I\u2019m hired, I\u2019ll roll out the following changes:
- A 4-day work week
- Unlimited chips, snacks and a budget for office parties
- Finishing every Friday at 14:00
- Mandatory power naps between 12-1pm
- Dress code: pyjamas allowed

I\u2019m counting on your support! Who wants to sign my recommendation letter?

Future boss regards,`
        },
        fr: {
            label: 'Candidature PDG',
            preview: 'Semaine de 4 jours et code vestimentaire pyjama...',
            subject: '📈 J\u2019ai posé ma candidature comme directeur !',
            body: `Bonjour à tous,

Grande nouvelle ! J\u2019ai posé aujourd\u2019hui ma candidature officielle au poste de Directeur Général.

Dans ma lettre de motivation, j\u2019ai promis que si je suis embauché, j\u2019instaurerai les changements suivants :
- Semaine de 4 jours
- Chips, snacks et budget illimités pour les fêtes de bureau
- Fin de journée à 14h00 tous les vendredis
- Siestes obligatoires entre 12h et 13h
- Code vestimentaire : pyjama autorisé

Je compte sur votre soutien ! Qui veut signer ma lettre de recommandation ?

Salutations du futur patron,`
        }
    },
    {
        id: 'pet', icon: '🐶',
        nl: {
            label: 'Sint-Bernard',
            preview: '75kg kantoorhond vanaf volgende week...',
            subject: '🐶 Ik breng mijn hond mee naar kantoor!',
            body: `Hey team,

Vanaf volgende week breng ik mijn hond Fluffy elke dag mee naar kantoor! 🐕

Ik heb HR overtuigd dat een kantoorhond de productiviteit verhoogt en stress verlaagt. Ze waren meteen akkoord!

Belangrijke info over Fluffy:
- Ras: Sint-Bernard (slechts 75kg, heel klein nog)
- Karakter: Energiek en speels
- Hobby's: Ballen vangen, mensen aflikken, luid blaffen bij vogels
- Dieet: Alles wat hij vindt (hou je lunch en laptop goed vast!)

Wie allergisch is of bang voor honden, mag thuiswerken. Voor iedereen anders: bereid je voor op een harige maar leuke tijd!

Woef woef!`
        },
        en: {
            label: 'St. Bernard',
            preview: '75kg office dog starting next week...',
            subject: '🐶 I\u2019m bringing my dog to the office!',
            body: `Hey team,

Starting next week I\u2019m bringing my dog Fluffy to the office every day! 🐕

I convinced HR that an office dog boosts productivity and lowers stress. They agreed right away!

Important info about Fluffy:
- Breed: St. Bernard (only 75kg, still tiny)
- Character: Energetic and playful
- Hobbies: Catching balls, licking people, barking loudly at birds
- Diet: Whatever he finds (hold on to your lunch and laptop!)

Anyone allergic or afraid of dogs may work from home. For everyone else: get ready for a hairy but fun time!

Woof woof!`
        },
        fr: {
            label: 'Saint-Bernard',
            preview: 'Chien de bureau de 75 kg dès la semaine prochaine...',
            subject: '🐶 J\u2019amène mon chien au bureau !',
            body: `Salut l\u2019équipe,

À partir de la semaine prochaine, j\u2019amène mon chien Fluffy au bureau tous les jours ! 🐕

J\u2019ai convaincu les RH qu\u2019un chien de bureau augmente la productivité et réduit le stress. Ils ont accepté tout de suite !

Infos importantes sur Fluffy :
- Race : Saint-Bernard (seulement 75 kg, encore tout petit)
- Caractère : Énergique et joueur
- Loisirs : Attraper des balles, lécher les gens, aboyer fort contre les oiseaux
- Régime : Tout ce qu\u2019il trouve (tenez bien votre déjeuner et votre ordinateur !)

Les personnes allergiques ou qui ont peur des chiens peuvent télétravailler. Pour les autres : préparez-vous à un moment poilu mais rigolo !

Ouaf ouaf !`
        }
    },
    {
        id: 'karaoke', icon: '🎤',
        nl: {
            label: 'Karaoke Toernooi',
            preview: 'Verplichte deelname aan karaoke competitie...',
            subject: '🎤 Verplicht Bedrijfs Karaoke Toernooi!',
            body: `Beste zangers en zangeressen,

Ik organiseer volgende vrijdag een Bedrijfs Karaoke Toernooi en iedereen MOET meedoen!

Locatie: Meeting room 1
Tijd: 14:00 - 18:00
Deelname: VERPLICHT (ik heb het al afgestemd met management)

Regels:
- Iedereen zingt minimaal 2 nummers
- Duetten zijn verplicht tussen afdelingen
- Winnaar krijgt een trofee (die ik zelf ga maken)

Ik heb al een professionele karaoke-set gehuurd en een jury samengesteld.

Begin maar met oefenen!

Muzikale groeten,`
        },
        en: {
            label: 'Karaoke Tournament',
            preview: 'Mandatory participation in a karaoke contest...',
            subject: '🎤 Mandatory Company Karaoke Tournament!',
            body: `Dear singers,

I\u2019m organizing a Company Karaoke Tournament next Friday and everyone MUST take part!

Location: Meeting room 1
Time: 14:00 - 18:00
Participation: MANDATORY (I already cleared it with management)

Rules:
- Everyone sings at least 2 songs
- Cross-department duets are mandatory
- The winner gets a trophy (which I\u2019ll make myself)

I\u2019ve already rented a professional karaoke set and assembled a jury.

Start practising!

Musical regards,`
        },
        fr: {
            label: 'Tournoi de Karaoké',
            preview: 'Participation obligatoire au concours de karaoké...',
            subject: '🎤 Tournoi de Karaoké d\u2019Entreprise Obligatoire !',
            body: `Chers chanteurs et chanteuses,

J\u2019organise vendredi prochain un Tournoi de Karaoké d\u2019Entreprise et tout le monde DOIT participer !

Lieu : Salle de réunion 1
Heure : 14h00 - 18h00
Participation : OBLIGATOIRE (c\u2019est déjà validé avec la direction)

Règles :
- Chacun chante au moins 2 chansons
- Les duos entre services sont obligatoires
- Le gagnant reçoit un trophée (que je vais fabriquer moi-même)

J\u2019ai déjà loué un karaoké professionnel et constitué un jury.

Commencez à répéter !

Salutations musicales,`
        }
    },
    {
        id: 'gymclub', icon: '💪',
        nl: {
            label: 'Bootcamp 6:30',
            preview: 'Dagelijkse ochtend training op parkeerterrein...',
            subject: '💪 Nieuwe Verplichte Ochtend Sportclub!',
            body: `Goedemorgen sportievelingen,

Vanaf maandag start ik elke ochtend om 06:30 een intense bootcamp training op het parkeerterrein!

Ik heb met mezelf afgesproken dat ik iedereen ga motiveren om fit te blijven. Dus verwacht ik IEDEREEN elke ochtend!

Wat neem je mee:
- Sportkleding
- Handdoek
- Water
- Goede mindset
- Geen excuses

Programma:
06:30 - 50 push-ups
06:45 - 5km hardlopen
07:15 - Burpees tot je erbij neervalt
07:45 - Gezonde smoothie (die ik trakteer)

Wie niet komt, krijgt van mij een motiverende reminder elke 5 minuten via Teams.

LET'S GO TEAM!

Sportief gegroet,`
        },
        en: {
            label: 'Bootcamp 6:30',
            preview: 'Daily morning training in the parking lot...',
            subject: '💪 New Mandatory Morning Sports Club!',
            body: `Good morning, athletes,

Starting Monday I\u2019m running an intense bootcamp every morning at 06:30 in the parking lot!

I\u2019ve promised myself I\u2019ll motivate everyone to stay fit. So I expect EVERYONE every morning!

What to bring:
- Sportswear
- A towel
- Water
- A good mindset
- No excuses

Program:
06:30 - 50 push-ups
06:45 - 5km run
07:15 - Burpees until you drop
07:45 - Healthy smoothie (on me)

Anyone who doesn\u2019t show up gets a motivating reminder from me every 5 minutes via Teams.

LET\u2019S GO TEAM!

Sporty regards,`
        },
        fr: {
            label: 'Bootcamp 6h30',
            preview: 'Entraînement matinal quotidien sur le parking...',
            subject: '💪 Nouveau Club Sportif Matinal Obligatoire !',
            body: `Bonjour les sportifs,

À partir de lundi, j\u2019organise chaque matin à 6h30 un bootcamp intensif sur le parking !

Je me suis promis de motiver tout le monde à rester en forme. J\u2019attends donc TOUT LE MONDE chaque matin !

À apporter :
- Tenue de sport
- Une serviette
- De l\u2019eau
- Un bon état d\u2019esprit
- Aucune excuse

Programme :
6h30 - 50 pompes
6h45 - 5 km de course
7h15 - Des burpees jusqu\u2019à l\u2019épuisement
7h45 - Smoothie sain (offert par moi)

Ceux qui ne viennent pas recevront de ma part un rappel motivant toutes les 5 minutes via Teams.

ALLEZ L\u2019ÉQUIPE !

Salutations sportives,`
        }
    },
    {
        id: 'talent', icon: '🌟',
        nl: {
            label: 'Talentenshow',
            preview: 'Iedereen treedt verplicht op met een act...',
            subject: '🌟 Bedrijfs Talentenshow - iedereen doet mee!',
            body: `Beste toekomstige sterren,

Ik organiseer een grote Bedrijfs Talentenshow en IEDEREEN moet een act voorbereiden! ✨

Wanneer: Vrijdagmiddag
Waar: De grote vergaderzaal (met echte podiumverlichting die ik heb geregeld)

Ideeën voor je act:
- Zingen, dansen of goochelen
- Een gedicht over kwartaalcijfers
- Jongleren met koffiemokken
- Je beste imitatie van de printer

Ik ben de presentator, de jury én de fotograaf. De winnaar krijgt de felbegeerde "Gouden Muis" award.

Geef je act voor woensdag door zodat ik het programma kan maken.

Break a leg!`
        },
        en: {
            label: 'Talent Show',
            preview: 'Everyone must perform an act...',
            subject: '🌟 Company Talent Show - everyone takes part!',
            body: `Dear future stars,

I\u2019m organizing a big Company Talent Show and EVERYONE has to prepare an act! ✨

When: Friday afternoon
Where: The big meeting room (with real stage lighting I arranged)

Ideas for your act:
- Singing, dancing or magic
- A poem about quarterly figures
- Juggling coffee mugs
- Your best impression of the printer

I\u2019m the host, the jury AND the photographer. The winner receives the coveted "Golden Mouse" award.

Send me your act before Wednesday so I can build the program.

Break a leg!`
        },
        fr: {
            label: 'Spectacle de Talents',
            preview: 'Chacun doit présenter un numéro...',
            subject: '🌟 Spectacle de Talents d\u2019Entreprise - tout le monde participe !',
            body: `Chères futures stars,

J\u2019organise un grand Spectacle de Talents d\u2019Entreprise et TOUT LE MONDE doit préparer un numéro ! ✨

Quand : Vendredi après-midi
Où : La grande salle de réunion (avec de vrais éclairages de scène que j\u2019ai installés)

Idées de numéro :
- Chant, danse ou magie
- Un poème sur les chiffres trimestriels
- Jongler avec des tasses à café
- Votre meilleure imitation de l\u2019imprimante

Je suis le présentateur, le jury ET le photographe. Le gagnant reçoit le convoité prix de la « Souris d\u2019Or ».

Envoyez-moi votre numéro avant mercredi pour que je prépare le programme.

Merde ! (comme on dit au théâtre)`
        }
    },
    {
        id: 'naproom', icon: '😴',
        nl: {
            label: 'Powernap Kamer',
            preview: 'Verplichte middagdutjes tussen 13 en 14u...',
            subject: '😴 Nieuwe Powernap-kamer + verplichte siësta!',
            body: `Beste collega's,

Goed nieuws voor de vermoeide zielen! Ik heb de kleine vergaderzaal omgetoverd tot een officiële Powernap-kamer. 🛏️

Wat is er nu:
- Gezellige ligstoelen en dekentjes
- Oordopjes en slaapmaskers
- Rustgevende walvisgeluiden
- Een "niet storen"-lampje

Nieuwe regel (afgestemd met mezelf): tussen 13:00 en 14:00 is de siësta VERPLICHT. Laptops dicht, telefoons uit, ogen dicht.

Wie snurkt, wordt vriendelijk maar beslist naar de gang verplaatst.

Welterusten en tot na de lunch,`
        },
        en: {
            label: 'Nap Room',
            preview: 'Mandatory afternoon naps between 1 and 2pm...',
            subject: '😴 New Nap Room + mandatory siesta!',
            body: `Dear colleagues,

Good news for the weary souls! I\u2019ve turned the small meeting room into an official Nap Room. 🛏️

What\u2019s inside now:
- Cosy loungers and blankets
- Earplugs and sleep masks
- Soothing whale sounds
- A "do not disturb" light

New rule (agreed with myself): between 13:00 and 14:00 the siesta is MANDATORY. Laptops closed, phones off, eyes shut.

Anyone who snores will be kindly but firmly moved to the hallway.

Sleep well and see you after lunch,`
        },
        fr: {
            label: 'Salle de Sieste',
            preview: 'Sieste obligatoire entre 13h et 14h...',
            subject: '😴 Nouvelle salle de sieste + sieste obligatoire !',
            body: `Chers collègues,

Bonne nouvelle pour les âmes fatiguées ! J\u2019ai transformé la petite salle de réunion en Salle de Sieste officielle. 🛏️

Ce qu\u2019on y trouve maintenant :
- Des transats confortables et des couvertures
- Des bouchons d\u2019oreilles et des masques de sommeil
- Des sons apaisants de baleines
- Un voyant « ne pas déranger »

Nouvelle règle (validée avec moi-même) : entre 13h00 et 14h00, la sieste est OBLIGATOIRE. Ordinateurs fermés, téléphones éteints, yeux fermés.

Quiconque ronfle sera gentiment mais fermement déplacé dans le couloir.

Bonne sieste et à après le déjeuner,`
        }
    },
    {
        id: 'parking', icon: '🅿️',
        nl: {
            label: 'Parkeerplaats Weggeven',
            preview: 'Mijn parkeerplaats gaat gratis naar iemand...',
            subject: '🅿️ Ik geef mijn parkeerplaats weg!',
            body: `Beste collega's,

Vandaag voel ik me genereus (en ik had blijkbaar mijn computer niet vergrendeld), dus: ik geef mijn geliefde parkeerplaats vlak bij de ingang WEG! 🅿️

De regels van de wedstrijd:
- Antwoord op deze mail met je beste reden waarom jij hem verdient
- Bonuspunten voor gedichten, tekeningen of een korte dans
- Ik kies de winnaar vrijdag om 16:00

De plek is van jou voor een volle maand, inclusief mijn zegen en een klein bordje met je naam.

Succes en moge de beste chauffeur winnen!

Geparkeerde groeten,`
        },
        en: {
            label: 'Give Away Parking',
            preview: 'My parking spot goes to someone for free...',
            subject: '🅿️ I\u2019m giving away my parking spot!',
            body: `Dear colleagues,

Today I\u2019m feeling generous (and I apparently forgot to lock my computer), so: I\u2019m GIVING AWAY my beloved parking spot right by the entrance! 🅿️

The contest rules:
- Reply to this email with your best reason why you deserve it
- Bonus points for poems, drawings or a short dance
- I\u2019ll pick the winner Friday at 16:00

The spot is yours for a full month, including my blessing and a little sign with your name.

Good luck, and may the best driver win!

Parked regards,`
        },
        fr: {
            label: 'Offrir ma Place de Parking',
            preview: 'Ma place de parking offerte à quelqu\u2019un...',
            subject: '🅿️ J\u2019offre ma place de parking !',
            body: `Chers collègues,

Aujourd\u2019hui je me sens généreux (et j\u2019ai apparemment oublié de verrouiller mon ordinateur), alors : j\u2019OFFRE ma précieuse place de parking juste devant l\u2019entrée ! 🅿️

Les règles du concours :
- Répondez à cet e-mail avec votre meilleure raison de la mériter
- Points bonus pour les poèmes, dessins ou une petite danse
- Je choisis le gagnant vendredi à 16h00

La place est à vous pour un mois entier, avec ma bénédiction et une petite pancarte à votre nom.

Bonne chance, et que le meilleur conducteur gagne !

Salutations garées,`
        }
    },
    {
        id: 'confession', icon: '💭',
        nl: {
            label: 'Bizarre Bekentenis',
            preview: 'Ik geef stiekem water aan jullie planten...',
            subject: '💭 Belangrijke bekentenis die ik moet delen...',
            body: `Lieve collega's,

Er is iets dat ik al maanden met me meedraag en ik moet het gewoon kwijt...

Ik... ik... moet bekennen dat...

...ik stiekem elke dag jullie plantjes water geef omdat ik denk dat ze zich eenzaam voelen! 🌱

Daar, ik heb het gezegd. Het voelt goed om eindelijk eerlijk te zijn.

Maar dat is niet alles. Ik heb ook alle post-its alfabetisch gesorteerd, de pennen op kleur gelegd, en soms praat ik tegen de printer als hij vastloopt.

Ik hoop dat jullie me hierna nog steeds kunnen accepteren zoals ik ben.

Met vriendelijke (en enigszins bizarre) groeten,`
        },
        en: {
            label: 'Bizarre Confession',
            preview: 'I secretly water your plants...',
            subject: '💭 An important confession I need to share...',
            body: `Dear colleagues,

There\u2019s something I\u2019ve been carrying for months and I just have to get it off my chest...

I... I... must confess that...

...I secretly water your plants every day because I think they feel lonely! 🌱

There, I said it. It feels good to finally be honest.

But that\u2019s not all. I also sorted all the sticky notes alphabetically, arranged the pens by colour, and sometimes I talk to the printer when it jams.

I hope you can still accept me for who I am after this.

Kind (and slightly bizarre) regards,`
        },
        fr: {
            label: 'Aveu Étrange',
            preview: 'J\u2019arrose vos plantes en cachette...',
            subject: '💭 Un aveu important que je dois partager...',
            body: `Chers collègues,

Il y a quelque chose que je porte depuis des mois et je dois m\u2019en libérer...

Je... je... dois avouer que...

...j\u2019arrose vos plantes en cachette tous les jours parce que je crois qu\u2019elles se sentent seules ! 🌱

Voilà, je l\u2019ai dit. Ça fait du bien d\u2019être enfin honnête.

Mais ce n\u2019est pas tout. J\u2019ai aussi trié tous les post-it par ordre alphabétique, rangé les stylos par couleur, et parfois je parle à l\u2019imprimante quand elle se bloque.

J\u2019espère que vous pourrez encore m\u2019accepter tel que je suis après ça.

Cordialement (et un peu bizarrement),`
        }
    },
    {
        id: 'unlocked', icon: '🔓',
        nl: {
            label: 'Computer Niet Vergrendeld',
            preview: 'Uitgebreide excuusbrief en trakteren volgende vrijdag...',
            subject: 'Mijn Oprechte Excuses - Computer Niet Vergrendeld 🔓',
            body: `Beste collega's, management, en iedereen die dit leest,

Ik schrijf deze e-mail met diepe schaamte en oprechte spijt. Vandaag heb ik een fundamentele fout gemaakt die niet alleen mijn eigen professionaliteit in twijfel trekt, maar ook de veiligheid van ons bedrijf en alle vertrouwelijke informatie waarmee we dagelijks werken.

Ik heb mijn computer niet vergrendeld toen ik van mijn werkplek wegging.

Ik weet het. Het is onvergeeflijk. We hebben allemaal de trainingen gevolgd. We hebben de waarschuwingen gehoord. We kennen de risico's. En toch, in een moment van onoplettendheid, heb ik deze cruciale stap overgeslagen.

Daarom wil ik het volgende aanbieden als genoegdoening:

VOLGENDE VRIJDAG TRAKTEER IK HET HELE KANTOOR OP:
🍕 LUNCH - premium pizza's voor iedereen (inclusief vegetarisch, vegan en glutenvrij)
🍰 DESSERT - een selectie taarten en gebak
☕ KOFFIE & DRANKEN - barista koffie, frisdrank en verse smoothies
🍩 SNACKS - een volledige snackbar

Dit evenement vindt plaats volgende vrijdag om 12:00 in de grote vergaderzaal.

Vanaf nu zal Windows+L mijn beste vriend zijn. Ik heb geleerd van deze fout.

Met nederige en beschaamde groeten,

P.S. - Serieus, vergeet niet je computer te vergrendelen. Leer van mijn fout!`
        },
        en: {
            label: 'Computer Left Unlocked',
            preview: 'Elaborate apology letter and a treat next Friday...',
            subject: 'My Sincere Apologies - Computer Left Unlocked 🔓',
            body: `Dear colleagues, management, and everyone reading this,

I write this email with deep shame and sincere regret. Today I made a fundamental mistake that not only calls my own professionalism into question, but also the security of our company and all the confidential information we work with daily.

I did not lock my computer when I left my workstation.

I know. It\u2019s unforgivable. We all took the trainings. We heard the warnings. We know the risks. And yet, in a moment of carelessness, I skipped this crucial step.

That\u2019s why I\u2019d like to offer the following as amends:

NEXT FRIDAY I\u2019M TREATING THE WHOLE OFFICE TO:
🍕 LUNCH - premium pizzas for everyone (including vegetarian, vegan and gluten-free)
🍰 DESSERT - a selection of cakes and pastries
☕ COFFEE & DRINKS - barista coffee, soft drinks and fresh smoothies
🍩 SNACKS - a full snack bar

This event takes place next Friday at 12:00 in the big meeting room.

From now on, Windows+L will be my best friend. I\u2019ve learned from this mistake.

With humble and embarrassed regards,

P.S. - Seriously, don\u2019t forget to lock your computer. Learn from my mistake!`
        },
        fr: {
            label: 'Ordinateur Non Verrouillé',
            preview: 'Longue lettre d\u2019excuses et invitation vendredi prochain...',
            subject: 'Mes Sincères Excuses - Ordinateur Non Verrouillé 🔓',
            body: `Chers collègues, direction, et tous ceux qui lisent ceci,

J\u2019écris cet e-mail avec une profonde honte et un sincère regret. Aujourd\u2019hui, j\u2019ai commis une erreur fondamentale qui remet en cause non seulement mon professionnalisme, mais aussi la sécurité de notre entreprise et de toutes les informations confidentielles que nous manipulons chaque jour.

Je n\u2019ai pas verrouillé mon ordinateur en quittant mon poste.

Je sais. C\u2019est impardonnable. Nous avons tous suivi les formations. Nous avons entendu les avertissements. Nous connaissons les risques. Et pourtant, dans un moment d\u2019inattention, j\u2019ai sauté cette étape cruciale.

C\u2019est pourquoi je propose ce qui suit en guise de réparation :

VENDREDI PROCHAIN, J\u2019INVITE TOUT LE BUREAU À :
🍕 DÉJEUNER - des pizzas premium pour tous (y compris végétarien, végane et sans gluten)
🍰 DESSERT - une sélection de gâteaux et pâtisseries
☕ CAFÉ & BOISSONS - café barista, sodas et smoothies frais
🍩 SNACKS - un bar à snacks complet

L\u2019événement aura lieu vendredi prochain à 12h00 dans la grande salle de réunion.

À partir de maintenant, Windows+L sera mon meilleur ami. J\u2019ai appris de cette erreur.

Avec d\u2019humbles et honteuses salutations,

P.S. - Sérieusement, n\u2019oubliez pas de verrouiller votre ordinateur. Apprenez de mon erreur !`
        }
    },
    {
        id: 'marriage', icon: '💍',
        nl: {
            label: 'Trouwuitnodiging',
            preview: 'Spontane bruiloft op kantoor volgende week...',
            subject: '💍 DRINGENDE UITNODIGING: Mijn Bruiloft Volgende Week!',
            body: `Lieve familie, vrienden en collega's,

Groot, spontaan nieuws! Ik ga TROUWEN! 💒

Ik weet wat jullie denken: Verrassing! De liefde komt als een dief in de nacht!

BRUILOFT DETAILS:
📅 Datum: Volgende donderdag
🕐 Tijd: 14:00 uur
📍 Locatie: Ons kantoorparkeerterrein (we maken er iets moois van!)
👗 Dresscode: Smart casual (of gewoon je werkkleding)

BELANGRIJKE INFO:
- Iedereen is uitgenodigd!
- Lunch wordt verzorgd (catering van de snackbar om de hoek)
- Open bar van 15:00 tot 17:00
- Ceremonie duurt ongeveer 20 minuten
- Daarna receptie op de tweede verdieping

De partner vind ik nog deze week (details volgen), maar ik wilde alvast iedereen uitnodigen!

RSVP voor het einde van de dag zodat ik weet hoeveel stoelen ik moet regelen.

Bijna-getrouwde groeten,`
        },
        en: {
            label: 'Wedding Invitation',
            preview: 'A spontaneous wedding at the office next week...',
            subject: '💍 URGENT INVITATION: My Wedding Next Week!',
            body: `Dear family, friends and colleagues,

Big, spontaneous news! I\u2019m getting MARRIED! 💒

I know what you\u2019re thinking: Surprise! Love comes like a thief in the night!

WEDDING DETAILS:
📅 Date: Next Thursday
🕐 Time: 14:00
📍 Location: Our office parking lot (we\u2019ll make it beautiful!)
👗 Dress code: Smart casual (or just your work clothes)

IMPORTANT INFO:
- Everyone is invited!
- Lunch is provided (catering from the snack bar around the corner)
- Open bar from 15:00 to 17:00
- The ceremony lasts about 20 minutes
- Followed by a reception on the second floor

I\u2019ll find the partner later this week (details to follow), but I wanted to invite everyone already!

RSVP by end of day so I know how many chairs to arrange.

Almost-married regards,`
        },
        fr: {
            label: 'Invitation de Mariage',
            preview: 'Mariage spontané au bureau la semaine prochaine...',
            subject: '💍 INVITATION URGENTE : Mon Mariage la Semaine Prochaine !',
            body: `Chère famille, chers amis et collègues,

Grande et spontanée nouvelle ! Je vais me MARIER ! 💒

Je sais ce que vous pensez : Surprise ! L\u2019amour arrive comme un voleur dans la nuit !

DÉTAILS DU MARIAGE :
📅 Date : Jeudi prochain
🕐 Heure : 14h00
📍 Lieu : Le parking du bureau (on va en faire quelque chose de joli !)
👗 Code vestimentaire : Chic décontracté (ou simplement vos habits de travail)

INFOS IMPORTANTES :
- Tout le monde est invité !
- Le déjeuner est offert (traiteur du snack du coin)
- Open bar de 15h00 à 17h00
- La cérémonie dure environ 20 minutes
- Suivie d\u2019une réception au deuxième étage

Je trouverai le/la partenaire d\u2019ici la fin de la semaine (détails à venir), mais je voulais déjà inviter tout le monde !

RSVP avant la fin de la journée pour que je sache combien de chaises prévoir.

Salutations bientôt mariées,`
        }
    },
    {
        id: 'chinese', icon: '🇨🇳',
        nl: {
            label: 'Chinees Bericht',
            preview: '我要请大家吃饭...',
            subject: '🇨🇳 我请大家吃饭！(Ik trakteer op Chinees eten!)',
            body: `亲爱的同事们，

我有一个好消息要告诉大家！

下周五我要请全公司吃中餐！🥢

菜单包括：
🍜 北京烤鸭
🥟 手工饺子
🍚 炒饭和炒面
🥡 各种中国菜
🍵 茶和饮料

时间：周五中午12点
地点：会议室

为什么要请客？因为我今天忘记锁电脑了，所以这是我的道歉方式！

请在周三前回复，这样我可以订购足够的食物。

期待与大家共进美餐！

真诚的问候，

P.S. - 别忘了锁你的电脑! 😄

---

Vertaling: Ik trakteer volgende vrijdag om 12u het hele kantoor op authentiek Chinees eten in de vergaderzaal! Pekingeend, dumplings, gebakken rijst en meer. Dit is mijn excuus omdat ik mijn computer niet had vergrendeld. Laat het voor woensdag weten!`
        },
        en: {
            label: 'Chinese Message',
            preview: '我要请大家吃饭...',
            subject: '🇨🇳 我请大家吃饭！(I\u2019m treating everyone to Chinese food!)',
            body: `亲爱的同事们，

我有一个好消息要告诉大家！

下周五我要请全公司吃中餐！🥢

菜单包括：
🍜 北京烤鸭
🥟 手工饺子
🍚 炒饭和炒面
🥡 各种中国菜
🍵 茶和饮料

时间：周五中午12点
地点：会议室

为什么要请客？因为我今天忘记锁电脑了，所以这是我的道歉方式！

请在周三前回复，这样我可以订购足够的食物。

期待与大家共进美餐！

真诚的问候，

P.S. - 别忘了锁你的电脑! 😄

---

Translation: I\u2019m treating the whole office to an authentic Chinese feast next Friday at noon in the conference room! Peking duck, dumplings, fried rice and more. This is my apology for forgetting to lock my computer. RSVP by Wednesday!`
        },
        fr: {
            label: 'Message en Chinois',
            preview: '我要请大家吃饭...',
            subject: '🇨🇳 我请大家吃饭！(J\u2019offre un repas chinois à tous !)',
            body: `亲爱的同事们，

我有一个好消息要告诉大家！

下周五我要请全公司吃中餐！🥢

菜单包括：
🍜 北京烤鸭
🥟 手工饺子
🍚 炒饭和炒面
🥡 各种中国菜
🍵 茶和饮料

时间：周五中午12点
地点：会议室

为什么要请客？因为我今天忘记锁电脑了，所以这是我的道歉方式！

请在周三前回复，这样我可以订购足够的食物。

期待与大家共进美餐！

真诚的问候，

P.S. - 别忘了锁你的电脑! 😄

---

Traduction : J\u2019offre à tout le bureau un vrai festin chinois vendredi prochain à midi dans la salle de réunion ! Canard laqué, raviolis, riz sauté et plus encore. C\u2019est mes excuses pour avoir oublié de verrouiller mon ordinateur. Répondez avant mercredi !`
        }
    },
    {
        id: 'russian', icon: '🇷🇺',
        nl: {
            label: 'Russisch Bericht',
            preview: 'Я угощаю всех пиццей...',
            subject: '🇷🇺 Я угощаю всех пиццей! (Ik trakteer op Pizza!)',
            body: `Дорогие коллеги!

У меня есть важное объявление! 📢

В следующую пятницу я угощаю всех ПИЦЦЕЙ! 🍕

Потому что я забыл заблокировать свой компьютер, и это мой способ извиниться!

ЧТО Я ЗАКАЗЫВАЮ:
🍕 20 больших пицц (разные вкусы)
🥤 Напитки для всех
🍰 Десерты
🎉 Хорошее настроение обязательно!

КОГДА: Пятница, 12:00
ГДЕ: Большой конференц-зал

Пожалуйста, ответьте до среды, чтобы я знал, сколько заказать!

Жду всех! Будет весело!

С уважением и извинениями,

P.S. - Не забывайте блокировать компьютеры! 😊

---

Vertaling: Ik trakteer volgende vrijdag om 12u iedereen op PIZZA! 20 grote pizza's, drankjes en desserts in de vergaderzaal. Dit is mijn excuus omdat ik mijn computer niet had vergrendeld. Laat het voor woensdag weten!`
        },
        en: {
            label: 'Russian Message',
            preview: 'Я угощаю всех пиццей...',
            subject: '🇷🇺 Я угощаю всех пиццей! (I\u2019m treating everyone to Pizza!)',
            body: `Дорогие коллеги!

У меня есть важное объявление! 📢

В следующую пятницу я угощаю всех ПИЦЦЕЙ! 🍕

Потому что я забыл заблокировать свой компьютер, и это мой способ извиниться!

ЧТО Я ЗАКАЗЫВАЮ:
🍕 20 больших пицц (разные вкусы)
🥤 Напитки для всех
🍰 Десерты
🎉 Хорошее настроение обязательно!

КОГДА: Пятница, 12:00
ГДЕ: Большой конференц-зал

Пожалуйста, ответьте до среды, чтобы я знал, сколько заказать!

Жду всех! Будет весело!

С уважением и извинениями,

P.S. - Не забывайте блокировать компьютеры! 😊

---

Translation: I\u2019m treating everyone to PIZZA next Friday at noon! 20 large pizzas, drinks and desserts in the conference room. This is my apology for forgetting to lock my computer. RSVP by Wednesday!`
        },
        fr: {
            label: 'Message en Russe',
            preview: 'Я угощаю всех пиццей...',
            subject: '🇷🇺 Я угощаю всех пиццей! (J\u2019offre des pizzas à tous !)',
            body: `Дорогие коллеги!

У меня есть важное объявление! 📢

В следующую пятницу я угощаю всех ПИЦЦЕЙ! 🍕

Потому что я забыл заблокировать свой компьютер, и это мой способ извиниться!

ЧТО Я ЗАКАЗЫВАЮ:
🍕 20 больших пицц (разные вкусы)
🥤 Напитки для всех
🍰 Десерты
🎉 Хорошее настроение обязательно!

КОГДА: Пятница, 12:00
ГДЕ: Большой конференц-зал

Пожалуйста, ответьте до среды, чтобы я знал, сколько заказать!

Жду всех! Будет весело!

С уважением и извинениями,

P.S. - Не забывайте блокировать компьютеры! 😊

---

Traduction : J\u2019offre des PIZZAS à tout le monde vendredi prochain à midi ! 20 grandes pizzas, boissons et desserts dans la salle de réunion. C\u2019est mes excuses pour avoir oublié de verrouiller mon ordinateur. Répondez avant mercredi !`
        }
    }
];

// ---------- State ----------
const STORAGE = {
    lang: 'bbqLang',
    theme: 'bbqTheme',
    favorites: 'bbqFavorites',
    recommended: 'recommendedEmails'
};

let currentLang = localStorage.getItem(STORAGE.lang) || 'nl';
let currentTheme = localStorage.getItem(STORAGE.theme) || 'light';
let favorites = safeParse(localStorage.getItem(STORAGE.favorites), []);
let selectedId = null;

function safeParse(value, fallback) {
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
}

function t(key) {
    return (i18n[currentLang] && i18n[currentLang][key]) || i18n.nl[key] || key;
}

function getTemplate(id) {
    return emailTemplates.find(tpl => tpl.id === id);
}

// ---------- Recommended emails ----------
function loadRecommendedEmails() {
    return safeParse(localStorage.getItem(STORAGE.recommended), []);
}

function saveRecommendedEmail(email) {
    const recommended = loadRecommendedEmails();
    if (!recommended.includes(email) && email.includes('@')) {
        recommended.push(email);
        if (recommended.length > 5) recommended.shift();
        localStorage.setItem(STORAGE.recommended, JSON.stringify(recommended));
    }
}

function displayRecommendedEmails() {
    const container = document.getElementById('recommendedEmails');
    container.innerHTML = '';
    loadRecommendedEmails().forEach(email => {
        const label = document.createElement('label');
        label.className = 'recommended-email';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'sendTo';
        input.value = `recommended:${email}`;
        const span = document.createElement('span');
        const small = document.createElement('small');
        small.textContent = t('recommendedUsed');
        span.textContent = email + ' ';
        span.appendChild(small);
        label.appendChild(input);
        label.appendChild(span);
        container.appendChild(label);
    });
}

// ---------- Favorites ----------
function isFavorite(id) {
    return favorites.includes(id);
}

function toggleFavorite(id) {
    if (isFavorite(id)) {
        favorites = favorites.filter(fav => fav !== id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem(STORAGE.favorites, JSON.stringify(favorites));
    renderTemplates();
}

// ---------- Template rendering ----------
function getOrderedTemplates() {
    const favs = emailTemplates.filter(tpl => isFavorite(tpl.id));
    const rest = emailTemplates.filter(tpl => !isFavorite(tpl.id));
    return [...favs, ...rest];
}

function renderTemplates() {
    const grid = document.getElementById('emailTemplates');
    const noResults = document.getElementById('noResults');
    const query = document.getElementById('templateSearch').value.trim().toLowerCase();
    grid.innerHTML = '';

    let visibleCount = 0;
    getOrderedTemplates().forEach(tpl => {
        const content = tpl[currentLang];
        const haystack = `${content.label} ${content.preview} ${content.subject}`.toLowerCase();
        if (query && !haystack.includes(query)) return;
        visibleCount++;

        const card = document.createElement('div');
        card.className = 'email-option' + (tpl.id === selectedId ? ' selected' : '');
        card.dataset.id = tpl.id;

        const favBtn = document.createElement('button');
        favBtn.className = 'fav-btn' + (isFavorite(tpl.id) ? ' is-fav' : '');
        favBtn.type = 'button';
        favBtn.textContent = isFavorite(tpl.id) ? '★' : '☆';
        favBtn.title = isFavorite(tpl.id) ? t('unfavTitle') : t('favTitle');
        favBtn.setAttribute('aria-label', favBtn.title);
        favBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleFavorite(tpl.id);
        });

        const button = document.createElement('button');
        button.className = 'prank-button';
        button.type = 'button';
        button.dataset.template = tpl.id;
        const icon = document.createElement('span');
        icon.className = 'tpl-icon';
        icon.textContent = tpl.icon;
        const labelSpan = document.createElement('span');
        labelSpan.className = 'tpl-label';
        labelSpan.textContent = content.label;
        button.appendChild(icon);
        button.appendChild(labelSpan);
        button.addEventListener('click', () => selectTemplate(tpl.id));

        const preview = document.createElement('p');
        preview.className = 'email-preview';
        preview.textContent = content.preview;
        preview.addEventListener('click', () => selectTemplate(tpl.id));

        card.appendChild(favBtn);
        card.appendChild(button);
        card.appendChild(preview);
        grid.appendChild(card);
    });

    noResults.hidden = visibleCount !== 0;
}

// ---------- Recipients ----------
function getRecipients() {
    const recipients = [];
    document.querySelectorAll('input[name="sendTo"]:checked').forEach(checkbox => {
        if (checkbox.value === 'bbq') {
            recipients.push('BBQ@lebon.info');
        } else if (checkbox.value === 'custom') {
            const customEmail = document.getElementById('customEmail').value.trim();
            if (customEmail && customEmail.includes('@')) {
                recipients.push(customEmail);
                saveRecommendedEmail(customEmail);
            }
        } else if (checkbox.value.startsWith('recommended:')) {
            recipients.push(checkbox.value.replace('recommended:', ''));
        }
    });
    return recipients;
}

function updatePreviewRecipients() {
    const previewTo = document.getElementById('previewTo');
    if (!previewTo) return;
    const recipients = getRecipients();
    previewTo.textContent = recipients.length ? recipients.join(', ') : t('noRecipientPreview');
}

// ---------- Preview / selection ----------
function selectTemplate(id) {
    selectedId = id;
    const tpl = getTemplate(id);
    if (!tpl) return;
    const content = tpl[currentLang];

    document.getElementById('previewEmpty').hidden = true;
    document.getElementById('previewContent').hidden = false;
    document.getElementById('previewSubject').textContent = content.subject;
    document.getElementById('previewBody').value = content.body;
    updatePreviewRecipients();

    document.querySelectorAll('.email-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.id === id);
    });

    document.getElementById('previewPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function getCurrentSubject() {
    const tpl = getTemplate(selectedId);
    return tpl ? tpl[currentLang].subject : '';
}

// ---------- Actions ----------
function sendEmail() {
    if (!selectedId) return;
    const recipients = getRecipients();
    if (recipients.length === 0) {
        alert(t('noRecipient'));
        return;
    }
    const subject = encodeURIComponent(getCurrentSubject());
    const body = encodeURIComponent(document.getElementById('previewBody').value);
    window.location.href = `mailto:${recipients.join(',')}?subject=${subject}&body=${body}`;
    setTimeout(displayRecommendedEmails, 500);
}

async function copyEmail() {
    if (!selectedId) return;
    const text = `${getCurrentSubject()}\n\n${document.getElementById('previewBody').value}`;
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const textarea = document.getElementById('previewBody');
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
    }
    const feedback = document.getElementById('copyFeedback');
    feedback.hidden = false;
    setTimeout(() => { feedback.hidden = true; }, 1800);
}

// ---------- Language & theme ----------
function applyLanguage(lang) {
    currentLang = i18n[lang] ? lang : 'nl';
    localStorage.setItem(STORAGE.lang, currentLang);
    document.documentElement.lang = i18n[currentLang].htmlLang;
    document.title = t('pageTitle');

    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
        const [attr, key] = el.getAttribute('data-i18n-attr').split(':');
        el.setAttribute(attr, t(key));
    });
    document.getElementById('customEmail').placeholder = t('customEmailPlaceholder');

    document.querySelectorAll('.lang-btn').forEach(btn => {
        const active = btn.dataset.lang === currentLang;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
    });

    displayRecommendedEmails();
    renderTemplates();
    if (selectedId) {
        selectTemplate(selectedId);
    } else {
        updatePreviewRecipients();
    }
}

function applyTheme(theme) {
    currentTheme = theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem(STORAGE.theme, currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.getElementById('themeToggle').textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}

// ---------- Init ----------
function init() {
    applyTheme(currentTheme);
    applyLanguage(currentLang);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
    });
    document.getElementById('themeToggle').addEventListener('click', () => {
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    document.getElementById('templateSearch').addEventListener('input', renderTemplates);

    document.getElementById('randomEmailBtn').addEventListener('click', () => {
        const random = emailTemplates[Math.floor(Math.random() * emailTemplates.length)];
        document.getElementById('templateSearch').value = '';
        renderTemplates();
        selectTemplate(random.id);
    });

    document.querySelector('input[value="custom"]').addEventListener('change', function () {
        if (this.checked) document.getElementById('customEmail').focus();
        updatePreviewRecipients();
    });

    document.getElementById('customEmail').addEventListener('blur', function () {
        const email = this.value.trim();
        if (email && email.includes('@')) {
            saveRecommendedEmail(email);
            displayRecommendedEmails();
        }
    });
    document.getElementById('customEmail').addEventListener('input', updatePreviewRecipients);

    document.addEventListener('change', (event) => {
        if (event.target.matches('input[name="sendTo"]')) updatePreviewRecipients();
    });

    document.getElementById('sendBtn').addEventListener('click', sendEmail);
    document.getElementById('copyBtn').addEventListener('click', copyEmail);
}

document.addEventListener('DOMContentLoaded', init);
