# Feature Spec: Wikipedia Integration

## Overview

The React app renders biographies and event descriptions from its bundled data and links out to the localized Wikipedia articles. `src/services/WikipediaService.ts` provides REST helpers but is not currently called by the UI. V2 uses its own curated data.

Locale namespace files may override an entity's `wikipediaSlug` whenever the article title on the target Wikipedia differs from the canonical English slug. This keeps direct links and REST summary requests pointed at a working page for languages such as Polish, where titles like `Fryderyk_Chopin` do not match the English article slug.

## Image Sourcing Policy

Composer bars and cards use the static `portraitUrl` field. When called separately, the REST summary helper prefers an English Wikipedia thumbnail and falls back to the localized response's thumbnail. Text is taken from the localized summary.

## API Endpoints Used

### Summary — text (localised)

```
GET https://{lang}.wikipedia.org/api/rest_v1/page/summary/{slug}
```

Returns: title, extract (plain text), description, article URL.
Used for: biography text in tooltips, composer card headers, event descriptions.
Slug source: translated `wikipediaSlug` override for the active locale when present; otherwise the canonical English slug from the base data.

### Summary — thumbnail (always English)

```
GET https://en.wikipedia.org/api/rest_v1/page/summary/{slug}
```

Returns: thumbnail image URL (`thumbnail.source`).
The summary helper requests this from English Wikipedia in parallel with the localized request when the UI language is not English.

### Mobile HTML (lightweight)

```
GET https://{lang}.wikipedia.org/api/rest_v1/page/mobile-html/{slug}
```

Returns raw article HTML. The app does not render it.

## Caching Strategy

- Summary and HTML responses are cached in `localStorage` under `wiki:summary:{slug}` and `wiki:html:{slug}`.
- Cache TTL: 24 hours.
- Cache format: `{ data: <response>, timestamp: <epoch_ms> }`.
- If a fresh request fails, the helper returns stale cached data when available; otherwise it throws.

## Service Interface

```typescript
interface WikipediaService {
  /** Get a short summary for an article */
  getSummary(slug: string): Promise<WikiSummary>;

  /** Get the full article HTML */
  getArticleHtml(slug: string): Promise<string>;

  /** Prefetch summaries for a list of slugs */
  prefetchSummaries(slugs: string[]): Promise<void>;
}

interface WikiSummary {
  title: string;
  extract: string;
  description?: string;
  thumbnailUrl?: string;
  articleUrl: string;
}
```

## Request Pacing

- Prefetching runs sequentially with a 50ms pause after each uncached summary attempt. There is no global requests-per-minute cap.
- In-flight requests for the same cache key share a promise.

## Error Handling

- Prefetch ignores failed requests so it can continue with the remaining slugs.
- Never let a Wikipedia failure break the core timeline experience.

## Test Scenarios

1. `getSummary` returns cached data when cache is fresh.
2. `getSummary` fetches from API when cache is stale.
3. Concurrent requests for the same summary share an in-flight request.
4. A localized thumbnail is used if an English thumbnail is unavailable.
5. Network failure falls back to cached data.
6. Network failure with no cache rejects the request.
7. `getSummary` fetches thumbnail from `en.wikipedia.org` even when the UI language is non-English.
8. `getSummary` fetches article text from the localised endpoint even when the thumbnail comes from English.
9. `getEnglishWikipediaApiBase()` always returns `https://en.wikipedia.org/api/rest_v1` regardless of i18n state.
