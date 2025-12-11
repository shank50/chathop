// grok-specific adapter

class GrokAdapter extends BaseAdapter {
    getSiteName() {
        return 'Grok';
    }

    getChatId() {
        // Grok URL patterns on X platform
        // Example: https://grok.x.ai/chat/{chatId} or similar
        const patterns = [
            /\/chat\/([a-zA-Z0-9-_]+)/,
            /\/conversation\/([a-zA-Z0-9-_]+)/,
            /\/grok\/([a-zA-Z0-9-_]+)/
        ];

        for (const pattern of patterns) {
            const match = window.location.pathname.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return null;
    }

    detectPrompts() {
        const prompts = [];

        // Grok may use Twitter/X-style DOM or custom structure
        const possibleSelectors = [
            '[data-role="user-message"]',
            '.user-prompt',
            '[class*="UserMessage"]',
            '[data-message-type="user"]'
        ];

        let userMessages = [];

        for (const selector of possibleSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                userMessages = Array.from(elements);
                break;
            }
        }

        // Fallback: Generic message detection
        if (userMessages.length === 0) {
            const allMessages = document.querySelectorAll('[class*="message"], [data-testid*="message"]');
            userMessages = Array.from(allMessages).filter(el => {
                const text = el.textContent.trim();
                // Filter out system messages and AI responses
                const isNotAI = !el.querySelector('[class*="grok"]') &&
                    !el.querySelector('[class*="ai"]') &&
                    !el.querySelector('[class*="assistant"]');
                return isNotAI && text.length > 0;
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
            '[data-testid*="button"]'
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
    window.GrokAdapter = GrokAdapter;
}
