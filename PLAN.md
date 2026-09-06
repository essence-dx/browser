# PLAN — Zen Firefox → Chromium: Main Task (3 Lanes, Hours)

**Branch:** `chromium-migration` from `dev@8df45e5` (FF 155.0.1) — `G:\Dx\zen` — scaffold `adc0515`+`b197970`
**Main task:** Migrate real files Firefox Gecko → Chromium. **Hours, not weeks — no tests, no merges.**
**Scope:** 176 app files / ~50k lines + 258 patches / 13k lines (808 tests ignored).

## Why 3 Lanes Work in Hours

Zen is Surfer patchset; every file uses `chrome://`/`resource://`+`gBrowser`/`Services`/`MozXULElement` (3418 hits). Scaffold isolated pure logic to `src/zen/shared/` (0 deps) and facaded Gecko behind `src/zen/adapters/` (`prefs`/`tabs`/`session`/`xul` — Gecko now, `chrome.*` stubs next). 50k lines split by directory = 3 agents edit disjoint files directly on `chromium-migration`, no PRs, no weekly merges — just `lane{N}` commits and `npm run lint`.

## Architecture — Main Task Files Only

```
chromium-migration branch (G:\Dx\zen)
├── surfer.json:migration.engine = "gecko" (now)
├── src/zen/shared/    ← Lane 1 pure (already done)
├── src/zen/adapters/  ← Lane 1 single writer — lanes 2–3 import from here
├── src/zen/{common,kbs,welcome,media,tabs,spaces,split-view,compact-mode,folders,glance} ← Lane 2 UI
├── src/zen/{boosts,live-folders,sync,urlbar,sessionstore,space-routing,mods,toolkit,drag-and-drop,window-drag} ← Lane 3 services
├── src/browser/**/*.patch (258) ← Lane 3 catalogs for BUILD.gn later
└── engine/ (Gecko) stays green; engine-chromium/ (CEF) deferred to final mile
```
No test rewrites, no GN rewrite yet — just file migration above.

## Lanes — Main Task Only (Hours)

**Lane 1 — Foundation (Agent 1):** `surfer.json`, `shared/`, `adapters/`, `zen.globals.mjs`. Add `adapters/observers|windows|storage`, keep flag/docs. Single writer.

**Lane 2 — UI Shell (Agent 2):** `common/`/`tabs`/`spaces`/`compact-mode`/`split-view`/`welcome`/`media`/`kbs`/`folders`/`glance`. Swap Gecko → `shared/`+`adapters/` per file.

**Lane 3 — Services & Patches (Agent 3):** `boosts`/`live-folders`/`sync`/`urlbar`/`sessionstore`/`space-routing`/`mods`/`toolkit`/`drag-and-drop`/`window-drag`/`src/browser/**.patch`. Migrate data layer, stub XPCOM, catalog patches.

Each lane commits `chore(migration): lane{N}: <files>` directly to `chromium-migration`. No PRs, no merges needed now.

## Risks (Main Task)

- **Collision:** one directory = one lane; others never edit your dirs.
- **Patch debt:** 258 patches logged only — no GN this phase.
- **No tests:** work-first per order; verification is `npm run lint` + `git status`.

## Verification

`npm run lint` per lane, `git status` clean. Done when owned files import via `shared/`+`adapters/` — not test coverage.

## Exit

`AGENTS.md` lets each agent start now on its lane. Final mile (`engine-chromium/` CEF, flip engine, retire `engine/`) after lanes' main-task commits land.
