/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Prefs adapter — Gecko now, Chromium later.
 * Default impl delegates to Services.prefs; Chromium impl will delegate to
 * chrome.storage / PrefService behind the same interface. Swapped via
 * surfer.json migration.engine flag.
 */

function _chromiumPrefs() {
  try {
    return typeof chrome !== "undefined" && chrome?.storage?.local
      ? chrome.storage.local
      : null;
  } catch {
    return null;
  }
}

export async function getBoolPref(key, fallback) {
  const store = _chromiumPrefs();
  if (store) {
    return (await store.get(key))[key] ?? fallback;
  }
  try {
    return Services.prefs.getBoolPref(key, fallback);
  } catch {
    return fallback;
  }
}

export async function getIntPref(key, fallback) {
  const store = _chromiumPrefs();
  if (store) {
    return (await store.get(key))[key] ?? fallback;
  }
  try {
    return Services.prefs.getIntPref(key, fallback);
  } catch {
    return fallback;
  }
}

export async function getStringPref(key, fallback) {
  const store = _chromiumPrefs();
  if (store) {
    return (await store.get(key))[key] ?? fallback;
  }
  try {
    return Services.prefs.getStringPref(key, fallback);
  } catch {
    return fallback;
  }
}

export async function setBoolPref(key, value) {
  const store = _chromiumPrefs();
  if (store) {
    return store.set({ [key]: value });
  }
  return Services.prefs.setBoolPref(key, value);
}

export async function setIntPref(key, value) {
  const store = _chromiumPrefs();
  if (store) {
    return store.set({ [key]: value });
  }
  return Services.prefs.setIntPref(key, value);
}

export async function setStringPref(key, value) {
  const store = _chromiumPrefs();
  if (store) {
    return store.set({ [key]: value });
  }
  return Services.prefs.setStringPref(key, value);
}
