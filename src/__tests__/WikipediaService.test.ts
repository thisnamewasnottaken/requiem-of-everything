import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WikipediaService } from "@/services/WikipediaService";
import { getEnglishWikipediaApiBase } from "@/utils/wikipedia";
import * as wikipediaUtils from "@/utils/wikipedia";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = val; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

const mockSummary = {
  type: "standard",
  title: "Ludwig van Beethoven",
  extract: "Ludwig van Beethoven was a German composer.",
  description: "German composer",
  thumbnail: { source: "https://example.com/beethoven.jpg" },
  content_urls: { desktop: { page: "https://en.wikipedia.org/wiki/Ludwig_van_Beethoven" } },
};

describe("WikipediaService.getSummary", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  it("fetches from the Wikipedia REST API and returns a WikiSummary", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockSummary,
    }));

    const result = await WikipediaService.getSummary("Ludwig_van_Beethoven");

    expect(result.title).toBe("Ludwig van Beethoven");
    expect(result.extract).toBe("Ludwig van Beethoven was a German composer.");
    expect(result.articleUrl).toBe("https://en.wikipedia.org/wiki/Ludwig_van_Beethoven");
    expect(result.thumbnailUrl).toBe("https://example.com/beethoven.jpg");
  });

  it("caches the result in localStorage after the first fetch", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockSummary,
    }));

    await WikipediaService.getSummary("Ludwig_van_Beethoven");

    const cached = localStorageMock.getItem("wiki:summary:Ludwig_van_Beethoven");
    expect(cached).not.toBeNull();
    const parsed = JSON.parse(cached!);
    expect(parsed.data.title).toBe("Ludwig van Beethoven");
  });

  it("returns the cached value without a network call on second request", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockSummary,
    });
    vi.stubGlobal("fetch", fetchMock);

    await WikipediaService.getSummary("Ludwig_van_Beethoven");
    await WikipediaService.getSummary("Ludwig_van_Beethoven");

    // Only one network call despite two invocations
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to stale cache when the network request fails", async () => {
    // Seed a stale cache entry (timestamp = 0 = always stale)
    localStorageMock.setItem(
      "wiki:summary:Ludwig_van_Beethoven",
      JSON.stringify({ data: { title: "Stale Beethoven", extract: "Stale", articleUrl: "#" }, timestamp: 0 }),
    );

    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("Network error")));

    const result = await WikipediaService.getSummary("Ludwig_van_Beethoven");
    expect(result.title).toBe("Stale Beethoven");
  });

  it("throws when network fails and there is no cache at all", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("Network error")));
    await expect(WikipediaService.getSummary("Unknown_Slug")).rejects.toThrow("Network error");
  });

  it("deduplicates concurrent requests for the same slug", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSummary,
    });
    vi.stubGlobal("fetch", fetchMock);

    // Kick off 5 concurrent requests for the same slug
    const results = await Promise.all([
      WikipediaService.getSummary("Ludwig_van_Beethoven"),
      WikipediaService.getSummary("Ludwig_van_Beethoven"),
      WikipediaService.getSummary("Ludwig_van_Beethoven"),
      WikipediaService.getSummary("Ludwig_van_Beethoven"),
      WikipediaService.getSummary("Ludwig_van_Beethoven"),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(results.every((r) => r.title === "Ludwig van Beethoven")).toBe(true);
  });

  it("throws when the API returns a non-ok status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    }));
    await expect(WikipediaService.getSummary("Unknown_Article")).rejects.toThrow(
      "Wikipedia API error: 404",
    );
  });
});

// --- English thumbnail sourcing (issue #8) ---

describe("getEnglishWikipediaApiBase", () => {
  it("always returns the English Wikipedia REST API base URL", () => {
    expect(getEnglishWikipediaApiBase()).toBe("https://en.wikipedia.org/api/rest_v1");
  });
});

