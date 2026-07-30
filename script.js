document.addEventListener('DOMContentLoaded', () => {
    // 1. LOADING SCREEN
    const loaderScreen = document.querySelector('.loader-screen');
    const loaderCounter = document.querySelector('.loader-counter');
    
    if (loaderScreen && loaderCounter) {
        document.body.style.overflow = 'hidden';
        let count = 0;
        const interval = setInterval(() => {
            count++;
            loaderCounter.textContent = count.toString().padStart(3, '0');
            
            if (count >= 100) {
                clearInterval(interval);
                loaderScreen.classList.add('loader-hidden');
                
                setTimeout(() => {
                    loaderScreen.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    
                    // Trigger hero scramble after load
                    const heroTitle = document.querySelector('.hero .scramble-text');
                    if (heroTitle) {
                        const scramble = new TextScramble(heroTitle);
                        scramble.setText(heroTitle.textContent);
                    }
                }, 500);
            }
        }, 20);
    }

    // 2. CUSTOM CURSOR
    const cursor = document.querySelector('.cursor-dot');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (cursor && !isTouchDevice) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;
        
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const renderCursor = () => {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
            requestAnimationFrame(renderCursor);
        };
        requestAnimationFrame(renderCursor);

        const interactiveElements = document.querySelectorAll('a, button, input, textarea, .portfolio-item, .menu-toggle');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('active'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
        });
    } else if (cursor) {
        cursor.style.display = 'none';
    }

    // 3. NAVBAR SCROLL BEHAVIOR
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // 4. MOBILE MENU
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // 5. SMOOTH SCROLL
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // 6. SCROLL REVEAL ANIMATIONS
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // 7. TEXT SCRAMBLE EFFECT
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise(resolve => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        update() {
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span class="dud">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }

    const scrambleElements = document.querySelectorAll('.scramble-text:not(.hero .scramble-text)');
    const scrambleObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const scramble = new TextScramble(entry.target);
                scramble.setText(entry.target.textContent);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    scrambleElements.forEach(el => scrambleObserver.observe(el));

    // 8. COUNTER ANIMATION
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const easeOutExpo = (t) => {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const statObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target') || 0, 10);
                const duration = 2000;
                let startTimestamp = null;
                
                const step = (timestamp) => {
                    if (!startTimestamp) startTimestamp = timestamp;
                    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                    const easedProgress = easeOutExpo(progress);
                    const currentCount = Math.floor(easedProgress * target);
                    
                    entry.target.textContent = currentCount;
                    
                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        entry.target.textContent = target + '+';
                    }
                };
                window.requestAnimationFrame(step);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => statObserver.observe(el));

    // 9. GLITCH EFFECT TRIGGER
    document.querySelectorAll('.glitch').forEach(el => {
        el.setAttribute('data-text', el.textContent);
    });

    // 10. LIGHTBOX / FULLSCREEN PORTFOLIO VIEWER
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxCategory = document.getElementById('lightbox-category');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    let currentLightboxIndex = 0;

    function openLightbox(index) {
        currentLightboxIndex = index;
        const item = portfolioItems[index];
        const img = item.querySelector('img');
        const title = item.querySelector('.portfolio-title');
        const category = item.querySelector('.portfolio-category');

        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxTitle.textContent = title ? title.textContent : '';
        lightboxCategory.textContent = category ? category.textContent : '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function navigateLightbox(direction) {
        currentLightboxIndex = (currentLightboxIndex + direction + portfolioItems.length) % portfolioItems.length;
        openLightbox(currentLightboxIndex);
    }

    portfolioItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
    if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    // 11. FORM HANDLING
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            
            const inputs = contactForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.classList.remove('error');
                if (!input.value.trim()) {
                    input.classList.add('error');
                    isValid = false;
                } else if (input.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        input.classList.add('error');
                        isValid = false;
                    }
                }
            });

            if (isValid) {
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'MENSAGEM ENVIADA';
                submitBtn.style.backgroundColor = '#4CAF50';
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                    contactForm.reset();
                }, 3000);
            }
        });
        
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
            });
        });
    }

    // 12. MARQUEE PAUSE ON HOVER
    document.querySelectorAll('.marquee-section').forEach(section => {
        const track = section.querySelector('.marquee-track');
        if (track) {
            section.addEventListener('mouseenter', () => {
                track.style.animationPlayState = 'paused';
            });
            section.addEventListener('mouseleave', () => {
                track.style.animationPlayState = 'running';
            });
        }
    });

    // 13. PARALLAX SUBTLE EFFECT
    const heroContent = document.querySelector('.hero-content');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (heroContent && !prefersReducedMotion) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
            
            let opacity = 1 - (scrollY / 700);
            if (opacity < 0) opacity = 0;
            heroContent.style.opacity = opacity;
        }, { passive: true });
    }

    // 14. KEYBOARD NAVIGATION
    // Global support for basic focus-visible styles through standard CSS
    // The script handles basic tab interaction inherently via browser focus management
});
