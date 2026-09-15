// Copyright 2026 Zen Browser contributors.
// Use of this source code is governed by the MPL-2.0 licence.
//
// STATUS: sketch — not compiled (no Chromium checkout on this machine).
//
// Zen layer entry point. This is the seam that turns Chromium into Zen: the
// //chrome browser window calls ZenLayer::AttachToBrowserWindow() during
// construction, and the layer docks a vertical tab strip down the left side.
//
// This is also where the architectural point lives. Under Gecko,
// src/zen/adapters/*.mjs called chrome.tabs / chrome.sessions / chrome.omnibox
// and hoped something would answer. Those APIs are implemented in Chromium's
// //chrome layer — NOT in CEF and NOT in WebView2, which are embedding
// surfaces that give you Blink rendering and nothing else. Only a real
// //chrome build has them. That is why this lane requires the checkout.

#ifndef ZEN_ZEN_LAYER_H_
#define ZEN_ZEN_LAYER_H_

#include <memory>

#include "base/memory/raw_ptr.h"

namespace views {
class View;
}

class BrowserView;

namespace zen {

class ZenTabModel;

class ZenLayer {
 public:
  ZenLayer();
  ZenLayer(const ZenLayer&) = delete;
  ZenLayer& operator=(const ZenLayer&) = delete;
  ~ZenLayer();

  // Called from the //chrome browser window once BrowserView exists.
  // Docks the vertical tab strip and registers the Zen pref set.
  void AttachToBrowserWindow(BrowserView* browser_view);

  ZenTabModel* tab_model() { return tab_model_.get(); }

 private:
  std::unique_ptr<ZenTabModel> tab_model_;
  raw_ptr<views::View> strip_ = nullptr;  // owned by the BrowserView
};

}  // namespace zen

#endif  // ZEN_ZEN_LAYER_H_
