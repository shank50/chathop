// chatgpt-specific adapter

class ChatGPTAdapter extends BaseAdapter {
    getSiteName() {
        return 'ChatGPT';
    }

    getChatId() {
        // url pattern: /c/{chatId}
        const match = window.location.pathname.match(/\/c\/([a-zA-Z0-9-]+)/);
        return match ? match[1] : null;
    }

    detectPrompts() {
        const prompts = [];

        // chatgpt uses data-message-author-role="user" for user messages
        const userMessages = document.querySelectorAll('[data-message-author-role="user"]');

        userMessages.forEach((element, index) => {
            const textContent = this._extractTextContent(element);
            const preview = this._createPreview(textContent);

            prompts.push({
                index: index,
                element: element,
                text: textContent,
                preview: preview
            });
        });

        return prompts;
    }

    _extractTextContent(element) {
        const clone = element.cloneNode(true);

        // remove buttons, icons, etc
        const selectorsToRemove = [
            'button',
            'svg',
            '[role="button"]',
            '.copy-button',
            '.edit-button'
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
    window.ChatGPTAdapter = ChatGPTAdapter;
}
