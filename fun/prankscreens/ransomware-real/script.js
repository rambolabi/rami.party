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

// Countdown timer
let timeLeft = {
    days: 2,
    hours: 23,
    minutes: 45,
    seconds: 32
};

function updateCountdown() {
    // Decrease seconds
    timeLeft.seconds--;
    
    if (timeLeft.seconds < 0) {
        timeLeft.seconds = 59;
        timeLeft.minutes--;
    }
    
    if (timeLeft.minutes < 0) {
        timeLeft.minutes = 59;
        timeLeft.hours--;
    }
    
    if (timeLeft.hours < 0) {
        timeLeft.hours = 23;
        timeLeft.days--;
    }
    
    if (timeLeft.days < 0) {
        // Reset to prevent negative values
        timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    // Update display
    document.getElementById('days').textContent = String(timeLeft.days).padStart(2, '0');
    document.getElementById('hours').textContent = String(timeLeft.hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(timeLeft.minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(timeLeft.seconds).padStart(2, '0');
}

// Update countdown every second
setInterval(updateCountdown, 1000);
