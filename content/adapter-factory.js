// adapter factory to select site-specific adapter based on url

class AdapterFactory {
    /**
     * Get the appropriate adapter instance for the current site
     * @returns {BaseAdapter|null} Site-specific adapter or null if unsupported
     */
    static getAdapter() {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;

        // ChatGPT
        if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) {
            return new ChatGPTAdapter();
        }

        // Claude
        if (hostname.includes('claude.ai')) {
            return new ClaudeAdapter();
        }

        // Gemini
        if (hostname.includes('gemini.google.com')) {
            return new GeminiAdapter();
        }

        // Grok
        if (hostname.includes('grok.x.ai') || (hostname.includes('x.com') && pathname.includes('grok'))) {
            return new GrokAdapter();
        }

        // Deepseek
        if (hostname.includes('deepseek.com')) {
            return new DeepseekAdapter();
        }

        console.warn('ChatHop: Unsupported site -', hostname);
        return null;
    }

    /**
     * Check if current site is supported
     * @returns {boolean} True if site is supported
     */
    static isSupported() {
        return this.getAdapter() !== null;
    }
}

// make available globally
if (typeof window !== 'undefined') {
    window.AdapterFactory = AdapterFactory;
}
