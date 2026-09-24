# Chromium Migration — Incremental Plan (chromium-migration branch)

**Branch:** `chromium-migration` (from `dev` @ `8df45e5`, FF 155.0.1), workdir `G:\Zen`
**Strategy:** Strangler-fig inside the same repo — keep `dev` green, land Chromium in layers.
**Verified 2026-09-24 (HEAD `01eb20c`):** app-layer grep is 0 BUT the audit holds — the tree does not run. Repairs R1–R4 (TODO.md) come before any fetch or build.
**Companion docs:** TODO.md (tasks) · PLAN.md (gates + CI) · `docs/chromium-migration-audit.md` (measured verdict — authoritative on what is broken) · `docs/chromium-lane-plan.md` (disk gate + porting map — authoritative on build path) · `docs/disk-reclaim-plan.md` (reclaim candidates).

## Principle (from your order)

> New branch, replace Gecko → Chromium gradually, never from-scratch.

That is correct. We ship behind a build flag, dual-build in CI, and cut over tab-by-tab.

## Layer model — what gets strangled in which order

1. **Isolate pure logic (DONE).** Framework-free modules extracted:
   - `src/zen/shared/zenColorUtils.mjs` — gradient math, 0 Gecko deps
   - `src/zen/shared/zenSplitLayout.mjs` — split-view tree, 0 Gecko deps
   - Theme tokens → CSS variables

2. **Adapter layer (PRESENT, unwired).** `src/zen/adapters/` (10 files) — `chrome.*` branches exist for every area below, with `engine.mjs` (`getEngine`/`isChromium`/`isGecko`) as the intended flag source; `gre` shims platform modules; `lit` shims vendor lit. Caveat (audit §3c–d, re-verified): `engine.mjs` sniffs live globals, it does not read `surfer.json`; `ZEN_MIGRATION_ENGINE` exists only in the `moz.build` comment; no runtime/build consumer wires `migration.engine` to behavior. The flag is decorative until R3 lands.
   - `prefs`: `Services.prefs` → `chrome.storage` / `PrefService`
   - `tabs`: `gBrowser` → `chrome.tabs` + `chrome.tabGroups`
   - `session`: `SessionStore` → `chrome.sessions`/`chrome.storage.session`
   - `xul`: `createXULElement`/`MozXULElement` → `createElement` + custom elements / `<template>`
   - `observers`: `Services.obs` → `chrome.events` / `EventTarget`
   - `windows`: Gecko tracker → `chrome.windows`
   - `storage`: `IOUtils`/`PathUtils` → `chrome.storage`

3. **Call-site swap (GREP 0, REPAIRS OPEN).** Lanes 2–3 swapped every `.mjs`/CSS/XHTML call site: app-only grep is 0. But the audit proved the zero is partly breakage: 49 asset paths point at `src/zen/assets/` + `src/zen/styles/` which do not exist (R1), and `ZenUIManager.mjs` has its `UrlbarShared` import commented out with a live use at line 504 (R2). Tests/types (`src/zen/tests`, `mochitests`, `@types`, 808 files) intentionally untouched and excluded from counts.

4. **Shell + Chromium (SCAFFOLD — repairs + disk-gated).** `engine-chromium/` (31 files / ~106 KB) has never been fetched/built: `shell/tabs.html` tab strip + `tabs.js`/`workspaces.js`/`splitview.js`/`dual-boot.js` (today toggles `about:blank` guests, no `BrowserView`/CEF boot), `shell/background.js`, `BUILD.gn` (real `//zen` static library since `f26a6a9`, valid only inside a Chromium checkout via `bootstrap.sh`), `patches-mapping.md` (125-row mapping table, not a rewrite), `prefs.json` + `policy/` mapped, `mojo/` 6 shims. Architectural rule (lane-plan §2, authoritative): **CEF / WebView2 / Chrome-for-Testing supply a renderer only — no `//chrome` layer, no `chrome.tabs/sessions/omnibox`.** Prebuilt validates shell UI; only a vendored `chromium/src` + built `chrome.exe` validates the adapters. First milestone: one window, tab 1 = Chromium, tab 2 = Gecko side-by-side.

