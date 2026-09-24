# Chromium Migration — Audit (measured, not restated)

**Date:** 2026-09-15
**Branch:** `chromium-migration` @ `f7a3a48`
**Method:** every claim below was re-measured against the tree. Commands are included so they can be re-run.

## Verdict

The migration is **not** at 100%, and the project **cannot be run** in its current state.
Two independent blockers, plus a class of self-inflicted regressions that the "grep = 0" gate
cannot see.

---

## 1. There is no Chromium to set up

`engine-chromium/` is 23 files / **138 KB**. It contains no engine.

| Expected for a Chromium port | Present |
|---|---|
| CEF or WebView2 binaries / bindings | none |
| Chromium source checkout | none (`engine/` is Gecko 155 only) |
| C++ host app (`.cc`/`.cpp`) | **0 files** |
| Any compiled artefact (`.dll`/`.exe`) | **0 files** |
| Valid GN target | no — see below |

`engine-chromium/BUILD.gn` is not buildable GN:

- It lists `shell/tabs.html`, `shell/shell.css`, `prefs.json`, `policy/policy.json` as
  `source_set(...) { sources = [...] }`. GN sources must be compilable inputs; HTML/CSS/JSON are
  not. This target cannot be generated.
- It depends on `//zen/adapters:tabs`, `//zen/adapters:windows`, `//zen/adapters:session`.
  **`src/zen/adapters/BUILD.gn` does not exist**, so the dep is unresolvable.
- `shell_app` and `shell_actors` are declared but never referenced from the `zen` group — dead
  targets.

`engine-chromium/manifest.json` is a **browser-extension** manifest (MV3,
`chrome_url_overrides.newtab`, `action.default_popup`), not a browser. `shell/tabs.html` loads
`<webview>` elements — the Chrome *Apps* API, unavailable to extensions and removed from Chrome.
It also `<link>`s `../../src/zen/...css`, i.e. outside the extension root, which an extension
cannot load.

**Conclusion:** "engine-chromium/ boots one window (tab 1 = Chromium, tab 2 = Gecko fallback)" is
not a description of a working shell. It is a hand-written mock-up plus prose docs.

## 2. The real project cannot be run either

```
$ cd engine && python3 ./mach run --noprofile
Adding configure options from G:\Zen\engine\mozconfig
...
Host x86_64-pc-mingw64 is no longer supported, try
x86_64-pc-windows-gnu or x86_64-pc-windows-msvc instead
```

Three compounding problems:

1. **No build exists.** `engine/obj-x86_64-pc-windows-msvc/` contains only `CLOBBER` and
   `config.log`. There is no `dist/bin/`, no `zen.exe`, no `firefox.exe`. The tree was configured
   and then clobbered — it has never been built.
2. **The tree is unbootstrapped.** `~/.mozbuild/` holds only `glean` and `srcdirs`. There is no
   Mozilla-managed `clang`, no `sccache`. `rustc 1.98.1` and VS 2022/2026 are installed, but
   `mach bootstrap` has not completed.
3. **Wrong shell.** Running `mach` from Git Bash makes `config.guess` report
   `x86_64-pc-mingw64`, which Firefox 155 rejects. `mach` must be driven from a Windows-native
   shell (cmd/PowerShell) with the MSVC environment loaded.

Even after fixing (1)–(3), a full `mach build` of Firefox 155 is a multi-hour, multi-GB operation
— and it would be building a tree that the migration has already mutated (see §3).

## 3. The "grep = 0" gate is green because the references were broken, not ported

The gate passes. The app is broken. Measured:

```
$ grep -rEn "Services\.|gBrowser\.|SessionStore\.|PlacesUtils\.|MozXULElement|createXULElement|ChromeUtils\.|XPCOMUtils\." src/zen --exclude-dir=adapters --exclude-dir=tests | wc -l
8        # all 8 in src/zen/@types/*.d.ts (type declarations) → 0 in real source

$ grep -rEn "chrome://|resource://|-moz-|@namespace|%include" src/zen --exclude-dir=tests | wc -l
1235     # ALL in 2 files: @types/lib.gecko.modules.d.ts, @types/zen.d.ts
         # chrome:// 235, resource:// 1000, -moz- 0, @namespace 0, %include 0
```

So the *source* greps are genuinely clean. The damage is elsewhere.

### 3a. 49 rewritten paths point at files that do not exist

Resolving every relative specifier added by `e2fe3f6`, `bf329bb`, `f7a3a48`:

```
resolved OK: 53
MISSING:     49 across 16 files
```

Representative misses:

| File | Rewritten to | Reality |
|---|---|---|
| `src/zen/spaces/ZenSpaceManager.mjs` | `../assets/icons/private-window-small.svg` | real file: `src/browser/themes/shared/zen-icons/nucleo/private-window-small.svg` |
| `src/zen/urlbar/ZenUBGlobalActions.sys.mjs` | `../assets/icons/{link,forward,close}.svg` | real files: `.../zen-icons/nucleo/...` |
| `src/zen/common/modules/ZenUpdates.mjs` | `../assets/icons/{heart-circle-fill,sparkles,security-broken}.svg` | same |
| `src/zen/downloads/zen-download-arc-animation.css` | `../assets/images/downloads/download.svg` | same |
| `src/zen/welcome/ZenWelcome.mjs` | `../assets/videos/welcome-background.mp4` | same |
| `src/zen/folders/ZenFolders.mjs` | `../assets/icons/selectable/logo-{github,rss}.svg` | same |
| `src/zen/space-routing/zen-space-routing.inc.xhtml` | `../styles/zen-space-routing.css` | `src/zen/styles/` does not exist |

**`src/zen/assets/` and `src/zen/styles/` do not exist anywhere in the tree:**

