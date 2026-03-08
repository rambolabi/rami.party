/**
 * NEKO PARADISE - Interactive Chibi Neko Game
 * 
 * Features:
 * - Draggable, bouncing neko girls with different personalities
 * - Battle royale at 42+ nekos
 * - Elimination mode with funeral system
 * - Bullet hole cleaning by battle-hardened champion
 * - LocalStorage stats tracking (all keys prefixed with "neko-")
 * - Easter eggs: Konami code, triple-click title
 * - Welcome screen with personalized messages
 * 
 * Performance Optimizations:
 * - Cleaning nekos skip behavior logic but still update position
 * - Collision detection skips dead/cleaning nekos
 * - Body collection checks throttled to 10% of frames
 * - Friction doesn't apply to cleaning nekos
 */

// Cute messages the nekos can say
const nekoMessages = {
    normal: [
        "Nya! 🐱",
        "Pet me! 💕",
        "Mrow~",
        "Sleepy... 😴",
        "Play with me!",
        "Meow meow!",
        "UwU",
        "Purr purr~"
    ],
    shy: [
        "D-don't come closer! >_<",
        "E-eep! 😳",
        "Too shy...",
        "N-nya...",
        "Leave me alone! 🙈",
        "Personal space!",
        "Stranger danger!"
    ],
    friendly: [
        "Pet me! Pet me! 💕",
        "Headpats please! 🥺",
        "Love me! ✨",
        "Don't leave! 💖",
        "Play with me!",
        "I need attention!",
        "Cuddle time! 🤗",
        "Pick me! Pick me!"
    ],
    goth: [
        "Whatever... 🖤",
        "Darkness...",
        "Leave me be...",
        "Nya... I guess",
        "So edgy~",
        "Not a phase!",
        "Mysterious nya~"
    ],
    funeral: [
        "Rest in peace... 😿",
        "Gone but not forgotten...",
        "They were so young...",
        "Say your goodbyes...",
        "We'll miss you...",
        "Into the void... 🖤",
        "May they find peace...",
        "Such a tragedy...",
        "*solemn nya*"
    ]
};

// Neko personality types
const nekoTypes = [
    {
        name: 'normal',
        classes: ['big-eyes'],
        behavior: 'normal',
        speed: 1,
        messages: 'normal',
        clothing: null,
        battlePower: 1
    },
    {
        name: 'shy',
        classes: ['shy', 'side-ears', 'happy-eyes'],
        behavior: 'runaway',
        speed: 2,
        messages: 'shy',
        clothing: 'skirt',
        battlePower: 0.8
    },
    {
        name: 'friendly',
        classes: ['friendly', 'big-eyes'],
        behavior: 'seek',
        speed: 1.5,
        messages: 'friendly',
        clothing: 'shorts',
        battlePower: 1.2
    },
    {
        name: 'goth',
        classes: ['goth', 'side-ears', 'chibi-eyes'],
        behavior: 'normal',
        speed: 0.8,
        messages: 'goth',
        clothing: 'skirt',
        battlePower: 1.5
    },
    {
        name: 'ferret',
        classes: ['ferret', 'chibi-eyes'],
        behavior: 'hide',
        speed: 3.5,
        messages: 'normal',
        isSpecial: true,
        clothing: null,
        battlePower: 0.5
    },
    {
        name: 'battle-hardened',
        classes: ['battle-hardened', 'big-eyes'],
        behavior: 'normal',
        speed: 1.3,
        messages: 'goth',
        isSpecial: true,
        clothing: 'shorts',
        battlePower: 3
    }
];

// Store all nekos
let nekos = [];
let partyMode = false;
let draggedNeko = null;
let offsetX = 0;
let offsetY = 0;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ferretCount = 0;
let battleInProgress = false;
let eliminationMode = false;
let deadNekos = [];
let bulletHoles = [];

// LocalStorage stats tracking (all keys prefixed with neko-)
function getStats() {
    return {
        totalSpawned: parseInt(localStorage.getItem('neko-totalSpawned') || '0'),
        totalKilled: parseInt(localStorage.getItem('neko-totalKilled') || '0'),
        totalFerretsKilled: parseInt(localStorage.getItem('neko-totalFerretsKilled') || '0'),
        totalBattles: parseInt(localStorage.getItem('neko-totalBattles') || '0')
    };
}

function incrementStat(statName) {
    const current = parseInt(localStorage.getItem('neko-' + statName) || '0');
    localStorage.setItem('neko-' + statName, (current + 1).toString());
    console.log(`📊 ${statName}: ${current + 1}`);
}

function logStats() {
    const stats = getStats();
    console.log('📊 All-Time Stats:', stats);
}

