// Copyright 2026 Zen Browser contributors.
// Use of this source code is governed by the MPL-2.0 licence.

#include "zen/zen_tab_model.h"

#include <algorithm>
#include <utility>

namespace zen {

ZenTabModel::ZenTabModel() = default;
ZenTabModel::~ZenTabModel() = default;

void ZenTabModel::AddObserver(ZenTabModelObserver* observer) {
  observers_.AddObserver(observer);
}

void ZenTabModel::RemoveObserver(ZenTabModelObserver* observer) {
  observers_.RemoveObserver(observer);
}

int ZenTabModel::CreateTab(std::string url, int workspace_id) {
  ZenTab tab;
  tab.id = next_id_++;
  tab.url = std::move(url);
  tab.workspace_id = workspace_id;
  tabs_.push_back(std::move(tab));

  // A first tab is always selected, matching Gecko's behaviour of never
  // leaving a window with no selected tab.
  if (!selected_id_.has_value()) {
    selected_id_ = tabs_.back().id;
    for (ZenTabModelObserver& observer : observers_) {
      observer.OnSelectionChanged(*selected_id_);
    }
  }
  NotifyTabsChanged();
  return tabs_.back().id;
}

bool ZenTabModel::CloseTab(int id) {
  auto it = std::find_if(tabs_.begin(), tabs_.end(),
                         [id](const ZenTab& t) { return t.id == id; });
  if (it == tabs_.end()) {
    return false;
  }
  // Essential tabs are not closable — that is the point of the feature.
  if (it->is_essential) {
    return false;
  }

  const bool was_selected = selected_id_.has_value() && *selected_id_ == id;
  const size_t index = static_cast<size_t>(std::distance(tabs_.begin(), it));
  tabs_.erase(it);

  if (was_selected) {
    if (tabs_.empty()) {
      selected_id_.reset();
      for (ZenTabModelObserver& observer : observers_) {
        observer.OnSelectionChanged(-1);
      }
    } else {
      // Prefer the tab that slid into this slot; fall back to the last one.
      const size_t next = std::min(index, tabs_.size() - 1);
      selected_id_ = tabs_[next].id;
      for (ZenTabModelObserver& observer : observers_) {
        observer.OnSelectionChanged(*selected_id_);
      }
    }
  }
  NotifyTabsChanged();
  return true;
}

bool ZenTabModel::SelectTab(int id) {
  if (!GetTab(id).has_value()) {
    return false;
  }
  if (selected_id_.has_value() && *selected_id_ == id) {
    return true;
  }
  selected_id_ = id;
  for (ZenTabModelObserver& observer : observers_) {
    observer.OnSelectionChanged(id);
  }
  return true;
}

void ZenTabModel::SetPinned(int id, bool pinned) {
  for (ZenTab& tab : tabs_) {
    if (tab.id == id) {
      tab.pinned = pinned;
      if (pinned) {
        tab.is_essential = false;  // essential and pinned are exclusive
      }
      NotifyTabsChanged();
      return;
    }
  }
}

void ZenTabModel::SetEssential(int id, bool essential) {
  for (ZenTab& tab : tabs_) {
    if (tab.id == id) {
      tab.is_essential = essential;
      if (essential) {
        tab.pinned = false;
      }
      NotifyTabsChanged();
      return;
    }
  }
}

std::optional<ZenTab> ZenTabModel::GetTab(int id) const {
  auto it = std::find_if(tabs_.begin(), tabs_.end(),
                         [id](const ZenTab& t) { return t.id == id; });
  if (it == tabs_.end()) {
    return std::nullopt;
  }
  return *it;
}

std::vector<ZenTab> ZenTabModel::TabsInDisplayOrder() const {
  std::vector<ZenTab> ordered = tabs_;
  // stable_sort keeps each group's relative order, which is what the strip
  // needs — a re-sort must not shuffle tabs within a group.
  std::stable_sort(ordered.begin(), ordered.end(),
                   [](const ZenTab& a, const ZenTab& b) {
                     const int rank_a = a.is_essential ? 0 : (a.pinned ? 1 : 2);
                     const int rank_b = b.is_essential ? 0 : (b.pinned ? 1 : 2);
                     return rank_a < rank_b;
                   });
  return ordered;
}

void ZenTabModel::NotifyTabsChanged() {
  for (ZenTabModelObserver& observer : observers_) {
    observer.OnTabsChanged();
  }
}

}  // namespace zen
