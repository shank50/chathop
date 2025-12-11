// base adapter class for site-specific implementations

class BaseAdapter {
    constructor() {
        if (new.target === BaseAdapter) {
            throw new TypeError("Cannot construct BaseAdapter instances directly");
        }
    }

    detectPrompts() {
        throw new Error("Method 'detectPrompts()' must be implemented");
    }

    getChatId() {
        throw new Error("Method 'getChatId()' must be implemented");
    }

    scrollToPrompt(element) {
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });

            // highlight briefly
            const originalBg = element.style.backgroundColor;
            const originalTransition = element.style.transition;

            element.style.transition = 'background-color 0.3s ease';
            element.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';

            setTimeout(() => {
                element.style.backgroundColor = originalBg;
                setTimeout(() => {
                    element.style.transition = originalTransition;
                }, 300);
            }, 1500);
        }
    }

    getCurrentUrl() {
        return window.location.href;
    }

    getSiteName() {
        throw new Error("Method 'getSiteName()' must be implemented");
    }

    isOnChatPage() {
        return this.getChatId() !== null;
    }
}

// make available globally
if (typeof window !== 'undefined') {
    window.BaseAdapter = BaseAdapter;
}
