/* ==========================================================================
   O.A.S.I.S. — data-trees.js
   --------------------------------------------------------------------------
   Interactive decision trees. These exist for the reader who is frightened,
   does not know what has happened, and cannot afford to browse.

   Schema
     id, title, glyph, chapter, lede
     start        node id to begin at
     nodes{}      each node is EITHER a question or a result
       question:  { q, hint?, options: [{ a, to, note? }] }
       result:    { result, tag, steps[], link?, note? }

   Rules
     • Every option must point at a node that exists (the audit enforces it).
     • Every path must terminate in a result. No loops.
     • Results are short. They say what to do now and link to the full card.
     • A tree must never be the only place information lives — it is a router
       into the doctrine, not a replacement for it.
   ========================================================================== */

window.OASIS_TREES = [

    /* ------------------------------------------------------------ MASTER -- */
    {
        id: 'unknown',
        chapter: 'triage',
        title: 'Something has happened and I do not know what to do',
        glyph: '?',
        lede: 'Start here if you are not sure what you are dealing with. Six questions at most, then a specific answer.',
        keys: 'dont know what to do do not know help me emergency start here what now panic confused something happened first steps quick',
        start: 'q-safe',
        nodes: {
            'q-safe': {
                q: 'Right now, is anyone in immediate physical danger — fire, water, traffic, structure, gas, electricity, or a person?',
                hint: 'Answer for this second, not for what might happen later.',
                options: [
                    { a: 'Yes — danger is present now', to: 'q-danger-type' },
                    { a: 'No — we are physically safe for the moment', to: 'q-hurt' },
                ],
            },
            'q-danger-type': {
                q: 'What is the danger?',
                options: [
                    { a: 'Fire or smoke', to: 'r-fire' },
                    { a: 'Water — flood or drowning', to: 'r-water' },
                    { a: 'Gas, fumes or a strange smell', to: 'r-gas' },
                    { a: 'Structure collapsing or unstable', to: 'r-collapse' },
                    { a: 'Electricity', to: 'r-electric' },
                    { a: 'A person threatening us', to: 'r-threat' },
                    { a: 'Explosions, shelling or gunfire', to: 'r-conflict' },
                ],
            },
            'q-hurt': {
                q: 'Is anyone injured or unwell?',
                options: [
                    { a: 'Yes', to: 'r-casualty' },
                    { a: 'No', to: 'q-services' },
                ],
            },
            'q-services': {
                q: 'Are the normal services working — power, water, phone, shops?',
                options: [
                    { a: 'Some or all have failed', to: 'q-which-service' },
                    { a: 'They work, but something is wrong outside', to: 'q-outside' },
                    { a: 'I am lost, stranded or cut off', to: 'r-lost' },
                ],
            },
            'q-which-service': {
                q: 'Which one matters most right now?',
                options: [
                    { a: 'Electricity', to: 'r-blackout' },
                    { a: 'Water', to: 'r-nowater' },
                    { a: 'Phone and internet', to: 'r-nocomms' },
                    { a: 'Food and supplies', to: 'r-nofood' },
                ],
            },
            'q-outside': {
                q: 'What is happening outside?',
                options: [
                    { a: 'Severe weather', to: 'r-weather' },
                    { a: 'An official warning or siren', to: 'r-warning' },
                    { a: 'Disorder, looting or armed groups', to: 'r-disorder' },
                    { a: 'Illness spreading', to: 'r-illness' },
                    { a: 'I genuinely do not know', to: 'r-findout' },
                ],
            },

            'r-fire': {
                result: 'Get out, stay out, call for help',
                tag: 'critical',
                steps: ['Get everyone out now. Do not collect anything.',
                    'Close doors behind you — a closed door buys many minutes.',
                    'Stay low; smoke rises and it is the smoke that kills.',
                    'Call from outside. Never go back in.'],
                link: '#/play/structure-fire',
            },
            'r-water': {
                result: 'Move up, never through',
                tag: 'critical',
                steps: ['Move to higher ground or an upper floor.',
                    'Never walk, swim or drive through moving water. 15 cm knocks an adult over.',
                    'Take medication, documents, phone and warm clothing up with you.',
                    'Do not enter a sealed attic without a way onto the roof.'],
                link: '#/play/flood',
            },
            'r-gas': {
                result: 'Everyone out, then call — do not investigate',
                tag: 'critical',
                steps: ['Get everyone outside into fresh air immediately.',
                    'Do not switch anything on or off, and do not use a phone indoors.',
                    'If it is an outdoor plume: move crosswind, then upwind and uphill.',
                    'If told to shelter: go inside and UP, seal the room, turn off ventilation.'],
                link: '#/play/chemical',
            },
            'r-collapse': {
                result: 'Do not enter. Signal, do not dig',
                tag: 'critical',
                steps: ['Do not enter a damaged structure for any reason.',
                    'If you are trapped: cover your mouth, tap three times on a pipe or wall on a schedule, do not shout.',
                    'If others are trapped: mark the location, listen, and direct professionals in.',
                    'Warn rescuers before any long-compressed limb is freed — crush syndrome kills.'],
                link: '#/play/trapped',
            },
            'r-electric': {
                result: 'Isolate before you touch anyone',
                tag: 'critical',
                steps: ['Do not touch the person while they are in contact with the supply.',
                    'Isolate at the source. If you cannot, do not approach.',
                    'Treat every downed cable as live and keep well clear.',
                    'Once safe: check breathing, start CPR if absent.'],
                link: '#/c/medical/cpr',
            },
            'r-threat': {
                result: 'Run, hide, fight — in that order',
                tag: 'critical',
                steps: ['RUN. Leave everything. Distance is the best protection there is.',
                    'HIDE if you cannot run: out of sight, behind solid cover, phone fully silenced.',
                    'FIGHT only as an absolute last resort, and then commit fully.',
                    'Call when safe. Give the location first in case you are cut off.'],
                link: '#/play/threat',
            },
            'r-conflict': {
                result: 'Get behind mass, get low, stay down',
                tag: 'critical',
                steps: ['Get to the strongest shelter within a minute: basement, underground, or a windowless interior corridor.',
                    'Two solid walls between you and the outside.',
                    'Stay down for several minutes after the last impact — secondary strikes are common.',
                    'Treat massive bleeding first: pressure, packing, tourniquet, note the time.'],
                link: '#/play/warzone',
            },
            'r-casualty': {
                result: 'Run the casualty assessment',
                tag: 'critical',
                steps: ['Work MARCH: Massive bleeding → Airway → Respiration → Circulation → Hypothermia.',
                    'Massive bleeding beats everything. Pressure, pack, tourniquet.',
                    'Unresponsive and not breathing normally: start compressions, 100–120/min, 5–6 cm deep.'],
                link: '#/tree/casualty',
            },
            'r-lost': {
                result: 'S.T.O.P. before you move another step',
                tag: 'critical',
                steps: ['Stop. Sit down. Twenty minutes of stillness costs you nothing.',
                    'Think, Observe, Plan. Then decide deliberately whether to stay or move.',
                    'Staying put and becoming visible is the right answer most of the time.',
                    'Make yourself findable: three of anything, bright colours spread out.'],
                link: '#/c/nav/nav-lost',
            },
            'r-blackout': { result: 'Long power loss', tag: 'priority', steps: ['Charge everything now, fill water containers, keep the fridge shut.', 'Fit or check a carbon monoxide alarm before you heat or cook with anything burning.', 'Choose one room to hold and heat only that.'], link: '#/play/blackout' },
            'r-nowater': { result: 'Water failure', tag: 'priority', steps: ['Stop drinking suspect water immediately.', 'Boil for 1 minute (3 above 2 000 m), or 2 drops of unscented bleach per litre and wait 30 minutes.', 'Clarify cloudy water first — settle, decant, filter through cloth.'], link: '#/play/water-fail' },
            'r-nocomms': { result: 'Network outage', tag: 'priority', steps: ['Text before you call. Send position, status and intent, once.', 'Move — coverage is intensely local.', 'Fall back to radio on the agreed channel at the agreed time.'], link: '#/play/comms-blackout' },
            'r-nofood': { result: 'Supply shortage', tag: 'routine', steps: ['Do not panic-buy. Buy your normal shop plus a little depth, early and quietly.', 'Ration deliberately; feed the injured, cold, working and children first.', 'If water is short, eat less — digestion costs water.'], link: '#/play/supply' },
            'r-weather': { result: 'Find the specific weather playbook', tag: 'priority', steps: ['Open the playbooks and choose the one that matches: flood, storm, tornado, winter, heat, wildfire.', 'The common pattern: know the warning, know the safe place, go early.'], link: '#/play' },
            'r-warning': { result: 'Follow the official instruction exactly', tag: 'critical', steps: ['Get information from broadcast radio, not social media.', 'If told to shelter: inside and UP for chemicals, inside and DOWN for fallout or blast.', 'If told to evacuate: go immediately, take documents, do not wait.'], link: '#/c/hazard/shelter-in-place' },
            'r-disorder': { result: 'Do not go and look', tag: 'critical', steps: ['Leave early and calmly, or stay inside with lights low and away from windows.', 'Let insured property go. Property is replaceable.', 'Move with a crowd and diagonally to its edge, never against it.'], link: '#/play/unrest' },
            'r-illness': { result: 'Distance, ventilation, protection', tag: 'priority', steps: ['Ventilate. Outdoor air is the cheapest effective control there is.', 'Fitted FFP2/N95 in crowded indoor spaces. Fit matters more than the rating.', 'Isolate anyone symptomatic; monitor breathing, consciousness and fluids.'], link: '#/play/pandemic' },
            'r-findout': {
                result: 'Find out what is happening, cheaply',
                tag: 'priority',
                steps: ['Turn on a battery or wind-up radio and find a local station. This is the fastest reliable read.',
                    'Check whether it is local or national: shortwave or an outside-view source tells you which.',
                    'Set a check-in schedule instead of watching continuously.',
                    'Meanwhile: fill water containers, charge everything, and locate documents.'],
                link: '#/c/triage/first-60',
            },
        },
    },

    /* ---------------------------------------------------------- CASUALTY -- */
    {
        id: 'casualty',
        chapter: 'medical',
        title: 'Casualty assessment',
        glyph: '✚',
        lede: 'One injured or collapsed person, and you do not know where to start. This is MARCH as a set of questions.',
        keys: 'triage assessment injured casualty what to do first aid decision tree primary survey abc march',
        start: 'q-scene',
        nodes: {
            'q-scene': {
                q: 'Is the scene safe for you to approach?',
                hint: 'Rescuers who rush in are a large fraction of the dead in confined spaces, water, fire and electrical accidents.',
                options: [
                    { a: 'Yes', to: 'q-bleed' },
                    { a: 'No, or I am not sure', to: 'r-unsafe' },
                ],
            },
            'q-bleed': {
                q: 'Is there heavy bleeding — spurting, pooling, or soaked clothing?',
                options: [
                    { a: 'Yes', to: 'r-bleed' },
                    { a: 'No', to: 'q-responsive' },
                ],
            },
            'q-responsive': {
                q: 'Do they respond to your voice or to a firm shake of the shoulders?',
                options: [
                    { a: 'Yes, they respond', to: 'q-breathing-ok' },
                    { a: 'No response', to: 'q-breathing' },
                ],
            },
            'q-breathing': {
                q: 'Open the airway. Are they breathing normally? Look, listen and feel for 10 seconds.',
                hint: 'Occasional gasping is NOT normal breathing.',
                options: [
                    { a: 'Not breathing, or only gasping', to: 'r-cpr' },
                    { a: 'Breathing normally', to: 'r-recovery' },
                ],
            },
            'q-breathing-ok': {
                q: 'What is the main problem?',
                options: [
                    { a: 'Struggling to breathe', to: 'r-breathing' },
                    { a: 'Chest pain', to: 'r-cardiac' },
                    { a: 'Obvious injury — wound, burn, fracture', to: 'q-injury' },
                    { a: 'Confused, drowsy or behaving strangely', to: 'r-altered' },
                    { a: 'Swallowed or inhaled something', to: 'r-poison' },
                    { a: 'Too hot or too cold', to: 'r-temp' },
                ],
            },
            'q-injury': {
                q: 'What kind of injury?',
                options: [
                    { a: 'Penetrating — stab, gunshot, arrow, impalement', to: 'r-penetrating' },
                    { a: 'Burn or scald', to: 'r-burn' },
                    { a: 'Broken bone or joint', to: 'r-fracture' },
                    { a: 'Crushed or trapped limb', to: 'r-crush' },
                    { a: 'Amputation', to: 'r-amputation' },
                    { a: 'Eye injury', to: 'r-eye' },
                ],
            },

            'r-unsafe': { result: 'Do not approach', tag: 'critical', steps: ['You cannot help anyone by becoming the second casualty.', 'Never enter a confined space, water, or an electrical scene to retrieve someone.', 'Shout for help, call for professionals, and control the scene from where you are.'], link: '#/c/triage/scene-safety' },
            'r-bleed': { result: 'Stop the bleeding — now, before anything else', tag: 'critical', steps: ['Direct pressure, hard, immediately. Do not ease off to check.', 'Pack deep wounds: push cloth INTO the cavity, fill it, keep pressing 3–10 minutes.', 'Limb bleeding not controlled: tourniquet 5–8 cm above the wound, tighten until it stops. It has to hurt.', 'Write the time of application on them.'], link: '#/c/medical/bleeding' },
            'r-cpr': { result: 'Start CPR', tag: 'critical', steps: ['Send someone for help and a defibrillator. Speaker phone if alone.', 'Centre of the chest, 100–120 per minute, 5–6 cm deep, full recoil.', '30 compressions to 2 breaths if trained — compression-only is far better than nothing.', 'Swap rescuers every 2 minutes. Attach a defibrillator the moment it arrives.'], link: '#/c/medical/cpr' },
            'r-recovery': { result: 'Recovery position, then keep watching', tag: 'critical', steps: ['Roll them onto their side, head tilted slightly back and down so fluid drains.', 'Check breathing every couple of minutes.', 'Keep them warm and off the ground.', 'Never leave an unconscious person on their back, unattended.'], link: '#/c/medical/airway' },
            'r-breathing': { result: 'Breathing difficulty', tag: 'critical', steps: ['Sit them upright — never lie them flat.', 'Loosen tight clothing, get fresh air, keep them calm.', 'Own inhaler or adrenaline auto-injector if they have one.', 'Chest injury: seal any open wound, sit them on the injured side.', 'Swelling lips or tongue after a trigger: adrenaline into the outer thigh, lay flat with legs raised.'], link: '#/c/medical/chest-injury' },
            'r-cardiac': { result: 'Suspected heart attack', tag: 'critical', steps: ['Sit them down, calm and still, loosen clothing. Do not let them walk.', 'If not allergic and available: 300 mg aspirin, chewed slowly.', 'Be ready to start CPR.'], link: '#/c/medical/medical-red-flags' },
            'r-altered': { result: 'Altered mental state is an emergency', tag: 'critical', steps: ['Confusion in the heat is heat stroke until proven otherwise — cool aggressively now.', 'Check FAST for stroke: Face, Arms, Speech, Time. Note the exact time it started.', 'Consider low blood sugar in a diabetic: sugar by mouth only if fully alert.', 'Consider head injury, poisoning, and sepsis. Nothing by mouth if drowsy.'], link: '#/c/medical/medical-red-flags' },
            'r-poison': { result: 'Poisoning or inhalation', tag: 'critical', steps: ['Do NOT make them vomit.', 'Inhaled: get them into fresh air, do not enter the space yourself.', 'Swallowed: identify the substance and keep the packaging.', 'Skin or eye: flush with lots of running water for 15–20 minutes.', 'Call a poisons centre or emergency services with the substance name.'], link: '#/c/medical/poisoning' },
            'r-temp': { result: 'Temperature emergency', tag: 'critical', steps: ['Too cold: off the ground, out of the wind, wet clothing off, insulate, warm the torso. Handle gently.', 'Too hot with confusion: heat stroke. Cool aggressively and immediately — immersion if possible.', 'Cool first, transport second.'], link: '#/c/medical/hypothermia' },
            'r-penetrating': { result: 'Penetrating injury', tag: 'critical', steps: ['Do NOT remove an impaled object. Pack around it and stabilise it in place.', 'Control bleeding with pressure and packing around the object.', 'Check for an exit wound and for wounds on the back and armpits.', 'Chest: seal airtight, sit them upright, burp the seal if breathing worsens.'], link: '#/c/medical/penetrating' },
            'r-burn': { result: 'Burn', tag: 'priority', steps: ['Cool with cool running water for 20 minutes. Effective up to 3 hours after.', 'Remove rings and tight clothing before swelling. Leave anything stuck to the burn.', 'Cover with cling film laid on, not wrapped.', 'Keep the rest of them warm — cooling causes hypothermia.'], link: '#/c/medical/burns' },
            'r-fracture': { result: 'Fracture or dislocation', tag: 'priority', steps: ['Splint it where it lies. Immobilise the joint above and below.', 'Check circulation, sensation and movement beyond the injury, before and after.', 'Cold, white, numb or pulseless is urgent.', 'Open fracture: cover with a clean dressing, do not push bone back in.'], link: '#/c/medical/fractures' },
            'r-crush': { result: 'Crush and entrapment', tag: 'critical', steps: ['Tell rescuers BEFORE a long-compressed limb is released — sudden release can cause fatal crush syndrome.', 'Give fluids by mouth if alert and surgery is not imminent.', 'Keep them warm and monitored.', 'Do not move debris that is supporting something above them.'], link: '#/c/medical/crush' },
            'r-amputation': { result: 'Amputation', tag: 'critical', steps: ['Stop the bleeding first: pressure, then tourniquet high and tight. Note the time.', 'Wrap the amputated part in clean damp cloth, seal in a bag, place that bag on ice.', 'Never put the part directly on ice or in water.', 'Evacuate urgently — the part travels with the casualty.'], link: '#/c/medical/crush' },
            'r-eye': { result: 'Eye injury', tag: 'priority', steps: ['Chemical: flush immediately with lots of clean water for 20 minutes, from the nose outward.', 'Penetrating: do NOT remove anything, do not press. Cover both eyes to stop movement.', 'Dust or grit: do not rub. Flush gently.', 'Every significant eye injury needs medical assessment.'], link: '#/c/medical/eye-injury' },
        },
    },

    /* ------------------------------------------------------------- WHERE -- */
    {
        id: 'where',
        chapter: 'nav',
        title: 'Where am I, and which way is north?',
        glyph: '⌖',
        lede: 'You need a direction and you have no GPS. This picks the method that works with what you can actually see right now.',
        keys: 'where am i which way is north lost direction orientation navigate no gps triage environment day night cloudy stars compass',
        start: 'q-tools',
        nodes: {
            'q-tools': {
                q: 'Do you have a magnetic compass?',
                options: [
                    { a: 'Yes', to: 'r-compass' },
                    { a: 'No, but I have a needle, magnet or wire', to: 'r-make-compass' },
                    { a: 'Nothing at all', to: 'q-light' },
                ],
            },
            'q-light': {
                q: 'Is it day or night?',
                options: [
                    { a: 'Daylight', to: 'q-sun' },
                    { a: 'Night', to: 'q-stars' },
                    { a: 'Twilight — neither', to: 'r-terrain' },
                ],
            },
            'q-sun': {
                q: 'Can you see the sun, or a shadow?',
                options: [
                    { a: 'Yes, sun or a clear shadow', to: 'r-shadow' },
                    { a: 'Overcast — no shadow at all', to: 'r-cloudy' },
                ],
            },
            'q-stars': {
                q: 'Can you see stars?',
                options: [
                    { a: 'Yes, clear sky', to: 'q-hemisphere' },
                    { a: 'No — cloud', to: 'q-moon' },
                ],
            },
            'q-hemisphere': {
                q: 'Which hemisphere are you in?',
                options: [
                    { a: 'Northern', to: 'r-polaris' },
                    { a: 'Southern', to: 'r-cross' },
                    { a: 'I do not know', to: 'r-orion' },
                ],
            },
            'q-moon': {
                q: 'Can you see the moon?',
                options: [
                    { a: 'Yes', to: 'r-moon' },
                    { a: 'No — total overcast, no moon', to: 'r-nightblind' },
                ],
            },

            'r-compass': { result: 'Use the compass, and correct it', tag: 'skill', steps: ['Hold it flat and level, away from metal, phone, vehicle and electronics.', 'Turn the bezel so the index matches your intended bearing, then rotate yourself until the needle sits in the orienting arrow.', 'Correct for declination: true → magnetic, SUBTRACT east declination. Field → map, ADD it.', 'A 1° error costs about 17 m per kilometre travelled.'], link: '#/c/nav/compass-use' },
            'r-make-compass': { result: 'Make a compass', tag: 'skill', steps: ['Magnetise a needle: stroke it 50 times in ONE direction along a magnet, or against silk or hair.', 'Float it on a leaf or a scrap of cork in still water, or hang it from an untwisted thread.', 'It aligns north–south. Determine which end is north from the sun or stars, once, then mark it.', 'A speaker, a hard-drive magnet or a DC motor all contain usable magnets.'], link: '#/c/nav/make-compass' },
            'r-shadow': { result: 'Shadow-stick method', tag: 'skill', steps: ['Push a stick upright into level ground. Mark the shadow tip with a stone.', 'Wait 15–20 minutes. Mark the new tip.', 'The line from the first mark to the second points roughly EAST.', 'Stand with the first mark on your left and the second on your right: you face north (northern hemisphere).'], link: '#/c/nav/nav-sun' },
            'r-cloudy': { result: 'Navigating under cloud', tag: 'skill', steps: ['Hold a knife blade or a pen upright on a pale surface — even thin cloud usually casts a faint shadow.', 'Watch the brightest patch of sky: that is the sun\'s position.', 'Fall back on terrain: follow water downhill, use ridges, roads, fences and power lines as handrails.', 'Set a bearing off a distant feature and walk to it, then repeat. Do not try to hold a straight line by feel — everyone circles.'], link: '#/c/nav/nav-cloudy' },
            'r-polaris': { result: 'Find Polaris', tag: 'skill', steps: ['Find the Plough / Big Dipper. Take the two stars on the outer edge of the pan.', 'Extend that line about five times its own length.', 'The moderately bright star you land on is Polaris — within about 0.7° of true north.', 'If the Plough is hidden, use Cassiopeia (the W) on the opposite side of Polaris.', 'Bonus: the height of Polaris above the horizon in degrees is your latitude.'], link: '#/c/nav/nav-stars' },
            'r-cross': { result: 'Find the Southern Cross', tag: 'skill', steps: ['Extend the long axis of the Cross about 4.5 times its length.', 'Separately, take the two bright Pointer stars, draw a line between them and drop a perpendicular from its midpoint.', 'Where the two lines meet is the south celestial pole. Drop straight down to the horizon — that is true south.'], link: '#/c/nav/nav-stars' },
            'r-orion': { result: 'Use Orion — it works from anywhere', tag: 'skill', steps: ['Orion rises due EAST and sets due WEST from anywhere on Earth.', 'The middle star of the belt sits almost exactly on the celestial equator.', 'Any star: line up two sticks of different heights on it and wait. Climbing = you face east, sinking = west, drifting right = south, left = north (northern hemisphere).'], link: '#/c/nav/nav-stars' },
            'r-moon': { result: 'Use the moon', tag: 'skill', steps: ['If the moon rises BEFORE sunset, its lit side faces west.', 'If it rises AFTER midnight, its lit side faces east.', 'A first-quarter moon is due south at sunset (northern hemisphere); a last-quarter moon is due south at sunrise.', 'A full moon is due south at local midnight.'], link: '#/c/nav/nav-dark' },
            'r-nightblind': { result: 'Do not travel', tag: 'critical', steps: ['With no sky, no compass and no light, movement is how people walk off edges and into water.', 'Stop. Shelter. Insulate from the ground. Wait for light.', 'If you must move: follow a handrail you can feel — a fence, a wall, a stream, a road edge.', 'Mark your position so you can return to it.'], link: '#/c/nav/nav-dark' },
            'r-terrain': { result: 'Navigate by terrain', tag: 'skill', steps: ['Use handrails: rivers, ridges, roads, fences, power lines, coastlines.', 'Use catching features: something across your path you cannot miss, beyond your target.', 'Aim deliberately off to one side of a target on a line feature, so you know which way to turn when you hit it.', 'Water flows downhill; streams join rivers; rivers pass settlements.'], link: '#/c/nav/nav-basics' },
        },
    },

    /* ------------------------------------------------------------ PEOPLE -- */
    {
        id: 'contact',
        chapter: 'people',
        title: 'I have met other people — approach or avoid?',
        glyph: '⚭',
        lede: 'Most people in a disaster help. The research is consistent on this and the panic-and-looting picture is largely a myth. But judgement still matters, and this is how to make it deliberately.',
        keys: 'strangers other people cooperate cooperating contact approach avoid group join trust survivors meet',
        start: 'q-need',
        nodes: {
            'q-need': {
                q: 'Do you actually need anything from them right now?',
                options: [
                    { a: 'Yes — help, medical, water, information, or a route', to: 'q-signals' },
                    { a: 'No — we are self-sufficient for now', to: 'r-observe' },
                    { a: 'They need help from us', to: 'r-help' },
                ],
            },
            'q-signals': {
                q: 'From a distance, what do you observe?',
                hint: 'Observe before you commit. Time spent watching is never wasted.',
                options: [
                    { a: 'Families, mixed ages, children present', to: 'r-approach' },
                    { a: 'Organised, uniformed or official', to: 'r-official' },
                    { a: 'Armed group, all similar age and sex, no children', to: 'r-avoid' },
                    { a: 'Cannot tell', to: 'r-cautious' },
                ],
            },

            'r-observe': { result: 'Observe, do not engage yet', tag: 'routine', steps: ['Stay unremarkable. Being uninteresting is better protection than being fortified.', 'Note numbers, direction, equipment and behaviour.', 'Do not display supplies, weapons or capability.', 'Reassess later — a group you did not need this morning may be the one you join this evening.'], link: '#/c/people/meeting' },
            'r-help': { result: 'Help, but do it safely', tag: 'priority', steps: ['Scene safety first — you cannot help anyone by becoming a casualty.', 'Help from a position you can leave. Do not get surrounded or boxed in.', 'Give assistance, not your inventory. Share skills and information freely; share stock deliberately.', 'Helping is also the single best way to build the network that keeps you alive later.'], link: '#/c/people/cooperation' },
            'r-approach': { result: 'Approach openly', tag: 'routine', steps: ['Approach from the front, in the open, slowly, hands visible and empty.', 'Speak first, at a distance, in a normal voice. Give a name.', 'State what you want plainly and offer something in return.', 'Agree the small things first — a fire, water, a route. Trust is built in increments.'], link: '#/c/people/meeting' },
            'r-official': { result: 'Engage, and register', tag: 'routine', steps: ['Approach slowly with hands visible. Do not film.', 'Carry and present identity documents.', 'Register with the official authority — aid, family tracing and legal status all flow from being registered.', 'Ask specifically: where is water, where is medical care, where is the reunification point.'], link: '#/play/displacement' },
            'r-avoid': { result: 'Avoid — break contact quietly', tag: 'critical', steps: ['Do not approach, do not run, do not be seen deciding.', 'Move away calmly, using terrain and cover, at a normal pace.', 'Do not lead them to your shelter, cache or group. Take an indirect route home.', 'Warn others. Note numbers, direction and time.'], link: '#/play/rebels' },
            'r-cautious': { result: 'Cautious contact', tag: 'priority', steps: ['Meet in the open, in daylight, with an exit behind you.', 'One person talks, others stay back and visible.', 'Agree a signal within your group that means "leave now, no questions".', 'Never bring strangers to your shelter on the first meeting.'], link: '#/c/people/meeting' },
        },
    },

    /* ------------------------------------------------------------- WATER -- */
    {
        id: 'watersafe',
        chapter: 'water',
        title: 'Can I drink this water?',
        glyph: '≈',
        lede: 'Three separate problems — particles, pathogens and chemicals. Most methods solve only one. This picks the combination for the water in front of you.',
        keys: 'can i drink this water safe drinkable purify treat decision tree contaminated',
        start: 'q-source',
        nodes: {
            'q-source': {
                q: 'Where did the water come from?',
                options: [
                    { a: 'Tap, under a boil notice', to: 'r-boil' },
                    { a: 'Tap, under a chemical/do-not-drink notice', to: 'r-chemical' },
                    { a: 'Rain, freshly collected', to: 'r-rain' },
                    { a: 'Stream, lake, river or pond', to: 'q-clear' },
                    { a: 'Flood water, or near industry, mining or farming', to: 'r-nodrink' },
                    { a: 'Sea water', to: 'r-sea' },
                ],
            },
            'q-clear': {
                q: 'Is it clear, or cloudy?',
                options: [
                    { a: 'Clear', to: 'q-method' },
                    { a: 'Cloudy or coloured', to: 'r-clarify' },
                ],
            },
            'q-method': {
                q: 'What do you have?',
                options: [
                    { a: 'Fire and a pot', to: 'r-boil' },
                    { a: 'Unscented household bleach', to: 'r-bleach' },
                    { a: 'Purification tablets', to: 'r-tablets' },
                    { a: 'A filter', to: 'r-filter' },
                    { a: 'Only sunlight and clear plastic bottles', to: 'r-sodis' },
                    { a: 'Nothing at all', to: 'r-nothing' },
                ],
            },

            'r-boil': { result: 'Boil it', tag: 'priority', steps: ['Rolling boil for 1 minute. 3 minutes above 2 000 m.', 'Kills bacteria, viruses and protozoa including Cryptosporidium.', 'Does NOT remove chemicals, heavy metals, nitrates or salt — it concentrates them.', 'Cool covered, and pour between containers to restore the taste.'], link: '#/c/water/water-treat' },
            'r-chemical': { result: 'Do not drink, and do not boil', tag: 'critical', steps: ['Boiling concentrates chemical contamination — it makes it worse.', 'Use stored or bottled water only.', 'Follow the utility exactly: some advisories also prohibit showering and washing.', 'Activated carbon removes many organics but do not rely on it for an unknown contaminant.'], link: '#/play/water-fail' },
            'r-rain': { result: 'Usually the best available source', tag: 'routine', steps: ['Rain caught in a clean container needs no chemical treatment in most places.', 'Discard the first flush if it ran off a roof — that carries the dirt, droppings and debris.', 'Still treat it if it came off an unknown roof or through gutters.', 'After volcanic ashfall or a chemical release, do not use rainwater until cleared.'], link: '#/c/water/water-find' },
            'r-clarify': { result: 'Clarify first, then disinfect', tag: 'priority', steps: ['Let it stand until the sediment settles, then pour off the clear layer.', 'Filter through cloth, then sand and charcoal if you can build it.', 'Turbidity shields pathogens from chemicals and from UV — this step makes everything else work.', 'Then boil, or double the chemical dose and double the wait.'], link: '#/c/water/water-treat' },
            'r-bleach': { result: 'Chlorine dose', tag: 'priority', steps: ['Unscented household bleach at 5–6 %: 2 drops per litre.', 'Stir, wait 30 minutes. Double dose and time if cold or cloudy.', 'It should smell faintly of chlorine afterwards. If not, dose once more and wait 15 minutes.', 'Not effective against Cryptosporidium — use tablets or boiling where that is a risk.'], link: '#/tools' },
            'r-tablets': { result: 'Follow the packet exactly', tag: 'priority', steps: ['Chlorine dioxide is the best chemical option and does handle Cryptosporidium — but allow up to 4 hours for it.', 'Iodine: 5 drops of 2 % tincture per litre, 30 minutes. Not in pregnancy, thyroid disease, or long-term use.', 'Cold or cloudy water: double the contact time.'], link: '#/c/water/water-treat' },
            'r-filter': { result: 'Filter, then consider viruses', tag: 'priority', steps: ['0.2 micron or finer removes bacteria and protozoa including Cryptosporidium.', 'Most filters do NOT remove viruses — add chemical treatment or boiling where sewage contamination is possible.', 'Backflush regularly; a clogged filter is a slow filter, not a safe one.', 'Never let the dirty side touch the clean side.'], link: '#/c/water/water-treat' },
            'r-sodis': { result: 'Solar disinfection', tag: 'routine', steps: ['Clear PET bottle, water no deeper than 10 cm, lying on a reflective surface.', 'Full sun for 6 hours. Two full days if overcast.', 'Water must be clear — clarify first or it does not work.', 'A genuine last resort that does work.'], link: '#/c/water/water-treat' },
            'r-nothing': { result: 'Improvise, then drink anyway if you must', tag: 'critical', steps: ['Build a filter: cloth, then charcoal from your fire, then sand, then gravel. Repeat the pour.', 'Dig a seepage well a metre back from the bank and let it filter through soil.', 'Collect dew with cloth, or rig a transpiration bag on a leafy branch.', 'If the only choice is dehydration or dirty water: drink. Dehydration kills in days, diarrhoea usually does not — but treat it the moment you can.'], link: '#/c/water/water-find' },
            'r-nodrink': { result: 'Do not drink this', tag: 'critical', steps: ['Flood water carries sewage, fuel and chemicals. Treatment does not fix that.', 'Water near mining, tanneries, industry or intensive agriculture may carry heavy metals and nitrates that no field method removes.', 'Use it for washing only, and keep it out of open wounds and away from your mouth.', 'Find another source: rain, dew, transpiration, seepage well.'], link: '#/c/water/water-find' },
            'r-sea': { result: 'Never drink sea water', tag: 'critical', steps: ['It costs more body water to excrete the salt than it provides. It accelerates dehydration.', 'The same is true of urine and blood.', 'Distillation is the only method that removes salt — a still, or a pot with a cool lid and a drip catcher.', 'Collect rain and dew instead.'], link: '#/c/water/water-find' },
        },
    },

    /* -------------------------------------------------------- STAY OR GO -- */
    {
        id: 'stayorgo',
        chapter: 'triage',
        title: 'Do I stay or do I go?',
        glyph: '⇄',
        lede: 'The single highest-consequence decision in almost every emergency, and the one people most often get wrong by deciding late.',
        keys: 'stay or go evacuate leave shelter in place bug out decision remain flee',
        start: 'q-order',
        nodes: {
            'q-order': {
                q: 'Has an official evacuation order been issued for your area?',
                options: [
                    { a: 'Yes', to: 'r-go-now' },
                    { a: 'No, or I cannot find out', to: 'q-immediate' },
                ],
            },
            'q-immediate': {
                q: 'Is your current location dangerous right now — fire, rising water, gas, structural damage, or armed threat?',
                options: [
                    { a: 'Yes', to: 'r-go-now' },
                    { a: 'No', to: 'q-sustain' },
                ],
            },
            'q-sustain': {
                q: 'Can you sustain yourselves here — water, warmth, medication, sanitation — for at least 72 hours?',
                options: [
                    { a: 'Yes', to: 'q-known' },
                    { a: 'No', to: 'q-destination' },
                ],
            },
            'q-known': {
                q: 'Does anyone outside know where you are and expect to hear from you?',
                options: [
                    { a: 'Yes', to: 'r-stay' },
                    { a: 'No', to: 'r-stay-signal' },
                ],
            },
            'q-destination': {
                q: 'Do you have a specific destination, a route, and the means to reach it?',
                options: [
                    { a: 'Yes to all three', to: 'r-go-planned' },
                    { a: 'No — one or more is missing', to: 'r-improve' },
                ],
            },

            'r-go-now': { result: 'Go, immediately', tag: 'critical', steps: ['Leave now. Late evacuation is how people die — roads, fuel and goodwill run out together.', 'Documents on your body. Medication. Water. Warm layers.', 'Tell someone your route and destination.', 'Do not go back for possessions.'], link: '#/play/displacement' },
            'r-go-planned': { result: 'Go, deliberately', tag: 'priority', steps: ['Travel in daylight, in a group, along the planned route.', 'Documents and split cash on the body, not in the bag or vehicle.', 'Write name, date of birth, blood group and a contact number on each child.', 'Count heads at every stop.'], link: '#/play/displacement' },
            'r-stay': { result: 'Stay — this is usually right', tag: 'routine', steps: ['Sheltering where you are is nearly always safer, warmer and better supplied than leaving.', 'Secure water, heat one room, manage sanitation, ration power.', 'Set a check-in schedule and a trigger that would change the decision.', 'Reassess at fixed intervals, not continuously.'], link: '#/play/blackout' },
            'r-stay-signal': { result: 'Stay, but become findable', tag: 'priority', steps: ['Nobody is looking for you yet. That is the problem to solve first.', 'Get a message out: text, radio at the agreed time, satellite messenger, or a note with a neighbour.', 'Make yourself visible: bright colours spread out, three of anything, light at night.', 'Then settle in and sustain.'], link: '#/c/nav/nav-lost' },
            'r-improve': { result: 'Do not leave yet — fix the gap first', tag: 'priority', steps: ['Leaving without a destination is how people end up worse off than they started.', 'Identify a specific destination and a person there who expects you.', 'Plan a route with two alternatives, avoiding bridges and choke points.', 'Meanwhile: improve what you have here. Water, warmth, sanitation, information.'], link: '#/play/displacement' },
        },
    },
];
