/**
 * Cinnamona i18n - Lightweight Internationalization Module
 * Supports EN (English) and AR (Arabic with RTL)
 */

const I18n = (() => {
    // Configuration
    const SUPPORTED_LANGS = ['en', 'ar'];
    const DEFAULT_LANG = 'en';
    const STORAGE_KEY = 'cinnamona-lang';

    // State
    let currentLang = DEFAULT_LANG;
    let translations = {};
    let isLoaded = false;

    /**
     * Detect user's preferred language
     */
    function detectLanguage() {
        // Check localStorage first
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED_LANGS.includes(stored)) {
            return stored;
        }

        // Check browser language
        const browserLang = navigator.language?.split('-')[0];
        if (browserLang && SUPPORTED_LANGS.includes(browserLang)) {
            return browserLang;
        }

        return DEFAULT_LANG;
    }

    /**
     * Load translations from JSON file
     */
    async function loadTranslations(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) {
            console.warn(`Language "${lang}" not supported, falling back to "${DEFAULT_LANG}"`);
            lang = DEFAULT_LANG;
        }

        try {
            // Determine the correct path based on current page location
            const basePath = getBasePath();
            const response = await fetch(`${basePath}locales/${lang}.json`);

            if (!response.ok) {
                throw new Error(`Failed to load ${lang} translations`);
            }

            translations = await response.json();
            currentLang = lang;
            isLoaded = true;

            return translations;
        } catch (error) {
            console.error('i18n: Error loading translations:', error);

            // Fallback to default language if not already trying it
            if (lang !== DEFAULT_LANG) {
                return loadTranslations(DEFAULT_LANG);
            }

            return null;
        }
    }

    /**
     * Get base path for locales based on current page
     */
    function getBasePath() {
        const path = window.location.pathname;

        // If we're in a subdirectory (like /pages/), go up one level
        if (path.includes('/pages/')) {
            return '../';
        }

        return './';
    }

    /**
     * Get a translation by key path (e.g., "nav.home")
     */
    function t(keyPath, fallback = '') {
        if (!isLoaded) {
            console.warn('i18n: Translations not loaded yet');
            return fallback || keyPath;
        }

        const keys = keyPath.split('.');
        let value = translations;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                console.warn(`i18n: Missing translation for "${keyPath}"`);
                return fallback || keyPath;
            }
        }

        return value;
    }

    /**
     * Apply translations to all elements with data-i18n attribute
     */
    function applyTranslations() {
        if (!isLoaded) return;

        // Update document metadata
        document.documentElement.lang = translations.meta?.lang || currentLang;
        document.documentElement.dir = translations.meta?.dir || (currentLang === 'ar' ? 'rtl' : 'ltr');

        // Update title if available
        if (translations.meta?.title) {
            document.title = translations.meta.title;
        }

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && translations.meta?.description) {
            metaDesc.setAttribute('content', translations.meta.description);
        }

        // Apply to all elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = t(key);

            if (translation && translation !== key) {
                // Check if it's an input placeholder
                if (el.hasAttribute('placeholder')) {
                    el.setAttribute('placeholder', translation);
                }
                // Check if it's for aria-label
                else if (el.hasAttribute('data-i18n-aria')) {
                    el.setAttribute('aria-label', translation);
                }
                // Default: set text content
                else {
                    el.textContent = translation;
                }
            }
        });

        // Apply to elements with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = t(key);
            if (translation && translation !== key) {
                el.setAttribute('placeholder', translation);
            }
        });

        // Apply to elements with data-i18n-aria
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            const translation = t(key);
            if (translation && translation !== key) {
                el.setAttribute('aria-label', translation);
            }
        });

        // Dispatch event for custom handlers
        document.dispatchEvent(new CustomEvent('i18n:applied', {
            detail: { lang: currentLang, translations }
        }));
    }

    /**
     * Switch to a different language
     */
    async function switchLanguage(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) {
            console.warn(`Language "${lang}" not supported`);
            return false;
        }

        if (lang === currentLang && isLoaded) {
            return true; // Already on this language
        }

        const success = await loadTranslations(lang);

        if (success) {
            localStorage.setItem(STORAGE_KEY, lang);
            applyTranslations();
            updateLanguageSelector(lang);
            return true;
        }

        return false;
    }

    /**
     * Update language selector UI
     */
    function updateLanguageSelector(lang) {
        document.querySelectorAll('[data-lang-switch]').forEach(el => {
            const btnLang = el.getAttribute('data-lang-switch');

            if (btnLang === lang) {
                el.classList.add('active');
                el.setAttribute('aria-current', 'true');
            } else {
                el.classList.remove('active');
                el.removeAttribute('aria-current');
            }
        });
    }

    /**
     * Initialize language selector buttons
     */
    function initLanguageSelector() {
        document.querySelectorAll('[data-lang-switch]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = btn.getAttribute('data-lang-switch');
                switchLanguage(lang);
            });
        });
    }

    /**
     * Initialize i18n system
     */
    async function init() {
        const lang = detectLanguage();
        await loadTranslations(lang);
        applyTranslations();
        initLanguageSelector();
        updateLanguageSelector(lang);

        console.log(`i18n: Initialized with "${currentLang}" language`);
    }

    // Public API
    return {
        init,
        t,
        switchLanguage,
        applyTranslations,
        get currentLang() { return currentLang; },
        get isLoaded() { return isLoaded; },
        SUPPORTED_LANGS
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
    I18n.init();
}

// Export for module use
export default I18n;
