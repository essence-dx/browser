/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppConstants } from "../../adapters/gre.mjs";
import {
  getBoolPrefSync,
  getIntPrefSync,
  getStringPrefSync,
  setBoolPref,
  setIntPref,
  setStringPref,
  prefHasUserValue,
  clearUserPref,
  confirmDialog,
} from "../../adapters/prefs.mjs";
import { getAllWindowsRestoredPromise } from "../../adapters/session.mjs";
import { getTopWindow } from "../../adapters/windows.mjs";
import {
  joinPath,
  getProfileDir,
  pathExists,
} from "../../adapters/storage.mjs";
// Profile/restart/prompt flows below go through the adapters (Gecko now,
// Chromium via chrome.storage/windows/runtime) — same adapter surface.

// Session state (was a lazy system-module getter) now resolves through
// adapters/session.mjs.
const lazy = {
  CustomizableUI: null,
};

// Toolbar customization lives in the Gecko tree only; resolve it when
// present so the library-button migration below no-ops on Chromium.
try {
  const customUI = await import(
    "moz-src:///browser/components/customizableui/CustomizableUI.sys.mjs"
  ).catch(() => null);
  lazy.CustomizableUI = customUI?.CustomizableUI ?? null;
} catch {
  lazy.CustomizableUI = null;
}

class nsZenUIMigration {
  PREF_NAME = "zen.ui.migration.version";
  MIGRATION_VERSION = 8;

  async init(isNewProfile) {
    if (!isNewProfile) {
      try {
        await this._migrate();
      } catch (e) {
        console.error("ZenUIMigration: Error during migration", e);
      }
    }
    this.#migrateLibraryButton();
    this.clearVariables();
    if (this.shouldRestart) {
      // A restart applies pending migration prefs; on Chromium the runtime
      // reloads instead (no-ops where the runtime API is unavailable).
      try {
        chrome?.runtime?.reload?.();
      } catch {}
    }
  }

  get _migrationVersion() {
    return getIntPrefSync(this.PREF_NAME, 0);
  }

  set _migrationVersion(value) {
    setIntPref(this.PREF_NAME, value);
  }

  async _migrate() {
    for (let i = 0; i <= this.MIGRATION_VERSION; i++) {
      if (this._migrationVersion < i) {
        await this[`_migrateV${i}`]?.();
      }
    }
  }

  clearVariables() {
    this._migrationVersion = this.MIGRATION_VERSION;
  }

  #migrateLibraryButton() {
    const donePref = "zen.library.migrated-downloads-button";
    if (
      !getBoolPrefSync("zen.library.enabled", false) ||
      getBoolPrefSync(donePref, false) ||
      !lazy.CustomizableUI
    ) {
      return;
    }
    // A toolbar's saved placements are only there once a window has it.
    const footButtons = "zen-sidebar-foot-buttons";
    const listener = {
      onAreaNodeRegistered: area => {
        if (area !== footButtons) {
          return;
        }
        lazy.CustomizableUI.removeListener(listener);
        setBoolPref(donePref, true);
        const downloads =
          lazy.CustomizableUI.getPlacementOfWidget("downloads-button");
        if (
          downloads?.area === footButtons &&
          !lazy.CustomizableUI.getPlacementOfWidget("zen-library-button")
        ) {
          lazy.CustomizableUI.addWidgetToArea(
            "zen-library-button",
            footButtons,
            downloads.position
          );
          lazy.CustomizableUI.removeWidgetFromArea("downloads-button");
        }
      },
    };
    lazy.CustomizableUI.addListener(listener);
  }

  async _migrateV1() {
    // If there's an userChrome.css or userContent.css existing, we set
    // 'toolkit.legacyUserProfileCustomizations.stylesheets' back to true
    // We do this to avoid existing user stylesheets to be ignored
    const profileDir = getProfileDir();
    const userChromeExists = await pathExists(
      joinPath(profileDir, "chrome", "userChrome.css")
    ).catch(() => false);
    const userContentExists = await pathExists(
      joinPath(profileDir, "chrome", "userContent.css")
    ).catch(() => false);
    setBoolPref(
      "zen.workspaces.separate-essentials",
      getBoolPrefSync(
        "zen.workspaces.container-specific-essentials-enabled",
        false
      )
    );
    const theme = getIntPrefSync(
      "layout.css.prefers-color-scheme.content-override",
      0
    );
    setIntPref("zen.view.window.scheme", theme);
    if (userChromeExists || userContentExists) {
      setBoolPref(
        "toolkit.legacyUserProfileCustomizations.stylesheets",
        true
      );
      console.warn(
        "ZenUIMigration: User stylesheets detected, enabling legacy stylesheets."
      );
      this.shouldRestart = true;
    }
  }

  _migrateV2() {
    if (AppConstants.platform !== "linux") {
      setIntPref("zen.theme.gradient-legacy-version", 0);
    }
  }

  _migrateV3() {
    if (
      getStringPrefSync("zen.theme.accent-color", "")
        .startsWith("system")
    ) {
      setStringPref("zen.theme.accent-color", "AccentColor");
    }
  }

  _migrateV4() {
    // Fix spelling mistake in preference name
    setBoolPref(
      "zen.theme.use-system-colors",
      getBoolPrefSync("zen.theme.use-sysyem-colors", false)
    );
  }

  _migrateV5() {
    setBoolPref("zen.site-data-panel.show-callout", true);
  }

  _migrateV6() {
    // Session gate lives in adapters/session.mjs (chrome.sessions on Chromium).
    getAllWindowsRestoredPromise().then(async () => {
      const win = await getTopWindow();
      if (!win?.document) {
        return;
      }
      win.setTimeout(async () => {
        const [title, message, learnMore, accept] =
          await win.document.l10n.formatMessages([
            "zen-window-sync-migration-dialog-title",
            "zen-window-sync-migration-dialog-message",
            "zen-window-sync-migration-dialog-learn-more",
            "zen-window-sync-migration-dialog-accept",
          ]);

        // buttonPressed will be 0 for "Learn More", 1 for dismiss.
        const buttonPressed = confirmDialog(
          win,
          title.value,
          `${message.value}\n\n${learnMore.value}`
        )
          ? 0
          : 1;
        // User has clicked on "Learn More"
        if (buttonPressed === 0) {
          win.openTrustedLinkIn(
            "https://docs.zen-browser.app/user-manual/window-sync",
            "tab"
          );
        }
      }, 1000);
    });
  }

  _migrateV7() {
    if (
      AppConstants.platform === "macosx" &&
      prefHasUserValue(
        "widget.macos.sidebar-blend-mode.behind-window"
      ) &&
      !getBoolPrefSync(
        "widget.macos.sidebar-blend-mode.behind-window"
      )
    ) {
      setBoolPref("zen.widget.macos.window-vibrancy", false);
    }
  }

  _migrateV8() {
    // A version mismatch in the downloadable gfx blocklist wrongly blocked
    // video overlays for every Windows user. The status pref persists in the
    // profile and short-circuits the blocklist evaluation, so clear it (and
    // its failure id) and restart, since gfx is already initialized by now.
    if (prefHasUserValue("gfx.blacklist.video-overlay")) {
      clearUserPref("gfx.blacklist.video-overlay");
      clearUserPref("gfx.blacklist.video-overlay.failureid");
      this.shouldRestart = true;
    }
  }
}

export var gZenUIMigration = new nsZenUIMigration();
