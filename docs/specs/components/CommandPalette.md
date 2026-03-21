# Component Spec: CommandPalette

## Purpose

A search + command interface inspired by VS Code's command palette. Provides quick access to composers, compositions, eras, and (in the future) natural language AI queries.

## Props / Inputs

| Prop      | Type         | Description                    |
| --------- | ------------ | ------------------------------ |
| `isOpen`  | `boolean`    | Whether the palette is visible |
| `onClose` | `() => void` | Close handler                  |

## Visual States

- **Closed**: Not visible; activated by Cmd/Ctrl+K or a search icon.
- **Open/Empty**: Shows recent searches and suggested explorations.
- **Open/Typing**: Shows filtered results grouped by type (Composers, Compositions, Eras, Events).
- **Open/AI Mode** (future): Prefixed with ">" to enter AI query mode, shows AI response inline.

## Result Types

1. **Composer**: Shows name, dates, era badge. Action: navigate to composer.
2. **Composition**: Shows title, composer, year. Action: navigate to composition.
3. **Era**: Shows era name and date range. Action: zoom timeline to era.
4. **Event**: Shows event title and year. Action: zoom to event.
5. **AI Query** (future): Shows question. Action: send to AI service.

## Interactions

- `Cmd/Ctrl+K` opens/closes.
- Type to search; results update in real-time.
- Arrow keys navigate results; Enter selects.
- Escape closes.
- Click on result triggers its action.

## Accessibility

- Uses `role="combobox"` with `aria-expanded`, `aria-owns`, `aria-activedescendant`.
- Results list has `role="listbox"` with `role="option"` items.
- Focus is trapped within the palette when open.

## Dependencies

- `useComposers()`, `useCompositions()`, `useEvents()` — for search
- `useTimelineStore` — to navigate
- `useSelectionStore` — to select

## Test Scenarios

1. Opens on Cmd/Ctrl+K keystroke.
2. Typing filters results across all entity types.
3. Arrow keys change the active result.
4. Enter on a composer result selects that composer and closes palette.
5. Escape closes the palette.
6. Empty state shows suggestions.
7. Focus returns to previous element on close.
