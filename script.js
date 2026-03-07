// Burger menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.getElementById('burgerMenu');
    const dropdownMenu = document.getElementById('dropdownMenu');

    // Toggle menu on burger click
    burgerMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        burgerMenu.classList.toggle('active');
        dropdownMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdownMenu.contains(e.target) && !burgerMenu.contains(e.target)) {
            burgerMenu.classList.remove('active');
            dropdownMenu.classList.remove('active');
        }
    });

    // Close menu when clicking on a link (except disabled ones)
    const menuLinks = dropdownMenu.querySelectorAll('a:not(.disabled)');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            burgerMenu.classList.remove('active');
            dropdownMenu.classList.remove('active');
        });
    });

    // Prevent disabled links from doing anything
    const disabledLinks = dropdownMenu.querySelectorAll('a.disabled');
    disabledLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
        });
    });
});
