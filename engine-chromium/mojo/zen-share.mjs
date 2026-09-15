/* Chromium shim for toolkit/ZenShareInternal.cpp (share). */
/* Gecko: native share backend. Chromium: navigator.share + context menus. */

export async function share(data) {
  if (typeof navigator?.share === "function") {
    try {
      await navigator.share(data);
      return true;
    } catch {
      return false;
    }
  }
  try {
    await navigator.clipboard?.writeText?.(data?.url || data?.text || "");
    return true;
  } catch {
    return false;
  }
}
