// Header Component Loader
(function () {
    // Determine the correct path based on current location
    const isInPagesDir = window.location.pathname.includes('/pages/');
    const headerPath = isInPagesDir ? '../components/header.html' : 'components/header.html';

    // Load header component
    fetch(headerPath)
        .then(response => response.text())
        .then(html => {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.outerHTML = html;

                // Fix navigation links based on current location
                if (isInPagesDir) {
                    // We're in /pages directory, so adjust links
                    document.querySelectorAll('header a[href^="pages/"]').forEach(link => {
                        link.href = link.href.replace('pages/', '');
                    });
                    document.querySelectorAll('header a[href="index.html"]').forEach(link => {
                        link.href = '../index.html';
                    });
                }

                // Update promo text for homepage
                const promoText = document.getElementById('promo-text');
                const isHomePage = window.location.pathname === '/' ||
                    window.location.pathname === '/index.html' ||
                    window.location.pathname.endsWith('/bakery/') ||
                    window.location.pathname.endsWith('/bakery/index.html');

                if (isHomePage && promoText) {
                    promoText.setAttribute('data-i18n', 'promo.banner_home');
                }

                // Highlight active link
                const currentPath = window.location.pathname;
                const currentFile = currentPath.split('/').pop() || 'index.html';

                document.querySelectorAll('.nav-links a').forEach(link => {
                    const linkHref = link.getAttribute('href');
                    const linkFile = linkHref.split('/').pop();

                    if (currentFile === linkFile) {
                        link.setAttribute('aria-current', 'page');
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });

                // Dispatch headerLoaded event for cart manager
                window.dispatchEvent(new Event('headerLoaded'));
                console.log('[HeaderLoader] Header loaded, event dispatched');

                // Reinitialize cart count after header loads
                if (typeof updateCartBadge === 'function') {
                    updateCartBadge();
                }
            }
        })
        .catch(error => console.error('Error loading header:', error));
})();
