/* Zen Chromium shell — tab strip owning BrowserView guests. */
/* Reuses adapters/tabs.mjs (chrome.tabs branch) + adapters/windows.mjs. */

import { getTabs, addTab, setSelectedTab, removeTab } from "../../src/zen/adapters/tabs.mjs";
import { getTopWindow } from "../../src/zen/adapters/windows.mjs";

const tabsList = document.getElementById("zen-tabs-list");
const newTabBtn = document.getElementById("zen-new-tab");

function renderTabButton(tab) {
  const btn = document.createElement("button");
  btn.className = "zen-tab-button";
  btn.setAttribute("role", "tab");
  btn.setAttribute("zen-tab-id", String(tab.id ?? tab.url ?? Math.random()));
  btn.textContent = tab.title || tab.url || "New tab";
  btn.addEventListener("click", () => setSelectedTab(tab).catch(() => {}));
  return btn;
}

export async function refreshTabs() {
  try {
    const tabs = (await getTabs()) || [];
    tabsList.replaceChildren();
    for (const tab of tabs) {
      tabsList.appendChild(renderTabButton(tab));
    }
  } catch {
    // Shell boots with static webviews when chrome.tabs is unavailable.
  }
}

newTabBtn?.addEventListener("click", async () => {
  try {
    await addTab("about:blank", {});
    await refreshTabs();
  } catch {}
});

try {
  chrome?.tabs?.onUpdated?.addListener?.(() => refreshTabs());
  chrome?.tabs?.onRemoved?.addListener?.(() => refreshTabs());
} catch {}

refreshTabs();
getTopWindow().catch(() => {});
