# Mojo / chrome.* shims for Gecko XPCOM (Chromium engine)

Each `nsIZen*.idl` + `nsZen*.cpp` in `src/zen/` keeps compiling on Gecko.
On Chromium (`surfer.json migration.engine === "chromium"`) these XPCOM
components are not built; the shims below implement the same interface
with web APIs + `chrome.*`:

| Gecko XPCOM | Chromium shim | API |
|---|---|---|
| `compact-mode/nsIZenMouseTracker.idl` + `ZenMouseTracker.cpp` | `zen-mouse-tracker.mjs` | `IntersectionObserver` + `chrome.windows` |
| `mods/nsIZenModsBackend.idl` + `nsZenModsBackend.cpp` + `ZenStyleSheetCache.cpp` | `zen-mods-backend.mjs` | `chrome.scripting.insertCSS/removeCSS` |
| `drag-and-drop/nsIZenDragAndDrop.idl` + `nsZenDragAndDrop.cpp` | `zen-drag-drop.mjs` | HTML5 DnD + `-webkit-app-region` + `chrome.windows` |
| `window-drag/nsIZenWindowDragUtils.idl` + `nsZenWindowDragUtils.cpp` | `zen-window-drag.mjs` | `getComputedStyle` + `elementFromPoint` |
| `boosts/nsZenBoostsBackend.cpp` | `zen-boosts-backend.mjs` | `chrome.storage` + adopted stylesheets |
| `toolkit/ZenShareInternal.cpp` | `zen-share.mjs` | `navigator.share` + `chrome.contextMenus` |

JS callers already branch: `ZenCompactMode.mjs` uses `IntersectionObserver`,
`ZenMods.mjs` uses `chrome.scripting`, `ZenDragAndDrop.js` uses the shell
drag shim, window-drag actors use DOM hit-test. See each shim header.
