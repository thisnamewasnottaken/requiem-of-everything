/**
 * Spotify app-first deep linking utility.
 * Parallels src/utils/wikipedia.ts in structure and purpose.
 */

/**
 * Timeout in milliseconds before falling back to web.
 * 1500ms balances giving the OS time to launch the app (~500–1000ms)
 * against not making the user wait too long if the app isn't installed.
 *
 * Exported for testability (tests use vi.advanceTimersByTime with this value).
 */
export const FALLBACK_TIMEOUT_MS = 1500;

/**
 * Convert a Spotify web URL to the equivalent spotify:// app URI.
 *
 * Supports these open.spotify.com path patterns:
 *   /search/{query}    → spotify:search:{query}
 *   /track/{id}        → spotify:track:{id}
 *   /album/{id}        → spotify:album:{id}
 *   /playlist/{id}     → spotify:playlist:{id}
 *   /artist/{id}       → spotify:artist:{id}
 *
 * Returns null if the URL is not a recognised Spotify web URL.
 */
export function toSpotifyAppUri(webUrl: string): string | null {
  try {
    const url = new URL(webUrl);
    if (url.hostname !== "open.spotify.com") return null;

    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return null;

    const type = segments[0];
    const supported = ["search", "track", "album", "playlist", "artist"];
    if (!supported.includes(type)) return null;

    const resource = segments.slice(1).join("/");

    if (type === "search") {
      return `spotify:search:${decodeURIComponent(resource)}`;
    }

    return `spotify:${type}:${resource}`;
  } catch {
    return null;
  }
}

/**
 * Attempt to open the Spotify app via the custom URI scheme.
 * If the app does not respond within FALLBACK_TIMEOUT_MS, falls back to
 * opening the web URL in a new tab.
 *
 * Must be called from a user-gesture event handler (click/keydown) to avoid
 * popup-blocker issues with the web fallback.
 *
 * @param webUrl - The full Spotify web URL (https://open.spotify.com/...)
 */
export function openSpotify(webUrl: string): void {
  const appUri = toSpotifyAppUri(webUrl);

  if (!appUri) {
    window.open(webUrl, "_blank", "noopener,noreferrer");
    return;
  }

  let appOpened = false;
  const onBlur = () => {
    appOpened = true;
  };
  window.addEventListener("blur", onBlur);

  window.location.href = appUri;

  setTimeout(() => {
    window.removeEventListener("blur", onBlur);
    if (!appOpened) {
      window.open(webUrl, "_blank", "noopener,noreferrer");
    }
  }, FALLBACK_TIMEOUT_MS);
}
