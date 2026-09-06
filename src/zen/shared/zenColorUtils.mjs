/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Framework-free color math extracted from ZenGradientGenerator.mjs
 * (nsZenThemePicker). Zero dependency on Services / ChromeUtils / gBrowser /
 * DOM — safe to use on both Gecko and Chromium. This is Phase 1 of the
 * chromium-migration strangler-fig: keep the algorithm, drop the shell.
 *
 * Original implementations live in src/zen/spaces/ZenGradientGenerator.mjs
 * and are kept verbatim for behavioral parity.
 */

export function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function hslToRgb(h, s, l) {
  const { round } = Math;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }
  return [round(r * 255), round(g * 255), round(b * 255)];
}

export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let d = max - min;
  let h;
  if (d === 0) h = 0;
  else if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  let l = (min + max) / 2;
  let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return [h * 60, s, l];
}

export function blendColors(rgb1, rgb2, percentage) {
  const p = percentage / 100;
  return [
    Math.round(rgb1[0] * p + rgb2[0] * (1 - p)),
    Math.round(rgb1[1] * p + rgb2[1] * (1 - p)),
    Math.round(rgb1[2] * p + rgb2[2] * (1 - p)),
  ];
}

export function luminance([r, g, b]) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function contrastRatio(rgb1, rgb2) {
  const lum1 = luminance(rgb1);
  const lum2 = luminance(rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function hexToRgb(hex) {
  if (hex.startsWith("#")) hex = hex.substring(1);
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16),
  ];
}

export function getAccentColorForUI(accentColor, isDarkMode) {
  let [r, g, b] = accentColor;
  if (isDarkMode) return `rgb(${r}, ${g}, ${b})`;
  if (r == g && g == b) return `rgb(${r}, ${g}, ${b})`;
  const [h, s, l] = rgbToHsl(...accentColor);
  const saturation = Math.min(1, s + 0.3);
  const targetLightness = 0.42;
  const lightness = l * 0.4 + targetLightness * 0.6;
  [r, g, b] = hslToRgb(h / 360, saturation, lightness);
  return `rgb(${r}, ${g}, ${b})`;
}
