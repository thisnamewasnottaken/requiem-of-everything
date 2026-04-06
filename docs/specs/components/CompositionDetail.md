# Component Spec: CompositionDetail

## Purpose

Display full details of a selected composition in a compact floating card anchored to the bottom of the viewport. Appears when `selectedCompositionId` is set in `useSelectionStore`.

## Props / Inputs

| Prop          | Type   | Description                      |
| ------------- | ------ | -------------------------------- |
| compositionId | string | ID of the composition to display |

## Visual States

- **Visible**: Compact card slides up from the bottom when a composition is selected and the active view is Timeline.
- **Hidden**: Not rendered when no composition is selected, or when the active view is Terms or Orchestra. Selection state is preserved so the card reappears when returning to Timeline.

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
6. **Catalogue number** row — only shown when `catalogueNumber` field is present.
7. **Significance** block — only shown when `significance` field is present.
8. **Wikipedia link** — only shown when `wikipediaSlug` is present; opens in new tab with `rel="noopener noreferrer"`.
9. **Spotify action** — only shown when `spotifyUrl` is present. Rendered as a `<button>` (not an `<a>`) styled as a green pill (Spotify brand colour `#1DB954`, rounded pill background `rgba(29, 185, 84, 0.12)`, hover `rgba(29, 185, 84, 0.24)`). Displays "Listen on Spotify" with a play icon (`▶`).

   **Behavior**: On click, calls `openSpotify(spotifyUrl)` from `src/utils/spotify.ts`. This first attempts to open the Spotify desktop/mobile app via the `spotify://` custom URI scheme. If the app does not respond within ~1500ms, it falls back to opening the Spotify web URL in a new tab. The button must have `aria-label="Listen to {title} on Spotify"`. This styling is implemented in `CompositionDetail.module.css` (`.spotifyLink` class).

## Interactions

- Close button (`×`) calls `selectComposition(null)` and clears selection.
- Composer name chip calls `selectComposer(composerId)` — this opens the ComposerCard.
- Wikipedia link opens in a new tab.
- Spotify button attempts to open the Spotify app; falls back to opening Spotify web in a new tab after ~1500ms.
- `Esc` key(handled in `App.tsx`) closes the panel by clearing `selectedCompositionId`.

## Accessibility

- Panel has `role="complementary"` and `aria-label="Composition details"`.
- Close button has `aria-label="Close composition details"`.
- External Wikipedia link has `rel="noopener noreferrer"` and `target="_blank"`.
- Spotify button has `aria-label="Listen to {title} on Spotify"`. The web fallback opens with `rel="noopener noreferrer"` and `target="_blank"`.
- Genre badgeis a `<span>` with descriptive text (no icon-only content).

## Dependencies

- `useSelectionStore` — reads `selectedCompositionId`, provides `selectComposition(null)` and `selectComposer`.
- `useComposition(id)` from `useData` — retrieves the composition.
- `useComposer(composerId)` from `useData` — retrieves the composer name.
- `openSpotify()` from `src/utils/spotify.ts` — handles app-first-then-web-fallback navigation.

## Test Scenarios

1. Renders `null` when `compositionId` is not found in data.
2. Displays title, composer name, year, genre, instrumentation, and description.
3. Does not render key/significance/Wikipedia sections when those fields are absent.
4. Renders Wikipedia link with `rel="noopener noreferrer"` when `wikipediaSlug` is present.
5. Clicking close calls `selectComposition(null)`.
6. Clicking the composer chip calls `selectComposer` with the correct composer ID.
7. Does NOT use `dangerouslySetInnerHTML` or `innerHTML` anywhere.
8. Renders Spotify button with correct `aria-label` when `spotifyUrl` is present.
9. Does not render Spotify section when `spotifyUrl` is absent.
10. Spotify button calls `openSpotify()` when clicked.
