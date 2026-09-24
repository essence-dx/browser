/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/* INCLUDE THIS FILE AS:
 *   <script src="../zenThemeModifier.js"></script>
 *   (Gecko path; Chromium: extension page script via chrome.runtime.getURL)
 *
 * FOR ANY WEBSITE THAT WOULD NEED TO USE THE ACCENT COLOR, ETC
 *
 * Migration note: classic script, so it cannot import adapters/prefs.mjs yet.
 * Prefs reads below map to getIntPrefSync/getBoolPrefSync/getStringPrefSync
 * (see src/zen/adapters/prefs.mjs); convert to a module on Chromium.
 */
import {
  getBoolPrefSync,
  getIntPrefSync,
  getStringPrefSync,
  addPrefObserver,
  removePrefObserver,
  getPlatform,
} from "../adapters/prefs.mjs";
import { getSelectedTabSync } from "../adapters/tabs.mjs";
{
  const platform = getPlatform().toLowerCase();
  const isMacOS = platform === "darwin" || platform === "macosx";
  const isLinux = platform === "linux";

  const kZenThemePrefsList = [
    "zen.theme.accent-color",
    "zen.theme.border-radius",
    "zen.theme.content-element-separation",
  ];
  const kZenMaxElementSeparation = 12;

  /**
   * ZenThemeModifier controls the application of theme data to the browser,
   * for example, it injects the accent color to the document. This is used
   * because we need a way to apply the accent color without having to worry about
   * shadow roots not inheriting the accent color.
   *
   * note: It must be a Firefox builtin page with access to the browser's configuration
   *  and services.
   */
  window.ZenThemeModifier = {
    _inMainBrowserWindow: false,

    /**
     * Listen for theming updates from the LightweightThemeChild actor, and
     * begin listening to changes in preferred color scheme.
     */
    init() {
      this._inMainBrowserWindow =
        window.location.href.includes("browser") ||
        window.location.protocol.startsWith("chrome-extension");
      this.listenForEvents();
      this.updateAllThemeBasics();
    },

    listenForEvents() {
      var handleEvent = this.handleEvent.bind(this);
      // Listen for changes in the accent color and border radius
      for (let pref of kZenThemePrefsList) {
        addPrefObserver(pref, handleEvent);
      }

      // Add fullscreen listener to update the theme when going in and out of fullscreen
      const eventsForSeparation = [
        "ZenViewSplitter:SplitViewDeactivated",
        "ZenViewSplitter:SplitViewActivated",
        "fullscreen",
        "ZenCompactMode:Toggled",
        "MozDOMFullscreen:Entered",
        "MozDOMFullscreen:Exited",
      ];
      const separationHandler = this.updateElementSeparation.bind(this);
      for (let eventName of eventsForSeparation) {
        window.addEventListener(eventName, separationHandler, {
          capture: true,
        });
      }

      window.addEventListener(
        "unload",
        () => {
          for (let pref of kZenThemePrefsList) {
            removePrefObserver(pref, handleEvent);
          }
          for (let eventName of eventsForSeparation) {
            window.removeEventListener(eventName, separationHandler, {
              capture: true,
            });
          }
        },
        { once: true }
      );
    },

    handleEvent() {
      // note: even might be undefined, but we shoudnt use it!
      this.updateAllThemeBasics();
    },

    /**
     * Update all theme basics, like the accent color.
     */
    async updateAllThemeBasics() {
      this.updateAccentColor();
      this.updateBorderRadius();
      this.updateElementSeparation();
    },

    updateBorderRadius() {
      const borderRadius = getIntPrefSync(
        "zen.theme.border-radius",
        -1
      );

      // -1 is the default value, will use platform-native values
      // otherwise, use the custom value
      if (borderRadius == -1) {
        if (isMacOS) {
          const targetRadius =
            document.documentElement.getAttribute("data-platform") === "macos"
              ? 11
              : 10;
          document.documentElement.style.setProperty(
            "--zen-border-radius",
            targetRadius + "px"
          );
        } else if (isLinux) {
          // Linux uses GTK CSD titlebar radius, default to 8px
          document.documentElement.style.setProperty(
            "--zen-border-radius",
            "8px"
          );
        } else {
          // Windows defaults to 8px
          document.documentElement.style.setProperty(
            "--zen-border-radius",
            "9px"
          );
        }
      } else {
        // Use the overridden value
        document.documentElement.style.setProperty(
          "--zen-border-radius",
          borderRadius + "px"
        );
      }
    },

    /**
     * @param {Event|undefined} event - The event that triggered the update, if any.
     *  If the event is a fullscreen change event, the element separation will be updated accordingly.
     */
    updateElementSeparation(event = undefined) {
      const kMinElementSeparation = 0.1; // in px
      let separation = this.elementSeparation;
      let domFullscreen =
        event?.type === "MozDOMFullscreen:Entered" ||
        document.documentElement.hasAttribute("inDOMFullscreen");
      if (
        document.documentElement.hasAttribute("inFullscreen") &&
        (!domFullscreen || event?.type === "MozDOMFullscreen:Exited") &&
        window.gZenCompactModeManager?.preference &&
        !document
          .getElementById("tabbrowser-tabbox")
          ?.hasAttribute("zen-split-view") &&
        getBoolPrefSync("zen.view.borderless-fullscreen", true)
      ) {
        separation = 0;
      }
      // In order to still use it on fullscreen, even if it's 0px, add .1px (almost invisible)
      separation = Math.max(kMinElementSeparation, separation);
      document.documentElement.style.setProperty(
        "--zen-element-separation",
        separation + "px"
      );
      if (separation == kMinElementSeparation) {
        document.documentElement.setAttribute("zen-no-padding", true);
      } else {
        document.documentElement.removeAttribute("zen-no-padding");
      }
      if (domFullscreen) {
        const selectedBrowser = getSelectedTabSync()?.linkedBrowser;
        selectedBrowser.style.paddingRight = "0.5px";
        window.addEventListener(
          "MozAfterPaint",
          () => {
            selectedBrowser.style.paddingRight = "";
          },
          { once: true }
        );
      }
    },

    get elementSeparation() {
      return Math.min(
        getIntPrefSync("zen.theme.content-element-separation", 0),
        kZenMaxElementSeparation
      );
    },

    /**
     * Update the accent color.
     */
    updateAccentColor() {
      const accentColor = getStringPrefSync(
        "zen.theme.accent-color",
        ""
      );
      document.documentElement.style.setProperty(
        "--zen-primary-color",
        accentColor
      );
    },
  };

  // The prefs adapter works in every privileged UI context (Gecko now,
  // Chromium via chrome.storage), so no capability guard is needed.
  ZenThemeModifier.init();
}
