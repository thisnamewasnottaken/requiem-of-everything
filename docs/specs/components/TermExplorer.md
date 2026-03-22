# TermExplorer Component Spec

## Purpose

Full-page view for browsing and searching the musical terms glossary. Displays all 27 terms from `src/data/terms.json` as a filterable, searchable card grid. Serves as an educational reference for musical forms, genres, and techniques encountered on the timeline.

## Props

```ts
interface TermExplorerProps {
  onNavigateToTimeline?: () => void; // callback to switch back to timeline view
}
```

## Layout

Three-part vertical layout within a scrollable container (max-width 1200px, centred):

1. **Header row** — title, search input, back-to-timeline button.
2. **Category tabs** — horizontal tab bar for category filtering.
3. **Card grid** — responsive grid of term cards.

## Header

- **Title**: "Musical Terms & Forms" (`termExplorer.title`), displayed in `--font-display`.
- **Search input**: Filters terms by name or definition text. Styled consistently with `SearchFilterBar`.
- **Back button**: Renders only when `onNavigateToTimeline` is provided. Shows "← Timeline" (`termExplorer.backToTimeline`).

## Category Tabs

Horizontal tab bar with 7 options:

| Label              | Category key             |
| ------------------ | ------------------------ |
| All                | `null` (show all)        |
| Forms & Structures | `forms-and-structures`   |
| Genres             | `genres`                 |
| Techniques         | `techniques`             |
| Vocal & Choral     | `vocal-and-choral`       |
| Dance & Character  | `dance-and-character`    |
| Solo & Chamber     | `solo-and-chamber`       |

- Active tab has accent-colour background (`--text-accent`) with dark text (`--bg-primary`).
- Tabs wrap on narrow viewports.
- Category and search filters are combined (both must match).

## Term Card

Each card displays:

1. **Term name** — `--font-display`, `--text-accent`, 1.1rem.
2. **Short definition** — `--text-secondary`, body font.
3. **Long definition** (expanded only) — `--text-primary`, shown when the card is clicked.
4. **Era badges** — Small coloured pills for each era in `eraOrigin`. Use era colour map for background (22% opacity), text, and border (44% opacity). Text is capitalised with hyphens replaced by spaces.
5. **Example compositions** — Listed below a border separator. Each shows composition title, composer short name, and a ♫ icon if `spotifyUrl` is present.
6. **Wikipedia link** — "Read more →" (`termExplorer.readMore`), opens in new tab with `rel="noopener noreferrer"`. Uses `getWikipediaUrl(term.wikipediaSlug)` for locale-aware URLs. Click does not toggle card expansion.

### Expand/Collapse

- Click anywhere on the card (except the Wikipedia link) to toggle between short and long definition.
- `aria-expanded` attribute reflects state.
- Cards support keyboard activation (Enter / Space).

## Search

- Matches against `term.term`, `term.shortDefinition`, and `term.longDefinition` (case-insensitive).
- Combined with the active category tab filter.
- When no results match, display "No terms match your search." (`termExplorer.noResults`).

## Styling

- **CSS Modules**: `TermExplorer.module.css`.
- **Dark theme**: `--bg-primary` page background, `--bg-surface` card background, `--bg-elevated` on hover.
- **Card hover**: border transitions to `--text-accent`, background to `--bg-elevated`.
- **Responsive grid**: `repeat(auto-fill, minmax(320px, 1fr))` — 3 columns on desktop, 2 on tablet, 1 on mobile (280px min on tablet, 1fr on ≤480px).

## Data Dependencies

- `useTerms()` — all musical terms.
- `useCompositions()` — all compositions (for example works lookup).
- `useComposers()` — all composers (for composer names in example works).
- `getWikipediaUrl()` — locale-aware Wikipedia URLs.

## State

| State            | Type                       | Purpose                         |
| ---------------- | -------------------------- | ------------------------------- |
| `searchQuery`    | `string`                   | Current search input text       |
| `selectedCategory` | `TermCategory \| null`  | Active category tab (`null` = all) |
| `expandedIds`    | `Set<string>`              | IDs of cards showing long definition |

## i18n Keys

All UI strings use the `termExplorer.*` namespace in the `translation` i18n namespace. Term content (name, definitions) comes directly from `terms.json` and is not translated.

## Accessibility

- Tab bar uses `role="tablist"` with `role="tab"` and `aria-selected` on each tab.
- Cards use `role="button"`, `tabIndex={0}`, `aria-expanded`, and keyboard handlers for Enter/Space.
- External links include `target="_blank"` and `rel="noopener noreferrer"`.

## Test Scenarios

- Renders all 27 terms when no filters are active.
- Clicking a category tab filters to only terms with that category.
- Typing in search filters by term name and definition text.
- Category + search filters combine correctly.
- Clicking a card toggles the long definition.
- Era badges display with correct colours.
- Example compositions show title and composer name.
- Spotify icon appears only for compositions with `spotifyUrl`.
- Wikipedia link opens correct locale-aware URL.
- "No results" message appears when filters exclude all terms.
- Back button calls `onNavigateToTimeline` when clicked.
- Back button does not render when `onNavigateToTimeline` is not provided.
