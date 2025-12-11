// gemini-specific adapter

class GeminiAdapter extends BaseAdapter {
    getSiteName() {
        return 'Gemini';
    }

    getChatId() {
        // Gemini URL patterns can vary, check for common patterns
        // Example: https://gemini.google.com/app/{chatId}
        const patterns = [
            /\/app\/([a-zA-Z0-9-]+)/,
            /\/chat\/([a-zA-Z0-9-]+)/,
            /\/c\/([a-zA-Z0-9-]+)/
        ];

        for (const pattern of patterns) {
            const match = window.location.pathname.match(pattern);
            if (match) {
                return match[1];
            }
        }

        // Check URL hash as Gemini sometimes uses hash-based routing
        const hashMatch = window.location.hash.match(/#\/([a-zA-Z0-9-]+)/);
        return hashMatch ? hashMatch[1] : null;
    }

    detectPrompts() {
        const prompts = [];

        // Gemini uses specific data attributes and class patterns
        const possibleSelectors = [
            '[data-message-author-role="user"]',
            '.user-message',
            '[class*="user-query"]',
            'message-content.user-query',
            '.query-content'
        ];

        let userMessages = [];

        for (const selector of possibleSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                userMessages = Array.from(elements);
                break;
            }
        }

        // Alternative: Look for Material Design conversation structure
        if (userMessages.length === 0) {
            const allMessages = document.querySelectorAll('[class*="message"], [class*="query"]');
            userMessages = Array.from(allMessages).filter(el => {
                // Gemini user messages typically align to the right or have specific classes
                const computedStyle = window.getComputedStyle(el);
                const hasUserIndicator = el.className.includes('user') ||
                    el.className.includes('query') ||
                    computedStyle.marginLeft === 'auto';
                return hasUserIndicator && el.textContent.trim().length > 0;
            });
        }

        userMessages.forEach((element, index) => {
            const textContent = this._extractTextContent(element);
            const preview = this._createPreview(textContent);

            if (textContent.length > 0) {
                prompts.push({
                    index: index,
                    element: element,
                    text: textContent,
                    preview: preview
                });
            }
        });

        return prompts;
    }

    _extractTextContent(element) {
        const clone = element.cloneNode(true);

        const selectorsToRemove = [
            'button',
            'svg',
            '[role="button"]',
            'mat-icon',
            '.action-buttons'
        ];

        selectorsToRemove.forEach(selector => {
            clone.querySelectorAll(selector).forEach(el => el.remove());
        });

        return clone.textContent.trim();
    }

    _createPreview(text, maxLength = 100) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }
}

// make available globally
if (typeof window !== 'undefined') {
    window.GeminiAdapter = GeminiAdapter;
}
