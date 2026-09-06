# TODO — Chromium Migration (3 Lanes, Work-First)

**Branch:** `chromium-migration` from `dev@8df45e5` (FF 155.0.1) — scaffold `adc0515`
**Scope:** `src/zen` app 176 files / ~50k lines + 258 patches / 13k lines (808 test files excluded — not in scope)
**Rule:** Tests deprioritized. Do the actual Firefox→Chromium work in 3 parallel lanes; one directory = one lane.

## Phase 0 — Done (adc0515)

- [x] Branch `chromium-migration` from `dev@8df45e5`
- [x] `src/zen/shared/zenColorUtils.mjs` (101L) + `src/zen/shared/zenSplitLayout.mjs` (106L) — pure, 0 Gecko deps
- [x] `src/zen/adapters/{prefs,tabs,session,xul}.mjs` — Gecko impl + commented `chrome.*` stubs
- [x] `surfer.json:migration {engine:"gecko", chromiumBranch:"chromium-migration", strategy:"strangler-fig"}`
- [x] `docs/chromium-migration.md` technical deep dive

## Lane 1 — Foundation & Build Seam (Agent 1) — Owns `shared/`/`adapters/`/flag

- [ ] Add `src/zen/adapters/observers.mjs` — `Services.obs` → `chrome.events` shim (Gecko body + stub)
- [ ] Add `src/zen/adapters/windows.mjs` — `BrowserWindowTracker`/`SessionStore` windows → `chrome.windows` shim
- [ ] Add `src/zen/adapters/storage.mjs` — `IOUtils`/`PathUtils`/`JSONFile`/`OS.File` → `chrome.storage` shim
- [ ] Document `surfer.json:migration.engine = "gecko"|"chromium"|"dual"` (`"gecko"` now); reserve `engine-chromium/` (CEF placeholder, not fetched yet)
- [ ] Keep `docs/chromium-migration.md` current; gate `src/zen/moz.build` has no new `DIRS` yet (deferred)

## Lane 2 — UI Shell & Low-Coupling (Agent 2) — Owns `common/`/`tabs/`/`spaces/`/`compact-mode/`/`split-view/`/`welcome/`/`media/`/`kbs/`/`folders/`/`glance/`

Work-first, no test rewrites — swap Gecko calls to Lane 1 `shared/`+`adapters/`:

- [ ] `kbs/ZenKeyboardShortcuts.mjs` → `adapters/prefs` + `adapters/xul`
- [ ] `welcome/ZenWelcome.mjs` + `media/ZenMediaController.mjs` → `adapters/prefs`/`xul`
- [ ] `tabs/ZenPinnedTabManager.mjs` → `adapters/tabs`/`session`, `shared/` where applicable
- [ ] `spaces/ZenSpaceManager.mjs` + `ZenGradientGenerator.mjs` → `shared/zenColorUtils` + `adapters/tabs`/`prefs`/`session`; drop `MozXULElement.parseXULToFragment` → `adapters/xul`
- [ ] `split-view/ZenViewSplitter.mjs` → `shared/zenSplitLayout` tree (`nsSplitNode`/`applyGridLayoutToPositions`)
- [ ] `compact-mode/` (`ZenCompactMode.mjs` + `ZenMouseTracker.cpp` later → `IntersectionObserver` shim) + `folders/` + `glance/` similarly

**Lane 2 does NOT touch:** `boosts/`, `live-folders/`, `sync/`, `urlbar/`, `sessionstore/`, `space-routing/`, `mods/`, `toolkit/`, `drag-and-drop/`, `window-drag/`.

## Lane 3 — Services, Data & Engine Patches (Agent 3) — Owns `boosts/`/`live-folders/`/`sync/`/`urlbar/`/`sessionstore/`/`space-routing/`/`mods/`/`toolkit/`/`drag-and-drop/`/`window-drag/`/`share/`/`src/browser/`+`external-patches`

Work-first — migrate services/data + catalog patch surface:

- [ ] `boosts/` + `live-folders/` → `adapters/storage`/`session`/`prefs`; keep polling logic
- [ ] `sync/` (Weave) → `chrome.storage.sync` + `chrome.identity` shims via `adapters/session`/`storage`
- [ ] `urlbar/` (`ZenUB*Provider.sys.mjs`) → Chromium `omnibox` shim via `adapters/`
- [ ] `sessionstore/` (`ZenSessionManager.sys.mjs`) → `chrome.sessions` shim
- [ ] `mods/` native `nsZenModsBackend`/`ZenStyleSheetCache.cpp` → `chrome.scripting.insertCSS` shim
- [ ] `drag-and-drop`/`window-drag` XPCOM (`nsIZenDragAndDrop`, `nsZenWindowDragUtils`) → Mojo stubs
- [ ] Catalog `src/browser/**/*.patch` + `src/toolkit/**/*.patch` + `src/dom/**` + `src/layout/**` for `BUILD.gn`/Views rewrite — log only this phase, actual GN rewrite Phase 4
- [ ] Housekeep `AGENTS.md`/`TODO.md`/`PLAN.md`/`CHANGELOG.md` so Lanes 1–2 never collide on docs

**Lane 3 does NOT touch:** `shared/`/`adapters/` internals, nor Lane 2 UI modules.

## Module Inventory (Lane-Assigned)

| Lane | Module | Files | Lines | Effort |
|------|--------|-------|-------|--------|
| 1 | `shared` + `adapters` | 6 + stubs | ~800 | S |
| 2 | `common` | 43 | 6,986 | M |
| 2 | `tabs` | 8 | 2,527 | M |
| 2 | `spaces` | 13 | 7,250 | L |
| 2 | `compact-mode` | 15 | 1,910 | M |
| 2 | `split-view` | 5 | 2,810 | M |
| 2 | `welcome` | 4 | 120k* | S (mostly mp4) |
| 2 | `media` | 4 | 1,085 | S |
| 2 | `kbs` | 2 | 1,496 | S |
| 2 | `folders` | 4 | 2,435 | M |
| 2 | `glance` | 8 | 2,161 | M |
| 3 | `boosts` | 23 | 6,564 | M |
| 3 | `live-folders` | 8 | 1,740 | S |
| 3 | `sync` | 4 | 1,824 | L |
| 3 | `urlbar` | 6 | 1,874 | M |
| 3 | `sessionstore` | 4 | 2,639 | M |
| 3 | `space-routing` | 8 | 1,226 | S |
| 3 | `mods` | 11 | 1,069 | M |
| 3 | `toolkit` | 12 | 423 | S |
| 3 | `drag-and-drop` | 8 | 1,947 | M |
| 3 | `window-drag` | 7 | 496 | S |
| 3 | `share` | 2 | 150 | S |
| 3 | `src/browser` patches | 258 | 13,582 | L (catalog) |
| — | `tests` | 808 | — | out of scope |

## Final Mile (After Lanes Converge)

- [ ] Shell + CEF: `engine-chromium/` via CEF/WebView2 alongside `engine/`; shell owns tab strip, guests are `BrowserView` surfaces (dual: tab 1=CEF, tab 2=Gecko)
- [ ] Shared services multiplex: cookies/history/downloads/permissions/context menus
- [ ] Flip `surfer.json:migration.engine` default → `"chromium"`; keep Gecko as fallback `dual`
- [ ] Retire `engine/`, Surfer Gecko fetcher, `moz.build` shims — delete Gecko path

## Verification (Work-First)

- `npm run lint` passes per lane. No test gate until cutover; `src/zen/tests/` stays Gecko path.
- `git log --oneline` shows `chore(migration): lane{N}:` per lane; `git merge dev` weekly by Lane 1 first.
