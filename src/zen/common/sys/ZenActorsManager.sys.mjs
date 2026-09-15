// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// Utility to register JSWindowActors

import { ActorManagerParent } from "../../adapters/gre.mjs";
import { getStringPrefSync, getAppInfo } from "../../adapters/prefs.mjs";
// Gecko actors (relative paths below); Chromium: content scripts
// via scripting API — Lane 3 migrates mods/; this registry maps there.

/**
 * Fission-compatible JSProcess implementations.
 * Each actor options object takes the form of a ProcessActorOptions dictionary.
 * Detailed documentation of these options is in dom/docs/ipc/jsactors.rst,
 * available at https://firefox-source-docs.mozilla.org/dom/ipc/jsactors.html
 */
let JSPROCESSACTORS = {};

/**
 * Fission-compatible JSWindowActor implementations.
 * Detailed documentation of these options is in dom/docs/ipc/jsactors.rst,
 * available at https://firefox-source-docs.mozilla.org/dom/ipc/jsactors.html
 */
let JSWINDOWACTORS = {
  ZenModsMarketplace: {
    parent: {
      esModuleURI: "../../mods/actors/ZenModsMarketplaceParent.sys.mjs",
    },
    child: {
      esModuleURI: "../../mods/actors/ZenModsMarketplaceChild.sys.mjs",
      events: {
        DOMContentLoaded: {},
      },
    },
    safeForUntrustedWebProcess: true,
    matches: [
      ...getStringPrefSync("zen.injections.match-urls").split(","),
      "about:preferences",
    ],
  },
  ZenGlance: {
    parent: {
      esModuleURI: "../../glance/actors/ZenGlanceParent.sys.mjs",
    },
    child: {
      esModuleURI: "../../glance/actors/ZenGlanceChild.sys.mjs",
      events: {
        DOMContentLoaded: {},
        mousedown: {
          capture: true,
        },
        keydown: {
          capture: true,
        },
        click: {
          capture: true,
        },
      },
    },
    allFrames: true,
    remoteTypes: ["web", "file"],
    safeForUntrustedWebProcess: true,
    enablePreference: "zen.glance.enabled",
  },
  ZenWindowDrag: {
    parent: {
      esModuleURI: "../../window-drag/actors/ZenWindowDragParent.sys.mjs",
    },
    child: {
      esModuleURI: "../../window-drag/actors/ZenWindowDragChild.sys.mjs",
      events: {
        mousedown: {
          mozSystemGroup: true,
        },
      },
    },
    messageManagerGroups: ["browsers"],
    remoteTypes: ["web", "file"],
    safeForUntrustedWebProcess: true,
    enablePreference: "zen.view.drag-window-from-content",
  },
};

if (!getAppInfo().inSafeMode) {
  JSWINDOWACTORS.ZenBoosts = {
    parent: {
      esModuleURI: "../../boosts/actors/ZenBoostsParent.sys.mjs",
    },
    child: {
      esModuleURI: "../../boosts/actors/ZenBoostsChild.sys.mjs",
      events: {
        // Needed to let the actor be created, please don't remove
        // without checking if boosts still work without it, thanks <3
        DOMWindowCreated: {},
      },
    },
    safeForUntrustedWebProcess: true,
    allFrames: true,
    remoteTypes: ["web", "file"],
    enablePreference: "zen.boosts.enabled",
  };
}

export let gZenActorsManager = {
  init() {
    ActorManagerParent.addJSProcessActors(JSPROCESSACTORS);
    ActorManagerParent.addJSWindowActors(JSWINDOWACTORS);
  },
};
