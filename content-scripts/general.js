// True Dark Mode - General Content Script (Smart Dark Mode)
(function() {
  'use strict';

  // Prevent multiple injections
  if (window.__trueDarkModeInjected) return;
  window.__trueDarkModeInjected = true;

  const api = typeof browser !== 'undefined' ? browser : chrome;

  // Default settings
  const DEFAULT_SETTINGS = {
    enabled: true,
    brightness: 100,
    contrast: 100,
    sepia: 0,
    grayscale: 0,
    generalMode: true,
    disabledSites: [],
    whitelist: []
  };

  // Smart CSS that doesn't invert brand colors
  function generateSmartCSS(settings) {
    const brightness = settings.brightness || 100;
    const contrast = settings.contrast || 100;
    const sepia = settings.sepia || 0;
    const grayscale = settings.grayscale || 0;

    return `
      /* ===== TRUE DARK MODE - SMART DARK THEME ===== */

      /* Root variables - Soft dark (like Chrome's dark mode) */
      :root {
        --tdm-bg-primary: #202124;
        --tdm-bg-secondary: #292a2d;
        --tdm-bg-tertiary: #35363a;
        --tdm-text-primary: #e8eaed;
        --tdm-text-secondary: #9aa0a6;
        --tdm-border: #3c4043;
      }

      /* Apply filter adjustments to html */
      html.true-dark-mode {
        filter: brightness(${brightness}%)
                contrast(${contrast}%)
                sepia(${sepia}%)
                grayscale(${grayscale}%);
      }

      /* Dark backgrounds for common elements */
      html.true-dark-mode body,
      html.true-dark-mode main,
      html.true-dark-mode article,
      html.true-dark-mode section,
      html.true-dark-mode aside,
      html.true-dark-mode footer,
      html.true-dark-mode div[class*="container"],
      html.true-dark-mode div[class*="wrapper"],
      html.true-dark-mode div[class*="content"],
      html.true-dark-mode div[class*="page"],
      html.true-dark-mode div[class*="main"],
      html.true-dark-mode div[class*="body"] {
        background-color: var(--tdm-bg-primary) !important;
      }

      /* White/light backgrounds to dark */
      html.true-dark-mode *[style*="background-color: rgb(255, 255, 255)"],
      html.true-dark-mode *[style*="background-color: #fff"],
      html.true-dark-mode *[style*="background-color: #FFF"],
      html.true-dark-mode *[style*="background-color: white"],
      html.true-dark-mode *[style*="background: rgb(255, 255, 255)"],
      html.true-dark-mode *[style*="background: #fff"],
      html.true-dark-mode *[style*="background: white"] {
        background-color: var(--tdm-bg-primary) !important;
      }

      /* Light gray backgrounds to darker */
      html.true-dark-mode *[style*="background-color: rgb(245"],
      html.true-dark-mode *[style*="background-color: rgb(248"],
      html.true-dark-mode *[style*="background-color: rgb(250"],
      html.true-dark-mode *[style*="background-color: #f"] {
        background-color: var(--tdm-bg-secondary) !important;
      }

      /* Text colors - dark text to light */
      html.true-dark-mode body,
      html.true-dark-mode p,
      html.true-dark-mode span,
      html.true-dark-mode div,
      html.true-dark-mode li,
      html.true-dark-mode td,
      html.true-dark-mode th,
      html.true-dark-mode label,
      html.true-dark-mode a {
        color: var(--tdm-text-primary) !important;
      }

      /* Headings */
      html.true-dark-mode h1,
      html.true-dark-mode h2,
      html.true-dark-mode h3,
      html.true-dark-mode h4,
      html.true-dark-mode h5,
      html.true-dark-mode h6 {
        color: #ffffff !important;
      }

      /* Keep link colors visible but lighter */
      html.true-dark-mode a:not([class*="btn"]):not([class*="button"]) {
        color: #6db3f2 !important;
      }

      html.true-dark-mode a:visited:not([class*="btn"]):not([class*="button"]) {
        color: #b794f6 !important;
      }

      /* Borders */
      html.true-dark-mode *[style*="border"] {
        border-color: var(--tdm-border) !important;
      }

      html.true-dark-mode hr {
        border-color: var(--tdm-border) !important;
        background-color: var(--tdm-border) !important;
      }

      /* Tables */
      html.true-dark-mode table,
      html.true-dark-mode tr,
      html.true-dark-mode td,
      html.true-dark-mode th {
        background-color: var(--tdm-bg-secondary) !important;
        border-color: var(--tdm-border) !important;
      }

      html.true-dark-mode th {
        background-color: var(--tdm-bg-tertiary) !important;
      }

      /* Form elements */
      html.true-dark-mode input,
      html.true-dark-mode textarea,
      html.true-dark-mode select {
        background-color: var(--tdm-bg-secondary) !important;
        color: var(--tdm-text-primary) !important;
        border-color: var(--tdm-border) !important;
        color-scheme: dark;
      }

      html.true-dark-mode input::placeholder,
      html.true-dark-mode textarea::placeholder {
        color: var(--tdm-text-secondary) !important;
      }

      /* Cards and boxes */
      html.true-dark-mode [class*="card"],
      html.true-dark-mode [class*="Card"],
      html.true-dark-mode [class*="box"],
      html.true-dark-mode [class*="Box"],
      html.true-dark-mode [class*="panel"],
      html.true-dark-mode [class*="Panel"],
      html.true-dark-mode [class*="modal"],
      html.true-dark-mode [class*="Modal"],
      html.true-dark-mode [class*="dropdown"],
      html.true-dark-mode [class*="Dropdown"],
      html.true-dark-mode [class*="menu"],
      html.true-dark-mode [class*="Menu"] {
        background-color: var(--tdm-bg-secondary) !important;
        border-color: var(--tdm-border) !important;
      }

      /* Navigation */
      html.true-dark-mode nav,
      html.true-dark-mode [class*="nav"],
      html.true-dark-mode [class*="Nav"],
      html.true-dark-mode [class*="sidebar"],
      html.true-dark-mode [class*="Sidebar"] {
        background-color: var(--tdm-bg-secondary) !important;
      }

      /* Headers - keep brand colors but ensure visibility */
      html.true-dark-mode header,
      html.true-dark-mode [class*="header"],
      html.true-dark-mode [class*="Header"] {
        /* Don't override - let brand colors show */
      }

      /* Preserve images - no filter needed */
      html.true-dark-mode img,
      html.true-dark-mode video,
      html.true-dark-mode picture,
      html.true-dark-mode canvas,
      html.true-dark-mode svg {
        /* Keep original - don't invert */
      }

      /* Scrollbar styling */
      html.true-dark-mode ::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }
      html.true-dark-mode ::-webkit-scrollbar-track {
        background: var(--tdm-bg-primary);
      }
      html.true-dark-mode ::-webkit-scrollbar-thumb {
        background: #555;
        border-radius: 6px;
        border: 2px solid var(--tdm-bg-primary);
      }
      html.true-dark-mode ::-webkit-scrollbar-thumb:hover {
        background: #666;
      }

      /* Code blocks */
      html.true-dark-mode pre,
      html.true-dark-mode code {
        background-color: #1e1e1e !important;
        color: #d4d4d4 !important;
      }

      /* Blockquotes */
      html.true-dark-mode blockquote {
        background-color: var(--tdm-bg-tertiary) !important;
        border-left-color: #667eea !important;
      }

      /* Selection */
      html.true-dark-mode ::selection {
        background-color: #667eea !important;
        color: #ffffff !important;
      }
    `;
  }

  // Alternative: Invert-based CSS for sites where smart mode doesn't work well
  function generateInvertCSS(settings) {
    const brightness = settings.brightness || 100;
    const contrast = settings.contrast || 100;
    const sepia = settings.sepia || 0;
    const grayscale = settings.grayscale || 0;

    return `
      html.true-dark-mode-invert {
        filter: invert(90%) hue-rotate(180deg)
                brightness(${brightness}%)
                contrast(${contrast}%)
                sepia(${sepia}%)
                grayscale(${grayscale}%) !important;
        background-color: #fff !important;
      }

      /* Re-invert images */
      html.true-dark-mode-invert img,
      html.true-dark-mode-invert video,
      html.true-dark-mode-invert iframe,
      html.true-dark-mode-invert canvas,
      html.true-dark-mode-invert picture,
      html.true-dark-mode-invert svg image,
      html.true-dark-mode-invert [style*="background-image"] {
        filter: invert(100%) hue-rotate(180deg) !important;
      }
    `;
  }

  // Apply dark mode
  function applyDarkMode(settings) {
    document.documentElement.classList.add('true-dark-mode');
    document.documentElement.classList.remove('true-dark-mode-invert');

    let styleEl = document.getElementById('true-dark-mode-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'true-dark-mode-styles';
      document.head.appendChild(styleEl);
    }

    // Use smart CSS by default
    styleEl.textContent = generateSmartCSS(settings);

    // Also process inline styles
    processInlineStyles();
  }

  // Process elements with inline white backgrounds
  function processInlineStyles() {
    // Find elements with light backgrounds and darken them
    const elements = document.querySelectorAll('*');

    elements.forEach(el => {
      const computedStyle = window.getComputedStyle(el);
      const bgColor = computedStyle.backgroundColor;

      if (bgColor) {
        const rgb = bgColor.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          const r = parseInt(rgb[0]);
          const g = parseInt(rgb[1]);
          const b = parseInt(rgb[2]);

          // Check if it's a light color (high luminance)
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          if (luminance > 0.8) {
            // Very light - make soft dark
            el.style.setProperty('background-color', '#202124', 'important');
          } else if (luminance > 0.6) {
            // Light-ish - make medium soft dark
            el.style.setProperty('background-color', '#292a2d', 'important');
          }
          // Keep colored backgrounds (luminance < 0.6) as they are
        }
      }

      // Handle text colors
      const textColor = computedStyle.color;
      if (textColor) {
        const rgb = textColor.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          const r = parseInt(rgb[0]);
          const g = parseInt(rgb[1]);
          const b = parseInt(rgb[2]);

          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          if (luminance < 0.3) {
            // Dark text - make light
            el.style.setProperty('color', '#e0e0e0', 'important');
          }
        }
      }
    });
  }

  // Remove dark mode
  function removeDarkMode() {
    document.documentElement.classList.remove('true-dark-mode');
    document.documentElement.classList.remove('true-dark-mode-invert');
    const styleEl = document.getElementById('true-dark-mode-styles');
    if (styleEl) {
      styleEl.remove();
    }
  }

  // Check and apply settings
  async function init() {
    try {
      let settings;
      try {
        settings = await api.runtime.sendMessage({ action: 'getSettings' });
      } catch (e) {
        settings = DEFAULT_SETTINGS;
      }

      settings = { ...DEFAULT_SETTINGS, ...settings };

      if (!settings.enabled || !settings.generalMode) {
        removeDarkMode();
        return;
      }

      const hostname = window.location.hostname;

      if (settings.whitelist?.includes(hostname)) {
        removeDarkMode();
        return;
      }

      if (settings.disabledSites?.includes(hostname)) {
        removeDarkMode();
        return;
      }

      applyDarkMode(settings);

    } catch (e) {
      console.log('True Dark Mode: Error', e);
      applyDarkMode(DEFAULT_SETTINGS);
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

  // Debounced style processing for dynamic content
  let processTimeout;
  function debouncedProcess() {
    clearTimeout(processTimeout);
    processTimeout = setTimeout(() => {
      if (document.documentElement.classList.contains('true-dark-mode')) {
        processInlineStyles();
      }
    }, 500);
  }

  // Observe DOM changes
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        shouldProcess = true;
      }
    });
    if (shouldProcess) {
      debouncedProcess();
    }
  });

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      observer.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    init();
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

})();
