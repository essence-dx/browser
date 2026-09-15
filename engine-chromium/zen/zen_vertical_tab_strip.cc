// Copyright 2026 Zen Browser contributors.
// Use of this source code is governed by the MPL-2.0 licence.
//
// STATUS: sketch — not compiled. See the header for why.

#include "zen/zen_vertical_tab_strip.h"

#include <memory>

#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/gfx/canvas.h"
#include "ui/views/layout/fill_layout.h"

namespace zen {

namespace {
// Zen's vertical strip is user-resizable; this is the default expanded width
// and corresponds to the CSS custom property in
// src/zen/tabs/zen-tabs/vertical-tabs.css.
constexpr int kDefaultStripWidth = 220;
constexpr int kTabRowHeight = 32;
}  // namespace

ZenVerticalTabStrip::ZenVerticalTabStrip(ZenTabModel* model) : model_(model) {
  // A vertical BoxLayout inside a ScrollView is the Views equivalent of the
  // flex column in vertical-tabs.css. Reconcile against the tree's actual
  // layout API before building.
  SetLayoutManager(std::make_unique<views::FillLayout>());
  model_->AddObserver(this);
}

ZenVerticalTabStrip::~ZenVerticalTabStrip() {
  if (model_) {
    model_->RemoveObserver(this);
  }
}

void ZenVerticalTabStrip::OnTabsChanged() {
  RebuildRows();
  SchedulePaint();
}

void ZenVerticalTabStrip::OnSelectionChanged(int id) {
  // Selection only changes row styling; a full rebuild would drop focus.
  SchedulePaint();
}

void ZenVerticalTabStrip::RebuildRows() {
  // TODO(zen): create one row view per ZenTab in model_->TabsInDisplayOrder(),
  // reusing row views across rebuilds so focus and hover state survive.
}

void ZenVerticalTabStrip::OnPaint(gfx::Canvas* canvas) {
  views::View::OnPaint(canvas);
}

gfx::Size ZenVerticalTabStrip::CalculatePreferredSize(
    const views::SizeBounds& available_size) const {
  const int height = available_size.height().is_bounded()
                         ? available_size.height().value()
                         : kTabRowHeight * 10;
  return gfx::Size(kDefaultStripWidth, height);
}

BEGIN_METADATA(ZenVerticalTabStrip)
END_METADATA

}  // namespace zen
