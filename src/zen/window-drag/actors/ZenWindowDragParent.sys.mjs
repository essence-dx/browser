// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { XPCOMUtils } from "resource://gre/modules/XPCOMUtils.sys.mjs";

// Chromium migration (lane 3): native window move via windows adapter.
// Gecko: nsIZenDragAndDrop XPCOM + Services.obs. Chromium: chrome.windows drag
// region / shell drag shim + chrome.events (see src/zen/adapters/observers.mjs).
import { notifyObservers } from "../../adapters/observers.mjs";

const lazy = {};

// Chromium: XPCOM lazy service has no equivalent; shell provides a drag shim.
XPCOMUtils.defineLazyServiceGetter(
  lazy,
  "zenDragAndDropService",
  "@mozilla.org/zen/drag-and-drop;1",
  Ci.nsIZenDragAndDrop
);

export class ZenWindowDragParent extends JSWindowActorParent {
  receiveMessage(message) {
    const win = this.browsingContext.topChromeWindow;
    if (!win || win.closed) {
      return undefined;
    }
    switch (message.name) {
      case "ZenWindowDrag:StartDrag": {
        if (win.windowState === win.STATE_FULLSCREEN) {
          break;
        }
        if (Cu.isInAutomation) {
          // Tests can't exercise a real OS drag session; let them observe
          // the decision instead.
          notifyObservers(win, "zen-window-drag-started");
          break;
        }
        lazy.zenDragAndDropService.beginNativeWindowMove(win);
        break;
      }
      case "ZenWindowDrag:IsSnapped": {
        return this.#isSnapped(win);
      }
    }
    return undefined;
  }

  /**
   * Whether the window is maximized or tiled to an edge. The tiled
   * attribute is kept in sync with the widget by AppWindow, the same way
   * sizemode is.
   *
   * @param {ChromeWindow} win
   */
  #isSnapped(win) {
    return (
      win.windowState === win.STATE_MAXIMIZED ||
      win.document.documentElement.hasAttribute("tiled")
    );
  }
}
