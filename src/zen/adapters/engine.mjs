/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global Services, chrome */

/**
 * Engine selector — Lane 1 single source of truth for the migration flag.
 * Reads surfer.json migration.engine at build time ("gecko" now); Chromium
 * bodies activate when engine === "chromium" or "dual". Every other adapter
 * imports isChromium() from here instead of sniffing globals, so the cutover
 * is one flag flip in surfer.json.
 */

export const ENGINE_GECKO = "gecko";
export const ENGINE_CHROMIUM = "chromium";
export const ENGINE_DUAL = "dual";

export function getEngine() {
  try {
    if (typeof Services?.prefs?.getCharPref === "function") {
      return Services.prefs.getCharPref("zen.migration.engine", ENGINE_GECKO);
    }
  } catch {}
  try {
    if (typeof chrome?.storage?.local?.get === "function") {
      return ENGINE_CHROMIUM;
    }
  } catch {}
  return ENGINE_GECKO;
}

export function isChromium(engine = getEngine()) {
  return engine === ENGINE_CHROMIUM || engine === ENGINE_DUAL;
}

export function isGecko(engine = getEngine()) {
  return engine === ENGINE_GECKO || engine === ENGINE_DUAL;
}
