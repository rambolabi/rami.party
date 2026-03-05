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

// Matrix rain effect
const matrix = document.getElementById('matrix');
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';

function createMatrixRain() {
    const columns = Math.floor(window.innerWidth / 20);
    
    for (let i = 0; i < columns; i++) {
        const column = document.createElement('div');
        column.style.position = 'absolute';
        column.style.left = (i * 20) + 'px';
        column.style.top = '0';
        column.style.color = '#00ff00';
        column.style.fontSize = '14px';
        column.style.fontFamily = 'Courier New';
        column.style.animation = `fall ${Math.random() * 5 + 5}s linear infinite`;
        column.style.animationDelay = `${Math.random() * 5}s`;
        column.style.opacity = '0.3';
        
        let text = '';
        for (let j = 0; j < 30; j++) {
            text += chars[Math.floor(Math.random() * chars.length)] + '<br>';
        }
        column.innerHTML = text;
        
        matrix.appendChild(column);
    }
}

// Add CSS animation for falling
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
    }
`;
document.head.appendChild(style);

createMatrixRain();

// Typing effect
const messages = [
    'INITIALIZING BREACH PROTOCOL...',
    'BYPASSING SECURITY SYSTEMS...',
    'ENCRYPTING FILES...',
    'ACCESSING DATABASE...',
    'STEALING CREDENTIALS...',
    'UPLOADING TO DARK WEB...',
    'TOTAL SYSTEM COMPROMISE ACHIEVED.',
    'YOUR DATA IS NOW OURS.'
];

const typingElement = document.getElementById('typing-text');
let messageIndex = 0;
let charIndex = 0;

function typeMessage() {
    if (messageIndex < messages.length) {
        if (charIndex < messages[messageIndex].length) {
            typingElement.textContent += messages[messageIndex][charIndex];
            charIndex++;
            setTimeout(typeMessage, 50);
        } else {
            typingElement.textContent += '\n';
            messageIndex++;
            charIndex = 0;
            setTimeout(typeMessage, 500);
        }
    }
}

setTimeout(typeMessage, 1000);

// Countdown timer (movie style)
let totalSeconds = 12 * 3600; // 12 hours

function updateMovieCountdown() {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    document.getElementById('movie-countdown').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    if (totalSeconds > 0) {
        totalSeconds--;
    }
}

setInterval(updateMovieCountdown, 1000);
