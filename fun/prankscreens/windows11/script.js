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
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const statusMessage = document.getElementById('statusMessage');

const messages = [
    'Preparing to install updates...',
    'Downloading updates...',
    'Installing updates...',
    'Configuring Windows features...',
    'Installing features and drivers...',
    'Getting Windows ready...',
    'Working on updates...',
    'Almost there...',
    'Don\'t turn off your computer',
    'You should lock your device...'
];

let messageIndex = 0;

function updateProgress() {
    // Increment progress by 1 percentage point
    progress = Math.min(100, progress + 1);
    
    progressFill.style.width = progress + '%';
    progressText.textContent = Math.floor(progress) + '% complete';
    
    // Change message occasionally
    if (Math.random() < 0.05 && messageIndex < messages.length - 1) {
        messageIndex++;
        statusMessage.textContent = messages[messageIndex];
    }
    
    // Determine delay based on current progress
    let delay = 300; // Default delay
    
    if (progress > 42 && progress <= 69) {
        delay = 10000; // 10 seconds between each percentage after 42%
    } else if (progress > 69 && progress < 99) {
        delay = 15000; // 15 seconds between each percentage after 69%
    } else if (progress >= 99) {
        delay = 60000; // 60 seconds at 99%
    }
    
    // After reaching 99%, wait and reset to 9%
    if (progress >= 99) {
        setTimeout(() => {
            progress = 9;
            progressFill.style.width = progress + '%';
            progressText.textContent = Math.floor(progress) + '% complete';
            updateProgress();
        }, delay);
    } else {
        setTimeout(updateProgress, delay);
    }
}

function changeMessage() {
    if (messageIndex < messages.length - 1) {
        messageIndex++;
        statusMessage.textContent = messages[messageIndex];
    }
    
    // Random interval between 8-15 seconds
    const interval = Math.random() * 7000 + 8000;
    setTimeout(changeMessage, interval);
}

// Prevent user from leaving page
window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});

// Start updates
setTimeout(() => {
    updateProgress();
    changeMessage();
}, 2000);