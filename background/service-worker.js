// True Dark Mode - Service Worker
const api = typeof browser !== 'undefined' ? browser : chrome;

// Default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  brightness: 100,
  contrast: 100,
  sepia: 0,
  grayscale: 0,
  whitelist: [],
  disabledSites: [],
  googleDocs: true,
  googleSheets: true,
  generalMode: true
};

// Initialize extension on install
api.runtime.onInstalled.addListener(async () => {
  const existing = await api.storage.sync.get(null);
  if (!existing.enabled) {
    await api.storage.sync.set(DEFAULT_SETTINGS);
  }
  console.log('True Dark Mode installed');
});

// Listen for messages from popup or content scripts
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSettings') {
    api.storage.sync.get(null).then(settings => {
      sendResponse({ ...DEFAULT_SETTINGS, ...settings });
    });
    return true;
  }

  if (message.action === 'updateSettings') {
    api.storage.sync.set(message.settings).then(() => {
      // Notify all tabs to update
      api.tabs.query({}).then(tabs => {
        tabs.forEach(tab => {
          api.tabs.sendMessage(tab.id, {
            action: 'settingsUpdated',
            settings: message.settings
          }).catch(() => {});
        });
      });
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === 'toggleSite') {
    api.storage.sync.get(['disabledSites']).then(({ disabledSites = [] }) => {
      const hostname = message.hostname;
      const index = disabledSites.indexOf(hostname);

      if (index > -1) {
        disabledSites.splice(index, 1);
      } else {
        disabledSites.push(hostname);
      }

      api.storage.sync.set({ disabledSites }).then(() => {
        sendResponse({ disabled: index === -1, disabledSites });
      });
    });
    return true;
  }

  if (message.action === 'injectDarkMode') {
    // Inject dark mode CSS into the current tab
    api.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs[0]) {
        injectDarkMode(tabs[0].id, message.settings);
        sendResponse({ success: true });
      }
    });
    return true;
  }
});

// Inject dark mode into a tab
async function injectDarkMode(tabId, settings) {
  try {
    await api.scripting.executeScript({
      target: { tabId },
      files: ['content-scripts/general.js']
    });
  } catch (e) {
    console.log('Could not inject script:', e);
  }
}

// Listen for tab updates to apply dark mode
api.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const settings = await api.storage.sync.get(null);
    const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };

    if (!mergedSettings.enabled || !mergedSettings.generalMode) return;

    // Check if site is in whitelist or disabled
    try {
      const url = new URL(tab.url);
      const hostname = url.hostname;

      if (mergedSettings.whitelist.includes(hostname)) return;
      if (mergedSettings.disabledSites.includes(hostname)) return;

      // Skip sites with dedicated content scripts
      if (hostname === 'docs.google.com' || hostname === 'sheets.google.com') return;

      // Skip sites with native dark mode
      const sitesWithNativeDarkMode = [
        'wikipedia.org',
        'vercel.com',
        'github.com',
        'youtube.com',
        'twitter.com',
        'x.com',
        'reddit.com',
        'discord.com',
        'slack.com',
        'notion.so',
        'figma.com',
        'linear.app',
        'spotify.com',
        'netflix.com',
      ];

      if (sitesWithNativeDarkMode.some(site => hostname.endsWith(site))) return;

      // Inject general dark mode
      await api.scripting.executeScript({
        target: { tabId },
        files: ['content-scripts/general.js']
      });
    } catch (e) {
      // Ignore errors for chrome:// pages etc.
    }
  }
});
