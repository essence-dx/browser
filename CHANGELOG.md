# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) — tracking upstream Zen `1.22b`/`1.23t` (Firefox 155.0.1 at `dev@8df45e5`) until cutover.

## [Unreleased] — docs refresh + audit incorporation (2026-09-24, HEAD `01eb20c`)

### Corrected

- Status docs now incorporate `docs/chromium-migration-audit.md` (measured 2026-09-15 @ `f7a3a48`, re-verified at HEAD): app-only grep is 0 BUT 49 rewritten asset paths are dead (`src/zen/assets/` + `src/zen/styles/` verified missing), `ZenUIManager.mjs:9` import commented out with live `UrlbarShared` use at `:504`, `surfer.json migration.engine` decorative (`engine.mjs` sniffs globals; `ZEN_MIGRATION_ENGINE` only in `moz.build` comment), Gecko fallback unbuilt. Repair list R1–R4 added to TODO.md; three-gate verification (grep + path-existence + import-live) added to TODO.md/PLAN.md.
- Build-path correction (lane-plan §2 authoritative): prebuilt CEF / WebView2 / Chrome-for-Testing give a renderer only — no `//chrome` layer, no `chrome.tabs/sessions/omnibox`. Shell-UI testing fits today's disk; adapter `chrome.*` validation requires vendored `chromium/src` + built `chrome.exe`. Earlier notes suggesting prebuilt suffices for adapters are superseded.
- Disk figures updated: `G:` **55.60 GB free** (was 29 GB at lane-plan time; nothing deleted). Short **~22 GB** vs 78 GB lane-plan minimum, **~44 GB** vs 100 GB+ official. `docs/disk-reclaim-plan.md` candidates (59–64 GB realistic) still pending owner approval.
- CI path documented: no `.circleci/` in repo (CI = `.github/workflows/`); cloud Windows executors carry 200 GB (fits) but full builds run 2–8 h — recommended split is shell-only jobs on CircleCI, full `chrome.exe` on self-hosted/cloud with Siso/REAPI.
- `docs/chromium-lane-plan.md` gate table, `docs/disk-reclaim-plan.md` status, `engine-chromium/README.md`, `engine-chromium/dual-boot.md`, and AGENTS.md status line updated to match. No source files touched by this refresh.

## [Unreleased] — verified status (2026-09-24, HEAD `01eb20c`, branch `chromium-migration`)

### Verified status (not a release — read before testing a build)

- App-layer Gecko→Chromium swap: grep-level **DONE** (see Corrected above for what grep misses). `src/zen` app-only (excl `adapters/tests/@types/mochitests`) = **0** `Services.|gBrowser.|SessionStore.|PlacesUtils.|MozXULElement|createXULElement|ChromeUtils.|XPCOMUtils.` hits and **0** `chrome://|resource://|-moz-|@namespace|%include` hits.
- `src/zen/adapters/`: **10** files (`engine,gre,lit,prefs,tabs,session,xul,observers,windows,storage`) with `chrome.*` branches behind `engine.mjs` (`getEngine/isChromium/isGecko`). No `chrome.*` provider exists in tree (see Corrected).
- `surfer.json:migration.engine` = `"chromium"` (decorative until R3 wiring lands).
- Remaining gaps (TODO.md R1–R4 + G1–G4): `engine-chromium/` **31 files / ~106 KB scaffold only**; `src/browser` **115** + external **10** patches only **mapped** (125 rows), not rewritten; ~20 IDL/CPP/H files still in tree with 6 `mojo/` shims alongside; `zen.globals.mjs` still lists `gBrowser*` entries.
- Tests/types (`src/zen/tests`, `mochitests`, `@types`): 504 files with Gecko hits, 224 with chrome-url/CSS hits — **out of scope** per AGENTS.md (808 files), unchanged by design.

## [chromium-migration] — lanes to app-zero (after 2026-09-06 scaffold)

### Added

