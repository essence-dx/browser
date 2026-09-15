#!/usr/bin/env bash
# Chromium lane bootstrap — fetch, sync, overlay, build.
#
# This is the real thing, not a scaffold: it produces a working `chrome.exe`
# with the //zen layer linked in. It is gated behind preflight.sh because a
# full disk mid-fetch takes the machine down, not just the build.
#
# Usage:  bash engine-chromium/bootstrap.sh
#
# Env:
#   CHROMIUM_ROOT   where the checkout lives (default: G:/chromium)
#   ZEN_OUT         GN output dir name      (default: out/Zen)
#   ZEN_JOBS        ninja parallelism       (default: core count)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CHROMIUM_ROOT="${CHROMIUM_ROOT:-/g/chromium}"
ZEN_OUT="${ZEN_OUT:-out/Zen}"
DEPOT_TOOLS_DIR="${DEPOT_TOOLS_DIR:-/g/depot_tools}"
SRC="$CHROMIUM_ROOT/src"

step() { printf '\n==> %s\n' "$1"; }
die()  { printf 'ERROR: %s\n' "$1" >&2; exit 1; }

# --- Gate: do not start a 30 GB fetch we cannot finish -----------------------
step "Preflight gate"
bash "$SCRIPT_DIR/preflight.sh" || die "preflight failed — fix the FAIL lines, then re-run.
Nothing has been downloaded or modified."

# --- depot_tools -------------------------------------------------------------
step "depot_tools"
if command -v gclient >/dev/null 2>&1; then
  echo "already on PATH: $(command -v gclient)"
elif [ -d "$DEPOT_TOOLS_DIR" ]; then
  export PATH="$DEPOT_TOOLS_DIR:$PATH"
  echo "using existing $DEPOT_TOOLS_DIR"
else
  echo "installing to $DEPOT_TOOLS_DIR (~1 GB)"
  mkdir -p "$(dirname "$DEPOT_TOOLS_DIR")"
  curl -L --fail -o /tmp/depot_tools.zip \
    https://storage.googleapis.com/chrome-infra/depot_tools.zip \
    || die "could not download depot_tools"
  mkdir -p "$DEPOT_TOOLS_DIR"
  unzip -q -o /tmp/depot_tools.zip -d "$DEPOT_TOOLS_DIR" || die "could not unzip depot_tools"
  rm -f /tmp/depot_tools.zip
  export PATH="$DEPOT_TOOLS_DIR:$PATH"
fi

export DEPOT_TOOLS_WIN_TOOLCHAIN=0   # use the locally installed VS, not Google's
command -v gclient >/dev/null 2>&1 || die "gclient still not on PATH"

# --- fetch chromium ----------------------------------------------------------
step "fetch chromium"
mkdir -p "$CHROMIUM_ROOT"
cd "$CHROMIUM_ROOT"
if [ -d "$SRC/.git" ]; then
  echo "checkout already present at $SRC"
else
  # --no-history: drops the git history, ~55 GB -> ~28 GB. Zen does not need
  # upstream history to build a layer on top of the tree.
  fetch --no-history chromium || die "fetch failed"
fi

# --- gclient sync ------------------------------------------------------------
step "gclient sync"
cd "$SRC"
# Third-party deps. This is the second large download.
gclient sync --no-history --shallow || die "gclient sync failed"

# --- overlay: drop the //zen layer into the tree -----------------------------
step "overlay //zen into the checkout"
[ -f "$SCRIPT_DIR/BUILD.gn" ] || die "engine-chromium/BUILD.gn missing"
mkdir -p "$SRC/zen"
cp -f "$SCRIPT_DIR/BUILD.gn" "$SRC/zen/BUILD.gn"
cp -rf "$SCRIPT_DIR/zen/." "$SRC/zen/"
echo "copied BUILD.gn + zen/ sources -> $SRC/zen/"

# --- gn gen ------------------------------------------------------------------
step "gn gen ($ZEN_OUT)"
cd "$SRC"
mkdir -p "$ZEN_OUT"
cp -f "$SCRIPT_DIR/args.gn" "$ZEN_OUT/args.gn"
gn gen "$ZEN_OUT" || die "gn gen failed — check $ZEN_OUT/args.gn"

# --- build -------------------------------------------------------------------
step "autoninja -C $ZEN_OUT chrome"
JOBS="${ZEN_JOBS:-$(nproc 2>/dev/null || echo 8)}"
echo "parallelism: $JOBS  (this takes hours on a cold tree)"
autoninja -C "$ZEN_OUT" -j "$JOBS" chrome || die "build failed"

# --- report ------------------------------------------------------------------
step "Done"
BIN="$SRC/$ZEN_OUT/chrome.exe"
if [ -f "$BIN" ]; then
  echo "binary: $BIN"
  ls -lh "$BIN"
  echo
  echo "Run it with:  $BIN --user-data-dir=\$(mktemp -d)"
else
  die "build reported success but $BIN is missing"
fi
