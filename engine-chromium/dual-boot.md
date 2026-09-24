# Dual-boot: tab 1 Chromium, tab 2 Gecko (DESIGN — not implemented)

> Status 2026-09-24: design doc. `shell/dual-boot.js` today toggles `about:blank` guests
> only; no `WebContents` recreation, no `BrowserView`, no Gecko guest. Implement after
> repairs R1–R4 + a real checkout exist.

Per-tab engine switch = recreate `WebContents` with the other guest. No in-place DOM translate (V8/SpiderMonkey heaps don't map).

- Chromium tab → `engine-chromium/shell` `BrowserView` + `src/zen/adapters/*` (`chrome.*` branch — requires source-built `chrome.exe`; renderer embeds do NOT provide `chrome.*`, see lane-plan §2).
- Gecko tab → `engine/` (`mach run` from PowerShell/MSVC env) + same adapters (`Services`/`gBrowser` branch — requires R1/R2 repairs + R4 bootstrap).
- Shared: `src/zen/shared/*` (pure, both engines).
- Flip: `surfer.json:migration.engine` `"gecko"` → `"dual"` → `"chromium"` (today decorative — TODO.md R3; file value is `"chromium"`).