function getWelcomeMessage() {
    const stats = getStats();
    const killed = stats.totalKilled;
    const spawned = stats.totalSpawned;
    const ferretKiller = stats.totalFerretsKilled > 0;
    const battles = stats.totalBattles;
    
    // First time visitor
    if (spawned === 0 && killed === 0) {
        return [
            "Welcome, lost soul... 🌙",
            "Greetings, wanderer of the digital realm... ✨",
            "Ah, a new visitor approaches... 👁️",
            "Welcome to the Neko Paradise, newcomer! 🐱",
            "Your journey into chaos begins now... 🌀"
        ][Math.floor(Math.random() * 5)];
    }
    
    // Ferret killer - most heinous crime!
    if (ferretKiller) {
        return [
            `FERRET MURDERER! You killed ${stats.totalFerretsKilled} precious ferret${stats.totalFerretsKilled > 1 ? 's' : ''}! How could you?! 😡🦦`,
            `The ferrets remember your crimes... ${stats.totalFerretsKilled} innocent souls... 🦦💀`,
            `WANTED: Ferret Killer! Reward: ETERNAL SHAME! (${stats.totalFerretsKilled} confirmed kills) 🚨`,
            `You monster! ${stats.totalFerretsKilled} ferret${stats.totalFerretsKilled > 1 ? 's' : ''} fell by your hand! 😭🦦`
        ][Math.floor(Math.random() * 4)];
    }
    
    // Mass murderer (50+)
    if (killed >= 50) {
        return [
            `GENOCIDAL MANIAC DETECTED! ${killed} nekos eliminated! 💀💀💀`,
            `The Neko Reaper returns... ${killed} souls collected... ☠️`,
            `Serial killer alert! ${killed} confirmed kills! FBI has been notified... 🚨`,
            `${killed} nekos!? You're a MONSTER! An absolute MENACE! 😱`,
            `The Neko Slayer strikes again! Kill count: ${killed}! 🗡️`
        ][Math.floor(Math.random() * 5)];
    }
    
    // Heavy killer (30-49)
    if (killed >= 30) {
        return [
            `Welcome back, executioner... ${killed} nekos have fallen... 💔`,
            `The blood of ${killed} nekos stains your hands... 🌹`,
            `${killed} casualties and counting... When will the madness end?! 😖`,
            `Killer on the loose! ${killed} nekos eliminated! 🚨🐱`
        ][Math.floor(Math.random() * 4)];
    }
    
    // Murderer (20-29)
    if (killed >= 20) {
        return [
            `The assassin returns! ${killed} nekos eliminated! 🔪`,
            `Welcome back, killer... Your body count: ${killed} nekos 😈`,
            `${killed} nekos!? You have a serious problem, friend... 😬`,
            `Neko Terminator detected! Eliminations: ${killed}! 🤖💀`
        ][Math.floor(Math.random() * 4)];
    }
    
    // Regular murderer (12-19)
    if (killed >= 12) {
        return [
            `Welcome back, you murderer! I see you killed more than a dozen nekos... (${killed} total) 😠`,
            `A dozen nekos dead by your hand... ${killed} to be exact. Shameful! 💔`,
            `The killer returns! ${killed} nekos have perished... ⚰️`,
            `${killed} nekos eliminated! You're officially a menace to society! 🚨`
        ][Math.floor(Math.random() * 4)];
    }
    
    // Light killer (5-11)
    if (killed >= 5) {
        return [
            `Back for more violence? ${killed} nekos remember your cruelty... 👀`,
            `Oh, it's you again... the one who eliminated ${killed} nekos... 😒`,
            `${killed} nekos eliminated. Not cool, dude. Not cool. 😔`,
            `The nekos whisper your name in fear... ${killed} fallen... 🐱💀`
        ][Math.floor(Math.random() * 4)];
    }
    
    // Killed 1-4 (rookie)
    if (killed >= 1) {
        return [
            `Welcome back! You've eliminated ${killed} neko${killed > 1 ? 's' : ''} so far... 🤔`,
            `Oh, you're back... And yes, we remember the ${killed} you killed... 👁️`,
            `${killed} neko${killed > 1 ? 's' : ''} down... Are you proud of yourself? 😞`,
            `Returning visitor! Murder count: ${killed}. Could be worse... 🤷`
        ][Math.floor(Math.random() * 4)];
    }
    
    // Peaceful player
    if (killed === 0 && spawned > 0) {
        return [
            `Welcome back, peaceful soul! Not a single neko harmed! 😇✨`,
            `The Neko Protector returns! Zero casualties! You're a saint! 🙏`,
            `Pure heart detected! ${spawned} nekos spawned, 0 killed! 💖`,
            `Welcome, friend of nekos! Your hands are clean! 🥰`,
            `The nekos sing songs of your kindness! Zero kills! 🎶🐱`
        ][Math.floor(Math.random() * 5)];
    }
    
    // Battle veteran
    if (battles >= 10) {
        return [
            `BATTLE VETERAN! ${battles} battle royales witnessed! The arena awaits! ⚔️`,
            `The Colosseum Master returns! ${battles} battles hosted! 🏛️`
        ][Math.floor(Math.random() * 2)];
    }
    
    // Default
    return "Welcome to Neko Paradise! 🐱✨";
}

