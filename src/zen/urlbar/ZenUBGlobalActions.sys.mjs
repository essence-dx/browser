/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Chromium migration (lane 3): action enablement + selected tab via adapters.
// Legacy pref store / tab strip map to storage / tabs adapters
// (see src/zen/adapters/prefs.mjs, adapters/tabs.mjs).
// Icon URLs below become extension icon URLs at the shell layer;
// UrlbarProvider shell maps to omnibox below.
import {
  defineLazyPref,
  getBoolPref,
  getBoolPrefSync,
  setIntPref,
} from "../adapters/prefs.mjs";
import { getSelectedTabSync } from "../adapters/tabs.mjs";
import { gZenBoostsManager } from "../boosts/ZenBoostsManager.sys.mjs";

const lazy = {};

defineLazyPref(lazy, "currentTheme", "zen.view.window.scheme", 2);

Object.defineProperty(lazy, "l10n", {
  configurable: true,
  enumerable: true,
  get() {
    const value = new Localization(["browser/zen-command-palette.ftl"], true);
    Object.defineProperty(lazy, "l10n", {
      configurable: true,
      enumerable: true,
      value,
      writable: true,
    });
    return value;
  },
});

function getSelectedTabURI(win) {
  return getSelectedTabSync(win)?.linkedBrowser?.currentURI;
}

function isNotEmptyTab(window) {
  return !getSelectedTabSync(window)?.hasAttribute("zen-empty-tab");
}

