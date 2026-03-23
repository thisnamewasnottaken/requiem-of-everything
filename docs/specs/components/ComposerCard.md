# Component Spec: ComposerCard

## Purpose

A detail panel that shows comprehensive information about a selected composer. Appears when a user clicks on a composer bar in the timeline. Shows biography, key works, contemporaries, and historical context.

## Props / Inputs

| Prop         | Type     | Description                                 |
| ------------ | -------- | ------------------------------------------- |
| `composerId` | `string` | ID of the composer to display               |

All other data is derived internally via hooks:

- `useComposer(composerId)` — composer entity
- `useCompositionsByComposer(composerId)` — compositions list
- `useComposerContemporaries(composerId)` — overlapping composers

Actions (close, navigate, compare) use store actions directly:

- `clearComposerSelection()` from `useSelectionStore`
- `selectComposer(id)` from `useSelectionStore`
- `toggleComposerInComparison(id)` from `useComparisonStore`

## Visual States

- **Default**: Shows portrait, name, dates, biography, mini-timeline of works.
- **Expanded**: Shows full biography, all works listed, contemporaries grid.
- **Loading Wikipedia**: Skeleton for Wikipedia-enriched content.
- **Comparison Selected**: Visual indicator that this composer is in comparison mode.
- **Hidden by view switch**: Not rendered when the active view is Terms or Orchestra. Selection state in `useSelectionStore` is preserved so the card reappears when the user returns to Timeline.

## Sections

1. **Header**: Portrait (circular, 120px, from `portraitUrl`), name, birth–death years, nationality, era badge. If the portrait image fails to load (404 or any network error), the portrait container is hidden entirely — no broken image, no placeholder. The error state is **scoped to the current composer** — selecting a different composer must reset it so a valid portrait can appear again.
2. **Biography**: One-paragraph core bio from `composer.biography`, followed by a "Read on Wikipedia" external link (localised via `getWikipediaUrl()`). Wikipedia content is not fetched or displayed inline.
3. **Key Works**: List of compositions sorted by year, each showing year, title, and genre. Clicking an item calls `selectComposition(id)`.
4. **Contemporaries**: Chip buttons of overlapping composers (capped at 15). Clicking a chip calls `selectComposer(id)`.
5. **Historical Context**: _Planned / deferred_ — not currently rendered. The component does not display historical events during the composer's lifetime.
6. **Actions**: "Focus Timeline" / "Unfocus" toggle (zooms to lifespan accounting for panel width), "Compare" / "Comparing" toggle (disabled when 5 composers already compared). "Explore with AI" is not yet implemented.

## Wikipedia Link Localisation

The "View on Wikipedia" link is localised to match the user's current i18n language. The link domain uses the Wikipedia subdomain corresponding to the active language (e.g. `en.wikipedia.org` for English, `fr.wikipedia.org` for French, `af.wikipedia.org` for Afrikaans). The `getWikipediaUrl(slug)` utility in `src/utils/wikipedia.ts` derives the subdomain from `i18next.resolvedLanguage`.

## Portrait Image Sourcing

Composer portrait thumbnails are **always fetched from English Wikipedia** (`en.wikipedia.org`), regardless of the current UI language. English Wikipedia has the most complete collection of composer images; non-English editions may lack thumbnails for a given composer.

The static `portraitUrl` field in `src/data/composers.json` uses direct Wikimedia Commons URLs, which are language-agnostic. Dynamic thumbnails from `WikipediaService.getSummary()` are sourced from the English REST API endpoint via `getEnglishWikipediaApiBase()` even when the localized text is fetched from a different language subdomain.

## Focus Timeline Behavior

The "Focus Timeline" button zooms the main timeline to the composer's lifespan with padding **and** activates **focus mode** — non-focused composers are dimmed and eventually collapsed (identical to comparison mode's visual treatment). Because the ComposerCard panel (420px wide) overlaps the right side of the viewport, the zoom accounts for this by adding proportional right-side padding (`rightInsetFraction = panelWidth / viewportWidth`). This ensures the composer's full lifespan is visible in the unobscured area to the left of the panel.

The button is a **toggle**: clicking it again clears focus mode (label changes to "Unfocus"). Focus mode is also cleared when comparison mode is activated. The focused composer's ID is stored as `focusedComposerId` in `useSelectionStore`.

## Interactions

- Click a composition → opens composition detail.
- Click a contemporary → navigates to that composer.
- Click "Compare" → adds to comparison view.
- Click "Read on Wikipedia" → opens external link in new tab.
- Close button (`×`) → calls `clearComposerSelection()` to dismiss panel.

## Accessibility

- Panel has `role="dialog"` with `aria-label`.
- Close button is focusable and labeled.
- All portrait images have alt text.
- Lists are semantic `<ul>` / `<ol>`.

## Dependencies

- `useSelectionStore` — current selection, focus mode, composer/composition navigation
- `useComparisonStore` — comparison mode toggling and state
- `useTimelineStore` — `zoomToRange()` for Focus Timeline
- `useComposer()`, `useCompositionsByComposer()`, `useComposerContemporaries()` — data hooks
- `getWikipediaUrl()` — localised Wikipedia link construction

## Test Scenarios

1. Renders composer name, dates, and biography.
2. Lists all compositions sorted by year.
3. Shows contemporaries who overlapped by at least 10 years of active life.
4. ~~Shows historical events within the composer's birth–death range.~~ _(Not yet implemented.)_
5. Close button dismisses the panel and clears selection via `clearComposerSelection()`.
6. Clicking a contemporary calls `selectComposer(id)`.
7. Wikipedia link opens in a new tab (content is not loaded inline).
