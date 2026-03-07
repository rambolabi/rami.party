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

const almostDoneStatuses = [
    'Almost done...',
    'DO NOT reboot before update is finished!',
    'You should have locked your device...',
    'Risk of losing data if you stop this process!',
    'Critical system files being modified...',
    'Do not turn off your computer!',
    'Warning: Interruption may cause system failure',
    'Please wait, this may take several minutes...',
    'System recovery will not be possible if interrupted'
];

let currentUpdateIndex = 0;
let statusIndex = 0;
let almostDoneStatusIndex = 0;

function updateProgress() {
    if (progress < 99) {
        // Slower increment for gradual progress (takes ~9-10 minutes to reach 90%)
        const increment = Math.random() * 0.4 + 0.2;
        progress = Math.min(99, progress + increment);
        
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.floor(progress) + '%';
        
        // Change update package when hitting certain percentages
        const newUpdateIndex = Math.floor((progress / 99) * updates.length);
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
        
        // Longer delay between updates (1500-2500ms)
        setTimeout(updateProgress, Math.random() * 1000 + 1500);
    } else {
        // Stuck at 99% - cycle through warning messages
        progressText.textContent = '99%';
        statusElement.textContent = almostDoneStatuses[almostDoneStatusIndex];
        almostDoneStatusIndex = (almostDoneStatusIndex + 1) % almostDoneStatuses.length;
        remainingElement.textContent = '1 of 7';
        
        // Keep updating the message every 3-5 seconds
        setTimeout(updateProgress, Math.random() * 2000 + 3000);
    }
}

// Prevent user from leaving page
window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});

// Start the update
setTimeout(updateProgress, 1500);