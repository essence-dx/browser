/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Storage adapter — Gecko now, Chromium later.
 * Gecko: wraps PathUtils / IOUtils (as used by ZenBoostsManager.sys.mjs,
 * ZenSessionManager.sys.mjs). Chromium: wraps chrome.storage (+ downloads).
 * Consumers import from here instead of touching PathUtils/IOUtils directly.
 */

export function joinPath(...parts) {
  return PathUtils.join(...parts);
}

export function getProfileDir() {
  return PathUtils.profileDir;
}

export async function makeDirectory(path, options) {
  return IOUtils.makeDirectory(path, options);
}

export async function pathExists(path) {
  return IOUtils.exists(path);
}

export async function readUTF8(path) {
  return IOUtils.readUTF8(path);
}

export async function writeUTF8(path, data) {
  return IOUtils.writeUTF8(path, data);
}

export async function removePath(path) {
  return IOUtils.remove(path);
}

// Chromium stubs — wire when engine === "chromium":
// export function joinPath(...parts) { return parts.join("/"); }
// export function getProfileDir() { return "profile"; }
// export async function makeDirectory() { return undefined; }
// export async function pathExists(path) { return (await chrome.storage.local.get(path))[path] !== undefined; }
// export async function readUTF8(path) { return (await chrome.storage.local.get(path))[path] ?? ""; }
// export async function writeUTF8(path, data) { return chrome.storage.local.set({ [path]: data }); }
// export async function removePath(path) { return chrome.storage.local.remove(path); }
