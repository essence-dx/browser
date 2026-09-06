# PLAN — Zen Firefox → Chromium Migration (3 Lanes)

**Branch:** `chromium-migration` from `dev@8df45e5` (Firefox 155.0.1) — scaffold `adc0515` — `G:\Dx\zen`
**Scope:** 176 app files / ~50k lines + 258 patches / 13k lines (808 test files excluded, not in scope)
**Method:** Strangler-fig on this branch — no new repo, `dev` stays green; 3 agents in 3 parallel work-first lanes.

## Why This Works

Zen is a Surfer patchset on mozilla-central; every file uses `chrome://`/`resource://` + `gBrowser`/`Services`/`MozXULElement` (3418 hits). Scaffold already isolated pure logic to `src/zen/shared/` (color math, split-tree, 0 Gecko deps) and facade'd Gecko behind `src/zen/adapters/` (`prefs`/`tabs`/`session`/`xul` — Gecko now, `chrome.*` stubs next). Splitting 50k app lines into 3 directory-owned lanes lets 3 agents ship in parallel without collisions; tests stay untouched until cutover.

## Architecture — Shell + Guests

```
G:\Dx\zen (chromium-migration branch)
├── surfer.json:migration.engine = "gecko"|"chromium"|"dual" ("gecko" now)
├── src/zen/shared/       ← pure JS, consumed by both engines
├── src/zen/adapters/     ← single writer (Lane 1); Lanes 2–3 import from here
├── src/zen/{tabs,spaces,split-view,...}  ← Lane 2 UI shell (behind adapters)
├── src/zen/{boosts,sync,urlbar,...}      ← Lane 3 services/data (behind adapters)
├── engine/               ← Gecko (Surfer, moz.build/mach) — stays green
└── engine-chromium/      ← (Phase 3) CEF/WebView2 guest — shell owns tab strip
    Guests are offscreen BrowserView/WebContentsView surfaces; tab 1=CEF, tab 2=Gecko in dual mode.
    Per-tab engine switch = recreate WebContents with other guest; no in-place DOM translate.
```

CEF/WebView2 chosen over raw `chromium/src` (~40GB) — 10× smaller, fits Surfer's `engine/` indirection via flag. Raw fork only if product demands it (Phase 4).

## Rollout — 3 Lanes, Work-First

**Lane 1 — Foundation (Agent 1):** own `shared/`+`adapters/`+`surfer.json` flag. Add `adapters/observers|windows|storage`, keep docs, gate `engine-chromium/` placeholder.

**Lane 2 — UI Shell (Agent 2):** own `common/`/`tabs`/`spaces`/`compact-mode`/`split-view`/`welcome`/`media`/`kbs`/`folders`/`glance`. Swap `Services.prefs`/`MozXULElement`/`gBrowser` → `shared/`+`adapters/`; `split-view` reuses `shared/zenSplitLayout` math.

**Lane 3 — Services & Patches (Agent 3):** own `boosts`/`live-folders`/`sync`/`urlbar`/`sessionstore`/`space-routing`/`mods`/`toolkit`/`drag-and-drop`/`window-drag`/`src/browser/**.patch`. Migrate data layer to `adapters/storage`/`session`; XPCOM → Mojo stubs; catalog 258 patches for `BUILD.gn`/Views rewrite (log only).

One directory = one lane; cross-cutting → Lane 1 adapter PR first. PRs target `chromium-migration`, weekly `git merge dev` (Lane 1 first). Commits `chore(migration): lane{N}:`.

## Risks

- **Lane collision:** ownership table in `AGENTS.md` + single-writer `shared/`/`adapters/` — others import only.
- **Dual binary size:** CEF guest ~200MB until cutover; defer raw chromium/src.
- **Profile/extensions divergence** (cookies/IndexedDB, MV3 vs WebExtensions+XUL): start isolated profiles, unify later (known gap).
- **258 patches + 2 build systems** (`mach` vs `GN/Ninja`): Lane 3 catalogs now, GN rewrite Phase 4.
- **Sandbox mismatch** (Gecko RLBox vs Chromium broker): acknowledged, weakest until dual retired.

## Verification

Work-first: `npm run lint` per lane, `git status` clean — no test gate until cutover. `grep -R "Services\\.|gBrowser\\." src/zen --exclude-dir=adapters` trends to zero (Lane 1 tracks). Exit: flip `migration.engine` → `"chromium"`, retire `engine/`.

## Exit Criteria

`AGENTS.md` lets each of the 3 agents start immediately on its lane; `engine-chromium/` boots one window with tab 1=CEF, tab 2=Gecko; then cut over and delete Gecko path.
