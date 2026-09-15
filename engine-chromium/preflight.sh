#!/usr/bin/env bash
# Chromium lane preflight — decides whether a real Chromium build is possible here.
# Read-only: inspects the machine, writes nothing, changes nothing.
#
# Usage:  bash engine-chromium/preflight.sh
# Exit:   0 = all gates pass, safe to run bootstrap.sh
#         1 = one or more hard gates fail, do NOT start the fetch

set -uo pipefail

# --- Chromium (Windows, x64) real-world requirements -------------------------
# Source checkout:  ~28 GB with --no-history, ~55 GB with full history
# Build output:     ~40 GB (release), ~90 GB (debug)
# Toolchain/SDK:    ~10 GB
# Recommended headroom so the build does not fill the system drive.
REQ_CHECKOUT_GB=28
REQ_OUTPUT_GB=40
REQ_TOOLCHAIN_GB=10
REQ_MIN_GB=$((REQ_CHECKOUT_GB + REQ_OUTPUT_GB + REQ_TOOLCHAIN_GB))   # 78
REQ_SAFE_GB=$((REQ_MIN_GB + 20))                                    # 98

pass=0; fail=0
ok()   { printf '  [ OK ]   %s\n' "$1"; pass=$((pass+1)); }
bad()  { printf '  [ FAIL ] %s\n' "$1"; fail=$((fail+1)); }
warn() { printf '  [ WARN ] %s\n' "$1"; }

echo "=============================================================="
echo " Chromium lane preflight"
echo "=============================================================="

# --- 1. Disk: the gate that actually decides this ----------------------------
echo
echo "1. Disk space (need >= ${REQ_MIN_GB} GB free, ${REQ_SAFE_GB} GB recommended)"
echo "--------------------------------------------------------------"
total_free=0
largest_free=0
largest_drive=""
while read -r drive avail_kb; do
  gb=$((avail_kb / 1024 / 1024))
  printf '  %-4s %6s GB free\n' "$drive" "$gb"
  total_free=$((total_free + gb))
  if [ "$gb" -gt "$largest_free" ]; then largest_free=$gb; largest_drive="$drive"; fi
done < <(df -Pk 2>/dev/null | awk 'NR>1 && $1 ~ /^[A-Za-z]:/ {print $1, $4}')

echo "  ------------------------------------------------------------"
printf '  largest single drive : %s (%s GB)\n' "$largest_drive" "$largest_free"
printf '  total across drives  : %s GB\n' "$total_free"
echo

# A build must live on ONE drive — you cannot span a checkout across volumes.
if [ "$largest_free" -ge "$REQ_SAFE_GB" ]; then
  ok "largest drive has ${largest_free} GB (>= ${REQ_SAFE_GB} GB)"
elif [ "$largest_free" -ge "$REQ_MIN_GB" ]; then
  warn "largest drive has ${largest_free} GB — above minimum, below recommended"
  warn "build will be tight; consider --no-history and a release-only out dir"
else
  bad "largest drive has ${largest_free} GB, need >= ${REQ_MIN_GB} GB on one volume"
  printf '           shortfall: %s GB\n' "$((REQ_MIN_GB - largest_free))"
fi

# --- 2. depot_tools ----------------------------------------------------------
echo
echo "2. depot_tools (fetch / gclient / gn / autoninja)"
echo "--------------------------------------------------------------"
if command -v gclient >/dev/null 2>&1 && command -v fetch >/dev/null 2>&1; then
  ok "depot_tools on PATH ($(command -v gclient))"
elif [ -d "$HOME/depot_tools" ] || [ -d "/c/depot_tools" ] || [ -d "/g/depot_tools" ]; then
  warn "depot_tools directory found but not on PATH"
else
  bad "depot_tools not installed"
  echo "           bootstrap.sh installs it; needs ~1 GB and network access"
fi