5. **Shared services (PARTIAL).** Cookie/history router, downloads, permissions, context menus multiplexed behind adapters; profiles still isolated.

6. **Cut over & retire Gecko (PENDING).** Keep `engine/` (Gecko, 3.4 GB) as dual-boot tab 2; it is currently unbuilt (`obj-*` = CLOBBER+config.log, mingw64 shell pitfall, unbootstrapped — R4). Delete `engine/`, Surfer Gecko fetcher, `moz.build` shims only after repairs + shell boots + patches/IDL are cut.

## Branch rules

- `dev` stays Gecko-green, never broken.
- `chromium-migration` merges `dev` weekly — conflicts resolved in adapters first.
- CI matrix: `build:gecko` and `build:chromium` both must pass before merge to `dev`. No `.circleci/` in repo yet (CI = `.github/workflows/`); CircleCI cloud Windows (200 GB disk) fits space-wise — use it for shell-only jobs, not full builds (see PLAN.md).

## Anti-goals

- No big-bang rewrite commit.
- No forking a new repo — history stays here.
- No shipping dual-binary until adapters land (branches landed; wiring + provider still pending).
- No claiming `chrome.*` works off a renderer embed — provider must be a source-built `chrome.exe`.

## Lane 1 status (verified 2026-09-24)

- `src/zen/shared/zenColorUtils.mjs` + `zenSplitLayout.mjs` pure (done, 0 Gecko deps).
- `src/zen/adapters/{engine,gre,lit,prefs,tabs,session,xul,observers,windows,storage}.mjs` — `chrome.*` branches present; **gap R3:** flag not wired to `surfer.json`.
- `src/zen/moz.build` registers `EXTRA_JS_MODULES.zen.adapters` + `.zen.shared` (comment references a `ZEN_MIGRATION_ENGINE` mechanism that was never implemented — R3).
- `surfer.json:migration.engine` is `"chromium"` (decorative until R3 — do not flip-flop, wire it).
- `src/zen/zen.globals.mjs` exposes `zenAdapters/*`, `zenEngineAdapter`, `zenColorUtils`, `zenSplitLayout`, `chrome`; **gap:** Gecko `gBrowser*` allowlist entries still present (TODO.md G4).
- `engine-chromium/` is **scaffold, not booted** (README: "Not fetched yet — placeholder"). No `fetch chromium`, no `gn gen`, no binaries on this machine.
- No tests, no merges, no heavy commands — direct `chromium-migration` commits only. Lanes 2–3 import from `adapters/`.

## Disk gate (measured 2026-09-24 — read before fetching)

- `G:` free **55.60 GB**. This repo ~4.35 GB (`engine/` 3.4 GB, `.surfer/` 774 MB).
- Lane-plan minimum: **78 GB** on one volume → **short ~22 GB**. Official Chromium Windows: **≥100 GB** → **short ~44 GB**. Full build does NOT fit on G:.
- Allowed now: shell-UI test via prebuilt snapshot/CEF/WebView2 (renderer only — see §4 rule). Forbidden on this disk: `fetch chromium`, `gclient sync`, `gn gen`, CEF source download.
- To unblock: repairs R1–R4 first, then free space per `docs/disk-reclaim-plan.md` (59–64 GB realistic reclaimable, nothing deleted yet), or attach ≥200 GB NTFS SSD (AV/indexing-excluded), or cloud VM + Siso/REAPI.

## Next step (ordered)

1. Repairs R1–R4 (TODO.md): asset paths live, `UrlbarShared` fixed, flag wired, Gecko fallback building from PowerShell.
2. Shell boot (TODO.md G1): source checkout → `gn`/build `//zen` → one window dual-boot (prebuilt milestones labeled UI-only).
3. Native cutover (G2), patch rewrite (G3), globals strip (G4). `surfer.json migration.engine` stays `"chromium"`.
