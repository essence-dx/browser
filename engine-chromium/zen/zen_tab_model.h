// Copyright 2026 Zen Browser contributors.
// Use of this source code is governed by the MPL-2.0 licence.
//
// Zen tab model — engine-agnostic. This file contains no Chromium UI types and
// no Gecko types, so it is the one part of the //zen layer that can be reasoned
// about (and unit-tested) without a Chromium checkout. It replaces the tab
// bookkeeping that src/zen/adapters/tabs.mjs previously faked with chrome.tabs.

#ifndef ZEN_ZEN_TAB_MODEL_H_
#define ZEN_ZEN_TAB_MODEL_H_

#include <optional>
#include <string>
#include <vector>

#include "base/observer_list.h"

namespace zen {

// Declared before the model so base::ObserverList<ZenTabModelObserver> is
// instantiated over a complete type.
class ZenTabModelObserver {
 public:
  virtual void OnTabsChanged() {}
  virtual void OnSelectionChanged(int id) {}

 protected:
  virtual ~ZenTabModelObserver() = default;
};

// One tab. Mirrors the fields src/zen/tabs/ reads off a Gecko <tab> element.
struct ZenTab {
  int id = 0;
  std::u16string title;
  std::string url;
  bool pinned = false;
  bool is_essential = false;  // Zen "essential" tab (always loaded, no close)
  int workspace_id = 0;       // Zen workspaces replace Gecko tab containers
};

// Ordered, observable tab collection. Selection and pin/essential state live
// here so both the Views tab strip and the WebUI chrome page read one source of
// truth — the role SessionStore/PlacesUtils played under Gecko.
class ZenTabModel {
 public:
  ZenTabModel();
  ZenTabModel(const ZenTabModel&) = delete;
  ZenTabModel& operator=(const ZenTabModel&) = delete;
  ~ZenTabModel();

  void AddObserver(ZenTabModelObserver* observer);
  void RemoveObserver(ZenTabModelObserver* observer);

  int CreateTab(std::string url, int workspace_id);
  bool CloseTab(int id);
  bool SelectTab(int id);

  // Zen-specific: pinned tabs sort ahead of unpinned within a workspace, and
  // essentials sort ahead of pinned. Mirrors src/zen/tabs/zen-tabs ordering.
  void SetPinned(int id, bool pinned);
  void SetEssential(int id, bool essential);

  const std::vector<ZenTab>& tabs() const { return tabs_; }
  std::optional<int> selected_id() const { return selected_id_; }
  std::optional<ZenTab> GetTab(int id) const;

  // Tabs in display order for the vertical strip: essentials, then pinned,
  // then the rest, each group stable within itself.
  std::vector<ZenTab> TabsInDisplayOrder() const;

 private:
  void NotifyTabsChanged();

  std::vector<ZenTab> tabs_;
  std::optional<int> selected_id_;
  int next_id_ = 1;
  base::ObserverList<ZenTabModelObserver> observers_;
};

}  // namespace zen

#endif  // ZEN_ZEN_TAB_MODEL_H_