function showWelcomeScreen() {
    const message = getWelcomeMessage();
    const stats = getStats();
    
    const overlay = document.createElement('div');
    overlay.className = 'welcome-overlay';
    overlay.innerHTML = `
        <div class="welcome-container">
            <h1 class="welcome-title">🐱 NEKO PARADISE 🐱</h1>
            <p class="welcome-message">${message}</p>
            <div class="welcome-stats">
                <div class="stat-item">
                    <span class="stat-icon">🎉</span>
                    <span class="stat-label">Spawned:</span>
                    <span class="stat-value">${stats.totalSpawned}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">☠️</span>
                    <span class="stat-label">Eliminated:</span>
                    <span class="stat-value">${stats.totalKilled}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">🦦</span>
                    <span class="stat-label">Ferrets Killed:</span>
                    <span class="stat-value">${stats.totalFerretsKilled}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">⚔️</span>
                    <span class="stat-label">Battles:</span>
                    <span class="stat-value">${stats.totalBattles}</span>
                </div>
            </div>
            <div class="welcome-timer">
                <div class="timer-bar"></div>
            </div>
            <p class="welcome-hint">Loading... <span id="timer-count">10</span>s (click to skip)</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Countdown timer
    let timeLeft = 10;
    const timerSpan = overlay.querySelector('#timer-count');
    const timerBar = overlay.querySelector('.timer-bar');
    
    const countdown = setInterval(() => {
        timeLeft--;
        timerSpan.textContent = timeLeft;
        timerBar.style.width = ((10 - timeLeft) / 10 * 100) + '%';
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 500);
        }
    }, 1000);
    
    // Click to skip
    overlay.addEventListener('click', () => {
        clearInterval(countdown);
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
    });
}

// Initialize with some nekos
document.addEventListener('DOMContentLoaded', () => {
    // Show welcome screen first
    showWelcomeScreen();
    
    // Log stats on load
    logStats();
    
    // Create initial nekos with variety
    for (let i = 0; i < 12; i++) {
        createNeko();
    }
    
    // Initial count update
    updateNekoCount();
    
    // Easter egg: Konami code
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.key);
        konamiCode = konamiCode.slice(-10);
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            activateKonamiEasterEgg();
            konamiCode = [];
        }
    });
    
    // Easter egg: Triple-click title
    const titleElement = document.querySelector('.title-container h1');
    let titleClickCount = 0;
    let titleClickTimer = null;
    if (titleElement) {
        titleElement.addEventListener('click', () => {
            titleClickCount++;
            clearTimeout(titleClickTimer);
            
            if (titleClickCount === 3) {
                activateRandomEasterEgg();
                titleClickCount = 0;
            }
            
            titleClickTimer = setTimeout(() => {
                titleClickCount = 0;
            }, 500);
        });
    }
    
    // Add button event listeners
    document.getElementById('addNeko').addEventListener('click', () => {
        // 1 in 100 chance to spawn a ferret (if less than 2 ferrets exist)
        const spawnFerret = Math.random() < 0.01 && ferretCount < 2;
        createNeko(spawnFerret);
        showHearts();
    });
    
    document.getElementById('partyMode').addEventListener('click', togglePartyMode);
    
    // Eliminate button
    document.getElementById('eliminateBtn').addEventListener('click', toggleEliminationMode);
    
    // Collapse button
    document.getElementById('collapseBtn').addEventListener('click', toggleCollapse);
    
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Shooting functionality
    document.addEventListener('click', handleShoot);
    
    // Start the animation loop
    animateNekos();
});

// Create a new neko
function createNeko(forceFerret = false, forceType = null) {
    const playground = document.getElementById('playground');
    const neko = document.createElement('div');
    
    // Randomly select a neko type (or force specific type)
    let nekoType;
    if (forceType) {
        nekoType = forceType;
    } else if (forceFerret) {
        nekoType = nekoTypes.find(t => t.name === 'ferret');
    } else {
        // Filter out special types from random selection
        const regularTypes = nekoTypes.filter(t => !t.isSpecial);
        nekoType = regularTypes[Math.floor(Math.random() * regularTypes.length)];
    }
    neko.className = 'neko ' + nekoType.classes.join(' ');
    
    // Random position
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 200) + 150;
    
    neko.style.left = x + 'px';
    neko.style.top = y + 'px';
    
    // Random message from type's message pool
    const messages = nekoMessages[nekoType.messages];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    // Add clothing if needed
    const clothingHTML = nekoType.clothing === 'skirt' ? '<div class="neko-skirt"></div>' : 
                         nekoType.clothing === 'shorts' ? '<div class="neko-shorts"></div>' : '';
    
    // Battle-hardened extras
    const battleExtras = nekoType.name === 'battle-hardened' ? `
        <div class="battle-scar"></div>
        <div class="battle-arms">
            <div class="battle-arm left"></div>
            <div class="battle-arm right"></div>
        </div>
    ` : '';
    
    neko.innerHTML = `
        <div class="neko-container">
            <div class="neko-body">
                <div class="neko-speech">${message}</div>
                <div class="neko-head">
                    ${battleExtras}
                    <div class="neko-hair">
                        <div class="neko-ear left"></div>
                        <div class="neko-ear right"></div>
                    </div>
                    <div class="neko-eyes">
                        <div class="neko-eye"></div>
                        <div class="neko-eye"></div>
                    </div>
                    <div class="neko-blush left"></div>
                    <div class="neko-blush right"></div>
                    <div class="neko-mouth"></div>
                </div>
                <div class="neko-torso">
                    ${clothingHTML}
                    <div class="neko-tail"></div>
                </div>
                <div class="neko-paws">
                    <div class="neko-paw"></div>
                    <div class="neko-paw"></div>
                </div>
            </div>
        </div>
    `;
    
    playground.appendChild(neko);
    
    // Track ferrets
    if (nekoType.name === 'ferret') {
        ferretCount++;
    }
    
    // 1 in 30 chance for random body color
    if (Math.random() < 1/30) {
        const randomHue = Math.floor(Math.random() * 360);
        const torso = neko.querySelector('.neko-torso');
        if (torso) {
            torso.style.background = `linear-gradient(135deg, hsl(${randomHue}, 70%, 75%) 0%, hsl(${randomHue + 30}, 60%, 85%) 100%)`;
        }
    }
    
    // Increment spawn counter in localStorage
    incrementStat('totalSpawned');
    
    // Add to nekos array with physics properties
    const nekoData = {
        element: neko,
        type: nekoType,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 2 * nekoType.speed,
        vy: (Math.random() - 0.5) * 2 * nekoType.speed,
        isDragging: false,
        behavior: nekoType.behavior,
        speed: nekoType.speed,
        fearDistance: 150, // Distance to start fleeing
        loveDistance: 200,  // Distance to start seeking
        battlePower: nekoType.battlePower || 1,
        isDead: false,
        isBeingCarried: false,
        isCleaning: false
    };
    
    nekos.push(nekoData);
    
    // Update neko count display
    updateNekoCount();
    
    // Add drag event listeners
    neko.addEventListener('mousedown', startDrag);
    neko.addEventListener('touchstart', startDrag);
    
    // Add click for bounce (or hide for ferrets)
    neko.addEventListener('click', (e) => {
        if (!nekoData.isDragging) {
            if (nekoType.name === 'ferret') {
                hideInCorner(nekoData);
            } else {
                bounce(neko);
                playSound();
            }
        }
    });
    
    // Add double click for spin
    neko.addEventListener('dblclick', (e) => {
        spin(neko);
        showHearts(neko);
    });
    
    return nekoData;
}

// Start dragging
function startDrag(e) {
    e.preventDefault();
    
    const neko = e.currentTarget;
    const nekoData = nekos.find(n => n.element === neko);
    if (!nekoData) return;
    
    nekoData.isDragging = true;
    draggedNeko = nekoData;
    
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    offsetX = clientX - nekoData.x;
    offsetY = clientY - nekoData.y;
    
    neko.style.transition = 'none';
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
}

// Drag the neko
function drag(e) {
    if (!draggedNeko) return;
    e.preventDefault();
    
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    
    draggedNeko.x = clientX - offsetX;
    draggedNeko.y = clientY - offsetY;
    
    draggedNeko.element.style.left = draggedNeko.x + 'px';
    draggedNeko.element.style.top = draggedNeko.y + 'px';
}

// Stop dragging
function stopDrag(e) {
    if (!draggedNeko) return;
    
    draggedNeko.isDragging = false;
    draggedNeko.element.style.transition = '';
    
    // Give it a random velocity when released based on its speed
    draggedNeko.vx = (Math.random() - 0.5) * 5 * draggedNeko.speed;
    draggedNeko.vy = (Math.random() - 0.5) * 5 * draggedNeko.speed;
    
    bounce(draggedNeko.element);
    
    draggedNeko = null;
    
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
}

// Bounce animation
function bounce(element) {
    element.classList.remove('bouncing');
    void element.offsetWidth; // Trigger reflow
    element.classList.add('bouncing');
    setTimeout(() => element.classList.remove('bouncing'), 600);
}

// Spin animation
function spin(element) {
    element.classList.remove('spinning');
    void element.offsetWidth;
    element.classList.add('spinning');
    setTimeout(() => element.classList.remove('spinning'), 1000);
}

// Show hearts effect
function showHearts(sourceElement = null) {
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.textContent = ['💙', '💕', '💖', '✨', '⭐'][Math.floor(Math.random() * 5)];
            
            if (sourceElement) {
                const rect = sourceElement.getBoundingClientRect();
                heart.style.left = (rect.left + rect.width / 2) + 'px';
                heart.style.top = (rect.top + rect.height / 2) + 'px';
            } else {
                heart.style.left = Math.random() * window.innerWidth + 'px';
                heart.style.top = Math.random() * window.innerHeight + 'px';
            }
            
            document.body.appendChild(heart);
            
            setTimeout(() => heart.remove(), 2000);
        }, i * 100);
    }
}

// Simple sound effect (using Web Audio API)
function playSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800 + Math.random() * 400;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Audio context not supported, skip sound
    }
}

// Toggle party mode
function togglePartyMode() {
    partyMode = !partyMode;
    const playground = document.getElementById('playground');
    
    if (partyMode) {
        playground.classList.add('party-mode');
        document.body.style.animation = 'rainbow 2s infinite';
        
        // Make all nekos dance
        nekos.forEach(nekoData => {
            nekoData.vx *= 2;
            nekoData.vy *= 2;
        });
        
        showHearts();
    } else {
        playground.classList.remove('party-mode');
        document.body.style.animation = '';
        
        // Calm them down
        nekos.forEach(nekoData => {
            nekoData.vx *= 0.5;
            nekoData.vy *= 0.5;
        });
    }
}

// Animation loop for bouncing around
function animateNekos() {
    // Check for battle royale trigger (42 or more nekos)
    if (nekos.length >= 42 && !battleInProgress) {
        startBattleRoyale();
    }
    
    nekos.forEach(nekoData => {
        if (nekoData.isDragging || nekoData.isDead) return;
        
        // Cleaning nekos: skip behaviors but still update position
        if (!nekoData.isCleaning) {
            // Ferret hiding behavior
            if (nekoData.hiding && nekoData.targetCorner) {
                const dx = nekoData.targetCorner.x - nekoData.x;
                const dy = nekoData.targetCorner.y - nekoData.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 20) {
                    // Reached corner, slow down
                    nekoData.vx *= 0.8;
                    nekoData.vy *= 0.8;
                    nekoData.hiding = false;
                    nekoData.targetCorner = null;
                }
            }
            
            // Calculate distance to mouse
            const dx = mouseX - nekoData.x;
            const dy = mouseY - nekoData.y;
            const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
            
            // Elimination mode behaviors
            if (eliminationMode) {
                if (nekoData.type.name === 'ferret' && distanceToMouse < 250) {
                    // Ferrets crawl toward target
                    const angle = Math.atan2(dy, dx);
                    const crawlSpeed = 2.5;
                    nekoData.vx = Math.cos(angle) * crawlSpeed;
                    nekoData.vy = Math.sin(angle) * crawlSpeed;
                    nekoData.element.classList.add('scuttling');
                } else if (nekoData.type.name !== 'ferret') {
                    // Nekos run away in panic (faster than normal)
                    if (distanceToMouse < 300) {
                        const angle = Math.atan2(dy, dx);
                        const panicSpeed = 4 * nekoData.speed;
                        nekoData.vx = -Math.cos(angle) * panicSpeed;
                        nekoData.vy = -Math.sin(angle) * panicSpeed;
                        nekoData.element.classList.add('running-away');
                    }
                }
            } else {
                // Normal behavior-based reactions
                if (nekoData.behavior === 'runaway' && distanceToMouse < nekoData.fearDistance) {
                    // Run away from mouse
                    const angle = Math.atan2(dy, dx);
                    const fleeSpeed = 3 * nekoData.speed;
                    nekoData.vx = -Math.cos(angle) * fleeSpeed;
                    nekoData.vy = -Math.sin(angle) * fleeSpeed;
                    
                    // Add visual indicator
                    nekoData.element.classList.add('running-away');
                    setTimeout(() => nekoData.element.classList.remove('running-away'), 300);
                } else if (nekoData.behavior === 'seek' && distanceToMouse < nekoData.loveDistance) {
                    // Move towards mouse
                    const angle = Math.atan2(dy, dx);
                    const seekSpeed = 2 * nekoData.speed;
                    nekoData.vx += Math.cos(angle) * 0.3;
                    nekoData.vy += Math.sin(angle) * 0.3;
                    
                    // Cap speed
                    const currentSpeed = Math.sqrt(nekoData.vx * nekoData.vx + nekoData.vy * nekoData.vy);
                    if (currentSpeed > seekSpeed) {
                        nekoData.vx = (nekoData.vx / currentSpeed) * seekSpeed;
                        nekoData.vy = (nekoData.vy / currentSpeed) * seekSpeed;
                    }
                    
                    // Add visual indicator
                    nekoData.element.classList.add('seeking-love');
                    
                    // Show hearts when very close
                    if (distanceToMouse < 80 && Math.random() < 0.05) {
                        showHearts(nekoData.element);
                        playSound();
                    }
                } else {
                    nekoData.element.classList.remove('seeking-love');
                }
            }
            
            // Mourning behavior: slowly approach fallen nekos
            if (!eliminationMode && !battleInProgress) {
                const nearestDead = findNearestDeadNeko(nekoData);
                if (nearestDead) {
                    const dx = nearestDead.x - nekoData.x;
                    const dy = nearestDead.y - nekoData.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    // Slowly walk towards fallen comrade
                    if (dist > 100 && dist < 600) {
                        const angle = Math.atan2(dy, dx);
                        const mournSpeed = 0.5;
                        nekoData.vx += Math.cos(angle) * mournSpeed * 0.05;
                        nekoData.vy += Math.sin(angle) * mournSpeed * 0.05;
                    }
                    
                    // Check for dead ferret anger
                    if (nearestDead.type.name === 'ferret' && dist < 150) {
                        if (!nearestDead.hasAngryNekos) {
                            nearestDead.hasAngryNekos = true;
                            showAngryReaction(nekoData, nearestDead);
                        }
                    }
                }
            }
        } // End of !isCleaning check
        
        // Update position (happens for all nekos including cleaner)
        nekoData.x += nekoData.vx;
        nekoData.y += nekoData.vy;
        
        // Bounce off edges (unless cleaning)
        const margin = 80;
        if (!nekoData.isCleaning) {
            if (nekoData.x < 0 || nekoData.x > window.innerWidth - margin) {
                nekoData.vx *= -1;
                nekoData.x = Math.max(0, Math.min(window.innerWidth - margin, nekoData.x));
                bounce(nekoData.element);
            }
            
            if (nekoData.y < 150 || nekoData.y > window.innerHeight - margin) {
                nekoData.vy *= -1;
                nekoData.y = Math.max(150, Math.min(window.innerHeight - margin, nekoData.y));
                bounce(nekoData.element);
            }
        } else {
            // Cleaner can go anywhere, but keep on screen
            nekoData.x = Math.max(-50, Math.min(window.innerWidth + 50, nekoData.x));
            nekoData.y = Math.max(100, Math.min(window.innerHeight + 50, nekoData.y));
        }
        
        // Apply friction (more for non-seeking ones, but not for cleaner)
        if (!nekoData.isCleaning) {
            const friction = nekoData.behavior === 'seek' ? 0.98 : 0.99;
            nekoData.vx *= friction;
            nekoData.vy *= friction;
            
            // Random direction changes (less for behavior-driven nekos)
            if (nekoData.behavior === 'normal' && Math.random() < 0.01 && !eliminationMode) {
                nekoData.vx += (Math.random() - 0.5) * 0.5;
                nekoData.vy += (Math.random() - 0.5) * 0.5;
            }
        }
        
        // Update element position
        nekoData.element.style.left = nekoData.x + 'px';
        nekoData.element.style.top = nekoData.y + 'px';
    });
    
    // Check for body collection (optimize: only check every few frames)
    if (Math.random() < 0.1) {  // Check 10% of the time to reduce CPU usage
        checkBodyCollection();
    }
    
    // Check for collisions (skip cleaning and dead nekos)
    for (let i = 0; i < nekos.length; i++) {
        for (let j = i + 1; j < nekos.length; j++) {
            const n1 = nekos[i];
            const n2 = nekos[j];
            
            // Skip if either is dragging, dead, or cleaning
            if (n1.isDragging || n2.isDragging || n1.isDead || n2.isDead || n1.isCleaning || n2.isCleaning) continue;
            
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 80) {
                // Bounce off each other
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);
                
                // Swap velocities in collision direction
                const vx1 = n1.vx * cos + n1.vy * sin;
                const vy1 = n1.vy * cos - n1.vx * sin;
                const vx2 = n2.vx * cos + n2.vy * sin;
                const vy2 = n2.vy * cos - n2.vx * sin;
                
                // Rotate velocities back
                n1.vx = vx2 * cos - vy1 * sin;
                n1.vy = vy1 * cos + vx2 * sin;
                n2.vx = vx1 * cos - vy2 * sin;
                n2.vy = vy2 * cos + vx1 * sin;
                
                // Separate them
                const overlap = 80 - distance;
                n1.x -= overlap * cos / 2;
                n1.y -= overlap * sin / 2;
                n2.x += overlap * cos / 2;
                n2.y += overlap * sin / 2;
                
                bounce(n1.element);
                bounce(n2.element);
                playSound();
            }
        }
    }
    
    requestAnimationFrame(animateNekos);
}

// Handle window resize
window.addEventListener('resize', () => {
    nekos.forEach(nekoData => {
        nekoData.x = Math.min(nekoData.x, window.innerWidth - 80);
        nekoData.y = Math.min(Math.max(nekoData.y, 150), window.innerHeight - 80);
    });
});

// Easter egg: Press 'n' to add a neko
document.addEventListener('keypress', (e) => {
    if (e.key === 'n' || e.key === 'N') {
        createNeko();
        showHearts();
    }
});

// Easter egg: Press 'p' for party mode
document.addEventListener('keypress', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        togglePartyMode();
    }
});

// Toggle collapse for title container
function toggleCollapse() {
    const titleContainer = document.querySelector('.title-container');
    const collapseBtn = document.getElementById('collapseBtn');
    
    titleContainer.classList.toggle('collapsed');
    collapseBtn.classList.toggle('collapsed');
}

// Easter Eggs
function activateKonamiEasterEgg() {
    console.log('🎮 KONAMI CODE ACTIVATED! 🎮');
    
    // Spawn 30 nekos at once!
    for (let i = 0; i < 30; i++) {
        setTimeout(() => createNeko(), i * 50);
    }
    
    // Show celebration message
    const msg = document.createElement('div');
    msg.className = 'easter-egg-message';
    msg.textContent = '🎮 KONAMI CODE! +30 NEKOS! 🎮';
    msg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 48px;
        font-weight: bold;
        color: #ff00ff;
        text-shadow: 0 0 20px #ff00ff, 0 0 40px #ff00ff;
        z-index: 9999;
        pointer-events: none;
        animation: pulse 0.5s ease-in-out 5;
    `;
    document.body.appendChild(msg);
    
    setTimeout(() => msg.remove(), 3000);
    
    // Activate party mode temporarily
    if (!partyMode) {
        togglePartyMode();
        setTimeout(togglePartyMode, 10000);
    }
}

