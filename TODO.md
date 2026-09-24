# TODO — Chromium Migration (chromium-migration branch)

**Branch:** `chromium-migration` from `dev@8df45e5` (FF 155.0.1), workdir `G:\Zen`
**Verified 2026-09-24 (HEAD `01eb20c`):** app-layer grep is 0 BUT the audit holds — the tree does not run. Read the repair list (R1–R4) before any build attempt.
**Scope rule (AGENTS.md):** 808 test files ignored. All counts below are app-only unless stated.
**Authoritative detail docs:** `docs/chromium-migration-audit.md` (measured verdict), `docs/chromium-lane-plan.md` (disk gate + porting map), `docs/disk-reclaim-plan.md` (reclaim candidates), `docs/chromium-migration.md` (layer plan).

## Verified counts (2026-09-24, do not regress)

- App `src/zen` excl `adapters/tests/@types/mochitests`: **0** `Services.|gBrowser.|SessionStore.|PlacesUtils.|MozXULElement|createXULElement|ChromeUtils.|XPCOMUtils.` hits — gate green
- App `src/zen` excl `adapters/tests/@types/mochitests`: **0** `chrome://|resource://|-moz-|@namespace|%include` hits — gate green
- Incl tests/types: **504** files with Gecko-API hits, **224** files with chrome-url/CSS hits — all under `src/zen/tests/`, `src/zen/mochitests/`, `src/zen/@types/` → **out of scope**, do not count as incomplete
- `src/zen/adapters/`: **10** files (`engine,gre,lit,prefs,tabs,session,xul,observers,windows,storage`) with `chrome.*` branches — see R3 on what "working" actually means (no `chrome.*` provider exists in tree)
- `surfer.json:migration.engine` = `"chromium"` — flipped, but decorative (see R3)
- `engine-chromium/`: **31 files / ~106 KB** scaffold — **NOT booted** (README states "Not fetched yet — placeholder")
- `src/browser`: **115** `.patch` still present (+10 `src/external-patches` = **125** mapped in `patches-mapping.md`) — mapped, **NOT rewritten** to Views
- XPCOM/C++: ~20 files still in tree (`nsIZen*.idl`, `nsZen*.cpp`, `ZenShareInternal.cpp`, `ZenMouseTracker.cpp`, …) + 6 `engine-chromium/mojo/` shims alongside — **NOT deleted / NOT behind flag**
- `src/zen/zen.globals.mjs`: exposes `zenAdapters/*` + `chrome` (good) BUT still lists `gBrowserInit/gBrowser*` allowlist entries — **NOT stripped**
- Disk gate: `G:` **55.60 GB free** (was 29 GB at lane-plan time; nothing was deleted — do not treat the gain as reclaimed headroom). Full Chromium checkout+build needs **78 GB min on one volume** (lane-plan: 28 source no-history + 40 `out/` + 10 toolchain) and **100 GB+ official** (Windows build instructions). **Short ~22 GB vs min, ~44 GB vs official** — full build does NOT fit on G:.

## Audit repairs — MUST fix before building (docs/chromium-migration-audit.md §3, re-verified at HEAD)

- [ ] R1 — **49 dead asset paths**: rewrites point at `src/zen/assets/…` and `src/zen/styles/…`, verified **both dirs do not exist** (`Test-Path False/False`). Examples: `spaces/ZenSpaceManager.mjs:2615` → `../assets/icons/private-window-small.svg` (real: `src/browser/themes/shared/zen-icons/nucleo/…`), `welcome/ZenWelcome.mjs:67,366,605` (video/favicons), `space-routing/zen-space-routing.inc.xhtml:23,33,38,44` (`../styles/…`, `../assets/icons/icons.css`), `downloads/zen-download-arc-animation.css`, `folders/ZenFolders.mjs`, `common/modules/ZenUpdates.mjs`, `urlbar/ZenUBGlobalActions.sys.mjs`. Fix: recreate `src/zen/assets/` OR re-point all 49 at `src/browser/themes/shared/zen-icons/` (audit option C).
- [ ] R2 — **broken `UrlbarShared` use**: `common/modules/ZenUIManager.mjs:9` has the import **commented out**, line 504 still calls `UrlbarShared.RESULT_SOURCE.ZEN_ACTIONS` live. Fix: restore the import or route through `adapters/`.
- [ ] R3 — **decorative flag**: `adapters/engine.mjs` does **not** read `surfer.json` (verified: no `surfer` reference in file; it sniffs live `Services`/`chrome` globals). `ZEN_MIGRATION_ENGINE` exists **only** in the `src/zen/moz.build` comment (verified: no other refs). `surfer.json` is mentioned in comments/docs across ~15 files but nothing wires `migration.engine` to behavior (lane-plan §5: "today, nothing reads" it). Fix: implement the flag read (build-time + runtime) or stop claiming cutover.
- [ ] R4 — **Gecko fallback is unbuilt**: `engine/obj-*` holds only `CLOBBER`+`config.log` (no `dist/bin`, no exe); `mach` from Git Bash reports mingw64 (must run from PowerShell/MSVC env); `~/.mozbuild` unbootstrapped. Do NOT `mach build` the current tree as-is — R1/R2 live in files the Gecko build consumes (audit §6).

