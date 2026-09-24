# PLAN — Zen Firefox → Chromium (chromium-migration branch)

**Branch:** `chromium-migration` from `dev@8df45e5` (FF 155.0.1) — workdir `G:\Zen`
**Verified 2026-09-24 (HEAD `01eb20c`):** app-layer grep is 0 BUT the audit holds — the tree does not run. First milestone is repairs (R1–R4), then shell boot, gated on disk.
**Scope:** ~110 app files swapped + 10 adapters + 125 patches mapped + ~20 IDL/CPP + shell scaffold (31 files / ~106 KB). 808 test files ignored by design.
**Detail docs:** TODO.md (task list) · `docs/chromium-migration-audit.md` (measured verdict) · `docs/chromium-lane-plan.md` (disk gate + porting map) · `docs/disk-reclaim-plan.md` (reclaim candidates).

## Where we are (verified, not estimated)

```
chromium-migration (G:\Zen, HEAD 01eb20c)
├── surfer.json:migration.engine: "chromium"   (flipped; DECORATIVE — nothing wires it to behavior, see R3)
├── src/zen/shared/      DONE pure, both engines (zenColorUtils, zenSplitLayout)
├── src/zen/adapters/    10 files w/ chrome.* branches (R3: no chrome.* provider exists in tree)
├── src/zen/{common,tabs,spaces,split-view,compact-mode,folders,glance,kbs,welcome,media}  grep 0 (R1 asset-dir + R2 UrlbarShared repairs open)
├── src/zen/{boosts,live-folders,sync,urlbar,sessionstore,space-routing,mods,toolkit,drag-and-drop,window-drag,share,downloads}  grep 0
├── src/browser/**/*.patch (115) + src/external-patches (10) → GAP: mapped only, not rewritten
├── *.idl/*.cpp/*.h → GAP: originals still in tree; 6 mojo/ shims alongside
├── prefs/*.yaml + configs/ → PARTIAL: engine-chromium/prefs.json + policy/policy.json mapped, Gecko files kept
├── src/zen/zen.globals.mjs → PARTIAL: zenAdapters/* + chrome exposed, gBrowser* allowlist not stripped
├── engine/ (Gecko, 3.4 GB) → UNBUILT (obj-* holds only CLOBBER+config.log; mingw64 shell issue; unbootstrapped)
└── engine-chromium/ → SCAFFOLD 31 files/~106 KB (shell/, mojo/, zen/, BUILD.gn valid-but-uncompiled, args.gn, bootstrap.sh, preflight.sh, prefs/policy, patches-mapping.md)
```

Verification gates (all three must pass — grep alone is not enough since R1/R2):

```
rg -l "Services\.|gBrowser\.|SessionStore\.|PlacesUtils\.|MozXULElement|createXULElement|ChromeUtils\.|XPCOMUtils\." src/zen -g '!**/adapters/**' -g '!**/tests/**' -g '!**/@types/**' -g '!**/mochitests/**'  # 0 (app-only)
rg -l "chrome://|resource://|-moz-|@namespace|%include" src/zen -g '!**/adapters/**' -g '!**/tests/**' -g '!**/@types/**' -g '!**/mochitests/**'  # 0 (app-only)
Test-Path src/zen/assets, src/zen/styles  # must both exist (today: False/False — R1)
rg -n "UrlbarShared" src/zen/common/modules/ZenUIManager.mjs  # import live, not commented (today: broken — R2)
```

Full-tree counts (informational, includes scope-excluded tests/types): 504 files / 3574 hits Gecko-API, 224 files chrome-url/CSS — all under `tests/@types/mochitests`, ignored.

## Why 3 Lanes got us to grep-zero (and what the audit found)

Scaffold isolated pure logic (`shared/`, 0 deps) + facaded Gecko (`adapters/`). 3 lanes edited disjoint dirs — Lane 1 seam + shell + flag, Lane 2 UI + CSS, Lane 3 services + IDL/CPP + patches. Lane commits `e2fe3f6/bf329bb/f7a3a48/fcc98d2/7c5fef9/06b644c/a9ef257` + build fix `f26a6a9` landed the zero.

The audit (`docs/chromium-migration-audit.md`, measured 2026-09-15 @ `f7a3a48`, re-verified at HEAD) found the zero was reached partly by breakage, not porting: 49 rewritten asset paths point at dirs that were never created (R1), one commented-out import with a live use (R2), a flag nothing consumes (R3). Net diffs were tiny (Lane 2: 42 files / +3 lines). This plan treats the audit as authoritative: repairs first, then boot. Options remain audit §5 A (restore Gecko runnable) → B (real Chromium lane) or C (repair in place); do not build the current tree as-is.

## Disk gate — DO NOT fetch Chromium on G: yet (measured 2026-09-24)

