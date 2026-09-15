/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global Services, chrome */

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

// ---- LANE2 extensions: observers, clear, app info, URLs, dialogs (dual-engine) ----

export function addPrefObserver(key, observer) {
  const store = _chromiumPrefs();
  if (store && typeof chrome?.storage?.onChanged?.addListener === "function") {
    const fn = changes => {
      if (Object.hasOwn(changes, key)) {
        observer?.observe?.(null, key, null);
      }
    };
    fn._zenPrefKey = key;
    chrome.storage.onChanged.addListener(fn);
    return fn;
  }
  return Services.prefs.addObserver(key, observer);
}

export function removePrefObserver(key, observer) {
  const store = _chromiumPrefs();
  if (store && typeof chrome?.storage?.onChanged?.removeListener === "function") {
    try {
      chrome.storage.onChanged.removeListener(observer);
    } catch {}
    return undefined;
  }
  try {
    return Services.prefs.removeObserver(key, observer);
  } catch {
    return undefined;
  }
}

export async function clearUserPref(key) {
  const store = _chromiumPrefs();
  if (store) {
    return store.remove(key);
  }
  try {
    return Services.prefs.clearUserPref(key);
  } catch {
    return undefined;
  }
}

export function prefHasUserValue(key) {
  const store = _chromiumPrefs();
  if (store) {
    return false;
  }
  try {
    return Services.prefs.prefHasUserValue(key);
  } catch {
    return false;
  }
}

export function getAppInfo() {
  const store = _chromiumPrefs();
  if (store) {
    return {
      OS: "chromium",
      version: chrome?.runtime?.getManifest?.()?.version ?? "",
      appBuildID: "",
      inSafeMode: false,
      name: "zen",
    };
  }
  return Services.appinfo;
}

export function getPlatform() {
  const store = _chromiumPrefs();
  if (store) {
    const os = chrome?.runtime?.getPlatformInfo
      ? "macosx"
      : "chromium";
    return os;
  }
  try {
    return Services.appinfo.OS;
  } catch {
    return "chromium";
  }
}

export function newURI(spec) {
  const store = _chromiumPrefs();
  if (store) {
    const u = new URL(spec, "https://localhost/");
    return { spec: u.href, host: u.host };
  }
  return Services.io.newURI(spec);
}

export function confirmDialog(win, title, body) {
  const store = _chromiumPrefs();
  if (store) {
    try {
      return confirm(`${title}\n\n${body}`);
    } catch {
      return false;
    }
  }
  return Services.prompt.confirm(win, title, body);
}

export function promptDialog(win, title, label, result) {
  const store = _chromiumPrefs();
  if (store) {
    try {
      const value = prompt(`${title}\n\n${label}`, result?.value ?? "");
      if (value === null) {
        return false;
      }
      if (result) {
        result.value = value;
      }
      return true;
    } catch {
      return false;
    }
  }
  return Services.prompt.prompt(win, title, label, result, null, {
    value: false,
  });
}

export function generateUUID() {
  const store = _chromiumPrefs();
  if (store) {
    try {
      return crypto.randomUUID();
    } catch {
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
  }
  return Services.uuid.generateUUID().toString();
}

export function playHapticFeedback() {
  const store = _chromiumPrefs();
  if (store) {
    try {
      navigator?.vibrate?.(10);
    } catch {}
    return undefined;
  }
  try {
    return Services.zen.playHapticFeedback();
  } catch {
    return undefined;
  }
}

// ---- LANE2 sync variants: field initializers / getters can't await ----

export function getBoolPrefSync(key, fallback) {
  if (_chromiumPrefs()) {
    return fallback;
  }
  try {
    return Services.prefs.getBoolPref(key, fallback);
  } catch {
    return fallback;
  }
}

export function getIntPrefSync(key, fallback) {
  if (_chromiumPrefs()) {
    return fallback;
  }
  try {
    return Services.prefs.getIntPref(key, fallback);
  } catch {
    return fallback;
  }
}

export function getStringPrefSync(key, fallback) {
  if (_chromiumPrefs()) {
    return fallback;
  }
  try {
    return Services.prefs.getStringPref(key, fallback);
  } catch {
    return fallback;
  }
}

export function defineLazyPref(obj, name, key, fallback) {
  let cached;
  let initialized = false;
  try {
    Object.defineProperty(obj, name, {
      configurable: true,
      enumerable: true,
      get() {
        if (!initialized) {
          initialized = true;
          cached = getBoolPrefSync(key, fallback);
          try {
            addPrefObserver(key, {
              observe() {
                initialized = false;
              },
            });
          } catch {}
        }
        return cached;
      },
    });
  } catch {}
  return obj;
}