describe("WikipediaService.getSummary — English thumbnail sourcing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorageMock.clear();
  });

  it("fetches thumbnail from en.wikipedia.org even when UI language is non-English", async () => {
    // Simulate a non-English language by spying on the wikipedia utilities.
    // Named imports in Vite/Vitest are live bindings, so spying on the module
    // object intercepts calls made inside WikipediaService.
    vi.spyOn(wikipediaUtils, "getWikipediaApiBase").mockReturnValue(
      "https://fr.wikipedia.org/api/rest_v1",
    );
    vi.spyOn(wikipediaUtils, "getWikipediaUrl").mockReturnValue(
      "https://fr.wikipedia.org/wiki/Ludwig_van_Beethoven",
    );

    const frenchData = {
      ...mockSummary,
      thumbnail: { source: "https://fr.example.com/french-thumb.jpg" },
      content_urls: { desktop: { page: "https://fr.wikipedia.org/wiki/Ludwig_van_Beethoven" } },
    };
    const englishData = {
      ...mockSummary,
      thumbnail: { source: "https://en.example.com/english-thumb.jpg" },
    };

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.startsWith("https://fr.wikipedia.org/")) {
        return Promise.resolve({ ok: true, json: async () => frenchData });
      }
      return Promise.resolve({ ok: true, json: async () => englishData });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await WikipediaService.getSummary("Ludwig_van_Beethoven");

    // Thumbnail must come from English Wikipedia
    expect(result.thumbnailUrl).toBe("https://en.example.com/english-thumb.jpg");
    // Article URL comes from the localised (French) response
    expect(result.articleUrl).toBe("https://fr.wikipedia.org/wiki/Ludwig_van_Beethoven");
    // Both endpoints are called: once for localised text, once for English thumbnail
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("fr.wikipedia.org"));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("en.wikipedia.org"));
  });

  it("falls back to localised thumbnail when English fetch fails", async () => {
    vi.spyOn(wikipediaUtils, "getWikipediaApiBase").mockReturnValue(
      "https://af.wikipedia.org/api/rest_v1",
    );

    const afrikaansData = {
      ...mockSummary,
      thumbnail: { source: "https://af.example.com/af-thumb.jpg" },
    };

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.startsWith("https://af.wikipedia.org/")) {
        return Promise.resolve({ ok: true, json: async () => afrikaansData });
      }
      // English fetch fails
      return Promise.resolve({ ok: false, status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await WikipediaService.getSummary("Ludwig_van_Beethoven");

    // Falls back to localised thumbnail when English unavailable
    expect(result.thumbnailUrl).toBe("https://af.example.com/af-thumb.jpg");
  });
});

// --- Security ---

describe("WikipediaService — security", () => {
  it("should not use innerHTML or dangerouslySetInnerHTML", () => {
    const source = readFileSync(join(process.cwd(), "src/services/WikipediaService.ts"), "utf-8");
    expect(source).not.toMatch(/innerHTML/);
    expect(source).not.toMatch(/dangerouslySetInnerHTML/);
  });

  it("should not use eval() or Function() constructor", () => {
    const source = readFileSync(join(process.cwd(), "src/services/WikipediaService.ts"), "utf-8");
    expect(source).not.toMatch(/\beval\s*\(/);
    expect(source).not.toMatch(/new Function\s*\(/);
  });

  it("getArticleHtml returns raw HTML that must NEVER be rendered with dangerouslySetInnerHTML", () => {
    function getFiles(dir: string): string[] {
      return readdirSync(dir).flatMap((f: string) => {
        const full = join(dir, f);
        return statSync(full).isDirectory() ? getFiles(full) : [full];
      });
    }

    const componentDir = resolve(process.cwd(), "src/components");
    const tsxFiles = getFiles(componentDir).filter((f: string) => f.endsWith(".tsx"));

    for (const file of tsxFiles) {
      const source = readFileSync(file, "utf-8");
      expect(source, `${file} must not use dangerouslySetInnerHTML`).not.toMatch(
        /dangerouslySetInnerHTML/,
      );
    }
  });
});
