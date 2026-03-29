# SearchFilterBar Component Spec

## Purpose

Inline search box with filter toggle button that replaces the old standalone "⚙ Filters" button in the app header. Provides immediate composer search and quick access to sidebar filters.

## Props

```ts
interface SearchFilterBarProps {
  filterOpen: boolean;
  onToggleFilters: () => void;
}
```

## Behaviour

- **Search input** reads/writes `searchQuery` from `useFilterStore` via `setSearchQuery()`. Typing filters the timeline immediately (the Timeline component already filters on this value).
- **Clear button (×)** appears when `searchQuery` is non-empty; clicking it resets the query to `""`.
- **Filter toggle button** calls `onToggleFilters()` to open/close the FilterPanel sidebar.
- When sidebar filters are active (any era, nationality, or genre selected, or historical events toggled off), the button displays a count badge: `"Filters (N)"`.
- When no sidebar filters are active, the button just shows `"⚙ Filters"`.
- `searchQuery` is **not** counted in the active filter badge — it is already visible in the input.
- **Comparison mode visibility:** When any composers are selected for comparison (i.e. the comparison selection box is visible, `useComparisonStore().comparisonComposerIds.length > 0`), the search input and its clear button MUST be removed from the DOM (not merely visually hidden). The filter toggle button remains accessible. When all comparison selections are cleared, the search input should re-render with its previous `searchQuery` value intact.

## Active filter count

```ts
const activeFilterCount =
  eraFilters.length +
  nationalityFilters.length +
  genreFilters.length +
  (!showHistoricalEvents ? 1 : 0);
```

## Keyboard interaction

- The `f` shortcut for toggling filters is handled in `App.tsx` and already skips `<input>` elements, so typing in the search box does not trigger it.
- `Escape` clears focus from the input (default browser behaviour).

## Styling

- CSS Modules (`SearchFilterBar.module.css`).
- Uses global design tokens: `--bg-surface`, `--bg-elevated`, `--border-default`, `--text-primary`, `--text-secondary`, `--text-accent`, `--font-body`, `--text-sm`.
- Search input expands from 220px to 280px on focus.

## Accessibility

- Search input has `aria-label` from `t('filters.searchAriaLabel')`.
- Clear button has `aria-label` from `t('filters.clearSearchAriaLabel')`.
- Filter toggle button has `aria-label` from `t('app.filters')`.

## i18n

Translation keys used:

- `filters.searchPlaceholder` — "Search composers…"
- `filters.searchAriaLabel` — "Search composers and compositions"
- `filters.clearSearchAriaLabel` — "Clear search"
- `app.filters` — "Filters"

## Sync with FilterPanel

Both this component's search input and the FilterPanel's search input read/write the same `searchQuery` from the store. They stay in sync automatically.
