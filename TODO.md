# TODO — Chromium Migration: Main Task (3 Lanes, Hours)

**Branch:** `chromium-migration` from `dev@8df45e5` (FF 155.0.1) — scaffold `adc0515` + `b197970`
**Main task:** Migrate real files from Firefox Gecko → Chromium. **No tests, no wasted merges — hours, not weeks.** 3 agents work in parallel on `chromium-migration`, direct commits in owned dirs.
**Scope:** `src/zen` app 176 files / ~50k lines + 258 patches / 13k lines (808 test files ignored).

## Phase 0 — Done

- [x] Branch `chromium-migration` from `dev@8df45e5`
- [x] `src/zen/shared/zenColorUtils.mjs` + `shared/zenSplitLayout.mjs` — pure, 0 Gecko deps
- [x] `src/zen/adapters/{prefs,tabs,session,xul}.mjs` — Gecko impl + commented `chrome.*` stubs
- [x] `surfer.json:migration {engine:"gecko"}` + `docs/chromium-migration.md`

## Lane 1 — Foundation (Agent 1) — Main task: `shared/`+`adapters/` only

You own: `surfer.json`, `src/zen/shared/**`, `src/zen/adapters/**`, `src/zen/zen.globals.mjs`, `docs/chromium-migration.md`

Main task files to migrate (hours):

- [ ] `src/zen/adapters/observers.mjs` — `Services.obs` → `chrome.events` shim (Gecko body + stub)
- [ ] `src/zen/adapters/windows.mjs` — `BrowserWindowTracker` → `chrome.windows` shim
- [ ] `src/zen/adapters/storage.mjs` — `IOUtils`/`PathUtils` → `chrome.storage` shim
- [ ] Keep `shared/` pure; flag `gecko` (no fetch yet). You are single writer — lanes 2–3 import from you.

## Lane 2 — UI Shell (Agent 2) — Main task: UI files

You own: `src/zen/common/**`, `src/zen/tabs/**`, `src/zen/spaces/**`, `src/zen/compact-mode/**`, `src/zen/split-view/**`, `src/zen/welcome/**`, `src/zen/media/**`, `src/zen/kbs/**`, `src/zen/folders/**`, `src/zen/glance/**`

Main task files to migrate (hours) — swap Gecko (`Services.prefs`/`MozXULElement`/`chrome://`/`gBrowser`) → `shared/`+`adapters/`:

- [ ] `src/zen/kbs/ZenKeyboardShortcuts.mjs`
- [ ] `src/zen/welcome/ZenWelcome.mjs` + `src/zen/media/ZenMediaController.mjs`
- [ ] `src/zen/tabs/ZenPinnedTabManager.mjs`
- [ ] `src/zen/spaces/ZenSpaceManager.mjs` + `ZenGradientGenerator.mjs` → `shared/zenColorUtils`
- [ ] `src/zen/split-view/ZenViewSplitter.mjs` → `shared/zenSplitLayout`
- [ ] `src/zen/compact-mode/` + `src/zen/folders/` + `src/zen/glance/` (drop XUL, keep layout/CSS)

Do NOT touch: `boosts/`, `live-folders/`, `sync/`, `urlbar/`, `sessionstore/`, `space-routing/`, `mods/`, `toolkit/`, `drag-and-drop/`, `window-drag/`.

## Lane 3 — Services & Patches (Agent 3) — Main task: data/services + patch catalog

You own: `src/zen/boosts/**`, `src/zen/live-folders/**`, `src/zen/sync/**`, `src/zen/urlbar/**`, `src/zen/sessionstore/**`, `src/zen/space-routing/**`, `src/zen/mods/**`, `src/zen/toolkit/**`, `src/zen/drag-and-drop/**`, `src/zen/window-drag/**`, `src/zen/share/**`, `src/browser/**`, `src/external-patches/**`, `prefs/**`

Main task files to migrate (hours):

- [ ] `src/zen/boosts/**` + `src/zen/live-folders/**` → `adapters/storage`/`session`/`prefs`
- [ ] `src/zen/sync/**` (Weave → `chrome.storage.sync`+`identity` shims)
- [ ] `src/zen/urlbar/**` (`UrlbarProvider` → `omnibox`)
- [ ] `src/zen/sessionstore/**` → `chrome.sessions`
- [ ] `src/zen/mods/**` native → `chrome.scripting`
- [ ] `src/zen/drag-and-drop/**` + `src/zen/window-drag/**` XPCOM → stubs
- [ ] Catalog `src/browser/**/*.patch` (258, 13,582 lines) for `BUILD.gn`/Views rewrite — log only, no GN yes

Do NOT touch: `shared/`/`adapters/` internals, nor Lane 2 UI modules.

## Module Inventory (Main task, lane-assigned)

| Lane | Module | Files | Lines | Effort |
|------|--------|-------|-------|--------|
| 1 | `shared` + `adapters` | 6 +3 stubs | ~800 | S |
| 2 | `common` | 43 | 6,986 | M |
| 2 | `tabs` | 8 | 2,527 | M |
| 2 | `spaces` | 13 | 7,250 | L |
| 2 | `compact-mode` | 15 | 1,910 | M |
| 2 | `split-view` | 5 | 2,810 | M |
| 2 | `welcome` | 4 | 120k* | S |
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
| 3 | `src/browser` patches | 258 | 13,582 | L |
| — | `tests` | 808 | — | out of scope |

## Done (Hours)

Each lane commits `chore(migration): lane{N}: <files>` directly to `chromium-migration`. No merges needed. Done when owned files import via `shared/`+`adapters/` and `npm run lint` passes. Final mile `engine-chromium/` + cutover deferred — main task is file migration above.
