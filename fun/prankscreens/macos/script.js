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

let progress = 0;
let timeRemaining = 720; // 12 minutes in seconds
const progressFill = document.getElementById('progress');
const timeRemainingElement = document.getElementById('timeRemaining');
const statusMessage = document.getElementById('statusMessage');

const statuses = [
    'Preparing installation...',
    'Verifying macOS Tahoe...',
    'Preparing macOS Tahoe...',
    'Installing macOS Tahoe...',
    'Configuring installation...',
    'Optimizing system performance...',
    'Setting up your Mac...',
    'Finalizing installation...',
    'Almost there...',
    'Your Mac will restart shortly...',
    'You should lock your device...'
];

let currentStatusIndex = 0;

function formatTime(seconds) {
    if (seconds < 60) {
        return 'Less than a minute remaining';
    }
    const minutes = Math.ceil(seconds / 60);
    if (minutes === 1) {
        return 'About 1 minute remaining';
    }
    return `About ${minutes} minutes remaining`;
}

function updateProgress() {
    if (progress < 100) {
        // Apple updates tend to be slow and steady
        const increment = Math.random() * 0.4 + 0.1;
        progress = Math.min(100, progress + increment);
        
        progressFill.style.width = progress + '%';
        
        // Update time remaining (decreases as progress increases)
        timeRemaining = Math.max(0, 720 - (progress / 100 * 720));
        timeRemainingElement.textContent = formatTime(timeRemaining);
        
        // Change status based on progress
        const statusIndex = Math.floor((progress / 100) * statuses.length);
        if (statusIndex !== currentStatusIndex && statusIndex < statuses.length) {
            currentStatusIndex = statusIndex;
            statusMessage.textContent = statuses[currentStatusIndex];
        }
        
        // Variable timing for realism
        let delay = 500;
        if (progress < 10) delay = 300; // Fast at start
        if (progress >= 30 && progress <= 35) delay = 1000; // Slow in middle
        if (progress >= 85 && progress <= 90) delay = 1200; // Slow near end
        if (progress >= 95) delay = 1500; // Very slow at end
        
        setTimeout(updateProgress, delay);
    } else {
        timeRemainingElement.textContent = 'Installation complete';
        statusMessage.textContent = 'Your Mac will restart shortly...';
        
        // Simulate restart countdown
        let countdown = 10;
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                statusMessage.textContent = `Restarting in ${countdown} seconds...`;
            } else {
                statusMessage.textContent = 'Restarting now...';
                clearInterval(countdownInterval);
            }
        }, 1000);
    }
}

// Prevent user from leaving page
window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});

// Start the installation
setTimeout(updateProgress, 2000);