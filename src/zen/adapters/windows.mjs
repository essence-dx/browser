/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Windows adapter — Gecko now, Chromium later.
 * Gecko: wraps BrowserWindowTracker (Gecko) via lazy import pattern used in
 * ZenWindowSync.sys.mjs. Chromium: wraps chrome.windows.
 * Consumers import from here instead of touching BrowserWindowTracker directly.
 */

export async function getOrderedWindows() {
  const { BrowserWindowTracker } = ChromeUtils.importESModule(
    "resource:///modules/BrowserWindowTracker.sys.mjs"
  );
  return BrowserWindowTracker.orderedWindows;
}

export async function getTopWindow() {
  const { BrowserWindowTracker } = ChromeUtils.importESModule(
    "resource:///modules/BrowserWindowTracker.sys.mjs"
  );
  return BrowserWindowTracker.getTopWindow();
}

export async function getAllWindows() {
  const { BrowserWindowTracker } = ChromeUtils.importESModule(
    "resource:///modules/BrowserWindowTracker.sys.mjs"
  );
  return [...BrowserWindowTracker.orderedWindows];
}

// Chromium stubs — wire when engine === "chromium":
// export async function getOrderedWindows() { return chrome.windows.getAll({ populate: true }); }
// export async function getTopWindow() { return chrome.windows.getCurrent({ populate: true }); }
// export async function getAllWindows() { return chrome.windows.getAll({ populate: true }); }
