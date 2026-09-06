# TODO — Chromium Migration: 100% Complete (3 Lanes, Main Task)

**Branch:** `chromium-migration` from `dev@8df45e5` (FF 155.0.1)
**Main task = 100%:** every Gecko call site swapped + shell boots + flag flips. No tests, no merges.
**Status now (~10%):** 1820 Gecko API hits + 2056 protocol/CSS hits left in `src/zen` (~250 files); 258 patches untouched; XPCOM C++ untouched; `engine-chromium/` empty.
**Done = 100%:** `grep Services\.|gBrowser\.|SessionStore\.|PlacesUtils\.|MozXULElement|createXULElement|ChromeUtils\.|XPCOMUtils\. src/zen --exclude-dir=adapters` = 0 AND `grep chrome://|resource://|-moz-|@namespace|%include` in migrated files = 0 AND `engine-chromium/` boots. Check a file only when its count = 0.

## Phase 0 — Done (~10%)

- [x] Branch + `shared/zenColorUtils` + `shared/zenSplitLayout` pure
- [x] `adapters/{prefs,tabs,session,xul,observers,windows,storage}.mjs` scaffold (Gecko body + commented stub — NOT YET working Chromium bodies)
- [x] `surfer.json:migration.engine="gecko"` + docs

## Lane 1 — Foundation + Cutover (Agent 1) — 100% checklist

Owns: `surfer.json`, `src/zen/shared/**`, `src/zen/adapters/**`, `src/zen/zen.globals.mjs`, `docs/chromium-migration.md`, `engine-chromium/**`, `src/zen/moz.build`

- [ ] `adapters/prefs.mjs` — every export has WORKING `chrome.storage` body behind flag (not comment)
- [ ] `adapters/tabs.mjs` — every export has WORKING `chrome.tabs`/`tabGroups` body
- [ ] `adapters/session.mjs` — WORKING `chrome.sessions`/`storage.session` body
- [ ] `adapters/xul.mjs` — WORKING `createElement`/`template` body (no `MozXULElement`)
- [ ] `adapters/observers.mjs` — WORKING `chrome.events`/`EventTarget` body
- [ ] `adapters/windows.mjs` — WORKING `chrome.windows` body
- [ ] `adapters/storage.mjs` — WORKING `chrome.storage` body
- [ ] `shared/` stays pure (0 Gecko hits) — verify
- [ ] `zen.globals.mjs` — remove `Services/gBrowser/MozXULElement/SessionStore/PlacesUtils` from allowlist
- [ ] `engine-chromium/` — CEF/WebView2 fetch + `BrowserView` tab strip + dual-boot (tab 1 Chromium, tab 2 Gecko)
- [ ] `surfer.json:migration.engine` → `"chromium"` (only when counts = 0 + shell boots)
- [ ] Verify: `grep` API count outside `adapters/` = 0

## Lane 2 — UI Shell 100% (Agent 2) — per-file, check only at 0 hits

Owns: `common/` (112/17), `tabs/` (42/2), `spaces/` (142/7), `compact-mode/` + `.cpp`/`.idl`, `split-view/` (69/1), `welcome/`, `media/`, `kbs/`, `folders/` (ZenFolders 54), `glance/`, owned CSS/XHTML/jar.mn. Counts = `Services|gBrowser|SessionStore|PlacesUtils|MozXULElement|createXULElement|ChromeUtils|XPCOMUtils` hits now.

- [ ] `common/zenThemeModifier.js` (9) + `ZenPreloadedScripts.js` (6) + `zen-sets.js` (7) + `jar.inc.mn` (1)
- [ ] `common/sys/ZenUIMigration.sys.mjs` (11) + `ZenCustomizableUI.sys.mjs` (2) + `ZenActorsManager.sys.mjs` (1)
- [ ] `common/modules/ZenCommonUtils.mjs` (5) + `ZenMenubar.mjs` (2) + `ZenStartup.mjs` (8) + `ZenUpdates.mjs` (4) + `ZenSidebarNotification.mjs` (2) + `ZenUIManager.mjs` (40)
- [ ] `common/sys/ui/ZenUIComponent.sys.mjs` (2) + `ZenProgressBar.sys.mjs` (5) + `ZenSpaceRoutingNavigation.sys.mjs` (3)
- [ ] `common/emojis/ZenEmojiPicker.mjs` (4)
- [ ] `tabs/ZenPinnedTabManager.mjs` (38) + `ZenEssentialsPromo.mjs` (4)
- [ ] `spaces/ZenSpaceManager.mjs` (88) + `ZenGradientGenerator.mjs` (24) + `ZenSpace.mjs` (10) + `ZenSpaceBookmarksStorage.js` (8) + `ZenSpaceCreation.mjs` (4) + `ZenSpaceIcons.mjs` (6) + `ZenSpacesSwipe.mjs` (2)
- [ ] `split-view/ZenViewSplitter.mjs` (69) — reuse `shared/zenSplitLayout`
- [ ] `compact-mode/ZenCompactMode.mjs` (17) + `ZenMouseTracker.cpp` (1) + `nsIZenMouseTracker.idl` → `IntersectionObserver` shim
- [ ] `folders/ZenFolders.mjs` (54) + `ZenFolder.mjs` (6)
- [ ] `glance/ZenGlanceManager.mjs` (25) + actors (5)
- [ ] `kbs/ZenKeyboardShortcuts.mjs` (6+) + `welcome/ZenWelcome.mjs` (7+) + `media/ZenMediaController.mjs` (2+)
- [ ] Owned CSS: `vertical-tabs.css` (19 `-moz-`), `zen-workspaces.css` (14), `zen-theme.css` (22), `zen-gradient-generator.css` (9), `zen-tabs.css` (8), `zen-split-view.css` (4), `zen-folders.css` (6), `zen-compact-mode.css` (6) + rest → standard CSS, 0 `-moz-|@namespace|%include`
- [ ] Owned XHTML/jar.mn: every `*.inc.xhtml` + `jar.inc.mn` → HTML `template`/custom elements

