import type { WikiSummary } from "@/types";
import { getEnglishWikipediaApiBase, getWikipediaApiBase, getWikipediaUrl } from "@/utils/wikipedia";

const CACHE_PREFIX = "wiki:";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// In-flight request deduplication
const inflightRequests = new Map<string, Promise<unknown>>();

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

type WikipediaThumbnailData = { thumbnail?: { source?: string } };

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
    // Check cache first
    const cached = getCached<WikiSummary>(`summary:${slug}`);
    if (cached) return cached;

    return deduplicatedFetch(`summary:${slug}`, async () => {
      try {
        const localizedApiBase = getWikipediaApiBase();
        const englishApiBase = getEnglishWikipediaApiBase();
        const isEnglish = localizedApiBase === englishApiBase;

        // Fetch localised text and English thumbnail in parallel.
        // Thumbnail always comes from en.wikipedia.org for maximum image
        // availability (issue #8 — English has the most complete image set).
        const [localizedResponse, englishData] = await Promise.all([
          fetch(`${localizedApiBase}/page/summary/${encodeURIComponent(slug)}`),
          isEnglish
            ? Promise.resolve(null)
            : fetch(`${englishApiBase}/page/summary/${encodeURIComponent(slug)}`)
                .then((r) => (r.ok ? (r.json() as Promise<WikipediaThumbnailData>) : null))
                .catch(() => null),
        ]);

        if (!localizedResponse.ok)
          throw new Error(`Wikipedia API error: ${localizedResponse.status}`);

        const localizedData = await localizedResponse.json();

        // Prefer English thumbnail; fall back to localised if unavailable.
        const thumbnailUrl: string | undefined =
          (englishData as WikipediaThumbnailData | null)?.thumbnail?.source ??
          localizedData.thumbnail?.source;

        const summary: WikiSummary = {
          title: localizedData.title,
          extract: localizedData.extract,
          description: localizedData.description,
          thumbnailUrl,
          articleUrl:
            localizedData.content_urls?.desktop?.page ??
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
   *
   * @security This returns **raw, unsanitized HTML** from Wikipedia.
   * It must NEVER be injected into the DOM via dangerous React props or
   * direct DOM element property assignment. Use structured data from
   * {@link getSummary} for display instead. Automated tests in
   * WikipediaService.test.ts enforce this constraint.
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
