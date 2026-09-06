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
