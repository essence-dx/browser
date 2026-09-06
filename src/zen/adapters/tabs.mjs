/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Tabs adapter — Gecko now, Chromium later.
 * Gecko: wraps gBrowser. Chromium: wraps chrome.tabs / chrome.tabGroups.
 * Consumers import from here instead of touching gBrowser directly, so the
 * migration is a one-file swap.
 */

export function getSelectedTab() {
  return gBrowser.selectedTab;
}

export function setSelectedTab(tab) {
  gBrowser.selectedTab = tab;
}

export function getTabs() {
  return gBrowser.tabs;
}

export function pinTab(tab) {
  return gBrowser.pinTab(tab);
}

export function unpinTab(tab) {
  return gBrowser.unpinTab(tab);
}

export function duplicateTab(tab, inBackground) {
  return gBrowser.duplicateTab(tab, inBackground);
}

export function getTabForBrowser(browser) {
  return gBrowser.getTabForBrowser(browser);
}

// Chromium stubs — wire when engine === "chromium":
// export async function getSelectedTab() { const [t] = await chrome.tabs.query({active:true, currentWindow:true}); return t; }
// export async function duplicateTab(tab) { return chrome.tabs.duplicate(tab.id); }
