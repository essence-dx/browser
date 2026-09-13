// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { getBoolPrefSync, getAppInfo } from "../../adapters/prefs.mjs";
import { getSelectedTabSync } from "../../adapters/tabs.mjs";
import { getAllWindows } from "../../adapters/windows.mjs";
// Gecko now (tab strip selection below); Chromium: chrome.tabs.query —
// same tabs-adapter surface.

window.gZenOperatingSystemCommonUtils = {
  kZenOSToSmallName: {
    WINNT: "windows",
    Darwin: "macos",
    Linux: "linux",
  },

  get currentOperatingSystem() {
    let os = getAppInfo().OS;
    return this.kZenOSToSmallName[os];
  },
};

export class nsZenMultiWindowFeature {
  constructor() {}

  // Sync snapshot for `for...of` loops; refreshed by the async iterators
  // below via adapters/windows.mjs (window mediator on Gecko, chrome.windows
  // on Chromium). Falls back to this window before the first refresh.
  static #knownWindows = null;

  static get browsers() {
    return nsZenMultiWindowFeature.#knownWindows ?? [window];
  }

  static get currentBrowser() {
    return window;
  }

  static get isActiveWindow() {
    return nsZenMultiWindowFeature.currentBrowser === window;
  }

  windowIsActive(browser) {
    return browser === nsZenMultiWindowFeature.currentBrowser;
  }

  async foreachWindowAsActive(callback) {
    if (!nsZenMultiWindowFeature.isActiveWindow) {
      return;
    }
    await this.forEachWindow(callback);
  }

  async forEachWindow(callback) {
    let wins;
    try {
      wins = await getAllWindows();
    } catch {
      wins = [window];
    }
    nsZenMultiWindowFeature.#knownWindows = wins;
    for (const browser of wins) {
      try {
        if (browser.closed) {
          continue;
        }
        await callback(browser);
      } catch (e) {
        console.error(e);
      }
    }
  }

  forEachWindowSync(callback) {
    for (const browser of nsZenMultiWindowFeature.browsers) {
      try {
        if (browser.closed) {
          continue;
        }
        callback(browser);
      } catch (e) {
        console.error(e);
      }
    }
  }
}

export class nsZenDOMOperatedFeature {
  constructor() {
    var initBound = this.init.bind(this);
    document.addEventListener("DOMContentLoaded", initBound, { once: true });
  }
}

export class nsZenPreloadedFeature {
  constructor() {
    var initBound = this.init.bind(this);
    document.addEventListener("MozBeforeInitialXULLayout", initBound, {
      once: true,
    });
  }
}

window.gZenCommonActions = {
  copyCurrentURLToClipboard() {
    const [currentUrl, ClipboardHelper] = gURLBar.zenStrippedURI;
    let displaySpec = currentUrl.displaySpec;

    try {
      if (
        getBoolPrefSync("browser.urlbar.decodeURLsOnCopy", false) &&
        !currentUrl.schemeIs("data")
      ) {
        displaySpec = decodeURI(displaySpec);
      }
    } catch (e) {}

    ClipboardHelper.copyString(displaySpec);

    let button;
    if (
      typeof navigator.share === "function" &&
      displaySpec.startsWith("http")
    ) {
      button = {
        id: "zen-copy-current-url-button",
        command: () => {
          // Native share sheet; the anchor rect used by the old desktop
          // share call has no equivalent in the Web Share API.
          navigator.share({ url: displaySpec }).catch(() => {});
        },
      };
    }
    gZenUIManager.showToast("zen-copy-current-url-confirmation", {
      button,
      timeout: 3000,
    });
  },

  copyCurrentURLAsMarkdownToClipboard() {
    const [currentUrl, ClipboardHelper] = gURLBar.zenStrippedURI;
    const tabTitle = getSelectedTabSync().label;
    let displaySpec = currentUrl.displaySpec;

    try {
      if (
        getBoolPrefSync("browser.urlbar.decodeURLsOnCopy", false) &&
        !currentUrl.schemeIs("data")
      ) {
        displaySpec = decodeURI(displaySpec);
      }
    } catch (e) {}

    const markdownLink = `[${tabTitle}](${displaySpec})`;
    ClipboardHelper.copyString(markdownLink);

    gZenUIManager.showToast("zen-copy-current-url-as-markdown-confirmation", {
      timeout: 3000,
    });
  },

  throttle(f, delay) {
    let timer = 0;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => f.apply(this, args), delay);
    };
  },

  /**
   * Determines if a tab should be closed when navigating back with no history.
   * Only tabs with an owner that are not pinned and not empty are eligible.
   * Respects the user preference zen.tabs.close-on-back-with-no-history.
   *
   * @returns {boolean} True if the tab should be closed on back
   */
  shouldCloseTabOnBack() {
    if (
      !getBoolPrefSync(
        "zen.tabs.close-on-back-with-no-history",
        true
      )
    ) {
      return false;
    }
    const tab = getSelectedTabSync();
    return Boolean(
      tab.owner && !tab.pinned && !tab.hasAttribute("zen-empty-tab")
    );
  },
};
