// Add hover effects and animations
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.option-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            this.querySelector('h2').style.color = 'white';
            this.querySelector('p').style.color = 'rgba(255, 255, 255, 0.9)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.background = 'white';
            this.querySelector('h2').style.color = '#667eea';
            this.querySelector('p').style.color = '#666';
        });
    });
});
