# PLAN — Zen Firefox → Chromium: 100% Complete (3 Lanes, Main Task)

**Branch:** `chromium-migration` from `dev@8df45e5` (FF 155.0.1) — `G:\Dx\zen`
**Main task = 100%:** every Gecko call site swapped + shell boots + flag flips. Hours of file work, no tests, no merges.
**Status now (~10%):** 1820 API hits + 2056 protocol/CSS hits in `src/zen` (~250 files); 258 patches + XPCOM C++ untouched; `engine-chromium/` empty.
**Scope:** 176 app files / ~50k lines + 258 patches / 13k lines + 15 IDL/CPP + shell. 808 tests ignored.

## Why 3 Lanes Finish 100%

Scaffold isolated pure logic (`shared/`, 0 deps) + facaded Gecko (`adapters/`). Remaining work is countable per file (TODO.md lists every file + hit count). 3 agents edit disjoint dirs directly on `chromium-migration` — Lane 1 owns seam + shell + flag, Lane 2 owns UI call sites + CSS, Lane 3 owns services + IDL/CPP + patches. Done is measurable: grep counts hit zero, shell boots, flag = `"chromium"`. Prior lane commits only added imports/comments — 100% requires every call site working.

## Architecture — 100% Files

```
chromium-migration (G:\Dx\zen)
├── surfer.json:migration.engine: "gecko" → "chromium" (Lane 1 flips at zero + boot)
├── src/zen/shared/      ← Lane 1 pure, both engines
├── src/zen/adapters/    ← Lane 1 single writer; every export dual-working (Gecko + chrome.*)
├── src/zen/{common,tabs,spaces,split-view,compact-mode,folders,glance,kbs,welcome,media} ← Lane 2: 0 API hits, 0 -moz-/chrome://
├── src/zen/{boosts,live-folders,sync,urlbar,sessionstore,space-routing,mods,toolkit,drag-and-drop,window-drag,share,downloads} ← Lane 3: 0 API hits
├── src/browser/**/*.patch (258) + toolkit/dom/layout → BUILD.gn + Views (Lane 3 rewrites)
├── *.idl/*.cpp/*.h/components.conf → Mojo/chrome.scripting shim or delete (Lanes 1+3)
├── prefs/*.yaml + configs/ → PrefService/policy (Lane 3)
└── engine/ (Gecko green) + engine-chromium/ (CEF shell, Lane 1: tab 1 Chromium, tab 2 Gecko)
```

## Lanes — 100% (Hours of file work)

**Lane 1 — Foundation + Cutover:** `surfer.json`, `shared/`, `adapters/`, `zen.globals.mjs`, `engine-chromium/`, `moz.build`. Make every adapter export dual-working, scaffold CEF shell + dual-boot, flip flag at zero + boot, strip `Services/gBrowser` from globals.

**Lane 2 — UI 100%:** `common/`(112)/`tabs/`(42)/`spaces/`(142)/`split-view/`(69)/`compact-mode/`+cpp/`folders/`(60)/`glance/`/`kbs`/`welcome`/`media` + owned CSS (`-moz-`→standard) + XHTML→HTML. Per-file TODO.md checklist, check at 0 hits.

**Lane 3 — Services + Patches 100%:** `boosts/`/`live-folders`/`sync/`(39)/`urlbar/`(~100)/`sessionstore/`(59)/`space-routing/`(48)/`mods/`/`toolkit`/`drag-and-drop/`(38)/`window-drag/` + IDL/CPP→Mojo + 258 patches→GN + prefs/configs→PrefService.

Each commits `chore(migration): lane{N}: <file> <before>→0` directly. No PRs/merges.

## Risks (100%)

- **Fake-done (imports without swaps):** 100% = working calls, grep = 0. Comments don't count.
- **Collision:** one dir = one lane.
- **Patch/GN + shell:** Lane 3 GN + Lane 1 shell are the long poles — start them now, not after swaps.
- **No tests:** verification is grep counts + shell boot, per order.

## Verification = 100%

`grep Services\.|gBrowser\.|SessionStore\.|PlacesUtils\.|MozXULElement|createXULElement|ChromeUtils\.|XPCOMUtils\. src/zen --exclude-dir=adapters` = 0; `grep chrome://|resource://|-moz-|@namespace|%include` in migrated files = 0; `engine-chromium/` boots; flag = `"chromium"`.

## Exit

All TODO.md boxes checked + shell boots + flag flips. That is 100% — browser runs on Chromium.
