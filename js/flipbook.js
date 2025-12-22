/**
 * Interactive Flipbook Catalog - JavaScript Implementation
 * Powered by StPageFlip.js
 */

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        width: 450,      // Single page width (reduced from 550)
        height: 600,     // Single page height (reduced from 733, 4:3 ratio)
        minWidth: 315,
        maxWidth: 450,
        minHeight: 420,
        maxHeight: 600,
        showCover: true,
        mobileScrollSupport: false,
        swipeDistance: 30,
        flippingTime: 1000,
        usePortrait: true,
        startPage: 0,
        size: 'fixed',
        drawShadow: true,
        maxShadowOpacity: 0.5,
        showPageCorners: true,
        disableFlipByClick: false
    };

    // Initialize flipbook when DOM is ready
    function initFlipbook() {
        const container = document.getElementById('flipbook-container');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const pageIndicator = document.getElementById('page-indicator');

        if (!container) {
            console.error('Flipbook container not found');
            return;
        }

        // Calculate responsive dimensions
        const containerWidth = container.offsetWidth;
        const isMobile = window.innerWidth < 768;

        const pageWidth = isMobile
            ? Math.min(containerWidth * 0.9, CONFIG.maxWidth)
            : Math.min(containerWidth / 2.2, CONFIG.maxWidth);

        const pageHeight = (pageWidth * 4) / 3; // Maintain 4:3 aspect ratio

        // Initialize PageFlip
        const pageFlip = new St.PageFlip(container, {
            width: pageWidth,
            height: pageHeight,
            minWidth: CONFIG.minWidth,
            maxWidth: CONFIG.maxWidth,
            minHeight: CONFIG.minHeight,
            maxHeight: CONFIG.maxHeight,
            size: CONFIG.size,
            showCover: CONFIG.showCover,
            mobileScrollSupport: CONFIG.mobileScrollSupport,
            swipeDistance: CONFIG.swipeDistance,
            flippingTime: CONFIG.flippingTime,
            usePortrait: CONFIG.usePortrait,
            startPage: CONFIG.startPage,
            drawShadow: CONFIG.drawShadow,
            maxShadowOpacity: CONFIG.maxShadowOpacity,
            showPageCorners: CONFIG.showPageCorners,
            disableFlipByClick: CONFIG.disableFlipByClick
        });

        // Load pages
        const pages = document.querySelectorAll('.page');
        if (pages.length === 0) {
            console.error('No pages found for flipbook');
            return;
        }

        pageFlip.loadFromHTML(pages);

        // Update page indicator
        function updatePageIndicator() {
            const currentPage = pageFlip.getCurrentPageIndex();
            const totalPages = pageFlip.getPageCount();

            if (pageIndicator) {
                pageIndicator.textContent = `Page ${currentPage + 1} / ${totalPages}`;
            }

            // Update button states
            if (prevBtn) {
                prevBtn.disabled = currentPage === 0;
            }
            if (nextBtn) {
                nextBtn.disabled = currentPage >= totalPages - 1;
            }
        }

        // Event listeners for page flip
        pageFlip.on('flip', (e) => {
            updatePageIndicator();

            // Add subtle haptic feedback on mobile
            if ('vibrate' in navigator) {
                navigator.vibrate(10);
            }
        });

        pageFlip.on('changeOrientation', (e) => {
            console.log('Orientation changed:', e.data);
        });

        pageFlip.on('changeState', (e) => {
            console.log('State changed:', e.data);
        });

        // Navigation button handlers
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                pageFlip.flipPrev();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                pageFlip.flipNext();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                pageFlip.flipPrev();
            } else if (e.key === 'ArrowRight') {
                pageFlip.flipNext();
            }
        });

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newContainerWidth = container.offsetWidth;
                const newIsMobile = window.innerWidth < 768;

                const newPageWidth = newIsMobile
                    ? Math.min(newContainerWidth * 0.9, CONFIG.maxWidth)
                    : Math.min(newContainerWidth / 2.2, CONFIG.maxWidth);

                const newPageHeight = (newPageWidth * 4) / 3;

                pageFlip.updateState({
                    width: newPageWidth,
                    height: newPageHeight
                });
            }, 250);
        });

        // Initial page indicator update
        updatePageIndicator();

        // Add scroll-into-view animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.2
        });

        observer.observe(container);

        console.log('Flipbook initialized successfully');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFlipbook);
    } else {
        initFlipbook();
    }
})();