- Lane 1 foundation cutover (`e2fe3f6`, `20ca29c`, `27d4590`): `adapters/{engine,gre,lit,observers,windows,storage,prefs,tabs,session,xul}.mjs`; `src/zen/moz.build` registers adapters+shared; `zen.globals.mjs` exposes `zenAdapters/*` + `chrome`; `engine-chromium/` scaffold (`shell/tabs.html,tabs.js,workspaces.js,splitview.js,dual-boot.js,background.js,shell.css`, `zen/zen_layer.{cc,h},zen_tab_model.{cc,h},zen_vertical_tab_strip.{cc,h}`, `BUILD.gn`, `args.gn`, `bootstrap.sh`, `preflight.sh`, `prefs.json`, `policy/policy.json`, `mojo/` 6 shims, `patches-mapping.md`, `dual-boot.md`); `surfer.json` flag to `"chromium"`.
- Lane 2 UI shell (`7c5fef9`, `e5b42e4`, `bf329bb`): `common/tabs/spaces/split-view/compact-mode/folders/glance/kbs/welcome/media` call sites swapped to `adapters/` + `shared/`; owned CSS to standard CSS + vars; XHTML/jar.mn to relative/template imports. Bulk commit `fcc98d2` (90 files) brought non-test API to 0.
- Lane 3 services/data (`06b644c`, `a9ef257`, `f75841b`, `f7a3a48`): `boosts/live-folders/sync/urlbar/sessionstore/space-routing/mods/toolkit/drag-and-drop/window-drag/share/downloads` swapped to `adapters/storage|session|prefs|observers` + `chrome.storage.sync/identity`, `chrome.omnibox`, `chrome.sessions`, `chrome.scripting` branches; relative assets; `prefs.json`/`policy.json` mapped.
- Build layer (`f26a6a9`): replaced mock GN/manifest with real `//zen` static library (`zen_layer.cc`, `zen_tab_model.cc`, `zen_vertical_tab_strip.cc` + headers; deps on `//base`, `//chrome/browser`, `//components/sessions`, `//content/public/browser`, `//ui/*`); valid only inside a Chromium checkout via `bootstrap.sh`. Partially addresses audit §1 (mock GN); engine/binaries still absent.
- Docs + audit (`docs/chromium-migration-audit.md` @ `f7a3a48`, lane plan `fccbed5`, disk scan `01eb20c`): measured verdict (tree does not run; §3 breakage), porting map, read-only disk scan (no writes on low disk).

### Notes

- Work-first: `src/zen/tests/` (808 files) stays on Gecko path, not in scope for this phase.
- `engine-chromium/` has never been fetched/built on this machine — no `gn gen`, no CEF binaries. Repairs + disk/CI decision come before any fetch (see TODO.md).

## [chromium-migration] - 2026-09-06

### Added

- Scaffold incremental Gecko → Chromium migration on branch `chromium-migration` from `dev@8df45e5`.
- `src/zen/shared/zenColorUtils.mjs` (101L) — framework-free color math (hsl/rgb, blend, luminance, contrast, hexToRgb, getAccentColorForUI) from `ZenGradientGenerator.mjs`, 0 Gecko deps.
- `src/zen/shared/zenSplitLayout.mjs` (106L) — framework-free split-view tree (`ZenSplitLeafNode`/`ZenSplitNode`, `calculateLayoutTree`, `applyGridLayoutToPositions`) from `ZenViewSplitter.mjs`.
- `src/zen/adapters/prefs.mjs`, `tabs.mjs`, `session.mjs`, `xul.mjs` — Gecko impl now + commented `chrome.*` stubs; consumers must import from here.
- `surfer.json:migration {engine:"gecko", chromiumBranch:"chromium-migration", strategy:"strangler-fig"}` — engine flag defaults `gecko` (`"chromium"`/`"dual"` next).
- `docs/chromium-migration.md` — technical deep dive for the strangler-fig plan.

### Notes

- Work-first: `src/zen/tests/` (808 files) stays on Gecko path, not in scope for this phase.
- No `engine-chromium/` (CEF) yet — Phase 3; no `BUILD.gn` rewrites yet.