function activateRandomEasterEgg() {
    const eggs = [
        () => {
            // All nekos become goth
            nekos.forEach(n => {
                if (n.type.name !== 'ferret') {
                    n.element.classList.add('goth');
                }
            });
            showEasterEggMessage('🖤 GOTH MODE ACTIVATED! 🖤');
        },
        () => {
            // Gravity reversal for 5 seconds
            nekos.forEach(n => n.vy = -Math.abs(n.vy) - 5);
            showEasterEggMessage('🌌 ANTIGRAVITY! 🌌');
        },
        () => {
            // Super speed
            nekos.forEach(n => {
                n.vx *= 5;
                n.vy *= 5;
            });
            showEasterEggMessage('⚡ SUPER SPEED! ⚡');
        },
        () => {
            // Spawn a ferret if possible
            if (ferretCount < 2) {
                createNeko(true);
                showEasterEggMessage('🦦 SURPRISE FERRET! 🦦');
            }
        }
    ];
    
    eggs[Math.floor(Math.random() * eggs.length)]();
}

function showEasterEggMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'easter-egg-message';
    msg.textContent = text;
    msg.style.cssText = `
        position: fixed;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 36px;
        font-weight: bold;
        color: #ffd700;
        text-shadow: 0 0 15px #ffd700;
        z-index: 9999;
        pointer-events: none;
        animation: fadeInOut 2s ease-in-out;
    `;
    document.body.appendChild(msg);
    
    setTimeout(() => msg.remove(), 2000);
}

