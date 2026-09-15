/* Chromium shim for nsIZenMouseTracker (compact-mode). */
/* Gecko: ZenMouseTracker.cpp tracks OS pointer. Chromium: IntersectionObserver
 * + chrome.windows, same registerWindow/unregisterWindow surface. */

const tracked = new Map();

function fireExit(win) {
  try {
    window.dispatchEvent(
      new CustomEvent("zen-mouse-tracker:exited", { detail: { window: win } })
    );
  } catch {}
  try {
    chrome.storage?.session?.set?.({ "zen-mouse-exited": Date.now() });
  } catch {}
}

export function registerWindow(win, screenEdge, maxEdgeOffset = 0) {
  unregisterWindow(win);
  try {
    const sentinel = win.document.createElement("div");
    sentinel.setAttribute("data-zen-edge", screenEdge);
    sentinel.style.cssText = `position:fixed;${screenEdge}:calc(-1 * ${Number(maxEdgeOffset) || 0}px);top:0;bottom:0;width:1px;height:1px;`;
    win.document.documentElement.appendChild(sentinel);
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) {
          fireExit(win);
          unregisterWindow(win);
        }
      }
    });
    io.observe(sentinel);
    tracked.set(win, { io, sentinel });
  } catch {
    // Fallback: pointerleave on the window.
    try {
      const onLeave = () => fireExit(win);
      win.addEventListener("pointerleave", onLeave, { once: true });
      tracked.set(win, { onLeave });
    } catch {}
  }
  return 0;
}

export function unregisterWindow(win) {
  const entry = tracked.get(win);
  if (!entry) {
    return 0;
  }
  try {
    entry.io?.disconnect?.();
    entry.sentinel?.remove?.();
    if (entry.onLeave) {
      win.removeEventListener("pointerleave", entry.onLeave);
    }
  } catch {}
  tracked.delete(win);
  return 0;
}
