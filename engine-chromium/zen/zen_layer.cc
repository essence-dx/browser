// Copyright 2026 Zen Browser contributors.
// Use of this source code is governed by the MPL-2.0 licence.
//
// STATUS: sketch — not compiled. See zen_layer.h.

#include "zen/zen_layer.h"

#include "zen/zen_tab_model.h"
#include "zen/zen_vertical_tab_strip.h"

namespace zen {

ZenLayer::ZenLayer() : tab_model_(std::make_unique<ZenTabModel>()) {}

ZenLayer::~ZenLayer() = default;

void ZenLayer::AttachToBrowserWindow(BrowserView* browser_view) {
  // TODO(zen): once BrowserView is available,
  //   1. construct a ZenVerticalTabStrip over tab_model_;
  //   2. add it as a child and dock it left (the Views equivalent of Zen's
  //      `#tabbrowser-tabs { -moz-box-orient: vertical }`);
  //   3. hide Chromium's horizontal tab strip so the two do not both show;
  //   4. bridge the strip's selection back into TabStripModel so content
  //      actually switches — the strip is the UI, TabStripModel stays the
  //      source of truth for the web contents.
  // Step 4 is the part that must not be faked: a strip that renders but does
  // not drive TabStripModel is exactly the mock this lane replaces.
}

}  // namespace zen