// Remove neko and update ferret count
function removeNeko(nekoData) {
    if (nekoData.type.name === 'ferret') {
        ferretCount--;
    }
    const index = nekos.indexOf(nekoData);
    if (index > -1) {
        nekos.splice(index, 1);
        nekoData.element.remove();
    }
    updateNekoCount();
}

// Update neko counter
function updateNekoCount() {
    const counter = document.getElementById('nekoCount');
    const ferretCountEl = document.getElementById('ferretCount');
    const ferretNumEl = document.getElementById('ferretNum');
    
    if (counter) {
        counter.textContent = nekos.length;
        
        // Show ferret count if any ferrets exist
        if (ferretCount > 0) {
            ferretCountEl.style.display = 'inline';
            ferretNumEl.textContent = ferretCount;
        } else {
            ferretCountEl.style.display = 'none';
        }
        
        // Warning color when approaching 42
        if (nekos.length >= 35 && nekos.length < 42) {
            counter.style.color = '#ff9900';
            counter.style.animation = 'pulse 0.5s ease-in-out infinite';
        } else if (nekos.length >= 42) {
            counter.style.color = '#ff0000';
            counter.style.animation = 'pulse 0.3s ease-in-out infinite';
        } else {
            counter.style.color = '#333';
            counter.style.animation = 'none';
        }
    }
}

// Make ferret hide in nearest corner
function hideInCorner(nekoData) {
    const corners = [
        { x: 50, y: 150 },                                    // top-left
        { x: window.innerWidth - 130, y: 150 },              // top-right
        { x: 50, y: window.innerHeight - 100 },              // bottom-left
        { x: window.innerWidth - 130, y: window.innerHeight - 100 }  // bottom-right
    ];
    
    // Find nearest corner
    let nearestCorner = corners[0];
    let minDist = Infinity;
    
    corners.forEach(corner => {
        const dx = corner.x - nekoData.x;
        const dy = corner.y - nekoData.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
            minDist = dist;
            nearestCorner = corner;
        }
    });
    
    // Calculate velocity to reach corner
    const dx = nearestCorner.x - nekoData.x;
    const dy = nearestCorner.y - nekoData.y;
    const angle = Math.atan2(dy, dx);
    
    nekoData.vx = Math.cos(angle) * nekoData.speed * 4;
    nekoData.vy = Math.sin(angle) * nekoData.speed * 4;
    nekoData.targetCorner = nearestCorner;
    nekoData.hiding = true;
    
    // Add scuttling animation
    nekoData.element.classList.add('scuttling');
    setTimeout(() => nekoData.element.classList.remove('scuttling'), 300);
    
    playSound();
}

// Battle Royale System!
function startBattleRoyale() {
    battleInProgress = true;
    const nekoCount = nekos.length;
    console.log(`🎮 BATTLE ROYALE BEGINS! ${nekoCount} nekos enter, 1 neko leaves!`);
    
    // Increment battle counter
    incrementStat('totalBattles');
    
    // Phase 1: Converge to center
    convergeToCenter();
    
    // Phase 2: Create dust cloud and start battle
    setTimeout(() => {
        createDustCloud();
        startBattle();
    }, 2000);
}

function convergeToCenter() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    nekos.forEach(nekoData => {
        // Skip dead nekos - they don't participate
        if (nekoData.isDead) return;
        
        // Slowly walk to center (not rushing)
        const angle = Math.atan2(centerY - nekoData.y, centerX - nekoData.x);
        const walkSpeed = 0.8;
        nekoData.vx = Math.cos(angle) * walkSpeed;
        nekoData.vy = Math.sin(angle) * walkSpeed;
        
        nekoData.element.classList.add('converging');
    });
}

function createDustCloud() {
    const dustCloud = document.createElement('div');
    dustCloud.className = 'dust-cloud';
    document.body.appendChild(dustCloud);
    
    // Create smaller clouds around main cloud
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            createSmallCloud();
        }, i * 200);
    }
    
    return dustCloud;
}

