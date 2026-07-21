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
            weatherCells: {}, drawings: [], laser: null,
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

        // ------------------------------------------------------------------
        // A schoolhouse: classrooms, a library and a central courtyard.
        // ------------------------------------------------------------------
        school() {
            const loc = makeLocation({ name: 'Ravenbrook Academy' });
            loc.map.bg = 'grass';
            fillRect(loc, 2, 1, 21, 13, 'wood'); wallRect(loc, 2, 1, 21, 13);
            fillRect(loc, 9, 5, 14, 9, 'grass');                  // courtyard
            wallRect(loc, 9, 5, 14, 9); loc.terrain['11,9'] = 'grass'; loc.terrain['12,9'] = 'grass';
            fillRect(loc, 3, 2, 8, 2, 'wall'); loc.terrain['5,2'] = 'wood';   // classroom wall
            fillRect(loc, 15, 2, 20, 2, 'wall'); loc.terrain['18,2'] = 'wood';
            loc.terrain['11,13'] = 'wood'; loc.terrain['12,13'] = 'wood';
            placeItems(loc, 'door', [[11, 13]], { name: 'Main entrance' });
            placeItems(loc, 'table', [[4, 4], [6, 4], [4, 6], [6, 6], [16, 4], [18, 4], [16, 6], [18, 6]], {});
            placeItems(loc, 'book', [[3, 10], [4, 10], [5, 10], [3, 11], [5, 11]]);
            placeItems(loc, 'sign', [[11, 4]], { name: 'Courtyard' });
            placeItems(loc, 'lantern', [[3, 2], [20, 2], [3, 12], [20, 12]]);
            placeItems(loc, 'statue', [[11, 7]]);
            loc.tokens.push(makeToken({ name: 'Headmaster', kind: 'npc', color: '#e8b24c', c: 18, r: 11, hp: 20, maxHp: 20, ac: 13, initiative: 10 }));
            [['Student', 5, 5], ['Student', 17, 5], ['Librarian', 4, 11]].forEach(([n, c, r]) =>
                loc.tokens.push(makeToken({ name: n, kind: 'npc', color: '#e8b24c', c, r, hp: 8, maxHp: 8, ac: 11, initiative: Math.ceil(Math.random() * 12) })));
            loc.scene = 'Chalk-dust and old parchment. Somewhere a bell tolls the end of a lesson.';
            return loc;
        },

        // ------------------------------------------------------------------
        // A market square: stalls, a fountain, crates and busy merchants.
        // ------------------------------------------------------------------
        market() {
            const loc = makeLocation({ name: 'Market Square' });
            loc.map.bg = 'cobble';
            fillRect(loc, 0, 0, 23, 0, 'road'); fillRect(loc, 0, 15, 23, 15, 'road');
            fillRect(loc, 0, 0, 0, 15, 'road'); fillRect(loc, 23, 0, 23, 15, 'road');
            fillRect(loc, 10, 6, 13, 9, 'water'); fillRect(loc, 11, 7, 12, 8, 'deepwater'); // fountain
            placeItems(loc, 'well', [[11, 5]], { name: 'Fountain' });
            const stalls = [[3, 3], [6, 3], [9, 3], [15, 3], [18, 3], [3, 12], [6, 12], [15, 12], [18, 12]];
            stalls.forEach(([c, r]) => { placeItems(loc, 'table', [[c, r]]); placeItems(loc, 'banner', [[c, r - 1]]); });
            placeItems(loc, 'crate', [[4, 4], [7, 4], [16, 4], [19, 12]]);
            placeItems(loc, 'barrel', [[5, 12], [17, 3]]);
            placeItems(loc, 'food', [[6, 3], [15, 3]]);
            placeItems(loc, 'sign', [[11, 13]], { name: 'Market Square' });
            ['Merchant', 'Merchant', 'Farmer', 'Guard', 'Pickpocket'].forEach((n, i) =>
                loc.tokens.push(makeToken({ name: n, kind: n === 'Pickpocket' ? 'enemy' : 'npc', color: n === 'Pickpocket' ? '#e5484d' : '#e8b24c', c: 4 + i * 4, r: 5 + (i % 2) * 6, hp: 10, maxHp: 10, ac: 11, initiative: Math.ceil(Math.random() * 14) })));
            loc.weather = 'sun';
            loc.scene = 'Hawkers cry their wares over the clatter of carts and coins.';
            return loc;
        },

        // ------------------------------------------------------------------
        // A long highway cutting across country — good for a road ambush.
        // ------------------------------------------------------------------
        road() {
            const loc = makeLocation({ name: 'The King\u2019s Road' });
            loc.map.bg = 'grass';
            fillRect(loc, 0, 6, 23, 9, 'road');
            fillRect(loc, 0, 7, 23, 8, 'dirt');
            placeItems(loc, 'sign', [[3, 5]], { name: 'To the Capital →' });
            placeItems(loc, 'tree', [[1, 1], [4, 2], [7, 1], [10, 2], [14, 1], [18, 2], [21, 1], [2, 13], [6, 14], [12, 13], [17, 14], [21, 12]]);
            placeItems(loc, 'bush', [[3, 3], [9, 4], [16, 3], [20, 4], [5, 11], [13, 12], [19, 11]]);
            placeItems(loc, 'boulder', [[8, 5], [15, 10]]);
            placeItems(loc, 'crate', [[11, 7]], { name: 'Toppled cart' });
            [['Bandit', 9, 5, 11], ['Bandit', 10, 4, 11], ['Bandit Leader', 8, 4, 22], ['Bandit', 14, 10, 11], ['Bandit', 15, 11, 11]]
                .forEach(([n, c, r, hp]) => loc.tokens.push(makeToken({ name: n, kind: 'enemy', color: '#e5484d', c, r, hp, maxHp: hp, ac: 12, initiative: Math.ceil(Math.random() * 20) })));
            loc.weather = 'mist';
            loc.scene = 'The road stretches empty ahead — a little too empty.';
            return loc;
        },

        // ------------------------------------------------------------------
        // An abandoned villa: dust, cobwebs, broken rooms and something lurking.
        // ------------------------------------------------------------------
        villa() {
            const loc = makeLocation({ name: 'The Abandoned Villa' });
            loc.map.bg = 'grass';
            fillRect(loc, 2, 2, 21, 13, 'wood'); wallRect(loc, 2, 2, 21, 13);
            fillRect(loc, 2, 7, 21, 7, 'wall'); loc.terrain['8,7'] = 'wood'; loc.terrain['15,7'] = 'wood';
            fillRect(loc, 11, 2, 11, 13, 'wall'); loc.terrain['11,4'] = 'wood'; loc.terrain['11,10'] = 'wood';
            loc.terrain['11,13'] = 'wood';
            fillRect(loc, 6, 5, 9, 6, 'moss'); fillRect(loc, 16, 9, 19, 11, 'moss'); // overgrowth
            placeItems(loc, 'door', [[11, 13]], { name: 'Grand entrance' });
            placeItems(loc, 'web', [[3, 3], [20, 3], [4, 12], [19, 12], [12, 6]]);
            placeItems(loc, 'statue', [[5, 4], [18, 4]]);
            placeItems(loc, 'bed', [[6, 10]]); placeItems(loc, 'table', [[16, 4]]);
            placeItems(loc, 'bones', [[8, 11]]); placeItems(loc, 'corpse', [[17, 5]]);
            placeItems(loc, 'chest', [[19, 10]]); placeItems(loc, 'bush', [[7, 5], [17, 10]]);
            loc.tokens.push(makeToken({ name: 'Wraith', kind: 'enemy', color: '#7c3aed', c: 15, r: 10, hp: 45, maxHp: 45, ac: 13, initiative: 12, hidden: true }));
            loc.tokens.push(makeToken({ name: 'Giant Rat', kind: 'enemy', color: '#e5484d', c: 5, r: 4, hp: 5, maxHp: 5, ac: 11, initiative: 8 }));
            loc.weather = 'mist';
            loc.scene = 'Sheets shroud the furniture like ghosts. Dust hangs in the shafts of grey light.';
            return loc;
        },

        // ------------------------------------------------------------------
        // A villain's lair: a torch-lit throne room deep underground.
        // ------------------------------------------------------------------
        hideout() {
            const loc = makeLocation({ name: 'The Villain\u2019s Lair' });
            loc.map.bg = 'wall';
            fillRect(loc, 2, 2, 21, 13, 'stone');
            fillRect(loc, 9, 3, 14, 3, 'rug'); fillRect(loc, 11, 3, 12, 6, 'rug'); // throne carpet
            loc.terrain['11,13'] = 'stone'; loc.terrain['12,13'] = 'stone';
            placeItems(loc, 'door', [[11, 13]], { name: 'Iron doors' });
            placeItems(loc, 'altar', [[11, 3]], { name: 'Throne' });
            placeItems(loc, 'torch', [[3, 3], [20, 3], [3, 12], [20, 12], [7, 7], [16, 7]]);
            placeItems(loc, 'statue', [[6, 5], [17, 5], [6, 10], [17, 10]]);
            placeItems(loc, 'chest', [[4, 12], [19, 12]]); placeItems(loc, 'gold', [[19, 11]]);
            placeItems(loc, 'banner', [[9, 2], [14, 2]]);
            loc.tokens.push(makeToken({ name: 'The Villain', kind: 'enemy', color: '#b91c1c', size: 2, c: 11, r: 4, hp: 120, maxHp: 120, ac: 17, initiative: 18 }));
            [['Cultist', 8, 9, 11], ['Cultist', 15, 9, 11], ['Bodyguard', 9, 6, 30], ['Bodyguard', 14, 6, 30]]
                .forEach(([n, c, r, hp]) => loc.tokens.push(makeToken({ name: n, kind: 'enemy', color: '#e5484d', c, r, hp, maxHp: hp, ac: 13, initiative: Math.ceil(Math.random() * 16) })));
            loc.weather = 'embers';
            loc.scene = 'Torchlight gutters across a throne of black iron. So — you found me at last.';
            return loc;
        },

        // ------------------------------------------------------------------
        // Deep woods: dense trees, a stream and hungry wildlife.
        // ------------------------------------------------------------------
        forest() {
            const loc = makeLocation({ name: 'Deep Forest' });
            loc.map.bg = 'forest';
            for (let i = 0; i < 34; i++) placeItems(loc, 'tree', [[Math.floor(Math.random() * 24), Math.floor(Math.random() * 16)]]);
            for (let r = 0; r < 16; r++) { const c = 8 + Math.round(Math.sin(r / 2) * 3); loc.terrain[c + ',' + r] = 'water'; loc.terrain[(c + 1) + ',' + r] = 'water'; }
            placeItems(loc, 'bush', [[3, 3], [12, 5], [18, 9], [6, 12], [20, 4], [15, 13]]);
            placeItems(loc, 'mushroom', [[5, 8], [17, 6], [10, 12]]);
            placeItems(loc, 'boulder', [[14, 3], [19, 11]]);
            [['Wolf', 16, 6, 11], ['Wolf', 17, 7, 11], ['Wolf', 15, 8, 11], ['Brown Bear', 4, 10, 34]]
                .forEach(([n, c, r, hp]) => loc.tokens.push(makeToken({ name: n, kind: 'enemy', color: '#e5484d', c, r, hp, maxHp: hp, ac: 13, initiative: Math.ceil(Math.random() * 18) })));
            loc.weather = 'fog';
            loc.scene = 'The canopy swallows the sky. Every snapping twig sounds like a footstep.';
            return loc;
        },

        // ------------------------------------------------------------------
        // An elven glade: lantern-lit clearings, shrines and watchful elves.
        // ------------------------------------------------------------------
        elfForest() {
            const loc = makeLocation({ name: 'Glade of the Silver Elves' });
            loc.map.bg = 'forest';
            for (let i = 0; i < 22; i++) placeItems(loc, 'tree', [[Math.floor(Math.random() * 24), Math.floor(Math.random() * 16)]]);
            fillRect(loc, 9, 6, 14, 10, 'grass');                 // sacred clearing
            placeItems(loc, 'altar', [[11, 8]], { name: 'Moon Shrine' });
            placeItems(loc, 'lantern', [[9, 6], [14, 6], [9, 10], [14, 10], [5, 3], [18, 12]]);
            placeItems(loc, 'statue', [[11, 6]]); placeItems(loc, 'mushroom', [[4, 9], [19, 5]]);
            placeItems(loc, 'gem', [[11, 9]]);
            [['Elf Sentinel', 7, 7, 16], ['Elf Sentinel', 16, 9, 16], ['Elf Archer', 6, 11, 13], ['Elf Elder', 11, 12, 22]]
                .forEach(([n, c, r, hp]) => loc.tokens.push(makeToken({ name: n, kind: 'npc', color: '#e8b24c', c, r, hp, maxHp: hp, ac: 14, initiative: Math.ceil(Math.random() * 16) })));
            loc.weather = 'mist';
            loc.scene = 'Silver light pools in the clearing. You are being watched by a dozen unseen eyes.';
            return loc;
        },

        // ------------------------------------------------------------------
        // A treehouse village: raised wooden platforms and rope bridges.
        // ------------------------------------------------------------------
        treehouse() {
            const loc = makeLocation({ name: 'Canopy Village' });
            loc.map.bg = 'forest';
            const plats = [[3, 2, 8, 6], [15, 2, 20, 6], [9, 9, 14, 13], [3, 10, 6, 13], [18, 9, 21, 13]];
            plats.forEach(([c0, r0, c1, r1]) => { fillRect(loc, c0, r0, c1, r1, 'plank'); });
            // rope bridges (planks connecting platforms)
            fillRect(loc, 8, 4, 15, 4, 'plank'); fillRect(loc, 11, 6, 11, 9, 'plank');
            fillRect(loc, 6, 11, 9, 11, 'plank'); fillRect(loc, 14, 11, 18, 11, 'plank');
            placeItems(loc, 'stairs', [[5, 13]], { name: 'Ladder down' });
            placeItems(loc, 'lantern', [[3, 2], [20, 2], [9, 9], [14, 13]]);
            placeItems(loc, 'table', [[5, 4], [17, 4], [11, 11]]);
            placeItems(loc, 'bed', [[4, 3], [19, 3]]);
            placeItems(loc, 'chest', [[7, 5], [16, 5]]);
            placeItems(loc, 'tree', [[10, 2], [1, 7], [22, 7], [12, 15]]);
            loc.tokens.push(makeToken({ name: 'Villager', kind: 'npc', color: '#e8b24c', c: 5, r: 3, hp: 8, maxHp: 8, ac: 11, initiative: 8 }));
            loc.tokens.push(makeToken({ name: 'Village Chief', kind: 'npc', color: '#e8b24c', c: 11, r: 11, hp: 16, maxHp: 16, ac: 12, initiative: 10 }));
            loc.weather = 'sun';
            loc.scene = 'Rope bridges sway between the great trunks. The forest floor is a dizzy drop below.';
            return loc;
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
                if (!l.weatherCells) l.weatherCells = {};
                if (!l.drawings) l.drawings = [];
                if (l.laser === undefined) l.laser = null;
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
        drawStrokes(ctx, strokes, w, h) {
            (strokes || []).forEach((s) => {
                if (!s.points || !s.points.length) return;
                ctx.save();
                ctx.lineJoin = 'round'; ctx.lineCap = 'round';
                ctx.strokeStyle = s.color; ctx.fillStyle = s.color;
                const width = s.width || 3;
                ctx.lineWidth = width; ctx.setLineDash([]); ctx.globalAlpha = 1;
                ctx.shadowBlur = 0; ctx.shadowColor = s.color;
                if (s.type === 'marker') { ctx.globalAlpha = 0.4; ctx.lineWidth = width * 2.2; }
                else if (s.type === 'blur') { ctx.shadowBlur = width * 2.5; ctx.globalAlpha = 0.85; }
                else if (s.type === 'dashed') { ctx.setLineDash([width * 2, width * 2]); }
                ctx.beginPath();
                s.points.forEach((p, i) => { const x = p.x * w, y = p.y * h; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
                if (s.points.length === 1) { const p = s.points[0]; ctx.arc(p.x * w, p.y * h, Math.max(1, ctx.lineWidth / 2), 0, 6.283); ctx.fill(); }
                else ctx.stroke();
                ctx.restore();
            });
        },
        TERRAIN, ITEMS,
    };

    global.Loregate = Store;
    global.LoregateTerrain = TERRAIN;
    global.LoregateItems = ITEMS;
})(window);
