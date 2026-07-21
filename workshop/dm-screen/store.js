/* ==========================================================================
   Loregate — shared table state store (v2)
   --------------------------------------------------------------------------
   One source of truth for both screens. Supports multiple saved locations,
   painted terrain, placeable items, an inventory and a big pile of settings.
   Persisted to localStorage and mirrored live across windows via
   BroadcastChannel (storage-event fallback). Same origin only.
   ========================================================================== */
(function (global) {
    'use strict';

    const KEY = 'loregate.state.v1';
    const CHANNEL = 'loregate';

    // A tiny fractal-noise texture used to break up flat colour.
    const NOISE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.16'/%3E%3C/svg%3E\")";

    const TERRAIN = {
        grass: {
            label: 'Grass', swatch: '#4f8a3a', bg:
                `${NOISE} 0 0/90px 90px,
                 radial-gradient(circle at 18% 24%, rgba(170,215,110,.6), transparent 24%),
                 radial-gradient(circle at 62% 58%, rgba(95,150,60,.55), transparent 28%),
                 radial-gradient(circle at 84% 20%, rgba(140,195,90,.5), transparent 22%),
                 radial-gradient(circle at 40% 85%, rgba(80,135,50,.5), transparent 26%),
                 repeating-linear-gradient(84deg, rgba(30,60,20,.14) 0 1px, transparent 1px 5px),
                 repeating-linear-gradient(96deg, rgba(205,240,150,.12) 0 1px, transparent 1px 7px),
                 linear-gradient(165deg, #5f9a41, #427428)`
        },
        forest: {
            label: 'Forest floor', swatch: '#2f5a2a', bg:
                `${NOISE} 0 0/80px 80px,
                 radial-gradient(circle at 30% 30%, rgba(90,130,60,.4), transparent 25%),
                 radial-gradient(circle at 75% 70%, rgba(40,70,30,.6), transparent 30%),
                 linear-gradient(160deg, #33562a, #1f3a1a)`
        },
        dirt: {
            label: 'Dirt', swatch: '#6b4a2c', bg:
                `${NOISE} 0 0/70px 70px,
                 radial-gradient(circle at 25% 35%, rgba(150,110,70,.4), transparent 25%),
                 radial-gradient(circle at 70% 65%, rgba(80,55,30,.5), transparent 28%),
                 linear-gradient(160deg, #6e4c2d, #4d341e)`
        },
        stone: {
            label: 'Stone', swatch: '#5a5568', bg:
                `${NOISE} 0 0/60px 60px,
                 repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 2px, transparent 2px 46px),
                 repeating-linear-gradient(90deg, rgba(0,0,0,.28) 0 2px, transparent 2px 46px),
                 radial-gradient(circle at 40% 30%, #4c4760, transparent 60%),
                 linear-gradient(160deg, #46425a, #2c2940)`
        },
        cobble: {
            label: 'Cobblestone', swatch: '#6d6a76', bg:
                `${NOISE} 0 0/50px 50px,
                 radial-gradient(circle at 25% 25%, rgba(255,255,255,.08) 0 8%, transparent 9%) 0 0/34px 34px,
                 radial-gradient(circle at 75% 75%, rgba(0,0,0,.35) 0 9%, transparent 10%) 0 0/34px 34px,
                 linear-gradient(160deg, #63606c, #454351)`
        },
        wood: {
            label: 'Wood floor', swatch: '#7a4f28', bg:
                `${NOISE} 0 0/120px 120px,
                 repeating-linear-gradient(90deg, rgba(0,0,0,.22) 0 2px, transparent 2px 64px),
                 repeating-linear-gradient(0deg, rgba(255,220,170,.06) 0 6px, rgba(0,0,0,.06) 6px 12px),
                 linear-gradient(160deg, #6d4623, #4b2f16)`
        },
        water: {
            label: 'Water', swatch: '#2f7fb0', bg:
                `radial-gradient(circle at 30% 25%, rgba(255,255,255,.18), transparent 40%),
                 radial-gradient(circle at 70% 70%, rgba(120,210,235,.25), transparent 45%),
                 repeating-linear-gradient(100deg, rgba(255,255,255,.05) 0 3px, transparent 3px 12px),
                 linear-gradient(165deg, #2c78a8, #12466e)`, animated: 'water'
        },
        deepwater: {
            label: 'Deep water', swatch: '#123', bg:
                `radial-gradient(circle at 40% 30%, rgba(90,160,200,.2), transparent 45%),
                 linear-gradient(165deg, #164166, #08243c)`, animated: 'water'
        },
        sand: {
            label: 'Sand', swatch: '#c6a866', bg:
                `${NOISE} 0 0/70px 70px,
                 radial-gradient(circle at 60% 40%, rgba(255,240,200,.35), transparent 45%),
                 repeating-linear-gradient(70deg, rgba(150,120,60,.12) 0 2px, transparent 2px 8px),
                 linear-gradient(160deg, #c3a563, #9c7d3f)`
        },
        snow: {
            label: 'Snow', swatch: '#dfe8f2', bg:
                `${NOISE} 0 0/90px 90px,
                 radial-gradient(circle at 30% 30%, rgba(255,255,255,.6), transparent 40%),
                 radial-gradient(circle at 75% 70%, rgba(200,220,240,.4), transparent 45%),
                 linear-gradient(160deg, #dce6f1, #b7c6d8)`
        },
        lava: {
            label: 'Lava', swatch: '#c0391b', bg:
                `radial-gradient(circle at 30% 30%, rgba(255,190,80,.7), transparent 22%),
                 radial-gradient(circle at 70% 65%, rgba(255,120,30,.6), transparent 26%),
                 repeating-linear-gradient(60deg, rgba(0,0,0,.4) 0 3px, transparent 3px 14px),
                 linear-gradient(160deg, #8f2410, #3a0d06)`, animated: 'lava'
        },
        cavern: {
            label: 'Cavern', swatch: '#2a2438', bg:
                `${NOISE} 0 0/70px 70px,
                 radial-gradient(circle at 50% 35%, #2c2640, transparent 60%),
                 radial-gradient(circle at 82% 82%, #1a2b33, transparent 50%),
                 linear-gradient(180deg, #15131f, #0a0910)`
        },
        moss: {
            label: 'Mossy stone', swatch: '#4a5a3a', bg:
                `${NOISE} 0 0/60px 60px,
                 radial-gradient(circle at 25% 30%, rgba(110,150,70,.5), transparent 25%),
                 repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0 2px, transparent 2px 46px),
                 repeating-linear-gradient(90deg, rgba(0,0,0,.25) 0 2px, transparent 2px 46px),
                 linear-gradient(160deg, #414d34, #29321f)`
        },
        swamp: {
            label: 'Swamp', swatch: '#3c4a34', bg:
                `${NOISE} 0 0/80px 80px,
                 radial-gradient(circle at 35% 40%, rgba(90,110,60,.4), transparent 30%),
                 radial-gradient(circle at 70% 65%, rgba(40,55,35,.6), transparent 35%),
                 linear-gradient(160deg, #3a4632, #232b1d)`
        },
        road: {
            label: 'Road', swatch: '#8a7f6a', bg:
                `${NOISE} 0 0/60px 60px,
                 repeating-linear-gradient(90deg, rgba(0,0,0,.15) 0 2px, transparent 2px 30px),
                 linear-gradient(160deg, #8b8069, #665c48)`
        },
        wall: {
            label: 'Wall', swatch: '#2b2733', bg:
                `${NOISE} 0 0/50px 50px,
                 repeating-linear-gradient(0deg, rgba(0,0,0,.55) 0 3px, transparent 3px 22px),
                 repeating-linear-gradient(90deg, rgba(0,0,0,.5) 0 3px, transparent 3px 40px),
                 linear-gradient(160deg, #39333f, #1d1a25)`
        },
        plank: {
            label: 'Plank / bar', swatch: '#8a5a2b', bg:
                `repeating-linear-gradient(0deg, rgba(0,0,0,.2) 0 2px, transparent 2px 40px),
                 repeating-linear-gradient(90deg, rgba(255,210,150,.06) 0 4px, transparent 4px 12px),
                 linear-gradient(160deg, #915f2d, #603c17)`
        },
        rug: {
            label: 'Rug', swatch: '#7a2f3a', bg:
                `radial-gradient(circle at 50% 50%, rgba(230,180,90,.25), transparent 55%),
                 repeating-linear-gradient(45deg, rgba(0,0,0,.12) 0 6px, transparent 6px 12px),
                 linear-gradient(160deg, #7c313d, #521f28)`
        },
        void: {
            label: 'The Void', swatch: '#140f24', bg:
                `radial-gradient(circle at 50% 40%, #241a3a, #05040a 70%)`
        },
    };

    const ITEMS = {
        chest: { label: 'Treasure chest', icon: '🧰' },
        gold: { label: 'Gold pile', icon: '🪙' },
        gem: { label: 'Gemstone', icon: '💎' },
        door: { label: 'Door', icon: '🚪' },
        gate: { label: 'Gate / arch', icon: '⛩️' },
        trap: { label: 'Trap', icon: '⚠️' },
        trapdoor: { label: 'Trapdoor', icon: '🕳️' },
        torch: { label: 'Torch', icon: '🔥' },
        campfire: { label: 'Campfire', icon: '🏕️' },
        barrel: { label: 'Barrel', icon: '🛢️' },
        crate: { label: 'Crate', icon: '📦' },
        table: { label: 'Table', icon: '🪑' },
        bed: { label: 'Bed', icon: '🛏️' },
        mug: { label: 'Mug of mead', icon: '🍺' },
        food: { label: 'Food platter', icon: '🍖' },
        stove: { label: 'Kitchen stove', icon: '🍳' },
        stairs: { label: 'Stairs', icon: '🪜' },
        lantern: { label: 'Lantern', icon: '🏮' },
        boulder: { label: 'Boulder', icon: '🪨' },
        tree: { label: 'Tree', icon: '🌳' },
        bush: { label: 'Bush', icon: '🌿' },
        mushroom: { label: 'Mushrooms', icon: '🍄' },
        altar: { label: 'Altar', icon: '🗿' },
        statue: { label: 'Statue', icon: '🏛️' },
        portal: { label: 'Portal', icon: '🌀' },
        well: { label: 'Well', icon: '⛲' },
        lever: { label: 'Lever', icon: '🎚️' },
        key: { label: 'Key', icon: '🗝️' },
        book: { label: 'Tome', icon: '📖' },
        potion: { label: 'Potion', icon: '🧪' },
        bones: { label: 'Bones', icon: '🦴' },
        corpse: { label: 'Corpse', icon: '💀' },
        web: { label: 'Webs', icon: '🕸️' },
        banner: { label: 'Banner', icon: '🚩' },
        sign: { label: 'Signpost', icon: '🪧' },
        mimic: { label: 'Mimic (looks like a chest)', icon: '🧰' },
    };

    function uid(p) { return (p || 'id') + '-' + Math.random().toString(36).slice(2, 9); }

    function makeToken(o) {
        return Object.assign({
            id: uid('tok'), name: 'New Token', kind: 'enemy', color: '#e5484d',
            c: 2, r: 2, size: 1, hp: 10, maxHp: 10, ac: 12, initiative: 10,
            conditions: [], hidden: false, showHp: false,
        }, o || {});
    }
    function makeItem(o) {
        const type = (o && o.type) || 'chest';
        const cat = ITEMS[type] || ITEMS.chest;
        return Object.assign({
            id: uid('itm'), type, name: cat.label, icon: cat.icon,
            c: 3, r: 3, size: 1, hidden: false, note: '',
        }, o || {});
    }
    function makeLocation(o) {
        return Object.assign({
            id: uid('loc'), name: 'New Location',
            scene: '', revealScene: true,
            map: { bg: 'stone', imageUrl: '', cols: 24, rows: 16, grid: true, fogEnabled: true },
            terrain: {}, fog: [], tokens: [], items: [], ping: null,
            weather: 'none', weatherExclude: [], weatherIndoorSafe: true,
        }, o || {});
    }

    function scatter(loc, type, n) {
        const { cols, rows } = loc.map;
        for (let i = 0; i < n; i++) {
            loc.items.push(makeItem({ type, c: Math.floor(Math.random() * cols), r: Math.floor(Math.random() * rows) }));
        }
    }
    function revealDefault(loc) {
        const all = [];
        for (let r = 0; r < loc.map.rows; r++) for (let c = 0; c < loc.map.cols; c++) all.push(c + ',' + r);
        loc.fog = all;
    }
    // ---- layout helpers (build realistic battlemaps) ----
    function fillRect(loc, c0, r0, c1, r1, terr) {
        for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) loc.terrain[c + ',' + r] = terr;
    }
    function wallRect(loc, c0, r0, c1, r1) {
        for (let c = c0; c <= c1; c++) { loc.terrain[c + ',' + r0] = 'wall'; loc.terrain[c + ',' + r1] = 'wall'; }
        for (let r = r0; r <= r1; r++) { loc.terrain[c0 + ',' + r] = 'wall'; loc.terrain[c1 + ',' + r] = 'wall'; }
    }
    function placeItems(loc, type, cells, extra) {
        cells.forEach(([c, r]) => loc.items.push(makeItem(Object.assign({ type, c, r }, extra || {}))));
    }

    const PRESETS = {
        // ------------------------------------------------------------------
        // A walled tavern: road out front, bar, kitchen, stairs, patrons.
        // ------------------------------------------------------------------
        tavern(withNpc) {
            const loc = makeLocation({ name: withNpc ? 'The Prancing Pony' : 'The Prancing Pony (closed)' });
            loc.map.bg = 'grass';
            fillRect(loc, 0, 13, 23, 15, 'road');                 // road out front
            fillRect(loc, 2, 1, 21, 12, 'wood');                  // main floor
            fillRect(loc, 8, 8, 15, 12, 'rug');                   // hearth rug
            wallRect(loc, 2, 1, 21, 12);                          // outer walls
            // kitchen room, top-right, behind an inner wall
            fillRect(loc, 15, 1, 15, 6, 'wall');
            fillRect(loc, 15, 6, 21, 6, 'wall');
            loc.terrain['15,3'] = 'wood';                         // kitchen doorway
            // bar counter (right side)
            fillRect(loc, 18, 8, 20, 8, 'plank');
            fillRect(loc, 20, 8, 20, 11, 'plank');
            // door openings
            loc.terrain['11,12'] = 'wood'; loc.terrain['12,12'] = 'wood';   // front
            loc.terrain['3,1'] = 'wood';                                    // back
            placeItems(loc, 'door', [[11, 12]], { name: 'Front door' });
            placeItems(loc, 'door', [[3, 1]], { name: 'Back door' });
            placeItems(loc, 'sign', [[9, 14]], { name: 'The Prancing Pony' });
            placeItems(loc, 'campfire', [[4, 10]], { name: 'Hearth' });
            placeItems(loc, 'stove', [[19, 3]], { name: 'Kitchen stove' });
            placeItems(loc, 'stairs', [[3, 11]], { name: 'Stairs up' });
            placeItems(loc, 'barrel', [[21, 10]], { name: 'Ale barrel' });
            placeItems(loc, 'lantern', [[6, 2], [13, 2], [17, 10]]);
            // tables with mead
            const tables = [[5, 5], [9, 5], [12, 6], [6, 9], [11, 10]];
            tables.forEach(([c, r]) => { placeItems(loc, 'table', [[c, r]]); placeItems(loc, 'mug', [[c, r - 1]]); });
            placeItems(loc, 'food', [[9, 4], [6, 8]]);
            loc.scene = 'Warmth and lantern-light spill from the tavern. A fiddle saws somewhere in the haze of pipe-smoke.';
            if (withNpc) {
                loc.tokens.push(makeToken({ name: 'Barkeep', kind: 'npc', color: '#e8b24c', c: 19, r: 9, hp: 14, maxHp: 14, ac: 12, initiative: 8 }));
                loc.tokens.push(makeToken({ name: 'Cook', kind: 'npc', color: '#e8b24c', c: 19, r: 4, hp: 11, maxHp: 11, ac: 11, initiative: 7 }));
                [['Patron', 5, 6], ['Patron', 9, 6], ['Merchant', 12, 7], ['Bard', 6, 10], ['Hooded Stranger', 11, 11]]
                    .forEach(([n, c, r]) => loc.tokens.push(makeToken({ name: n, kind: 'npc', color: '#e8b24c', c, r, hp: 9, maxHp: 9, ac: 11, initiative: Math.ceil(Math.random() * 12) })));
            }
            return loc; // fogged
        },

        // ------------------------------------------------------------------
        // Open country: crossroads, a pond, tree-lines and an ambush.
        // ------------------------------------------------------------------
        fields() {
            const loc = makeLocation({ name: 'Whispering Fields' });
            loc.map.bg = 'grass';
            fillRect(loc, 0, 7, 23, 8, 'road');                   // east-west road
            fillRect(loc, 11, 0, 12, 15, 'dirt');                 // north-south path
            fillRect(loc, 3, 11, 6, 13, 'water');                 // pond
            fillRect(loc, 4, 12, 5, 12, 'deepwater');
            placeItems(loc, 'sign', [[12, 7]], { name: 'Crossroads' });
            placeItems(loc, 'tree', [[1, 1], [2, 2], [3, 1], [20, 2], [21, 3], [19, 1], [1, 13], [21, 12], [2, 5], [22, 9]]);
            placeItems(loc, 'bush', [[5, 3], [8, 2], [15, 4], [17, 10], [7, 12], [14, 12], [9, 10]]);
            placeItems(loc, 'boulder', [[16, 6], [18, 9]]);
            [['Goblin', 14, 5, 7], ['Goblin', 15, 6, 7], ['Goblin', 16, 4, 7], ['Wolf', 8, 11, 11], ['Wolf', 9, 12, 11], ['Giant Rat', 4, 3, 5]]
                .forEach(([n, c, r, hp]) => loc.tokens.push(makeToken({ name: n, kind: 'enemy', color: '#e5484d', c, r, hp, maxHp: hp, ac: 12, initiative: Math.ceil(Math.random() * 20) })));
            loc.weather = 'mist';
            loc.scene = 'Tall grass ripples in the wind. Something rustles in the reeds ahead.';
            return loc; // fogged
        },

        // ------------------------------------------------------------------
        // A natural cavern: rough walls, an underground pool, a spider lair.
        // ------------------------------------------------------------------
        cavern() {
            const loc = makeLocation({ name: 'Dripping Cavern' });
            loc.map.bg = 'cavern';
            wallRect(loc, 0, 0, 23, 15);
            // carve an entrance tunnel at the bottom
            fillRect(loc, 11, 13, 12, 15, 'dirt');
            loc.terrain['11,15'] = 'dirt'; loc.terrain['12,15'] = 'dirt';
            fillRect(loc, 9, 6, 13, 9, 'water');                  // pool
            fillRect(loc, 10, 7, 12, 8, 'deepwater');
            placeItems(loc, 'boulder', [[3, 3], [5, 11], [18, 4], [20, 11], [7, 5], [16, 12], [14, 3]]);
            placeItems(loc, 'mushroom', [[2, 8], [4, 13], [19, 8], [21, 5], [8, 12]]);
            placeItems(loc, 'torch', [[11, 13], [3, 2], [20, 13]]);
            placeItems(loc, 'web', [[15, 5], [17, 6], [16, 7]]);
            placeItems(loc, 'chest', [[19, 2]]);
            placeItems(loc, 'bones', [[6, 4], [18, 10]]);
            loc.tokens.push(makeToken({ name: 'Giant Spider', kind: 'enemy', color: '#7c3aed', c: 16, r: 6, hp: 26, maxHp: 26, ac: 14, size: 2, initiative: 14 }));
            loc.weather = 'mist';
            loc.scene = 'Cold water drips from unseen heights. Your torchlight barely holds back the dark.';
            return loc; // fogged
        },

        // ------------------------------------------------------------------
        // A trap-laden vault: two rooms, a corridor, hidden snares, loot.
        // ------------------------------------------------------------------
        trapsTreasure() {
            const loc = makeLocation({ name: 'Vault of Snares' });
            loc.map.bg = 'wall';
            fillRect(loc, 2, 2, 9, 7, 'cobble');                  // west room
            fillRect(loc, 14, 2, 21, 7, 'cobble');               // east room (treasure)
            fillRect(loc, 5, 9, 18, 12, 'cobble');               // south hall
            fillRect(loc, 9, 4, 14, 5, 'cobble');                // connecting corridor
            fillRect(loc, 6, 7, 7, 9, 'cobble');
            fillRect(loc, 16, 7, 17, 9, 'cobble');
            placeItems(loc, 'door', [[9, 4], [14, 5], [11, 12]]);
            placeItems(loc, 'trap', [[6, 4], [8, 6], [11, 10], [15, 11], [17, 4]], { hidden: true });
            placeItems(loc, 'trapdoor', [[7, 11]], { hidden: true });
            placeItems(loc, 'chest', [[19, 3], [20, 6], [16, 3]]);
            placeItems(loc, 'gold', [[18, 4]]);
            placeItems(loc, 'gem', [[20, 3]]);
            placeItems(loc, 'statue', [[3, 3], [3, 6]]);
            placeItems(loc, 'torch', [[2, 2], [21, 2], [5, 12]]);
            loc.scene = 'Dust-choked flagstones stretch ahead. Glittering treasure beckons — too easily.';
            return loc; // fogged
        },

        // ------------------------------------------------------------------
        // A pillared hall lined with chests — half of them have teeth.
        // ------------------------------------------------------------------
        mimics() {
            const loc = makeLocation({ name: 'Hall of False Chests' });
            loc.map.bg = 'wall';
            fillRect(loc, 2, 2, 21, 13, 'stone');                // the hall floor
            placeItems(loc, 'door', [[11, 13], [12, 13]]);
            loc.terrain['11,13'] = 'stone'; loc.terrain['12,13'] = 'stone';
            placeItems(loc, 'statue', [[6, 5], [6, 10], [17, 5], [17, 10]]);   // pillars
            placeItems(loc, 'torch', [[3, 3], [20, 3], [3, 12], [20, 12]]);
            const spots = [[5, 4], [9, 6], [14, 5], [18, 9], [8, 11], [16, 11], [12, 8]];
            spots.forEach(([c, r], i) => {
                placeItems(loc, 'chest', [[c, r]]);
                if (i % 2 === 0) loc.tokens.push(makeToken({ name: 'Mimic', kind: 'enemy', color: '#b45309', c, r, hp: 58, maxHp: 58, ac: 12, initiative: 8, hidden: true }));
            });
            placeItems(loc, 'gold', [[12, 7]]);
            loc.scene = 'Chest after chest lines the hall. Statistically, at least one of them has teeth.';
            return loc; // fogged
        },
    };

    function defaultState() {
        const start = makeLocation({
            name: 'The Whispering Vault',
            map: { bg: 'stone', imageUrl: '', cols: 24, rows: 16, grid: true, fogEnabled: true },
            scene: 'The party gathers at the mouth of a forgotten crypt. Cold air breathes out of the dark, carrying the scent of old dust and older secrets.',
        });
        return {
            version: 2,
            activeLoc: 0,
            settings: {
                animations: true, night: false,
                playerGrid: true, showCoords: false, snap: true,
                revealAroundPlayers: false, lightRadius: 4,
                showPlayerStats: false, statsScope: 'players',
                showInventory: false, hpAsNumbers: false,
                confirmDelete: true, nameOnHover: true,
                dmFogOpacity: 0.75, blackout: false, revealBrush: 1,
                showDiceToPlayers: true,
                panelOrder: ['scene', 'bigbad', 'roster', 'items', 'initiative', 'bestiary', 'inventory', 'dice', 'settings', 'notes'],
            },
            campaign: { title: 'The Whispering Vault', dmNotes: 'Session goals:\n• Introduce the vault\n• First real fight in the antechamber\n• Reveal the Diadem is a fake' },
            bigbad: {
                name: 'Malgrath, the Hollow Crown', cr: '12', ac: '18', hp: 184, maxHp: 184, size: 2,
                traits: 'Legendary Resistance (3/day) · Frightful Presence (30 ft) · Regenerates 10 HP at the start of its turn unless struck by radiant damage.',
                notes: 'Wants the Sunless Diadem. Will parley before fighting. Flees below 40 HP toward the ritual chamber.',
            },
            bestiary: [],
            inventory: [
                { id: uid('inv'), name: 'Torch', qty: 5, note: '1 hr light' },
                { id: uid('inv'), name: 'Rations', qty: 10, note: 'days' },
                { id: uid('inv'), name: 'Gold (gp)', qty: 75, note: 'party purse' },
            ],
            locations: [start],
            turn: { activeId: null, round: 1 },
            lastRoll: null,
        };
    }

    function clone(o) { return JSON.parse(JSON.stringify(o)); }

    function migrate(saved) {
        if (!saved || typeof saved !== 'object') return defaultState();
        if (saved.version === 2 && Array.isArray(saved.locations)) {
            const base = defaultState();
            saved.settings = Object.assign(base.settings, saved.settings || {});
            saved.bigbad = Object.assign(base.bigbad, saved.bigbad || {});
            if (!saved.inventory) saved.inventory = base.inventory;
            if (!saved.bestiary) saved.bestiary = [];
            saved.locations.forEach((l) => {
                if (!l.terrain) l.terrain = {};
                if (!l.items) l.items = [];
                if (l.revealScene === undefined) l.revealScene = true;
                if (l.weather === undefined) l.weather = 'none';
                if (!l.weatherExclude) l.weatherExclude = [];
                if (l.weatherIndoorSafe === undefined) l.weatherIndoorSafe = true;
            });
            if (saved.lastRoll === undefined) saved.lastRoll = null;
            return saved;
        }
        const base = defaultState();
        const loc = makeLocation({
            name: (saved.campaign && saved.campaign.title) || 'Recovered Location',
            scene: (saved.campaign && saved.campaign.scene) || '',
            revealScene: saved.campaign && saved.campaign.revealScene !== undefined ? saved.campaign.revealScene : true,
            map: Object.assign(base.locations[0].map, saved.map || {}),
            fog: saved.fog || [], tokens: saved.tokens || [],
        });
        base.locations = [loc];
        if (saved.campaign && saved.campaign.title) base.campaign.title = saved.campaign.title;
        if (saved.dmNotes) base.campaign.dmNotes = saved.dmNotes;
        if (saved.bigbad) base.bigbad = Object.assign(base.bigbad, saved.bigbad);
        if (saved.bestiary) base.bestiary = saved.bestiary;
        if (saved.turn) base.turn = saved.turn;
        return base;
    }

    function load() {
        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return defaultState();
            return migrate(JSON.parse(raw));
        } catch { return defaultState(); }
    }

    let state = load();
    const listeners = new Set();
    let channel = null;
    try { channel = new BroadcastChannel(CHANNEL); } catch { channel = null; }

    function persist(broadcast) {
        try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { }
        if (broadcast && channel) { try { channel.postMessage({ type: 'state', state }); } catch { } }
    }
    function notify() { listeners.forEach((cb) => { try { cb(state); } catch (e) { console.error(e); } }); }

    if (channel) channel.onmessage = (ev) => {
        if (ev.data && ev.data.type === 'state') { state = migrate(ev.data.state); notify(); }
    };
    window.addEventListener('storage', (e) => {
        if (e.key === KEY && e.newValue) { try { state = migrate(JSON.parse(e.newValue)); notify(); } catch { } }
    });

    const Store = {
        get() { return state; },
        loc() { return state.locations[Math.min(state.activeLoc, state.locations.length - 1)] || state.locations[0]; },
        activeLocation(st) { return st.locations[Math.min(st.activeLoc, st.locations.length - 1)] || st.locations[0]; },
        update(mutator) { mutator(state); persist(true); notify(); },
        replace(next) { state = migrate(next); persist(true); notify(); },
        subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb); },
        reset() { this.replace(defaultState()); },
        defaults: defaultState,
        clone,
        makeToken, makeItem, makeLocation,
        presets: PRESETS,
        TERRAIN, ITEMS,
    };

    global.Loregate = Store;
    global.LoregateTerrain = TERRAIN;
    global.LoregateItems = ITEMS;
})(window);
