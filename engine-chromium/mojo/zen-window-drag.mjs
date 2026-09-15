/* Chromium shim for nsIZenWindowDragUtils (window-drag). */
/* Gecko: C++ hit-test for interactive content/cursor. Chromium: DOM
 * getComputedStyle + elementFromPoint, same isInteractiveContent/
 * isInteractiveCursor surface. */

const INTERACTIVE_SELECTOR =
  "a, button, input, select, textarea, [contenteditable], [draggable], img[src], video, audio";

export function isInteractiveContent(node) {
  try {
    if (!node || node === document.documentElement) {
      return false;
    }
    return !!node.closest?.(INTERACTIVE_SELECTOR);
  } catch {
    return false;
  }
}

export function isInteractiveCursor(node, clientX, clientY) {
  try {
    const el =
      (node?.nodeType === 1 ? node : node?.parentElement) ||
      document.elementFromPoint(clientX, clientY);
    if (!el) {
      return false;
    }
    const cursor = getComputedStyle(el).cursor;
    return ["pointer", "text", "move", "grab", "grabbing", "resize", "crosshair"].some(c =>
      cursor.includes(c)
    );
  } catch {
    return false;
  }
}
