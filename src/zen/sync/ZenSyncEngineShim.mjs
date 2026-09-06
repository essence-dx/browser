/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class SyncStore {
  async getAllIDs() {
    return [];
  }
  async itemExists() {
    return false;
  }
  async createRecord(id) {
    return { id, deleted: true };
  }
  async applyIncomingBatch() {
    return [];
  }
  async wipe() {}
  async changeItemID() {}
}

class SyncTracker {
  constructor() {
    this.score = 0;
    this._ignoreAll = false;
  }
  get ignoreAll() {
    return this._ignoreAll;
  }
  set ignoreAll(value) {
    this._ignoreAll = value;
  }
}

class SyncEngine {
  constructor(name) {
    this.name = name;
    this._modified = new Set();
  }
  get _storeObj() {
    return null;
  }
  get _trackerObj() {
    return null;
  }
  get _recordObj() {
    return null;
  }
}

class SyncRecord {
  constructor(collection, id) {
    this.collection = collection;
    this.id = id;
    this.deleted = false;
    this.cleartext = null;
  }
}

const SCORE_INCREMENT_XLARGE = 100;

export { SyncStore as Store, SyncEngine, SyncTracker as Tracker, SyncRecord as CryptoWrapper, SCORE_INCREMENT_XLARGE };
