/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Observers adapter — Gecko now, Chromium later.
 * Gecko: wraps Services.obs. Chromium: wraps chrome.events / custom EventTarget.
 * Consumers import from here instead of touching Services.obs directly, so the
 * migration is a one-file swap.
 */

export function addObserver(observer, topic) {
  return Services.obs.addObserver(observer, topic);
}

export function removeObserver(observer, topic) {
  try {
    return Services.obs.removeObserver(observer, topic);
  } catch {
    return undefined;
  }
}

export function notifyObservers(subject, topic, data) {
  return Services.obs.notifyObservers(subject, topic, data);
}

// Chromium stubs — wire when engine === "chromium":
// const _bus = new EventTarget();
// export function addObserver(observer, topic) { const fn = e => observer.observe?.(e.detail.subject, topic, e.detail.data); fn._topic = topic; _bus.addEventListener(topic, fn); return fn; }
// export function removeObserver(observer, topic) { return undefined; }
// export function notifyObservers(subject, topic, data) { _bus.dispatchEvent(new CustomEvent(topic, { detail: { subject, data } })); }
