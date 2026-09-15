// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Migration note (Lane 2): relative UI module paths below work on both
// engines; Chromium loads the same UI modules as extension pages/scripts via
// runtime URL and import — see src/zen/adapters import targets.
import { loadVendorScript } from "../adapters/xul.mjs";
import { gZenSpaceRoutingManager as ZenSpaceRoutingManagerModule } from "../space-routing/ZenSpaceRoutingManager.sys.mjs";
// prettier-ignore
// eslint-disable-next-line no-lone-blocks
{
  globalThis.gZenSpaceRoutingManager = ZenSpaceRoutingManagerModule;

  loadVendorScript("../spaces/ZenSpaceBookmarksStorage.js", globalThis);

  let scripts = [
    "./modules/ZenStartup.mjs",
    "../spaces/ZenSpaceManager.mjs",
    "../compact-mode/ZenCompactMode.mjs",
    "./modules/ZenUIManager.mjs",
    "../mods/ZenMods.mjs",
    "../kbs/ZenKeyboardShortcuts.mjs",
    "./modules/ZenSession.mjs",
    "../media/ZenMediaController.mjs",
    "../glance/ZenGlanceManager.mjs",
    "../tabs/ZenPinnedTabManager.mjs",
    "../split-view/ZenViewSplitter.mjs",
    "../folders/ZenFolders.mjs",
    "./emojis/ZenEmojiPicker.mjs",
    "../live-folders/ZenLiveFoldersUI.mjs",
    "../downloads/ZenDownloadAnimation.mjs",
  ];

  for (let script of scripts) {
            // Was platform importESModule(script, { global: "current" }).
    import(script);
  }

  let customZenElements = [
    ["zen-folder", "../folders/ZenFolder.mjs"],
    ["zen-workspace-creation", "../spaces/ZenSpaceCreation.mjs"],
    ["zen-workspace", "../spaces/ZenSpace.mjs"],
    ["zen-workspace-icons", "../spaces/ZenSpaceIcons.mjs"]
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
    // Was platform importESModule(script, { global: "current" }).
            import(script);
          }
        );
      }
    },
    { once: true }
  );

  loadVendorScript("../drag-and-drop/ZenDragAndDrop.js", globalThis);
}