| Item | Size / need |
|------|-------------|
| `G:` free | **55.60 GB** (was 29 GB at lane-plan time; nothing deleted — gain is not reclaimed headroom) |
| This repo (`G:\Zen`) | ~4.35 GB total (`engine/` 3.4 GB Gecko, `.surfer/` 774 MB, `node_modules/` 113 MB, `src/` 28 MB, `engine-chromium/` ~0.1 MB) |
| Lane-plan minimum (one volume) | **78 GB** (28 source `--no-history` + 40 `out/` + 10 toolchain) → **short ~22 GB** |
| Chromium official (Windows, NTFS) | **≥100 GB free** ([windows_build_instructions](https://chromium.googlesource.com/chromium/src/+/main/docs/windows_build_instructions.md)); checkout 35–40 GB + output → 100 GB+ total → **short ~44 GB** |

Rules (from `01eb20c` read-only scan + `preflight.sh`): no `fetch chromium`, no `gclient sync`, no `gn gen`/`autoninja`, no CEF source download on G: until the gate is cleared. `engine-chromium/README.md` ("Not fetched yet — placeholder") and `BUILD.gn` ("only meaningful once the checkout exists") agree.

Corrected build-path note (lane-plan §2 is authoritative — overrides any earlier "prebuilt is enough" advice): **CEF / WebView2 / Chrome-for-Testing give a Chromium renderer only — no `//chrome` layer, no `chrome.tabs/sessions/omnibox`.** They fit on today's disk (snapshot ~500 MB, CEF ~1–2 GB, WebView2 preinstalled) and can validate shell UI (tab strip, workspaces, split-view, dual-boot UI), but they can NEVER satisfy the adapter `chrome.*` branches. Real `chrome.*` = vendor `chromium/src` + `//zen` layer + built `chrome.exe` (months-scale port per lane-plan §4).

Options to unblock (pick one):

1. **Shell-UI test now (fits):** prebuilt snapshot/CEF/WebView2 + `shell/tabs.html` + `adapters/` Gecko branch — UI only, no `chrome.*` validation.
2. **Free space on G:** `docs/disk-reclaim-plan.md` lists 59–64 GB realistic reclaimable (`node_modules` 47.8, Rust `target/` 13.9, build caches 3.8, venvs 3.5, pkg caches 1.7 — minus ~6.6 GB junction overcount). Nothing deleted yet; owner confirms batch by batch. `engine/` (3.4 GB) alone is NOT enough — keep it (dual-boot tab 2 + only runnable-tree candidate after R1/R2).
3. **Build elsewhere:** second/external SSD ≥200 GB, NTFS, AV/indexing-excluded → `bootstrap.sh` there, `//zen` overlay.
4. **Cloud builder:** 32-core + 200 GB pd-ssd spot VM; fetch + build remotely (Siso/REAPI remote exec recommended), copy back only the binary.

## CI path — CircleCI (no `.circleci/` in repo; CI today = `.github/workflows/`)

Cloud Windows executors carry **200 GB** disk (`medium` 4vCPU/16GB → `large` 8/32 → `xlarge` 16/64 → `2xlarge` 32/128), so space fits there. But a full Chromium build is **2–8 h** + VS/SDK/depot_tools setup per run — heavy credit burn, likely timeout territory. Recommended split:

- **CircleCI (cloud):** shell-only jobs — `gn check`, lint, `patches-mapping.md`/`prefs.json` validation, asset-path existence check (R1 regression test), minutes not hours.
- **Full `chrome.exe`:** self-hosted runner (200 GB+ SSD) or cloud VM with Siso/REAPI; CircleCI triggers, heavy work runs there.

## Lanes — what is left (repairs first, then native/boot)

**Repairs R1–R4 (days, before anything else):** asset paths live (recreate `src/zen/assets/` or re-point 49 refs) → `UrlbarShared` import live → flag wired (build-time + runtime) → Gecko fallback builds from PowerShell/MSVC env. Or formally adopt audit A/C.

**Lane 1 — boot + cutover:** disk/CI decision → vendor checkout → `gn gen` + build `//zen` (`zen_tab_model.*` expected clean; `zen_layer.*`/`zen_vertical_tab_strip.*` sketches fixed against real headers) → one window tab 1 Chromium / tab 2 Gecko → strip `gBrowser*` from `zen.globals.mjs` → keep greps at 0.

**Lane 2 — native shim:** `compact-mode/ZenMouseTracker.cpp` + `nsIZenMouseTracker.idl` behind `engine` flag (or delete); `IntersectionObserver` + `chrome.windows` path already shimmed in `mojo/zen-mouse-tracker.mjs`.

**Lane 3 — native + patches:** IDL/CPP (`nsIZenModsBackend`, `nsZenDragAndDrop`, `nsZenWindowDragUtils`, `nsZenBoostsBackend`, `ZenShareInternal`, …) behind flag or deleted with `mojo/` + `chrome.scripting` as the live path; 125 patches rewritten to `BUILD.gn` + Views targets file-by-file (lane-plan §4 map); `prefs/*.yaml` + `configs/` fully cut to PrefService/policy.

Each commits `chore(migration): lane{N}: <file> <before>→0` directly. No PRs/merges.

## Risks

- **Green-grep/broken-tree (audit §3):** open — R1/R2 repair list + path-existence check added to gates above. Never rely on grep alone again.
- **Renderer ≠ browser (lane-plan §2):** open — prebuilt milestones must be labeled UI-only; `chrome.*` claims require a source-built `chrome.exe`.
- **Premature flag:** `engine="chromium"` flipped before wiring/boot — keep it, finish R3 + shell; do not flip-flop.
- **Patch/GN + shell are the long poles:** months-scale, blocked on disk/CI, not on call sites.
- **Collision:** one dir = one lane still applies for repair + native work.
- **No tests:** verification is the three gates above + `gn` build + shell boot, per order.

## Exit

TODO.md R1–R4 + G1–G4 closed: repairs landed + shell boots from real checkout + native behind flag/deleted + patches rewritten + globals stripped + all gates green. That is 100% — browser runs on Chromium.
