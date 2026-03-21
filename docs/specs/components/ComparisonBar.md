# Component Spec: ComparisonBar

## Purpose

A persistent header toolbar that appears whenever one or more composers have been added to the comparison set. Displays the currently selected composers as removable chips and provides a "Clear" action. Provides at-a-glance visibility into the comparison state and quick controls without opening a separate panel.

## Props / Inputs

None. Reads all state directly from `useComparisonStore`.

## Render Condition

- Returns `null` (renders nothing) when `comparisonComposerIds.length === 0`.
- Renders whenever at least one composer is in the comparison list.

## Visual States

- **Pending** (`isComparisonMode === false`, 1 composer): Shows label "Selected" + hint text "Ctrl+click more to compare".
- **Active** (`isComparisonMode === true`, 2–5 composers): Shows label "Comparing" + composer chips. Hint text hidden.
- **Full** (5 composers): No visual change — adding is blocked at the store level.

## Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  Comparing   [Bach ×]  [Mozart ×]  [Beethoven ×]          [Clear]   │
└──────────────────────────────────────────────────────────────────────┘
```

Horizontally scrollable chip row to handle up to 5 composers without overflow.

## Interactions

- **Click a chip**: Calls `removeFromComparison(id)` — removes that composer from the set. If this drops below 2, comparison mode deactivates.
- **Click Clear**: Calls `clearComparison()` — removes all composers, exits comparison mode, and triggers viewport restore.
- **Ctrl+click on timeline**: Primary method for adding composers (handled in Timeline, not this component).
- **"+ Compare" in ComposerCard**: Secondary method for adding (handled in ComposerCard).

## Chip Behavior

- Chip label: `composer.shortName`
- Chip has `title` attribute = `"Remove {shortName}"` for accessibility.
- Click on chip (or the `×` icon) removes that composer.

## Accessibility

- Chip buttons have descriptive `title` attributes.
- "Clear" button has `title="Clear all comparisons"`.
- Chips are `<button>` elements — keyboard navigable and activatable with Enter/Space.

## Dependencies

- `useComparisonStore` — `comparisonComposerIds`, `isComparisonMode`, `removeFromComparison`, `clearComparison`
- `useComposers()` — to resolve IDs to display names

## Test Scenarios

1. Does not render when `comparisonComposerIds` is empty.
2. Renders one chip per composer ID.
3. Clicking a chip calls `removeFromComparison` with the correct ID.
4. Clicking "Clear" calls `clearComparison`.
5. Label reads "Comparing" in comparison mode, "Selected" when only 1 composer queued.
6. Hint text "Ctrl+click more to compare" shown only when not yet in comparison mode.
