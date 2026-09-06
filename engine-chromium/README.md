# engine-chromium/ — Lane 1 Shell (CEF/WebView2 Guest)

**Status:** scaffold on `chromium-migration`. Not fetched yet — placeholder so Lanes 2–3 have a stable import target.

## Layout (when fetched)

```
engine-chromium/
├── README.md            ← this file
├── shell/               ← tab strip reusing Zen vertical-tabs design (HTML + CSS vars from src/zen)
│   ├── tabs.html        ← BrowserView host, one <webview> per tab
│   ├── workspaces.js    ← imports ../src/zen/shared/zenColorUtils.mjs (pure)
│   └── splitview.js     ← imports ../src/zen/shared/zenSplitLayout.mjs (pure)
├── adapters-live/       ← symlinks to ../src/zen/adapters/*.mjs (dual-working bodies)
└── dual-boot.md         ← tab 1 = Chromium guest, tab 2 = Gecko guest (engine/)
```

## Dual-boot contract

- Shell owns tab strip. Each tab is an offscreen `BrowserView`/`WebContentsView`.
- `src/zen/adapters/*` decide per call: `chrome.*` when present, Gecko (`Services`/`gBrowser`) otherwise.
- `surfer.json:migration.engine`: `"gecko"` now → `"dual"` when this dir boots → `"chromium"` at zero + boot.

## Fetch (Lane 1 final mile, heavy — deferred)

CEF: `https://cef-builds.spotifycdn.com/index.html` (or WebView2 on Windows). Do NOT fetch on low hardware now — scaffold only.
