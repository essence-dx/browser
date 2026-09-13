/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Integration of workspace-specific bookmarks into the bookmark store.
// Dual-engine: in-memory map now, chrome.storage-based persistence on Chromium.
window.ZenWorkspaceBookmarksStorage = {
  lazy: {},
  _byGuid: new Map(),
  _changes: new Map(),
  _lastChange: 0,

  async init() {
    this.promiseInitialized = new Promise(resolve => {
      this._resolveInitialized = resolve;
    });
    await this._ensureTable();
  },

  async _ensureTable() {
    try {
      const store = globalThis?.chrome?.storage?.local ?? null;
      if (store) {
        const saved = await store.get("zenBookmarkSpaces");
        const data = saved?.zenBookmarkSpaces;
        if (data) {
          this._byGuid = new Map(Object.entries(data.byGuid ?? {}));
          this._changes = new Map(Object.entries(data.changes ?? {}));
          this._lastChange = data.lastChange ?? 0;
        }
      }
    } catch {}
    this._resolveInitialized();
    delete this._resolveInitialized;
  },

  async _persist() {
    try {
      const store = globalThis?.chrome?.storage?.local ?? null;
      if (store) {
        await store.set({
          zenBookmarkSpaces: {
            byGuid: Object.fromEntries(this._byGuid),
            changes: Object.fromEntries(this._changes),
            lastChange: this._lastChange,
          },
        });
      }
    } catch {}
  },

  /**
   * Updates the last change timestamp in the metadata table.
   *
   * @param {object} db - Unused, kept for call-site compatibility.
   */
  async updateLastChangeTimestamp(db) {
    const now = Date.now();
    await this.promiseInitialized;
    this._lastChange = now;
    await this._persist();
  },

  /**
   * Gets the timestamp of the last change.
   *
   * @returns {Promise<number>} The timestamp of the last change.
   */
  async getLastChangeTimestamp() {
    await this.promiseInitialized;
    return this._lastChange;
  },

  async getBookmarkWorkspaces(bookmarkGuid) {
    await this.promiseInitialized;
    try {
      const entry = this._byGuid.get(bookmarkGuid);
      return entry ? [...entry] : [];
    } catch (e) {
      console.error("Error fetching bookmark workspaces:", e);
      return [];
    }
  },

  /**
   * Get all bookmark GUIDs organized by workspace UUID.
   *
   * @returns {Promise<object>} A dictionary with workspace UUIDs as keys and arrays of bookmark GUIDs as values.
   * @example
   * // Returns:
   * {
   *   "workspace-uuid-1": ["bookmark-guid-1", "bookmark-guid-2"],
   *   "workspace-uuid-2": ["bookmark-guid-3"]
   * }
   */
  async getBookmarkGuidsByWorkspace() {
    await this.promiseInitialized;
    const result = {};
    for (const [guid, spaces] of this._byGuid) {
      for (const space of spaces) {
        (result[space] ??= []).push(guid);
      }
    }
    return result;
  },

  /**
   * Get all changed bookmarks with their change types.
   *
   * @returns {Promise<object>} An object mapping bookmark+workspace pairs to their change data.
   */
  async getChangedIDs() {
    await this.promiseInitialized;
    const changes = {};
    for (const [key, value] of this._changes) {
      changes[key] = value;
    }
    return changes;
  },

  /**
   * Clear all recorded changes.
   */
  async clearChangedIDs() {
    await this.promiseInitialized;
    this._changes.clear();
    await this._persist();
  },
};

ZenWorkspaceBookmarksStorage.init();
