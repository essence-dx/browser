/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Storage adapter — Gecko now, Chromium later.
 * Gecko: wraps PathUtils / IOUtils (as used by ZenBoostsManager.sys.mjs,
 * ZenSessionManager.sys.mjs). Chromium: wraps chrome.storage (+ downloads).
 * Consumers import from here instead of touching PathUtils/IOUtils directly.
 */

function _chromiumStorage() {
  try {
    return typeof chrome !== "undefined" && chrome?.storage?.local
      ? chrome.storage.local
      : null;
  } catch {
    return null;
  }
}

export function joinPath(...parts) {
  if (_chromiumStorage()) {
    return parts.join("/");
  }
  return PathUtils.join(...parts);
}

export function getProfileDir() {
  if (_chromiumStorage()) {
    return "profile";
  }
  return PathUtils.profileDir;
}

export async function makeDirectory(path, options) {
  if (_chromiumStorage()) {
    return undefined;
  }
  return IOUtils.makeDirectory(path, options);
}

export async function pathExists(path) {
  const store = _chromiumStorage();
  if (store) {
    return (await store.get(path))[path] !== undefined;
  }
  return IOUtils.exists(path);
}

export async function readUTF8(path) {
  const store = _chromiumStorage();
  if (store) {
    return (await store.get(path))[path] ?? "";
  }
  return IOUtils.readUTF8(path);
}

export async function writeUTF8(path, data) {
  const store = _chromiumStorage();
  if (store) {
    return store.set({ [path]: data });
  }
  return IOUtils.writeUTF8(path, data);
}

export async function removePath(path) {
  const store = _chromiumStorage();
  if (store) {
    return store.remove(path);
  }
  return IOUtils.remove(path);
}

export async function readJSON(path, fallback = null) {
  try {
    const store = _chromiumStorage();
    if (store) {
      const val = (await store.get(path))[path];
      if (val === undefined) {
        return fallback;
      }
      return typeof val === "string" ? JSON.parse(val) : val;
    }
    const text = await IOUtils.readUTF8(path);
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export async function writeJSON(path, data) {
  const store = _chromiumStorage();
  if (store) {
    return store.set({ [path]: JSON.stringify(data) });
  }
  return IOUtils.writeUTF8(path, JSON.stringify(data));
}
