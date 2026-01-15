// True Dark Mode - Google Sheets Content Script
(function() {
  'use strict';

  const api = typeof browser !== 'undefined' ? browser : chrome;

  // Apply dark mode immediately for faster visual response
  function applyImmediately() {
    document.documentElement.classList.add('true-dark-mode');
  }

  // Check settings and apply/remove dark mode
  async function init() {
    try {
      let settings;
      try {
        settings = await api.runtime.sendMessage({ action: 'getSettings' });
      } catch (e) {
        // Extension context may be invalid, apply anyway
        applyImmediately();
        return;
      }

      // Check if enabled
      if (!settings || !settings.enabled || settings.googleSheets === false) {
        document.documentElement.classList.remove('true-dark-mode');
        return;
      }

      // Check if site is disabled
      const hostname = window.location.hostname;
      if (settings.disabledSites?.includes(hostname)) {
        document.documentElement.classList.remove('true-dark-mode');
        return;
      }

      // Apply dark mode
      applyImmediately();

    } catch (e) {
      console.log('True Dark Mode: Could not load settings', e);
      // Apply anyway on error
      applyImmediately();
    }
  }

  // Listen for settings updates
  try {
    api.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'settingsUpdated') {
        init();
      }
    });
  } catch (e) {}

  // Apply immediately on script load (before DOM is ready)
  applyImmediately();

  // Re-check when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
