// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import createSidebarNotification from "./ZenSidebarNotification.mjs";
import {
  getBoolPrefSync,
  getStringPrefSync,
  getAppInfo,
  setStringPref,
} from "../../adapters/prefs.mjs";
import { notifyObservers } from "../../adapters/observers.mjs";
// Gecko now; Chromium: chrome.storage.local — same adapter surface.

const ZEN_UPDATE_PREF = "zen.updates.last-version";
const ZEN_BUILD_ID_PREF = "zen.updates.last-build-id";
const ZEN_UPDATE_SHOW = "zen.updates.show-update-notification";
const ZEN_UPDATE_NOTIFICATION_TIMEOUT_MS = 15000;

export default function checkForZenUpdates() {
  const version = getAppInfo().version;
  const lastVersion = getStringPrefSync(ZEN_UPDATE_PREF, "");
  setStringPref(ZEN_UPDATE_PREF, version);
  if (
    version === lastVersion ||
    gZenUIManager.testingEnabled ||
    !getBoolPrefSync(ZEN_UPDATE_SHOW, true)
  ) {
    return;
  }
  const updateUrl = getStringPrefSync(
    "app.releaseNotesURL.prompt",
    ""
  );
  createSidebarNotification({
    headingL10nId: "zen-sidebar-notification-updated-heading",
    autoHideMs: ZEN_UPDATE_NOTIFICATION_TIMEOUT_MS,
    links: [
      {
        url: updateUrl.replace("%VERSION%", version),
        l10nId: "zen-sidebar-notification-updated",
        special: true,
        icon: "../assets/icons/sparkles.svg",
      },
      {
        url: "https://www.zen-browser.app/donate",
        l10nId: "zen-sidebar-notification-donate",
        icon: "../assets/icons/heart-circle-fill.svg",
      },
      {
        action: () => {
          notifyObservers(window, "restart-in-safe-mode");
        },
        l10nId: "zen-sidebar-notification-restart-safe-mode",
        icon: "../assets/icons/security-broken.svg",
        // Chromium: chrome.runtime.getURL("zen-icons/security-broken.svg").
      },
    ],
  });
}

export async function createWindowUpdateAnimation() {
  const appID = getAppInfo().appBuildID;
  if (
    getStringPrefSync(ZEN_BUILD_ID_PREF, "") === appID ||
    gZenUIManager.testingEnabled
  ) {
    return;
  }
  setStringPref(ZEN_BUILD_ID_PREF, appID);
  await playWindowSweepAnimation();
}

/**
 * Plays the full-window sweep shown after updates. Also used the first
 * time incoming sync data is applied on this profile.
 */
export async function playWindowSweepAnimation() {
  await gZenWorkspaces.promiseInitialized;
  const appWrapper = document.getElementById("zen-main-app-wrapper");
  const element = document.createElement("div");
  element.id = "zen-update-animation";
  const elementBorder = document.createElement("div");
  elementBorder.id = "zen-update-animation-border";
  requestIdleCallback(() => {
    if (gReduceMotion) {
      return;
    }
    appWrapper.appendChild(element);
    appWrapper.appendChild(elementBorder);
    Promise.all([
      gZenUIManager.motion.animate(
        "#zen-update-animation",
        {
          top: ["100%", "-50%"],
          opacity: [0.5, 1],
        },
        {
          duration: 0.35,
        }
      ),
      gZenUIManager.motion.animate(
        "#zen-update-animation-border",
        {
          "--background-top": ["150%", "-50%"],
        },
        {
          duration: 0.35,
          delay: 0.08,
        }
      ),
    ]).then(() => {
      element.remove();
      elementBorder.remove();
    });
  });
}
