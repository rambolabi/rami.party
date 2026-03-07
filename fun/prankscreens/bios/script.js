// Fullscreen and ESC handling
let escHeld = false;
let escStartTime = 0;
const ESC_HOLD_DURATION = 2000; // 2 seconds to hold ESC to exit

// Enter fullscreen on click
document.addEventListener('click', function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen({
            navigationUI: "hide"
        }).catch(err => {
            console.log('Fullscreen failed');
        });
    }
});

// Prevent context menu
document.addEventListener('contextmenu', e => e.preventDefault());

// Track ESC key state
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !escHeld) {
        escHeld = true;
        escStartTime = Date.now();
    }
});

document.addEventListener('keyup', function(e) {
    if (e.key === 'Escape') {
        escHeld = false;
        escStartTime = 0;
    }
});

// Re-enter fullscreen when it's exited (unless ESC held long enough)
document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement) {
        const heldDuration = escHeld ? Date.now() - escStartTime : 0;
        
        if (heldDuration < ESC_HOLD_DURATION) {
            // ESC wasn't held long enough, re-enter fullscreen
            // Small delay to ensure we're within the user gesture window
            setTimeout(function() {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen({
                        navigationUI: "hide"
                    }).catch(() => {});
                }
            }, 100);
        }
    }
});

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

const teasingMessages = [
    'Almost there...',
    'One more percent...',
    'Should lock your pc...',
    'Just kidding, still at 99%...',
    'Any second now...',
    'This might take a while...',
    'Don\'t turn off your computer...',
    'Still processing...',
    'Patience is a virtue...',
    'Not quite done yet...'
];

let currentStep = 0;
let teasingIndex = 0;

function updateProgress() {
    if (progress < 99) {
        // Randomly increase progress (slower near end)
        const increment = Math.random() * (progress < 90 ? 3 : 0.5);
        progress = Math.min(99, progress + increment);
        
        progressBar.style.width = progress + '%';
        percentageText.textContent = Math.floor(progress) + '%';
        
        // Change step based on progress
        const stepIndex = Math.floor((progress / 99) * steps.length);
        if (stepIndex !== currentStep && stepIndex < steps.length) {
            currentStep = stepIndex;
            stepInfo.textContent = steps[currentStep];
        }
        
        // Variable timing for realism
        const delay = progress > 95 ? 800 : (Math.random() * 500 + 200);
        setTimeout(updateProgress, delay);
    } else {
        // Stuck at 99% - show teasing messages
        percentageText.textContent = '99%';
        progressBar.style.width = '99%';
        stepInfo.textContent = teasingMessages[teasingIndex];
        teasingIndex = (teasingIndex + 1) % teasingMessages.length;
        
        // Keep cycling through messages
        setTimeout(updateProgress, 2000);
    }
}

// Prevent user from leaving page
window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});

// Start the update
setTimeout(updateProgress, 1000);