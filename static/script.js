// -----------------------------------------------------------
// 1. Preloader Logic
// -----------------------------------------------------------
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        setTimeout(() => {
            preloader.remove();
        }, 500); // Wait for transition to finish
    }
});

// -----------------------------------------------------------
// 2. Mobile Navbar Toggle
// -----------------------------------------------------------
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const lines = hamburger.querySelectorAll('div');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Animate hamburger to X
    if (navLinks.classList.contains('active')) {
        lines[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
        hamburger.setAttribute('aria-expanded', 'true');
    } else {
        lines[0].style.transform = 'none';
        lines[1].style.opacity = '1';
        lines[2].style.transform = 'none';
        hamburger.setAttribute('aria-expanded', 'false');
    }
});

// Accessibility for hamburger (keyboard interaction)
hamburger.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hamburger.click();
    }
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        lines[0].style.transform = 'none';
        lines[1].style.opacity = '1';
        lines[2].style.transform = 'none';
    });
});

// -----------------------------------------------------------
// 2. Navbar Scroll Style
// -----------------------------------------------------------
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// -----------------------------------------------------------
// 3. Cinematic Hero Parallax & Mouse Movement Effects
// -----------------------------------------------------------
const heroLayers = document.querySelectorAll('.hero-layer');
const heroSection = document.getElementById('home');

// Scroll Parallax (Optimized with requestAnimationFrame)
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            if (scrolled < window.innerHeight) {
                heroLayers.forEach(layer => {
                    const speed = layer.getAttribute('data-speed');
                    const yPos = -(scrolled * speed);
                    layer.style.transform = `translateY(${yPos}px)`;
                });
            }
            ticking = false;
        });
        ticking = true;
    }
});

// Mouse Move Parallax (Cinematic Floating Interaction) - Throttled
let mouseTicking = false;
heroSection.addEventListener('mousemove', (e) => {
    if (!mouseTicking) {
        window.requestAnimationFrame(() => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
            
            heroLayers.forEach(layer => {
                const speed = layer.getAttribute('data-speed');
                layer.style.transform = `translate(${xAxis * speed}px, ${yAxis * speed}px)`;
            });
            mouseTicking = false;
        });
        mouseTicking = true;
    }
});
// Reset on mouse leave
heroSection.addEventListener('mouseleave', () => {
    heroLayers.forEach(layer => {
        layer.style.transform = `translate(0px, 0px)`;
    });
});

// -----------------------------------------------------------
// 4. Scroll Reveal Animations (Intersection Observer)
// -----------------------------------------------------------
const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
});

// -----------------------------------------------------------
// 5. Battery Tech Counters Animation
// -----------------------------------------------------------
let countersStarted = false;
const counters = document.querySelectorAll('.counter');
const batterySection = document.getElementById('technology');

window.addEventListener('scroll', () => {
    const sectionPos = batterySection.getBoundingClientRect().top;
    const screenPos = window.innerHeight;

    if (sectionPos < screenPos - 100 && !countersStarted) {
        countersStarted = true;
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const speed = 100; // lower = faster
            const inc = target / speed;
            let count = 0;
            
            const updateCount = () => {
                count += inc;
                if (count < target) {
                    if (target % 1 !== 0) {
                        counter.innerText = count.toFixed(1); // For decimals like 3.5
                    } else {
                        counter.innerText = Math.ceil(count);
                    }
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    }
});

// -----------------------------------------------------------
// -----------------------------------------------------------
// 6. Contact Form API Integration
// -----------------------------------------------------------
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const originalText = btn.innerText;
        
        btn.innerText = 'SENDING...';
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';
        
        const inputs = contactForm.querySelectorAll('input, textarea');
        const data = {
            name: inputs[0].value,
            phone: inputs[1].value,
            email: inputs[2].value,
            message: inputs[3].value
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                showToast(
    'Enquiry Submitted',
    'Our team will contact you shortly.'
);
                contactForm.reset();
            } else {
                alert('There was an error submitting your form. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('A network error occurred. Please try again later.');
        } finally {
            btn.innerText = originalText;
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        }
    });
}

// -----------------------------------------------------------
// 7. Booking Modal & API Integration
// -----------------------------------------------------------
const bookingModal = document.getElementById('bookingModal');
const closeBtn = document.querySelector('.close-btn');
const bookingButtons = document.querySelectorAll('a[href="#contact"].btn-primary'); // Assuming these are the booking buttons

// State for active vehicle/color
let activeVehicle = '';
let activeColor = '';

// Helper to determine vehicle details when a booking button is clicked
bookingButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // If it's the specific booking button inside vehicle cards
        if(btn.innerText.toLowerCase().includes('booking')) {
            e.preventDefault();
            const card = btn.closest('.vehicle-card');
            activeVehicle = card.querySelector('.v-title').innerText;
            
            // Determine active color if ESMART configurator is present
            const activeColorBtn = card.querySelector('.color-circle.active');
            activeColor = activeColorBtn ? activeColorBtn.getAttribute('title') : 'Default';
            
            document.getElementById('modalVehicleName').innerText = activeVehicle;
            document.getElementById('modalColorName').innerText = activeColor;
            document.getElementById('bookVehicle').value = activeVehicle;
            document.getElementById('bookColor').value = activeColor;
            
            bookingModal.style.display = 'block';
        }
    });
});

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        bookingModal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
        bookingModal.style.display = 'none';
    }
});

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = bookingForm.querySelector('button');
        const originalText = btn.innerText;
        
        btn.innerText = 'PROCESSING...';
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';
        
        const data = {
            name: document.getElementById('bookName').value,
            phone: document.getElementById('bookPhone').value,
            email: document.getElementById('bookEmail').value,
            vehicle: document.getElementById('bookVehicle').value,
            color: document.getElementById('bookColor').value,
            message: document.getElementById('bookMessage').value
        };

        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                // WhatsApp Redirect logic
                const waNumber = "917012168550";
                const waMessage = `Hello Muralidhar Enterprises! I would like to book the ${data.vehicle} (${data.color}).\nName: ${data.name}\nPhone: ${data.phone}\nMessage: ${data.message}`;
                const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
                
showToast(
    'Booking Submitted',
    'Redirecting to WhatsApp...'
);                bookingForm.reset();
                bookingModal.style.display = 'none';
                window.open(waUrl, '_blank');
            } else {
                alert('There was an error processing your booking. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('A network error occurred. Please try again later.');
        } finally {
            btn.innerText = originalText;
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        }
    });
}
// -----------------------------------------------------------
// 8. ESMART Color Selector
// -----------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

    const esmartImage = document.getElementById('esmart-img');
    const colorButtons = document.querySelectorAll('.color-circle');

    colorButtons.forEach(button => {

        button.addEventListener('click', () => {

            const newImage = button.getAttribute('data-image');

            if (newImage) {

                esmartImage.style.opacity = '0';

                setTimeout(() => {
                    esmartImage.src = newImage;
                    esmartImage.style.opacity = '1';
                }, 200);
            }

            colorButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            button.classList.add('active');
        });

    });

});
function showToast(title,message){

    const toast=document.getElementById('toast');

    toast.querySelector('h4').innerText=title;
    toast.querySelector('p').innerText=message;

    toast.classList.add('show');

    setTimeout(()=>{
        toast.classList.remove('show');
    },4000);
}