/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Tabs adapter — Gecko now, Chromium later.
 * Gecko: wraps gBrowser. Chromium: wraps chrome.tabs / chrome.tabGroups.
 * Consumers import from here instead of touching gBrowser directly, so the
 * migration is a one-file swap.
 */

function _chromiumTabs() {
  try {
    return typeof chrome !== "undefined" && chrome?.tabs ? chrome.tabs : null;
  } catch {
    return null;
  }
}

export async function getSelectedTab() {
  const ct = _chromiumTabs();
  if (ct) {
    const [tab] = await ct.query({ active: true, currentWindow: true });
    return tab;
  }
  return gBrowser.selectedTab;
}

export async function setSelectedTab(tab) {
  const ct = _chromiumTabs();
  if (ct && tab?.id !== undefined) {
    return ct.update(tab.id, { active: true });
  }
  gBrowser.selectedTab = tab;
  return tab;
}

export async function getTabs(query = {}) {
  const ct = _chromiumTabs();
  if (ct) {
    return ct.query({ currentWindow: true, ...query });
  }
  return gBrowser.tabs;
}

export async function pinTab(tab) {
  const ct = _chromiumTabs();
  if (ct && tab?.id !== undefined) {
    return ct.update(tab.id, { pinned: true });
  }
  return gBrowser.pinTab(tab);
}

export async function unpinTab(tab) {
  const ct = _chromiumTabs();
  if (ct && tab?.id !== undefined) {
    return ct.update(tab.id, { pinned: false });
  }
  return gBrowser.unpinTab(tab);
}

export async function duplicateTab(tab, inBackground) {
  const ct = _chromiumTabs();
  if (ct && tab?.id !== undefined) {
    return ct.duplicate(tab.id);
  }
  return gBrowser.duplicateTab(tab, inBackground);
}

export async function getTabForBrowser(browser) {
  const ct = _chromiumTabs();
  if (ct && browser?.tabId !== undefined) {
    return ct.get(browser.tabId);
  }
  return gBrowser.getTabForBrowser(browser);
}
