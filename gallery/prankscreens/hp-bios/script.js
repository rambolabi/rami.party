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
const progressBar = document.getElementById('progressBar');
const percentage = document.getElementById('percentage');
const statusText = document.getElementById('statusText');

const steps = [
    { element: document.getElementById('step1'), text: 'Verifying current BIOS...', range: [0, 15] },
    { element: document.getElementById('step2'), text: 'Flashing BIOS ROM...', range: [15, 75] },
    { element: document.getElementById('step3'), text: 'Verifying new BIOS...', range: [75, 95] },
    { element: document.getElementById('step4'), text: 'Update complete!', range: [95, 100] }
];

let currentStepIndex = 0;

function updateProgress() {
    if (progress < 100) {
        // Variable increment based on current step
        let increment;
        if (progress < 15) {
            increment = Math.random() * 2 + 0.5; // Fast verification
        } else if (progress < 75) {
            increment = Math.random() * 0.8 + 0.2; // Slow flashing
        } else if (progress < 95) {
            increment = Math.random() * 1.5 + 0.5; // Medium verification
        } else {
            increment = Math.random() * 0.3 + 0.1; // Very slow at end
        }
        
        progress = Math.min(100, progress + increment);
        
        progressBar.style.width = progress + '%';
        percentage.textContent = Math.floor(progress) + '%';
        
        // Update step indicator
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            if (progress >= step.range[0] && progress < step.range[1]) {
                if (currentStepIndex !== i) {
                    // Mark previous steps as completed
                    for (let j = 0; j < i; j++) {
                        steps[j].element.classList.remove('active');
                        steps[j].element.classList.add('completed');
                    }
                    // Mark current step as active
                    step.element.classList.add('active');
                    step.element.classList.remove('completed');
                    // Remove active from future steps
                    for (let j = i + 1; j < steps.length; j++) {
                        steps[j].element.classList.remove('active', 'completed');
                    }
                    
                    currentStepIndex = i;
                    statusText.textContent = step.text;
                }
                break;
            }
        }
        
        // Variable timing based on stage
        let delay;
        if (progress < 15) {
            delay = 200;
        } else if (progress < 75) {
            delay = Math.random() * 600 + 400; // Slow during flash
        } else if (progress < 95) {
            delay = 300;
        } else {
            delay = 1000; // Very slow near completion
        }
        
        setTimeout(updateProgress, delay);
    } else {
        // Mark all steps as completed
        steps.forEach(step => {
            step.element.classList.remove('active');
            step.element.classList.add('completed');
        });
        
        percentage.textContent = '100%';
        statusText.textContent = 'BIOS update successful. System will restart in 5 seconds...';
        
        // Countdown
        let countdown = 5;
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                statusText.textContent = `BIOS update successful. System will restart in ${countdown} seconds...`;
            } else {
                statusText.textContent = 'Restarting system...';
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

// Start the update after initial delay
setTimeout(() => {
    steps[0].element.classList.add('active');
    updateProgress();
}, 1000);