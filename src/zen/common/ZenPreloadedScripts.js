// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Migration note (Lane 2): chrome:// + resource:// URLs below are Gecko module
// paths; Chromium loads the same UI modules as extension pages/scripts via
// chrome.runtime.getURL / import — see src/zen/adapters/*.mjs import targets.
import { loadVendorScript } from "../adapters/xul.mjs";
import { gZenSpaceRoutingManager as ZenSpaceRoutingManagerModule } from "../space-routing/ZenSpaceRoutingManager.sys.mjs";
// prettier-ignore
// eslint-disable-next-line no-lone-blocks
{
  globalThis.gZenSpaceRoutingManager = ZenSpaceRoutingManagerModule;

  loadVendorScript("chrome://browser/content/zen-components/ZenSpaceBookmarksStorage.js", globalThis);

  let scripts = [
    "chrome://browser/content/ZenStartup.mjs",
    "resource:///modules/zen/ZenSpaceManager.mjs",
    "chrome://browser/content/zen-components/ZenCompactMode.mjs",
    "chrome://browser/content/ZenUIManager.mjs",
    "chrome://browser/content/zen-components/ZenMods.mjs",
    "chrome://browser/content/zen-components/ZenKeyboardShortcuts.mjs",
    "chrome://browser/content/zen-components/ZenSession.mjs",
    "chrome://browser/content/zen-components/ZenMediaController.mjs",
    "chrome://browser/content/zen-components/ZenGlanceManager.mjs",
    "chrome://browser/content/zen-components/ZenPinnedTabManager.mjs",
    "chrome://browser/content/zen-components/ZenViewSplitter.mjs",
    "chrome://browser/content/zen-components/ZenFolders.mjs",
    "chrome://browser/content/zen-components/ZenEmojiPicker.mjs",
    "chrome://browser/content/zen-components/ZenLiveFoldersUI.mjs",
    "chrome://browser/content/zen-components/ZenDownloadAnimation.mjs",
  ];

  for (let script of scripts) {
            // Was Chrome utils importESModule(script, { global: "current" }).
    import(script);
  }

  let customZenElements = [
    ["zen-folder", "chrome://browser/content/zen-components/ZenFolder.mjs"],
    ["zen-workspace-creation", "resource:///modules/zen/ZenSpaceCreation.mjs"],
    ["zen-workspace", "resource:///modules/zen/ZenSpace.mjs"],
    ["zen-workspace-icons", "resource:///modules/zen/ZenSpaceIcons.mjs"]
  ];

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      // Only sync-import widgets once the document has loaded. If a widget is
      // used before DOMContentLoaded it will be imported and upgraded when
      // registering the customElements.setElementCreationCallback().
      for (let [tag, script] of customZenElements) {
        customElements.setElementCreationCallback(
          tag,
          function customElementCreationCallback() {
    // Was Chrome utils importESModule(script, { global: "current" }).
            import(script);
          }
        );
      }
    },
    { once: true }
  );

  loadVendorScript("chrome://browser/content/zen-components/ZenDragAndDrop.js", globalThis);
}
