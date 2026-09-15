/* Zen Chromium shell — workspaces via shared pure color utils. */
import {
  hslToRgb,
  blendColors,
  contrastRatio,
} from "../../src/zen/shared/zenColorUtils.mjs";
import { getStringPrefSync } from "../../src/zen/adapters/prefs.mjs";

export function workspaceAccent(rgb, isDark) {
  const [r, g, b] = rgb;
  if (isDark) {
    return `rgb(${r}, ${g}, ${b})`;
  }
  const blended = blendColors([r, g, b], [255, 255, 255], 60);
  return `rgb(${blended[0]}, ${blended[1]}, ${blended[2]})`;
}

export function workspaceTextOn(rgb) {
  const white = contrastRatio(rgb, [255, 255, 255]);
  const black = contrastRatio(rgb, [0, 0, 0]);
  return white > black ? "#ffffff" : "#000000";
}

export function currentWorkspaceId() {
  try {
    return getStringPrefSync("zen.workspaces.active", "default");
  } catch {
    return "default";
  }
}

// Demo: apply workspace accent to shell from pure utils (no engine deps).
try {
  const accent = workspaceAccent(hslToRgb(0.58, 0.7, 0.55), true);
  document.documentElement.style.setProperty("--zen-workspace-accent", accent);
} catch {}
