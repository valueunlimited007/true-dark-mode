// True Dark Mode - Options Page Script
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

// DOM Elements
const whitelistInput = document.getElementById('whitelistInput');
const addWhitelistBtn = document.getElementById('addWhitelist');
const whitelistItems = document.getElementById('whitelistItems');
const disabledSitesItems = document.getElementById('disabledSitesItems');
const googleDocsToggle = document.getElementById('googleDocsToggle');
const googleSheetsToggle = document.getElementById('googleSheetsToggle');
const generalModeToggle = document.getElementById('generalModeToggle');
const resetSettingsBtn = document.getElementById('resetSettings');

let currentSettings = {};

// Initialize
async function init() {
  currentSettings = await api.runtime.sendMessage({ action: 'getSettings' });
  currentSettings = { ...DEFAULT_SETTINGS, ...currentSettings };
  updateUI();
}

// Update UI
function updateUI() {
  // Render whitelist
  renderList(whitelistItems, currentSettings.whitelist || [], 'whitelist');

  // Render disabled sites
  renderList(disabledSitesItems, currentSettings.disabledSites || [], 'disabledSites');

  // Set toggles
  googleDocsToggle.checked = currentSettings.googleDocs !== false;
  googleSheetsToggle.checked = currentSettings.googleSheets !== false;
  generalModeToggle.checked = currentSettings.generalMode !== false;
}

// Render a list
function renderList(container, items, type) {
  container.innerHTML = '';

  if (items.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'empty-message';
    emptyMsg.textContent = type === 'whitelist'
      ? 'No sites in whitelist'
      : 'No disabled sites';
    container.appendChild(emptyMsg);
    return;
  }

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'list-item';

    const span = document.createElement('span');
    span.textContent = item;

    const btn = document.createElement('button');
    btn.innerHTML = '&times;';
    btn.title = 'Remove';
    btn.addEventListener('click', () => removeItem(type, item));

    div.appendChild(span);
    div.appendChild(btn);
    container.appendChild(div);
  });
}

// Add to whitelist
async function addToWhitelist() {
  let url = whitelistInput.value.trim();

  if (!url) return;

  // Extract hostname if full URL is provided
  try {
    if (url.includes('://')) {
      url = new URL(url).hostname;
    } else if (url.startsWith('www.')) {
      url = url.substring(4);
    }
  } catch (e) {
    // Use as-is
  }

  if (!currentSettings.whitelist) {
    currentSettings.whitelist = [];
  }

  if (!currentSettings.whitelist.includes(url)) {
    currentSettings.whitelist.push(url);
    await saveSettings();
    whitelistInput.value = '';
    updateUI();
  }
}

// Remove item from list
async function removeItem(type, item) {
  if (type === 'whitelist') {
    currentSettings.whitelist = currentSettings.whitelist.filter(i => i !== item);
  } else if (type === 'disabledSites') {
    currentSettings.disabledSites = currentSettings.disabledSites.filter(i => i !== item);
  }

  await saveSettings();
  updateUI();
}

// Save settings
async function saveSettings() {
  await api.runtime.sendMessage({
    action: 'updateSettings',
    settings: currentSettings
  });
}

// Reset all settings
async function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    currentSettings = { ...DEFAULT_SETTINGS };
    await api.storage.sync.clear();
    await api.storage.sync.set(DEFAULT_SETTINGS);
    updateUI();
    alert('Settings have been reset.');
  }
}

// Event Listeners

addWhitelistBtn.addEventListener('click', addToWhitelist);

whitelistInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addToWhitelist();
  }
});

googleDocsToggle.addEventListener('change', async () => {
  currentSettings.googleDocs = googleDocsToggle.checked;
  await saveSettings();
});

googleSheetsToggle.addEventListener('change', async () => {
  currentSettings.googleSheets = googleSheetsToggle.checked;
  await saveSettings();
});

generalModeToggle.addEventListener('change', async () => {
  currentSettings.generalMode = generalModeToggle.checked;
  await saveSettings();
});

resetSettingsBtn.addEventListener('click', resetSettings);

// Initialize
init();
