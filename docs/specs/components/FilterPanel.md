# Component Spec: FilterPanel

## Purpose

Control panel for filtering the timeline by era, nationality, genre, and event categories. Also contains the search input and comparison mode toggle.

## Props / Inputs

| Prop                       | Type | Description |
| -------------------------- | ---- | ----------- |
| (none — reads from stores) |      |             |

## Visual States

- **Collapsed**: Compact bar showing active filter count / search icon.
- **Expanded**: Full panel with filter groups and search.
- **Active Filters**: Visual chips/badges showing active filters with remove buttons.
- **Hidden by view switch**: Not rendered when the active view is Orchestra. Visible on Timeline and Terms views. The `SearchFilterBar` toggle button is also hidden on Orchestra view.

## Filter Groups

1. **Search**: Text input filtering by composer name, composition title, or tag.
2. **Era**: Chips (toggle buttons) for each `MusicalEra`; color-dotted to match era color.
3. **Nationality**: Chips for each nationality present in the composers data set. Selecting one or
   more shows only composers with a matching `nationality` field (exact match).
4. **Genre**: Chips for each `CompositionGenre` present in the compositions data set. Selecting one
   or more shows only composers who have at least one composition in a selected genre.
5. **Events**: Toggle show/hide events + category checkboxes (future).
6. **Comparison**: Toggle comparison mode, with composer multi-select (handled via header ComparisonBar).

## Interactions

- Toggling a filter immediately updates the timeline (no "Apply" button).
- Clicking a filter chip removes that filter.
- "Clear all" resets all filters.
- Search is debounced (300ms).

## Accessibility

- Filter panel is a `<nav>` with `aria-label="Timeline filters"`.
- All checkboxes have associated labels.
- Active filter chips are announced as "active filter: [value], press to remove".
- Search input has `aria-label="Search composers and compositions"`.

## Dependencies

- `useFilterStore` — reads and writes filter state
- `useComposers()` / `useCompositions()` — to derive available filter values

## Test Scenarios

1. Toggling an era filter updates `useFilterStore`.
2. Typing in search updates `searchQuery` after debounce.
3. Active filters display as removable chips.
4. "Clear all" resets all filters to defaults.
5. Filter counts are accurate.
6. Expanding/collapsing the panel preserves filter state.