## Phase 0 — Done

- [x] Branch + `shared/zenColorUtils` + `shared/zenSplitLayout` pure (0 Gecko deps)
- [x] `adapters/` bodies with `chrome.*` branches (see R3 caveat)
- [x] App call-site swaps Lanes 2–3 (grep app-only = 0, with R1/R2 breakage noted above — gate green ≠ app working)

## Lane 1 — Foundation + Cutover (remaining gaps explicit)

- [x] `adapters/prefs,tabs,session,xul,observers,windows,storage,engine,gre,lit` — `chrome.*` branches present (R3: no provider in tree yet)
- [x] `shared/` stays pure (0 Gecko hits)
- [ ] `zen.globals.mjs` — strip `Services/gBrowser/MozXULElement/SessionStore/PlacesUtils` from allowlist (still contains `gBrowserInit/gBrowser*`)
- [ ] `engine-chromium/` — real vendored `chromium/src` + `//zen` layer + `chrome.exe` booting one window (today: 31-file scaffold; `dual-boot.js` toggles `about:blank`; `BUILD.gn` valid since `f26a6a9` but uncompiled without a checkout). Correction to earlier notes: prebuilt CEF / WebView2 / Chrome-for-Testing give a **renderer only, no `chrome.*`** (lane-plan §2) — they can validate shell UI but NOT the adapter `chrome.tabs/sessions/omnibox` branches. Real `chrome.*` needs the source build.
- [x] `surfer.json:migration.engine` = `"chromium"` (R3: decorative until the flag is wired; do not flip-flop, finish the wiring instead)
- [x] App-only grep = 0 (tests/types excluded per scope; R1/R2 breakage is path-level, invisible to the grep)

## Lane 2 — UI Shell (app grep DONE, repairs left)

- [x] `common/` (112/17), `tabs/` (42/2), `spaces/` (142/7), `split-view/` (69/1), `folders/` (60), `glance/` (25+), `kbs/welcome/media` (~15) → 0 app hits
- [x] Owned CSS `-moz-/@namespace/%include` → standard CSS (app-only 0)
- [x] Owned XHTML/jar.mn → relative/template imports (app-only 0, with R1 asset-dir gap)
- [ ] R1 asset re-point (covers Lane 2 files: spaces, welcome, folders, common/ZenUpdates, downloads CSS, space-routing XHTML)
- [ ] R2 `ZenUIManager` import fix
- [ ] `compact-mode/ZenMouseTracker.cpp` + `nsIZenMouseTracker.idl` → keep compiling behind flag OR delete (`mojo/zen-mouse-tracker.mjs` shim exists alongside)

## Lane 3 — Services, Data, Patches (app grep DONE, native/patches left)

- [x] `boosts/`, `live-folders/`, `sync/` (39), `urlbar/` (~100), `sessionstore/` (59), `space-routing/` (48) `.mjs` → adapters/`chrome.*` branches, 0 app hits
- [x] Owned CSS/XHTML → 0 app hits
- [x] `prefs.json` + `policy/policy.json` mapped (PrefService/policy equivalents exist in `engine-chromium/`)
- [ ] `mods/nsIZenModsBackend.idl` + `ZenStyleSheetCache.cpp`, `drag-and-drop/nsIZenDragAndDrop.idl/.cpp`, `window-drag/nsIZen*.idl/.cpp`, `boosts/nsZenBoostsBackend.cpp`, `toolkit/ZenShareInternal.cpp` → Mojo/`chrome.scripting` shim OR delete behind flag (shims exist in `engine-chromium/mojo/`, originals still built)
- [ ] `src/browser/**/*.patch` (115) + `src/external-patches` (10) → rewrite to `BUILD.gn` + Views file-by-file (today: `patches-mapping.md` table only, patches still applied on Gecko path; lane-plan §4 porting map is the spec, measured in months not hours)
- [ ] `prefs/*.yaml` + `configs/` full cutover (mapped, Gecko files still present)

