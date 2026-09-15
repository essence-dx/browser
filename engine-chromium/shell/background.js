/* Zen Chromium shell background — session + omnibox wiring. */
/* Mirrors sessionstore/ (chrome.sessions) + urlbar/ (chrome.omnibox) adapters. */

try {
  chrome.sessions?.onChanged?.addListener?.(() => {});
} catch {}

try {
  chrome.omnibox?.onInputEntered?.addListener?.((text) => {
    chrome.tabs?.query?.({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id !== undefined) {
        chrome.tabs.update(tab.id, { url: text });
      }
    });
  });
} catch {}
