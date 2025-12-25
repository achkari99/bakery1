// Footer Component Loader
(function () {
    // Determine the correct path based on current location
    const isInPagesDir = window.location.pathname.includes('/pages/');
    const footerPath = isInPagesDir ? '../components/footer.html' : 'components/footer.html';

    // Load footer component
    fetch(footerPath)
        .then(response => response.text())
        .then(html => {
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.outerHTML = html;

                // Set current year
                const yearElement = document.getElementById('current-year');
                if (yearElement) {
                    yearElement.textContent = new Date().getFullYear();
                }

                // Fix navigation links based on current location
                if (!isInPagesDir) {
                    // We're on homepage - need to add 'pages/' prefix to non-home links
                    const siteFooter = document.querySelector('.site-footer');
                    if (siteFooter) {
                        const links = siteFooter.querySelectorAll('a');
                        links.forEach(link => {
                            const href = link.getAttribute('href');
                            // Skip home link and already correct paths
                            // Skip home link, already correct paths, external links, and anchors
                            if (href &&
                                !href.includes('index.html') &&
                                !href.startsWith('pages/') &&
                                !href.startsWith('http') &&
                                !href.startsWith('mailto:') &&
                                !href.startsWith('tel:') &&
                                !href.startsWith('#')) {
                                link.setAttribute('href', 'pages/' + href);
                            } else if (href === '../index.html') {
                                // Fix home link for homepage
                                link.setAttribute('href', 'index.html');
                            }
                        });
                    }
                }

                console.log('[FooterLoader] Footer loaded successfully');
            }
        })
        .catch(error => console.error('Error loading footer:', error));
})();
