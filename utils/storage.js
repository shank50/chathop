// storage utilities for managing saved prompts

const StorageUtils = {
    async savePrompt(promptData) {
        return new Promise((resolve) => {
            const prompt = {
                id: Date.now().toString(),
                ...promptData,
                timestamp: new Date().toISOString()
            };

            chrome.runtime.sendMessage(
                { action: 'savePrompt', prompt },
                (response) => {
                    resolve(response?.success || false);
                }
            );
        });
    },

    async getSavedPrompts() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(
                { action: 'getSavedPrompts' },
                (response) => {
                    resolve(response?.prompts || []);
                }
            );
        });
    },

    async deletePrompt(promptId) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(
                { action: 'deletePrompt', promptId },
                (response) => {
                    resolve(response?.success || false);
                }
            );
        });
    }
};

// make available globally in content script context
if (typeof window !== 'undefined') {
    window.StorageUtils = StorageUtils;
}
