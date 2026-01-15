// True Dark Mode - Popup Script
const api = typeof browser !== 'undefined' ? browser : chrome;

// Sites with native dark mode (auto-skipped)
const SITES_WITH_NATIVE_DARK_MODE = [
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

// DOM Elements
const toggleOn = document.getElementById('toggleOn');
const toggleOff = document.getElementById('toggleOff');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const sepiaSlider = document.getElementById('sepia');
const grayscaleSlider = document.getElementById('grayscale');
const disableSiteBtn = document.getElementById('disableSite');
const disableSiteText = document.getElementById('disableSiteText');
const disableHint = document.getElementById('disableHint');
const openSettingsBtn = document.getElementById('openSettings');
const reportIssueBtn = document.getElementById('reportIssue');
const statusBanner = document.getElementById('statusBanner');
const statusText = document.getElementById('statusText');

let currentSettings = {};
let currentHostname = '';

// Check if site has native dark mode
function hasNativeDarkMode(hostname) {
  return SITES_WITH_NATIVE_DARK_MODE.some(site => hostname.endsWith(site));
}

// Initialize popup
async function init() {
  // Get current settings
  currentSettings = await api.runtime.sendMessage({ action: 'getSettings' });

  // Get current tab hostname
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    try {
      const url = new URL(tab.url);
      currentHostname = url.hostname;
    } catch (e) {
      currentHostname = '';
    }
  }

  updateUI();
}

// Update UI based on settings
function updateUI() {
  // Toggle state
  if (currentSettings.enabled) {
    toggleOn.classList.add('active');
    toggleOff.classList.remove('active');
    document.body.classList.remove('dark-mode-off');
  } else {
    toggleOff.classList.add('active');
    toggleOn.classList.remove('active');
    document.body.classList.add('dark-mode-off');
  }

  // Sliders
  brightnessSlider.value = currentSettings.brightness || 100;
  contrastSlider.value = currentSettings.contrast || 100;
  sepiaSlider.value = currentSettings.sepia || 0;
  grayscaleSlider.value = currentSettings.grayscale || 0;

  updateSliderValues();

  // Check site status
  const isNativeDark = hasNativeDarkMode(currentHostname);
  const isUserSkipped = currentSettings.disabledSites?.includes(currentHostname);

  // Status banner
  if (isNativeDark) {
    statusBanner.classList.remove('hidden', 'user-skipped');
    statusBanner.classList.add('native-dark');
    statusText.textContent = 'This site has native dark mode';
  } else if (isUserSkipped) {
    statusBanner.classList.remove('hidden', 'native-dark');
    statusBanner.classList.add('user-skipped');
    statusText.textContent = 'You skipped this site';
  } else {
    statusBanner.classList.add('hidden');
  }

  // Disable site button
  if (isUserSkipped) {
    disableSiteText.textContent = 'Enable dark mode';
    disableSiteBtn.classList.add('disabled');
    disableHint.textContent = 'Click to re-enable dark mode on this site';
  } else {
    disableSiteText.textContent = 'Skip this site';
    disableSiteBtn.classList.remove('disabled');
    disableHint.textContent = 'Site has its own dark mode? Skip it.';
  }
}

// Update slider value displays
function updateSliderValues() {
  document.getElementById('brightness-value').textContent = `${brightnessSlider.value}%`;
  document.getElementById('contrast-value').textContent = `${contrastSlider.value}%`;
  document.getElementById('sepia-value').textContent = `${sepiaSlider.value}%`;
  document.getElementById('grayscale-value').textContent = `${grayscaleSlider.value}%`;
}

// Save settings
async function saveSettings() {
  await api.runtime.sendMessage({
    action: 'updateSettings',
    settings: currentSettings
  });

  // Reload current tab to apply changes
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    api.tabs.reload(tab.id);
  }
}

// Event Listeners

// Toggle On/Off
toggleOn.addEventListener('click', async () => {
  currentSettings.enabled = true;
  updateUI();
  await saveSettings();
});

toggleOff.addEventListener('click', async () => {
  currentSettings.enabled = false;
  updateUI();
  await saveSettings();
});

// Sliders
const sliders = [brightnessSlider, contrastSlider, sepiaSlider, grayscaleSlider];

sliders.forEach(slider => {
  slider.addEventListener('input', () => {
    currentSettings[slider.id] = parseInt(slider.value);
    updateSliderValues();
  });

  slider.addEventListener('change', saveSettings);
});

// Slider buttons
document.querySelectorAll('.slider-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    const slider = document.getElementById(target);
    const step = 5;

    if (btn.classList.contains('minus')) {
      slider.value = Math.max(slider.min, parseInt(slider.value) - step);
    } else {
      slider.value = Math.min(slider.max, parseInt(slider.value) + step);
    }

    currentSettings[target] = parseInt(slider.value);
    updateSliderValues();
    saveSettings();
  });
});

// Disable/Enable for site
disableSiteBtn.addEventListener('click', async () => {
  if (!currentHostname) return;

  const response = await api.runtime.sendMessage({
    action: 'toggleSite',
    hostname: currentHostname
  });

  currentSettings.disabledSites = response.disabledSites;
  updateUI();

  // Reload tab
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    api.tabs.reload(tab.id);
  }
});

// Report issue
reportIssueBtn.addEventListener('click', async () => {
  const issueUrl = new URL('https://github.com/valueunlimited007/true-dark-mode/issues/new');
  issueUrl.searchParams.set('title', `[Site Fix] ${currentHostname}`);
  issueUrl.searchParams.set('body', `## Site\n${currentHostname}\n\n## Problem\nDescribe what's not working...\n\n## Screenshot\nAdd a screenshot if possible`);
  issueUrl.searchParams.set('labels', 'site-fix');

  api.tabs.create({ url: issueUrl.toString() });
});

// Open settings
openSettingsBtn.addEventListener('click', (e) => {
  e.preventDefault();
  api.runtime.openOptionsPage();
});

// Initialize
init();
