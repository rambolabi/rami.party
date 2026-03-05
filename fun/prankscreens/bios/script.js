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
const progressBar = document.getElementById('progress');
const percentageText = document.getElementById('percentage');
const stepInfo = document.getElementById('stepInfo');

const steps = [
    'Erasing flash memory...',
    'Writing BIOS data...',
    'Verifying BIOS data...',
    'Programming boot block...',
    'Updating NVRAM...',
    'Finalizing update...'
];

let currentStep = 0;

function updateProgress() {
    if (progress < 100) {
        // Randomly increase progress (slower near end)
        const increment = Math.random() * (progress < 90 ? 3 : 0.5);
        progress = Math.min(100, progress + increment);
        
        progressBar.style.width = progress + '%';
        percentageText.textContent = Math.floor(progress) + '%';
        
        // Change step based on progress
        const stepIndex = Math.floor((progress / 100) * steps.length);
        if (stepIndex !== currentStep && stepIndex < steps.length) {
            currentStep = stepIndex;
            stepInfo.textContent = steps[currentStep];
        }
        
        // Variable timing for realism
        const delay = progress > 95 ? 800 : (Math.random() * 500 + 200);
        setTimeout(updateProgress, delay);
    } else {
        stepInfo.textContent = 'BIOS update complete. System will restart...';
        percentageText.textContent = '100%';
    }
}

// Prevent user from leaving page
window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});

// Start the update
setTimeout(updateProgress, 1000);