function createSmallCloud() {
    const cloud = document.createElement('div');
    cloud.className = 'small-cloud';
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const angle = Math.random() * Math.PI * 2;
    const distance = 250 + Math.random() * 150;
    
    cloud.style.left = (centerX + Math.cos(angle) * distance) + 'px';
    cloud.style.top = (centerY + Math.sin(angle) * distance) + 'px';
    
    document.body.appendChild(cloud);
    
    setTimeout(() => cloud.remove(), 8000);
}

function startBattle() {
    const battleTexts = ['POW!', 'BAM!', 'WHAM!', 'SMACK!', 'BOOM!', 'CRASH!', 'BANG!', 'THUD!', 'KAPOW!', 'BONK!'];
    const battleItems = ['⭐', '💫', '💥', '🔨', '🪛', '🔧', '🪃', '🎯', '💣', '⚡', '🌟', '✨', '💢'];
    
    let battleDuration = 8000; // 8 seconds of battle
    let textInterval = 600;
    let itemInterval = 300;
    let knockoutStart = 3000;
    
    // Show battle texts
    const textTimer = setInterval(() => {
        if (!battleInProgress) {
            clearInterval(textTimer);
            return;
        }
        showBattleText(battleTexts[Math.floor(Math.random() * battleTexts.length)]);
    }, textInterval);
    
    // Launch battle items
    const itemTimer = setInterval(() => {
        if (!battleInProgress) {
            clearInterval(itemTimer);
            return;
        }
        launchBattleItem(battleItems[Math.floor(Math.random() * battleItems.length)]);
    }, itemInterval);
    
    // Start knocking out nekos
    setTimeout(() => {
        knockOutNekos();
    }, knockoutStart);
    
    // End battle
    setTimeout(() => {
        endBattle();
        clearInterval(textTimer);
        clearInterval(itemTimer);
    }, battleDuration);
}

function showBattleText(text) {
    const textEl = document.createElement('div');
    textEl.className = 'battle-text';
    textEl.textContent = text;
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = (Math.random() - 0.5) * 200;
    const offsetY = (Math.random() - 0.5) * 200;
    
    textEl.style.left = (centerX + offsetX) + 'px';
    textEl.style.top = (centerY + offsetY) + 'px';
    
    // Random color
    const colors = ['#ff0000', '#ff6600', '#ffff00', '#00ff00', '#0066ff', '#ff00ff'];
    textEl.style.color = colors[Math.floor(Math.random() * colors.length)];
    
    document.body.appendChild(textEl);
    
    setTimeout(() => textEl.remove(), 800);
}

function showMockingPopup(nekoElement) {
    const messages = ['HA HA!', 'NICE TRY!', 'TOO SLOW!', 'MISSED ME!', 'NOPE!', '😎'];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    const popup = document.createElement('div');
    popup.className = 'comic-popup';
    popup.textContent = message;
    
    const rect = nekoElement.getBoundingClientRect();
    popup.style.left = (rect.left + rect.width / 2) + 'px';
    popup.style.top = (rect.top - 60) + 'px';
    
    document.body.appendChild(popup);
    
    setTimeout(() => popup.remove(), 1500);
}

function launchBattleItem(item) {
    const itemEl = document.createElement('div');
    itemEl.className = 'battle-item';
    itemEl.textContent = item;
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    itemEl.style.left = centerX + 'px';
    itemEl.style.top = centerY + 'px';
    
    // Random direction
    const angle = Math.random() * Math.PI * 2;
    const distance = 200 + Math.random() * 300;
    const flyX = Math.cos(angle) * distance;
    const flyY = Math.sin(angle) * distance;
    const flyRotate = Math.random() * 720 - 360;
    
    itemEl.style.setProperty('--fly-x', flyX + 'px');
    itemEl.style.setProperty('--fly-y', flyY + 'px');
    itemEl.style.setProperty('--fly-rotate', flyRotate + 'deg');
    
    document.body.appendChild(itemEl);
    
    setTimeout(() => itemEl.remove(), 1500);
}

function knockOutNekos() {
    // Calculate survivors based on battle power (exclude dead nekos)
    const aliveNekos = nekos.filter(n => !n.isDead);
    const survivors = [];
    const totalPower = aliveNekos.reduce((sum, n) => sum + (n.battlePower || 1), 0);
    
    aliveNekos.forEach(nekoData => {
        const survivalChance = (nekoData.battlePower || 1) / totalPower * nekos.length;
        if (Math.random() < survivalChance / 42) {
            survivors.push(nekoData);
        }
    });
    
    // Ensure at least one survivor
    if (survivors.length === 0 && aliveNekos.length > 0) {
        const randomIndex = Math.floor(Math.random() * aliveNekos.length);
        survivors.push(aliveNekos[randomIndex]);
    }
    
    // Pick the ultimate survivor (highest battle power wins)
    const winner = survivors.reduce((prev, current) => 
        (current.battlePower > prev.battlePower) ? current : prev
    );
    
    // Knock out everyone except the winner
    const knockoutDelay = 200;
    let delay = 0;
    
    aliveNekos.forEach(nekoData => {
        if (nekoData === winner) return;
        
        setTimeout(() => {
            knockOutNeko(nekoData);
        }, delay);
        
        delay += knockoutDelay;
    });
    
    // Store winner for transformation
    setTimeout(() => {
        transformWinner(winner);
    }, delay + 1000);
}

function knockOutNeko(nekoData) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 400 + Math.random() * 200;
    const knockX = Math.cos(angle) * distance;
    const knockY = Math.sin(angle) * distance;
    
    nekoData.element.style.setProperty('--knock-x', knockX + 'px');
    nekoData.element.style.setProperty('--knock-y', knockY + 'px');
    nekoData.element.classList.add('knocked-out');
    
    setTimeout(() => {
        removeNeko(nekoData);
    }, 1000);
}

function transformWinner(winner) {
    // Remove winner temporarily
    const winnerPos = {
        x: parseFloat(winner.element.style.left),
        y: parseFloat(winner.element.style.top)
    };
    
    removeNeko(winner);
    
    // Create battle-hardened neko at same position
    setTimeout(() => {
        const battleHardenedType = nekoTypes.find(t => t.name === 'battle-hardened');
        const champion = createNeko(false, battleHardenedType);
        
        champion.x = winnerPos.x;
        champion.y = winnerPos.y;
        champion.element.style.left = winnerPos.x + 'px';
        champion.element.style.top = winnerPos.y + 'px';
        
        // Victory effects
        showBattleText('VICTORY!');
        showHearts(champion.element);
        
        battleInProgress = false;
        
        // Remove dust cloud
        const dustCloud = document.querySelector('.dust-cloud');
        if (dustCloud) {
            setTimeout(() => dustCloud.remove(), 1000);
        }
    }, 500);
}

function endBattle() {
    console.log('⚔️ Battle Royale Complete!');
}

