/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Session adapter — SessionStore on Gecko, chrome.sessions / storage on Chromium.
 */

export function getTabState(tab) {
  return SessionStore.getTabState(tab);
}

export function setTabState(tab, state) {
  return SessionStore.setTabState(tab, state);
}

export function getAllWindowsRestoredPromise() {
  return SessionStore.promiseAllWindowsRestored;
}

// Chromium stubs:
// export async function getTabState(tab) { return (await chrome.storage.session.get(String(tab.id)))?.[tab.id] ?? null; }
// export async function setTabState(tab, state) { return chrome.storage.session.set({[String(tab.id)]: state}); }
