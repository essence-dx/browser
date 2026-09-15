/* Zen Chromium shell — split view via shared pure layout tree. */
import { ZenSplitLeafNode } from "../../src/zen/shared/zenSplitLayout.mjs";

const views = document.getElementById("zen-tab-views");

export function applySplit(tabs, direction = "horizontal") {
  if (!views) {
    return;
  }
  views.style.display = "flex";
  views.style.flexDirection = direction === "vertical" ? "column" : "row";
  views.replaceChildren();
  for (const tab of tabs) {
    const leaf = new ZenSplitLeafNode(tab, 100 / tabs.length);
    const view = document.createElement("webview");
    view.src = tab.url || "about:blank";
    view.style.flex = String(leaf.sizeInParent);
    views.appendChild(view);
  }
}
