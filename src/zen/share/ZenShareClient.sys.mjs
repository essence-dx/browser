// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { importGeckoModule } from "../adapters/gre.mjs";
import {
  getStringPrefSync,
} from "../adapters/prefs.mjs";
// Chromium: prefs via adapters; schema validation + API key via engine
// modules when present (Gecko), graceful fallback on Chromium.

const MOZ_SRC = "moz-src:" + "///";
const RESOURCE = "resource:" + "///";

const lazy = {
  JsonSchema: importGeckoModule(RESOURCE + "gre/modules/JsonSchema.sys.mjs"),
};

const _gBaseUrlTransform = value => value.trim().replace(/\/+$/, "");
const lazyPrefs = {
  get gBaseUrl() {
    return _gBaseUrlTransform(
      getStringPrefSync("zen.share.base-url", "")
    );
  },
  get gSecretKey() {
    return getStringPrefSync("zen.share.secret-key", "");
  },
};

// The schema ships next to this module; module-relative so fetch resolves
// on both engines (document-relative would 404).
const SCHEMA_URL = new URL("./share.schema.json", import.meta.url).href;

// The server rejects bigger bodies at 25 MiB.
const MAX_SHARE_BYTES = 25 * 1024 * 1024;
const MAX_NAME_LENGTH = 200;

// Uploads can be tens of MiB, reads are small JSON.
const CREATE_TIMEOUT_MS = 120000;
const READ_TIMEOUT_MS = 30000;

// Public share page paths: /{slug}/{XXXX-XXXX-XXXX-XXXX id}.
const SHARE_PATH_RE =
  /^\/(space|folder|split-view|split)\/([0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4})\/?$/;

export class ZenShareError extends Error {
  /**
   * @param {string} code - One of "invalid-document", "auth", "too-large",
   *      "rate-limited", "not-found", "network", "server".
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = "ZenShareError";
    this.code = code;
  }
}

// Build-time Mozilla API key (share auth without a secret key). Gecko-only
// module; empty elsewhere (secret-key auth still works).
let _mozApiKeyPromise = null;
function mozApiKey() {
  if (!_mozApiKeyPromise) {
    _mozApiKeyPromise = (async () => {
      try {
        const m = await import(
          "resource:" + "///gre/modules/AppConstants.sys.mjs"
        ).catch(() => null);
        return m?.AppConstants?.MOZ_MOZILLA_API_KEY ?? "";
      } catch {
        return "";
      }
    })();
  }
  return _mozApiKeyPromise;
}

class nsZenShareClient {
  #validatorPromise = null;

  get #baseUrl() {
    return lazyPrefs.gBaseUrl;
  }

  async #authHeaders() {
    // A secret key authorizes on its own and makes the share permanent. Never
    // send both keys.
    if (lazyPrefs.gSecretKey) {
      return { "x-secret-key": lazyPrefs.gSecretKey };
    }
    return { "x-api-key": (await mozApiKey()) ?? "" };
  }

  #getValidator() {
    if (!this.#validatorPromise) {
      this.#validatorPromise = fetch(SCHEMA_URL, { credentials: "omit" })
        .then(response => response.json())
        .then(schema => {
          if (!lazy.JsonSchema) {
            // Chromium: no schema engine yet; ingest proceeds unvalidated
            // (shell work: validate here before import).
            console.warn("ZenShare: skipping document validation (no engine)");
            return null;
          }
          return new lazy.JsonSchema.Validator(schema);
        });
    }
    return this.#validatorPromise;
  }

  /**
   * Validates a share document against the schema.
   *
   * @param {object} doc
   * @returns {Promise<{valid: boolean, errors: object[]}>}
   */
  async validateDocument(doc) {
    const validator = await this.#getValidator();
    if (!validator) {
      return { valid: true, errors: [] };
    }
    return validator.validate(doc);
  }

  async #assertValidDocument(doc) {
    const result = await this.validateDocument(doc);
    if (!result.valid) {
      console.error("ZenShare: document fails the schema", result.errors);
      throw new ZenShareError(
        "invalid-document",
        "share document fails the schema"
      );
    }
  }

  async #request(url, options, timeoutMs = READ_TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetch(url, {
        credentials: "omit",
        signal: controller.signal,
        ...options,
      });
    } catch (e) {
      throw new ZenShareError(
        "network",
        `could not reach ${url}: ${e.message}`
      );
    } finally {
      clearTimeout(timer);
    }
    if (response.ok) {
      return response;
    }
    let message = `${response.status}`;
    try {
      message = (await response.json()).error || message;
    } catch (e) {}
    switch (response.status) {
      case 401:
      case 403:
        throw new ZenShareError("auth", message);
      case 404:
        throw new ZenShareError("not-found", message);
      case 413:
        throw new ZenShareError("too-large", message);
      case 429:
        throw new ZenShareError("rate-limited", message);
      case 400:
      case 422:
        throw new ZenShareError("invalid-document", message);
      default:
        throw new ZenShareError("server", message);
    }
  }

  /**
   * Uploads a share document.
   *
   * @param {object} doc - A document conforming to share.schema.json.
   * @param {{name?: string}} options - Optional sharer display name, shown on
   *   the share page as "A Space from {name}".
   * @returns {Promise<object>} The create response, plus `link`: the absolute
   *   public page URL to hand to the user.
   */
  async createShare(doc, { name } = {}) {
    const base = this.#baseUrl;
    const headers = await this.#authHeaders();
    await this.#assertValidDocument(doc);
    const body = JSON.stringify(doc);
    if (new TextEncoder().encode(body).length > MAX_SHARE_BYTES) {
      throw new ZenShareError("too-large", "share document is over 25 MiB");
    }
    let url = `${base}/api/shares`;
    if (name) {
      url += `?name=${encodeURIComponent(name.slice(0, MAX_NAME_LENGTH))}`;
    }
    const response = await this.#request(
      url,
      {
        method: "POST",
        headers: { ...headers, "content-type": "application/json" },
        body,
      },
      CREATE_TIMEOUT_MS
    );
    const created = await response.json();
    return { ...created, link: base + created.webUrl };
  }

  /**
   * Recognizes public share page URLs on the configured server.
   *
   * @param {string} spec
   * @returns {?{type: string, id: string}} null when the URL is not a share
   *   page (or no server is configured).
   */
  parseShareUrl(spec) {
    let uri;
    let baseUri;
    try {
      uri = new URL(spec);
      baseUri = new URL(this.#baseUrl);
    } catch (e) {
      return null;
    }
    if (uri.origin !== baseUri.origin) {
      return null;
    }
    const match = uri.pathname.match(SHARE_PATH_RE);
    if (!match) {
      return null;
    }
    const slug = match[1];
    const type = slug === "split" ? "split-view" : slug;
    return { type, id: match[2].toUpperCase() };
  }

  /**
   * Fetches everything needed to preview and import a share: the validated
   * document, plus the sharer's display name.
   *
   * @param {{id: string}} share - As returned by parseShareUrl.
   * @returns {Promise<{doc: object, name: ?string}>}
   */
  async fetchSharePreview(share) {
    const meta = await this.getShare(share.id);
    await this.#assertValidDocument(meta.data);
    return { doc: meta.data, name: meta.name || null };
  }

  /**
   * Fetches a share with its metadata (authed):
   * { id, name, createdAt, expiresAt, size, data }.
   *
   * @param {string} id
   */
  async getShare(id) {
    const response = await this.#request(`${this.#baseUrl}/api/shares/${id}`, {
      headers: this.#authHeaders(),
    });
    return response.json();
  }
}

export const ZenShareClient = new nsZenShareClient();
