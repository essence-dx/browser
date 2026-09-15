/* Chromium shim for nsZenBoostsBackend.cpp + ZenStyleSheetCache (boosts/mods). */
/* Gecko: native accent/style caches. Chromium: chrome.storage + adopted
 * style sheets, same resolve/apply surface used by ZenBoostsManager. */

export async function getCachedStyle(key) {
  try {
    return (await chrome.storage.local.get(key))?.[key] ?? null;
  } catch {
    return null;
  }
}

export async function setCachedStyle(key, css) {
  try {
    await chrome.storage.local.set({ [key]: css });
  } catch {}
}

export function applyBoostStyle(css) {
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(String(css || ""));
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    return sheet;
  } catch {
    const el = document.createElement("style");
    el.textContent = String(css || "");
    document.documentElement.appendChild(el);
    return el;
  }
}
