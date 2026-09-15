/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global Services */

/**
 * Observers adapter — Gecko now, Chromium later.
 * Gecko: wraps Services.obs. Chromium: wraps chrome.events / custom EventTarget.
 * Consumers import from here instead of touching Services.obs directly, so the
 * migration is a one-file swap.
 */

const _bus =
  typeof EventTarget === "function" ? new EventTarget() : null;

function _chromiumAvailable() {
  return (
    _bus &&
    (typeof Services === "undefined" || typeof Services?.obs === "undefined")
  );
}

export function addObserver(observer, topic) {
  if (_chromiumAvailable()) {
    const fn = e => observer?.observe?.(e.detail.subject, topic, e.detail.data);
    fn._zenTopic = topic;
    fn._zenObserver = observer;
    _bus.addEventListener(topic, fn);
    return fn;
  }
  return Services.obs.addObserver(observer, topic);
}

export function removeObserver(observer, topic) {
  if (_chromiumAvailable()) {
    return undefined;
  }
  try {
    return Services.obs.removeObserver(observer, topic);
  } catch {
    return undefined;
  }
}

export function notifyObservers(subject, topic, data) {
  if (_chromiumAvailable()) {
    _bus.dispatchEvent(new CustomEvent(topic, { detail: { subject, data } }));
    return undefined;
  }
  return Services.obs.notifyObservers(subject, topic, data);
}
