/**
 * TYPING-ANIMATION.JS - Word-level typing effect for hero headline
 * Only animates the final word, keeping the rest of the sentence static
 */

class TypingAnimation {
    constructor(element) {
        this.element = element;
        this.textElement = element.querySelector('.typed-text');
        this.cursorElement = element.querySelector('.typing-cursor');

        // Parse words from data attribute
        try {
            this.words = JSON.parse(element.dataset.typingWords);
        } catch (e) {
            console.error('Invalid typing words data:', e);
            this.words = ['regret'];
        }

        this.currentWordIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isPaused = false;
        this.hasStarted = false;

        // Timing configuration (in milliseconds)
        this.typingSpeed = 80;        // Speed of typing characters
        this.deletingSpeed = 40;      // Speed of deleting characters
        this.pauseAfterTyping = 2500; // Pause when word is complete
        this.pauseAfterDeleting = 300; // Brief pause before typing next word
        this.initialDelay = 2000;      // Delay before first word change

        this.init();
    }

    init() {
        // Start with the first word already displayed
        // Wait for initial delay before starting animation
        setTimeout(() => {
            this.hasStarted = true;
            this.isDeleting = true;
            this.currentCharIndex = this.words[0].length;
            this.animate();
        }, this.initialDelay);
    }

    animate() {
        if (!this.hasStarted) return;

        const currentWord = this.words[this.currentWordIndex];

        if (this.isPaused) {
            // Handle pause state
            return;
        }

        if (!this.isDeleting && this.currentCharIndex <= currentWord.length) {
            // Typing phase
            this.textElement.textContent = currentWord.substring(0, this.currentCharIndex);
            this.currentCharIndex++;

            if (this.currentCharIndex > currentWord.length) {
                // Finished typing, pause before deleting
                this.isPaused = true;
                setTimeout(() => {
                    this.isPaused = false;
                    this.isDeleting = true;
                    this.animate();
                }, this.pauseAfterTyping);
                return;
            }

            setTimeout(() => this.animate(), this.typingSpeed);

        } else if (this.isDeleting && this.currentCharIndex >= 0) {
            // Deleting phase
            this.textElement.textContent = currentWord.substring(0, this.currentCharIndex);
            this.currentCharIndex--;

            if (this.currentCharIndex < 0) {
                // Finished deleting, move to next word
                this.isDeleting = false;
                this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
                this.currentCharIndex = 0;

                // Pause before typing next word
                this.isPaused = true;
                setTimeout(() => {
                    this.isPaused = false;
                    this.animate();
                }, this.pauseAfterDeleting);
                return;
            }

            setTimeout(() => this.animate(), this.deletingSpeed);
        }
    }
}

// Initialize typing animation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const typingElement = document.querySelector('[data-typing-words]');
    if (typingElement) {
        new TypingAnimation(typingElement);
    }
});
