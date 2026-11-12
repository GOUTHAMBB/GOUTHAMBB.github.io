/* ==========================================================================
   Goutham B Bhandari — Portfolio Interactions
   ========================================================================== */

(function () {
    'use strict';

    // --- 1. Theme Persistence & Toggle ---
    const root = document.documentElement;
    const themeBtn = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('icon-sun');
    const moonIcon = document.getElementById('icon-moon');

    function applyTheme(theme) {
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
        } else {
            root.removeAttribute('data-theme');
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
        }
    }

    const savedTheme = localStorage.getItem('gbb-theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('light'); // Default to Architectural Ivory for signature editorial look
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = root.getAttribute('data-theme') === 'dark';
            const nextTheme = isDark ? 'light' : 'dark';
            applyTheme(nextTheme);
            localStorage.setItem('gbb-theme', nextTheme);
        });
    }

    // --- 2. Scroll Progress & Active Section Highlighting ---
    const progressBar = document.getElementById('scroll-progress');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = document.querySelectorAll('main section[id]');
    let rafId = null;

    function updateScrollUI() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;

        if (progressBar) {
            progressBar.style.transform = `scaleX(${progress})`;
        }

        let currentId = '';
        sections.forEach((sec) => {
            const top = sec.offsetTop - 140;
            if (scrollTop >= top) {
                currentId = sec.getAttribute('id');
            }
        });

        navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${currentId}`);
        });
    }

    window.addEventListener('scroll', () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updateScrollUI);
    }, { passive: true });
    updateScrollUI();

    // --- 3. Reveal on Scroll ---
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
        );
        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('visible'));
    }

    // --- 4. Mobile Navigation Drawer ---
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');

    function closeMobileDrawer() {
        if (!mobileDrawer || !menuBtn) return;
        mobileDrawer.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
    }

    if (menuBtn && mobileDrawer) {
        menuBtn.addEventListener('click', () => {
            const isOpen = mobileDrawer.classList.toggle('open');
            menuBtn.setAttribute('aria-expanded', String(isOpen));
        });

        mobileDrawer.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', closeMobileDrawer);
        });
    }

    // --- 5. Project Domain Filters ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            projectCards.forEach((card) => {
                const category = card.getAttribute('data-category');
                const match = filter === 'all' || category === filter;
                card.classList.toggle('hidden-card', !match);
            });
        });
    });

    // --- 6. Certificate & Media Lightbox Modal ---
    const modal = document.getElementById('doc-modal');
    const modalTitle = document.getElementById('doc-modal-title');
    const modalBody = document.getElementById('doc-modal-body');
    const modalExternal = document.getElementById('doc-modal-external');
    const modalClose = document.getElementById('doc-modal-close');

    function openDocModal(src, title) {
        if (!modal || !modalBody || !modalTitle || !modalExternal) return;

        modalTitle.textContent = title || 'Document Preview';
        modalExternal.href = src;
        modalBody.innerHTML = '';

        const lower = src.toLowerCase();
        if (lower.endsWith('.pdf')) {
            const iframe = document.createElement('iframe');
            iframe.src = src;
            iframe.title = title || 'PDF Certificate Preview';
            modalBody.appendChild(iframe);
        } else {
            const img = document.createElement('img');
            img.src = src;
            img.alt = title || 'Certificate Image';
            modalBody.appendChild(img);
        }

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeDocModal() {
        if (!modal || !modalBody) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        modalBody.innerHTML = '';
        document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-doc-src]').forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const src = trigger.getAttribute('data-doc-src');
            const title = trigger.getAttribute('data-doc-title');
            if (src) openDocModal(src, title);
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', closeDocModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeDocModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDocModal();
            closeMobileDrawer();
        }
    });

    // --- 7. Copy Email Utility ---
    const copyEmailBtn = document.getElementById('copy-email-btn');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const email = 'gouthambb999@gmail.com';
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(email).then(() => {
                    const orig = copyEmailBtn.textContent;
                    copyEmailBtn.textContent = 'Copied';
                    setTimeout(() => {
                        copyEmailBtn.textContent = orig;
                    }, 2000);
                });
            }
        });
    }

    // --- 8. Contact Form (Google Apps Script Integration) ---
    const form = document.getElementById('feedback-form');
    const formStatus = document.getElementById('form-message');
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx_hcTnNfhDhzJevol_ZvuSEHLSE39nTVg0fQ5JWZmgG-pJeze8T41JHysOxyvDrlcG/exec';

    if (form && formStatus) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalLabel = submitBtn.textContent;

            submitBtn.textContent = 'Sending Message...';
            submitBtn.disabled = true;
            formStatus.textContent = '';
            formStatus.className = 'form-status';

            const payload = {
                name: document.getElementById('name').value.trim(),
                company: document.getElementById('company').value.trim(),
                email: document.getElementById('email').value.trim(),
                message: document.getElementById('message').value.trim(),
            };

            fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
                .then(() => {
                    formStatus.textContent = 'Thank you. Your message has been received.';
                    formStatus.classList.add('form-status--success');
                    submitBtn.textContent = 'Message Sent';
                    form.reset();

                    setTimeout(() => {
                        submitBtn.textContent = originalLabel;
                        submitBtn.disabled = false;
                        formStatus.textContent = '';
                        formStatus.className = 'form-status';
                    }, 5000);
                })
                .catch((err) => {
                    console.error('Submission error:', err);
                    formStatus.textContent = 'Unable to send right now. Please reach out via email or LinkedIn.';
                    formStatus.classList.add('form-status--error');
                    submitBtn.textContent = originalLabel;
                    submitBtn.disabled = false;
                });
        });
    }
})();
