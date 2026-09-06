/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
