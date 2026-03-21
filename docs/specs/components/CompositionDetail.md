# Component Spec: CompositionDetail

## Purpose

Display full details of a selected composition in a compact floating card anchored to the bottom of the viewport. Appears when `selectedCompositionId` is set in `useSelectionStore`.

## Props / Inputs

| Prop              | Type     | Description                       |
| ----------------- | -------- | --------------------------------- |
| compositionId     | string   | ID of the composition to display  |

## Visual States

- **Visible**: Compact card slides up from the bottom when a composition is selected.
- **Hidden**: Not rendered when no composition is selected.

## Layout

The panel is a fixed bottom-center card:
- **Width**: 560px max, `calc(100vw - 32px)` on narrow screens.
- **Position**: fixed, bottom: 24px, centered horizontally.
- **z-index**: `var(--z-panel)`.
- Slides up with a short CSS animation on mount.

## Content Sections

1. **Header row** (single line):
   - Composition title (prominent).
   - Close `×` button (top-right).
2. **Meta row**:
   - Composer name (clickable — opens ComposerCard).
   - Year composed.
   - Genre badge (era-colored or neutral).
3. **Description**: Multi-line paragraph.
4. **Instrumentation** row (small label + value).
5. **Key** row — only shown when `key` field is present.
6. **Significance** block — only shown when `significance` field is present.
7. **Wikipedia link** — only shown when `wikipediaSlug` is present; opens in new tab with `rel="noopener noreferrer"`.
8. **Spotify link** — only shown when `spotifyUrl` is present; opens in new tab with `rel="noopener noreferrer"`. Displays as "Listen on Spotify" with a play icon. Styled distinctly from the Wikipedia link (Spotify green accent `#1DB954`).

## Interactions

- Close button (`×`) calls `selectComposition(null)` and clears selection.
- Composer name chip calls `selectComposer(composerId)` — this opens the ComposerCard.
- Wikipedia link opens in a new tab.
- Spotify link opens in a new tab.
- `Esc` key(handled in `App.tsx`) closes the panel by clearing `selectedCompositionId`.

## Accessibility

- Panel has `role="complementary"` and `aria-label="Composition details"`.
- Close button has `aria-label="Close composition details"`.
- External Wikipedia link has `rel="noopener noreferrer"` and `target="_blank"`.
- Spotify link has `rel="noopener noreferrer"` and `target="_blank"`.
- Genre badgeis a `<span>` with descriptive text (no icon-only content).

## Dependencies

- `useSelectionStore` — reads `selectedCompositionId`, provides `selectComposition(null)` and `selectComposer`.
- `useComposition(id)` from `useData` — retrieves the composition.
- `useComposer(composerId)` from `useData` — retrieves the composer name.

## Test Scenarios

1. Renders `null` when `compositionId` is not found in data.
2. Displays title, composer name, year, genre, instrumentation, and description.
3. Does not render key/significance/Wikipedia sections when those fields are absent.
4. Renders Wikipedia link with `rel="noopener noreferrer"` when `wikipediaSlug` is present.
5. Clicking close calls `selectComposition(null)`.
6. Clicking the composer chip calls `selectComposer` with the correct composer ID.
7. Does NOT use `dangerouslySetInnerHTML` or `innerHTML` anywhere.
8. Renders Spotify link with `rel="noopener noreferrer"` when `spotifyUrl` is present.
9. Does not render Spotify section when `spotifyUrl` is absent.
