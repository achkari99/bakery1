// Footer Component Loader
(function () {
    // Use absolute path for footer component
    const footerPath = '/components/footer.html';

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

                console.log('[FooterLoader] Footer loaded and injected');
                // I18n MutationObserver will handle translation automatically
            }
        })
        .catch(error => console.error('Error loading footer:', error));
})();
