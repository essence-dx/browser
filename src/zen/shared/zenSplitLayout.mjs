/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Framework-free split-view layout tree.
 * Extracted from src/zen/split-view/ZenViewSplitter.mjs (nsZenViewSplitter,
 * nsSplitNode, nsSplitLeafNode). The original code is entangled with gBrowser,
 * MozXULElement, PageThumbs, etc.; this file keeps only the pure layout math
 * so it can run under either Gecko or Chromium.
 *
 * Data model: each leaf holds a tab identity (any opaque value); each branch
 * holds direction + children. Percentages are relative to parent.
 */

export class ZenSplitLeafNode {
  sizeInParent;
  positionToRoot;
  parent;
  constructor(tab, sizeInParent) {
    this.tab = tab;
    this.sizeInParent = sizeInParent;
  }
  get heightInParent() {
    return this.parent?.direction === "column" ? this.sizeInParent : 100;
  }
  get widthInParent() {
    return this.parent?.direction === "row" ? this.sizeInParent : 100;
  }
}

export class ZenSplitNode extends ZenSplitLeafNode {
  direction;
  _children = [];
  constructor(direction, sizeInParent) {
    super(null, sizeInParent);
    this.sizeInParent = sizeInParent;
    this.direction = direction;
  }
  set children(children) {
    if (children) children.forEach(c => (c.parent = this));
    this._children = children;
  }
  get children() {
    return this._children;
  }
  addChild(child, prepend = true) {
    child.parent = this;
    if (prepend) this._children.unshift(child);
    else this._children.push(child);
  }
}

export function calculateLayoutTree(tabs, gridType) {
  let rootNode;
  if (gridType === "vsep" || (tabs.length === 2 && gridType === "grid")) {
    rootNode = new ZenSplitNode("row");
    rootNode.children = tabs.map(tab => new ZenSplitLeafNode(tab, 100 / tabs.length));
  } else if (gridType === "hsep") {
    rootNode = new ZenSplitNode("column");
    rootNode.children = tabs.map(tab => new ZenSplitLeafNode(tab, 100 / tabs.length));
  } else if (gridType === "grid") {
    rootNode = new ZenSplitNode("row");
    const rowWidth = 100 / Math.ceil(tabs.length / 2);
    for (let i = 0; i < tabs.length - 1; i += 2) {
      const columnNode = new ZenSplitNode("column", rowWidth, 100);
      columnNode.children = [
        new ZenSplitLeafNode(tabs[i], 50),
        new ZenSplitLeafNode(tabs[i + 1], 50),
      ];
      rootNode.addChild(columnNode, false);
    }
    if (tabs.length % 2 !== 0) {
      rootNode.addChild(new ZenSplitLeafNode(tabs[tabs.length - 1], rowWidth), false);
    }
  }
  return rootNode;
}

export function applyGridLayoutToPositions(splitNode, out = new Map()) {
  if (!splitNode.positionToRoot) {
    splitNode.positionToRoot = { top: 0, bottom: 0, left: 0, right: 0 };
  }
  const nodeRootPosition = splitNode.positionToRoot;
  if (!splitNode.children) {
    out.set(splitNode.tab, { ...nodeRootPosition });
    return out;
  }
  const rootToNodeWidthRatio = (100 - nodeRootPosition.right - nodeRootPosition.left) / 100;
  const rootToNodeHeightRatio = (100 - nodeRootPosition.bottom - nodeRootPosition.top) / 100;
  let leftOffset = nodeRootPosition.left;
  let topOffset = nodeRootPosition.top;
  for (const childNode of splitNode.children) {
    const childRootPosition = {
      top: topOffset,
      right: 100 - (leftOffset + childNode.widthInParent * rootToNodeWidthRatio),
      bottom: 100 - (topOffset + childNode.heightInParent * rootToNodeHeightRatio),
      left: leftOffset,
    };
    childNode.positionToRoot = childRootPosition;
    applyGridLayoutToPositions(childNode, out);
    if (splitNode.direction === "column") topOffset += childNode.sizeInParent * rootToNodeHeightRatio;
    else leftOffset += childNode.sizeInParent * rootToNodeWidthRatio;
  }
  return out;
}
