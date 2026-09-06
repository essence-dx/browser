/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppConstants } from "resource://gre/modules/AppConstants.sys.mjs";
import {
  getBoolPref,
  getIntPref,
  getStringPref,
  setBoolPref,
  setIntPref,
  setStringPref,
} from "../../adapters/prefs.mjs";
import { getAllWindowsRestoredPromise } from "../../adapters/session.mjs";
// Gecko now (dirsvc/startup/prompt internals below stay Gecko); Chromium:
// chrome.storage.local + chrome.tabs — same prefs/session adapter surface.

const lazy = {};

ChromeUtils.defineESModuleGetters(lazy, {
  SessionStore: "resource:///modules/sessionstore/SessionStore.sys.mjs",
});

class nsZenUIMigration {
  PREF_NAME = "zen.ui.migration.version";
  MIGRATION_VERSION = 7;

  init(isNewProfile) {
    if (!isNewProfile) {
      try {
        this._migrate();
      } catch (e) {
        console.error("ZenUIMigration: Error during migration", e);
      }
    }
    this.clearVariables();
    if (this.shouldRestart) {
      Services.startup.quit(
        Ci.nsIAppStartup.eAttemptQuit | Ci.nsIAppStartup.eRestart
      );
    }
  }

  get _migrationVersion() {
    return getIntPref(this.PREF_NAME, 0);
  }

  set _migrationVersion(value) {
    setIntPref(this.PREF_NAME, value);
  }

  _migrate() {
    for (let i = 0; i <= this.MIGRATION_VERSION; i++) {
      if (this._migrationVersion < i) {
        this[`_migrateV${i}`]?.();
      }
    }
  }

  clearVariables() {
    this._migrationVersion = this.MIGRATION_VERSION;
  }

  _migrateV1() {
    // If there's an userChrome.css or userContent.css existing, we set
    // 'toolkit.legacyUserProfileCustomizations.stylesheets' back to true
    // We do this to avoid existing user stylesheets to be ignored
    const profileDir = Services.dirsvc.get("ProfD", Ci.nsIFile);
    const userChromeFile = profileDir.clone();
    userChromeFile.append("chrome");
    userChromeFile.append("userChrome.css");
    const userContentFile = profileDir.clone();
    userContentFile.append("chrome");
    userContentFile.append("userContent.css");
    setBoolPref(
      "zen.workspaces.separate-essentials",
      getBoolPref(
        "zen.workspaces.container-specific-essentials-enabled",
        false
      )
    );
    const theme = getIntPref(
      "layout.css.prefers-color-scheme.content-override",
      0
    );
    setIntPref("zen.view.window.scheme", theme);
    if (userChromeFile.exists() || userContentFile.exists()) {
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
      getStringPref("zen.theme.accent-color", "")
        .startsWith("system")
    ) {
      setStringPref("zen.theme.accent-color", "AccentColor");
    }
  }

  _migrateV4() {
    // Fix spelling mistake in preference name
    setBoolPref(
      "zen.theme.use-system-colors",
      getBoolPref("zen.theme.use-sysyem-colors", false)
    );
  }

  _migrateV5() {
    setBoolPref("zen.site-data-panel.show-callout", true);
  }

  _migrateV6() {
    // Gecko session gate; Chromium: chrome.sessions — see adapters/session.mjs.
    getAllWindowsRestoredPromise().then(() => {
      // Gecko window/prompt flow below stays as-is for now.
      const win = Services.wm.getMostRecentWindow("navigator:browser");
      win.setTimeout(async () => {
        const [title, message, learnMore, accept] =
          await win.document.l10n.formatMessages([
            "zen-window-sync-migration-dialog-title",
            "zen-window-sync-migration-dialog-message",
            "zen-window-sync-migration-dialog-learn-more",
            "zen-window-sync-migration-dialog-accept",
          ]);

        // buttonPressed will be 0 for cancel, 1 for "more info"
        let buttonPressed = Services.prompt.confirmEx(
          win,
          title.value,
          message.value,
          Services.prompt.BUTTON_POS_0 *
            Services.prompt.BUTTON_TITLE_IS_STRING +
            Services.prompt.BUTTON_POS_1 *
              Services.prompt.BUTTON_TITLE_IS_STRING,
          learnMore.value,
          accept.value,
          null,
          null,
          {}
        );
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
      Services.prefs.prefHasUserValue(
        "widget.macos.sidebar-blend-mode.behind-window"
      ) &&
      !getBoolPref(
        "widget.macos.sidebar-blend-mode.behind-window"
      )
    ) {
      setBoolPref("zen.widget.macos.window-vibrancy", false);
    }
  }
}

export var gZenUIMigration = new nsZenUIMigration();
