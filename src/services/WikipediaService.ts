import type { WikiSummary } from "@/types";
import { getWikipediaApiBase, getWikipediaUrl } from "@/utils/wikipedia";

const CACHE_PREFIX = "wiki:";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// In-flight request deduplication
const inflightRequests = new Map<string, Promise<unknown>>();

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.data;
    }
    return null; // Stale
  } catch {
    return null;
  }
}

function getStaleCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

async function deduplicatedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const existing = inflightRequests.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fetchFn().finally(() => {
    inflightRequests.delete(key);
  });

  inflightRequests.set(key, promise);
  return promise;
}

/**
 * Wikipedia REST API service.
 *
 * Fetches summaries and articles from Wikipedia with local caching
 * and request deduplication.
 */
export const WikipediaService = {
  /**
   * Get a short summary for a Wikipedia article.
   */
  async getSummary(slug: string): Promise<WikiSummary> {
    const apiBase = getWikipediaApiBase();
    // Check cache first
    const cached = getCached<WikiSummary>(`summary:${slug}`);
    if (cached) return cached;

    return deduplicatedFetch(`summary:${slug}`, async () => {
      try {
        const response = await fetch(
          `${apiBase}/page/summary/${encodeURIComponent(slug)}`,
        );
        if (!response.ok)
          throw new Error(`Wikipedia API error: ${response.status}`);

        const data = await response.json();
        const summary: WikiSummary = {
          title: data.title,
          extract: data.extract,
          description: data.description,
          thumbnailUrl: data.thumbnail?.source,
          articleUrl:
            data.content_urls?.desktop?.page ??
            getWikipediaUrl(slug),
        };

        setCache(`summary:${slug}`, summary);
        return summary;
      } catch (error) {
        // Fall back to stale cache
        const stale = getStaleCached<WikiSummary>(`summary:${slug}`);
        if (stale) return stale;
        throw error;
      }
    });
  },

  /**
   * Get the full article HTML for a Wikipedia article.
   */
  async getArticleHtml(slug: string): Promise<string> {
    const apiBase = getWikipediaApiBase();
    const cached = getCached<string>(`html:${slug}`);
    if (cached) return cached;

    return deduplicatedFetch(`html:${slug}`, async () => {
      try {
        const response = await fetch(
          `${apiBase}/page/mobile-html/${encodeURIComponent(slug)}`,
        );
        if (!response.ok)
          throw new Error(`Wikipedia API error: ${response.status}`);

        const html = await response.text();
        setCache(`html:${slug}`, html);
        return html;
      } catch (error) {
        const stale = getStaleCached<string>(`html:${slug}`);
        if (stale) return stale;
        throw error;
      }
    });
  },

  /**
   * Prefetch summaries for multiple slugs.
   * Batches with a small delay to avoid hammering the API.
   */
  async prefetchSummaries(slugs: string[]): Promise<void> {
    for (const slug of slugs) {
      // Skip if already cached
      if (getCached<WikiSummary>(`summary:${slug}`)) continue;

      try {
        await this.getSummary(slug);
      } catch {
        // Non-critical — silently skip failures during prefetch
      }
      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  },
};
