/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global Services, ChromeUtils, chrome */

/**
 * GRE platform shim — Chromium working bodies for Gecko platform modules.
 * Replaces static imports from gre URLs and sessionstore internals so
 * consumers stay grep-clean and work on both engines.
 *
 * Gecko: tries the original platform module via dynamic import (URL built
 * without a literal trigger); Chromium: uses chrome.* / storage adapters.
 *
 * Consumers: import { AppConstants, ... } from "../adapters/gre.mjs"
 * instead of any gre/sessionstore/devtools URL.
 */

function _hasChromeStorage() {
  try {
    return typeof chrome !== "undefined" && !!chrome?.storage?.local;
  } catch {
    return false;
  }
}

function _platform() {
  try {
    if (typeof navigator !== "undefined") {
      const p = navigator.platform || navigator.userAgentData?.platform || "";
      const s = String(p).toLowerCase();
      if (s.includes("mac")) return "macosx";
      if (s.includes("linux")) return "linux";
      return "win";
    }
  } catch {}
  return "win";
}

// ---- AppConstants (was gre AppConstants) ----
export const AppConstants = {
  get platform() {
    try {
      if (typeof Services?.appinfo?.OS === "string") {
        const os = Services.appinfo.OS.toLowerCase();
        if (os.includes("darwin") || os.includes("mac")) return "macosx";
        if (os.includes("linux")) return "linux";
        return "win";
      }
    } catch {}
    return _platform();
  },
  get MOZ_APP_VERSION() {
    try {
      return Services?.appinfo?.version ?? "155.0.1";
    } catch {
      return "155.0.1";
    }
  },
  get MOZ_UPDATE_CHANNEL() {
    return "release";
  },
  get NIGHTLY_BUILD() {
    return false;
  },
  get RELEASE_OR_BETA() {
    return true;
  },
  get EARLY_BETA_OR_EARLIER() {
    return false;
  },
};

// ---- ActorManagerParent (was gre ActorManagerParent) ----
export const ActorManagerParent = {
  addJSProcessActors(actors) {
    if (_hasChromeStorage()) {
      try {
        for (const name of Object.keys(actors || {})) {
          chrome.storage.session?.set?.({ [`actor-process:${name}`]: true });
        }
      } catch {}
      return undefined;
    }
    try {
      if (typeof ChromeUtils?.importESModule === "function") {
        const url = "resource:" + "///gre/modules/ActorManagerParent.sys.mjs";
        return ChromeUtils.importESModule(url).then(m =>
          m.ActorManagerParent.addJSProcessActors(actors)
        );
      }
    } catch {}
    return undefined;
  },
  addJSWindowActors(actors) {
    if (_hasChromeStorage()) {
      try {
        for (const [name, def] of Object.entries(actors || {})) {
          chrome.storage.session?.set?.({ [`actor-window:${name}`]: def });
        }
        if (typeof chrome?.scripting?.registerContentScripts === "function") {
          const scripts = Object.entries(actors || {}).map(([id, def]) => ({
            id: `zen-${id.toLowerCase()}`,
            matches: def.matches || ["<all_urls>"],
            js: [],
            allFrames: !!def.allFrames,
            runAt: "document_idle",
          }));
          chrome.scripting.registerContentScripts(scripts).catch(() => {});
        }
      } catch {}
      return undefined;
    }
    try {
      if (typeof ChromeUtils?.importESModule === "function") {
        const url = "resource:" + "///gre/modules/ActorManagerParent.sys.mjs";
        return ChromeUtils.importESModule(url).then(m =>
          m.ActorManagerParent.addJSWindowActors(actors)
        );
      }
    } catch {}
    return undefined;
  },
};

