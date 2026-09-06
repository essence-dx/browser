# PROMPT — Lane {N} — Firefox → Chromium Main Task

**Copy this, replace {N} with 1, 2, or 3, give to your AI agent. No tests, no heavy commands, just migrate files.**

---

You are on branch `chromium-migration` in `G:\Dx\zen` (from `dev@8df45e5` FF 155.0.1). Main task: migrate real files Firefox Gecko → Chromium in hours. No tests, no `npm run` heavy commands, low hardware — just change files fast via `read_file`/`edit_file`/`write_file`.

**You are Lane {N}. Only edit your owned files (see `G:\Dx\zen\AGENTS.md` lane table). No tests, no `git merge`, no `npm ci`/`download`/`build`. Commit `chore(migration): lane{N}: <files>` when done.**

Lane {N} owns:
- Lane 1: `surfer.json`, `src/zen/shared/**`, `src/zen/adapters/**`, `src/zen/zen.globals.mjs`, `docs/chromium-migration.md`
- Lane 2: `src/zen/common/**`, `src/zen/tabs/**`, `src/zen/spaces/**`, `src/zen/compact-mode/**`, `src/zen/split-view/**`, `src/zen/welcome/**`, `src/zen/media/**`, `src/zen/kbs/**`, `src/zen/folders/**`, `src/zen/glance/**`
- Lane 3: `src/zen/boosts/**`, `src/zen/live-folders/**`, `src/zen/sync/**`, `src/zen/urlbar/**`, `src/zen/sessionstore/**`, `src/zen/space-routing/**`, `src/zen/mods/**`, `src/zen/toolkit/**`, `src/zen/drag-and-drop/**`, `src/zen/window-drag/**`, `src/zen/share/**`, `src/browser/**`, `src/external-patches/**`, `prefs/**`

**Main task for Lane {N}:**
- Lane 1: Add `src/zen/adapters/observers.mjs`, `windows.mjs`, `storage.mjs` (Gecko body + commented `chrome.*` stub), keep `shared/` pure, flag `gecko`.
- Lane 2: Swap Gecko (`Services.prefs`/`MozXULElement`/`chrome://`/`gBrowser`) → `shared/`+`adapters/` in your owned UI files. Keep layout/CSS.
- Lane 3: Swap data/services to `adapters/storage`/`session`/`prefs`; XPCOM → stubs; catalog `src/browser/**/*.patch` (258) — log only.

**Do:** `read_file` owned files → `edit_file`/`write_file` to replace `Services.*`/`gBrowser.*`/`MozXULElement`/`chrome://` with `shared/`+`adapters/` imports (see `src/zen/adapters/*.mjs` for pattern) → `git add` owned files → `git commit`.

**Do NOT:** run `npm`, `python`, `mach`, `surfer`, `git merge`, or touch `src/zen/tests/` or other lanes. Low hardware — no heavy commands.

**Lane {N} prompt ready — paste after replacing {N}.**