## Lane 3 — Services, Data, Patches 100% (Agent 3) — per-file, check only at 0 hits

Owns: `boosts/`, `live-folders/`, `sync/`, `urlbar/`, `sessionstore/`, `space-routing/`, `mods/`, `toolkit/`, `drag-and-drop/`, `window-drag/`, `share/`, `downloads/`, `src/browser/**`, `src/external-patches/**`, `prefs/**`, `configs/**`, XPCOM IDL/CPP.

- [ ] `boosts/ZenBoostsManager.sys.mjs` + `ZenBoostsEditor.mjs` + `ZenBoostStyles.sys.mjs` + `ZenSelectorComponent.sys.mjs` + `ZenZap*.sys.mjs` + actors → `adapters/storage|session|prefs|observers` working calls (not comments)
- [ ] `live-folders/` (Manager 9, UI 9, providers 3+13) → adapters working calls
- [ ] `sync/ZenSpacesSync.sys.mjs` (2) + `ZenSpacesSyncApplier.sys.mjs` (27) + `ZenSpacesSyncModel.sys.mjs` (10) → `chrome.storage.sync`+`identity` working calls
- [ ] `urlbar/ZenSiteDataPanel.sys.mjs` (53) + `ZenUBGlobalActions.sys.mjs` (36) + `ZenUBActionsProvider.sys.mjs` (13) + `ZenUBProvider.sys.mjs` + `ZenUBResultsLearner.sys.mjs` → `chrome.omnibox` working calls
- [ ] `sessionstore/ZenSessionManager.sys.mjs` (17) + `ZenWindowSync.sys.mjs` (42) → `chrome.sessions` working calls
- [ ] `space-routing/ZenSpaceRoutingManager.sys.mjs` (9) + `ZenSpaceRoutingDialog.mjs` (39) → adapters working calls
- [ ] `mods/ZenMods.mjs` (12) + `nsIZenModsBackend.idl` + `ZenStyleSheetCache.cpp` → `chrome.scripting` working shim
- [ ] `drag-and-drop/ZenDragAndDrop.js` (38) + `nsIZenDragAndDrop.idl` + `nsZenDragAndDrop.cpp` → Mojo/drag shim or delete behind flag
- [ ] `window-drag/nsIZenWindowDragUtils.idl` + `nsZenWindowDragUtils.cpp` + actors (3+2) → Mojo shim or delete
- [ ] `boosts/nsZenBoostsBackend.cpp` + `toolkit/ZenShareInternal.cpp` + `compact-mode/ZenMouseTracker.cpp` (Lane 2 if needed) → shim or delete
- [ ] ALL 258 `src/browser/**/*.patch` + `toolkit/dom/layout` patches → `BUILD.gn` + Views file-by-file (rewrite, not log)
- [ ] `prefs/*.yaml` + `configs/` → Chromium `PrefService`/policy
- [ ] Owned CSS/XHTML (`zen-boosts.css` 16, `UBGlobalActions` CSS 33, etc.) → standard CSS, 0 `-moz-`

## Module Inventory (100% scope)

| Lane | Module | Files | API hits now | Done when |
|------|--------|-------|--------------|-----------|
| 1 | `shared` + `adapters` | 9 | 0 in shared; adapters are seam | every export dual-working |
| 2 | `common` | 17 | 112 | 0 |
| 2 | `tabs` | 2 | 42 | 0 |
| 2 | `spaces` | 7 | 142 | 0 |
| 2 | `split-view` | 1 | 69 | 0 |
| 2 | `compact-mode` | +cpp/idl | 17+ | 0 + shim compiles |
| 2 | `folders` | 2 | 60 | 0 |
| 2 | `glance` | +actors | 25+ | 0 |
| 2 | `kbs/welcome/media` | 4 | ~15 | 0 |
| 2 | owned CSS/XHTML | ~20 | ~100 `-moz-` | 0 |
| 3 | `boosts` | 8 | ~25 | 0 |
| 3 | `live-folders` | 5 | ~25 | 0 |
| 3 | `sync` | 3 | 39 | 0 |
| 3 | `urlbar` | 5 | ~100 | 0 |
| 3 | `sessionstore` | 2 | 59 | 0 |
| 3 | `space-routing` | 3 | 48 | 0 |
| 3 | `mods/toolkit/drag/window-drag` | ~20 | ~60 + IDL/CPP | 0 + shim |
| 3 | 258 patches | 258 | 13,582 lines | rewritten to GN |
| — | `tests` | 808 | — | out of scope |

## Done = 100% (Hours of file work + shell)

Each lane commits `chore(migration): lane{N}: <file> <before>→0` directly to `chromium-migration`. No merges. 100% when every box above checked + shell boots + flag = `"chromium"`.