// Elimination Mode
function toggleEliminationMode() {
    eliminationMode = !eliminationMode;
    const btn = document.getElementById('eliminateBtn');
    
    if (eliminationMode) {
        document.body.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><circle cx=\'16\' cy=\'16\' r=\'12\' fill=\'none\' stroke=\'red\' stroke-width=\'2\'/><line x1=\'16\' y1=\'4\' x2=\'16\' y2=\'28\' stroke=\'red\' stroke-width=\'2\'/><line x1=\'4\' y1=\'16\' x2=\'28\' y2=\'16\' stroke=\'red\' stroke-width=\'2\'/><circle cx=\'16\' cy=\'16\' r=\'2\' fill=\'red\'/></svg>") 16 16, crosshair';
        btn.textContent = '🛑 Stop Eliminating';
        btn.style.background = 'linear-gradient(45deg, #c0392b, #e74c3c)';
    } else {
        document.body.style.cursor = 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text y="28" font-size="28">🐾</text></svg>\'), auto';
        btn.textContent = '🎯 Eliminate';
        btn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
        
        // When elimination ends, start mourning/body collection
        if (deadNekos.length > 0) {
            startMourning();
        }
    }
}

function handleShoot(e) {
    if (!eliminationMode) return;
    if (e.target.tagName === 'BUTTON') return;
    
    const clickX = e.clientX;
    const clickY = e.clientY;
    
    // Check if we hit a neko or ferret
    let hitSomething = false;
    
    nekos.forEach(nekoData => {
        if (nekoData.isDead) return;
        
        const rect = nekoData.element.getBoundingClientRect();
        if (clickX >= rect.left && clickX <= rect.right &&
            clickY >= rect.top && clickY <= rect.bottom) {
            
            hitSomething = true;
            
            if (nekoData.type.name === 'ferret') {
                shootFerret(nekoData, clickX, clickY);
            } else {
                shootNeko(nekoData, clickX, clickY);
            }
        }
    });
    
    if (!hitSomething) {
        // Missed - create bullet hole in background
        createBulletHole(clickX, clickY);
    }
}

function createBulletHole(x, y) {
    const hole = document.createElement('div');
    hole.className = 'bullet-hole';
    hole.style.position = 'fixed';
    hole.style.left = x + 'px';
    hole.style.top = y + 'px';
    hole.style.width = '8px';
    hole.style.height = '8px';
    hole.style.background = 'radial-gradient(circle, #222 0%, #555 50%, transparent 100%)';
    hole.style.borderRadius = '50%';
    hole.style.transform = 'translate(-50%, -50%)';
    hole.style.pointerEvents = 'none';
    hole.style.zIndex = '5';
    hole.style.boxShadow = 'inset 0 0 3px rgba(0,0,0,0.8)';
    
    document.body.appendChild(hole);
    
    // Track bullet holes
    bulletHoles.push({ element: hole, x: x, y: y });
    
    // Check if we need a cleaner
    checkForCleaner();
}

function shootFerret(nekoData, x, y) {
    nekoData.isDead = true;
    nekoData.vx = 0;
    nekoData.vy = 0;
    
    // Increment ferret kill counter
    incrementStat('totalFerretsKilled');
    
    // Dramatic comic sound effect
    playDramaticSound();
    
    // Show comic text
    showBattleText('SQUEEK!');
    
    // Lay on back
    nekoData.element.style.transform = 'rotate(180deg)';
    nekoData.element.style.transition = 'transform 0.5s';
    
    // Particle burst
    createParticleBurst(x, y, ['💫', '⭐', '✨']);
}

function shootNeko(nekoData, x, y) {
    // Battle-hardened nekos have 50% chance to dodge!
    if (nekoData.type.name === 'battle-hardened' && Math.random() < 0.5) {
        // DODGE!
        const dodgeType = Math.random() < 0.5 ? 'backflip' : 'roll';
        nekoData.element.classList.add('dodging-' + dodgeType);
        
        // Show mocking comic popup
        showMockingPopup(nekoData.element);
        
        // Play dramatic sound
        playDramaticSound();
        
        // Remove dodge class after animation
        setTimeout(() => {
            nekoData.element.classList.remove('dodging-' + dodgeType);
        }, 1000);
        
        return; // Neko survives!
    }
    
    // Normal death sequence
    nekoData.isDead = true;
    nekoData.vx = 0;
    nekoData.vy = 0;
    
    // Increment kill counter
    incrementStat('totalKilled');
    
    // Close eyes (dead nekos have closed eyes)
    const eyes = nekoData.element.querySelectorAll('.neko-eye');
    eyes.forEach(eye => eye.classList.add('closed'));
    
    // Disable speech bubble
    const speechBubble = nekoData.element.querySelector('.neko-speech');
    if (speechBubble) {
        speechBubble.style.display = 'none';
    }
    
    // Play sound
    playSound();
    
    // Create blood spot at position
    const bloodSpot = document.createElement('div');
    bloodSpot.className = 'blood-spot';
    bloodSpot.style.left = nekoData.x + 40 + 'px';
    bloodSpot.style.top = nekoData.y + 40 + 'px';
    document.body.appendChild(bloodSpot);
    
    // Fade and remove after 60 seconds
    setTimeout(() => {
        bloodSpot.style.opacity = '0';
        setTimeout(() => bloodSpot.remove(), 2000);
    }, 60000);
    
    // Drop down dead
    nekoData.element.style.transform = 'rotate(90deg)';
    nekoData.element.style.transition = 'transform 0.5s, opacity 0.5s';
    nekoData.element.style.opacity = '0.7';
    
    // Add to dead nekos list
    deadNekos.push(nekoData);
    
    // Particle burst
    createParticleBurst(x, y, ['💥', '💢', '✨']);
}

function playDramaticSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 1500;
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        // Audio not supported
    }
}

function createParticleBurst(x, y, particles) {
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.fontSize = '20px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        
        const angle = (Math.PI * 2 * i) / 8;
        const distance = 50 + Math.random() * 50;
        const finalX = x + Math.cos(angle) * distance;
        const finalY = y + Math.sin(angle) * distance;
        
        particle.style.transition = 'all 0.5s ease-out';
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.style.left = finalX + 'px';
            particle.style.top = finalY + 'px';
            particle.style.opacity = '0';
        }, 10);
        
        setTimeout(() => particle.remove(), 600);
    }
}

function checkBodyCollection() {
    deadNekos.forEach(deadNeko => {
        if (deadNeko.isBeingCarried || deadNeko.type.name === 'ferret') return;
        
        const nearbyNekos = nekos.filter(neko => {
            if (neko.isDead || neko === deadNeko) return false;
            
            const dx = neko.x - deadNeko.x;
            const dy = neko.y - deadNeko.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return dist < 100;
        });
        
        if (nearbyNekos.length >= 3 && !deadNeko.prayersStarted) {
            // Enough nekos to say prayers
            deadNeko.prayersStarted = true;
            sayPrayers(deadNeko, nearbyNekos);
        } else if (nearbyNekos.length > 0) {
            // Show funeral messages
            nearbyNekos.forEach(neko => {
                const speechBubble = neko.element.querySelector('.neko-speech');
                if (speechBubble && Math.random() < 0.02) {
                    const funeralMessages = nekoMessages.funeral;
                    speechBubble.textContent = funeralMessages[Math.floor(Math.random() * funeralMessages.length)];
                    speechBubble.style.display = 'block';
                }
            });
        }
    });
}

function findNearestDeadNeko(nekoData) {
    let nearest = null;
    let minDist = Infinity;
    
    deadNekos.forEach(deadNeko => {
        if (deadNeko.isBeingCarried) return;
        
        const dx = deadNeko.x - nekoData.x;
        const dy = deadNeko.y - nekoData.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < minDist) {
            minDist = dist;
            nearest = deadNeko;
        }
    });
    
    return nearest;
}

