// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Chromium migration (lane 3): native window move via windows adapter.
// Legacy native drag service + observer bus map to a shell drag shim +
// shared event bus (see src/zen/adapters/observers.mjs).
import { notifyObservers } from "../../adapters/observers.mjs";

function beginNativeWindowMove(win) {
  try {
    Cc["@mozilla.org/zen/drag-and-drop;1"]
      .getService(Ci.nsIZenDragAndDrop)
      .beginNativeWindowMove(win);
  } catch {
    /* shell drag shim takes over where the native service is unavailable */
  }
}

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
        beginNativeWindowMove(win);
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
