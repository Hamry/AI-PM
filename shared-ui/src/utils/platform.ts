// Check for the internal Tauri object that is injected into the window
export const isTauri =
  typeof window !== "undefined" &&
  (window as any).__TAURI_INTERNALS__ !== undefined;

export const getPlatform = () => (isTauri ? "desktop" : "web");
