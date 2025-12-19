import CircularGallery from "./animation/galerry.js";

document.addEventListener("DOMContentLoaded", () => {
    // Set active navigation state based on current hash or scroll position
    const setActiveNav = () => {
        const hash = window.location.hash || '#top';
        const navLinks = document.querySelectorAll('.nav-links a[data-page]');

        // Map hashes to data-page values
        const hashMap = {
            '#top': 'accueil',
            '': 'accueil',
            '#featured': 'boutique',
            '#story': 'notre-histoire',
            '#journal': 'journal',
            '#events': 'evenements'
        };

        const activePage = hashMap[hash] || 'accueil';

        navLinks.forEach(link => {
            if (link.dataset.page === activePage) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    // Set initial active state
    setActiveNav();

    // Update active state on hash change
    window.addEventListener('hashchange', setActiveNav);

    const yearEl = document.getElementById("current-year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear().toString();
    }

    const liveRegion = document.createElement("div");
    liveRegion.className = "sr-only";
    liveRegion.setAttribute("aria-live", "polite");
    document.body.appendChild(liveRegion);

    const toast = (() => {
        const el = document.createElement("div");
        el.className = "quickview-toast";
        el.setAttribute("role", "status");
        document.body.appendChild(el);
        let timer;
        return {
            show(message) {
                window.clearTimeout(timer);
                el.textContent = message;
                el.classList.add("is-visible");
                timer = window.setTimeout(() => {
                    el.classList.remove("is-visible");
                }, 2400);
            },
        };
    })();

    const announce = (message) => {
        liveRegion.textContent = "";
        window.requestAnimationFrame(() => {
            liveRegion.textContent = message;
        });
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionPreferenceChange = (callback) => {
        if (typeof prefersReducedMotion.addEventListener === "function") {
            prefersReducedMotion.addEventListener("change", callback);
        } else if (typeof prefersReducedMotion.addListener === "function") {
            prefersReducedMotion.addListener(callback);
        }
    };

    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (navToggle && navLinks) {
        const closeNav = () => {
            navToggle.setAttribute("aria-expanded", "false");
            navLinks.setAttribute("aria-expanded", "false");
        };
        navToggle.setAttribute("aria-expanded", "false");
        navLinks.setAttribute("aria-expanded", "false");

        navToggle.addEventListener("click", () => {
            const expanded = navToggle.getAttribute("aria-expanded") === "true";
            const next = !expanded;
            navToggle.setAttribute("aria-expanded", String(next));
            navLinks.setAttribute("aria-expanded", String(next));
        });

        const collapseOnLink = () => {
            if (window.matchMedia("(max-width: 900px)").matches) {
                closeNav();
            }
        };

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", collapseOnLink);
        });

        document.addEventListener("click", (event) => {
            if (!window.matchMedia("(max-width: 900px)").matches) return;
            if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) {
                closeNav();
            }
        });

        window.addEventListener("resize", () => {
            if (!window.matchMedia("(max-width: 900px)").matches) {
                closeNav();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
                closeNav();
                navToggle.focus();
            }
        });
    }

    const stickyTarget = document.querySelector("[data-sticky]");
    if (stickyTarget) {
        const toggleSticky = () => {
            stickyTarget.classList.toggle("is-sticky", window.scrollY > 12);
        };
        toggleSticky();
        window.addEventListener("scroll", toggleSticky, { passive: true });
    }

    const animated = document.querySelectorAll("[data-animate]");
    if (animated.length) {
        let observer;
        const initObserver = () =>
            new IntersectionObserver(
                (entries, obs) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("is-visible");
                            obs.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
            );

        const applyMotionPreference = () => {
            if (observer) {
                observer.disconnect();
                observer = undefined;
            }
            if (prefersReducedMotion.matches) {
                animated.forEach((el) => el.classList.add("is-visible"));
                return;
            }
            observer = initObserver();
            animated.forEach((el) => {
                el.classList.remove("is-visible");
                observer?.observe(el);
            });
        };

        applyMotionPreference();
        onMotionPreferenceChange(applyMotionPreference);
    }

    const parseGap = (value) => {
        const numeric = Number.parseFloat(value);
        return Number.isNaN(numeric) ? 0 : numeric;
    };

    document.querySelectorAll("[data-carousel]").forEach((carousel) => {
        const track = carousel.querySelector("[data-carousel-track]");
        if (!track) return;

        const items = Array.from(track.children);
        if (!items.length) return;

        const prevButton = carousel.querySelector("[data-carousel-button=\"prev\"]");
        const nextButton = carousel.querySelector("[data-carousel-button=\"next\"]");
        let currentIndex = 0;
        let visibleCount = 1;
        let autoTimer;

        const update = () => {
            const style = getComputedStyle(track);
            const gap = parseGap(style.columnGap || style.gap || "0");
            const itemWidth = items[0].getBoundingClientRect().width;
            if (itemWidth === 0) return;

            const containerWidth = track.parentElement?.getBoundingClientRect().width || track.getBoundingClientRect().width;
            visibleCount = Math.max(1, Math.round((containerWidth + gap) / (itemWidth + gap)));
            const maxIndex = Math.max(0, items.length - visibleCount);
            if (currentIndex > maxIndex) {
                currentIndex = maxIndex;
            }

            const offset = currentIndex * (itemWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;

            if (prevButton) {
                prevButton.disabled = currentIndex === 0;
            }
            if (nextButton) {
                nextButton.disabled = currentIndex >= maxIndex;
            }
        };

        const goTo = (index) => {
            const maxIndex = Math.max(0, items.length - visibleCount);
            currentIndex = Math.min(Math.max(index, 0), maxIndex);
            update();
        };

        const stopAuto = () => {
            if (autoTimer) {
                window.clearInterval(autoTimer);
                autoTimer = undefined;
            }
        };

        const startAuto = () => {
            if (prefersReducedMotion.matches) return;
            const delay = Number(carousel.dataset.interval || 6000);
            if (!Number.isFinite(delay) || delay <= 0) return;
            if (items.length <= visibleCount) return;
            stopAuto();
            autoTimer = window.setInterval(() => {
                if (document.hidden) return;
                const maxIndex = Math.max(0, items.length - visibleCount);
                currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
                update();
            }, delay);
        };

        const restartAuto = () => {
            stopAuto();
            startAuto();
        };

        prevButton?.addEventListener("click", () => {
            goTo(currentIndex - 1);
            restartAuto();
        });

        nextButton?.addEventListener("click", () => {
            goTo(currentIndex + 1);
            restartAuto();
        });

        carousel.addEventListener("mouseenter", stopAuto);
        carousel.addEventListener("mouseleave", startAuto);
        carousel.addEventListener("focusin", stopAuto);
        carousel.addEventListener("focusout", startAuto);

        window.addEventListener("resize", () => {
            update();
            startAuto();
        });

        const handleMotionChange = () => {
            if (prefersReducedMotion.matches) {
                stopAuto();
            } else {
                startAuto();
            }
        };

        onMotionPreferenceChange(handleMotionChange);

        update();
        startAuto();
    });

    document.querySelectorAll("[data-testimonial-marquee]").forEach((section) => {
        const track = section.querySelector("[data-testimonial-track]");
        if (!track) return;

        let cards = Array.from(track.children);
        if (cards.length < 2) return;

        const getGap = () => {
            const style = getComputedStyle(track);
            return parseGap(style.columnGap || style.gap || "0");
        };

        const baseSpeed = Number.parseFloat(section.dataset.speed || "36");
        const speed = Number.isFinite(baseSpeed) && baseSpeed > 0 ? baseSpeed : 36;

        let offset = 0;
        let rafId;
        let lastTimestamp;

        const reset = () => {
            offset = 0;
            track.style.transform = "translateX(0)";
            cards = Array.from(track.children);
        };

        const step = (timestamp) => {
            if (lastTimestamp === undefined) {
                lastTimestamp = timestamp;
            }
            const delta = timestamp - lastTimestamp;
            lastTimestamp = timestamp;
            offset += (speed * delta) / 1000;

            let gap = getGap();
            let firstCard = cards[0];

            while (firstCard) {
                const widthWithGap = firstCard.getBoundingClientRect().width + gap;
                if (offset < widthWithGap) break;
                offset -= widthWithGap;
                track.appendChild(firstCard);
                cards = Array.from(track.children);
                firstCard = cards[0];
                gap = getGap();
            }

            track.style.transform = `translateX(-${offset}px)`;
            rafId = window.requestAnimationFrame(step);
        };

        const stop = () => {
            if (rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = undefined;
            }
            lastTimestamp = undefined;
        };

        const start = () => {
            if (prefersReducedMotion.matches || rafId) return;
            lastTimestamp = undefined;
            rafId = window.requestAnimationFrame(step);
        };

        const pause = () => {
            stop();
        };

        const resume = () => {
            if (!prefersReducedMotion.matches) {
                start();
            }
        };

        section.addEventListener("mouseenter", pause);
        section.addEventListener("mouseleave", resume);
        section.addEventListener("focusin", pause);
        section.addEventListener("focusout", resume);

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                stop();
            } else {
                resume();
            }
        });

        let resizeTimer;
        window.addEventListener("resize", () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => {
                const wasRunning = Boolean(rafId);
                stop();
                reset();
                if (wasRunning && !prefersReducedMotion.matches) {
                    start();
                }
            }, 120);
        });

        const handleMotionChange = () => {
            if (prefersReducedMotion.matches) {
                stop();
                reset();
            } else {
                start();
            }
        };

        onMotionPreferenceChange(handleMotionChange);

        reset();
        start();
    });

    // Cart Management - handled by CartManager class (loaded from js/cart-manager.js)
    // Initialize CartManager
    if (typeof CartManager !== 'undefined') {
        window.cartManager = new CartManager();
    }

    // Quick view functionality handled by modal.js

    // Initialize circular gallery
    const galleryRoots = document.querySelectorAll("[data-circular-gallery]");
    if (galleryRoots.length) {
        galleryRoots.forEach((root) => {
            new CircularGallery(root, { prefersReducedMotion });
        });
    }
});
