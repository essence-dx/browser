// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { nsZenPreloadedFeature } from "./ZenCommonUtils.mjs";
import { getAllWindowsRestoredPromise } from "../../adapters/session.mjs";
// Gecko SessionStore init gate; Chromium: chrome.sessions / storage.session —
// same adapter surface (see adapters/session.mjs).

class ZenSessionStore extends nsZenPreloadedFeature {
  init() {
    this.#waitAndCleanup();
  }

  promiseInitialized = new Promise(resolve => {
    this._resolveInitialized = resolve;
  });

  restoreInitialTabData(tab, tabData) {
    if (tabData.zenWorkspace) {
      tab.setAttribute("zen-workspace-id", tabData.zenWorkspace);
    }
    if (tabData.zenLiveFolderItemId) {
      tab.setAttribute("zen-live-folder-item-id", tabData.zenLiveFolderItemId);
    }
    // Keep for now, for backward compatibility for window sync to work.
    if (tabData.zenSyncId || tabData.zenPinnedId) {
      tab.setAttribute("id", tabData.zenSyncId || tabData.zenPinnedId);
    }
    if (typeof tabData.zenStaticLabel === "string") {
      tab.zenStaticLabel = tabData.zenStaticLabel;
    }
    if (tabData.zenHasStaticIcon && tabData.image) {
      tab.zenStaticIcon = tabData.image;
    }
    if (tabData.zenEssential) {
      tab.setAttribute("zen-essential", "true");
    }
    if (tabData.zenDefaultUserContextId) {
      tab.setAttribute("zenDefaultUserContextId", "true");
    }
    if (tabData._zenPinnedInitialState) {
      tab._zenPinnedInitialState = tabData._zenPinnedInitialState;
    }
  }

  async #waitAndCleanup() {
    await getAllWindowsRestoredPromise();
    this.#cleanup();
  }

  #cleanup() {
    this._resolveInitialized();
  }
}

window.gZenSessionStore = new ZenSessionStore();
