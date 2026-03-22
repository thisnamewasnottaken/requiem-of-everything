# Component Spec: ComposerCard

## Purpose

A detail panel that shows comprehensive information about a selected composer. Appears when a user clicks on a composer bar in the timeline. Shows biography, key works, contemporaries, and historical context.

## Props / Inputs

| Prop               | Type                   | Description                               |
| ------------------ | ---------------------- | ----------------------------------------- |
| `composer`         | `Composer`             | The selected composer                     |
| `compositions`     | `Composition[]`        | Compositions by this composer             |
| `contemporaries`   | `Composer[]`           | Composers active during overlapping years |
| `events`           | `HistoricalEvent[]`    | Events during the composer's lifetime     |
| `onClose`          | `() => void`           | Callback to close the panel               |
| `onSelectComposer` | `(id: string) => void` | Navigate to another composer              |
| `onCompare`        | `(id: string) => void` | Add to comparison                         |

## Visual States

- **Default**: Shows portrait, name, dates, biography, mini-timeline of works.
- **Expanded**: Shows full biography, all works listed, contemporaries grid.
- **Loading Wikipedia**: Skeleton for Wikipedia-enriched content.
- **Comparison Selected**: Visual indicator that this composer is in comparison mode.

## Sections

1. **Header**: Portrait (circular, 120px, from `portraitUrl`), name, birth–death years, nationality, era badge. If the portrait image fails to load (404 or any network error), the portrait container is hidden entirely — no broken image, no placeholder. The error state is **scoped to the current composer** — selecting a different composer must reset it so a valid portrait can appear again.
2. **Biography**: One-paragraph core bio + expandable Wikipedia content.
3. **Key Works**: List of compositions with year, shown as mini-timeline.
4. **Contemporaries**: Grid/list of composers who overlapped in time.
5. **Historical Context**: Events that happened during this composer's lifetime.
6. **Actions**: "Focus Timeline" (zooms to lifespan accounting for panel width), "Compare with...", "Explore with AI" (future), "View on Wikipedia".

## Wikipedia Link Localisation

The "View on Wikipedia" link is localised to match the user's current i18n language. The link domain uses the Wikipedia subdomain corresponding to the active language (e.g. `en.wikipedia.org` for English, `fr.wikipedia.org` for French, `af.wikipedia.org` for Afrikaans). The `getWikipediaUrl(slug)` utility in `src/utils/wikipedia.ts` derives the subdomain from `i18next.resolvedLanguage`.

## Focus Timeline Behavior

The "Focus Timeline" button zooms the main timeline to the composer's lifespan with padding **and** activates **focus mode** — non-focused composers are dimmed and eventually collapsed (identical to comparison mode's visual treatment). Because the ComposerCard panel (420px wide) overlaps the right side of the viewport, the zoom accounts for this by adding proportional right-side padding (`rightInsetFraction = panelWidth / viewportWidth`). This ensures the composer's full lifespan is visible in the unobscured area to the left of the panel.

The button is a **toggle**: clicking it again clears focus mode (label changes to "Unfocus"). Focus mode is also cleared when comparison mode is activated. The focused composer's ID is stored as `focusedComposerId` in `useSelectionStore`.

## Interactions

- Click a composition → opens composition detail.
- Click a contemporary → navigates to that composer.
- Click "Compare" → adds to comparison view.
- Click "Wikipedia" → opens external link.
- Swipe/close button → dismisses panel.

## Accessibility

- Panel has `role="dialog"` with `aria-label`.
- Close button is focusable and labeled.
- All portrait images have alt text.
- Lists are semantic `<ul>` / `<ol>`.

## Dependencies

- `useSelectionStore` — current selection
- `WikipediaService` — enriched content
- `CompositionMarker` — mini-timeline rendering

## Test Scenarios

1. Renders composer name, dates, and biography.
2. Lists all compositions sorted by year.
3. Shows contemporaries who overlapped by at least 10 years of active life.
4. Shows historical events within the composer's birth–death range.
5. Close button dismisses the panel and clears selection.
6. Clicking a contemporary dispatches navigation.
7. Wikipedia content loads asynchronously and renders.
