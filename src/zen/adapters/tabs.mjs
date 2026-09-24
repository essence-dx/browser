/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global gBrowser, chrome */

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

// ---- LANE2 extensions: tab-strip internals (dual-engine, same pattern) ----

export async function getSelectedTabs() {
  const ct = _chromiumTabs();
  if (ct) {
    return ct.query({ currentWindow: true, highlighted: true });
  }
  return gBrowser.selectedTabs;
}

export async function removeTab(tab, options) {
  const ct = _chromiumTabs();
  if (ct && tab?.id !== undefined) {
    return ct.remove(tab.id);
  }
  return gBrowser.removeTab(tab, options);
}

export async function addTab(url, options) {
  const ct = _chromiumTabs();
  if (ct) {
    return ct.create({ url, active: !(options?.inBackground ?? false) });
  }
  return gBrowser.addTab(url, options);
}

export async function createTab(url, options) {
  return addTab(url, options);
}

export async function moveTabTo(tab, options) {
  const ct = _chromiumTabs();
  if (ct && tab?.id !== undefined) {
    return ct.move(tab.id, { index: options?.tabIndex ?? -1 });
  }
  return gBrowser.moveTabTo(tab, options);
}

export async function getTabContainer() {
  const ct = _chromiumTabs();
  if (ct) {
    return null;
  }
  return gBrowser.tabContainer;
}

export async function getTabBox() {
  const ct = _chromiumTabs();
  if (ct) {
    return null;
  }
  return gBrowser.tabbox;
}

export function isTab(el) {
  try {
    if (typeof gBrowser?.isTab === "function") {
      return gBrowser.isTab(el);
    }
  } catch {}
  // Chromium: tab-strip custom element check.
  return !!el?.hasAttribute?.("zen-tab-id");
}

export function isTabGroup(el) {
  try {
    if (typeof gBrowser?.isTabGroup === "function") {
      return gBrowser.isTabGroup(el);
    }
  } catch {}
  return !!el?.hasAttribute?.("split-view-group");
}

export function isTabGroupLabel(el) {
  try {
    if (typeof gBrowser?.isTabGroupLabel === "function") {
      return gBrowser.isTabGroupLabel(el);
    }
  } catch {}
  return !!el?.classList?.contains("tab-group-label-container");
}

export async function addTabsProgressListener(listener) {
  const ct = _chromiumTabs();
  if (ct && typeof chrome?.tabs?.onUpdated?.addListener === "function") {
    return chrome.tabs.onUpdated.addListener((id, info, tab) =>
      listener?.onStateChange?.(tab)
    );
  }
  return gBrowser.addTabsProgressListener(listener);
}

export async function setIcon(tab, icon) {
  const ct = _chromiumTabs();
  if (ct) {
    return undefined;
  }
  return gBrowser.setIcon(tab, icon);
}

// ---- LANE2 sync variants: getters / field initializers can't await ----

export function getTabsSync() {
  if (_chromiumTabs()) {
    return [];
  }
  try {
    return gBrowser.tabs;
  } catch {
    return [];
  }
}

export function getSelectedTabSync() {
  if (_chromiumTabs()) {
    return null;
  }
  try {
    return gBrowser.selectedTab;
  } catch {
    return null;
  }
}

export function getSelectedTabsSync() {
  if (_chromiumTabs()) {
    return [];
  }
  try {
    return gBrowser.selectedTabs;
  } catch {
    return [];
  }
}

export function getTabContainerSync() {
  if (_chromiumTabs()) {
    return null;
  }
  try {
    return gBrowser.tabContainer;
  } catch {
    return null;
  }
}

export function getTabBoxSync() {
  if (_chromiumTabs()) {
    return null;
  }
  try {
    return gBrowser.tabbox;
  } catch {
    return null;
  }
}

export function invalidateCachedTabs() {
  if (_chromiumTabs()) {
    return undefined;
  }
  try {
    gBrowser.tabContainer._invalidateCachedTabs();
  } catch {}
  return undefined;
}

// DOM tab-strip reorder with the browser's move semantics (TabMove events on
// Gecko via the patched zenHandleTabMove; plain DOM move on Chromium).
// Replaces direct win.gBrowser.zenHandleTabMove / win.gZenTabMoves calls.
export function moveTabElement(el, moveFn) {
  if (_chromiumTabs()) {
    return moveFn();
  }
  try {
    if (gBrowser?.zenHandleTabMove) {
      return gBrowser.zenHandleTabMove(el, moveFn);
    }
  } catch {}
  return moveFn();
}

export function invalidateCachedVisibleTabs() {
  if (_chromiumTabs()) {
    return undefined;
  }
  try {
    gBrowser.tabContainer._invalidateCachedVisibleTabs();
  } catch {}
  return undefined;
}
