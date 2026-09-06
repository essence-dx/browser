/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Windows adapter — Gecko now, Chromium later.
 * Gecko: wraps BrowserWindowTracker (Gecko) via lazy import pattern used in
 * ZenWindowSync.sys.mjs. Chromium: wraps chrome.windows.
 * Consumers import from here instead of touching BrowserWindowTracker directly.
 */

function _chromiumWindows() {
  try {
    return typeof chrome !== "undefined" && chrome?.windows ? chrome.windows : null;
  } catch {
    return null;
  }
}

export async function getOrderedWindows() {
  const cw = _chromiumWindows();
  if (cw) {
    return cw.getAll({ populate: true });
  }
  const { BrowserWindowTracker } = ChromeUtils.importESModule(
    "resource:///modules/BrowserWindowTracker.sys.mjs"
  );
  return BrowserWindowTracker.orderedWindows;
}

export async function getTopWindow() {
  const cw = _chromiumWindows();
  if (cw) {
    return cw.getCurrent({ populate: true });
  }
  const { BrowserWindowTracker } = ChromeUtils.importESModule(
    "resource:///modules/BrowserWindowTracker.sys.mjs"
  );
  return BrowserWindowTracker.getTopWindow();
}

export async function getAllWindows() {
  const cw = _chromiumWindows();
  if (cw) {
    return cw.getAll({ populate: true });
  }
  const { BrowserWindowTracker } = ChromeUtils.importESModule(
    "resource:///modules/BrowserWindowTracker.sys.mjs"
  );
  return [...BrowserWindowTracker.orderedWindows];
}
