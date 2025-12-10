// background service worker for chathop

chrome.runtime.onInstalled.addListener(() => {
  console.log('ChatHop installed');

  // init storage
  chrome.storage.sync.get(['savedPrompts'], (result) => {
    if (!result.savedPrompts) {
      chrome.storage.sync.set({ savedPrompts: [] });
    }
  });
});

// handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'savePrompt') {
    chrome.storage.sync.get(['savedPrompts'], (result) => {
      const savedPrompts = result.savedPrompts || [];
      savedPrompts.push(request.prompt);

      chrome.storage.sync.set({ savedPrompts }, () => {
        sendResponse({ success: true });
      });
    });
    return true; // keep channel open for async
  }

  if (request.action === 'getSavedPrompts') {
    chrome.storage.sync.get(['savedPrompts'], (result) => {
      sendResponse({ prompts: result.savedPrompts || [] });
    });
    return true;
  }

  if (request.action === 'deletePrompt') {
    chrome.storage.sync.get(['savedPrompts'], (result) => {
      let savedPrompts = result.savedPrompts || [];
      savedPrompts = savedPrompts.filter(p => p.id !== request.promptId);

      chrome.storage.sync.set({ savedPrompts }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
});

// handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-overlay') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleOverlay' });
      }
    });
  }
});
