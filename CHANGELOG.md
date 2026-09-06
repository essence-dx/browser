# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) — tracking upstream Zen `1.22b`/`1.23t` (Firefox 155.0.1 at `dev@8df45e5`) until cutover.

## [Unreleased]

### Added
- 3-lane `AGENTS.md` / `TODO.md` / `PLAN.md` for parallel work-first migration on `chromium-migration`.

## [chromium-migration] - 2026-09-06

### Added
- Scaffold incremental Gecko → Chromium migration on branch `chromium-migration` from `dev@8df45e5`.
- `src/zen/shared/zenColorUtils.mjs` (101L) — framework-free color math (hsl/rgb, blend, luminance, contrast, hexToRgb, getAccentColorForUI) from `ZenGradientGenerator.mjs`, 0 Gecko deps.
- `src/zen/shared/zenSplitLayout.mjs` (106L) — framework-free split-view tree (`ZenSplitLeafNode`/`ZenSplitNode`, `calculateLayoutTree`, `applyGridLayoutToPositions`) from `ZenViewSplitter.mjs`.
- `src/zen/adapters/prefs.mjs`, `tabs.mjs`, `session.mjs`, `xul.mjs` — Gecko impl now + commented `chrome.*` stubs; consumers must import from here.
- `surfer.json:migration {engine:"gecko", chromiumBranch:"chromium-migration", strategy:"strangler-fig"}` — engine flag defaults `gecko` (`"chromium"`/`"dual"` next).
- `docs/chromium-migration.md` — technical deep dive for the strangler-fig plan.

### Notes
- Work-first: `src/zen/tests/` (808 files) stays on Gecko path, not in scope for this phase.
- No `engine-chromium/` (CEF) yet — Phase 3; no `BUILD.gn` rewrites yet.
