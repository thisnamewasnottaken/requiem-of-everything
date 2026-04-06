import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  toSpotifyAppUri,
  openSpotify,
  FALLBACK_TIMEOUT_MS,
} from "@/utils/spotify";

// ---------------------------------------------------------------------------
// toSpotifyAppUri
// ---------------------------------------------------------------------------

describe("toSpotifyAppUri", () => {
  it("converts search URL to spotify:search: URI", () => {
    expect(toSpotifyAppUri("https://open.spotify.com/search/Bach")).toBe(
      "spotify:search:Bach",
    );
  });

  it("decodes URL-encoded search queries", () => {
    expect(
      toSpotifyAppUri(
        "https://open.spotify.com/search/Bach%20Mass%20in%20B%20Minor",
      ),
    ).toBe("spotify:search:Bach Mass in B Minor");
  });

  it("converts track URL to spotify:track: URI", () => {
    expect(
      toSpotifyAppUri("https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"),
    ).toBe("spotify:track:4uLU6hMCjMI75M1A2tKUQC");
  });

  it("converts album URL to spotify:album: URI", () => {
    expect(
      toSpotifyAppUri("https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3"),
    ).toBe("spotify:album:1DFixLWuPkv3KT3TnV35m3");
  });

  it("converts playlist URL to spotify:playlist: URI", () => {
    expect(
      toSpotifyAppUri(
        "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
      ),
    ).toBe("spotify:playlist:37i9dQZF1DX4sWSpwq3LiO");
  });

  it("converts artist URL to spotify:artist: URI", () => {
    expect(
      toSpotifyAppUri("https://open.spotify.com/artist/2wOqMjp9TyABvtHdOSOTUS"),
    ).toBe("spotify:artist:2wOqMjp9TyABvtHdOSOTUS");
  });

  it("returns null for non-Spotify URLs", () => {
    expect(toSpotifyAppUri("https://not-spotify.com/search/foo")).toBeNull();
  });

  it("returns null for malformed URLs", () => {
    expect(toSpotifyAppUri("malformed-url")).toBeNull();
  });

  it("returns null for Spotify URLs with unsupported paths", () => {
    expect(
      toSpotifyAppUri("https://open.spotify.com/user/spotify"),
    ).toBeNull();
  });

  it("returns null for Spotify URLs with no resource segment", () => {
    expect(toSpotifyAppUri("https://open.spotify.com/search")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// openSpotify
// ---------------------------------------------------------------------------

describe("openSpotify", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let hrefSetter: (v: any) => void;
  let windowOpenMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    windowOpenMock = vi.fn();
    vi.stubGlobal("open", windowOpenMock);

    // Mock window.location.href setter
    hrefSetter = vi.fn();
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window.location, "href", {
      set: hrefSetter,
      get: () => "",
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("sets window.location.href to app URI for a valid Spotify URL", () => {
    openSpotify("https://open.spotify.com/search/Bach");
    expect(hrefSetter).toHaveBeenCalledWith("spotify:search:Bach");
  });

  it("calls window.open with the web URL as fallback after timeout", () => {
    openSpotify("https://open.spotify.com/search/Bach");
    expect(windowOpenMock).not.toHaveBeenCalled();
    vi.advanceTimersByTime(FALLBACK_TIMEOUT_MS);
    expect(windowOpenMock).toHaveBeenCalledWith(
      "https://open.spotify.com/search/Bach",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("does not call window.open if blur event fires (app opened)", () => {
    openSpotify("https://open.spotify.com/search/Bach");
    // Simulate the window losing focus (Spotify app opened)
    window.dispatchEvent(new Event("blur"));
    vi.advanceTimersByTime(FALLBACK_TIMEOUT_MS);
    expect(windowOpenMock).not.toHaveBeenCalled();
  });

  it("calls window.open directly for an unrecognised URL format", () => {
    openSpotify("https://not-spotify.com/search/foo");
    expect(windowOpenMock).toHaveBeenCalledWith(
      "https://not-spotify.com/search/foo",
      "_blank",
      "noopener,noreferrer",
    );
    expect(hrefSetter).not.toHaveBeenCalled();
  });

  it('passes "noopener,noreferrer" to window.open for the web fallback', () => {
    openSpotify("https://open.spotify.com/track/abc123");
    vi.advanceTimersByTime(FALLBACK_TIMEOUT_MS);
    expect(windowOpenMock).toHaveBeenCalledWith(
      expect.any(String),
      "_blank",
      "noopener,noreferrer",
    );
  });
});

// ---------------------------------------------------------------------------
// Security
// ---------------------------------------------------------------------------

describe("spotify.ts — security", () => {
  it("should not use eval, Function, or innerHTML", () => {
    const source = readFileSync(
      join(process.cwd(), "src/utils/spotify.ts"),
      "utf-8",
    );
    expect(source).not.toMatch(/\beval\b/);
    expect(source).not.toMatch(/\bnew Function\b/);
    expect(source).not.toMatch(/innerHTML/);
  });
});
