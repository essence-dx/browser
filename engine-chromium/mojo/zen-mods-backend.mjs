/* Chromium shim for nsIZenModsBackend (mods). */
/* Gecko: nsZenModsBackend.cpp rebuilds Servo stylesheets. Chromium:
 * chrome.scripting.insertCSS / removeCSS, same rebuildModsStyles surface. */

const STYLE_ID = "zen-mods-backend";

export async function rebuildModsStyles(contents) {
  const css = String(contents || "");
  if (typeof chrome?.scripting?.insertCSS === "function") {
    try {
      await chrome.scripting.removeCSS({ target: { allFrames: true }, css: "" }).catch(() => {});
    } catch {}
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id !== undefined) {
        await chrome.scripting.insertCSS({ target: { tabId: tab.id, allFrames: true }, css });
        return;
      }
    } catch {}
  }
  try {
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.documentElement.appendChild(el);
    }
    el.textContent = css;
  } catch {}
}
