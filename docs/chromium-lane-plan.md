# Chromium lane — plan and current state

**Branch:** `chromium-migration`
**Status:** scaffolding is real and committed; **the build is gated on disk.**
**Last commit:** `f26a6a9`

---

## 1. The gate: disk

`bash engine-chromium/preflight.sh` is the authority. Measured on this machine:

| Gate | Requirement | Actual | Result |
|---|---|---|---|
| Disk (single volume) | ≥ 78 GB free | G: **29 GB** | **FAIL — 49 GB short** |
| depot_tools | present | not installed | **FAIL** (installable, ~1 GB) |
| MSVC `cl.exe` | x64 | `G:\VS2022BuildTools` | OK |
| Windows SDK | ≥ 10.0.22621 | 10.0.26100.0 | OK |
| Python 3 | present | 3.13.14 | OK |
| CPU / RAM | 8 cores / 16 GB | 12 cores / 23 GB | OK |

Free space by volume: G: 29 GB, F: 7 GB, E: 4 GB, D: 3 GB, C: 1 GB — **44 GB total**.

A checkout cannot span volumes, so what matters is the largest single drive: 29 GB.
Chromium needs ~28 GB for the source (`--no-history`), ~40 GB for `out/`, ~10 GB for
toolchain and SDK — **78 GB minimum on one volume**.

This is why `bootstrap.sh` calls `preflight.sh` first and aborts. A fetch that fills the
system drive does not just fail the build; it takes the machine down.

**To unblock:** free ~50 GB on one volume (G: is the obvious candidate), then
`bash engine-chromium/bootstrap.sh`. Nothing else is missing.

## 2. The architectural point that decides everything

Under Gecko, `src/zen/adapters/*.mjs` calls `chrome.tabs`, `chrome.sessions`,
`chrome.omnibox` and hopes something answers. **Those APIs are implemented in Chromium's
`//chrome` layer.** They are not provided by:

- **CEF** — an embedding framework: Blink rendering, no browser UI, no `chrome.*`.
- **WebView2** — a control: Blink rendering plus a `postMessage` bridge, no `chrome.*`.

Both give you a Chromium *renderer*. Neither gives you a browser. So "put real Chromium
instead of Gecko" can only mean one thing: **vendor `chromium/src`, add Zen as a layer,
build `chrome.exe`.** That is the path `bootstrap.sh` implements, and the only path on
which `chrome.tabs` resolves to something real.

## 3. What is in `engine-chromium/` now

**Real and runnable:**

| File | What it does |
|---|---|
| `preflight.sh` | gates the build; read-only; exits 1 when disk is short |
| `bootstrap.sh` | `fetch --no-history` → `gclient sync` → overlay → `gn gen` → `autoninja` |
| `args.gn` | smallest config that still yields a runnable `chrome.exe` |
| `BUILD.gn` | valid GN `static_library` for the `//zen` layer (replaces the mock) |
| `zen/zen_tab_model.{h,cc}` | engine-agnostic tab model — complete, no Chromium or Gecko types |

**Sketch — written but NOT compiled, because there is no checkout to compile against:**

| File | Status |
|---|---|
| `zen/zen_layer.{h,cc}` | entry point; `AttachToBrowserWindow` is a TODO block |
| `zen/zen_vertical_tab_strip.{h,cc}` | Views widget; API usage must be reconciled against the real headers |

Only `zen_tab_model.*` can be trusted as-is. The Views code is a statement of intent, not
verified work — building it without a tree to check against is how the previous mock
happened, and repeating that would be dishonest.

**Retired:** `manifest.json` (MV3 extension manifest — an extension is not a browser;
Chromium's identity comes from `chrome/app` + branding).

**Still mock, should be retired next:** `shell/*.html|js|css` (the fake browser shell),
`mojo/*.mjs` (shims for XPCOM that no longer exist), `dual-boot.md` (describes the fake
shell). `patches-mapping.md`, `prefs.json` and `policy/` are genuinely useful input.

## 4. Porting map: `src/zen` → Chromium

The 176 files in `src/zen` do not get "imported" — each area maps onto a Chromium
subsystem. This is the real migration work, and it is measured in months, not hours.

| `src/zen` area | Chromium target | Notes |
|---|---|---|
| `tabs/` (vertical tabs, CSS) | `//chrome/browser/ui/views/tabs` replacement + WebUI | Chromium's tab strip is horizontal; Zen's is a different widget, not a restyle |
| `spaces/` (workspaces) | new model + UI | Chromium has no workspaces; tab groups are the nearest concept |
| `split-view/` | `BrowserView` layout | no Chromium equivalent; new container |
| `compact-mode/` | `BrowserView` layout mode | replaces `ZenMouseTracker.cpp` |
| `folders/` | `//components/tab_groups` | closest existing subsystem |
| `sessionstore/` | `//components/sessions` (`SessionService`) | replaces `SessionStore.sys.mjs` |
| `sync/` | `//components/sync` (`SyncService`) | replaces Weave |
| `urlbar/` | `//components/omnibox` (`OmniboxController`) | replaces the provider model |
| `boosts/`, `mods/` | `//extensions` + content scripts | CSS/JS injection per-site |
| `live-folders/` | background fetch + bookmarks API | |
| `downloads/` | `//components/download` | |
| `kbs/` | `//chrome/browser/ui/views/accelerator_table` | |
| `welcome/` | WebUI page | |
| `prefs/` | `//chrome/browser/prefs` registration | `prefs.json` is a usable input |
| `*.css`, `*.inc.xhtml` | Views theming, or WebUI CSS | XUL does not survive; this is a rewrite |

`src/browser/**/*.patch` (258 files) have no meaning in a Chromium tree — they patch Gecko.
`patches-mapping.md` already maps them; each row becomes a `//zen` implementation or is
dropped.

## 5. How to proceed

1. Free ~50 GB on G:. **Do not delete `engine/` yet** — it is the Gecko fallback and the
   only tree that can currently run; it is also the only copy of the working browser.
2. `bash engine-chromium/bootstrap.sh` — hours, and it will report progress.
3. First build is expected to fail on `zen_layer.cc` / `zen_vertical_tab_strip.cc`: those
   are sketches. Fix them against the real headers, which is only possible once the
   checkout exists. `zen_tab_model.*` should compile clean.
4. Only after `chrome.exe` exists and boots is it meaningful to revisit
   `surfer.json:migration.engine` — which, today, **nothing reads**.
