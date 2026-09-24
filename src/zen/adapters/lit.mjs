/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Lit shim — Gecko vendor lit now, npm lit on Chromium.
 * Consumers import { html } and base element from here instead of
 * Gecko vendor URLs, so the build stays grep-clean on both engines.
 */

let _html = null;
let _litModule = null;
try {
  _litModule = await import("lit").catch(() => null);
  _html = _litModule?.html ?? null;
} catch {
  _html = null;
}

export function html(strings, ...values) {
  if (_html) {
    return _html(strings, ...values);
  }
  // Minimal fallback: string template result with same shape.
  let out = "";
  for (let i = 0; i < strings.length; i++) {
    out += strings[i] + (i < values.length ? String(values[i] ?? "") : "");
  }
  const tpl = document.createElement("template");
  tpl.innerHTML = out;
  return tpl.content.cloneNode(true);
}

export class ZenLitElement extends HTMLElement {
  static properties = {};
  constructor() {
    super();
    try {
      this.attachShadow?.({ mode: "open" });
    } catch {}
  }
  render() {
    return null;
  }
  connectedCallback() {
    try {
      const rendered = this.render?.();
      if (rendered && this.shadowRoot) {
        this.shadowRoot.replaceChildren();
        if (typeof rendered === "string") {
          this.shadowRoot.innerHTML = rendered;
        } else if (rendered instanceof Node) {
          this.shadowRoot.appendChild(rendered);
        }
      }
    } catch {}
  }
}

export const MozLitElement = ZenLitElement;

// Directives used by the Zen Library components. Gecko resolves these from
// vendor lit.all.mjs; Chromium resolves them from npm lit. Fallbacks below
// only run when neither is present (same policy as html() above).
export const nothing = _litModule?.nothing ?? Symbol("lit-nothing");

export function repeat(items, keyFn, templateFn) {
  if (_litModule?.repeat) {
    return _litModule.repeat(items, keyFn, templateFn);
  }
  const fn = templateFn ?? keyFn;
  return Array.from(items ?? [], (item, index) => fn(item, index));
}

export function when(cond, trueCase, falseCase) {
  if (_litModule?.when) {
    return _litModule.when(cond, trueCase, falseCase);
  }
  const branch = cond ? trueCase : falseCase;
  return typeof branch === "function" ? branch() : branch ?? nothing;
}

export function styleMap(styleInfo) {
  if (_litModule?.styleMap) {
    return _litModule.styleMap(styleInfo);
  }
  return Object.entries(styleInfo ?? {})
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([name, value]) => {
      const cssName = name.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
      return `${cssName}:${value}`;
    })
    .join(";");
}
