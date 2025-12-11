// deepseek-specific adapter

class DeepseekAdapter extends BaseAdapter {
    getSiteName() {
        return 'Deepseek';
    }

    getChatId() {
        // Deepseek URL patterns
        // Example: https://chat.deepseek.com/c/{chatId} or similar
        const patterns = [
            /\/c\/([a-zA-Z0-9-_]+)/,
            /\/chat\/([a-zA-Z0-9-_]+)/,
            /\/conversation\/([a-zA-Z0-9-_]+)/
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

        // Deepseek likely uses similar patterns to ChatGPT
        const possibleSelectors = [
            '[data-message-author-role="user"]',
            '[data-role="user"]',
            '.user-message',
            '[class*="UserMessage"]',
            '[class*="user-prompt"]'
        ];

        let userMessages = [];

        for (const selector of possibleSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                userMessages = Array.from(elements);
                break;
            }
        }

        // Fallback: Look for alternating message pattern
        if (userMessages.length === 0) {
            const allMessages = document.querySelectorAll('[class*="message"], [class*="chat-item"]');
            userMessages = Array.from(allMessages).filter((el, idx) => {
                const text = el.textContent.trim();
                // Heuristic: User messages typically don't contain AI indicators
                const isNotAI = !el.querySelector('[class*="assistant"]') &&
                    !el.querySelector('[class*="deepseek"]') &&
                    !el.querySelector('[class*="ai"]');

                // Additional check: user messages might have specific styling
                const computedStyle = window.getComputedStyle(el);
                const alignment = computedStyle.textAlign || computedStyle.alignSelf;

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
            '.icon',
            '.action-btn'
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
    window.DeepseekAdapter = DeepseekAdapter;
}
