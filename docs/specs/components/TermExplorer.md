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
3. **Card grid** — responsive grid of uniform-height term cards.

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

## Term Card (collapsed / default)

All cards are **uniform height** (`height: 180px`) with a flex-column layout and `overflow: hidden`. This ensures a consistent, clean grid regardless of content length.

Each card displays:

1. **Term name** — `--font-display`, `--text-accent`, 1.1rem.
2. **Short definition** — `--text-secondary`, body font, truncated to 3 lines via `-webkit-line-clamp: 3`. Fills the flex middle area.
3. **Era badges** — Pushed to the card bottom via `margin-top: auto`. Small coloured pills for each era in `eraOrigin`. Use era colour map for background (22% opacity), text, and border (44% opacity). Text is capitalised with hyphens replaced by spaces.

**NOT shown on the card**: long definition, example compositions, Wikipedia link. These appear only in the modal.

### Card Hover Effect

On hover, the card lifts and glows:
- `border-color: var(--text-accent)`
- `background: var(--bg-elevated)`
- `transform: translateY(-2px)`
- `box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3)`

## Term Detail Modal (selected state)

Clicking a card opens a **centred modal overlay** for the selected term. Only one term can be selected at a time.

### Backdrop

- Fixed overlay covering the entire viewport.
- `background: rgba(0, 0, 0, 0.6)` with `backdrop-filter: blur(4px)`.
- Clicking the backdrop closes the modal.
- Fade-in animation (0.2s ease).

### Modal Card

- Centred on screen, `max-width: 600px`, `width: 90vw`, `max-height: 80vh`.
- `background: var(--bg-surface)`, `border: 1px solid var(--text-accent)`, `border-radius: 12px`.
- Dramatic shadow: `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(212, 168, 87, 0.1)`.
- Scale-in animation: 0.92 → 1.0 + fade (0.25s ease).
- `overflow-y: auto` for long content.

### Modal Content (top to bottom)

1. **Close button** (✕) — top-right corner, `position: absolute`. Auto-focused on open.
2. **Term name** — `1.4rem`, `--font-display`, `--text-accent`.
3. **Short definition** — full text (no truncation), `--text-secondary`.
4. **Long definition** — full text, `--text-primary`, `line-height: 1.7` for readability.
5. **Era badges** — same styling as card.
6. **Divider line** — `1px solid var(--border-default)`.
7. **Example compositions section** — each shows composition title, composer short name, and a ♫ icon if `spotifyUrl` is present.
8. **Wikipedia link** — "Read more →" (`termExplorer.readMore`), opens in new tab with `rel="noopener noreferrer"`.

### Keyboard & Focus

- `Escape` key closes the modal.
- Close button receives auto-focus when modal opens.
- Modal uses `role="dialog"`, `aria-modal="true"`, `aria-label` set to the term name.

### Card Click Behaviour

- Click anywhere on the card to select it and open the modal.
- Cards use `role="button"`, `tabIndex={0}`, and keyboard handlers for Enter/Space.

## Search

- Matches against `term.term`, `term.shortDefinition`, and `term.longDefinition` (case-insensitive).
- Combined with the active category tab filter.
- When no results match, display "No terms match your search." (`termExplorer.noResults`).

## Styling

- **CSS Modules**: `TermExplorer.module.css`.
- **Dark theme**: `--bg-primary` page background, `--bg-surface` card background, `--bg-elevated` on hover.
- **Card hover**: lift, border glow, elevated background (see Card Hover Effect above).
- **Responsive grid**: `repeat(auto-fill, minmax(300px, 1fr))` — 3 columns on desktop, 2 on tablet, 1 on mobile (280px min on tablet, 1fr on ≤480px).

## Data Dependencies

- `useTerms()` — all musical terms.
- `useCompositions()` — all compositions (for example works lookup in modal).
- `useComposers()` — all composers (for composer names in modal example works).
- `getWikipediaUrl()` — locale-aware Wikipedia URLs (modal only).

## State

| State              | Type                    | Purpose                                     |
| ------------------ | ----------------------- | ------------------------------------------- |
| `searchQuery`      | `string`                | Current search input text                   |
| `selectedCategory` | `TermCategory \| null`  | Active category tab (`null` = all)          |
| `selectedTermId`   | `string \| null`        | ID of the term displayed in the modal       |

## i18n Keys

All UI strings use the `termExplorer.*` namespace in the `translation` i18n namespace. Term content (name, definitions) comes directly from `terms.json` and is not translated.

## Accessibility

- Tab bar uses `role="tablist"` with `role="tab"` and `aria-selected` on each tab.
- Cards use `role="button"`, `tabIndex={0}`, and keyboard handlers for Enter/Space.
- Modal uses `role="dialog"`, `aria-modal="true"`, `aria-label` (term name).
- Close button auto-focused on modal open.
- Escape key closes modal.
- External links include `target="_blank"` and `rel="noopener noreferrer"`.

## Test Scenarios

- Renders all 27 terms when no filters are active.
- All cards have uniform height (180px).
- Long definitions are truncated with ellipsis in the card view.
- Clicking a category tab filters to only terms with that category.
- Typing in search filters by term name and definition text.
- Category + search filters combine correctly.
- Clicking a card opens the detail modal with full content.
- Only one modal can be open at a time.
- Clicking the backdrop closes the modal.
- Pressing Escape closes the modal.
- Modal displays long definition, example compositions, and Wikipedia link.
- Era badges display with correct colours in both card and modal.
- Example compositions show title and composer name in the modal.
- Spotify icon appears only for compositions with `spotifyUrl`.
- Wikipedia link opens correct locale-aware URL.
- "No results" message appears when filters exclude all terms.
- Back button calls `onNavigateToTimeline` when clicked.
- Back button does not render when `onNavigateToTimeline` is not provided.
