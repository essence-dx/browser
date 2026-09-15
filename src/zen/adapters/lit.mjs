/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Lit shim — Gecko vendor lit now, npm lit on Chromium.
 * Consumers import { html } and base element from here instead of
 * Gecko vendor URLs, so the build stays grep-clean on both engines.
 */

let _html = null;
try {
  const lit = await import("lit").catch(() => null);
  _html = lit?.html ?? null;
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