# --- 3. Compiler -------------------------------------------------------------
echo
echo "3. MSVC toolchain (cl.exe, x64)"
echo "--------------------------------------------------------------"
VSWHERE="/c/Program Files (x86)/Microsoft Visual Studio/Installer/vswhere.exe"
if [ -x "$VSWHERE" ]; then
  vs_path=$("$VSWHERE" -latest -products '*' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath 2>/dev/null | tr -d '\r')
  if [ -n "$vs_path" ]; then
    ok "VS with C++ tools: $vs_path"
    if find "$vs_path/VC/Tools/MSVC" -name cl.exe -path '*x64*' -print -quit 2>/dev/null | grep -q .; then
      ok "cl.exe present"
    else
      bad "cl.exe not found under $vs_path/VC/Tools/MSVC"
    fi
  else
    bad "no VS install with the 'Desktop development with C++' workload"
  fi
else
  bad "vswhere.exe not found — Visual Studio not detected"
fi

# --- 4. Windows SDK ----------------------------------------------------------
echo
echo "4. Windows SDK (10.0.22621 or newer)"
echo "--------------------------------------------------------------"
sdk_root="/c/Program Files (x86)/Windows Kits/10/Include"
if [ -d "$sdk_root" ]; then
  newest=$(ls "$sdk_root" 2>/dev/null | grep -E '^10\.' | sort -V | tail -1)
  if [ -n "$newest" ]; then
    if [ "$(printf '%s\n10.0.22621\n' "$newest" | sort -V | head -1)" = "10.0.22621" ]; then
      ok "SDK $newest"
    else
      bad "SDK $newest is older than 10.0.22621"
    fi
  else
    bad "no 10.x SDK found under $sdk_root"
  fi
else
  bad "Windows SDK not installed ($sdk_root missing)"
fi

# --- 5. Python ---------------------------------------------------------------
echo
echo "5. Python 3"
echo "--------------------------------------------------------------"
if command -v python3 >/dev/null 2>&1; then
  ok "python3 $(python3 --version 2>&1 | awk '{print $2}')"
elif command -v python >/dev/null 2>&1; then
  ok "python $(python --version 2>&1 | awk '{print $2}')"
else
  bad "python3 not found"
fi

# --- 6. CPU / RAM ------------------------------------------------------------
echo
echo "6. CPU and RAM"
echo "--------------------------------------------------------------"
cores=$(nproc 2>/dev/null || echo 0)
if [ "$cores" -ge 8 ]; then ok "${cores} cores"
elif [ "$cores" -ge 4 ]; then warn "${cores} cores — build will be slow"
else bad "${cores} cores"; fi

# Read RAM from the MSYS /proc/meminfo view. Deliberately avoids wmic.exe, which
# is on the host's program blacklist and would abort the script.
ram_gb=""
if [ -r /proc/meminfo ]; then
  ram_kb=$(awk '/^MemTotal:/ {print $2}' /proc/meminfo 2>/dev/null)
  [ -n "$ram_kb" ] && ram_gb=$((ram_kb / 1024 / 1024))
fi
if [ -n "$ram_gb" ]; then
  if [ "$ram_gb" -ge 16 ]; then ok "${ram_gb} GB RAM"
  elif [ "$ram_gb" -ge 8 ]; then warn "${ram_gb} GB RAM — 16 GB recommended"
  else bad "${ram_gb} GB RAM"; fi
else
  warn "RAM not readable on this host — check manually (16 GB recommended)"
fi

# --- Verdict -----------------------------------------------------------------
echo
echo "=============================================================="
printf ' RESULT: %s passed, %s failed\n' "$pass" "$fail"
echo "=============================================================="
if [ "$fail" -eq 0 ]; then
  echo " All hard gates pass. Safe to run: bash engine-chromium/bootstrap.sh"
  exit 0
fi
echo " Hard gates failed. Do NOT run bootstrap.sh — fix the FAIL lines first."
echo " The fetch is not resumable across a full disk: filling the system drive"
echo " will take the machine down with it, not just the build."
exit 1