const globalActionsTemplate = [
  {
    l10nId: "zen-action-toggle-compact-mode",
    command: "cmd_zenCompactModeToggle",
    icon: "../assets/icons/sidebar.svg",
  },
  {
    l10nId: "zen-action-open-theme-picker",
    command: "cmd_zenOpenZenThemePicker",
    icon: "../assets/icons/edit-theme.svg",
  },
  {
    l10nId: "zen-action-new-split-view",
    command: "cmd_zenNewEmptySplit",
    icon: "../assets/icons/split.svg",
  },
  {
    l10nId: "zen-action-new-folder",
    command: "cmd_zenOpenFolderCreation",
    icon: "../assets/icons/folder.svg",
  },
  {
    l10nId: "zen-action-copy-current-url",
    command: "cmd_zenCopyCurrentURL",
    icon: "../assets/icons/link.svg",
  },
  {
    l10nId: "zen-action-settings",
    command: window => window.openPreferences(),
    icon: "../assets/icons/settings.svg",
  },
  {
    l10nId: "zen-action-open-private-window",
    command: "Tools:PrivateBrowsing",
    icon: "../assets/icons/private-window.svg",
  },
  {
    l10nId: "zen-action-open-new-window",
    command: "cmd_newNavigator",
    icon: "../assets/icons/window.svg",
  },
  {
    l10nId: "zen-action-new-blank-window",
    command: "cmd_zenNewNavigatorUnsynced",
    icon: "../assets/icons/window.svg",
  },
  {
    l10nId: "zen-action-pin-tab",
    command: "cmd_zenTogglePinTab",
    icon: "../assets/icons/pin.svg",
    isAvailable: window => {
      const tab = getSelectedTabSync(window);
      return !tab?.hasAttribute("zen-empty-tab") && !tab?.pinned;
    },
  },
  {
    l10nId: "zen-action-unpin-tab",
    command: "cmd_zenTogglePinTab",
    icon: "../assets/icons/unpin.svg",
    isAvailable: window => {
      const tab = getSelectedTabSync(window);
      return !tab?.hasAttribute("zen-empty-tab") && tab?.pinned;
    },
  },
  {
    l10nId: "zen-action-open-space-routing",
    command: "cmd_zenOpenSpaceRoutingSettings",
    icon: "../assets/icons/selectable/airplane.svg",
  },
  {
    l10nId: "zen-action-new-boost",
    icon: "../assets/icons/boost.svg",
    isAvailable: window => {
      if (!isNotEmptyTab(window)) {
        return false;
      }

      // Chromium: storage-backed pref gates the boost action.
      if (!getBoolPrefSync("zen.boosts.enabled", false)) {
        return false;
      }

      // Chromium: tab URL via active tab query.
      const uri = getSelectedTabURI(window);
      return !!uri?.schemeIs && (uri.schemeIs("http") || uri.schemeIs("https"));
    },
    command: window => {
      // Chromium: tab URL via active tab query.
      const uri = getSelectedTabURI(window);
      if (!uri?.schemeIs || !(uri.schemeIs("http") || uri.schemeIs("https"))) {
        return;
      }

      let domain = "";
      try {
        domain = uri.host;
      } catch {
        return;
      }

      if (!domain) {
        return;
      }

      const boost = gZenBoostsManager.createNewBoost(domain);
      if (!boost) {
        return;
      }
      gZenBoostsManager.openBoostWindow(window, boost, uri);
    },
  },
  {
    l10nId: "zen-action-next-space",
    command: "cmd_zenWorkspaceForward",
    icon: "../assets/icons/forward.svg",
    isAvailable: window => {
      return window.gZenWorkspaces._workspaceCache.length > 1;
    },
  },
  {
    l10nId: "zen-action-previous-space",
    command: "cmd_zenWorkspaceBackward",
    icon: "../assets/icons/back.svg",
    isAvailable: window => {
      // This also covers the case of being in private mode
      return window.gZenWorkspaces._workspaceCache.length > 1;
    },
  },
  {
    l10nId: "zen-action-close-tab",
    command: "cmd_close",
    icon: "../assets/icons/close.svg",
    isAvailable: window => {
      return isNotEmptyTab(window);
    },
  },
  {
    l10nId: "zen-action-reload-tab",
    command: "Browser:Reload",
    icon: "../assets/icons/reload.svg",
  },
  {
    l10nId: "zen-action-reload-tab-without-cache",
    command: "Browser:ReloadSkipCache",
    icon: "../assets/icons/reload.svg",
  },
  {
    l10nId: "zen-action-next-tab",
    command: "Browser:NextTab",
    icon: "../assets/icons/forward.svg",
  },
  {
    l10nId: "zen-action-previous-tab",
    command: "Browser:PrevTab",
    icon: "../assets/icons/back.svg",
  },
  {
    l10nId: "zen-action-capture-screenshot",
    command: "Browser:Screenshot",
    icon: "../assets/icons/screenshot.svg",
    isAvailable: window => {
      return isNotEmptyTab(window);
    },
  },
  {
    l10nId: "zen-action-toggle-tabs-on-right",
    command: "cmd_zenToggleTabsOnRight",
    icon: "../assets/icons/sidebars-right.svg",
  },
  {
    l10nId: "zen-action-add-to-essentials",
    command: window =>
      window.gZenPinnedTabManager.addToEssentials(getSelectedTabSync(window)),
    isAvailable: window => {
      const tab = getSelectedTabSync(window);
      return (
        window.gZenPinnedTabManager.canEssentialBeAdded(tab) &&
        !tab?.hasAttribute("zen-essential")
      );
    },
    icon: "../assets/icons/essential-add.svg",
  },
  {
    l10nId: "zen-action-remove-from-essentials",
    command: window =>
      window.gZenPinnedTabManager.removeEssentials(getSelectedTabSync(window)),
    isAvailable: window =>
      getSelectedTabSync(window)?.hasAttribute("zen-essential") ?? false,
    icon: "../assets/icons/essential-remove.svg",
  },
  {
    l10nId: "zen-action-find-in-page",
    command: "cmd_find",
    icon: "../assets/icons/search-page.svg",
    isAvailable: window => {
      return isNotEmptyTab(window);
    },
  },
  {
    l10nId: "zen-action-manage-extensions",
    command: "Tools:Addons",
    icon: "../assets/icons/extension.svg",
  },
  {
    l10nId: "zen-action-switch-to-automatic-appearance",
    command: () => setIntPref("zen.view.window.scheme", 2),
    icon: "../assets/icons/sparkles.svg",
    isAvailable: () => {
      return lazy.currentTheme !== 2;
    },
  },
  {
    l10nId: "zen-action-switch-to-light-mode",
    command: () => setIntPref("zen.view.window.scheme", 1),
    icon: "../assets/icons/face-sun.svg",
    isAvailable: () => {
      return lazy.currentTheme !== 1;
    },
  },
  {
    l10nId: "zen-action-switch-to-dark-mode",
    command: () => setIntPref("zen.view.window.scheme", 0),
    icon: "../assets/icons/moon-stars.svg",
    isAvailable: () => {
      return lazy.currentTheme !== 0;
    },
  },
  {
    l10nId: "zen-action-print",
    command: "cmd_print",
    icon: "../assets/icons/print.svg",
    isAvailable: window => {
      return isNotEmptyTab(window);
    },
  },
];

export const globalActions = globalActionsTemplate.map(action => ({
  isAvailable: window => {
    return (
      window.document
        .getElementById(action.command)
        ?.getAttribute("disabled") !== "true"
    );
  },
  commandId:
    typeof action.command === "string"
      ? action.command
      : `zen:global-action-${action.l10nId.replace("zen-action-", "")}`,
  extraPayload: {},
  ...action,
  get label() {
    return lazy.l10n.formatValueSync(action.l10nId);
  },
}));
