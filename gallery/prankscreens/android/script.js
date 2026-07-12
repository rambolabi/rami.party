let progress = 0;
let isAtNinetyNine = false;
const totalTime = 10 * 60 * 1000; // 10 minutes in milliseconds
const updateInterval = 100; // Update every 100ms
const maxProgress = 99;

// Calculate increment per update to reach 99% in 10 minutes
const totalUpdates = totalTime / updateInterval;
const increment = maxProgress / totalUpdates;

function updateProgress() {
    if (!isAtNinetyNine) {
        progress += increment;
        
        if (progress >= maxProgress) {
            progress = maxProgress;
            isAtNinetyNine = true;
        }
    }
    
    // Update UI
    const progressFill = document.getElementById('progressFill');
    const progressPercentage = document.getElementById('progressPercentage');
    
    progressFill.style.width = progress + '%';
    progressPercentage.textContent = Math.floor(progress) + '%';
}

function enterFullscreen() {
    const elem = document.documentElement;
    
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { // Safari
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE11
        elem.msRequestFullscreen();
    }
}

function disableInteractions() {
    // Hide cursor
    document.body.style.cursor = 'none';
    
    // Disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable selection
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
}

// Click anywhere to start
document.body.addEventListener('click', function(e) {
    enterFullscreen();
    disableInteractions();
    
    // Start progress update
    setInterval(updateProgress, updateInterval);
}, { once: true }); // Only trigger once

// Prevent escape key from exiting fullscreen (doesn't always work due to browser restrictions)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        return false;
    }
});

// Disable common keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Prevent F11 (fullscreen toggle)
    if (e.key === 'F11') {
        e.preventDefault();
        return false;
    }
    
    // Prevent Ctrl+W (close tab)
    if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        return false;
    }
    
    // Prevent Alt+F4 (close window) - doesn't always work
    if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        return false;
    }
});
