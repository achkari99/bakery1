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

                // Highlight active link
                const currentPath = window.location.pathname;
                // Remove trailing slash and .html extension for robust comparison
                const cleanCurrent = currentPath.replace(/\/$/, '').replace(/\.html$/, '').split('/').pop() || 'index';

                document.querySelectorAll('.nav-links a').forEach(link => {
                    const linkHref = link.getAttribute('href');
                    const linkFile = linkHref.replace(/\.html$/, '').split('/').pop() || 'index';

                    // Special case for home
                    if (cleanCurrent === 'index' && (linkFile === 'index' || linkFile === '')) {
                        link.setAttribute('area-current', 'page');
                        link.classList.add('active'); // Add class for easier styling
                    } else if (cleanCurrent === linkFile) {
                        link.setAttribute('aria-current', 'page');
                        link.classList.add('active');
                    } else {
                        link.removeAttribute('aria-current');
                        link.classList.remove('active');
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
