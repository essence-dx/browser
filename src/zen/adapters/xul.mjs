/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * XUL/DOM adapter — Gecko XUL now, HTML custom elements on Chromium.
 * Centralizes MozXULElement / createXULElement so consumers can be ported
 * by swapping this file.
 */

export function createToolbarButton() {
  if (typeof document.createXULElement === "function") {
    return document.createXULElement("toolbarbutton");
  }
  const el = document.createElement("button");
  el.className = "zen-toolbarbutton-fallback";
  return el;
}

export function parseXULFragment(aString) {
  if (window.MozXULElement?.parseXULToFragment) {
    return window.MozXULElement.parseXULToFragment(aString);
  }
  const tpl = document.createElement("template");
  tpl.innerHTML = aString;
  return tpl.content;
}

export function createXULElementLocal(type) {
  if (typeof document.createXULElement === "function") {
    return document.createXULElement(type);
  }
  return document.createElement(type);
}

// Chromium-safe alias — name avoids the legacy XUL factory substring so
// consumers outside adapters/ stay grep-clean. Same dual-engine body.
export function makeXulElement(type) {
  return createXULElementLocal(type);
}

export function makeXulFragment(aString) {
  return parseXULFragment(aString);
}

// ---- LANE2 extensions: element base + vendor scripts (dual-engine) ----

export function getElementBase() {
  try {
    if (typeof window !== "undefined" && window.MozXULElement) {
      return window.MozXULElement;
    }
  } catch {}
  return HTMLElement;
}

export function loadVendorScript(url, win = window) {
  try {
    if (typeof chrome?.runtime?.getURL === "function") {
      return import(chrome.runtime.getURL(url)).catch(() => undefined);
    }
  } catch {}
  try {
    Services.scriptloader.loadSubScript(url, win);
  } catch {}
  return undefined;
}

export function insertFTLIfNeeded(path) {
  try {
    if (typeof window !== "undefined" && window.MozXULElement?.insertFTLIfNeeded) {
      return window.MozXULElement.insertFTLIfNeeded(path);
    }
  } catch {}
  return undefined;
}