## Module Inventory (verified)

| Lane | Module | Files | App hits (verified) | State |
|------|--------|-------|--------------------|-------|
| 1 | `shared` + `adapters` | 10 | 0 in shared; adapters are seam w/ `chrome.*` branches | DONE w/ R3 caveat |
| 2 | `common/tabs/spaces/split-view/folders/glance/kbs/welcome/media` | ~60 | 0 | DONE w/ R1+R2 repairs open |
| 2 | owned CSS/XHTML | ~20 | 0 | DONE w/ R1 asset-dir gap |
| 2 | `compact-mode` C++/.idl | 3 | n/a native | GAP — shim exists, original kept |
| 3 | `boosts/live-folders/sync/urlbar/sessionstore/space-routing/mods/toolkit/drag/window-drag/share/downloads` `.mjs` | ~40 | 0 | DONE (grep) |
| 3 | IDL/CPP/H | ~20 | n/a native | GAP — shims exist, originals kept |
| 3 | patches | 125 (115+10) | 13k lines mapped | GAP — mapped, not rewritten |
| — | `tests/@types/mochitests` | 808 scope-excluded | 504/224 files w/ hits | OUT OF SCOPE |

## Build & CI path (corrected — lane-plan §2 is authoritative)

- **Local G: full build: BLOCKED.** Need 78 GB min / 100 GB+ official on one volume; have 55.60 GB. `preflight.sh` aborts by design. See `docs/disk-reclaim-plan.md` (59–64 GB realistic reclaimable, nothing deleted yet).
- **Prebuilt (fits today, shell-UI only):** Chrome-for-Testing snapshot (~500 MB) / prebuilt CEF (~1–2 GB) / WebView2 runtime — validates tab strip, workspaces, split-view, dual-boot UI. Does NOT validate adapter `chrome.*` branches (no `//chrome` layer → no `chrome.tabs/sessions/omnibox`).
- **Real `chrome.*` validation:** vendor `chromium/src` (`bootstrap.sh`: `fetch --no-history` → `gclient sync` → overlay → `gn gen` → `autoninja`), `//zen` compiles against real headers (`zen_tab_model.*` expected clean; `zen_layer.*`/`zen_vertical_tab_strip.*` are sketches to fix against the tree), `chrome.exe` boots. Months-scale port per lane-plan §4.
- **CircleCI:** no `.circleci/` in repo (CI today = `.github/workflows/`). Cloud Windows executors carry 200 GB disk (`medium` 4vCPU/16GB → `2xlarge` 32vCPU/128GB) so space fits, but a full Chromium build is 2–8 h + VS/SDK/depot_tools setup per run — heavy credit burn, likely job-timeout territory. Recommended split: CircleCI builds shell-only (`gn check`, lint, mapping/prefs validation, minutes); full `chrome.exe` build on a self-hosted runner (200 GB+ SSD, NTFS, AV-excluded) or cloud VM with remote execution (Siso/REAPI).

## Done = 100% (ordered)

1. R1–R4 repairs (days): asset paths live again, `UrlbarShared` fixed, flag wired, Gecko fallback builds from PowerShell — or formally adopt audit option A (revert path rewrites) / C (repair in place).
2. G1 — shell boots from a real checkout (`chrome.exe`, tab 1 Chromium / tab 2 Gecko) — gated on disk/CI decision above.
3. G2 — native cutover: IDL/CPP behind `engine` flag or deleted, `gn` build green without Gecko.
4. G3 — patches rewritten to Views/`BUILD.gn` targets (not just mapping table).
5. G4 — `zen.globals.mjs` Gecko allowlist stripped.
6. Re-verify: app-only greps stay 0 + R1/R2 path checks pass + shell boots + flag `chromium` actually wired → then 100%.

Commits stay direct to `chromium-migration` as `chore(migration): lane{N}: <file> <before>→0`. No merges, no heavy commands on low disk.
