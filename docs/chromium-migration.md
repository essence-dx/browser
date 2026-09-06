# Chromium Migration — Incremental Plan (chromium-migration branch)

**Branch:** `chromium-migration` (from `dev` @ `8df45e5`, FF 155.0.1)
**Strategy:** Strangler-fig inside the same repo — keep `dev` green, land Chromium in layers.

## Principle (from your order)

> New branch, replace Gecko → Chromium gradually, never from-scratch.

That is correct. We ship behind a build flag, dual-build in CI, and cut over tab-by-tab.

## Layer model — what gets strangled in which order

1. **Isolate pure logic (week 1–2).** Extract framework-free modules from `src/zen`:
   - `ZenGradientGenerator` math (`hslToRgb`, `blendColors`, `contrastRatio`, `calculateCompliments`)
   - `ZenViewSplitter` tree (`nsSplitNode`/`nsSplitLeafNode`, `calculateLayoutTree`, `applyGridLayout` core)
   - Theme tokens from `zen-tabs.css`/`zen-workspaces.css` → CSS variables

   Deliverable: `src/zen/shared/` with zero `Services`/`gBrowser` imports, unit-tested.

2. **Adapter layer (weeks 2–4).** New `src/zen/adapters/`:
   - `prefs`: `Services.prefs` → `chrome.storage` / `PrefService`
   - `tabs`: `gBrowser` → `chrome.tabs` + `chrome.tabGroups`
   - `session`: `SessionStore` → `chrome.sessions`/`chrome.storage.session`
   - `xul`: `createXULElement`/`MozXULElement` → `createElement` + custom elements / `<template>`
   - `thumbs`: `PageThumbs` → `chrome.tabs.captureVisibleTab`

   Feature-flagged: `surfer.json` gains `engine: "gecko"|"chromium"` and conditional `moz.build` ↔ `BUILD.gn` emission.

3. **Shell + CEF (months 2–3).** Bring up `engine-chromium/` via CEF/WebView2 behind `engine-chromium/` directory. Keep `engine/` (Gecko) buildable. Shell owns tab strip — reuse Zen *design* (vertical tabs, workspaces, split-view) against CEF guests. First milestone: one window, tab 1 = CEF, tab 2 = Gecko side-by-side.

4. **Shared services (months 3–5).** Cookie/history router, downloads, permissions, context menus multiplexed. Start isolated profiles; unify later.

5. **Cut over & retire Gecko (months 5–8).** Flip `engine: "chromium"` default, keep Gecko as fallback tab via guest process (dual-engine). Then delete `engine/`, Surfer Gecko fetcher, `moz.build` shims.

## Branch rules

- `dev` stays Gecko-green, never broken.
- `chromium-migration` merges `dev` weekly — conflicts resolved in adapters first.
- CI matrix: `build:gecko` and `build:chromium` both must pass before merge to `dev`.

## Anti-goals

- No big-bang rewrite commit.
- No forking a new repo — history stays here.
- No shipping dual-binary until adapters land.

## Lane 1 status (100% lane scope)

- `src/zen/shared/zenColorUtils.mjs` + `zenSplitLayout.mjs` pure (done, 0 Gecko deps).
- `src/zen/adapters/{engine,prefs,tabs,session,xul,observers,windows,storage}.mjs` — every export dual-working: Gecko body now + LIVE `chrome.*` branch (not commented stub). `engine.mjs` is the single flag source (`getEngine`/`isChromium`/`isGecko`).
- `src/zen/moz.build` registers `EXTRA_JS_MODULES.zen.adapters` + `.zen.shared` so the Gecko build keeps working while Chromium imports the same files.
- `surfer.json:migration` documents `engineOptions: ["gecko","chromium","dual"]` + `engineChromiumDir: "engine-chromium"`; flag stays `gecko` until grep = 0 + shell boots.
- `src/zen/zen.globals.mjs` exposes `zenAdapters/*`, `zenEngineAdapter`, `zenColorUtils`, `zenSplitLayout`, `chrome`.
- `engine-chromium/README.md` + `dual-boot.md` scaffold the CEF shell + dual-boot contract (fetch deferred — low hardware).
- No tests, no merges, no heavy commands — direct `chromium-migration` commits only. Lanes 2–3 import from `adapters/`.

## Next step

Lanes 2–3 swap owned files to `shared/`+`adapters/` imports. `engine-chromium/` (CEF) fetch deferred to final mile.