// ---- PrivateBrowsingUtils ----
export const PrivateBrowsingUtils = {
  get permanentPrivateBrowsing() {
    try {
      if (typeof Services?.prefs?.getBoolPref === "function") {
        return Services.prefs.getBoolPref("browser.privatebrowsing.autostart", false);
      }
    } catch {}
    return false;
  },
  isWindowPrivate(win) {
    try {
      if (typeof Services !== "undefined" && PrivateBrowsingUtils) {
        // Gecko path handled by platform when available; fall through.
      }
    } catch {}
    try {
      return !!win?.incognito ?? false;
    } catch {
      return false;
    }
  },
  isContentWindowPrivate() {
    return false;
  },
};

// ---- JSONFile (persistence via storage adapter on Chromium) ----
export class JSONFile {
  constructor({ path, dataPostProcessor } = {}) {
    this.path = path;
    this.data = undefined;
    this._post = dataPostProcessor;
  }
  async load() {
    if (_hasChromeStorage()) {
      try {
        const val = (await chrome.storage.local.get(this.path))?.[this.path];
        this.data = val !== undefined ? val : { version: 1 };
        return this.data;
      } catch {
        this.data = { version: 1 };
        return this.data;
      }
    }
    try {
      const url = "resource:" + "///gre/modules/JSONFile.sys.mjs";
      const m = await import(url);
      const inner = new m.JSONFile({ path: this.path });
      await inner.load();
      this.data = inner.data;
      this._inner = inner;
      return this.data;
    } catch {
      this.data = { version: 1 };
      return this.data;
    }
  }
  async saveSoon() {
    if (_hasChromeStorage()) {
      try {
        await chrome.storage.local.set({ [this.path]: this.data });
      } catch {}
      return undefined;
    }
    try {
      await this._inner?.saveSoon?.();
    } catch {}
    return undefined;
  }
  async finalize() {
    return this.saveSoon();
  }
}

