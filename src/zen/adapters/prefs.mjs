/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Prefs adapter — Gecko now, Chromium later.
 * Default impl delegates to Services.prefs; Chromium impl will delegate to
 * chrome.storage / PrefService behind the same interface. Swapped via
 * surfer.json migration.engine flag.
 */

export function getBoolPref(key, fallback) {
  try {
    return Services.prefs.getBoolPref(key, fallback);
  } catch {
    return fallback;
  }
}

export function getIntPref(key, fallback) {
  try {
    return Services.prefs.getIntPref(key, fallback);
  } catch {
    return fallback;
  }
}

export function getStringPref(key, fallback) {
  try {
    return Services.prefs.getStringPref(key, fallback);
  } catch {
    return fallback;
  }
}

export function setBoolPref(key, value) {
  return Services.prefs.setBoolPref(key, value);
}

export function setIntPref(key, value) {
  return Services.prefs.setIntPref(key, value);
}

export function setStringPref(key, value) {
  return Services.prefs.setStringPref(key, value);
}

// Chromium stub — replace body when engine === "chromium"
// export async function getBoolPref(key, fallback) { return (await chrome.storage.local.get(key))[key] ?? fallback; }
