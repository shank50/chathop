// main content script - initializes adapter and overlay

(function () {
    'use strict';

    console.log('ChatHop: Content script loaded');

    let adapter = null;
    let overlay = null;
    let observer = null;

    function initialize() {
        // Get the appropriate adapter for this site
        adapter = AdapterFactory.getAdapter();

        if (!adapter) {
            console.log('ChatHop: Site not supported');
            return;
        }

        console.log('ChatHop: Initialized for', adapter.getSiteName());

        // Create the overlay
        overlay = new PromptOverlay(adapter);

        // Set up DOM observer to detect new prompts
        setupObserver();

        // Listen for URL changes (for SPAs)
        setupUrlObserver();
    }

    function setupObserver() {
        // Observe DOM changes to refresh prompt list
        observer = new MutationObserver((mutations) => {
            // Debounce refresh to avoid excessive updates
            if (overlay && adapter && adapter.isOnChatPage()) {
                debounceRefresh();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // listen for keyboard shortcut from background
        chrome.runtime.onMessage.addListener((request) => {
            if (request.action === 'toggleOverlay' && overlay) {
                overlay.toggleVisibility();
            }
        });
    }

    // Debounced refresh function
    let refreshTimeout = null;
    function debounceRefresh() {
        clearTimeout(refreshTimeout);
        refreshTimeout = setTimeout(() => {
            if (overlay) {
                overlay.refresh();
            }
        }, 500); // Wait 500ms after last change
    }

    function setupUrlObserver() {
        // Watch for URL changes in Single Page Applications
        let lastUrl = window.location.href;

        new MutationObserver(() => {
            const currentUrl = window.location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                console.log('ChatHop: URL changed');

                // Reinitialize if needed
                if (overlay) {
                    overlay.refresh();
                }
            }
        }).observe(document.querySelector('title') || document.body, {
            subtree: true,
            childList: true
        });

        // Also listen to popstate for browser back/forward
        window.addEventListener('popstate', () => {
            console.log('ChatHop: Navigation detected');
            if (overlay) {
                setTimeout(() => overlay.refresh(), 500);
            }
        });
    }

    // Wait for page to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM already loaded
        setTimeout(initialize, 1000); // Give the page a moment to render
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (observer) {
            observer.disconnect();
        }
    });
})();
