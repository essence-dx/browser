# Chromium equivalents for Gecko patches (file-by-file)

125 patches (115 src/browser + 10 src/external-patches). Each Gecko patch maps to a BUILD.gn target + Views/chrome.* equivalent below.

| Gecko patch | Chromium equivalent | GN target |
|---|---|---|
| `G:\Zen\src\browser\actors\EncryptedMediaParent-sys-mjs.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\actors\WebRTCParent-sys-mjs.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\app\splash-rc.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\base\content\aboutDialog-css.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\base\content\aboutDialog-js.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\base\content\aboutDialog-xhtml.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\base\content\browser-addons-js.patch` | shell/tabs.js + adapters (tabs/windows/observers) | `//zen/shell:tabs` |
| `G:\Zen\src\browser\base\content\browser-box-inc-xhtml.patch` | shell window shell/tabs.html + shell/tabs.js (BrowserView tab strip) | `//zen/shell:window` |
| `G:\Zen\src\browser\base\content\browser-commands-js.patch` | shell/tabs.js + adapters (tabs/windows/observers) | `//zen/shell:tabs` |
| `G:\Zen\src\browser\base\content\browser-development-helpers-js.patch` | shell/tabs.js + adapters (tabs/windows/observers) | `//zen/shell:tabs` |
| `G:\Zen\src\browser\base\content\browser-fullScreenAndPointerLock-js.patch` | shell/tabs.js + adapters (tabs/windows/observers) | `//zen/shell:tabs` |
| `G:\Zen\src\browser\base\content\browser-gestureSupport-js.patch` | shell/tabs.js + adapters (tabs/windows/observers) | `//zen/shell:tabs` |
| `G:\Zen\src\browser\base\content\browser-init-js.patch` | shell/tabs.js + adapters (tabs/windows/observers) | `//zen/shell:tabs` |
| `G:\Zen\src\browser\base\content\browser-js.patch` | shell/tabs.js + adapters (tabs/windows/observers) | `//zen/shell:tabs` |
| `G:\Zen\src\browser\base\content\browser-pageActions-js.patch` | shell/tabs.js + adapters (tabs/windows/observers) | `//zen/shell:tabs` |
| `G:\Zen\src\browser\base\content\browser-places-js.patch` | shell/tabs.js + adapters (tabs/windows/observers) | `//zen/shell:tabs` |
| `G:\Zen\src\browser\base\content\browser-profiles-js.patch` | shell/tabs.js + adapters (tabs/windows/observers) | `//zen/shell:tabs` |
| `G:\Zen\src\browser\base\content\browser-sets-inc-xhtml.patch` | shell window shell/tabs.html + shell/tabs.js (BrowserView tab strip) | `//zen/shell:window` |
| `G:\Zen\src\browser\base\content\browser-sets-js.patch` | shell/tabs.js + adapters (tabs/windows/observers) | `//zen/shell:tabs` |
| `G:\Zen\src\browser\base\content\browser-siteIdentity-js.patch` | shell/tabs.js + adapters (tabs/windows/observers) | `//zen/shell:tabs` |
| `G:\Zen\src\browser\base\content\browser-xhtml.patch` | shell window shell/tabs.html + shell/tabs.js (BrowserView tab strip) | `//zen/shell:window` |
| `G:\Zen\src\browser\base\content\main-popupset-inc-xhtml.patch` | shell window shell/tabs.html + shell/tabs.js (BrowserView tab strip) | `//zen/shell:window` |
| `G:\Zen\src\browser\base\content\navigator-toolbox-inc-xhtml.patch` | shell window shell/tabs.html + shell/tabs.js (BrowserView tab strip) | `//zen/shell:window` |
| `G:\Zen\src\browser\base\content\navigator-toolbox-js.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\base\content\nsContextMenu-sys-mjs.patch` | chrome.contextMenus in shell/background.js | `//zen/shell:menus` |
| `G:\Zen\src\browser\base\jar-mn.patch` | GN build config (engine-chromium/BUILD.gn) | `//zen/shell:build` |
| `G:\Zen\src\browser\base\moz-build.patch` | GN build config (engine-chromium/BUILD.gn) | `//zen/shell:build` |
| `G:\Zen\src\browser\components\aboutlogins\content\aboutLogins-html.patch` | shell pages (shell/tabs.html routes) | `//zen/shell:pages` |
| `G:\Zen\src\browser\components\aboutwelcome\content\aboutwelcome-css.patch` | shell pages (shell/tabs.html routes) | `//zen/shell:pages` |
| `G:\Zen\src\browser\components\aiwindow\ui\modules\AIWindow-sys-mjs.patch` | shell pages (shell/tabs.html routes) | `//zen/shell:pages` |
| `G:\Zen\src\browser\components\asrouter\modules\FeatureCallout-sys-mjs.patch` | shell pages (shell/tabs.html routes) | `//zen/shell:pages` |
| `G:\Zen\src\browser\components\BrowserContentHandler-sys-mjs.patch` | adapters/windows.mjs + shell/background.js (chrome.windows) | `//zen/adapters:windows` |
| `G:\Zen\src\browser\components\BrowserGlue-sys-mjs.patch` | adapters/windows.mjs + shell/background.js (chrome.windows) | `//zen/adapters:windows` |
| `G:\Zen\src\browser\components\contextualidentity\content\ContainerCreationPanel-mjs.patch` | shell pages (shell/tabs.html routes) | `//zen/shell:pages` |
| `G:\Zen\src\browser\components\controlcenter\content\identityPanel-inc-xhtml.patch` | shell pages (shell/tabs.html routes) | `//zen/shell:pages` |
| `G:\Zen\src\browser\components\customizableui\content\panelUI-inc-xhtml.patch` | extension action/popup HTML (adapters/xul.mjs) | `//zen/shell:toolbar` |
| `G:\Zen\src\browser\components\customizableui\content\panelUI-js.patch` | extension action/popup HTML (adapters/xul.mjs) | `//zen/shell:toolbar` |
| `G:\Zen\src\browser\components\customizableui\CustomizableUI-sys-mjs.patch` | extension action/popup HTML (adapters/xul.mjs) | `//zen/shell:toolbar` |
| `G:\Zen\src\browser\components\customizableui\CustomizeMode-sys-mjs.patch` | extension action/popup HTML (adapters/xul.mjs) | `//zen/shell:toolbar` |
| `G:\Zen\src\browser\components\customizableui\ToolbarContextMenu-sys-mjs.patch` | extension action/popup HTML (adapters/xul.mjs) | `//zen/shell:toolbar` |
| `G:\Zen\src\browser\components\extensions\parent\ext-browser-js.patch` | extension action/popup HTML (adapters/xul.mjs) | `//zen/shell:toolbar` |
| `G:\Zen\src\browser\components\extensions\parent\ext-tabs-js.patch` | extension action/popup HTML (adapters/xul.mjs) | `//zen/shell:toolbar` |
| `G:\Zen\src\browser\components\places\content\bookmarkProperties-xhtml.patch` | chrome.bookmarks + chrome.history (adapters/session.mjs) | `//zen/adapters:session` |
| `G:\Zen\src\browser\components\places\content\browserPlacesViews-js.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\components\places\content\editBookmark-js.patch` | chrome.bookmarks + chrome.history (adapters/session.mjs) | `//zen/adapters:session` |
| `G:\Zen\src\browser\components\places\content\editBookmarkPanel-inc-xhtml.patch` | chrome.bookmarks + chrome.history (adapters/session.mjs) | `//zen/adapters:session` |
| `G:\Zen\src\browser\components\places\PlacesUIUtils-sys-mjs.patch` | chrome.bookmarks + chrome.history (adapters/session.mjs) | `//zen/adapters:session` |
| `G:\Zen\src\browser\components\preferences\config\account-sync-mjs.patch` | options page + chrome.storage (PrefService/policy) | `//zen/shell:options` |
| `G:\Zen\src\browser\components\preferences\config\aiFeatures-mjs.patch` | options page + chrome.storage (PrefService/policy) | `//zen/shell:options` |
| `G:\Zen\src\browser\components\preferences\dialogs\syncChooseWhatToSync-js.patch` | options page + chrome.storage (PrefService/policy) | `//zen/shell:options` |
| `G:\Zen\src\browser\components\preferences\dialogs\syncChooseWhatToSync-xhtml.patch` | options page + chrome.storage (PrefService/policy) | `//zen/shell:options` |
| `G:\Zen\src\browser\components\preferences\jar-mn.patch` | GN build config (engine-chromium/BUILD.gn) | `//zen/shell:build` |
| `G:\Zen\src\browser\components\preferences\main-inc-xhtml.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\components\preferences\main-js.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\components\preferences\preferences-js.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\components\preferences\preferences-xhtml.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\components\preferences\sync-inc-xhtml.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\components\preferences\widgets\sync-engine-list\sync-engines-list-mjs.patch` | options page + chrome.storage (PrefService/policy) | `//zen/shell:options` |
| `G:\Zen\src\browser\components\screenshots\overlay\overlay-css.patch` | chrome.tabs.captureVisibleTab | `//zen/shell:capture` |
| `G:\Zen\src\browser\components\search\SearchOneOffs-sys-mjs.patch` | chrome.search + omnibox provider (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\components\search\SearchUIUtils-sys-mjs.patch` | chrome.search + omnibox provider (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\components\sessionstore\SessionFile-sys-mjs.patch` | chrome.sessions + chrome.storage.session (adapters/session.mjs) | `//zen/adapters:session` |
| `G:\Zen\src\browser\components\sessionstore\SessionSaver-sys-mjs.patch` | chrome.sessions + chrome.storage.session (adapters/session.mjs) | `//zen/adapters:session` |
| `G:\Zen\src\browser\components\sessionstore\SessionStartup-sys-mjs.patch` | chrome.sessions + chrome.storage.session (adapters/session.mjs) | `//zen/adapters:session` |
| `G:\Zen\src\browser\components\sessionstore\SessionStore-sys-mjs.patch` | chrome.sessions + chrome.storage.session (adapters/session.mjs) | `//zen/adapters:session` |
| `G:\Zen\src\browser\components\sessionstore\TabGroupState-sys-mjs.patch` | chrome.sessions + chrome.storage.session (adapters/session.mjs) | `//zen/adapters:session` |
| `G:\Zen\src\browser\components\sessionstore\TabState-sys-mjs.patch` | chrome.sessions + chrome.storage.session (adapters/session.mjs) | `//zen/adapters:session` |
| `G:\Zen\src\browser\components\sessionstore\TabStateFlusher-sys-mjs.patch` | chrome.sessions + chrome.storage.session (adapters/session.mjs) | `//zen/adapters:session` |
| `G:\Zen\src\browser\components\sidebar\browser-sidebar-js.patch` | shell vertical tabs (shell/tabs.js) | `//zen/shell:tabs` |
| `G:\Zen\src\browser\components\tabbrowser\AsyncTabSwitcher-sys-mjs.patch` | chrome.tabs + chrome.tabGroups (adapters/tabs.mjs) | `//zen/adapters:tabs` |
| `G:\Zen\src\browser\components\tabbrowser\content\browser-ctrlTab-js.patch` | chrome.tabs + chrome.tabGroups (adapters/tabs.mjs) | `//zen/adapters:tabs` |
| `G:\Zen\src\browser\components\tabbrowser\content\drag-and-drop-js.patch` | chrome.tabs + chrome.tabGroups (adapters/tabs.mjs) | `//zen/adapters:tabs` |
| `G:\Zen\src\browser\components\tabbrowser\content\tab-context-menu-js.patch` | chrome.tabs + chrome.tabGroups (adapters/tabs.mjs) | `//zen/adapters:tabs` |
| `G:\Zen\src\browser\components\tabbrowser\content\tab-js.patch` | chrome.tabs + chrome.tabGroups (adapters/tabs.mjs) | `//zen/adapters:tabs` |
| `G:\Zen\src\browser\components\tabbrowser\content\tabbrowser-js.patch` | chrome.tabs + chrome.tabGroups (adapters/tabs.mjs) | `//zen/adapters:tabs` |
| `G:\Zen\src\browser\components\tabbrowser\content\tabgroup-js.patch` | chrome.tabs + chrome.tabGroups (adapters/tabs.mjs) | `//zen/adapters:tabs` |
| `G:\Zen\src\browser\components\tabbrowser\content\tabs-js.patch` | chrome.tabs + chrome.tabGroups (adapters/tabs.mjs) | `//zen/adapters:tabs` |
| `G:\Zen\src\browser\components\tabbrowser\TabsList-sys-mjs.patch` | chrome.tabs + chrome.tabGroups (adapters/tabs.mjs) | `//zen/adapters:tabs` |
| `G:\Zen\src\browser\components\tabbrowser\TabUnloader-sys-mjs.patch` | chrome.tabs + chrome.tabGroups (adapters/tabs.mjs) | `//zen/adapters:tabs` |
| `G:\Zen\src\browser\components\urlbar\content\enUS-searchFeatures-ftl.patch` | chrome.omnibox (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\components\urlbar\content\UrlbarChildController-mjs.patch` | chrome.omnibox (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\components\urlbar\content\UrlbarInput-mjs.patch` | chrome.omnibox (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\components\urlbar\content\UrlbarResult-mjs.patch` | chrome.omnibox (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\components\urlbar\content\UrlbarShared-mjs.patch` | chrome.omnibox (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\components\urlbar\content\UrlbarView-mjs.patch` | chrome.omnibox (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\components\urlbar\UrlbarMuxerStandard-sys-mjs.patch` | chrome.omnibox (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\components\urlbar\UrlbarPrefs-sys-mjs.patch` | chrome.omnibox (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\components\urlbar\UrlbarProviderHeuristicFallback-sys-mjs.patch` | chrome.omnibox (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\components\urlbar\UrlbarProvidersManager-sys-mjs.patch` | chrome.omnibox (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\components\urlbar\UrlbarUtils-sys-mjs.patch` | chrome.omnibox (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\components\urlbar\UrlbarValueFormatter-sys-mjs.patch` | chrome.omnibox (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\extensions\newtab\lib\ActivityStream-sys-mjs.patch` | newtab override shell/tabs.html | `//zen/shell:newtab` |
| `G:\Zen\src\browser\installer\package-manifest-in.patch` | GN build config (engine-chromium/BUILD.gn) | `//zen/shell:build` |
| `G:\Zen\src\browser\installer\windows\nsis\defines-nsi-in.patch` | GN build config (engine-chromium/BUILD.gn) | `//zen/shell:build` |
| `G:\Zen\src\browser\installer\windows\nsis\installer-nsi.patch` | GN build config (engine-chromium/BUILD.gn) | `//zen/shell:build` |
| `G:\Zen\src\browser\installer\windows\nsis\shared-nsh.patch` | GN build config (engine-chromium/BUILD.gn) | `//zen/shell:build` |
| `G:\Zen\src\browser\installer\windows\nsis\uninstaller-nsi.patch` | GN build config (engine-chromium/BUILD.gn) | `//zen/shell:build` |
| `G:\Zen\src\browser\locales\en-US\installer\custom-properties.patch` | GN build config (engine-chromium/BUILD.gn) | `//zen/shell:build` |
| `G:\Zen\src\browser\modules\BrowserDOMWindow-sys-mjs.patch` | adapters/windows.mjs + shell/background.js (chrome.windows) | `//zen/adapters:windows` |
| `G:\Zen\src\browser\modules\BrowserWindowTracker-sys-mjs.patch` | adapters/windows.mjs + shell/background.js (chrome.windows) | `//zen/adapters:windows` |
| `G:\Zen\src\browser\modules\ExtensionsUI-sys-mjs.patch` | adapters/windows.mjs + shell/background.js (chrome.windows) | `//zen/adapters:windows` |
| `G:\Zen\src\browser\modules\URILoadingHelper-sys-mjs.patch` | adapters/windows.mjs + shell/background.js (chrome.windows) | `//zen/adapters:windows` |
| `G:\Zen\src\browser\themes\linux\browser-css.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\themes\osx\browser-css.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\themes\shared\browser-shared-css.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\themes\shared\identity-block\identity-block-css.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\themes\shared\jar-inc-mn.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\themes\shared\places\organizer-shared-css.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\themes\shared\tabbrowser\content-area-css.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\themes\shared\tabbrowser\ctrlTab-css.patch` | chrome.tabs + chrome.tabGroups (adapters/tabs.mjs) | `//zen/adapters:tabs` |
| `G:\Zen\src\browser\themes\shared\tabbrowser\tabs-css.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\themes\shared\toolbarbuttons-css.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\browser\themes\shared\urlbar-searchbar-css.patch` | chrome.omnibox (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\themes\shared\urlbar\view-proton-css.patch` | chrome.omnibox (shell/background.js) | `//zen/shell:omnibox` |
| `G:\Zen\src\browser\themes\windows\browser-css.patch` | shell equivalent (see BUILD.gn target) | `//zen/shell:compat` |
| `G:\Zen\src\external-patches\firefox\allow_backdrop_to_work_on_transparency.patch` | shell CSS compat (shell/shell.css) | `//zen/shell:compat` |
| `G:\Zen\src\external-patches\firefox\bug_2011236.patch` | UA/policy compat (shell/background.js) | `//zen/shell:policy` |
| `G:\Zen\src\external-patches\firefox\css_corner_shape_rendering.patch` | shell CSS compat (shell/shell.css) | `//zen/shell:compat` |
| `G:\Zen\src\external-patches\firefox\expose_tiled_attribute_to_all_platforms.patch` | shell CSS compat (shell/shell.css) | `//zen/shell:compat` |
| `G:\Zen\src\external-patches\firefox\issue_14710.patch` | UA/policy compat (shell/background.js) | `//zen/shell:policy` |
| `G:\Zen\src\external-patches\firefox\issue_14990.patch` | UA/policy compat (shell/background.js) | `//zen/shell:policy` |
| `G:\Zen\src\external-patches\firefox\native_macos_popovers_fix.patch` | shell CSS compat (shell/shell.css) | `//zen/shell:compat` |
| `G:\Zen\src\external-patches\firefox\no_liquid_glass_icon.patch` | shell CSS compat (shell/shell.css) | `//zen/shell:compat` |
| `G:\Zen\src\external-patches\firefox\override_cert_checks_temp.patch` | enterprise policy (policy.json) | `//zen/shell:policy` |
| `G:\Zen\src\external-patches\librewolf\firefox-in-ua.patch` | UA/policy compat (shell/background.js) | `//zen/shell:policy` |
