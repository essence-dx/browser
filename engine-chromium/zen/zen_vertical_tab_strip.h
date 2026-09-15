// Copyright 2026 Zen Browser contributors.
// Use of this source code is governed by the MPL-2.0 licence.
//
// STATUS: sketch. This is the one file in the //zen layer whose API surface is
// Chromium-UI-specific, and it has NOT been compiled — there is no Chromium
// checkout on this machine (see docs/chromium-lane-plan.md, disk gate).
// Treat the exact Views API usage as a starting point to reconcile against the
// tree's actual headers, not as verified code. The layout intent is what
// matters here: Zen's vertical tab strip is a left-docked scrollable column
// with three groups, which is why it cannot reuse Chromium's horizontal
// TabStrip (a views::View subclass with a fundamentally horizontal layout).

#ifndef ZEN_ZEN_VERTICAL_TAB_STRIP_H_
#define ZEN_ZEN_VERTICAL_TAB_STRIP_H_

#include "base/memory/raw_ptr.h"
#include "ui/views/view.h"
#include "zen/zen_tab_model.h"

namespace zen {

// Left-docked vertical tab strip. Reads ZenTabModel and renders one row per
// tab in display order (essentials, pinned, rest).
class ZenVerticalTabStrip : public views::View,
                            public ZenTabModelObserver {
 public:
  explicit ZenVerticalTabStrip(ZenTabModel* model);
  ZenVerticalTabStrip(const ZenVerticalTabStrip&) = delete;
  ZenVerticalTabStrip& operator=(const ZenVerticalTabStrip&) = delete;
  ~ZenVerticalTabStrip() override;

  // views::View:
  void OnPaint(gfx::Canvas* canvas) override;
  gfx::Size CalculatePreferredSize(
      const views::SizeBounds& available_size) const override;

  // ZenTabModelObserver:
  void OnTabsChanged() override;
  void OnSelectionChanged(int id) override;

 private:
  void RebuildRows();

  raw_ptr<ZenTabModel> model_;  // owned by the browser window
};

}  // namespace zen

#endif  // ZEN_ZEN_VERTICAL_TAB_STRIP_H_
