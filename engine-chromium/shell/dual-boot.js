/* Zen dual-boot — tab 1 Chromium, tab 2 Gecko fallback. */
/* Per-tab engine switch recreates the guest; no in-place DOM translate. */
import { isChromium, isGecko } from "../../src/zen/adapters/engine.mjs";

const view1 = document.getElementById("zen-view-1");
const view2 = document.getElementById("zen-view-2");

export function bootDual() {
  const engine = (() => {
    try {
      return document.documentElement.getAttribute("data-engine") || "chromium";
    } catch {
      return "chromium";
    }
  })();
  const showChromium = isChromium(engine) || engine === "chromium";
  const showGecko = isGecko(engine) || engine === "dual";
  if (view1) {
    view1.style.display = showChromium ? "flex" : "none";
    if (showChromium && !view1.src) {
      view1.src = "about:blank";
    }
  }
  if (view2) {
    view2.style.display = showGecko && !showChromium ? "flex" : "none";
    if (showGecko && !view2.src) {
      view2.src = "about:blank";
    }
  }
  // Default dual-boot: tab 1 visible (Chromium), tab 2 hidden (Gecko standby).
  if (view1 && view2 && showChromium && showGecko) {
    view1.style.display = "flex";
    view2.style.display = "none";
  }
}

bootDual();
