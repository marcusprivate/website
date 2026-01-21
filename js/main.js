/**
 * Irisabella Healing Praktijk - Main JavaScript
 * 
 * Modules:
 * - Mobile Menu
 * - Image Slideshow
 * - Testimonials Carousel
 * - Smart Navbar
 */

// ==========================================================================
// Constants
// ==========================================================================
const SLIDESHOW_INTERVAL_MS = 10000;
const TESTIMONIAL_INTERVAL_MS = 10000;
const SWIPE_THRESHOLD_PX = 50;
const NAVBAR_HIDE_THRESHOLD_PX = 75;
const DEBOUNCE_DELAY_MS = 150;
const THROTTLE_DELAY_MS = 100;

// ==========================================================================
// Utility Functions
// ==========================================================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    let lastArgs;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
                // Execute with last args if there were calls during throttle
                if (lastArgs) {
                    func(...lastArgs);
                    lastArgs = null;
                }
            }, limit);
        } else {
            // Store the latest arguments to execute after throttle
            lastArgs = args;
        }
    };
}

document.addEventListener("DOMContentLoaded", async function() {
    // ==========================================================================
    // Testimonials Loading
    // ==========================================================================
    let testimonials = [];
    try {
        const response = await fetch('data/testimonials.yaml');
        const yamlText = await response.text();
        testimonials = jsyaml.load(yamlText);
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }

    // ==========================================================================
    // Mobile Menu
    // ==========================================================================
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.desktop-menu');

    if (menuToggle && navMenu) {
        const toggleMenu = () => {
            const isOpen = navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isOpen);
        };

        menuToggle.addEventListener('click', toggleMenu);
        
        // Keyboard support for menu toggle
        menuToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

        // Close mobile menu when a link is clicked
        const navLinks = document.querySelectorAll('.desktop-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ==========================================================================
    // Image Slideshow
    // ==========================================================================
    let slideIndex = 0;
    const slides = document.getElementsByClassName("slides");

    function showSlides() {
        if (slides.length === 0) return;
        
        for (let i = 0; i < slides.length; i++) {
            slides[i].classList.remove("active");
        }
        slideIndex++;
        if (slideIndex > slides.length) {
            slideIndex = 1;
        }
        slides[slideIndex - 1].classList.add("active");
        setTimeout(showSlides, SLIDESHOW_INTERVAL_MS); 
    }

    if (slides.length > 0) {
        showSlides();
    }

    // ==========================================================================
    // Testimonials Carousel
    // ==========================================================================
    let currentTestimonialIndex = 0;
    let testimonialInterval;

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function renderTestimonials() {
        const wrapper = document.querySelector('.testimonial-wrapper');
        wrapper.innerHTML = '';

        testimonials.forEach((testimonialData, index) => {
            const testimonialDiv = document.createElement('div');
            testimonialDiv.classList.add('testimonial');
            if (index === 0) testimonialDiv.classList.add('active');

            // Split multiline text by double newlines into paragraphs
            const paragraphs = testimonialData.tekst.trim().split(/\n\n+/);
            paragraphs.forEach(paragraph => {
                const p = document.createElement('p');
                p.textContent = paragraph;
                testimonialDiv.appendChild(p);
            });

            const h3 = document.createElement('h3');
            h3.textContent = `- ${testimonialData.naam}`;
            testimonialDiv.appendChild(h3);

            wrapper.appendChild(testimonialDiv);
        });
    }

    function setWrapperHeight() {
        const wrapper = document.querySelector('.testimonial-wrapper');
        const testimonialElements = document.querySelectorAll('.testimonial-wrapper .testimonial');
        let maxHeight = 0;

        // 1. Prepare elements for measurement
        testimonialElements.forEach(testimonial => {
            if (!testimonial.classList.contains('active')) {
                testimonial.style.position = 'absolute';
                testimonial.style.visibility = 'hidden';
                testimonial.style.display = 'block';
                testimonial.style.width = '100%'; 
                testimonial.style.boxSizing = 'border-box';
            }
        });

        // 2. Measure heights
        testimonialElements.forEach(testimonial => {
            if (testimonial.offsetHeight > maxHeight) {
                maxHeight = testimonial.offsetHeight;
            }
        });

        // 3. Reset styles
        testimonialElements.forEach(testimonial => {
            if (!testimonial.classList.contains('active')) {
                testimonial.style.position = '';
                testimonial.style.visibility = '';
                testimonial.style.display = '';
                testimonial.style.width = '';
                testimonial.style.boxSizing = '';
            }
        });

        // Set the wrapper's min-height
        if (wrapper) {
            wrapper.style.minHeight = `${maxHeight}px`;
        }
    }

    function showTestimonial(direction) {
        const testimonialElements = document.querySelectorAll('.testimonial-wrapper .testimonial');
        if (testimonialElements.length === 0) return;
        
        testimonialElements[currentTestimonialIndex].classList.remove('active');
        currentTestimonialIndex = (currentTestimonialIndex + direction + testimonialElements.length) % testimonialElements.length;
        testimonialElements[currentTestimonialIndex].classList.add('active');
        
        resetTestimonialInterval();
    }

    function startTestimonialInterval() {
        testimonialInterval = setInterval(function() {
            showTestimonial(1);
        }, TESTIMONIAL_INTERVAL_MS);
    }

    function resetTestimonialInterval() {
        clearInterval(testimonialInterval);
        startTestimonialInterval();
    }

    // Initialize testimonials if loaded
    if (testimonials.length > 0) {
        shuffleArray(testimonials);
        renderTestimonials();
        setWrapperHeight();
        startTestimonialInterval();
    }

    // Set height on window resize (debounced)
    window.addEventListener('resize', debounce(setWrapperHeight, DEBOUNCE_DELAY_MS));

    // Testimonial controls
    const nextBtn = document.getElementById('next-testimonial');
    const prevBtn = document.getElementById('prev-testimonial');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            showTestimonial(1);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            showTestimonial(-1);
        });
    }

    // Swipe support for mobile devices
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const testimonialWrapper = document.querySelector('.testimonial-wrapper');
    
    if (testimonialWrapper) {
        testimonialWrapper.addEventListener('touchstart', function(event) {
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        }, false);

        testimonialWrapper.addEventListener('touchend', function(event) {
            endX = event.changedTouches[0].clientX;
            endY = event.changedTouches[0].clientY;
            handleGesture();
        }, false);
    }

    function handleGesture() {
        const xDiff = startX - endX;
        const yDiff = startY - endY;

        // Check if horizontal swipe is dominant
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (Math.abs(xDiff) > SWIPE_THRESHOLD_PX) {
                if (xDiff > 0) {
                    showTestimonial(1); // Swiped left
                } else {
                    showTestimonial(-1); // Swiped right
                }
            }
        }
    }

    // ==========================================================================
    // Smart Navbar
    // ==========================================================================
    let lastScrollTop = 0;
    const nav = document.querySelector('nav');

    const handleScroll = throttle(function() {
        // Don't hide if mobile menu is open
        if (navMenu && navMenu.classList.contains('active')) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Always show navbar when at or near top of page
        if (scrollTop <= NAVBAR_HIDE_THRESHOLD_PX) {
            nav.classList.remove('nav-hidden');
        } else if (scrollTop > lastScrollTop) {
            // Scrolling down past threshold
            nav.classList.add('nav-hidden');
        } else if (scrollTop < lastScrollTop) {
            // Scrolling up
            nav.classList.remove('nav-hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, THROTTLE_DELAY_MS);

    if (nav) {
        window.addEventListener('scroll', handleScroll);
    }
});
