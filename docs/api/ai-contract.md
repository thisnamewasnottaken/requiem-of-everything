# AI Integration API Contract

> Defines the interface between the Requiem of Everything frontend and any AI backend service. This contract is provider-agnostic — any LLM (OpenAI, Anthropic, local models) can be wired behind it.

## Base URL

```
/api/ai/
```

In development, this proxies to a configurable endpoint. In production, it points to the deployed AI service.

---

## Endpoints

### POST `/api/ai/query`

Natural language query that returns narrative content and optional timeline actions.

**Request:**

```json
{
  "query": "What was happening in Europe when Beethoven wrote his 9th Symphony?",
  "context": {
    "viewStartYear": 1800,
    "viewEndYear": 1830,
    "selectedComposerIds": ["ludwig-van-beethoven"],
    "selectedCompositionId": "beethoven-symphony-no-9"
  },
  "operation": "query"
}
```

**Response:**

```json
{
  "narrative": "Beethoven composed his 9th Symphony between 1822 and 1824, during a period of significant political change in Europe...",
  "actions": [
    { "type": "focus-range", "startYear": 1820, "endYear": 1830 },
    {
      "type": "highlight-events",
      "eventIds": ["congress-of-vienna", "greek-war-independence"]
    }
  ],
  "suggestions": [
    "Compare Beethoven's late works with Schubert's output in the same period",
    "What was the political climate in Vienna during Beethoven's life?"
  ],
  "sources": [
    {
      "title": "Symphony No. 9 (Beethoven)",
      "url": "https://en.wikipedia.org/wiki/Symphony_No._9_(Beethoven)"
    }
  ]
}
```

---

### POST `/api/ai/summarize`

Generate a narrative summary of a composer, era, or event.

**Request:**

```json
{
  "query": "",
  "context": {
    "viewStartYear": 1685,
    "viewEndYear": 1750,
    "selectedComposerIds": ["johann-sebastian-bach"],
    "selectedCompositionId": null
  },
  "operation": "summarize"
}
```

**Response:**

```json
{
  "narrative": "Johann Sebastian Bach (1685–1750) was a German composer and musician of the late Baroque period...",
  "sources": [
    {
      "title": "Johann Sebastian Bach",
      "url": "https://en.wikipedia.org/wiki/Johann_Sebastian_Bach"
    }
  ]
}
```

---

### POST `/api/ai/compare`

Compare two or more composers.

**Request:**

```json
{
  "query": "",
  "context": {
    "viewStartYear": 1680,
    "viewEndYear": 1760,
    "selectedComposerIds": ["johann-sebastian-bach", "george-frideric-handel"],
    "selectedCompositionId": null
  },
  "operation": "compare"
}
```

**Response:**

```json
{
  "narrative": "Bach and Handel, born in the same year (1685) and in the same region of Germany, represent two remarkably different paths through the Baroque...",
  "actions": [
    {
      "type": "show-comparison",
      "composerIds": ["johann-sebastian-bach", "george-frideric-handel"]
    }
  ],
  "suggestions": [
    "How did their approaches to opera differ?",
    "Compare their keyboard works"
  ]
}
```

---

### POST `/api/ai/enrich`

Enrich sparse data with AI-generated content.

**Request:**

```json
{
  "query": "Provide historical context for this composition",
  "context": {
    "viewStartYear": 1820,
    "viewEndYear": 1830,
    "selectedComposerIds": [],
    "selectedCompositionId": "beethoven-symphony-no-9"
  },
  "operation": "enrich"
}
```

**Response:**

```json
{
  "narrative": "The Ninth Symphony was revolutionary not only musically but socially...",
  "sources": []
}
```

---

### POST `/api/ai/suggest`

Given the current view, suggest interesting explorations.

**Request:**

```json
{
  "query": "",
  "context": {
    "viewStartYear": 1850,
    "viewEndYear": 1900,
    "selectedComposerIds": [],
    "selectedCompositionId": null
  },
  "operation": "suggest"
}
```

**Response:**

```json
{
  "suggestions": [
    "Explore the rivalry between Brahms and Wagner",
    "See how the Franco-Prussian War influenced nationalist composers",
    "Compare Tchaikovsky and Dvořák's approaches to folk music"
  ]
}
```

---

## Error Responses

All endpoints return standard error shapes:

```json
{
  "error": {
    "code": "AI_UNAVAILABLE",
    "message": "AI service is not configured or unreachable."
  }
}
```

Error codes:

- `AI_UNAVAILABLE` — Service not configured or down
- `RATE_LIMITED` — Too many requests
- `INVALID_REQUEST` — Malformed request body
- `CONTEXT_TOO_LARGE` — Request context exceeds limits

---

## Configuration

The AI service URL and API key are configured via environment variables:

```env
VITE_AI_SERVICE_URL=http://localhost:3001/api/ai
VITE_AI_API_KEY=your-api-key-here
VITE_AI_ENABLED=false
```

When `VITE_AI_ENABLED=false`, all AI UI elements are hidden and no requests are made.

---

## UI Integration Points

1. **Command Palette**: Queries prefixed with `>` are routed to `/api/ai/query`.
2. **Composer Card "Explore with AI"**: Sends `/api/ai/summarize` for the selected composer.
3. **Comparison View "AI Compare"**: Sends `/api/ai/compare` with selected composers.
4. **Composition Detail "Historical Context"**: Sends `/api/ai/enrich`.
5. **Idle Suggestions**: Periodically calls `/api/ai/suggest` with current view context.

---

_This contract is versioned. Breaking changes require a version bump in the URL path (e.g., `/api/ai/v2/query`)._
