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
let updatesRemaining = 7;
const progressFill = document.getElementById('progress');
const progressText = document.getElementById('progressText');
const statusElement = document.getElementById('status');
const currentUpdateElement = document.getElementById('currentUpdate');
const remainingElement = document.getElementById('remaining');

const updates = [
    'HP System Firmware',
    'HP UEFI Support Environment',
    'HP Hotkey Support',
    'HP Display Driver',
    'HP Audio Driver',
    'HP Wireless Driver',
    'HP Security Update'
];

const statuses = [
    'Preparing updates...',
    'Downloading components...',
    'Installing update...',
    'Configuring system...',
    'Verifying installation...',
    'Finalizing...'
];

let currentUpdateIndex = 0;
let statusIndex = 0;

function updateProgress() {
    if (progress < 100) {
        const increment = Math.random() * 2 + 0.5;
        progress = Math.min(100, progress + increment);
        
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.floor(progress) + '%';
        
        // Change update package when hitting certain percentages
        const newUpdateIndex = Math.floor((progress / 100) * updates.length);
        if (newUpdateIndex !== currentUpdateIndex && newUpdateIndex < updates.length) {
            currentUpdateIndex = newUpdateIndex;
            currentUpdateElement.textContent = updates[currentUpdateIndex];
            updatesRemaining = updates.length - currentUpdateIndex;
            remainingElement.textContent = `${updatesRemaining} of ${updates.length}`;
        }
        
        // Change status occasionally
        if (Math.random() < 0.1) {
            statusIndex = (statusIndex + 1) % statuses.length;
            statusElement.textContent = statuses[statusIndex];
        }
        
        setTimeout(updateProgress, Math.random() * 400 + 300);
    } else {
        progressText.textContent = '100%';
        statusElement.textContent = 'Update complete. Restart required.';
        remainingElement.textContent = '0 of 7';
    }
}

// Prevent user from leaving page
window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});

// Start the update
setTimeout(updateProgress, 1500);