```
$ find src -maxdepth 3 -type d -name assets
(no output)
```

The migration replaced working `chrome://browser/skin/zen-icons/...` URLs with a relative
directory that was never created. Every icon, download animation, welcome video and favicon
reference is now dead.

### 3b. One real broken JS import

`src/zen/common/modules/ZenUIManager.mjs` → `../urlbar/UrlbarShared.mjs` — no such file.
(211 relative imports exist across `src/zen`; this is the only one that does not resolve.)

### 3c. The cutover flag is decorative

`surfer.json` sets `"migration": { "engine": "chromium" }`. **Nothing reads it.** Searching
`scripts/`, `tools/`, `src/`, `build/` finds no consumer — only `src/zen/@types/*` matches for the
word "migration", and those are Glean typings.

`src/zen/adapters/engine.mjs` does not read `surfer.json` either; it sniffs live globals:

```js
if (typeof Services?.prefs?.getCharPref === "function") return Services.prefs.getCharPref(...)
if (typeof chrome?.storage?.local?.get === "function") return ENGINE_CHROMIUM;
```

### 3d. `ZEN_MIGRATION_ENGINE` does not exist

`src/zen/moz.build` says:

> "When surfer.json migration.engine flips to "chromium", engine-chromium/ imports these files
> directly and this block is skipped via ZEN_MIGRATION_ENGINE."

There is no `ZEN_MIGRATION_ENGINE` anywhere — not in a `.build`, `.py`, `.mozbuild` or `.json`.
It appears only in that comment. The described mechanism was never implemented.

## 4. Why this happened

`chrome://` and `resource://` *are* the Gecko module system. Removing them from Gecko source does
not migrate anything to Chromium — it removes the app's ability to load its own modules and
assets. A grep can be driven to zero by pointing imports at paths that do not exist, and the gate
will report success while the browser renders blank.

The lane commits show the shape of it: Lane 2 changed 42 files for a net **+3 lines**; Lane 1's
final commit added **one `/* global ... */` comment** to each of `engine/observers/prefs/session/
storage/tabs/xul.mjs` and nothing else. Comment sanitisation and URL rewriting, not porting.

## 5. Options

**A — Restore a runnable Gecko Zen.** Revert `e2fe3f6`, `bf329bb`, `f7a3a48` (or just the 49 path
rewrites). Then `mach bootstrap` (from PowerShell) → `mach build` → `mach run`. Hours, but the
result is a browser that actually opens, and you can then fix real errors against a running app.

**B — Actually build the Chromium lane.** Not "setup" — a project. Requires choosing a host
(CEF or WebView2), vendoring it, writing the C++ host + tab strip, and replacing the mock
`BUILD.gn`/`manifest.json` with a real target. The 176 files of `src/zen` logic can then be
consumed as-is. This is the only path on which `migration.engine: "chromium"` means anything.

**C — Repair in place without reverting.** Recreate `src/zen/assets/` (or re-point the 49 refs at
`src/browser/themes/shared/zen-icons/`), fix the one broken import, and delete the dead
`BUILD.gn`/`ZEN_MIGRATION_ENGINE` claims. Gets Gecko runnable while keeping the branch shape.

## 6. Recommended

**A**, then **B** as a separate, honestly-scoped effort. Do not build the current tree as-is: it
will burn hours and fail, because §3a and §3b are in files the Gecko build consumes.

---

## 7. Update 2026-09-24 (HEAD `01eb20c` — audit re-verified, findings stand)

Re-ran the §3 checks against the current tree. Every finding above still holds; one is partially
addressed:

- **§1 (no Chromium):** holds. `engine-chromium/` is now 31 files / ~106 KB (was 23 / 138 KB) —
  still no engine, no binaries, no checkout. **Partially addressed:** `f26a6a9` replaced the mock
  GN described here with a real `//zen` static library (`zen_layer.cc`, `zen_tab_model.cc`,
  `zen_vertical_tab_strip.cc` + headers), so the "not buildable GN" bullets no longer apply to the
  current `BUILD.gn`. It remains uncompiled without a checkout, and the extension-manifest /
  `<webview>` / cross-root-CSS points stand for the shell files.
- **§2 (Gecko unbuilt):** holds. No `dist/bin`, CLOBBER+config.log only, mingw64-vs-MSVC shell
  pitfall, unbootstrapped `~/.mozbuild`.
- **§3a (49 dead paths):** holds. `Test-Path src/zen/assets` → False, `src/zen/styles` → False;
  sample refs re-confirmed (`ZenSpaceManager.mjs:2615`, `ZenWelcome.mjs:67,366,605`,
  `zen-space-routing.inc.xhtml:23,33,38,44`). Tracked as TODO.md R1.
- **§3b (broken import):** holds with a nuance. `ZenUIManager.mjs:9` keeps the
  `UrlbarShared` import **commented out** while `:504` calls
  `UrlbarShared.RESULT_SOURCE.ZEN_ACTIONS` live. Tracked as TODO.md R2.
- **§3c–d (decorative flag):** holds. `engine.mjs` contains no `surfer` read (sniffs live
  globals); `ZEN_MIGRATION_ENGINE` resolves only to the `src/zen/moz.build` comment. Tracked
  as TODO.md R3.
- **Disk:** lane-plan measured G: 29 GB free at audit time; today **55.60 GB free** (nothing
  deleted by this effort — do not treat as headroom). Still short of the 78 GB minimum
  (~22 GB) and the 100 GB+ official requirement (~44 GB).
- **Recommendation:** unchanged — **A then B**, or C. The repair list is now tracked as
  TODO.md R1–R4 with a three-gate verification (grep + path-existence + import-live) so a
  green grep can never again pass for a broken tree.
