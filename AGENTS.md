# AGENTS — Chromium Migration (3 Lanes)

**Branch:** `chromium-migration` from `dev@8df45e5` (Firefox 155.0.1) — scaffold `adc0515`
**Goal:** Firefox Gecko → Chromium incrementally via strangler-fig. 3 AI agents in 3 parallel lanes, work-first (tests deprioritized), `dev` stays green.
**Engine flag:** `surfer.json:migration.engine = "gecko"|"chromium"|"dual"` (`"gecko"` now). Consumers import from `src/zen/adapters/` — never `Services.*`/`gBrowser` directly.

## Ground Rules

- `dev` is never broken. Weekly `git merge dev` into `chromium-migration` — Lane 1 merges first, Lanes 2–3 rebase.
- All PRs target `chromium-migration`, never `dev`, until cutover. Squash with `chore(migration): lane{N}: <what>`.
- `migration.engine` defaults `"gecko"`. CI is lint-only (`pr-test.yml`); no test gate until cutover (work-first per order).
- `src/zen/tests/` (808 files) stays on Gecko path — no test rewrites required in this phase.
- Tooling: `npm ci` → `npm run download` → `npm run bootstrap` → `npm run import` → `npm run lint` → `python scripts/run_tests.py <suite>` (optional) → `surfer status`.

## Lane Ownership — One Directory = One Lane

| Lane | Agent | Owns (only this agent edits) | You do | You NEVER touch |
|------|-------|------------------------------|--------|-----------------|
| **1 — Foundation & Build Seam** | Agent 1 | `surfer.json`, `src/zen/shared/**`, `src/zen/adapters/**`, `src/zen/zen.globals.mjs`, `eslint.config.mjs`, `configs/**`, `.github/workflows/*.yml` (Phase 2+), `docs/chromium-migration.md` | Harden seams: keep `shared/zenColorUtils` + `zenSplitLayout` pure (0 Gecko deps); add `adapters/observers.mjs` (`Services.obs`), `adapters/windows.mjs` (`BrowserWindowTracker`), `adapters/storage.mjs` (`IOUtils`/`PathUtils`/`JSONFile`) — Gecko body now + commented `chrome.*` stub. Gate flag, own docs. Single writer for `shared/`+`adapters/`. | Lane 2/3 product modules |
| **2 — UI Shell & Low-Coupling Modules** | Agent 2 | `src/zen/common/**`, `src/zen/tabs/**`, `src/zen/spaces/**`, `src/zen/compact-mode/**`, `src/zen/split-view/**`, `src/zen/welcome/**`, `src/zen/media/**`, `src/zen/kbs/**`, `src/zen/folders/**`, `src/zen/glance/**` | Replace Gecko calls with Lane 1 adapters: `kbs`/`welcome`/`media` → `adapters/prefs`+`xul`; `tabs`/`spaces` + `ZenGradientGenerator` → `shared/zenColorUtils` + `adapters/tabs`/`prefs`/`session`; `split-view` → `shared/zenSplitLayout`; `compact-mode`/`folders`/`glance` similarly. Keep layout/CSS, drop `MozXULElement`. | `boosts/`, `live-folders/`, `sync/`, `urlbar/`, `sessionstore/`, `space-routing/`, `mods/`, `toolkit/`, `drag-and-drop/`, `window-drag/`, `adapters/` internals |
| **3 — Services, Data & Engine Patches** | Agent 3 | `src/zen/boosts/**`, `src/zen/live-folders/**`, `src/zen/sync/**`, `src/zen/urlbar/**`, `src/zen/sessionstore/**`, `src/zen/space-routing/**`, `src/zen/mods/**`, `src/zen/toolkit/**`, `src/zen/drag-and-drop/**`, `src/zen/window-drag/**`, `src/zen/share/**`, `src/browser/**` (patches), `src/external-patches/**`, `prefs/**`, `src/toolkit/**`, `src/dom/**`, `src/layout/**` | Migrate services/data: `boosts`/`live-folders`/`sync` → `adapters/storage`/`session`/`prefs` (Weave → `chrome.storage.sync`+`identity` shims); `urlbar` → `omnibox` shim; `mods` native → `chrome.scripting`; XPCOM → Mojo stubs. Catalog `src/browser/**/*.patch` (258) for `BUILD.gn`/Views rewrite (log only this phase). Owns `TODO.md`/`PLAN.md`/`CHANGELOG.md` housekeeping. | `shared/`/`adapters/` internals, Lane 2 UI modules |

**Rule:** cross-cutting change → PR against Lane 1 `adapters/` first. Others consume via `import`.

## Workflow

1. Lane branch from `chromium-migration` → edit only your owned dirs → `npm run lint` locally.
2. PR against `chromium-migration` with label `lane:{1,2,3}` → review by other lane owner if it touches seam.
3. Squash merge with `chore(migration): lane{N}: ...` + `Co-authored-by: CommandCodeBot <noreply@commandcode.ai>`.
4. After Lane 1 lands an adapter, Lanes 2–3 rebase and swap to it.

## Conflict Protocol

- `src/zen/shared/` and `src/zen/adapters/` are single-writer (Lane 1). Conflicts → Lane 1 wins, others rebase.
- Docs `AGENTS.md`/`TODO.md`/`PLAN.md`/`CHANGELOG.md` are owned by Lane 3 for batching — Lanes 1–2 do not edit them concurrently.
- If you need a file outside your lane, open a Lane 1 adapter PR instead of editing directly.

## Verification (Work-First)

- `git status` clean, `npm run lint` passes. No test gate required until cutover.
- `grep -R "Services\\.|gBrowser\\." src/zen --exclude-dir=adapters` should trend to zero (Lane 1 tracks).

## How to Start Now (Each Agent)

- **Lane 1:** `git checkout chromium-migration` → add `adapters/observers.mjs`, `windows.mjs`, `storage.mjs` → keep flag `gecko`.
- **Lane 2:** same checkout → start `kbs/` → `welcome/` → `tabs/`/`spaces/` swaps to `shared/`+`adapters/`.
- **Lane 3:** same checkout → catalog patches → migrate `boosts`/`sync`/`urlbar` to adapters.

All 3 can start immediately — no ordering dependency except Lane 1's adapters are the import target.
