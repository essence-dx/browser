# Shell assets (Chromium) — mapping from Gecko URLs

JS/CSS reference these as `../assets/...` (relative, grep-clean).
The shell build copies/links the sources below into `assets/`:

| Shell path | Gecko source |
|---|---|
| `assets/icons/*` | `src/browser/themes/shared/zen-icons/*` (e.g. `selectable/logo-github.svg`, `private-window-small.svg`, `sparkles.svg`) |
| `assets/images/*` | `src/zen/images/*` (e.g. `favicons/github.svg`) |
| `assets/videos/*` | `src/zen/videos/welcome-background.mp4` |
| `assets/notification-icons/*` | `src/browser/themes/shared/notification-icons/*` |

`chrome.runtime.getURL("assets/...")` resolves the same files at runtime;
relative `../assets/...` works from `shell/tabs.html` without it.
