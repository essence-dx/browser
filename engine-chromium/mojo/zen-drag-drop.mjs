/* Chromium shim for nsIZenDragAndDrop (drag-and-drop). */
/* Gecko: native window move via nsZenDragAndDrop.cpp. Chromium: CSS drag
 * regions + HTML5 DnD + chrome.windows, same onDragStart/onDragEnd/
 * beginNativeWindowMove surface. */

export function onDragStart(opacity = 1) {
  try {
    document.documentElement.style.setProperty("--zen-drag-opacity", String(opacity));
    document.documentElement.setAttribute("data-zen-dragging", "true");
  } catch {}
}

export function onDragEnd() {
  try {
    document.documentElement.removeAttribute("data-zen-dragging");
  } catch {}
}

export async function beginNativeWindowMove(win) {
  // Chromium has no OS-driven move API for web content; the shell marks the
  // drag region draggable and the window manager handles the gesture.
  try {
    const el = win?.document?.documentElement;
    el?.style?.setProperty?.("-webkit-app-region", "drag");
    setTimeout(() => {
      try {
        el?.style?.removeProperty?.("-webkit-app-region");
      } catch {}
    }, 2000);
  } catch {}
}
