        // Gallery Modal Functionality
        document.addEventListener('DOMContentLoaded', function () {
            const galleryItems = document.querySelectorAll('.gallery-item');
            const modal = document.getElementById('galleryModal');
            const modalImage = modal.querySelector('.modal-image');
            const modalCaption = modal.querySelector('.modal-caption');
            const modalClose = modal.querySelector('.modal-close');

            galleryItems.forEach(item => {
                item.addEventListener('click', function () {
                    const imgSrc = this.querySelector('.gallery-image').src;
                    const imgAlt = this.querySelector('.gallery-image').alt;
                    const caption = this.querySelector('.gallery-caption').textContent;

                    modalImage.src = imgSrc;
                    modalImage.alt = imgAlt;
                    modalCaption.textContent = caption;

                    modal.classList.add('active');
                });
            });

            modalClose.addEventListener('click', function () {
                modal.classList.remove('active');
            });

            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Smooth Scrolling for Anchor Links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Form Submission
        const form = document.getElementById('enquiryForm');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();

                // Form validation and submission logic would go here
                alert('Thank you for your enquiry! We will get back to you shortly.');
                form.reset();
            });
        }

        // Testimonial Slider Auto-scroll
        const testimonialSlider = document.querySelector('.testimonial-slider');
        if (testimonialSlider) {
            let scrollPosition = 0;
            const testimonials = document.querySelectorAll('.testimonial');
            const testimonialWidth = testimonials[0].offsetWidth + 32; // Width + gap

            setInterval(() => {
                scrollPosition += testimonialWidth;
                if (scrollPosition >= testimonialSlider.scrollWidth - testimonialSlider.offsetWidth) {
                    scrollPosition = 0;
                }
                testimonialSlider.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                });
            }, 5000);
        }


        // script.js - Main JavaScript file for website functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize language setting
    const languageSelect = document.getElementById('languageSelect');
    let currentLanguage = 'nl'; // Default language is Dutch
    
    // Set up language change event
    languageSelect.addEventListener('change', function() {
        changeLanguage(this.value);
    });
    
    // Apply translations on page load
    applyTranslations(currentLanguage);
    
    // Handle contact form submission
    const contactForm = document.getElementById('enquiryForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendEmailViaClient();
        });
    }
    
    // Gallery functionality - if needed
    initializeGallery();
});

// Function to change language
function changeLanguage(language) {
    if (!translations[language]) {
        console.error('Translation not found for:', language);
        return;
    }
    
    currentLanguage = language;
    applyTranslations(language);
    
    // Update html lang attribute
    document.documentElement.lang = language;
}

// Apply translations to all elements with data-translate attribute
function applyTranslations(language) {
    const elements = document.querySelectorAll('[data-translate]');
    
    elements.forEach(element => {
        const translationKey = element.getAttribute('data-translate');
        
        if (translations[language] && translations[language][translationKey]) {
            // Handle different element types
            if (element.tagName === 'INPUT' && element.getAttribute('type') === 'placeholder') {
                element.placeholder = translations[language][translationKey];
            } else if (element.tagName === 'OPTION') {
                element.textContent = translations[language][translationKey];
            } else {
                element.textContent = translations[language][translationKey];
            }
        }
    });
}

// Function to initialize gallery functionality
function initializeGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const modal = document.getElementById('galleryModal');
    const modalImage = modal.querySelector('.modal-image');
    const modalCaption = modal.querySelector('.modal-caption');
    const closeButton = modal.querySelector('.modal-close');
    
    // Open modal when clicking on gallery items
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            const caption = this.querySelector('.gallery-caption');
            
            modalImage.src = img.src;
            modalImage.alt = img.alt;
            modalCaption.textContent = caption.textContent;
            modal.style.display = 'flex';
        });
    });
    
    // Close modal when clicking close button
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Function to create and open email client with form data
function sendEmailViaClient() {
    // Get all form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const serviceSelect = document.getElementById('service');
    const service = serviceSelect.options[serviceSelect.selectedIndex].text;
    const message = document.getElementById('message').value;
    
    // Get email template translations based on current language
    const currentLang = document.getElementById('languageSelect').value;
    const emailTranslations = translations[currentLang];
    
    // Create email body
    let emailBody = `${emailTranslations['email-body-intro']}\n\n`;
    emailBody += `${emailTranslations['email-body-name']}: ${name}\n`;
    emailBody += `${emailTranslations['email-body-email']}: ${email}\n`;
    emailBody += `${emailTranslations['email-body-phone']}: ${phone}\n`;
    emailBody += `${emailTranslations['email-body-service']}: ${service}\n`;
    emailBody += `${emailTranslations['email-body-message']}:\n${message}\n`;
    emailBody += `${emailTranslations['email-body-outro']}\n${name}`;
    
    // Create mailto link
    const mailtoLink = `mailto:info@precisionlaserworks.com?subject=${encodeURIComponent(emailTranslations['email-subject'])}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.location.href = mailtoLink;
}