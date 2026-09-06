# PROMPT — Lane {N} — Firefox → Chromium 100% Complete

**Copy this, replace {N} with 1, 2, or 3, give to your AI agent. No tests, no heavy commands, just migrate files to 100%.**

---

You are on branch `chromium-migration` in `G:\Dx\zen` (from `dev@8df45e5` FF 155.0.1). Main task = 100% complete Firefox Gecko → Chromium. Status now ~10%: 1820 Gecko API hits + 2056 protocol/CSS hits left in `src/zen` (~250 files), 258 patches + XPCOM untouched, `engine-chromium/` empty. No tests, no `npm`/`python`/`mach`/`surfer`/`git merge`, low hardware — just `read_file`/`edit_file`/`write_file` + `git add`/`commit`.

**You are Lane {N}. Only edit your owned files (see `G:\Dx\zen\AGENTS.md` lane table + `TODO.md` per-file checklist). Commit `chore(migration): lane{N}: <file> <before>→0` when each file hits zero. 100% = every call site swapped and working (not commented), grep = 0, shell boots, flag flips.**

Lane {N} owns:
- Lane 1: `surfer.json`, `src/zen/shared/**`, `src/zen/adapters/**`, `src/zen/zen.globals.mjs`, `docs/chromium-migration.md`, `engine-chromium/**` (new), `src/zen/moz.build`
- Lane 2: `src/zen/common/**` (112 hits), `src/zen/tabs/**` (42), `src/zen/spaces/**` (142), `src/zen/compact-mode/**` + `.cpp`/`.idl`, `src/zen/split-view/**` (69), `src/zen/welcome/**`, `src/zen/media/**`, `src/zen/kbs/**`, `src/zen/folders/**` (60), `src/zen/glance/**`, owned CSS/XHTML
- Lane 3: `src/zen/boosts/**`, `src/zen/live-folders/**`, `src/zen/sync/**` (39), `src/zen/urlbar/**` (~100), `src/zen/sessionstore/**` (59), `src/zen/space-routing/**` (48), `src/zen/mods/**`, `src/zen/toolkit/**`, `src/zen/drag-and-drop/**` (38), `src/zen/window-drag/**`, `src/zen/share/**`, `src/zen/downloads/**`, `src/browser/**` (258 patches), `src/external-patches/**`, `prefs/**`, `configs/**`, XPCOM IDL/CPP

**100% task for Lane {N} (follow TODO.md per-file list, check only at 0 hits):**
- Lane 1: every `adapters/*.mjs` export dual-working (Gecko + live `chrome.*` behind flag, not comment) + `engine-chromium/` CEF shell + dual-boot + flip `surfer.json:migration.engine` → `"chromium"` at zero + strip globals.
- Lane 2: EVERY `Services.*`/`gBrowser.*`/`MozXULElement`/`createXULElement`/`chrome://`/`resource://` in owned `.mjs` → `shared/`+`adapters/` working calls; EVERY `-moz-`/`@namespace`/`%include` in owned CSS → standard CSS; XHTML→HTML; `ZenMouseTracker.cpp`/`.idl` → shim.
- Lane 3: EVERY owned `.mjs` call site → adapters working calls; Weave→`chrome.storage.sync`, urlbar→`omnibox`, session→`chrome.sessions`, `IOUtils`→`adapters/storage`; EVERY `nsIZen*.idl`+`.cpp` → Mojo shim/delete; ALL 258 patches → `BUILD.gn`+Views; prefs→PrefService.

**Do:** `read_file` owned file → swap EVERY hit per patterns in `src/zen/adapters/*.mjs` → verify file grep = 0 → `git add` → `git commit`. Report before/after counts.

**Do NOT:** run `npm`, `python`, `mach`, `surfer`, `git merge`, or touch `src/zen/tests/` or other lanes.

**Lane {N} prompt ready — paste after replacing {N}. 100% = grep zero + shell boots + flag flips.**
