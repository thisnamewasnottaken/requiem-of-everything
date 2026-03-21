# Feature Spec: Wikipedia Integration

## Overview

The app fetches content from the Wikipedia REST API to enrich composer biographies and provide historical event context. Wikipedia data is supplementary — the app works fully without it, but it adds depth.

## API Endpoints Used

### Summary

```
GET https://en.wikipedia.org/api/rest_v1/page/summary/{slug}
```

Returns: title, extract (plain text), thumbnail image URL, description.
Used for: quick tooltips, composer card headers, event descriptions.

### Mobile HTML (lightweight)

```
GET https://en.wikipedia.org/api/rest_v1/page/mobile-html/{slug}
```

Returns: lightweight HTML of the full article.
Used for: expanded "Read more" sections in detail panels.

## Caching Strategy

- All Wikipedia responses are cached in `localStorage` under the key `wiki:{slug}`.
- Cache TTL: 24 hours.
- Cache format: `{ data: <response>, timestamp: <epoch_ms> }`.
- If cache is stale, fetch fresh data but still show stale content during loading.

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

## Rate Limiting

- Maximum 200 requests per minute to Wikipedia API.
- Prefetching is batched with 50ms delays between requests.
- Requests are deduped: if a fetch for the same slug is in-flight, join the existing promise.

## Error Handling

- If Wikipedia is unreachable, show cached data if available, otherwise show a "Wikipedia content unavailable" message.
- Never let a Wikipedia failure break the core timeline experience.

## Test Scenarios

1. `getSummary` returns cached data when cache is fresh.
2. `getSummary` fetches from API when cache is stale.
3. `getSummary` returns stale cache and refreshes in background.
4. Rate limiting prevents exceeding 200 req/min.
5. Network failure falls back to cached data.
6. Network failure with no cache shows fallback message.
