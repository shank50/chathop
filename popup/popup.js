// Popup script for managing saved prompts

document.addEventListener('DOMContentLoaded', async () => {
    const promptsContainer = document.getElementById('prompts-container');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const promptCount = document.getElementById('prompt-count');
    const clearAllBtn = document.getElementById('clear-all-btn');

    let allPrompts = [];

    // Load saved prompts
    await loadPrompts();

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterPrompts(searchTerm);
    });

    // Clear all button
    clearAllBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete all saved prompts? This cannot be undone.')) {
            // Delete all prompts
            for (const prompt of allPrompts) {
                await deletePrompt(prompt.id);
            }
            await loadPrompts();
        }
    });

    async function loadPrompts() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getSavedPrompts' });

            if (chrome.runtime.lastError) {
                console.error('Runtime error:', chrome.runtime.lastError);
                promptsContainer.innerHTML = '<div class="loading">Error: Extension communication failed</div>';
                return;
            }

            allPrompts = response?.prompts || [];

            // Sort by timestamp (newest first)
            allPrompts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            displayPrompts(allPrompts);
            updateFooter();
        } catch (error) {
            console.error('Error loading prompts:', error);
            promptsContainer.innerHTML = '<div class="loading">Unable to load saved prompts. Try reloading the extension.</div>';
            emptyState.style.display = 'none';
        }
    }

    function displayPrompts(prompts) {
        promptsContainer.innerHTML = '';

        if (prompts.length === 0) {
            promptsContainer.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        promptsContainer.style.display = 'block';
        emptyState.style.display = 'none';

        prompts.forEach(prompt => {
            const card = createPromptCard(prompt);
            promptsContainer.appendChild(card);
        });
    }

    function createPromptCard(prompt) {
        const card = document.createElement('div');
        card.className = 'prompt-card';

        const preview = prompt.text ?
            escapeHtml(prompt.text.substring(0, 200) + (prompt.text.length > 200 ? '...' : '')) :
            'No preview available';

        const date = new Date(prompt.timestamp);
        const dateStr = formatDate(date);

        card.innerHTML = `
      <div class="prompt-card-header">
        <div class="prompt-title">${escapeHtml(prompt.title)}</div>
        <div class="prompt-site">${escapeHtml(prompt.site)}</div>
      </div>
      <div class="prompt-preview">${preview}</div>
      <div class="prompt-meta">
        <div class="prompt-date">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>${dateStr}</span>
        </div>
        <div class="prompt-card-actions">
          <button class="action-icon-btn delete" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `;

        // Click to open link
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.action-icon-btn')) {
                chrome.tabs.create({ url: prompt.url });
            }
        });

        // Delete button
        const deleteBtn = card.querySelector('.delete');
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(`Delete "${prompt.title}"?`)) {
                await deletePrompt(prompt.id);
                await loadPrompts();
            }
        });

        return card;
    }

    async function deletePrompt(promptId) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { action: 'deletePrompt', promptId },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Delete error:', chrome.runtime.lastError);
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(response);
                    }
                }
            );
        });
    }

    function filterPrompts(searchTerm) {
        if (!searchTerm) {
            displayPrompts(allPrompts);
            return;
        }

        const filtered = allPrompts.filter(prompt => {
            return (
                prompt.title.toLowerCase().includes(searchTerm) ||
                prompt.text.toLowerCase().includes(searchTerm) ||
                prompt.site.toLowerCase().includes(searchTerm)
            );
        });

        displayPrompts(filtered);
    }

    function updateFooter() {
        const count = allPrompts.length;
        promptCount.textContent = count === 1 ? '1 prompt' : `${count} prompts`;

        if (count > 0) {
            clearAllBtn.style.display = 'block';
        } else {
            clearAllBtn.style.display = 'none';
        }
    }

    function formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return 'Today';
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
