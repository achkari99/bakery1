/**
 * Typing Animation for Hero Section
 * Animates typing effect for h1 title with multiple phrases
 * Only animates the words that change between phrases
 */

class TypingAnimation {
    constructor(element) {
        this.element = element;
        this.textElement = element.querySelector('.typed-text');
        this.cursorElement = element.querySelector('.typing-cursor');

        if (!this.textElement || !this.cursorElement) {
            console.error('Typing animation requires .typed-text and .typing-cursor elements');
            return;
        }

        // Get words from data attribute
        const wordsAttr = element.getAttribute('data-typing-words');
        try {
            this.phrases = JSON.parse(wordsAttr);
        } catch (e) {
            console.error('Invalid JSON in data-typing-words attribute');
            return;
        }

        this.currentPhraseIndex = 0;
        this.typeSpeed = 80; // ms per character
        this.deleteSpeed = 40; // ms per character when deleting
        this.pauseAfterPhrase = 2500; // pause after typing complete phrase

        this.start();
    }

    // Find common prefix between two strings
    findCommonPrefix(str1, str2) {
        let i = 0;
        while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
            i++;
        }
        return str1.substring(0, i);
    }

    start() {
        // Start with the first phrase
        const firstPhrase = this.phrases[0];
        this.textElement.textContent = firstPhrase;

        setTimeout(() => {
            this.nextPhrase();
        }, this.pauseAfterPhrase);
    }

    nextPhrase() {
        const currentPhrase = this.phrases[this.currentPhraseIndex];
        const nextIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
        const nextPhrase = this.phrases[nextIndex];

        // Find the common prefix
        const commonPrefix = this.findCommonPrefix(currentPhrase, nextPhrase);
        const currentSuffix = currentPhrase.substring(commonPrefix.length);
        const nextSuffix = nextPhrase.substring(commonPrefix.length);

        // Delete the current suffix, then type the new suffix
        this.deleteText(commonPrefix, currentSuffix, () => {
            this.typeText(commonPrefix, nextSuffix, () => {
                this.currentPhraseIndex = nextIndex;
                setTimeout(() => this.nextPhrase(), this.pauseAfterPhrase);
            });
        });
    }

    deleteText(prefix, suffix, callback) {
        if (suffix.length === 0) {
            callback();
            return;
        }

        const deleteStep = () => {
            suffix = suffix.substring(0, suffix.length - 1);
            this.textElement.textContent = prefix + suffix;

            if (suffix.length === 0) {
                setTimeout(callback, 200);
            } else {
                setTimeout(deleteStep, this.deleteSpeed);
            }
        };

        deleteStep();
    }

    typeText(prefix, suffix, callback) {
        if (suffix.length === 0) {
            callback();
            return;
        }

        let currentIndex = 0;
        const typeStep = () => {
            currentIndex++;
            this.textElement.textContent = prefix + suffix.substring(0, currentIndex);

            if (currentIndex === suffix.length) {
                callback();
            } else {
                setTimeout(typeStep, this.typeSpeed);
            }
        };

        typeStep();
    }
}

// Initialize typing animation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const typingElement = document.querySelector('[data-typing-words]');
    if (typingElement) {
        new TypingAnimation(typingElement);
    }
});
