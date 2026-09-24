# engine-chromium/ — Zen layer on Chromium (`//zen`)

**Status (verified 2026-09-24, HEAD `01eb20c`):** scaffold — 31 files / ~106 KB. **Not fetched,
not built, not booted.** Placeholder so Lanes 2–3 have a stable import target. The audit
(`docs/chromium-migration-audit.md`) verdict stands: this directory contains no engine, no
binaries, no checkout. `f26a6a9` fixed the mock-GN part (see `BUILD.gn` below); the rest of
the audit §1 still applies.

## Layout

```
engine-chromium/
├── README.md            ← this file
├── BUILD.gn             ← real //zen static_library (valid only inside a chromium/src checkout)
├── args.gn              ← smallest config that still yields a runnable chrome.exe
├── bootstrap.sh         ← fetch --no-history → gclient sync → overlay → gn gen → autoninja
├── preflight.sh         ← gates the build; read-only; exits 1 when disk is short (authority)
├── prefs.json           ← PrefService input (genuinely useful)
├── policy/policy.json   ← policy input (genuinely useful)
├── patches-mapping.md   ← 125-row Gecko→Chromium mapping table (input, not a rewrite)
├── dual-boot.md         ← design: tab 1 Chromium, tab 2 Gecko (design only — see note)
├── shell/               ← tab strip reusing Zen vertical-tabs design (SKETCH, uncompiled)
│   ├── tabs.html        ← BrowserView host sketch (note: <webview> is the retired Chrome Apps API)
│   ├── tabs.js, workspaces.js, splitview.js, background.js, shell.css
│   └── dual-boot.js     ← today toggles about:blank guests; no WebContents recreation
├── zen/                 ← //zen C++ (MIXED: zen_tab_model.* trustworthy; the rest sketches)
│   ├── zen_tab_model.{h,cc}         ← engine-agnostic tab model — complete
│   ├── zen_layer.{h,cc}             ← entry point; AttachToBrowserWindow is a TODO block
│   └── zen_vertical_tab_strip.{h,cc}← Views widget; reconcile against real headers once checked out
├── mojo/                ← XPCOM shims (mouse-tracker, mods-backend, drag-drop, window-drag, boosts-backend, share)
└── assets/              ← placeholder README only
```

Retired: extension-style `manifest.json` (an extension is not a browser; identity comes from
`chrome/app` + branding). Still sketch, do not present as working: `shell/*`, `mojo/*`
(shims for XPCOM that still exists), `dual-boot.md` (describes the future shell).

## What this directory can and cannot do (lane-plan §2 is authoritative)

- **Renderer embeds (prebuilt CEF / WebView2 / Chrome-for-Testing):** Blink rendering only.
  No `//chrome` layer → no `chrome.tabs/sessions/omnibox`. Validates shell UI; NEVER
  validates `src/zen/adapters/*` `chrome.*` branches. Fits today's disk (snapshot ~500 MB,
  CEF ~1–2 GB, WebView2 preinstalled).
- **Real `chrome.*`:** vendor `chromium/src`, overlay this dir as `//zen`, build `chrome.exe`.
  First build is expected to fail on `zen_layer.cc` / `zen_vertical_tab_strip.cc` (sketches);
  fix against the real headers. `zen_tab_model.*` should compile clean.

## Dual-boot contract (design — not implemented)

- Shell owns tab strip. Each tab is an offscreen `BrowserView`/`WebContentsView`.
- `src/zen/adapters/*` decide per call: `chrome.*` when present, Gecko (`Services`/`gBrowser`) otherwise.
- `surfer.json:migration.engine`: `"gecko"` → `"dual"` → `"chromium"`. Today the flag is
  decorative (nothing wires it to behavior — TODO.md R3); the value in the file is `"chromium"`.

## Fetch (gated — do NOT run on G: today)

G: has 55.60 GB free; need 78 GB min / 100 GB+ official on one volume. `preflight.sh`
aborts by design. Repairs R1–R4 (TODO.md) land before any fetch. Then either free space
(`docs/disk-reclaim-plan.md`), build on a ≥200 GB SSD, use CircleCI shell-only jobs +
self-hosted/cloud full build (Siso/REAPI), or cloud VM. See PLAN.md.

CEF reference: `https://cef-builds.spotifycdn.com/index.html` (or WebView2 on Windows).
