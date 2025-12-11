// claude-specific adapter

class ClaudeAdapter extends BaseAdapter {
    getSiteName() {
        return 'Claude';
    }

    getChatId() {
        // url pattern: /chat/{chatId}
        const match = window.location.pathname.match(/\/chat\/([a-zA-Z0-9-]+)/);
        return match ? match[1] : null;
    }

    detectPrompts() {
        const prompts = [];

        // try multiple selectors since claude's dom varies
        const possibleSelectors = [
            '[data-is-streaming="false"] .font-user-message',
            '.font-user-message',
            '[class*="user"] [class*="message"]',
            'div[class*="Human"]'
        ];

        let userMessages = [];

        for (const selector of possibleSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                userMessages = Array.from(elements);
                break;
            }
        }

        // fallback: filter all messages for user content
        if (userMessages.length === 0) {
            const allMessages = document.querySelectorAll('[class*="message"], [data-test*="message"]');
            userMessages = Array.from(allMessages).filter(el => {
                return !el.querySelector('[class*="assistant"]') &&
                    !el.querySelector('[class*="claude"]') &&
                    el.textContent.trim().length > 0;
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
            '.copy-icon',
            '.edit-icon'
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
    window.ClaudeAdapter = ClaudeAdapter;
}
