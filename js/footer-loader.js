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

                console.log('[FooterLoader] Footer loaded successfully');
            }
        })
        .catch(error => console.error('Error loading footer:', error));
})();
