/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ProvidersManager } from "moz-src:///browser/components/urlbar/UrlbarProvidersManager.sys.mjs";
import { ZenUrlbarProviderGlobalActions } from "./ZenUBActionsProvider.sys.mjs";

// Chromium migration (lane 3): urlbar provider registration.
// Legacy provider manager maps to omnibox keyword registration
// (see adapters notes; omnibox keyword replaces provider classes).

const zenUrlbarProviders = {
  ZenUrlbarProviderGlobalActions,
};

export function registerZenUrlbarProviders() {
  let instance = ProvidersManager.getInstanceForSap("urlbar");
  for (let i = 0; i < Object.keys(zenUrlbarProviders).length; i++) {
    const provider = Object.values(zenUrlbarProviders)[i];
    const name = Object.keys(zenUrlbarProviders)[i];
    if (!instance.getProvider(name)) {
      instance.registerProvider(new provider());
    }
  }
}
