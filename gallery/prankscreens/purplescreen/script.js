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

// Simulate scrolling text appearing
const panicOutput = document.getElementById('panic-output');
const originalText = panicOutput.textContent;
panicOutput.textContent = '';

let charIndex = 0;

function typeText() {
    if (charIndex < originalText.length) {
        panicOutput.textContent += originalText[charIndex];
        charIndex++;
        
        // Slower delay to simulate system output
        const delay = Math.random() < 0.8 ? 30 : Math.random() * 150;
        setTimeout(typeText, delay);
        
        // Auto-scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);
    } else {
        // Typing complete, show loading bar
        setTimeout(showLoadingBar, 1000);
    }
}

function showLoadingBar() {
    // Create loading bar container
    const loadingContainer = document.createElement('div');
    loadingContainer.id = 'loading-container';
    loadingContainer.innerHTML = `
        <div class="loading-bar-wrapper">
            <div class="loading-bar">
                <div class="loading-bar-fill" id="loading-bar-fill"></div>
            </div>
        </div>
        <div class="error-message" id="error-message"></div>
    `;
    document.querySelector('.kernel-panic').appendChild(loadingContainer);
    
    // Auto-scroll to bottom
    window.scrollTo(0, document.body.scrollHeight);
    
    // Animate loading bar over 10 minutes (600,000 ms)
    const loadingBarFill = document.getElementById('loading-bar-fill');
    const startTime = Date.now();
    const duration = 600000; // 10 minutes
    
    function updateLoadingBar() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        loadingBarFill.style.width = progress + '%';
        
        // Show error message after 5 minutes
        if (elapsed >= 300000 && !document.getElementById('error-message').textContent) {
            document.getElementById('error-message').textContent = 'Kernel panic - device was not locked - Fatal exception.';
            window.scrollTo(0, document.body.scrollHeight);
        }
        
        if (progress < 100) {
            requestAnimationFrame(updateLoadingBar);
        }
    }
    
    requestAnimationFrame(updateLoadingBar);
}

// Start typing effect after a short delay
setTimeout(typeText, 500);
