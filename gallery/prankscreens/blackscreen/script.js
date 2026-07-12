// Enter fullscreen on click
document.addEventListener('click', function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen failed');
        });
    }
});

// Animate percentage counter
let percent = 0;
const percentElement = document.getElementById('percent');
const stopCodeElement = document.getElementById('stopcode');
const startTime = Date.now();

function updatePercentage() {
    if (percent < 900) {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        let increment, delay;

        // First 10 seconds: reach 10%
        if (elapsedSeconds < 10) {
            increment = Math.random() * 0.3 + 0.1; // Small random increment
            delay = Math.floor(Math.random() * 200) + 100; // Fast updates
        } else {
            // After 10 seconds: much slower progression
            // The higher the percentage, the slower it goes
            // Designed to take at least 5 minutes to reach 50%

            // Exponential slowdown factor - increases rapidly with percentage
            const slowdownFactor = Math.pow(percent / 900, 2.5);

            // Very small base increment
            const baseIncrement = Math.random() * 0.15 + 0.05;
            increment = baseIncrement * (1 - slowdownFactor * 0.95);

            // Much longer delays that increase with percentage
            const baseDelay = 800;
            const percentFactor = Math.pow(percent / 100, 1.3);
            delay = baseDelay + Math.floor(Math.random() * 1000) + (percentFactor * 1000);
        }

        percent = Math.min(900, percent + increment);
        percentElement.textContent = Math.floor(percent);

        // Change stop code at 50%
        if (percent >= 50 && stopCodeElement && stopCodeElement.textContent !== 'CRITICAL_YOU_SHOULD_LOCK_YOUR_DEVICE') {
            stopCodeElement.textContent = 'CRITICAL_YOU_SHOULD_LOCK_YOUR_DEVICE';
        }

        setTimeout(updatePercentage, delay);
    }
}

// Start the counter after a short delay
setTimeout(() => {
    updatePercentage();
}, 1000);

// Prevent context menu
document.addEventListener('contextmenu', e => e.preventDefault());

// Hide cursor
document.body.style.cursor = 'none';
