/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global SessionStore, PlacesUtils, Services, chrome */

/**
 * Session adapter — SessionStore on Gecko, chrome.sessions / storage on Chromium.
 */

function _chromiumSession() {
  try {
    return typeof chrome !== "undefined" && chrome?.storage?.session
      ? chrome.storage.session
      : null;
  } catch {
    return null;
  }
}

export async function getTabState(tab) {
  const store = _chromiumSession();
  if (store) {
    const key = String(tab?.id ?? tab);
    return (await store.get(key))?.[key] ?? null;
  }
  return SessionStore.getTabState(tab);
}

export async function setTabState(tab, state) {
  const store = _chromiumSession();
  if (store) {
    const key = String(tab?.id ?? tab);
    return store.set({ [key]: state });
  }
  return SessionStore.setTabState(tab, state);
}

export function getAllWindowsRestoredPromise() {
  if (_chromiumSession()) {
    return Promise.resolve(true);
  }
  return SessionStore.promiseAllWindowsRestored;
}

// ---- LANE2 extensions: init gate + tab history + favicons (dual-engine) ----

export function getSessionInitializedPromise() {
  if (_chromiumSession()) {
    return Promise.resolve(true);
  }
  return SessionStore.promiseInitialized;
}

export async function recordHistoryVisit(url) {
  if (_chromiumSession() && typeof chrome?.history !== "undefined") {
    try {
      return chrome.history.addUrl({ url });
    } catch {
      return undefined;
    }
  }
  try {
    return PlacesUtils.history.insert({
      url,
      visits: [{ transition: PlacesUtils.history.TRANSITIONS.TYPED }],
    });
  } catch {
    return undefined;
  }
}

export async function getFaviconForPage(pageUrl) {
  if (_chromiumSession()) {
    try {
      const tabs = await chrome.tabs.query({ url: pageUrl });
      return tabs?.[0]?.favIconUrl ?? null;
    } catch {
      return null;
    }
  }
  try {
    const favicon = await PlacesUtils.favicons.getFaviconForPage(pageUrl);
    return favicon?.dataURI?.spec ?? favicon?.dataURI ?? null;
  } catch {
    return null;
  }
}

export function compareURLHost(a, b) {
  if (_chromiumSession()) {
    try {
      return new URL(a).host === new URL(b).host;
    } catch {
      return false;
    }
  }
  try {
    return Services.io.newURI(a).host === Services.io.newURI(b).host;
  } catch {
    return false;
  }
}

// Closed-tab count for the reopen-closed-tab palette action. Sync because
// availability callbacks are sync: Gecko reads the live count; Chromium has
// async-only chrome.sessions, so availability there resolves in the shell
// palette (engine-chromium/shell) and this reports none.
export function getClosedTabCountSync(win) {
  if (_chromiumSession()) {
    return 0;
  }
  try {
    return SessionStore.getClosedTabCount(win) ?? 0;
  } catch {
    return 0;
  }
}
