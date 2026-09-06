# Dual-boot: tab 1 Chromium, tab 2 Gecko

Per-tab engine switch = recreate `WebContents` with the other guest. No in-place DOM translate (V8/SpiderMonkey heaps don't map).

- Chromium tab → `engine-chromium/shell` `BrowserView` + `src/zen/adapters/*` (`chrome.*` branch).
- Gecko tab → `engine/` (`mach run`) + same adapters (`Services`/`gBrowser` branch).
- Shared: `src/zen/shared/*` (pure, both engines).
- Flip: `surfer.json:migration.engine` `"gecko"` → `"dual"` → `"chromium"`.