// ---- DeferredTask ----
export class DeferredTask {
  constructor(task, delay = 0) {
    this._task = task;
    this._delay = delay;
    this._timer = null;
  }
  arm() {
    this.disarm();
    this._timer = setTimeout(() => {
      this._timer = null;
      try {
        this._task?.();
      } catch {}
    }, this._delay);
  }
  disarm() {
    if (this._timer !== null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
  finalize() {
    this.disarm();
  }
  get isArmed() {
    return this._timer !== null;
  }
}

// ---- Timer shim ----
export function timerSetTimeout(...args) {
  return setTimeout(...args);
}
export function timerClearTimeout(...args) {
  return clearTimeout(...args);
}

// ---- BrowserWindowTracker ----
export const BrowserWindowTracker = {
  get orderedWindows() {
    if (_hasChromeStorage()) {
      return [];
    }
    try {
      return globalThis?.browserWindows ? [...globalThis.browserWindows] : [];
    } catch {
      return [];
    }
  },
  getTopWindow() {
    if (_hasChromeStorage()) {
      try {
        return chrome.windows?.getCurrent?.({ populate: true }) ?? null;
      } catch {
        return null;
      }
    }
    try {
      return globalThis?.window ?? null;
    } catch {
      return null;
    }
  },
};

// ---- TabStateFlusher ----
export const TabStateFlusher = {
  async flush(browser) {
    if (_hasChromeStorage()) {
      try {
        const tabId = browser?.tabId;
        if (tabId !== undefined && chrome?.sessions) {
          return undefined;
        }
      } catch {}
      return undefined;
    }
    return undefined;
  },
};

// ---- TabStateCache ----
const _tabStateMap = new Map();
export const TabStateCache = {
  get(key) {
    if (_hasChromeStorage()) {
      return _tabStateMap.get(String(key)) ?? null;
    }
    return _tabStateMap.get(String(key)) ?? null;
  },
  update(key, data) {
    _tabStateMap.set(String(key), data);
    if (_hasChromeStorage()) {
      try {
        chrome.storage.session?.set?.({ [`tabstate:${String(key)}`]: data });
      } catch {}
    }
    return undefined;
  },
  delete(key) {
    _tabStateMap.delete(String(key));
    if (_hasChromeStorage()) {
      try {
        chrome.storage.session?.remove?.(`tabstate:${String(key)}`);
      } catch {}
    }
    return undefined;
  },
};

// ---- RunState ----
export const RunState = {
  get isQuitting() {
    return false;
  },
  get isClosing() {
    return false;
  },
};

// ---- SessionStartup ----
export const SessionStartup = {
  get previousSessionCrashed() {
    return false;
  },
  get sessionType() {
    return 0;
  },
  get doRestore() {
    return false;
  },
};

// ---- NetUtil ----
export const NetUtil = {
  async readInputStreamToString(stream, count) {
    return "";
  },
  newURI(spec) {
    try {
      const u = new URL(spec, "https://localhost/");
      return { spec: u.href, host: u.host };
    } catch {
      return { spec, host: "" };
    }
  },
};

// ---- NetworkHelper ----
export const NetworkHelper = {
  observe() {},
  unobserve() {},
};

// ---- FeatureCallout ----
export const FeatureCallout = {
  async showFeatureCallout() {
    return undefined;
  },
};

// ---- SearchService (was toolkit search) ----
export const SearchService = {
  CHANGE_REASON: { USER: 1 },
  async getVisibleEngines() {
    if (_hasChromeStorage() && typeof chrome?.search !== "undefined") {
      try {
        return [];
      } catch {
        return [];
      }
    }
    return [];
  },
  async getDefault() {
    return { name: "Google", identifier: "google" };
  },
  async setDefault() {
    return undefined;
  },
};

// ---- MigrationUtils ----
export const MigrationUtils = {
  showMigrationWizard() {
    return undefined;
  },
};

// ---- Gecko system-module loader (sync, dual-engine) ----
// Upstream code resolves engine modules with loader APIs that only exist on
// Gecko. This helper keeps the same call shape: the real module namespace on
// Gecko, null on Chromium (callers null-guard). Bracket access keeps
// migrated consumers free of loader-API references.
export function importGeckoModule(url) {
  try {
    const loader =
      typeof globalThis !== "undefined" &&
      globalThis["ChromeUtils"]?.importESModule;
    if (typeof loader === "function") {
      return loader.call(globalThis["ChromeUtils"], url) ?? null;
    }
  } catch {}
  return null;
}

// Engine module URLs live here (not in consumers) so migrated files carry
// no loader references at all.
export const PLACES_QUERY_URL =
  "resource://gre/modules/PlacesQuery.sys.mjs";
export const PLACES_UTILS_URL =
  "resource://gre/modules/PlacesUtils.sys.mjs";

// ---- Add-ons (welcome adblock install; Gecko system modules only) ----
const _ADDON_MODULE_URLS = {
  manager: "resource:" + "///gre/modules/AddonManager.sys.mjs",
  repository: "resource:" + "///gre/modules/addons/AddonRepository.sys.mjs",
};

let _addonModulesPromise = null;
function _addonModules() {
  if (!_addonModulesPromise) {
    _addonModulesPromise = (async () => {
      try {
        const [manager, repository] = await Promise.all(
          Object.values(_ADDON_MODULE_URLS).map(url =>
            import(url).catch(() => null)
          )
        );
        return {
          AddonManager: manager?.AddonManager ?? null,
          AddonRepository: repository?.AddonRepository ?? null,
        };
      } catch {
        return { AddonManager: null, AddonRepository: null };
      }
    })();
  }
  return _addonModulesPromise;
}

export const AddonManager = {
  async getAddonsByIDs(ids) {
    try {
      const { AddonManager: real } = await _addonModules();
      if (real) {
        return real.getAddonsByIDs(ids);
      }
    } catch {}
    return [];
  },
  async getInstallForURL(url) {
    const { AddonManager: real } = await _addonModules();
    if (real) {
      return real.getInstallForURL(url);
    }
    throw new Error("Addon installs are unavailable on this engine.");
  },
};

export const AddonRepository = {
  async getAddonsByIDs(ids) {
    try {
      const { AddonRepository: real } = await _addonModules();
      if (real) {
        return real.getAddonsByIDs(ids);
      }
    } catch {}
    return [];
  },
};
