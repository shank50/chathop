# ChatHop

A powerful extension that helps you navigate and save prompts across multiple LLM platforms including ChatGPT, Claude, Gemini, Grok, and Deepseek.

## Features

**Quick Navigation**: Jump to any prompt in your current chat conversation with a single click

**Save Prompts**: Bookmark important prompts with custom titles for easy access later

**Cross-Platform Support**: Works seamlessly across:
- ChatGPT (chatgpt.com, chat.openai.com)
- Claude (claude.ai)
- Gemini (gemini.google.com)
- Grok (grok.x.ai)
- Deepseek (*.deepseek.com)

**Dark Matte UI**: Sleek, minimalist design that's easy on the eyes

**Fast & Lightweight**: Minimal performance impact on your browsing experience

## Installation

### From Source (Developer Mode)

1. **Download or Clone** this repository to your local machine

2. **Open Chrome or any Chromium browser like Edge/Brave** and navigate to `chrome://extensions/`

3. **Enable Developer Mode** by toggling the switch in the top-right corner

4. **Click "Load unpacked"** and select the  folder

5. **Done!** The extension icon should now appear in your Chrome toolbar

## Usage

### Navigating Prompts in Current Chat

1. Visit any supported LLM website and open a chat conversation
2. Look for the **floating dark icon** with a chat bubble in the top-right corner of the page
3. Click to expand and see all your prompts in the current chat
4. Click any prompt to instantly scroll to it

### Saving Prompts

1. In the expanded overlay, click the **save icon** next to any prompt
2. Enter a descriptive title for the prompt
3. Click "Save"
4. Your prompt is now bookmarked with the chat URL and position

### Accessing Saved Prompts

**Method 1: Via Overlay**
1. Click the extension widget on any LLM page
2. Switch to the "Saved" tab
3. Click any saved prompt to open it in a new tab
4. You can hide the overlay by pressing Ctrl+Shift+H

**Method 2: Via Extension Popup**
1. Click the extension icon in your Chrome toolbar
2. Browse all saved prompts
3. Use the search bar to filter prompts
4. Click to open or delete saved prompts

## File Structure

```
ext/
├── manifest.json                 # Extension configuration
├── background.js                 # Service worker
├── README.md                     # This file
├── icons/                        # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── utils/
│   └── storage.js               # Storage utility functions
├── content/
│   ├── content-script.js        # Main content script
│   ├── overlay.js               # Overlay widget logic
│   ├── overlay.css              # Overlay styles
│   ├── adapter-factory.js       # Site adapter factory
│   └── adapters/
│       ├── base-adapter.js      # Base adapter class
│       ├── chatgpt-adapter.js   # ChatGPT implementation
│       ├── claude-adapter.js    # Claude implementation
│       ├── gemini-adapter.js    # Gemini implementation
│       ├── grok-adapter.js      # Grok implementation
│       └── deepseek-adapter.js  # Deepseek implementation
└── popup/
    ├── popup.html               # Popup interface
    ├── popup.css                # Popup styles
    └── popup.js                 # Popup logic
```

## Architecture

The extension uses an **adapter pattern** to support multiple LLM platforms:

- **Base Adapter**: Defines the common interface for all sites
- **Site-Specific Adapters**: Each LLM platform has its own adapter that handles:
  - Detecting user prompts in the DOM
  - Extracting chat IDs from URLs
  - Scrolling to specific prompts
  
This architecture makes it easy to add support for new platforms in the future.

## Permissions

The extension requires the following permissions:

- `storage`: To save your bookmarked prompts
- `activeTab`: To access the current tab when you click the extension
- **Host Permissions**: Access to supported LLM websites to inject the navigation overlay

All data is stored locally using Chrome's storage API. Nothing is sent to external servers.

## Privacy

- All data stays on your device
- No external API calls
- No telemetry or tracking
- Open source code you can inspect

