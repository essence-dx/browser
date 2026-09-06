# AGENTS — Chromium Migration (3 Lanes, Hours — Main Task Only)

**Branch:** `chromium-migration` from `dev@8df45e5` (Firefox 155.0.1)
**Goal:** Main task — migrate real code from Firefox Gecko → Chromium in hours. 3 agents, 3 parallel lanes on the same branch, no tests, no wasted merges. All lanes work directly on `chromium-migration`.
**Scope:** `src/zen` app 176 files / ~50k lines + 258 patches / 13k lines (808 test files ignored — not in scope, no test writes).
**Engine flag:** `surfer.json:migration.engine = "gecko"` now — lanes swap via `src/zen/adapters/` (import from there, never `Services.*`/`gBrowser` directly).

## Ground Rules (Hours, Not Weeks)

- **No tests, no merges.** Each lane commits directly to `chromium-migration` in its owned dirs. No PRs, no weekly merges, no CI gates this phase — just main-task migration. `dev` stays untouched; we finish on this branch in hours.
- **Main task only:** every file edit must migrate Firefox → Chromium (via `shared/` pure or `adapters/` facade). No refactors, no test files, no tooling detours.
- **Work in parallel, zero overlap:** one directory = one lane (table below). Do not edit outside your lane. If you need another lane's file, tell Lane 1 to add the adapter instead.
- **Commits:** `chore(migration): lane{N}: <files>` + `Co-authored-by: CommandCodeBot <noreply@commandcode.ai>`.

## Lane Ownership — Main Task Files Only

| Lane | Agent | Owns (only this agent edits these files) | Main task — you migrate these files from Firefox → Chromium |
|------|-------|------------------------------------------|-------------------------------------------------------------|
| **1 — Foundation** | Agent 1 | `surfer.json`, `src/zen/shared/**`, `src/zen/adapters/**`, `src/zen/zen.globals.mjs`, `docs/chromium-migration.md` | `shared/zenColorUtils.mjs` + `shared/zenSplitLayout.mjs` stay pure (already done). Add `adapters/observers.mjs` (`Services.obs`), `adapters/windows.mjs` (`BrowserWindowTracker`), `adapters/storage.mjs` (`IOUtils`/`PathUtils`) — Gecko body now + commented `chrome.*` stub. Flag stays `gecko`. You are the single writer for `shared/`+`adapters/` — lanes 2–3 import from you. |
| **2 — UI Shell** | Agent 2 | `src/zen/common/**`, `src/zen/tabs/**`, `src/zen/spaces/**`, `src/zen/compact-mode/**`, `src/zen/split-view/**`, `src/zen/welcome/**`, `src/zen/media/**`, `src/zen/kbs/**`, `src/zen/folders/**`, `src/zen/glance/**` | Migrate UI files: replace `Services.prefs`/`MozXULElement`/`chrome://`/`gBrowser` with `shared/`+`adapters/` imports. `kbs`→`welcome`→`media`→`mods`→`tabs`/`spaces`/`split-view` in order. Keep layout/CSS, drop XUL. No test files. |
| **3 — Services & Patches** | Agent 3 | `src/zen/boosts/**`, `src/zen/live-folders/**`, `src/zen/sync/**`, `src/zen/urlbar/**`, `src/zen/sessionstore/**`, `src/zen/space-routing/**`, `src/zen/mods/**`, `src/zen/toolkit/**`, `src/zen/drag-and-drop/**`, `src/zen/window-drag/**`, `src/zen/share/**`, `src/browser/**` (patches), `src/external-patches/**`, `prefs/**`, `configs/**` | Migrate services/data + catalog patches: `boosts`/`live-folders`/`sync` (Weave → `chrome.storage.sync` shims), `urlbar` (`UrlbarProvider` → `omnibox`), `sessionstore` → `chrome.sessions`, `mods` native → `chrome.scripting`, XPCOM (`nsIZen*`) → stubs. Log 258 patches for `BUILD.gn` later — no GN rewrite yet. |

**Rule:** cross-cutting → Lane 1 adapter first, then lanes 2–3 consume. `TODO.md`/`PLAN.md`/`CHANGELOG.md` are reference — lanes do not need to edit them to start.

## How to Start Now (Each Agent — Do It In Hours)

- **Lane 1:** `git checkout chromium-migration` → add missing `adapters/*.mjs` → commit `lane1`.
- **Lane 2:** same checkout → start `kbs/` → `spaces/` → `tabs/`/`split-view` swaps → commit `lane2`.
- **Lane 3:** same checkout → `boosts`/`sync`/`urlbar` swaps + patch catalog → commit `lane3`.

All 3 start immediately, no ordering except Lane 1's adapters are import targets. Done when `grep -R "Services\\.|gBrowser\\." src/zen --exclude-dir=adapters` trends to zero and `npm run lint` passes.
