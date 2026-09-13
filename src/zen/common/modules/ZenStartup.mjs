// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import checkForZenUpdates, {
  createWindowUpdateAnimation,
  playWindowSweepAnimation,
} from "./ZenUpdates.mjs";
import {
  getBoolPrefSync,
  getAppInfo,
  setBoolPref,
  setStringPref,
} from "../../adapters/prefs.mjs";
import { addObserver, removeObserver } from "../../adapters/observers.mjs";
import { getAllWindowsRestoredPromise } from "../../adapters/session.mjs";
import { loadVendorScript } from "../../adapters/xul.mjs";
import { ZenProgressBar } from "../sys/ui/ZenProgressBar.sys.mjs";
import { ZenSpaceRoutingNavigation } from "../sys/ui/ZenSpaceRoutingNavigation.sys.mjs";
// Gecko now; Chromium: chrome.storage.local — same adapter surface.
// Welcome loader below uses a relative path (was chrome://); Chromium loads
// the welcome module via chrome.runtime.getURL.

class ZenStartup {
  #watermarkIgnoreElements = ["zen-toast-container", "zen-browser-background"];
  #hasInitializedLayout = false;

  isReady = false;
  promiseInitialized = new Promise(resolve => {
    this.promiseInitializedResolve = resolve;
  });

  init() {
    this.openWatermark();
    this.#zenInitBrowserLayout();
  }

  get #shouldUseWatermark() {
    return (
      getBoolPrefSync("zen.watermark.enabled", false) &&
      gZenWorkspaces.shouldHaveWorkspaces
    );
  }

  #zenInitBrowserLayout() {
    if (this.#hasInitializedLayout) {
      return;
    }
    this.#hasInitializedLayout = true;
    gZenKeyboardShortcutsManager.beforeInit();
    try {
      const kNavbarItems = ["nav-bar", "PersonalToolbar"];
      const kNewContainerId = "zen-appcontent-navbar-container";
      let newContainer = document.getElementById(kNewContainerId);
      for (let id of kNavbarItems) {
        const node = document.getElementById(id);
        if (!node) {
          console.error("Could not find node with id: " + id);
          continue;
        }
        newContainer.appendChild(node);
      }
      // Fix notification deck
      const deckTemplate =
        document.getElementById("tab-notification-deck-template") ||
        document.getElementById("tab-notification-deck");

      // overlap and interaction issues with vertical tabs
      document.getElementById("browser").prepend(deckTemplate);

      gZenWorkspaces.init().then(() => {
        gZenUIManager.init();
        this.#initUIComponents();
        this.#checkForWelcomePage();
      });
    } catch (e) {
      console.error("ZenThemeModifier: Error initializing browser layout", e);
    }
    if (gBrowserInit.delayedStartupFinished) {
      this.delayedStartupFinished();
    } else {
      addObserver(this, "browser-delayed-startup-finished");
    }
  }

  observe(aSubject, aTopic) {
    // This nsIObserver method allows us to defer initialization until after
    // this window has finished painting and starting up.
    if (aTopic == "browser-delayed-startup-finished" && aSubject == window) {
      removeObserver(this, "browser-delayed-startup-finished");
      this.delayedStartupFinished();
    }
  }

  delayedStartupFinished() {
    gZenWorkspaces.promiseInitialized.then(async () => {
      await delayedStartupPromise;
      await getAllWindowsRestoredPromise();
      delete gZenUIManager.promiseInitialized;
      gZenCompactModeManager.init();
      // Fix for https://github.com/zen-browser/desktop/issues/7605, specially in compact mode
      if (gURLBar.hasAttribute("breakout-extend")) {
        gURLBar.focus();
      }
      // A bit of a hack to make sure the tabs toolbar is updated.
      // Just in case we didn't get the right size.
      gZenUIManager.updateTabsToolbar();
      this.closeWatermark();
      document
        .getElementById("tabbrowser-arrowscrollbox")
        .setAttribute("orient", "vertical");
      this.isReady = true;
      this.promiseInitializedResolve();
      delete this.promiseInitializedResolve;

      setTimeout(() => {
        // Wait for the natural PlacesToolbar rebuild before invalidating, so
        // the two async rebuilds don't interleave and duplicate bookmarks.
        // promiseRebuilt() returns undefined when no rebuild is in flight.
        const rebuilt =
          document
            .getElementById("PlacesToolbar")
            ?._placesView?.promiseRebuilt() ?? Promise.resolve();
        rebuilt
          .catch(console.error)
          .then(() => gZenWorkspaces._invalidateBookmarkContainers());
      });
    });
  }

  openWatermark() {
    if (!this.#shouldUseWatermark) {
      document.documentElement.removeAttribute("zen-before-loaded");
      return;
    }
    for (let elem of document.querySelectorAll(
      `#browser > *:not(${this.#watermarkIgnoreElements.map(id => "#" + id).join(", ")}), #urlbar`
    )) {
      elem.style.opacity = 0;
    }
  }

  closeWatermark() {
    document.documentElement.removeAttribute("zen-before-loaded");
    if (this.#shouldUseWatermark) {
      let elementsToIgnore = this.#watermarkIgnoreElements
        .map(id => "#" + id)
        .join(", ");
      gZenUIManager.motion
        .animate(
          "#browser > *:not(" +
            elementsToIgnore +
            "), #urlbar, #tabbrowser-tabbox > *",
          {
            opacity: [0, 1],
          },
          {
            duration: 0.1,
          }
        )
        .then(() => {
          for (let elem of document.querySelectorAll(
            "#browser > *, #urlbar, #tabbrowser-tabbox > *"
          )) {
            elem.style.removeProperty("opacity");
          }
        });
    }
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new window.Event("resize")); // To recalculate the layout
    });
  }

  #initUIComponents() {
    const kUIComponents = [ZenProgressBar, ZenSpaceRoutingNavigation];
    for (const Component of kUIComponents) {
      new Component(window);
    }
  }

  #checkForWelcomePage() {
    const kWelcomeScreenSeenPref = "zen.welcome-screen.seen";
    // No env service on Chromium; headless is handled by the embedder.
    const isHeadless = false;
    if (isHeadless) {
      setBoolPref(kWelcomeScreenSeenPref, true);
      return;
    }
    if (!getBoolPrefSync(kWelcomeScreenSeenPref, false)) {
      setBoolPref(kWelcomeScreenSeenPref, true);
      setStringPref(
        "zen.updates.last-build-id",
        getAppInfo().appBuildID
      );
      setStringPref(
        "zen.updates.last-version",
        getAppInfo().version
      );
      loadVendorScript(
        "../../welcome/ZenWelcome.mjs",
        // was: chrome://browser/content/zen-components/ZenWelcome.mjs
        window
      );
    } else {
      this.#createUpdateAnimation();
    }
  }

  async #createUpdateAnimation() {
    checkForZenUpdates();
    return await createWindowUpdateAnimation();
  }

  /**
   * Entry point for privileged modules (e.g. the sync applier) to play the
   * update sweep animation in this window.
   */
  playWindowSweepAnimation() {
    return playWindowSweepAnimation();
  }
}

window.gZenStartup = new ZenStartup();

window.addEventListener(
  "MozBeforeInitialXULLayout",
  () => {
    gZenStartup.init();
  },
  { once: true }
);
