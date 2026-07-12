// Enter fullscreen on click
document.addEventListener('click', function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen failed');
        });
    }
});

// Prevent context menu
document.addEventListener('contextmenu', e => e.preventDefault());

// Hide cursor
document.body.style.cursor = 'none';

// Random text changes for extra chaos
const mainText = document.getElementById('mainText');
const hackMessages = [
    'YOU\'VE BEEN HACKED',
    'SYSTEM COMPROMISED',
    'ACCESS DENIED',
    'BREACH DETECTED',
    'CYBER ATTACK',
    'INTRUDER ALERT',
    'SECURITY FAILURE',
    'YOU\'VE BEEN HACKED'
];

let messageIndex = 0;

function changeMessage() {
    messageIndex = (messageIndex + 1) % hackMessages.length;
    mainText.textContent = hackMessages[messageIndex];
}

// Change message every 2 seconds
setInterval(changeMessage, 2000);

// Create additional random flashing elements
function createRandomFlash() {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.width = Math.random() * 200 + 100 + 'px';
    flash.style.height = Math.random() * 200 + 100 + 'px';
    flash.style.left = Math.random() * window.innerWidth + 'px';
    flash.style.top = Math.random() * window.innerHeight + 'px';
    flash.style.background = Math.random() > 0.5 ? '#ff0000' : '#ffff00';
    flash.style.opacity = '0.3';
    flash.style.borderRadius = '50%';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '0';
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.remove();
    }, 300);
}

// Create random flashes periodically
setInterval(createRandomFlash, 500);

// Screen shake effect on interval
function shakeScreen() {
    document.body.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
    setTimeout(() => {
        document.body.style.transform = 'translate(0, 0)';
    }, 50);
}

setInterval(shakeScreen, 1000);
