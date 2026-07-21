/* ==========================================================================
   Isekai Forge — character & background roller
   Data-driven: each PART is a rerollable line; the whole sheet can be
   shuffled at once. Everything is client-side and stateless.
   ========================================================================== */
(function () {
    'use strict';

    const $ = (s) => document.querySelector(s);

    /* ---- Name generator ---- */
    const NAME_A = ['Ka', 'Ren', 'Sora', 'Ael', 'Ryo', 'Mira', 'Thes', 'Yuu', 'Vael', 'Nox',
        'Sae', 'Bram', 'Lio', 'Cass', 'Fenn', 'Isa', 'Oru', 'Zae', 'Hal', 'Emi'];
    const NAME_B = ['den', 'rin', 'thas', 'lia', 'wyn', 'ket', 'ndra', 'to', 'mir', 'sha',
        'vel', 'ric', 'na', 'dor', 'lith', 'ka', 'sen', 'ora', 'gan', 'ys'];
    const EPITHETS = ['the Unremarkable', 'the Truck-Blessed', 'the Reluctant', 'the Overslept',
        'the Newly Summoned', 'the Slightly Confused', 'the Average', 'the Off-Brand Hero',
        'the Second-Life', 'the Wandering', 'the Not-From-Here', 'the Well-Rested (finally)',
        'the Genre-Savvy', 'the Bewildered', 'the Respawned'];

    function rollName() {
        const first = pick(NAME_A) + pick(NAME_B);
        return Math.random() < 0.6 ? `${first} ${pick(EPITHETS)}` : first;
    }

    /* ---- Parts ---- */
    const PARTS = [
        {
            id: 'past',
            icon: '🚚',
            label: 'How they got isekai\u2019d',
            options: [
                'hit by a truck',
                'sucked into a book',
                'hypnotised by another wandering character',
                'reincarnated as a newborn baby',
                'woke up inside a video game — as an NPC',
                'transported mid-fall, still screaming',
                'kidnapped by a magic circle drawn on the ground',
                'fell through a hidden bookshelf passage',
                'grabbed by scientists and shoved through a test portal',
                'hit on the head and simply woke up elsewhere',
                'became a character from a book they\u2019d just read',
                'summoned by a desperate kingdom\u2019s ritual',
                'died saving a stranger; a bored god offered a redo',
                'fell asleep on the last train and never arrived',
                'clicked \u201CAccept\u201D on a very suspicious terms-of-service',
                'reflection in a puddle reached back and pulled them in',
            ],
        },
        {
            id: 'past-life',
            icon: '💼',
            label: 'Who they used to be',
            options: [
                'a nocturnal, introverted otaku',
                'an overworked office worker',
                'a small-town doctor',
                'a night-shift convenience-store clerk',
                'a buff veterinarian',
                'a sleep-deprived fanfic writer',
                'a burnt-out line cook',
                'a retired competitive gamer',
                'a substitute high-school teacher',
                'a freelance illustrator behind on rent',
                'a mild-mannered accountant with a secret spreadsheet hobby',
                'a long-haul truck driver (the irony)',
            ],
        },
        {
            id: 'form',
            icon: '🪞',
            label: 'Reborn as',
            options: [
                'an ordinary human, somehow',
                'a slime with big ambitions',
                'a fox-eared beastfolk',
                'a pint-sized dragon',
                'a wandering skeleton with impeccable manners',
                'an elf who never asked for the pointy ears',
                'a talking house cat',
                'a homunculus fresh from the vat',
                'a low-level goblin with a dream',
                'a spirit bound to an old sword',
                'a knee-high forest sprite',
                'a very confused golem',
            ],
        },
        {
            id: 'ability',
            icon: '✨',
            label: 'The power they woke up with',
            options: [
                'none whatsoever',
                'being perfectly average for whatever they are',
                'being average at absolutely everything for their kind',
                'being average compared to every being in this world',
                'the ability to perform forbidden magic',
                'transformation — small creatures only',
                'transformation — non-living objects only',
                'transformation — must keep the same body mass',
                'cooking food that grants temporary buffs',
                'hearing others\u2019 thoughts, but only while concentrating',
                'seeing and completing quests from \u201Cthe System\u201D',
                'inventing their own unique spells from scratch',
                'a game-like interface that appraises whatever they look at',
                'access to a magical \u201Conline\u201D shop',
                'taming small creatures',
                'taming creatures in sight — but only while they stay in sight',
                'perfectly copying any skill they watch just once',
                'rewinding the last ten seconds, once per day',
            ],
        },
        {
            id: 'world',
            icon: '🗺️',
            label: 'The world they landed in',
            options: [
                'a sword-and-sorcery kingdom in the middle of a war',
                'a cozy guild town overflowing with quests',
                'a floating archipelago drifting above the clouds',
                'a dungeon that rebuilds itself every night',
                'a magitech metropolis of neon and glowing runes',
                'a post-calamity wasteland slowly stitching itself back together',
                'an academy for the dangerously magically gifted',
                'a labyrinth no one has ever escaped',
                'a merchant realm where everything has a price',
                'a frozen frontier at the edge of the known map',
            ],
        },
        {
            id: 'twist',
            icon: '🎭',
            label: 'One inconvenient twist',
            options: [
                'everyone assumes they\u2019re the prophesied hero (they are not)',
                'their power only works when no one is watching',
                'they can read the world\u2019s tutorial — it\u2019s badly translated',
                'a rival transmigrator arrived first and took the good class',
                'the local language is 90% puns',
                'they still get the bill from their old life, somehow',
                'their starting town thinks they\u2019re a monster',
                'the god who summoned them has already stopped answering',
                'they respawn — but one town over, every time',
                'their inventory has a strict, petty weight limit',
            ],
        },
    ];

    /* ---- State ---- */
    const current = {};

    function pick(arr, avoid) {
        if (arr.length === 1) return arr[0];
        let v;
        do { v = arr[Math.floor(Math.random() * arr.length)]; } while (v === avoid);
        return v;
    }

    /* ---- Build DOM ---- */
    const partsEl = $('#parts');
    const charName = $('#charName');
    const comboNote = $('#comboNote');
    const toast = $('#toast');

    function build() {
        partsEl.innerHTML = '';
        PARTS.forEach((part) => {
            const row = document.createElement('div');
            row.className = 'part';
            row.innerHTML = `
                <div class="part-icon" aria-hidden="true">${part.icon}</div>
                <div class="part-body">
                    <span class="part-label">${part.label}</span>
                    <span class="part-value" id="val-${part.id}">—</span>
                </div>
                <button class="reroll" type="button" data-part="${part.id}"
                    title="Reroll this line" aria-label="Reroll ${part.label}">🎲</button>`;
            partsEl.appendChild(row);
        });

        partsEl.addEventListener('click', (e) => {
            const btn = e.target.closest('.reroll');
            if (!btn) return;
            btn.classList.remove('spin');
            void btn.offsetWidth;
            btn.classList.add('spin');
            rollPart(btn.dataset.part);
        });
    }

    function setValue(id, text) {
        const el = document.getElementById('val-' + id);
        if (!el) return;
        el.classList.add('rolling');
        setTimeout(() => {
            el.textContent = text;
            el.classList.remove('rolling');
        }, 140);
    }

    function rollPart(id) {
        const part = PARTS.find(p => p.id === id);
        if (!part) return;
        current[id] = pick(part.options, current[id]);
        setValue(id, current[id]);
        updateCombo();
    }

    function rollName_() {
        current.name = rollName();
        charName.classList.add('rolling');
        setTimeout(() => {
            charName.textContent = current.name;
            charName.classList.remove('rolling');
        }, 140);
    }

    function shuffleAll() {
        rollName_();
        PARTS.forEach(p => { current[p.id] = pick(p.options, current[p.id]); });
        PARTS.forEach(p => setValue(p.id, current[p.id]));
        updateCombo();
    }

    function updateCombo() {
        const total = PARTS.reduce((acc, p) => acc * p.options.length, EPITHETS.length);
        comboNote.textContent = `1 of ${total.toLocaleString()}+ possible lives`;
    }

    /* ---- Copy ---- */
    function characterText() {
        const lines = [`${current.name}`, ''];
        PARTS.forEach(p => lines.push(`${p.label}: ${current[p.id]}`));
        return lines.join('\n');
    }

    let toastTimer;
    function notify(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
    }

    $('#copyBtn').addEventListener('click', async () => {
        const text = characterText();
        try {
            await navigator.clipboard.writeText(text);
            notify('Character copied to clipboard ✦');
        } catch {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); notify('Character copied ✦'); }
            catch { notify('Copy failed — select the text manually'); }
            ta.remove();
        }
    });

    $('#shuffleAll').addEventListener('click', shuffleAll);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            shuffleAll();
        }
    });

    /* ---- Init ---- */
    build();
    shuffleAll();
})();