function showAngryReaction(nekoData, deadFerret) {
    const angryContainer = document.createElement('div');
    angryContainer.className = 'angry-icons';
    angryContainer.style.position = 'fixed';
    angryContainer.style.left = (nekoData.x + 40) + 'px';
    angryContainer.style.top = (nekoData.y - 30) + 'px';
    angryContainer.style.zIndex = '500';
    angryContainer.innerHTML = '💢😠💢';
    document.body.appendChild(angryContainer);
    
    // Make neko huff and puff
    nekoData.element.classList.add('angry-huff');
    
    setTimeout(() => {
        angryContainer.remove();
        nekoData.element.classList.remove('angry-huff');
    }, 3000);
}

function sayPrayers(deadNeko, mourners) {
    deadNeko.isBeingCarried = true;
    
    console.log('🙏 Nekos gather to say prayers...');
    
    // Show prayer messages
    mourners.forEach(neko => {
        const speechBubble = neko.element.querySelector('.neko-speech');
        if (speechBubble) {
            const funeralMessages = nekoMessages.funeral;
            speechBubble.textContent = funeralMessages[Math.floor(Math.random() * funeralMessages.length)];
            speechBubble.style.display = 'block';
            speechBubble.style.opacity = '1';
        }
        // Stop movement during prayer
        neko.vx *= 0.1;
        neko.vy *= 0.1;
    });
    
    // After prayers, soul floats up
    setTimeout(() => {
        floatSoulUp(deadNeko);
        
        // Hide speech bubbles
        mourners.forEach(neko => {
            const speechBubble = neko.element.querySelector('.neko-speech');
            if (speechBubble) {
                speechBubble.style.opacity = '0';
            }
        });
    }, 3000);
}

function floatSoulUp(deadNeko) {
    // Create soul
    const soul = document.createElement('div');
    soul.className = 'floating-soul';
    soul.textContent = '👻';
    soul.style.position = 'fixed';
    soul.style.left = (deadNeko.x + 40) + 'px';
    soul.style.top = (deadNeko.y + 40) + 'px';
    soul.style.fontSize = '40px';
    soul.style.zIndex = '600';
    soul.style.pointerEvents = 'none';
    document.body.appendChild(soul);
    
    // Fade out body
    deadNeko.element.style.transition = 'opacity 2s';
    deadNeko.element.style.opacity = '0';
    
    // Remove after animation
    setTimeout(() => {
        soul.remove();
        removeNeko(deadNeko);
        const index = deadNekos.indexOf(deadNeko);
        if (index > -1) deadNekos.splice(index, 1);
    }, 4000);
}

function collectBody(deadNeko, collectors) {
    deadNeko.isBeingCarried = true;
    
    // Show funeral messages
    collectors.forEach(neko => {
        const speechBubble = neko.element.querySelector('.neko-speech');
        if (speechBubble) {
            const funeralMessages = nekoMessages.funeral;
            speechBubble.textContent = funeralMessages[Math.floor(Math.random() * funeralMessages.length)];
            speechBubble.style.opacity = '1';
            setTimeout(() => {
                speechBubble.style.opacity = '0';
            }, 3000);
        }
    });
    
    // 1 in 20 chance to place memorial
    if (Math.random() < 0.05) {
        placeMemorial(deadNeko.x + 40, deadNeko.y + 40);
    }
    
    // Remove body after collection
    setTimeout(() => {
        deadNeko.element.style.transition = 'opacity 2s';
        deadNeko.element.style.opacity = '0';
        
        setTimeout(() => {
            removeNeko(deadNeko);
            const index = deadNekos.indexOf(deadNeko);
            if (index > -1) deadNekos.splice(index, 1);
        }, 2000);
    }, 2000);
}

function placeMemorial(x, y) {
    const memorial = document.createElement('div');
    memorial.style.position = 'fixed';
    memorial.style.left = x + 'px';
    memorial.style.top = y + 'px';
    memorial.style.fontSize = '30px';
    memorial.style.transform = 'translate(-50%, -50%)';
    memorial.style.pointerEvents = 'none';
    memorial.style.zIndex = '1';
    memorial.style.opacity = '0';
    memorial.style.transition = 'opacity 1s';
    memorial.textContent = Math.random() < 0.5 ? '✝️' : '⛧';
    
    document.body.appendChild(memorial);
    
    setTimeout(() => {
        memorial.style.opacity = '0.6';
    }, 100);
}

function startMourning() {
    console.log('💐 Mourning period begins...');
    // Bodies will be collected automatically via checkBodyCollection
}

function checkForCleaner() {
    if (bulletHoles.length >= 20) {
        // Find battle-hardened neko to clean
        const cleaner = nekos.find(n => n.type.name === 'battle-hardened' && !n.isCleaning && !n.isDead);
        if (cleaner) {
            startCleaning(cleaner);
        }
    }
}

function startCleaning(cleaner) {
    if (bulletHoles.length === 0) return;
    
    cleaner.isCleaning = true;
    console.log('🧹 Battle-hardened neko starts cleaning!');
    
    // Create broom
    const broom = document.createElement('div');
    broom.textContent = '🧹';
    broom.style.position = 'fixed';
    broom.style.fontSize = '30px';
    broom.style.pointerEvents = 'none';
    broom.style.zIndex = '100';
    broom.className = 'broom';
    document.body.appendChild(broom);
    
    cleanNextBulletHole(cleaner, broom, 0);
}

function cleanNextBulletHole(cleaner, broom, index) {
    if (index >= bulletHoles.length || bulletHoles.length === 0) {
        // Finished cleaning
        cleaner.isCleaning = false;
        broom.remove();
        console.log('✨ Cleaning complete!');
        return;
    }
    
    const hole = bulletHoles[index];
    if (!hole || !hole.element.parentNode) {
        // Hole already removed, skip
        cleanNextBulletHole(cleaner, broom, index + 1);
        return;
    }
    
    // Move cleaner to hole
    const targetX = hole.x - 50;
    const targetY = hole.y - 50;
    
    const dx = targetX - cleaner.x;
    const dy = targetY - cleaner.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 30) {
        // Close enough, clean it
        hole.element.style.transition = 'opacity 0.5s, transform 0.5s';
        hole.element.style.opacity = '0';
        hole.element.style.transform = 'translate(-50%, -50%) scale(0)';
        
        setTimeout(() => {
            hole.element.remove();
            bulletHoles.splice(index, 1);
            cleanNextBulletHole(cleaner, broom, index);
        }, 500);
    } else {
        // Move toward hole
        const angle = Math.atan2(dy, dx);
        cleaner.vx = Math.cos(angle) * 3;  // Increased speed for faster cleaning
        cleaner.vy = Math.sin(angle) * 3;
        
        // Update broom position immediately
        if (broom.parentNode) {
            broom.style.left = (cleaner.x + 40) + 'px';
            broom.style.top = (cleaner.y + 60) + 'px';
        }
        
        // Continue cleaning after a short delay
        setTimeout(() => {
            cleanNextBulletHole(cleaner, broom, index);
        }, 50);
    }
}
